import { useState, useEffect, useCallback } from "react";

const ALL_SERVICES = [
  { id: 1, name: "Corte", price: "22.000 - 25.000", priceNum: 22000, duration: 30, icon: "✂️", category: "Cortes" },
  { id: 2, name: "Corte | Cejas", price: "25.000", priceNum: 25000, duration: 35, icon: "✂️", category: "Cortes" },
  { id: 3, name: "Corte | Diseño", price: "25.000", priceNum: 25000, duration: 40, icon: "💈", category: "Cortes" },
  { id: 4, name: "Corte | Barba", price: "30.000", priceNum: 30000, duration: 45, icon: "🪒", category: "Cortes" },
  { id: 5, name: "Corte | Cejas | Diseño", price: "30.000", priceNum: 30000, duration: 45, icon: "💈", category: "Cortes" },
  { id: 6, name: "Corte | Cejas | Barba", price: "35.000", priceNum: 35000, duration: 50, icon: "🪒", category: "Cortes" },
  { id: 7, name: "Corte | Limpieza Facial", price: "45.000", priceNum: 45000, duration: 60, icon: "🧖", category: "Cortes" },
  { id: 8, name: "Diseño", price: "7.000", priceNum: 7000, duration: 15, icon: "🎨", category: "Asesoría" },
  { id: 9, name: "Cejas", price: "7.000", priceNum: 7000, duration: 15, icon: "👁️", category: "Asesoría" },
  { id: 10, name: "Barba", price: "10.000", priceNum: 10000, duration: 20, icon: "🪒", category: "Asesoría" },
  { id: 11, name: "Limpieza Facial", price: "20.000", priceNum: 20000, duration: 40, icon: "🧖", category: "Asesoría" },
  { id: 12, name: "Membresía Black", price: "0 (Promo)", priceNum: 0, duration: 10, icon: "⭐", category: "Promoción", promo: true, promoOriginal: "22.000", promoUntil: "30/11/2026" },
];

// ============================================================
// ⚡ EDITA AQUÍ LOS DATOS DE TU BARBERÍA
// ============================================================
const SHOP = {
  name: "Black Barber Studio",
  address: "Cl. 38b Sur # 72J-17, Kennedy, Bogotá, D.C., Colombia",
  mapsUrl: "https://maps.google.com/?q=Cl.+38b+Sur+%23+72J-17,+Kennedy,+Bogota",
  whatsapp: "https://wa.me/573057450626",       // ← Pon tu número real aquí
  instagram: "https://www.instagram.com/alexmc.co/?utm_source=ig_web_button_share_sheet", // ← Tu IG real
  baseRating: 5.0,
  baseReviews: 431,
  baseBookings: 1469,
};
// ============================================================

const DAYS_ES = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const DAYS_FULL = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const SK = "bbs_v2";
const DCFG = { weeklyDays:[1,2,3,4,5,6], startHour:9, endHour:19, slotMinutes:30, pin:"1234", recoveryEmail:"", recoveryPhone:"", blockedDates:{}, customHours:{} };

const toStr = d => d.toISOString().split("T")[0];
const fmtDate = str => { const d=new Date(str+"T12:00:00"); return `${DAYS_FULL[d.getDay()]} ${d.getDate()} de ${MONTHS_ES[d.getMonth()]}`; };

// ---- Storage helpers (localStorage for production) ----
const storage = {
  get: (key) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
};

