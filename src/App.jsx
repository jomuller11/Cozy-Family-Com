import { useEffect, useState } from "react";

const familyMembers = [
  { id: "papa", name: "Papa", role: "Padre", status: "Online", avatar: "P", className: "dad" },
  { id: "mama", name: "Mama", role: "Madre", status: "En camino", avatar: "M", className: "mom" },
  { id: "luli", name: "Luli", role: "Hija", status: "Gimnasia", avatar: "L", className: "girl-a" },
  { id: "sofi", name: "Sofi", role: "Hija", status: "Voley", avatar: "S", className: "girl-b" },
];

const todayItems = [
  {
    time: "08:20",
    title: "Repaso final de ciencias",
    detail: "Asignado a Luli - cargado por Mama",
  },
  {
    time: "17:30",
    title: "Practica de voley",
    detail: "Asignado a Sofi - cargado por Papa",
  },
  {
    time: "20:00",
    title: "Preparar bolso de gimnasia",
    detail: "Asignado a Luli - cargado por Luli",
  },
];

const calendarItems = [
  {
    date: "30 abr",
    marker: "exam",
    title: "Examen de ciencias",
    detail: "Asignado a Luli - cargo Mama - 08:20 - Aula 4",
  },
  {
    date: "03 may",
    marker: "gym",
    title: "Torneo de gimnasia",
    detail: "Asignado a Luli - cargo Luli - salto, viga, suelo y barras",
  },
  {
    date: "06 may",
    marker: "volley",
    title: "Partido de voley",
    detail: "Asignado a Sofi - cargo Papa - Club Norte vs San Martin",
  },
];

const messages = [
  {
    author: "Mama",
    avatar: "M",
    className: "mom",
    tone: "mine",
    text: "Deje las medias de gimnasia en la mochila rosa.",
  },
  {
    author: "Papa",
    avatar: "P",
    className: "dad",
    text: "Yo busco a Sofi despues del partido. Avisen resultado.",
  },
  {
    author: "Luli",
    avatar: "L",
    className: "girl-a",
    tone: "child",
    text: "Me saque 9 en historia. Lo cargue en examenes.",
  },
];

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.8v2.1M12 19.1v2.1M4.2 4.2l1.5 1.5M18.3 18.3l1.5 1.5M2.8 12h2.1M19.1 12h2.1M4.2 19.8l1.5-1.5M18.3 5.7l1.5-1.5" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.4 15.8a7.2 7.2 0 0 1-10.2-10 7.8 7.8 0 1 0 10.2 10Z" />
    </svg>
  );
}

function NavIcon({ type }) {
  const icons = {
    home: (
      <>
        <path d="M4 11.2 12 4l8 7.2" />
        <path d="M6.5 10.5v8.2h11v-8.2" />
        <path d="M10 18.7v-5h4v5" />
      </>
    ),
    chat: (
      <>
        <path d="M5.2 6.2h13.6a2.2 2.2 0 0 1 2.2 2.2v5.8a2.2 2.2 0 0 1-2.2 2.2h-7.4l-4.5 3v-3H5.2A2.2 2.2 0 0 1 3 14.2V8.4a2.2 2.2 0 0 1 2.2-2.2Z" />
        <path d="M8 10.2h8M8 13.1h5" />
      </>
    ),
    history: (
      <>
        <path d="M7.2 5.8h9.6a2 2 0 0 1 2 2v10.4a1.2 1.2 0 0 1-1.8 1l-5-2.9-5 2.9a1.2 1.2 0 0 1-1.8-1V7.8a2 2 0 0 1 2-2Z" />
        <path d="M9 10h6M9 13h4" />
      </>
    ),
    calendar: (
      <>
        <path d="M6.4 5.8h11.2a2.4 2.4 0 0 1 2.4 2.4v9.4a2.4 2.4 0 0 1-2.4 2.4H6.4A2.4 2.4 0 0 1 4 17.6V8.2a2.4 2.4 0 0 1 2.4-2.4Z" />
        <path d="M8 4v3.2M16 4v3.2M4.4 10h15.2" />
        <path d="M8.2 13.4h.1M12 13.4h.1M15.8 13.4h.1M8.2 16.5h.1M12 16.5h.1" />
      </>
    ),
  };

  return (
    <span className="nav-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">{icons[type]}</svg>
    </span>
  );
}

