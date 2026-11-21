import React,{useEffect,useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {jsPDF} from 'jspdf';
import QRCode from 'qrcode';
import mariLogo from './mariLogo.js';
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
 const leader=cert.award_type==='certified_financial_leader';
 const qr=await QRCode.toDataURL(verificationLink(cert.id),{errorCorrectionLevel:'H',margin:2,width:280,color:{dark:'#123C77',light:'#FFFFFF'}});
 const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
 const navy=[18,60,119],red=[214,40,73],muted=[99,114,137],light=[232,238,247];
 const fill=c=>doc.setFillColor(...c),stroke=c=>doc.setDrawColor(...c),ink=c=>doc.setTextColor(...c);
 const middle=148.5;
 fill([255,255,255]);doc.rect(0,0,297,210,'F');
 stroke(navy);doc.setLineWidth(leader?1.25:.85);doc.rect(8,8,281,194,'S');
 stroke(leader?red:light);doc.setLineWidth(leader?.55:.35);doc.rect(12,12,273,186,'S');
 if(leader){
  fill(navy);doc.rect(13,13,271,4,'F');
  fill(red);doc.rect(13,193,271,2,'F');
  stroke(red);doc.setLineWidth(.4);doc.line(19,21,42,21);doc.line(255,189,279,189);
 }else{
  fill(red);doc.rect(15,15,48,2,'F');
  fill(navy);doc.rect(234,193,48,2,'F');
 }
 // The exact logo supplied by Mari Matters, on a transparent background.
 doc.addImage(mariLogo,'PNG',110,20,77,22.7);
 ink(navy);doc.setFont('times','bold');doc.setFontSize(leader?19:18);
 doc.text(leader?'CERTIFICATE OF RECOGNITION':'CERTIFICATE OF ACHIEVEMENT',middle,54,{align:'center',charSpace:.4});
 stroke(red);doc.setLineWidth(.52);doc.line(119,59,178,59);
 ink(muted);doc.setFont('helvetica','normal');doc.setFontSize(10);
 doc.text('This certificate is proudly presented to',middle,71,{align:'center'});
 const name=(cert.recipient_name||'Certificate Holder').trim();
 ink(navy);doc.setFont('times','bold');doc.setFontSize(name.length>35?19:name.length>23?24:29);
 const nameLines=doc.splitTextToSize(name,220);
 const nameY=nameLines.length>1?80:87;
 doc.text(nameLines,middle,nameY,{align:'center',lineHeightFactor:1.06});
 stroke(light);doc.setLineWidth(.5);doc.line(73,103,224,103);
 ink([63,79,101]);doc.setFont('helvetica','normal');doc.setFontSize(9.4);
 const statement=leader?[
  'for completing the Mari Matters Financial Literacy Leadership Programme,',
  'including its approved community leadership stage, and is recognised as'
 ]:[
  'for completing four weeks of the Mari Matters Financial Literacy Fellowship,',
  'passing the verified final online assessment, and is recognised as'
 ];
 statement.forEach((line,i)=>doc.text(line,middle,113+i*7,{align:'center'}));
 if(leader){
  fill(navy);doc.roundedRect(44,131,209,17,1,1,'F');
  stroke(red);doc.setLineWidth(.65);doc.roundedRect(44,131,209,17,1,1,'S');
  ink([255,255,255]);doc.setFont('times','bold');doc.setFontSize(19.3);
  doc.text('CERTIFIED FINANCIAL LEADER',middle,143,{align:'center'});
 }else{
  fill([248,250,253]);doc.roundedRect(46,131,205,17,1,1,'F');
  stroke(navy);doc.setLineWidth(.48);doc.roundedRect(46,131,205,17,1,1,'S');
  ink(navy);doc.setFont('times','bold');doc.setFontSize(18);
  doc.text('FINANCIAL LITERACY FELLOW',middle,143,{align:'center'});
 }
 if(leader){
  stroke(red);doc.setLineWidth(.75);doc.circle(middle,161,7,'S');
  doc.setFont('times','bold');doc.setFontSize(11);ink(navy);doc.text('MM',middle,164,{align:'center'});
 }
 ink(navy);doc.setFont('helvetica','bold');doc.setFontSize(8.2);
 doc.text('CERTIFICATE NO.',24,168);
 doc.setFont('helvetica','normal');doc.setFontSize(9);
 doc.text(cert.certificate_number,24,174);
 ink(muted);doc.setFont('helvetica','normal');doc.setFontSize(8.3);
 doc.text('Issued '+dateLabel(cert.issued_at),24,182);
 // Typographic TBanda flourish (sample signature style selected by the programme owner).
 ink(navy);doc.setFont('times','bolditalic');doc.setFontSize(19);doc.text('TBanda',207,166,{align:'center'});
 stroke(red);doc.setLineWidth(.45);doc.line(177,170,237,170);
 ink(navy);doc.setFont('helvetica','bold');doc.setFontSize(8.8);doc.text('Tinashe Banda',207,176,{align:'center'});
 ink(muted);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text('Mari Matters Board Chair',207,181,{align:'center'});
 doc.addImage(qr,'PNG',251,156,26,26);
 ink(muted);doc.setFont('helvetica','normal');doc.setFontSize(6.4);doc.text('Scan to verify',264,187,{align:'center'});
 ink(muted);doc.setFont('helvetica','italic');doc.setFontSize(6.7);
 doc.text('A Mari Matters programme award · Not a government-issued professional licence',middle,194,{align:'center'});
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
