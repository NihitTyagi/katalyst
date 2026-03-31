# Katalyst - Lead & Affiliate Management System

**Katalyst** is a streamlined B2B referral platform designed to act as a bridge between **Agents** (who provide client referrals) and a **Company** (software development provider). The system simplifies the process of tracking leads, converting them into projects, and managing commission payouts.

**https://katalyst-tawny.vercel.app/**
---

## 🚀 Project Overview

Katalyst provides a transparent ecosystem where agents can submit potential software development leads and monitor their progress in real-time. Once a lead is converted by the Admin, the system automatically calculates the agent's reward and updates their digital wallet, ensuring a seamless flow from referral to final payment.

---

## 🛠️ Core Functionality

### 👤 Agent Dashboard
* **Lead Submission:** Agents can manually add new leads or share a unique **Referral Link** to automate lead capture.
* **Real-time Tracking:** A dedicated "My Leads" section to monitor the status of every referral (Pending, Converted, or Paid).
* **Digital Wallet:** A financial overview showing **Lifetime Earnings**, **Pending Rewards** (awaiting project completion), and **Paid Out** funds.

### 🛡️ Admin Panel
* **Lead Management:** A centralized hub to review incoming leads and move them through the sales funnel.
* **Conversion Workflow:** Admins can "Convert" a lead by entering the final **Project Amount** and setting a **Reward Rate** (e.g., 10%).
* **Automated Calculations:** The system instantly calculates the "Affiliate Earns" amount based on the project budget.

---

## 🔄 Workflow Summary

1.  **Submission:** Agent submits a client’s information.
2.  **Review:** Admin reviews the lead and contacts the client.
3.  **Conversion:** Admin sets the project budget; the system calculates the Agent's reward.
4.  **Completion:** Upon client payment, the Admin triggers the payout, and the Agent's reward is marked as "Paid."

---

## 📅 Upcoming Features (Roadmap)

### 1. Agent Payment Profiles
* **UPI Integration:** Agents will be able to update their profile with payment information (primarily UPI IDs).
* **Account Verification:** Automated fetching of account details to ensure rewards reach the correct person.

### 2. Integrated Payout System
* **Real-Time Settlements:** Integration with payout APIs (like **Razorpay X** or **Cashfree**) to facilitate direct bank transfers.
* **Payment-Gated Status:** The lead status will only transition from "Converted" to "Paid" once the API confirms a successful transaction to the agent's UPI ID.
* **Admin Verification:** A "Pay Now" procedure within the Admin panel to review agent details before triggering the final disbursement.