function FamilyRail({ users }) {
  return (
    <aside className="family-rail" aria-label="Familia">
      <div className="brand">
        <span className="brand-mark">CN</span>
        <div>
          <p>Casa Nube</p>
          <strong>Familia Arias</strong>
        </div>
      </div>

      <section className="members" aria-label="Integrantes">
        {users.map((member) => (
          <article key={member.id}>
            <span className={`avatar ${member.className}`}>{member.avatar}</span>
            <div>
              <strong>{member.name}</strong>
              <p>{member.status}</p>
            </div>
          </article>
        ))}
      </section>

      <a className="ghost-button rail-action" href="#usuarios">
        Crear usuarios
      </a>
    </aside>
  );
}

function ThemeToggle() {
  return (
    <label className="theme-toggle" htmlFor="theme-toggle">
      <span className="sun-icon" aria-hidden="true">
        <SunIcon />
      </span>
      <span className="moon-icon" aria-hidden="true">
        <MoonIcon />
      </span>
      <strong>Tema</strong>
    </label>
  );
}

function Mascot() {
  return (
    <div className="mascot-scene" aria-label="Mascota Nubi animada">
      <div className="sparkle one" />
      <div className="sparkle two" />
      <div className="nubi">
        <div className="ear left" />
        <div className="ear right" />
        <div className="face">
          <span className="eye left" />
          <span className="eye right" />
          <span className="mouth" />
          <span className="blush left" />
          <span className="blush right" />
        </div>
        <div className="paw left" />
        <div className="paw right" />
      </div>
      <div className="speech">Tengo 3 recordatorios para hoy</div>
    </div>
  );
}

