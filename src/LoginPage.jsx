// ──────────────────────────────────────────────
// LoginPage.jsx — Brand new file, add to src/
//
// This is a completely NEW component.
// Nothing in your existing App.jsx changes yet.
// We connect it to App.jsx in the next step.
// ──────────────────────────────────────────────

const API_BASE = "https://employee-api-f3hl.onrender.com";

const loginStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .login-page {
    min-height: 100vh;
    display: flex;
    background: #F7F6F2;
  }

  /* LEFT PANEL — Branding */
  .login-left {
    width: 45%;
    background: #1C1C1E;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px;
    position: relative;
    overflow: hidden;
  }
  .login-left::before {
    content: '';
    position: absolute;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(200,169,110,0.15), transparent);
    top: -100px; right: -100px;
    border-radius: 50%;
  }
  .login-left::after {
    content: '';
    position: absolute;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(200,169,110,0.08), transparent);
    bottom: -50px; left: -50px;
    border-radius: 50%;
  }
  .login-brand h1 {
    font-family: 'Playfair Display', serif;
    font-size: 36px; color: #fff; font-weight: 700;
    margin-bottom: 12px;
  }
  .login-brand h1 span { color: #C8A96E; }
  .login-brand p {
    font-size: 15px; color: rgba(255,255,255,0.45);
    line-height: 1.7; max-width: 320px;
  }
  .login-features { margin-top: 48px; display: flex; flex-direction: column; gap: 20px; }
  .login-feature  { display: flex; align-items: center; gap: 14px; }
  .feature-icon   {
    width: 36px; height: 36px; border-radius: 9px;
    background: rgba(200,169,110,0.15);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .feature-icon svg { width: 16px; height: 16px; color: #C8A96E; }
  .feature-text p  { font-size: 13.5px; font-weight: 500; color: rgba(255,255,255,0.8); }
  .feature-text span { font-size: 12px; color: rgba(255,255,255,0.35); }

  /* RIGHT PANEL — Form */
  .login-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
  }
  .login-card {
    width: 100%; max-width: 400px;
  }
  .login-card h2 {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 700; color: #1C1C1E;
    margin-bottom: 6px;
  }
  .login-card p { font-size: 14px; color: #999; margin-bottom: 32px; }

  .login-tabs {
    display: flex; gap: 0;
    background: #F0EEE9;
    border-radius: 10px; padding: 4px;
    margin-bottom: 28px;
  }
  .login-tab {
    flex: 1; padding: 8px; border: none; background: transparent;
    border-radius: 8px; font-size: 13.5px; font-weight: 500;
    color: #999; cursor: pointer; font-family: 'DM Sans', sans-serif;
    transition: all .18s;
  }
  .login-tab.active { background: #fff; color: #1C1C1E; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }

  .login-form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
  .login-form-group label { font-size: 12px; font-weight: 600; color: #666; text-transform: uppercase; letter-spacing: .5px; }
  .login-form-group input {
    padding: 12px 14px; border: 1.5px solid #E8E6E0;
    border-radius: 10px; font-size: 14px; color: #1a1a1a;
    font-family: 'DM Sans', sans-serif; outline: none;
    transition: border-color .18s; background: #fff;
  }
  .login-form-group input:focus { border-color: #C8A96E; }

  .btn-login {
    width: 100%; padding: 13px; border: none;
    background: #1C1C1E; color: #fff; border-radius: 10px;
    font-size: 14px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif; transition: all .18s;
    margin-top: 8px;
  }
  .btn-login:hover { background: #333; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  .btn-login:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  .login-error {
    background: #FFF0F0; border: 1.5px solid #FFDDDD;
    border-radius: 10px; padding: 12px 14px;
    font-size: 13px; color: #E07070; margin-bottom: 16px;
  }
  .login-success {
    background: #EEF9F2; border: 1.5px solid #C3EACF;
    border-radius: 10px; padding: 12px 14px;
    font-size: 13px; color: #4CAF82; margin-bottom: 16px;
  }
  .login-hint {
    background: #FFF9F0; border: 1.5px solid #F0E5D0;
    border-radius: 10px; padding: 12px 14px; margin-top: 20px;
  }
  .login-hint p { font-size: 12.5px; color: #C8A96E; font-weight: 500; margin-bottom: 4px; }
  .login-hint span { font-size: 12px; color: #aaa; }

  @media(max-width: 768px) {
    .login-left { display: none; }
    .login-right { padding: 24px; }
  }
`;

export default function LoginPage({ onLoginSuccess }) {
  const [tab, setTab]           = useState("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  // ──────────────────────────────────────────
  // LOGIN — calls POST /auth/login
  // Gets JWT token back → passes to App.jsx
  //
  // MuleSoft analogy:
  // Like calling OAuth2 token endpoint and
  // storing the access_token for future calls
  // ──────────────────────────────────────────
  async function handleLogin() {
    if (!email || !password) { setError("Please enter email and password"); return; }
    try {
      setLoading(true); setError("");
      const res  = await fetch(`${API_BASE}/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) { setError(data.detail || "Login failed"); return; }

      // ✅ Store token in localStorage
      // MuleSoft analogy: Like storing OAuth token
      // for use in subsequent HTTP Request connectors
      localStorage.setItem("jwt_token", data.access_token);
      localStorage.setItem("user_name", data.user.name);
      localStorage.setItem("user_email", data.user.email);

      // Tell App.jsx login was successful
      onLoginSuccess(data.access_token, data.user);

    } catch (err) {
      setError("Cannot reach server — is FastAPI running?");
    } finally {
      setLoading(false);
    }
  }

  // ──────────────────────────────────────────
  // REGISTER — calls POST /auth/register
  // Creates new user in PostgreSQL
  // ──────────────────────────────────────────
  async function handleRegister() {
    if (!email || !password || !name) { setError("Please fill all fields"); return; }
    try {
      setLoading(true); setError(""); setSuccess("");
      const res  = await fetch(`${API_BASE}/auth/register`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password, name })
      });
      const data = await res.json();

      if (!res.ok) { setError(data.detail || "Registration failed"); return; }

      setSuccess("Account created! Please login now.");
      setTab("login");
      setName(""); setPassword("");

    } catch (err) {
      setError("Cannot reach server");
    } finally {
      setLoading(false);
    }
  }

  // Import useState here since this is a separate file
  const { useState } = window.React || {};

  return (
    <>
      <style>{loginStyles}</style>
      <div className="login-page">

        {/* LEFT — Branding panel */}
        <div className="login-left">
          <div className="login-brand">
            <h1>Work<span>Flow</span></h1>
            <p>Your complete HR management platform. Manage employees, track performance, and analyze your team.</p>
          </div>
          <div className="login-features">
            {[
              { label:"Employee Management", sub:"Full CRUD operations", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
              { label:"Analytics Dashboard", sub:"Charts & real-time stats", icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
              { label:"Secure JWT Auth",     sub:"Token-based security",    icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
              { label:"PostgreSQL Database", sub:"Real persistent storage",  icon:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg> },
            ].map((f,i) => (
              <div key={i} className="login-feature">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-text"><p>{f.label}</p><span>{f.sub}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Login/Register form */}
        <div className="login-right">
          <div className="login-card">
            <h2>{tab === "login" ? "Welcome back" : "Create account"}</h2>
            <p>{tab === "login" ? "Sign in to your HR dashboard" : "Register to access WorkFlow"}</p>

            {/* Tabs */}
            <div className="login-tabs">
              <button className={`login-tab ${tab==="login"?"active":""}`} onClick={() => { setTab("login"); setError(""); setSuccess(""); }}>Login</button>
              <button className={`login-tab ${tab==="register"?"active":""}`} onClick={() => { setTab("register"); setError(""); setSuccess(""); }}>Register</button>
            </div>

            {/* Error / Success messages */}
            {error   && <div className="login-error">⚠️ {error}</div>}
            {success && <div className="login-success">✅ {success}</div>}

            {/* Name field — only for Register */}
            {tab === "register" && (
              <div className="login-form-group">
                <label>Full Name</label>
                <input placeholder="John Smith" value={name} onChange={e => setName(e.target.value)}/>
              </div>
            )}

            <div className="login-form-group">
              <label>Email</label>
              <input type="email" placeholder="admin@company.com" value={email} onChange={e => setEmail(e.target.value)}/>
            </div>

            <div className="login-form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (tab==="login" ? handleLogin() : handleRegister())}
              />
            </div>

            <button className="btn-login" disabled={loading}
              onClick={tab === "login" ? handleLogin : handleRegister}>
              {loading ? "Please wait..." : tab === "login" ? "Sign In →" : "Create Account →"}
            </button>

            {/* Default credentials hint */}
            {tab === "login" && (
              <div className="login-hint">
                <p>🔑 Default credentials</p>
                <span>Email: admin@company.com · Password: admin123</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
