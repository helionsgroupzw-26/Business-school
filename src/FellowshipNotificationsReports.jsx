import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {supabase,errorText} from './supabase';

const csvCell=value=>{
 const raw=value==null?'':String(value);
 const safe=/^[\s]*[=+@\-\t\r]/.test(raw)?"'"+raw:raw;
 return '"'+safe.replace(/"/g,'""')+'"';
};
const csvDownload=(rows,columns,name)=>{
 const lines=[columns.map(c=>csvCell(c.label)).join(','),...rows.map(r=>columns.map(c=>csvCell(c.get(r))).join(','))];
 const blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8;'});
 const href=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=href;a.download=name;a.click();
 setTimeout(()=>URL.revokeObjectURL(href),2000);
};
const date=v=>v?new Date(v).toLocaleDateString('en-GB'):'';
const COMMON=[
 {label:'Cohort',get:r=>r.cohort_name},
 {label:'Fellow name',get:r=>r.full_name},
 {label:'Joined',get:r=>date(r.joined_at)},
 {label:'Learning stage',get:r=>r.stage}
];
const REPORTS={
 register:{title:'Fellow register',cols:[...COMMON,{label:'Lessons completed',get:r=>r.completed_lessons},{label:'Total lessons',get:r=>r.total_lessons},{label:'Weeks passed',get:r=>r.weeks_passed}]},
 assessment:{title:'Assessment and quiz results',cols:[...COMMON,{label:'Weekly quizzes passed',get:r=>r.weeks_passed},{label:'Weekly quiz attempts',get:r=>r.quiz_attempts},{label:'Highest weekly quiz score (out of 10)',get:r=>r.highest_quiz_score},{label:'Final assessment approved on',get:r=>date(r.assessment_passed_at)}]},
 projects:{title:'Leadership project outcomes',cols:[...COMMON,{label:'Project status',get:r=>r.project_status},{label:'Participants reached',get:r=>r.participants_reached},{label:'Project assessment (%)',get:r=>r.project_score},{label:'Leadership award approved on',get:r=>date(r.leadership_completed_at)}]},
 graduates:{title:'Awarded graduates',filter:r=>r.fellow_certificate||r.leader_certificate,cols:[...COMMON,{label:'Financial Literacy Fellow certificate',get:r=>r.fellow_certificate},{label:'Certified Financial Leader certificate',get:r=>r.leader_certificate},{label:'Stage 1 approved on',get:r=>date(r.assessment_passed_at)},{label:'Stage 2 approved on',get:r=>date(r.leadership_completed_at)}]}
};
export function FellowshipReports({cohorts=[]}){
 const [cohort,setCohort]=useState('');
 const [busy,setBusy]=useState('');
 const [message,setMessage]=useState('');
 async function download(kind){
  setBusy(kind);setMessage('');
  const {data,error}=await supabase.rpc('admin_fellowship_report',{p_cohort_id:cohort||null});
  if(error){setBusy('');setMessage(errorText(error));return}
  const report=REPORTS[kind];
  const rows=(data||[]).filter(report.filter||(()=>true));
  if(!rows.length){setMessage('No records available for this report and cohort.');setBusy('');return}
  csvDownload(rows,report.cols,'Mari-Matters-'+kind+'-'+(cohort?'cohort-':'all-')+new Date().toISOString().slice(0,10)+'.csv');
  setBusy('');setMessage('Downloaded '+rows.length+' records. Open the CSV in Excel or Google Sheets.');
 }
 return <section className="panel admin-section">
  <span className="eyebrow">ADMINISTRATOR ONLY</span><h2>Downloadable fellowship reports</h2>
  <p>Export enrolled fellows, weekly quiz performance, reviewed community projects and valid certificate awards. Applications submitted through the separate Google Form are not included.</p>
  <label>Choose a cohort
   <select value={cohort} onChange={e=>setCohort(e.target.value)}>
    <option value="">All cohorts</option>
    {cohorts.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
   </select>
  </label>
  <div className="mari-review-actions" style={{display:'flex',flexWrap:'wrap',gap:10,marginTop:15}}>
   {Object.entries(REPORTS).map(([key,report])=><button key={key} type="button" className="small" disabled={!!busy} onClick={()=>download(key)}>
    {busy===key?'Preparing…':'↓ '+report.title+' (CSV)'}
   </button>)}
  </div>
  {message&&<p className="notice" role="status">{message}</p>}
 </section>;
}
export function FellowshipNotifications({userId}){
 const [items,setItems]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 async function refresh(){
  if(!userId)return;
  const {data,error:e}=await supabase.from('fellowship_notifications')
   .select('id,title,message,kind,path,created_at,read_at')
   .eq('recipient_id',userId).order('created_at',{ascending:false}).limit(30);
  if(e)setError(errorText(e));else{setItems(data||[]);setError('')}
  setLoading(false);
 }
 useEffect(()=>{refresh()},[userId]);
 async function markRead(id){
  const {error:e}=await supabase.rpc('mark_fellowship_notification_read',{p_notification_id:id});
  if(e)setError(errorText(e));else setItems(s=>s.map(x=>x.id===id?{...x,read_at:new Date().toISOString()}:x));
 }
 const unread=items.filter(x=>!x.read_at).length;
 return <section className="panel mari-notifications">
  <div className="heading"><div><span className="eyebrow">MARI MATTERS</span><h2>My notifications {unread?('('+unread+' new)'):''}</h2></div>
   <button type="button" className="small" onClick={refresh} disabled={loading}>{loading?'Loading…':'Refresh'}</button></div>
  <p>Project decisions and newly issued fellowship awards appear here when you sign in. Automatic email notifications are not enabled yet.</p>
  {error&&<p role="alert" className="notice">{error}</p>}
  {loading?<p>Loading notifications…</p>:!items.length?<p>No notifications yet.</p>:
  <div>{items.map(x=><article key={x.id} style={{padding:'12px 0',borderBottom:'1px solid #ddd',opacity:x.read_at?.72:1}}>
   <strong>{x.read_at?'':'● '}{x.title}</strong>
   <p>{x.message}</p>
   <small>{new Date(x.created_at).toLocaleString('en-GB')}</small>
   <div className="mari-review-actions" style={{marginTop:8,display:'flex',gap:10}}>
    <Link to={x.path===' /admin/fellowship' ? '/admin/fellowship': x.path || '/fellowship'} className="small">View details</Link>
    {!x.read_at&&<button type="button" className="small" onClick={()=>markRead(x.id)}>Mark as read</button>}
   </div>
  </article>)}</div>}
 </section>;
}
