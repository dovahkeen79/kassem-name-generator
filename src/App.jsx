import { useState } from "react";

const CATEGORIES = [
  { key: "meaning", label: "Meaning & Theme", icon: "💫", options: ["Gift from God", "Light & Brightness", "Nature & Beauty", "Faith & Blessing", "Strength & Power", "Love & Warmth", "Wisdom & Knowledge", "Freedom & Spirit", "Grace & Elegance", "Hope & New Beginnings"] },
  { key: "origin", label: "Origin", icon: "🌍", options: ["Arabic", "English", "Latin", "Greek", "Persian", "French", "Italian", "Celtic / Irish", "Scandinavian", "Turkish", "Mixed / Multicultural"] },
  { key: "style", label: "Style", icon: "🎨", options: ["Soft & Gentle", "Elegant & Classic", "Unique & Rare", "Bold & Unexpected", "Modern & Trendy", "Timeless & Traditional", "Exotic & Mysterious", "Poetic & Lyrical"] },
  { key: "syllables", label: "Syllables", icon: "🔤", options: ["1 syllable", "2 syllables", "3 syllables", "No preference"] },
  { key: "ending", label: "Ending Sound", icon: "🎵", options: ["Ends in -a", "Ends in -ine / -ina", "Ends in -el / -elle", "Ends in -ie / -y", "Ends in -en / -in", "Ends in consonant", "No preference"] },
  { key: "vibe", label: "Personality Vibe", icon: "✨", options: ["Dreamy & Poetic", "Bold & Fierce", "Gentle & Warm", "Intellectual & Deep", "Playful & Bright", "Spiritual & Sacred", "Confident & Strong", "Calm & Serene"] },
  { key: "length", label: "Name Length", icon: "📏", options: ["Short (3–4 letters)", "Medium (5–6 letters)", "Longer (7+ letters)", "No preference"] },
  { key: "avoid", label: "Avoid Origins", icon: "🚫", options: ["Hebrew", "Indian / Sanskrit", "African", "East Asian", "Slavic", "None — open to all"] }
];

const DEFAULT_SEL = { meaning: ["Gift from God"], origin: ["Arabic"], style: ["Unique & Rare"], syllables: ["2 syllables"], ending: ["No preference"], vibe: ["Gentle & Warm"], length: ["No preference"], avoid: ["Hebrew"] };
const EXCLUDED = "Luna, Aria, Lyra, Amina, Wren, Zara, Nora, Layla, Yasmin, Rania, Amara, Dalya, Nadia, Luma, Ayla, Soraya, Hana, Warda, Salma, Eman, Naeema, Arwa, Dania, Ziva, Alba, Kira, Lumi, Eden, Clover, Yara, Noa, Zola, Suri, Neva, Hiba, Aya, Jana, Nima, Thea, Sama, Huda, Manna, Rahma, Niema, Nada, Safa, Wafa, Muna, Zaina, Hina, Fina, Rima, Celine, Ondine, Mina, Lina, Nadine, Dina, Rina";

const THEMES = {
  girl: { bg: "linear-gradient(160deg,#1a0820 0%,#3d1a3a 50%,#1a0820 100%)", accent: "#e891c8", aRgb: "232,145,200", badge: "#e891c8", badgeText: "#1a0820", emoji: "👧", label: "Girl" },
  boy:  { bg: "linear-gradient(160deg,#071828 0%,#0d2d4a 50%,#071828 100%)", accent: "#63b3f5", aRgb: "99,179,245",  badge: "#63b3f5", badgeText: "#071828", emoji: "👦", label: "Boy"  }
};

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI  = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

