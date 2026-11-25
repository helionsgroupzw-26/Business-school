import React,{useEffect,useState} from 'react';
import {supabase,errorText} from './supabase';

const CATEGORIES=[
 ['account','Account and sign-in'],['lessons','Lessons or videos'],['quizzes','Weekly quizzes'],
 ['projects','Community leadership project'],['certificates','Certificates'],['technical','Technical issue'],['other','Other']
];
const FAQ=[
 ['How do I start?','Activate your accepted cohort code, open My Fellowship and begin the first lesson. Complete all three lessons in a week before starting its quiz.'],
 ['How do I unlock the next week?','Complete all three lessons and pass the current week’s ten-question quiz with at least 70%. You can retry if you need to.'],
 ['When do I become a Financial Literacy Fellow?','Finish all twelve lessons and four weekly quizzes, complete the separate final online assessment, and have your passing result verified by Mari Matters.'],
 ['Where do I submit my leadership project?','After Stage 1 recognition, the Stage 2 section unlocks in My Fellowship. Submit your proposal there; once approved, deliver the activity and submit your report.'],
 ['Where are my certificates?','Open My Fellowship or My Account. Certificates appear only after the applicable award is approved. Check that your full name is correct in My Account first.'],
 ['What if a lesson video will not play?','Use the lesson’s alternative player or the link to watch on YouTube. You can continue with the written lesson and report a persistent problem below.']
];

const niceStatus={open:'Open',in_progress:'Being reviewed',resolved:'Resolved'};
const niceCategory=key=>CATEGORIES.find(x=>x[0]===key)?.[1]||key;

