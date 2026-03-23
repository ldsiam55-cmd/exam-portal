import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, doc, getDoc, setDoc, deleteDoc,
  collection, query, where, getDocs,
} from "firebase/firestore";

// ─── Global styles ────────────────────────────────────────────────────────────
const GS = () => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    const s = document.createElement("style");
    s.textContent = `
      *{box-sizing:border-box;margin:0;padding:0;}
      body{background:#fff;font-family:'Plus Jakarta Sans',sans-serif;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes tPulse{0%,100%{opacity:1}50%{opacity:0.45}}
      @keyframes lbSlide{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
      .fu{animation:fadeUp .35s ease both;}
      .fu2{animation:fadeUp .35s ease .06s both;}
      .fu3{animation:fadeUp .35s ease .12s both;}
      .fi{animation:fadeIn .3s ease both;}
      .lb-r{animation:lbSlide .3s ease both;}
      .twarn{animation:tPulse 1s ease infinite;}
      .nav-item{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500;color:#555;transition:background .15s,color .15s;border:none;background:transparent;width:100%;text-align:left;font-family:'Plus Jakarta Sans',sans-serif;}
      .nav-item:hover{background:#f3f4f6;color:#111;}
      .nav-item.active{background:#111;color:#fff;}
      .card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px 22px;margin-bottom:12px;position:relative;overflow:hidden;transition:border-color .18s,box-shadow .18s;}
      .card:hover{border-color:#d1d5db;box-shadow:0 2px 12px rgba(0,0,0,.06);}
      .card-click{cursor:pointer;}
      .card-click:hover{border-color:#111;box-shadow:0 2px 16px rgba(0,0,0,.08);}
      .btn-primary{background:#111;color:#fff;border:none;padding:10px 22px;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s;}
      .btn-primary:hover{background:#333;}
      .btn-primary:disabled{background:#d1d5db;cursor:not-allowed;}
      .btn-outline{background:transparent;color:#111;border:1.5px solid #e5e7eb;padding:9px 20px;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s;}
      .btn-outline:hover{border-color:#111;}
      .btn-danger{background:transparent;color:#ef4444;border:1.5px solid #fecaca;padding:8px 16px;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;}
      .btn-danger:hover{background:#fef2f2;border-color:#ef4444;}
      .btn-warn{background:transparent;color:#f97316;border:1.5px solid #fed7aa;padding:8px 16px;border-radius:8px;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;}
      .btn-warn:hover{background:#fff7ed;border-color:#f97316;}
      .tab-pill{padding:7px 18px;border-radius:999px;border:1.5px solid #e5e7eb;background:transparent;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;color:#555;cursor:pointer;transition:all .15s;}
      .tab-pill:hover{border-color:#999;color:#111;}
      .tab-pill.active{background:#111;color:#fff;border-color:#111;}
      .inp{width:100%;background:#f9fafb;border:1.5px solid #e5e7eb;border-radius:10px;padding:11px 14px;font-size:15px;color:#111;font-family:'Plus Jakarta Sans',sans-serif;outline:none;transition:border-color .15s;}
      .inp:focus{border-color:#111;background:#fff;}
      .inp::placeholder{color:#9ca3af;}
      .drop-zone{border:2px dashed #e5e7eb;border-radius:10px;padding:28px 16px;text-align:center;cursor:pointer;transition:all .2s;}
      .drop-zone:hover{border-color:#111;background:#f9fafb;}
      .ropt{display:flex;align-items:center;gap:12px;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:10px;cursor:pointer;transition:all .15s;margin-bottom:8px;}
      .ropt:hover{border-color:#111;}
      .ropt.selected{border-color:#111;background:#f9fafb;}
      input[type=radio],input[type=checkbox]{accent-color:#111;}
      ::-webkit-scrollbar{width:4px;}
      ::-webkit-scrollbar-thumb{background:#e5e7eb;border-radius:4px;}
      ::-webkit-scrollbar-thumb:hover{background:#d1d5db;}
    `;
    document.head.appendChild(s);
    return () => { try { document.head.removeChild(link); document.head.removeChild(s); } catch {} };
  }, []);
  return null;
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  black: "#111111", gray8: "#374151", gray6: "#6b7280", gray4: "#9ca3af",
  gray2: "#e5e7eb", gray1: "#f3f4f6", gray0: "#f9fafb",
  blue: "#3b82f6", green: "#22c55e", orange: "#f97316", red: "#ef4444",
  greenBg: "#f0fdf4", blueBg: "#eff6ff", orangeBg: "#fff7ed", redBg: "#fef2f2",
  greenBorder: "#bbf7d0", blueBorder: "#bfdbfe", orangeBorder: "#fed7aa", redBorder: "#fecaca",
};

// ─── Shared primitives ────────────────────────────────────────────────────────
const fld = { marginBottom: "1rem" };
const lbl = { display: "block", fontSize: 12, fontWeight: 600, color: T.gray6, marginBottom: 6, letterSpacing: "0.02em" };
const dvd = { borderTop: "1px solid #e5e7eb", margin: "1.25rem 0" };
const mut = { color: T.gray4, fontSize: 13 };

function PrimaryBtn({ children, onClick, disabled, style = {} }) {
  return <button className="btn-primary" onClick={onClick} disabled={disabled} style={{ ...style }}>{children}</button>;
}
function OutlineBtn({ children, onClick, style = {} }) {
  return <button className="btn-outline" onClick={onClick} style={{ ...style }}>{children}</button>;
}

function Badge({ children, color = "blue" }) {
  const map = {
    blue:   [T.blue,   T.blueBg,   T.blueBorder],
    green:  [T.green,  T.greenBg,  T.greenBorder],
    orange: [T.orange, T.orangeBg, T.orangeBorder],
    red:    [T.red,    T.redBg,    T.redBorder],
    gray:   [T.gray6,  T.gray1,    T.gray2],
  };
  const [fg, bg, border] = map[color] || map.blue;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: bg, color: fg, border: `1px solid ${border}` }}>
      {children}
    </span>
  );
}

function PageHeader({ back, onBack, title, subtitle, action }) {
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      {back && (
        <button className="btn-outline" onClick={onBack} style={{ padding: "6px 14px", fontSize: 13, marginBottom: 14, display: "inline-flex", alignItems: "center", gap: 6 }}>
          ← {back}
        </button>
      )}
      {subtitle && <p style={{ fontSize: 12, fontWeight: 600, color: T.gray4, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>{subtitle}</p>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.black, letterSpacing: "-0.03em" }}>{title}</h1>
        {action}
      </div>
    </div>
  );
}

// Sidebar icon set
const ICONS = {
  exam:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
  create:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>,
  submit:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>,
  trophy:   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8M12 17v4M17 3H7l-4 4a5 5 0 007 5 5 5 0 007-5l-4-4z"/><path d="M3 7h18"/></svg>,
  student:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  lock:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  home:     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  results:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>,
};

// ─── File utilities ───────────────────────────────────────────────────────────
async function compressImg(file, maxPx = 1200, q = 0.76) {
  return new Promise(res => {
    const fr = new FileReader();
    fr.onload = e => {
      const img = new Image();
      img.onload = () => {
        let w = img.width, h = img.height;
        if (w > maxPx) { h = Math.round(h * maxPx / w); w = maxPx; }
        const c = document.createElement("canvas"); c.width = w; c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        res(c.toDataURL("image/jpeg", q));
      };
      img.src = e.target.result;
    };
    fr.readAsDataURL(file);
  });
}
async function readAnyFile(file) {
  if (file.type === "application/pdf") {
    return new Promise(res => { const fr = new FileReader(); fr.onload = e => res({ dataUrl: e.target.result, mimeType: "application/pdf", name: file.name }); fr.readAsDataURL(file); });
  }
  const dataUrl = await compressImg(file);
  return { dataUrl, mimeType: "image/jpeg", name: file.name };
}

