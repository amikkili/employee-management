import { useState, useEffect } from "react";

const initialEmployees = [
  { id: 1, name: "Sarah Mitchell", role: "Senior Developer", department: "Engineering", salary: 85000, status: "Active", email: "sarah@company.com", joined: "2020-03-15" },
  { id: 2, name: "James Okafor", role: "MuleSoft Architect", department: "Integration", salary: 95000, status: "Active", email: "james@company.com", joined: "2019-07-22" },
  { id: 3, name: "Priya Sharma", role: "Data Analyst", department: "Analytics", salary: 72000, status: "Active", email: "priya@company.com", joined: "2021-01-10" },
  { id: 4, name: "Tom Henderson", role: "Product Manager", department: "Product", salary: 90000, status: "On Leave", email: "tom@company.com", joined: "2018-11-05" },
  { id: 5, name: "Aisha Patel", role: "UX Designer", department: "Design", salary: 78000, status: "Active", email: "aisha@company.com", joined: "2022-04-18" },
  { id: 6, name: "Carlos Mendez", role: "DevOps Engineer", department: "Engineering", salary: 88000, status: "Active", email: "carlos@company.com", joined: "2020-09-01" },
];

const departments = ["All", "Engineering", "Integration", "Analytics", "Product", "Design"];
const statusOptions = ["Active", "On Leave", "Inactive"];
const departmentOptions = ["Engineering", "Integration", "Analytics", "Product", "Design"];

