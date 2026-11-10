/** Iconos SVG (Lucide, licencia ISC) convertidos a cadena para las plantillas. */
import {
  Sun, Footprints, Sparkles, Scale, HandHeart, Heart, Ear, Users, HandHelping, MessageCircleHeart,
  Hourglass, Feather, Sprout, Anchor, ShieldCheck, ClipboardCheck, Shield, Gift, CalendarCheck,
  Megaphone, Handshake, Award, GraduationCap, Mountain, ScrollText, BookOpen, Church, Clock, Globe,
  Download, Check, X, ChevronLeft, ChevronRight, Menu, House, CircleCheck, Circle, CircleDot, PenLine,
  Video, FileText, Lightbulb, Library, Compass, Smartphone, Share, SquarePlus, RotateCcw, Lock, MapPin,
  Calendar, Crown, Timer, HeartHandshake, ArrowRight, ExternalLink, BookMarked, Cross, Upload, Info,
  Ellipsis, Flame, EllipsisVertical,
} from 'lucide';

const ICONS = {
  Sun, Footprints, Sparkles, Scale, HandHeart, Heart, Ear, Users, HandHelping, MessageCircleHeart,
  Hourglass, Feather, Sprout, Anchor, ShieldCheck, ClipboardCheck, Shield, Gift, CalendarCheck,
  Megaphone, Handshake, Award, GraduationCap, Mountain, ScrollText, BookOpen, Church, Clock, Globe,
  Download, Check, X, ChevronLeft, ChevronRight, Menu, House, CircleCheck, Circle, CircleDot, PenLine,
  Video, FileText, Lightbulb, Library, Compass, Smartphone, Share, SquarePlus, RotateCcw, Lock, MapPin,
  Calendar, Crown, Timer, HeartHandshake, ArrowRight, ExternalLink, BookMarked, Cross, Upload, Info,
  Ellipsis, Flame, EllipsisVertical,
};

const attrs = (o) => Object.entries(o).map(([k, v]) => `${k}="${v}"`).join(' ');

export function icon(name, { size = 24, className = '', label = '', stroke = 1.75 } = {}) {
  const node = ICONS[name] ?? ICONS.Circle;
  // Formato actual: array de [etiqueta, atributos]; formato antiguo: ['svg', attrs, hijos]
  const children = (typeof node[0] === 'string' ? node[2] : node).map(([tag, a]) => `<${tag} ${attrs(a)}/>`).join('');
  const a11y = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true" focusable="false"';
  return `<svg class="icon ${className}" xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" ${a11y}>${children}</svg>`;
}

/** Marcas de redes sociales (dibujadas a mano: Lucide ya no incluye logotipos). */
export const brand = {
  Instagram: (size = 24) => `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"/><circle cx="12" cy="12" r="4.3"/><circle cx="17.6" cy="6.4" r="1.1" fill="currentColor" stroke="none"/></svg>`,
  TikTok: (size = 24) => `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 2h-3.3v13.2a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9a6.3 6.3 0 1 0 5.3 6.2V8.6a7.8 7.8 0 0 0 4.4 1.4V6.7a4.5 4.5 0 0 1-4.4-4.7Z"/></svg>`,
};
