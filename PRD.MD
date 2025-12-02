Product Requirements Document (PRD)

Project: Whole Life vs. Term & Invest the Difference (BTID) Calculator

Document Details



Version

1.2

Status

Draft

Objective

Build a web-based simulation tool to compare the long-term financial outcomes of purchasing Whole Life insurance vs. buying Term insurance and investing the premium difference, tailored for a Singapore tax environment.

1. Problem Statement

Individuals struggle to choose between Whole Life (WL) and Term insurance because the math is complex. Agents often sell WL based on "cash value," while financial gurus advocate for "Buy Term, Invest the Difference" (BTID). Users lack a neutral tool that accounts for limited payment periods (10-pay/20-pay), the impact of Singapore's lack of capital gains tax versus dividend withholding taxes on foreign investments, and long-term estate value versus liquidity.

2. User Personas

The Analytical DIYer (SG): Wants to verify agent claims against market performance, specifically looking at US/Global ETF investing from Singapore.

The Financial Planner: Needs a visual aid to explain concepts to clients.

The Skeptic: Believes insurance is a scam and wants to prove that investing is always better (or vice versa).

3. Core Functional Requirements

3.1. Inputs (Configuration Panel)

The user must be able to configure three distinct sections:

A. The Profile (Singapore Context)

Current Age: (Integer, e.g., 30)

Retirement/Target Age: (Integer, e.g., 65)

Life Expectancy: (Integer, e.g., 90 - for Estate Value calculation)

Inflation Rate Assumption: (Percentage, default 2.5%). Used to calculate "Real" values.

B. The Whole Life Policy (Scenario A)

Death Benefit Amount: (Currency, e.g., $500,000)

Annual Premium: (Currency)

Payment Duration: Dropdown 

$$Life Pay, 10-Pay, 20-Pay, Pay to 65$$

.

Dividend Interest Rate Assumption: (Percentage, e.g., 4.25% - typical SG non-guaranteed rate).

Cash Value Calibration (Crucial Feature):

Method: To avoid manual entry of 50+ rows, allow user to input "Total Surrender Value" from their illustration for Year 5, Year 10, and Year 20.

Logic: The app will generate a curve that fits these three points to simulate the policy performance accurately.

C. The Term + Invest Strategy (Scenario B)

Term Policy Cost: (Currency, usually significantly lower than WL).

Term Duration: (10, 20, 30 years).

Investment Return Rate: (Percentage, e.g., 7% for 80/20 portfolio).

Investment Fees (MER): (Percentage, e.g., 0.5%).

Tax Drag / Withholding Tax: (Percentage).

Default: 0% (Singapore residents pay no Cap Gains tax).

Note: User can increase this to ~0.5-1.0% to account for Dividend Withholding Tax if investing in US/Global markets.

Post-Premium Investment Strategy (Toggle):

Option A (Cash Flow Match): "Stop investing when WL premiums would have stopped." (e.g., If WL was 20-pay, stop adding to investment at year 20).

Option B (Budget Allocation): "Continue investing the premium amount forever/until retirement."

3.2. Calculation Engine Logic

The system must calculate two running ledgers year-by-year:

Ledger 1: Whole Life

Premium Outflow: Stops if "Payment Duration" is reached.

Cash Value (CV): Interpolated curve based on the "Calibration Points" (Year 5, 10, 20) entered by the user. If no calibration, use standard "drag" algorithm.

Death Benefit (DB): Base Benefit + Paid-Up Additions (calculated as a function of the CV growth).

Ledger 2: BTID

Investable Difference: (WL Premium - Term Premium).

Contribution Logic:

If Option A is selected: Contribution drops to $0 when WL Premium stops.

If Option B is selected: Contribution continues at full WL Premium amount (minus Term cost, or full amount if Term expired) until Retirement Age.

Investment Growth: (Previous Balance + Contribution) * (Rate - Fees).

Tax Drag: Deducted from growth annually (set to 0% by default for SG, but adjustable).

Term Expiry: At year X (e.g., 20), Term Death Benefit drops to $0.

Total Estate Value: Investment Balance + Term Death Benefit (if active).

Inflation Adjustment Logic

Formula: Real Value = Nominal Value / (1 + Inflation Rate) ^ YearsPassed

The engine must be capable of returning both Nominal and Real datasets for all outputs.

3.3. Outputs & Visualization

A. Global Toggles

Inflation Adjustment: Toggle switch to view all numbers in "Today's Dollars" (Real) vs "Future Dollars" (Nominal).

B. Key Age Snapshots (The "Table")

A comparison table showing values at Current Age + 10, Age 45, Age 65, Age 85.
Columns:

Total Premiums Paid (WL vs. Term)

Liquidity / Net Worth (WL Cash Value vs. Investment Account Balance)

Estate Value / Death Benefit (WL Death Benefit vs. Investment + Term Face Amount)

C. The "Breakeven" Chart

A dual-axis line chart:

X-Axis: Age.

Line 1: WL Cash Value.

Line 2: Investment Account Value.

Line 3: WL Death Benefit.

Line 4: BTID Total Estate Value (Investment + Term).

Visual Goal: Show the "Crossover Point" where the Investment account beats the Cash Value, and potentially where the WL Death Benefit overtakes the Investment value late in life.

4. Non-Functional Requirements

Responsiveness: Must work on mobile (charts typically stack vertically).

Privacy: No data persistence. All calculations are client-side (local).

Speed: Real-time updates as sliders/inputs change.

5. Edge Cases & Constraints

Market Crash: Allow a "Monte Carlo" toggle? (Maybe for V2). MVP should assume linear returns.

Term Conversion: Assume Term expires and is not renewed (standard BTID logic), or allow a "Renew at 5x cost" option.

Surrender Charges: WL usually has 0 liquidity in years 1-2. The calculator must reflect this "negative return" early on.

6. Technology Stack Suggestion

Frontend: React (for state management of the many variables).

Charts: Recharts or Chart.js.

Styling: Tailwind CSS.

7. Future Scope (V2)

Policy Loans: Simulating taking money out of the WL policy vs. selling stocks.


