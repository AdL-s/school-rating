// SchoolScore → Figma
// Rebuilds the HTML prototype (school-rating/*.html + style.css) as editable Figma frames:
// 4 pages × (desktop 1440 + phone 375), shared components and a token collection.
// Running it again replaces the previous output (the section named SECTION_NAME).
//
// IMAGES (base64 JPGs) is prepended by build.js.

const SECTION_NAME = 'SchoolScore — synced from site';
const FONT = 'Inter';
const W = { Regular: 'Regular', Medium: 'Medium', Semi: 'Semi Bold', Bold: 'Bold', Extra: 'Extra Bold' };

// ---------- Tokens (same values as style.css) ----------

const HEX = {
  bg: '#fbfaf6', surface: '#e9e6dc', text: '#1f2a24', accent: '#2e7d5b',
  'accent-dark': '#266a4c', 'accent-light': '#8fd0b1', star: '#e8a33d',
  'star-light': '#f1bd6b', muted: '#5b655f', white: '#ffffff'
};
const SPACE_STEPS = [1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20]; // × 4px (0.25rem)
const RADII = [['sm', 8], ['md', 16], ['lg', 24], ['full', 999]];

const VARS = { color: {}, space: {}, radius: {} };
const HASH = {};
const SETS = {};
let EQ = [];      // rows whose cards get equal height once the page is laid out
let M = false;    // true while building a phone (375) layout

const R = (desktop, phone) => (M ? phone : desktop);
const gutter = () => R(80, 16);
const sectionY = () => R(80, 48);
const modeName = () => (M ? 'Phone' : 'Desktop');
function mode(phone, fn) { const prev = M; M = phone; try { return fn(); } finally { M = prev; } }

// ---------- Icons (from assets/icons) ----------

const LOGO = c => '<svg width="{S}" height="{S}" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M66 30L36 12L6 30L36 48L66 30ZM66 30V48M18 37.5V51C18 55.5 26.1 60 36 60C45.9 60 54 55.5 54 51V37.5" stroke="' + c + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SEARCH = '<svg width="{S}" height="{S}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.6667 16.6667L13.3333 13.3333M9.16667 3.33333C8.40062 3.33333 7.64208 3.48422 6.93435 3.77737C6.22661 4.07052 5.58355 4.5002 5.04188 5.04188C4.5002 5.58355 4.07052 6.22661 3.77737 6.93435C3.48422 7.64208 3.33333 8.40062 3.33333 9.16667C3.33333 9.93271 3.48422 10.6913 3.77737 11.399C4.07052 12.1067 4.5002 12.7498 5.04188 13.2915C5.58355 13.8331 6.22661 14.2628 6.93435 14.556C7.64208 14.8491 8.40062 15 9.16667 15C10.7138 15 12.1975 14.3854 13.2915 13.2915C14.3854 12.1975 15 10.7138 15 9.16667C15 7.61957 14.3854 6.13584 13.2915 5.04188C12.1975 3.94791 10.7138 3.33333 9.16667 3.33333Z" stroke="#1F2A24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHEVRON = '<svg width="{S}" height="{S}" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6L8 10L12 6" stroke="#1F2A24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const STAR = (fill, stroke) => '<svg width="{S}" height="{S}" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2.08333L12.4167 7.25L18.0833 7.83333L13.8333 11.6667L15.0833 17.25L10 14.4167L4.91667 17.25L6.16667 11.6667L1.91667 7.83333L7.58333 7.25L10 2.08333Z" fill="' + fill + '"' + (stroke ? ' stroke="' + stroke + '" stroke-width="0.75" stroke-linejoin="round"' : '') + '/></svg>';

// ---------- Content (same as the HTML pages) ----------

const SCHOOLS = [
  ['smichovska', 'Smíchovská střední škola', 'Prague · SPŠ', '4.8', '312 reviews'],
  ['jaroska', 'Gymnázium Brno, třída Kapitána Jaroše', 'Brno · Gymnázium', '4.7', '268 reviews'],
  ['oa-bati', 'Obchodní akademie Tomáše Bati', 'Zlín · OA', '4.5', '190 reviews'],
  ['supsuh', 'Střední uměleckoprůmyslová škola Uherské Hradiště', 'Uherské Hradiště · SUPŠ', '4.4', '143 reviews'],
  ['spss-olomouc', 'SPŠ strojnická Olomouc', 'Olomouc · SPŠ', '4.3', '221 reviews'],
  ['wichterlovo', 'Wichterlovo gymnázium', 'Ostrava · Gymnázium', '4.2', '198 reviews'],
  ['spss-plzen', 'SPŠ stavební Plzeň', 'Plzeň · SPŠ', '4.1', '176 reviews'],
  ['szs-ostrava', 'SZŠ a VOŠ zdravotnická Ostrava', 'Ostrava · SZŠ', '4.0', '87 reviews'],
  ['gjkt', 'Gymnázium J. K. Tyla', 'Hradec Králové · Gymnázium', '3.9', '64 reviews']
];
const QUOTES = [
  ['Teachers actually care whether you understand the topic. The cyber security lab is the best part of the week.', 'Student, class of 2026', 'Smíchovská střední škola'],
  ['Good communication with parents and fair grading. The canteen food could be better.', 'Anonymous · Parent', 'Gymnázium Brno, třída Kapitána Jaroše'],
  ['Prepared me well for university. The accounting classes are tough, but the internships make up for it.', 'Former student, 2024', 'Obchodní akademie Tomáše Bati']
];
const TYPES = [['Gymnázium', '412'], ['SPŠ', '286'], ['SOŠ', '318'], ['OA', '97'], ['Lyceum', '54'], ['SZŠ', '43'], ['SUPŠ', '30']];
const REGIONS = [['Prague', '231'], ['Brno', '118'], ['Ostrava', '86'], ['Plzeň', '64'], ['Olomouc', '52'], ['Zlín', '41'], ['Hradec Králové', '47']];
const DESC = 'A public technical secondary school in Prague-Smíchov, founded in 1901. It teaches information technology and cyber security alongside hospitality, tourism and general lyceum programmes. Students praise the modern IT labs and teachers, but mention crowded corridors between lessons.';
const REVIEWS = [
  ['Student, class of 2026', 5, 'Teachers actually care whether you understand the topic. The cyber security lab is the best part of the week.', '12 Oct 2026'],
  ['Anonymous · Parent', 4, 'Good communication with parents and fair grading. The canteen food could be better.', '3 Oct 2026'],
  ['Former student, 2024', 4, 'Prepared me well for university. Old gym, but the new IT labs make up for it.', '21 Sep 2026'],
  ['Tomáš K. · Student', 5, 'Lots of practical projects and a great hackathon every spring. You learn real programming, not just theory.', '14 Sep 2026']
];
const FACTS = [['Type', 'Technical secondary'], ['City', 'Prague'], ['Students', '700'], ['Founded', '1901'], ['Website', 'ssps.cz']];
const PROGRAMMES = ['Information technology', 'Cyber security', 'Gymnázium', 'Hospitality', 'Tourism', 'General lyceum'];
const ABOUT_P1 = 'Every year thousands of fourteen-year-olds in the Czech Republic pick a gymnázium, SPŠ or obchodní akademie after a single open day and a few rumours. Official statistics tell you exam results, but not what it feels like to sit in the classroom.';
const ABOUT_P2 = 'SchoolScore collects reviews from the people who actually know: students, parents, graduates and teachers. No account, no paywall, no paid placements. Just real experiences.';
const STATS = [['1 240', 'secondary schools listed'], ['18 600', 'reviews published'], ['14', 'regions covered']];
const STEPS = [
  ['Find a school', 'Search by name or city, or filter the list by school type and region.'],
  ['Read real reviews', 'See the average rating, the score for teachers, equipment and atmosphere, and what people wrote.'],
  ['Share your experience', 'Write a review in two minutes. Your name is optional, so you can post as Anonymous.']
];
const PRINCIPLES = [
  ['No account needed', 'Anyone who knows a school can review it. We never ask for an email or a phone number.'],
  ['No paid rankings', 'Schools can’t pay to move up or hide reviews. The ranking is the average rating, nothing more.']
];
const CONTACTS = [
  ['Students & parents', 'Questions about a review or how the ratings work.', 'hello@schoolscore.example'],
  ['Schools', 'Claim your school profile, update facts or reply to reviews.', 'schools@schoolscore.example'],
  ['Report a review', 'Seen something that breaks the review rules? Let us know.', 'report@schoolscore.example']
];