function fmtTime(sec) {
  if (sec <= 0) return "00:00";
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function fmtCountdown(ms) {
  if (ms <= 0) return "Closed";
  const s = Math.floor(ms / 1000), m = Math.floor(s / 60), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h left`;
  if (h > 0) return `${h}h ${m % 60}m left`;
  if (m > 0) return `${m}m ${s % 60}s left`;
  return `${s}s left`;
}

// ─── Firebase config ──────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyBr-OyFMjWFuiNPlNX8idi__URoKoQrnhI",
  authDomain:        "exam-portal-ed7b3.firebaseapp.com",
  projectId:         "exam-portal-ed7b3",
  storageBucket:     "exam-portal-ed7b3.firebasestorage.app",
  messagingSenderId: "1061042020003",
  appId:             "1:1061042020003:web:8bddef131c508966d5a916",
};

const _app       = initializeApp(firebaseConfig);
const _db        = getFirestore(_app);
const COLL       = "portal";

const _enc = k => k.replace(/\//g, "~");
const _dec = id => id.replace(/~/g, "/");
const _pfx = k => { const i = k.indexOf(":"); return i >= 0 ? k.slice(0, i + 1) : k; };

const db = {
  async get(key) {
    try {
      const snap = await getDoc(doc(_db, COLL, _enc(key)));
      return snap.exists() ? snap.data().value : null;
    } catch(e) { console.error("db.get", e); return null; }
  },
  async set(key, value) {
    try {
      await setDoc(doc(_db, COLL, _enc(key)), {
        value, prefix: _pfx(key), updatedAt: Date.now(),
      });
    } catch(e) { console.error("db.set", e); }
  },
  async del(key) {
    try { await deleteDoc(doc(_db, COLL, _enc(key))); }
    catch(e) { console.error("db.del", e); }
  },
  async list(prefix) {
    try {
      const q    = query(collection(_db, COLL), where("prefix", "==", prefix));
      const snap = await getDocs(q);
      return snap.docs.map(d => _dec(d.id));
    } catch(e) { console.error("db.list", e); return []; }
  },
};

const uid  = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const PASS = "teacher123";
function gen5Code() { return String(Math.floor(10000 + Math.random() * 90000)); }

// ─── Layout shell ─────────────────────────────────────────────────────────────
function Shell({ sidebar, children, topbar }) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#fff" }}>
      <aside style={{ width: 230, flexShrink: 0, borderRight: "1px solid #f0f0f0", display: "flex", flexDirection: "column", padding: "18px 12px", overflowY: "auto", background: "#fafafa" }}>
        {sidebar}
      </aside>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {topbar && (
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 28px", borderBottom: "1px solid #f0f0f0", background: "#fff", flexShrink: 0 }}>
            {topbar}
          </header>
        )}
        <main style={{ flex: 1, overflowY: "auto", padding: "32px 28px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

function Logo({ onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 8px 20px", cursor: onClick ? "pointer" : "default" }}>
      <div style={{ width: 30, height: 30, background: "#111", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg>
      </div>
      <span style={{ fontWeight: 800, fontSize: 15, color: "#111", letterSpacing: "-0.02em" }}>Exam Portal</span>
    </div>
  );
}

function NavSection({ title, items, active, onSelect }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {title && <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: "0.07em", textTransform: "uppercase", padding: "0 12px", marginBottom: 4 }}>{title}</p>}
      {items.map(item => (
        <button key={item.id} className={`nav-item${active === item.id ? " active" : ""}`} onClick={() => onSelect(item.id)}>
          <span style={{ width: 16, height: 16, flexShrink: 0 }}>{ICONS[item.icon]}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", background: "#fff", minHeight: "100vh" }}>
      <GS />
      {screen === "home"    && <HomeScreen    onNav={setScreen} />}
      {screen === "student" && <StudentScreen onBack={() => setScreen("home")} />}
      {screen === "teacher" && <TeacherScreen onBack={() => setScreen("home")} />}
      {/* ── NEW: Results screen ── */}
      {screen === "results" && <StudentResultView onBack={() => setScreen("home")} />}
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function HomeScreen({ onNav }) {
  return (
    <Shell
      sidebar={
        <>
          <Logo />
          <NavSection title="Portals" items={[
            { id: "student", icon: "student", label: "Student" },
            { id: "teacher", icon: "lock",    label: "Teacher" },
            { id: "results", icon: "results", label: "My Results" },
          ]} active={null} onSelect={onNav} />
          <div style={{ marginTop: "auto", padding: "12px 8px", borderTop: "1px solid #f0f0f0" }}>
            <p style={{ fontSize: 12, color: "#9ca3af" }}>Teacher password: <strong style={{ color: "#374151" }}>teacher123</strong></p>
          </div>
        </>
      }
      topbar={
        <>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="tab-pill active">Overview</button>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Exam Portal</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-primary" onClick={() => onNav("student")}>Take an Exam</button>
          </div>
        </>
      }
    >
      <div className="fu" style={{ maxWidth: 580 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: T.gray4, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>Welcome</p>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: T.black, letterSpacing: "-0.04em", marginBottom: 10 }}>Digital Exam System</h1>
        <p style={{ fontSize: 15, color: T.gray6, lineHeight: 1.7, marginBottom: 32 }}>Upload questions, submit handwritten answers, and get graded — all in one place.</p>

        {/* ── UPDATED: 3-column grid with Results card ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {[
            { id: "student", icon: "student", title: "Student",    desc: "Enter your name, get your exam code, and submit answers",               cta: "Enter as Student", primary: true  },
            { id: "teacher", icon: "lock",    title: "Teacher",    desc: "Create exams, view submissions, grade answers and see leaderboards",     cta: "Teacher Login",    primary: false },
            { id: "results", icon: "results", title: "My Results", desc: "Enter your code to view scores, grade breakdown and answer analysis",    cta: "Check Results",    primary: false },
          ].map(({ id, icon, title, desc, cta, primary }) => (
            <div key={id} className="card card-click fu2" onClick={() => onNav(id)} style={{ padding: "24px" }}>
              <div style={{ width: 40, height: 40, background: primary ? "#111" : T.gray1, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <span style={{ width: 20, height: 20, color: primary ? "#fff" : T.gray6 }}>{ICONS[icon]}</span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: T.black, marginBottom: 6 }}>{title}</p>
              <p style={{ fontSize: 13, color: T.gray6, lineHeight: 1.6, marginBottom: 18 }}>{desc}</p>
              <button className={primary ? "btn-primary" : "btn-outline"} style={{ fontSize: 13, padding: "8px 16px" }}>{cta} →</button>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

// ─── Student screen ───────────────────────────────────────────────────────────
function StudentScreen({ onBack }) {
  const [step, setStep]       = useState("name");
  const [name, setName]       = useState("");
  const [genCode, setGenCode] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [exams, setExams]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [exam, setExam]       = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alreadySub, setAlreadySub] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);
  const codeRef  = useRef(null);

  async function loadExams() {
    setLoading(true);
    const keys = await db.list("exam:");
    const data = (await Promise.all(keys.map(k => db.get(k)))).filter(Boolean);
    const now = new Date();
    setExams(data.filter(e => e.active && (!e.submissionDeadline || new Date(e.submissionDeadline) > now)));
    setLoading(false);
  }
  function handleNameNext() {
    if (!name.trim()) return;
    const code = gen5Code();
    setGenCode(code); setCodeInput(""); setCodeErr(""); setStep("verify");
    setTimeout(() => codeRef.current?.focus(), 80);
  }
  function handleVerify() {
    if (codeInput.trim() === genCode) { loadExams(); setStep("exams"); }
    else setCodeErr("Code doesn't match. Please re-enter the exact 5-digit code shown above.");
  }
  async function startExam(e) {
    const keys = await db.list(`sub:${e.id}:`);
    const data = (await Promise.all(keys.map(k => db.get(k)))).filter(Boolean);
    const already = data.some(s => s.studentName.trim().toLowerCase() === name.trim().toLowerCase());
    setAlreadySub(already); setExam(e); setAnswers({});
    setTimeLeft(!already && e.duration && Number(e.duration) > 0 ? Number(e.duration) * 60 : null);
    setStep("take");
  }
  useEffect(() => {
    if (step !== "take" || timeLeft === null || alreadySub) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, step, alreadySub]);

  async function handleSubmit() {
    if (submitting || alreadySub) return;
    clearTimeout(timerRef.current); setSubmitting(true);
    const id = uid();
    const sub = { id, examId: exam.id, examTitle: exam.title, studentName: name, studentCode: genCode, submittedAt: Date.now(), answers, graded: false, grades: {}, totalScore: null };
    exam.questions.forEach(q => { if (q.answerType === "mcq") sub.grades[q.id] = answers[q.id]?.value === q.correct ? q.marks : 0; });
    await db.set(`sub:${exam.id}:${id}`, sub);
    setSubmitting(false); setStep("done");
  }
  const allAnswered = exam ? exam.questions.every(q => answers[q.id] !== undefined) : false;

  const sidebarStep = step === "take" ? "take" : step === "exams" ? "exams" : "entry";

  const sidebar = (
    <>
      <Logo onClick={onBack} />
      <NavSection title="Student" items={[
        { id: "entry", icon: "student", label: "Identity" },
        { id: "exams", icon: "exam",    label: "My Exams" },
        { id: "take",  icon: "submit",  label: "Take Exam" },
      ]} active={sidebarStep} onSelect={() => {}} />
      {name && (
        <div style={{ marginTop: "auto", padding: "12px 8px", borderTop: "1px solid #f0f0f0" }}>
          <p style={{ fontSize: 12, color: T.gray4, marginBottom: 2 }}>Signed in as</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: T.black }}>{name}</p>
          {genCode && <p style={{ fontSize: 12, fontWeight: 700, color: T.gray6, letterSpacing: "0.1em", marginTop: 2 }}>{genCode}</p>}
        </div>
      )}
    </>
  );

  if (step === "name") return (
    <Shell sidebar={sidebar} topbar={<><div style={{ display: "flex", gap: 8 }}><button className="tab-pill active">Identity</button></div><span /><OutlineBtn onClick={onBack}>← Home</OutlineBtn></>}>
      <div className="fu" style={{ maxWidth: 460 }}>
        <PageHeader subtitle="Student Portal" title="Enter Your Name" />
        <div className="card" style={{ padding: 28 }}>
          <div style={fld}><label style={lbl}>Full name</label><input className="inp" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && name.trim() && handleNameNext()} placeholder="Type your full name…" autoFocus /></div>
          <PrimaryBtn onClick={handleNameNext} disabled={!name.trim()}>Continue →</PrimaryBtn>
        </div>
      </div>
    </Shell>
  );

  if (step === "verify") return (
    <Shell sidebar={sidebar} topbar={<><div style={{ display: "flex", gap: 8 }}><button className="tab-pill active">Verify Code</button></div><span /><OutlineBtn onClick={() => setStep("name")}>← Back</OutlineBtn></>}>
      <div className="fu" style={{ maxWidth: 460 }}>
        <PageHeader subtitle="Identity Verification" title="Your Exam Code" />
        <div className="card" style={{ padding: 28 }}>
          <p style={{ fontSize: 14, color: T.gray6, marginBottom: 20 }}>A unique code has been assigned to <strong style={{ color: T.black }}>{name}</strong>. Write it down:</p>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "inline-block", fontFamily: "monospace", fontSize: 46, fontWeight: 800, letterSpacing: "0.25em", color: T.black, padding: "18px 32px", borderRadius: 14, border: "2px solid #111", background: T.gray0 }}>
              {genCode}
            </div>
            <p style={{ ...mut, marginTop: 10 }}>Keep this code safe — you may need it later.</p>
          </div>
          <div style={dvd} />
          <div style={fld}>
            <label style={lbl}>Submit the ID — type your 5-digit code below</label>
            <input ref={codeRef} className="inp" style={{ fontFamily: "monospace", fontSize: 24, letterSpacing: "0.3em", textAlign: "center" }}
              value={codeInput} onChange={e => { setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 5)); setCodeErr(""); }}
              onKeyDown={e => e.key === "Enter" && codeInput.length === 5 && handleVerify()}
              placeholder="_ _ _ _ _" maxLength={5} />
          </div>
          {codeErr && <p style={{ color: T.red, fontSize: 13, marginBottom: 12 }}>{codeErr}</p>}
          <PrimaryBtn onClick={handleVerify} disabled={codeInput.length !== 5}>Confirm &amp; View Exams →</PrimaryBtn>
        </div>
      </div>
    </Shell>
  );

  if (step === "exams") return (
    <Shell sidebar={sidebar} topbar={<><div style={{ display: "flex", gap: 8 }}><button className="tab-pill active">Available Exams</button></div><span style={{ fontSize: 14, fontWeight: 600, color: T.gray6 }}>Hello, {name}</span><OutlineBtn onClick={() => setStep("verify")}>← Back</OutlineBtn></>}>
      <div className="fu">
        <PageHeader subtitle={`Hello, ${name}`} title="Ongoing Exams"
          action={<OutlineBtn onClick={loadExams} style={{ fontSize: 13, padding: "7px 14px" }}>Refresh</OutlineBtn>} />
        {loading ? (
          <p style={mut}>Loading exams…</p>
        ) : exams.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>📋</div>
            <p style={{ fontSize: 15, color: T.gray6, marginBottom: 6 }}>No active exams right now.</p>
            <p style={mut}>Check back later or ask your teacher.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {exams.map((e, i) => {
              const total = e.questions.reduce((a, q) => a + q.marks, 0);
              const sub   = e.submissionDeadline ? new Date(e.submissionDeadline) : null;
              return (
                <div key={e.id} className="card card-click fu2" onClick={() => startExam(e)} style={{ animationDelay: `${i * 0.06}s` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 16, fontWeight: 700, color: T.black, marginBottom: 6 }}>{e.title}</p>
                      {e.description && <p style={{ fontSize: 13, color: T.gray6, marginBottom: 10 }}>{e.description}</p>}
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <Badge color="blue">{e.questions.length} questions</Badge>
                        <Badge color="green">{total} marks</Badge>
                        {e.duration && Number(e.duration) > 0 && <Badge color="orange">⏱ {e.duration} min</Badge>}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                      {sub && <Badge color="orange">Closes {sub.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Badge>}
                      <span style={{ fontSize: 20, color: T.gray4 }}>→</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );

  if (step === "take" && alreadySub) return (
    <Shell sidebar={sidebar} topbar={<><span /><span /><OutlineBtn onClick={() => setStep("exams")}>← Back to Exams</OutlineBtn></>}>
      <div className="fu" style={{ maxWidth: 480 }}>
        <div className="card" style={{ textAlign: "center", padding: "3rem 2rem", borderColor: T.redBorder }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>🚫</div>
          <p style={{ fontSize: 18, fontWeight: 700, color: T.red, marginBottom: 8 }}>Already Submitted</p>
          <p style={{ fontSize: 14, color: T.gray6, marginBottom: 4 }}><strong style={{ color: T.black }}>{name}</strong>, you've already submitted answers for</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: T.black, marginBottom: 20 }}>{exam.title}</p>
          <p style={{ ...mut, marginBottom: 24 }}>Each student can only submit once per exam.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <OutlineBtn onClick={() => setStep("exams")}>← Back to Exams</OutlineBtn>
            <OutlineBtn onClick={onBack}>Home</OutlineBtn>
          </div>
        </div>
      </div>
    </Shell>
  );

  if (step === "take") {
    const isWarn = timeLeft !== null && timeLeft <= 120;
    return (
      <Shell sidebar={sidebar} topbar={
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: T.black }}>{exam.title}</span>
            <Badge color="blue">{Object.keys(answers).length}/{exam.questions.length} answered</Badge>
          </div>
          {timeLeft !== null && (
            <div className={isWarn ? "twarn" : ""} style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 800, color: isWarn ? T.red : T.black, background: isWarn ? T.redBg : T.gray0, padding: "6px 16px", borderRadius: 8, border: `1.5px solid ${isWarn ? T.redBorder : T.gray2}` }}>
              {fmtTime(timeLeft)}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ width: 120, background: T.gray2, borderRadius: 999, height: 6 }}>
              <div style={{ width: `${exam.questions.length ? Math.round(Object.keys(answers).length / exam.questions.length * 100) : 0}%`, height: "100%", borderRadius: 999, background: T.black, transition: "width 0.3s" }} />
            </div>
          </div>
        </>
      }>
        {exam.questions.map((q, i) => (
          <StudentQCard key={q.id} q={q} index={i} answer={answers[q.id]} onChange={val => setAnswers(p => ({ ...p, [q.id]: val }))} />
        ))}
        <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
          <PrimaryBtn disabled={!allAnswered || submitting} onClick={handleSubmit}>{submitting ? "Submitting…" : "Submit Exam ✓"}</PrimaryBtn>
          {!allAnswered && <p style={mut}>Answer all {exam.questions.length} questions to submit.</p>}
        </div>
      </Shell>
    );
  }

  return (
    <Shell sidebar={sidebar} topbar={<><span /><span /><OutlineBtn onClick={onBack}>← Home</OutlineBtn></>}>
      <div className="fu" style={{ maxWidth: 480 }}>
        <div className="card" style={{ textAlign: "center", padding: "3.5rem 2rem", borderColor: T.greenBorder }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <p style={{ fontSize: 20, fontWeight: 800, color: T.green, marginBottom: 8 }}>Submitted Successfully</p>
          <p style={{ fontSize: 14, color: T.gray6, marginBottom: 24 }}><strong style={{ color: T.black }}>{exam?.title}</strong> — your answers have been recorded. Your teacher will grade your work shortly.</p>
          <OutlineBtn onClick={onBack}>← Back to Home</OutlineBtn>
        </div>
      </div>
    </Shell>
  );
}

// ─── Student question card ────────────────────────────────────────────────────
function StudentQCard({ q, index, answer, onChange }) {
  const fileRef    = useRef();
  const [exp, setExp] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleFiles(e) {
    const files = Array.from(e.target.files); if (!files.length) return;
    setBusy(true);
    const existing = answer?.files || [];
    const newFiles = await Promise.all(files.map(f => readAnyFile(f)));
    onChange({ type: "files", files: [...existing, ...newFiles] });
    setBusy(false); e.target.value = "";
  }
  function removeFile(i) {
    const files = (answer?.files || []).filter((_, idx) => idx !== i);
    if (files.length === 0) onChange(undefined); else onChange({ type: "files", files });
  }

  return (
    <div className={`card fu2`} style={{ marginBottom: 14, animationDelay: `${index * 0.05}s`, borderColor: answer ? "#111" : "#e5e7eb" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: answer ? T.black : T.gray1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: answer ? "#fff" : T.gray6 }}>
            {String(index + 1).padStart(2, "0")}
          </div>
          <Badge color={q.answerType === "mcq" ? "blue" : "orange"}>{q.answerType === "mcq" ? "MCQ" : "Written"}</Badge>
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: T.gray6 }}>{q.marks} {q.marks === 1 ? "mark" : "marks"}</span>
      </div>

      {q.text && <p style={{ fontSize: 15, lineHeight: 1.65, color: T.black, marginBottom: 14 }}>{q.text}</p>}
      {q.questionFiles?.length > 0 && q.questionFiles.map((f, i) => (
        f.mimeType === "application/pdf"
          ? <div key={i} style={{ border: `1px solid ${T.gray2}`, borderRadius: 10, overflow: "hidden", marginBottom: 10 }}><div style={{ padding: "8px 12px", background: T.gray0, display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${T.gray2}` }}><span>📄</span><span style={{ fontSize: 12, color: T.gray6 }}>{f.name}</span></div><iframe src={f.dataUrl} style={{ width: "100%", height: 360, border: "none", display: "block" }} title={f.name} /></div>
          : <img key={i} src={f.dataUrl} alt="Question" onClick={() => setExp(x => !x)} style={{ width: "100%", maxHeight: exp ? "none" : 260, objectFit: "cover", objectPosition: "top", borderRadius: 10, border: `1px solid ${T.gray2}`, cursor: "pointer", display: "block", marginBottom: 6 }} />
      ))}

      <div style={dvd} />
      <p style={{ fontSize: 11, fontWeight: 600, color: T.gray4, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Your Answer</p>

      {q.answerType === "mcq" && (
        <div>
          {q.options.map((opt, i) => {
            const sel = answer?.value === i;
            return (
              <label key={i} className={`ropt${sel ? " selected" : ""}`}>
                <input type="radio" name={`q-${q.id}`} checked={sel} onChange={() => onChange({ type: "mcq", value: i })} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: T.black, fontWeight: sel ? 600 : 400 }}>{opt}</span>
              </label>
            );
          })}
        </div>
      )}

      {q.answerType === "handwritten" && (
        <div>
          <input type="file" ref={fileRef} accept="image/*,application/pdf" multiple capture="environment" onChange={handleFiles} style={{ display: "none" }} />
          {answer?.files?.length > 0 && answer.files.map((f, i) => (
            f.mimeType === "application/pdf"
              ? <div key={i} style={{ border: `1px solid ${T.greenBorder}`, borderRadius: 10, overflow: "hidden", marginBottom: 10 }}><div style={{ padding: "8px 12px", background: T.greenBg, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${T.greenBorder}` }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span>📄</span><span style={{ fontSize: 12, color: T.gray6 }}>{f.name}</span></div><button onClick={() => removeFile(i)} style={{ background: "none", border: "none", color: T.red, cursor: "pointer", fontSize: 13 }}>✕</button></div><iframe src={f.dataUrl} style={{ width: "100%", height: 300, border: "none", display: "block" }} title={f.name} /></div>
              : <div key={i} style={{ position: "relative", marginBottom: 10 }}><img src={f.dataUrl} alt={`Answer ${i + 1}`} style={{ width: "100%", borderRadius: 10, border: `1px solid ${T.greenBorder}`, display: "block" }} /><button onClick={() => removeFile(i)} style={{ position: "absolute", top: 8, right: 8, background: "rgba(255,255,255,0.9)", border: `1px solid ${T.gray2}`, borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 12, color: T.red, fontWeight: 600 }}>Remove</button></div>
          ))}
          <div className="drop-zone" onClick={() => fileRef.current.click()}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{busy ? "⏳" : "📎"}</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: T.black, marginBottom: 4 }}>{busy ? "Processing…" : "Upload your answer"}</p>
            <p style={{ ...mut }}>Photos or PDF · multiple files allowed</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Teacher screen ───────────────────────────────────────────────────────────
function TeacherScreen({ onBack }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pass, setPass]         = useState("");
  const [passErr, setPassErr]   = useState("");
  const [tab, setTab]           = useState("exams");
  const [exams, setExams]       = useState([]);

  async function loadExams() {
    const keys = await db.list("exam:");
    const data = (await Promise.all(keys.map(k => db.get(k)))).filter(Boolean);
    setExams(data.sort((a, b) => b.createdAt - a.createdAt));
  }
  function login() {
    if (pass === PASS) { setLoggedIn(true); loadExams(); }
    else setPassErr("Incorrect password.");
  }
  async function toggleActive(id, current) {
    const e = exams.find(x => x.id === id); if (!e) return;
    const updated = { ...e, active: !current };
    setExams(prev => prev.map(x => x.id === id ? updated : x));
    await db.set(`exam:${id}`, updated);
  }
  async function deleteExam(id) {
    setExams(prev => prev.filter(x => x.id !== id));
    await db.del(`exam:${id}`);
  }

  const teacherNav = [
    { id: "exams",       icon: "exam",    label: "My Exams" },
    { id: "create",      icon: "create",  label: "Create Exam" },
    { id: "submissions", icon: "submit",  label: "Submissions" },
    { id: "leaderboard", icon: "trophy",  label: "Leaderboard" },
  ];

  if (!loggedIn) return (
    <Shell
      sidebar={<><Logo onClick={onBack} /><NavSection title="Teacher" items={teacherNav} active={null} onSelect={() => {}} /></>}
      topbar={<><span /><span style={{ fontSize: 14, fontWeight: 600, color: T.gray6 }}>Teacher Login</span><OutlineBtn onClick={onBack}>← Home</OutlineBtn></>}
    >
      <div className="fu" style={{ maxWidth: 440 }}>
        <PageHeader subtitle="Secure Access" title="Teacher Login" />
        <div className="card" style={{ padding: 28 }}>
          <div style={fld}><label style={lbl}>Password</label><input type="password" className="inp" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="Enter teacher password" autoFocus /></div>
          {passErr && <p style={{ color: T.red, fontSize: 13, marginBottom: 12 }}>{passErr}</p>}
          <PrimaryBtn onClick={login}>Unlock Access →</PrimaryBtn>
          <p style={{ ...mut, marginTop: 12 }}>Default password: teacher123</p>
        </div>
      </div>
    </Shell>
  );

  return (
    <Shell
      sidebar={
        <>
          <Logo onClick={onBack} />
          <NavSection title="Teacher Dashboard" items={teacherNav} active={tab} onSelect={id => { setTab(id); if (id === "exams") loadExams(); }} />
          <div style={{ marginTop: "auto", padding: "12px 8px", borderTop: "1px solid #f0f0f0" }}>
            <p style={{ fontSize: 12, color: T.gray4 }}>Signed in as teacher</p>
          </div>
        </>
      }
      topbar={
        <>
          <div style={{ display: "flex", gap: 8 }}>
            {teacherNav.map(t => (
              <button key={t.id} className={`tab-pill${tab === t.id ? " active" : ""}`} onClick={() => { setTab(t.id); if (t.id === "exams") loadExams(); }}>{t.label}</button>
            ))}
          </div>
          <span />
          <OutlineBtn onClick={onBack} style={{ fontSize: 13, padding: "7px 14px" }}>← Home</OutlineBtn>
        </>
      }
    >
      {tab === "exams"       && <ExamListView exams={exams} onToggle={toggleActive} onDelete={deleteExam} onRefresh={loadExams} />}
      {tab === "create"      && <CreateExamView onSaved={() => { loadExams(); setTab("exams"); }} />}
      {tab === "submissions" && <SubmissionsView exams={exams} />}
      {tab === "leaderboard" && <LeaderboardView exams={exams} />}
    </Shell>
  );
}

// ─── Exam list view ───────────────────────────────────────────────────────────
function ExamListView({ exams, onToggle, onDelete, onRefresh }) {
  const [now, setNow]           = useState(Date.now());
  const [confirmId, setConfirmId] = useState(null);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  if (exams.length === 0) return (
    <div className="fu">
      <PageHeader subtitle="Teacher" title="My Exams" action={<OutlineBtn onClick={onRefresh} style={{ fontSize: 13, padding: "7px 14px" }}>Refresh</OutlineBtn>} />
      <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
        <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.25 }}>📋</div>
        <p style={{ fontSize: 15, color: T.gray6, marginBottom: 6 }}>No exams yet.</p>
        <p style={mut}>Switch to "Create Exam" to get started.</p>
      </div>
    </div>
  );

  return (
    <div className="fu">
      <PageHeader subtitle="Teacher" title="My Exams" action={<OutlineBtn onClick={onRefresh} style={{ fontSize: 13, padding: "7px 14px" }}>Refresh</OutlineBtn>} />
      {exams.map(e => {
        const total   = e.questions.reduce((a, q) => a + q.marks, 0);
        const subMs   = e.submissionDeadline ? new Date(e.submissionDeadline) - now : null;
        const expired = subMs !== null && subMs <= 0;
        const pending = confirmId === e.id;

        return (
          <div key={e.id} className="card" style={{ borderColor: pending ? T.redBorder : "#e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: T.black }}>{e.title}</span>
                  <Badge color={e.active ? "green" : "gray"}>{e.active ? "Active" : "Inactive"}</Badge>
                </div>
                {e.description && <p style={{ fontSize: 13, color: T.gray6, marginBottom: 10 }}>{e.description}</p>}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: subMs !== null ? 8 : 0 }}>
                  <Badge color="blue">{e.questions.length} questions</Badge>
                  <Badge color="green">{total} marks</Badge>
                  {e.duration && Number(e.duration) > 0 && <Badge color="orange">⏱ {e.duration} min</Badge>}
                </div>
                {e.submissionDeadline && (
                  <p style={{ fontSize: 12, color: expired ? T.red : subMs < 3600000 ? T.orange : T.gray4, fontWeight: 600 }}>
                    {expired ? "⛔ Submissions closed" : `⏳ ${fmtCountdown(subMs)}`}
                  </p>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                <button className="btn-warn" onClick={() => onToggle(e.id, e.active)}>{e.active ? "Deactivate" : "Activate"}</button>
                {!pending
                  ? <button className="btn-danger" onClick={() => setConfirmId(e.id)}>Delete</button>
                  : <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: T.red, textAlign: "center" }}>Confirm delete?</p>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn-danger" style={{ flex: 1 }} onClick={() => { setConfirmId(null); onDelete(e.id); }}>Yes</button>
                        <button className="btn-outline" style={{ flex: 1, fontSize: 13, padding: "7px 8px" }} onClick={() => setConfirmId(null)}>No</button>
                      </div>
                    </div>
                }
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Create exam view ─────────────────────────────────────────────────────────
function CreateExamView({ onSaved }) {
  const [title, setTitle]       = useState("");
  const [desc, setDesc]         = useState("");
  const [duration, setDuration] = useState("");
  const [subDl, setSubDl]       = useState("");
  const [questions, setQuestions] = useState([]);
  const [qText, setQText]       = useState("");
  const [qFiles, setQFiles]     = useState([]);
  const [qAnsType, setQAnsType] = useState("handwritten");
  const [qMarks, setQMarks]     = useState(5);
  const [qOpts, setQOpts]       = useState(["", "", "", ""]);
  const [qCorrect, setQCorrect] = useState(0);
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const qFileRef = useRef();

  function resetAll() { setTitle(""); setDesc(""); setDuration(""); setSubDl(""); setQuestions([]); resetQ(); }
  function resetQ() { setQText(""); setQFiles([]); setQAnsType("handwritten"); setQMarks(5); setQOpts(["", "", "", ""]); setQCorrect(0); if (qFileRef.current) qFileRef.current.value = ""; }

  async function handleQFiles(e) {
    const files = Array.from(e.target.files); if (!files.length) return;
    setUploading(true);
    const nf = await Promise.all(files.map(f => readAnyFile(f)));
    setQFiles(p => [...p, ...nf]); setUploading(false); e.target.value = "";
  }

  function addQuestion() {
    if (!qText.trim() && qFiles.length === 0) { alert("Add a question text or upload a file."); return; }
    const opts = qOpts.filter(o => o.trim());
    if (qAnsType === "mcq" && opts.length < 2) { alert("Add at least 2 options for MCQ."); return; }
    setQuestions(p => [...p, { id: uid(), text: qText.trim(), questionFiles: qFiles, answerType: qAnsType, marks: Math.max(1, Number(qMarks) || 1), ...(qAnsType === "mcq" ? { options: opts, correct: Math.min(qCorrect, opts.length - 1) } : {}) }]);
    resetQ();
  }

  async function publish() {
    if (!title.trim()) { alert("Enter a title."); return; }
    if (questions.length === 0) { alert("Add at least one question."); return; }
    setSaving(true);
    const id = uid();
    await db.set(`exam:${id}`, { id, title: title.trim(), description: desc.trim(), duration: duration ? Number(duration) : null, submissionDeadline: subDl || null, questions, createdAt: Date.now(), active: true });
    setSaving(false); resetAll(); onSaved();
  }

  const totalMarks = questions.reduce((a, q) => a + q.marks, 0);

  return (
    <div className="fu">
      <PageHeader subtitle="Teacher" title="Create New Exam" />

      <div className="card" style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: T.black, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.04em" }}>Exam Details</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ gridColumn: "1/-1", ...fld }}><label style={lbl}>Title *</label><input className="inp" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Chapter 5 Quiz" /></div>
          <div style={{ gridColumn: "1/-1", ...fld }}><label style={lbl}>Description / instructions</label><input className="inp" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Open-book exam, write clearly" /></div>
          <div style={fld}><label style={lbl}>Exam duration (minutes)</label><input type="number" className="inp" value={duration} min={1} onChange={e => setDuration(e.target.value)} placeholder="blank = no limit" /></div>
          <div style={fld}><label style={lbl}>Submission closes at</label><input type="datetime-local" className="inp" style={{ colorScheme: "light" }} value={subDl} onChange={e => setSubDl(e.target.value)} /></div>
        </div>
        <p style={{ ...mut, marginTop: -4 }}>Duration = countdown timer for students. Submission deadline = when exam disappears from student list.</p>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: T.black, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.04em" }}>Add Question</p>

        <div style={fld}><label style={lbl}>Question text (optional if uploading files)</label><input className="inp" value={qText} onChange={e => setQText(e.target.value)} placeholder="Type your question… or leave blank if using file only" /></div>

        <div style={fld}>
          <label style={lbl}>Question files — images or PDF (multiple allowed)</label>
          <input type="file" ref={qFileRef} accept="image/*,application/pdf" multiple onChange={handleQFiles} style={{ display: "none" }} />
          {qFiles.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              {qFiles.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: T.gray0, borderRadius: 8, marginBottom: 4, border: `1px solid ${T.gray2}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span>{f.mimeType === "application/pdf" ? "📄" : "🖼️"}</span><span style={{ fontSize: 13, color: T.gray6 }}>{f.name}</span></div>
                  <button onClick={() => setQFiles(p => p.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", color: T.red, cursor: "pointer", fontSize: 16 }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <div className="drop-zone" onClick={() => qFileRef.current.click()}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{uploading ? "⏳" : "🖊️"}</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: T.black, marginBottom: 2 }}>{uploading ? "Processing…" : "Upload question files"}</p>
            <p style={mut}>Handwritten images or PDF · multiple files allowed</p>
          </div>
        </div>

        <div style={fld}>
          <label style={lbl}>Answer type</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[["handwritten", "Handwritten (photo/PDF)"], ["mcq", "Multiple choice"]].map(([t, lb]) => (
              <button key={t} onClick={() => setQAnsType(t)} className={`tab-pill${qAnsType === t ? " active" : ""}`}>{lb}</button>
            ))}
          </div>
        </div>

        {qAnsType === "mcq" && (
          <div style={fld}>
            <label style={lbl}>Options — select the correct answer</label>
            {qOpts.map((opt, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <input type="radio" name="qcorrect" checked={qCorrect === i} onChange={() => setQCorrect(i)} style={{ flexShrink: 0, width: 16, height: 16 }} />
                <input className="inp" value={opt} onChange={e => { const o = [...qOpts]; o[i] = e.target.value; setQOpts(o); }} placeholder={`Option ${i + 1}`} />
              </div>
            ))}
            <p style={{ ...mut, marginTop: 4 }}>Radio button = correct answer</p>
          </div>
        )}

        <div style={{ ...fld, maxWidth: 160 }}><label style={lbl}>Marks for this question</label><input type="number" className="inp" value={qMarks} min={1} onChange={e => setQMarks(e.target.value)} /></div>
        <PrimaryBtn onClick={addQuestion} disabled={!qText.trim() && qFiles.length === 0}>+ Add Question</PrimaryBtn>
      </div>

      {questions.length > 0 && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.black, textTransform: "uppercase", letterSpacing: "0.04em" }}>Questions ({questions.length})</p>
            <Badge color="green">{totalMarks} total marks</Badge>
          </div>
          {questions.map((q, i) => (
            <div key={q.id} style={{ padding: "12px 0", borderBottom: `1px solid ${T.gray2}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10 }}>
                <div style={{ flex: 1, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.gray4 }}>Q{i + 1}</span>
                  <Badge color={q.answerType === "mcq" ? "blue" : "orange"}>{q.answerType === "mcq" ? "MCQ" : "Written"}</Badge>
                  {q.questionFiles.length > 0 && <Badge color="green">{q.questionFiles.length} file{q.questionFiles.length > 1 ? "s" : ""}</Badge>}
                  {q.text && <span style={{ fontSize: 13, color: T.black }}>{q.text}</span>}
                  {q.answerType === "mcq" && <span style={{ fontSize: 12, color: T.gray6 }}>✓ {q.options[q.correct]}</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.green }}>{q.marks}m</span>
                  <button onClick={() => setQuestions(p => p.filter(x => x.id !== q.id))} style={{ background: "none", border: `1px solid ${T.redBorder}`, color: T.red, borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✕</button>
                </div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <PrimaryBtn onClick={publish} disabled={saving}>{saving ? "Publishing…" : "🚀 Publish Exam"}</PrimaryBtn>
            <OutlineBtn onClick={resetAll} style={{ fontSize: 13, padding: "9px 16px" }}>Clear All</OutlineBtn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Submissions view ─────────────────────────────────────────────────────────
function SubmissionsView({ exams }) {
  const [sel, setSel]         = useState(null);
  const [subs, setSubs]       = useState([]);
  const [view, setView]       = useState(null);
  const [grades, setGrades]   = useState({});
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [feedback, setFeedback] = useState("");

  async function loadSubs(exam) {
    setSel(exam); setView(null); setSaved(false);
    const keys = await db.list(`sub:${exam.id}:`);
    const data = (await Promise.all(keys.map(k => db.get(k)))).filter(Boolean);
    setSubs(data.sort((a, b) => b.submittedAt - a.submittedAt));
  }
  function openSub(sub) {
    setView(sub); setFeedback(sub.feedback || ""); setSaved(false);
    const g = {}; sel.questions.forEach(q => { g[q.id] = sub.grades?.[q.id] ?? ""; }); setGrades(g);
  }
  async function saveGrades() {
    setSaving(true);
    const updated = { ...view, grades: { ...view.grades, ...Object.fromEntries(Object.entries(grades).map(([k, v]) => [k, Number(v) || 0])) }, feedback, graded: true };
    updated.totalScore = sel.questions.reduce((a, q) => a + (Number(updated.grades[q.id]) || 0), 0);
    await db.set(`sub:${updated.examId}:${updated.id}`, updated);
    const allKeys = await db.list(`sub:${sel.id}:`);
    const allSubs = (await Promise.all(allKeys.map(k => db.get(k)))).filter(Boolean);
    const maxTotal = sel.questions.reduce((a, q) => a + q.marks, 0);
    const graded = allSubs.filter(s => s.graded || s.id === updated.id).map(s => ({ studentName: s.studentName, studentCode: s.studentCode || "", totalScore: s.id === updated.id ? updated.totalScore : (s.totalScore ?? 0), submittedAt: s.submittedAt }));
    graded.sort((a, b) => b.totalScore - a.totalScore);
    await db.set(`lb:${sel.id}`, { examId: sel.id, examTitle: sel.title, maxTotal, entries: graded, updatedAt: Date.now() });
    setView(updated); setSaving(false); setSaved(true); await loadSubs(sel);
  }

  if (!sel) return (
    <div className="fu">
      <PageHeader subtitle="Teacher" title="Submissions" />
      {exams.length === 0
        ? <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}><p style={mut}>No exams yet.</p></div>
        : exams.map(e => (
          <div key={e.id} className="card card-click" onClick={() => loadSubs(e)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><p style={{ fontSize: 15, fontWeight: 700, color: T.black, marginBottom: 6 }}>{e.title}</p><div style={{ display: "flex", gap: 6 }}><Badge color="blue">{e.questions.length} questions</Badge><Badge color={e.active ? "green" : "gray"}>{e.active ? "Active" : "Inactive"}</Badge></div></div>
              <span style={{ fontSize: 20, color: T.gray4 }}>→</span>
            </div>
          </div>
        ))
      }
    </div>
  );

  if (view) {
    const maxTotal = sel.questions.reduce((a, q) => a + q.marks, 0);
    const current  = sel.questions.reduce((a, q) => a + (Number(grades[q.id]) || 0), 0);
    return (
      <div className="fu">
        <PageHeader back="Back to list" onBack={() => { setView(null); setSaved(false); }} subtitle={sel.title} title={view.studentName} action={<div style={{ textAlign: "right" }}><p style={{ fontSize: 28, fontWeight: 800, color: T.black, letterSpacing: "-0.04em" }}>{current}<span style={{ fontSize: 16, color: T.gray4 }}>/{maxTotal}</span></p><p style={{ ...mut }}>Running total</p></div>} />

        {saved && <div style={{ background: T.greenBg, border: `1px solid ${T.greenBorder}`, borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontSize: 13, fontWeight: 600, color: T.green }}>✓ Grades saved · Leaderboard updated</div>}

        {view.studentCode && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}><span style={{ ...mut }}>Exam Code:</span><span style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 800, color: T.black, letterSpacing: "0.15em" }}>{view.studentCode}</span></div>}
        <p style={{ ...mut, marginBottom: 20 }}>Submitted {new Date(view.submittedAt).toLocaleString()}</p>

        {sel.questions.map((q, i) => {
          const ans = view.answers?.[q.id];
          return (
            <div key={q.id} className="card" style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span style={{ fontSize: 12, fontWeight: 700, color: T.gray4 }}>Q{i + 1}</span><Badge color={q.answerType === "mcq" ? "blue" : "orange"}>{q.answerType === "mcq" ? "MCQ" : "Written"}</Badge></div>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.gray6 }}>{q.marks} marks</span>
              </div>
              {q.text && <p style={{ fontSize: 15, fontWeight: 600, color: T.black, marginBottom: 10 }}>{q.text}</p>}
              {q.questionFiles?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: T.gray4, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Question Files</p>
                  {q.questionFiles.map((f, fi) => (
                    f.mimeType === "application/pdf"
                      ? <div key={fi} style={{ border: `1px solid ${T.gray2}`, borderRadius: 10, overflow: "hidden", marginBottom: 8 }}><div style={{ padding: "7px 12px", background: T.gray0, display: "flex", alignItems: "center", gap: 8 }}><span>📄</span><span style={{ fontSize: 12, color: T.gray6 }}>{f.name}</span></div><iframe src={f.dataUrl} style={{ width: "100%", height: 260, border: "none", display: "block" }} title={f.name} /></div>
                      : <img key={fi} src={f.dataUrl} alt="Q" style={{ width: "100%", maxHeight: 180, objectFit: "cover", objectPosition: "top", borderRadius: 10, border: `1px solid ${T.gray2}`, marginBottom: 6 }} />
                  ))}
                </div>
              )}
              <div style={dvd} />
              <p style={{ fontSize: 11, fontWeight: 700, color: T.gray4, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Student Answer</p>
              {q.answerType === "mcq" && (
                <div style={{ marginBottom: 12 }}>
                  {q.options.map((opt, oi) => {
                    const isC = oi === q.correct, isSel = ans?.value === oi;
                    let bg = "transparent", color = T.gray6, border = T.gray2;
                    if (isC) { bg = T.greenBg; color = T.green; border = T.greenBorder; }
                    else if (isSel && !isC) { bg = T.redBg; color = T.red; border = T.redBorder; }
                    return <div key={oi} style={{ padding: "8px 12px", borderRadius: 8, marginBottom: 4, fontSize: 14, background: bg, color, border: `1px solid ${border}` }}>{isSel ? "● " : "○ "}{opt}{isC ? " ✓" : ""}</div>;
                  })}
                </div>
              )}
              {q.answerType === "handwritten" && (
                <div style={{ marginBottom: 12 }}>
                  {ans?.files?.length > 0 ? ans.files.map((f, fi) => (
                    f.mimeType === "application/pdf"
                      ? <div key={fi} style={{ border: `1px solid ${T.greenBorder}`, borderRadius: 10, overflow: "hidden", marginBottom: 8 }}><div style={{ padding: "7px 12px", background: T.greenBg, display: "flex", alignItems: "center", gap: 8 }}><span>📄</span><span style={{ fontSize: 12, color: T.gray6 }}>{f.name}</span></div><iframe src={f.dataUrl} style={{ width: "100%", height: 300, border: "none", display: "block" }} title={f.name} /></div>
                      // ── NEW: AnnotatableImage replaces plain <img> ──
                      : <AnnotatableImage key={fi} dataUrl={f.dataUrl} name={f.name} />
                  )) : <p style={{ ...mut, fontStyle: "italic" }}>No files submitted.</p>}
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label style={{ ...lbl, margin: 0, flexShrink: 0 }}>Marks (max {q.marks}):</label>
                <input type="number" className="inp" style={{ width: 90 }} min={0} max={q.marks} value={grades[q.id] ?? ""} onChange={e => setGrades(p => ({ ...p, [q.id]: e.target.value }))} />
              </div>
            </div>
          );
        })}

        <div style={fld}><label style={lbl}>Feedback for student (optional)</label><textarea className="inp" style={{ minHeight: 80, resize: "vertical" }} value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="Write feedback or comments…" /></div>
        <PrimaryBtn onClick={saveGrades} disabled={saving}>{saving ? "Saving…" : "Save Grades ✓"}</PrimaryBtn>
      </div>
    );
  }

  const maxTotal = sel.questions.reduce((a, q) => a + q.marks, 0);
  return (
    <div className="fu">
      <PageHeader back="All Exams" onBack={() => setSel(null)} subtitle={sel.title} title={`${subs.length} Submission${subs.length !== 1 ? "s" : ""}`} />
      {subs.length === 0
        ? <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}><p style={mut}>No submissions yet.</p></div>
        : subs.map(s => (
          <div key={s.id} className="card card-click" onClick={() => openSub(s)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: T.black, marginBottom: 2 }}>{s.studentName}</p>
                {s.studentCode && <p style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: T.gray4, letterSpacing: "0.12em", marginBottom: 4 }}>{s.studentCode}</p>}
                <p style={{ ...mut }}>{new Date(s.submittedAt).toLocaleString()}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                {s.graded
                  ? <><p style={{ fontSize: 18, fontWeight: 800, color: T.black, letterSpacing: "-0.02em" }}>{s.totalScore}<span style={{ color: T.gray4, fontSize: 13 }}>/{maxTotal}</span></p><Badge color="green">Graded</Badge></>
                  : <Badge color="orange">Pending</Badge>}
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ─── Leaderboard view ─────────────────────────────────────────────────────────
function LeaderboardView({ exams }) {
  const [sel, setSel]     = useState(null);
  const [lb, setLb]       = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadLb(exam) { setSel(exam); setLoading(true); setLb(await db.get(`lb:${exam.id}`)); setLoading(false); }

  if (!sel) return (
    <div className="fu">
      <PageHeader subtitle="Teacher" title="Leaderboard" />
      {exams.length === 0
        ? <div className="card" style={{ textAlign: "center", padding: "2.5rem" }}><p style={mut}>No exams yet.</p></div>
        : exams.map(e => (
          <div key={e.id} className="card card-click" onClick={() => loadLb(e)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><p style={{ fontSize: 15, fontWeight: 700, color: T.black, marginBottom: 6 }}>{e.title}</p><Badge color="blue">{e.questions.length} questions</Badge></div>
              <span style={{ fontSize: 20, color: T.gray4 }}>→</span>
            </div>
          </div>
        ))
      }
    </div>
  );

  const medals = ["🥇", "🥈", "🥉"];
  const topColors = ["#d97706", "#6b7280", "#b45309"];

  return (
    <div className="fu">
      <PageHeader back="All Exams" onBack={() => { setSel(null); setLb(null); }} subtitle={sel.title} title="🏆 Leaderboard"
        action={<OutlineBtn onClick={() => loadLb(sel)} style={{ fontSize: 13, padding: "7px 14px" }}>Refresh</OutlineBtn>} />

      {loading ? <p style={mut}>Loading…</p> : !lb || lb.entries.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.25 }}>🏆</div>
          <p style={{ fontSize: 15, color: T.gray6, marginBottom: 6 }}>No graded submissions yet.</p>
          <p style={mut}>Grade submissions and save to build the leaderboard.</p>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 80px 70px", gap: 8, padding: "6px 8px 10px", borderBottom: `1px solid ${T.gray2}`, marginBottom: 4 }}>
            {["#", "Student", "Score", "%"].map((h, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 700, color: T.gray4, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: i > 1 ? "right" : "left" }}>{h}</span>
            ))}
          </div>
          {lb.entries.map((entry, i) => {
            const pct = lb.maxTotal > 0 ? Math.round(entry.totalScore / lb.maxTotal * 100) : 0;
            const isTop = i < 3;
            const accent = topColors[i] || T.gray6;
            return (
              <div key={i} className="lb-r" style={{ display: "grid", gridTemplateColumns: "44px 1fr 80px 70px", gap: 8, padding: "12px 8px", borderRadius: 10, marginBottom: 4, background: isTop ? `${accent}08` : "transparent", border: `1px solid ${isTop ? accent + "22" : T.gray1}`, animationDelay: `${i * 0.04}s` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {i < 3 ? <span style={{ fontSize: 22 }}>{medals[i]}</span> : <span style={{ fontSize: 14, fontWeight: 700, color: T.gray4 }}>{i + 1}</span>}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: isTop ? accent : T.black, marginBottom: 2 }}>{entry.studentName}</p>
                  {entry.studentCode && <p style={{ fontFamily: "monospace", fontSize: 11, color: T.gray4, letterSpacing: "0.1em" }}>{entry.studentCode}</p>}
                  <div style={{ width: "100%", background: T.gray2, borderRadius: 999, height: 4, marginTop: 6 }}>
                    <div style={{ width: `${pct}%`, height: "100%", borderRadius: 999, background: isTop ? accent : T.black, transition: "width .6s ease" }} />
                  </div>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: isTop ? accent : T.black, letterSpacing: "-0.02em" }}>{entry.totalScore}</span>
                  <span style={{ fontSize: 11, color: T.gray4 }}>/{lb.maxTotal}</span>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: pct >= 90 ? T.green : pct >= 60 ? T.orange : T.red }}>{pct}%</span>
                </div>
              </div>
            );
          })}
          {lb.updatedAt && <p style={{ ...mut, marginTop: 12, textAlign: "right" }}>Updated {new Date(lb.updatedAt).toLocaleString()}</p>}
        </div>
      )}
    </div>
  );
}


// ════════════════════════════════════════════════════════════════════════════════
// ─── NEW FEATURES ─────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════════

// ─── Annotation Tool (Teacher) ────────────────────────────────────────────────
function AnnotationTool({ imageData, fileName, onClose }) {
  const canvasRef  = useRef();
  const imgRef     = useRef();
  const lastPos    = useRef(null);
  const [tool,    setTool]    = useState("pen");
  const [color,   setColor]   = useState("#ef4444");
  const [size,    setSize]    = useState(4);
  const [drawing, setDrawing] = useState(false);
  const [history, setHistory] = useState([]);

  function onImgLoad() {
    const c = canvasRef.current;
    c.width  = imgRef.current.naturalWidth;
    c.height = imgRef.current.naturalHeight;
  }

  function getPos(e) {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const sx = canvas.width  / rect.width;
    const sy = canvas.height / rect.height;
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - rect.left) * sx, y: (cy - rect.top) * sy };
  }

  function saveHistory() {
    const ctx = canvasRef.current.getContext("2d");
    setHistory(h => [...h.slice(-19), ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)]);
  }

  function startDraw(e) {
    e.preventDefault();
    saveHistory();
    lastPos.current = getPos(e);
    setDrawing(true);
  }

  function doDraw(e) {
    e.preventDefault();
    if (!drawing || !lastPos.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.lineCap  = "round";
    ctx.lineJoin = "round";
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth   = size * 5;
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth   = size;
      ctx.strokeStyle = color;
    }
    ctx.stroke();
    lastPos.current = pos;
  }

  function stopDraw() { setDrawing(false); lastPos.current = null; }

  function undo() {
    if (!history.length) return;
    const prev = history[history.length - 1];
    canvasRef.current.getContext("2d").putImageData(prev, 0, 0);
    setHistory(h => h.slice(0, -1));
  }

  function clearAll() {
    saveHistory();
    const c = canvasRef.current;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
  }

  function download() {
    const img = imgRef.current;
    const ann = canvasRef.current;
    const out = document.createElement("canvas");
    out.width  = ann.width;
    out.height = ann.height;
    const ctx  = out.getContext("2d");
    ctx.drawImage(img, 0, 0, ann.width, ann.height);
    ctx.drawImage(ann, 0, 0);
    const a  = document.createElement("a");
    a.download = `annotated_${fileName || "submission"}.png`;
    a.href = out.toDataURL("image/png");
    a.click();
  }

  const PEN_COLORS = [
    { c: "#ef4444", label: "Red"    },
    { c: "#3b82f6", label: "Blue"   },
    { c: "#22c55e", label: "Green"  },
    { c: "#f97316", label: "Orange" },
    { c: "#111111", label: "Black"  },
    { c: "#ffffff", label: "White"  },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(10,10,10,0.92)", display: "flex", flexDirection: "column", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Toolbar */}
      <div style={{ background: "#1c1c1e", borderBottom: "1px solid #2a2a2a", padding: "10px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", flexShrink: 0 }}>
        <span style={{ fontWeight: 800, fontSize: 14, color: "#fff", marginRight: 4 }}>✏️ Annotate</span>
        <span style={{ color: "#555", fontSize: 12, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</span>
        <div style={{ width: 1, height: 24, background: "#333" }} />
        {[["pen", "✏️ Pen"], ["eraser", "◻ Eraser"]].map(([t, lbl]) => (
          <button key={t} onClick={() => setTool(t)} style={{ padding: "5px 14px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: tool === t ? "#fff" : "#2a2a2a", color: tool === t ? "#111" : "#aaa", transition: "all .15s" }}>{lbl}</button>
        ))}
        <div style={{ width: 1, height: 24, background: "#333" }} />
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {PEN_COLORS.map(({ c, label }) => (
            <div key={c} title={label} onClick={() => { setColor(c); setTool("pen"); }}
              style={{ width: 22, height: 22, borderRadius: "50%", background: c, cursor: "pointer", border: color === c && tool === "pen" ? "3px solid #3b82f6" : c === "#ffffff" ? "2px solid #555" : "2px solid transparent", transition: "border .1s", boxShadow: color === c && tool === "pen" ? "0 0 0 2px rgba(59,130,246,0.3)" : "none" }} />
          ))}
        </div>
        <div style={{ width: 1, height: 24, background: "#333" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: "#888", fontSize: 11, fontWeight: 600 }}>SIZE</span>
          <input type="range" min={1} max={14} value={size} onChange={e => setSize(+e.target.value)} style={{ width: 72, accentColor: "#3b82f6" }} />
          <div style={{ width: size + 6, height: size + 6, borderRadius: "50%", background: tool === "eraser" ? "#555" : color, border: "1px solid #444", flexShrink: 0, transition: "all .1s" }} />
        </div>
        <div style={{ width: 1, height: 24, background: "#333" }} />
        <button onClick={undo} disabled={!history.length} style={{ padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: history.length ? "pointer" : "not-allowed", background: "#2a2a2a", color: history.length ? "#ccc" : "#555" }}>↩ Undo</button>
        <button onClick={clearAll} style={{ padding: "5px 12px", borderRadius: 6, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer", background: "#2a2a2a", color: "#ef4444" }}>🗑 Clear</button>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={download} style={{ padding: "7px 18px", borderRadius: 7, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: "#22c55e", color: "#fff" }}>⬇ Download PNG</button>
          <button onClick={onClose}  style={{ padding: "7px 14px", borderRadius: 7, border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", background: "#333", color: "#fff" }}>✕ Close</button>
        </div>
      </div>
      {/* Drawing area */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "20px 16px" }}>
        <div style={{ position: "relative", display: "inline-block", boxShadow: "0 8px 40px rgba(0,0,0,0.6)", borderRadius: 8, overflow: "hidden" }}>
          <img ref={imgRef} src={imageData} onLoad={onImgLoad} alt="submission"
            style={{ display: "block", maxWidth: "min(900px, 90vw)", userSelect: "none", pointerEvents: "none" }} />
          <canvas ref={canvasRef}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", cursor: tool === "eraser" ? "cell" : "crosshair", touchAction: "none" }}
            onMouseDown={startDraw} onMouseMove={doDraw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            onTouchStart={startDraw} onTouchMove={doDraw} onTouchEnd={stopDraw}
          />
        </div>
      </div>
    </div>
  );
}

// ─── AnnotatableImage — drop-in replacement for <img> in GradeView ────────────
function AnnotatableImage({ dataUrl, name }) {
  const [annotating, setAnnotating] = useState(false);

  function downloadOriginal() {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = name || "submission.png";
    a.click();
  }

  return (
    <div style={{ marginBottom: 10 }}>
      <img src={dataUrl} alt={name}
        style={{ display: "block", maxWidth: "100%", maxHeight: 320, borderRadius: 8, border: `1px solid ${T.greenBorder}`, objectFit: "contain", marginBottom: 8 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn-outline" onClick={() => setAnnotating(true)}
          style={{ fontSize: 12, padding: "6px 14px", display: "flex", alignItems: "center", gap: 5 }}>
          ✏️ Annotate
        </button>
        <button className="btn-outline" onClick={downloadOriginal}
          style={{ fontSize: 12, padding: "6px 14px", display: "flex", alignItems: "center", gap: 5 }}>
          ⬇ Download
        </button>
      </div>
      {annotating && (
        <AnnotationTool imageData={dataUrl} fileName={name} onClose={() => setAnnotating(false)} />
      )}
    </div>
  );
}

// ─── Student Result View ──────────────────────────────────────────────────────
function StudentResultView({ onBack }) {
  const [step,      setStep]      = useState("code");
  const [codeInput, setCodeInput] = useState("");
  const [codeErr,   setCodeErr]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [name,      setName]      = useState("");
  const [results,   setResults]   = useState([]);
  const [sel,       setSel]       = useState(null);

  const sidebar = (
    <>
      <Logo />
      <div style={{ marginTop: "auto" }}>
        <button className="nav-item" onClick={onBack}>← Home</button>
      </div>
    </>
  );

  async function lookup() {
    if (codeInput.length !== 5) return;
    setLoading(true); setCodeErr("");

    const subKeys = await db.list("sub:");
    const list    = [];
    for (const k of subKeys) {
      const sub = await db.get(k);
      if (!sub || sub.studentCode !== codeInput) continue;
      const exam = await db.get(`exam:${sub.examId}`);
      if (exam) list.push({ sub: { ...sub, _key: k }, exam });
    }

    if (list.length === 0) {
      setCodeErr("No submissions found for this code. Please check again.");
      setLoading(false); return;
    }

    setName(list[0].sub.studentName);
    list.sort((a, b) => b.sub.submittedAt - a.sub.submittedAt);
    setResults(list);
    setStep("list");
    setLoading(false);
  }

  if (step === "code") return (
    <Shell sidebar={sidebar}>
      <div style={{ maxWidth: 420, margin: "4rem auto" }} className="fu">
        <PageHeader subtitle="Students" title="Check My Results" />
        <div className="card" style={{ padding: "2rem" }}>
          <p style={{ fontSize: 14, color: T.gray6, marginBottom: 20 }}>
            Enter your 5-digit student code to view your submitted exams, scores, and a question-by-question breakdown of your answers.
          </p>
          <div style={fld}>
            <label style={lbl}>Your 5-digit student code</label>
            <input className="inp"
              style={{ fontFamily: "monospace", fontSize: 28, letterSpacing: "0.35em", textAlign: "center" }}
              value={codeInput} maxLength={5} placeholder="_ _ _ _ _"
              onChange={e => { setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 5)); setCodeErr(""); }}
              onKeyDown={e => e.key === "Enter" && codeInput.length === 5 && lookup()} />
          </div>
          {codeErr && <p style={{ color: T.red, fontSize: 13, marginBottom: 12 }}>{codeErr}</p>}
          <PrimaryBtn onClick={lookup} disabled={codeInput.length !== 5 || loading}>
            {loading ? "Looking up…" : "View My Results →"}
          </PrimaryBtn>
        </div>
      </div>
    </Shell>
  );

  if (sel) return (
    <ResultDetail sub={sel.sub} exam={sel.exam} studentName={name}
      onBack={() => setSel(null)} />
  );

  return (
    <Shell sidebar={sidebar}>
      <div className="fu">
        <PageHeader back="Home" onBack={onBack} subtitle={name} title="My Results" />
        {results.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "3.5rem 2rem" }}>
            <div style={{ fontSize: 44, marginBottom: 12, opacity: 0.2 }}>📋</div>
            <p style={{ fontSize: 15, color: T.gray6, marginBottom: 6 }}>No submissions found yet.</p>
            <p style={mut}>Your results will appear here once you have taken and submitted an exam.</p>
          </div>
        ) : (
          results.map(({ sub, exam }, i) => {
            const totalMarks = exam.questions.reduce((a, q) => a + q.marks, 0);
            const pct = totalMarks > 0 && sub.graded ? Math.round(sub.totalScore / totalMarks * 100) : null;
            const scoreColor = pct === null ? T.orange : pct >= 75 ? T.green : pct >= 50 ? T.orange : T.red;

            return (
              <div key={sub._key || i} className="card card-click fu2"
                style={{ animationDelay: `${i * 0.06}s` }}
                onClick={() => setSel({ sub, exam })}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: T.black, marginBottom: 6 }}>{exam.title}</p>
                    {exam.description && <p style={{ fontSize: 13, color: T.gray6, marginBottom: 8 }}>{exam.description}</p>}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Badge color="blue">{exam.questions.length} questions</Badge>
                      <Badge color="gray">Submitted {new Date(sub.submittedAt).toLocaleDateString()}</Badge>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {sub.graded ? (
                      <>
                        <p style={{ fontSize: 26, fontWeight: 800, color: scoreColor, letterSpacing: "-0.04em", lineHeight: 1 }}>
                          {sub.totalScore}<span style={{ fontSize: 14, color: T.gray4 }}>/{totalMarks}</span>
                        </p>
                        <p style={{ fontSize: 13, fontWeight: 700, color: scoreColor, marginTop: 4 }}>{pct}%</p>
                        <Badge color={pct >= 75 ? "green" : pct >= 50 ? "orange" : "red"}>
                          {pct >= 75 ? "Pass" : pct >= 50 ? "Borderline" : "Fail"}
                        </Badge>
                      </>
                    ) : (
                      <>
                        <p style={{ fontSize: 13, fontWeight: 700, color: T.orange, marginBottom: 4 }}>⏳ Awaiting Grade</p>
                        <Badge color="orange">Pending</Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Shell>
  );
}

// ─── Result Detail — question-by-question review ──────────────────────────────
function ResultDetail({ sub, exam, studentName, onBack }) {
  const totalMarks = exam.questions.reduce((a, q) => a + q.marks, 0);
  const pct = totalMarks > 0 && sub.graded ? Math.round(sub.totalScore / totalMarks * 100) : 0;

  const [gradeLetter, gradeColor] =
    pct >= 90 ? ["A", T.green]  :
    pct >= 75 ? ["B", T.green]  :
    pct >= 60 ? ["C", T.orange] :
    pct >= 50 ? ["D", T.orange] : ["F", T.red];

  const mcqQs      = exam.questions.filter(q => q.answerType === "mcq");
  const correctMCQ = mcqQs.filter(q => sub.answers?.[q.id]?.value === q.correct).length;

  const sidebar = (
    <>
      <Logo />
      {sub.graded && (
        <div style={{ margin: "12px 0 20px", padding: "14px", background: T.gray1, borderRadius: 10, textAlign: "center" }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: gradeColor, margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{gradeLetter}</span>
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, color: T.black, letterSpacing: "-0.03em" }}>
            {sub.totalScore}<span style={{ color: T.gray4, fontSize: 13 }}>/{totalMarks}</span>
          </p>
          <p style={{ fontSize: 13, fontWeight: 700, color: gradeColor }}>{pct}%</p>
        </div>
      )}
      <div style={{ marginTop: "auto" }}>
        <button className="nav-item" onClick={onBack}>← My Results</button>
      </div>
    </>
  );

  return (
    <Shell sidebar={sidebar}>
      <div className="fu" style={{ maxWidth: 740 }}>
        <PageHeader back="My Results" onBack={onBack} subtitle={exam.title} title="Answer Review" />

        {/* Score banner */}
        {sub.graded ? (
          <div className="card fu2" style={{ marginBottom: 24, padding: "1.5rem 1.75rem", background: pct >= 50 ? T.greenBg : T.redBg, borderColor: pct >= 50 ? T.greenBorder : T.redBorder }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.gray4, letterSpacing: "0.06em", marginBottom: 6 }}>TOTAL SCORE</p>
                <p style={{ fontSize: 40, fontWeight: 800, color: T.black, letterSpacing: "-0.05em", lineHeight: 1 }}>
                  {sub.totalScore}
                  <span style={{ fontSize: 20, color: T.gray4, fontWeight: 600 }}>/{totalMarks}</span>
                </p>
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                {mcqQs.length > 0 && (
                  <div style={{ textAlign: "center", padding: "10px 16px", background: "#fff", borderRadius: 10, border: `1px solid ${T.gray2}` }}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: correctMCQ === mcqQs.length ? T.green : T.orange }}>{correctMCQ}/{mcqQs.length}</p>
                    <p style={{ fontSize: 11, fontWeight: 600, color: T.gray4 }}>MCQ Correct</p>
                  </div>
                )}
                <div style={{ textAlign: "center", padding: "10px 16px", background: "#fff", borderRadius: 10, border: `1px solid ${T.gray2}` }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: gradeColor, margin: "0 auto 4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{gradeLetter}</span>
                  </div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: T.gray4 }}>{pct}%</p>
                </div>
              </div>
            </div>
            {sub.feedback && (
              <div style={{ marginTop: 16, padding: "12px 14px", background: "#fff", borderRadius: 8, border: `1px solid ${T.gray2}` }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.gray4, letterSpacing: "0.06em", marginBottom: 6 }}>TEACHER FEEDBACK</p>
                <p style={{ fontSize: 14, color: T.gray8, lineHeight: 1.6 }}>{sub.feedback}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="card fu2" style={{ marginBottom: 24, padding: "1.25rem", background: T.orangeBg, borderColor: T.orangeBorder }}>
            <p style={{ fontWeight: 700, color: T.orange }}>⏳ Not yet graded</p>
            <p style={{ fontSize: 13, color: T.gray6, marginTop: 4 }}>Your teacher hasn't graded this exam yet. Check back later.</p>
          </div>
        )}

        {/* Question-by-question */}
        {exam.questions.map((q, i) => {
          const ans        = sub.answers?.[q.id];
          const isCorrect  = q.answerType === "mcq" && ans?.value === q.correct;
          const isWrong    = q.answerType === "mcq" && ans !== undefined && ans?.value !== q.correct;
          const earnedMark = sub.graded && sub.grades ? (sub.grades[q.id] ?? null) : null;

          let cardBorderLeft = T.gray4;
          if (isCorrect) cardBorderLeft = T.green;
          if (isWrong)   cardBorderLeft = T.red;

          return (
            <div key={q.id} className="card fu3"
              style={{ marginBottom: 14, borderLeftWidth: 4, borderLeftColor: cardBorderLeft, animationDelay: `${i * 0.05}s` }}>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: T.gray4, letterSpacing: "0.05em" }}>Q{i + 1}</span>
                  {isCorrect && <Badge color="green">✓ Correct</Badge>}
                  {isWrong   && <Badge color="red">✗ Incorrect</Badge>}
                  {q.answerType === "handwritten" && <Badge color="blue">Written / File</Badge>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {earnedMark !== null && (
                    <span style={{ fontSize: 13, fontWeight: 800, color: T.black }}>
                      {earnedMark}<span style={{ color: T.gray4, fontWeight: 500 }}>/{q.marks}</span>
                    </span>
                  )}
                  <Badge color="gray">{q.marks} mark{q.marks !== 1 ? "s" : ""}</Badge>
                </div>
              </div>

              <p style={{ fontSize: 15, fontWeight: 600, color: T.black, marginBottom: 14, lineHeight: 1.5 }}>{q.text}</p>

              {/* MCQ review */}
              {q.answerType === "mcq" && Array.isArray(q.options) && (
                <div>
                  {q.options.map((opt, oi) => {
                    const isSelected    = ans?.value === oi;
                    const isCorrectOpt  = q.correct  === oi;
                    let bg = "transparent", border = T.gray2, color = T.black, weight = 400;
                    if (isCorrectOpt)               { bg = T.greenBg; border = T.green;  color = T.green;  weight = 700; }
                    if (isSelected && !isCorrectOpt) { bg = T.redBg;  border = T.red;    color = T.red;    weight = 700; }
                    return (
                      <div key={oi} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${border}`, background: bg, marginBottom: 8 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {(isSelected || isCorrectOpt) && <div style={{ width: 10, height: 10, borderRadius: "50%", background: isCorrectOpt ? T.green : T.red }} />}
                        </div>
                        <span style={{ fontSize: 14, color, fontWeight: weight, flex: 1 }}>{opt}</span>
                        {isCorrectOpt  && <span style={{ fontSize: 11, fontWeight: 700, color: T.green, whiteSpace: "nowrap" }}>✓ Correct answer</span>}
                        {isSelected && !isCorrectOpt && <span style={{ fontSize: 11, fontWeight: 700, color: T.red, whiteSpace: "nowrap" }}>✗ Your answer</span>}
                      </div>
                    );
                  })}
                  {!ans && <p style={{ ...mut, fontStyle: "italic" }}>No answer selected.</p>}
                </div>
              )}

              {/* File/image review */}
              {q.answerType === "handwritten" && (
                <div>
                  {ans?.files?.length > 0 ? ans.files.map((f, fi) => (
                    f.mimeType === "application/pdf"
                      ? <a key={fi} href={f.dataUrl} download={f.name} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, background: T.blueBg, border: `1px solid ${T.blueBorder}`, color: T.blue, fontSize: 13, fontWeight: 600, textDecoration: "none", marginBottom: 8 }}>📄 {f.name}</a>
                      : <img key={fi} src={f.dataUrl} alt={f.name} style={{ maxWidth: "100%", maxHeight: 320, borderRadius: 8, border: `1px solid ${T.gray2}`, objectFit: "contain", display: "block", marginBottom: 8 }} />
                  )) : <p style={{ ...mut, fontStyle: "italic" }}>No files submitted.</p>}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ height: 40 }} />
      </div>
    </Shell>
  );
}
