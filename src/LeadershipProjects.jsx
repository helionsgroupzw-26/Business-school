import React,{useEffect,useState} from 'react';
import {supabase,errorText} from './supabase';

const TITLES={
 submitted:'Proposal submitted — awaiting review',
 proposal_approved:'Proposal approved — submit your community report',
 report_submitted:'Community report awaiting review',
 approved:'Project approved',
 revision_required:'Changes requested by reviewer'
};
const isReportRevision=p=>p?.status==='revision_required' && !!p.project_report;
export function LeadershipProject({memberId,enabled}){
 const [project,setProject]=useState(null),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const [title,setTitle]=useState(''),[audience,setAudience]=useState(''),[proposal,setProposal]=useState('');
 const [report,setReport]=useState(''),[reached,setReached]=useState('');
 const draftKey='mari-stage2-draft:'+memberId;
 function saveDraft(field,value){
  try{const saved=JSON.parse(window.localStorage.getItem(draftKey)||'{}');
   window.localStorage.setItem(draftKey,JSON.stringify({...saved,[field]:value,updatedAt:new Date().toISOString()}))}catch{}
 }
 function clearDraft(){try{window.localStorage.removeItem(draftKey)}catch{}}
 function applySavedFields(data){
  const canEditProposal=!data||data.status==='submitted'||(data.status==='revision_required'&&!data.project_report);
  const canEditReport=data&&(data.status==='proposal_approved'||data.status==='report_submitted'||(data.status==='revision_required'&&data.project_report));
  let saved={};try{saved=JSON.parse(window.localStorage.getItem(draftKey)||'{}')}catch{}
  setTitle(canEditProposal?(saved.title??data?.title??''):(data?.title||''));
  setAudience(canEditProposal?(saved.audience??data?.audience??''):(data?.audience||''));
  setProposal(canEditProposal?(saved.proposal??data?.proposal??''):(data?.proposal||''));
  setReport(canEditReport?(saved.report??data?.project_report??''):(data?.project_report||''));
  setReached(canEditReport?(saved.reached??data?.participants_reached?.toString()??''):(data?.participants_reached?.toString()||''));
 }
 async function refresh(){
  const {data,error}=await supabase.from('fellowship_projects').select('*').eq('member_id',memberId).maybeSingle();
  if(error){setMessage(errorText(error));return}
  setProject(data);
  applySavedFields(data);
 }
 useEffect(()=>{let active=true;
  supabase.from('fellowship_projects').select('*').eq('member_id',memberId).maybeSingle().then(({data,error})=>{
   if(!active)return;
   if(error)setMessage(errorText(error));else {setProject(data);applySavedFields(data)}
   setLoading(false);
  });return()=>{active=false};
 },[memberId]);
 async function submitProposal(e){
  e.preventDefault();setBusy(true);setMessage('');
  const {error}=await supabase.rpc('fellowship_submit_proposal',{p_title:title.trim(),p_audience:audience.trim(),p_proposal:proposal.trim()});
  if(error)setMessage(errorText(error));else{clearDraft();await refresh();setMessage('Your project proposal was submitted for review.')}
  setBusy(false);
 }
 async function submitReport(e){
  e.preventDefault();setBusy(true);setMessage('');
  const {error}=await supabase.rpc('fellowship_submit_report',{p_report:report.trim(),p_reached:Number(reached)});
  if(error)setMessage(errorText(error));else{clearDraft();await refresh();setMessage('Community impact report submitted for assessment.')}
  setBusy(false);
 }
 if(!enabled)return <section className="panel"><h2>Stage 2 · Community Leadership Project</h2><p>This stage unlocks after the Mari Matters team confirms your Financial Literacy Fellow award.</p></section>;
 if(loading)return <section className="panel"><p>Loading your leadership project...</p></section>;
 const proposalEditable=!project||project.status==='submitted'||(project.status==='revision_required'&&!isReportRevision(project));
 const reportEditable=project&&(project.status==='proposal_approved'||project.status==='report_submitted'||isReportRevision(project));
 return <section className="panel mari-project"><span className="eyebrow">STAGE 2 · COMMUNITY IMPACT</span><h2>My Community Leadership Project</h2>
 <p>Propose a financial literacy activity, obtain approval, deliver it in your community and submit a report. Administrators assess the evidence before granting Certified Financial Leader recognition.</p>
 {project&&<div className="notice"><strong>Status: {TITLES[project.status]||project.status}</strong>
 {project.reviewer_feedback&&<p>Reviewer's feedback: {project.reviewer_feedback}</p>}
 {project.assessment_score!==null&&<p>Assessment: {project.assessment_score}%</p>}</div>}
 {(proposalEditable||reportEditable)&&<p className="mari-draft-hint">Drafts are saved automatically in this browser while you type. They are not submitted until you press Submit. On shared phones, clear your draft after use.</p>}
 {proposalEditable&&<form className="form mari-stage2-form" onSubmit={submitProposal}>
  <h3>Project proposal</h3>
  <label>Project title <input value={title} onChange={e=>{setTitle(e.target.value);saveDraft('title',e.target.value)}} required minLength={8} maxLength={160}/></label>
  <label>Target community or audience <input value={audience} onChange={e=>{setAudience(e.target.value);saveDraft('audience',e.target.value)}} required minLength={8} maxLength={240}/></label>
  <label>Describe your plan, activities and expected impact (minimum 150 characters)
  <textarea rows={7} value={proposal} onChange={e=>{setProposal(e.target.value);saveDraft('proposal',e.target.value)}} required minLength={150}/></label>
  <button type="submit" disabled={busy||proposal.trim().length<150}>{busy?'Submitting...':project?'Update proposal':'Submit proposal'}</button>
 </form>}
 {reportEditable&&<form className="form mari-stage2-form" onSubmit={submitReport}>
  <h3>Community impact report</h3>
  <p>Explain the event, lessons delivered, outcomes and evidence gathered. Keep supporting evidence available for administrator review.</p>
  <label>Number of participants reached <input type="number" min="0" step="1" value={reached} onChange={e=>{setReached(e.target.value);saveDraft('reached',e.target.value)}} required/></label>
  <label>Project report (minimum 150 characters)<textarea rows={8} value={report} onChange={e=>{setReport(e.target.value);saveDraft('report',e.target.value)}} required minLength={150}/></label>
  <button type="submit" disabled={busy||report.trim().length<150||reached===''}>{busy?'Submitting...':project.status==='report_submitted'?'Update report':'Submit report'}</button>
 </form>}
 {(proposalEditable||reportEditable)&&<button type="button" className="mari-clear-draft" disabled={busy} onClick={()=>{if(!window.confirm('Discard your locally saved unsent changes?'))return;clearDraft();applySavedFields(project)}}>Discard locally saved draft</button>}
 {project&&!proposalEditable&&!reportEditable&&<p>{project.status==='approved'?'Your project is approved. Your Certified Financial Leader award will be issued when an administrator completes the final award confirmation.':'Your submission is being reviewed. Return here for feedback.'}</p>}
 {message&&<p className="notice" role="status">{message}</p>}
 </section>;
}
export function LeadershipProjectAdmin(){
 const [projects,setProjects]=useState([]),[names,setNames]=useState({}),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const [feedback,setFeedback]=useState({}),[scores,setScores]=useState({});
 async function refresh(){
  const {data,error}=await supabase.from('fellowship_projects').select('*,fellowship_members(user_id)').order('updated_at',{ascending:false});
  if(error){setMessage(errorText(error));setLoading(false);return}
  setProjects(data||[]);
  const ids=[...new Set((data||[]).map(p=>p.fellowship_members?.user_id).filter(Boolean))];
  if(ids.length){const {data:profiles}=await supabase.from('profiles').select('id,full_name').in('id',ids);setNames(Object.fromEntries((profiles||[]).map(p=>[p.id,p.full_name])))}
  setLoading(false);
 }
 useEffect(()=>{refresh()},[]);
 async function review(p,action){
  if(action==='revision_required'&&(feedback[p.id]||'').trim().length<10){setMessage('Give at least ten characters of constructive feedback.');return}
  if(action==='approved'&&(!Number.isInteger(Number(scores[p.id]))||Number(scores[p.id])<70||Number(scores[p.id])>100)){setMessage('Enter a project assessment score between 70 and 100.');return}
  if(!window.confirm('Record '+action.replaceAll('_',' ')+' for this project?'))return;
  setBusy(true);setMessage('');
  const {error}=await supabase.rpc('fellowship_review_project',{p_project:p.id,p_action:action,p_feedback:(feedback[p.id]||'').trim()||null,p_score:action==='approved'?Number(scores[p.id]):null});
  if(error)setMessage(errorText(error));else{await refresh();setMessage('Project review recorded.')}
  setBusy(false);
 }
 return <section className="panel admin-section"><h2>Community leadership project reviews</h2><p>Approve proposals before implementation. Review submitted community reports and enter an assessment score. Leadership certificates can only be issued after a project is approved.</p>
 {loading?<p>Loading projects...</p>:projects.length===0?<p>No project proposals have been submitted yet.</p>:projects.map(p=><article className="mari-member-review" key={p.id} style={{padding:'16px 0',borderBottom:'1px solid #ddd'}}>
  <h3>{p.title}</h3><p><strong>{names[p.fellowship_members?.user_id]||'Fellow'}</strong> · {TITLES[p.status]||p.status}</p>
  <p><strong>Audience:</strong> {p.audience}</p><p><strong>Proposal:</strong> {p.proposal}</p>
  {p.project_report&&<><p><strong>Community report:</strong> {p.project_report}</p><p>Participants reached: {p.participants_reached}</p></>}
  {p.reviewer_feedback&&<p><strong>Previous feedback:</strong> {p.reviewer_feedback}</p>}
  {p.assessment_score!==null&&<p>Score: {p.assessment_score}%</p>}
  {p.status!=='approved'&&<div className="form">
   <label>Feedback / revisions<textarea rows={3} value={feedback[p.id]||''} onChange={e=>setFeedback(s=>({...s,[p.id]:e.target.value}))}/></label>
   {p.status==='report_submitted'&&<label>Final assessment score (%)<input type="number" min="70" max="100" value={scores[p.id]||''} onChange={e=>setScores(s=>({...s,[p.id]:e.target.value}))}/></label>}
   <div className="mari-review-actions">
    {(p.status==='submitted'||(p.status==='revision_required'&&!p.project_report))&&<button type="button" className="small" disabled={busy} onClick={()=>review(p,'proposal_approved')}>Approve proposal</button>}
    {p.status==='report_submitted'&&<button type="button" className="small" disabled={busy} onClick={()=>review(p,'approved')}>Approve final report</button>}
    <button type="button" className="small" disabled={busy} onClick={()=>review(p,'revision_required')}>Request changes</button>
   </div>
  </div>}
 </article>)}
 {message&&<p className="notice" role="status">{message}</p>}
 </section>;
}