const empty = { name: "", role: "", department: "Engineering", salary: "", status: "Active", email: "", joined: "" };

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body { font-family: 'DM Sans', sans-serif; background: #F7F6F2; color: #1a1a1a; }

  .app { min-height: 100vh; background: #F7F6F2; }

  /* SIDEBAR */
  .sidebar {
    position: fixed; top: 0; left: 0; width: 230px; height: 100vh;
    background: #1C1C1E; display: flex; flex-direction: column;
    padding: 0; z-index: 100;
  }
  .sidebar-logo {
    padding: 28px 24px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .sidebar-logo h1 {
    font-family: 'Playfair Display', serif;
    font-size: 20px; color: #fff; font-weight: 700; letter-spacing: -0.3px;
  }
  .sidebar-logo span { color: #C8A96E; }
  .sidebar-logo p { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 3px; letter-spacing: 0.5px; text-transform: uppercase; }

  .sidebar-nav { padding: 20px 12px; flex: 1; }
  .nav-label { font-size: 10px; color: rgba(255,255,255,0.25); letter-spacing: 1.5px; text-transform: uppercase; padding: 0 12px; margin-bottom: 8px; margin-top: 16px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px; cursor: pointer;
    color: rgba(255,255,255,0.45); font-size: 13.5px; font-weight: 400;
    transition: all 0.18s ease; margin-bottom: 2px;
  }
  .nav-item:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }
  .nav-item.active { background: rgba(200,169,110,0.15); color: #C8A96E; font-weight: 500; }
  .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }

  .sidebar-footer {
    padding: 16px 12px;
    border-top: 1px solid rgba(255,255,255,0.08);
  }
  .user-card {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px;
  }
  .user-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    background: linear-gradient(135deg, #C8A96E, #e0c48a);
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600; color: #1C1C1E; flex-shrink: 0;
  }
  .user-name { font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.7); }
  .user-role { font-size: 11px; color: rgba(255,255,255,0.3); }

  /* MAIN */
  .main { margin-left: 230px; padding: 36px 40px; }

  /* TOP BAR */
  .topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; }
  .topbar-left h2 { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: #1C1C1E; letter-spacing: -0.5px; }
  .topbar-left p { font-size: 13.5px; color: #888; margin-top: 4px; }
  .topbar-right { display: flex; align-items: center; gap: 12px; }

  .search-box {
    display: flex; align-items: center; gap: 8px;
    background: #fff; border: 1.5px solid #E8E6E0;
    border-radius: 10px; padding: 9px 14px; width: 240px;
    transition: border-color 0.18s;
  }
  .search-box:focus-within { border-color: #C8A96E; }
  .search-box svg { color: #aaa; width: 15px; height: 15px; flex-shrink: 0; }
  .search-box input { border: none; outline: none; font-size: 13.5px; color: #1a1a1a; background: transparent; width: 100%; font-family: 'DM Sans', sans-serif; }
  .search-box input::placeholder { color: #bbb; }

  .btn-primary {
    display: flex; align-items: center; gap: 7px;
    background: #1C1C1E; color: #fff; border: none;
    padding: 10px 18px; border-radius: 10px; cursor: pointer;
    font-size: 13.5px; font-weight: 500; font-family: 'DM Sans', sans-serif;
    transition: all 0.18s ease;
  }
  .btn-primary:hover { background: #333; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  .btn-primary svg { width: 15px; height: 15px; }

  /* STATS */
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .stat-card {
    background: #fff; border-radius: 14px; padding: 22px 24px;
    border: 1.5px solid #EDECEA; position: relative; overflow: hidden;
    transition: transform 0.18s, box-shadow 0.18s;
  }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.07); }
  .stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  }
  .stat-card.gold::before { background: #C8A96E; }
  .stat-card.green::before { background: #4CAF82; }
  .stat-card.blue::before { background: #5B8BDF; }
  .stat-card.rose::before { background: #E07070; }

  .stat-label { font-size: 11.5px; color: #999; text-transform: uppercase; letter-spacing: 0.8px; font-weight: 500; }
  .stat-value { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: #1C1C1E; margin: 6px 0 2px; line-height: 1; }
  .stat-sub { font-size: 12px; color: #aaa; }

  /* FILTER BAR */
  .filter-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
  .filter-chip {
    padding: 6px 14px; border-radius: 20px; border: 1.5px solid #E8E6E0;
    background: #fff; font-size: 12.5px; color: #666; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-weight: 400;
    transition: all 0.15s;
  }
  .filter-chip:hover { border-color: #C8A96E; color: #C8A96E; }
  .filter-chip.active { background: #1C1C1E; border-color: #1C1C1E; color: #fff; font-weight: 500; }

  /* TABLE */
  .table-card { background: #fff; border-radius: 16px; border: 1.5px solid #EDECEA; overflow: hidden; }
  .table-header-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 24px; border-bottom: 1.5px solid #F0EEE9;
  }
  .table-title { font-size: 15px; font-weight: 600; color: #1C1C1E; }
  .table-count { font-size: 12.5px; color: #aaa; background: #F7F6F2; padding: 3px 10px; border-radius: 20px; }

  table { width: 100%; border-collapse: collapse; }
  thead th {
    text-align: left; padding: 12px 20px;
    font-size: 11px; font-weight: 600; color: #aaa;
    text-transform: uppercase; letter-spacing: 0.8px;
    background: #FAFAF8; border-bottom: 1.5px solid #F0EEE9;
  }
  tbody tr { transition: background 0.12s; border-bottom: 1px solid #F7F6F2; }
  tbody tr:hover { background: #FAFAF8; }
  tbody tr:last-child { border-bottom: none; }
  td { padding: 14px 20px; font-size: 13.5px; color: #333; vertical-align: middle; }

  .emp-info { display: flex; align-items: center; gap: 12px; }
  .emp-avatar {
    width: 36px; height: 36px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600; flex-shrink: 0;
  }
  .emp-name { font-weight: 500; color: #1C1C1E; font-size: 13.5px; }
  .emp-email { font-size: 12px; color: #aaa; }

  .dept-badge {
    display: inline-block; padding: 3px 10px; border-radius: 6px;
    font-size: 11.5px; font-weight: 500;
  }
  .dept-Engineering { background: #EEF3FF; color: #5B8BDF; }
  .dept-Integration { background: #FFF5E6; color: #C8A96E; }
  .dept-Analytics   { background: #EEF9F2; color: #4CAF82; }
  .dept-Product     { background: #F5EEF8; color: #9B72CF; }
  .dept-Design      { background: #FFEEEE; color: #E07070; }

  .status-badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;
  }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; }
  .status-Active    { background: #EEF9F2; color: #4CAF82; }
  .status-dot-Active { background: #4CAF82; }
  .status-On.Leave  { background: #FFF5E6; color: #C8A96E; }
  .status-dot-OnLeave { background: #C8A96E; }
  .status-Inactive  { background: #F5F5F5; color: #aaa; }
  .status-dot-Inactive { background: #ccc; }

  .action-btns { display: flex; gap: 6px; }
  .btn-icon {
    width: 30px; height: 30px; border-radius: 7px; border: 1.5px solid #E8E6E0;
    background: #fff; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s; color: #888;
  }
  .btn-icon:hover { border-color: #C8A96E; color: #C8A96E; background: #FFF9F0; }
  .btn-icon.delete:hover { border-color: #E07070; color: #E07070; background: #FFF0F0; }
  .btn-icon svg { width: 13px; height: 13px; }

  /* MODAL */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; backdrop-filter: blur(3px);
    animation: fadeIn 0.18s ease;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  .modal {
    background: #fff; border-radius: 18px; width: 520px; max-width: 95vw;
    box-shadow: 0 24px 60px rgba(0,0,0,0.18);
    animation: slideUp 0.22s ease;
    max-height: 90vh; overflow-y: auto;
  }
  .modal-head {
    padding: 26px 28px 20px; border-bottom: 1.5px solid #F0EEE9;
    display: flex; align-items: center; justify-content: space-between;
  }
  .modal-head h3 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #1C1C1E; }
  .modal-head p { font-size: 13px; color: #999; margin-top: 3px; }
  .btn-close {
    width: 32px; height: 32px; border-radius: 8px; border: 1.5px solid #E8E6E0;
    background: #fff; display: flex; align-items: center; justify-content: center;
    cursor: pointer; color: #888; transition: all 0.15s;
  }
  .btn-close:hover { background: #F7F6F2; }
  .btn-close svg { width: 14px; height: 14px; }

  .modal-body { padding: 24px 28px; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .form-group label { font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
  .form-group input, .form-group select {
    padding: 10px 14px; border: 1.5px solid #E8E6E0; border-radius: 9px;
    font-size: 13.5px; color: #1a1a1a; font-family: 'DM Sans', sans-serif;
    transition: border-color 0.18s; outline: none; background: #fff;
  }
  .form-group input:focus, .form-group select:focus { border-color: #C8A96E; }

  .modal-footer {
    padding: 16px 28px 24px; display: flex; gap: 10px; justify-content: flex-end;
  }
  .btn-cancel {
    padding: 10px 20px; border-radius: 10px; border: 1.5px solid #E8E6E0;
    background: #fff; font-size: 13.5px; color: #666; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-weight: 500; transition: all 0.15s;
  }
  .btn-cancel:hover { background: #F7F6F2; }
  .btn-save {
    padding: 10px 24px; border-radius: 10px; border: none;
    background: #1C1C1E; font-size: 13.5px; color: #fff; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-weight: 500; transition: all 0.18s;
  }
  .btn-save:hover { background: #333; }

  .empty-state { text-align: center; padding: 60px 20px; color: #bbb; }
  .empty-state svg { width: 40px; height: 40px; margin-bottom: 12px; opacity: 0.3; }
  .empty-state p { font-size: 14px; }

  @media (max-width: 900px) {
    .sidebar { width: 60px; }
    .sidebar-logo h1, .sidebar-logo p, .nav-item span, .user-name, .user-role, .nav-label { display: none; }
    .main { margin-left: 60px; padding: 24px 20px; }
    .stats-grid { grid-template-columns: 1fr 1fr; }
  }
`;

const avatarColors = [
  ["#EEF3FF","#5B8BDF"],["#FFF5E6","#C8A96E"],["#EEF9F2","#4CAF82"],
  ["#F5EEF8","#9B72CF"],["#FFEEEE","#E07070"],["#E6F7FF","#3BA8D8"]
];

function getInitials(name) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function App() {
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState("");
  const [activeDept, setActiveDept] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [form, setForm] = useState(empty);
  const [activeNav, setActiveNav] = useState("employees");

  const filtered = employees.filter(e => {
    const matchDept = activeDept === "All" || e.department === activeDept;
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === "Active").length,
    avgSalary: Math.round(employees.reduce((s, e) => s + e.salary, 0) / employees.length),
    departments: [...new Set(employees.map(e => e.department))].length
  };

  function openAdd() { setForm(empty); setEditEmp(null); setShowModal(true); }
  function openEdit(emp) { setForm({ ...emp }); setEditEmp(emp.id); setShowModal(true); }
  function closeModal() { setShowModal(false); setForm(empty); setEditEmp(null); }

  function saveEmployee() {
    if (!form.name || !form.role || !form.email) return;
    if (editEmp) {
      setEmployees(prev => prev.map(e => e.id === editEmp ? { ...form, id: editEmp } : e));
    } else {
      setEmployees(prev => [...prev, { ...form, id: Date.now(), salary: Number(form.salary) || 0 }]);
    }
    closeModal();
  }

  function deleteEmployee(id) {
    if (window.confirm("Remove this employee?")) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  }

  const statusKey = (s) => s.replace(" ", "");

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
            {[
              { id: "dashboard", label: "Dashboard", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
              { id: "employees", label: "Employees", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              { id: "payroll", label: "Payroll", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
              { id: "reports", label: "Reports", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
            ].map(n => (
              <div key={n.id} className={`nav-item ${activeNav === n.id ? "active" : ""}`} onClick={() => setActiveNav(n.id)}>
                {n.icon} <span>{n.label}</span>
              </div>
            ))}
            <div className="nav-label">Settings</div>
            {[
              { id: "settings", label: "Settings", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
            ].map(n => (
              <div key={n.id} className={`nav-item ${activeNav === n.id ? "active" : ""}`} onClick={() => setActiveNav(n.id)}>
                {n.icon} <span>{n.label}</span>
              </div>
            ))}
          </nav>
          <div className="sidebar-footer">
            <div className="user-card">
              <div className="user-avatar">YO</div>
              <div><div className="user-name">You</div><div className="user-role">MuleSoft Dev</div></div>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="main">
          <div className="topbar">
            <div className="topbar-left">
              <h2>Employee Management</h2>
              <p>Manage your team — {stats.total} employees across {stats.departments} departments</p>
            </div>
            <div className="topbar-right">
              <div className="search-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <button className="btn-primary" onClick={openAdd}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add Employee
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="stats-grid">
            {[
              { label: "Total Employees", value: stats.total, sub: "All departments", cls: "gold" },
              { label: "Active Staff", value: stats.active, sub: `${stats.total - stats.active} on leave/inactive`, cls: "green" },
              { label: "Avg. Salary", value: `$${(stats.avgSalary/1000).toFixed(0)}k`, sub: "Across all roles", cls: "blue" },
              { label: "Departments", value: stats.departments, sub: "Active teams", cls: "rose" },
            ].map((s, i) => (
              <div key={i} className={`stat-card ${s.cls}`}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* FILTER */}
          <div className="filter-bar">
            {departments.map(d => (
              <button key={d} className={`filter-chip ${activeDept === d ? "active" : ""}`} onClick={() => setActiveDept(d)}>{d}</button>
            ))}
          </div>

          {/* TABLE */}
          <div className="table-card">
            <div className="table-header-row">
              <span className="table-title">All Employees</span>
              <span className="table-count">{filtered.length} results</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="7">
                    <div className="empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                      <p>No employees found</p>
                    </div>
                  </td></tr>
                ) : filtered.map((emp, i) => {
                  const [bg, fg] = avatarColors[i % avatarColors.length];
                  return (
                    <tr key={emp.id}>
                      <td>
                        <div className="emp-info">
                          <div className="emp-avatar" style={{ background: bg, color: fg }}>{getInitials(emp.name)}</div>
                          <div>
                            <div className="emp-name">{emp.name}</div>
                            <div className="emp-email">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{emp.role}</td>
                      <td><span className={`dept-badge dept-${emp.department}`}>{emp.department}</span></td>
                      <td>${emp.salary.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge status-${statusKey(emp.status)}`}>
                          <span className={`status-dot status-dot-${statusKey(emp.status)}`}></span>
                          {emp.status}
                        </span>
                      </td>
                      <td>{emp.joined}</td>
                      <td>
                        <div className="action-btns">
                          <button className="btn-icon" onClick={() => openEdit(emp)} title="Edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button className="btn-icon delete" onClick={() => deleteEmployee(emp.id)} title="Delete">
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
        </main>

        {/* MODAL */}
        {showModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
            <div className="modal">
              <div className="modal-head">
                <div>
                  <h3>{editEmp ? "Edit Employee" : "Add New Employee"}</h3>
                  <p>{editEmp ? "Update employee information" : "Fill in the details below"}</p>
                </div>
                <button className="btn-close" onClick={closeModal}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input placeholder="e.g. John Smith" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input placeholder="john@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Role / Title</label>
                    <input placeholder="e.g. Senior Developer" value={form.role} onChange={e => setForm({...form, role: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Salary ($)</label>
                    <input type="number" placeholder="e.g. 75000" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Department</label>
                    <select value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                      {departmentOptions.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      {statusOptions.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Join Date</label>
                  <input type="date" value={form.joined} onChange={e => setForm({...form, joined: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button className="btn-save" onClick={saveEmployee}>{editEmp ? "Save Changes" : "Add Employee"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}