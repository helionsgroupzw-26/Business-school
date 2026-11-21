import React,{useEffect,useState} from 'react';
import {Link,NavLink,Navigate,Routes,Route,useNavigate,useParams} from 'react-router-dom';
import {supabase,configured,errorText} from './supabase';
import FinalQuiz from './FinalQuiz.jsx';
import LessonPractice from './LessonPractice.jsx';
import MyAccount from './MyAccount.jsx';
import {VerifyCertificate} from './FellowshipCertificates.jsx';
import {WeeklyQuiz,ExternalFinalAssessment} from './FellowshipQuizzes.jsx';
import FellowshipPortal,{FellowshipHome,FellowshipApplication,FellowshipAdmin,FellowshipInviteActivate} from './FellowshipPortal.jsx';
const emptyCourse={title:'',description:'',category:'Money & Budgeting',level:'Beginner',duration:'',published:false};
function App(){
 const [session,setSession]=useState(undefined),[profile,setProfile]=useState(undefined);
 useEffect(()=>{if(!supabase){setSession(null);setProfile(null);return}let active=true;async function sync(s){if(!active)return;setSession(s);if(!s){setProfile(null);return}const {data}=await supabase.from('profiles').select('*').eq('id',s.user.id).maybeSingle();if(active)setProfile(data||{role:'student'})}supabase.auth.getSession().then(({data})=>sync(data.session));const {data:{subscription}}=supabase.auth.onAuthStateChange((_,s)=>{setTimeout(()=>sync(s),0)});return()=>{active=false;subscription.unsubscribe()}},[]);
 const admin=profile?.role==='admin',user=session?.user;
 async function signout(){await supabase.auth.signOut()}
 return <><header><nav className="wrap nav"><Link className="brand" to="/" aria-label="Mari Matters Financial Literacy Leadership Programme"><span className="brand-mark"><span className="brand-mari">MARI</span><span className="brand-matters">Matters</span></span><span className="brand-label">FINANCIAL LITERACY <b>LEADERSHIP</b></span></Link><div><NavLink to="/">Home</NavLink><a href="/#mission">Our Mission</a><a href="/#journey">The Fellowship</a><a href="https://forms.gle/2VtJLHfnDFEpRz3G8" target="_blank" rel="noopener noreferrer" className="nav-apply">Apply Now ↗</a>{user&&<NavLink to="/fellowship">My Fellowship</NavLink>}{user&&<NavLink to="/account">My Account</NavLink>}{admin&&<NavLink to="/admin/fellowship">Admin</NavLink>}{user?<button onClick={signout} className="small">Sign out</button>:<Link className="small" to="/login">Fellow Login</Link>}</div></nav></header>{!configured&&<div className="notice">Setup required: Configure the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables in Vercel.</div>}<Routes><Route path="/" element={<Home/>}/><Route path="/apply" element={<FellowshipApplication/>}/><Route path="/fellowship" element={<Guard session={session} profile={profile}><FellowshipPortal user={user} profile={profile}/></Guard>}/><Route path="/activate" element={<Guard session={session} profile={profile}><FellowshipInviteActivate user={user}/></Guard>}/><Route path="/admin/fellowship" element={<Guard session={session} profile={profile} admin><FellowshipAdmin userId={user?.id}/></Guard>}/><Route path="/journey" element={<Navigate to="/fellowship" replace/>}/><Route path="/courses" element={<Navigate to="/fellowship" replace/>}/><Route path="/courses/:id" element={<Navigate to="/fellowship" replace/>}/><Route path="/account" element={<Guard session={session} profile={profile}><MyAccount user={user} onUpdated={async()=>{const {data}=await supabase.from("profiles").select("*").eq("id",user.id).maybeSingle();if(data)setProfile(data)}}/></Guard>}/><Route path="/login" element={<Auth user={user}/>}/><Route path="/verify/:id" element={<VerifyCertificate/>}/><Route path="/forgot-password" element={<ForgotPassword/>}/><Route path="/reset-password" element={<ResetPassword/>}/><Route path="/dashboard" element={<Navigate to="/fellowship" replace/>}/><Route path="/learn/:id" element={<Guard session={session} profile={profile}><Learning user={user}/></Guard>}/><Route path="/quiz/:id" element={<Guard session={session} profile={profile}><FellowshipSafeFinalQuiz user={user} profile={profile}/></Guard>}/><Route path="/admin" element={<Navigate to="/admin/fellowship" replace/>}/><Route path="/admin/courses/:id" element={<Guard session={session} profile={profile} admin><EditCourse/></Guard>}/><Route path="*" element={<main className="wrap"><h1>Page not found</h1><Link to="/">Home</Link></main>}/></Routes><footer><div className="wrap footer-inner"><strong>MARI <span>Matters</span> Financial Literacy Leadership Programme</strong><p>Changing mindsets. Building wealth. Empowering financial literacy leaders across African communities.</p><small>© {new Date().getFullYear()} Mari Matters. Fellowship education and community service, not financial advisory accreditation.</small></div></footer></>
}
function Guard({session,profile,admin,children}){if(session===undefined||profile===undefined)return <main className="wrap">Loading...</main>;if(!session)return <Navigate to="/login" replace/>;if(admin&&profile.role!=='admin')return <main className="wrap"><h2>Administrator access required</h2><p>Your account does not have administrator permissions.</p></main>;return children}
function Notice({message}){return message&&<p className="notice">{message}</p>}

