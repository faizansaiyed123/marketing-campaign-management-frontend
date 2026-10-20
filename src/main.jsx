import React,{useEffect,useState}from"react";
import{createRoot}from"react-dom/client";
import"./style.css";
const API=(import.meta.env.VITE_API_URL||"").replace(/\/+$/,"");
const DEMO_MODE=!API&&import.meta.env.DEV;
function currentRoute(){const path=window.location.pathname.replace(/\/+$/,"")||"/";return ["/login","/register","/app"].includes(path)?path:"/"}
function toLocalDateTime(iso){if(!iso)return"";const d=new Date(iso);const p=n=>String(n).padStart(2,"0");return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`}
async function api(path,options={}){if(!API&&import.meta.env.DEV)throw new Error("The campaign API is not configured for local development. Set VITE_API_URL=http://localhost:8000 in your local environment.");const target=API?API+path:path;let r;try{r=await fetch(target,{credentials:"include",headers:options.body?{"Content-Type":"application/json",...(options.headers||{})}:options.headers,...options})}catch{throw new Error("Could not reach the campaign API. Check that the backend is deployed and BACKEND_API_URL is configured in Vercel.")}if(r.status===204)return null;let d=null;try{d=await r.json()}catch{}if(!r.ok){const error=new Error(d?.detail||(r.status===404?"The campaign API route was not found. Verify the configured backend URL.":r.status===502||r.status===503?"The campaign backend is not available yet. Check its deployment and BACKEND_API_URL in Vercel.":"Request failed ("+r.status+")."));error.status=r.status;throw error}return d}
function AuthPage({onLogin,initialRegistering=false,onBack,onChangeMode}){const[registering,setRegistering]=useState(initialRegistering),[form,setForm]=useState({name:"",email:"",password:""}),[busy,setBusy]=useState(false),[error,setError]=useState("");async function submit(e){e.preventDefault();setBusy(true);setError("");try{onLogin(await api(registering?"/api/v1/auth/register":"/api/v1/auth/login",{method:"POST",body:JSON.stringify(form)}))}catch(e){setError(e.message)}finally{setBusy(false)}}return <main className="auth-experience"><section className="auth-story" aria-label="Orbit Campaigns introduction"><button type="button" className="auth-story-brand" onClick={onBack} aria-label="Orbit Campaigns home"><i>✳</i><span>orbit<span>.campaigns</span></span></button><div className="auth-story-content"><span className="auth-story-kicker"><i></i> A LITTLE MORE ROOM TO CREATE</span><h2>Good marketing starts with a <em>clear mind.</em></h2><p>Bring your campaigns, audience, and ideas together in one calm, focused workspace.</p><div className="auth-preview-card"><div className="auth-preview-head"><span><i>✳</i> Your workspace</span><span className="auth-preview-live"><i></i> READY WHEN YOU ARE</span></div><div className="auth-preview-title">A better way to move work forward.</div><div className="auth-preview-line"></div><div className="auth-preview-line short"></div><div className="auth-preview-items"><div><span className="auth-preview-icon lavender">✉</span><span><b>Campaigns</b><small>Plan your next send</small></span><i>↗</i></div><div><span className="auth-preview-icon peach">♧</span><span><b>Your audience</b><small>Keep every connection close</small></span><i>↗</i></div><div><span className="auth-preview-icon mint">✦</span><span><b>Insights</b><small>Learn as you go</small></span><i>↗</i></div></div></div><div className="auth-story-foot"><div className="auth-avatar-stack"><i>F</i><i>M</i><i>A</i></div><span><b>Make space for the meaningful.</b><small>One thoughtful step at a time.</small></span><span className="auth-story-spark">✳</span></div></div><div className="auth-story-bottom"><span>DESIGNED FOR FOCUS</span><span>BUILT FOR MOMENTUM</span><span>✳</span></div></section><section className="auth-form-side"><div className="auth-form-top"><span>Already have a workspace?</span><button type="button" onClick={()=>{const next=!registering;setRegistering(next);setError("");onChangeMode?.(next)}}>{registering?"Sign in":"Create account"} <span>↗</span></button></div><div className="auth-card"><button type="button" className="auth-back-button" onClick={onBack}>← Back to home</button><div className="auth-mobile-brand"><i>✳</i> orbit<span>.campaigns</span></div><div className="auth-form-eyebrow"><span>{registering?"YOUR NEXT CHAPTER":"GOOD TO HAVE YOU BACK"}</span><i>✦</i></div><h1>{registering?"Create your workspace":"Welcome back"}</h1><p className="muted-copy">{registering?"A few details and you’ll be ready to bring your marketing together.":"Sign in to pick up where your marketing left off."}</p><form onSubmit={submit} className="stack auth-form">{registering&&<label>Name<span className="auth-input-wrap"><i>♙</i><input autoComplete="name" placeholder="Your name" required minLength="2" maxLength="120" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></span></label>}<label>Email<span className="auth-input-wrap"><i>✉</i><input autoComplete="email" placeholder="you@company.com" required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></span></label><label>Password<span className="auth-input-wrap"><i>⌑</i><input autoComplete={registering?"new-password":"current-password"} placeholder={registering?"At least 8 characters":"Enter your password"} required minLength="8" maxLength="128" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></span></label>{registering&&<p className="auth-password-hint"><i>✓</i> Use at least 8 characters for a stronger password.</p>}{error&&<div className="alert" role="alert">{error}</div>}<button className="primary wide auth-submit" disabled={busy}>{busy?<><span className="auth-spinner"></span>{registering?"Creating your workspace…":"Signing you in…"}</>:<>{registering?"Create workspace":"Sign in"} <span>↗</span></>}</button></form><div className="auth-form-switch">{registering?"Already have an account?":"New to Orbit Campaigns?"} <button type="button" aria-label={registering?"Already have an account? Sign in":"New here? Create an account"} onClick={()=>{const next=!registering;setRegistering(next);setError("");onChangeMode?.(next)}}>{registering?"Sign in":"Create an account"}</button></div><div className="auth-security-note"><i>♧</i><span>Your workspace is private and protected.</span></div></div><div className="auth-form-bottom"><span>© Orbit Campaigns</span><span>Make room for better marketing.</span></div></section></main>}
function PublicHome({onGetStarted,onSignIn,onExplore}){
 const[menu,setMenu]=useState(false);
 const close=()=>setMenu(false);
 const Logo=()=> <><i className="home-logo-icon">✳</i><span>orbit<span className="home-logo-muted">.campaigns</span></span></>;
 return <div className="public-home" id="home">
  <header className="home-nav"><a className="home-brand" href="#home" aria-label="Orbit Campaigns home"><Logo/></a>
   <button className="home-menu" aria-label="Toggle menu" aria-expanded={menu} onClick={()=>setMenu(v=>!v)}>{menu?"×":"☰"}</button>
   <nav className={menu?"home-links open":"home-links"}><a href="#features" onClick={close}>Features</a><a href="#workflow" onClick={close}>How it works</a><a href="#why-orbit" onClick={close}>Why Orbit</a><div className="home-mobile-actions"><button className="home-login" onClick={()=>{close();onSignIn()}}>Sign in</button><button className="home-nav-cta" onClick={()=>{close();onGetStarted()}}>Get started <span>→</span></button></div></nav>
   <div className="home-nav-actions"><button className="home-login" onClick={onSignIn}>Sign in</button><button className="home-nav-cta" onClick={onGetStarted}>Get started <span>→</span></button></div>
  </header>
  <main>
   <section className="home-hero"><div className="home-hero-grid">
    <div className="home-hero-copy"><span className="home-kicker">✦ &nbsp; EMAIL MARKETING, MADE CLEARER</span><h1>Make room for <em>better</em> marketing.</h1><p>Campaigns, contact lists, templates, and insights — together in one thoughtful workspace. Spend less time juggling tools and more time creating messages that matter.</p>
     <div className="home-hero-actions"><button className="home-primary" onClick={onGetStarted}>Get started <span>↗</span></button><a className="home-watch" href="#workflow"><i>▶</i> See how it works</a></div>
     <div className="home-assurance"><i>✓</i> The essentials for every step of your campaign.</div>
    </div>
    <div className="home-product-visual" aria-label="Illustration of the Orbit Campaigns dashboard">
     <div className="home-product-halo"></div><div className="home-dashboard">
      <div className="home-window-top"><span className="home-dots"><i></i><i></i><i></i></span><b>orbit.campaigns</b><i className="home-avatar">O</i></div>
      <div className="home-dashboard-body"><aside className="home-mini-side"><b>✳</b><span className="active">▦ <i>Overview</i></span><span>◉ <i>Campaigns</i></span><span>♧ <i>Audience</i></span><span>▧ <i>Templates</i></span><span>↗ <i>Analytics</i></span></aside>
       <div className="home-mini-main"><small>YOUR WORKSPACE</small><h3>Good things are in motion.</h3><p>Your marketing, all in one place.</p>
        <div className="home-mini-stats"><article><i>♧</i><small>Total audience</small><b>Stay connected</b><span>Contact lists</span></article><article><i>✦</i><small>Campaigns</small><b>Keep moving</b><span>Plan and create</span></article></div>
        <div className="home-mini-chart"><div><b>Campaign activity</b><span>•••</span></div><section>{Array.from({length:10},(_,i)=><i key={i} style={{height:[25,40,32,56,43,71,59,80,62,91][i]+"%"}}/>)}</section><footer><span>Plan</span><span>Create</span><span>Connect</span><span>Learn</span></footer></div>
       </div>
      </div>
     </div>
     <div className="home-float top"><i>✉</i><span><b>A message ready to shape</b><small>Your next campaign starts here</small></span><em>DRAFT</em></div>
     <div className="home-float bottom"><div className="home-people"><i>A</i><i>J</i><i>M</i></div><span><b>Every contact matters</b><small>Keep your audience in reach</small></span><em>✦</em></div>
    </div>
   </div><div className="home-hero-footer"><span>ONE WORKSPACE</span><i></i><span>MORE CLARITY</span><i></i><span>BETTER CONNECTIONS</span></div></section>
   <section className="home-capabilities"><p>All your campaign essentials, together</p><div><span>◉ &nbsp; Campaigns</span><span>♧ &nbsp; Audiences</span><span>▧ &nbsp; Templates</span><span>↗ &nbsp; Analytics</span></div></section>
   <section className="home-section" id="features"><div className="home-intro"><small>A CLEARER WAY TO WORK</small><h2>Everything you need to send with <em>confidence.</em></h2><p>A focused set of tools for the everyday work behind a great campaign — thoughtfully organized, without the unnecessary clutter.</p></div>
    <div className="home-feature-grid">
     <article className="home-feature violet"><i>◉</i><small>01 / PLAN</small><h3>Campaigns, with a plan</h3><p>Draft your message, choose your audience, and organize campaign timing from one place.</p><a href="#workflow">Plan a campaign <b>→</b></a><div className="home-decor bars"><i></i><i></i><i></i></div></article>
     <article className="home-feature peach"><i>♧</i><small>02 / CONNECT</small><h3>Know your audience</h3><p>Keep lists and contact details together, with subscription status close at hand.</p><a href="#workflow">Organize contacts <b>→</b></a><div className="home-decor bubbles"><i>A</i><i>J</i><i>M</i></div></article>
     <article className="home-feature blue"><i>▧</i><small>03 / CREATE</small><h3>Reuse what works</h3><p>Build a library of reusable email templates and start messages from a stronger place.</p><a href="#workflow">Explore templates <b>→</b></a><div className="home-decor sheets"><i></i><i></i><i></i></div></article>
     <article className="home-feature green"><i>↗</i><small>04 / IMPROVE</small><h3>See the bigger picture</h3><p>Review delivery and engagement data to understand how your campaigns perform.</p><a href="#workflow">Understand results <b>→</b></a><div className="home-decor bars"><i></i><i></i><i></i></div></article>
    </div>
   </section>
   <section className="home-workflow" id="workflow"><div className="home-workflow-inner"><div className="home-work-copy"><small>FROM IDEA TO INSIGHT</small><h2>A calmer workflow. <em>A clearer next step.</em></h2><p>Bring the moving pieces together and save your energy for making a meaningful connection.</p><button className="home-primary" onClick={onExplore}>Explore the workspace <span>↗</span></button></div>
    <div className="home-steps"><article><i>01</i><div><b>Bring your audience together</b><p>Organize contact lists and keep details easy to find.</p></div><span>↘</span></article><article><i>02</i><div><b>Create a thoughtful message</b><p>Write campaigns and build from reusable templates.</p></div><span>↘</span></article><article><i>03</i><div><b>Learn from every send</b><p>Review delivery and engagement data to guide what comes next.</p></div><span>✓</span></article></div>
   </div></section>
   <section className="home-why" id="why-orbit"><div className="home-orbit-art"><div><i>✳</i><b></b><b></b><b></b></div><span className="home-art-tag left">Less tool switching</span><span className="home-art-tag right">More room to think</span></div>
    <div className="home-why-copy"><small>SPACE TO DO YOUR BEST WORK</small><h2>Your tools should help your ideas <em>move forward.</em></h2><p>When campaigns, audiences, and templates live in one organized experience, it’s easier to stay focused and keep your marketing moving.</p>
     <div className="home-benefits"><div><i>✓</i><span><b>Clarity over clutter</b><small>A focused layout that helps you find what you need.</small></span></div><div><i>✓</i><span><b>Your workflow, connected</b><small>The core campaign tools, designed to work together.</small></span></div><div><i>✓</i><span><b>Insights within reach</b><small>Delivery and engagement reporting when you need it.</small></span></div></div>
    </div></section>
   <section className="home-final" id="get-started"><div className="home-final-orbit one"></div><div className="home-final-orbit two"></div><div className="home-final-copy"><i>✦</i><small>YOUR NEXT CAMPAIGN STARTS HERE</small><h2>Make your next message <em>your best one yet.</em></h2><p>Bring your marketing essentials together and make room for better connections.</p><button className="home-primary light" onClick={onGetStarted}>Get started <span>↗</span></button></div></section>
  </main>
  <footer className="home-footer"><a className="home-brand" href="#home"><Logo/></a><p>A clearer place for your campaign work.</p><nav><a href="#features">Features</a><a href="#workflow">How it works</a><button onClick={onSignIn}>Sign in</button></nav><small>© {new Date().getFullYear()} Orbit Campaigns</small></footer>
 </div>;
}
function App(){
 const[user,setUser]=useState(null),[view,setView]=useState("Overview"),[loading,setLoading]=useState(true),[error,setError]=useState(""),[route,setRoute]=useState(()=>currentRoute());
 function navigate(path,replace=false){if(window.location.pathname!==path)window.history[replace?"replaceState":"pushState"]({}, "", path);setRoute(path);setError("");window.scrollTo({top:0,behavior:"auto"});}
 useEffect(()=>{const onPopState=()=>setRoute(currentRoute());window.addEventListener("popstate",onPopState);return()=>window.removeEventListener("popstate",onPopState)},[]);
 useEffect(()=>{if(!loading&&route==="/app"&&!user)navigate("/login",true)},[loading,route,user]);
 useEffect(()=>{if(DEMO_MODE){setLoading(false);return}api("/api/v1/auth/me").then(setUser).catch(()=>{}).finally(()=>setLoading(false))},[]);
 if(loading)return <div className="loading-screen">Loading workspace…</div>;
 const completeLogin=(authenticatedUser)=>{setUser(authenticatedUser);navigate("/app")};
 if(route==="/login"||route==="/register")return <AuthPage onLogin={completeLogin} initialRegistering={route==="/register"} onBack={()=>navigate("/")} onChangeMode={(next)=>navigate(next?"/register":"/login")}/>;
 if(route!=="/app")return <PublicHome onGetStarted={()=>navigate(user?"/app":"/register")} onSignIn={()=>navigate(user?"/app":"/login")} onExplore={()=>navigate(user?"/app":"/register")}/>;
 if(!user)return <AuthPage onLogin={completeLogin} initialRegistering={false} onBack={()=>navigate("/")}/>;
 async function logout(){try{await api("/api/v1/auth/logout",{method:"POST"});setUser(null);navigate("/")}catch(e){setError(e.message)}}
 return <main className="app"><aside className="sidebar"><div className="brand"><i>✳</i> orbit<span>.campaigns</span></div><small className="label">WORKSPACE</small><nav>{["Overview","Campaigns","Templates","Audience","Analytics"].map(item=><button key={item} className={view===item?"active":""} aria-label={item} title={item} onClick={()=>{setView(item);setError("")}}><span className="nav-icon" aria-hidden="true">{item==="Overview"?"▦":item==="Campaigns"?"◉":item==="Templates"?"▧":item==="Audience"?"♧":"▤"}</span><span className="nav-label">{item}</span></button>)}</nav><small className="label manage">MANAGE</small><nav><button aria-label="Settings" title="Settings" onClick={()=>setView("Settings")}><span className="nav-icon" aria-hidden="true">⚙</span><span className="nav-label">Settings</span></button></nav><div className="side-bottom"><div className="help">ⓘ　<div><b>Need a hand?</b><small>Use the setup cards in Overview</small></div></div><div className="user"><b>{user.name[0].toUpperCase()}</b><span>{user.name}<small>{user.email}</small></span><button className="logout" onClick={logout}>↪</button></div></div></aside><section className="main"><header><span>Workspace　/　{view}</span><div><span className="connected">● Connected</span><b>{user.name[0].toUpperCase()}</b></div></header>{view==="Overview"&&<Overview setView={setView} setError={setError}/>} {view==="Campaigns"&&<Campaigns setError={setError}/>} {view==="Templates"&&<Templates setError={setError}/>} {view==="Audience"&&<Audience setError={setError}/>} {view==="Analytics"&&<Analytics setError={setError}/>} {view==="Settings"&&<Settings/>}{error&&<div className="toast">{error}</div>}</section></main>
}

function Stat({title,value,note,icon}){return <article className="stat"><div>{title}<i>{icon}</i></div><strong>{value}</strong><small>{note}</small></article>}
function Status({value}){return <span className={"status "+value}>{value}</span>}
function Overview({setView,setError}){const[summary,setSummary]=useState(null),[campaigns,setCampaigns]=useState([]),[busy,setBusy]=useState(true);useEffect(()=>{Promise.all([api("/api/v1/dashboard/summary"),api("/api/v1/campaigns")]).then(([s,c])=>{setSummary(s);setCampaigns(c)}).catch(e=>setError(e.message)).finally(()=>setBusy(false))},[]);const s=summary||{audience_contacts:0,active_campaigns:0,scheduled_campaigns:0,sent_deliveries:0};return <div className="content"><div className="welcome"><div><div className="eyebrow">CAMPAIGN WORKSPACE</div><h1>Good morning <em>✳</em></h1><p>Here's what's happening with your campaigns today.</p></div><button className="primary" onClick={()=>setView("Campaigns")}>＋ Create campaign</button></div><div className="stats"><Stat title="Total audience" value={s.audience_contacts} note="Contacts across your lists" icon="♧"/><Stat title="Active campaigns" value={s.active_campaigns} note="Scheduled or queued" icon="◉"/><Stat title="Scheduled" value={s.scheduled_campaigns} note="Upcoming campaigns" icon="◷"/><Stat title="Sent deliveries" value={s.sent_deliveries} note="SMTP-confirmed sends" icon="↗"/></div><div className="heading"><div><h2>Campaign activity</h2><p>Performance from stored delivery and tracking data.</p></div><button className="period" onClick={()=>setView("Analytics")}>View analytics →</button></div><div className="chart empty-chart"><div className="chart-icon">↗</div><b>{s.sent_deliveries?"Your campaign activity":"Your campaign story starts here"}</b><p>{s.sent_deliveries?"Open Analytics to review delivery and engagement totals.":"Create an audience and campaign to begin collecting real results."}</p><button className="secondary" onClick={()=>setView("Audience")}>Set up your audience</button></div><div className="lower"><article><div className="heading tight"><div><h2>Recent campaigns</h2><p>Your latest drafts and sends.</p></div><button className="link-button small" onClick={()=>setView("Campaigns")}>View all →</button></div>{busy?<div className="empty">Loading campaigns…</div>:campaigns.slice(0,3).map(c=><div className="list-row" key={c.id}><div><b>{c.name}</b><small>{c.audience_name||"Audience"} · {c.status}</small></div><Status value={c.status}/></div>)}{!busy&&!campaigns.length&&<div className="empty">No campaigns yet.</div>}</article><article><h2>Quick start</h2><p>Get your workspace ready.</p>{[[1,"Set up your audience","Create a list and add contacts.","Audience"],[2,"Create a campaign","Write a message and choose recipients.","Campaigns"],[3,"Review your results","Open Analytics after real deliveries.","Analytics"]].map(x=><button className="quick" key={x[0]} onClick={()=>setView(x[3])}><i>{x[0]}</i><b>{x[1]}<small>{x[2]}</small></b><span>→</span></button>)}</article></div></div>}
function Campaigns({setError}) {
  const [campaigns, setCampaigns] = useState([]);
  const [audiences, setAudiences] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshingReport, setRefreshingReport] = useState(false);
  const [reportPollingTimedOut, setReportPollingTimedOut] = useState(false);
  const [pollCycle, setPollCycle] = useState(0);
  const [form, setForm] = useState({name:"",audience_id:"",subject:"",body_html:"",scheduled_at:""});

  async function load() {
    setLoading(true);
    try {
      const [c, a, t] = await Promise.all([
        api("/api/v1/campaigns"),
        api("/api/v1/audiences"),
        api("/api/v1/templates"),
      ]);
      setCampaigns(c);
      setAudiences(a);
      setTemplates(t);
      if (!form.audience_id && a[0]) setForm(f => ({...f, audience_id:a[0].id}));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const activeReportCampaignId = report?.campaign?.id;
  const reportHasQueuedDeliveries = report?.latest_run_status === "queued" && report?.summary?.queued > 0;

  // Execute only enqueues durable work. Refresh the report while the worker
  // processes it, but cap polling so a development setup without SMTP does not
  // keep making requests indefinitely.
  useEffect(() => {
    if (!activeReportCampaignId || !reportHasQueuedDeliveries) {
      setRefreshingReport(false);
      setReportPollingTimedOut(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timer;
    setRefreshingReport(true);
    setReportPollingTimedOut(false);

    async function refreshReport() {
      if (cancelled) return;
      attempts += 1;
      try {
        const next = await api("/api/v1/campaigns/" + activeReportCampaignId + "/report");
        if (cancelled) return;
        setReport(next);
        api("/api/v1/campaigns").then(items => {
          if (!cancelled) setCampaigns(items);
        }).catch(() => {});

        if (next.latest_run_status === "queued" && next.summary.queued > 0 && attempts < 20) {
          timer = window.setTimeout(refreshReport, 3000);
        } else {
          setRefreshingReport(false);
          if (next.latest_run_status === "queued" && next.summary.queued > 0) {
            setReportPollingTimedOut(true);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setRefreshingReport(false);
        }
      }
    }

    timer = window.setTimeout(refreshReport, 2000);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeReportCampaignId, report?.latest_run_status, report?.summary?.queued, reportHasQueuedDeliveries, pollCycle, setError]);

  function newCampaign() {
    setSelected(null);
    setEditorOpen(true);
    setReport(null);
    setForm({name:"",audience_id:audiences[0]?.id||"",subject:"",body_html:"",scheduled_at:""});
  }

  function edit(c) {
    setSelected(c);
    setEditorOpen(true);
    setReport(null);
    setForm({
      name:c.name,
      audience_id:c.audience_id,
      subject:c.subject,
      body_html:c.body_html,
      scheduled_at:c.scheduled_at ? toLocalDateTime(c.scheduled_at) : "",
    });
  }

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api(selected?.id ? "/api/v1/campaigns/" + selected.id : "/api/v1/campaigns", {
        method:selected?.id ? "PATCH" : "POST",
        body:JSON.stringify({...form,scheduled_at:form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null}),
      });
      await load();
      setSelected(null);
      setEditorOpen(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function execute(c) {
    try {
      setReport(await api("/api/v1/campaigns/" + c.id + "/execute", {method:"POST"}));
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function showReport(c) {
    try {
      setReport(await api("/api/v1/campaigns/" + c.id + "/report"));
      setSelected(c);
      setEditorOpen(false);
    } catch (e) {
      setError(e.message);
    }
  }

  async function refreshReportNow() {
    if (!activeReportCampaignId) return;
    try {
      const next = await api("/api/v1/campaigns/" + activeReportCampaignId + "/report");
      setReport(next);
      setReportPollingTimedOut(false);
      if (next.latest_run_status === "queued" && next.summary.queued > 0) {
        setPollCycle(cycle => cycle + 1);
      }
    } catch (e) {
      setError(e.message);
    }
  }

  return <div className="content">
    <div className="page-title">
      <div>
        <div className="eyebrow">WORKSPACE</div>
        <h1>Campaigns</h1>
        <p>Draft, schedule and execute campaigns for your audience.</p>
      </div>
      <button className="primary" onClick={newCampaign}>＋ New campaign</button>
    </div>
    {editorOpen && report === null && <CampaignEditor form={form} setForm={setForm} save={save} saving={saving} cancel={() => {setSelected(null);setEditorOpen(false);}} editing={selected} audiences={audiences} templates={templates}/>}
    {(!editorOpen || report) && <div className="panel table-panel">
      {loading ? <div className="empty">Loading campaigns…</div> : campaigns.length ? campaigns.map(c => {
        const retryable = c.status === "failed" || c.status === "partial";
        const editable = ["draft", "scheduled", "failed", "partial", "completed"].includes(c.status);
        const executable = editable;
        return <div className="campaign-row" key={c.id}>
          <div><b>{c.name}</b><small>{c.subject} · {c.audience_name}</small></div>
          <Status value={c.status}/>
          <div className="row-actions">
            {editable && <button className="secondary small-btn" onClick={() => edit(c)}>Edit</button>}
            <button className="secondary small-btn" onClick={() => showReport(c)}>Report</button>
            {executable && <button className="primary small-btn" onClick={() => execute(c)}>{retryable ? "Retry" : "Execute"}</button>}
          </div>
        </div>;
      }) : <div className="empty big">No campaigns yet. Start with a campaign for one of your audiences.</div>}
    </div>}
    {report && <div className="panel report-card">
      <div>
        <b>{report.campaign.name} report</b>
        <p aria-live="polite">Latest run: {report.latest_run_status || "none"}{refreshingReport ? " · Refreshing delivery status…" : ""}</p>
        <p className="muted-copy">Totals include delivery attempts across runs, including retries.</p>
        {report.latest_run_status === "queued" && <p className="muted-copy">Deliveries are queued for the background worker. The report refreshes automatically while processing is active.</p>}
        {reportPollingTimedOut && reportHasQueuedDeliveries && <p className="muted-copy">Still queued after automatic refresh. Use Refresh report to check again; SMTP or the worker may need attention.</p>}
        <button className="secondary small-btn" type="button" onClick={refreshReportNow}>Refresh report</button>
      </div>
      <div className="mini-stats">{Object.entries({Attempts:report.summary.total,Queued:report.summary.queued,Sent:report.summary.sent,Failed:report.summary.failed,Skipped:report.summary.skipped,Opened:report.summary.opened,Clicked:report.summary.clicked}).map(([k,v])=><div key={k}><strong>{v}</strong><small>{k}</small></div>)}</div>
    </div>}
  </div>;
}

function CampaignEditor({form,setForm,save,saving,cancel,editing,audiences,templates}){return <form className="panel editor" onSubmit={save}><div className="heading tight"><div><div className="eyebrow">CAMPAIGN BUILDER</div><h2>{editing?"Edit campaign":"New campaign"}</h2><p>Saved to the campaign service.</p></div><button type="button" className="period" onClick={cancel}>Cancel</button></div>{editing && ["failed","partial"].includes(editing.status) && <p className="campaign-retry-note">This campaign has previous delivery results. Retry sends only failed recipients; contacts already marked sent will not receive another copy. Changes you save apply to the retry.</p>}{templates.length>0&&<label>Start from template<select defaultValue="" onChange={e=>{const template=templates.find(t=>t.id===e.target.value);if(template)setForm({...form,subject:template.subject,body_html:template.body_html})}}><option value="">Choose a saved template</option>{templates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>}<div className="form-grid"><label>Campaign name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Audience<select required value={form.audience_id} onChange={e=>setForm({...form,audience_id:e.target.value})}>{audiences.map(a=><option key={a.id} value={a.id}>{a.name} · {a.contact_count} contacts</option>)}</select></label><label>Subject<input required value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/></label><label>Schedule<input type="datetime-local" value={form.scheduled_at} onChange={e=>setForm({...form,scheduled_at:e.target.value})}/></label></div><label>Message HTML<textarea required rows="9" value={form.body_html} onChange={e=>setForm({...form,body_html:e.target.value})}/></label><div className="form-actions"><span className="hint">Personalize with <code>{'{{first_name}}'}</code>, <code>{'{{last_name}}'}</code>, <code>{'{{full_name}}'}</code>, or <code>{'{{email}}'}</code>. The API queues delivery for the background worker; production requires SMTP configuration.</span><button className="primary" disabled={saving||!audiences.length}>{saving?"Saving…":"Save campaign"}</button></div></form>}
function Audience({setError}){const[audiences,setAudiences]=useState([]),[selected,setSelected]=useState(""),[contacts,setContacts]=useState([]),[name,setName]=useState(""),[contact,setContact]=useState({email:"",first_name:"",last_name:""}),[busy,setBusy]=useState(false);async function load(){try{const a=await api("/api/v1/audiences");setAudiences(a);if(!selected&&a[0])setSelected(a[0].id)}catch(e){setError(e.message)}}useEffect(()=>{load()},[]);useEffect(()=>{let cancelled=false;if(!selected){setContacts([]);return()=>{cancelled=true}}api("/api/v1/audiences/"+selected+"/contacts").then(data=>{if(!cancelled)setContacts(data)}).catch(e=>{if(!cancelled)setError(e.message)});return()=>{cancelled=true}},[selected]);async function addAudience(e){e.preventDefault();setBusy(true);try{await api("/api/v1/audiences",{method:"POST",body:JSON.stringify({name})});setName("");await load()}catch(e){setError(e.message)}finally{setBusy(false)}}async function addContact(e){e.preventDefault();setBusy(true);try{await api("/api/v1/audiences/"+selected+"/contacts",{method:"POST",body:JSON.stringify(contact)});setContact({email:"",first_name:"",last_name:""});setContacts(await api("/api/v1/audiences/"+selected+"/contacts"));await load()}catch(e){setError(e.message)}finally{setBusy(false)}}async function toggle(c){try{const action=c.unsubscribed_at?"subscribe":"unsubscribe";await api("/api/v1/audiences/"+selected+"/contacts/"+c.id+"/"+action,{method:"POST"});setContacts(await api("/api/v1/audiences/"+selected+"/contacts"))}catch(e){setError(e.message)}}return <div className="content"><div className="page-title"><div><div className="eyebrow">WORKSPACE</div><h1>Audience</h1><p>Manage lists and contact subscription status.</p></div></div><div className="audience-grid"><article className="panel"><div className="heading tight"><div><h2>Audiences</h2><p>Each list belongs to this workspace.</p></div></div><form className="inline-form" onSubmit={addAudience}><input required placeholder="New audience name" value={name} onChange={e=>setName(e.target.value)}/><button className="primary" disabled={busy}>Add</button></form><div className="audience-list">{audiences.map(a=><button className={selected===a.id?"audience-item selected":"audience-item"} key={a.id} onClick={()=>setSelected(a.id)}><span><b>{a.name}</b><small>{a.contact_count} contacts</small></span><span>→</span></button>)}{!audiences.length&&<div className="empty">No audiences yet.</div>}</div></article><article className="panel"><div className="heading tight"><div><h2>{audiences.find(a=>a.id===selected)?.name||"Contacts"}</h2><p>Unsubscribed contacts are excluded from execution.</p></div></div>{selected&&<form className="contact-form" onSubmit={addContact}><input required type="email" placeholder="Email" value={contact.email} onChange={e=>setContact({...contact,email:e.target.value})}/><input placeholder="First name" value={contact.first_name} onChange={e=>setContact({...contact,first_name:e.target.value})}/><input placeholder="Last name" value={contact.last_name} onChange={e=>setContact({...contact,last_name:e.target.value})}/><button className="primary" disabled={busy}>Add contact</button></form>}<div className="contact-list">{contacts.map(c=><div className="contact-row" key={c.id}><div><b>{[c.first_name,c.last_name].filter(Boolean).join(" ")||"Unnamed contact"}</b><small>{c.email}</small></div><button className="secondary small-btn" onClick={()=>toggle(c)}>{c.unsubscribed_at?"Subscribe":"Unsubscribe"}</button></div>)}{selected&&!contacts.length&&<div className="empty">This audience has no contacts yet.</div>}</div></article></div></div>}
function Analytics({setError}){const[data,setData]=useState(null);useEffect(()=>{api("/api/v1/analytics/overview").then(setData).catch(e=>setError(e.message))},[]);const d=data||{deliveries:0,sent:0,failed:0,opened:0,clicked:0},openRate=d.sent?Math.round(d.opened/d.sent*100):0,clickRate=d.sent?Math.round(d.clicked/d.sent*100):0;return <div className="content"><div className="page-title"><div><div className="eyebrow">REPORTING</div><h1>Analytics</h1><p>Aggregates from stored delivery and tracking events.</p></div></div><div className="analytics-grid"><Stat title="Deliveries" value={d.deliveries} note="All delivery records" icon="◌"/><Stat title="Sent" value={d.sent} note="SMTP-confirmed sends" icon="↗"/><Stat title="Opened" value={d.opened} note={openRate+"% of sent"} icon="◉"/><Stat title="Clicked" value={d.clicked} note={clickRate+"% of sent"} icon="⌁"/></div><div className="panel analytics-note"><h2>How this works</h2><p>Metrics come from campaign delivery and event records. No sample or synthetic metrics are inserted.</p>{!d.deliveries&&<div className="empty big">Once a campaign has sent deliveries or received tracking events, this page will populate.</div>}</div></div>}
function Templates({setError}){
 const[templates,setTemplates]=useState([]),[form,setForm]=useState({name:"",subject:"",body_html:""}),[editing,setEditing]=useState(null),[editorOpen,setEditorOpen]=useState(false),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[deleteId,setDeleteId]=useState("");
 async function load(){setLoading(true);try{setTemplates(await api("/api/v1/templates"))}catch(e){setError(e.message)}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 function newTemplate(){setEditing(null);setForm({name:"",subject:"",body_html:""});setEditorOpen(true);setDeleteId("")}
 function editTemplate(t){setEditing(t);setForm({name:t.name,subject:t.subject,body_html:t.body_html});setEditorOpen(true);setDeleteId("")}
 async function save(e){e.preventDefault();setSaving(true);try{await api(editing?"/api/v1/templates/"+editing.id:"/api/v1/templates",{method:editing?"PATCH":"POST",body:JSON.stringify(form)});await load();setEditing(null);setEditorOpen(false)}catch(e){setError(e.message)}finally{setSaving(false)}}
 async function removeTemplate(t){if(deleteId!==t.id){setDeleteId(t.id);return}try{await api("/api/v1/templates/"+t.id,{method:"DELETE"});setDeleteId("");await load()}catch(e){setError(e.message)}}
 return <div className="content"><div className="page-title"><div><div className="eyebrow">CONTENT LIBRARY</div><h1>Templates</h1><p>Save reusable email content and apply it when building a campaign.</p></div><button className="primary" onClick={newTemplate}>＋ New template</button></div>
 {editorOpen&&<form className="panel editor" onSubmit={save}><div className="heading tight"><div><div className="eyebrow">TEMPLATE BUILDER</div><h2>{editing?"Edit template":"New template"}</h2><p>Templates are private to your account.</p></div><button type="button" className="period" onClick={()=>{setEditorOpen(false);setEditing(null)}}>Cancel</button></div><div className="form-grid"><label>Template name<input required maxLength="140" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Template subject<input required maxLength="200" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/></label></div><label>Template HTML<textarea required maxLength="200000" rows="9" value={form.body_html} onChange={e=>setForm({...form,body_html:e.target.value})}/></label><div className="form-actions"><span className="hint">Template content is copied into a campaign; changing the template will not change saved campaigns.</span><button className="primary" disabled={saving}>{saving?"Saving…":"Save template"}</button></div></form>}
 <div className="panel table-panel">{loading?<div className="empty">Loading templates…</div>:templates.length?templates.map(t=><div className="campaign-row" key={t.id}><div><b>{t.name}</b><small>{t.subject}</small></div><div className="row-actions"><button className="secondary small-btn" onClick={()=>editTemplate(t)}>Edit</button><button className="secondary small-btn" onClick={()=>removeTemplate(t)}>{deleteId===t.id?"Confirm delete":"Delete"}</button>{deleteId===t.id&&<button className="period small-btn" onClick={()=>setDeleteId("")}>Cancel</button>}</div></div>):<div className="empty big">No templates yet. Save a reusable message to speed up campaign creation.</div>}</div></div>
}
function Settings(){return <div className="content"><div className="page-title"><div><div className="eyebrow">MANAGE</div><h1>Settings</h1><p>Runtime delivery configuration remains server-side so credentials never live in the browser.</p></div></div><div className="panel settings-note"><h2>Delivery configuration</h2><p>SMTP host, credentials and cookie security are controlled by backend environment variables.</p></div></div>}
createRoot(document.getElementById("root")).render(<App/>);