const Logo = ({size=80}) => (
  <div style={{width:size,height:size,borderRadius:"50%",background:"radial-gradient(circle at 30% 30%,#1a3a1a,#0a0a0a)",border:"3px solid #39ff14",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 20px rgba(57,255,20,0.3),inset 0 0 20px rgba(57,255,20,0.1)",flexShrink:0}}>
    <div style={{textAlign:"center",lineHeight:1}}>
      <div style={{fontSize:size*.13,color:"#39ff14",fontWeight:800,letterSpacing:1,textShadow:"0 0 6px #39ff14"}}>BLACK</div>
      <div style={{fontSize:size*.22,color:"#fff",fontWeight:900,letterSpacing:2,margin:"1px 0"}}>BARBER</div>
      <div style={{fontSize:size*.12,color:"#39ff14",fontWeight:700,letterSpacing:3,textShadow:"0 0 6px #39ff14"}}>STUDIO</div>
    </div>
  </div>
);

const Stars = ({value,onChange,size=28}) => {
  const [h,setH]=useState(0);
  return (<div style={{display:"flex",gap:4}}>{[1,2,3,4,5].map(i=>(<span key={i} onClick={()=>onChange&&onChange(i)} onMouseEnter={()=>onChange&&setH(i)} onMouseLeave={()=>onChange&&setH(0)} style={{fontSize:size,cursor:onChange?"pointer":"default",color:i<=(h||value)?"#FFD700":"#333",transition:"color .15s",textShadow:i<=(h||value)?"0 0 8px rgba(255,215,0,.5)":"none"}}>★</span>))}</div>);
};

export default function App(){
  const [view,setView]=useState("home");
  const [selSvc,setSelSvc]=useState(null);
  const [selDate,setSelDate]=useState(null);
  const [selTime,setSelTime]=useState(null);
  const [cName,setCName]=useState("");
  const [cPhone,setCPhone]=useState("");
  const [appts,setAppts]=useState([]);
  const [revs,setRevs]=useState([]);
  const [admin,setAdmin]=useState(false);
  const [pin,setPin]=useState("");
  const [showPin,setShowPin]=useState(false);
  const [cfg,setCfg]=useState(DCFG);
  const [cfgEdit,setCfgEdit]=useState(null);
  const [confirm,setConfirm]=useState(null);
  const [toast,setToast]=useState(null);
  const [aTab,setATab]=useState("citas");
  const [rateData,setRateData]=useState({id:null,stars:0,comment:""});
  const [showRate,setShowRate]=useState(false);
  const [recovery,setRecovery]=useState(false);
  const [recInput,setRecInput]=useState("");
  const [calMonth,setCalMonth]=useState(new Date());
  const [blocking,setBlocking]=useState(null);
  const [blockReason,setBlockReason]=useState("");
  const [custDate,setCustDate]=useState(null);
  const [custS,setCustS]=useState(9);
  const [custE,setCustE]=useState(19);
  const [expCat,setExpCat]=useState("Cortes");

  useEffect(()=>{
    const d = storage.get(SK);
    if(d){
      if(d.a) setAppts(d.a);
      if(d.c) setCfg({...DCFG,...d.c});
      if(d.r) setRevs(d.r);
    }
  },[]);

  const save = useCallback((a,c,r) => { storage.set(SK, {a,c,r}); },[]);
  const notify = (msg,t="ok") => { setToast({msg,t}); setTimeout(()=>setToast(null),3000); };

  const dayOk = d => { const s2=toStr(d); if(cfg.blockedDates[s2]) return false; return cfg.weeklyDays.includes(d.getDay()); };
  const getHours = d => { const s2=toStr(d); return cfg.customHours[s2]||{start:cfg.startHour,end:cfg.endHour}; };

  const next60 = () => { const r=[]; const t=new Date(); for(let i=0;i<60;i++){ const d=new Date(t); d.setDate(t.getDate()+i); if(dayOk(d)) r.push(d); } return r; };

  const slots = date => {
    if(!date||!selSvc) return [];
    const r=[]; const dstr=toStr(date); const h=getHours(date);
    const booked=appts.filter(a=>a.date===dstr&&a.status!=="cancelled").map(a=>({s:parseInt(a.timeSlot.split(":")[0])*60+parseInt(a.timeSlot.split(":")[1]),d:a.duration}));
    for(let hr=h.start;hr<h.end;hr++) for(let m=0;m<60;m+=cfg.slotMinutes){
      const ss=hr*60+m, se=ss+selSvc.duration;
      if(se>h.end*60) continue;
      if(!booked.some(b=>ss<b.s+b.d&&se>b.s)) r.push(`${String(hr).padStart(2,"0")}:${String(m).padStart(2,"0")}`);
    }
    return r;
  };

  const book = () => {
    if(!cName.trim()||!cPhone.trim()){ notify("Completa nombre y teléfono","err"); return; }
    const n={id:Date.now(),service:selSvc.name,price:selSvc.price,duration:selSvc.duration,date:toStr(selDate),timeSlot:selTime,clientName:cName.trim(),clientPhone:cPhone.trim(),status:"confirmed",createdAt:new Date().toISOString(),rated:false};
    const u=[...appts,n]; setAppts(u); save(u,cfg,revs); setConfirm(n); setView("confirm"); setCName(""); setCPhone("");
  };

  const cancel = id => { const u=appts.map(a=>a.id===id?{...a,status:"cancelled"}:a); setAppts(u); save(u,cfg,revs); notify("Cita cancelada"); };

  const submitRev = () => {
    if(!rateData.stars){ notify("Selecciona estrellas","err"); return; }
    const nr={id:Date.now(),apptId:rateData.id,stars:rateData.stars,comment:rateData.comment,date:new Date().toISOString(),clientName:appts.find(a=>a.id===rateData.id)?.clientName||"Cliente"};
    const ur=[...revs,nr]; const ua=appts.map(a=>a.id===rateData.id?{...a,rated:true}:a);
    setRevs(ur); setAppts(ua); save(ua,cfg,ur); setShowRate(false); setRateData({id:null,stars:0,comment:""}); notify("¡Gracias por calificar!");
  };

  const loginAdmin = () => { if(pin===cfg.pin){ setAdmin(true); setShowPin(false); setPin(""); setView("admin"); } else notify("PIN incorrecto","err"); };
  const doRecover = () => { if(recInput===cfg.recoveryEmail||recInput===cfg.recoveryPhone){ notify(`Tu PIN es: ${cfg.pin}`); setRecovery(false); setRecInput(""); } else notify("No coincide","err"); };
  const saveCfg = () => { setCfg(cfgEdit); save(appts,cfgEdit,revs); setCfgEdit(null); notify("Configuración guardada"); };
  const blockD = d2 => { const nc={...cfg,blockedDates:{...cfg.blockedDates,[d2]:blockReason||"Bloqueado"}}; setCfg(nc); save(appts,nc,revs); setBlocking(null); setBlockReason(""); notify("Día bloqueado"); };
  const unblockD = d2 => { const bd={...cfg.blockedDates}; delete bd[d2]; const nc={...cfg,blockedDates:bd}; setCfg(nc); save(appts,nc,revs); notify("Desbloqueado"); };
  const saveCust = d2 => { const nc={...cfg,customHours:{...cfg.customHours,[d2]:{start:custS,end:custE}}}; setCfg(nc); save(appts,nc,revs); setCustDate(null); notify("Horario guardado"); };
  const rmCust = d2 => { const ch={...cfg.customHours}; delete ch[d2]; const nc={...cfg,customHours:ch}; setCfg(nc); save(appts,nc,revs); notify("Horario eliminado"); };

  const today = toStr(new Date());
  const upcoming = appts.filter(a=>a.date>=today&&a.status!=="cancelled").sort((a,b)=>a.date.localeCompare(b.date)||a.timeSlot.localeCompare(b.timeSlot));
  const avgR = revs.length ? (revs.reduce((s,r)=>s+r.stars,0)/revs.length).toFixed(1) : SHOP.baseRating;
  const totalR = SHOP.baseReviews+revs.length;

  const calDays = () => { const y=calMonth.getFullYear(),mo=calMonth.getMonth(),fd=new Date(y,mo,1).getDay(),dim=new Date(y,mo+1,0).getDate(),r=[]; for(let i=0;i<fd;i++) r.push(null); for(let i=1;i<=dim;i++) r.push(new Date(y,mo,i)); return r; };

  const G="#39ff14";
  const inp={width:"100%",padding:"14px 16px",borderRadius:12,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(57,255,20,0.15)",color:"#fff",fontSize:15,outline:"none",boxSizing:"border-box",marginBottom:10};
  const crd={padding:16,borderRadius:14,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(57,255,20,0.12)",marginBottom:10};
  const ov={position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:100,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(8px)"};
  const mod={padding:28,borderRadius:20,background:"#111",border:"1px solid rgba(57,255,20,0.2)",width:300,maxHeight:"80vh",overflowY:"auto"};
  const pb={width:"100%",padding:16,borderRadius:14,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${G},#00cc00)`,color:"#000",fontSize:16,fontWeight:800,letterSpacing:1,boxShadow:"0 0 20px rgba(57,255,20,0.3)"};
  const ob={padding:"10px 20px",borderRadius:10,border:`1px solid ${G}`,background:"transparent",color:G,fontWeight:700,cursor:"pointer",fontSize:13};
  const lbl={fontSize:11,letterSpacing:3,color:G,fontWeight:700,textTransform:"uppercase",marginBottom:12,display:"block"};

  return(
    <div style={{minHeight:"100vh",background:"linear-gradient(145deg,#0a0a0a,#111 50%,#0d0d0d)",color:"#e0e0e0",fontFamily:"'Segoe UI',system-ui,sans-serif",maxWidth:480,margin:"0 auto",position:"relative",paddingBottom:80}}>

      {toast&&<div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:1000,background:toast.t==="err"?"rgba(255,60,60,.15)":"rgba(57,255,20,.15)",border:`1px solid ${toast.t==="err"?"#ff4444":G}`,borderRadius:12,padding:"12px 24px",color:toast.t==="err"?"#ff4444":G,fontSize:14,fontWeight:600,backdropFilter:"blur(10px)"}}>{toast.msg}</div>}

      {/* ===== HOME ===== */}
      {view==="home"&&<div style={{padding:"0 20px"}}>
        <div style={{textAlign:"center",paddingTop:32,paddingBottom:8}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><Logo size={90}/></div>
          <h1 style={{fontSize:26,fontWeight:900,color:"#fff",margin:0,letterSpacing:2}}>BLACK BARBER <span style={{color:G,textShadow:"0 0 8px rgba(57,255,20,.4)"}}>STUDIO</span></h1>
          <p style={{fontSize:12,color:"#888",margin:"6px 0 0",lineHeight:1.5}}>📍 <a href={SHOP.mapsUrl} target="_blank" rel="noopener noreferrer" style={{color:G,textDecoration:"none"}}>{SHOP.address}</a></p>
          <div style={{display:"flex",justifyContent:"center",gap:24,marginTop:14}}>
            <div style={{textAlign:"center"}}><div style={{color:"#FFD700",fontWeight:800,fontSize:18}}>⭐ {avgR}</div><div style={{fontSize:11,color:"#888"}}>({totalR})</div></div>
            <div style={{width:1,background:"rgba(255,255,255,.1)"}}/>
            <div style={{textAlign:"center"}}><div style={{color:"#fff",fontWeight:800,fontSize:18}}>{SHOP.baseBookings+appts.length}</div><div style={{fontSize:11,color:"#888"}}>Agendamientos</div></div>
          </div>
        </div>

        <div style={{display:"flex",justifyContent:"center",gap:14,margin:"16px 0 24px"}}>
          {[["📱","WhatsApp",SHOP.whatsapp],["📸","Instagram",SHOP.instagram],["🎵","TikTok",SHOP.tiktok],["📍","Maps",SHOP.mapsUrl]].map(([ic,lb,hr])=>(
            <a key={lb} href={hr} target="_blank" rel="noopener noreferrer" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,textDecoration:"none",color:"#aaa",fontSize:10,fontWeight:600}}>
              <div style={{width:44,height:44,borderRadius:12,background:"rgba(57,255,20,.08)",border:"1px solid rgba(57,255,20,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{ic}</div><span>{lb}</span>
            </a>
          ))}
        </div>

        {["Cortes","Asesoría","Promoción"].map(cat=>{
          const svcs=ALL_SERVICES.filter(s=>s.category===cat); const open=expCat===cat;
          return(<div key={cat} style={{marginBottom:8}}>
            <button onClick={()=>setExpCat(open?null:cat)} style={{width:"100%",padding:"14px 16px",background:"rgba(57,255,20,.06)",border:"1px solid rgba(57,255,20,.12)",borderRadius:12,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",color:G,fontWeight:700,fontSize:15,letterSpacing:1}}>
              <span>{cat}</span><span style={{fontSize:12,transition:"transform .3s",transform:open?"rotate(180deg)":"rotate(0)"}}>▼</span>
            </button>
            {open&&<div style={{marginTop:6}}>{svcs.map(svc=>(
              <button key={svc.id} onClick={()=>{setSelSvc(svc);setSelDate(null);setSelTime(null);setView("calendar");}} style={{...crd,width:"100%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",textAlign:"left",boxSizing:"border-box"}}>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:24}}>{svc.icon}</span>
                  <div>
                    <div style={{fontWeight:700,fontSize:14,color:"#fff"}}>{svc.name}</div>
                    <div style={{fontSize:11,color:"#888",marginTop:2}}>{svc.duration} min</div>
                    {svc.promo&&<div style={{fontSize:11,color:"#FFD700",marginTop:2}}>Promo hasta {svc.promoUntil} • <span style={{textDecoration:"line-through",color:"#666"}}>${svc.promoOriginal}</span></div>}
                  </div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{color:G,fontWeight:700,fontSize:14}}>$ {svc.price}</div>
                  <div style={{fontSize:11,color:G,marginTop:4,fontWeight:600}}>Agendar →</div>
                </div>
              </button>
            ))}</div>}
          </div>);
        })}

        {appts.filter(a=>a.status==="confirmed"&&!a.rated&&a.date<=today).length>0&&(
          <div style={{...crd,background:"rgba(255,215,0,.06)",border:"1px solid rgba(255,215,0,.2)",marginTop:16,textAlign:"center"}}>
            <p style={{color:"#FFD700",fontWeight:700,fontSize:14,margin:"0 0 10px"}}>⭐ ¿Cómo te fue en tu última visita?</p>
            <button onClick={()=>{const l=appts.filter(a=>a.status==="confirmed"&&!a.rated&&a.date<=today).pop();if(l){setRateData({id:l.id,stars:0,comment:""});setShowRate(true);}}} style={{...ob,borderColor:"#FFD700",color:"#FFD700"}}>Calificar visita</button>
          </div>
        )}

        {revs.length>0&&<div style={{marginTop:20}}>
          <span style={lbl}>Calificaciones recientes</span>
          {revs.slice(-3).reverse().map(r=>(<div key={r.id} style={{...crd,padding:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontWeight:600,color:"#fff",fontSize:13}}>{r.clientName}</span><Stars value={r.stars} size={14}/>
            </div>
            {r.comment&&<p style={{margin:0,fontSize:13,color:"#aaa"}}>{r.comment}</p>}
          </div>))}
        </div>}
      </div>}

      {/* ===== CALENDAR ===== */}
      {view==="calendar"&&selSvc&&<div style={{padding:"0 20px"}}>
        <button onClick={()=>{setView("home");setSelSvc(null);}} style={{background:"none",border:"none",color:G,cursor:"pointer",fontSize:14,fontWeight:600,padding:"20px 0"}}>← Volver</button>
        <div style={{...crd,background:"rgba(57,255,20,.06)",border:"1px solid rgba(57,255,20,.2)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div><span style={{fontSize:22,marginRight:8}}>{selSvc.icon}</span><span style={{fontWeight:700,color:"#fff",fontSize:16}}>{selSvc.name}</span></div>
            <span style={{color:G,fontWeight:700}}>$ {selSvc.price}</span>
          </div>
        </div>
        <span style={{...lbl,marginTop:20}}>Elige un día</span>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:24}}>
          {next60().slice(0,21).map(d=>{const sel=selDate&&d.toDateString()===selDate.toDateString();const isT=d.toDateString()===new Date().toDateString();
            return(<button key={d.toISOString()} onClick={()=>{setSelDate(d);setSelTime(null);}} style={{width:64,padding:"8px 0",borderRadius:12,cursor:"pointer",background:sel?"linear-gradient(135deg,#39ff14,#00cc00)":"rgba(255,255,255,.04)",border:sel?"none":"1px solid rgba(57,255,20,.1)",color:sel?"#000":"#ccc",textAlign:"center"}}>
              <div style={{fontSize:10,fontWeight:600,opacity:.7}}>{DAYS_ES[d.getDay()]}</div>
              <div style={{fontSize:18,fontWeight:800,margin:"2px 0"}}>{d.getDate()}</div>
              <div style={{fontSize:9,opacity:.6}}>{isT?"Hoy":MONTHS_ES[d.getMonth()].slice(0,3)}</div>
            </button>);
          })}
        </div>
        {selDate&&<>
          <span style={lbl}>Elige una hora</span>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:24}}>
            {slots(selDate).length===0?<p style={{color:"#888",fontSize:14}}>No hay horarios disponibles</p>:
            slots(selDate).map(sl=>(<button key={sl} onClick={()=>setSelTime(sl)} style={{padding:"10px 16px",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:14,background:selTime===sl?G:"rgba(255,255,255,.04)",border:selTime===sl?"none":"1px solid rgba(57,255,20,.1)",color:selTime===sl?"#000":"#ccc"}}>{sl}</button>))}
          </div>
        </>}
        {selTime&&<>
          <span style={lbl}>Tus datos</span>
          <input type="text" placeholder="Tu nombre" value={cName} onChange={e=>setCName(e.target.value)} style={inp}/>
          <input type="tel" placeholder="Tu WhatsApp / Teléfono" value={cPhone} onChange={e=>setCPhone(e.target.value)} style={inp}/>
          <button onClick={book} style={pb}>CONFIRMAR CITA ✓</button>
        </>}
      </div>}

      {/* ===== CONFIRM ===== */}
      {view==="confirm"&&confirm&&<div style={{padding:"40px 20px",textAlign:"center"}}>
        <div style={{width:80,height:80,margin:"0 auto 20px",borderRadius:"50%",background:`linear-gradient(135deg,${G},#00cc00)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 30px rgba(57,255,20,.4)"}}><span style={{fontSize:40,color:"#000"}}>✓</span></div>
        <h2 style={{color:"#fff",fontSize:22,fontWeight:800,marginBottom:6}}>¡Cita Agendada!</h2>
        <p style={{color:"#888",fontSize:14,marginBottom:24}}>Tu reserva ha sido confirmada</p>
        <div style={{...crd,background:"rgba(57,255,20,.06)",border:"1px solid rgba(57,255,20,.2)",textAlign:"left",padding:22}}>
          {[["SERVICIO",confirm.service,"#fff"],["FECHA",fmtDate(confirm.date),"#fff"],["HORA",confirm.timeSlot,G],["PRECIO",`$ ${confirm.price}`,G],["CLIENTE",`${confirm.clientName} — ${confirm.clientPhone}`,"#fff"]].map(([l,v,c])=>(
            <div key={l} style={{marginBottom:14}}><div style={{fontSize:10,color:"#666",letterSpacing:2}}>{l}</div><div style={{color:c,fontWeight:700,fontSize:l==="HORA"?20:15}}>{v}</div></div>
          ))}
        </div>
        <button onClick={()=>{setView("home");setConfirm(null);setSelSvc(null);}} style={{...ob,marginTop:24}}>VOLVER AL INICIO</button>
      </div>}

      {/* ===== ADMIN ===== */}
      {view==="admin"&&admin&&<div style={{padding:"0 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 0"}}>
          <button onClick={()=>setView("home")} style={{background:"none",border:"none",color:G,cursor:"pointer",fontSize:14,fontWeight:600}}>← Inicio</button>
          <h2 style={{color:"#fff",fontSize:17,fontWeight:800,margin:0}}>Panel Admin</h2>
          <button onClick={()=>{setAdmin(false);setView("home");}} style={{background:"none",border:"none",color:"#ff4444",cursor:"pointer",fontSize:12,fontWeight:600}}>Salir</button>
        </div>

        <div style={{display:"flex",gap:6,marginBottom:16}}>
          {[["citas","📅 Citas"],["cal","🗓️ Calendario"],["revs","⭐ Reseñas"],["cfg","⚙️ Config"]].map(([k,l])=>(
            <button key={k} onClick={()=>setATab(k)} style={{flex:1,padding:"10px 4px",borderRadius:10,cursor:"pointer",fontSize:11,fontWeight:700,background:aTab===k?"rgba(57,255,20,.15)":"rgba(255,255,255,.04)",border:aTab===k?`1px solid ${G}`:"1px solid rgba(255,255,255,.06)",color:aTab===k?G:"#888"}}>{l}</button>
          ))}
        </div>

        {aTab==="citas"&&<>
          <span style={lbl}>Citas próximas ({upcoming.length})</span>
          {upcoming.length===0?<p style={{color:"#666",fontSize:14,textAlign:"center",padding:20}}>No hay citas próximas</p>:
          upcoming.map(a=>(<div key={a.id} style={crd}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><span style={{fontWeight:700,color:"#fff",fontSize:14}}>{a.service}</span><span style={{color:G,fontWeight:700}}>{a.timeSlot}</span></div>
            <div style={{fontSize:12,color:"#888"}}>📅 {fmtDate(a.date)} • 💰 $ {a.price}</div>
            <div style={{fontSize:12,color:"#aaa",margin:"4px 0 8px"}}>👤 {a.clientName} — 📞 {a.clientPhone}</div>
            <button onClick={()=>cancel(a.id)} style={{padding:"6px 14px",borderRadius:8,border:"1px solid #ff4444",background:"transparent",color:"#ff4444",fontSize:11,cursor:"pointer",fontWeight:600}}>Cancelar</button>
          </div>))}
        </>}

        {aTab==="cal"&&<>
          <span style={lbl}>Gestión de disponibilidad</span>
          <p style={{fontSize:12,color:"#888",margin:"0 0 12px"}}>Toca un día para bloquearlo o personalizar horario. Navega meses para planificar.</p>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <button onClick={()=>{const n=new Date(calMonth);n.setMonth(n.getMonth()-1);setCalMonth(n);}} style={{background:"none",border:"none",color:G,cursor:"pointer",fontSize:18,fontWeight:700}}>◀</button>
            <span style={{color:"#fff",fontWeight:700,fontSize:15}}>{MONTHS_ES[calMonth.getMonth()]} {calMonth.getFullYear()}</span>
            <button onClick={()=>{const n=new Date(calMonth);n.setMonth(n.getMonth()+1);setCalMonth(n);}} style={{background:"none",border:"none",color:G,cursor:"pointer",fontSize:18,fontWeight:700}}>▶</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:4}}>
            {DAYS_ES.map(d=><div key={d} style={{textAlign:"center",fontSize:10,color:"#666",fontWeight:700}}>{d}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:16}}>
            {calDays().map((d,i)=>{
              if(!d)return<div key={`e${i}`}/>;
              const d2=toStr(d),bl=!!cfg.blockedDates[d2],hc=!!cfg.customHours[d2],wd=cfg.weeklyDays.includes(d.getDay()),past=d2<today;
              const ac=appts.filter(a=>a.date===d2&&a.status!=="cancelled").length;
              return(<button key={d2} disabled={past} onClick={()=>{if(past)return;if(bl){unblockD(d2);return;}setBlocking(d2);}}
                style={{padding:"6px 2px",borderRadius:8,cursor:past?"default":"pointer",background:bl?"rgba(255,68,68,.15)":hc?"rgba(57,255,20,.12)":!wd?"rgba(255,255,255,.02)":"rgba(255,255,255,.04)",border:bl?"1px solid rgba(255,68,68,.3)":hc?`1px solid rgba(57,255,20,.3)`:"1px solid transparent",color:past?"#333":bl?"#ff4444":!wd?"#444":"#ccc",textAlign:"center",fontSize:13,fontWeight:700,opacity:past?.4:1}}>
                {d.getDate()}
                {ac>0&&<div style={{fontSize:8,color:G}}>{ac}</div>}
                {bl&&<div style={{fontSize:7,color:"#ff4444"}}>✕</div>}
                {hc&&!bl&&<div style={{fontSize:7,color:G}}>⏰</div>}
              </button>);
            })}
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10,fontSize:10,color:"#888",marginBottom:16}}><span>🔴 Bloqueado</span><span>🟢 Horario custom</span></div>
          {Object.keys(cfg.customHours).length>0&&<>
            <span style={lbl}>Horarios personalizados</span>
            {Object.entries(cfg.customHours).sort().map(([d2,h])=>(<div key={d2} style={{...crd,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{color:"#fff",fontWeight:600,fontSize:13}}>{fmtDate(d2)}</div><div style={{color:G,fontSize:12}}>{h.start}:00 - {h.end}:00</div></div>
              <button onClick={()=>rmCust(d2)} style={{background:"none",border:"none",color:"#ff4444",cursor:"pointer",fontSize:18}}>✕</button>
            </div>))}
          </>}
          {Object.keys(cfg.blockedDates).length>0&&<>
            <span style={{...lbl,marginTop:12}}>Días bloqueados</span>
            {Object.entries(cfg.blockedDates).sort().map(([d2,reason])=>(<div key={d2} style={{...crd,display:"flex",justifyContent:"space-between",alignItems:"center",borderColor:"rgba(255,68,68,.2)"}}>
              <div><div style={{color:"#fff",fontWeight:600,fontSize:13}}>{fmtDate(d2)}</div><div style={{color:"#ff4444",fontSize:12}}>{reason}</div></div>
              <button onClick={()=>unblockD(d2)} style={{background:"none",border:"none",color:G,cursor:"pointer",fontSize:12,fontWeight:600}}>Desbloquear</button>
            </div>))}
          </>}
        </>}

        {aTab==="revs"&&<>
          <span style={lbl}>Calificaciones ({revs.length})</span>
          {revs.length>0&&<div style={{...crd,background:"rgba(255,215,0,.06)",border:"1px solid rgba(255,215,0,.15)",textAlign:"center",marginBottom:16}}>
            <div style={{fontSize:36,fontWeight:900,color:"#FFD700"}}>{avgR}</div><Stars value={Math.round(avgR)} size={20}/><div style={{fontSize:12,color:"#888",marginTop:4}}>{revs.length} calificaciones</div>
          </div>}
          {revs.length===0?<p style={{color:"#666",fontSize:14,textAlign:"center",padding:20}}>Sin calificaciones aún</p>:
          revs.slice().reverse().map(r=>(<div key={r.id} style={crd}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
              <span style={{fontWeight:700,color:"#fff",fontSize:13}}>{r.clientName}</span><Stars value={r.stars} size={14}/>
            </div>
            {r.comment&&<p style={{margin:"4px 0 0",fontSize:13,color:"#aaa"}}>{r.comment}</p>}
            <div style={{fontSize:10,color:"#555",marginTop:6}}>{new Date(r.date).toLocaleDateString()}</div>
          </div>))}
        </>}

        {aTab==="cfg"&&<>
          <span style={lbl}>Configuración</span>
          {!cfgEdit?<>
            <div style={crd}><div style={{fontSize:12,color:"#888",marginBottom:6}}>Días de trabajo</div><div style={{color:"#fff",fontWeight:600,fontSize:14}}>{cfg.weeklyDays.map(d=>DAYS_ES[d]).join(", ")}</div></div>
            <div style={crd}><div style={{fontSize:12,color:"#888",marginBottom:6}}>Horario base</div><div style={{color:"#fff",fontWeight:600}}>{cfg.startHour}:00 — {cfg.endHour}:00</div></div>
            <div style={crd}><div style={{fontSize:12,color:"#888",marginBottom:6}}>Recuperación</div><div style={{color:"#fff",fontSize:13}}>{cfg.recoveryEmail||cfg.recoveryPhone?"✅ Configurado":"⚠️ No configurado"}</div></div>
            <button onClick={()=>setCfgEdit({...cfg})} style={{...pb,marginTop:10}}>EDITAR CONFIGURACIÓN</button>
          </>:<div style={{...crd,background:"rgba(0,0,0,.5)",border:"1px solid rgba(57,255,20,.2)"}}>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:12,color:"#888",display:"block",marginBottom:8}}>Días de trabajo:</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {DAYS_ES.map((d,i)=>(<button key={i} onClick={()=>{const days=cfgEdit.weeklyDays.includes(i)?cfgEdit.weeklyDays.filter(x=>x!==i):[...cfgEdit.weeklyDays,i].sort();setCfgEdit({...cfgEdit,weeklyDays:days});}} style={{padding:"8px 12px",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,background:cfgEdit.weeklyDays.includes(i)?G:"rgba(255,255,255,.06)",border:"none",color:cfgEdit.weeklyDays.includes(i)?"#000":"#888"}}>{d}</button>))}
              </div>
            </div>
            <div style={{display:"flex",gap:12,marginBottom:16}}>
              {[["Hora inicio","startHour"],["Hora cierre","endHour"]].map(([l,k])=>(<div key={k} style={{flex:1}}>
                <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>{l}:</label>
                <select value={cfgEdit[k]} onChange={e=>setCfgEdit({...cfgEdit,[k]:parseInt(e.target.value)})} style={{width:"100%",padding:10,borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(57,255,20,.15)",color:"#fff",fontSize:14}}>
                  {Array.from({length:18},(_,i)=>i+5).map(h=><option key={h} value={h} style={{background:"#111"}}>{h}:00</option>)}
                </select>
              </div>))}
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>Slot (min):</label>
              <select value={cfgEdit.slotMinutes} onChange={e=>setCfgEdit({...cfgEdit,slotMinutes:parseInt(e.target.value)})} style={{width:"100%",padding:10,borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(57,255,20,.15)",color:"#fff",fontSize:14}}>
                {[15,20,30,45,60].map(m=><option key={m} value={m} style={{background:"#111"}}>{m} min</option>)}
              </select>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>PIN:</label>
              <input type="text" value={cfgEdit.pin} onChange={e=>setCfgEdit({...cfgEdit,pin:e.target.value})} style={inp}/>
            </div>
            <div style={{padding:14,borderRadius:12,background:"rgba(57,255,20,.04)",border:"1px solid rgba(57,255,20,.1)",marginBottom:16}}>
              <label style={{fontSize:12,color:G,display:"block",marginBottom:8,fontWeight:700}}>🔐 Recuperación de cuenta</label>
              <input type="email" placeholder="Correo de recuperación" value={cfgEdit.recoveryEmail||""} onChange={e=>setCfgEdit({...cfgEdit,recoveryEmail:e.target.value})} style={inp}/>
              <input type="tel" placeholder="Teléfono de recuperación" value={cfgEdit.recoveryPhone||""} onChange={e=>setCfgEdit({...cfgEdit,recoveryPhone:e.target.value})} style={{...inp,marginBottom:0}}/>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={saveCfg} style={{flex:1,padding:12,borderRadius:10,border:"none",cursor:"pointer",background:G,color:"#000",fontWeight:700}}>Guardar</button>
              <button onClick={()=>setCfgEdit(null)} style={{flex:1,padding:12,borderRadius:10,cursor:"pointer",background:"transparent",border:"1px solid #888",color:"#888",fontWeight:600}}>Cancelar</button>
            </div>
          </div>}
        </>}
      </div>}

      {/* ===== MODALS ===== */}
      {showPin&&<div style={ov}><div style={{...mod,textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:12}}>🔒</div>
        <h3 style={{color:"#fff",margin:"0 0 20px",fontWeight:700}}>Panel Admin</h3>
        <input type="password" placeholder="PIN" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&loginAdmin()} style={{...inp,textAlign:"center",fontSize:18,letterSpacing:8}}/>
        <button onClick={loginAdmin} style={{...pb,marginBottom:10}}>Entrar</button>
        {!recovery?<button onClick={()=>setRecovery(true)} style={{background:"none",border:"none",color:"#888",cursor:"pointer",fontSize:12,marginTop:6}}>¿Olvidaste el PIN?</button>
        :<div style={{marginTop:12,padding:14,borderRadius:12,background:"rgba(255,255,255,.04)",border:"1px solid rgba(57,255,20,.1)"}}>
          <p style={{fontSize:12,color:"#aaa",margin:"0 0 10px"}}>Ingresa correo o teléfono de recuperación:</p>
          <input type="text" placeholder="Correo o teléfono" value={recInput} onChange={e=>setRecInput(e.target.value)} style={inp}/>
          <button onClick={doRecover} style={{...ob,width:"100%",marginBottom:8}}>Recuperar PIN</button>
          <button onClick={()=>{setRecovery(false);setRecInput("");}} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:11}}>Cancelar</button>
        </div>}
        <div style={{marginTop:12}}><button onClick={()=>{setShowPin(false);setPin("");setRecovery(false);}} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:13}}>Cerrar</button></div>
      </div></div>}

      {blocking&&<div style={ov}><div style={{...mod,textAlign:"center"}}>
        <h3 style={{color:"#fff",margin:"0 0 6px"}}>📅 {fmtDate(blocking)}</h3>
        <p style={{color:"#888",fontSize:13,margin:"0 0 16px"}}>¿Qué deseas hacer?</p>
        <input type="text" placeholder="Motivo del bloqueo (opcional)" value={blockReason} onChange={e=>setBlockReason(e.target.value)} style={inp}/>
        <button onClick={()=>blockD(blocking)} style={{...pb,background:"linear-gradient(135deg,#ff4444,#cc0000)",marginBottom:10}}>🚫 Bloquear día completo</button>
        <button onClick={()=>{const h=cfg.customHours[blocking]||{start:cfg.startHour,end:cfg.endHour};setCustS(h.start);setCustE(h.end);setCustDate(blocking);setBlocking(null);}} style={{...ob,width:"100%",marginBottom:10}}>⏰ Personalizar horario</button>
        <button onClick={()=>{setBlocking(null);setBlockReason("");}} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:13}}>Cancelar</button>
      </div></div>}

      {custDate&&<div style={ov}><div style={{...mod,textAlign:"center"}}>
        <h3 style={{color:"#fff",margin:"0 0 6px"}}>⏰ Horario especial</h3>
        <p style={{color:"#888",fontSize:13,margin:"0 0 16px"}}>{fmtDate(custDate)}</p>
        <div style={{display:"flex",gap:12,marginBottom:16}}>
          {[["Apertura",custS,setCustS],["Cierre",custE,setCustE]].map(([l,v,fn])=>(<div key={l} style={{flex:1}}>
            <label style={{fontSize:12,color:"#888",display:"block",marginBottom:6}}>{l}</label>
            <select value={v} onChange={e=>fn(parseInt(e.target.value))} style={{width:"100%",padding:10,borderRadius:8,background:"rgba(255,255,255,.06)",border:"1px solid rgba(57,255,20,.15)",color:"#fff",fontSize:14}}>
              {Array.from({length:18},(_,i)=>i+5).map(h=><option key={h} value={h} style={{background:"#111"}}>{h}:00</option>)}
            </select>
          </div>))}
        </div>
        <button onClick={()=>saveCust(custDate)} style={{...pb,marginBottom:10}}>Guardar horario</button>
        <button onClick={()=>setCustDate(null)} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:13}}>Cancelar</button>
      </div></div>}

      {showRate&&<div style={ov}><div style={{...mod,textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:8}}>⭐</div>
        <h3 style={{color:"#fff",margin:"0 0 16px"}}>¿Cómo fue tu experiencia?</h3>
        <div style={{display:"flex",justifyContent:"center",marginBottom:16}}><Stars value={rateData.stars} onChange={v=>setRateData({...rateData,stars:v})} size={36}/></div>
        <textarea placeholder="Cuéntanos (opcional)" value={rateData.comment} onChange={e=>setRateData({...rateData,comment:e.target.value})} rows={3} style={{...inp,resize:"vertical",fontFamily:"inherit"}}/>
        <button onClick={submitRev} style={{...pb,marginBottom:10}}>Enviar calificación</button>
        <button onClick={()=>{setShowRate(false);setRateData({id:null,stars:0,comment:""});}} style={{background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:13}}>Cancelar</button>
      </div></div>}

      {/* NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,display:"flex",justifyContent:"center",gap:40,padding:"14px 0",background:"linear-gradient(to top,#0a0a0a 70%,transparent)",zIndex:50}}>
        <button onClick={()=>setView("home")} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:700,letterSpacing:1,color:view!=="admin"?G:"#666"}}>🏠 INICIO</button>
        <button onClick={()=>{if(admin)setView("admin");else setShowPin(true);}} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:700,letterSpacing:1,color:view==="admin"?G:"#666"}}>🔧 ADMIN</button>
      </div>

      <style>{`input::placeholder,textarea::placeholder{color:#555}select{appearance:none}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(57,255,20,.2);border-radius:2px}`}</style>
    </div>
  );
}
