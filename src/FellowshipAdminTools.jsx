import React,{useEffect,useState} from 'react';
import {supabase,errorText} from './supabase';

const statLabels=[
 ['members','Registered fellows'],
 ['all_quizzes_passed','All four quizzes passed'],
 ['fellows_awarded','Financial Literacy Fellows'],
 ['leaders_awarded','Certified Financial Leaders'],
 ['projects_pending','Projects awaiting completion'],
 ['projects_approved','Projects approved'],
 ['active_certificates','Active certificates'],
 ['quiz_attempts','Total quiz attempts']
];
const day=v=>v||'Not set';

export function FellowshipAdminOverview({refreshKey=0}){
 const [report,setReport]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 async function load(){
   setLoading(true);setError('');
   const {data,error:e}=await supabase.rpc('admin_fellowship_insights');
   if(e)setError(errorText(e));else setReport(data);
   setLoading(false);
 }
 useEffect(()=>{load()},[refreshKey]);
 const s=report?.summary||{};
 return <section className="panel admin-section" aria-label="Fellowship overview">
  <div className="heading"><div><span className="eyebrow">LIVE PROGRAMME OVERVIEW</span><h2>Fellowship dashboard</h2></div><button type="button" className="small" onClick={load} disabled={loading}>{loading?'Refreshing…':'Refresh statistics'}</button></div>
  <p>Statistics cover registered fellows only. External applications submitted through Google Forms remain outside this portal.</p>
  {error&&<p role="alert" className="notice">{error}</p>}
  {loading&&!report?<p>Loading programme statistics...</p>:report&&<>
  <div className="fellow-dashboard-stats" style={{marginBottom:18}}>{statLabels.map(([key,label])=><div key={key}><span>{label}</span><strong>{s[key]??0}</strong></div>)}</div>
  <h3>Progress by cohort</h3>
  <div style={{overflowX:'auto'}}>
   <table style={{width:'100%',borderCollapse:'collapse',minWidth:680,fontSize:14}}>
    <thead><tr>{['Cohort','Members','Average lessons','4 quizzes passed','Fellows','Leaders','Projects approved'].map(h=><th key={h} scope="col" style={{textAlign:'left',padding:'10px 8px',borderBottom:'1px solid #ddd'}}>{h}</th>)}</tr></thead>
    <tbody>{(report.cohorts||[]).map(c=><tr key={c.id}>
     <td style={{padding:'9px 8px',borderBottom:'1px solid #eee'}}><strong>{c.name}</strong><div style={{fontSize:12,opacity:.75}}>{c.status}</div></td>
     <td style={{padding:'9px 8px',borderBottom:'1px solid #eee'}}>{c.members}</td>
     <td style={{padding:'9px 8px',borderBottom:'1px solid #eee'}}>{c.avg_lessons_completed}/{c.lesson_total}</td>
     <td style={{padding:'9px 8px',borderBottom:'1px solid #eee'}}>{c.all_quizzes_passed}</td>
     <td style={{padding:'9px 8px',borderBottom:'1px solid #eee'}}>{c.fellows_awarded}</td>
     <td style={{padding:'9px 8px',borderBottom:'1px solid #eee'}}>{c.leaders_awarded}</td>
     <td style={{padding:'9px 8px',borderBottom:'1px solid #eee'}}>{c.projects_approved}</td>
    </tr>)}</tbody>
   </table>
  </div>
  </>}
 </section>;
}

