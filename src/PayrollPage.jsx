import { useState, useEffect } from "react";

// ──────────────────────────────────────────────
// PayrollPage.jsx — Payroll Management Page
// NEW FILE → save as src/PayrollPage.jsx
//
// Features:
//   - Summary stat cards (budget, monthly cost, avg salary)
//   - Full payroll table (annual, monthly, tax, net pay)
//   - Department breakdown table
//   - Export to PDF (no library needed — pure JS!)
//
// Connects to: GET /api/payroll on FastAPI
// ──────────────────────────────────────────────

const API_BASE  = "https://employee-api-f3hl.onrender.com";
const getToken  = () => localStorage.getItem("jwt_token");
const fmt       = (n) => "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0 });
const fmtK      = (n) => "$" + (n / 1000).toFixed(0) + "k";

// ── DEPT COLOR MAP ────────────────────────────
const DEPT_COLORS = {
  Engineering:  { bg: "#EEF3FF", text: "#5B8BDF", border: "#C8D8FF" },
  Integration:  { bg: "#FFF9F0", text: "#C8A96E", border: "#F0E5D0" },
  Analytics:    { bg: "#EEF9F2", text: "#4CAF82", border: "#C0E8D0" },
  Design:       { bg: "#FFF0F5", text: "#E07070", border: "#FFD0D8" },
  Product:      { bg: "#F5EEF8", text: "#9B72CF", border: "#DFC8F0" },
};
const getDeptStyle = (dept) =>
  DEPT_COLORS[dept] || { bg: "#F7F6F2", text: "#888", border: "#E8E6E0" };

// ── STATUS BADGE ──────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Active:    { bg: "#EEF9F2", color: "#4CAF82" },
    "On Leave":{ bg: "#FFF9F0", color: "#C8A96E" },
    Inactive:  { bg: "#F7F6F2", color: "#aaa"    },
  };
  const s = map[status] || map.Inactive;
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 12, fontWeight: 500,
      display: "inline-flex", alignItems: "center", gap: 5
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.color }} />
      {status}
    </span>
  );
};

// ── STAT CARD ─────────────────────────────────
const StatCard = ({ label, value, sub, accent }) => (
  <div style={{
    background: "#fff", border: "1.5px solid #EDECEA",
    borderRadius: 16, padding: "20px 24px",
    borderTop: `4px solid ${accent}`,
  }}>
    <p style={{ fontSize: 11.5, color: "#aaa", textTransform: "uppercase",
      letterSpacing: ".6px", margin: "0 0 8px", fontWeight: 500 }}>{label}</p>
    <p style={{ fontSize: 26, fontWeight: 700, color: "#1C1C1E",
      fontFamily: "'Playfair Display', serif", margin: "0 0 4px" }}>{value}</p>
    {sub && <p style={{ fontSize: 12.5, color: "#aaa", margin: 0 }}>{sub}</p>}
  </div>
);

