import React,{useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {supabase,errorText} from './supabase';
import {FinalAssessmentAdmin} from './FellowshipQuizzes.jsx';
import {MyCertificates} from './FellowshipCertificates.jsx';
const PROGRAM_ID='4617f7ff-344c-43d3-af2b-9d1a9afb005e';
const stages={learning:'Four-week learning',fellow:'Financial Literacy Fellow',project:'Leadership development',graduated:'Certified Financial Leader'};
const projectStatuses={submitted:'Proposal awaiting review',proposal_approved:'Proposal approved',report_submitted:'Community report awaiting review',approved:'Graduation approved',revision_required:'Revisions requested'};
const fmtDate=d=>d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'To be announced';
const APPLY_URL='https://forms.gle/2VtJLHfnDFEpRz3G8';
const programmeWeeks=[
 {num:'01',icon:'◎',title:'Know your money',description:'Understand income, spending, budgeting and the financial reality around you.',tags:'FINANCIAL WELLBEING'},
 {num:'02',icon:'✦',title:'Save & protect',description:'Explore savings, borrowing, financial safety and smart everyday decisions.',tags:'CONFIDENCE & SAFETY'},
 {num:'03',icon:'↗',title:'Build independence',description:'Learn how small businesses, financial goals and money habits really work.',tags:'GROWTH & RESILIENCE'},
 {num:'04',icon:'✳',title:'Lead the change',description:'Practice teaching financial literacy and prepare to make an impact.',tags:'COMMUNITY LEADERSHIP'}
];
function ApplyNow({className='btn',children='Apply Now →'}){return <a className={className} href={APPLY_URL} target="_blank" rel="noopener noreferrer">{children}</a>}
export function FellowshipHome(){return <div className="fellowship-public mari-refresh">
 <section className="mari-new-hero">
  <div className="hero-ribbon hero-ribbon-left" aria-hidden="true"/>
  <div className="hero-ribbon hero-ribbon-right" aria-hidden="true"/>
  <div className="wrap mari-new-hero-grid">
   <div className="mari-hero-text">
    <div className="mari-programme-chip"><span className="chip-dot"/> THE MARI MATTERS FINANCIAL LITERACY LEADERSHIP PROGRAMME</div>
    <h1>LEARN MONEY.<br/><span className="mari-highlight">LEAD CHANGE.</span></h1>
    <p className="mari-hero-intro">Financial knowledge should be a life skill, not a privilege. Join a movement equipping emerging leaders to understand money, make informed decisions and empower communities across Africa.</p>
    <div className="mari-hero-actions"><ApplyNow className="btn mari-primary-action">Apply Now <span aria-hidden="true">↗</span></ApplyNow><a className="mari-secondary-action" href="#journey">Explore the fellowship <span aria-hidden="true">↓</span></a></div>
    <div className="mari-hero-meta"><span>◉ 4 WEEKS ONLINE</span><span>✓ FINAL ASSESSMENT</span><span>✳ LEADERSHIP STAGE</span></div>
   </div>
   <div className="mari-hero-art" aria-label="Mari Matters financial literacy fellowship">
    <div className="mari-art-orbit orbit-one"/><div className="mari-art-orbit orbit-two"/>
    <div className="mari-floating-spark spark-one">✳</div><div className="mari-floating-spark spark-two">✦</div>
    <div className="mari-art-card"><div className="mari-art-topline"><span>THE FELLOWSHIP</span><span>2026 / BEYOND</span></div><div className="mari-art-word">MARI <em>Matters</em></div><div className="mari-art-statement">CHANGING<br/><span>MINDSETS.</span><br/>BUILDING<br/><span>WEALTH.</span></div><div className="mari-art-bottom"><span>LEARN.</span><span>LEAD.</span><span>IMPACT.</span></div></div>
    <span className="mari-orbit-pill pill-one">FINANCIAL CONFIDENCE ✦</span><span className="mari-orbit-pill pill-two">COMMUNITY IMPACT ↗</span>
   </div>
  </div>
  <div className="hero-bottom-wave" aria-hidden="true"/>
 </section>
 <section className="mari-ticker" aria-label="Programme values"><div className="mari-ticker-track"><span>KNOW YOUR MONEY</span><b>✦</b><span>CHANGE YOUR MINDSET</span><b>✦</b><span>BUILD FINANCIAL CONFIDENCE</span><b>✦</b><span>LEAD YOUR COMMUNITY</span><b>✦</b><span>KNOW YOUR MONEY</span><b>✦</b><span>CHANGE YOUR MINDSET</span></div></section>
 <section id="mission" className="wrap mari-story-section"><div className="mari-section-label"><span>01</span> THE WHY</div><div className="mari-story-grid"><div><h2>Money is part of everyday life.<br/><span>So why isn't it part of everyday learning?</span></h2></div><div><p>Across Zimbabwe and the wider African continent, many young people enter adulthood without accessible, practical education about budgets, borrowing, savings or protecting their money. And when income is irregular or responsibilities pile up, generic advice often misses the point.</p><p>Mari Matters exists to change that. Our fellowship helps passionate people learn financial skills through real-life examples, then share that knowledge respectfully with the communities around them.</p><a className="mari-text-link" href="#journey">Discover how it works <span>↗</span></a></div></div><div className="mari-impact-line"><span>Not just learning for yourself.</span><strong>Learning to lift others.</strong><span className="mari-impact-line-icon">↗</span></div></section>
 <section id="journey" className="mari-journey-section"><div className="wrap"><div className="mari-section-label"><span>02</span> THE JOURNEY</div><div className="mari-section-head"><h2>Four weeks to learn.<br/><span>A community to impact.</span></h2><p>Four weeks of practical lessons and in-portal quizzes lead to an external online assessment. Passing earns the Mari Matters Financial Literacy Fellow title.</p></div><div className="mari-new-week-grid">{programmeWeeks.map((w,i)=><article className="mari-week-card" key={w.num}><div className="week-card-top"><span>WEEK {w.num}</span><span className="week-card-icon" aria-hidden="true">{w.icon}</span></div><h3>{w.title}</h3><p>{w.description}</p><div className="week-card-bottom"><span>{w.tags}</span><span aria-hidden="true">↗</span></div></article>)}</div><div className="mari-journey-footer"><span className="mari-journey-asterisk">✳</span><p><strong>The next stage: from Fellow to Leader.</strong> After passing the final online assessment and becoming a Financial Literacy Fellow, participants progress to supervised community financial literacy leadership activities. Successfully completing this next stage earns the Mari Matters Certified Financial Leader designation.</p></div></div></section>
 <section className="mari-lead-section"><div className="wrap mari-lead-grid"><div><div className="mari-section-label light"><span>03</span> THE IMPACT</div><h2>Become a Financial Literacy Fellow.<br/><em>Grow into a Certified Financial Leader.</em></h2><p>Imagine explaining budgeting to first-time earners, helping market traders understand cash flow, or showing young people how to recognise a financial scam. That's the kind of community leadership we want to grow.</p><ApplyNow className="btn mari-light-action">Apply to become a fellow ↗</ApplyNow></div><div className="mari-lead-visual" aria-hidden="true"><span className="mari-lead-circle">YOU<br/><small>CAN BE</small><br/>THE<br/><em>CHANGE.</em></span><span className="mari-lead-spark">✳</span></div></div></section>
 <section className="wrap mari-how-section" id="how-to-apply"><div className="mari-section-label"><span>04</span> YOUR NEXT STEP</div><div className="mari-section-head"><h2>Ready to make<br/><span>money knowledge matter?</span></h2><p>Applications are reviewed outside the learning portal. Selected applicants receive their cohort details and shared registration code for creating their own fellowship accounts.</p></div><div className="mari-apply-steps">{[{number:'01',title:'Apply online',desc:'Complete our Google application form.'},{number:'02',title:'Get selected',desc:'The Mari Matters team reviews applications and communicates the outcome.'},{number:'03',title:'Join your cohort',desc:'Use your provided registration code to open your learning space.'}].map(x=><div className="mari-apply-step" key={x.number}><span>{x.number}</span><h3>{x.title}</h3><p>{x.desc}</p></div>)}</div><div className="mari-bottom-action"><div><h3>Your leadership journey starts with one decision.</h3><p>Applications are handled securely in our external Google Form.</p></div><ApplyNow className="btn mari-primary-action">Apply Now <span aria-hidden="true">↗</span></ApplyNow></div></section>
 </div>}
export function FellowshipApplication(){return <main className="wrap fellowship-inner mari-application-page"><div className="mari-section-label"><span>JOIN US</span> APPLICATIONS</div><h1>Become a financial literacy leader.</h1><p className="lead">The Mari Matters Financial Literacy Leadership Programme invites aspiring change-makers to apply for our cohort-based fellowship. Applications and selection take place outside this learning portal.</p><div className="mari-application-callout"><div><span className="eyebrow">START YOUR APPLICATION</span><h2>Take the first step.</h2><p>Complete the official Mari Matters application form. Successful applicants will be contacted with their cohort details and a shared registration code to activate their own account.</p><ApplyNow className="btn mari-primary-action">Apply Now — Open Form ↗</ApplyNow></div><div className="mari-application-mark" aria-hidden="true">↗</div></div><div className="application-steps">{[{title:'Apply via Google Form',text:'Tell us why financial literacy and community leadership matter to you.'},{title:'Application review',text:'The Mari Matters team reviews submissions and contacts selected applicants directly.'},{title:'Join your cohort',text:'Accepted applicants receive instructions and a shared fellowship code to create their individual learning accounts.'},{title:'Learn and make an impact',text:'Complete four weeks and their in-portal quizzes, then pass the external online assessment to become a Financial Literacy Fellow. Complete the following community leadership stage to qualify as a Certified Financial Leader.'}].map((s,i)=><article key={i} className="panel"><span className="application-step-num">0{i+1}</span><h3>{s.title}</h3><p>{s.text}</p></article>)}</div><section className="panel application-callout"><h2>Already accepted?</h2><p>Sign in to your account or register with the cohort code supplied by the team.</p><Link className="btn" to="/login">Fellow login →</Link></section></main>}

async function getMemberData(userId){
 const member=await supabase.from('fellowship_members').select('*').eq('user_id',userId).maybeSingle();
 if(member.error)throw member.error;
 if(!member.data)return {member:null};
 const cohort=await supabase.rpc('my_fellowship_cohort');
 if(cohort.error)throw cohort.error;
 if(!cohort.data?.fellowship_course_id)throw new Error('Your cohort is not available. Please contact the fellowship administrator.');
 const fellow={...member.data,fellowship_cohorts:cohort.data};
 const [lessons,progress,quizAttempts]=await Promise.all([
  supabase.from('lessons').select('id,title,position').eq('course_id',cohort.data.fellowship_course_id).order('position'),
  supabase.from('lesson_progress').select('lesson_id').eq('user_id',userId),
  supabase.from('fellowship_quiz_attempts').select('week,score,passed,submitted_at').eq('user_id',userId).eq('course_id',cohort.data.fellowship_course_id)
 ]);
 for(const response of [lessons,progress,quizAttempts])if(response.error)throw response.error;
 return {member:fellow,lessons:lessons.data||[],progress:progress.data||[],quizAttempts:quizAttempts.data||[]};
}
export function FellowshipInviteActivate({user}){const [code,setCode]=useState(()=>sessionStorage.getItem('mari_pending_code')||''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function activate(e){e.preventDefault();setBusy(true);setMessage('');const {data,error}=await supabase.rpc('redeem_shared_fellowship_code',{p_code:code.trim()});setBusy(false);if(error)setMessage(errorText(error));else{sessionStorage.removeItem('mari_pending_code');setMessage('Invitation activated! You have joined '+data.cohort+'. Open your fellowship dashboard.');}}
 return <main className="wrap fellowship-inner auth"><section className="panel"><span className="eyebrow">Accepted fellows only</span><h1>Activate your invitation</h1><p>Signed in as <strong>{user.email}</strong>. Enter the shared registration code provided by your cohort coordinator. Weekly quizzes are completed in this portal. The final online assessment and leadership-stage project submissions are organised separately.</p><form onSubmit={activate}><label>Fellowship registration code<input required placeholder="Cohort registration code" autoComplete="off" value={code} onChange={e=>setCode(e.target.value)}/></label><button disabled={busy||!code.trim()}>{busy?'Activating...':'Activate fellowship access'}</button></form>{message&&<p className="notice">{message}</p>}<Link to="/fellowship">Open fellowship dashboard →</Link></section></main>}
export default function FellowshipPortal({user}){
 const [data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{let mounted=true;(async()=>{try{const d=await getMemberData(user.id);if(mounted)setData(d)}catch(e){if(mounted)setError(errorText(e))}finally{if(mounted)setLoading(false)}})();return()=>{mounted=false}},[user.id]);
 if(loading)return <main className="wrap fellowship-inner"><p>Loading your fellowship learning space...</p></main>;
 if(error)return <main className="wrap fellowship-inner"><p className="notice">{error}</p></main>;
 if(!data?.member)return <main className="wrap fellowship-inner"><span className="eyebrow">Accepted participants</span><h1>Welcome to Mari Matters</h1><div className="panel"><h2>Activate your learning access</h2><p>Use the shared registration code given to accepted fellows by their cohort coordinator. Once activated, your four-week learning materials will open here.</p><Link className="btn" to="/activate">Enter fellowship code →</Link><p>If you are not yet an accepted participant, <Link to="/apply">learn about joining a future cohort</Link>.</p></div></main>;
 const {member,lessons,progress,quizAttempts}=data;
 const passedWeeks=new Set(quizAttempts.filter(a=>a.passed).map(a=>a.week));
 const completed=lessons.filter(l=>progress.some(p=>p.lesson_id===l.id)).length;
 const weekData=[{name:'Understanding money and financial wellbeing',desc:'Income, household budgeting and money decisions in everyday Zimbabwe.'},{name:'Saving, borrowing and financial protection',desc:'Emergency funds, mukando, debt, digital payments and consumer safety.'},{name:'Building financial independence',desc:'Small business money, cash flow, goals and money conversations.'},{name:'Financial literacy leadership',desc:'Sharing financial knowledge and planning community education.'}];
 return <main className="wrap fellowship-inner"><span className="eyebrow">Mari Matters · Four-week learning</span><h1>My Fellowship Learning Space</h1><p>{member.fellowship_cohorts.name} · Learn at your own pace and complete your ten-question weekly quizzes here and take part in your separate cohort discussions.</p><div className="fellow-dashboard-stats"><div><span>Learning units</span><strong>{completed} of {lessons.length} complete</strong></div><div><span>Learning pathway</span><strong>Four weeks online</strong></div><div><span>Weekly quizzes passed</span><strong>{passedWeeks.size} of 4</strong></div></div>
 <div className="panel"><h2>Stage 1 · Become a Financial Literacy Fellow</h2><p>Each week introduces practical financial topics and activities. Read your learning materials here and mark completed units so you can track your progress. Each week ends with a ten-question multiple-choice quiz, automatically marked. Score at least 70% to unlock the next week; you can retake any quiz until you pass.</p><div className="fellow-progress"><div style={{width:(lessons.length?100*completed/lessons.length:0)+'%'}}/></div><p>{completed} of {lessons.length} learning units completed.</p><div className="week-grid">{weekData.map((w,i)=>{const subset=lessons.filter(l=>l.position>=i*3+1&&l.position<=(i+1)*3);const count=subset.filter(l=>progress.some(p=>p.lesson_id===l.id)).length;return <article key={i}><strong>WEEK {String(i+1).padStart(2,'0')}</strong><h3>{w.name}</h3><p>{w.desc}</p><small>{count}/{subset.length} lessons · {passedWeeks.has(i+1)?'✓ Quiz passed':i===0||passedWeeks.has(i)?'Quiz pending':'Next week locked'}</small></article>})}</div><p style={{marginTop:24}}><Link className="btn" to={'/learn/'+member.fellowship_cohorts.fellowship_course_id}>Open learning materials →</Link></p></div>
 <section className="mari-award-pathway" aria-label="Two-stage fellowship recognition">
  <div className="panel mari-award-step"><span className="eyebrow">STAGE 1 · FOUR WEEKS + ONLINE ASSESSMENT</span><h2>Financial Literacy Fellow</h2><p>Complete the twelve lessons and four weekly portal quizzes, then pass the separate final online assessment. The Mari Matters team verifies the result before awarding the Financial Literacy Fellow title.</p><div className={'award-progress '+(member.assessment_passed_at?'award-achieved':'')}><strong>{member.assessment_passed_at?'✓ Award confirmed':passedWeeks.size===4?'Final assessment / verification pending':'Complete your four-week learning'}</strong>{member.assessment_passed_at&&<small>Verified on {fmtDate(member.assessment_passed_at)}</small>}</div></div>
  <div className="panel mari-award-step"><span className="eyebrow">STAGE 2 · COMMUNITY LEADERSHIP</span><h2>Certified Financial Leader</h2><p>Once recognised as a Financial Literacy Fellow, proceed to the practical leadership stage: plan and deliver an approved community financial literacy initiative and complete the review requirements communicated by Mari Matters.</p><div className={'award-progress '+(member.leadership_completed_at?'award-achieved':'')}><strong>{member.leadership_completed_at?'✓ Leadership certification confirmed':member.assessment_passed_at?'Leadership stage in progress / awaiting review':'Unlocks after Stage 1 recognition'}</strong>{member.leadership_completed_at&&<small>Verified on {fmtDate(member.leadership_completed_at)}</small>}</div></div>
 </section>
 <MyCertificates userId={user.id}/>
 <p className="notice">These are programme-awarded Mari Matters titles. Passing weekly quizzes alone does not grant either title; recognition follows verified final assessment results and, for the second stage, approved practical community leadership work. Neither title represents a government-issued professional licence.</p>
 </main>
}
export function FellowshipAdmin(){const [cohorts,setCohorts]=useState([]),[members,setMembers]=useState([]),[name,setName]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 async function reload(){
  const [a,b]=await Promise.all([
   supabase.from('fellowship_cohorts').select('*').order('created_at',{ascending:false}),
   supabase.from('fellowship_members').select('*,fellowship_cohorts(name)').order('joined_at',{ascending:false})
  ]);
  setCohorts(a.data||[]);
  if(a.error||b.error){setMembers(b.data||[]);setMessage(errorText(a.error||b.error));return}
  const fellows=b.data||[];
  if(!fellows.length){setMembers([]);setMessage('');return}
  const ids=[...new Set(fellows.map(m=>m.user_id))];
  const {data:profiles,error:profilesError}=await supabase.from('profiles').select('id,full_name').in('id',ids);
  const names=new Map((profiles||[]).map(p=>[p.id,p.full_name?.trim()||'']));
  setMembers(fellows.map(m=>({...m,fellowName:names.get(m.user_id)||''})));
  setMessage(profilesError?errorText(profilesError):'');
 }
 useEffect(()=>{reload()},[]);
 async function changeCohortStatus(cohort,newStatus){
 setBusy(true);setMessage('');
 const {error}=await supabase.from('fellowship_cohorts').update({status:newStatus}).eq('id',cohort.id);
 setBusy(false);
 if(error)setMessage(errorText(error));else{setMessage(cohort.name+' is now '+newStatus+'.');await reload()}
}
 async function confirmAward(member,kind){
  const question=kind==='assessment'?'Have you checked this fellow\'s external online assessment result and confirmed they passed?':'Have you reviewed and approved this fellow\'s community leadership project and all Stage 2 requirements?';
  if(!window.confirm(question))return;
  setBusy(true);setMessage('');
  const {error}=await supabase.rpc(kind==='assessment'?'confirm_fellowship_assessment':'confirm_fellowship_leadership',{p_member_id:member.id});
  setBusy(false);
  if(error)setMessage(errorText(error));else{await reload();setMessage(kind==='assessment'?'Financial Literacy Fellow recognition recorded.':'Certified Financial Leader recognition recorded.')}
 }
 async function addCohort(e){e.preventDefault();setBusy(true);const {error}=await supabase.from('fellowship_cohorts').insert({name:name.trim(),status:'planned',fellowship_course_id:PROGRAM_ID});setBusy(false);setMessage(error?errorText(error):'Cohort created. A registration code must be configured before it can admit participants.');if(!error){setName('');reload()}}
 return <main className="wrap fellowship-inner"><span className="eyebrow">Mari Matters · Administration</span><h1>Fellowship Learning Administration</h1><p>The portal manages learning access, cohorts and study materials. Weekly quizzes are marked and recorded in the portal. Cohort discussions, the final Google Form assessment and community project submissions are handled separately.</p>{message&&<p className="notice">{message}</p>}<div className="fellow-dashboard-stats"><div><span>Cohorts</span><strong>{cohorts.length}</strong></div><div><span>Registered fellows</span><strong>{members.length}</strong></div><div><span>Delivery model</span><strong>Online learning</strong></div></div>
 <section className="panel admin-section"><h2>Current cohorts</h2>{cohorts.map(c=><div className="cohort-row mari-cohort-admin-row" key={c.id}><div><strong>{c.name}</strong><small>{c.status}{/^Mari Matters Cohort ([1-9]|1[0-9]|20)$/.test(c.name)?' · Access code: Mari'+c.name.match(/[0-9]+$/)[0]:''}</small></div><div className="mari-cohort-actions"><span className={'cohort-status '+c.status}>{c.status}</span>{c.status==='planned'||c.status==='closed'?<button type="button" className="small" disabled={busy} onClick={()=>changeCohortStatus(c,'open')}>Open registration</button>:c.status==='open'||c.status==='active'?<button type="button" className="small" disabled={busy} onClick={()=>changeCohortStatus(c,'closed')}>Close registration</button>:null}</div></div>)}<form onSubmit={addCohort}><label>New cohort name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Mari Matters Cohort 2027 — Group 1"/></label><button disabled={busy}>Create cohort</button></form></section>
 <section className="panel admin-section"><h2>Fellows · assessment and leadership recognition</h2><p>After checking a participant's external final Google Form result, confirm Stage 1 to recognise them as a Financial Literacy Fellow. After reviewing and approving the subsequent community leadership stage, confirm Stage 2 to recognise them as a Certified Financial Leader. Each approval automatically issues a permanent numbered certificate, downloadable by the fellow under My Fellowship and My Account. Please verify the fellow’s full name before approving.</p>{members.length?members.map(m=><div className="cohort-row mari-member-review" key={m.id}><div><strong>{m.fellowName||'Name not provided'}</strong><small>{m.fellowship_cohorts?.name} · {stages[m.stage]||m.stage}</small></div><div className="mari-review-actions">{m.leadership_completed_at?<strong>✓ Certified Financial Leader</strong>:m.assessment_passed_at?<><strong>✓ Financial Literacy Fellow</strong><button type="button" className="small" disabled={busy} onClick={()=>confirmAward(m,'leadership')}>Confirm leadership stage completed</button></>:<button type="button" className="small" disabled={busy} onClick={()=>confirmAward(m,'assessment')}>Confirm final assessment passed</button>}</div></div>):<p>No fellows have activated their accounts yet.</p>}</section>
 <FinalAssessmentAdmin courseId={PROGRAM_ID}/>
 <section className="panel admin-section"><h2>Learning materials</h2><p>Manage the four-week learning units using the existing protected content editor. This is an internal administrator tool, not a public course catalogue.</p><Link className="btn" to={'/admin/courses/'+PROGRAM_ID}>Edit fellowship learning materials →</Link></section></main>
}
