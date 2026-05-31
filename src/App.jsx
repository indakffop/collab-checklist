import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, remove } from "firebase/database";

// ─── PASTE YOUR FIREBASE CONFIG HERE ──────────────────────────────────────
// Go to Firebase Console → Project Settings → Your apps → SDK setup
// Copy the firebaseConfig object and replace this one
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN",
  databaseURL: "PASTE_YOUR_DATABASE_URL",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID",
};
// ──────────────────────────────────────────────────────────────────────────

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const NEON = [
  "#ff2d55","#ff6b2d","#ffcc00","#39ff14","#00ff87",
  "#00e5ff","#2979ff","#d500f9","#ff4081","#76ff03",
  "#ff6d00","#00bfa5","#1de9b6","#e040fb","#40c4ff",
  "#ff5252","#69f0ae","#ffab40","#ea80fc","#b2ff59",
  "#84ffff","#ff80ab","#ccff90","#a7ffeb","#ffd180",
];
function randomNeon() { return NEON[Math.floor(Math.random() * NEON.length)]; }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const SEED = [
  {t:"Prisoners",w:true},{t:"The Truman Show",w:true},{t:"Predestination",w:true},
  {t:"Inglourious Basterds",w:true},{t:"Superman 2025",w:true},
  {t:"Once Upon a Time in Hollywood",w:true},{t:"Fight Club",w:true},
  {t:"Mr. & Mrs. Smith",w:true},{t:"Free Guy",w:true},{t:"F1",w:true},
  {t:"Suits",w:true},{t:"Moon Knight",w:true},{t:"Bullet Train",w:true},
  {t:"Jerry Maguire",w:true},{t:"Se7en"},{t:"Wind River"},{t:"Zodiac"},
  {t:"New York, I Love You"},{t:"The Matrix"},{t:"The Matrix Reloaded"},
  {t:"The Matrix Resurrections"},{t:"The Matrix Revolutions"},
  {t:"Mulholland Drive"},{t:"Jacob's Ladder"},{t:"Parasite"},
  {t:"Transcendence"},{t:"Chernobyl"},{t:"Vanilla Sky"},{t:"Split"},
  {t:"Mr. Nobody"},{t:"Knives Out"},{t:"Tenet"},{t:"Arrival"},
  {t:"Frailty"},{t:"Victor Frankenstein"},{t:"Van Helsing 2"},
  {t:"Real Steel"},{t:"The Greatest Showman"},{t:"Ford v Ferrari"},
  {t:"Pantheon"},{t:"Ministry of Ungentlemanly Warfare"},{t:"Hawkeye"},
  {t:"Iron Heart"},{t:"Secret Invasion"},{t:"I Am Groot"},
  {t:"Kill Bill Vol. 1"},{t:"Kill Bill Vol. 2"},{t:"Pulp Fiction"},
  {t:"Ocean's Eleven"},{t:"Ocean's Twelve"},{t:"The Departed"},
  {t:"Victoria & Abdul"},{t:"The Revenant"},{t:"12 Years a Slave"},
  {t:"Upendra A"},{t:"eXistenZ"},{t:"Coherence"},{t:"Annihilation"},
  {t:"12 Monkeys"},{t:"King of Kotha"},{t:"Lokah"},{t:"Saripoda Sanivaaram"},
  {t:"HIT 3"},{t:"Avatar 1"},{t:"Avatar 2"},{t:"Avatar 3"},
  {t:"No Country for Old Men"},{t:"12 Angry Men"},{t:"Jawan"},
  {t:"Kingdom"},{t:"Devil Wears Prada 2"},{t:"Madame Web"},
  {t:"The Hunger Games"},{t:"Passengers"},{t:"Breaking Bad"},
  {t:"Game of Thrones"},{t:"Frieren"},{t:"Princess Mononoke"},
  {t:"Spirited Away"},{t:"Re:Zero"},{t:"Blue Box"},{t:"Oppenheimer"},
  {t:"Wonder Man"},{t:"Logan"},{t:"The Lord of the Rings 1"},
  {t:"The Lord of the Rings 2"},{t:"The Lord of the Rings 3"},
  {t:"The Shawshank Redemption"},{t:"The Godfather"},
  {t:"The Godfather Part II"},{t:"The Godfather Part III"},
  {t:"Goodfellas"},{t:"Forrest Gump"},{t:"Grave of the Fireflies"},
  {t:"Good Will Hunting"},{t:"Pirates of the Caribbean 1"},
  {t:"Pirates of the Caribbean 2"},{t:"Pirates of the Caribbean 3"},
  {t:"Pirates of the Caribbean 5"},{t:"Looper"},{t:"Reservoir Dogs"},
  {t:"Scarlet (Netflix)"},{t:"Top Gun"},{t:"Top Gun: Maverick"},
  {t:"The Darjeeling Limited"},{t:"Shanghai Noon"},{t:"Supergirl"},
  {t:"Project Hail Mary"},{t:"Batman Begins"},{t:"The Dark Knight"},
  {t:"The Dark Knight Rises"},{t:"American Psycho"},{t:"The Big Short"},
  {t:"What's Eating Gilbert Grape"},{t:"A Few Good Men"},{t:"La La Land"},
  {t:"The Fall Guy"},{t:"Ides of March"},{t:"The Gray Man"},
  {t:"American Hustle"},{t:"Don't Look Up"},{t:"A Beautiful Mind"},
  {t:"The Butterfly Effect"},{t:"The Game"},{t:"Mother!"},
  {t:"Perfect Blue"},{t:"Triangle"},{t:"Matchstick Men"},
  {t:"Mississippi Burning"},{t:"Dhurandar"},{t:"Dhurandar 2"},
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080808; }

  .wl-wrap { background: #080808; color: #eee; font-family: 'DM Mono', monospace; min-height: 100vh; padding-bottom: 80px; }

  .wl-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 28px 36px 20px;
    border-bottom: 1px solid #222;
    position: sticky; top: 0;
    background: rgba(8,8,8,0.92);
    backdrop-filter: blur(12px);
    z-index: 100;
  }
  .wl-logo { font-family: 'Bebas Neue', sans-serif; font-size: 2.2rem; letter-spacing: 6px; color: #fff; display:flex; align-items:center; gap:8px; }
  .wl-dot { width:10px; height:10px; border-radius:50%; background:#fff; animation: wlpulse 2s ease-in-out infinite; }
  @keyframes wlpulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
  .wl-stats { font-size: 0.68rem; color: #555; text-align: right; line-height: 1.7; }
  .wl-stats b { color: #eee; }

  .wl-filters {
    display: flex; gap: 8px; padding: 18px 36px;
    border-bottom: 1px solid #222; flex-wrap: wrap; align-items: center;
  }
  .wl-fbtn {
    background: none; border: 1px solid #222; color: #555;
    font-family: 'DM Mono', monospace; font-size: 0.7rem;
    padding: 6px 14px; border-radius: 99px; cursor: pointer;
    transition: all 0.15s; letter-spacing: 1px; text-transform: uppercase;
  }
  .wl-fbtn:hover { border-color: #444; color: #aaa; }
  .wl-fbtn.active { background: #eee; color: #080808; border-color: #eee; }
  .wl-search {
    margin-left: auto; background: #111; border: 1px solid #222; color: #eee;
    font-family: 'DM Mono', monospace; font-size: 0.72rem;
    padding: 7px 14px; border-radius: 6px; outline: none; width: 200px;
    transition: border-color 0.15s;
  }
  .wl-search:focus { border-color: #444; }
  .wl-search::placeholder { color: #555; }

  .wl-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px; padding: 24px 36px;
  }

  .wl-card {
    background: #111; border: 1px solid #222; border-radius: 6px;
    padding: 16px 18px; position: relative; overflow: hidden;
    transition: border-color 0.2s, transform 0.15s;
  }
  .wl-card:hover { border-color: #333; transform: translateY(-2px); }
  .wl-card.watched { opacity: 0.5; }
  .wl-card.watched .wl-title { text-decoration: line-through; }
  .wl-accent { position: absolute; top: 0; left: 0; right: 0; height: 3px; }
  .wl-title {
    font-family: 'Bebas Neue', sans-serif; font-size: 1.3rem;
    letter-spacing: 2px; line-height: 1.2;
    margin-bottom: 12px; margin-top: 4px; word-break: break-word;
  }
  .wl-dates {
    font-size: 0.6rem; color: #555; line-height: 1.9;
    border-top: 1px solid #222; padding-top: 10px; margin-bottom: 12px;
  }
  .wl-dates span { display: block; }
  .wl-dates b { color: #777; }
  .wl-actions { display: flex; gap: 8px; }
  .wl-btn {
    font-family: 'DM Mono', monospace; font-size: 0.6rem;
    padding: 5px 11px; border-radius: 4px; border: 1px solid #222;
    background: none; color: #555; cursor: pointer;
    text-transform: uppercase; letter-spacing: 1px; transition: all 0.15s;
  }
  .wl-btn:hover { color: #eee; border-color: #555; }
  .wl-del { margin-left: auto; }
  .wl-del:hover { color: #ff4444 !important; border-color: #ff4444 !important; }

  .wl-empty { text-align: center; padding: 80px 36px; color: #555; grid-column: 1/-1; }
  .wl-empty-title { font-family:'Bebas Neue',sans-serif; font-size:3rem; letter-spacing:6px; color:#1a1a1a; margin-bottom:12px; }

  .wl-addbtn {
    position: fixed; bottom: 32px; right: 36px;
    width: 54px; height: 54px; border-radius: 50%;
    background: #fff; color: #000; border: none; font-size: 1.6rem;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    z-index: 200; box-shadow: 0 0 30px rgba(255,255,255,0.15);
    transition: transform 0.15s, box-shadow 0.15s;
  }
  .wl-addbtn:hover { transform: scale(1.08); box-shadow: 0 0 40px rgba(255,255,255,0.25); }

  .wl-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.85); z-index: 300;
    align-items: center; justify-content: center;
    backdrop-filter: blur(4px);
  }
  .wl-overlay.open { display: flex; }
  .wl-modal {
    background: #111; border: 1px solid #2a2a2a; border-radius: 10px;
    padding: 32px; width: 100%; max-width: 400px;
    animation: wlmodalin 0.2s ease;
  }
  @keyframes wlmodalin { from{opacity:0;transform:scale(0.96) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  .wl-modal h2 { font-family:'Bebas Neue',sans-serif; font-size:1.6rem; letter-spacing:4px; margin-bottom:22px; }
  .wl-label { display:block; font-size:0.6rem; letter-spacing:1.5px; text-transform:uppercase; color:#555; margin-bottom:6px; }
  .wl-input {
    width:100%; background:#181818; border:1px solid #222; color:#eee;
    font-family:'DM Mono',monospace; font-size:0.8rem;
    padding:10px 12px; border-radius:6px; outline:none; transition:border-color 0.15s;
  }
  .wl-input:focus { border-color:#444; }
  .wl-mactions { display:flex; gap:10px; margin-top:22px; }
  .wl-save {
    flex:1; padding:11px; background:#fff; color:#000; border:none;
    font-family:'DM Mono',monospace; font-size:0.75rem; font-weight:500;
    text-transform:uppercase; letter-spacing:1.5px; border-radius:6px;
    cursor:pointer; transition:opacity 0.15s;
  }
  .wl-save:hover { opacity:0.88; }
  .wl-cancel {
    padding:11px 18px; background:none; border:1px solid #222; color:#555;
    font-family:'DM Mono',monospace; font-size:0.75rem;
    text-transform:uppercase; letter-spacing:1px; border-radius:6px;
    cursor:pointer; transition:all 0.15s;
  }
  .wl-cancel:hover { color:#eee; border-color:#444; }

  .wl-loading { display:flex; align-items:center; justify-content:center; height:60vh; color:#333; font-size:0.8rem; letter-spacing:2px; }

  @media (max-width:600px) {
    .wl-header { padding:18px 20px; }
    .wl-filters { padding:14px 20px; }
    .wl-grid { padding:16px 20px; gap:10px; }
    .wl-addbtn { bottom:24px; right:20px; }
    .wl-search { width:130px; }
  }
`;

export default function App() {
  const [items, setItems]       = useState(null); // null = loading
  const [filter, setFilter]     = useState("all");
  const [search, setSearch]     = useState("");
  const [modalOpen, setModal]   = useState(false);
  const [titleVal, setTitle]    = useState("");
  const [seeded, setSeeded]     = useState(false);

  // ── Firebase listener ──
  useEffect(() => {
    const moviesRef = ref(db, "movies");
    const unsub = onValue(moviesRef, (snap) => {
      const data = snap.val();
      if (data) {
        const arr = Object.values(data).sort((a, b) => {
          // unwatched first, then by addedAt desc
          if (a.watched !== b.watched) return a.watched ? 1 : -1;
          return new Date(b.addedAt) - new Date(a.addedAt);
        });
        setItems(arr);
        setSeeded(true);
      } else if (!seeded) {
        // First time — seed the database
        const now = new Date().toISOString();
        const batch = {};
        SEED.forEach((s, i) => {
          const id = "seed_" + i;
          batch[id] = {
            id, title: s.t,
            color: NEON[i % NEON.length],
            watched: !!s.w,
            addedAt: now,
            watchedAt: s.w ? now : null,
          };
        });
        set(ref(db, "movies"), batch);
        setSeeded(true);
      } else {
        setItems([]);
      }
    });
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filter + search ──
  const visible = (items || []).filter(it => {
    if (filter === "watched")   return it.watched;
    if (filter === "unwatched") return !it.watched;
    return true;
  }).filter(it =>
    !search.trim() || it.title.toLowerCase().includes(search.toLowerCase())
  );

  const total   = (items || []).length;
  const watched = (items || []).filter(i => i.watched).length;

  // ── Actions ──
  function markWatched(id) {
    update(ref(db, "movies/" + id), { watched: true, watchedAt: new Date().toISOString() });
  }
  function unwatch(id) {
    update(ref(db, "movies/" + id), { watched: false, watchedAt: null });
  }
  function deleteItem(id) {
    remove(ref(db, "movies/" + id));
  }
  function addItem() {
    const t = titleVal.trim();
    if (!t) return;
    const id = uid();
    set(ref(db, "movies/" + id), {
      id, title: t, color: randomNeon(),
      watched: false, addedAt: new Date().toISOString(), watchedAt: null,
    });
    setTitle(""); setModal(false);
  }

  return (
    <>
      <style>{styles}</style>
      <div className="wl-wrap">

        {/* HEADER */}
        <header className="wl-header">
          <div className="wl-logo">
            WATCHLIST <span className="wl-dot" />
          </div>
          <div className="wl-stats">
            <b>{total}</b> titles &nbsp;·&nbsp; <b>{watched}</b> watched &nbsp;·&nbsp; <b>{total - watched}</b> remaining
          </div>
        </header>

        {/* FILTERS */}
        <div className="wl-filters">
          {["all","unwatched","watched"].map(f => (
            <button key={f} className={`wl-fbtn${filter===f?" active":""}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
          <input
            className="wl-search" type="text"
            placeholder="Search…" value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* GRID */}
        {items === null ? (
          <div className="wl-loading">LOADING…</div>
        ) : (
          <div className="wl-grid">
            {visible.length === 0 ? (
              <div className="wl-empty">
                <div className="wl-empty-title">Nothing here</div>
                <p>Try a different filter or add something.</p>
              </div>
            ) : visible.map(it => (
              <div key={it.id} className={`wl-card${it.watched?" watched":""}`}>
                <div className="wl-accent" style={{ background: it.color }} />
                <div className="wl-title">{it.title}</div>
                <div className="wl-dates">
                  <span><b>Added&nbsp;&nbsp;</b> {fmtDate(it.addedAt)}</span>
                  {it.watched && <span><b>Watched</b> {fmtDate(it.watchedAt)}</span>}
                </div>
                <div className="wl-actions">
                  {it.watched
                    ? <button className="wl-btn" onClick={() => unwatch(it.id)}>↩ Unwatch</button>
                    : <button className="wl-btn" style={{ color: it.color, borderColor: it.color }} onClick={() => markWatched(it.id)}>✓ Watched</button>
                  }
                  <button className="wl-btn wl-del" onClick={() => deleteItem(it.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ADD BUTTON */}
        <button className="wl-addbtn" onClick={() => { setTitle(""); setModal(true); }}>+</button>

        {/* MODAL */}
        <div className={`wl-overlay${modalOpen?" open":""}`} onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div className="wl-modal">
            <h2>Add to List</h2>
            <label className="wl-label">Title</label>
            <input
              className="wl-input" type="text"
              placeholder="Title…" value={titleVal}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key==="Enter" && addItem()}
              autoFocus
            />
            <div className="wl-mactions">
              <button className="wl-cancel" onClick={() => setModal(false)}>Cancel</button>
              <button className="wl-save" onClick={addItem}>Add</button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
    }
