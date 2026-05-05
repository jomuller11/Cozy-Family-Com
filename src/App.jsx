import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import {
  confirmSignUp,
  getCurrentUser,
  signIn,
  signOut,
  signUp,
} from "aws-amplify/auth";
import * as db from "./lib/data";
import { t as i18nT } from "./lib/i18n";

// ─────────────────────────────────────────────────────────────
// APP CONTEXT — evita definir componentes dentro de App(),
// lo que causaba que se desmontaran en cada re-render (bug teclado)
// ─────────────────────────────────────────────────────────────
const AppCtx = createContext(null);
const useApp = () => useContext(AppCtx);

// ─────────────────────────────────────────────────────────────
// MASCOT SVGs
// ─────────────────────────────────────────────────────────────
const Mascot = ({ name, size = 64, blink = true }) => {
  const [eyesClosed, setEyesClosed] = useState(false);
  useEffect(() => {
    if (!blink) return;
    let t;
    const loop = () => {
      const delay = 2200 + Math.random() * 3500;
      t = setTimeout(() => {
        setEyesClosed(true);
        setTimeout(() => setEyesClosed(false), 140);
        loop();
      }, delay);
    };
    loop();
    return () => clearTimeout(t);
  }, [blink]);

  const eyeY = eyesClosed ? 52 : 50;
  const eyeRy = eyesClosed ? 0.5 : 3.2;

  const palettes = {
    nubi:  { body: "#cfe3f0", belly: "#ecf4fa", cheek: "#f4b6b6", accent: "#7fa8c2" },
    soli:  { body: "#ffd58a", belly: "#fff0c8", cheek: "#f1968a", accent: "#e89540" },
    luma:  { body: "#e6d3ef", belly: "#f6ecfa", cheek: "#f0a8b8", accent: "#a07cc2" },
    bubu:  { body: "#bfe2c8", belly: "#e3f3e6", cheek: "#f0a8b8", accent: "#6b9a78" },
    pipo:  { body: "#f4c7a1", belly: "#fbe7d2", cheek: "#e89090", accent: "#c47a4a" },
    mishi: { body: "#d6c2ad", belly: "#efe1cf", cheek: "#e89090", accent: "#8b6f50" },
    toto:  { body: "#cdb89a", belly: "#e8dcc6", cheek: "#d68585", accent: "#7d6446" },
    momo:  { body: "#f0a8c0", belly: "#fad4e0", cheek: "#d97090", accent: "#b66a86" },
  };
  const c = palettes[name] || palettes.nubi;

  const renderDetails = () => {
    switch (name) {
      case "nubi":
        return (
          <>
            <ellipse cx="32" cy="28" rx="10" ry="8" fill={c.body} />
            <ellipse cx="55" cy="22" rx="13" ry="11" fill={c.body} />
            <ellipse cx="78" cy="30" rx="9" ry="7" fill={c.body} />
          </>
        );
      case "soli":
        return (
          <g stroke={c.accent} strokeWidth="3" strokeLinecap="round">
            <line x1="50" y1="8" x2="50" y2="18" />
            <line x1="20" y1="20" x2="27" y2="27" />
            <line x1="80" y1="20" x2="73" y2="27" />
            <line x1="10" y1="50" x2="20" y2="50" />
            <line x1="90" y1="50" x2="80" y2="50" />
          </g>
        );
      case "luma":
        return (
          <>
            <path d="M 20 25 Q 15 35 25 38 Q 22 30 30 28 Z" fill={c.accent} opacity="0.5" />
            <path d="M 80 22 l 2 5 l 5 1 l -4 3 l 1 5 l -4 -3 l -4 3 l 1 -5 l -4 -3 l 5 -1 z" fill={c.accent} opacity="0.6" />
          </>
        );
      case "bubu":
        return (
          <>
            <circle cx="20" cy="25" r="4" fill={c.body} opacity="0.6" />
            <circle cx="82" cy="20" r="6" fill={c.body} opacity="0.6" />
            <circle cx="88" cy="35" r="3" fill={c.body} opacity="0.6" />
          </>
        );
      case "pipo":
        return (
          <>
            <path d="M 22 35 L 18 12 L 38 28 Z" fill={c.body} stroke={c.accent} strokeWidth="1.5" />
            <path d="M 78 35 L 82 12 L 62 28 Z" fill={c.body} stroke={c.accent} strokeWidth="1.5" />
            <path d="M 24 32 L 22 18 L 33 26 Z" fill={c.cheek} opacity="0.7" />
            <path d="M 76 32 L 78 18 L 67 26 Z" fill={c.cheek} opacity="0.7" />
          </>
        );
      case "mishi":
        return (
          <>
            <path d="M 25 32 L 22 14 L 40 28 Z" fill={c.body} />
            <path d="M 75 32 L 78 14 L 60 28 Z" fill={c.body} />
            <path d="M 27 28 L 26 19 L 34 26 Z" fill={c.cheek} />
            <path d="M 73 28 L 74 19 L 66 26 Z" fill={c.cheek} />
          </>
        );
      case "toto":
        return (
          <>
            <ellipse cx="22" cy="42" rx="10" ry="16" fill={c.accent} />
            <ellipse cx="78" cy="42" rx="10" ry="16" fill={c.accent} />
          </>
        );
      case "momo":
        return (
          <>
            <path d="M 28 30 L 26 18 L 42 28 Z" fill={c.body} />
            <path d="M 72 30 L 74 18 L 58 28 Z" fill={c.body} />
          </>
        );
      default:
        return null;
    }
  };

  const renderNose = () => {
    if (name === "momo") return <ellipse cx="50" cy="62" rx="11" ry="7" fill={c.accent} opacity="0.7" />;
    if (name === "mishi" || name === "pipo" || name === "toto") return <ellipse cx="50" cy="58" rx="3" ry="2" fill="#3a2a1f" />;
    return null;
  };

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block" }}>
      <ellipse cx="50" cy="92" rx="28" ry="3.5" fill="#000" opacity="0.08" />
      {renderDetails()}
      <ellipse cx="50" cy="58" rx="32" ry="30" fill={c.body} />
      <ellipse cx="50" cy="68" rx="20" ry="16" fill={c.belly} />
      <circle cx="32" cy="60" r="5" fill={c.cheek} opacity="0.8" />
      <circle cx="68" cy="60" r="5" fill={c.cheek} opacity="0.8" />
      <ellipse cx="40" cy={eyeY} rx="2.6" ry={eyeRy} fill="#2b1d14" />
      <ellipse cx="60" cy={eyeY} rx="2.6" ry={eyeRy} fill="#2b1d14" />
      {!eyesClosed && (
        <>
          <circle cx="41" cy={eyeY - 1} r="0.8" fill="#fff" />
          <circle cx="61" cy={eyeY - 1} r="0.8" fill="#fff" />
        </>
      )}
      {renderNose()}
      {name === "momo" ? (
        <>
          <ellipse cx="46" cy="62" rx="1.2" ry="0.8" fill="#3a2a1f" />
          <ellipse cx="54" cy="62" rx="1.2" ry="0.8" fill="#3a2a1f" />
        </>
      ) : (
        <path d={`M 45 64 Q 50 ${name === "soli" ? 70 : 68} 55 64`} stroke="#3a2a1f" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
};

const VAPID_PUBLIC_KEY =
  "BMLv43bFoqZ9GkcF_P-JD4s2MY0DxDkPFV3RyicEhDC1B7EsyVcupMfCPRWQZsB9wU8pcxxdMFDgH5LDwPuGutI";

function urlBase64ToUint8Array(b64) {
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function computeReminderAt(date, time, minutes) {
  const mins = Number(minutes);
  if (!date || !time || !mins) return null;
  const start = new Date(`${date}T${time}:00`); // parsed as local time in browser
  return new Date(start.getTime() - mins * 60 * 1000).toISOString();
}

function inferReminderMinutes(reminderAt, date, time) {
  if (!reminderAt || !date || !time) return "0";
  const diff = Math.round(
    (new Date(`${date}T${time}:00`).getTime() - new Date(reminderAt).getTime()) / 60000
  );
  return ["15", "30", "60"].includes(String(diff)) ? String(diff) : "0";
}

const MASCOTS = ["nubi", "soli", "luma", "bubu", "pipo", "mishi", "toto", "momo"];
const MASCOT_LABELS = {
  nubi: "Nubi", soli: "Soli", luma: "Luma", bubu: "Bubu",
  pipo: "Pipo", mishi: "Mishi", toto: "Toto", momo: "Momo",
};

const fmtDate = (d, locale = "es-AR") =>
  d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long" });
const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
const startOfWeek = (d) => {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
};
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// LANG TOGGLE
// ─────────────────────────────────────────────────────────────
const LangToggle = () => {
  const { lang, setLang } = useApp();
  return (
    <button
      className="lang-toggle"
      onClick={() => setLang(lang === "es" ? "en" : "es")}
      aria-label="change language"
    >
      {lang === "es" ? "EN" : "ES"}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────────────────────
const LoginView = () => {
  const { refreshSession, toggleTheme, theme, t } = useApp();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const tryLogin = async () => {
    if (!email.trim() || !pass) { setErr(t("validation.required")); return; }
    setErr("");
    setLoading(true);
    try {
      await signIn({ username: email.trim(), password: pass });
      refreshSession();
    } catch (e) {
      setErr(e.message || t("login.error.credentials"));
    } finally {
      setLoading(false);
    }
  };

  const tryRegister = async () => {
    if (!email.trim() || !pass) { setErr(t("validation.required")); return; }
    setErr("");
    setLoading(true);
    try {
      await signUp({
        username: email.trim(),
        password: pass,
        options: { userAttributes: { email: email.trim() } },
      });
      setMode("confirm");
    } catch (e) {
      setErr(e.message || t("login.register.error"));
    } finally {
      setLoading(false);
    }
  };

  const tryConfirm = async () => {
    if (!code.trim()) { setErr(t("validation.required")); return; }
    setErr("");
    setLoading(true);
    try {
      await confirmSignUp({ username: email.trim(), confirmationCode: code.trim() });
      await signIn({ username: email.trim(), password: pass });
      refreshSession();
    } catch (e) {
      setErr(e.message || t("login.verify.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-top-actions">
        <button className="theme-toggle login-theme" onClick={toggleTheme} aria-label={t("theme.toggle")}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <LangToggle />
      </div>
      <div className="paper-card login-card">
        <div className="logo-row">
          <div className="logo-blob"><Mascot name="nubi" size={56} /></div>
          <div className="logo-blob blob-2"><Mascot name="soli" size={56} /></div>
          <div className="logo-blob blob-3"><Mascot name="momo" size={56} /></div>
        </div>
        <h1 className="display-title">Cozy<span className="amp">&amp;</span>Casa</h1>
        <p className="tagline">{t("login.tagline")}</p>

        {mode === "login" && (
          <>
            <label className="lbl">{t("login.email")}</label>
            <input className="cozy-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("login.email.ph")} onKeyDown={(e) => e.key === "Enter" && tryLogin()} />
            <label className="lbl">{t("login.password")}</label>
            <input className="cozy-input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder={t("login.password.ph")} onKeyDown={(e) => e.key === "Enter" && tryLogin()} />
            {err && <div className="err-pill">{err}</div>}
            <button className="primary-btn" onClick={tryLogin} disabled={loading}>{loading ? t("loading.entering") : t("login.submit")}</button>
            <div className="alt-row">
              <span>{t("login.new")}</span>
              <button className="link-btn" onClick={() => { setMode("register"); setErr(""); }}>{t("login.create")}</button>
            </div>
          </>
        )}

        {mode === "register" && (
          <>
            <label className="lbl">{t("login.email")}</label>
            <input className="cozy-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("login.email.ph")} onKeyDown={(e) => e.key === "Enter" && tryRegister()} />
            <label className="lbl">{t("login.password")}</label>
            <input className="cozy-input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder={t("login.register.password.ph")} onKeyDown={(e) => e.key === "Enter" && tryRegister()} />
            {err && <div className="err-pill">{err}</div>}
            <button className="primary-btn" onClick={tryRegister} disabled={loading}>{loading ? t("loading.creating") : t("login.register.submit")}</button>
            <div className="alt-row">
              <span>{t("login.register.have")}</span>
              <button className="link-btn" onClick={() => { setMode("login"); setErr(""); }}>{t("login.register.signin")}</button>
            </div>
          </>
        )}

        {mode === "confirm" && (
          <>
            <p className="confirm-msg">{t("login.verify.msg", { email })}</p>
            <label className="lbl">{t("login.verify.label")}</label>
            <input className="cozy-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("login.verify.ph")} onKeyDown={(e) => e.key === "Enter" && tryConfirm()} />
            {err && <div className="err-pill">{err}</div>}
            <button className="primary-btn" onClick={tryConfirm} disabled={loading}>{loading ? t("loading.confirming") : t("login.verify.submit")}</button>
          </>
        )}
      </div>
      <div className="login-foot">{t("footer")}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ONBOARDING
// ─────────────────────────────────────────────────────────────
const OnboardingView = () => {
  const { setStage, t } = useApp();
  const slides = [
    { mascot: "nubi", title: t("onboarding.s1.title"), text: t("onboarding.s1.text") },
    { mascot: "soli", title: t("onboarding.s2.title"), text: t("onboarding.s2.text") },
    { mascot: "momo", title: t("onboarding.s3.title"), text: t("onboarding.s3.text") },
  ];
  const [i, setI] = useState(0);
  const finish = () => {
    localStorage.setItem("cozy-onboarding-done", "1");
    setStage("app");
  };

  return (
    <div className="onb-wrap">
      <button className="skip-btn" onClick={finish}>{t("onboarding.skip")}</button>
      <div className="onb-stage">
        <div className="onb-mascot-pad">
          <div className="floaty"><Mascot name={slides[i].mascot} size={140} /></div>
        </div>
        <h2 className="onb-title">{slides[i].title}</h2>
        <p className="onb-text">{slides[i].text}</p>
      </div>
      <div className="dots">
        {slides.map((_, k) => <span key={k} className={`dot ${k === i ? "on" : ""}`} />)}
      </div>
      <div className="onb-actions">
        <button className="ghost-btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>{t("onboarding.back")}</button>
        <button className="primary-btn" onClick={() => { if (i < slides.length - 1) setI(i + 1); else finish(); }}>
          {i === slides.length - 1 ? t("onboarding.start") : t("onboarding.next")}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// NO FAMILY
// ─────────────────────────────────────────────────────────────
const NoFamilyView = () => {
  const { user, setUser, setFamilyData, setAllFamilies, setStage, toggleTheme, theme, loadMembers, t } = useApp();
  const [view, setView] = useState("choose");
  const [name, setName] = useState("");
  const [mascot, setMascot] = useState("nubi");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { setErr(t("validation.required")); return; }
    setErr("");
    setLoading(true);
    try {
      const fam = await db.createFamily({ name: name.trim(), mascot, createdBy: user.userId });
      setFamilyData(fam);
      setAllFamilies([{ family: fam, membership: { role: "admin", status: "activo" } }]);
      setUser((prev) => prev ? { ...prev, role: "admin" } : prev);
      await loadMembers(fam.id, user.userId);
      localStorage.setItem("cozy-onboarding-done", "1");
      setStage("app");
    } catch (e) {
      setErr(e.message || t("nofamily.create.error"));
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!code.trim()) { setErr(t("validation.required")); return; }
    setErr("");
    setLoading(true);
    try {
      await db.consumeInvite({ code: code.trim().toUpperCase(), userId: user.userId });
      const memberships = await db.getMyFamilies(user.userId);
      const famDataArr = await Promise.all(memberships.map((m) => db.getFamily(m.familyId)));
      const allFams = memberships.map((m, i) => ({ family: famDataArr[i], membership: m })).filter((x) => x.family);
      setAllFamilies(allFams);
      const fam = famDataArr[0];
      setFamilyData(fam);
      setUser((prev) => prev ? { ...prev, role: memberships[0].role } : prev);
      await loadMembers(fam.id, user.userId);
      localStorage.setItem("cozy-onboarding-done", "1");
      setStage("app");
    } catch (e) {
      setErr(e.message || t("nofamily.join.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-top-actions">
        <button className="theme-toggle login-theme" onClick={toggleTheme} aria-label={t("theme.toggle")}>
          {theme === "light" ? "🌙" : "☀️"}
        </button>
        <LangToggle />
      </div>
      <div className="paper-card login-card">
        <div className="logo-row">
          <div className="logo-blob"><Mascot name={user?.mascot || "nubi"} size={80} /></div>
        </div>
        <h1 className="display-title">{t("nofamily.hello", { name: user?.name?.toLowerCase() })}</h1>
        <p className="tagline">{t("nofamily.tagline")}</p>

        {view === "choose" && (
          <>
            <button className="primary-btn" style={{ marginTop: 8 }} onClick={() => setView("create")}>{t("nofamily.create")}</button>
            <button className="ghost-btn" style={{ marginTop: 12, width: "100%" }} onClick={() => setView("join")}>{t("nofamily.join")}</button>
          </>
        )}

        {view === "create" && (
          <>
            <label className="lbl">{t("nofamily.name.label")}</label>
            <input className="cozy-input" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("nofamily.name.ph")} onKeyDown={(e) => e.key === "Enter" && handleCreate()} />
            <label className="lbl">{t("nofamily.mascot")}</label>
            <div className="mascot-grid">
              {MASCOTS.map((m) => (
                <button key={m} className={`mascot-pick ${mascot === m ? "mp-on" : ""}`} onClick={() => setMascot(m)}>
                  <Mascot name={m} size={44} />
                  <span>{MASCOT_LABELS[m]}</span>
                </button>
              ))}
            </div>
            {err && <div className="err-pill">{err}</div>}
            <button className="primary-btn full" onClick={handleCreate} disabled={loading}>{loading ? t("loading.creating") : t("nofamily.create.submit")}</button>
            <button className="ghost-btn full" style={{ marginTop: 8 }} onClick={() => setView("choose")} disabled={loading}>{t("nofamily.back")}</button>
          </>
        )}

        {view === "join" && (
          <>
            <label className="lbl">{t("nofamily.code.label")}</label>
            <input className="cozy-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("nofamily.code.ph")} style={{ textTransform: "uppercase" }} onKeyDown={(e) => e.key === "Enter" && handleJoin()} />
            {err && <div className="err-pill">{err}</div>}
            <button className="primary-btn full" onClick={handleJoin} disabled={loading}>{loading ? t("loading.joining") : t("nofamily.join.submit")}</button>
            <button className="ghost-btn full" style={{ marginTop: 8 }} onClick={() => setView("choose")} disabled={loading}>{t("nofamily.back")}</button>
          </>
        )}
      </div>
      <div className="login-foot">{t("footer")}</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ACTIVITY ROW
// ─────────────────────────────────────────────────────────────
const ActivityRow = ({ a }) => {
  const { setEditingActivity, t } = useApp();
  const icons = { examen: "📝", voley: "🏐", gimnasia: "🤸" };
  return (
    <div className={`act-row act-${a.type} act-row-clickable`} onClick={() => setEditingActivity(a)}>
      <div className="act-mascot"><Mascot name={a.mascot || "nubi"} size={44} /></div>
      <div className="act-body">
        <div className="act-top">
          <span className="act-icon">{icons[a.type] || "📌"}</span>
          <span className="act-title">{a.title}</span>
        </div>
        <div className="act-meta">
          <span>{new Date(a.date).toLocaleDateString(t("date.locale"), { day: "numeric", month: "short" })}</span>
          <span className="dot-sep">·</span>
          <span>{a.time}</span>
          <span className="dot-sep">·</span>
          <span className="act-owner">{a.owner || a.ownerName}</span>
        </div>
        {a.address && <div className="act-addr">📍 {a.address}</div>}
        {a.note && <div className="act-note">{a.note}</div>}
        {a.result && <div className="act-res">🏆 {a.result}</div>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────
const HomeView = () => {
  const { user, family, activities, messages, familyMascot, setTab, toggleTheme, theme, t } = useApp();
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const todays = activities.filter((a) => a.date === todayStr).sort((a, b) => a.time.localeCompare(b.time));
  const allUpcoming = activities
    .filter((a) => a.date > todayStr)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const upcoming = showAllUpcoming ? allUpcoming : allUpcoming.slice(0, 3);

  return (
    <div className="page">
      <header className="hello-head">
        <div>
          <div className="kicker">{today.toLocaleDateString(t("date.locale"), { weekday: "long" })}</div>
          <h1 className="display-h1">{t("home.hello", { name: user?.name?.toLowerCase() || "familia" })}</h1>
        </div>
        <div className="head-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label={t("theme.toggle")}>
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <div className="family-badge" onClick={() => setTab("perfil")}>
            <Mascot name={familyMascot} size={48} />
          </div>
        </div>
      </header>

      <section className="strip">
        {family.slice(0, 5).map((m) => (
          <div key={m.id} className="strip-item">
            <Mascot name={m.mascot} size={52} />
            <span>{m.name}</span>
          </div>
        ))}
      </section>

      <section className="card-block">
        <div className="block-head">
          <h2 className="block-title">{t("home.today")}</h2>
          <span className="count-pill">{todays.length}</span>
        </div>
        {todays.length === 0 ? (
          <div className="empty-card">
            <Mascot name="bubu" size={64} />
            <p>{t("home.today.empty")}</p>
          </div>
        ) : (
          todays.map((a) => <ActivityRow key={a.id} a={a} />)
        )}
      </section>

      <section className="card-block">
        <div className="block-head">
          <h2 className="block-title">{t("home.upcoming")}</h2>
          {allUpcoming.length > 3 && (
            <button className="link-btn" onClick={() => setShowAllUpcoming((v) => !v)}>
              {showAllUpcoming ? t("close") : `${t("home.upcoming.all")} (${allUpcoming.length})`}
            </button>
          )}
        </div>
        {allUpcoming.length === 0 ? (
          <div className="empty-card"><p>{t("home.upcoming.empty")}</p></div>
        ) : (
          upcoming.map((a) => <ActivityRow key={a.id} a={a} />)
        )}
      </section>

      <section className="card-block">
        <div className="block-head">
          <h2 className="block-title">{t("home.messages")}</h2>
          <button className="link-btn" onClick={() => setTab("chat")}>{t("home.messages.all")}</button>
        </div>
        {messages.slice(-2).map((m) => (
          <div key={m.id} className="msg-mini">
            <Mascot name={m.mascot || "nubi"} size={36} />
            <div className="msg-mini-body">
              <div className="msg-mini-who">{m.who}</div>
              <div className="msg-mini-text">{m.text}</div>
            </div>
          </div>
        ))}
        {messages.length === 0 && <div className="empty-card"><p>{t("home.messages.empty")}</p></div>}
      </section>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// AGENDA
// ─────────────────────────────────────────────────────────────
const DayView = ({ day, acts }) => {
  const { t } = useApp();
  const ds = day.toISOString().slice(0, 10);
  const todays = acts.filter((a) => a.date === ds).sort((a, b) => a.time.localeCompare(b.time));
  if (todays.length === 0) {
    return (
      <div className="empty-card">
        <Mascot name="bubu" size={64} />
        <p>{t("agenda.day.empty")}</p>
      </div>
    );
  }
  return <div className="day-list">{todays.map((a) => <ActivityRow key={a.id} a={a} />)}</div>;
};

const WeekView = ({ day, acts }) => {
  const { setEditingActivity, t } = useApp();
  const ws = startOfWeek(day);
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  return (
    <div className="week-scroll">
      <div className="week-grid">
        {days.map((d) => {
          const ds = d.toISOString().slice(0, 10);
          const dayActs = acts.filter((a) => a.date === ds);
          const isT = sameDay(d, new Date());
          return (
            <div key={ds} className={`week-col ${isT ? "week-today" : ""}`}>
              <div className="week-lbl">
                <div className="week-dow">{d.toLocaleDateString(t("date.locale"), { weekday: "short" })}</div>
                <div className={`week-num ${isT ? "week-num-on" : ""}`}>{d.getDate()}</div>
              </div>
              {dayActs.map((a) => (
                <div key={a.id} className={`week-chip week-${a.type}`} onClick={() => setEditingActivity(a)}>
                  {a.time} {a.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const MonthView = ({ day, acts, setCursor, setView }) => {
  const { t } = useApp();
  const year = day.getFullYear();
  const month = day.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = (first.getDay() + 6) % 7;
  const cells = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: last.getDate() }, (_, i) => new Date(year, month, i + 1)),
  ];
  const weekdays = t("agenda.weekdays");
  return (
    <div className="month-grid-wrap">
      <div className="month-head">
        {weekdays.map((d) => (
          <div key={d} className="mh">{d}</div>
        ))}
      </div>
      <div className="month-grid">
        {cells.map((d, idx) => {
          if (!d) return <div key={`e-${idx}`} className="mc empty" />;
          const ds = d.toISOString().slice(0, 10);
          const dayActs = acts.filter((a) => a.date === ds);
          const isT = sameDay(d, new Date());
          return (
            <div
              key={ds}
              className={`mc ${isT ? "mc-today" : ""}`}
              onClick={() => { setCursor(d); setView("dia"); }}
            >
              <span className="mc-num">{d.getDate()}</span>
              {dayActs.length > 0 && (
                <div className="mc-dots">
                  {dayActs.slice(0, 2).map((a) => (
                    <div key={a.id} className={`mc-dot dot-${a.type}`} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AgendaView = () => {
  const { activities, t } = useApp();
  const [view, setView] = useState("dia");
  const [cursor, setCursor] = useState(new Date());

  const goToday = () => setCursor(new Date());
  const move = (delta) => {
    const d = new Date(cursor);
    if (view === "dia") d.setDate(d.getDate() + delta);
    if (view === "semana") d.setDate(d.getDate() + 7 * delta);
    if (view === "mes") d.setMonth(d.getMonth() + delta);
    setCursor(d);
  };

  const locale = t("date.locale");
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isToday = sameDay(cursor, new Date());
  const isThisWeek = view === "semana" && startOfWeek(cursor).getTime() === startOfWeek(today).getTime();
  const isThisMonth = view === "mes" && cursor.getMonth() === today.getMonth() && cursor.getFullYear() === today.getFullYear();
  const ctxLabel = view === "dia" ? (isToday ? t("agenda.today") : t("agenda.goto.today"))
    : view === "semana" ? (isThisWeek ? t("agenda.this.week") : t("agenda.goto.week"))
    : (isThisMonth ? t("agenda.this.month") : t("agenda.goto.month"));

  return (
    <div className="page">
      <header className="agenda-head">
        <h1 className="display-h1">{t("agenda.title")}</h1>
        <button className={`ctx-btn ${(isToday || isThisWeek || isThisMonth) ? "ctx-on" : ""}`} onClick={goToday}>{ctxLabel}</button>
      </header>

      <div className="seg-control">
        {[
          { key: "dia", label: t("agenda.view.day") },
          { key: "semana", label: t("agenda.view.week") },
          { key: "mes", label: t("agenda.view.month") },
        ].map(({ key, label }) => (
          <button key={key} className={`seg ${view === key ? "seg-on" : ""}`} onClick={() => setView(key)}>{label}</button>
        ))}
      </div>

      <div className="nav-row">
        <button className="round-btn" onClick={() => move(-1)}>‹</button>
        <div className="nav-label">
          {view === "dia" && fmtDate(cursor, locale)}
          {view === "semana" && (
            <>
              {startOfWeek(cursor).toLocaleDateString(locale, { day: "numeric", month: "short" })}
              {" — "}
              {addDays(startOfWeek(cursor), 6).toLocaleDateString(locale, { day: "numeric", month: "short" })}
            </>
          )}
          {view === "mes" && cursor.toLocaleDateString(locale, { month: "long", year: "numeric" })}
        </div>
        <button className="round-btn" onClick={() => move(1)}>›</button>
      </div>

      {view === "dia" && <DayView day={cursor} acts={activities} />}
      {view === "semana" && <WeekView day={cursor} acts={activities} />}
      {view === "mes" && <MonthView day={cursor} acts={activities} setCursor={setCursor} setView={setView} />}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// CHAT
// ─────────────────────────────────────────────────────────────
const ChatView = () => {
  const { familyData, user, messages, family, t } = useApp();
  const [text, setText] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!text.trim() || !familyData?.id) return;
    const msg = text.trim();
    setText("");
    await db.sendMessage({
      familyId: familyData.id,
      authorId: user.userId,
      authorName: user.name,
      authorMascot: user.mascot,
      text: msg,
    });
    db.sendPushNotification({
      familyId: familyData.id,
      title: user.name,
      body: msg,
      senderUserId: user.userId,
    }).catch(() => {});
  };

  return (
    <div className="page chat-page">
      <header className="chat-head">
        <h1 className="display-h1">{t("chat.title")}</h1>
        <div className="chat-pills">
          {family.slice(0, 4).map((m) => <Mascot key={m.id} name={m.mascot} size={28} />)}
        </div>
      </header>
      <div className="chat-stream">
        {messages.map((m) => {
          const mine = m.authorId === user?.userId;
          return (
            <div key={m.id} className={`bubble-row ${mine ? "mine" : ""}`}>
              {!mine && <Mascot name={m.mascot || "nubi"} size={36} />}
              <div className={`bubble ${mine ? "b-mine" : ""}`}>
                {!mine && <div className="b-who">{m.who}</div>}
                <div className="b-text">{m.text}</div>
                <div className="b-time">{new Date(m.t).toLocaleTimeString(t("date.locale"), { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="empty-card" style={{ marginTop: 40 }}>
            <Mascot name="momo" size={64} />
            <p>{t("chat.empty")}</p>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="chat-input">
        <input
          className="cozy-input flat"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("chat.ph")}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="send-btn" onClick={send}>↑</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// CARGAR ACTIVIDAD
// ─────────────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div className="field">
    <label className="lbl">{label}</label>
    {children}
  </div>
);

const LoadView = () => {
  const { familyData, user, setTab, t } = useApp();
  const [type, setType] = useState(null);
  const [form, setForm] = useState({});
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const reset = () => { setType(null); setForm({}); setDone(false); setErr(""); };
  const upd = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    if (!familyData?.id || saving) return;
    const missing =
      (type === "examen" && !form.subject?.trim()) ||
      (type === "voley" && !form.rival?.trim()) ||
      (type === "gimnasia" && !form.place?.trim()) ||
      !form.date || !form.time;
    if (missing) { setErr(t("validation.required")); return; }
    setErr("");
    setSaving(true);
    try {
      const title = form.title || (
        type === "examen" ? (form.subject || t("load.type.examen"))
        : type === "voley" ? `${t("load.type.voley")} vs ${form.rival || "?"}`
        : t("load.type.gimnasia")
      );
      const actDate = form.date || new Date().toISOString().slice(0, 10);
      const actTime = form.time || "09:00";
      const reminderAt = computeReminderAt(actDate, actTime, form.reminder ?? "15");
      await db.createActivity({
        familyId: familyData.id,
        type,
        title,
        date: actDate,
        time: actTime,
        ownerId: user.userId,
        ownerName: user.name,
        mascot: user.mascot,
        subject: form.subject,
        note: form.note,
        venue: form.venue,
        rival: form.rival,
        address: form.address,
        result: form.result,
        place: form.place,
        scoreSuelo: form.suelo,
        scoreViga: form.viga,
        scoreParalelas: form.paralelas,
        scoreSalto: form.salto,
        ...(reminderAt && { reminderAt, reminderSent: false }),
      });
      db.sendPushNotification({
        familyId: familyData.id,
        title: user.name,
        body: title,
        senderUserId: user.userId,
      }).catch(() => {});
      setDone(true);
    } catch (e) {
      setErr(e.message || t("error.generic"));
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="page center-page">
        <div className="success-card">
          <div className="floaty"><Mascot name="momo" size={120} /></div>
          <h2 className="display-h2">{t("load.success.title")}</h2>
          <p>{t("load.success.msg")}</p>
          <button className="primary-btn" onClick={reset}>{t("load.another")}</button>
          <button className="ghost-btn" onClick={() => { reset(); setTab("agenda"); }}>{t("load.goto.agenda")}</button>
        </div>
      </div>
    );
  }

  if (!type) {
    return (
      <div className="page">
        <header>
          <h1 className="display-h1">{t("load.title")}</h1>
          <p className="sub">{t("load.subtitle")}</p>
        </header>
        <div className="type-grid">
          <button className="type-card type-examen" onClick={() => setType("examen")}>
            <div className="type-icon">📝</div>
            <div className="type-name">{t("load.type.examen")}</div>
            <div className="type-mascot"><Mascot name="luma" size={56} /></div>
          </button>
          <button className="type-card type-voley" onClick={() => setType("voley")}>
            <div className="type-icon">🏐</div>
            <div className="type-name">{t("load.type.voley")}</div>
            <div className="type-mascot"><Mascot name="soli" size={56} /></div>
          </button>
          <button className="type-card type-gimnasia" onClick={() => setType("gimnasia")}>
            <div className="type-icon">🤸</div>
            <div className="type-name">{t("load.type.gimnasia")}</div>
            <div className="type-mascot"><Mascot name="momo" size={56} /></div>
          </button>
        </div>
      </div>
    );
  }

  const scoreKeys = [
    { k: "suelo", label: t("form.score.suelo") },
    { k: "viga",  label: t("form.score.viga") },
    { k: "paralelas", label: t("form.score.paralelas") },
    { k: "salto", label: t("form.score.salto") },
  ];

  return (
    <div className="page">
      <header className="form-head">
        <button className="back-btn" onClick={() => setType(null)}>{t("back")}</button>
        <h1 className="display-h1">{t(`load.type.${type}`)}</h1>
      </header>

      <div className="form-card">
        {type === "examen" && (
          <>
            <Field label={t("form.subject")}><input className="cozy-input" value={form.subject || ""} onChange={(e) => upd("subject", e.target.value)} placeholder={t("form.subject.ph")} /></Field>
            <div className="row-2">
              <Field label={t("form.date")}><input className="cozy-input" type="date" value={form.date || ""} onChange={(e) => upd("date", e.target.value)} /></Field>
              <Field label={t("form.time")}><input className="cozy-input" type="time" value={form.time || ""} onChange={(e) => upd("time", e.target.value)} /></Field>
            </div>
            <Field label={t("form.note")}><textarea className="cozy-input area" value={form.note || ""} onChange={(e) => upd("note", e.target.value)} placeholder={t("form.note.ph")} /></Field>
          </>
        )}

        {type === "voley" && (
          <>
            <div className="seg-control">
              <button className={`seg ${form.venue === "local" ? "seg-on" : ""}`} onClick={() => upd("venue", "local")}>{t("form.venue.local")}</button>
              <button className={`seg ${form.venue === "visitante" ? "seg-on" : ""}`} onClick={() => upd("venue", "visitante")}>{t("form.venue.away")}</button>
            </div>
            <Field label={t("form.rival")}><input className="cozy-input" value={form.rival || ""} onChange={(e) => upd("rival", e.target.value)} placeholder={t("form.rival.ph")} /></Field>
            <Field label={t("form.address")}><input className="cozy-input" value={form.address || ""} onChange={(e) => upd("address", e.target.value)} placeholder={t("form.address.ph")} /></Field>
            <div className="row-2">
              <Field label={t("form.date")}><input className="cozy-input" type="date" value={form.date || ""} onChange={(e) => upd("date", e.target.value)} /></Field>
              <Field label={t("form.time")}><input className="cozy-input" type="time" value={form.time || ""} onChange={(e) => upd("time", e.target.value)} /></Field>
            </div>
            <Field label={t("form.result")}><input className="cozy-input" value={form.result || ""} onChange={(e) => upd("result", e.target.value)} placeholder={t("form.result.ph")} /></Field>
          </>
        )}

        {type === "gimnasia" && (
          <>
            <Field label={t("form.place")}><input className="cozy-input" value={form.place || ""} onChange={(e) => upd("place", e.target.value)} placeholder={t("form.place.ph")} /></Field>
            <Field label={t("form.address")}><input className="cozy-input" value={form.address || ""} onChange={(e) => upd("address", e.target.value)} /></Field>
            <div className="row-2">
              <Field label={t("form.date")}><input className="cozy-input" type="date" value={form.date || ""} onChange={(e) => upd("date", e.target.value)} /></Field>
              <Field label={t("form.time")}><input className="cozy-input" type="time" value={form.time || ""} onChange={(e) => upd("time", e.target.value)} /></Field>
            </div>
            <div className="scores-grid">
              {scoreKeys.map(({ k, label }) => (
                <div key={k} className="score-cell">
                  <label>{label}</label>
                  <input className="cozy-input small" value={form[k] || ""} onChange={(e) => upd(k, e.target.value)} placeholder="—" />
                </div>
              ))}
            </div>
          </>
        )}

        <Field label={t("form.reminder")}>
          <select className="cozy-input" value={form.reminder ?? "15"} onChange={(e) => upd("reminder", e.target.value)}>
            <option value="0">{t("form.reminder.none")}</option>
            <option value="15">{t("form.reminder.15")}</option>
            <option value="30">{t("form.reminder.30")}</option>
            <option value="60">{t("form.reminder.60")}</option>
          </select>
        </Field>

        {err && <div className="err-pill">{err}</div>}
        <button className="primary-btn full" onClick={save} disabled={saving}>
          {saving ? t("form.saving") : t("load.save")}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// EDIT ACTIVITY VIEW
// ─────────────────────────────────────────────────────────────
const EditActivityView = () => {
  const { editingActivity, setEditingActivity, t } = useApp();
  const a = editingActivity;
  const [form, setForm] = useState({
    date: a.date || "",
    time: a.time || "",
    subject: a.subject || "",
    note: a.note || "",
    venue: a.venue || "",
    rival: a.rival || "",
    address: a.address || "",
    result: a.result || "",
    place: a.place || "",
    suelo: a.scoreSuelo || "",
    viga: a.scoreViga || "",
    paralelas: a.scoreParalelas || "",
    salto: a.scoreSalto || "",
    reminder: inferReminderMinutes(a.reminderAt, a.date, a.time),
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [err, setErr] = useState("");

  const upd = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    if (saving) return;
    setErr("");
    setSaving(true);
    try {
      const title =
        a.type === "examen" ? (form.subject || a.title)
        : a.type === "voley" ? `${t("load.type.voley")} vs ${form.rival || "?"}`
        : a.title;
      const reminderAt = computeReminderAt(form.date, form.time, form.reminder);
      await db.updateActivity(a.id, {
        title,
        date: form.date,
        time: form.time,
        subject: form.subject || null,
        note: form.note || null,
        venue: form.venue || null,
        rival: form.rival || null,
        address: form.address || null,
        result: form.result || null,
        place: form.place || null,
        scoreSuelo: form.suelo || null,
        scoreViga: form.viga || null,
        scoreParalelas: form.paralelas || null,
        scoreSalto: form.salto || null,
        ...(reminderAt && { reminderAt, reminderSent: false }),
      });
      setEditingActivity(null);
    } catch (e) {
      setErr(e.message || t("error.generic"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await db.deleteActivity(a.id);
      setEditingActivity(null);
    } catch (e) {
      setErr(e.message || t("error.generic"));
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const scoreKeys = [
    { k: "suelo", label: t("form.score.suelo") },
    { k: "viga",  label: t("form.score.viga") },
    { k: "paralelas", label: t("form.score.paralelas") },
    { k: "salto", label: t("form.score.salto") },
  ];

  return (
    <div className="page">
      <header className="form-head">
        <button className="back-btn" onClick={() => setEditingActivity(null)}>{t("back")}</button>
        <h1 className="display-h1">{t(`load.type.${a.type}`)}</h1>
      </header>

      <div className="act-owner-strip">
        <Mascot name={a.mascot || "nubi"} size={32} />
        <span className="act-owner-name">{a.ownerName || a.owner}</span>
      </div>

      <div className="form-card">
        {a.type === "examen" && (
          <>
            <Field label={t("form.subject")}><input className="cozy-input" value={form.subject} onChange={(e) => upd("subject", e.target.value)} placeholder={t("form.subject.ph")} /></Field>
            <div className="row-2">
              <Field label={t("form.date")}><input className="cozy-input" type="date" value={form.date} onChange={(e) => upd("date", e.target.value)} /></Field>
              <Field label={t("form.time")}><input className="cozy-input" type="time" value={form.time} onChange={(e) => upd("time", e.target.value)} /></Field>
            </div>
            <Field label={t("form.note")}><textarea className="cozy-input area" value={form.note} onChange={(e) => upd("note", e.target.value)} placeholder={t("form.note.ph")} /></Field>
          </>
        )}

        {a.type === "voley" && (
          <>
            <div className="seg-control">
              <button className={`seg ${form.venue === "local" ? "seg-on" : ""}`} onClick={() => upd("venue", "local")}>{t("form.venue.local")}</button>
              <button className={`seg ${form.venue === "visitante" ? "seg-on" : ""}`} onClick={() => upd("venue", "visitante")}>{t("form.venue.away")}</button>
            </div>
            <Field label={t("form.rival")}><input className="cozy-input" value={form.rival} onChange={(e) => upd("rival", e.target.value)} placeholder={t("form.rival.ph")} /></Field>
            <Field label={t("form.address")}><input className="cozy-input" value={form.address} onChange={(e) => upd("address", e.target.value)} placeholder={t("form.address.ph")} /></Field>
            <div className="row-2">
              <Field label={t("form.date")}><input className="cozy-input" type="date" value={form.date} onChange={(e) => upd("date", e.target.value)} /></Field>
              <Field label={t("form.time")}><input className="cozy-input" type="time" value={form.time} onChange={(e) => upd("time", e.target.value)} /></Field>
            </div>
            <Field label={t("form.result")}><input className="cozy-input" value={form.result} onChange={(e) => upd("result", e.target.value)} placeholder={t("form.result.ph")} /></Field>
          </>
        )}

        {a.type === "gimnasia" && (
          <>
            <Field label={t("form.place")}><input className="cozy-input" value={form.place} onChange={(e) => upd("place", e.target.value)} placeholder={t("form.place.ph")} /></Field>
            <Field label={t("form.address")}><input className="cozy-input" value={form.address} onChange={(e) => upd("address", e.target.value)} /></Field>
            <div className="row-2">
              <Field label={t("form.date")}><input className="cozy-input" type="date" value={form.date} onChange={(e) => upd("date", e.target.value)} /></Field>
              <Field label={t("form.time")}><input className="cozy-input" type="time" value={form.time} onChange={(e) => upd("time", e.target.value)} /></Field>
            </div>
            <div className="scores-grid">
              {scoreKeys.map(({ k, label }) => (
                <div key={k} className="score-cell">
                  <label>{label}</label>
                  <input className="cozy-input small" value={form[k]} onChange={(e) => upd(k, e.target.value)} placeholder="—" />
                </div>
              ))}
            </div>
          </>
        )}

        <Field label={t("form.reminder")}>
          <select className="cozy-input" value={form.reminder} onChange={(e) => upd("reminder", e.target.value)}>
            <option value="0">{t("form.reminder.none")}</option>
            <option value="15">{t("form.reminder.15")}</option>
            <option value="30">{t("form.reminder.30")}</option>
            <option value="60">{t("form.reminder.60")}</option>
          </select>
        </Field>

        {err && <div className="err-pill">{err}</div>}
        <button className="primary-btn full" onClick={save} disabled={saving || deleting}>
          {saving ? t("form.saving") : t("edit.save")}
        </button>

        {confirmDelete ? (
          <div className="delete-confirm">
            <p>{t("edit.delete.confirm")}</p>
            <div className="delete-confirm-btns">
              <button className="danger-btn" onClick={handleDelete} disabled={deleting}>
                {deleting ? t("edit.deleting") : t("edit.delete.yes")}
              </button>
              <button className="ghost-btn" onClick={() => setConfirmDelete(false)}>{t("cancel")}</button>
            </div>
          </div>
        ) : (
          <button className="ghost-btn full delete-ghost" onClick={() => setConfirmDelete(true)} disabled={saving || deleting}>
            {t("edit.delete")}
          </button>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// FAMILY SECTION (dentro de perfil)
// ─────────────────────────────────────────────────────────────
const FamilySection = () => {
  const { familyData, user, family, invites, setInvites, isAdmin, loadMembers, t } = useApp();
  const [showInvite, setShowInvite] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("miembro");
  const [inviteMascot, setInviteMascot] = useState("nubi");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [removingMember, setRemovingMember] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [cancelingInvite, setCancelingInvite] = useState(null);
  const [confirmKick, setConfirmKick] = useState(false);
  const [familyErr, setFamilyErr] = useState("");

  const createInvite = async () => {
    setInviteLoading(true);
    try {
      const inv = await db.createInvite({
        familyId: familyData.id,
        email: inviteEmail || undefined,
        role: inviteRole,
        mascotSuggested: inviteMascot,
        createdBy: user.userId,
      });
      const mapped = { id: inv.id, code: inv.code, email: inviteEmail || "—", mascot: inviteMascot, role: inviteRole };
      setInvites((prev) => [...prev, mapped]);
      setGeneratedCode(mapped);
    } catch (e) {
      setFamilyErr(e.message || t("error.generic"));
    } finally {
      setInviteLoading(false);
    }
  };

  const closeInvite = () => {
    setShowInvite(false);
    setGeneratedCode(null);
    setInviteEmail("");
    setInviteRole("miembro");
    setInviteMascot("nubi");
    setCopied(false);
  };

  const copyCode = () => {
    try {
      navigator.clipboard?.writeText(generatedCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };

  const handleRemoveMember = async (memberId) => {
    setRemovingMember(true);
    setFamilyErr("");
    try {
      const member = family.find((m) => m.id === memberId);
      if (member) {
        await db.removeMember(member.membershipId);
        await loadMembers(familyData.id, user.userId);
      }
      setEditingMember(null);
      setConfirmKick(false);
    } catch (e) {
      setFamilyErr(e.message || t("error.generic"));
    } finally {
      setRemovingMember(false);
    }
  };

  const handleUpdateRole = async (memberId, role) => {
    setUpdatingRole(true);
    setFamilyErr("");
    try {
      const member = family.find((m) => m.id === memberId);
      if (member) {
        await db.changeMemberRole(member.membershipId, role);
        await loadMembers(familyData.id, user.userId);
      }
      setEditingMember((prev) => prev ? { ...prev, role } : prev);
    } catch (e) {
      setFamilyErr(e.message || t("error.generic"));
    } finally {
      setUpdatingRole(false);
    }
  };

  const handleCancelInvite = async (code) => {
    setCancelingInvite(code);
    try {
      const invite = invites.find((i) => i.code === code);
      if (invite?.id) await db.cancelInvite(invite.id);
      setInvites((prev) => prev.filter((i) => i.code !== code));
    } catch (e) {
      setFamilyErr(e.message || t("error.generic"));
    } finally {
      setCancelingInvite(null);
    }
  };

  return (
    <div className="form-card">
      <div className="block-head">
        <h2 className="block-title">{t("family.members")}</h2>
        <span className="count-pill">{family.length}</span>
      </div>

      <div className="family-list">
        {family.map((m) => (
          <div key={m.id} className="fam-row">
            <div className="fam-mascot"><Mascot name={m.mascot} size={44} /></div>
            <div className="fam-body">
              <div className="fam-name">
                {m.name}
                {m.role === "admin" && <span className="admin-tag">{t("family.tag.admin")}</span>}
              </div>
              <div className="fam-email">{m.email}</div>
            </div>
            {isAdmin && m.id !== user?.userId && (
              <button className="fam-edit" onClick={() => setEditingMember(m)} aria-label={t("profile.edit")}>⋯</button>
            )}
            {m.id === user?.userId && <span className="fam-you">{t("family.tag.you")}</span>}
          </div>
        ))}
      </div>

      {invites.length > 0 && (
        <>
          <div className="invites-divider">{t("family.pending")}</div>
          {invites.map((i) => (
            <div key={i.code} className="invite-row">
              <div className="invite-mascot"><Mascot name={i.mascot} size={36} blink={false} /></div>
              <div className="invite-body">
                <div className="invite-code">{i.code}</div>
                <div className="invite-meta">{i.email} · {i.role}</div>
              </div>
              {isAdmin && (
                <button className="invite-cancel" onClick={() => handleCancelInvite(i.code)} disabled={cancelingInvite === i.code}>
                  {cancelingInvite === i.code ? "…" : t("family.cancel.invite")}
                </button>
              )}
            </div>
          ))}
        </>
      )}

      {isAdmin ? (
        <button className="ghost-btn full add-member-btn" onClick={() => setShowInvite(true)}>
          {t("family.invite.btn")}
        </button>
      ) : (
        <p className="admin-only-note">{t("family.admin.only")}</p>
      )}

      {showInvite && (
        <div className="modal-back" onClick={closeInvite}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {!generatedCode ? (
              <>
                <div className="modal-mascot floaty"><Mascot name="momo" size={88} /></div>
                <h3 className="modal-title">{t("family.invite.title")}</h3>
                <p className="modal-sub">{t("family.invite.sub")}</p>
                <div className="field">
                  <label className="lbl">{t("family.invite.email")}</label>
                  <input className="cozy-input" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder={t("family.invite.email.ph")} />
                </div>
                <label className="lbl">{t("family.invite.role")}</label>
                <div className="seg-control">
                  <button className={`seg ${inviteRole === "miembro" ? "seg-on" : ""}`} onClick={() => setInviteRole("miembro")}>{t("profile.role.member")}</button>
                  <button className={`seg ${inviteRole === "admin" ? "seg-on" : ""}`} onClick={() => setInviteRole("admin")}>{t("profile.role.admin")}</button>
                </div>
                <label className="lbl">{t("family.invite.mascot")}</label>
                <div className="mascot-grid">
                  {MASCOTS.map((m) => (
                    <button key={m} className={`mascot-pick ${inviteMascot === m ? "mp-on" : ""}`} onClick={() => setInviteMascot(m)}>
                      <Mascot name={m} size={44} />
                      <span>{MASCOT_LABELS[m]}</span>
                    </button>
                  ))}
                </div>
                {familyErr && <div className="err-pill">{familyErr}</div>}
                <button className="primary-btn full" onClick={createInvite} disabled={inviteLoading}>{inviteLoading ? t("loading.generating") : t("family.invite.gen")}</button>
                <button className="ghost-btn full" onClick={closeInvite} disabled={inviteLoading}>{t("cancel")}</button>
              </>
            ) : (
              <>
                <div className="modal-mascot floaty"><Mascot name={generatedCode.mascot} size={100} /></div>
                <h3 className="modal-title">{t("family.code.title")}</h3>
                <p className="modal-sub">{t("family.code.sub")}</p>
                <div className="code-display" onClick={copyCode}>
                  <span className="code-text">{generatedCode.code}</span>
                  <span className="code-copy">{copied ? t("family.code.copied") : t("family.code.tap")}</span>
                </div>
                <div className="code-meta">
                  <div><b>{t("family.code.for")}</b> {generatedCode.email}</div>
                  <div><b>{t("family.code.role")}</b> {generatedCode.role}</div>
                </div>
                <button className="primary-btn full" onClick={closeInvite}>{t("family.code.done")}</button>
              </>
            )}
          </div>
        </div>
      )}

      {editingMember && (
        <div className="modal-back" onClick={() => { setEditingMember(null); setConfirmKick(false); setFamilyErr(""); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-mascot"><Mascot name={editingMember.mascot} size={88} /></div>
            <h3 className="modal-title">{editingMember.name}</h3>
            <p className="modal-sub">{editingMember.email}</p>
            {!confirmKick ? (
              <>
                <label className="lbl">{t("family.edit.role")}</label>
                <div className="seg-control">
                  <button className={`seg ${editingMember.role === "miembro" ? "seg-on" : ""}`}
                    onClick={() => handleUpdateRole(editingMember.id, "miembro")} disabled={updatingRole}>{t("profile.role.member")}</button>
                  <button className={`seg ${editingMember.role === "admin" ? "seg-on" : ""}`}
                    onClick={() => handleUpdateRole(editingMember.id, "admin")} disabled={updatingRole}>{t("profile.role.admin")}</button>
                </div>
                {familyErr && <div className="err-pill">{familyErr}</div>}
                <button className="ghost-btn full" onClick={() => { setEditingMember(null); setFamilyErr(""); }} disabled={updatingRole}>{t("close")}</button>
                <button className="danger-btn full" onClick={() => setConfirmKick(true)} disabled={updatingRole}>{t("family.kick")}</button>
              </>
            ) : (
              <>
                <div className="delete-confirm">
                  <p>{t("family.kick.confirm", { name: editingMember.name })}</p>
                  <div className="delete-confirm-btns">
                    <button className="danger-btn" onClick={() => handleRemoveMember(editingMember.id)} disabled={removingMember}>
                      {removingMember ? t("form.saving") : t("edit.delete.yes")}
                    </button>
                    <button className="ghost-btn" onClick={() => setConfirmKick(false)} disabled={removingMember}>{t("cancel")}</button>
                  </div>
                </div>
                {familyErr && <div className="err-pill">{familyErr}</div>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────
const ProfileView = () => {
  const {
    user, setUser,
    familyData, setFamilyData,
    familyMascot, isAdmin,
    allFamilies, setAllFamilies,
    setFamily, loadMembers,
    setStage, setTab, t,
  } = useApp();

  const [name, setName] = useState(user?.name || "");
  const [mascot, setMascot] = useState(user?.mascot || "nubi");
  const [editingFamily, setEditingFamily] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinErr, setJoinErr] = useState("");
  const [showJoin, setShowJoin] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileErr, setProfileErr] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const [notifLoading, setNotifLoading] = useState(false);

  const save = async () => {
    setProfileErr("");
    setProfileSaving(true);
    try {
      await db.updateProfile(user.userId, { name, mascot });
      setUser((prev) => prev ? { ...prev, name, mascot } : prev);
    } catch (e) {
      setProfileErr(e.message || t("error.generic"));
    } finally {
      setProfileSaving(false);
    }
  };

  const handleFamilyMascot = async (m) => {
    if (!familyData?.id) return;
    const updated = await db.updateFamily(familyData.id, { mascot: m });
    setFamilyData(updated);
  };

  const switchFamily = async (targetFamilyId) => {
    const target = allFamilies.find((x) => x.family.id === targetFamilyId);
    if (!target) return;
    setFamilyData(target.family);
    setUser((prev) => prev ? { ...prev, role: target.membership.role } : prev);
    await loadMembers(targetFamilyId, user.userId);
  };

  const handleJoinAnother = async () => {
    if (!joinCode.trim()) { setJoinErr(t("validation.required")); return; }
    setJoinErr("");
    setJoinLoading(true);
    try {
      await db.consumeInvite({ code: joinCode.trim().toUpperCase(), userId: user.userId });
      const memberships = await db.getMyFamilies(user.userId);
      const famDataArr = await Promise.all(memberships.map((m) => db.getFamily(m.familyId)));
      const allFams = memberships.map((m, i) => ({ family: famDataArr[i], membership: m })).filter((x) => x.family);
      setAllFamilies(allFams);
      setJoinCode("");
      setShowJoin(false);
    } catch (e) {
      setJoinErr(e.message || t("profile.join.error"));
    } finally {
      setJoinLoading(false);
    }
  };

  const subscribeNotifications = async () => {
    setNotifLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setNotifPermission(perm);
      if (perm !== "granted") return;
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const { endpoint, keys: { p256dh, auth } } = sub.toJSON();
      for (const { family: fam } of allFamilies) {
        await db.savePushSubscription({ userId: user.userId, familyId: fam.id, endpoint, p256dh, auth });
      }
    } catch (e) {
      console.error("Push subscribe error:", e);
    } finally {
      setNotifLoading(false);
    }
  };

  const unsubscribeNotifications = async () => {
    setNotifLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
      for (const { family: fam } of allFamilies) {
        await db.deletePushSubscription(user.userId, fam.id);
      }
      setNotifPermission("default");
    } catch (e) {
      console.error("Push unsubscribe error:", e);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setFamilyData(null);
    setFamily([]);
    setAllFamilies([]);
    setTab("home");
    setStage("login");
  };

  return (
    <div className="page">
      <header className="profile-head">
        <h1 className="display-h1">{t("profile.title")}</h1>
        <LangToggle />
      </header>

      <div className="profile-hero">
        <div className="hero-mascot floaty"><Mascot name={mascot} size={140} /></div>
        <div className="hero-info">
          <div className="hero-name">{name || t("profile.no.name")}</div>
          <div className="hero-email">{user?.email}</div>
          <div className="role-pill">{user?.role || t("profile.role.member")}</div>
        </div>
      </div>

      <div className="form-card">
        <div className="field">
          <label className="lbl">{t("profile.name.label")}</label>
          <input className="cozy-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <label className="lbl">{t("profile.mascot.label")}</label>
        <div className="mascot-grid">
          {MASCOTS.map((m) => (
            <button key={m} className={`mascot-pick ${mascot === m ? "mp-on" : ""}`} onClick={() => setMascot(m)}>
              <Mascot name={m} size={56} />
              <span>{MASCOT_LABELS[m]}</span>
            </button>
          ))}
        </div>
        {profileErr && <div className="err-pill">{profileErr}</div>}
        <button className="primary-btn full" onClick={save} disabled={profileSaving}>{profileSaving ? t("form.saving") : t("profile.save")}</button>
      </div>

      {/* Mis familias */}
      <div className="form-card">
        <div className="block-head">
          <h2 className="block-title">{t("profile.families")}</h2>
          <span className="count-pill">{allFamilies.length}</span>
        </div>
        {allFamilies.map(({ family: fam, membership }) => (
          <div key={fam.id} className="fam-row">
            <div className="fam-mascot"><Mascot name={fam.mascot} size={44} /></div>
            <div className="fam-body">
              <div className="fam-name">{fam.name}</div>
              <div className="fam-email">{membership.role}</div>
            </div>
            {fam.id === familyData?.id
              ? <span className="fam-you">{t("profile.active")}</span>
              : <button className="link-btn" onClick={() => switchFamily(fam.id)}>{t("profile.switch")}</button>
            }
          </div>
        ))}

        {!showJoin ? (
          <button className="ghost-btn full add-member-btn" onClick={() => setShowJoin(true)}>
            {t("profile.join")}
          </button>
        ) : (
          <div style={{ marginTop: 12 }}>
            <label className="lbl">{t("profile.join.code")}</label>
            <input
              className="cozy-input"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder={t("profile.join.ph")}
              style={{ textTransform: "uppercase" }}
              onKeyDown={(e) => e.key === "Enter" && handleJoinAnother()}
            />
            {joinErr && <div className="err-pill">{joinErr}</div>}
            <div className="row-2" style={{ marginTop: 8 }}>
              <button className="ghost-btn" onClick={() => { setShowJoin(false); setJoinCode(""); setJoinErr(""); }} disabled={joinLoading}>{t("cancel")}</button>
              <button className="primary-btn" onClick={handleJoinAnother} disabled={joinLoading}>{joinLoading ? t("loading.joining") : t("profile.join.submit")}</button>
            </div>
          </div>
        )}
      </div>

      {/* Mascota del nidito activo */}
      <div className="form-card">
        <div className="block-head">
          <h2 className="block-title">{t("profile.fam.mascot", { name: familyData?.name || "" })}</h2>
          {isAdmin && <button className="link-btn" onClick={() => setEditingFamily(!editingFamily)}>{editingFamily ? t("profile.done") : t("profile.edit")}</button>}
        </div>
        {!editingFamily ? (
          <div className="family-current">
            <Mascot name={familyMascot} size={88} />
            <div>
              <div className="hero-name">{MASCOT_LABELS[familyMascot] || familyMascot}</div>
              <div className="hero-email">{t("profile.fam.mascot.desc")}</div>
            </div>
          </div>
        ) : (
          <div className="mascot-grid">
            {MASCOTS.map((m) => (
              <button key={m} className={`mascot-pick ${familyMascot === m ? "mp-on" : ""}`} onClick={() => handleFamilyMascot(m)}>
                <Mascot name={m} size={56} />
                <span>{MASCOT_LABELS[m]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="form-card permissions">
        <h2 className="block-title">{t("profile.permissions")}</h2>
        <div className="perm-row"><span>{t("profile.status")}</span><span className="perm-val ok">{t("profile.status.val")}</span></div>
        <div className="perm-row"><span>{t("profile.role")}</span><span className="perm-val">{user?.role}</span></div>
        <div className="perm-row"><span>{t("profile.active.fam")}</span><span className="perm-val">{familyData?.name}</span></div>
      </div>

      <FamilySection />

      {notifPermission !== "unsupported" && (
        <div className="form-card">
          <div className="block-head">
            <h2 className="block-title">{t("notif.title")}</h2>
            {notifPermission === "granted" && <span className="fam-you">✓</span>}
          </div>
          {notifPermission === "granted" ? (
            <>
              <p className="sub">{t("notif.enabled")}</p>
              <button className="ghost-btn full" onClick={unsubscribeNotifications} disabled={notifLoading}>
                {notifLoading ? t("form.saving") : t("notif.disable")}
              </button>
            </>
          ) : notifPermission === "denied" ? (
            <p className="sub">{t("notif.denied")}</p>
          ) : (
            <>
              <p className="sub">{t("notif.subtitle")}</p>
              <button className="primary-btn full" onClick={subscribeNotifications} disabled={notifLoading}>
                {notifLoading ? t("loading.creating") : t("notif.enable")}
              </button>
            </>
          )}
        </div>
      )}

      <button className="logout-btn" onClick={handleLogout}>{t("profile.logout")}</button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────
const Nav = () => {
  const { tab, setTab, editingActivity, setEditingActivity, t } = useApp();
  const items = [
    { id: "home",   label: t("nav.home"),    icon: "🏠" },
    { id: "chat",   label: t("nav.chat"),    icon: "💬" },
    { id: "cargar", label: t("nav.load"),    icon: "✨", big: true },
    { id: "perfil", label: t("nav.profile"), icon: "🌸" },
    { id: "agenda", label: t("nav.agenda"),  icon: "📅" },
  ];
  const handleNav = (id) => {
    if (editingActivity) setEditingActivity(null);
    setTab(id);
  };
  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <button
          key={it.id}
          className={`nav-item ${tab === it.id && !editingActivity ? "nav-on" : ""} ${it.big ? "nav-big" : ""}`}
          onClick={() => handleNav(it.id)}
        >
          <span className="nav-icon">{it.icon}</span>
          <span className="nav-lbl">{it.label}</span>
        </button>
      ))}
    </nav>
  );
};

// ─────────────────────────────────────────────────────────────
// APP — solo maneja estado y provee contexto
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [sessionKey, setSessionKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stage, setStage] = useState("loading");
  const [user, setUser] = useState(null);
  const [familyData, setFamilyData] = useState(null);
  const [allFamilies, setAllFamilies] = useState([]);
  const [tab, setTab] = useState("home");
  const [editingActivity, setEditingActivity] = useState(null);
  const [lang, setLang] = useState(() => localStorage.getItem("cozy-lang") || "es");

  const handleSetLang = (l) => {
    setLang(l);
    localStorage.setItem("cozy-lang", l);
  };
  const t = (key, vars) => i18nT(lang, key, vars);
  const [activities, setActivities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [family, setFamily] = useState([]);
  const [invites, setInvites] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem("cozy-theme") || "light");

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("cozy-theme", next);
  };

  const isAdmin = user?.role === "admin";
  const familyMascot = familyData?.mascot ?? "nubi";

  // ── Bootstrap ──────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      try {
        const cog = await getCurrentUser();
        if (cancelled) return;

        let profile = await db.getMyProfile(cog.userId);
        if (!profile) {
          profile = await db.createProfile({
            userId: cog.userId,
            email: cog.signInDetails?.loginId ?? cog.userId,
            name: (cog.signInDetails?.loginId ?? cog.userId).split("@")[0],
          });
        }
        if (cancelled) return;

        const memberships = await db.getMyFamilies(cog.userId);

        if (memberships.length > 0) {
          const famDataArr = await Promise.all(memberships.map((m) => db.getFamily(m.familyId)));
          const allFams = memberships
            .map((m, i) => ({ family: famDataArr[i], membership: m }))
            .filter((x) => x.family);

          if (cancelled) return;
          setAllFamilies(allFams);

          const fam = famDataArr[0];
          const myMembership = memberships[0];
          setFamilyData(fam);
          setUser({
            userId: cog.userId,
            email: cog.signInDetails?.loginId ?? cog.userId,
            name: profile.name,
            mascot: profile.mascot ?? "nubi",
            role: myMembership.role,
          });

          await loadMembers(fam.id, cog.userId, cancelled);
          const invs = await db.listFamilyInvites(fam.id);
          if (!cancelled) {
            setInvites(invs.map((i) => ({
              id: i.id, code: i.code,
              email: i.email || "—",
              mascot: i.mascotSuggested || "nubi",
              role: i.role,
              createdAt: i.createdAt,
            })));
            const done = localStorage.getItem("cozy-onboarding-done");
            setStage(done ? "app" : "onboarding");
          }
        } else {
          if (!cancelled) {
            setUser({
              userId: cog.userId,
              email: cog.signInDetails?.loginId ?? cog.userId,
              name: profile.name,
              mascot: profile.mascot ?? "nubi",
              role: "miembro",
            });
            setStage("nofamily");
          }
        }
      } catch {
        if (!cancelled) setStage("login");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [sessionKey]);

  // ── Subscriptions ──────────────────────────────────────────
  useEffect(() => {
    if (!familyData?.id) return;
    const subA = db.subscribeActivities(familyData.id, (items) => {
      setActivities(items.map((a) => ({ ...a, owner: a.ownerName })));
    });
    const subM = db.subscribeMessages(familyData.id, (items) => {
      const sorted = [...items].sort((a, b) =>
        (a.createdAt || "").localeCompare(b.createdAt || ""),
      );
      setMessages(sorted.map((m) => ({
        ...m,
        who: m.authorName,
        mascot: m.authorMascot,
        t: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
      })));
    });
    return () => { subA.unsubscribe(); subM.unsubscribe(); };
  }, [familyData?.id]);

  async function loadMembers(familyId, myUserId, cancelled = false) {
    const mems = await db.listFamilyMembers(familyId);
    const profiles = await Promise.all(mems.map((m) => db.getMyProfile(m.userId)));
    if (cancelled) return;
    const normalized = mems.map((m, i) => ({
      id: m.userId,
      membershipId: m.id,
      name: profiles[i]?.name ?? m.userId,
      email: profiles[i]?.email ?? "",
      mascot: profiles[i]?.mascot ?? "nubi",
      role: m.role,
      status: m.status ?? "activo",
    }));
    setFamily(normalized);
    const mine = normalized.find((m) => m.id === myUserId);
    if (mine) setUser((prev) => prev ? { ...prev, role: mine.role } : prev);
  }

  function refreshSession() {
    setSessionKey((k) => k + 1);
  }

  // ── Context value ──────────────────────────────────────────
  const ctxValue = {
    user, setUser,
    familyData, setFamilyData,
    allFamilies, setAllFamilies,
    family, setFamily,
    activities, messages,
    invites, setInvites,
    tab, setTab,
    editingActivity, setEditingActivity,
    lang, setLang: handleSetLang, t,
    theme, toggleTheme,
    stage, setStage,
    isAdmin, familyMascot,
    refreshSession, loadMembers,
  };

  if (loading || stage === "loading") {
    return (
      <div className="cozy-root" data-theme={theme}>
        <div className="paper-bg" />
        <div className="login-wrap">
          <div className="floaty"><Mascot name="nubi" size={100} /></div>
        </div>
      </div>
    );
  }

  return (
    <AppCtx.Provider value={ctxValue}>
      <div className="cozy-root" data-theme={theme}>
        <div className="paper-bg" />
        {stage === "login"      && <LoginView />}
        {stage === "onboarding" && <OnboardingView />}
        {stage === "nofamily"   && <NoFamilyView />}
        {stage === "app"        && (
          <>
            <main className="screen">
              {editingActivity ? (
                <EditActivityView />
              ) : (
                <>
                  {tab === "home"   && <HomeView />}
                  {tab === "chat"   && <ChatView />}
                  {tab === "cargar" && <LoadView />}
                  {tab === "perfil" && <ProfileView />}
                  {tab === "agenda" && <AgendaView />}
                </>
              )}
            </main>
            <Nav />
          </>
        )}
      </div>
    </AppCtx.Provider>
  );
}
