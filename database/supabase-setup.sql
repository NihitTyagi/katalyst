-- =====================================================
-- KATALYST AFFILIATE PLATFORM - DATABASE SETUP
-- Production-Ready SQL Setup Script
-- Version: 1.0
-- Last Updated: October 30, 2025
-- =====================================================

-- =====================================================
-- 1. EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 2. CREATE TABLES
-- =====================================================

-- Affiliates Table
CREATE TABLE affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    referral_code TEXT NOT NULL UNIQUE,
    role TEXT DEFAULT 'affiliate' CHECK (role IN ('affiliate', 'admin')),
    total_earned NUMERIC DEFAULT 0,
    total_leads INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads Table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    status TEXT CHECK (status IN ('Pending', 'Converted', 'Rejected')) DEFAULT 'Pending',
    project_requirements TEXT,
    amount NUMERIC,
    reward NUMERIC,  
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- Transactions Table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID REFERENCES affiliates(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    reward_earned NUMERIC NOT NULL,  
    status TEXT CHECK (status IN ('Pending', 'Paid')) DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);


-- =====================================================
-- 3. CREATE INDEXES
-- =====================================================

CREATE INDEX idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX idx_affiliates_role ON affiliates(role);
CREATE INDEX idx_leads_affiliate_id ON leads(affiliate_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_transactions_affiliate_id ON transactions(affiliate_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- =====================================================
-- 4. CREATE VIEWS
-- =====================================================

-- Admin Dashboard View
CREATE OR REPLACE VIEW admin_dashboard_view AS
SELECT 
    l.id as lead_id,
    l.name as lead_name,
    l.email as lead_email,
    l.phone as lead_phone,
    l.status as lead_status,
    l.project_requirements,
    l.amount as lead_amount,
    l.reward as lead_reward,
    l.created_at as lead_created_at,
    a.id as affiliate_id,
    a.name as affiliate_name,
    a.email as affiliate_email,
    a.referral_code,
    t.id as transaction_id,
    t.status as payment_status,
    t.amount as transaction_amount,
    t.reward_earned,
    t.created_at as transaction_created_at,
    t.paid_at
FROM leads l
JOIN affiliates a ON l.affiliate_id = a.id
LEFT JOIN transactions t ON t.lead_id = l.id
ORDER BY l.created_at DESC;

GRANT SELECT ON admin_dashboard_view TO authenticated;

-- =====================================================
-- 5. HELPER FUNCTIONS
-- =====================================================

-- Check if user is admin (prevents recursion in RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM affiliates 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. TRIGGER FUNCTIONS
-- =====================================================

-- Auto-create affiliate record on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_referral_code TEXT;
BEGIN
    -- Generate unique referral code
    new_referral_code := 'KAT' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 7));
    
    -- Insert affiliate record
    INSERT INTO affiliates (user_id, name, email, referral_code, total_earned, total_leads, conversion_count)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        new_referral_code,
        0,
        0,
        0
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-create transaction when lead is converted
CREATE OR REPLACE FUNCTION auto_create_transaction()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if lead is converted AND has amount AND reward
    IF NEW.status = 'Converted' 
       AND NEW.amount IS NOT NULL 
       AND NEW.reward IS NOT NULL THEN
        
        -- Check if transaction already exists for this lead
        IF NOT EXISTS (SELECT 1 FROM transactions WHERE lead_id = NEW.id) THEN
            
            -- Create transaction
            INSERT INTO transactions (
                affiliate_id,
                lead_id,
                amount,
                reward_earned,
                status,
                created_at
            ) VALUES (
                NEW.affiliate_id,
                NEW.id,
                NEW.amount,
                NEW.reward,
                'Pending',
                NOW()
            );
            
            RAISE NOTICE 'Transaction created for lead %', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update affiliate stats when lead changes
CREATE OR REPLACE FUNCTION update_affiliate_stats()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update affiliate stats whenever a lead changes
    UPDATE affiliates
    SET 
        total_leads = (
            SELECT COUNT(*) 
            FROM leads 
            WHERE affiliate_id = NEW.affiliate_id
        ),
        conversion_count = (
            SELECT COUNT(*) 
            FROM leads 
            WHERE affiliate_id = NEW.affiliate_id AND status = 'Converted'
        ),
        total_earned = (
            SELECT COALESCE(SUM(reward), 0) 
            FROM leads 
            WHERE affiliate_id = NEW.affiliate_id AND status = 'Converted'
        )
    WHERE id = NEW.affiliate_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Clean up transaction when lead reverts to Pending
CREATE OR REPLACE FUNCTION cleanup_transaction_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If lead status changed FROM Converted/Rejected TO Pending
    IF NEW.status = 'Pending' AND OLD.status IN ('Converted', 'Rejected') THEN
        
        -- Delete any transactions for this lead
        DELETE FROM transactions WHERE lead_id = NEW.id;
        
        -- Reset amount and reward on lead
        NEW.amount := NULL;
        NEW.reward := NULL;
        
        RAISE NOTICE 'Cleaned up transaction for lead % (status changed to Pending)', NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update affiliate stats when lead is deleted
CREATE OR REPLACE FUNCTION update_affiliate_stats_on_delete()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Recalculate affiliate stats after lead is deleted
    UPDATE affiliates
    SET 
        total_leads = (
            SELECT COUNT(*) 
            FROM leads 
            WHERE affiliate_id = OLD.affiliate_id
        ),
        conversion_count = (
            SELECT COUNT(*) 
            FROM leads 
            WHERE affiliate_id = OLD.affiliate_id AND status = 'Converted'
        ),
        total_earned = (
            SELECT COALESCE(SUM(reward), 0) 
            FROM leads 
            WHERE affiliate_id = OLD.affiliate_id AND status = 'Converted'
        )
    WHERE id = OLD.affiliate_id;
    
    RAISE NOTICE 'Updated affiliate % stats after lead deletion', OLD.affiliate_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;


-- =====================================================
-- 7. CREATE TRIGGERS
-- =====================================================

-- Trigger: Auto-create affiliate on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Trigger: Auto-create transaction on lead conversion
CREATE TRIGGER trigger_auto_create_transaction
    AFTER INSERT OR UPDATE OF status, amount, reward
    ON leads
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_transaction();

-- Trigger: Update affiliate stats on lead changes
CREATE TRIGGER trigger_update_affiliate_stats
    AFTER INSERT OR UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_stats();

-- Trigger: Clean up transaction when status reverts
CREATE TRIGGER trigger_cleanup_transaction_on_status_change
    BEFORE UPDATE OF status ON leads
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_transaction_on_status_change();

-- Trigger: Update affiliate stats on lead deletion
CREATE TRIGGER trigger_update_stats_on_delete
    AFTER DELETE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_stats_on_delete();


-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. RLS POLICIES - AFFILIATES TABLE
-- =====================================================

-- Users can view their own record OR admins view all
CREATE POLICY "Everyone can view leaderboard"
    ON affiliates FOR SELECT
    USING (true);

-- Users can update their own record
CREATE POLICY "Users can update their own record"
    ON affiliates FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can insert their own record (signup)
CREATE POLICY "Users can insert their own record"
    ON affiliates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Public can view for leaderboard
CREATE POLICY "Public can view for leaderboard"
    ON affiliates FOR SELECT
    TO anon
    USING (true);

-- =====================================================
-- 10. RLS POLICIES - LEADS TABLE
-- =====================================================

-- Affiliates view their own leads OR admins view all
CREATE POLICY "Affiliates view own leads or admin views all"
    ON leads FOR SELECT
    USING (
        affiliate_id IN (
            SELECT id FROM affiliates WHERE user_id = auth.uid()
        )
        OR is_admin()
    );

-- Authenticated affiliates can insert their own leads
CREATE POLICY "Affiliates can insert their own leads"
    ON leads FOR INSERT
    TO authenticated
    WITH CHECK (
        affiliate_id IN (
            SELECT id FROM affiliates WHERE user_id = auth.uid()
        )
    );

-- Public can insert leads via referral links
CREATE POLICY "Public can submit leads via referral"
    ON leads FOR INSERT
    TO anon
    WITH CHECK (
        affiliate_id IN (SELECT id FROM affiliates)
    );

-- Affiliates can update their own leads OR admins can update all
CREATE POLICY "Affiliates update own or admin updates all"
    ON leads FOR UPDATE
    USING (
        affiliate_id IN (
            SELECT id FROM affiliates WHERE user_id = auth.uid()
        )
        OR is_admin()
    )
    WITH CHECK (
        affiliate_id IN (
            SELECT id FROM affiliates WHERE user_id = auth.uid()
        )
        OR is_admin()
    );

-- =====================================================
-- 11. RLS POLICIES - TRANSACTIONS TABLE
-- =====================================================

-- Affiliates view their own transactions OR admins view all
CREATE POLICY "Affiliates view own or admin views all"
    ON transactions FOR SELECT
    USING (
        affiliate_id IN (
            SELECT id FROM affiliates WHERE user_id = auth.uid()
        )
        OR is_admin()
    );

-- System can insert transactions (for triggers)
CREATE POLICY "System can insert transactions"
    ON transactions FOR INSERT
    WITH CHECK (true);

-- Only admins can update transactions
CREATE POLICY "Only admins can update transactions"
    ON transactions FOR UPDATE
    USING (is_admin());

-- =====================================================
-- 12. VERIFICATION QUERIES (Optional - for testing)
-- =====================================================

-- Verify tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('affiliates', 'leads', 'transactions');

-- Verify indexes created
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('affiliates', 'leads', 'transactions');

-- Verify triggers created
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('leads', 'affiliates');

-- Verify RLS policies
SELECT tablename, policyname, cmd
FROM pg_policies 
WHERE tablename IN ('affiliates', 'leads', 'transactions')
ORDER BY tablename, policyname;

-- Verify functions have SECURITY DEFINER
SELECT proname, prosecdef as has_security_definer
FROM pg_proc 
WHERE proname IN ('auto_create_transaction', 'update_affiliate_stats', 'is_admin', 'cleanup_transaction_on_status_change');

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- 
-- Next Steps:
-- 1. Create your first admin user via signup
-- 2. Run: UPDATE affiliates SET role = 'admin' WHERE email = 'your-email@example.com';
-- 3. Verify everything works by testing the frontend
-- 
-- =====================================================


-- =====================================================
-- TERMINOLOGY MIGRATION: Reward → Reward
-- =====================================================

BEGIN;

-- 1. Rename columns in leads table
ALTER TABLE leads RENAME COLUMN reward TO reward;

-- 2. Rename columns in transactions table
ALTER TABLE transactions RENAME COLUMN reward_earned TO reward_earned;

-- 3. Update trigger functions to use new column names

-- Update: auto_create_transaction
DROP TRIGGER IF EXISTS trigger_auto_create_transaction ON leads;
DROP FUNCTION IF EXISTS auto_create_transaction();

CREATE OR REPLACE FUNCTION auto_create_transaction()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'Converted' 
       AND NEW.amount IS NOT NULL 
       AND NEW.reward IS NOT NULL THEN
        
        IF NOT EXISTS (SELECT 1 FROM transactions WHERE lead_id = NEW.id) THEN
            INSERT INTO transactions (
                affiliate_id,
                lead_id,
                amount,
                reward_earned,
                status,
                created_at
            ) VALUES (
                NEW.affiliate_id,
                NEW.id,
                NEW.amount,
                NEW.reward,
                'Pending',
                NOW()
            );
            
            RAISE NOTICE 'Transaction created for lead %', NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_create_transaction
    AFTER INSERT OR UPDATE OF status, amount, reward
    ON leads
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_transaction();

-- Update: update_affiliate_stats
DROP TRIGGER IF EXISTS trigger_update_affiliate_stats ON leads;
DROP FUNCTION IF EXISTS update_affiliate_stats();

CREATE OR REPLACE FUNCTION update_affiliate_stats()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE affiliates
    SET 
        total_leads = (
            SELECT COUNT(*) 
            FROM leads 
            WHERE affiliate_id = NEW.affiliate_id
        ),
        conversion_count = (
            SELECT COUNT(*) 
            FROM leads 
            WHERE affiliate_id = NEW.affiliate_id AND status = 'Converted'
        ),
        total_earned = (
            SELECT COALESCE(SUM(reward), 0) 
            FROM leads 
            WHERE affiliate_id = NEW.affiliate_id AND status = 'Converted'
        )
    WHERE id = NEW.affiliate_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_affiliate_stats
    AFTER INSERT OR UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_stats();

-- Update: cleanup_transaction_on_status_change
DROP TRIGGER IF EXISTS trigger_cleanup_transaction_on_status_change ON leads;
DROP FUNCTION IF EXISTS cleanup_transaction_on_status_change();

CREATE OR REPLACE FUNCTION cleanup_transaction_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Pending' AND OLD.status IN ('Converted', 'Rejected') THEN
        DELETE FROM transactions WHERE lead_id = NEW.id;
        NEW.amount := NULL;
        NEW.reward := NULL;
        RAISE NOTICE 'Cleaned up transaction for lead % (status changed to Pending)', NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_cleanup_transaction_on_status_change
    BEFORE UPDATE OF status ON leads
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_transaction_on_status_change();

-- Update: update_affiliate_stats_on_delete
DROP TRIGGER IF EXISTS trigger_update_stats_on_delete ON leads;
DROP FUNCTION IF EXISTS update_affiliate_stats_on_delete();

CREATE OR REPLACE FUNCTION update_affiliate_stats_on_delete()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE affiliates
    SET 
        total_leads = (SELECT COUNT(*) FROM leads WHERE affiliate_id = OLD.affiliate_id),
        conversion_count = (SELECT COUNT(*) FROM leads WHERE affiliate_id = OLD.affiliate_id AND status = 'Converted'),
        total_earned = (SELECT COALESCE(SUM(reward), 0) FROM leads WHERE affiliate_id = OLD.affiliate_id AND status = 'Converted')
    WHERE id = OLD.affiliate_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_stats_on_delete
    AFTER DELETE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_affiliate_stats_on_delete();

-- 4. Update admin_dashboard_view
DROP VIEW IF EXISTS admin_dashboard_view;

CREATE OR REPLACE VIEW admin_dashboard_view AS
SELECT 
    l.id as lead_id,
    l.name as lead_name,
    l.email as lead_email,
    l.phone as lead_phone,
    l.status as lead_status,
    l.project_requirements,
    l.amount as lead_amount,
    l.reward as lead_reward,
    l.created_at as lead_created_at,
    a.id as affiliate_id,
    a.name as affiliate_name,
    a.email as affiliate_email,
    a.referral_code,
    t.id as transaction_id,
    t.status as payment_status,
    t.amount as transaction_amount,
    t.reward_earned,
    t.created_at as transaction_created_at,
    t.paid_at
FROM leads l
JOIN affiliates a ON l.affiliate_id = a.id
LEFT JOIN transactions t ON t.lead_id = l.id
ORDER BY l.created_at DESC;

GRANT SELECT ON admin_dashboard_view TO authenticated;

-- 5. Verify changes
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name IN ('leads', 'transactions')
AND column_name IN ('reward', 'reward_earned', 'reward', 'reward_earned')
ORDER BY table_name, column_name;

-- Should show 'reward' and 'reward_earned', not 'reward'

COMMIT;

-- Success message
DO $$ 
BEGIN 
    RAISE NOTICE '✅ Database migration complete: Reward → Reward'; 
END $$;
