import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

const TEMPLATES = {
  financial_literacy_fellow: '/certificates/financial-literacy-fellow.png',
  certified_financial_leader: '/certificates/certified-financial-leader.png',
};
const mm = value => value * 300 / 1536;
const issueDate = value => new Date(value).toLocaleDateString('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
});
async function loadArtwork(path) {
  const response = await fetch(path, { cache: 'force-cache' });
  if (!response.ok) throw new Error('Approved certificate artwork is not available.');
  const blob = await response.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
export async function downloadFromApprovedTemplate(cert) {
  const path = TEMPLATES[cert?.award_type];
  if (!path || cert.revoked_at || !cert.id || !cert.certificate_number) {
    throw new Error('This certificate is not available for download.');
  }
  const advanced = cert.award_type === 'certified_financial_leader';
  const artwork = await loadArtwork(path);
  const verificationUrl = window.location.origin + '/verify/' + encodeURIComponent(cert.id);
  const qr = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: 'H', margin: 0, width: 512,
    color: { dark: '#111111', light: '#FFFFFF' },
  });
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [200, 300] });
  doc.addImage(artwork, 'PNG', 0, 0, 300, 200, undefined, 'FAST');
  doc.setTextColor(5, 28, 75);
  const name = String(cert.recipient_name || 'Certificate Holder').trim();
  doc.setFont('times', 'bold');
  let fontSize = advanced ? 31 : 32;
  doc.setFontSize(fontSize);
  while (doc.getTextWidth(name) > 208 && fontSize > 17) {
    fontSize -= 1;
    doc.setFontSize(fontSize);
  }
  doc.text(name, 150, advanced ? mm(495) : mm(435), { align: 'center' });
  doc.setFont('times', 'bold');
  doc.setFontSize(13.3);
  doc.text(String(cert.certificate_number), mm(348), advanced ? mm(834) : mm(808));
  doc.setFontSize(12.1);
  doc.text(issueDate(cert.issued_at), mm(348), advanced ? mm(919) : mm(887));
  doc.addImage(qr, 'PNG', mm(125), advanced ? mm(784) : mm(740), mm(130), mm(130), undefined, 'FAST');
  doc.save(cert.certificate_number.replace(/[^a-zA-Z0-9_-]/g, '-') + '.pdf');
}