export function FellowSupport({userId}){
 const [category,setCategory]=useState('technical'),[subject,setSubject]=useState(''),[description,setDescription]=useState('');
 const [items,setItems]=useState([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const [expanded,setExpanded]=useState(-1);
 async function reload(){
  if(!userId)return;
  const {data,error:e}=await supabase.from('fellowship_support_requests').select('id,category,subject,description,status,admin_reply,created_at,updated_at').eq('user_id',userId).order('created_at',{ascending:false}).limit(30);
  if(e)setError(errorText(e));else{setItems(data||[]);setError('')}
  setLoading(false);
 }
 useEffect(()=>{reload()},[userId]);
 async function send(e){
  e.preventDefault();
  if(busy)return;
  setBusy(true);setError('');setMessage('');
  const {error:e2}=await supabase.from('fellowship_support_requests').insert({
   user_id:userId,category,subject:subject.trim(),description:description.trim()
  });
  setBusy(false);
  if(e2){setError(errorText(e2));return}
  setSubject('');setDescription('');setMessage('Your support request was submitted. We will respond in this section and notify you when there is an update.');
  await reload();
 }
 return <section className="panel mari-help" id="support-desk" aria-label="Help and support">
  <span className="eyebrow">FELLOW SUPPORT</span><h2>Help & Support</h2>
  <p>Find quick answers or tell the Mari Matters team what is stopping you from learning.</p>
  <h3>Frequently asked questions</h3>
  <div className="mari-faq">
   {FAQ.map(([question,answer],index)=><div className="mari-faq-item" key={question}>
    <button type="button" aria-expanded={expanded===index} onClick={()=>setExpanded(x=>x===index?-1:index)}>{question}<span aria-hidden="true">{expanded===index?'−':'+'}</span></button>
    {expanded===index&&<p>{answer}</p>}
   </div>)}
  </div>
  <h3>Report a problem or ask for help</h3>
  <p className="mari-field-tip">Do not include passwords, bank details, national ID numbers or another person's private information.</p>
  <form className="mari-support-form" onSubmit={send}>
   <label>Issue category<select value={category} onChange={e=>setCategory(e.target.value)}>{CATEGORIES.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
   <label>Short subject<input required minLength={5} maxLength={140} value={subject} onChange={e=>setSubject(e.target.value)} placeholder="e.g. Week 2 quiz will not open"/></label>
   <label>What happened?<textarea required minLength={15} maxLength={3000} rows={4} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Mention the lesson or feature, what you expected, and the error you saw (if any)."/></label>
   <button type="submit" className="btn" disabled={busy||subject.trim().length<5||description.trim().length<15}>{busy?'Sending…':'Send support request'}</button>
  </form>
  {message&&<p className="notice" role="status">{message}</p>}
  {error&&<p className="notice" role="alert">{error}</p>}
  <div className="mari-support-history-header"><h3>Your support requests</h3><button type="button" className="small" onClick={reload} disabled={loading}>{loading?'Loading…':'Refresh'}</button></div>
  {loading?<p>Loading your requests…</p>:!items.length?<p>No support requests submitted yet.</p>:
   <div className="mari-support-history">{items.map(item=><article key={item.id} className="mari-support-item">
    <div className="mari-support-item-head"><strong>{item.subject}</strong><small>{niceStatus[item.status]||item.status}</small></div>
    <small>{niceCategory(item.category)} · {new Date(item.created_at).toLocaleDateString('en-GB')}</small>
    <p>{item.description}</p>{item.admin_reply&&<p className="mari-support-reply"><strong>Mari Matters response:</strong> {item.admin_reply}</p>}
   </article>)}</div>}
 </section>;
}

export function FellowSupportAdmin(){
 const [items,setItems]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[message,setMessage]=useState(''),[saving,setSaving]=useState('');
 const [drafts,setDrafts]=useState({});
 async function reload(){
  const {data,error:e}=await supabase.from('fellowship_support_requests').select('id,user_id,category,subject,description,status,admin_reply,created_at').order('created_at',{ascending:false}).limit(100);
  if(e)setError(errorText(e));else{setItems(data||[]);setError('')}
  setLoading(false);
 }
 useEffect(()=>{reload()},[]);
 async function review(item){
  if(saving)return;
  const d=drafts[item.id]||{};
  const status=d.status||item.status,reply=d.reply??item.admin_reply??'';
  setSaving(item.id);setError('');setMessage('');
  const {data,error:e}=await supabase.rpc('mari_support_review',{p_request_id:item.id,p_status:status,p_reply:reply});
  setSaving('');
  if(e){setError(errorText(e));return}
  if(!data){setError('Request not found. Refresh and try again.');return}
  setMessage('Support request updated. The fellow will receive an in-portal notification.');
  await reload();
 }
 const pending=items.filter(x=>x.status!=='resolved').length;
 return <section className="panel mari-support-admin" id="support-desk">
  <div className="mari-support-history-header"><div><span className="eyebrow">STUDENT EXPERIENCE</span><h2>Fellow Support Desk</h2></div><button className="small" type="button" onClick={reload} disabled={loading}>{loading?'Loading…':'Refresh'}</button></div>
  <p>{pending} unresolved request{pending===1?'':'s'}. Review student issues, respond and mark them resolved.</p>
  {error&&<p role="alert" className="notice">{error}</p>}{message&&<p role="status" className="notice">{message}</p>}
  {loading?<p>Loading support requests…</p>:!items.length?<p>No support requests yet.</p>:
  <div className="mari-support-history">{items.map(item=>{
   const draft=drafts[item.id]||{};
   return <article key={item.id} className="mari-support-item">
    <div className="mari-support-item-head"><strong>{item.subject}</strong><small>{niceStatus[item.status]}</small></div>
    <small>{niceCategory(item.category)} · {new Date(item.created_at).toLocaleString('en-GB')} · Fellow ID: {item.user_id.slice(0,8)}…</small>
    <p>{item.description}</p>
    <div className="mari-support-admin-controls">
     <label>Status<select value={draft.status??item.status} onChange={e=>setDrafts(s=>({...s,[item.id]:{...s[item.id],status:e.target.value}}))}><option value="open">Open</option><option value="in_progress">Being reviewed</option><option value="resolved">Resolved</option></select></label>
     <label>Reply to fellow<textarea rows={3} maxLength={3000} value={draft.reply??item.admin_reply??''} onChange={e=>setDrafts(s=>({...s,[item.id]:{...s[item.id],reply:e.target.value}}))} placeholder="Explain next steps or how the issue was resolved"/></label>
     <button className="small" type="button" disabled={!!saving} onClick={()=>review(item)}>{saving===item.id?'Saving…':'Save response'}</button>
    </div>
   </article>;
  })}</div>}
 </section>;
}