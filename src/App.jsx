import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

// ──────────────────────────────────────────────
// 🔌 YOUR LIVE FASTAPI BACKEND
// ──────────────────────────────────────────────
const API_BASE = "https://employee-api-f3hl.onrender.com";

const api = {
  getAll:   ()         => fetch(`${API_BASE}/api/employees`).then(r => r.json()),
  getStats: ()         => fetch(`${API_BASE}/api/stats`).then(r => r.json()),
  create:   (data)     => fetch(`${API_BASE}/api/employees`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
  }).then(r => r.json()),
  update:   (id, data) => fetch(`${API_BASE}/api/employees/${id}`, {
    method: "PUT",  headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
  }).then(r => r.json()),
  delete:   (id)       => fetch(`${API_BASE}/api/employees/${id}`, { method: "DELETE" }).then(r => r.json()),
};

const DEPT_COLORS = {
  Engineering: "#5B8BDF",
  Integration: "#C8A96E",
  Analytics:   "#4CAF82",
  Product:     "#9B72CF",
  Design:      "#E07070",
};

const departments   = ["All","Engineering","Integration","Analytics","Product","Design"];
const statusOptions = ["Active","On Leave","Inactive"];
const deptOptions   = ["Engineering","Integration","Analytics","Product","Design"];
const empty         = { name:"", role:"", department:"Engineering", salary:"", status:"Active", email:"", joined:"" };

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:#F7F6F2;color:#1a1a1a}

  /* SIDEBAR */
  .sidebar{position:fixed;top:0;left:0;width:230px;height:100vh;background:#1C1C1E;display:flex;flex-direction:column;z-index:100}
  .sidebar-logo{padding:28px 24px 24px;border-bottom:1px solid rgba(255,255,255,0.08)}
  .sidebar-logo h1{font-family:'Playfair Display',serif;font-size:20px;color:#fff;font-weight:700}
  .sidebar-logo span{color:#C8A96E}
  .sidebar-logo p{font-size:11px;color:rgba(255,255,255,0.35);margin-top:3px;letter-spacing:.5px;text-transform:uppercase}
  .sidebar-nav{padding:20px 12px;flex:1}
  .nav-label{font-size:10px;color:rgba(255,255,255,0.25);letter-spacing:1.5px;text-transform:uppercase;padding:0 12px;margin-bottom:8px;margin-top:16px}
  .nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;cursor:pointer;color:rgba(255,255,255,0.45);font-size:13.5px;transition:all .18s;margin-bottom:2px}
  .nav-item:hover{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.8)}
  .nav-item.active{background:rgba(200,169,110,0.15);color:#C8A96E;font-weight:500}
  .nav-item svg{width:16px;height:16px;flex-shrink:0}
  .sidebar-footer{padding:16px 12px;border-top:1px solid rgba(255,255,255,0.08)}
  .user-card{display:flex;align-items:center;gap:10px;padding:10px 12px}
  .user-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#C8A96E,#e0c48a);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:#1C1C1E;flex-shrink:0}
  .user-name{font-size:13px;font-weight:500;color:rgba(255,255,255,0.7)}
  .user-role{font-size:11px;color:rgba(255,255,255,0.3)}

  /* MAIN */
  .main{margin-left:230px;padding:36px 40px}

  /* TOPBAR */
  .topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:36px}
  .topbar-left h2{font-family:'Playfair Display',serif;font-size:28px;font-weight:700;color:#1C1C1E;letter-spacing:-0.5px}
  .topbar-left p{font-size:13.5px;color:#888;margin-top:4px;display:flex;align-items:center;gap:8px}
  .topbar-right{display:flex;align-items:center;gap:12px}
  .search-box{display:flex;align-items:center;gap:8px;background:#fff;border:1.5px solid #E8E6E0;border-radius:10px;padding:9px 14px;width:240px;transition:border-color .18s}
  .search-box:focus-within{border-color:#C8A96E}
  .search-box svg{color:#aaa;width:15px;height:15px}
  .search-box input{border:none;outline:none;font-size:13.5px;color:#1a1a1a;background:transparent;width:100%;font-family:'DM Sans',sans-serif}
  .search-box input::placeholder{color:#bbb}
  .btn-primary{display:flex;align-items:center;gap:7px;background:#1C1C1E;color:#fff;border:none;padding:10px 18px;border-radius:10px;cursor:pointer;font-size:13.5px;font-weight:500;font-family:'DM Sans',sans-serif;transition:all .18s}
  .btn-primary:hover{background:#333;transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,0.15)}

  /* STAT CARDS */
  .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:28px}
  .stat-card{background:#fff;border-radius:14px;padding:22px 24px;border:1.5px solid #EDECEA;position:relative;overflow:hidden;transition:transform .18s,box-shadow .18s}
  .stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.07)}
  .stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px}
  .stat-card.gold::before{background:#C8A96E}
  .stat-card.green::before{background:#4CAF82}
  .stat-card.blue::before{background:#5B8BDF}
  .stat-card.rose::before{background:#E07070}
  .stat-label{font-size:11.5px;color:#999;text-transform:uppercase;letter-spacing:.8px;font-weight:500}
  .stat-value{font-family:'Playfair Display',serif;font-size:32px;font-weight:700;color:#1C1C1E;margin:6px 0 2px;line-height:1}
  .stat-sub{font-size:12px;color:#aaa}

  /* ANALYTICS GRID */
  .analytics-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}
  .analytics-grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:24px}
  .chart-card{background:#fff;border-radius:16px;border:1.5px solid #EDECEA;padding:24px;transition:box-shadow .18s}
  .chart-card:hover{box-shadow:0 8px 24px rgba(0,0,0,0.07)}
  .chart-card.wide{grid-column:span 2}
  .chart-title{font-size:15px;font-weight:600;color:#1C1C1E;margin-bottom:4px}
  .chart-sub{font-size:12px;color:#aaa;margin-bottom:20px}

  /* CUSTOM TOOLTIP */
  .custom-tooltip{background:#1C1C1E;border-radius:10px;padding:10px 14px;border:none;box-shadow:0 8px 24px rgba(0,0,0,0.2)}
  .tooltip-label{font-size:12px;color:rgba(255,255,255,0.5);margin-bottom:4px}
  .tooltip-value{font-size:15px;font-weight:600;color:#fff}

  /* FILTER & TABLE */
  .filter-bar{display:flex;align-items:center;gap:8px;margin-bottom:20px;flex-wrap:wrap}
  .filter-chip{padding:6px 14px;border-radius:20px;border:1.5px solid #E8E6E0;background:#fff;font-size:12.5px;color:#666;cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .15s}
  .filter-chip:hover{border-color:#C8A96E;color:#C8A96E}
  .filter-chip.active{background:#1C1C1E;border-color:#1C1C1E;color:#fff;font-weight:500}
  .table-card{background:#fff;border-radius:16px;border:1.5px solid #EDECEA;overflow:hidden}
  .table-header-row{display:flex;align-items:center;justify-content:space-between;padding:18px 24px;border-bottom:1.5px solid #F0EEE9}
  .table-title{font-size:15px;font-weight:600;color:#1C1C1E}
  .table-count{font-size:12.5px;color:#aaa;background:#F7F6F2;padding:3px 10px;border-radius:20px}
  table{width:100%;border-collapse:collapse}
  thead th{text-align:left;padding:12px 20px;font-size:11px;font-weight:600;color:#aaa;text-transform:uppercase;letter-spacing:.8px;background:#FAFAF8;border-bottom:1.5px solid #F0EEE9}
  tbody tr{transition:background .12s;border-bottom:1px solid #F7F6F2}
  tbody tr:hover{background:#FAFAF8}
  tbody tr:last-child{border-bottom:none}
  td{padding:14px 20px;font-size:13.5px;color:#333;vertical-align:middle}
  .emp-info{display:flex;align-items:center;gap:12px}
  .emp-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;flex-shrink:0}
  .emp-name{font-weight:500;color:#1C1C1E;font-size:13.5px}
  .emp-email{font-size:12px;color:#aaa}
  .dept-badge{display:inline-block;padding:3px 10px;border-radius:6px;font-size:11.5px;font-weight:500}
  .dept-Engineering{background:#EEF3FF;color:#5B8BDF}
  .dept-Integration{background:#FFF5E6;color:#C8A96E}
  .dept-Analytics{background:#EEF9F2;color:#4CAF82}
  .dept-Product{background:#F5EEF8;color:#9B72CF}
  .dept-Design{background:#FFEEEE;color:#E07070}
  .status-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:20px;font-size:12px;font-weight:500}
  .status-dot{width:6px;height:6px;border-radius:50%}
  .status-Active{background:#EEF9F2;color:#4CAF82}
  .status-OnLeave{background:#FFF5E6;color:#C8A96E}
  .status-Inactive{background:#F5F5F5;color:#aaa}
  .status-dot-Active{background:#4CAF82}
  .status-dot-OnLeave{background:#C8A96E}
  .status-dot-Inactive{background:#ccc}
  .action-btns{display:flex;gap:6px}
  .btn-icon{width:30px;height:30px;border-radius:7px;border:1.5px solid #E8E6E0;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;color:#888}
  .btn-icon:hover{border-color:#C8A96E;color:#C8A96E;background:#FFF9F0}
  .btn-icon.delete:hover{border-color:#E07070;color:#E07070;background:#FFF0F0}
  .btn-icon svg{width:13px;height:13px}

  /* MODAL */
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;z-index:200;backdrop-filter:blur(3px);animation:fadeIn .18s ease}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
  .modal{background:#fff;border-radius:18px;width:520px;max-width:95vw;box-shadow:0 24px 60px rgba(0,0,0,0.18);animation:slideUp .22s ease;max-height:90vh;overflow-y:auto}
  .modal-head{padding:26px 28px 20px;border-bottom:1.5px solid #F0EEE9;display:flex;align-items:center;justify-content:space-between}
  .modal-head h3{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:#1C1C1E}
  .modal-head p{font-size:13px;color:#999;margin-top:3px}
  .btn-close{width:32px;height:32px;border-radius:8px;border:1.5px solid #E8E6E0;background:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#888}
  .btn-close svg{width:14px;height:14px}
  .modal-body{padding:24px 28px}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
  .form-group{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
  .form-group label{font-size:12px;font-weight:600;color:#666;text-transform:uppercase;letter-spacing:.5px}
  .form-group input,.form-group select{padding:10px 14px;border:1.5px solid #E8E6E0;border-radius:9px;font-size:13.5px;color:#1a1a1a;font-family:'DM Sans',sans-serif;transition:border-color .18s;outline:none;background:#fff}
  .form-group input:focus,.form-group select:focus{border-color:#C8A96E}
  .modal-footer{padding:16px 28px 24px;display:flex;gap:10px;justify-content:flex-end}
  .btn-cancel{padding:10px 20px;border-radius:10px;border:1.5px solid #E8E6E0;background:#fff;font-size:13.5px;color:#666;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500}
  .btn-save{padding:10px 24px;border-radius:10px;border:none;background:#1C1C1E;font-size:13.5px;color:#fff;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:500}
  .btn-save:hover{background:#333}
  .btn-save:disabled{opacity:.5;cursor:not-allowed}

  /* MISC */
  .api-badge{display:inline-flex;align-items:center;gap:5px;background:#EEF9F2;color:#4CAF82;padding:4px 10px;border-radius:20px;font-size:11.5px;font-weight:500}
  .api-dot{width:6px;height:6px;border-radius:50%;background:#4CAF82;animation:pulse 1.5s infinite}
  .api-badge.error{background:#FFEEEE;color:#E07070}
  .api-dot.error{background:#E07070;animation:none}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  .loading{text-align:center;padding:60px;color:#aaa;font-size:14px}
  .loading-spinner{width:32px;height:32px;border:3px solid #E8E6E0;border-top-color:#C8A96E;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px}
  @keyframes spin{to{transform:rotate(360deg)}}
  .toast{position:fixed;bottom:24px;right:24px;background:#1C1C1E;color:#fff;padding:12px 20px;border-radius:10px;font-size:13.5px;font-weight:500;z-index:999;animation:slideUp .22s ease;box-shadow:0 8px 24px rgba(0,0,0,0.2)}
  .empty-state{text-align:center;padding:60px 20px;color:#bbb}
  .empty-state p{font-size:14px;margin-top:8px}

  /* PIE LEGEND */
  .pie-legend{display:flex;flex-direction:column;gap:10px;justify-content:center}
  .legend-item{display:flex;align-items:center;gap:8px;font-size:13px;color:#555}
  .legend-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
  .legend-val{margin-left:auto;font-weight:600;color:#1C1C1E;font-size:13px}
  .pie-wrap{display:flex;align-items:center;gap:24px}

  /* SALARY TABLE IN ANALYTICS */
  .salary-row{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid #F7F6F2}
  .salary-row:last-child{border-bottom:none}
  .salary-bar-wrap{flex:1;height:6px;background:#F0EEE9;border-radius:3px;overflow:hidden}
  .salary-bar{height:100%;border-radius:3px;transition:width .6s ease}
  .salary-label{font-size:13px;color:#555;width:110px;flex-shrink:0}
  .salary-amount{font-size:13px;font-weight:600;color:#1C1C1E;width:70px;text-align:right;flex-shrink:0}

  @media(max-width:900px){
    .sidebar{width:60px}
    .sidebar-logo h1,.sidebar-logo p,.nav-item span,.user-name,.user-role,.nav-label{display:none}
    .main{margin-left:60px;padding:24px 20px}
    .stats-grid,.analytics-grid,.analytics-grid-3{grid-template-columns:1fr}
    .chart-card.wide{grid-column:span 1}
  }
`;

const avatarColors = [
  ["#EEF3FF","#5B8BDF"],["#FFF5E6","#C8A96E"],["#EEF9F2","#4CAF82"],
  ["#F5EEF8","#9B72CF"],["#FFEEEE","#E07070"],["#E6F7FF","#3BA8D8"]
];

const getInitials = name => name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2);
const statusKey   = s => s?.replace(" ","") || "";

// ─────────────────────────────────────────────
// CUSTOM CHART TOOLTIP
// ─────────────────────────────────────────────
function CustomTooltip({ active, payload, label, prefix="", suffix="" }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="tooltip-label">{label}</div>
      <div className="tooltip-value">{prefix}{payload[0].value?.toLocaleString()}{suffix}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ANALYTICS PAGE
// All charts pull from real FastAPI data!
// ─────────────────────────────────────────────
function AnalyticsPage({ employees, stats }) {

  // ── CHART 1: Department headcount ───────────
  // MuleSoft: DataWeave groupBy + sizeOf
  const deptData = Object.entries(stats.department_breakdown || {}).map(([dept, count]) => ({
    dept, count, fill: DEPT_COLORS[dept] || "#999"
  }));

  // ── CHART 2: Status breakdown (Pie) ─────────
  const statusData = [
    { name: "Active",   value: employees.filter(e => e.status === "Active").length,   fill: "#4CAF82" },
    { name: "On Leave", value: employees.filter(e => e.status === "On Leave").length,  fill: "#C8A96E" },
    { name: "Inactive", value: employees.filter(e => e.status === "Inactive").length,  fill: "#E8E6E0" },
  ].filter(d => d.value > 0);

  // ── CHART 3: Avg salary per department ──────
  const salaryByDept = Object.keys(DEPT_COLORS).map(dept => {
    const deptEmps = employees.filter(e => e.department === dept);
    const avg = deptEmps.length
      ? Math.round(deptEmps.reduce((s,e) => s + Number(e.salary), 0) / deptEmps.length)
      : 0;
    return { dept, avg, fill: DEPT_COLORS[dept] };
  }).filter(d => d.avg > 0);

  const maxSalary = Math.max(...salaryByDept.map(d => d.avg));

  // ── CHART 4: Salary distribution bins ───────
  const bins = [
    { range: "<$60k",   min: 0,      max: 60000  },
    { range: "$60–75k", min: 60000,  max: 75000  },
    { range: "$75–90k", min: 75000,  max: 90000  },
    { range: ">$90k",   min: 90000,  max: Infinity},
  ].map(b => ({
    range: b.range,
    count: employees.filter(e => Number(e.salary) >= b.min && Number(e.salary) < b.max).length
  }));

  return (
    <>
      {/* ROW 1 — Bar chart (wide) + Pie chart */}
      <div className="analytics-grid">

        {/* Department Headcount — Bar Chart */}
        <div className="chart-card">
          <div className="chart-title">Headcount by Department</div>
          <div className="chart-sub">Total employees in each team</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={deptData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE9" vertical={false}/>
              <XAxis dataKey="dept" tick={{fontSize:12, fill:"#aaa"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:12, fill:"#aaa"}} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip content={<CustomTooltip suffix=" people"/>}/>
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {deptData.map((d,i) => <Cell key={i} fill={d.fill}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status Breakdown — Pie Chart */}
        <div className="chart-card">
          <div className="chart-title">Staff Status Breakdown</div>
          <div className="chart-sub">Active vs On Leave vs Inactive</div>
          <div className="pie-wrap">
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  dataKey="value" strokeWidth={0}>
                  {statusData.map((d,i) => <Cell key={i} fill={d.fill}/>)}
                </Pie>
                <Tooltip content={<CustomTooltip suffix=" staff"/>}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {statusData.map((d,i) => (
                <div key={i} className="legend-item">
                  <span className="legend-dot" style={{background:d.fill}}></span>
                  {d.name}
                  <span className="legend-val">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2 — Salary by dept + Salary distribution */}
      <div className="analytics-grid">

        {/* Avg Salary per Department — Custom bars */}
        <div className="chart-card">
          <div className="chart-title">Average Salary by Department</div>
          <div className="chart-sub">Compared across all teams</div>
          <div style={{marginTop:"8px"}}>
            {salaryByDept.sort((a,b) => b.avg-a.avg).map((d,i) => (
              <div key={i} className="salary-row">
                <span className="salary-label">{d.dept}</span>
                <div className="salary-bar-wrap">
                  <div className="salary-bar"
                    style={{width:`${(d.avg/maxSalary)*100}%`, background: d.fill}}/>
                </div>
                <span className="salary-amount">${(d.avg/1000).toFixed(0)}k</span>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Distribution — Line/Bar */}
        <div className="chart-card">
          <div className="chart-title">Salary Distribution</div>
          <div className="chart-sub">How salaries are spread across ranges</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bins} barSize={42}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EEE9" vertical={false}/>
              <XAxis dataKey="range" tick={{fontSize:11,fill:"#aaa"}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fontSize:12,fill:"#aaa"}} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip content={<CustomTooltip suffix=" employees"/>}/>
              <Bar dataKey="count" fill="#5B8BDF" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROW 3 — Top earners quick list */}
      <div className="chart-card" style={{marginBottom:"24px"}}>
        <div className="chart-title">Top 5 Earners</div>
        <div className="chart-sub">Highest paid employees across all departments</div>
        <table style={{marginTop:"8px"}}>
          <thead>
            <tr>
              <th>Employee</th><th>Department</th><th>Role</th><th>Salary</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {[...employees].sort((a,b) => Number(b.salary)-Number(a.salary)).slice(0,5).map((emp,i) => {
              const [bg,fg] = avatarColors[i % avatarColors.length];
              return (
                <tr key={emp.id}>
                  <td>
                    <div className="emp-info">
                      <div className="emp-avatar" style={{background:bg,color:fg}}>{getInitials(emp.name)}</div>
                      <div>
                        <div className="emp-name">{emp.name}</div>
                        <div className="emp-email">{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`dept-badge dept-${emp.department}`}>{emp.department}</span></td>
                  <td>{emp.role}</td>
                  <td style={{fontWeight:600,color:"#1C1C1E"}}>${Number(emp.salary).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge status-${statusKey(emp.status)}`}>
                      <span className={`status-dot status-dot-${statusKey(emp.status)}`}></span>
                      {emp.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [employees, setEmployees]   = useState([]);
  const [stats, setStats]           = useState({});
  const [loading, setLoading]       = useState(true);
  const [apiError, setApiError]     = useState(false);
  const [search, setSearch]         = useState("");
  const [activeDept, setActiveDept] = useState("All");
  const [showModal, setShowModal]   = useState(false);
  const [editEmp, setEditEmp]       = useState(null);
  const [form, setForm]             = useState(empty);
  const [activeNav, setActiveNav]   = useState("dashboard");  // ← Start on dashboard!
  const [toast, setToast]           = useState(null);
  const [saving, setSaving]         = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true); setApiError(false);
      const [empData, statsData] = await Promise.all([api.getAll(), api.getStats()]);
      setEmployees(empData.employees || []);
      setStats(statsData);
    } catch { setApiError(true); showToast("⚠️ Cannot reach FastAPI"); }
    finally  { setLoading(false); }
  }

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3500); }

  const filtered = employees.filter(e => {
    const matchDept   = activeDept === "All" || e.department === activeDept;
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  function openAdd()     { setForm(empty);  setEditEmp(null);    setShowModal(true); }
  function openEdit(emp) { setForm({...emp}); setEditEmp(emp.id); setShowModal(true); }
  function closeModal()  { setShowModal(false); setForm(empty); setEditEmp(null); }

  async function saveEmployee() {
    if (!form.name || !form.role || !form.email) { showToast("⚠️ Fill Name, Role and Email"); return; }
    try {
      setSaving(true);
      const payload = {...form, salary: Number(form.salary) || 0};
      if (editEmp) { await api.update(editEmp, payload); showToast("✅ Employee updated!"); }
      else         { await api.create(payload);           showToast("✅ Employee added!"); }
      closeModal(); loadData();
    } catch { showToast("❌ Error saving"); }
    finally  { setSaving(false); }
  }

  async function deleteEmployee(id, name) {
    if (!window.confirm(`Remove ${name}?`)) return;
    try { await api.delete(id); showToast(`🗑️ ${name} removed`); loadData(); }
    catch { showToast("❌ Error deleting"); }
  }

  const navItems = [
    { id:"dashboard", label:"Dashboard", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
    { id:"employees", label:"Employees", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id:"payroll",   label:"Payroll",   icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    { id:"reports",   label:"Reports",   icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="app">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h1>Work<span>Flow</span></h1>
            <p>HR Management</p>
          </div>
          <nav className="sidebar-nav">
            <div className="nav-label">Main</div>
            {navItems.map(n => (
              <div key={n.id} className={`nav-item ${activeNav===n.id?"active":""}`} onClick={() => setActiveNav(n.id)}>
                {n.icon}<span>{n.label}</span>
              </div>
            ))}
            <div className="nav-label">Settings</div>
            <div className={`nav-item ${activeNav==="settings"?"active":""}`} onClick={() => setActiveNav("settings")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              <span>Settings</span>
            </div>
          </nav>
          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">YO</div>
              <div><div className="user-name">You</div><div className="user-role">MuleSoft Dev</div></div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="main">
          <div className="topbar">
            <div className="topbar-left">
              <h2>{activeNav === "dashboard" ? "Analytics Dashboard" : "Employee Management"}</h2>
              <p>
                {stats.total_employees||0} employees · {stats.total_departments||0} departments
                {apiError
                  ? <span className="api-badge error"><span className="api-dot error"></span>API Disconnected</span>
                  : <span className="api-badge"><span className="api-dot"></span>FastAPI + PostgreSQL ✅</span>
                }
              </p>
            </div>
            <div className="topbar-right">
              {activeNav === "employees" && (
                <div className="search-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)}/>
                </div>
              )}
              <button className="btn-primary" onClick={openAdd}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Employee
              </button>
            </div>
          </div>

          {/* STAT CARDS — always visible */}
          <div className="stats-grid">
            {[
              { label:"Total Employees", value:stats.total_employees||0,  sub:"All departments", cls:"gold"  },
              { label:"Active Staff",    value:stats.active_employees||0, sub:`${(stats.total_employees||0)-(stats.active_employees||0)} away`, cls:"green" },
              { label:"Avg. Salary",     value:stats.average_salary ? `$${(stats.average_salary/1000).toFixed(0)}k` : "-", sub:"Across all roles", cls:"blue" },
              { label:"Departments",     value:stats.total_departments||0, sub:"Active teams", cls:"rose" },
            ].map((s,i) => (
              <div key={i} className={`stat-card ${s.cls}`}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* PAGE CONTENT */}
          {loading ? (
            <div className="loading"><div className="loading-spinner"></div>Loading from FastAPI + PostgreSQL...</div>
          ) : activeNav === "dashboard" ? (

            // ── ANALYTICS PAGE ─────────────────
            <AnalyticsPage employees={employees} stats={stats}/>

          ) : activeNav === "employees" ? (

            // ── EMPLOYEES TABLE ─────────────────
            <>
              <div className="filter-bar">
                {departments.map(d => (
                  <button key={d} className={`filter-chip ${activeDept===d?"active":""}`} onClick={() => setActiveDept(d)}>{d}</button>
                ))}
              </div>
              <div className="table-card">
                <div className="table-header-row">
                  <span className="table-title">All Employees</span>
                  <span className="table-count">{filtered.length} results</span>
                </div>
                <table>
                  <thead><tr>
                    <th>Employee</th><th>Role</th><th>Department</th>
                    <th>Salary</th><th>Status</th><th>Joined</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan="7"><div className="empty-state"><p>No employees found</p></div></td></tr>
                    ) : filtered.map((emp,i) => {
                      const [bg,fg] = avatarColors[i % avatarColors.length];
                      return (
                        <tr key={emp.id}>
                          <td>
                            <div className="emp-info">
                              <div className="emp-avatar" style={{background:bg,color:fg}}>{getInitials(emp.name)}</div>
                              <div><div className="emp-name">{emp.name}</div><div className="emp-email">{emp.email}</div></div>
                            </div>
                          </td>
                          <td>{emp.role}</td>
                          <td><span className={`dept-badge dept-${emp.department}`}>{emp.department}</span></td>
                          <td>${Number(emp.salary).toLocaleString()}</td>
                          <td>
                            <span className={`status-badge status-${statusKey(emp.status)}`}>
                              <span className={`status-dot status-dot-${statusKey(emp.status)}`}></span>
                              {emp.status}
                            </span>
                          </td>
                          <td>{emp.joined}</td>
                          <td>
                            <div className="action-btns">
                              <button className="btn-icon" onClick={() => openEdit(emp)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </button>
                              <button className="btn-icon delete" onClick={() => deleteEmployee(emp.id, emp.name)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            // ── OTHER PAGES (coming soon) ───────
            <div className="empty-state" style={{padding:"80px 20px"}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{opacity:.2,margin:"0 auto 16px",display:"block"}}><rect x="3" y="3" width="18" height="18" rx="3"/></svg>
              <p style={{fontSize:"16px",color:"#bbb"}}>"{activeNav}" page coming soon!</p>
              <p style={{fontSize:"13px",color:"#ddd",marginTop:"8px"}}>We're building this together 🚀</p>
            </div>
          )}
        </main>

        {/* ADD / EDIT MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={e => e.target===e.currentTarget && closeModal()}>
            <div className="modal">
              <div className="modal-head">
                <div>
                  <h3>{editEmp ? "Edit Employee" : "Add New Employee"}</h3>
                  <p>{editEmp ? `→ PUT /api/employees/${editEmp}` : "→ POST /api/employees"}</p>
                </div>
                <button className="btn-close" onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group"><label>Full Name</label><input placeholder="John Smith" value={form.name} onChange={e => setForm({...form,name:e.target.value})}/></div>
                  <div className="form-group"><label>Email</label><input placeholder="john@company.com" value={form.email} onChange={e => setForm({...form,email:e.target.value})}/></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Role</label><input placeholder="Senior Developer" value={form.role} onChange={e => setForm({...form,role:e.target.value})}/></div>
                  <div className="form-group"><label>Salary ($)</label><input type="number" placeholder="75000" value={form.salary} onChange={e => setForm({...form,salary:e.target.value})}/></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label>Department</label>
                    <select value={form.department} onChange={e => setForm({...form,department:e.target.value})}>
                      {deptOptions.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Status</label>
                    <select value={form.status} onChange={e => setForm({...form,status:e.target.value})}>
                      {statusOptions.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group"><label>Join Date</label><input type="date" value={form.joined} onChange={e => setForm({...form,joined:e.target.value})}/></div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button className="btn-save" onClick={saveEmployee} disabled={saving}>
                  {saving ? "Saving..." : editEmp ? "Save Changes" : "Add Employee"}
                </button>
              </div>
            </div>
          </div>
        )}

        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}
