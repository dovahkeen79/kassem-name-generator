import { useState } from "react";
import { GIRLS, BOYS } from "./namesDB.js";

const CATS = [
  { key:"meaning", label:"Meaning & Theme", icon:"💫", opts:["Gift from God","Light & Brightness","Nature & Beauty","Faith & Blessing","Strength & Power","Love & Warmth","Wisdom & Knowledge","Freedom & Spirit","Grace & Elegance","Hope & New Beginnings"] },
  { key:"origin",  label:"Origin",           icon:"🌍", opts:["Arabic","English","Latin","Greek","Persian","French","Italian","Celtic / Irish","Scandinavian","Turkish","Mixed / Multicultural"] },
  { key:"style",   label:"Style",            icon:"🎨", opts:["Soft & Gentle","Elegant & Classic","Unique & Rare","Bold & Unexpected","Modern & Trendy","Timeless & Traditional","Exotic & Mysterious","Poetic & Lyrical"] },
  { key:"syl",     label:"Syllables",        icon:"🔤", opts:["1 syllable","2 syllables","3 syllables","No preference"] },
  { key:"end",     label:"Ending Sound",     icon:"🎵", opts:["Ends in -a","Ends in -ine / -ina","Ends in -el / -elle","Ends in -ie / -y","Ends in -en / -in","Ends in consonant","No preference"] },
  { key:"vibe",    label:"Personality Vibe", icon:"✨", opts:["Dreamy & Poetic","Bold & Fierce","Gentle & Warm","Intellectual & Deep","Playful & Bright","Spiritual & Sacred","Confident & Strong","Calm & Serene"] },
  { key:"len",     label:"Name Length",      icon:"📏", opts:["Short (3–4 letters)","Medium (5–6 letters)","Longer (7+ letters)","No preference"] },
  { key:"avoid",   label:"Avoid Origins",    icon:"🚫", opts:["Hebrew","Indian / Sanskrit","African","East Asian","Slavic","None — open to all"] }
];
const TM={"Gift from God":"G","Light & Brightness":"L","Nature & Beauty":"N","Faith & Blessing":"F","Strength & Power":"S","Love & Warmth":"V","Wisdom & Knowledge":"W","Freedom & Spirit":"R","Grace & Elegance":"E","Hope & New Beginnings":"H"};
const UL={1:"Common",2:"Uncommon",3:"Rare",4:"Very Rare"};
const TH={
  girl:{bg:"linear-gradient(160deg,#1a0820 0%,#3d1a3a 50%,#1a0820 100%)",ac:"#e891c8",rgb:"232,145,200",badge:"#e891c8",bt:"#1a0820",em:"👧",lb:"Girl"},
  boy: {bg:"linear-gradient(160deg,#071828 0%,#0d2d4a 50%,#071828 100%)",ac:"#63b3f5",rgb:"99,179,245", badge:"#63b3f5",bt:"#071828",em:"👦",lb:"Boy"}
};
function shuffle(a){return [...a].sort(()=>Math.random()-0.5);}
function smartFilter(pool,sel,sw,ew,seen){
  const {origin=[],avoid=[],syl=[],end=[],meaning=[],len=[],vibe=[]}=sel;
  const f=pool.filter(n=>{
    if(seen.has(n.n))return false;
    const nl=n.n.toLowerCase();
    if(sw&&!nl.startsWith(sw.toLowerCase()))return false;
    if(ew&&!nl.endsWith(ew.toLowerCase()))return false;
    if(avoid.length&&avoid.includes(n.o))return false;
    if(syl.length&&!syl.includes("No preference")){if(!syl.some(s=>s==="1 syllable"?n.s===1:s==="2 syllables"?n.s===2:n.s>=3))return false;}
    if(len.length&&!len.includes("No preference")){const l=n.n.length;if(!len.some(s=>s==="Short (3–4 letters)"?l<=4:s==="Medium (5–6 letters)"?l>=5&&l<=6:l>=7))return false;}
    if(end.length&&!end.includes("No preference")){if(!end.some(e=>e==="Ends in -a"?nl.endsWith("a"):e==="Ends in -ine / -ina"?nl.endsWith("ine")||nl.endsWith("ina"):e==="Ends in -el / -elle"?nl.endsWith("el")||nl.endsWith("elle"):e==="Ends in -ie / -y"?nl.endsWith("ie")||nl.endsWith("y"):e==="Ends in -en / -in"?nl.endsWith("en")||nl.endsWith("in"):e==="Ends in consonant"?!"aeiou".includes(nl[nl.length-1]):true))return false;}
    return true;
  });
  const scored=f.map(n=>{let sc=0;if(origin.length&&origin.includes(n.o))sc+=4;if(meaning.length)meaning.forEach(m=>{if(n.t.includes(TM[m]))sc+=2;});if(vibe.length){const vm={"Dreamy & Poetic":["R","E","L"],"Bold & Fierce":["S","R"],"Gentle & Warm":["V","E"],"Intellectual & Deep":["W","N"],"Playful & Bright":["V","L","H"],"Spiritual & Sacred":["F","G"],"Confident & Strong":["S","E"],"Calm & Serene":["E","N"]};vibe.forEach(v=>{(vm[v]||[]).forEach(t=>{if(n.t.includes(t))sc+=1;});});}sc+=(n.u-1)*0.2;return{...n,sc};}).sort((a,b)=>b.sc-a.sc);
  const hasF=origin.length||meaning.length||vibe.length;
  if(!hasF)return shuffle(scored).slice(0,10);
  return shuffle(scored.slice(0,Math.max(10,Math.ceil(scored.length*0.5)))).slice(0,10);
}
export default function App(){
  const[gender,setGender]=useState("girl");
  const[fName,setFName]=useState("Kassem");
  const[sibs,setSibs]=useState(["Tala","Abdallah"]);
  const[newS,setNewS]=useState("");
  const[editF,setEditF]=useState(false);
  const[sw,setSw]=useState("");
  const[ew,setEw]=useState("");
  const[sel,setSel]=useState({});
  const[coll,setColl]=useState({});
  const[res,setRes]=useState([]);
  const[gen,setGen]=useState(false);
  const[favs,setFavs]=useState([]);
  const[showF,setShowF]=useState(false);
  const[seen,setSeen]=useState(new Set());
  const[noRes,setNoRes]=useState(false);
  const T=TH[gender];const ac=o=>`rgba(${T.rgb},${o})`;
  const tot=Object.values(sel).reduce((a,b)=>a+b.length,0);
  const ff=n=>[...sibs,n].join(", ")+" "+fName;
  const addSib=()=>{const n=newS.trim();if(n&&!sibs.includes(n)){setSibs(p=>[...p,n]);setNewS("");}};
  const tog=(k,o)=>setSel(p=>{const c=p[k]||[];return c.includes(o)?{...p,[k]:c.filter(x=>x!==o)}:{...p,[k]:[...c,o]};});
  const togF=i=>setFavs(p=>p.find(f=>f.n===i.n)?p.filter(f=>f.n!==i.n):[...p,i]);
  const isF=i=>!!favs.find(f=>f.n===i.n);
  const generate=()=>{
    const pool=gender==="girl"?GIRLS:BOYS;
    let r=smartFilter(pool,sel,sw,ew,seen);
    if(!r.length){const fr=smartFilter(pool,sel,sw,ew,new Set());if(!fr.length){setNoRes(true);setRes([]);setGen(true);return;}setSeen(new Set(fr.map(x=>x.n)));setRes(fr);}
    else{setSeen(p=>new Set([...p,...r.map(x=>x.n)]));setRes(r);}
    setNoRes(false);setGen(true);setShowF(false);
  };
  const resetAll=()=>{setSel({});setSw("");setEw("");setSeen(new Set());setRes([]);setGen(false);setNoRes(false);};
  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Georgia',serif",color:"#fff",transition:"background 0.5s"}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}button,input{font-family:'Georgia',serif}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(${T.rgb},0.3);border-radius:3px}.pill{padding:clamp(5px,1.5vw,7px) clamp(9px,2.5vw,13px);border-radius:20px;cursor:pointer;font-size:clamp(11px,3vw,13px);transition:all 0.2s;display:inline-flex;align-items:center;gap:4px;border:1px solid;font-family:'Georgia',serif}input[type=text]{background:rgba(255,255,255,0.06);color:#fff;border-radius:8px;padding:clamp(6px,2vw,9px) clamp(9px,3vw,12px);font-size:clamp(12px,3.5vw,14px);border:1px solid rgba(${T.rgb},0.35);width:100%;outline:none}input[type=text]::placeholder{color:rgba(255,255,255,0.3)}.cat{border-radius:clamp(10px,3vw,14px);margin-bottom:clamp(7px,2vw,10px);overflow:hidden}.nc{border-radius:clamp(10px,3vw,14px);padding:clamp(12px,3.5vw,16px);display:flex;align-items:center;justify-content:space-between;gap:12px;transition:all 0.3s;margin-bottom:clamp(7px,2vw,10px)}`}</style>
      <div style={{maxWidth:700,margin:"0 auto",padding:"clamp(20px,5vw,40px) clamp(12px,4vw,20px) 60px"}}>
        <div style={{textAlign:"center",marginBottom:"clamp(20px,5vw,28px)"}}>
          <div style={{fontSize:"clamp(30px,8vw,42px)",marginBottom:6}}>{T.em}</div>
          <h1 style={{color:T.ac,fontSize:"clamp(18px,5.5vw,26px)",fontWeight:"bold",letterSpacing:"0.05em",marginBottom:4,textShadow:`0 0 40px ${ac("0.4")}`,transition:"color 0.5s"}}>Baby Names Generator</h1>
          <p style={{color:ac("0.5"),fontSize:"clamp(9px,2.5vw,11px)",marginBottom:"clamp(10px,3vw,16px)",letterSpacing:"0.06em"}}>created by Abbas Kassem</p>
          <div style={{display:"inline-flex",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:30,padding:4,gap:4,marginBottom:"clamp(10px,3vw,16px)"}}>
            {["girl","boy"].map(g=>(<button key={g} onClick={()=>{setGender(g);setRes([]);setGen(false);setSeen(new Set());}} style={{padding:`clamp(7px,2vw,10px) clamp(16px,5vw,24px)`,borderRadius:24,border:`1px solid ${g===gender?TH[g].ac:"transparent"}`,background:g===gender?`rgba(${TH[g].rgb},0.15)`:"transparent",color:g===gender?TH[g].ac:"rgba(255,255,255,0.3)",cursor:"pointer",fontSize:"clamp(12px,3.5vw,14px)",fontWeight:g===gender?"bold":"normal",transition:"all 0.3s",display:"flex",alignItems:"center",gap:6}}>{TH[g].em} {TH[g].lb}</button>))}
          </div>
          {favs.length>0&&<div style={{marginBottom:"clamp(8px,2.5vw,12px)"}}><button onClick={()=>setShowF(f=>!f)} style={{background:ac("0.12"),border:`1px solid ${ac("0.4")}`,borderRadius:20,padding:"clamp(5px,1.5vw,8px) clamp(12px,4vw,18px)",color:T.ac,fontSize:"clamp(12px,3.5vw,14px)",cursor:"pointer",fontWeight:"bold"}}>❤️ {showF?"Hide":"View"} Favourites ({favs.length})</button></div>}
          <div style={{background:ac("0.06"),border:`1px solid ${ac("0.2")}`,borderRadius:"clamp(12px,3vw,16px)",padding:"clamp(10px,3vw,14px) clamp(12px,4vw,16px)",marginBottom:4,textAlign:"left"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{color:ac("0.6"),fontSize:"clamp(10px,2.8vw,12px)",letterSpacing:"0.1em",textTransform:"uppercase"}}>👨‍👩‍👧‍👦 Family</span>
              <button onClick={()=>setEditF(f=>!f)} style={{background:"transparent",border:"none",color:T.ac,fontSize:"clamp(11px,3vw,13px)",cursor:"pointer"}}>{editF?"Done ✓":"Edit ✏️"}</button>
            </div>
            {editF&&<div style={{marginBottom:10}}><label style={{color:"rgba(255,255,255,0.4)",fontSize:"clamp(10px,2.8vw,12px)",display:"block",marginBottom:5}}>Family Surname</label><input type="text" value={fName} onChange={e=>setFName(e.target.value)} placeholder="e.g. Kassem"/></div>}
            <div style={{display:"flex",flexWrap:"wrap",gap:"clamp(4px,1.5vw,7px)",marginBottom:editF?10:0}}>
              {sibs.map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:5,background:ac("0.12"),border:`1px solid ${ac("0.3")}`,borderRadius:20,padding:"clamp(3px,1vw,5px) clamp(8px,2.5vw,12px)"}}><span style={{color:T.ac,fontSize:"clamp(11px,3vw,13px)"}}>Sibling {i+1}: {s}</span>{editF&&<span onClick={()=>setSibs(p=>p.filter((_,j)=>j!==i))} style={{color:"rgba(255,100,100,0.7)",cursor:"pointer",fontSize:"clamp(13px,3.5vw,16px)",lineHeight:1}}>×</span>}</div>))}
              <div style={{display:"flex",alignItems:"center",gap:4,background:ac("0.18"),border:`1px solid ${ac("0.5")}`,borderRadius:20,padding:"clamp(3px,1vw,5px) clamp(10px,3vw,14px)"}}><span style={{color:T.ac,fontSize:"clamp(12px,3.5vw,14px)",fontWeight:"bold"}}>? {fName}</span></div>
            </div>
            {editF&&<div style={{display:"flex",gap:8}}><input type="text" value={newS} onChange={e=>setNewS(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSib()} placeholder={`Add Sibling ${sibs.length+1} name...`}/><button onClick={addSib} style={{flexShrink:0,background:ac("0.15"),border:`1px solid ${T.ac}`,borderRadius:8,padding:"0 clamp(10px,3vw,16px)",color:T.ac,cursor:"pointer",fontSize:"clamp(12px,3.5vw,14px)",whiteSpace:"nowrap"}}>+ Add</button></div>}
          </div>
          <p style={{color:"rgba(255,255,255,0.15)",fontSize:"clamp(9px,2.5vw,11px)",fontStyle:"italic",marginTop:4}}>{sibs.join(", ")}, ? {fName}</p>
        </div>
        {showF&&favs.length>0&&(<div style={{background:ac("0.05"),border:`1px solid ${ac("0.25")}`,borderRadius:"clamp(12px,3vw,16px)",padding:"clamp(14px,4vw,20px)",marginBottom:"clamp(14px,4vw,20px)",animation:"fadeUp 0.35s ease"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"clamp(10px,3vw,14px)"}}><span style={{color:T.ac,fontSize:"clamp(12px,3.5vw,14px)",fontWeight:"bold"}}>❤️ FAVOURITES ({favs.length})</span><span onClick={()=>setFavs([])} style={{color:"rgba(255,100,100,0.5)",fontSize:"clamp(11px,3vw,13px)",cursor:"pointer"}}>Clear all</span></div>{favs.map((item,i)=>(<div key={i} className="nc" style={{background:ac("0.07"),border:`1px solid ${ac("0.3")}`}}><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}><span style={{color:T.ac,fontSize:"clamp(16px,5vw,20px)",fontWeight:"bold"}}>{item.n}</span><span style={{background:ac("0.12"),color:ac("0.75"),borderRadius:6,padding:"2px 8px",fontSize:"clamp(9px,2.5vw,11px)"}}>{UL[item.u]}</span></div><div style={{color:ac("0.65"),fontSize:"clamp(10px,2.8vw,12px)",marginBottom:2}}>{item.o}</div><div style={{color:"rgba(255,255,255,0.45)",fontSize:"clamp(10px,2.8vw,12px)",marginBottom:2}}>{item.m}</div><div style={{color:"rgba(255,255,255,0.22)",fontSize:"clamp(9px,2.5vw,11px)",fontStyle:"italic"}}>{ff(item.n)}</div></div><button onClick={()=>togF(item)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:"clamp(18px,5vw,22px)",flexShrink:0}}>💔</button></div>))}</div>)}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(8px,2.5vw,12px)",marginBottom:"clamp(8px,2.5vw,12px)"}}>
          {[["🔡 Starts With",sw,setSw,"e.g. Sa"],["🔤 Ends With",ew,setEw,"e.g. ina"]].map(([lbl,val,set,ph],i)=>(<div key={i} style={{background:ac("0.04"),border:`1px solid ${ac("0.25")}`,borderRadius:"clamp(10px,3vw,14px)",padding:"clamp(10px,3vw,14px)"}}><div style={{color:T.ac,fontSize:"clamp(10px,2.8vw,12px)",fontWeight:"bold",marginBottom:7}}>{lbl}</div><input type="text" value={val} onChange={e=>set(e.target.value.slice(0,3))} placeholder={ph} maxLength={3}/><div style={{color:"rgba(255,255,255,0.25)",fontSize:"clamp(9px,2.5vw,10px)",marginTop:5}}>Up to 3 letters</div></div>))}
        </div>
        {CATS.map(cat=>{const s=sel[cat.key]||[];const open=!coll[cat.key];return(<div key={cat.key} className="cat" style={{background:s.length?ac("0.04"):"rgba(255,255,255,0.02)",border:`1px solid ${s.length?ac("0.3"):"rgba(255,255,255,0.06)"}`}}><div onClick={()=>setColl(p=>({...p,[cat.key]:!p[cat.key]}))} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"clamp(10px,3vw,13px) clamp(12px,4vw,16px)",cursor:"pointer",background:s.length?ac("0.05"):"transparent"}}><div style={{display:"flex",alignItems:"center",gap:9}}><span style={{fontSize:"clamp(13px,4vw,16px)"}}>{cat.icon}</span><span style={{color:s.length?T.ac:"rgba(255,255,255,0.65)",fontSize:"clamp(11px,3.2vw,13px)",fontWeight:"bold"}}>{cat.label}</span>{s.length>0&&<span style={{background:T.badge,color:T.bt,borderRadius:10,padding:"1px 7px",fontSize:"clamp(9px,2.5vw,11px)",fontWeight:"bold"}}>{s.length}</span>}</div><div style={{display:"flex",alignItems:"center",gap:10}}>{s.length>0&&<span onClick={e=>{e.stopPropagation();setSel(p=>({...p,[cat.key]:[]}))} } style={{color:"rgba(255,100,100,0.6)",fontSize:"clamp(10px,2.8vw,12px)",cursor:"pointer"}}>Clear</span>}<span style={{color:"rgba(255,255,255,0.25)",fontSize:"clamp(10px,2.8vw,12px)"}}>{open?"▾":"▸"}</span></div></div>{open&&(<div style={{padding:`2px clamp(12px,4vw,16px) clamp(10px,3vw,14px)`}}>{s.length>0&&<div style={{fontSize:"clamp(10px,2.8vw,12px)",color:ac("0.55"),fontStyle:"italic",marginBottom:9}}>✓ {s.join(" · ")}</div>}<div style={{display:"flex",flexWrap:"wrap",gap:"clamp(5px,1.8vw,8px)"}}>{cat.opts.map(o=>{const on=s.includes(o);return<button key={o} className="pill" onClick={()=>tog(cat.key,o)} style={{borderColor:on?T.ac:"rgba(255,255,255,0.1)",background:on?ac("0.16"):"rgba(255,255,255,0.02)",color:on?T.ac:"rgba(255,255,255,0.45)"}}>{on&&<span style={{fontSize:"clamp(8px,2.2vw,10px)",fontWeight:"bold"}}>✓</span>}{o}</button>;})}</div></div>)}</div>);})}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:ac("0.06"),border:`1px solid ${ac("0.15")}`,borderRadius:"clamp(8px,2.5vw,12px)",padding:"clamp(8px,2.5vw,12px) clamp(12px,4vw,16px)",marginBottom:"clamp(10px,3vw,14px)"}}><span style={{fontSize:"clamp(11px,3vw,13px)",color:"rgba(255,255,255,0.4)"}}>{tot>0?<><span style={{color:T.ac,fontWeight:"bold"}}>{tot} prefs</span> · {Object.values(sel).filter(v=>v.length>0).length} categories</>:<span style={{color:"rgba(255,255,255,0.3)"}}>No filters — showing diverse results</span>}</span><span onClick={resetAll} style={{color:"rgba(255,100,100,0.5)",fontSize:"clamp(11px,3vw,13px)",cursor:"pointer"}}>Reset all</span></div>
        <button onClick={generate} style={{width:"100%",padding:"clamp(13px,4vw,16px)",borderRadius:"clamp(10px,3vw,14px)",border:`1px solid ${T.ac}`,background:`linear-gradient(135deg,${ac("0.22")},${ac("0.1")})`,color:T.ac,fontSize:"clamp(12px,3.5vw,15px)",fontWeight:"bold",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:"clamp(16px,5vw,22px)"}}>✨ Generate {T.lb} Names</button>
        {gen&&(<div style={{animation:"fadeUp 0.4s ease"}}>{noRes?(<div style={{background:ac("0.05"),border:`1px solid ${ac("0.2")}`,borderRadius:14,padding:"20px",textAlign:"center"}}><div style={{fontSize:28,marginBottom:8}}>🔍</div><div style={{color:T.ac,fontSize:14,marginBottom:6}}>No names match your filters</div><div style={{color:"rgba(255,255,255,0.4)",fontSize:12}}>Try removing some filters</div></div>):(<><div style={{textAlign:"center",marginBottom:"clamp(10px,3vw,14px)"}}><span style={{color:T.ac,fontSize:"clamp(10px,2.8vw,12px)",letterSpacing:"0.12em",textTransform:"uppercase"}}>✦ {T.lb} Names — Tap ❤️ to save ✦</span></div>{res.map((item,i)=>(<div key={i} className="nc" style={{background:isF(item)?ac("0.07"):"rgba(255,255,255,0.025)",border:`1px solid ${isF(item)?ac("0.45"):"rgba(255,255,255,0.06)"}`,animation:`fadeUp 0.3s ease ${i*0.04}s both`}}><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:8,marginBottom:4}}><span style={{color:T.ac,fontSize:"clamp(17px,5vw,21px)",fontWeight:"bold"}}>{item.n}</span><span style={{background:ac("0.1"),color:ac("0.75"),borderRadius:6,padding:"2px 8px",fontSize:"clamp(9px,2.5vw,10px)"}}>{UL[item.u]}</span></div><div style={{color:ac("0.65"),fontSize:"clamp(10px,2.8vw,12px)",marginBottom:2}}>{item.o}</div><div style={{color:"rgba(255,255,255,0.45)",fontSize:"clamp(10px,2.8vw,12px)",marginBottom:2}}>{item.m}</div><div style={{color:"rgba(255,255,255,0.22)",fontSize:"clamp(9px,2.5vw,11px)",fontStyle:"italic"}}>{ff(item.n)}</div></div><button onClick={()=>togF(item)} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:"clamp(18px,5vw,22px)",flexShrink:0}}>{isF(item)?"❤️":"🤍"}</button></div>))}<div style={{display:"flex",gap:"clamp(6px,2vw,10px)",marginTop:4}}><button onClick={generate} style={{flex:1,padding:"clamp(10px,3vw,13px)",borderRadius:"clamp(8px,2.5vw,12px)",border:"1px solid rgba(255,255,255,0.1)",background:"transparent",color:"rgba(255,255,255,0.35)",fontSize:"clamp(11px,3vw,13px)",cursor:"pointer"}}>↻ Generate More</button>{favs.length>0&&<button onClick={()=>{setShowF(true);window.scrollTo({top:0,behavior:"smooth"})}} style={{flexShrink:0,padding:"clamp(10px,3vw,13px) clamp(14px,4vw,18px)",borderRadius:"clamp(8px,2.5vw,12px)",border:`1px solid ${ac("0.4")}`,background:ac("0.1"),color:T.ac,fontSize:"clamp(11px,3vw,13px)",cursor:"pointer"}}>❤️ {favs.length}</button>}</div></>)}</div>)}
        <p style={{textAlign:"center",color:"rgba(255,255,255,0.1)",fontSize:"clamp(9px,2.5vw,11px)",marginTop:"clamp(20px,5vw,32px)",letterSpacing:"0.05em"}}>{GIRLS.length+BOYS.length}+ names · No API needed · Kassem Family · London</p>
      </div>
    </div>
  );
}
