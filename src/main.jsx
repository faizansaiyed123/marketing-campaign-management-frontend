import React,{useEffect,useState}from"react";
import{createRoot}from"react-dom/client";
import"./style.css";
const API=(import.meta.env.VITE_API_URL||"").replace(/\/+$/,"");
function toLocalDateTime(iso){if(!iso)return"";const d=new Date(iso);const p=n=>String(n).padStart(2,"0");return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`}
async function api(path,options={}){if(!API)throw new Error("VITE_API_URL is not configured");const r=await fetch(API+path,{credentials:"include",headers:options.body?{"Content-Type":"application/json",...(options.headers||{})}:options.headers,...options});if(r.status===204)return null;let d=null;try{d=await r.json()}catch{}if(!r.ok){const error=new Error(d?.detail||"Something went wrong");error.status=r.status;throw error}return d}
function AuthPage({onLogin}){const[registering,setRegistering]=useState(false),[form,setForm]=useState({name:"",email:"",password:""}),[busy,setBusy]=useState(false),[error,setError]=useState("");async function submit(e){e.preventDefault();setBusy(true);setError("");try{onLogin(await api(registering?"/api/v1/auth/register":"/api/v1/auth/login",{method:"POST",body:JSON.stringify(form)}))}catch(e){setError(e.message)}finally{setBusy(false)}}return <div className="auth-shell"><div className="auth-card"><div className="brand centered"><i>✳</i> orbit<span>.campaigns</span></div><div className="eyebrow">CAMPAIGN WORKSPACE</div><h1>{registering?"Create your workspace":"Welcome back"}</h1><p className="muted-copy">{registering?"Start organizing campaigns and audiences in one place.":"Sign in to manage campaigns and see performance."}</p><form onSubmit={submit} className="stack">{registering&&<label>Name<input required minLength="2" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>}<label>Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>Password<input required minLength="8" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>{error&&<div className="alert">{error}</div>}<button className="primary wide" disabled={busy}>{busy?"Working…":registering?"Create workspace":"Sign in"}</button></form><button className="link-button" onClick={()=>{setRegistering(!registering);setError("")}}>{registering?"Already have an account? Sign in":"New here? Create an account"}</button></div></div>}
function App(){const[user,setUser]=useState(null),[view,setView]=useState("Overview"),[loading,setLoading]=useState(true),[error,setError]=useState(""),[bootError,setBootError]=useState("");useEffect(()=>{api("/api/v1/auth/me").then(setUser).catch(e=>{if(e.status!==401)setBootError(e.message)}).finally(()=>setLoading(false))},[]);if(loading)return <div className="loading-screen">Loading workspace…</div>;if(bootError)return <div className="loading-screen"><div className="auth-card"><h2>Workspace unavailable</h2><p className="muted-copy">{bootError}. Check the API URL and backend service, then refresh.</p></div></div>;if(!user)return <AuthPage onLogin={setUser}/>;async function logout(){try{await api("/api/v1/auth/logout",{method:"POST"});setUser(null)}catch(e){setError(e.message)}}return <main className="app"><aside className="sidebar"><div className="brand"><i>✳</i> orbit<span>.campaigns</span></div><div className="workspace"><b>{user.name[0].toUpperCase()}</b><span>Studio workspace<small>Active workspace</small></span>⌄</div><small className="label">WORKSPACE</small><nav>{["Overview","Campaigns","Templates","Audience","Analytics"].map(item=><button key={item} className={view===item?"active":""} aria-label={item} title={item} onClick={()=>{setView(item);setError("")}}><span className="nav-icon" aria-hidden="true">{item==="Overview"?"▦":item==="Campaigns"?"◉":item==="Templates"?"▧":item==="Audience"?"♧":"▤"}</span><span className="nav-label">{item}</span></button>)}</nav><small className="label manage">MANAGE</small><nav><button aria-label="Settings" title="Settings" onClick={()=>setView("Settings")}><span className="nav-icon" aria-hidden="true">⚙</span><span className="nav-label">Settings</span></button></nav><div className="side-bottom"><div className="help">ⓘ　<div><b>Need a hand?</b><small>Use the setup cards in Overview</small></div></div><div className="user"><b>{user.name[0].toUpperCase()}</b><span>{user.name}<small>{user.email}</small></span><button className="logout" onClick={logout}>↪</button></div></div></aside><section className="main"><header><span>Workspace　/　{view}</span><div><span className="connected">● Connected</span><b>{user.name[0].toUpperCase()}</b></div></header>{view==="Overview"&&<Overview setView={setView} setError={setError}/>} {view==="Campaigns"&&<Campaigns setError={setError}/>} {view==="Templates"&&<Templates setError={setError}/>} {view==="Audience"&&<Audience setError={setError}/>} {view==="Analytics"&&<Analytics setError={setError}/>} {view==="Settings"&&<Settings/>}{error&&<div className="toast">{error}</div>}</section></main>}
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
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timer;
    setRefreshingReport(true);

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
  }, [activeReportCampaignId, report?.latest_run_status, report?.summary?.queued, reportHasQueuedDeliveries, setError]);

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
        const executable = c.status === "draft" || c.status === "scheduled" || retryable;
        return <div className="campaign-row" key={c.id}>
          <div><b>{c.name}</b><small>{c.subject} · {c.audience_name}</small></div>
          <Status value={c.status}/>
          <div className="row-actions">
            {(c.status === "draft" || c.status === "scheduled") && <button className="secondary small-btn" onClick={() => edit(c)}>Edit</button>}
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
        {report.latest_run_status === "queued" && <p className="muted-copy">Deliveries are queued for the background worker. The report refreshes automatically while processing is active.</p>}
      </div>
      <div className="mini-stats">{Object.entries({Recipients:report.summary.total,Queued:report.summary.queued,Sent:report.summary.sent,Failed:report.summary.failed,Opened:report.summary.opened,Clicked:report.summary.clicked}).map(([k,v])=><div key={k}><strong>{v}</strong><small>{k}</small></div>)}</div>
    </div>}
  </div>;
}

function CampaignEditor({form,setForm,save,saving,cancel,editing,audiences,templates}){return <form className="panel editor" onSubmit={save}><div className="heading tight"><div><div className="eyebrow">CAMPAIGN BUILDER</div><h2>{editing?"Edit campaign":"New campaign"}</h2><p>Saved to the campaign service.</p></div><button type="button" className="period" onClick={cancel}>Cancel</button></div>{templates.length>0&&<label>Start from template<select defaultValue="" onChange={e=>{const template=templates.find(t=>t.id===e.target.value);if(template)setForm({...form,subject:template.subject,body_html:template.body_html})}}><option value="">Choose a saved template</option>{templates.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></label>}<div className="form-grid"><label>Campaign name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Audience<select required value={form.audience_id} onChange={e=>setForm({...form,audience_id:e.target.value})}>{audiences.map(a=><option key={a.id} value={a.id}>{a.name} · {a.contact_count} contacts</option>)}</select></label><label>Subject<input required value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/></label><label>Schedule<input type="datetime-local" value={form.scheduled_at} onChange={e=>setForm({...form,scheduled_at:e.target.value})}/></label></div><label>Message HTML<textarea required rows="9" value={form.body_html} onChange={e=>setForm({...form,body_html:e.target.value})}/></label><div className="form-actions"><span className="hint">Execution queues deliveries for the background worker. Production requires SMTP configuration; without SMTP in development, deliveries stay queued.</span><button className="primary" disabled={saving||!audiences.length}>{saving?"Saving…":"Save campaign"}</button></div></form>}
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