function youtubeVideoId(link){
 try{
  const parsed=new URL(link);
  const host=parsed.hostname.toLowerCase();
  let id='';
  if(host==='youtu.be'||host==='www.youtu.be')id=parsed.pathname.split('/')[1]||'';
  else if(['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(host)){
   if(parsed.pathname==='/watch')id=parsed.searchParams.get('v')||'';
   else if(/^\/(embed|shorts|live)\//.test(parsed.pathname))id=parsed.pathname.split('/')[2]||'';
  }
  return /^[a-zA-Z0-9_-]{11}$/.test(id)?id:null;
 }catch{return null}
}
function LessonVideo({url,title,position}){
 const [player,setPlayer]=useState('normal');
 const [started,setStarted]=useState(false);
 const [playerError,setPlayerError]=useState(false);
 useEffect(()=>{setPlayer('normal');setStarted(false);setPlayerError(false)},[url]);
 if(!url)return <section className="lesson-video-section"><strong>Video lesson not available</strong><p>Continue with the written lesson and interactive activities.</p></section>;
 const id=youtubeVideoId(url);
 const safeUrl=id?'https://www.youtube.com/watch?v='+id:url;
 const origin=typeof window!=='undefined'?encodeURIComponent(window.location.origin):'';
 const embed=id?(player==='normal'?'https://www.youtube.com/embed/':'https://www.youtube-nocookie.com/embed/')+id+'?rel=0&playsinline=1&origin='+origin:null;
 return <section className="lesson-video-section" aria-label={'Supporting video for lesson '+position}>
  <div className="video-heading"><span className="video-heading-icon">▶</span><div><h3>Watch & Learn · Unit {position}</h3><p>Supporting video for <strong>{title}</strong></p></div></div>
  {embed?<div className="video-frame">
   {started?<iframe key={embed} src={embed} title={'Week '+Math.ceil(position/3)+' unit '+position+' video: '+title} loading="eager" referrerPolicy="strict-origin-when-cross-origin" onError={()=>setPlayerError(true)} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/>:
   <button type="button" className="video-launch" onClick={()=>setStarted(true)}><span className="video-play-icon">▶</span><strong>Play Unit {position} video here</strong><small>Tap to start the video without leaving the portal</small></button>}
  </div>:<p>The saved video address is invalid. Please ask the Mari Matters team to update this lesson.</p>}
  {playerError&&<p className="notice">The video could not load in this player. Try the alternative player or the YouTube link below.</p>}
  {id&&<div className="video-controls"><button type="button" className="video-player-toggle" onClick={()=>{setPlayer(v=>v==='normal'?'privacy':'normal');setStarted(true);setPlayerError(false)}}>↻ Try {player==='normal'?'alternative':'standard'} player</button><a href={safeUrl} target="_blank" rel="noopener noreferrer">If blocked, watch on YouTube ↗</a></div>}
  <p className="video-disclaimer">Some videos are hosted by independent educators. Playback may be restricted by YouTube or a video owner; the reading material and practice activity remain available.</p>
 </section>
}
function ReadableLesson({content}){if(!content)return null;const blocks=content.split(/\n\s*\n/).map(x=>x.trim()).filter(Boolean).filter(x=>!(/^video:\s*https?:\/\//i.test(x)||(/^(?:LEARNING VIDEO|VIDEO EXPLAINER)$/i.test(x))));return <div className="fellow-reading">{blocks.map((block,i)=>{const head=block.length<125&&block===block.toUpperCase()&&/[A-Z]/.test(block)&&!/^HTTPS?:/.test(block);if(head)return <h3 className="reading-subhead" key={i}>{block}</h3>;const parts=block.split(/(https?:\/\/[^\s]+)/g);return <p key={i}>{parts.map((part,j)=>/^https?:\/\//.test(part)?<a key={j} href={part} target="_blank" rel="noopener noreferrer">{part.replace(/^https?:\/\//,'').replace(/^www\./,'')}</a>:<React.Fragment key={j}>{part}</React.Fragment>)}</p>})}</div>}

function useRows(table,filters=[],sort){const [rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('');async function reload(){if(!supabase){setLoading(false);return}setLoading(true);let q=supabase.from(table).select('*');for(const [column,value] of filters)q=q.eq(column,value);if(sort)q=q.order(sort);const {data,error}=await q;if(error)setError(errorText(error));else{setRows(data||[]);setError('')}setLoading(false)}useEffect(()=>{reload()},[table,JSON.stringify(filters),sort]);return {rows,loading,error,reload}}
function Home(){return <FellowshipHome/>}
function CourseGrid({courses}){return courses.length?<div className="grid">{courses.map(c=><article className="card" key={c.id}><div className="art"><span className="course-art-symbol">✦</span><small>{c.category}</small></div><div className="pad"><span className="eyebrow">{c.level} · {c.duration||'Self-paced'}</span><h3>{c.title}</h3><p>{c.description}</p><Link to={'/courses/'+c.id}>View course →</Link></div></article>)}</div>:<div className="empty">No courses published yet. Check back soon.</div>}
function Courses(){const [search,setSearch]=useState('');const {rows,loading,error}=useRows('courses',[['published',true]]);return <main className="wrap"><span className="eyebrow">Mari Matters Academy</span><h1>Explore our financial literacy courses</h1><p>Choose practical lessons that speak to your money goals, whether you are managing a household budget, growing a side hustle or planning for the future.</p><input placeholder="Search courses..." value={search} onChange={e=>setSearch(e.target.value)}/><Notice message={error}/>{loading?'Loading...':<CourseGrid courses={rows.filter(c=>(c.title+' '+c.category+' '+c.description).toLowerCase().includes(search.toLowerCase()))}/>}</main>}
function CourseDetail({user}){const {id}=useParams(),nav=useNavigate();const {rows}=useRows('courses',[['id',id]]);const {rows:enrollments,reload}=useRows('enrollments',user?[['course_id',id],['user_id',user.id]]:[['course_id','00000000-0000-0000-0000-000000000000']]);const [busy,setBusy]=useState(false),[error,setError]=useState('');const course=rows[0];async function enroll(){if(!user){nav('/login');return}setBusy(true);const {error}=await supabase.from('enrollments').insert({course_id:id,user_id:user.id});setBusy(false);if(error)setError(errorText(error));else reload()}return <main className="wrap"><Link to="/courses">← All courses</Link>{course?<><span className="eyebrow">{course.category} · {course.level}</span><h1>{course.title}</h1><p>{course.description}</p><p>Duration: {course.duration||'Self-paced'}</p>{enrollments.length?<Link className="btn" to={'/learn/'+id}>Continue learning →</Link>:<button onClick={enroll} disabled={busy}>{busy?'Enrolling...':'Enrol in course'}</button>}<Notice message={error}/></>:<p>Loading course...</p>}</main>}
function Auth({user}){
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[code,setCode]=useState(''),[signup,setSignup]=useState(false),[busy,setBusy]=useState(false),[googleBusy,setGoogleBusy]=useState(false),[message,setMessage]=useState('');
 const navigate=useNavigate();
 if(user)return <Navigate to="/fellowship" replace/>;
 async function validateCode(){
  const normalized=code.trim();
  if(!normalized){setMessage('Enter the cohort registration code supplied by Mari Matters to create a fellow account.');return null}
  const {data,error}=await supabase.rpc('validate_shared_fellowship_code',{p_code:normalized});
  if(error||!data){setMessage(error?errorText(error):'That cohort code is not currently active. Please check with your coordinator.');return null}
  return normalized.toUpperCase();
 }
 async function submit(e){
  e.preventDefault();if(!supabase)return;
  setBusy(true);setMessage('');
  if(signup){
   const validCode=await validateCode();
   if(!validCode){setBusy(false);return}
   sessionStorage.setItem('mari_pending_code',validCode);
   const {error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});
   setBusy(false);
   setMessage(error?errorText(error):'Account created. Check your email for confirmation, then sign in using the same address to activate your fellowship.');
  }else{
   const {error}=await supabase.auth.signInWithPassword({email,password});
   setBusy(false);
   if(error)setMessage(errorText(error));else navigate('/fellowship');
  }
 }
 async function continueGoogle(){
  if(!supabase||googleBusy)return;
  setGoogleBusy(true);setMessage('');
  let path='/fellowship';
  if(signup){
   const validCode=await validateCode();
   if(!validCode){setGoogleBusy(false);return}
   sessionStorage.setItem('mari_pending_code',validCode);
   path='/activate';
  }
  const {error}=await supabase.auth.signInWithOAuth({
   provider:'google',
   options:{redirectTo:window.location.origin+path,queryParams:{prompt:'select_account'}}
  });
  if(error){
   setGoogleBusy(false);
   setMessage(errorText(error)+'. If Google sign-in is not yet enabled, the administrator must configure the Google provider in Supabase.');
  }
 }
 return <main className="wrap auth"><div className="panel">
  <span className="eyebrow">Invitation-only fellowship</span>
  <h1>{signup?'Create your fellowship account':'Welcome back, fellow'}</h1>
  <p>{signup?'Accepted participants can register with a cohort code. Choose Google to create an account without a separate password, or use an email and password.':'Sign in with your Google account or your existing email and password to continue your four-week learning journey.'}</p>
  {signup&&<div className="google-enrol-fields"><label>Fellowship cohort code<input required autoComplete="off" placeholder="e.g. Mari1" value={code} onChange={e=>setCode(e.target.value)}/></label><small>This must be an active cohort code provided to accepted fellows.</small></div>}
  <button type="button" className="google-auth-button" disabled={googleBusy||busy||!configured} onClick={continueGoogle}>
   <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.27 5.48-4.8 7.18l7.73 6C44.38 38.02 46.98 31.87 46.98 24.55z"/><path fill="#FBBC05" d="M10.53 28.59A14.42 14.42 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.88 23.88 0 0 0 0 24c0 3.87.93 7.53 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
   <span>{googleBusy?'Opening Google…':signup?'Create account with Google':'Continue with Google'}</span>
  </button>
  <div className="google-auth-divider"><span>or use email and password</span></div>
  <form onSubmit={submit}>
   {signup&&<label>Full name<input required value={name} onChange={e=>setName(e.target.value)} autoComplete="name"/></label>}
   <label>Email address<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
   <label>Password<input type="password" minLength={6} autoComplete={signup?'new-password':'current-password'} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
   <button disabled={busy||googleBusy||!configured}>{busy?'Processing...':signup?'Create account using email':'Sign in with email'}</button>
  </form>
  {signup&&<p className="google-auth-info">For Google registration, enter your cohort code above first. After selecting your Google account, you will be asked to activate your fellowship code. Existing fellows can return using their linked sign-in method.</p>}
  <Notice message={message}/>
  {!signup&&<p className="auth-recover"><Link to="/forgot-password">Forgot your password? Reset it here →</Link></p>}
  <button className="linkbutton" type="button" onClick={()=>{setSignup(!signup);setMessage('')}}>{signup?'Already registered? Sign in':'Accepted into the fellowship? Create an account'}</button>
  <p>Not yet selected? <Link to="/apply">Learn about applying for the next cohort →</Link></p>
 </div></main>
}
function ForgotPassword(){
 const [email,setEmail]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[sent,setSent]=useState(false);
 async function requestReset(e){
  e.preventDefault();if(!supabase)return;setBusy(true);setMessage('');
  const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+'/reset-password'});
  setBusy(false);
  if(error)setMessage(errorText(error));else{setSent(true);setMessage('If this email is registered, a password-reset message has been sent. Check your inbox and spam folder.')}
 }
 return <main className="wrap auth"><div className="panel"><span className="eyebrow">Account recovery</span><h1>Reset your password</h1><p>Enter the email address used for your Mari Matters account. We'll email a secure link to set a new password. You will not lose your role, learning history or cohort access.</p><form onSubmit={requestReset}><label>Email address<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></label><button type="submit" disabled={busy||!configured}>{busy?'Sending email...':sent?'Send another reset email':'Send password reset link'}</button></form>{message&&<p role="status" className="notice">{message}</p>}<Link to="/login" className="auth-back-link">← Back to sign in</Link></div></main>
}
function ResetPassword(){
 const [password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[status,setStatus]=useState('Checking your recovery link...'),[ready,setReady]=useState(false),[busy,setBusy]=useState(false),[done,setDone]=useState(false);
 useEffect(()=>{
  if(!supabase){setStatus('Account recovery is not configured.');return}
  let active=true;
  async function checkSession(){
   const {data}=await supabase.auth.getSession();
   if(active&&data.session){setReady(true);setStatus('You can now choose a new password.')}
   else if(active){setStatus('This recovery link has expired or has not been verified. Request a new link from the sign-in page.')}
  }
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
   if(!active)return;
   if((event==='PASSWORD_RECOVERY'||event==='SIGNED_IN')&&session){setReady(true);setStatus('You can now choose a new password.')}
  });
  checkSession();
  return()=>{active=false;subscription.unsubscribe()}
 },[]);
 async function save(e){
  e.preventDefault();
  if(password.length<8){setStatus('Choose a password with at least eight characters.');return}
  if(password!==confirm){setStatus('The passwords do not match.');return}
  setBusy(true);setStatus('');
  const {error}=await supabase.auth.updateUser({password});
  setBusy(false);
  if(error)setStatus(errorText(error));else{setDone(true);setStatus('Password updated successfully. Your account and administrator permissions are unchanged.')}
 }
 return <main className="wrap auth"><div className="panel"><span className="eyebrow">Secure account recovery</span><h1>Choose a new password</h1><p>Use the recovery link from your email to reset your existing account password.</p>{ready&&!done?<form onSubmit={save}><label>New password<input type="password" minLength={8} required autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><label>Confirm new password<input type="password" minLength={8} required autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label><button type="submit" disabled={busy}>{busy?'Saving password...':'Update password'}</button></form>:null}<p role="status" className="notice">{status}</p>{done?<Link className="btn" to="/admin/fellowship">Go to administrator dashboard →</Link>:<Link className="auth-back-link" to="/forgot-password">Request a new reset link →</Link>}</div></main>
}
function Dashboard({user}){const {rows:enrollments,error}=useRows('enrollments',[['user_id',user.id]]);const {rows:courses}=useRows('courses');return <main className="wrap"><span className="eyebrow">Your Mari Matters journey</span><h1>My Learning</h1><p>Welcome to your learning space. Pick up where you left off and keep building practical money skills.</p><Notice message={error}/><div className="grid">{enrollments.map(e=>{const c=courses.find(c=>c.id===e.course_id);return c&&<article className="card pad" key={e.id}><h3>{c.title}</h3><p>{c.category}</p><Link className="btn" to={'/learn/'+c.id}>Continue learning →</Link></article>})}</div>{!enrollments.length&&<div className="empty">You haven't enrolled in any courses. <Link to="/courses">Explore courses</Link></div>}</main>}
function FellowshipSafeFinalQuiz({user,profile}){
 const {id}=useParams();
 if(id==='4617f7ff-344c-43d3-af2b-9d1a9afb005e')return <Navigate to="/fellowship" replace/>;
 return <FinalQuiz user={user} profile={profile}/>;
}
function Learning({user}){
 const {id}=useParams();
 const fellowship=id==='4617f7ff-344c-43d3-af2b-9d1a9afb005e';
 const {rows:enrollments,loading:enrollmentLoading}=useRows('enrollments',[['course_id',id],['user_id',user.id]]);
 const {rows:courses}=useRows('courses',[['id',id]]);
 const {rows:lessons,loading:lessonsLoading}=useRows('lessons',[['course_id',id]],'position');
 const {rows:progress,loading:progressLoading,reload:reloadProgress}=useRows('lesson_progress',[['user_id',user.id]]);
 const {rows:attempts,loading:attemptsLoading,reload:reloadAttempts}=useRows('fellowship_quiz_attempts',[['user_id',user.id],['course_id',id]]);
 const [selected,setSelected]=useState(null),[url,setUrl]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const completedIds=new Set(progress.map(p=>p.lesson_id));
 const passedWeeks=new Set(attempts.filter(a=>a.passed).map(a=>a.week));
 const weekOpen=w=>!fellowship||w===1||passedWeeks.has(w-1);
 const lessonOpen=l=>weekOpen(Math.ceil(l.position/3));
 const pending=lessons.filter(l=>!completedIds.has(l.id));
 const current=lessons.find(l=>l.id===selected);
 const active=(current&&lessonOpen(current)?current:null)||pending.find(lessonOpen)||lessons.find(lessonOpen)||null;
 const completeCount=lessons.filter(l=>completedIds.has(l.id)).length;
 const allFinished=lessons.length>0&&completeCount===lessons.length;
 const readingFinished=active&&completedIds.has(active.id);
 const next=active?pending.find(l=>l.position>active.position&&lessonOpen(l)):null;
 useEffect(()=>{setUrl('')},[active?.id]);
 function openLesson(lessonId){const lesson=lessons.find(l=>l.id===lessonId);if(!lesson||!lessonOpen(lesson))return;setError('');setSelected(lessonId);window.scrollTo({top:0,behavior:'smooth'})}
 async function completeAndContinue(){
  if(!active||completedIds.has(active.id)||busy)return;
  setBusy(true);setError('');
  const currentWeek=Math.ceil(active.position/3);
  const nextLesson=lessons.find(l=>l.position>active.position&&!completedIds.has(l.id)&&lessonOpen(l));
  const {error:saveError}=await supabase.from('lesson_progress').insert({user_id:user.id,lesson_id:active.id});
  if(saveError){setError(errorText(saveError));setBusy(false);return}
  await reloadProgress();setBusy(false);
  if(nextLesson){setSelected(nextLesson.id);window.scrollTo({top:0,behavior:'smooth'})}
  else if(fellowship&&!passedWeeks.has(currentWeek)){
   setSelected(active.id);
   window.setTimeout(()=>document.getElementById('week-'+currentWeek+'-quiz')?.scrollIntoView({behavior:'smooth',block:'start'}),150);
  }else{setSelected(null);window.scrollTo({top:0,behavior:'smooth'})}
 }
 async function download(){
  if(!active?.file_path)return;
  const {data,error:downloadError}=await supabase.storage.from('lesson-materials').createSignedUrl(active.file_path,90);
  if(downloadError)setError(errorText(downloadError));else setUrl(data.signedUrl);
 }
 if(enrollmentLoading||lessonsLoading||progressLoading)return <main className="wrap"><p>Preparing your learning units and weekly assessments...</p></main>;
 if(!enrollments.length)return <main className="wrap"><h2>Fellowship access required</h2><p>This learning pathway is reserved for accepted fellows who have activated their cohort code.</p><Link to="/fellowship">My Fellowship</Link></main>;
 return <main className="wrap">
  <Link to="/fellowship">← Fellowship dashboard</Link>
  <h1>{fellowship?'My Fellowship Learning Units':courses[0]?.title||'Your learning pathway'}</h1>
  <p>{completeCount} of {lessons.length} units completed. {fellowship?'Finish the three lessons and pass the 10-question quiz (70%) to unlock the next week. Retake any quiz until you pass.':'Select a unit from the side panel and complete it to continue.'}</p>
  <div className="fellow-progress" role="progressbar" aria-label="Learning completion" aria-valuenow={completeCount} aria-valuemin="0" aria-valuemax={lessons.length||1}><div style={{width:(lessons.length?100*completeCount/lessons.length:0)+'%'}}/></div>
  <div className="learning fellowship-reader">
   <aside className="panel fellowship-sidebar">
    <h3>Learning units</h3>
    <p className="sidebar-hint">{fellowship?'Each week unlocks after you pass the previous week’s quiz. Completed lessons remain available for review.':'Choose an unfinished unit. Completed units are available for review below.'}</p>
    {fellowship?Array.from({length:4},(_,wi)=>wi+1).map(week=>{
      const weekLessons=lessons.filter(l=>Math.ceil(l.position/3)===week);
      const locked=!weekOpen(week);
      const completed=weekLessons.filter(l=>completedIds.has(l.id)).length;
      return <div key={week} className="sidebar-week-group">
       <div className="sidebar-week">WEEK {week} {passedWeeks.has(week)?'· ✓ PASSED':locked?'· 🔒 LOCKED':''}</div>
       {weekLessons.map(l=><button type="button" key={l.id} disabled={locked} className={'lesson '+(active?.id===l.id?'selected ':'')+(completedIds.has(l.id)?'completed-lesson':'')} aria-current={active?.id===l.id?'step':undefined} onClick={()=>openLesson(l.id)}><span className="lesson-state">{locked?'🔒':completedIds.has(l.id)?'✓':'○'}</span><span>{l.title.replace(/^Week \d+\s*·\s*Lesson \d+\s*[—–-]\s*/i,'')}</span></button>)}
       <a className={'sidebar-quiz-link '+(locked?'locked':'')} href={'#week-'+week+'-quiz'}>Week {week} quiz · {passedWeeks.has(week)?'Passed':completed===3?'Ready':'10 questions'}</a>
      </div>
    }):<>{pending.map(l=><button type="button" key={l.id} className={'lesson '+(active?.id===l.id?'selected':'')} onClick={()=>openLesson(l.id)}>{l.title}</button>)}{completeCount>0&&<details className="completed-units"><summary>✓ Completed units ({completeCount})</summary>{lessons.filter(l=>completedIds.has(l.id)).map(l=><button type="button" key={l.id} className="lesson completed-lesson" onClick={()=>openLesson(l.id)}>✓ {l.title}</button>)}</details>}</>}
   </aside>
   <section className="panel lessoncontent" id="fellowship-lesson">
    {active?<><span className="eyebrow">{readingFinished?'Previously completed unit':'Unit '+active.position+' of '+lessons.length}</span><h2>{active.title}</h2><p>{active.summary}</p>
    <LessonVideo key={active.id} url={active.video_url} title={active.title} position={active.position}/>
    <ReadableLesson content={active.content}/>
    {fellowship&&<LessonPractice key={active.id} position={active.position}/>}
    {active.file_path&&<><button onClick={download}>Get study material</button>{url&&<p><a href={url} target="_blank" rel="noreferrer">Open study file ↗</a></p>}</>}
    <div className="lesson-next-actions">
     {readingFinished?<><p>✓ You have completed this unit. You may review it whenever you need to.</p>{pending.some(lessonOpen)?<button type="button" onClick={()=>openLesson(pending.find(lessonOpen).id)}>Continue with next unfinished unit →</button>:fellowship&&!passedWeeks.has(Math.ceil(active.position/3))?<a className="btn" href={'#week-'+Math.ceil(active.position/3)+'-quiz'}>Go to Week {Math.ceil(active.position/3)} quiz ↓</a>:<Link className="btn" to="/fellowship">Return to fellowship dashboard →</Link>}</>:
     <><p>Finished the video, reading and practical exercises? Mark this unit complete. After your third lesson in each week, take its automatic quiz.</p><button disabled={busy} onClick={completeAndContinue}>{busy?'Saving progress...':next?'✓ Complete & next lesson →':fellowship?'✓ Complete & continue to weekly quiz →':'✓ Complete lesson →'}</button></>}
     {error&&<p className="notice">{error}</p>}
    </div>
    </>:allFinished?<div className="learning-done"><h2>All twelve lessons completed!</h2><p>Review your weekly quiz results below, then take the external final online assessment. Passing that assessment earns Financial Literacy Fellow recognition after Mari Matters verifies your result. The later community leadership stage leads to Certified Financial Leader recognition.</p></div>:<div className="learning-done"><h2>Next week is locked</h2><p>Pass the previous week’s quiz with at least 70% to continue.</p></div>}
   </section>
  </div>
  {fellowship&&<div id="weekly-assessments" className="weekly-assessments">
    <div className="weekly-assessments-head"><span className="eyebrow">ASSESS YOUR LEARNING</span><h2>Weekly knowledge checks</h2><p>Each week contains ten single-answer multiple-choice questions. Your score is marked and saved automatically. Achieve at least 7/10 to unlock the next week; retakes are unlimited.</p></div>
    {Array.from({length:4},(_,i)=>i+1).map(week=><WeeklyQuiz key={week} week={week} courseId={id}
      lessonsDone={lessons.filter(l=>Math.ceil(l.position/3)===week&&completedIds.has(l.id)).length}
      priorPassed={week===1||passedWeeks.has(week-1)}
      passed={passedWeeks.has(week)}
      attempts={attempts.filter(a=>a.week===week)}
      onPassed={reloadAttempts}/>)}
    <ExternalFinalAssessment courseId={id} passedAll={[1,2,3,4].every(w=>passedWeeks.has(w))}/>
   </div>}
  {fellowship&&<section className="panel" style={{marginTop:24}}><h2>What comes after four weeks?</h2><p>After all four weekly quizzes, take the final online assessment through the Google Form provided here. Once your passing result is confirmed by Mari Matters, you become a Financial Literacy Fellow. You can then complete the separate practical community leadership stage and, once its requirements are approved, earn the Certified Financial Leader designation. Weekly quiz completion alone does not award either title.</p></section>}
 </main>
}
function Admin(){const {rows:courses,reload,error}=useRows('courses');const {rows:profiles}=useRows('profiles');async function remove(id){if(!confirm('Delete this course and all its lessons?'))return;const {error}=await supabase.from('courses').delete().eq('id',id);if(error)alert(errorText(error));else reload()}return <main className="wrap"><div className="heading"><div><span className="eyebrow">Mari Matters Academy administration</span><h1>Academy Management</h1></div><Link className="btn" to="/admin/courses/new">+ Add new course</Link></div><div className="stats"><div><b>{courses.length}</b> Courses</div><div><b>{courses.filter(c=>c.published).length}</b> Published</div><div><b>{profiles.length}</b> Users</div></div><h2>Manage courses</h2><Notice message={error}/><div className="panel">{courses.map(c=><div className="course-row" key={c.id}><div><b>{c.title}</b><small>{c.published?'Published':'Draft'} · {c.category}</small></div><div><Link to={'/admin/courses/'+c.id}>Edit / Lessons</Link><button className="danger small" onClick={()=>remove(c.id)}>Delete</button></div></div>)}{!courses.length&&<p>No courses yet. Create your first course.</p>}</div><h2>Registered students</h2><div className="panel">{profiles.map(p=><div className="course-row" key={p.id}><b>{p.full_name||'Student'}</b><span>{p.role}</span></div>)}</div></main>}
function EditCourse(){const {id}=useParams(),newCourse=!id,nav=useNavigate();const [course,setCourse]=useState(emptyCourse),[lessons,setLessons]=useState([]),[editing,setEditing]=useState(null),[lesson,setLesson]=useState({title:'',summary:'',content:'',video_url:'',position:1,file_path:''}),[file,setFile]=useState(null),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);async function refresh(){if(!id)return;const [c,l]=await Promise.all([supabase.from('courses').select('*').eq('id',id).single(),supabase.from('lessons').select('*').eq('course_id',id).order('position')]);if(c.data)setCourse(c.data);if(l.data)setLessons(l.data)}useEffect(()=>{refresh()},[id]);function change(k,v){setCourse(s=>({...s,[k]:v}))}async function saveCourse(e){e.preventDefault();setBusy(true);setMessage('');const payload={title:course.title,description:course.description,category:course.category,level:course.level,duration:course.duration,published:course.published,updated_at:new Date().toISOString()};const {data,error}=newCourse?await supabase.from('courses').insert(payload).select('id').single():await supabase.from('courses').update(payload).eq('id',id).select('id').single();setBusy(false);if(error)setMessage(errorText(error));else if(newCourse)nav('/admin/courses/'+data.id);else setMessage('Course saved successfully.')}function editLesson(l){setEditing(l?.id||'new');setLesson(l?{...l}:{title:'',summary:'',content:'',video_url:'',position:lessons.length+1,file_path:''});setFile(null);setMessage('')}async function saveLesson(e){e.preventDefault();setBusy(true);setMessage('');let path=lesson.file_path||null,newPath=null;try{if(file){if(file.size>10*1024*1024)throw Error('File exceeds 10 MB');const ext=file.name.split('.').pop().toLowerCase();if(!['pdf','doc','docx','ppt','pptx','png','jpg','jpeg'].includes(ext))throw Error('File type not supported');newPath=id+'/'+crypto.randomUUID()+'.'+ext;const {error}=await supabase.storage.from('lesson-materials').upload(newPath,file);if(error)throw error;path=newPath}const payload={course_id:id,title:lesson.title,summary:lesson.summary,content:lesson.content,video_url:lesson.video_url||null,position:Number(lesson.position),file_path:path};const {error}=editing==='new'?await supabase.from('lessons').insert(payload):await supabase.from('lessons').update(payload).eq('id',editing);if(error)throw error;setEditing(null);setMessage('Lesson saved.');refresh()}catch(e){setMessage(errorText(e));if(newPath)await supabase.storage.from('lesson-materials').remove([newPath])}finally{setBusy(false)}}async function deleteLesson(l){if(!confirm('Delete lesson?'))return;const {error}=await supabase.from('lessons').delete().eq('id',l.id);if(error)setMessage(errorText(error));else refresh()}return <main className="wrap"><Link to="/admin/fellowship">← Fellowship administration</Link><h1>{newCourse?'Create course':'Manage course'}</h1><form className="panel form" onSubmit={saveCourse}><label>Course title<input required value={course.title} onChange={e=>change('title',e.target.value)}/></label><label>Description<textarea value={course.description} onChange={e=>change('description',e.target.value)}/></label><div className="twocol"><label>Category<select value={course.category} onChange={e=>change('category',e.target.value)}>{['Money & Budgeting','Saving & Investing','Debt & Credit','Financial Safety','Entrepreneurship','Financial Wellness','Accounting & Finance','Business','Excel & Technology','Human Resources','Taxation','Career Development'].map(x=><option key={x}>{x}</option>)}</select></label><label>Level<select value={course.level} onChange={e=>change('level',e.target.value)}>{['Beginner','Intermediate','Advanced','All levels'].map(x=><option key={x}>{x}</option>)}</select></label></div><label>Duration<input value={course.duration} onChange={e=>change('duration',e.target.value)} placeholder="e.g. 4 weeks"/></label><label className="check"><input type="checkbox" checked={course.published} onChange={e=>change('published',e.target.checked)}/> Published (visible to students)</label><button disabled={busy}>Save course</button></form>{!newCourse&&<div className="panel form"><div className="heading"><h2>Lessons</h2><button onClick={()=>editLesson(null)}>+ Add lesson</button></div>{lessons.map(l=><div key={l.id} className="course-row"><b>{l.position}. {l.title}</b><div><button className="small" onClick={()=>editLesson(l)}>Edit</button><button className="small danger" onClick={()=>deleteLesson(l)}>Delete</button></div></div>)}{editing&&<form onSubmit={saveLesson}><h3>{editing==='new'?'New lesson':'Edit lesson'}</h3><label>Lesson title<input required value={lesson.title} onChange={e=>setLesson({...lesson,title:e.target.value})}/></label><label>Summary<textarea value={lesson.summary} onChange={e=>setLesson({...lesson,summary:e.target.value})}/></label><label>Lesson notes<textarea rows={7} value={lesson.content} onChange={e=>setLesson({...lesson,content:e.target.value})}/></label><label>Video link<input type="url" value={lesson.video_url||''} onChange={e=>setLesson({...lesson,video_url:e.target.value})}/></label><label>Lesson order<input type="number" min="1" value={lesson.position} onChange={e=>setLesson({...lesson,position:e.target.value})}/></label><label>Upload file (PDF, Word, PowerPoint, image; max 10 MB)<input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg" onChange={e=>setFile(e.target.files?.[0]||null)}/></label><button disabled={busy}>Save lesson</button><button type="button" className="small" onClick={()=>setEditing(null)}>Cancel</button></form>}</div>}<Notice message={message}/></main>}
export default App;