// ---------- Low-level helpers ----------

function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

// Solid paint; token names are bound to the SchoolScore color variables.
function paint(name, opacity) {
  let p = { type: 'SOLID', color: rgb(HEX[name] || name) };
  if (opacity != null && opacity !== 1) p.opacity = opacity;
  if (VARS.color[name]) p = figma.variables.setBoundVariableForPaint(p, 'color', VARS.color[name]);
  return [p];
}

function imgPaint(key) {
  if (!HASH[key]) throw new Error('Missing image ' + key);
  return [{ type: 'IMAGE', imageHash: HASH[key], scaleMode: 'FILL' }];
}

function bindRadius(n) {
  const v = VARS.radius[n.cornerRadius];
  if (!v || typeof n.cornerRadius !== 'number') return;
  for (const c of ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius']) n.setBoundVariable(c, v);
}

function bindLayout(f) {
  for (const prop of ['itemSpacing', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft']) {
    const v = VARS.space[f[prop]];
    if (v) f.setBoundVariable(prop, v);
  }
  if (f.layoutWrap === 'WRAP') {
    const v = VARS.space[f.counterAxisSpacing];
    if (v) { try { f.setBoundVariable('counterAxisSpacing', v); } catch (e) { /* older API */ } }
  }
  bindRadius(f);
}

// Auto-layout frame. o: name, gap, p (n | [y,x] | [t,r,b,l]), px, py, pt, pb, fill, fillOpacity,
// radius, main, cross, wrap, wrapGap, stroke, sides {t,r,b,l}, clip
function F(dir, o) {
  o = o || {};
  const f = figma.createFrame();
  f.layoutMode = dir === 'H' ? 'HORIZONTAL' : 'VERTICAL';
  f.primaryAxisSizingMode = 'AUTO';
  f.counterAxisSizingMode = 'AUTO';
  f.name = o.name || (dir === 'H' ? 'Row' : 'Stack');
  f.fills = o.fill ? paint(o.fill, o.fillOpacity) : [];
  f.clipsContent = !!o.clip;
  f.itemSpacing = o.gap || 0;

  let t = 0, r = 0, b = 0, l = 0;
  if (typeof o.p === 'number') t = r = b = l = o.p;
  else if (Array.isArray(o.p)) {
    if (o.p.length === 2) { t = b = o.p[0]; r = l = o.p[1]; } else { t = o.p[0]; r = o.p[1]; b = o.p[2]; l = o.p[3]; }
  }
  if (o.px != null) r = l = o.px;
  if (o.py != null) t = b = o.py;
  if (o.pt != null) t = o.pt;
  if (o.pb != null) b = o.pb;
  f.paddingTop = t; f.paddingRight = r; f.paddingBottom = b; f.paddingLeft = l;

  if (o.radius) f.cornerRadius = o.radius;
  if (o.main) f.primaryAxisAlignItems = o.main;
  if (o.cross) f.counterAxisAlignItems = o.cross;
  if (o.wrap) { f.layoutWrap = 'WRAP'; f.counterAxisSpacing = o.wrapGap != null ? o.wrapGap : (o.gap || 0); }
  if (o.stroke) {
    f.strokes = paint(o.stroke);
    f.strokeAlign = 'INSIDE';
    if (o.sides) {
      f.strokeTopWeight = o.sides.t || 0; f.strokeRightWeight = o.sides.r || 0;
      f.strokeBottomWeight = o.sides.b || 0; f.strokeLeftWeight = o.sides.l || 0;
    } else f.strokeWeight = 1;
    try { f.strokesIncludedInLayout = true; } catch (e) { /* behave like CSS borders where supported */ }
  }
  bindLayout(f);
  return f;
}

// Fixed-size frame (non auto-layout)
function box(w, h, name) {
  const f = figma.createFrame();
  f.name = name;
  f.resize(w, h);
  f.fills = [];
  return f;
}

// Text. o: size, weight, color, opacity, lh (multiplier), ls (em), upper, name
function T(chars, o) {
  o = o || {};
  const t = figma.createText();
  t.fontName = { family: FONT, style: o.weight || W.Regular };
  t.characters = chars;
  t.fontSize = o.size || 16;
  t.lineHeight = { unit: 'PERCENT', value: Math.round((o.lh || 1.5) * 100) };
  if (o.ls) t.letterSpacing = { unit: 'PERCENT', value: o.ls * 100 };
  if (o.upper) t.textCase = 'UPPER';
  t.fills = paint(o.color || 'text', o.opacity);
  if (o.name) t.name = o.name;
  return t;
}

// Append child to an auto-layout parent, then size it. o.w / o.h: 'FILL' | number
function add(parent, child, o) {
  o = o || {};
  parent.appendChild(child);
  const isAL = child.type !== 'TEXT' && 'layoutMode' in child && child.layoutMode !== 'NONE';
  if (o.w === 'FILL') {
    if (child.type === 'TEXT') child.textAutoResize = 'HEIGHT';
    child.layoutSizingHorizontal = 'FILL';
  } else if (typeof o.w === 'number') {
    child.resize(o.w, child.height);
    child.layoutSizingHorizontal = 'FIXED';
    if (child.type === 'TEXT') child.textAutoResize = 'HEIGHT';
    else if (isAL && o.h == null) child.layoutSizingVertical = 'HUG';
  }
  if (typeof o.h === 'number') {
    if (child.type === 'TEXT') child.textAutoResize = 'NONE';
    child.resize(child.width, o.h);
    child.layoutSizingVertical = 'FIXED';
  }
  return child;
}

function maxW(n, v) { try { n.maxWidth = v; } catch (e) { /* not supported in this Figma version */ } }
function minH(n, v) {
  try { n.minHeight = v; } catch (e) { n.resize(n.width, v); n.layoutSizingVertical = 'FIXED'; }
}

function svg(str, size, name) {
  const n = figma.createNodeFromSvg(str.replace(/\{S\}/g, String(size)));
  n.name = name;
  n.fills = [];
  return n;
}

function img(key, w, h, o) {
  o = o || {};
  const f = box(w, h, o.name || 'Photo');
  f.fills = imgPaint(key);
  f.clipsContent = true;
  if (o.radius) { f.cornerRadius = o.radius; bindRadius(f); }
  return f;
}

function fixedFrame(f, w, h) {
  f.resize(w, h);
  f.primaryAxisSizingMode = 'FIXED';
  f.counterAxisSizingMode = 'FIXED';
  return f;
}

// Give every card in a row the height of the tallest, and let one child absorb the extra space.
function runEQ() {
  for (const item of EQ) {
    const row = item[0], growName = item[1];
    let h = 0;
    for (const k of row.children) h = Math.max(h, k.height);
    for (const k of row.children) {
      k.layoutSizingVertical = 'FIXED';
      k.resize(k.width, h);
      k.layoutSizingHorizontal = 'FILL';
      const g = k.findOne(n => n.name === growName);
      if (g) g.layoutGrow = 1;
    }
  }
  EQ = [];
}

// ---------- Small building blocks ----------

function sectionTitle(text) {
  return T(text, { name: 'Section title', size: R(40, 32), weight: W.Extra, lh: 1.1, ls: -0.02 });
}

function band(parent, o) {
  const s = F('V', {
    name: o.name, fill: o.fill, gap: o.gap || 0, px: gutter(),
    py: o.py != null ? o.py : sectionY(), pt: o.pt, pb: o.pb
  });
  add(parent, s, { w: 'FILL' });
  return s;
}

function button(label, o) {
  o = o || {};
  const style = o.style || 'primary';
  const b = F('H', {
    name: 'Button / ' + label, gap: 8, main: 'CENTER', cross: 'CENTER',
    py: o.py != null ? o.py : 16, px: 24, radius: o.radius || 999,
    fill: style === 'primary' ? 'accent' : (style === 'light' ? 'white' : null),
    stroke: style === 'outline' ? 'text' : null
  });
  b.appendChild(T(label, { name: 'Label', weight: W.Semi, color: style === 'primary' ? 'bg' : 'text' }));
  return b;
}

function searchInput(placeholder, small) {
  const s = F('H', {
    name: 'Search input', gap: 8, cross: 'CENTER', fill: 'surface',
    py: small ? 8 : 16, px: small ? 16 : 24, radius: small ? 8 : 999
  });
  s.appendChild(svg(SEARCH, small ? 16 : 20, 'icon/search'));
  s.appendChild(T(placeholder, { name: 'Placeholder' }));
  return s;
}

function inputBox(multiline) {
  return F(multiline ? 'V' : 'H', { name: multiline ? 'Textarea' : 'Input', py: 8, px: 16, radius: 8, fill: 'bg' });
}

function inst(set, variant) {
  const c = set.children.find(n => n.name === variant);
  if (!c) throw new Error('Missing variant "' + variant + '" in ' + set.name);
  return c.createInstance();
}

function setText(node, layer, chars) {
  const t = node.findOne(n => n.type === 'TEXT' && n.name === layer);
  if (!t) throw new Error('No text layer "' + layer + '" in ' + node.name);
  t.characters = chars;
  return t;
}

function chip(parent, label, style) {
  const c = inst(SETS.chip, 'Style=' + style);
  parent.appendChild(c);
  setText(c, 'Label', label);
  return c;
}

function stars(rating, size) {
  return inst(SETS.stars, 'Rating=' + rating + ', Size=' + size);
}

function addHeader(p, active) {
  const h = add(p, inst(SETS.header, 'Size=' + modeName()), { w: 'FILL' });
  if (active) {
    const t = h.findOne(n => n.type === 'TEXT' && n.name === 'Nav / ' + active);
    t.fontName = { family: FONT, style: W.Semi };
    t.fills = paint('accent');
  }
  return h;
}

function addFooter(p) {
  return add(p, inst(SETS.footer, 'Size=' + modeName()), { w: 'FILL' });
}

function schoolRow(list, s, rank) {
  const row = add(list, inst(SETS.row, 'Size=' + modeName()), { w: 'FILL' });
  setText(row, 'Rank', String(rank));
  setText(row, 'Name', s[1]);
  setText(row, 'Meta', s[2]);
  setText(row, 'Score value', s[3]);
  setText(row, 'Reviews', s[4]);
  row.findOne(n => n.name === 'Thumb').fills = imgPaint(s[0]);
  return row;
}

function pageFrame(name) {
  const p = F('V', { name: name + ' — ' + modeName(), fill: 'bg', clip: true });
  p.resize(M ? 375 : 1440, 100);
  p.primaryAxisSizingMode = 'AUTO';
  p.counterAxisSizingMode = 'FIXED';
  return p;
}

function pageTitle(p, crumb, title, sub) {
  const s = band(p, { name: 'Page title', py: 40, gap: 8 });
  if (crumb) add(s, T(crumb, { name: 'Breadcrumb', size: 14 }), { w: 'FILL' });
  add(s, T(title, { name: 'Title', size: R(56, 40), weight: W.Extra, lh: 1.1, ls: -0.02 }), { w: 'FILL' });
  add(s, T(sub, { name: 'Subtitle' }), { w: 'FILL' });
  return s;
}

// ---------- Components ----------

function buildHeader() {
  const h = F('H', { name: 'Site header', fill: 'bg', px: gutter(), gap: 16, main: 'SPACE_BETWEEN', cross: 'CENTER', stroke: 'surface', sides: { b: 1 } });
  fixedFrame(h, M ? 375 : 1440, 81);
  const logo = F('H', { name: 'Logo', gap: 8, cross: 'CENTER' });
  h.appendChild(logo);
  logo.appendChild(svg(LOGO('#2E7D5B'), 32, 'icon/logo'));
  logo.appendChild(T('SchoolScore', { name: 'Wordmark', size: R(24, 20), weight: W.Extra, ls: -0.02 }));
  const nav = F('H', { name: 'Nav', gap: R(40, 24), cross: 'CENTER' });
  h.appendChild(nav);
  nav.appendChild(T('Schools', { name: 'Nav / Schools' }));
  nav.appendChild(T('About us', { name: 'Nav / About us' }));
  return h;
}

function buildFooter() {
  const f = F(M ? 'V' : 'H', { name: 'Site footer', fill: 'text', px: gutter(), py: sectionY(), gap: 40, main: M ? 'MIN' : 'SPACE_BETWEEN' });
  f.resize(M ? 375 : 1440, 100);
  if (M) { f.counterAxisSizingMode = 'FIXED'; f.primaryAxisSizingMode = 'AUTO'; }
  else { f.primaryAxisSizingMode = 'FIXED'; f.counterAxisSizingMode = 'AUTO'; }

  const brand = add(f, F('V', { name: 'Brand', gap: 16 }), { w: 320 });
  const logo = F('H', { name: 'Logo', gap: 8, cross: 'CENTER' });
  brand.appendChild(logo);
  logo.appendChild(svg(LOGO('#8FD0B1'), 32, 'icon/logo-light'));
  logo.appendChild(T('SchoolScore', { name: 'Wordmark', size: R(24, 20), weight: W.Extra, ls: -0.02, color: 'bg' }));
  add(brand, T('Honest school reviews from anyone who knows the school.', { color: 'bg' }), { w: 'FILL' });
  const smallText = '© 2026 SchoolScore · Prototype: ratings and reviews are sample data.\nSchool photos: Wikimedia Commons, CC BY-SA.';
  const small = add(brand, T(smallText, { name: 'Credits', size: 14, color: 'bg' }), { w: 'FILL' });
  small.opacity = 0.75;
  const i = smallText.indexOf('Wikimedia Commons');
  small.setRangeTextDecoration(i, i + 'Wikimedia Commons'.length, 'UNDERLINE');

  const cols = F('H', { name: 'Links', gap: R(80, 64) });
  f.appendChild(cols);
  for (const c of [['Explore', ['Rankings', 'Schools', 'Regions']], ['Help', ['Review rules', 'Privacy', 'Contact']]]) {
    const col = F('V', { name: 'Column / ' + c[0], gap: 8 });
    cols.appendChild(col);
    col.appendChild(T(c[0], { size: 14, weight: W.Bold, ls: 0.08, upper: true, color: 'bg' }));
    for (const l of c[1]) col.appendChild(T(l, { color: 'bg' }));
  }
  return f;
}

function buildRow() {
  const row = F('H', { name: 'School row', gap: R(24, 12), py: R(24, 16), cross: 'CENTER', stroke: 'surface', sides: { b: 1 } });
  row.resize(R(1280, 343), 100);
  row.primaryAxisSizingMode = 'FIXED';
  row.counterAxisSizingMode = 'AUTO';
  add(row, T('1', { name: 'Rank', size: R(32, 24), weight: W.Extra, lh: 1.1, color: 'accent' }), { w: R(48, 24) });
  const thumb = box(R(120, 72), R(80, 48), 'Thumb');
  thumb.fills = imgPaint('smichovska');
  thumb.clipsContent = true;
  thumb.cornerRadius = 8;
  bindRadius(thumb);
  row.appendChild(thumb);
  const info = add(row, F('V', { name: 'Info', gap: R(8, 4) }), { w: 'FILL' });
  add(info, T('Smíchovská střední škola', { name: 'Name', size: R(20, 16), weight: W.Bold, lh: 1.25 }), { w: 'FILL' });
  add(info, T('Prague · SPŠ', { name: 'Meta', size: 14 }), { w: 'FILL' });
  const rating = F('V', { name: 'Rating', cross: 'MAX' });
  row.appendChild(rating);
  const score = F('H', { name: 'Score', gap: R(8, 4), cross: 'CENTER' });
  rating.appendChild(score);
  score.appendChild(svg(STAR('#E8A33D'), R(24, 16), 'icon/star'));
  score.appendChild(T('4.8', { name: 'Score value', size: R(24, 20), weight: W.Extra }));
  rating.appendChild(T('312 reviews', { name: 'Reviews', size: R(14, 12) }));
  return row;
}

function buildChip(style) {
  const c = F('H', {
    name: 'Chip', py: 8, px: 16, radius: 999, cross: 'CENTER',
    fill: style === 'Selected' ? 'accent' : (style === 'On surface' ? 'bg' : 'white')
  });
  c.appendChild(T('Chip', { name: 'Label', size: 14, weight: W.Medium, color: style === 'Selected' ? 'bg' : 'text' }));
  return c;
}

function buildStars(rating, size) {
  const s = F('H', { name: 'Stars', cross: 'CENTER' });
  for (let i = 0; i < 5; i++) {
    const on = i < rating;
    const st = svg(STAR(on ? '#E8A33D' : '#ACACAC'), size, on ? 'star' : 'star (off)');
    if (!on) st.opacity = 0.25;
    s.appendChild(st);
  }
  return s;
}

function makeSet(holder, name, variants) {
  const comps = variants.map(v => {
    const node = v[1]();
    holder.appendChild(node);
    const c = figma.createComponentFromNode(node);
    c.name = v[0];
    return c;
  });
  const set = figma.combineAsVariants(comps, holder);
  set.name = name;
  set.layoutMode = 'VERTICAL';
  set.primaryAxisSizingMode = 'AUTO';
  set.counterAxisSizingMode = 'AUTO';
  set.itemSpacing = 40;
  set.paddingTop = set.paddingRight = set.paddingBottom = set.paddingLeft = 40;
  return set;
}

function buildComponents() {
  const holder = F('V', { name: 'Components', gap: 80, p: 80, fill: 'white' });
  SETS.header = makeSet(holder, 'Site / Header', [
    ['Size=Desktop', () => mode(false, buildHeader)], ['Size=Phone', () => mode(true, buildHeader)]]);
  SETS.footer = makeSet(holder, 'Site / Footer', [
    ['Size=Desktop', () => mode(false, buildFooter)], ['Size=Phone', () => mode(true, buildFooter)]]);
  SETS.row = makeSet(holder, 'School row', [
    ['Size=Desktop', () => mode(false, buildRow)], ['Size=Phone', () => mode(true, buildRow)]]);
  SETS.chip = makeSet(holder, 'Chip', [
    ['Style=Default', () => buildChip('Default')], ['Style=Selected', () => buildChip('Selected')], ['Style=On surface', () => buildChip('On surface')]]);
  SETS.stars = makeSet(holder, 'Stars', [
    ['Rating=5, Size=Small', () => buildStars(5, 16)], ['Rating=4, Size=Small', () => buildStars(4, 16)], ['Rating=5, Size=Large', () => buildStars(5, 24)]]);
  return holder;
}

// ---------- Pages ----------

function buildHome() {
  const p = pageFrame('Home');
  addHeader(p, null);

  // Hero
  const hero = band(p, { name: 'Hero' });
  const wrap = add(hero, F(M ? 'V' : 'H', { name: 'Hero content', gap: 40, cross: 'CENTER' }), { w: 'FILL' });
  const copy = add(wrap, F('V', { name: 'Hero copy', gap: 24 }), { w: 'FILL' });
  add(copy, T('Know the school before you enroll.', { name: 'Title', size: R(64, 40), weight: W.Extra, lh: 1.1, ls: -0.02 }), { w: 'FILL' });
  maxW(add(copy, T('Read what students, parents and teachers say about a school, then add your own review in two minutes.', { name: 'Lead', size: 18 }), { w: 'FILL' }), 640);
  const search = add(copy, F(M ? 'V' : 'H', { name: 'Search', gap: 8 }), { w: 'FILL' });
  if (M) {
    add(search, searchInput('School name or city'), { w: 'FILL' });
    add(search, button('Search'), { w: 'FILL' });
  } else {
    add(search, searchInput('School name or city'), { w: 448 });
    search.appendChild(button('Search'));
  }
  const mw = M ? 343 : 496, mh = Math.round(mw * 0.8); // aspect 5 / 4
  const media = img('hero-keplera', mw, mh, { name: 'Hero photo', radius: 24 });
  wrap.appendChild(media);
  const cap = F('H', { name: 'Caption', py: 4, px: 12, radius: 999, fill: 'bg', fillOpacity: 0.9 });
  cap.appendChild(T('Gymnázium Jana Keplera, Prague', { size: 14, weight: W.Semi }));
  media.appendChild(cap);
  cap.x = 16;
  cap.y = mh - 16 - cap.height;

  // Top 5
  const top = band(p, { name: 'Top 5', py: 40 });
  const head = add(top, F(M ? 'V' : 'H', { name: 'Section head', gap: 16, pb: 16, main: M ? 'MIN' : 'SPACE_BETWEEN', cross: M ? 'MIN' : 'MAX' }), { w: 'FILL' });
  const hl = add(head, F('V', { name: 'Heading', gap: 8 }), M ? { w: 'FILL' } : {});
  add(hl, sectionTitle('This month’s top 5'), M ? { w: 'FILL' } : {});
  add(hl, T('Ranked by average rating, minimum 50 reviews'), M ? { w: 'FILL' } : {});
  head.appendChild(T('Full ranking →', { weight: W.Semi, color: 'accent' }));
  const list = add(top, F('V', { name: 'School list' }), { w: 'FILL' });
  SCHOOLS.slice(0, 5).forEach((s, i) => schoolRow(list, s, i + 1));

  // Latest reviews
  const latest = band(p, { name: 'Latest reviews', fill: 'surface' });
  add(latest, sectionTitle('Latest reviews'), { w: 'FILL' });
  const grid = add(latest, F(M ? 'V' : 'H', { name: 'Quote grid', gap: 24, pt: 40 }), { w: 'FILL' });
  for (const q of QUOTES) {
    const c = add(grid, F('V', { name: 'Quote card', gap: 16, p: 24, radius: 16, fill: 'bg' }), { w: 'FILL' });
    add(c, T('“', { name: 'Mark', size: 48, weight: W.Extra, lh: 1, color: 'accent' }), { h: 40 });
    add(c, T(q[0], { name: 'Quote', size: 18 }), { w: 'FILL' });
    const a = add(c, F('V', { name: 'Author' }), { w: 'FILL' });
    add(a, T(q[1], { size: 14, weight: W.Semi }), { w: 'FILL' });
    add(a, T(q[2], { size: 14, weight: W.Semi, color: 'accent' }), { w: 'FILL' });
  }
  if (!M) EQ.push([grid, 'Quote']);

  addFooter(p);
  runEQ();
  return p;
}

function filterGroup(parent, title, items) {
  const g = add(parent, F('V', { name: 'Filter / ' + title, gap: 8 }), { w: 'FILL' });
  add(g, T(title, { size: 14, weight: W.Bold, ls: 0.08, upper: true }), { w: 'FILL' });
  const list = add(g, F('V', { name: 'Options' }), { w: 'FILL' });
  for (const it of items) {
    const row = add(list, F('H', { name: 'Check / ' + it[0], gap: 8, py: 4, cross: 'CENTER' }), { w: 'FILL' });
    const cb = figma.createRectangle();
    cb.name = 'Checkbox';
    cb.resize(16, 16);
    cb.cornerRadius = 3;
    cb.fills = paint('white');
    cb.strokes = [{ type: 'SOLID', color: rgb('#767676') }];
    cb.strokeWeight = 1;
    cb.strokeAlign = 'INSIDE';
    row.appendChild(cb);
    add(row, T(it[0], { name: 'Label' }), { w: 'FILL' });
    row.appendChild(T(it[1], { name: 'Count', size: 14, color: 'muted' }));
  }
}

function buildIndex() {
  const p = pageFrame('Schools');
  addHeader(p, 'Schools');
  pageTitle(p, 'Home / Schools', 'Schools', '1 240 schools · updated weekly');

  const lay = add(p, F(M ? 'V' : 'H', { name: 'Index layout', gap: 40, px: gutter(), pb: sectionY() }), { w: 'FILL' });
  const filters = add(lay, F('V', { name: 'Filters', gap: 32 }), { w: M ? 'FILL' : 280 });
  add(filters, searchInput('Search schools', true), { w: 'FILL' });
  const groups = add(filters, F('V', { name: 'Filter groups', gap: 32 }), { w: 'FILL' });
  filterGroup(groups, 'Type', TYPES);
  filterGroup(groups, 'Region', REGIONS);

  const col = add(lay, F('V', { name: 'Results' }), { w: 'FILL' });
  const lt = add(col, F('H', { name: 'List top', gap: 16, pb: 8, main: 'SPACE_BETWEEN', cross: 'CENTER', stroke: 'surface', sides: { b: 1 } }), { w: 'FILL' });
  lt.appendChild(T('9 of 1 240 results', { size: 14 }));
  const sort = F('H', { name: 'Sort', gap: 8, cross: 'CENTER' });
  lt.appendChild(sort);
  sort.appendChild(T('Sort: Highest rated', { size: 14, weight: W.Medium }));
  sort.appendChild(svg(CHEVRON, 16, 'icon/chevron'));
  const list = add(col, F('V', { name: 'School list' }), { w: 'FILL' });
  SCHOOLS.forEach((s, i) => schoolRow(list, s, i + 1));
  const more = add(col, F('V', { name: 'Load more', pt: 24 }), { w: 'FILL' });
  add(more, button('Load more schools', { style: 'outline', py: 12 }), { w: 'FILL' });

  addFooter(p);
  runEQ();
  return p;
}

function field(parent, label) {
  const fd = add(parent, F('V', { name: 'Field / ' + label, gap: 8 }), { w: 'FILL' });
  add(fd, T(label, { name: 'Label', size: 14, weight: W.Semi }), { w: 'FILL' });
  return fd;
}

function buildSingle() {
  const p = pageFrame('School detail');
  addHeader(p, 'Schools');

  // School header
  const sh = band(p, { name: 'School header', fill: 'surface' });
  const wrap = add(sh, F(M ? 'V' : 'H', { name: 'School header content', gap: R(40, 32), cross: 'CENTER' }), { w: 'FILL' });
  const copy = add(wrap, F('V', { name: 'Copy', gap: 16 }), { w: 'FILL' });
  add(copy, T('Home / Schools / Smíchovská střední škola', { name: 'Breadcrumb', size: 14 }), { w: 'FILL' });
  add(copy, T('Smíchovská střední škola', { name: 'Title', size: R(56, 40), weight: W.Extra, lh: 1.1, ls: -0.02 }), { w: 'FILL' });
  const chips = add(copy, F('H', { name: 'Chips', gap: 8, wrap: true }), { w: 'FILL' });
  ['Prague', 'SPŠ', 'Public'].forEach(c => chip(chips, c, 'Default'));
  maxW(add(copy, T(DESC, { name: 'Description', size: 18 }), { w: 'FILL' }), 896);

  const sc = add(wrap, F('V', { name: 'Score card', gap: 8, p: 32, radius: 24, fill: 'accent', cross: 'CENTER' }), { w: M ? 'FILL' : 280 });
  sc.appendChild(T('4.8', { name: 'Score', size: R(80, 64), weight: W.Extra, lh: 1.1, ls: -0.02, color: 'white' }));
  sc.appendChild(stars(5, 'Large'));
  sc.appendChild(T('312 reviews', { color: 'white' }));
  const bw = add(sc, F('V', { name: 'Button wrap', pt: 8 }), { w: 'FILL' });
  maxW(bw, 320);
  add(bw, button('Write a review', { style: 'light', py: 8, radius: 8 }), { w: 'FILL' });

  // Body
  const body = add(p, F(M ? 'V' : 'H', { name: 'School body', gap: 40, px: gutter(), py: sectionY() }), { w: 'FILL' });
  const reviews = F('V', { name: 'Reviews' });
  const sidebar = F('V', { name: 'Sidebar', gap: 24 });
  if (M) { add(body, sidebar, { w: 'FILL' }); add(body, reviews, { w: 'FILL' }); } // photo + facts first on phones
  else { add(body, reviews, { w: 'FILL' }); add(body, sidebar, { w: 360 }); }

  const h2 = add(reviews, F('V', { name: 'Heading', pb: 16 }), { w: 'FILL' });
  add(h2, T('Reviews (312)', { size: R(32, 24), weight: W.Extra }), { w: 'FILL' });
  for (const rv of REVIEWS) {
    const item = add(reviews, F('V', { name: 'Review', gap: 8, py: 24, stroke: 'surface', sides: { b: 1 } }), { w: 'FILL' });
    const head = add(item, F('H', { name: 'Review head', gap: 16, main: 'SPACE_BETWEEN', cross: 'CENTER' }), { w: 'FILL' });
    head.appendChild(T(rv[0], { size: 14, weight: W.Semi }));
    head.appendChild(stars(rv[1], 'Small'));
    add(item, T(rv[2], { size: R(18, 16) }), { w: 'FILL' });
    add(item, T(rv[3], { size: 14, color: 'muted' }), { w: 'FILL' });
  }

  // Review form
  const fw = add(reviews, F('V', { name: 'Write a review', pt: 16 }), { w: 'FILL' });
  const form = add(fw, F('V', { name: 'Review form', gap: 16, p: 24, radius: 16, fill: 'surface' }), { w: 'FILL' });
  add(form, T('Write a review', { size: 24, weight: W.Extra }), { w: 'FILL' });
  add(form, T('No account needed. It only takes two minutes.'), { w: 'FILL' });

  const nameInput = add(field(form, 'Your name (optional)'), inputBox(false),{ w: 'FILL' });
  add(nameInput, T('Leave empty to post as Anonymous', { name: 'Placeholder' }), { w: 'FILL' });

  const roles = add(field(form, 'I am a'), F('H', { name: 'Chips', gap: 8, wrap: true }), { w: 'FILL' });
  [['Student', 'Selected'], ['Parent', 'Default'], ['Former student', 'Default'], ['Teacher', 'Default'], ['Other', 'Default']]
    .forEach(c => chip(roles, c[0], c[1]));

  const ratingRow = add(field(form, 'Your rating'), F('H', { name: 'Rating row', gap: 16, wrapGap: 8, wrap: true, cross: 'CENTER' }), { w: 'FILL' });
  const starInput = F('H', { name: 'Star input', gap: 4 });
  ratingRow.appendChild(starInput);
  for (let i = 1; i <= 5; i++) {
    const slot = fixedFrame(F('H', { name: 'Star ' + i, main: 'CENTER', cross: 'CENTER', radius: 8 }), 40, 40);
    const on = i <= 4; // shows the "4 of 5 · Very good" state
    slot.appendChild(svg(on ? STAR('#E8A33D', '#D99227') : STAR('#FBFAF6', '#D8D3C4'), 32, on ? 'star (selected)' : 'star (empty)'));
    starInput.appendChild(slot);
  }
  ratingRow.appendChild(T('4 of 5 · Very good', { name: 'Hint', size: 14, weight: W.Semi }));

  const ta = add(field(form, 'Your review'), inputBox(true), { w: 'FILL' });
  minH(ta, 120);
  add(ta, T('What is good about the school, and what could be better?', { name: 'Placeholder' }), { w: 'FILL' });

  const submit = add(form, F(M ? 'V' : 'H', { name: 'Submit row', gap: R(24, 12), cross: M ? 'MIN' : 'CENTER' }), { w: 'FILL' });
  submit.appendChild(button('Publish review', { py: 8, radius: 8 }));
  add(submit, T('By publishing you agree to the review rules.', { size: 14 }), M ? { w: 'FILL' } : {});

  // Sidebar
  sidebar.appendChild(img('smichovska', M ? 343 : 360, M ? 193 : 270, { name: 'School photo', radius: 16 }));
  const facts = add(sidebar, F('V', { name: 'Quick facts', gap: 16, p: 24, radius: 16, fill: 'surface' }), { w: 'FILL' });
  add(facts, T('Quick facts', { size: 18, weight: W.Bold }), { w: 'FILL' });
  const dl = add(facts, F('V', { name: 'Facts list', gap: 16 }), { w: 'FILL' });
  for (const f of FACTS) {
    const row = add(dl, F('H', { name: 'Fact / ' + f[0], gap: 16, main: 'SPACE_BETWEEN' }), { w: 'FILL' });
    row.appendChild(T(f[0]));
    row.appendChild(T(f[1], { weight: W.Semi }));
  }
  const prog = add(sidebar, F('V', { name: 'Programmes', gap: 16, p: 24, radius: 16, fill: 'surface' }), { w: 'FILL' });
  add(prog, T('Programmes', { size: 18, weight: W.Bold }), { w: 'FILL' });
  const pc = add(prog, F('H', { name: 'Programme chips', gap: 8, wrap: true }), { w: 'FILL' });
  PROGRAMMES.forEach(x => chip(pc, x, 'On surface'));

  addFooter(p);
  runEQ();
  return p;
}

function buildAbout() {
  const p = pageFrame('About us');
  addHeader(p, 'About us');
  pageTitle(p, null, 'About SchoolScore', 'Honest school reviews from anyone who knows the school.');

  // Intro + photos
  const intro = add(p, F(M ? 'V' : 'H', { name: 'About intro', gap: R(80, 40), px: gutter(), pb: sectionY(), cross: 'CENTER' }), { w: 'FILL' });
  const copy = add(intro, F('V', { name: 'Copy', gap: 16 }), { w: 'FILL' });
  const hw = add(copy, F('V', { name: 'Heading', pb: 8 }), { w: 'FILL' });
  add(hw, sectionTitle('Choosing a secondary school shouldn’t be a guess.'), { w: 'FILL' });
  add(copy, T(ABOUT_P1, { size: 18 }), { w: 'FILL' });
  add(copy, T(ABOUT_P2, { size: 18 }), { w: 'FILL' });
  const colW = M ? 343 : 600, rowH = M ? 160 : 200;
  const leftW = Math.round((colW - 16) * 0.6), rightW = colW - 16 - leftW; // grid 3fr 2fr
  const photos = add(intro, F('H', { name: 'About photos', gap: 16 }), { w: colW });
  photos.appendChild(img('jaroska', leftW, rowH * 2 + 16, { radius: 16, name: 'Gymnázium Brno, třída Kapitána Jaroše' }));
  const stack = F('V', { name: 'Stack', gap: 16 });
  photos.appendChild(stack);
  stack.appendChild(img('gjkt', rightW, rowH, { radius: 16, name: 'Gymnázium J. K. Tyla' }));
  stack.appendChild(img('spss-olomouc', rightW, rowH, { radius: 16, name: 'SPŠ strojnická Olomouc' }));

  // Stats
  const stats = band(p, { name: 'Stats', fill: 'surface' });
  const sg = add(stats, F('H', { name: 'Stats grid', gap: 16 }), { w: 'FILL' });
  for (const s of STATS) {
    const st = add(sg, F('V', { name: 'Stat', gap: 4 }), { w: 'FILL' });
    st.appendChild(T(s[0], { size: R(48, 24), weight: W.Extra, lh: 1.1, ls: -0.02, color: 'accent' }));
    add(st, T(s[1], { size: R(16, 14) }), { w: 'FILL' });
  }

  // How it works
  const how = band(p, { name: 'How it works' });
  add(how, sectionTitle('How it works'), { w: 'FILL' });
  const steps = add(how, F(M ? 'V' : 'H', { name: 'Steps', gap: 24, pt: 40 }), { w: 'FILL' });
  STEPS.forEach((s, i) => {
    const c = add(steps, F('V', { name: 'Step ' + (i + 1), gap: 8, p: 24, radius: 16, stroke: 'surface' }), { w: 'FILL' });
    const nw = F('V', { name: 'Number wrap', pb: 8 });
    c.appendChild(nw);
    const num = fixedFrame(F('H', { name: 'Number', radius: 999, fill: 'accent', main: 'CENTER', cross: 'CENTER' }), 40, 40);
    nw.appendChild(num);
    num.appendChild(T(String(i + 1), { weight: W.Extra, color: 'bg' }));
    add(c, T(s[0], { name: 'Title', size: 20, weight: W.Bold }), { w: 'FILL' });
    add(c, T(s[1], { name: 'Body' }), { w: 'FILL' });
  });
  if (!M) EQ.push([steps, 'Body']);

  // Principles
  const pr = add(p, F(M ? 'V' : 'H', { name: 'Principles', gap: R(80, 40), px: gutter(), pb: sectionY() }), { w: 'FILL' });
  const ph = add(pr, F('V', { name: 'Principles head', gap: 16 }), { w: M ? 'FILL' : 360 });
  add(ph, sectionTitle('Fair to readers and to schools.'), { w: 'FILL' });
  add(ph, T('Ratings only matter if people trust them. These rules apply to every review on the site.'), { w: 'FILL' });
  const pl = add(pr, F(M ? 'V' : 'H', { name: 'Principles list', gap: R(24, 32) }), { w: 'FILL' });
  for (const pp of PRINCIPLES) {
    const c = add(pl, F('V', { name: 'Principle', gap: 8, pt: 16, stroke: 'accent', sides: { t: 2 } }), { w: 'FILL' });
    add(c, T(pp[0], { size: 20, weight: W.Bold }), { w: 'FILL' });
    add(c, T(pp[1]), { w: 'FILL' });
  }

  // CTA
  const cta = band(p, { name: 'CTA', fill: 'accent' });
  const ci = add(cta, F(M ? 'V' : 'H', { name: 'CTA content', gap: 32, main: M ? 'MIN' : 'SPACE_BETWEEN', cross: M ? 'MIN' : 'CENTER' }), { w: 'FILL' });
  const ct = add(ci, F('V', { name: 'Copy', gap: 8 }), { w: M ? 'FILL' : 640 });
  add(ct, T('Know a school? Tell others what it’s really like.', { size: R(40, 32), weight: W.Extra, lh: 1.1, ls: -0.02, color: 'white' }), { w: 'FILL' });
  add(ct, T('Your review helps next year’s students choose with confidence.', { color: 'white' }), { w: 'FILL' }).opacity = 0.9;
  ci.appendChild(button('Find your school', { style: 'light' }));

  // Contact
  const contact = band(p, { name: 'Contact' });
  add(contact, sectionTitle('Get in touch'), { w: 'FILL' });
  const cg = add(contact, F(M ? 'V' : 'H', { name: 'Contact grid', gap: 24, pt: 40 }), { w: 'FILL' });
  for (const c0 of CONTACTS) {
    const c = add(cg, F('V', { name: 'Contact card', gap: 8, p: 24, radius: 16, fill: 'surface' }), { w: 'FILL' });
    add(c, T(c0[0], { size: 18, weight: W.Bold }), { w: 'FILL' });
    add(c, T(c0[1], { name: 'Body' }), { w: 'FILL' });
    add(c, T(c0[2], { weight: W.Semi, color: 'accent' }), { w: 'FILL' });
  }
  if (!M) EQ.push([cg, 'Body']);

  addFooter(p);
  runEQ();
  return p;
}

// ---------- Setup ----------

async function setupVariables() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  let coll = collections.find(c => c.name === 'SchoolScore');
  if (!coll) coll = figma.variables.createVariableCollection('SchoolScore');
  const modeId = coll.modes[0].modeId;
  const existing = (await figma.variables.getLocalVariablesAsync()).filter(v => v.variableCollectionId === coll.id);
  function get(name, type, value, scopes) {
    let v = existing.find(x => x.name === name);
    if (!v) v = figma.variables.createVariable(name, coll, type);
    v.setValueForMode(modeId, value);
    v.scopes = scopes;
    return v;
  }
  for (const k of Object.keys(HEX)) {
    const c = rgb(HEX[k]);
    VARS.color[k] = get('color/' + k, 'COLOR', { r: c.r, g: c.g, b: c.b, a: 1 }, ['ALL_FILLS', 'STROKE_COLOR']);
  }
  for (const s of SPACE_STEPS) VARS.space[s * 4] = get('space/' + s, 'FLOAT', s * 4, ['GAP']);
  for (const rr of RADII) VARS.radius[rr[1]] = get('radius/' + rr[0], 'FLOAT', rr[1], ['CORNER_RADIUS']);
}

async function main() {
  const page = figma.root.children.find(p => p.name === 'Designs') || figma.currentPage;
  await figma.setCurrentPageAsync(page);
  await Promise.all([W.Regular, W.Medium, W.Semi, W.Bold, W.Extra].map(s => figma.loadFontAsync({ family: FONT, style: s })));
  await setupVariables();
  for (const k of Object.keys(IMAGES)) HASH[k] = figma.createImage(figma.base64Decode(IMAGES[k])).hash;

  // Replace the output of an earlier run
  page.children.filter(n => n.name === SECTION_NAME).forEach(n => n.remove());
  let bottom = 0;
  for (const n of page.children) bottom = Math.max(bottom, n.y + n.height);

  const holder = buildComponents();
  const builders = [buildHome, buildIndex, buildSingle, buildAbout];
  const desktop = builders.map(b => mode(false, b));
  const phone = builders.map(b => mode(true, b));

  const section = figma.createSection();
  section.name = SECTION_NAME;
  section.x = 0;
  section.y = bottom + 400;

  let x = 120;
  for (const f of desktop) { section.appendChild(f); f.x = x; f.y = 120; x += f.width + 200; }
  const deskH = Math.max.apply(null, desktop.map(f => f.height));
  const phoneY = 120 + deskH + 320;
  let px = 120;
  for (const f of phone) { section.appendChild(f); f.x = px; f.y = phoneY; px += f.width + 200; }
  section.appendChild(holder);
  holder.x = x;
  holder.y = 120;

  const width = Math.max(x + holder.width, px) + 120;
  const height = Math.max(phoneY + Math.max.apply(null, phone.map(f => f.height)), 120 + holder.height) + 120;
  section.resizeWithoutConstraints(width, height);
  figma.viewport.scrollAndZoomIntoView([section]);
  figma.closePlugin('SchoolScore: built 8 page frames and 5 components.');
}

main().catch(e => {
  console.error(e);
  figma.closePlugin('SchoolScore sync failed: ' + (e && e.message ? e.message : e));
});
