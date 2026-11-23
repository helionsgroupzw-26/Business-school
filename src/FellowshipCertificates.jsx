import React,{useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {supabase,errorText} from './supabase';

const TITLES={
 financial_literacy_fellow:'Financial Literacy Fellow',
 certified_financial_leader:'Certified Financial Leader'
};
const dateLabel=d=>d?new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}):'';
export const verificationLink=id=>window.location.origin+'/verify/'+encodeURIComponent(id);

export async function getMyCertificates(userId){
 if(!supabase||!userId)return [];
 const {data:membership,error:memberError}=await supabase.from('fellowship_members').select('id').eq('user_id',userId);
 if(memberError)throw memberError;
 const memberIds=(membership||[]).map(m=>m.id);
 if(!memberIds.length)return [];
 const {data,error}=await supabase.from('fellowship_certificates')
  .select('id,certificate_number,recipient_name,award_type,issued_at,revoked_at')
  .in('member_id',memberIds).order('issued_at',{ascending:false});
 if(error)throw error;
 return (data||[]).filter(c=>!c.revoked_at&&TITLES[c.award_type]);
}

export async function downloadMariCertificate(cert){
 const {downloadFromApprovedTemplate}=await import('./CertificateTemplateRenderer.js');
 return downloadFromApprovedTemplate(cert);
}

export function MyCertificates({userId,compact=false}){
 const [certificates,setCertificates]=useState([]),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[message,setMessage]=useState('');
 useEffect(()=>{
  let active=true;
  getMyCertificates(userId).then(rows=>{if(active)setCertificates(rows)}).catch(e=>{if(active)setMessage(errorText(e))}).finally(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[userId]);
 async function download(cert){
  setBusy(true);setMessage('');
  try{await downloadMariCertificate(cert)}catch(e){setMessage(errorText(e))}finally{setBusy(false)}
 }
 return <section className={'panel mari-certificate-section '+(compact?'mari-certificate-compact':'')} aria-label="My certificates">
  <div className="mari-certificate-header"><span className="eyebrow">OFFICIAL MARI MATTERS RECOGNITION</span><h2>My Certificates</h2><p>Your certificates are issued automatically after an administrator verifies completion of each stage. Return here to download them whenever you need them.</p></div>
  {loading?<p>Checking issued certificates...</p>:certificates.length?<div className="mari-certificate-list">{certificates.map(cert=><article className="mari-certificate-item" key={cert.id}>
   <div className="mari-certificate-symbol" aria-hidden="true">✦</div>
   <div className="mari-certificate-details"><strong>{TITLES[cert.award_type]}</strong><small>{cert.certificate_number} · Issued {dateLabel(cert.issued_at)}</small><span>Issued to {cert.recipient_name}</span></div>
   <div className="mari-certificate-actions"><button disabled={busy} type="button" onClick={()=>download(cert)}>{busy?'Preparing PDF…':'↓ Download PDF'}</button><Link to={'/verify/'+cert.id}>Verify ↗</Link></div>
  </article>)}</div>:<div className="mari-certificate-empty"><strong>No certificates issued yet</strong><p>Your first certificate will appear after you complete the four-week programme, pass the final assessment and have the result confirmed by a Mari Matters administrator. A second certificate follows approved completion of the community leadership stage.</p></div>}
  {message&&<p className="notice" role="status">{message}</p>}
 </section>
}

export function VerifyCertificate(){
 const {id}=useParams();
 const [details,setDetails]=useState(null),[busy,setBusy]=useState(true),[message,setMessage]=useState('');
 useEffect(()=>{
  let active=true;
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id||'')){setDetails({status:'not_found'});setBusy(false);return}
  supabase.rpc('verify_mari_certificate',{p_certificate_id:id}).then(({data,error})=>{if(!active)return;setDetails(data);if(error)setMessage(errorText(error));setBusy(false)});
  return()=>{active=false};
 },[id]);
 return <main className="wrap mari-verification-page">
  <span className="eyebrow">MARI MATTERS · DIGITAL CERTIFICATE VERIFICATION</span><h1>Verify a certificate</h1>
  {busy?<div className="panel"><p>Checking the certificate against the official Mari Matters register...</p></div>:message?<div className="panel"><h2>Verification unavailable</h2><p className="notice">{message}</p></div>:details?.status==='valid'?<div className="panel mari-verification-result">
   <div className="mari-verified-symbol">✓</div><h2>Certificate verified</h2><p>This certificate is recorded as valid in the official Mari Matters certificate register.</p>
   <dl><div><dt>Certificate holder</dt><dd>{details.recipient_name}</dd></div><div><dt>Award</dt><dd>{TITLES[details.award_type]||'Unknown award'}</dd></div><div><dt>Certificate number</dt><dd>{details.certificate_number}</dd></div><div><dt>Date issued</dt><dd>{dateLabel(details.issued_at)}</dd></div><div><dt>Issued by</dt><dd>{details.issuer}</dd></div></dl>
  </div>:<div className="panel mari-verification-result mari-verification-invalid"><h2>{details?.status==='revoked'?'Certificate not valid':'Certificate not found'}</h2><p>{details?.status==='revoked'?'This certificate is no longer valid. Contact Mari Matters for clarification.':'We could not locate a certificate with this verification reference in our register.'}</p></div>}
  <p className="mari-verification-foot">Mari Matters certificates attest to completion of its own programme requirements and are not government-issued professional licences.</p>
  <Link to="/">← Back to Mari Matters</Link>
 </main>
}
