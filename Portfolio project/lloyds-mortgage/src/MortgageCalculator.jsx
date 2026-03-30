import { useState, useEffect, useRef } from "react";

const STEPS = ["Loan Details", "Rate & Term", "Your Results"];

const TOOLTIPS = {
  loanAmount: "The total amount you wish to borrow from the bank to purchase your property.",
  deposit: "The upfront cash payment you make toward the property. A larger deposit usually means a lower interest rate.",
  propertyValue: "The full purchase price of the property you are buying.",
  interestRate: "The annual percentage the lender charges on your loan. Fixed rates stay the same; variable rates can change.",
  termYears: "The number of years you agree to repay the mortgage. Longer terms mean lower monthly payments but more interest overall.",
  repaymentType: "Repayment: you pay off interest + capital each month. Interest Only: you only pay interest monthly and repay the full loan at the end.",
};

const formatCurrency = (val) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);

const formatCurrencyFull = (val) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 2 }).format(val);

function calcMonthly(principal, annualRate, years) {
  if (!principal || !annualRate || !years) return null;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function Tooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", marginLeft: 6 }}>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        aria-label="More information"
        style={{
          width: 18, height: 18, borderRadius: "50%", border: "1.5px solid #006A4D",
          background: "transparent", color: "#006A4D", fontSize: 11, fontWeight: 700,
          cursor: "pointer", lineHeight: 1, display: "flex", alignItems: "center",
          justifyContent: "center", padding: 0, flexShrink: 0
        }}
      >?</button>
      {show && (
        <span style={{
          position: "absolute", left: 26, top: "50%", transform: "translateY(-50%)",
          background: "#1a1a2e", color: "#fff", borderRadius: 8, padding: "8px 12px",
          fontSize: 12, lineHeight: 1.5, width: 220, zIndex: 100,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)", pointerEvents: "none"
        }}>
          {text}
        </span>
      )}
    </span>
  );
}

