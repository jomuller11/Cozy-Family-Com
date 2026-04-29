import { useEffect, useMemo, useState } from "react";

const mascotOptions = [
  { id: "nubi", name: "Nubi", symbol: "Nu", className: "mascot-nubi" },
  { id: "soli", name: "Soli", symbol: "So", className: "mascot-soli" },
  { id: "luma", name: "Luma", symbol: "Lu", className: "mascot-luma" },
  { id: "bubu", name: "Bubu", symbol: "Bu", className: "mascot-bubu" },
];

const initialUsers = [
  {
    id: "papa",
    name: "Papa",
    role: "Padre",
    status: "Online",
    mascotId: "nubi",
    isAdmin: true,
  },
  {
    id: "mama",
    name: "Mama",
    role: "Madre",
    status: "En camino",
    mascotId: "soli",
    isAdmin: false,
  },
  {
    id: "luli",
    name: "Luli",
    role: "Hija",
    status: "Gimnasia",
    mascotId: "luma",
    isAdmin: false,
  },
  {
    id: "sofi",
    name: "Sofi",
    role: "Hija",
    status: "Voley",
    mascotId: "bubu",
    isAdmin: false,
  },
];

const initialAccounts = [
  {
    id: "papa",
    email: "papa@casa.local",
    password: "casa1234",
    userId: "papa",
  },
];

const initialRecords = [
  {
    id: "rec-1",
    type: "Examen",
    title: "Examen de ciencias",
    assignedTo: "luli",
    createdBy: "mama",
    date: "30 abr, 08:20",
    detail: "Aula 4",
    result: "Pendiente",
  },
  {
    id: "rec-2",
    type: "Gimnasia",
    title: "Torneo apertura",
    assignedTo: "luli",
    createdBy: "luli",
    date: "03 may",
    detail: "Salto 8.80, viga 8.45, suelo 9.10 y barras 8.70",
    result: "Promedio 8.76",
  },
  {
    id: "rec-3",
    type: "Voley",
    title: "Club Norte vs San Martin",
    assignedTo: "sofi",
    createdBy: "papa",
    date: "06 may, 18:30",
    detail: "Sofi jugo el tercer set completo",
    result: "2 - 1",
  },
];

const initialMessages = [
  {
    id: "msg-1",
    authorId: "mama",
    text: "Deje las medias de gimnasia en la mochila rosa.",
  },
  {
    id: "msg-2",
    authorId: "papa",
    text: "Yo busco a Sofi despues del partido. Avisen resultado.",
  },
  {
    id: "msg-3",
    authorId: "luli",
    text: "Me saque 9 en historia. Lo cargue en examenes.",
  },
];

