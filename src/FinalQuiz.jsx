import React,{useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {supabase,errorText} from './supabase';
export default function FinalQuiz({user,profile}){
 const {id}=useParams();
 const [questions,setQuestions]=useState([]),[answers,setAnswers]=useState({}),[result,setResult]=useState(null),[certificate,setCertificate]=useState(null),[course,setCourse]=useState(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[pdfBusy,setPdfBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{let active=true;async function load(){
  const [q,c,cert]=await Promise.all([
    supabase.rpc('financial_literacy_quiz',{p_course_id:id}),
    supabase.from('courses').select('title,published').eq('id',id).maybeSingle(),
    supabase.from('certificates').select('certificate_number,score,issued_at').eq('course_id',id).eq('user_id',user.id).maybeSingle()
  ]);
  if(!active)return;
  if(q.error)setError(errorText(q.error));else setQuestions(q.data||[]);
  if(c.data)setCourse(c.data);
  if(cert.data)setCertificate(cert.data);
  setLoading(false);
 }load();return()=>{active=false}},[id,user.id]);
 async function submit(e){
  e.preventDefault();if(Object.keys(answers).length!==questions.length){setError('Please answer every question.');return}
  setSaving(true);setError('');
  const {data,error}=await supabase.rpc('submit_financial_literacy_quiz',{p_course_id:id,p_answers:answers});
  setSaving(false);
  if(error){setError(errorText(error));return}
  setResult(data);
  if(data.certificate_number){
    const cert=await supabase.from('certificates').select('certificate_number,score,issued_at').eq('course_id',id).eq('user_id',user.id).maybeSingle();
    if(cert.data)setCertificate(cert.data);
  }
  window.scrollTo({top:0,behavior:'smooth'});
 }
 async function downloadCertificate(){
  if(!certificate)return;
  setPdfBusy(true);setError('');
  try{
    const {jsPDF}=await import('jspdf');
    const pdf=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
    const W=297,H=210;
    pdf.setFillColor(251,250,247);pdf.rect(0,0,W,H,'F');
    pdf.setDrawColor(23,55,68);pdf.setLineWidth(1.8);pdf.rect(9,9,W-18,H-18);
    pdf.setDrawColor(230,119,35);pdf.setLineWidth(.8);pdf.rect(13,13,W-26,H-26);
    pdf.setTextColor(20,46,61);pdf.setFont('times','bold');pdf.setFontSize(17);
    pdf.text('MARI MATTERS FINANCIAL LITERACY ACADEMY',W/2,39,{align:'center'});
    pdf.setDrawColor(230,119,35);pdf.setLineWidth(.7);pdf.line(92,46,205,46);
    pdf.setFont('times','bold');pdf.setFontSize(30);pdf.text('CERTIFICATE OF COMPLETION',W/2,72,{align:'center'});
    pdf.setFont('times','normal');pdf.setFontSize(15);pdf.text('This is to certify that',W/2,88,{align:'center'});
    const name=(profile?.full_name||user.user_metadata?.full_name||user.email||'Learner').trim();
    pdf.setFont('times','bold');pdf.setFontSize(26);pdf.setTextColor(218,104,28);
    pdf.text(name.slice(0,64),W/2,108,{align:'center'});
    pdf.setFont('times','normal');pdf.setTextColor(20,46,61);pdf.setFontSize(14);
    pdf.text('has successfully completed the course and passed the final assessment for',W/2,121,{align:'center'});
    pdf.setFont('times','bold');pdf.setFontSize(19);
    const lines=pdf.splitTextToSize(course?.title||'Financial Literacy: Making Money Work in Zimbabwe',245);
    pdf.text(lines,W/2,136,{align:'center'});
    pdf.setFont('helvetica','normal');pdf.setFontSize(10);
    const date=new Date(certificate.issued_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
    pdf.text('Issued: '+date,35,170);pdf.text('Assessment score: '+certificate.score+'%',W/2,170,{align:'center'});
    pdf.text('Certificate No: '+certificate.certificate_number,W-35,170,{align:'right'});
    pdf.setFontSize(9);pdf.setTextColor(100,111,115);
    pdf.text('Issued electronically by Mari Matters Financial Literacy Academy - Certificate of course completion, not a regulated qualification',W/2,183,{align:'center'});
    pdf.save('Mari-Matters-Financial-Literacy-Certificate-'+certificate.certificate_number+'.pdf');
  }catch(e){setError('Unable to generate certificate PDF: '+errorText(e))}finally{setPdfBusy(false)}
 }
 return <main className="wrap">
  <Link to={'/learn/'+id}>← Back to course lessons</Link>
  <span className="eyebrow" style={{display:'block',marginTop:20}}>Mari Matters Financial Literacy Academy · Final assessment</span>
  <h1>Financial Literacy Quiz</h1>
  <p>Answer ten practical questions about household budgets, mukando, borrowing, business money and safe payments. You need at least 70% to pass, and you may retry if necessary. Complete every lesson before submitting.</p>
  {error&&<p className="notice">{error}</p>}
  {certificate&&<div className="panel" style={{borderColor:'#3b8871',marginBottom:24}}>
   <h2>Your certificate is ready</h2>
   <p>Certificate number: <strong>{certificate.certificate_number}</strong>. Your recorded passing score is {certificate.score}%.</p>
   <button onClick={downloadCertificate} disabled={pdfBusy}>{pdfBusy?'Creating PDF...':'Download free PDF certificate ↓'}</button>
  </div>}
  {result&&<div className="panel" style={{marginBottom:24}}><h2>{result.passed?'Congratulations — you passed!':'Keep learning — you can try again'}</h2><p>You answered {result.correct} of {result.total} questions correctly, giving a score of <strong>{result.score}%</strong>. Pass mark: 70%.</p><button className="small" onClick={()=>{setResult(null);setAnswers({})}}>Retake the quiz</button></div>}
  {loading?<p>Loading final assessment...</p>:questions.length===0?<div className="empty">No quiz is currently available for this course.</div>:!result&&<form className="panel" onSubmit={submit}>
   {questions.map((q,i)=><fieldset key={q.id} className="quiz-question"><legend><strong>{i+1}. {q.question}</strong></legend>{q.options.map((opt,n)=><label key={n} className="quiz-option"><input type="radio" name={'question-'+q.id} checked={answers[q.id]===n} onChange={()=>setAnswers(s=>({...s,[q.id]:n}))}/><span>{opt}</span></label>)}</fieldset>)}
   <p>{Object.keys(answers).length} of {questions.length} questions answered</p>
   <button disabled={saving||Object.keys(answers).length!==questions.length}>{saving?'Marking your answers...':'Submit answers for marking'}</button>
  </form>}
 </main>
}
