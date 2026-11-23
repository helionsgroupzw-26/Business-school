import React,{useEffect,useState} from 'react';
import {supabase,errorText} from './supabase';

const WEEK_NAMES=['Money and financial wellbeing','Saving, debt and protection','Financial independence','Financial literacy leadership'];
export function WeeklyQuiz({week,courseId,lessonsDone,priorPassed,passed,attempts,onPassed}){
 const [expanded,setExpanded]=useState(false);
 const [questionIndex,setQuestionIndex]=useState(0);
 const [questions,setQuestions]=useState(null);
 const [responses,setResponses]=useState({});
 const [result,setResult]=useState(null);
 const [loading,setLoading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState('');
 const ready=lessonsDone===3&&priorPassed;
 const last=attempts.length?attempts.reduce((a,b)=>a.submitted_at>b.submitted_at?a:b):null;
 const answered=Object.keys(responses).length;
 useEffect(()=>{setQuestions(null);setResponses({});setResult(null);setExpanded(false);setQuestionIndex(0);setError('')},[week,courseId]);
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
 function retry(){setResponses({});setResult(null);setQuestionIndex(0);setExpanded(true);document.getElementById('week-'+week+'-quiz')?.scrollIntoView({behavior:'smooth',block:'start'})}
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
    {questions.map((q,i)=><fieldset className={'quiz-question '+(i===questionIndex?'mari-question-active':'')} key={q.id}><legend><span>QUESTION {i+1} OF 10</span>{q.question}</legend><div className="quiz-options">{q.options.map((option,index)=><button type="button" key={index} aria-pressed={responses[q.id]===index} className={'quiz-answer-row '+(responses[q.id]===index?'is-selected':'')} onClick={()=>setResponses(s=>({...s,[q.id]:index}))}><span className="quiz-answer-label">{String.fromCharCode(65+index)})</span><span className="quiz-answer-text">{option}</span><span className="quiz-answer-indicator" aria-hidden="true">{responses[q.id]===index?'✓':''}</span></button>)}</div></fieldset>)}
    <div className="mari-mobile-quiz-navigation">
     <span>Question {questionIndex+1} of {questions.length} · {answered} answered</span>
     <div className="mari-mobile-quiz-buttons">
      <button type="button" disabled={questionIndex===0} onClick={()=>setQuestionIndex(i=>Math.max(0,i-1))}>← Previous</button>
      <button type="button" disabled={questionIndex>=questions.length-1} onClick={()=>setQuestionIndex(i=>Math.min(questions.length-1,i+1))}>Next question →</button>
     </div>
    </div>
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
 return <section id="fellowship-final-test" className="weekly-quiz-card final-assessment-card"><div className="quiz-eyebrow">FINAL ASSESSMENT · EXTERNAL</div><h3>Final Fellowship Knowledge Test</h3><p>After four weeks of lessons and successfully passing all four weekly quizzes, you will take the external final online assessment. Once your passing result is verified by Mari Matters, you are recognised as a Financial Literacy Fellow and can proceed to the community leadership stage.</p>
 {!passedAll?<p className="quiz-unlock-note">🔒 Pass all four weekly quizzes to unlock the final-test link.</p>:!loaded?<p>Checking final assessment availability...</p>:url?<a className="btn" href={url} target="_blank" rel="noopener noreferrer">Open final test in Google Forms ↗</a>:<p className="quiz-unlock-note">✓ All four weekly quizzes passed. The final online assessment link has not yet been published by the programme administrator.</p>}
 <p className="quiz-final-disclaimer">The Google Form assessment is completed outside this portal. A passing result must be confirmed by Mari Matters before Financial Literacy Fellow recognition. The subsequent practical community leadership stage leads to the separate Certified Financial Leader designation.</p></section>
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
 return <section className="panel admin-section"><h2>External final-test link</h2><p>When your final online assessment Google Form is ready, paste its link here. Fellows who have completed the four-week pathway and passed all four weekly quizzes can open the form. Verify submitted results before using the administrator award confirmation control to recognise a Financial Literacy Fellow. Leave empty until the assessment is ready.</p>{loading?<p>Loading link settings...</p>:<form onSubmit={save}><label>Final assessment Google Forms URL<input type="url" placeholder="https://forms.gle/..." value={value} onChange={e=>setValue(e.target.value)}/></label><button type="submit" disabled={saving}>{saving?'Saving...':'Save final-test link'}</button></form>}{message&&<p role="status" className="notice">{message}</p>}</section>
}
