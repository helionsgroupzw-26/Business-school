import React,{useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {jsPDF} from 'jspdf';
import QRCode from 'qrcode';
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

function drawCenteredText(doc,value,y,maxWidth,fontSize,font='helvetica',style='normal'){
 doc.setFont(font,style);doc.setFontSize(fontSize);
 const lines=doc.splitTextToSize(value,maxWidth);
 let cy=y;for(const ln of lines){doc.text(ln,148.5,cy,{align:'center'});cy+=fontSize*.40}
 return cy;
}
function logo(doc){
 doc.setFont('helvetica','bolditalic');doc.setFontSize(23);
 const a='MARI';const x=115;
 doc.setTextColor(16,74,140);doc.text(a,x,33);
 const w=doc.getTextWidth(a);
 doc.setTextColor(211,29,65);doc.text('Matters',x+w+2,33);
 doc.setFont('helvetica','bold');doc.setFontSize(7.5);doc.setTextColor(44,81,132);
 doc.text('FINANCIAL LITERACY LEADERSHIP',148.5,40,{align:'center',charSpace:1.6});
}
export async function downloadMariCertificate(cert){
 if(!cert||!TITLES[cert.award_type]||cert.revoked_at)throw new Error('This certificate is not available for download.');
 const verifyUrl=verificationLink(cert.id);
 const qr=await QRCode.toDataURL(verifyUrl,{errorCorrectionLevel:'H',margin:1,width:250,color:{dark:'#153A78',light:'#FFFFFFFF'}});
 const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
 doc.setFillColor(249,251,255);doc.rect(0,0,297,210,'F');
 doc.setDrawColor(20,62,123);doc.setLineWidth(1.2);doc.rect(9,9,279,192,'S');
 doc.setDrawColor(221,43,72);doc.setLineWidth(0.7);doc.rect(13,13,271,184,'S');
 doc.setFillColor(20,62,123);doc.rect(0,0,297,6,'F');
 doc.setFillColor(221,43,72);doc.rect(0,204,297,6,'F');
 logo(doc);
 doc.setTextColor(23,56,104);doc.setFont('times','bold');doc.setFontSize(24);
 doc.text('CERTIFICATE OF ACHIEVEMENT',148.5,60,{align:'center',charSpace:1.2});
 doc.setFont('helvetica','normal');doc.setFontSize(11);doc.setTextColor(100,114,137);
 doc.text('This certificate is proudly presented to',148.5,73,{align:'center'});
 doc.setTextColor(13,58,116);drawCenteredText(doc,cert.recipient_name||'Certificate Holder',94,218,29,'times','bold');
 doc.setDrawColor(214,40,68);doc.setLineWidth(.6);doc.line(82,102,215,102);
 doc.setTextColor(80,95,119);doc.setFont('helvetica','normal');doc.setFontSize(11);
 doc.text('In recognition of successfully meeting the requirements of',148.5,112,{align:'center'});
 const title=TITLES[cert.award_type];
 doc.setTextColor(211,29,65);doc.setFont('times','bold');doc.setFontSize(24);
 doc.text(title,148.5,125,{align:'center'});
 doc.setFont('helvetica','normal');doc.setFontSize(9.3);doc.setTextColor(61,81,112);
 const statement=cert.award_type==='financial_literacy_fellow'
  ?'Completion of four weeks of financial literacy learning and a verified pass in the final online assessment.'
  :'Completion of the subsequent community financial literacy leadership stage, verified and approved by Mari Matters.';
 doc.text(doc.splitTextToSize(statement,195),148.5,135,{align:'center',lineHeightFactor:1.3});
 doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.setTextColor(26,67,123);
 doc.text('Certificate No. '+cert.certificate_number,27,166);
 doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(86,102,127);
 doc.text('Date issued: '+dateLabel(cert.issued_at),27,174);
 // The Board Chair's actual signature will be added when an authorised signature asset is supplied.
 doc.setDrawColor(76,100,143);doc.setLineWidth(.35);doc.line(119,166,184,166);
 doc.setTextColor(34,70,118);doc.setFont('helvetica','bold');doc.setFontSize(9);
 doc.text('Mari Matters Board Chair',151.5,172,{align:'center'});
 doc.setFont('helvetica','normal');doc.setFontSize(7.8);doc.setTextColor(99,115,137);
 doc.text('Authorised signature',151.5,177,{align:'center'});
 doc.addImage(qr,'PNG',237,150,32,32);
 doc.setFont('helvetica','normal');doc.setFontSize(6.8);doc.setTextColor(62,90,130);
 doc.text('Scan to verify',253,187,{align:'center'});
 doc.setFont('helvetica','italic');doc.setFontSize(7.5);
 doc.setTextColor(97,111,130);doc.text('A Mari Matters programme award. Not a government-issued professional licence.',148.5,193,{align:'center'});
 doc.save(cert.certificate_number+'.pdf');
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