export default function App() {
  const [gender,      setGender]      = useState("girl");
  const [familyName,  setFamilyName]  = useState("Kassem");
  const [siblings,    setSiblings]    = useState(["Tala", "Abdallah"]);
  const [newSib,      setNewSib]      = useState("");
  const [editFamily,  setEditFamily]  = useState(false);
  const [startsWith,  setStartsWith]  = useState("");
  const [endsWith,    setEndsWith]    = useState("");
  const [selections,  setSelections]  = useState(DEFAULT_SEL);
  const [collapsed,   setCollapsed]   = useState({});
  const [names,       setNames]       = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [generated,   setGenerated]   = useState(false);
  const [favourites,  setFavourites]  = useState([]);
  const [showFavs,    setShowFavs]    = useState(false);

  const T   = THEMES[gender];
  const ac  = (o) => `rgba(${T.aRgb},${o})`;
  const total = Object.values(selections).reduce((a,b) => a + b.length, 0);
  const activeCats = Object.values(selections).filter(v => v.length > 0).length;

  const addSibling = () => {
    const n = newSib.trim();
    if (n && !siblings.includes(n)) { setSiblings(p => [...p, n]); setNewSib(""); }
  };

  const toggle = (key, opt) => setSelections(p => {
    const c = p[key] || [];
    return c.includes(opt) ? {...p, [key]: c.filter(o => o !== opt)} : {...p, [key]: [...c, opt]};
  });

  const toggleFav = (item) => setFavourites(p =>
    p.find(f => f.name === item.name) ? p.filter(f => f.name !== item.name) : [...p, item]
  );
  const isFav = (item) => !!favourites.find(f => f.name === item.name);

  const familyFlow = (n) => [...siblings, n].join(", ") + " " + familyName;

  const buildPrompt = () => {
    const prefs = CATEGORIES.map(c => {
      const s = selections[c.key];
      return s && s.length ? `- ${c.label}: ${s.join(", ")}` : null;
    }).filter(Boolean).join("\n");
    const sibStr = siblings.length ? `Siblings: ${siblings.join(", ")}.` : "First child.";
    const swNote = startsWith.trim() ? `\n- Name must START with the letters: "${startsWith.trim()}"` : "";
    const ewNote = endsWith.trim()   ? `\n- Name must END with the letters: "${endsWith.trim()}"` : "";
    return `Generate exactly 10 unique baby ${gender} names for a Muslim family in London, UK. Family surname: ${familyName}. ${sibStr}

Preferences:
${prefs}${swNote}${ewNote}

Rules:
- UK-friendly, easy for Arabic AND English speakers to pronounce
- Flow well alongside ${siblings.join(", ")} ${familyName}
- Avoid origins listed under "Avoid Origins"
- Do NOT use: ${EXCLUDED}
- Prioritise genuinely rare and memorable names

Respond ONLY in valid JSON array, no markdown, no explanation:
[{"name":"...","origin":"...","meaning":"...","ukFriendly":"⭐⭐⭐⭐⭐","uniqueness":"Very Rare"}]`;
  };

  const generate = async () => {
    if (!total) { setError("Please select at least one preference."); return; }
    if (!API_KEY) { setError("API key not configured."); return; }
    setLoading(true); setError(""); setNames([]); setGenerated(false); setShowFavs(false);
    try {
      const res  = await fetch(GEMINI, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ contents:[{parts:[{text:buildPrompt()}]}], generationConfig:{temperature:1.0,maxOutputTokens:1800} }) });
      const data = await res.json();
      const txt  = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      setNames(JSON.parse(txt.replace(/```json|```/g,"").trim()));
      setGenerated(true);
    } catch { setError("Something went wrong — please try again."); }
    finally   { setLoading(false); }
  };

  return (
    <div style={{minHeight:"100vh", background:T.bg, fontFamily:"'Georgia',serif", color:"#fff", transition:"background 0.5s"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        button,input{font-family:'Georgia',serif}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(${T.aRgb},0.3);border-radius:3px}
        .pill-btn{padding:clamp(5px,1.5vw,7px) clamp(10px,3vw,14px);border-radius:20px;cursor:pointer;font-size:clamp(11px,3vw,13px);transition:all 0.2s;display:inline-flex;align-items:center;gap:4px;font-family:'Georgia',serif}
        .cat-card{border-radius:clamp(10px,3vw,14px);margin-bottom:clamp(7px,2vw,10px);overflow:hidden;transition:border-color 0.3s}
        .cat-header{display:flex;align-items:center;justify-content:space-between;padding:clamp(10px,3vw,13px) clamp(12px,4vw,16px);cursor:pointer}
        .name-card{border-radius:clamp(10px,3vw,14px);padding:clamp(12px,3.5vw,16px);display:flex;align-items:center;justify-content:space-between;gap:12px;transition:all 0.3s;margin-bottom:clamp(7px,2vw,10px)}
        .fav-chip{border-radius:10px;padding:clamp(6px,2vw,9px) clamp(10px,3vw,14px);cursor:pointer}
        input[type=text]{background:rgba(255,255,255,0.06);color:#fff;border-radius:8px;padding:clamp(6px,2vw,9px) clamp(9px,3vw,12px);font-size:clamp(12px,3.5vw,14px);border:1px solid rgba(${T.aRgb},0.35);width:100%;outline:none}
        input[type=text]::placeholder{color:rgba(255,255,255,0.3)}
        .letter-input{width:clamp(70px,22vw,90px)!important}
      `}</style>

      <div style={{maxWidth:700,margin:"0 auto",padding:"clamp(20px,5vw,40px) clamp(12px,4vw,20px) 60px"}}>

        {/* ── HEADER ── */}
        <div style={{textAlign:"center",marginBottom:"clamp(20px,5vw,30px)"}}>
          <div style={{fontSize:"clamp(28px,8vw,40px)",marginBottom:6,transition:"all 0.3s"}}>{T.emoji}</div>
          <h1 style={{color:T.accent,fontSize:"clamp(18px,5.5vw,26px)",fontWeight:"bold",letterSpacing:"0.05em",marginBottom:4,textShadow:`0 0 40px rgba(${T.aRgb},0.4)`,transition:"all 0.5s"}}>
            Baby Names Generator
          </h1>
          <p style={{color:`rgba(${T.aRgb},0.5)`,fontSize:"clamp(9px,2.5vw,11px)",marginBottom:"clamp(10px,3vw,16px)",letterSpacing:"0.06em"}}>
            created by Abbas Kassem
          </p>

          {/* Gender toggle */}
          <div style={{display:"inline-flex",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:30,padding:4,gap:4,marginBottom:"clamp(12px,3vw,18px)"}}>
            {["girl","boy"].map(g => (
              <button key={g} onClick={() => { setGender(g); setNames([]); setGenerated(false); }} style={{
                padding:`clamp(7px,2vw,10px) clamp(16px,5vw,24px)`,borderRadius:24,
                border:`1px solid ${g===gender ? THEMES[g].accent : "transparent"}`,
                background:g===gender ? `rgba(${THEMES[g].aRgb},0.15)` : "transparent",
                color:g===gender ? THEMES[g].accent : "rgba(255,255,255,0.3)",
                cursor:"pointer",fontSize:"clamp(12px,3.5vw,14px)",fontWeight:g===gender?"bold":"normal",
                transition:"all 0.3s",display:"flex",alignItems:"center",gap:6
              }}>{THEMES[g].emoji} {THEMES[g].label}</button>
            ))}
          </div>

          {/* Favourites badge */}
          {favourites.length > 0 && (
            <div style={{marginBottom:"clamp(8px,2.5vw,12px)"}}>
              <button onClick={() => setShowFavs(f => !f)} style={{background:ac("0.12"),border:`1px solid ${ac("0.4")}`,borderRadius:20,padding:"clamp(5px,1.5vw,8px) clamp(12px,4vw,18px)",color:T.accent,fontSize:"clamp(12px,3.5vw,14px)",cursor:"pointer",fontWeight:"bold"}}>
                ❤️ {showFavs ? "Hide" : "View"} Favourites ({favourites.length})
              </button>
            </div>
          )}

          {/* Family row */}
          <div style={{background:ac("0.06"),border:`1px solid ${ac("0.2")}`,borderRadius:"clamp(12px,3vw,16px)",padding:"clamp(10px,3vw,14px) clamp(12px,4vw,16px)",marginBottom:4,textAlign:"left",transition:"all 0.5s"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{color:`rgba(${T.aRgb},0.6)`,fontSize:"clamp(10px,2.8vw,12px)",letterSpacing:"0.1em",textTransform:"uppercase"}}>👨‍👩‍👧‍👦 Family</span>
              <button onClick={() => setEditFamily(f => !f)} style={{background:"transparent",border:"none",color:T.accent,fontSize:"clamp(11px,3vw,13px)",cursor:"pointer"}}>
                {editFamily ? "Done ✓" : "Edit ✏️"}
              </button>
            </div>

            {editFamily && (
              <div style={{marginBottom:10}}>
                <label style={{color:"rgba(255,255,255,0.4)",fontSize:"clamp(10px,2.8vw,12px)",display:"block",marginBottom:5}}>Family Surname</label>
                <input type="text" value={familyName} onChange={e => setFamilyName(e.target.value)} placeholder="e.g. Kassem" />
              </div>
            )}

            <div style={{display:"flex",flexWrap:"wrap",gap:"clamp(4px,1.5vw,7px)",marginBottom:editFamily ? 10 : 0}}>
              {siblings.map((s,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:5,background:ac("0.12"),border:`1px solid ${ac("0.3")}`,borderRadius:20,padding:"clamp(3px,1vw,5px) clamp(8px,2.5vw,12px)"}}>
                  <span style={{color:T.accent,fontSize:"clamp(11px,3vw,13px)"}}>Sibling {i+1}: {s}</span>
                  {editFamily && <span onClick={() => setSiblings(p => p.filter((_,j) => j!==i))} style={{color:"rgba(255,100,100,0.7)",cursor:"pointer",fontSize:"clamp(13px,3.5vw,16px)",lineHeight:1}}>×</span>}
                </div>
              ))}
              <div style={{display:"flex",alignItems:"center",gap:4,background:ac("0.18"),border:`1px solid ${ac("0.5")}`,borderRadius:20,padding:"clamp(3px,1vw,5px) clamp(10px,3vw,14px)"}}>
                <span style={{color:T.accent,fontSize:"clamp(12px,3.5vw,14px)",fontWeight:"bold"}}>? {familyName}</span>
              </div>
            </div>

            {editFamily && (
              <div style={{display:"flex",gap:8}}>
                <input type="text" value={newSib} onChange={e => setNewSib(e.target.value)} onKeyDown={e => e.key==="Enter" && addSibling()} placeholder={`Add Sibling ${siblings.length+1} name...`} />
                <button onClick={addSibling} style={{flexShrink:0,background:ac("0.15"),border:`1px solid ${T.accent}`,borderRadius:8,padding:"0 clamp(10px,3vw,16px)",color:T.accent,cursor:"pointer",fontSize:"clamp(12px,3.5vw,14px)",whiteSpace:"nowrap"}}>+ Add</button>
              </div>
            )}
          </div>
          <p style={{color:"rgba(255,255,255,0.15)",fontSize:"clamp(9px,2.5vw,11px)",fontStyle:"italic",marginTop:4}}>{siblings.join(", ")}, ? {familyName}</p>
        </div>

        {/* ── FAVOURITES PANEL ── */}
        {showFavs && favourites.length > 0 && (
          <div style={{background:ac("0.05"),border:`1px solid ${ac("0.25")}`,borderRadius:"clamp(12px,3vw,16px)",padding:"clamp(14px,4vw,20px)",marginBottom:"clamp(14px,4vw,20px)",animation:"fadeUp 0.35s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"clamp(10px,3vw,14px)"}}>
              <span style={{color:T.accent,fontSize:"clamp(12px,3.5vw,14px)",fontWeight:"bold",letterSpacing:"0.08em"}}>❤️ FAVOURITES ({favourites.length})</span>
              <span onClick={() => setFavourites([])} style={{color:"rgba(255,100,100,0.5)",fontSize:"clamp(11px,3vw,13px)",cursor:"pointer"}}>Clear all</span>
            </div>
            {favourites.map((item,i) => (
              <div key={i} className="name-card" style={{background:ac("0.07"),border:`1px solid ${ac("0.3")}`}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                    <span style={{color:T.accent,fontSize:"clamp(16px,5vw,20px)",fontWeight:"bold"}}>{item.name}</span>
                    <span style={{background:ac("0.12"),color:`rgba(${T.aRgb},0.75)`,borderRadius:6,padding:"2px 8px",fontSize:"clamp(9px,2.5vw,11px)"}}>{item.uniqueness}</span>
                  </div>
                  <div style={{color:`rgba(${T.aRgb},0.65)`,fontSize:"clamp(10px,2.8vw,12px)",marginBottom:2}}>{item.origin}</div>
                  <div style={{color:"rgba(255,255,255,0.45)",fontSize:"clamp(10px,2.8vw,12px)",marginBottom:2}}>{item.meaning}</div>
                  <div style={{color:"rgba(255,255,255,0.22)",fontSize:"clamp(9px,2.5vw,11px)",fontStyle:"italic"}}>{familyFlow(item.name)}</div>
                </div>
                <button onClick={() => toggleFav(item)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:"clamp(18px,5vw,22px)",flexShrink:0}}>💔</button>
              </div>
            ))}
          </div>
        )}

        {/* ── LETTER FILTERS ── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(8px,2.5vw,12px)",marginBottom:"clamp(8px,2.5vw,12px)"}}>
          <div style={{background:ac("0.04"),border:`1px solid ${ac("0.25")}`,borderRadius:"clamp(10px,3vw,14px)",padding:"clamp(10px,3vw,14px)"}}>
            <div style={{color:T.accent,fontSize:"clamp(10px,2.8vw,12px)",fontWeight:"bold",marginBottom:7,letterSpacing:"0.04em"}}>🔡 Starts With</div>
            <input type="text" className="letter-input" value={startsWith} onChange={e => setStartsWith(e.target.value.slice(0,3))} placeholder="e.g. Sa" maxLength={3} />
            <div style={{color:"rgba(255,255,255,0.25)",fontSize:"clamp(9px,2.5vw,10px)",marginTop:5}}>Up to 3 letters</div>
          </div>
          <div style={{background:ac("0.04"),border:`1px solid ${ac("0.25")}`,borderRadius:"clamp(10px,3vw,14px)",padding:"clamp(10px,3vw,14px)"}}>
            <div style={{color:T.accent,fontSize:"clamp(10px,2.8vw,12px)",fontWeight:"bold",marginBottom:7,letterSpacing:"0.04em"}}>🔤 Ends With</div>
            <input type="text" className="letter-input" value={endsWith} onChange={e => setEndsWith(e.target.value.slice(0,3))} placeholder="e.g. ina" maxLength={3} />
            <div style={{color:"rgba(255,255,255,0.25)",fontSize:"clamp(9px,2.5vw,10px)",marginTop:5}}>Up to 3 letters</div>
          </div>
        </div>

        {/* ── CATEGORIES ── */}
        {CATEGORIES.map(cat => {
          const sel    = selections[cat.key] || [];
          const isOpen = !collapsed[cat.key];
          return (
            <div key={cat.key} className="cat-card" style={{background:sel.length?ac("0.04"):"rgba(255,255,255,0.02)",border:`1px solid ${sel.length?ac("0.3"):"rgba(255,255,255,0.06)"}`}}>
              <div className="cat-header" onClick={() => setCollapsed(p => ({...p,[cat.key]:!p[cat.key]}))}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <span style={{fontSize:"clamp(13px,4vw,16px)"}}>{cat.icon}</span>
                  <span style={{color:sel.length?T.accent:"rgba(255,255,255,0.65)",fontSize:"clamp(11px,3.2vw,13px)",fontWeight:"bold",transition:"color 0.3s"}}>{cat.label}</span>
                  {sel.length>0 && <span style={{background:T.badge,color:T.badgeText,borderRadius:10,padding:"1px 7px",fontSize:"clamp(9px,2.5vw,11px)",fontWeight:"bold"}}>{sel.length}</span>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  {sel.length>0 && <span onClick={e => {e.stopPropagation();setSelections(p=>({...p,[cat.key]:[]}))} } style={{color:"rgba(255,100,100,0.6)",fontSize:"clamp(10px,2.8vw,12px)",cursor:"pointer"}}>Clear</span>}
                  <span style={{color:"rgba(255,255,255,0.25)",fontSize:"clamp(10px,2.8vw,12px)"}}>{isOpen?"▾":"▸"}</span>
                </div>
              </div>
              {isOpen && (
                <div style={{padding:`2px clamp(12px,4vw,16px) clamp(10px,3vw,14px)`}}>
                  {sel.length>0 && <div style={{fontSize:"clamp(10px,2.8vw,12px)",color:`rgba(${T.aRgb},0.55)`,fontStyle:"italic",marginBottom:9}}>✓ {sel.join(" · ")}</div>}
                  <div style={{display:"flex",flexWrap:"wrap",gap:"clamp(5px,1.8vw,8px)"}}>
                    {cat.options.map(opt => {
                      const on = sel.includes(opt);
                      return (
                        <button key={opt} className="pill-btn" onClick={() => toggle(cat.key, opt)} style={{border:`1px solid ${on?T.accent:"rgba(255,255,255,0.1)"}`,background:on?ac("0.16"):"rgba(255,255,255,0.02)",color:on?T.accent:"rgba(255,255,255,0.45)"}}>
                          {on && <span style={{fontSize:"clamp(8px,2.2vw,10px)",fontWeight:"bold"}}>✓</span>}{opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ── SUMMARY ── */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:ac("0.06"),border:`1px solid ${ac("0.15")}`,borderRadius:"clamp(8px,2.5vw,12px)",padding:"clamp(8px,2.5vw,12px) clamp(12px,4vw,16px)",marginBottom:"clamp(10px,3vw,14px)"}}>
          <span style={{fontSize:"clamp(11px,3vw,13px)",color:"rgba(255,255,255,0.4)"}}>
            <span style={{color:T.accent,fontWeight:"bold"}}>{total} prefs</span> · {activeCats} categories
          </span>
          <span onClick={() => setSelections(Object.fromEntries(CATEGORIES.map(c=>[c.key,[]])))} style={{color:"rgba(255,100,100,0.5)",fontSize:"clamp(11px,3vw,13px)",cursor:"pointer"}}>Reset all</span>
        </div>

        {/* ── GENERATE BUTTON ── */}
        <button onClick={generate} disabled={loading} style={{width:"100%",padding:"clamp(13px,4vw,16px)",borderRadius:"clamp(10px,3vw,14px)",border:`1px solid ${T.accent}`,background:loading?ac("0.06"):`linear-gradient(135deg,${ac("0.22")},${ac("0.1")})`,color:T.accent,fontSize:"clamp(12px,3.5vw,15px)",fontWeight:"bold",letterSpacing:"0.1em",textTransform:"uppercase",cursor:loading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:"clamp(16px,5vw,22px)",transition:"all 0.3s"}}>
          {loading ? <><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>✦</span> Generating...</> : <>✨ Generate {T.label} Names</>}
        </button>

        {error && <div style={{background:"rgba(255,80,80,0.08)",border:"1px solid rgba(255,80,80,0.25)",borderRadius:"clamp(8px,2.5vw,11px)",padding:"clamp(10px,3vw,13px)",color:"#ff8080",fontSize:"clamp(11px,3.2vw,13px)",marginBottom:16,textAlign:"center"}}>{error}</div>}

        {/* ── RESULTS ── */}
        {generated && names.length > 0 && (
          <div style={{animation:"fadeUp 0.4s ease"}}>
            <div style={{textAlign:"center",marginBottom:"clamp(10px,3vw,14px)"}}>
              <span style={{color:T.accent,fontSize:"clamp(10px,2.8vw,12px)",letterSpacing:"0.12em",textTransform:"uppercase"}}>✦ {T.label} Names — Batch {Math.ceil(names.length/10)} ✦</span>
            </div>
            {names.map((item,i) => (
              <div key={i} className="name-card" style={{background:isFav(item)?ac("0.07"):"rgba(255,255,255,0.025)",border:`1px solid ${isFav(item)?ac("0.45"):"rgba(255,255,255,0.06)"}`,animation:`fadeUp 0.3s ease ${i*0.04}s both`}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:4}}>
                    <span style={{color:T.accent,fontSize:"clamp(17px,5vw,21px)",fontWeight:"bold"}}>{item.name}</span>
                    <span style={{background:ac("0.1"),color:`rgba(${T.aRgb},0.75)`,borderRadius:6,padding:"2px 8px",fontSize:"clamp(9px,2.5vw,10px)"}}>{item.uniqueness}</span>
                    <span style={{color:"rgba(255,255,255,0.2)",fontSize:"clamp(9px,2.5vw,11px)"}}>{item.ukFriendly}</span>
                  </div>
                  <div style={{color:`rgba(${T.aRgb},0.65)`,fontSize:"clamp(10px,2.8vw,12px)",marginBottom:2}}>{item.origin}</div>
                  <div style={{color:"rgba(255,255,255,0.45)",fontSize:"clamp(10px,2.8vw,12px)",marginBottom:2}}>{item.meaning}</div>
                  <div style={{color:"rgba(255,255,255,0.22)",fontSize:"clamp(9px,2.5vw,11px)",fontStyle:"italic"}}>{familyFlow(item.name)}</div>
                </div>
                <button onClick={() => toggleFav(item)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:"clamp(18px,5vw,22px)",flexShrink:0}}>{isFav(item)?"❤️":"🤍"}</button>
              </div>
            ))}
            <div style={{display:"flex",gap:"clamp(6px,2vw,10px)",marginTop:4}}>
              <button onClick={generate} style={{flex:1,padding:"clamp(10px,3vw,13px)",borderRadius:"clamp(8px,2.5vw,12px)",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.35)",fontSize:"clamp(11px,3vw,13px)",cursor:"pointer"}}>↻ Generate More</button>
              {favourites.length>0 && <button onClick={() => {setShowFavs(true);window.scrollTo({top:0,behavior:"smooth"})}} style={{flexShrink:0,padding:"clamp(10px,3vw,13px) clamp(14px,4vw,18px)",borderRadius:"clamp(8px,2.5vw,12px)",border:`1px solid ${ac("0.4")}`,background:ac("0.1"),color:T.accent,fontSize:"clamp(11px,3vw,13px)",cursor:"pointer"}}>❤️ {favourites.length}</button>}
            </div>
          </div>
        )}

        <p style={{textAlign:"center",color:"rgba(255,255,255,0.1)",fontSize:"clamp(9px,2.5vw,11px)",marginTop:"clamp(20px,5vw,32px)",letterSpacing:"0.05em"}}>
          Powered by Google Gemini · Free · Kassem Family · London
        </p>
      </div>
    </div>
  );
}
