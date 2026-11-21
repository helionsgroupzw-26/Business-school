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
 const advanced=cert.award_type==='certified_financial_leader';
 const verify=verificationLink(cert.id);
 const qr=await QRCode.toDataURL(verify,{errorCorrectionLevel:'H',margin:1,width:300,color:{dark:'#111827',light:'#FFFFFF'}});
 const doc=new jsPDF({orientation:'landscape',unit:'mm',format:'a4'});
 const NAVY=[7,36,88],RED=[205,22,47],WHITE=[255,255,255],GOLD=[193,143,51],IVORY=[255,253,249],SECONDARY=[65,75,95];
 const fill=(a)=>doc.setFillColor(...a),stroke=(a)=>doc.setDrawColor(...a),ink=(a)=>doc.setTextColor(...a);
 const x=148.5;
 const label=(text,y,size=10,font='times',style='normal',color=NAVY)=>{
   ink(color);doc.setFont(font,style);doc.setFontSize(size);doc.text(text,x,y,{align:'center'});
 };
 const centered=(text,y,width=230,size=11,style='normal')=>{
   doc.setFont('times',style);doc.setFontSize(size);ink(NAVY);
   doc.text(doc.splitTextToSize(text,width),x,y,{align:'center',lineHeightFactor:1.1});
 };
 fill(WHITE);doc.rect(0,0,297,210,'F');
 // Faithful simplified vector rendering of the selected red and blue certificate artwork.
 fill(NAVY);
 if(advanced){doc.rect(0,0,297,3.2,'F');doc.rect(0,206.8,297,3.2,'F')}
 stroke(NAVY);doc.setLineWidth(advanced?1.65:1.25);doc.rect(4.5,4.5,288,201,'S');
 stroke(RED);doc.setLineWidth(advanced?0.9:0.45);doc.rect(9,9,279,192,'S');
 stroke(NAVY);doc.setLineWidth(.33);doc.rect(12,12,273,186,'S');
 if(advanced){
  // Folded navy/red corner bands for the higher-level recognition.
  fill(NAVY);doc.triangle(10,10,56,10,10,52,'F');doc.triangle(287,200,243,200,287,158,'F');
  fill(RED);doc.triangle(10,10,67,10,10,65,'F');doc.triangle(287,200,232,200,287,145,'F');
  fill(NAVY);doc.triangle(10,10,47,10,10,47,'F');doc.triangle(287,200,252,200,287,167,'F');
  stroke(RED);doc.setLineWidth(.55);
  doc.line(19,16,278,16);doc.line(19,194,278,194);
 }else{
  fill(NAVY);doc.triangle(6,6,45,6,6,40,'F');doc.triangle(291,204,252,204,291,169,'F');
  fill(RED);doc.triangle(6,6,39,6,6,35,'F');doc.triangle(291,204,258,204,291,174,'F');
 }
 // Identical authorised Mari Matters visual branding.
 doc.addImage(mariLogo,'PNG',106.5,15,84,24.8);
 label(advanced?'CERTIFICATE':'Certificate of Achievement',advanced?61:61,advanced?31:28,'times',advanced?'normal':'italic');
 if(advanced){
  label('OF ACHIEVEMENT',70.5,10.3,'times','normal');
  stroke(RED);doc.setLineWidth(.33);doc.line(70,67,106,67);doc.line(191,67,227,67);
 }else{
  stroke(NAVY);doc.setLineWidth(.3);doc.line(31,58,70,58);doc.line(228,58,266,58);
 }
 label(advanced?'This is to certify that':'This certifies that',advanced?83:78,11.2,'times','italic');
 const n=(cert.recipient_name||'Certificate Holder').trim();
 const nameFont=n.length>34?19:n.length>24?22:n.length>15?27:32;
 doc.setFont('times','bold');doc.setFontSize(nameFont);ink(NAVY);
 let nameLines=doc.splitTextToSize(n,221);
 if(nameLines.length>2)nameLines=nameLines.slice(0,2);
 doc.text(nameLines,x,advanced?99:95,{align:'center',lineHeightFactor:1.0});
 stroke(RED);doc.setLineWidth(.37);doc.line(73,106,224,106);
 const sentence=advanced
  ?'has successfully completed the Mari Matters Financial Literacy Leadership Programme, including the learning, final assessment and approved community leadership stage requirements, and is hereby recognised as a'
  :'has successfully completed the Mari Matters Financial Literacy Fellowship learning programme and passed the verified final online assessment, and is hereby recognised as a';
 centered(sentence,advanced?114:114,245,advanced?10:10,'normal');
 // Strong navy recognition ribbon, with the corner geometry of the chosen templates.
 const bandY=advanced?136:135,bandW=advanced?211:203,bandX=x-bandW/2;
 fill(RED);doc.triangle(bandX-6,bandY,bandX+4,bandY+10,bandX-6,bandY+20,'F');
 doc.triangle(bandX+bandW+6,bandY,bandX+bandW-4,bandY+10,bandX+bandW+6,bandY+20,'F');
 fill(NAVY);doc.rect(bandX,bandY,bandW,19,'F');
 stroke(RED);doc.setLineWidth(.9);doc.line(bandX,bandY,bandX+bandW,bandY);doc.line(bandX,bandY+19,bandX+bandW,bandY+19);
 label(advanced?'CERTIFIED FINANCIAL LEADER':'FINANCIAL LITERACY FELLOW',bandY+13,advanced?20.3:20.5,'times','bold',WHITE);
 // Recognition insignia: a restrained official seal, navy for fellow and gold for leadership.
 const medal=advanced?GOLD:NAVY,cx=149,cy=178,outer=advanced?18:17;
 fill(RED);doc.triangle(cx-10,cy+8,cx-14,200,cx,195,'F');doc.triangle(cx+10,cy+8,cx+14,200,cx,195,'F');
 for(let j=0;j<20;j++){const ang=j*Math.PI/10;
   const ra=outer+1.2,rb=outer-2.8;
   fill(medal);
   doc.triangle(cx+rb*Math.cos(ang-.12),cy+rb*Math.sin(ang-.12),
    cx+ra*Math.cos(ang),cy+ra*Math.sin(ang),
    cx+rb*Math.cos(ang+.12),cy+rb*Math.sin(ang+.12),'F');
 }
 fill(medal);doc.circle(cx,cy,outer-2,'F');
 stroke(WHITE);doc.setLineWidth(.6);doc.circle(cx,cy,outer-4,'S');
 fill(WHITE);doc.circle(cx,cy,outer-5,'F');
 stroke(medal);doc.setLineWidth(.35);doc.circle(cx,cy,outer-6,'S');
 ink(NAVY);doc.setFont('times','bold');doc.setFontSize(advanced?9:8.5);
 doc.text('MARI',cx,cy-3.5,{align:'center'});
 ink(RED);doc.text('Matters',cx,cy+1.1,{align:'center'});
 ink(NAVY);doc.setFontSize(6.5);doc.text(advanced?'LEADERSHIP':'FELLOWSHIP',cx,cy+6,{align:'center'});
 // Footer verification block and dynamically assigned certificate details.
 stroke(RED);doc.setLineWidth(.35);doc.line(57,160,57,190);doc.line(118,160,118,190);doc.line(181,160,181,190);
 doc.addImage(qr,'PNG',22,164,27,27);
 ink(NAVY);doc.setFont('times','bold');doc.setFontSize(9);doc.text('Verify Certificate',35.5,196,{align:'center'});
 ink(NAVY);doc.setFont('times','normal');doc.setFontSize(10);doc.text('Certificate No:',65,170);
 doc.setFont('times','bold');doc.setFontSize(10.1);doc.text(cert.certificate_number,65,177);
 doc.setFont('times','normal');doc.setFontSize(9.4);doc.text('Date Issued:',65,185);
 doc.setFont('times','bold');doc.text(dateLabel(cert.issued_at),65,191);
 // The stylised TBanda typographic mark is the approved programme-chair signature presentation.
 ink(NAVY);doc.setFont('times','bolditalic');doc.setFontSize(22);doc.text('TBanda',225,174,{align:'center'});
 stroke(RED);doc.setLineWidth(.3);doc.line(190,177,261,177);
 doc.setFont('times','normal');doc.setFontSize(9.5);doc.text('Tinashe Banda',225,184,{align:'center'});
 doc.setFont('times','italic');doc.setFontSize(8.2);doc.text('Mari Matters Board Chair',225,190,{align:'center'});
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