function HomeSection() {
  return (
    <>
      <section id="inicio" className="hero-panel">
        <div className="hero-copy">
          <p className="pill">Resumen familiar</p>
          <h2>Hoy: entrega de mate, practica de voley y repaso de ciencias.</h2>
          <p>
            Nubi avisa lo importante, guarda resultados y deja mensajes cortitos para que nadie
            tenga que buscar en tres chats distintos. Cada dato queda asignado a una hija y muestra
            quien lo cargo.
          </p>
        </div>
        <Mascot />
      </section>

      <section className="panel today-panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Dia de hoy</p>
            <h2>Prioridades</h2>
          </div>
          <a className="ghost-button" href="#calendario">
            Ver todo
          </a>
        </div>

        <div className="today-list">
          {todayItems.map((item) => (
            <article key={`${item.time}-${item.title}`}>
              <time>{item.time}</time>
              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function ChatSection() {
  return (
    <section id="chat" className="panel chat-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Comunicacion</p>
          <h2>Chat familiar</h2>
        </div>
        <button className="ghost-button" type="button">
          Enviar nota
        </button>
      </div>

      <div className="messages">
        {messages.map((message) => (
          <article className={`message ${message.tone ?? ""}`} key={`${message.author}-${message.text}`}>
            <span className={`avatar ${message.className}`}>{message.avatar}</span>
            <div>
              <strong>{message.author}</strong>
              <p>{message.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function CalendarSection() {
  return (
    <section id="calendario" className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Lo que se viene</p>
          <h2>Calendario familiar</h2>
        </div>
        <div className="segmented">
          <button className="selected" type="button">
            Semana
          </button>
          <button type="button">Mes</button>
        </div>
      </div>

      <div className="timeline">
        {calendarItems.map((item) => (
          <article key={`${item.date}-${item.title}`}>
            <time>{item.date}</time>
            <div className={`event-marker ${item.marker}`} />
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResultsSection() {
  return (
    <aside id="resultados" className="side-column">
      <section className="panel result-card exams">
        <p className="eyebrow">Colegio</p>
        <h2>Examenes</h2>
        <div className="score-row">
          <span>
            Historia <small>Luli - cargo Luli</small>
          </span>
          <strong>9</strong>
        </div>
        <div className="score-row pending">
          <span>
            Ciencias <small>Luli - cargo Mama</small>
          </span>
          <strong>Pendiente</strong>
        </div>
      </section>

      <section className="panel result-card gym">
        <p className="eyebrow">Gimnasia</p>
        <h2>Torneo</h2>
        <div className="apparatus">
          <span>
            Salto <b>8.80</b>
            <small>Luli</small>
          </span>
          <span>
            Viga <b>8.45</b>
            <small>Luli</small>
          </span>
          <span>
            Suelo <b>9.10</b>
            <small>Luli</small>
          </span>
          <span>
            Barras <b>8.70</b>
            <small>Luli</small>
          </span>
        </div>
      </section>

      <section className="panel result-card volley">
        <p className="eyebrow">Voley</p>
        <h2>Ultimo partido</h2>
        <div className="match-score">
          <span>Club Norte</span>
          <strong>2 - 1</strong>
          <span>San Martin</span>
        </div>
        <p className="audit-line">Asignado a Sofi - cargado por Papa</p>
      </section>
    </aside>
  );
}

function HistorySection() {
  return (
    <section id="historial" className="panel history-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Historial</p>
          <h2>Por hija</h2>
        </div>
        <div className="child-tabs">
          <button className="selected" type="button">
            Luli
          </button>
          <button type="button">Sofi</button>
        </div>
      </div>
      <div className="history-grid">
        <article>
          <strong>Gimnasia - Torneo apertura</strong>
          <p>4 resultados asignados a Luli - ultimo cargado por Luli</p>
        </article>
        <article>
          <strong>Colegio - Historia</strong>
          <p>Nota 9 asignada a Luli - cargada por Luli</p>
        </article>
        <article>
          <strong>Colegio - Ciencias</strong>
          <p>Fecha asignada a Luli - cargada por Mama</p>
        </article>
      </div>
    </section>
  );
}

function CustomSelect({ value, options }) {
  return (
    <details className="custom-select">
      <summary>{value}</summary>
      <div className="select-menu">
        {options.map((option) => (
          <button type="button" key={option}>
            {option}
          </button>
        ))}
      </div>
    </details>
  );
}

function EntrySection() {
  return (
    <section id="cargar" className="panel entry-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Nuevo dato</p>
          <h2>Cargar y asignar</h2>
        </div>
        <button className="ghost-button" type="button">
          Guardar borrador
        </button>
      </div>

      <form className="entry-form">
        <label>
          <span>Tipo</span>
          <CustomSelect
            value="Resultado de voley"
            options={[
              "Fecha de examen",
              "Resultado de examen",
              "Torneo de gimnasia",
              "Resultado de voley",
            ]}
          />
        </label>
        <label>
          <span>Asignado a</span>
          <CustomSelect value="Sofi" options={["Luli", "Sofi"]} />
        </label>
        <label>
          <span>Cargado por</span>
          <CustomSelect value="Papa" options={["Papa", "Mama", "Luli", "Sofi"]} />
        </label>
        <label>
          <span>Fecha</span>
          <input type="text" defaultValue="06 mayo, 18:30" />
        </label>
        <label className="wide">
          <span>Detalle</span>
          <textarea defaultValue="Club Norte gano 2-1. Sofi jugo el tercer set completo." />
        </label>
        <button className="primary-action wide" type="button">
          Guardar en historial de Sofi
        </button>
      </form>
    </section>
  );
}

function UsersSection({ users, onCreateUser }) {
  const [form, setForm] = useState({
    name: "",
    role: "Hija",
    status: "Nueva",
  });

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    onCreateUser({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      role: form.role,
      status: form.status.trim() || form.role,
      avatar: form.name.trim().slice(0, 1).toUpperCase(),
      className: form.role === "Padre" ? "dad" : form.role === "Madre" ? "mom" : "girl-a",
    });

    setForm({ name: "", role: "Hija", status: "Nueva" });
  }

  return (
    <section id="usuarios" className="panel users-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Familia</p>
          <h2>Usuarios</h2>
        </div>
        <a className="ghost-button" href="#inicio">
          Volver al inicio
        </a>
      </div>

      <div className="users-layout">
        <div className="user-list">
          {users.map((user) => (
            <article key={user.id}>
              <span className={`avatar ${user.className}`}>{user.avatar}</span>
              <div>
                <strong>{user.name}</strong>
                <p>
                  {user.role} - {user.status}
                </p>
              </div>
            </article>
          ))}
        </div>

        <form className="entry-form user-form" onSubmit={handleSubmit}>
          <label>
            <span>Nombre</span>
            <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Ej: Abi" />
          </label>
          <label>
            <span>Rol</span>
            <select name="role" value={form.role} onChange={handleChange}>
              <option>Padre</option>
              <option>Madre</option>
              <option>Hija</option>
            </select>
          </label>
          <label className="wide">
            <span>Estado visible</span>
            <input
              name="status"
              type="text"
              value={form.status}
              onChange={handleChange}
              placeholder="Ej: Colegio, Voley, Online"
            />
          </label>
          <button className="primary-action wide" type="submit">
            Crear usuario
          </button>
        </form>
      </div>
    </section>
  );
}

function BottomNav({ activeSection }) {
  return (
    <nav className="bottom-nav" aria-label="Navegacion principal">
      <a className={activeSection === "inicio" ? "active" : ""} href="#inicio">
        <NavIcon type="home" />
        <span>Inicio</span>
      </a>
      <a className={activeSection === "chat" ? "active" : ""} href="#chat">
        <NavIcon type="chat" />
        <span>Chat</span>
      </a>
      <a className="add-slot" href="#cargar" aria-label="Cargar nuevo dato">
        +
      </a>
      <a className={activeSection === "historial" ? "active" : ""} href="#historial">
        <NavIcon type="history" />
        <span>Historial</span>
      </a>
      <a className={activeSection === "calendario" ? "active" : ""} href="#calendario">
        <NavIcon type="calendar" />
        <span>Agenda</span>
      </a>
    </nav>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState(() => window.location.hash.replace("#", "") || "inicio");
  const [users, setUsers] = useState(() => {
    const savedUsers = window.localStorage.getItem("casa-nube-users");
    return savedUsers ? JSON.parse(savedUsers) : familyMembers;
  });

  useEffect(() => {
    function updateActiveSection() {
      setActiveSection(window.location.hash.replace("#", "") || "inicio");
    }

    window.addEventListener("hashchange", updateActiveSection);
    updateActiveSection();

    return () => window.removeEventListener("hashchange", updateActiveSection);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("casa-nube-users", JSON.stringify(users));
  }, [users]);

  function handleCreateUser(user) {
    setUsers((current) => [...current, user]);
  }

  return (
    <>
      <input className="theme-input" id="theme-toggle" type="checkbox" aria-label="Activar tema oscuro" />
      <main className="app-shell">
        <FamilyRail users={users} />

        <section className="workspace">
          <header className="topbar">
            <div>
              <p className="eyebrow">Miercoles 29 de abril</p>
              <h1>Hoy y lo que se viene</h1>
            </div>
            <div className="top-actions">
              <ThemeToggle />
              <a className="primary-action" href="#calendario">
                Ver calendario
              </a>
            </div>
          </header>

          {activeSection === "inicio" && (
            <div className="main-column">
              <HomeSection />
            </div>
          )}

          {activeSection === "chat" && <ChatSection />}
          {activeSection === "calendario" && <CalendarSection />}
          {activeSection === "resultados" && <ResultsSection />}
          {activeSection === "historial" && <HistorySection />}
          {activeSection === "usuarios" && <UsersSection users={users} onCreateUser={handleCreateUser} />}
          {activeSection === "cargar" && <EntrySection />}
        </section>
      </main>

      <BottomNav activeSection={activeSection} />
    </>
  );
}
