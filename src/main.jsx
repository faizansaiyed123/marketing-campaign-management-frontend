import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function App() {
  return <main className="app">
    <aside className="sidebar"><div className="brand"><i>✳</i> orbit<span>.campaigns</span></div>
      <div className="workspace"><b>S</b><span>Studio workspace<small>Free plan</small></span>⌄</div>
      <small className="label">WORKSPACE</small>
      <nav><a className="active">▦　Overview</a><a>◉　Campaigns</a><a>♧　Audience</a><a>▤　Analytics</a></nav>
      <small className="label manage">MANAGE</small><nav><a>⚙　Settings</a></nav>
      <div className="side-bottom"><div className="help">ⓘ　<b>Need a hand?<small>Visit help center</small></b></div><div className="user"><b>F</b><span>Faizan Saiyed<small>Workspace owner</small></span></div></div>
    </aside>
    <section className="main"><header><span>Workspace　/　Overview</span><div>⌕　♧　<b>F</b></div></header>
      <div className="welcome"><div><small>WEDNESDAY, SEPTEMBER 30, 2026</small><h1>Good morning, Faizan <em>✳</em></h1><p>Here's what's happening with your campaigns today.</p></div><button>＋ Create campaign</button></div>
      <div className="stats">{[["Total audience","—","Contacts across your lists","♧"],["Active campaigns","0","Currently running","◉"],["Campaign engagement","—","Average open rate","↗"],["Scheduled","0","Upcoming sends","◷"]].map((s,i)=><article key={i}><div>{s[0]}<i>{s[3]}</i></div><strong>{s[1]}</strong><small>{s[2]}</small><footer>{["No audience data yet","Ready when you are","No performance data yet","Nothing on the calendar"][i]}</footer></article>)}</div>
      <div className="heading"><div><h2>Campaign activity</h2><p>Track your campaign performance over time.</p></div><button className="period">Last 30 days　⌄</button></div>
      <div className="chart"><div className="chart-icon">↗</div><b>Your campaign story starts here</b><p>Once you launch a campaign, your activity and results will show up here.</p><button className="secondary">Create your first campaign</button></div>
      <div className="lower"><article><div className="heading"><div><h2>Recent campaigns</h2><p>Your latest campaign drafts and sends.</p></div><a>View all →</a></div><div className="empty">◉　<b>No campaigns yet<small>Create a campaign to see it listed here.</small></b></div></article>
      <article><h2>Quick start</h2><p>Get your workspace ready.</p>{["Set up your audience|Import or add your contacts.","Create a campaign|Choose a goal and draft your message.","Review your results|Understand what resonates."].map((s,i)=><div className="quick" key={i}><i>{i+1}</i><b>{s.split("|")[0]}<small>{s.split("|")[1]}</small></b><span>→</span></div>)}</article></div>
    </section>
  </main>;
}
createRoot(document.getElementById("root")).render(<App />);
