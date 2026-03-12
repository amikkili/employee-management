import { useState, useEffect, useRef } from "react";

// ──────────────────────────────────────────────
// AIChatPage.jsx — AI HR Assistant Chat UI
// NEW FILE → save as src/AIChatPage.jsx
//
// Connects to: POST /api/ai/chat on your FastAPI
// Uses: JWT token from localStorage
// ──────────────────────────────────────────────

const API_BASE = "https://employee-api-f3hl.onrender.com";
const getToken = () => localStorage.getItem("jwt_token");

const chatStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  .chat-page {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 72px);
    max-height: 100%;
  }

  /* ── HEADER ── */
  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0 24px 0;
    flex-shrink: 0;
  }
  .chat-header-left h2 {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: #1C1C1E;
    letter-spacing: -0.5px;
  }
  .chat-header-left p {
    font-size: 13.5px;
    color: #888;
    margin-top: 4px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ai-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #EEF9F2;
    color: #4CAF82;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 500;
  }
  .ai-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4CAF82;
    animation: pulse 1.5s infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

  /* ── SUGGESTIONS ── */
  .suggestions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 20px;
    flex-shrink: 0;
  }
  .suggestion-chip {
    padding: 7px 14px;
    border-radius: 20px;
    border: 1.5px solid #E8E6E0;
    background: #fff;
    font-size: 12.5px;
    color: #555;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all .15s;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .suggestion-chip:hover {
    border-color: #C8A96E;
    color: #C8A96E;
    background: #FFF9F0;
  }
  .suggestion-chip svg {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }

  /* ── CHAT CONTAINER ── */
  .chat-container {
    flex: 1;
    overflow-y: auto;
    background: #fff;
    border-radius: 16px;
    border: 1.5px solid #EDECEA;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 16px;
    scroll-behavior: smooth;
  }
  .chat-container::-webkit-scrollbar { width: 4px; }
  .chat-container::-webkit-scrollbar-track { background: transparent; }
  .chat-container::-webkit-scrollbar-thumb { background: #E8E6E0; border-radius: 2px; }

  /* ── MESSAGES ── */
  .message-row {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    animation: slideUp .22s ease;
  }
  @keyframes slideUp { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
  .message-row.user { flex-direction: row-reverse; }

  .msg-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 12px;
    font-weight: 600;
  }
  .msg-avatar.ai {
    background: #EEF9F2;
  }
  .msg-avatar.ai svg { width: 16px; height: 16px; color: #4CAF82; }
  .msg-avatar.user {
    background: linear-gradient(135deg, #C8A96E, #e0c48a);
    color: #1C1C1E;
  }

  .msg-bubble {
    max-width: 72%;
    padding: 12px 16px;
    border-radius: 4px 16px 16px 16px;
    font-size: 13.5px;
    line-height: 1.65;
    color: #333;
    background: #F7F6F2;
    border: 1.5px solid #EDECEA;
  }
  .message-row.user .msg-bubble {
    background: #1C1C1E;
    color: #fff;
    border-color: #1C1C1E;
    border-radius: 16px 4px 16px 16px;
  }
  .msg-time {
    font-size: 11px;
    color: #bbb;
    margin-top: 5px;
    text-align: right;
  }
  .message-row.user .msg-time { text-align: left; }

  /* ── TYPING INDICATOR ── */
  .typing-bubble {
    background: #F7F6F2;
    border: 1.5px solid #EDECEA;
    border-radius: 4px 16px 16px 16px;
    padding: 14px 18px;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .typing-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #C8A96E;
    animation: bounce .9s infinite;
  }
  .typing-dot:nth-child(2) { animation-delay: .15s; }
  .typing-dot:nth-child(3) { animation-delay: .30s; }
  @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }

  /* ── WELCOME STATE ── */
  .welcome-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px;
    color: #aaa;
  }
  .welcome-icon {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #EEF9F2;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }
  .welcome-icon svg { width: 26px; height: 26px; color: #4CAF82; }
  .welcome-state h3 {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    color: #1C1C1E;
    margin-bottom: 8px;
  }
  .welcome-state p {
    font-size: 13.5px;
    color: #999;
    line-height: 1.6;
    max-width: 360px;
  }

  /* ── INPUT BAR ── */
  .input-bar {
    display: flex;
    gap: 10px;
    align-items: flex-end;
    flex-shrink: 0;
  }
  .input-wrap {
    flex: 1;
    background: #fff;
    border: 1.5px solid #E8E6E0;
    border-radius: 14px;
    display: flex;
    align-items: center;
    padding: 4px 4px 4px 16px;
    transition: border-color .18s;
    gap: 8px;
  }
  .input-wrap:focus-within { border-color: #C8A96E; }
  .input-wrap textarea {
    flex: 1;
    border: none;
    outline: none;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    color: #1a1a1a;
    background: transparent;
    resize: none;
    padding: 8px 0;
    max-height: 100px;
    line-height: 1.5;
  }
  .input-wrap textarea::placeholder { color: #bbb; }
  .btn-send {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: #1C1C1E;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: all .18s;
  }
  .btn-send:hover { background: #333; transform: translateY(-1px); }
  .btn-send:disabled { opacity: .4; cursor: not-allowed; transform: none; }
  .btn-send svg { width: 16px; height: 16px; color: #fff; }

  .input-hint {
    font-size: 11.5px;
    color: #ccc;
    text-align: center;
    margin-top: 8px;
  }

  /* ── ERROR ── */
  .msg-error {
    font-size: 12.5px;
    color: #E07070;
    background: #FFF0F0;
    border: 1.5px solid #FFD0D0;
    border-radius: 10px;
    padding: 10px 14px;
    margin-top: 4px;
  }

  /* ── CLEAR BUTTON ── */
  .btn-clear {
    padding: 8px 16px;
    border-radius: 10px;
    border: 1.5px solid #E8E6E0;
    background: #fff;
    font-size: 12.5px;
    color: #999;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all .15s;
    white-space: nowrap;
  }
  .btn-clear:hover { border-color: #E07070; color: #E07070; }
`;

// Suggested questions — clicking sends them automatically
const SUGGESTIONS = [
  { label: "Who earns the most?",          q: "Who earns the most in the company?",             icon: "trophy"   },
  { label: "How many on leave?",            q: "How many employees are on leave right now?",      icon: "calendar" },
  { label: "Avg salary by department?",     q: "What is the average salary per department?",      icon: "chart"    },
  { label: "List Engineering team",         q: "List all employees in Engineering department",    icon: "users"    },
  { label: "Who joined most recently?",     q: "Who joined the company most recently?",           icon: "clock"    },
  { label: "Total salary budget?",          q: "What is the total salary budget for the company?", icon: "dollar"  },
];

const ICONS = {
  trophy:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  chart:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  users:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  clock:    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  dollar:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
};

const getInitials = name => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) || "U";
const getTime     = ()   => new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });

export default function AIChatPage({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef(null);
  const textareaRef             = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea as user types
  function handleInput(e) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px";
  }

  // ──────────────────────────────────────────
  // SEND MESSAGE — calls POST /api/ai/chat
  // MuleSoft analogy: HTTP Request connector
  // sending question to AI with JWT token header
  // ──────────────────────────────────────────
  async function sendMessage(question) {
    const q = (question || input).trim();
    if (!q || loading) return;

    // Add user message to chat
    const userMsg = { role: "user", text: q, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setLoading(true);

    try {
      const res  = await fetch(`${API_BASE}/api/ai/chat`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${getToken()}`   // ← JWT token!
        },
        body: JSON.stringify({ question: q })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "API error");
      }

      // Add AI response to chat
      setMessages(prev => [...prev, {
        role: "ai",
        text: data.answer,
        time: getTime()
      }]);

    } catch (err) {
      setMessages(prev => [...prev, {
        role:  "ai",
        text:  null,
        error: err.message || "Could not reach AI service",
        time:  getTime()
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    // Enter = send, Shift+Enter = new line
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([]);
  }

  return (
    <>
      <style>{chatStyles}</style>
      <div className="chat-page">

        {/* HEADER */}
        <div className="chat-header">
          <div className="chat-header-left">
            <h2>AI HR Assistant</h2>
            <p>
              Ask anything about your employees
              <span className="ai-badge">
                <span className="ai-dot"></span>
                Groq · Llama 3.3
              </span>
            </p>
          </div>
          {messages.length > 0 && (
            <button className="btn-clear" onClick={clearChat}>
              Clear chat
            </button>
          )}
        </div>

        {/* SUGGESTION CHIPS */}
        <div className="suggestions">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="suggestion-chip" onClick={() => sendMessage(s.q)}>
              {ICONS[s.icon]}
              {s.label}
            </button>
          ))}
        </div>

        {/* CHAT MESSAGES */}
        <div className="chat-container">

          {/* Welcome state — shown when no messages */}
          {messages.length === 0 && !loading && (
            <div className="welcome-state">
              <div className="welcome-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
              </div>
              <h3>How can I help you today?</h3>
              <p>Ask me anything about your employees — salaries, departments, headcount, or anything else!</p>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, i) => (
            <div key={i} className={`message-row ${msg.role}`}>
              <div className={`msg-avatar ${msg.role}`}>
                {msg.role === "ai"
                  ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                  : getInitials(user?.name || "AU")
                }
              </div>
              <div>
                {msg.error ? (
                  <div className="msg-error">⚠️ {msg.error}</div>
                ) : (
                  <div className="msg-bubble">{msg.text}</div>
                )}
                <div className="msg-time">{msg.time}</div>
              </div>
            </div>
          ))}

          {/* Typing indicator — shows while AI is thinking */}
          {loading && (
            <div className="message-row ai">
              <div className="msg-avatar ai">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              </div>
              <div className="typing-bubble">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}

          {/* Auto-scroll anchor */}
          <div ref={bottomRef}/>
        </div>

        {/* INPUT BAR */}
        <div>
          <div className="input-bar">
            <div className="input-wrap">
              <textarea
                ref={textareaRef}
                placeholder="Ask anything about your employees..."
                value={input}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                rows={1}
              />
            </div>
            <button
              className="btn-send"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <div className="input-hint">
            Press Enter to send · Shift+Enter for new line
          </div>
        </div>

      </div>
    </>
  );
}
