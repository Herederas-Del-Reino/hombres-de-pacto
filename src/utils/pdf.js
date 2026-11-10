/**
 * Genera en el navegador un PDF (A4 horizontal) con el reconocimiento personal
 * de los 25 Desafíos de Pacto. Sin dependencias: se dibuja en un canvas y se
 * incrusta como JPEG en un PDF mínimo. Nada se envía a servidores.
 */
import { asset } from './dom.js';

const W = 1754; // A4 horizontal a 150 ppp
const H = 1240;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function spaced(ctx, text, x, y, spacing) {
  // Texto centrado con espaciado entre letras (compatible con todos los navegadores).
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let cx = x - total / 2;
  const prev = ctx.textAlign;
  ctx.textAlign = 'left';
  chars.forEach((c, i) => { ctx.fillText(c, cx, y); cx += widths[i] + spacing; });
  ctx.textAlign = prev;
}

function fitFont(ctx, text, weight, family, max, maxWidth) {
  let size = max;
  do { ctx.font = `${weight} ${size}px ${family}`; size -= 2; } while (ctx.measureText(text).width > maxWidth && size > 20);
}

export async function dibujarReconocimiento(nombre, fecha = new Date()) {
  await Promise.all([
    document.fonts.load('900 80px Cinzel'),
    document.fonts.load('700 40px Cinzel'),
    document.fonts.load('600 30px Montserrat'),
    document.fonts.load('italic 400 30px Lato'),
  ]).catch(() => {});

  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  // Fondo
  const bg = ctx.createRadialGradient(W / 2, H * 0.32, 80, W / 2, H / 2, W * 0.75);
  bg.addColorStop(0, '#1B2E4B');
  bg.addColorStop(0.55, '#10151d');
  bg.addColorStop(1, '#0B0D10');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Montañas al pie
  ctx.fillStyle = 'rgba(27,46,75,.55)';
  ctx.beginPath();
  ctx.moveTo(0, H);
  [[0, 1010], [220, 900], [380, 980], [620, 840], [820, 960], [1010, 870], [1240, 990], [1450, 880], [1754, 1000], [1754, H]].forEach(([x, y]) => ctx.lineTo(x, y));
  ctx.fill();

  // Marcos dorados
  const gold = ctx.createLinearGradient(0, 0, W, H);
  gold.addColorStop(0, '#8B5E2B'); gold.addColorStop(0.5, '#D4AF37'); gold.addColorStop(1, '#8B5E2B');
  ctx.strokeStyle = gold; ctx.lineWidth = 6; ctx.strokeRect(50, 50, W - 100, H - 100);
  ctx.lineWidth = 2; ctx.strokeRect(72, 72, W - 144, H - 144);

  // Logo oficial
  try {
    const logo = await loadImage(asset('images/logo.png'));
    const lh = 300; const lw = (logo.width / logo.height) * lh;
    ctx.drawImage(logo, (W - lw) / 2, 105, lw, lh);
  } catch { /* si el logo no carga, el reconocimiento se genera igualmente */ }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  ctx.fillStyle = '#D4AF37';
  ctx.font = '600 26px Montserrat, sans-serif';
  spaced(ctx, 'RECONOCIMIENTO PERSONAL', W / 2, 470, 10);

  ctx.fillStyle = '#F1E6D8';
  ctx.font = 'italic 400 34px Lato, serif';
  ctx.fillText('Este reconocimiento celebra el camino recorrido por', W / 2, 540);

  const n = (nombre || '').trim() || 'Un hombre de pacto';
  ctx.fillStyle = gold;
  fitFont(ctx, n, 900, 'Cinzel, serif', 92, W - 360);
  ctx.fillText(n, W / 2, 650);

  ctx.strokeStyle = 'rgba(212,175,55,.6)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(W / 2 - 420, 685); ctx.lineTo(W / 2 + 420, 685); ctx.stroke();

  ctx.fillStyle = '#F1E6D8';
  ctx.font = '600 34px Montserrat, sans-serif';
  ctx.fillText('por haber completado los 25 Desafíos de Pacto', W / 2, 750);
  ctx.font = 'italic 400 30px Lato, serif';
  ctx.fillStyle = '#d8ccbb';
  ctx.fillText('Un camino de fe, compromiso, servicio y transformación.', W / 2, 800);

  ctx.fillStyle = '#D4AF37';
  ctx.font = '700 40px Cinzel, serif';
  ctx.fillText('EL VERDADERO PACTO SE VIVE CADA DÍA.', W / 2, 890);

  const f = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(fecha);
  ctx.fillStyle = '#F1E6D8';
  ctx.font = '500 26px Montserrat, sans-serif';
  ctx.fillText(`Completado el ${f}`, W / 2, 960);

  ctx.fillStyle = 'rgba(241,230,216,.6)';
  ctx.font = '400 19px Montserrat, sans-serif';
  ctx.fillText('Reconocimiento personal de recorrido. No constituye una certificación ministerial oficial.', W / 2, 1140);

  return c;
}

/** Construye un PDF de una página con una imagen JPEG a página completa. */
function jpegToPdf(jpegBytes, pxW, pxH) {
  const pageW = 841.89; const pageH = 595.28;
  const enc = new TextEncoder();
  const parts = [];
  const offsets = [];
  let length = 0;
  const push = (chunk) => { const b = typeof chunk === 'string' ? enc.encode(chunk) : chunk; parts.push(b); length += b.length; };
  const obj = (n, body) => { offsets[n] = length; push(`${n} 0 obj\n`); body(); push('\nendobj\n'); };

  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  obj(1, () => push('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2, () => push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>'));
  obj(3, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`));
  obj(4, () => {
    push(`<< /Type /XObject /Subtype /Image /Width ${pxW} /Height ${pxH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`);
    push(jpegBytes);
    push('\nendstream');
  });
  const content = `q ${pageW} 0 0 ${pageH} 0 0 cm /Im0 Do Q`;
  obj(5, () => push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`));
  obj(6, () => push('<< /Title (Reconocimiento - 25 Desafios de Pacto) /Producer (Hombres de Pacto) >>'));

  const xref = length;
  push(`xref\n0 7\n0000000000 65535 f \n`);
  for (let i = 1; i <= 6; i++) push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  push(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(parts, { type: 'application/pdf' });
}

export async function descargarReconocimiento(nombre) {
  const canvas = await dibujarReconocimiento(nombre);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
  const bin = atob(dataUrl.split(',')[1]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const blob = jpegToPdf(bytes, canvas.width, canvas.height);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'reconocimiento-25-desafios-de-pacto.pdf';
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
