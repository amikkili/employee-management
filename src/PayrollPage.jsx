import { useState, useEffect } from "react";

const API_BASE = "https://employee-api-f3hl.onrender.com";
const getToken = () => localStorage.getItem("jwt_token");
const fmt  = (n) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits:0, maximumFractionDigits:0 })}`;
const fmtD = (n) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;
const month = new Date().toLocaleString("default", { month:"long", year:"numeric" });

const DEPT_COLORS = {
  Engineering: { bg:"#EEF3FF", text:"#5B8BDF", border:"#C8D9F8" },
  Integration:  { bg:"#FFF9F0", text:"#C8A96E", border:"#F0E5D0" },
  Analytics:    { bg:"#EEF9F2", text:"#4CAF82", border:"#C0E8D0" },
  Design:       { bg:"#FFF0F5", text:"#E07070", border:"#F8D0D8" },
  Product:      { bg:"#F5EEF8", text:"#9B72CF", border:"#D8C0F0" },
};
const getDeptStyle = (d) => DEPT_COLORS[d] || { bg:"#F5F5F5", text:"#888", border:"#DDD" };

const AVATAR_COLORS = [
  { bg:"#EEF3FF", color:"#5B8BDF" }, { bg:"#FFF9F0", color:"#C8A96E" },
  { bg:"#EEF9F2", color:"#4CAF82" }, { bg:"#FFF0F5", color:"#E07070" },
  { bg:"#F5EEF8", color:"#9B72CF" }, { bg:"#E8F8F5", color:"#1ABC9C" },
];
const getAvatar   = (name) => AVATAR_COLORS[(name?.charCodeAt(0)||0) % AVATAR_COLORS.length];
const getInitials = (name) => name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) || "?";

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  .payroll-page { font-family:'DM Sans',sans-serif; }
  .payroll-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:28px; flex-wrap:wrap; gap:16px; }
  .payroll-header h2 { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:#1C1C1E; letter-spacing:-0.5px; margin:0 0 4px; }
  .payroll-header p { font-size:13.5px; color:#888; margin:0; }
  .header-actions { display:flex; gap:10px; align-items:center; }
  .btn-export { display:flex; align-items:center; gap:8px; padding:10px 20px; background:#1C1C1E; color:#fff; border:none; border-radius:10px; font-size:13px; font-family:'DM Sans',sans-serif; font-weight:500; cursor:pointer; transition:all .18s; }
  .btn-export:hover { background:#333; transform:translateY(-1px); }
  .btn-export svg { width:15px; height:15px; }
  .btn-month { padding:10px 16px; border:1.5px solid #E8E6E0; background:#fff; border-radius:10px; font-size:13px; font-family:'DM Sans',sans-serif; color:#666; cursor:default; display:flex; align-items:center; gap:6px; }
  .btn-month svg { width:14px; height:14px; }
  .summary-cards { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:28px; }
  .summary-card { background:#fff; border:1.5px solid #EDECEA; border-radius:14px; padding:18px 20px; }
  .summary-card .card-label { font-size:11px; font-weight:600; color:#aaa; text-transform:uppercase; letter-spacing:.6px; margin-bottom:8px; }
  .summary-card .card-value { font-size:24px; font-weight:600; color:#1C1C1E; letter-spacing:-0.5px; line-height:1; margin-bottom:4px; }
  .summary-card .card-sub   { font-size:12px; color:#aaa; }
  .summary-card.highlight   { background:#1C1C1E; border-color:#1C1C1E; }
  .summary-card.highlight .card-label { color:#888; }
  .summary-card.highlight .card-value { color:#C8A96E; }
  .summary-card.highlight .card-sub   { color:#666; }
  .section-title { font-size:14px; font-weight:600; color:#1C1C1E; margin:0 0 14px; display:flex; align-items:center; gap:8px; }
  .section-title span { font-weight:400; color:#aaa; font-size:13px; }
  .dept-cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(170px,1fr)); gap:12px; margin-bottom:28px; }
  .dept-card  { border-radius:12px; padding:14px 16px; border:1.5px solid; }
  .dept-card .dept-name  { font-size:12px; font-weight:600; margin-bottom:8px; }
  .dept-card .dept-value { font-size:18px; font-weight:600; color:#1C1C1E; margin-bottom:2px; }
  .dept-card .dept-sub   { font-size:11.5px; color:#999; }
  .payroll-table-wrap { background:#fff; border:1.5px solid #EDECEA; border-radius:14px; overflow:hidden; margin-bottom:20px; }
  .table-header-bar { display:flex; align-items:center; justify-content:space-between; padding:16px 20px; border-bottom:1.5px solid #EDECEA; flex-wrap:wrap; gap:10px; }
  .table-header-bar h3 { font-size:14px; font-weight:600; color:#1C1C1E; margin:0 0 2px; }
  .table-header-bar p  { font-size:12.5px; color:#aaa; margin:0; }
  .payroll-table { width:100%; border-collapse:collapse; font-size:13px; }
  .payroll-table th { padding:11px 16px; background:#F7F6F2; font-size:11px; font-weight:600; color:#999; text-transform:uppercase; letter-spacing:.5px; text-align:left; border-bottom:1.5px solid #EDECEA; }
  .payroll-table th.right { text-align:right; }
  .payroll-table td { padding:13px 16px; border-bottom:1px solid #F5F3EF; color:#444; vertical-align:middle; }
  .payroll-table td.right { text-align:right; font-variant-numeric:tabular-nums; }
  .payroll-table tr:last-child td { border-bottom:none; }
  .payroll-table tr:hover td { background:#FAFAF8; }
  .emp-cell { display:flex; align-items:center; gap:10px; }
  .emp-avatar { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:600; flex-shrink:0; }
  .emp-name { font-size:13px; font-weight:500; color:#1C1C1E; }
  .emp-role { font-size:11.5px; color:#aaa; }
  .dept-badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11.5px; font-weight:500; border:1px solid; }
  .status-dot { display:inline-flex; align-items:center; gap:5px; font-size:12px; color:#4CAF82; }
  .status-dot .dot { width:6px; height:6px; border-radius:50%; background:#4CAF82; }
  .status-dot.inactive { color:#aaa; }
  .status-dot.inactive .dot { background:#ccc; }
  .net-pay { font-weight:600; color:#1C1C1E; }
  .tax-amt  { color:#E07070; font-size:12.5px; }
  .total-row td { background:#F7F6F2 !important; font-weight:600; color:#1C1C1E; border-top:2px solid #EDECEA; }
  .btn-view-slip { padding:5px 12px; border:1.5px solid #E8E6E0; background:#fff; border-radius:8px; font-size:12px; font-family:'DM Sans',sans-serif; color:#555; cursor:pointer; white-space:nowrap; transition:all .15s; }
  .btn-view-slip:hover { border-color:#C8A96E; color:#C8A96E; background:#FFF9F0; }
  .payroll-loading { display:flex; align-items:center; justify-content:center; padding:80px; color:#aaa; gap:10px; font-size:14px; }

  /* SALARY SLIP MODAL */
  .slip-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; }
  .slip-modal { background:#fff; border-radius:16px; width:100%; max-width:500px; max-height:90vh; overflow-y:auto; animation:slipUp .2s ease; }
  @keyframes slipUp { from{transform:translateY(20px);opacity:0} to{transform:translateY(0);opacity:1} }
  .slip-modal::-webkit-scrollbar { width:4px; }
  .slip-modal::-webkit-scrollbar-thumb { background:#E8E6E0; border-radius:2px; }
  .slip-header { background:#1C1C1E; padding:28px; border-radius:16px 16px 0 0; }
  .slip-header h3 { font-family:'Playfair Display',serif; font-size:22px; color:#C8A96E; margin:0 0 4px; }
  .slip-header p  { font-size:12.5px; color:#888; margin:0; }
  .slip-body { padding:24px; }
  .slip-emp-row { display:flex; align-items:center; gap:14px; padding:16px; background:#F7F6F2; border-radius:12px; margin-bottom:20px; }
  .slip-emp-avatar { width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:600; flex-shrink:0; }
  .slip-emp-name { font-size:15px; font-weight:600; color:#1C1C1E; margin-bottom:3px; }
  .slip-emp-meta { font-size:12.5px; color:#888; }
  .slip-section-label { font-size:11px; font-weight:600; color:#aaa; text-transform:uppercase; letter-spacing:.5px; margin:16px 0 8px; }
  .slip-section-label:first-of-type { margin-top:0; }
  .slip-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #F5F3EF; font-size:13.5px; }
  .slip-row:last-child { border-bottom:none; }
  .slip-row .label { color:#888; }
  .slip-row .value { font-weight:500; color:#1C1C1E; }
  .slip-row.tax-row .value { color:#E07070; }
  .slip-total { display:flex; justify-content:space-between; align-items:center; padding:14px 16px; background:#F7F6F2; border-radius:10px; margin-top:16px; }
  .slip-total .label { font-size:14px; font-weight:600; color:#1C1C1E; }
  .slip-total .value { font-size:20px; font-weight:700; color:#1C1C1E; }
  .slip-footer { display:flex; gap:10px; padding:0 24px 24px; }
  .btn-slip-close { padding:11px 18px; border:1.5px solid #E8E6E0; background:#fff; border-radius:10px; font-size:13px; font-family:'DM Sans',sans-serif; color:#666; cursor:pointer; transition:all .15s; }
  .btn-slip-close:hover { border-color:#999; color:#333; }
  .btn-slip-download { flex:1; padding:11px; background:#1C1C1E; color:#fff; border:none; border-radius:10px; font-size:13px; font-family:'DM Sans',sans-serif; font-weight:500; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:all .15s; }
  .btn-slip-download:hover { background:#333; }
  .slip-note { font-size:11.5px; color:#ccc; text-align:center; padding:0 24px 16px; }

  @media print {
    .btn-export, .btn-month, .header-actions, .btn-view-slip { display:none !important; }
    .payroll-table th { background:#f0f0f0 !important; -webkit-print-color-adjust:exact; }
    .summary-card.highlight { background:#1C1C1E !important; -webkit-print-color-adjust:exact; }
    .dept-card { -webkit-print-color-adjust:exact; }
    .slip-overlay { position:fixed !important; background:white !important; padding:0 !important; align-items:flex-start !important; }
    .slip-modal { max-height:none; border-radius:0; width:100%; }
    .slip-footer, .slip-note, .btn-slip-close, .btn-slip-download { display:none !important; }
    .payroll-header, .summary-cards, .dept-cards, .payroll-table-wrap, .section-title { display:none !important; }
    .slip-header { border-radius:0; -webkit-print-color-adjust:exact; }
  }
`;

