import { BookOpen, Target, Zap, Shield, TrendingUp, Users } from 'lucide-react'

const Guides = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
          <BookOpen size={48} className="text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-dark mb-2">Affiliate Guides</h1>
        <p className="text-gray-600 text-lg">Learn how to maximize your earnings with Katalyst</p>
      </div>

      {/* Getting Started */}
      <div className="card mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Zap className="text-primary" size={28} />
          <h2 className="text-2xl font-bold">Getting Started</h2>
        </div>
        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="font-semibold text-lg mb-2">1. Set Up Your Account</h3>
            <p>After signing up, you'll receive a unique referral code. This code tracks all leads you refer to Koders.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">2. Share Your Referral Link</h3>
            <p>Copy your referral link from your dashboard and share it on social media, blogs, or directly with potential clients.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">3. Submit Lead Details</h3>
            <p>When someone shows interest, submit their contact information (name, email, phone) through the "Add New Lead" button in your dashboard.</p>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">4. We Handle the Rest</h3>
            <p>Our sales team will contact the lead, discuss requirements, and close the deal. You'll earn reward when the project is confirmed.</p>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="card mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Target className="text-primary" size={28} />
          <h2 className="text-2xl font-bold">Best Practices</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-primary/5 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Quality Over Quantity
            </h3>
            <p className="text-gray-700">Focus on referring serious prospects who need software development services. High-quality leads have better conversion rates.</p>
          </div>
          <div className="bg-primary/5 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Users size={20} className="text-primary" />
              Know Your Audience
            </h3>
            <p className="text-gray-700">Target businesses looking for custom software, web/mobile apps, AI solutions, or digital transformation services.</p>
          </div>
          <div className="bg-primary/5 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Zap size={20} className="text-primary" />
              Be Responsive
            </h3>
            <p className="text-gray-700">Follow up with leads promptly. The faster you submit their details, the higher the chances of conversion.</p>
          </div>
          <div className="bg-primary/5 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Shield size={20} className="text-primary" />
              Provide Context
            </h3>
            <p className="text-gray-700">When submitting a lead, include project requirements and any relevant information that helps our team understand their needs.</p>
          </div>
        </div>
      </div>

      {/* Reward Structure */}
      <div className="card mb-8 bg-gradient-to-br from-primary/10 to-primary/5">
        <h2 className="text-2xl font-bold mb-4">Reward Structure</h2>
        <div className="space-y-3 text-gray-700">
          <p>• <strong>Reward Rate:</strong> You earn 10% of the total project value</p>
          <p>• <strong>Example:</strong> If a client's project is worth ₹1,00,000, you earn ₹10,000</p>
          <p>• <strong>Payment Schedule:</strong> Rewards are paid monthly within 5-7 business days</p>
          <p>• <strong>Minimum Payout:</strong> ₹5,000 (rewards below this threshold carry forward to next month)</p>
        </div>
      </div>

      {/* Rules & Guidelines */}
      <div className="card" id="rules">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="text-primary" size={28} />
          <h2 className="text-2xl font-bold">Program Rules</h2>
        </div>
        <div className="space-y-4 text-gray-700">
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-lg mb-1">Eligibility</h3>
            <p>Open to individuals and businesses who want to promote Koders' services. You must be 18+ years old to participate.</p>
          </div>
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-lg mb-1">Lead Quality</h3>
            <p>Leads must be genuine prospects with real project needs. Submitting fake or spam leads will result in account suspension.</p>
          </div>
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-lg mb-1">Duplicate Leads</h3>
            <p>If a lead is already in our system from another source, the first affiliate to submit gets credit. Duplicate submissions are not eligible.</p>
          </div>
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-lg mb-1">Ethical Promotion</h3>
            <p>You must promote Koders honestly and accurately. Misrepresentation, spam, or unethical marketing practices are prohibited.</p>
          </div>
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-lg mb-1">Reward Disputes</h3>
            <p>All reward calculations are final. If you have questions about a transaction, contact support@koders.com within 15 days.</p>
          </div>
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-lg mb-1">Program Modifications</h3>
            <p>Koders reserves the right to modify reward rates, terms, or suspend accounts for violations. You'll be notified of major changes.</p>
          </div>
          <div className="border-l-4 border-primary pl-4">
            <h3 className="font-semibold text-lg mb-1">Data Privacy</h3>
            <p>Lead information must be handled responsibly. Do not share or sell lead data. We comply with all data protection regulations.</p>
          </div>
        </div>
      </div>

      {/* Tips for Success */}
      <div className="mt-8 card bg-dark text-white">
        <h2 className="text-2xl font-bold mb-4">Pro Tips for Success</h2>
        <ul className="space-y-3">
          <li className="flex gap-3">
            <span className="text-primary">✓</span>
            <span>Network in startup communities, entrepreneur groups, and business forums</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary">✓</span>
            <span>Create content about software development trends and include your referral link</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary">✓</span>
            <span>Attend tech meetups and conferences to meet potential clients</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary">✓</span>
            <span>Build relationships first - don't just push referral links</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary">✓</span>
            <span>Share case studies and success stories from Koders' portfolio</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary">✓</span>
            <span>Use LinkedIn to connect with decision-makers in companies that need tech solutions</span>
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center card bg-gradient-to-r from-primary to-primary-dark text-white">
        <h3 className="text-2xl font-bold mb-2">Need Help?</h3>
        <p className="mb-4">Have questions about the affiliate program? We're here to help!</p>
        <a
          href="mailto:support@koders.com"
          className="inline-block bg-white text-primary font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  )
}

export default Guides
