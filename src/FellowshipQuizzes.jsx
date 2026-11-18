import React,{useEffect,useState} from 'react';
import {supabase,errorText} from './supabase';

const WEEK_NAMES=['Money and financial wellbeing','Saving, debt and protection','Financial independence','Financial literacy leadership'];
export function WeeklyQuiz({week,courseId,lessonsDone,priorPassed,passed,attempts,onPassed}){
 const [expanded,setExpanded]=useState(false);
 const [questions,setQuestions]=useState(null);
 const [responses,setResponses]=useState({});
 const [result,setResult]=useState(null);
 const [loading,setLoading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 const ready=lessonsDone===3&&priorPassed;
 const last=attempts.length?attempts.reduce((a,b)=>a.submitted_at>b.submitted_at?a:b):null;
 const answered=Object.keys(responses).length;
 useEffect(()=>{setQuestions(null);setResponses({});setResult(null);setExpanded(false);setError('')},[week,courseId]);
 async function open(){
  if(!ready)return;
  if(expanded){setExpanded(false);return}
  setExpanded(true);
  if(questions)return;
  setLoading(true);setError('');
  const {data,error:e}=await supabase.rpc('get_fellowship_quiz',{p_course_id:courseId,p_week:week});
  setLoading(false);
  if(e)setError(errorText(e));else setQuestions(data);
 }
 async function submit(e){
  e.preventDefault();if(!questions||answered!==10||saving)return;
  setSaving(true);setError('');
  const {data,error:e2}=await supabase.rpc('submit_fellowship_quiz',{p_course_id:courseId,p_week:week,p_answers:responses});
  setSaving(false);
  if(e2){setError(errorText(e2));return}
  setResult(data);
  await onPassed?.();
 }
 function retry(){setResponses({});setResult(null);setExpanded(true);document.getElementById('week-'+week+'-quiz')?.scrollIntoView({behavior:'smooth',block:'start'})}
 return <section id={'week-'+week+'-quiz'} className={'weekly-quiz-card '+(passed?'quiz-passed':'')+' '+(!ready?'quiz-locked':'')}>
  <div className="quiz-card-head">
   <div><div className="quiz-eyebrow">WEEK {week} · KNOWLEDGE CHECK</div><h3>{WEEK_NAMES[week-1]}</h3><p>10 multiple-choice questions · Pass with 7/10 (70%) · Unlimited retakes</p></div>
   <span className={'quiz-status '+(passed?'status-pass':ready?'status-ready':'status-locked')}>{passed?'✓ Passed':ready?'Ready':'🔒 Locked'}</span>
  </div>
  {last&&<p className="quiz-history">Latest recorded attempt: {last.score}/10 ({last.score*10}%) · {last.passed?'Passed':'Not yet passed'} · Total attempts: {attempts.length}</p>}
  {!ready?<p className="quiz-unlock-note">{!priorPassed?'Pass the previous week’s quiz to unlock this week.':'Complete all three lessons in this week to unlock the quiz ('+lessonsDone+'/3 complete).'}</p>:
   <div className="quiz-open-actions"><button type="button" onClick={open} className="quiz-start-btn">{expanded?'Hide quiz':passed?'Review or retake Week '+week+' quiz':'Start Week '+week+' quiz →'}</button>{passed&&<span className="quiz-pass-hint">Week {week+1<=4?week+1+' lessons are unlocked.':'4 is complete.'}</span>}</div>}
  {error&&<p role="alert" className="notice">{error}</p>}
  {expanded&&ready&&(loading?<p>Preparing your questions...</p>:questions&&!result?<form onSubmit={submit} className="quiz-form">
    {questions.map((q,i)=><fieldset className="quiz-question" key={q.id}><legend><span>QUESTION {i+1} OF 10</span>{q.question}</legend><div className="quiz-options">{q.options.map((option,index)=><label key={index} className={'quiz-option '+(responses[q.id]===index?'quiz-option-selected':'')}><input type="radio" name={'q-'+q.id} checked={responses[q.id]===index} onChange={()=>setResponses(s=>({...s,[q.id]:index}))}/><span className="quiz-option-letter">{String.fromCharCode(65+index)}</span><span>{option}</span></label>)}</div></fieldset>)}
    <div className="quiz-submit-bar"><span>{answered} of 10 answered</span><button type="submit" disabled={saving||answered!==10}>{saving?'Marking your answers...':'Submit answers for marking →'}</button></div>
   </form>:result?<div className="quiz-results" role="status">
    <div className={'quiz-result-hero '+(result.passed?'quiz-success':'quiz-retry')}><span>{result.passed?'✓ YOU PASSED':'KEEP LEARNING'}</span><strong>{result.score}/10 <small>({result.score*10}%)</small></strong><p>{result.passed?'Well done! Your next week of learning is unlocked.':'You need 7 out of 10 to pass. Review the feedback and try again when ready.'}</p></div>
    <h4>Review your answers</h4>
    <div className="quiz-review-list">{result.review.map((x,i)=><div className="quiz-review-item" key={x.position}><span className={x.correct?'quiz-review-correct':'quiz-review-wrong'}>{x.correct?'✓':'✕'}</span><div><strong>Question {x.position}: {x.correct?'Correct':'Needs review'}</strong><p>{x.explanation}</p></div></div>)}</div>
    <button type="button" onClick={retry}>{result.passed?'Take another practice attempt ↻':'Retake the quiz ↻'}</button>
   </div>:null)}
 </section>
}
export function ExternalFinalAssessment({courseId,passedAll}){
 const [url,setUrl]=useState(null);
 const [loaded,setLoaded]=useState(false);
 useEffect(()=>{let alive=true;supabase.from('fellowship_assessment_settings').select('final_test_url').eq('course_id',courseId).maybeSingle().then(({data})=>{if(alive){setUrl(data?.final_test_url||null);setLoaded(true)}});return()=>{alive=false}},[courseId]);
 return <section id="fellowship-final-test" className="weekly-quiz-card final-assessment-card"><div className="quiz-eyebrow">FINAL ASSESSMENT · EXTERNAL</div><h3>Final Fellowship Knowledge Test</h3><p>Your final test will open in a separate Google Form after all four weekly quizzes have been passed. Mari Matters will supply the link when the assessment is ready.</p>
 {!passedAll?<p className="quiz-unlock-note">🔒 Pass all four weekly quizzes to unlock the final-test link.</p>:!loaded?<p>Checking final assessment availability...</p>:url?<a className="btn" href={url} target="_blank" rel="noopener noreferrer">Open final test in Google Forms ↗</a>:<p className="quiz-unlock-note">✓ Weekly quiz requirement completed. The final-test link has not yet been published by the programme administrator.</p>}
 <p className="quiz-final-disclaimer">Final assessment submission, community project review and graduation decisions take place outside this learning portal.</p></section>
}
export function FinalAssessmentAdmin({courseId}){
 const [value,setValue]=useState(''),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[message,setMessage]=useState('');
 useEffect(()=>{supabase.from('fellowship_assessment_settings').select('final_test_url').eq('course_id',courseId).maybeSingle().then(({data,error})=>{setValue(data?.final_test_url||'');setMessage(error?errorText(error):'');setLoading(false)})},[courseId]);
 async function save(e){
  e.preventDefault();const candidate=value.trim();
  if(candidate&&!/^https:\/\/(forms\.gle\/|docs\.google\.com\/forms\/)/i.test(candidate)){setMessage('Use a valid HTTPS Google Forms link.');return}
  setSaving(true);setMessage('');
  const {data,error}=await supabase.from('fellowship_assessment_settings').update({final_test_url:candidate||null,updated_at:new Date().toISOString()}).eq('course_id',courseId).select('course_id').maybeSingle();
  setSaving(false);setMessage(error?errorText(error):data?'Final assessment link saved.':'No setting was updated. Check administrator permissions.');
 }
 return <section className="panel admin-section"><h2>External final-test link</h2><p>When your Google Form is ready, paste its link here. Fellows who have passed all four weekly quizzes will see a button to open it. Leave the field empty to keep the final assessment unpublished.</p>{loading?<p>Loading link settings...</p>:<form onSubmit={save}><label>Final assessment Google Forms URL<input type="url" placeholder="https://forms.gle/..." value={value} onChange={e=>setValue(e.target.value)}/></label><button type="submit" disabled={saving}>{saving?'Saving...':'Save final-test link'}</button></form>}{message&&<p role="status" className="notice">{message}</p>}</section>
}