export function FellowshipCohortManager({cohorts,onChanged}){
 const [status,setStatus]=useState({});
 const [edits,setEdits]=useState({});
 const [busyId,setBusyId]=useState('');
 const [messages,setMessages]=useState({});
 const [expanded,setExpanded]=useState('');
 async function refreshCodes(){
  const {data,error}=await supabase.rpc('admin_fellowship_code_status');
  if(error)setMessages(m=>({...m,global:errorText(error)}));
  else setStatus(Object.fromEntries((data||[]).map(x=>[x.cohort_id,x])));
 }
 useEffect(()=>{refreshCodes()},[cohorts.length]);
 function update(id,key,value){setEdits(prev=>({...prev,[id]:{...prev[id],[key]:value}}))}
 const shown=(c,key)=>edits[c.id]?.[key]??c[key]??'';
 async function changeState(c,value){
  if(value===c.status)return;
  setBusyId(c.id);setMessages(m=>({...m,[c.id]:''}));
  const {error}=await supabase.from('fellowship_cohorts').update({status:value}).eq('id',c.id);
  setBusyId('');setMessages(m=>({...m,[c.id]:error?errorText(error):'Registration status updated.'}));
  if(!error)onChanged?.();
 }
 async function saveDates(e,c){
  e.preventDefault();
  const start=shown(c,'starts_on')||null,end=shown(c,'ends_on')||null;
  if(start&&end&&start>end){setMessages(m=>({...m,[c.id]:'The start date must be on or before the end date.'}));return}
  setBusyId(c.id);setMessages(m=>({...m,[c.id]:''}));
  const {error}=await supabase.from('fellowship_cohorts').update({starts_on:start,ends_on:end}).eq('id',c.id);
  setBusyId('');setMessages(m=>({...m,[c.id]:error?errorText(error):'Cohort dates saved.'}));
  if(!error)onChanged?.();
 }
 async function handleCode(e,c,action){
  e.preventDefault();
  const code=(edits[c.id]?.code||'').trim();
  if(action==='set'&&!window.confirm('Replace the existing code for '+c.name+'? Previously shared codes for this cohort will stop working.'))return;
  if(action==='disable'&&!window.confirm('Disable new sign-ups for '+c.name+' using its code? Existing members keep access.'))return;
  setBusyId(c.id);setMessages(m=>({...m,[c.id]:''}));
  const {error}=await supabase.rpc('admin_manage_fellowship_code',{p_cohort_id:c.id,p_action:action,p_code:action==='set'?code:null});
  setBusyId('');
  setMessages(m=>({...m,[c.id]:error?errorText(error):action==='set'?'New code saved. Share it only with accepted applicants.':action==='enable'?'Cohort code enabled.':'Cohort code disabled.'}));
  if(!error){update(c.id,'code','');await refreshCodes();onChanged?.()}
 }
 return <section className="panel admin-section">
  <h2>Cohort management</h2>
  <p>Control dates, registration status and access codes for accepted applicants. Existing members retain their learning access when registration is closed. Codes are stored securely; an existing code cannot be displayed again.</p>
  {messages.global&&<p role="alert" className="notice">{messages.global}</p>}
  {cohorts.map(c=>{
   const code=status[c.id];
   const isBusy=busyId===c.id;
   return <div className="cohort-row mari-cohort-admin-row" key={c.id} style={{display:'block',padding:'14px 0'}}>
    <div className="heading"><div><strong>{c.name}</strong><div><small>{c.status} · {code?.configured?(code.enabled?'Code enabled':'Code disabled'):'No code configured'} · {day(c.starts_on)} to {day(c.ends_on)}</small></div></div>
    <button className="small" type="button" onClick={()=>setExpanded(v=>v===c.id?'':c.id)}>{expanded===c.id?'Close settings':'Manage cohort'}</button></div>
    {expanded===c.id&&<div className="form" style={{padding:'12px 0'}}>
     <label>Registration status
      <select value={c.status} disabled={isBusy} onChange={e=>changeState(c,e.target.value)}>
       {['planned','open','active','closed'].map(v=><option key={v} value={v}>{v}</option>)}
      </select>
     </label>
     <small>Open / active cohorts accept valid codes. Planned and closed cohorts do not accept new registrations.</small>
     <form onSubmit={e=>saveDates(e,c)}>
      <div className="form-grid" style={{display:'flex',flexWrap:'wrap',gap:12}}>
       <label>Start date<input type="date" value={shown(c,'starts_on')} onChange={e=>update(c.id,'starts_on',e.target.value)}/></label>
       <label>End date<input type="date" value={shown(c,'ends_on')} onChange={e=>update(c.id,'ends_on',e.target.value)}/></label>
      </div>
      <button className="small" type="submit" disabled={isBusy}>{isBusy?'Saving…':'Save cohort dates'}</button>
     </form>
     <form onSubmit={e=>handleCode(e,c,'set')}>
      <label>Set / replace access code (8–64 letters, numbers or hyphens)
       <input type="text" autoComplete="off" minLength={8} maxLength={64} pattern="[A-Za-z0-9-]+" required placeholder="Enter a new accepted-fellows code" value={edits[c.id]?.code||''} onChange={e=>update(c.id,'code',e.target.value)}/>
      </label>
      <button type="submit" className="small" disabled={isBusy}>Save new code</button>
     </form>
     {code?.configured&&<div className="mari-cohort-actions" style={{marginTop:10}}>
      <button type="button" className="small" disabled={isBusy||code.enabled} onClick={e=>handleCode(e,c,'enable')}>Enable existing code</button>
      <button type="button" className="small" disabled={isBusy||!code.enabled} onClick={e=>handleCode(e,c,'disable')}>Disable code</button>
     </div>}
     {messages[c.id]&&<p className="notice" role="status">{messages[c.id]}</p>}
    </div>}
   </div>
  })}
 </section>;
}