export default function PayrollPage() {
  const [payroll,     setPayroll]     = useState([]);
  const [deptSummary, setDeptSummary] = useState([]);
  const [totals,      setTotals]      = useState({});
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [filterDept,  setFilterDept]  = useState("All");
  const [activeTab,   setActiveTab]   = useState("employees"); // "employees" | "departments"
  const [sortField,   setSortField]   = useState("name");
  const [sortDir,     setSortDir]     = useState("asc");

  // ── FETCH PAYROLL DATA ───────────────────────
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res  = await fetch(`${API_BASE}/api/payroll`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        if (!res.ok) throw new Error("Failed to load payroll data");
        const data = await res.json();
        setPayroll(data.payroll     || []);
        setDeptSummary(data.dept_summary || []);
        setTotals(data.totals       || {});
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── DEPARTMENTS LIST FOR FILTER ───────────────
  const departments = ["All", ...new Set(payroll.map(p => p.department))];

  // ── FILTER + SEARCH + SORT ───────────────────
  const filtered = payroll
    .filter(p =>
      (filterDept === "All" || p.department === filterDept) &&
      (p.name.toLowerCase().includes(search.toLowerCase()) ||
       p.role.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      const mult = sortDir === "asc" ? 1 : -1;
      if (["annual","monthly","tax","net_pay"].includes(sortField))
        return (a[sortField] - b[sortField]) * mult;
      return a[sortField].localeCompare(b[sortField]) * mult;
    });

  function toggleSort(field) {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  }

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ color: "#ddd", marginLeft: 4 }}>↕</span>;
    return <span style={{ color: "#C8A96E", marginLeft: 4 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  // ── EXPORT TO CSV ────────────────────────────
  // Pure JavaScript — no library needed!
  // Creates a downloadable CSV file from the payroll data
  function exportCSV() {
    const headers = ["Name","Role","Department","Status","Annual Salary","Monthly","Tax Est.","Net Pay"];
    const rows    = filtered.map(p => [
      p.name, p.role, p.department, p.status,
      p.annual, p.monthly, p.tax, p.net_pay
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${v}"`).join(","))
      .join("\n");

    // Create a hidden download link and click it
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `payroll-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── LOADING STATE ────────────────────────────
  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center",
      height: 300, flexDirection:"column", gap: 16 }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%",
        border: "3px solid #EDECEA", borderTopColor: "#C8A96E",
        animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#aaa", fontSize: 14 }}>Loading payroll data...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ background: "#FFF0F0", border: "1.5px solid #FFD0D0",
      borderRadius: 12, padding: 24, color: "#E07070" }}>
      ⚠️ {error}
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        .pay-table th { cursor: pointer; user-select: none; }
        .pay-table th:hover { color: #C8A96E !important; }
        .pay-row:hover td { background: #FAFAF8 !important; }
        .tab-btn { cursor: pointer; transition: all .15s; }
        .tab-btn:hover { color: #1C1C1E !important; }
        .chip { cursor: pointer; transition: all .15s; }
        .chip:hover { border-color: #C8A96E !important; color: #C8A96E !important; }
      `}</style>

      {/* ── PAGE HEADER ── */}
      <div style={{ display:"flex", alignItems:"flex-start",
        justifyContent:"space-between", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize: 28,
            fontWeight: 700, color: "#1C1C1E", margin: "0 0 6px",
            letterSpacing: "-0.5px" }}>Payroll Management</h2>
          <p style={{ fontSize: 13.5, color: "#aaa", margin: 0 }}>
            Monthly salary breakdown · Tax estimates · Export ready
          </p>
        </div>
        <button onClick={exportCSV} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 20px", borderRadius: 12,
          background: "#1C1C1E", color: "#fff",
          border: "none", fontSize: 13.5, fontWeight: 500,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          transition: "all .18s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#333"}
          onMouseLeave={e => e.currentTarget.style.background = "#1C1C1E"}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export CSV
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
        gap: 16, marginBottom: 28 }}>
        <StatCard
          label="Annual Budget"
          value={fmtK(totals.annual_budget || 0)}
          sub="Total company payroll"
          accent="#C8A96E"
        />
        <StatCard
          label="Monthly Cost"
          value={fmtK(totals.monthly_cost || 0)}
          sub="This month's total"
          accent="#5B8BDF"
        />
        <StatCard
          label="Avg. Salary"
          value={fmtK(totals.avg_salary || 0)}
          sub="Across all employees"
          accent="#4CAF82"
        />
        <StatCard
          label="On Payroll"
          value={totals.total_employees || 0}
          sub="Active employees"
          accent="#9B72CF"
        />
      </div>

      {/* ── TABS ── */}
      <div style={{ display:"flex", gap: 4, marginBottom: 20,
        borderBottom: "2px solid #EDECEA", paddingBottom: 0 }}>
        {[
          { id:"employees",   label:"Employee Payroll" },
          { id:"departments", label:"Department Summary" },
        ].map(t => (
          <button key={t.id}
            className="tab-btn"
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: "10px 20px", border:"none", background:"none",
              fontSize: 13.5, fontWeight: activeTab === t.id ? 600 : 400,
              color: activeTab === t.id ? "#1C1C1E" : "#aaa",
              borderBottom: activeTab === t.id ? "2px solid #C8A96E" : "2px solid transparent",
              marginBottom: -2, cursor:"pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── EMPLOYEE PAYROLL TAB ── */}
      {activeTab === "employees" && (
        <>
          {/* Search + Filter */}
          <div style={{ display:"flex", gap: 12, marginBottom: 20,
            alignItems:"center", flexWrap:"wrap" }}>
            <div style={{ position:"relative", flex: 1, minWidth: 200 }}>
              <svg style={{ position:"absolute", left:12, top:"50%",
                transform:"translateY(-50%)", color:"#bbb" }}
                width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                placeholder="Search employees..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width:"100%", padding:"9px 12px 9px 36px",
                  border:"1.5px solid #E8E6E0", borderRadius:10,
                  fontSize:13.5, outline:"none", boxSizing:"border-box",
                  fontFamily:"'DM Sans',sans-serif" }}
              />
            </div>
            <div style={{ display:"flex", gap: 8, flexWrap:"wrap" }}>
              {departments.map(d => (
                <span key={d} className="chip"
                  onClick={() => setFilterDept(d)}
                  style={{
                    padding:"6px 14px", borderRadius:20, fontSize:12.5,
                    border: `1.5px solid ${filterDept===d ? "#C8A96E" : "#E8E6E0"}`,
                    color:  filterDept===d ? "#C8A96E" : "#888",
                    background: filterDept===d ? "#FFF9F0" : "#fff",
                    fontWeight: filterDept===d ? 500 : 400,
                  }}>
                  {d}
                </span>
              ))}
            </div>
            <span style={{ fontSize:12.5, color:"#aaa", whiteSpace:"nowrap" }}>
              {filtered.length} employees
            </span>
          </div>

          {/* Table */}
          <div style={{ background:"#fff", border:"1.5px solid #EDECEA",
            borderRadius:16, overflow:"hidden" }}>
            <table className="pay-table" style={{ width:"100%",
              borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#F7F6F2" }}>
                  {[
                    { label:"Employee",   field:"name"     },
                    { label:"Department", field:"department"},
                    { label:"Status",     field:"status"   },
                    { label:"Annual",     field:"annual"   },
                    { label:"Monthly",    field:"monthly"  },
                    { label:"Tax (20%)",  field:"tax"      },
                    { label:"Net Pay",    field:"net_pay"  },
                  ].map(col => (
                    <th key={col.field}
                      onClick={() => toggleSort(col.field)}
                      style={{ padding:"13px 16px", textAlign:"left",
                        fontSize:11.5, fontWeight:600, color:"#888",
                        textTransform:"uppercase", letterSpacing:".5px",
                        borderBottom:"1.5px solid #EDECEA", whiteSpace:"nowrap" }}>
                      {col.label}<SortIcon field={col.field}/>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const ds = getDeptStyle(p.department);
                  return (
                    <tr key={p.id} className="pay-row">
                      <td style={{ padding:"14px 16px",
                        borderBottom:"1.5px solid #F7F6F2" }}>
                        <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
                          <div style={{
                            width:34, height:34, borderRadius:"50%",
                            background: ds.bg, color: ds.text,
                            display:"flex", alignItems:"center",
                            justifyContent:"center", fontSize:12,
                            fontWeight:600, flexShrink:0,
                          }}>
                            {p.name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                          </div>
                          <div>
                            <p style={{ margin:0, fontSize:13.5,
                              fontWeight:500, color:"#1C1C1E" }}>{p.name}</p>
                            <p style={{ margin:0, fontSize:12,
                              color:"#aaa" }}>{p.role}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:"14px 16px",
                        borderBottom:"1.5px solid #F7F6F2" }}>
                        <span style={{ background:ds.bg, color:ds.text,
                          padding:"3px 10px", borderRadius:20, fontSize:12,
                          fontWeight:500, border:`1px solid ${ds.border}` }}>
                          {p.department}
                        </span>
                      </td>
                      <td style={{ padding:"14px 16px",
                        borderBottom:"1.5px solid #F7F6F2" }}>
                        <StatusBadge status={p.status}/>
                      </td>
                      <td style={{ padding:"14px 16px",
                        borderBottom:"1.5px solid #F7F6F2",
                        fontSize:13.5, fontWeight:600, color:"#1C1C1E" }}>
                        {fmt(p.annual)}
                      </td>
                      <td style={{ padding:"14px 16px",
                        borderBottom:"1.5px solid #F7F6F2",
                        fontSize:13.5, color:"#555" }}>
                        {fmt(p.monthly)}
                      </td>
                      <td style={{ padding:"14px 16px",
                        borderBottom:"1.5px solid #F7F6F2",
                        fontSize:13.5, color:"#E07070" }}>
                        -{fmt(p.tax)}
                      </td>
                      <td style={{ padding:"14px 16px",
                        borderBottom:"1.5px solid #F7F6F2" }}>
                        <span style={{ fontSize:13.5, fontWeight:600,
                          color:"#4CAF82" }}>{fmt(p.net_pay)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* TOTALS ROW */}
              <tfoot>
                <tr style={{ background:"#F7F6F2" }}>
                  <td colSpan={3} style={{ padding:"13px 16px",
                    fontSize:13, fontWeight:600, color:"#888" }}>
                    Totals ({filtered.length} employees)
                  </td>
                  <td style={{ padding:"13px 16px",
                    fontSize:13.5, fontWeight:700, color:"#1C1C1E" }}>
                    {fmt(filtered.reduce((s,p)=>s+p.annual,0))}
                  </td>
                  <td style={{ padding:"13px 16px",
                    fontSize:13.5, fontWeight:700, color:"#555" }}>
                    {fmt(filtered.reduce((s,p)=>s+p.monthly,0))}
                  </td>
                  <td style={{ padding:"13px 16px",
                    fontSize:13.5, fontWeight:700, color:"#E07070" }}>
                    -{fmt(filtered.reduce((s,p)=>s+p.tax,0))}
                  </td>
                  <td style={{ padding:"13px 16px",
                    fontSize:13.5, fontWeight:700, color:"#4CAF82" }}>
                    {fmt(filtered.reduce((s,p)=>s+p.net_pay,0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}

      {/* ── DEPARTMENT SUMMARY TAB ── */}
      {activeTab === "departments" && (
        <div style={{ background:"#fff", border:"1.5px solid #EDECEA",
          borderRadius:16, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#F7F6F2" }}>
                {["Department","Headcount","Monthly Cost","Annual Cost","Avg Salary"].map(h => (
                  <th key={h} style={{ padding:"13px 16px", textAlign:"left",
                    fontSize:11.5, fontWeight:600, color:"#888",
                    textTransform:"uppercase", letterSpacing:".5px",
                    borderBottom:"1.5px solid #EDECEA" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deptSummary.map((d, i) => {
                const ds  = getDeptStyle(d.department);
                const avg = Math.round(d.annual_cost / d.headcount);
                const pct = Math.round((d.annual_cost / (totals.annual_budget||1)) * 100);
                return (
                  <tr key={i} style={{ cursor:"default" }}>
                    <td style={{ padding:"16px", borderBottom:"1.5px solid #F7F6F2" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:10, height:10, borderRadius:2,
                          background:ds.text }}/>
                        <span style={{ fontSize:13.5, fontWeight:500,
                          color:"#1C1C1E" }}>{d.department}</span>
                      </div>
                    </td>
                    <td style={{ padding:"16px",
                      borderBottom:"1.5px solid #F7F6F2",
                      fontSize:13.5, color:"#555" }}>
                      {d.headcount} people
                    </td>
                    <td style={{ padding:"16px",
                      borderBottom:"1.5px solid #F7F6F2",
                      fontSize:13.5, fontWeight:600, color:"#1C1C1E" }}>
                      {fmt(d.monthly_cost)}
                    </td>
                    <td style={{ padding:"16px",
                      borderBottom:"1.5px solid #F7F6F2" }}>
                      <div>
                        <span style={{ fontSize:13.5, fontWeight:600,
                          color:"#1C1C1E" }}>{fmt(d.annual_cost)}</span>
                        <div style={{ marginTop:6, height:5, borderRadius:3,
                          background:"#F0EEE8", overflow:"hidden" }}>
                          <div style={{ height:"100%", borderRadius:3,
                            background:ds.text, width:`${pct}%`,
                            transition:"width .4s" }}/>
                        </div>
                        <span style={{ fontSize:11, color:"#bbb" }}>{pct}% of total</span>
                      </div>
                    </td>
                    <td style={{ padding:"16px",
                      borderBottom:"1.5px solid #F7F6F2",
                      fontSize:13.5, color:"#4CAF82", fontWeight:600 }}>
                      {fmt(avg)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