function readStorage(key, fallback) {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeUsers(savedUsers) {
  return savedUsers.map((user, index) => {
    const fallbackUser = initialUsers.find((item) => item.id === user.id);
    return {
      ...user,
      role: user.role ?? fallbackUser?.role ?? "Hija",
      status: user.status ?? fallbackUser?.status ?? "Nueva",
      mascotId: user.mascotId ?? fallbackUser?.mascotId ?? mascotOptions[index % mascotOptions.length].id,
      isAdmin: user.isAdmin ?? user.id === "papa",
    };
  });
}

function getMascot(mascotId) {
  return mascotOptions.find((mascot) => mascot.id === mascotId) ?? mascotOptions[0];
}

function getUser(users, userId) {
  return users.find((user) => user.id === userId);
}

function createInviteCode() {
  return Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
}

function userDisplay(users, userId) {
  return getUser(users, userId)?.name ?? "Sin asignar";
}

function MascotAvatar({ mascotId, size = "regular" }) {
  const mascot = getMascot(mascotId);

  return (
    <span className={`mascot-avatar ${mascot.className} ${size}`} aria-label={mascot.name}>
      <svg viewBox="0 0 80 80" aria-hidden="true">
        {mascot.id === "soli" && (
          <>
            <circle className="pet-halo" cx="40" cy="40" r="30" />
            <circle className="pet-face" cx="40" cy="40" r="23" />
            <path className="pet-line" d="M28 36c3-3 7-3 10 0M42 36c3-3 7-3 10 0" />
            <path className="pet-line" d="M33 48c4 4 10 4 14 0" />
            <circle className="pet-blush" cx="25" cy="45" r="4" />
            <circle className="pet-blush" cx="55" cy="45" r="4" />
          </>
        )}
        {mascot.id === "luma" && (
          <>
            <path className="pet-face" d="M18 43c0-16 10-26 22-26s22 10 22 26c0 15-10 25-22 25S18 58 18 43Z" />
            <path className="pet-line" d="M28 20 22 9M52 20l6-11M31 39h.1M49 39h.1M34 51c3 3 9 3 12 0" />
            <circle className="pet-blush" cx="27" cy="47" r="4" />
            <circle className="pet-blush" cx="53" cy="47" r="4" />
          </>
        )}
        {mascot.id === "bubu" && (
          <>
            <path className="pet-face" d="M20 40c0-14 9-23 20-23s20 9 20 23v7c0 12-8 21-20 21S20 59 20 47v-7Z" />
            <path className="pet-line" d="M27 24 20 15M53 24l7-9M31 39h.1M49 39h.1M34 52c4 2 8 2 12 0" />
            <path className="pet-belly" d="M31 58c2-5 16-5 18 0" />
          </>
        )}
        {mascot.id === "nubi" && (
          <>
            <path className="pet-face" d="M20 43c-8-1-13-7-13-15 0-9 8-16 17-14C29 5 43 6 48 16c10-2 21 5 21 16 0 10-8 18-19 18H24c-2 0-3 0-4-1Z" />
            <path className="pet-line" d="M29 35h.1M48 35h.1M34 45c3 3 8 3 11 0" />
            <circle className="pet-blush" cx="24" cy="41" r="4" />
            <circle className="pet-blush" cx="54" cy="41" r="4" />
          </>
        )}
      </svg>
    </span>
  );
}

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
    family: (
      <>
        <path d="M8 11.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z" />
        <path d="M16.4 10.4a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6Z" />
        <path d="M3.5 19.2c.8-3 2.2-4.5 4.5-4.5s3.7 1.5 4.5 4.5" />
        <path d="M12.4 18.8c.8-2.3 2.1-3.5 4-3.5 1.8 0 3.1 1.2 4 3.5" />
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

function ThemeToggle({ theme, onThemeChange }) {
  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button className="theme-toggle" type="button" onClick={() => onThemeChange(nextTheme)}>
      <span className="sun-icon" aria-hidden="true">
        <SunIcon />
      </span>
      <span className="moon-icon" aria-hidden="true">
        <MoonIcon />
      </span>
      <strong>{theme === "dark" ? "Noche" : "Dia"}</strong>
    </button>
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

function HomeSection({ records, users }) {
  const upcoming = records.slice(0, 3);

  return (
    <>
      <section id="inicio" className="hero-panel">
        <div className="hero-copy">
          <p className="pill">Resumen familiar</p>
          <h2>Hoy y lo que se viene en la familia.</h2>
          <p>
            Nubi avisa lo importante, guarda resultados y deja mensajes cortitos para que nadie
            tenga que buscar en tres chats distintos.
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
          {upcoming.map((item) => (
            <article key={item.id}>
              <time>{item.date}</time>
              <div>
                <strong>{item.title}</strong>
                <p>
                  {item.type} - {userDisplay(users, item.assignedTo)} - cargado por{" "}
                  {userDisplay(users, item.createdBy)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function ChatSection({ currentUser, messages, users, onSendMessage }) {
  const [text, setText] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText("");
  }

  return (
    <section id="chat" className="panel chat-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Comunicacion</p>
          <h2>Chat familiar</h2>
        </div>
        <span className="soft-note">Escribe {currentUser.name}</span>
      </div>

      <div className="messages">
        {messages.map((message) => {
          const author = getUser(users, message.authorId) ?? currentUser;
          return (
            <article
              className={`message ${message.authorId === currentUser.id ? "mine" : ""}`}
              key={message.id}
            >
              <MascotAvatar mascotId={author.mascotId} />
              <div>
                <strong>{author.name}</strong>
                <p>{message.text}</p>
              </div>
            </article>
          );
        })}
      </div>

      <form className="message-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Escribir nota familiar"
        />
        <button className="primary-action" type="submit">
          Enviar
        </button>
      </form>
    </section>
  );
}

function getDayNumber(dateText) {
  const match = String(dateText).match(/\d{1,2}/);
  return match ? Number(match[0]) : 1;
}

function CalendarSection({ records, users }) {
  const [view, setView] = useState("week");
  const weekRecords = records.filter((record) => getDayNumber(record.date) <= 7 || records.length <= 5);
  const visibleRecords = view === "week" ? weekRecords : records;
  const monthDays = Array.from({ length: 35 }, (_, index) => index + 1);

  return (
    <section id="calendario" className="panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Lo que se viene</p>
          <h2>Calendario familiar</h2>
        </div>
        <div className="segmented">
          <button className={view === "week" ? "selected" : ""} type="button" onClick={() => setView("week")}>
            Semana
          </button>
          <button className={view === "month" ? "selected" : ""} type="button" onClick={() => setView("month")}>
            Mes
          </button>
        </div>
      </div>

      {view === "week" ? (
        <div className="timeline">
          {visibleRecords.map((item) => (
            <article key={item.id}>
              <time>{item.date}</time>
              <div className={`event-marker ${item.type.toLowerCase()}`} />
              <div>
                <strong>{item.title}</strong>
                <p>
                  {userDisplay(users, item.assignedTo)} - cargo {userDisplay(users, item.createdBy)} -{" "}
                  {item.detail}
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="month-view">
          <div className="month-weekdays">
            {["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="month-grid">
            {monthDays.map((day) => {
              const dayRecords = records.filter((record) => getDayNumber(record.date) === day);
              return (
                <article className={dayRecords.length ? "has-events" : ""} key={day}>
                  <strong>{day}</strong>
                  {dayRecords.slice(0, 2).map((record) => (
                    <span className={`month-event ${record.type.toLowerCase()}`} key={record.id}>
                      {record.title}
                    </span>
                  ))}
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function HistorySection({ records, users, selectedUserId, onSelectUser }) {
  const childUsers = users.filter((user) => user.role === "Hija");
  const activeUserId = selectedUserId ?? childUsers[0]?.id ?? users[0]?.id;
  const userRecords = records.filter((record) => record.assignedTo === activeUserId);

  return (
    <section id="historial" className="panel history-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Historial</p>
          <h2>Por hija</h2>
        </div>
        <div className="child-tabs">
          {childUsers.map((user) => (
            <button
              className={activeUserId === user.id ? "selected" : ""}
              type="button"
              key={user.id}
              onClick={() => onSelectUser(user.id)}
            >
              {user.name}
            </button>
          ))}
        </div>
      </div>
      <div className="history-grid">
        {userRecords.map((record) => (
          <article key={record.id}>
            <strong>
              {record.type} - {record.title}
            </strong>
            <p>
              {record.result} - cargado por {userDisplay(users, record.createdBy)}
            </p>
          </article>
        ))}
        {userRecords.length === 0 && <p className="empty-state">Todavia no hay registros.</p>}
      </div>
    </section>
  );
}

function ResultsSection({ records, users }) {
  const doneRecords = records.filter((record) => record.result && record.result !== "Pendiente");

  return (
    <aside id="resultados" className="side-column">
      {doneRecords.map((record) => (
        <section className="panel result-card" key={record.id}>
          <p className="eyebrow">{record.type}</p>
          <h2>{record.title}</h2>
          <div className="score-row">
            <span>
              {userDisplay(users, record.assignedTo)}
              <small>cargo {userDisplay(users, record.createdBy)}</small>
            </span>
            <strong>{record.result}</strong>
          </div>
        </section>
      ))}
    </aside>
  );
}

function EntrySection({ currentUser, users, onSaveRecord, onSaveDraft }) {
  const assignableUsers = users.filter((user) => user.role === "Hija");
  const [form, setForm] = useState({
    type: "Voley",
    assignedTo: assignableUsers[0]?.id ?? users[0]?.id,
    date: "06 mayo, 18:30",
    title: "Club Norte vs San Martin",
    result: "2 - 1",
    detail: "Sofi jugo el tercer set completo",
  });

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function buildRecord(status = "saved") {
    return {
      id: crypto.randomUUID(),
      ...form,
      createdBy: currentUser.id,
      status,
    };
  }

  function handleSave(event) {
    event.preventDefault();
    onSaveRecord(buildRecord("saved"));
    window.location.hash = "#calendario";
  }

  return (
    <section id="cargar" className="panel entry-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Nuevo dato</p>
          <h2>Cargar y asignar</h2>
        </div>
        <button className="ghost-button" type="button" onClick={() => onSaveDraft(buildRecord("draft"))}>
          Guardar borrador
        </button>
      </div>

      <form className="entry-form" onSubmit={handleSave}>
        <label>
          <span>Tipo</span>
          <select name="type" value={form.type} onChange={updateField}>
            <option>Examen</option>
            <option>Gimnasia</option>
            <option>Voley</option>
          </select>
        </label>
        <label>
          <span>Asignado a</span>
          <select name="assignedTo" value={form.assignedTo} onChange={updateField}>
            {assignableUsers.map((user) => (
              <option value={user.id} key={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Cargado por</span>
          <input type="text" value={currentUser.name} readOnly />
        </label>
        <label>
          <span>Fecha</span>
          <input name="date" type="text" value={form.date} onChange={updateField} />
        </label>
        <label>
          <span>Titulo</span>
          <input name="title" type="text" value={form.title} onChange={updateField} />
        </label>
        <label>
          <span>Resultado</span>
          <input name="result" type="text" value={form.result} onChange={updateField} />
        </label>
        <label className="wide">
          <span>Detalle</span>
          <textarea name="detail" value={form.detail} onChange={updateField} />
        </label>
        <button className="primary-action wide" type="submit">
          Guardar en historial
        </button>
      </form>
    </section>
  );
}

function UsersSection({
  users,
  currentUser,
  selectedUserId,
  invitations,
  onSelectUser,
  onCreateUser,
  onDeleteUser,
  onMakeAdmin,
  onCreateInvite,
}) {
  const [form, setForm] = useState({
    name: "",
    role: "Hija",
    status: "Nueva",
    mascotId: "nubi",
    isAdmin: false,
  });
  const selectedUser = getUser(users, selectedUserId) ?? users[0];
  const currentUserIsAdmin = currentUser.isAdmin;
  const [inviteForm, setInviteForm] = useState({
    role: "Hija",
    status: "Nueva",
    mascotId: "nubi",
  });

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim()) return;

    onCreateUser({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      role: form.role,
      status: form.status.trim() || form.role,
      mascotId: form.mascotId,
      isAdmin: form.isAdmin,
    });

    setForm({ name: "", role: "Hija", status: "Nueva", mascotId: "nubi", isAdmin: false });
  }

  function updateInvite(event) {
    setInviteForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function submitInvite(event) {
    event.preventDefault();
    onCreateInvite(inviteForm);
  }

  return (
    <section id="usuarios" className="panel users-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Familia</p>
          <h2>Integrantes</h2>
        </div>
        <span className="admin-badge">Admin: {currentUser.name}</span>
      </div>

      <div className="users-layout">
        <div className="user-list">
          {users.map((user) => (
            <button
              className={`user-card ${selectedUser?.id === user.id ? "selected" : ""}`}
              type="button"
              key={user.id}
              onClick={() => onSelectUser(user.id)}
            >
              <MascotAvatar mascotId={user.mascotId} />
              <span>
                <strong>{user.name}</strong>
                <small>
                  {user.role} - {user.status} {user.isAdmin ? "- admin" : ""}
                </small>
              </span>
            </button>
          ))}
        </div>

        <div className="profile-panel">
          {selectedUser && (
            <>
              <MascotAvatar mascotId={selectedUser.mascotId} size="large" />
              <div>
                <p className="eyebrow">Vista personal</p>
                <h2>{selectedUser.name}</h2>
                <p>
                  {selectedUser.role} - {selectedUser.status}
                </p>
              </div>
              <div className="profile-actions">
                <a className="ghost-button" href="#historial">
                  Ver historial
                </a>
                {!selectedUser.isAdmin && currentUserIsAdmin && (
                  <button className="ghost-button" type="button" onClick={() => onMakeAdmin(selectedUser.id)}>
                    Hacer admin
                  </button>
                )}
                {currentUserIsAdmin && selectedUser.id !== currentUser.id && (
                  <button className="danger-button" type="button" onClick={() => onDeleteUser(selectedUser.id)}>
                    Eliminar integrante
                  </button>
                )}
              </div>
            </>
          )}
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
          <label>
            <span>Estado visible</span>
            <input
              name="status"
              type="text"
              value={form.status}
              onChange={handleChange}
              placeholder="Ej: Colegio, Voley, Online"
            />
          </label>
          <label>
            <span>Mascota avatar</span>
            <select name="mascotId" value={form.mascotId} onChange={handleChange}>
              {mascotOptions.map((mascot) => (
                <option value={mascot.id} key={mascot.id}>
                  {mascot.name}
                </option>
              ))}
            </select>
          </label>
          <label className="checkbox-row wide">
            <input name="isAdmin" type="checkbox" checked={form.isAdmin} onChange={handleChange} />
            <span>Administrador del grupo</span>
          </label>
          <button className="primary-action wide" type="submit">
            Crear usuario
          </button>
        </form>

        {currentUserIsAdmin && (
          <form className="entry-form invite-form" onSubmit={submitInvite}>
            <div className="wide">
              <p className="eyebrow">Invitaciones</p>
              <h2>Invitar al grupo</h2>
            </div>
            <label>
              <span>Rol</span>
              <select name="role" value={inviteForm.role} onChange={updateInvite}>
                <option>Padre</option>
                <option>Madre</option>
                <option>Hija</option>
              </select>
            </label>
            <label>
              <span>Mascota sugerida</span>
              <select name="mascotId" value={inviteForm.mascotId} onChange={updateInvite}>
                {mascotOptions.map((mascot) => (
                  <option value={mascot.id} key={mascot.id}>
                    {mascot.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="wide">
              <span>Estado inicial</span>
              <input name="status" type="text" value={inviteForm.status} onChange={updateInvite} />
            </label>
            <button className="primary-action wide" type="submit">
              Generar codigo
            </button>
            <div className="invite-list wide">
              {invitations.map((invite) => (
                <article key={invite.code}>
                  <strong>{invite.code}</strong>
                  <p>
                    {invite.role} - {invite.memberStatus} - {invite.status === "open" ? "pendiente" : "usada"}
                  </p>
                </article>
              ))}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

function AuthScreen({ accounts, invitations, onLogin, onRegister }) {
  const [mode, setMode] = useState("login");
  const [message, setMessage] = useState("");
  const [loginForm, setLoginForm] = useState({
    email: "papa@casa.local",
    password: "casa1234",
  });
  const [registerForm, setRegisterForm] = useState({
    inviteCode: "",
    name: "",
    email: "",
    password: "",
  });

  function updateLogin(event) {
    setLoginForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function updateRegister(event) {
    setRegisterForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function submitLogin(event) {
    event.preventDefault();
    const account = accounts.find(
      (item) =>
        item.email.toLowerCase() === loginForm.email.trim().toLowerCase() &&
        item.password === loginForm.password,
    );

    if (!account) {
      setMessage("No encontramos ese email y clave.");
      return;
    }

    onLogin(account.userId);
  }

  function submitRegister(event) {
    event.preventDefault();
    const invite = invitations.find(
      (item) =>
        item.code.toUpperCase() === registerForm.inviteCode.trim().toUpperCase() &&
        item.status === "open",
    );

    if (!invite) {
      setMessage("El codigo de invitacion no existe o ya fue usado.");
      return;
    }

    if (!registerForm.name.trim() || !registerForm.email.trim() || !registerForm.password.trim()) {
      setMessage("Completa nombre, email y clave.");
      return;
    }

    if (accounts.some((account) => account.email.toLowerCase() === registerForm.email.trim().toLowerCase())) {
      setMessage("Ese email ya tiene cuenta.");
      return;
    }

    onRegister({
      invite,
      name: registerForm.name.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password,
    });
  }

  return (
    <main className="auth-shell">
      <section className="panel auth-card">
        <div className="brand">
          <span className="brand-mark">CN</span>
          <div>
            <p>Casa Nube</p>
            <strong>Familia Arias</strong>
          </div>
        </div>

        <div className="auth-tabs">
          <button className={mode === "login" ? "selected" : ""} type="button" onClick={() => setMode("login")}>
            Ingresar
          </button>
          <button className={mode === "register" ? "selected" : ""} type="button" onClick={() => setMode("register")}>
            Registrarse
          </button>
        </div>

        {mode === "login" ? (
          <form className="entry-form auth-form" onSubmit={submitLogin}>
            <label className="wide">
              <span>Email</span>
              <input name="email" type="email" value={loginForm.email} onChange={updateLogin} />
            </label>
            <label className="wide">
              <span>Clave</span>
              <input name="password" type="password" value={loginForm.password} onChange={updateLogin} />
            </label>
            <button className="primary-action wide" type="submit">
              Entrar
            </button>
            <p className="helper-copy">Acceso inicial de prueba: papa@casa.local / casa1234</p>
          </form>
        ) : (
          <form className="entry-form auth-form" onSubmit={submitRegister}>
            <label className="wide">
              <span>Codigo de invitacion</span>
              <input name="inviteCode" type="text" value={registerForm.inviteCode} onChange={updateRegister} />
            </label>
            <label>
              <span>Nombre</span>
              <input name="name" type="text" value={registerForm.name} onChange={updateRegister} />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" value={registerForm.email} onChange={updateRegister} />
            </label>
            <label className="wide">
              <span>Clave</span>
              <input name="password" type="password" value={registerForm.password} onChange={updateRegister} />
            </label>
            <button className="primary-action wide" type="submit">
              Crear cuenta
            </button>
          </form>
        )}

        {message && <p className="form-message">{message}</p>}
      </section>
    </main>
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
      <a className={activeSection === "usuarios" ? "active" : ""} href="#usuarios">
        <NavIcon type="family" />
        <span>Familia</span>
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
  const [theme, setTheme] = useState(() => window.localStorage.getItem("casa-nube-theme") || "light");
  const [users, setUsers] = useState(() => normalizeUsers(readStorage("casa-nube-users", initialUsers)));
  const [accounts, setAccounts] = useState(() => readStorage("casa-nube-accounts", initialAccounts));
  const [sessionUserId, setSessionUserId] = useState(() => window.localStorage.getItem("casa-nube-session-user"));
  const [invitations, setInvitations] = useState(() => readStorage("casa-nube-invitations", []));
  const [records, setRecords] = useState(() => readStorage("casa-nube-records", initialRecords));
  const [messages, setMessages] = useState(() => readStorage("casa-nube-messages", initialMessages));
  const [drafts, setDrafts] = useState(() => readStorage("casa-nube-drafts", []));
  const [selectedUserId, setSelectedUserId] = useState(() => window.localStorage.getItem("casa-nube-selected-user") || "papa");
  const [historyUserId, setHistoryUserId] = useState("luli");

  const currentUser = useMemo(
    () => getUser(users, sessionUserId) ?? null,
    [sessionUserId, users],
  );

  useEffect(() => {
    function updateActiveSection() {
      setActiveSection(window.location.hash.replace("#", "") || "inicio");
    }

    window.addEventListener("hashchange", updateActiveSection);
    updateActiveSection();

    return () => window.removeEventListener("hashchange", updateActiveSection);
  }, []);

  useEffect(() => {
    document.body.dataset.theme = theme;
    window.localStorage.setItem("casa-nube-theme", theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem("casa-nube-users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    window.localStorage.setItem("casa-nube-accounts", JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    window.localStorage.setItem("casa-nube-invitations", JSON.stringify(invitations));
  }, [invitations]);

  useEffect(() => {
    if (sessionUserId) {
      window.localStorage.setItem("casa-nube-session-user", sessionUserId);
    } else {
      window.localStorage.removeItem("casa-nube-session-user");
    }
  }, [sessionUserId]);

  useEffect(() => {
    window.localStorage.setItem("casa-nube-records", JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    window.localStorage.setItem("casa-nube-messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    window.localStorage.setItem("casa-nube-drafts", JSON.stringify(drafts));
  }, [drafts]);

  useEffect(() => {
    window.localStorage.setItem("casa-nube-selected-user", selectedUserId);
  }, [selectedUserId]);

  function handleCreateUser(user) {
    setUsers((current) => [...current, user]);
    setSelectedUserId(user.id);
  }

  function handleLogin(userId) {
    setSessionUserId(userId);
    window.location.hash = "#inicio";
  }

  function handleLogout() {
    setSessionUserId(null);
  }

  function handleRegister({ invite, name, email, password }) {
    const user = {
      id: crypto.randomUUID(),
      name,
      role: invite.role,
      status: invite.memberStatus,
      mascotId: invite.mascotId,
      isAdmin: false,
    };

    setUsers((current) => [...current, user]);
    setAccounts((current) => [...current, { id: crypto.randomUUID(), email, password, userId: user.id }]);
    setInvitations((current) =>
      current.map((item) =>
        item.code === invite.code ? { ...item, status: "used", acceptedBy: user.id } : item,
      ),
    );
    setSessionUserId(user.id);
    setSelectedUserId(user.id);
    window.location.hash = "#inicio";
  }

  function handleCreateInvite(inviteForm) {
    setInvitations((current) => [
      {
        code: createInviteCode(),
        role: inviteForm.role,
        memberStatus: inviteForm.status,
        mascotId: inviteForm.mascotId,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        status: "open",
      },
      ...current,
    ]);
  }

  function handleDeleteUser(userId) {
    setUsers((current) => current.filter((user) => user.id !== userId));
    setRecords((current) => current.filter((record) => record.assignedTo !== userId && record.createdBy !== userId));
    setMessages((current) => current.filter((message) => message.authorId !== userId));
    setSelectedUserId("papa");
  }

  function handleMakeAdmin(userId) {
    setUsers((current) =>
      current.map((user) => ({
        ...user,
        isAdmin: user.id === userId ? true : user.isAdmin,
      })),
    );
  }

  function handleSaveRecord(record) {
    setRecords((current) => [record, ...current]);
  }

  function handleSaveDraft(draft) {
    setDrafts((current) => [draft, ...current]);
  }

  function handleSendMessage(text) {
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        authorId: currentUser.id,
        text,
      },
    ]);
  }

  if (!currentUser) {
    return (
      <AuthScreen
        accounts={accounts}
        invitations={invitations}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  return (
    <>
      <main className="app-shell app-shell-single">
        <section className="workspace">
          <header className="topbar">
            <div className="brand compact-brand">
              <span className="brand-mark">CN</span>
              <div>
                <p>Casa Nube</p>
                <strong>Familia Arias</strong>
              </div>
            </div>
            <div className="top-actions">
              <span className="soft-note">{currentUser.name}</span>
              <ThemeToggle theme={theme} onThemeChange={setTheme} />
              <button className="ghost-button" type="button" onClick={handleLogout}>
                Salir
              </button>
              <a className="primary-action" href="#usuarios">
                Integrantes
              </a>
            </div>
          </header>

          {activeSection === "inicio" && <HomeSection records={records} users={users} />}
          {activeSection === "chat" && (
            <ChatSection
              currentUser={currentUser}
              messages={messages}
              users={users}
              onSendMessage={handleSendMessage}
            />
          )}
          {activeSection === "calendario" && <CalendarSection records={records} users={users} />}
          {activeSection === "resultados" && <ResultsSection records={records} users={users} />}
          {activeSection === "historial" && (
            <HistorySection
              records={records}
              users={users}
              selectedUserId={historyUserId}
              onSelectUser={setHistoryUserId}
            />
          )}
          {activeSection === "usuarios" && (
            <UsersSection
              users={users}
              currentUser={currentUser}
              selectedUserId={selectedUserId}
              invitations={invitations}
              onSelectUser={setSelectedUserId}
              onCreateUser={handleCreateUser}
              onDeleteUser={handleDeleteUser}
              onMakeAdmin={handleMakeAdmin}
              onCreateInvite={handleCreateInvite}
            />
          )}
          {activeSection === "cargar" && (
            <EntrySection
              currentUser={currentUser}
              users={users}
              onSaveRecord={handleSaveRecord}
              onSaveDraft={handleSaveDraft}
            />
          )}
        </section>
      </main>

      <BottomNav activeSection={activeSection} />
    </>
  );
}
