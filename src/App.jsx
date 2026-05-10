import { useState } from "react";
import { GIRLS, BOYS } from "./namesDB.js";

const CATS = [
  { key:"meaning", label:"Meaning & Theme", icon:"💫", multi:true,
    opts:["Gift from God","Light & Brightness","Nature & Beauty","Faith & Blessing","Strength & Power","Love & Warmth","Wisdom & Knowledge","Freedom & Spirit","Grace & Elegance","Hope & New Beginnings"] },
  { key:"origin",  label:"Origin",           icon:"🌍", multi:true,
    opts:["Arabic","English","Latin","Greek","Persian","French","Italian","Celtic / Irish","Scandinavian","Turkish","Mixed / Multicultural"] },
  { key:"style",   label:"Style",            icon:"🎨", multi:true,
    opts:["Soft & Gentle","Elegant & Classic","Unique & Rare","Bold & Unexpected","Modern & Trendy","Timeless & Traditional","Exotic & Mysterious","Poetic & Lyrical"] },
  { key:"syl",     label:"Syllables",        icon:"🔤", multi:false,
    opts:["1 syllable","2 syllables","3 syllables","No preference"] },
  { key:"end",     label:"Ending Sound",     icon:"🎵", multi:true, noAll:"No preference",
    opts:["Ends in -a","Ends in -ine / -ina","Ends in -el / -elle","Ends in -ie / -y","Ends in -en / -in","Ends in consonant","No preference"] },
  { key:"vibe",    label:"Personality Vibe", icon:"✨", multi:true,
    opts:["Dreamy & Poetic","Bold & Fierce","Gentle & Warm","Intellectual & Deep","Playful & Bright","Spiritual & Sacred","Confident & Strong","Calm & Serene"] },
  { key:"len",     label:"Name Length",      icon:"📏", multi:false,
    opts:["Short (3–4 letters)","Medium (5–6 letters)","Longer (7+ letters)","No preference"] },
  { key:"avoid",   label:"Avoid Origins",    icon:"🚫", multi:true, noAll:"None — open to all",
    opts:["Hebrew","Indian / Sanskrit","African","East Asian","Slavic","None — open to all"] }
];

const TM={"Gift from God":"G","Light & Brightness":"L","Nature & Beauty":"N","Faith & Blessing":"F","Strength & Power":"S","Love & Warmth":"V","Wisdom & Knowledge":"W","Freedom & Spirit":"R","Grace & Elegance":"E","Hope & New Beginnings":"H"};
const UL={1:"Common",2:"Uncommon",3:"Rare",4:"Very Rare"};

const TH={
  girl:{
    bg:"linear-gradient(160deg,#1a0812 0%,#2e1020 50%,#1a0812 100%)",
    ac:"#ffb3c9", rgb:"255,179,201", badge:"#ffb3c9", bt:"#1a0812", em:"👧", lb:"Girl"
  },
  boy:{
    bg:"linear-gradient(160deg,#050f1c 0%,#0b2238 50%,#050f1c 100%)",
    ac:"#87ceeb", rgb:"135,206,235", badge:"#87ceeb", bt:"#050f1c", em:"👦", lb:"Boy"
  }
};

function shuffle(a){return [...a].sort(()=>Math.random()-0.5);}

