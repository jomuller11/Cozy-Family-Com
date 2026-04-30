import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import {
  confirmSignUp,
  getCurrentUser,
  signIn,
  signOut,
  signUp,
} from "aws-amplify/auth";
import * as db from "./lib/data";

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

const MASCOTS = ["nubi", "soli", "luma", "bubu", "pipo", "mishi", "toto", "momo"];
const MASCOT_LABELS = {
  nubi: "Nubi", soli: "Soli", luma: "Luma", bubu: "Bubu",
  pipo: "Pipo", mishi: "Mishi", toto: "Toto", momo: "Momo",
};

const fmtDate = (d) =>
  d.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
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
// LOGIN
// ─────────────────────────────────────────────────────────────
const LoginView = () => {
  const { refreshSession, toggleTheme, theme } = useApp();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  const tryLogin = async () => {
    setErr("");
    try {
      await signIn({ username: email.trim(), password: pass });
      refreshSession();
    } catch (e) {
      setErr(e.message || "Email o contraseña incorrectos.");
    }
  };

  const tryRegister = async () => {
    setErr("");
    try {
      await signUp({
        username: email.trim(),
        password: pass,
        options: { userAttributes: { email: email.trim() } },
      });
      setMode("confirm");
    } catch (e) {
      setErr(e.message || "Error al crear la cuenta.");
    }
  };

  const tryConfirm = async () => {
    setErr("");
    try {
      await confirmSignUp({ username: email.trim(), confirmationCode: code.trim() });
      await signIn({ username: email.trim(), password: pass });
      refreshSession();
    } catch (e) {
      setErr(e.message || "Código incorrecto.");
    }
  };

  return (
    <div className="login-wrap">
      <button className="theme-toggle login-theme" onClick={toggleTheme} aria-label="cambiar tema">
        {theme === "light" ? "🌙" : "☀️"}
      </button>
      <div className="paper-card login-card">
        <div className="logo-row">
          <div className="logo-blob"><Mascot name="nubi" size={56} /></div>
          <div className="logo-blob blob-2"><Mascot name="soli" size={56} /></div>
          <div className="logo-blob blob-3"><Mascot name="momo" size={56} /></div>
        </div>
        <h1 className="display-title">Cozy<span className="amp">&amp;</span>Casa</h1>
        <p className="tagline">la familia, en un mismo nidito</p>

        {mode === "login" && (
          <>
            <label className="lbl">tu email</label>
            <input className="cozy-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vos@email.com" />
            <label className="lbl">contraseña</label>
            <input className="cozy-input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••" />
            {err && <div className="err-pill">{err}</div>}
            <button className="primary-btn" onClick={tryLogin}>entrar al nidito →</button>
            <div className="alt-row">
              <span>nuevo por acá?</span>
              <button className="link-btn" onClick={() => { setMode("register"); setErr(""); }}>crear cuenta</button>
            </div>
          </>
        )}

        {mode === "register" && (
          <>
            <label className="lbl">email</label>
            <input className="cozy-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vos@email.com" />
            <label className="lbl">contraseña</label>
            <input className="cozy-input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="mínimo 8 caracteres" />
            {err && <div className="err-pill">{err}</div>}
            <button className="primary-btn" onClick={tryRegister}>crear cuenta →</button>
            <div className="alt-row">
              <span>ya tenés?</span>
              <button className="link-btn" onClick={() => { setMode("login"); setErr(""); }}>entrar</button>
            </div>
          </>
        )}

        {mode === "confirm" && (
          <>
            <p className="confirm-msg">te mandamos un código a <b>{email}</b></p>
            <label className="lbl">código de confirmación</label>
            <input className="cozy-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
            {err && <div className="err-pill">{err}</div>}
            <button className="primary-btn" onClick={tryConfirm}>confirmar →</button>
          </>
        )}
      </div>
      <div className="login-foot">hecho con 🧶 para la familia</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ONBOARDING
// ─────────────────────────────────────────────────────────────
const OnboardingView = () => {
  const { setStage } = useApp();
  const slides = [
    { mascot: "nubi", title: "bienvenidx a Cozy&Casa", text: "el lugar donde todo lo de la familia vive cómodo: chats, agenda y novedades, todo en un mismo nidito." },
    { mascot: "soli", title: "agenda familiar", text: "exámenes, partidos, gimnasia. todo en un solo lugar para que nadie se pierda nada." },
    { mascot: "momo", title: "chat en tiempo real", text: "mandá mensajes, compartí resultados. todo actualizado para todos al instante." },
  ];
  const [i, setI] = useState(0);
  const finish = () => {
    localStorage.setItem("cozy-onboarding-done", "1");
    setStage("app");
  };

  return (
    <div className="onb-wrap">
      <button className="skip-btn" onClick={finish}>saltar</button>
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
        <button className="ghost-btn" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>atrás</button>
        <button className="primary-btn" onClick={() => { if (i < slides.length - 1) setI(i + 1); else finish(); }}>
          {i === slides.length - 1 ? "empezar" : "siguiente"}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// NO FAMILY
// ─────────────────────────────────────────────────────────────
const NoFamilyView = () => {
  const { user, setUser, setFamilyData, setAllFamilies, setStage, toggleTheme, theme, loadMembers } = useApp();
  const [view, setView] = useState("choose");
  const [name, setName] = useState("");
  const [mascot, setMascot] = useState("nubi");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) return;
    setErr("");
    try {
      const fam = await db.createFamily({ name: name.trim(), mascot, createdBy: user.userId });
      setFamilyData(fam);
      setAllFamilies([{ family: fam, membership: { role: "admin", status: "activo" } }]);
      setUser((prev) => prev ? { ...prev, role: "admin" } : prev);
      await loadMembers(fam.id, user.userId);
      localStorage.setItem("cozy-onboarding-done", "1");
      setStage("app");
    } catch (e) {
      setErr(e.message || "Error al crear la familia.");
    }
  };

  const handleJoin = async () => {
    if (!code.trim()) return;
    setErr("");
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
      setErr(e.message || "Código inválido o expirado.");
    }
  };

  return (
    <div className="login-wrap">
      <button className="theme-toggle login-theme" onClick={toggleTheme} aria-label="cambiar tema">
        {theme === "light" ? "🌙" : "☀️"}
      </button>
      <div className="paper-card login-card">
        <div className="logo-row">
          <div className="logo-blob"><Mascot name={user?.mascot || "nubi"} size={80} /></div>
        </div>
        <h1 className="display-title">hola, <span className="amp">{user?.name?.toLowerCase()}</span></h1>
        <p className="tagline">todavía no estás en ningún nidito</p>

        {view === "choose" && (
          <>
            <button className="primary-btn" style={{ marginTop: 8 }} onClick={() => setView("create")}>crear mi nidito →</button>
            <button className="ghost-btn" style={{ marginTop: 12, width: "100%" }} onClick={() => setView("join")}>unirme con código</button>
          </>
        )}

        {view === "create" && (
          <>
            <label className="lbl">nombre de la familia</label>
            <input className="cozy-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Familia Arias..." />
            <label className="lbl">mascota del grupo</label>
            <div className="mascot-grid">
              {MASCOTS.map((m) => (
                <button key={m} className={`mascot-pick ${mascot === m ? "mp-on" : ""}`} onClick={() => setMascot(m)}>
                  <Mascot name={m} size={44} />
                  <span>{MASCOT_LABELS[m]}</span>
                </button>
              ))}
            </div>
            {err && <div className="err-pill">{err}</div>}
            <button className="primary-btn full" onClick={handleCreate}>crear nidito →</button>
            <button className="ghost-btn full" style={{ marginTop: 8 }} onClick={() => setView("choose")}>volver</button>
          </>
        )}

        {view === "join" && (
          <>
            <label className="lbl">código de invitación</label>
            <input className="cozy-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ABC-XYZ" style={{ textTransform: "uppercase" }} />
            {err && <div className="err-pill">{err}</div>}
            <button className="primary-btn full" onClick={handleJoin}>unirme →</button>
            <button className="ghost-btn full" style={{ marginTop: 8 }} onClick={() => setView("choose")}>volver</button>
          </>
        )}
      </div>
      <div className="login-foot">hecho con 🧶 para la familia</div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ACTIVITY ROW
// ─────────────────────────────────────────────────────────────
const ActivityRow = ({ a }) => {
  const icons = { examen: "📝", voley: "🏐", gimnasia: "🤸" };
  return (
    <div className={`act-row act-${a.type}`}>
      <div className="act-mascot"><Mascot name={a.mascot || "nubi"} size={44} /></div>
      <div className="act-body">
        <div className="act-top">
          <span className="act-icon">{icons[a.type] || "📌"}</span>
          <span className="act-title">{a.title}</span>
        </div>
        <div className="act-meta">
          <span>{new Date(a.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</span>
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
  const { user, family, activities, messages, familyMascot, setTab, toggleTheme, theme } = useApp();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const todays = activities.filter((a) => a.date === todayStr).sort((a, b) => a.time.localeCompare(b.time));
  const upcoming = activities
    .filter((a) => a.date > todayStr)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, 3);

  return (
    <div className="page">
      <header className="hello-head">
        <div>
          <div className="kicker">{today.toLocaleDateString("es-AR", { weekday: "long" })}</div>
          <h1 className="display-h1">hola, {user?.name?.toLowerCase() || "familia"}</h1>
        </div>
        <div className="head-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="cambiar tema">
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
          <h2 className="block-title">hoy en casa</h2>
          <span className="count-pill">{todays.length}</span>
        </div>
        {todays.length === 0 ? (
          <div className="empty-card">
            <Mascot name="bubu" size={64} />
            <p>nada en agenda para hoy. respirá tranqui 🌿</p>
          </div>
        ) : (
          todays.map((a) => <ActivityRow key={a.id} a={a} />)
        )}
      </section>

      <section className="card-block">
        <div className="block-head"><h2 className="block-title">se viene</h2></div>
        {upcoming.length === 0 ? (
          <div className="empty-card"><p>sin eventos próximos.</p></div>
        ) : (
          upcoming.map((a) => <ActivityRow key={a.id} a={a} />)
        )}
      </section>

      <section className="card-block">
        <div className="block-head">
          <h2 className="block-title">últimos mensajes</h2>
          <button className="link-btn" onClick={() => setTab("chat")}>ver todos</button>
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
        {messages.length === 0 && <div className="empty-card"><p>todavía no hay mensajes 💬</p></div>}
      </section>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// AGENDA
// ─────────────────────────────────────────────────────────────
const DayView = ({ day, acts }) => {
  const ds = day.toISOString().slice(0, 10);
  const todays = acts.filter((a) => a.date === ds).sort((a, b) => a.time.localeCompare(b.time));
  if (todays.length === 0) {
    return (
      <div className="empty-card">
        <Mascot name="bubu" size={64} />
        <p>sin eventos para este día 🌿</p>
      </div>
    );
  }
  return <div className="day-list">{todays.map((a) => <ActivityRow key={a.id} a={a} />)}</div>;
};

const WeekView = ({ day, acts }) => {
  const ws = startOfWeek(day);
  const days = Array.from({ length: 7 }, (_, i) => addDays(ws, i));
  return (
    <div className="week-grid">
      {days.map((d) => {
        const ds = d.toISOString().slice(0, 10);
        const dayActs = acts.filter((a) => a.date === ds);
        const isT = sameDay(d, new Date());
        return (
          <div key={ds} className={`week-col ${isT ? "week-today" : ""}`}>
            <div className="week-lbl">
              <div className="week-dow">{d.toLocaleDateString("es-AR", { weekday: "short" })}</div>
              <div className={`week-num ${isT ? "week-num-on" : ""}`}>{d.getDate()}</div>
            </div>
            {dayActs.map((a) => (
              <div key={a.id} className={`week-chip week-${a.type}`}>
                {a.time} {a.title}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

const MonthView = ({ day, acts, setCursor, setView }) => {
  const year = day.getFullYear();
  const month = day.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = (first.getDay() + 6) % 7;
  const cells = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: last.getDate() }, (_, i) => new Date(year, month, i + 1)),
  ];
  return (
    <div className="month-wrap">
      <div className="month-head">
        {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((d) => (
          <div key={d} className="month-dow">{d}</div>
        ))}
      </div>
      <div className="month-grid">
        {cells.map((d, idx) => {
          if (!d) return <div key={`e-${idx}`} className="month-cell empty" />;
          const ds = d.toISOString().slice(0, 10);
          const dayActs = acts.filter((a) => a.date === ds);
          const isT = sameDay(d, new Date());
          return (
            <div
              key={ds}
              className={`month-cell ${isT ? "month-today" : ""} ${dayActs.length ? "month-has" : ""}`}
              onClick={() => { setCursor(d); setView("dia"); }}
            >
              <span className="month-num">{d.getDate()}</span>
              {dayActs.slice(0, 2).map((a) => (
                <div key={a.id} className={`month-dot month-dot-${a.type}`} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const AgendaView = () => {
  const { activities } = useApp();
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

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isToday = sameDay(cursor, new Date());
  const isThisWeek = view === "semana" && startOfWeek(cursor).getTime() === startOfWeek(today).getTime();
  const isThisMonth = view === "mes" && cursor.getMonth() === today.getMonth() && cursor.getFullYear() === today.getFullYear();
  const ctxLabel = view === "dia" ? (isToday ? "hoy" : "ir a hoy")
    : view === "semana" ? (isThisWeek ? "esta semana" : "ir a esta semana")
    : (isThisMonth ? "este mes" : "ir a este mes");

  return (
    <div className="page">
      <header className="agenda-head">
        <h1 className="display-h1">agenda</h1>
        <button className={`ctx-btn ${(isToday || isThisWeek || isThisMonth) ? "ctx-on" : ""}`} onClick={goToday}>{ctxLabel}</button>
      </header>

      <div className="seg-control">
        {["dia", "semana", "mes"].map((v) => (
          <button key={v} className={`seg ${view === v ? "seg-on" : ""}`} onClick={() => setView(v)}>{v}</button>
        ))}
      </div>

      <div className="nav-row">
        <button className="round-btn" onClick={() => move(-1)}>‹</button>
        <div className="nav-label">
          {view === "dia" && fmtDate(cursor)}
          {view === "semana" && (
            <>
              {startOfWeek(cursor).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
              {" — "}
              {addDays(startOfWeek(cursor), 6).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
            </>
          )}
          {view === "mes" && cursor.toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
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
  const { familyData, user, messages, family } = useApp();
  const [text, setText] = useState("");
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!text.trim() || !familyData?.id) return;
    const t = text.trim();
    setText("");
    await db.sendMessage({
      familyId: familyData.id,
      authorId: user.userId,
      authorName: user.name,
      authorMascot: user.mascot,
      text: t,
    });
  };

  return (
    <div className="page chat-page">
      <header className="chat-head">
        <h1 className="display-h1">chat familiar</h1>
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
                <div className="b-time">{new Date(m.t).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="empty-card" style={{ marginTop: 40 }}>
            <Mascot name="momo" size={64} />
            <p>todavía no hay mensajes. ¡empezá vos! 💬</p>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="chat-input">
        <input
          className="cozy-input flat"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="escribí algo cozy..."
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
  const { familyData, user, setTab } = useApp();
  const [type, setType] = useState(null);
  const [form, setForm] = useState({});
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);

  const reset = () => { setType(null); setForm({}); setDone(false); };
  const upd = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    if (!familyData?.id || saving) return;
    setSaving(true);
    try {
      const title = form.title || (
        type === "examen" ? (form.subject || "Examen")
        : type === "voley" ? `Voley vs ${form.rival || "?"}`
        : "Gimnasia"
      );
      await db.createActivity({
        familyId: familyData.id,
        type,
        title,
        date: form.date || new Date().toISOString().slice(0, 10),
        time: form.time || "09:00",
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
      });
      setDone(true);
    } catch (e) {
      console.error("Error saving activity:", e);
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="page center-page">
        <div className="success-card">
          <div className="floaty"><Mascot name="momo" size={120} /></div>
          <h2 className="display-h2">guardado!</h2>
          <p>todos en la familia ya lo pueden ver.</p>
          <button className="primary-btn" onClick={reset}>cargar otra</button>
          <button className="ghost-btn" onClick={() => { reset(); setTab("agenda"); }}>ir a la agenda →</button>
        </div>
      </div>
    );
  }

  if (!type) {
    return (
      <div className="page">
        <header>
          <h1 className="display-h1">cargar algo</h1>
          <p className="sub">qué tenemos hoy?</p>
        </header>
        <div className="type-grid">
          <button className="type-card type-examen" onClick={() => setType("examen")}>
            <div className="type-icon">📝</div>
            <div className="type-name">examen</div>
            <div className="type-mascot"><Mascot name="luma" size={56} /></div>
          </button>
          <button className="type-card type-voley" onClick={() => setType("voley")}>
            <div className="type-icon">🏐</div>
            <div className="type-name">voley</div>
            <div className="type-mascot"><Mascot name="soli" size={56} /></div>
          </button>
          <button className="type-card type-gimnasia" onClick={() => setType("gimnasia")}>
            <div className="type-icon">🤸</div>
            <div className="type-name">gimnasia</div>
            <div className="type-mascot"><Mascot name="momo" size={56} /></div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="form-head">
        <button className="back-btn" onClick={() => setType(null)}>← volver</button>
        <h1 className="display-h1">{type}</h1>
      </header>

      <div className="form-card">
        {type === "examen" && (
          <>
            <Field label="materia"><input className="cozy-input" value={form.subject || ""} onChange={(e) => upd("subject", e.target.value)} placeholder="matemática..." /></Field>
            <div className="row-2">
              <Field label="fecha"><input className="cozy-input" type="date" value={form.date || ""} onChange={(e) => upd("date", e.target.value)} /></Field>
              <Field label="hora"><input className="cozy-input" type="time" value={form.time || ""} onChange={(e) => upd("time", e.target.value)} /></Field>
            </div>
            <Field label="nota (opcional)"><textarea className="cozy-input area" value={form.note || ""} onChange={(e) => upd("note", e.target.value)} placeholder="qué entra, tips..." /></Field>
          </>
        )}

        {type === "voley" && (
          <>
            <div className="seg-control">
              <button className={`seg ${form.venue === "local" ? "seg-on" : ""}`} onClick={() => upd("venue", "local")}>local</button>
              <button className={`seg ${form.venue === "visitante" ? "seg-on" : ""}`} onClick={() => upd("venue", "visitante")}>visitante</button>
            </div>
            <Field label="club rival"><input className="cozy-input" value={form.rival || ""} onChange={(e) => upd("rival", e.target.value)} placeholder="River, Ferro..." /></Field>
            <Field label="dirección"><input className="cozy-input" value={form.address || ""} onChange={(e) => upd("address", e.target.value)} placeholder="Av. Siempreviva 742" /></Field>
            <div className="row-2">
              <Field label="fecha"><input className="cozy-input" type="date" value={form.date || ""} onChange={(e) => upd("date", e.target.value)} /></Field>
              <Field label="hora"><input className="cozy-input" type="time" value={form.time || ""} onChange={(e) => upd("time", e.target.value)} /></Field>
            </div>
            <Field label="resultado (opcional)"><input className="cozy-input" value={form.result || ""} onChange={(e) => upd("result", e.target.value)} placeholder="3-1, ganamos!" /></Field>
          </>
        )}

        {type === "gimnasia" && (
          <>
            <Field label="lugar / club"><input className="cozy-input" value={form.place || ""} onChange={(e) => upd("place", e.target.value)} placeholder="Club Norte" /></Field>
            <Field label="dirección"><input className="cozy-input" value={form.address || ""} onChange={(e) => upd("address", e.target.value)} /></Field>
            <div className="row-2">
              <Field label="fecha"><input className="cozy-input" type="date" value={form.date || ""} onChange={(e) => upd("date", e.target.value)} /></Field>
              <Field label="hora"><input className="cozy-input" type="time" value={form.time || ""} onChange={(e) => upd("time", e.target.value)} /></Field>
            </div>
            <div className="scores-grid">
              {["suelo", "viga", "paralelas", "salto"].map((k) => (
                <div key={k} className="score-cell">
                  <label>{k}</label>
                  <input className="cozy-input small" value={form[k] || ""} onChange={(e) => upd(k, e.target.value)} placeholder="—" />
                </div>
              ))}
            </div>
          </>
        )}

        <button className="primary-btn full" onClick={save} disabled={saving}>
          {saving ? "guardando..." : "guardar →"}
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// FAMILY SECTION (dentro de perfil)
// ─────────────────────────────────────────────────────────────
const FamilySection = () => {
  const { familyData, user, family, invites, setInvites, isAdmin, loadMembers } = useApp();
  const [showInvite, setShowInvite] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("miembro");
  const [inviteMascot, setInviteMascot] = useState("nubi");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const createInvite = async () => {
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
      console.error("Error creating invite:", e);
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
    const member = family.find((m) => m.id === memberId);
    if (member) {
      await db.removeMember(member.membershipId);
      await loadMembers(familyData.id, user.userId);
    }
    setEditingMember(null);
  };

  const handleUpdateRole = async (memberId, role) => {
    const member = family.find((m) => m.id === memberId);
    if (member) {
      await db.changeMemberRole(member.membershipId, role);
      await loadMembers(familyData.id, user.userId);
    }
    setEditingMember((prev) => prev ? { ...prev, role } : prev);
  };

  const handleCancelInvite = async (code) => {
    const invite = invites.find((i) => i.code === code);
    if (invite?.id) await db.cancelInvite(invite.id);
    setInvites((prev) => prev.filter((i) => i.code !== code));
  };

  return (
    <div className="form-card">
      <div className="block-head">
        <h2 className="block-title">integrantes</h2>
        <span className="count-pill">{family.length}</span>
      </div>

      <div className="family-list">
        {family.map((m) => (
          <div key={m.id} className="fam-row">
            <div className="fam-mascot"><Mascot name={m.mascot} size={44} /></div>
            <div className="fam-body">
              <div className="fam-name">
                {m.name}
                {m.role === "admin" && <span className="admin-tag">admin</span>}
              </div>
              <div className="fam-email">{m.email}</div>
            </div>
            {isAdmin && m.id !== user?.userId && (
              <button className="fam-edit" onClick={() => setEditingMember(m)} aria-label="editar">⋯</button>
            )}
            {m.id === user?.userId && <span className="fam-you">vos</span>}
          </div>
        ))}
      </div>

      {invites.length > 0 && (
        <>
          <div className="invites-divider">invitaciones pendientes</div>
          {invites.map((i) => (
            <div key={i.code} className="invite-row">
              <div className="invite-mascot"><Mascot name={i.mascot} size={36} blink={false} /></div>
              <div className="invite-body">
                <div className="invite-code">{i.code}</div>
                <div className="invite-meta">{i.email} · {i.role}</div>
              </div>
              {isAdmin && (
                <button className="invite-cancel" onClick={() => handleCancelInvite(i.code)}>cancelar</button>
              )}
            </div>
          ))}
        </>
      )}

      {isAdmin ? (
        <button className="ghost-btn full add-member-btn" onClick={() => setShowInvite(true)}>
          + invitar a alguien
        </button>
      ) : (
        <p className="admin-only-note">sólo lxs admins pueden agregar miembros nuevos.</p>
      )}

      {showInvite && (
        <div className="modal-back" onClick={closeInvite}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            {!generatedCode ? (
              <>
                <div className="modal-mascot floaty"><Mascot name="momo" size={88} /></div>
                <h3 className="modal-title">invitar al nidito</h3>
                <p className="modal-sub">generamos un código único. quien lo use entra como parte de la familia.</p>
                <div className="field">
                  <label className="lbl">email (opcional)</label>
                  <input className="cozy-input" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="hermano@email.com" />
                </div>
                <label className="lbl">rol</label>
                <div className="seg-control">
                  <button className={`seg ${inviteRole === "miembro" ? "seg-on" : ""}`} onClick={() => setInviteRole("miembro")}>miembro</button>
                  <button className={`seg ${inviteRole === "admin" ? "seg-on" : ""}`} onClick={() => setInviteRole("admin")}>admin</button>
                </div>
                <label className="lbl">mascotita sugerida</label>
                <div className="mascot-grid">
                  {MASCOTS.map((m) => (
                    <button key={m} className={`mascot-pick ${inviteMascot === m ? "mp-on" : ""}`} onClick={() => setInviteMascot(m)}>
                      <Mascot name={m} size={44} />
                      <span>{MASCOT_LABELS[m]}</span>
                    </button>
                  ))}
                </div>
                <button className="primary-btn full" onClick={createInvite}>generar código →</button>
                <button className="ghost-btn full" onClick={closeInvite}>cancelar</button>
              </>
            ) : (
              <>
                <div className="modal-mascot floaty"><Mascot name={generatedCode.mascot} size={100} /></div>
                <h3 className="modal-title">¡código listo!</h3>
                <p className="modal-sub">compartilo con quien quieras sumar.</p>
                <div className="code-display" onClick={copyCode}>
                  <span className="code-text">{generatedCode.code}</span>
                  <span className="code-copy">{copied ? "✓ copiado" : "tocá para copiar"}</span>
                </div>
                <div className="code-meta">
                  <div><b>para:</b> {generatedCode.email}</div>
                  <div><b>rol:</b> {generatedCode.role}</div>
                </div>
                <button className="primary-btn full" onClick={closeInvite}>listo</button>
              </>
            )}
          </div>
        </div>
      )}

      {editingMember && (
        <div className="modal-back" onClick={() => setEditingMember(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-mascot"><Mascot name={editingMember.mascot} size={88} /></div>
            <h3 className="modal-title">{editingMember.name}</h3>
            <p className="modal-sub">{editingMember.email}</p>
            <label className="lbl">rol</label>
            <div className="seg-control">
              <button className={`seg ${editingMember.role === "miembro" ? "seg-on" : ""}`}
                onClick={() => handleUpdateRole(editingMember.id, "miembro")}>miembro</button>
              <button className={`seg ${editingMember.role === "admin" ? "seg-on" : ""}`}
                onClick={() => handleUpdateRole(editingMember.id, "admin")}>admin</button>
            </div>
            <button className="ghost-btn full" onClick={() => setEditingMember(null)}>cerrar</button>
            <button className="danger-btn full" onClick={() => handleRemoveMember(editingMember.id)}>quitar del nidito</button>
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
    setStage, setTab,
  } = useApp();

  const [name, setName] = useState(user?.name || "");
  const [mascot, setMascot] = useState(user?.mascot || "nubi");
  const [editingFamily, setEditingFamily] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinErr, setJoinErr] = useState("");
  const [showJoin, setShowJoin] = useState(false);

  const save = async () => {
    await db.updateProfile(user.userId, { name, mascot });
    setUser((prev) => prev ? { ...prev, name, mascot } : prev);
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
    if (!joinCode.trim()) return;
    setJoinErr("");
    try {
      await db.consumeInvite({ code: joinCode.trim().toUpperCase(), userId: user.userId });
      const memberships = await db.getMyFamilies(user.userId);
      const famDataArr = await Promise.all(memberships.map((m) => db.getFamily(m.familyId)));
      const allFams = memberships.map((m, i) => ({ family: famDataArr[i], membership: m })).filter((x) => x.family);
      setAllFamilies(allFams);
      setJoinCode("");
      setShowJoin(false);
    } catch (e) {
      setJoinErr(e.message || "Código inválido o expirado.");
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
      <header><h1 className="display-h1">tu perfil</h1></header>

      <div className="profile-hero">
        <div className="hero-mascot floaty"><Mascot name={mascot} size={140} /></div>
        <div className="hero-info">
          <div className="hero-name">{name || "sin nombre"}</div>
          <div className="hero-email">{user?.email}</div>
          <div className="role-pill">{user?.role || "miembro"}</div>
        </div>
      </div>

      <div className="form-card">
        <div className="field">
          <label className="lbl">tu nombre</label>
          <input className="cozy-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <label className="lbl">tu mascotita</label>
        <div className="mascot-grid">
          {MASCOTS.map((m) => (
            <button key={m} className={`mascot-pick ${mascot === m ? "mp-on" : ""}`} onClick={() => setMascot(m)}>
              <Mascot name={m} size={56} />
              <span>{MASCOT_LABELS[m]}</span>
            </button>
          ))}
        </div>
        <button className="primary-btn full" onClick={save}>guardar cambios</button>
      </div>

      {/* Mis familias */}
      <div className="form-card">
        <div className="block-head">
          <h2 className="block-title">mis niditos</h2>
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
              ? <span className="fam-you">activo</span>
              : <button className="link-btn" onClick={() => switchFamily(fam.id)}>cambiar</button>
            }
          </div>
        ))}

        {!showJoin ? (
          <button className="ghost-btn full add-member-btn" onClick={() => setShowJoin(true)}>
            + unirme a otro nidito
          </button>
        ) : (
          <div style={{ marginTop: 12 }}>
            <label className="lbl">código de invitación</label>
            <input
              className="cozy-input"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="ABC-XYZ"
              style={{ textTransform: "uppercase" }}
            />
            {joinErr && <div className="err-pill">{joinErr}</div>}
            <div className="row-2" style={{ marginTop: 8 }}>
              <button className="ghost-btn" onClick={() => { setShowJoin(false); setJoinCode(""); setJoinErr(""); }}>cancelar</button>
              <button className="primary-btn" onClick={handleJoinAnother}>unirme →</button>
            </div>
          </div>
        )}
      </div>

      {/* Mascota del nidito activo */}
      <div className="form-card">
        <div className="block-head">
          <h2 className="block-title">mascota de {familyData?.name || "la familia"}</h2>
          {isAdmin && <button className="link-btn" onClick={() => setEditingFamily(!editingFamily)}>{editingFamily ? "listo" : "cambiar"}</button>}
        </div>
        {!editingFamily ? (
          <div className="family-current">
            <Mascot name={familyMascot} size={88} />
            <div>
              <div className="hero-name">{MASCOT_LABELS[familyMascot] || familyMascot}</div>
              <div className="hero-email">la mascota que nos representa</div>
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
        <h2 className="block-title">permisos y estado</h2>
        <div className="perm-row"><span>estado</span><span className="perm-val ok">activo</span></div>
        <div className="perm-row"><span>rol</span><span className="perm-val">{user?.role}</span></div>
        <div className="perm-row"><span>nidito activo</span><span className="perm-val">{familyData?.name}</span></div>
      </div>

      <FamilySection />

      <button className="logout-btn" onClick={handleLogout}>salir del nidito 👋</button>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────
const Nav = () => {
  const { tab, setTab } = useApp();
  const items = [
    { id: "home",   label: "inicio",  icon: "🏠" },
    { id: "chat",   label: "chat",    icon: "💬" },
    { id: "cargar", label: "cargar",  icon: "✨", big: true },
    { id: "perfil", label: "perfil",  icon: "🌸" },
    { id: "agenda", label: "agenda",  icon: "📅" },
  ];
  return (
    <nav className="bottom-nav">
      {items.map((it) => (
        <button
          key={it.id}
          className={`nav-item ${tab === it.id ? "nav-on" : ""} ${it.big ? "nav-big" : ""}`}
          onClick={() => setTab(it.id)}
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
              {tab === "home"   && <HomeView />}
              {tab === "chat"   && <ChatView />}
              {tab === "cargar" && <LoadView />}
              {tab === "perfil" && <ProfileView />}
              {tab === "agenda" && <AgendaView />}
            </main>
            <Nav />
          </>
        )}
      </div>
    </AppCtx.Provider>
  );
}
