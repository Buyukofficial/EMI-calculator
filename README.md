# UAE Mortgage EMI Calculator

A production-ready UAE Mortgage EMI Calculator built as a single-page web application using **React + TypeScript + Tailwind CSS + Recharts**.

Engineered specifically to comply with **Central Bank of the UAE (CBUAE)** regulations and **Dubai Land Department (DLD)** fee structures.

---

## Features

### 1. Core Inputs & UAE Central Bank LTV Rules
- **Property Price (AED):** Live numeric input, slider, and quick preset buttons (AED 1M to 15M). Default: `AED 2,000,000`.
- **Down Payment (% and AED):** Synchronized bi-directional inputs and sliders.
- **Residency Rules Enforcement:**
  - **UAE Residents / Nationals:**
    - Property ≤ AED 5M: **Max 85% LTV** (Min 15% Down Payment).
    - Property > AED 5M: **Max 75% LTV** (Min 25% Down Payment).
  - **Non-Residents / Expats:**
    - Property ≤ AED 5M: **Max 80% LTV** (Min 20% Down Payment).
    - Property > AED 5M: **Max 70% LTV** (Min 30% Down Payment).
  - Dynamic alert banner if down payment falls below statutory minimums with a 1-click correction button.
- **Loan Tenure:** 1 to 25 years (maximum legal limit for expats in UAE).
- **Interest Rate Structure:**
  - **Fixed + Variable Rate Split:** e.g., 4.19% fixed for 3 years, then switching to 6.50% variable for remaining tenure.
  - **Full Tenure Fixed Rate:** e.g., 4.85% fixed for 25 years.
  - **Interest Calculation Methods:** Standard **Reducing Balance** (CBUAE standard) or **Flat Rate** (with comparison notice).
  - **UAE Bank Presets:** Realistic rates seeded from Emirates NBD, FAB, ADCB, and EIBOR Trackers.

### 2. Calculations & Amortization
- **Standard Reducing-Balance Formula:**
  $$\text{EMI} = \frac{P \cdot r \cdot (1+r)^n}{(1+r)^n - 1}$$
- **UAE Central Bank Mandatory +2% Stress Test:**
  - Evaluates borrower resilience against interest rate shocks and EIBOR rate hikes by testing an applied rate buffer (default: **+2.00% / 200 bps** per CBUAE mortgage guidelines).
  - Calculates Stressed Monthly EMI, extra monthly cash shock, and additional lifetime interest impact.
  - **Stressed DBR Check:** Verifies whether the borrower's Debt Burden Ratio remains within the statutory 50% ceiling when stressed at +2%.
  - Interactive buffer selector: `+1.5%`, `+2.0% (CBUAE Standard)`, `+2.5%`, `+3.0%`.
- **Fixed-to-Variable Rate Recalculation:**
  At Month $(12 \times Y + 1)$, remaining principal balance is determined and dynamically re-amortized over the remaining $(N - 12Y)$ months at the variable rate.
- **Affordability / DBR (Debt Burden Ratio) Check:**
  - Tracks monthly income vs total commitments (Mortgage EMI + 5% credit card limits + auto/personal loans).
  - Enforces UAE Central Bank's **50% maximum DBR ceiling**.
  - Visual stacked affordability bar and actionable warning banner if DBR exceeds 50%.
- **Amortization Schedule:**
  - Yearly summary or full monthly breakdown (up to 300 months).
  - Clear visual indicator at the exact transition point where fixed rate switches to variable rate.
  - Sticky table headers for smooth scrolling.
  - **CSV Export:** One-click download of the complete schedule formatted for Excel/Sheets.

### 3. Visual Analytics (Recharts)
- **Principal vs Interest Donut Chart:** Interactive pie chart with center totals and equity/interest split.
- **Balance Reduction Curve:** Interactive Area Chart showing remaining loan balance declining to AED 0 over time.

### 4. UAE Fees & Upfront Cash Breakdown (Collapsible)
- **DLD Transfer Fee:** 4% of property purchase price
- **DLD Admin / Title Deed Fee:** AED 580
- **Real Estate Agency Commission:** 2% + 5% VAT (2.1% net)
- **Bank Arrangement / Processing Fee:** 1% of loan amount + 5% VAT (min AED 10,000)
- **Property Valuation:** AED 3,000 + 5% VAT (AED 3,150)
- **Mortgage Registration:** 0.25% of loan amount + AED 290
- **Registration Trustee Fee:** AED 4,000 + 5% VAT (AED 4,200)
- **Recurring Insurance Estimate:** Life & property insurance ~0.3% p.a.
- **Total Upfront Cash Needed:** Down Payment + All Acquisition Fees.

### 5. Print & PDF Export
- Specially formatted clean print stylesheet (`@media print`) hides interactive sliders and buttons, delivering a clean summary for mortgage pre-approval consultations.

---

## Assumptions & Legal Notes

1. **Loan-to-Value (LTV):** Follows UAE Central Bank Notice No. 31/2013 on Mortgage Regulations. First property caps are modeled.
2. **Tenure Cap:** Maximum 25 years per UAE banking regulations.
3. **Debt Burden Ratio (DBR):** Strictly capped at 50% of verifiable monthly income.
4. **Variable Rates:** Modeled after 3-Month EIBOR (Emirates Interbank Offered Rate) plus standard retail bank spread (+1.75% to +2.50%).
5. **Disclaimer:** Indicative estimates for guidance only. Actual mortgage approval depends on AECB credit scoring, bank credit committee review, and property valuation.

---

## How to Run

### Requirements
- Node.js ≥ 18.0.0 (tested on Node 24)
- npm or yarn

### Steps
1. Open terminal inside this folder:
   ```bash
   cd "C:\HAMMAD\BUYUK x MS\Emi Calc"
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
3. Open your browser at the displayed localhost URL (e.g. `http://localhost:5173`).

### Production Build
```bash
npm run build
npm run preview
```