function FieldLabel({ label, tooltip }) {
  return (
    <label style={{ display: "flex", alignItems: "center", fontSize: 13, fontWeight: 600, color: "#2d3748", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>
      {label}
      {tooltip && <Tooltip text={tooltip} />}
    </label>
  );
}

function InputField({ label, tooltip, prefix, suffix, value, onChange, onBlur, error, type = "number", min, max, step, placeholder }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <FieldLabel label={label} tooltip={tooltip} />
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {prefix && (
          <span style={{
            position: "absolute", left: 14, color: "#718096", fontSize: 15, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", pointerEvents: "none"
          }}>{prefix}</span>
        )}
        <input
          type={type} value={value} onChange={onChange} onBlur={onBlur}
          min={min} max={max} step={step} placeholder={placeholder}
          style={{
            width: "100%", padding: prefix ? "13px 14px 13px 28px" : "13px 14px",
            border: error ? "2px solid #e53e3e" : "2px solid #e2e8f0",
            borderRadius: 10, fontSize: 15, fontFamily: "'DM Sans', sans-serif",
            outline: "none", transition: "border-color 0.2s, box-shadow 0.2s",
            background: "#fff", color: "#1a202c", boxSizing: "border-box",
            appearance: "textfield"
          }}
          onFocus={e => { e.target.style.borderColor = "#006A4D"; e.target.style.boxShadow = "0 0 0 3px rgba(0,106,77,0.12)"; }}
          onBlurCapture={e => { e.target.style.borderColor = error ? "#e53e3e" : "#e2e8f0"; e.target.style.boxShadow = "none"; }}
        />
        {suffix && (
          <span style={{ position: "absolute", right: 14, color: "#718096", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{suffix}</span>
        )}
      </div>
      {error && <p style={{ color: "#e53e3e", fontSize: 12, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>{error}</p>}
    </div>
  );
}

function SliderField({ label, tooltip, value, onChange, min, max, step, display }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <FieldLabel label={label} tooltip={tooltip} />
        <span style={{ fontSize: 15, fontWeight: 700, color: "#006A4D", fontFamily: "'DM Sans', sans-serif" }}>{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={onChange}
        style={{
          width: "100%", height: 6, borderRadius: 3, appearance: "none",
          background: `linear-gradient(to right, #006A4D ${((value - min) / (max - min)) * 100}%, #e2e8f0 0%)`,
          cursor: "pointer", outline: "none"
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#a0aec0", marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
        <span>{min}{typeof min === "number" && min < 10 ? "%" : ""}</span>
        <span>{max}{typeof max === "number" && max < 10 ? "%" : " yrs"}</span>
      </div>
    </div>
  );
}

function ProgressBar({ step }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
        <div style={{
          position: "absolute", top: 14, left: "10%", right: "10%",
          height: 3, background: "#e2e8f0", zIndex: 0
        }}>
          <div style={{
            height: "100%", background: "#006A4D",
            width: step === 0 ? "0%" : step === 1 ? "50%" : "100%",
            transition: "width 0.4s ease"
          }} />
        </div>
        {STEPS.map((s, i) => (
          <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, flex: 1 }}>
            <div style={{
              width: 30, height: 30, borderRadius: "50%",
              background: i <= step ? "#006A4D" : "#e2e8f0",
              color: i <= step ? "#fff" : "#a0aec0",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, transition: "all 0.3s",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: i === step ? "0 0 0 4px rgba(0,106,77,0.2)" : "none"
            }}>
              {i < step ? "✓" : i + 1}
            </div>
            <span style={{
              fontSize: 11, marginTop: 6, fontWeight: i === step ? 700 : 400,
              color: i === step ? "#006A4D" : "#a0aec0",
              fontFamily: "'DM Sans', sans-serif", textAlign: "center"
            }}>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ principal, totalInterest }) {
  const total = principal + totalInterest;
  const pPct = (principal / total) * 100;
  const iPct = (totalInterest / total) * 100;
  const r = 54, cx = 70, cy = 70, circ = 2 * Math.PI * r;
  const pDash = (pPct / 100) * circ;
  const iDash = (iPct / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={16} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#006A4D" strokeWidth={16}
          strokeDasharray={`${pDash} ${circ - pDash}`}
          strokeDashoffset={circ / 4} strokeLinecap="round" style={{ transition: "all 0.6s" }} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#00b37d" strokeWidth={16}
          strokeDasharray={`${iDash} ${circ - iDash}`}
          strokeDashoffset={circ / 4 - pDash} strokeLinecap="round" style={{ transition: "all 0.6s" }} />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={10} fill="#718096" fontFamily="'DM Sans', sans-serif">Total Cost</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fontSize={12} fontWeight={700} fill="#1a202c" fontFamily="'DM Sans', sans-serif">
          {formatCurrency(total)}
        </text>
      </svg>
      <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
        {[["#006A4D", "Capital"], ["#00b37d", "Interest"]].map(([col, lbl]) => (
          <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: col }} />
            <span style={{ fontSize: 11, color: "#718096", fontFamily: "'DM Sans', sans-serif" }}>{lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MortgageCalculator() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    loanAmount: "", deposit: "", propertyValue: "",
    interestRate: 4.5, termYears: 25, repaymentType: "repayment"
  });
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [animated, setAnimated] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setNum = (k) => (e) => setForm(f => ({ ...f, [k]: Number(e.target.value) }));

  const validateStep1 = () => {
    const errs = {};
    if (!form.loanAmount || Number(form.loanAmount) < 10000) errs.loanAmount = "Please enter a loan amount of at least £10,000.";
    if (!form.propertyValue || Number(form.propertyValue) < 10000) errs.propertyValue = "Please enter a valid property value.";
    if (form.deposit && Number(form.deposit) >= Number(form.propertyValue)) errs.deposit = "Deposit must be less than the property value.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const calculate = () => {
    const principal = Number(form.loanAmount);
    const monthly = calcMonthly(principal, form.interestRate, form.termYears);
    const totalRepayable = monthly * form.termYears * 12;
    const totalInterest = totalRepayable - principal;
    const ltv = form.propertyValue ? ((principal / Number(form.propertyValue)) * 100).toFixed(1) : null;
    setResult({ monthly, totalRepayable, totalInterest, principal, ltv });
    setAnimated(false);
    setTimeout(() => setAnimated(true), 50);
  };

  const next = () => {
    if (step === 0 && !validateStep1()) return;
    if (step === 1) calculate();
    setStep(s => Math.min(s + 1, 2));
  };
  const back = () => setStep(s => Math.max(s - 1, 0));
  const reset = () => { setStep(0); setForm({ loanAmount: "", deposit: "", propertyValue: "", interestRate: 4.5, termYears: 25, repaymentType: "repayment" }); setResult(null); setErrors({}); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { margin: 0; background: #f0f4f0; font-family: 'DM Sans', sans-serif; }
        input[type=range]::-webkit-slider-thumb {
          appearance: none; width: 20px; height: 20px; border-radius: 50%;
          background: #006A4D; cursor: pointer; border: 3px solid white;
          box-shadow: 0 1px 6px rgba(0,0,0,0.2);
        }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes countUp { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
        .fade-up { animation: fadeUp 0.4s ease both; }
        .count-up { animation: countUp 0.5s cubic-bezier(.34,1.56,.64,1) both; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f0f4f0", padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Header */}
        <div style={{ width: "100%", maxWidth: 520, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: "linear-gradient(135deg,#006A4D,#00b37d)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,106,77,0.3)"
            }}>
              <span style={{ fontSize: 20 }}>🏠</span>
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#006A4D", letterSpacing: 1.5, textTransform: "uppercase" }}>Lloyds Banking Group</p>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1a202c", fontFamily: "'DM Serif Display', serif", lineHeight: 1.2 }}>Mortgage Calculator</h1>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "#718096", marginTop: 8 }}>Get an estimate of your monthly mortgage payments in 3 simple steps.</p>
        </div>

        {/* Card */}
        <div style={{
          width: "100%", maxWidth: 520, background: "#fff",
          borderRadius: 20, boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
          padding: "32px 28px", position: "relative", overflow: "hidden"
        }}>
          {/* Green accent bar */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg,#006A4D,#00b37d)" }} />

          <ProgressBar step={step} />

          {/* Step 1 */}
          {step === 0 && (
            <div className="fade-up">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a202c", marginBottom: 4, fontFamily: "'DM Serif Display', serif" }}>Tell us about your loan</h2>
              <p style={{ fontSize: 13, color: "#718096", marginBottom: 24 }}>Enter the amount you'd like to borrow and your property details.</p>

              <InputField label="Loan Amount" tooltip={TOOLTIPS.loanAmount} prefix="£"
                value={form.loanAmount} onChange={set("loanAmount")} error={errors.loanAmount}
                min={10000} placeholder="e.g. 250000" />

              <InputField label="Property Value" tooltip={TOOLTIPS.propertyValue} prefix="£"
                value={form.propertyValue} onChange={set("propertyValue")} error={errors.propertyValue}
                min={10000} placeholder="e.g. 320000" />

              <InputField label="Deposit (optional)" tooltip={TOOLTIPS.deposit} prefix="£"
                value={form.deposit} onChange={set("deposit")} error={errors.deposit}
                min={0} placeholder="e.g. 70000" />

              {form.loanAmount && form.propertyValue && !errors.loanAmount && !errors.propertyValue && (
                <div style={{ background: "#f0fdf8", border: "1px solid #c6f6e6", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
                  <p style={{ fontSize: 12, color: "#276749" }}>
                    <strong>Loan-to-Value (LTV):</strong> {((Number(form.loanAmount) / Number(form.propertyValue)) * 100).toFixed(1)}%
                    {" "}<Tooltip text="LTV is the loan as a percentage of the property value. Lower LTV usually means better interest rates." />
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <div className="fade-up">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a202c", marginBottom: 4, fontFamily: "'DM Serif Display', serif" }}>Rate & term</h2>
              <p style={{ fontSize: 13, color: "#718096", marginBottom: 24 }}>Adjust the sliders or type your values to match your mortgage offer.</p>

              <SliderField label="Interest Rate" tooltip={TOOLTIPS.interestRate}
                value={form.interestRate} onChange={setNum("interestRate")}
                min={0.5} max={10} step={0.1}
                display={`${Number(form.interestRate).toFixed(1)}%`} />

              <SliderField label="Mortgage Term" tooltip={TOOLTIPS.termYears}
                value={form.termYears} onChange={setNum("termYears")}
                min={5} max={35} step={1}
                display={`${form.termYears} years`} />

              <div style={{ marginBottom: 20 }}>
                <FieldLabel label="Repayment Type" tooltip={TOOLTIPS.repaymentType} />
                <div style={{ display: "flex", gap: 10 }}>
                  {[["repayment", "Repayment"], ["interest_only", "Interest Only"]].map(([val, lbl]) => (
                    <button key={val} onClick={() => setForm(f => ({ ...f, repaymentType: val }))}
                      style={{
                        flex: 1, padding: "11px 8px", borderRadius: 10, cursor: "pointer",
                        border: form.repaymentType === val ? "2px solid #006A4D" : "2px solid #e2e8f0",
                        background: form.repaymentType === val ? "#f0fdf8" : "#fff",
                        color: form.repaymentType === val ? "#006A4D" : "#718096",
                        fontWeight: form.repaymentType === val ? 700 : 400,
                        fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                        transition: "all 0.2s"
                      }}>
                      {lbl}
                    </button>
                  ))}
                </div>
                {form.repaymentType === "interest_only" && (
                  <p style={{ fontSize: 11, color: "#d69e2e", marginTop: 6, background: "#fffff0", border: "1px solid #f6e05e", padding: "6px 10px", borderRadius: 6 }}>
                    ⚠️ With interest only, you must repay the full loan ({formatCurrency(Number(form.loanAmount))}) at the end of your term.
                  </p>
                )}
              </div>

              {/* Live preview */}
              <div style={{ background: "#f7fdfb", border: "1px solid #c6f6e6", borderRadius: 12, padding: "14px 16px", marginBottom: 8 }}>
                <p style={{ fontSize: 12, color: "#718096", marginBottom: 2 }}>Estimated monthly payment</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: "#006A4D", fontFamily: "'DM Serif Display', serif" }}>
                  {form.repaymentType === "interest_only"
                    ? formatCurrencyFull((Number(form.loanAmount) * form.interestRate / 100) / 12)
                    : formatCurrencyFull(calcMonthly(Number(form.loanAmount), form.interestRate, form.termYears) || 0)
                  }
                </p>
                <p style={{ fontSize: 11, color: "#a0aec0" }}>Live estimate — click Calculate for full breakdown</p>
              </div>
            </div>
          )}

          {/* Step 3 — Results */}
          {step === 2 && result && (
            <div className="fade-up">
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#1a202c", marginBottom: 4, fontFamily: "'DM Serif Display', serif" }}>Your results</h2>
              <p style={{ fontSize: 13, color: "#718096", marginBottom: 20 }}>Here's a full breakdown of your estimated mortgage costs.</p>

              {/* Monthly hero */}
              <div className={animated ? "count-up" : ""} style={{
                background: "linear-gradient(135deg,#006A4D,#00875a)",
                borderRadius: 16, padding: "24px", marginBottom: 20, textAlign: "center",
                boxShadow: "0 8px 24px rgba(0,106,77,0.25)"
              }}>
                <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, marginBottom: 4 }}>Monthly Payment</p>
                <p style={{ color: "#fff", fontSize: 38, fontWeight: 800, fontFamily: "'DM Serif Display', serif", lineHeight: 1 }}>
                  {form.repaymentType === "interest_only"
                    ? formatCurrencyFull((result.principal * form.interestRate / 100) / 12)
                    : formatCurrencyFull(result.monthly)}
                </p>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 6 }}>
                  over {form.termYears} years at {Number(form.interestRate).toFixed(1)}% interest
                </p>
              </div>

              {/* Breakdown grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[
                  ["Capital Borrowed", formatCurrency(result.principal), "#006A4D"],
                  ["Total Interest", formatCurrency(result.totalInterest), "#c05621"],
                  ["Total Repayable", formatCurrency(result.totalRepayable), "#1a202c"],
                  result.ltv ? ["Loan-to-Value", `${result.ltv}%`, result.ltv > 90 ? "#c05621" : result.ltv > 75 ? "#d69e2e" : "#006A4D"] : null,
                ].filter(Boolean).map(([lbl, val, col]) => (
                  <div key={lbl} style={{ background: "#f7fafb", borderRadius: 12, padding: "14px 16px" }}>
                    <p style={{ fontSize: 11, color: "#a0aec0", marginBottom: 3 }}>{lbl}</p>
                    <p style={{ fontSize: 17, fontWeight: 700, color: col }}>{val}</p>
                  </div>
                ))}
              </div>

              <DonutChart principal={result.principal} totalInterest={result.totalInterest} />

              <div style={{ background: "#fffbeb", border: "1px solid #f6e05e", borderRadius: 10, padding: "12px 14px", marginTop: 16 }}>
                <p style={{ fontSize: 11, color: "#744210", lineHeight: 1.5 }}>
                  <strong>Important:</strong> This is an estimate only. Your actual monthly payment will depend on your lender's terms, fees, and your credit profile. Please speak to a Lloyds mortgage adviser for a personalised quote.
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
            {step > 0 && (
              <button onClick={back} style={{
                flex: 1, padding: "13px", borderRadius: 12, border: "2px solid #e2e8f0",
                background: "#fff", color: "#4a5568", fontWeight: 600, fontSize: 14,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s"
              }}
                onMouseEnter={e => e.target.style.borderColor = "#006A4D"}
                onMouseLeave={e => e.target.style.borderColor = "#e2e8f0"}>
                ← Back
              </button>
            )}
            {step < 2 && (
              <button onClick={next} style={{
                flex: 2, padding: "13px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#006A4D,#00875a)",
                color: "#fff", fontWeight: 700, fontSize: 14,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 4px 14px rgba(0,106,77,0.3)", transition: "all 0.2s"
              }}
                onMouseEnter={e => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 6px 20px rgba(0,106,77,0.4)"; }}
                onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "0 4px 14px rgba(0,106,77,0.3)"; }}>
                {step === 1 ? "Calculate →" : "Next →"}
              </button>
            )}
            {step === 2 && (
              <button onClick={reset} style={{
                flex: 1, padding: "13px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg,#006A4D,#00875a)",
                color: "#fff", fontWeight: 700, fontSize: 14,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 4px 14px rgba(0,106,77,0.3)"
              }}>
                Start Again
              </button>
            )}
          </div>
        </div>

        <p style={{ fontSize: 11, color: "#a0aec0", marginTop: 20, textAlign: "center", maxWidth: 400 }}>
          Lloyds Bank plc. Authorised by the Prudential Regulation Authority. This tool provides estimates only and does not constitute financial advice.
        </p>
      </div>
    </>
  );
}