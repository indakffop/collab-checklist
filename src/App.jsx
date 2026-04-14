import { useState, useRef, useEffect } from "react";
import { db } from "./firebase";
import { ref, push, onValue, update, remove, serverTimestamp } from "firebase/database";

const COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#C77DFF", "#FF9A3C", "#F97316", "#06B6D4"];
const itemsRef = ref(db, "checklist");

function pickColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function NameGate({ onJoin }) {
  const [name, setName] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);
  const color = useRef(pickColor()).current;

  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    onJoin(trimmed, color);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0f0f0f", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Mono','Courier New',monospace", padding:24, boxSizing:"border-box" }}>
      <div style={{ width:"100%", maxWidth:360, background:"#1a1a1a", border:"1px solid #2e2e2e", borderRadius:16, padding:"36px 32px", boxShadow:"0 0 0 1px #000,0 24px 48px rgba(0,0,0,.6)", textAlign:"center" }}>
        <div style={{ width:48, height:48, borderRadius:"50%", background:color, boxShadow:`0 0 24px ${color}88`, margin:"0 auto 24px" }} />
        <div style={{ fontSize:20, fontWeight:700, letterSpacing:"0.15em", color:"#f0f0f0", marginBottom:8 }}>JOIN CHECKLIST</div>
        <div style={{ fontSize:12, color:"#555", marginBottom:28, lineHeight:1.6 }}>
          You've been assigned <span style={{ color, fontWeight:700 }}>this colour</span>.<br/>
          What should we call you?
        </div>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          maxLength={20}
          placeholder="Your name…"
          style={{ width:"100%", background:"#111", border:`1px solid ${shake ? "#FF6B6B" : "#2e2e2e"}`, borderRadius:8, padding:"11px 14px", color:"#e0e0e0", fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box", marginBottom:14, transition:"border-color .2s", animation: shake ? "shake .4s ease" : "none" }}
        />
        <button
          onClick={submit}
          style={{ width:"100%", background:color, border:"none", borderRadius:8, padding:"11px", color:"#111", fontSize:13, fontWeight:700, letterSpacing:"0.1em", cursor:"pointer", fontFamily:"inherit" }}
        >
          LET'S GO →
        </button>
      </div>
      <style>{`
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20%      { transform:translateX(-6px); }
          40%      { transform:translateX(6px); }
          60%      { transform:translateX(-4px); }
          80%      { transform:translateX(4px); }
        }
      `}</style>
    </div>
  );
}

function Checklist({ myName, myColor }) {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const unsub = onValue(itemsRef, (snap) => {
      setConnected(true);
      const data = snap.val();
      if (!data) { setItems([]); return; }
      const list = Object.entries(data)
        .map(([id, val]) => ({ id, ...val }))
        .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      setItems(list);
    });
    return () => unsub();
  }, []);

  const add = () => {
    const text = input.trim();
    if (!text) return;
    push(itemsRef, { text, done: false, author: myName, color: myColor, createdAt: serverTimestamp() });
    setInput("");
    inputRef.current?.focus();
  };

  const toggle = (item) => update(ref(db, `checklist/${item.id}`), { done: !item.done, checkedBy: myName });
  const del    = (item) => remove(ref(db, `checklist/${item.id}`));

  const done = items.filter((i) => i.done).length;
  const pct  = items.length ? (done / items.length) * 100 : 0;

  return (
    <div style={{ minHeight:"100vh", background:"#0f0f0f", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Mono','Courier New',monospace", padding:24, boxSizing:"border-box" }}>
      <div style={{ width:"100%", maxWidth:480, background:"#1a1a1a", border:"1px solid #2e2e2e", borderRadius:16, padding:"28px 28px 20px", boxShadow:"0 0 0 1px #000,0 24px 48px rgba(0,0,0,.6)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
          <div>
            <div style={{ fontSize:22, fontWeight:700, letterSpacing:"0.18em", color:"#f0f0f0" }}>CHECKLIST</div>
            <div style={{ fontSize:12, color:"#555", marginTop:3 }}>
              {items.length === 0 ? "nothing yet" : `${done} of ${items.length} done`}
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px", borderRadius:20, background: connected ? "#0d2d1a" : "#1a1a1a", border:`1px solid ${connected ? "#1a5c33" : "#333"}`, fontSize:11, color: connected ? "#4ade80" : "#555", fontWeight:600 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background: connected ? "#4ade80" : "#555", boxShadow: connected ? "0 0 6px #4ade80" : "none", display:"inline-block" }} />
            {connected ? "live" : "connecting…"}
          </div>
        </div>
        <div style={{ height:3, background:"#2a2a2a", borderRadius:2, marginBottom:20, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#6BCB77,#4D96FF)", borderRadius:2, transition:"width .4s ease" }} />
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16, minHeight:40 }}>
          {items.length === 0 && connected && (
            <div style={{ color:"#333", fontSize:13, textAlign:"center", padding:"20px 0" }}>Add your first item ↓</div>
          )}
          {items.map((item) => (
            <div key={item.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", background: item.done ? "#141414" : "#202020", border:`1px solid ${item.done ? "#1e1e1e" : "#2e2e2e"}`, borderRadius:10, transition:"all .2s" }}>
              <button
                onClick={() => toggle(item)}
                style={{ width:22, height:22, borderRadius:6, border:`2px solid ${item.done ? "#4ade80" : "#3a3a3a"}`, background: item.done ? "#4ade80" : "transparent", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .15s", padding:0 }}
              >
                {item.done && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
                <span style={{ fontSize:14, color: item.done ? "#444" : "#d0d0d0", textDecoration: item.done ? "line-through" : "none", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {item.text}
                </span>
                <span style={{ fontSize:10, padding:"2px 7px", borderRadius:10, fontWeight:700, letterSpacing:"0.06em", flexShrink:0, background: item.color + "28", color: item.color }}>
                  {item.author}
                </span>
              </div>
              <button onClick={() => del(item)} style={{ background:"none", border:"none", color:"#3a3a3a", fontSize:22, cursor:"pointer", lineHeight:1, padding:"0 2px", flexShrink:0 }}>×</button>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center", borderTop:"1px solid #222", paddingTop:16 }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:myColor, boxShadow:`0 0 8px ${myColor}`, flexShrink:0 }} />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="Add an item and hit Enter…"
            style={{ flex:1, background:"#111", border:"1px solid #2e2e2e", borderRadius:8, padding:"10px 14px", color:"#e0e0e0", fontSize:14, outline:"none", fontFamily:"inherit" }}
          />
          <button onClick={add} style={{ background:"#f0f0f0", border:"none", borderRadius:8, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v12M2 8h12" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div style={{ marginTop:14, fontSize:11, color:"#444", textAlign:"center" }}>
          Joining as <strong style={{ color:myColor }}>{myName}</strong> · changes sync live for everyone
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  if (!user) return <NameGate onJoin={(name, color) => setUser({ name, color })} />;
  return <Checklist myName={user.name} myColor={user.color} />;
}