export default function PayrollPage() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState("All");
  const [slip,    setSlip]    = useState(null);   // selected employee for salary slip

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`${API_BASE}/api/payroll`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || "Failed to load payroll");
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <><style>{S}</style>
      <div className="payroll-loading">
        <div style={{width:20,height:20,border:"2px solid #E8E6E0",borderTopColor:"#C8A96E",borderRadius:"50%",animation:"spin .7s linear infinite"}}></div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        Loading payroll data...
      </div>
    </>
  );

  if (error) return (
    <><style>{S}</style>
      <div className="payroll-loading" style={{color:"#E07070"}}>⚠️ {error}</div>
    </>
  );

  const { employees, dept_totals, summary } = data;
  const departments = ["All", ...new Set(employees.map(e => e.department))];
  const filtered    = filter === "All" ? employees : employees.filter(e => e.department === filter);

  return (
    <><style>{S}</style>
    <div className="payroll-page">

      {/* HEADER */}
      <div className="payroll-header">
        <div>
          <h2>Payroll</h2>
          <p>Monthly breakdown for {month} · {summary.headcount} employees</p>
        </div>
        <div className="header-actions">
          <button className="btn-month">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {month}
          </button>
          <button className="btn-export" onClick={() => window.print()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="summary-cards">
        <div className="summary-card highlight">
          <div className="card-label">Total Monthly Cost</div>
          <div className="card-value">{fmt(summary.total_monthly_gross)}</div>
          <div className="card-sub">{fmt(summary.total_annual)} annually</div>
        </div>
        <div className="summary-card">
          <div className="card-label">Monthly Net Pay</div>
          <div className="card-value">{fmt(summary.total_monthly_net)}</div>
          <div className="card-sub">After 20% tax estimate</div>
        </div>
        <div className="summary-card">
          <div className="card-label">Est. Monthly Tax</div>
          <div className="card-value" style={{color:"#E07070"}}>{fmt(summary.total_monthly_tax)}</div>
          <div className="card-sub">20% flat rate</div>
        </div>
        <div className="summary-card">
          <div className="card-label">Headcount</div>
          <div className="card-value">{summary.headcount}</div>
          <div className="card-sub">Employees on payroll</div>
        </div>
      </div>

      {/* DEPT TOTALS */}
      <p className="section-title">By Department <span>Monthly gross payroll</span></p>
      <div className="dept-cards">
        {dept_totals.map((d,i) => {
          const s = getDeptStyle(d.department);
          return (
            <div key={i} className="dept-card" style={{background:s.bg, borderColor:s.border}}>
              <div className="dept-name" style={{color:s.text}}>{d.department}</div>
              <div className="dept-value">{fmt(d.monthly_gross)}</div>
              <div className="dept-sub">{d.headcount} employee{d.headcount!==1?"s":""}</div>
            </div>
          );
        })}
      </div>

      {/* TABLE */}
      <div className="payroll-table-wrap">
        <div className="table-header-bar">
          <div>
            <h3>Employee Payroll Breakdown</h3>
            <p>Monthly salary · 20% estimated tax deduction</p>
          </div>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap"}}>
            {departments.map(d => (
              <button key={d} onClick={() => setFilter(d)}
                style={{padding:"5px 12px",borderRadius:"20px",border:`1.5px solid ${filter===d?"#1C1C1E":"#E8E6E0"}`,background:filter===d?"#1C1C1E":"#fff",color:filter===d?"#fff":"#666",fontSize:"12px",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <table className="payroll-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Department</th>
              <th className="right">Annual</th>
              <th className="right">Monthly Gross</th>
              <th className="right">Tax (20%)</th>
              <th className="right">Monthly Net</th>
              <th>Status</th>
              <th>Slip</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp,i) => {
              const av     = getAvatar(emp.name);
              const ds     = getDeptStyle(emp.department);
              const active = emp.status?.toLowerCase() === "active";
              return (
                <tr key={i}>
                  <td>
                    <div className="emp-cell">
                      <div className="emp-avatar" style={{background:av.bg,color:av.color}}>{getInitials(emp.name)}</div>
                      <div><div className="emp-name">{emp.name}</div><div className="emp-role">{emp.role}</div></div>
                    </div>
                  </td>
                  <td><span className="dept-badge" style={{background:ds.bg,color:ds.text,borderColor:ds.border}}>{emp.department}</span></td>
                  <td className="right">{fmt(emp.annual)}</td>
                  <td className="right">{fmtD(emp.monthly)}</td>
                  <td className="right"><span className="tax-amt">-{fmtD(emp.monthly_tax)}</span></td>
                  <td className="right"><span className="net-pay">{fmtD(emp.monthly_net)}</span></td>
                  <td><span className={`status-dot ${!active?"inactive":""}`}><span className="dot"></span>{emp.status}</span></td>
                  <td>
                    <button className="btn-view-slip" onClick={() => setSlip(emp)}>
                      View Slip
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td colSpan={2}>Total ({filtered.length} employees)</td>
              <td className="right">{fmt(filtered.reduce((s,e)=>s+e.annual,0))}</td>
              <td className="right">{fmtD(filtered.reduce((s,e)=>s+e.monthly,0))}</td>
              <td className="right" style={{color:"#E07070"}}>-{fmtD(filtered.reduce((s,e)=>s+e.monthly_tax,0))}</td>
              <td className="right" style={{fontWeight:700}}>{fmtD(filtered.reduce((s,e)=>s+e.monthly_net,0))}</td>
              <td colSpan={2}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <p style={{fontSize:"11.5px",color:"#bbb",textAlign:"center",marginTop:"8px"}}>
        * Tax calculations are estimates only (20% flat rate).
      </p>

      {/* ── SALARY SLIP MODAL ── */}
      {slip && (
        <div className="slip-overlay" onClick={() => setSlip(null)}>
          <div className="slip-modal" onClick={e => e.stopPropagation()}>

            {/* Dark header */}
            <div className="slip-header">
              <h3>WorkFlow HR</h3>
              <p>Salary Slip · {month}</p>
            </div>

            <div className="slip-body">
              {/* Employee info card */}
              <div className="slip-emp-row">
                <div className="slip-emp-avatar" style={{background:getAvatar(slip.name).bg, color:getAvatar(slip.name).color}}>
                  {getInitials(slip.name)}
                </div>
                <div>
                  <div className="slip-emp-name">{slip.name}</div>
                  <div className="slip-emp-meta">{slip.role} · {slip.department}</div>
                  <div className="slip-emp-meta" style={{marginTop:"2px"}}>Pay Period: {month}</div>
                </div>
              </div>

              {/* Earnings */}
              <p className="slip-section-label">Earnings</p>
              <div className="slip-row">
                <span className="label">Annual Salary</span>
                <span className="value">{fmt(slip.annual)}</span>
              </div>
              <div className="slip-row">
                <span className="label">Monthly Gross</span>
                <span className="value">{fmtD(slip.monthly)}</span>
              </div>

              {/* Deductions */}
              <p className="slip-section-label">Deductions</p>
              <div className="slip-row tax-row">
                <span className="label">Income Tax (Est. 20%)</span>
                <span className="value">- {fmtD(slip.monthly_tax)}</span>
              </div>

              {/* Net pay */}
              <div className="slip-total">
                <span className="label">NET PAY</span>
                <span className="value">{fmtD(slip.monthly_net)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="slip-footer">
              <button className="btn-slip-close" onClick={() => setSlip(null)}>Close</button>
              <button className="btn-slip-download" onClick={() => window.print()}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download PDF
              </button>
            </div>
            <p className="slip-note">* Estimates only. Consult a payroll professional for accuracy.</p>
          </div>
        </div>
      )}

    </div></>
  );
}