function smartFilter(pool,sel,sw,ew,seen){
  const {origin=[],avoid=[],syl=[],end=[],meaning=[],len=[],vibe=[]}=sel;
  const f=pool.filter(n=>{
    if(seen.has(n.n))return false;
    const nl=n.n.toLowerCase();
    if(sw&&!nl.startsWith(sw.toLowerCase()))return false;
    if(ew&&!nl.endsWith(ew.toLowerCase()))return false;
    if(avoid.length&&!avoid.includes("None — open to all")&&avoid.includes(n.o))return false;
    if(syl.length&&!syl.includes("No preference")){
      if(!syl.some(s=>s==="1 syllable"?n.s===1:s==="2 syllables"?n.s===2:n.s>=3))return false;
    }
    if(len.length&&!len.includes("No preference")){
      const l=n.n.length;
      if(!len.some(s=>s==="Short (3–4 letters)"?l<=4:s==="Medium (5–6 letters)"?l>=5&&l<=6:l>=7))return false;
    }
    if(end.length&&!end.includes("No preference")){
      if(!end.some(e=>e==="Ends in -a"?nl.endsWith("a"):e==="Ends in -ine / -ina"?nl.endsWith("ine")||nl.endsWith("ina"):e==="Ends in -el / -elle"?nl.endsWith("el")||nl.endsWith("elle"):e==="Ends in -ie / -y"?nl.endsWith("ie")||nl.endsWith("y"):e==="Ends in -en / -in"?nl.endsWith("en")||nl.endsWith("in"):e==="Ends in consonant"?!"aeiou".includes(nl[nl.length-1]):true))return false;
    }
    return true;
  });
  const scored=f.map(n=>{
    let sc=0;
    if(origin.length&&origin.includes(n.o))sc+=4;
    if(meaning.length)meaning.forEach(m=>{if(n.t.includes(TM[m]))sc+=2;});
    if(vibe.length){
      const vm={"Dreamy & Poetic":["R","E","L"],"Bold & Fierce":["S","R"],"Gentle & Warm":["V","E"],"Intellectual & Deep":["W","N"],"Playful & Bright":["V","L","H"],"Spiritual & Sacred":["F","G"],"Confident & Strong":["S","E"],"Calm & Serene":["E","N","F"]};
      vibe.forEach(v=>{(vm[v]||[]).forEach(t=>{if(n.t.includes(t))sc+=1;});});
    }
    sc+=(n.u-1)*0.2;
    return {...n,sc};
  }).sort((a,b)=>b.sc-a.sc);
  const hasF=origin.length||meaning.length||vibe.length;
  if(!hasF)return shuffle(scored).slice(0,10);
  return shuffle(scored.slice(0,Math.max(10,Math.ceil(scored.length*0.5)))).slice(0,10);
}
export default function App(){
  const[gender,setGender]=useState("girl");
  const[fName,setFName]=useState("");
  const[sibs,setSibs]=useState([]);
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

  const T=TH[gender];
  const ac=o=>`rgba(${T.rgb},${o})`;
  const tot=Object.values(sel).reduce((a,b)=>a+b.length,0);
  const ff=n=>{
    const parts=[...sibs,n];
    return fName ? parts.join(", ")+" "+fName : parts.join(", ");
  };

  const switchGender=g=>{
    setGender(g);
    setSel({});setSw("");setEw("");
    setSeen(new Set());setRes([]);setGen(false);setNoRes(false);
  };

  const addSib=()=>{const n=newS.trim();if(n&&!sibs.includes(n)){setSibs(p=>[...p,n]);setNewS("");};};

  const tog=(cat,opt)=>setSel(p=>{
    const c=p[cat.key]||[];
    if(!cat.multi){
      return c.includes(opt)?{...p,[cat.key]:[]}:{...p,[cat.key]:[opt]};
    }
    if(cat.noAll&&opt===cat.noAll){
      return c.includes(opt)?{...p,[cat.key]:[]}:{...p,[cat.key]:[opt]};
    }
    if(cat.noAll&&c.includes(cat.noAll)){
      const base=c.filter(o=>o!==cat.noAll);
      return c.includes(opt)?{...p,[cat.key]:base.filter(o=>o!==opt)}:{...p,[cat.key]:[...base,opt]};
    }
    return c.includes(opt)?{...p,[cat.key]:c.filter(o=>o!==opt)}:{...p,[cat.key]:[...c,opt]};
  });

  const togF=i=>setFavs(p=>p.find(f=>f.n===i.n)?p.filter(f=>f.n!==i.n):[...p,i]);
  const isF=i=>!!favs.find(f=>f.n===i.n);

  const generate=()=>{
    const pool=gender==="girl"?GIRLS:BOYS;
    let r=smartFilter(pool,sel,sw,ew,seen);
    if(!r.length){
      const fr=smartFilter(pool,sel,sw,ew,new Set());
      if(!fr.length){setNoRes(true);setRes([]);setGen(true);return;}
      setSeen(new Set(fr.map(x=>x.n)));setRes(fr);
    } else {setSeen(p=>new Set([...p,...r.map(x=>x.n)]));setRes(r);}
    setNoRes(false);setGen(true);setShowF(false);
  };

  const resetAll=()=>{setSel({});setSw("");setEw("");setSeen(new Set());setRes([]);setGen(false);setNoRes(false);};

  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Georgia',serif",color:"#fff",transition:"background 0.6s"}}>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        button,input{font-family:'Georgia',serif}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(${T.rgb},0.3);border-radius:3px}
        .pill{padding:clamp(5px,1.5vw,8px) clamp(10px,3vw,15px);border-radius:22px;cursor:pointer;font-size:clamp(11px,3vw,13px);transition:all 0.2s;display:inline-flex;align-items:center;gap:5px;border:1px solid;font-family:'Georgia',serif;font-weight:500}
        input[type=text]{background:rgba(255,255,255,0.08);color:#fff;border-radius:9px;padding:clamp(7px,2vw,10px) clamp(10px,3vw,13px);font-size:clamp(12px,3.5vw,14px);border:1px solid rgba(255,255,255,0.2);width:100%;outline:none;transition:border-color 0.3s}
        input[type=text]::placeholder{color:rgba(255,255,255,0.35)}
        input[type=text]:focus{border-color:rgba(${T.rgb},0.6)}
        .cat{border-radius:clamp(12px,3vw,16px);margin-bottom:clamp(8px,2vw,11px);overflow:hidden;transition:all 0.3s}
        .nc{border-radius:clamp(12px,3vw,16px);padding:clamp(14px,4vw,18px);display:flex;align-items:flex-start;justify-content:space-between;gap:14px;transition:all 0.3s;margin-bottom:clamp(8px,2vw,11px)}
        .fav-btn{background:transparent;border:none;cursor:pointer;font-size:clamp(20px,5vw,24px);flex-shrink:0;padding:0;line-height:1}
      `}</style>

      <div style={{maxWidth:700,margin:"0 auto",padding:"clamp(24px,5vw,44px) clamp(14px,4vw,22px) 60px"}}>

        <div style={{textAlign:"center",marginBottom:"clamp(22px,5vw,32px)"}}>
          <div style={{fontSize:"clamp(32px,8vw,46px)",marginBottom:8,transition:"all 0.3s"}}>{T.em}</div>
          <h1 style={{color:T.ac,fontSize:"clamp(20px,5.5vw,28px)",fontWeight:"bold",letterSpacing:"0.04em",marginBottom:5,textShadow:`0 0 50px ${ac("0.5")}`,transition:"all 0.5s"}}>Baby Names Generator</h1>
          <p style={{color:"rgba(255,255,255,0.5)",fontSize:"clamp(9px,2.5vw,11px)",marginBottom:"clamp(14px,3.5vw,20px)",letterSpacing:"0.07em"}}>created by Abbas Kassem</p>

          <div style={{display:"inline-flex",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:32,padding:5,gap:5,marginBottom:"clamp(12px,3vw,18px)"}}>
            {["girl","boy"].map(g=>(
              <button key={g} onClick={()=>switchGender(g)} style={{padding:`clamp(8px,2.2vw,11px) clamp(18px,5vw,28px)`,borderRadius:26,border:`1px solid ${g===gender?TH[g].ac:"transparent"}`,background:g===gender?`rgba(${TH[g].rgb},0.18)`:"transparent",color:g===gender?TH[g].ac:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:"clamp(12px,3.5vw,14px)",fontWeight:g===gender?"bold":"normal",transition:"all 0.3s",display:"flex",alignItems:"center",gap:7}}>{TH[g].em} {TH[g].lb}</button>
            ))}
          </div>

          {favs.length>0&&(<div style={{marginBottom:"clamp(10px,2.5vw,14px)"}}><button onClick={()=>setShowF(f=>!f)} style={{background:ac("0.13"),border:`1px solid ${ac("0.45")}`,borderRadius:22,padding:"clamp(6px,1.8vw,9px) clamp(14px,4vw,20px)",color:T.ac,fontSize:"clamp(12px,3.5vw,14px)",cursor:"pointer",fontWeight:"bold",letterSpacing:"0.03em"}}>❤️ {showF?"Hide":"View"} Favourites ({favs.length})</button></div>)}

          <div style={{background:ac("0.06"),border:`1px solid ${ac("0.22")}`,borderRadius:"clamp(12px,3vw,16px)",padding:"clamp(12px,3.2vw,16px)",marginBottom:5,textAlign:"left"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{color:"rgba(255,255,255,0.6)",fontSize:"clamp(10px,2.8vw,12px)",letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:"bold"}}>👨‍👩‍👧‍👦 Family</span>
              <button onClick={()=>setEditF(f=>!f)} style={{background:"transparent",border:"none",color:T.ac,fontSize:"clamp(11px,3vw,13px)",cursor:"pointer",fontWeight:"bold"}}>{editF?"Done ✓":"Edit ✏️"}</button>
            </div>
            {editF&&(<div style={{marginBottom:12}}><label style={{color:"rgba(255,255,255,0.55)",fontSize:"clamp(10px,2.8vw,12px)",display:"block",marginBottom:6}}>Family Surname</label><input type="text" value={fName} onChange={e=>setFName(e.target.value)} placeholder="e.g. Kassem"/></div>)}
            <div style={{display:"flex",flexWrap:"wrap",gap:"clamp(5px,1.5vw,8px)",marginBottom:editF?12:0}}>
              {sibs.map((s,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:6,background:ac("0.13"),border:`1px solid ${ac("0.35")}`,borderRadius:22,padding:"clamp(4px,1.2vw,6px) clamp(10px,3vw,14px)"}}><span style={{color:"#fff",fontSize:"clamp(11px,3vw,13px)",fontWeight:"500"}}>Sibling {i+1}: {s}</span>{editF&&<span onClick={()=>setSibs(p=>p.filter((_,j)=>j!==i))} style={{color:"rgba(255,120,120,0.8)",cursor:"pointer",fontSize:"clamp(14px,4vw,18px)",lineHeight:1,fontWeight:"bold"}}>×</span>}</div>))}
              {fName&&(<div style={{display:"flex",alignItems:"center",gap:5,background:ac("0.2"),border:`1px solid ${ac("0.55")}`,borderRadius:22,padding:"clamp(4px,1.2vw,6px) clamp(10px,3vw,14px)"}}><span style={{color:T.ac,fontSize:"clamp(12px,3.5vw,14px)",fontWeight:"bold"}}>👶 {fName}</span></div>)}
              {!fName&&sibs.length===0&&(<span style={{color:"rgba(255,255,255,0.3)",fontSize:"clamp(11px,3vw,13px)",fontStyle:"italic"}}>No family added yet — tap Edit ✏️</span>)}
            </div>
            {editF&&(<div style={{display:"flex",gap:9}}><input type="text" value={newS} onChange={e=>setNewS(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addSib()} placeholder={`Add Sibling ${sibs.length+1} name...`}/><button onClick={addSib} style={{flexShrink:0,background:ac("0.18"),border:`1px solid ${T.ac}`,borderRadius:9,padding:"0 clamp(12px,3.5vw,18px)",color:T.ac,cursor:"pointer",fontSize:"clamp(12px,3.5vw,14px)",whiteSpace:"nowrap",fontWeight:"bold"}}>+ Add</button></div>)}
          </div>
          {(sibs.length>0||fName)&&<p style={{color:"rgba(255,255,255,0.3)",fontSize:"clamp(9px,2.5vw,11px)",fontStyle:"italic",marginTop:5,textAlign:"center"}}>{ff("👶")}</p>}
        </div>
        {showF&&favs.length>0&&(
          <div style={{background:ac("0.05"),border:`1px solid ${ac("0.28")}`,borderRadius:"clamp(12px,3vw,16px)",padding:"clamp(16px,4.5vw,22px)",marginBottom:"clamp(16px,4.5vw,22px)",animation:"fadeUp 0.35s ease"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"clamp(12px,3vw,16px)"}}>
              <span style={{color:"#fff",fontSize:"clamp(13px,3.5vw,15px)",fontWeight:"bold"}}>❤️ FAVOURITES ({favs.length})</span>
              <span onClick={()=>setFavs([])} style={{color:"rgba(255,120,120,0.7)",fontSize:"clamp(11px,3vw,13px)",cursor:"pointer",fontWeight:"bold"}}>Clear all</span>
            </div>
            {favs.map((item,i)=>(
              <div key={i} className="nc" style={{background:ac("0.08"),border:`1px solid ${ac("0.32")}`}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{color:T.ac,fontSize:"clamp(17px,5vw,21px)",fontWeight:"bold"}}>{item.n}</span>
                    <span style={{background:ac("0.15"),color:"#fff",borderRadius:7,padding:"2px 9px",fontSize:"clamp(9px,2.5vw,11px)",fontWeight:"600"}}>{UL[item.u]}</span>
                  </div>
                  <div style={{color:"rgba(255,255,255,0.8)",fontSize:"clamp(11px,3vw,13px)",marginBottom:2,fontWeight:"500"}}>{item.o}</div>
                  <div style={{color:"rgba(255,255,255,0.65)",fontSize:"clamp(10px,2.8vw,12px)",marginBottom:3}}>{item.m}</div>
                  <div style={{color:"rgba(255,255,255,0.4)",fontSize:"clamp(9px,2.5vw,11px)",fontStyle:"italic"}}>{ff(item.n)}</div>
                </div>
                <button className="fav-btn" onClick={()=>togF(item)}>💔</button>
              </div>
            ))}
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(9px,2.5vw,14px)",marginBottom:"clamp(9px,2.5vw,14px)"}}>
          {[["Starts With",sw,setSw,"e.g. Sa"],["Ends With",ew,setEw,"e.g. ina"]].map(([lbl,val,set,ph],i)=>(
            <div key={i} style={{background:ac("0.05"),border:`1px solid ${ac("0.22")}`,borderRadius:"clamp(11px,3vw,15px)",padding:"clamp(11px,3vw,15px)"}}>
              <div style={{color:"#fff",fontSize:"clamp(11px,3vw,13px)",fontWeight:"bold",marginBottom:8}}>{lbl}</div>
              <input type="text" value={val} onChange={e=>set(e.target.value.slice(0,3))} placeholder={ph} maxLength={3}/>
              <div style={{color:"rgba(255,255,255,0.45)",fontSize:"clamp(9px,2.5vw,10px)",marginTop:6}}>Up to 3 letters</div>
            </div>
          ))}
        </div>

        {CATS.map(cat=>{
          const s=sel[cat.key]||[];
          const open=!coll[cat.key];
          return(
            <div key={cat.key} className="cat" style={{background:s.length?ac("0.05"):"rgba(255,255,255,0.025)",border:`1px solid ${s.length?ac("0.32"):"rgba(255,255,255,0.07)"}`}}>
              <div onClick={()=>setColl(p=>({...p,[cat.key]:!p[cat.key]}))} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"clamp(11px,3vw,14px) clamp(13px,4vw,17px)",cursor:"pointer",background:s.length?ac("0.06"):"transparent"}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:"clamp(14px,4vw,17px)"}}>{cat.icon}</span>
                  <span style={{color:s.length?T.ac:"#fff",fontSize:"clamp(12px,3.2vw,14px)",fontWeight:"bold"}}>{cat.label}</span>
                  {s.length>0&&<span style={{background:T.badge,color:T.bt,borderRadius:11,padding:"1px 8px",fontSize:"clamp(9px,2.5vw,11px)",fontWeight:"bold"}}>{s.length}</span>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  {s.length>0&&<span onClick={e=>{e.stopPropagation();setSel(p=>({...p,[cat.key]:[]}))} } style={{color:"rgba(255,120,120,0.7)",fontSize:"clamp(10px,2.8vw,12px)",cursor:"pointer",fontWeight:"bold"}}>Clear</span>}
                  <span style={{color:"rgba(255,255,255,0.35)",fontSize:"clamp(10px,2.8vw,12px)"}}>{open?"▾":"▸"}</span>
                </div>
              </div>
              {open&&(
                <div style={{padding:`2px clamp(13px,4vw,17px) clamp(11px,3vw,15px)`}}>
                  {s.length>0&&<div style={{fontSize:"clamp(10px,2.8vw,12px)",color:ac("0.7"),fontStyle:"italic",marginBottom:10}}>✓ {s.join(" · ")}</div>}
                  <div style={{display:"flex",flexWrap:"wrap",gap:"clamp(6px,2vw,9px)"}}>
                    {cat.opts.map(o=>{
                      const on=s.includes(o);
                      return(<button key={o} className="pill" onClick={()=>tog(cat,o)} style={{borderColor:on?T.ac:"rgba(255,255,255,0.15)",background:on?ac("0.2"):"rgba(255,255,255,0.03)",color:on?T.ac:"rgba(255,255,255,0.7)"}}>{on&&<span style={{fontSize:"clamp(8px,2.2vw,10px)",fontWeight:"bold"}}>✓</span>}{o}</button>);
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:ac("0.06"),border:`1px solid ${ac("0.18")}`,borderRadius:"clamp(9px,2.5vw,13px)",padding:"clamp(9px,2.5vw,13px) clamp(13px,4vw,17px)",marginBottom:"clamp(11px,3vw,16px)",marginTop:"clamp(4px,1vw,7px)"}}>
          <span style={{fontSize:"clamp(12px,3vw,14px)",color:"rgba(255,255,255,0.75)"}}>
            {tot>0?<><span style={{color:T.ac,fontWeight:"bold"}}>{tot} prefs</span><span style={{color:"rgba(255,255,255,0.5)"}}> · {Object.values(sel).filter(v=>v.length>0).length} categories</span></>:<span style={{color:"rgba(255,255,255,0.4)"}}>No filters — showing diverse results</span>}
          </span>
          <span onClick={resetAll} style={{color:"rgba(255,120,120,0.6)",fontSize:"clamp(11px,3vw,13px)",cursor:"pointer",fontWeight:"bold"}}>Reset all</span>
        </div>

        <button onClick={generate} style={{width:"100%",padding:"clamp(14px,4vw,18px)",borderRadius:"clamp(11px,3vw,15px)",border:`1px solid ${T.ac}`,background:`linear-gradient(135deg,${ac("0.25")},${ac("0.12")})`,color:T.ac,fontSize:"clamp(13px,3.5vw,16px)",fontWeight:"bold",letterSpacing:"0.1em",textTransform:"uppercase",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:"clamp(18px,5vw,26px)",transition:"all 0.3s"}}>
          ✨ Generate {T.lb} Names
        </button>

        {gen&&(
          <div style={{animation:"fadeUp 0.4s ease"}}>
            {noRes?(
              <div style={{background:ac("0.05"),border:`1px solid ${ac("0.22")}`,borderRadius:15,padding:"24px",textAlign:"center",marginBottom:16}}>
                <div style={{fontSize:30,marginBottom:9}}>🔍</div>
                <div style={{color:"#fff",fontSize:15,marginBottom:7,fontWeight:"bold"}}>No names match your filters</div>
                <div style={{color:"rgba(255,255,255,0.55)",fontSize:13}}>Try removing or loosening some filters</div>
              </div>
            ):(
              <>
                <div style={{textAlign:"center",marginBottom:"clamp(11px,3vw,15px)"}}><span style={{color:"rgba(255,255,255,0.5)",fontSize:"clamp(10px,2.8vw,12px)",letterSpacing:"0.12em",textTransform:"uppercase"}}>❆ {T.lb} Names — Tap ❤️ to save ❆</span></div>
                {res.map((item,i)=>(
                  <div key={i} className="nc" style={{background:isF(item)?ac("0.08"):"rgba(255,255,255,0.03)",border:`1px solid ${isF(item)?ac("0.48"):"rgba(255,255,255,0.07)"}`,animation:`fadeUp 0.3s ease ${i*0.05}s both`}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:9,marginBottom:5}}>
                        <span style={{color:T.ac,fontSize:"clamp(18px,5vw,23px)",fontWeight:"bold"}}>{item.n}</span>
                        <span style={{background:ac("0.12"),color:"rgba(255,255,255,0.9)",borderRadius:7,padding:"2px 9px",fontSize:"clamp(9px,2.5vw,11px)",fontWeight:"600"}}>{UL[item.u]}</span>
                      </div>
                      <div style={{color:"rgba(255,255,255,0.85)",fontSize:"clamp(11px,3vw,13px)",marginBottom:3,fontWeight:"500"}}>{item.o}</div>
                      <div style={{color:"rgba(255,255,255,0.7)",fontSize:"clamp(10px,2.8vw,13px)",marginBottom:4}}>{item.m}</div>
                      {(sibs.length>0||fName)&&<div style={{color:"rgba(255,255,255,0.4)",fontSize:"clamp(9px,2.5vw,11px)",fontStyle:"italic"}}>{ff(item.n)}</div>}
                    </div>
                    <button className="fav-btn" onClick={()=>togF(item)}>{isF(item)?"❤️":"🤍"}</button>
                  </div>
                ))}
                <div style={{display:"flex",gap:"clamp(7px,2vw,11px)",marginTop:5}}>
                  <button onClick={generate} style={{flex:1,padding:"clamp(11px,3vw,14px)",borderRadius:"clamp(9px,2.5vw,13px)",border:"1px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.6)",fontSize:"clamp(12px,3vw,14px)",cursor:"pointer",fontWeight:"500"}}>↻ Generate More</button>
                  {favs.length>0&&<button onClick={()=>{setShowF(true);window.scrollTo({top:0,behavior:"smooth"})}} style={{flexShrink:0,padding:"clamp(11px,3vw,14px) clamp(15px,4vw,20px)",borderRadius:"clamp(9px,2.5vw,13px)",border:`1px solid ${ac("0.45")}`,background:ac("0.12"),color:T.ac,fontSize:"clamp(12px,3vw,14px)",cursor:"pointer",fontWeight:"bold"}}>❤️ {favs.length}</button>}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

