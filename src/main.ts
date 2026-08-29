import './style.css';
import { blankProject, calculate, convertProject, sampleProject, type Project, type Unit } from './model';
import heroMobile from './assets/hero-720.webp';
import heroDesktop from './assets/hero-1200.webp';
import socialImage from './assets/social.webp';

const PRODUCT = 'shop-fit-sheet';
const REAL_KEY = `${PRODUCT}:project:v1`;
const DEMO_KEY = `demo:${PRODUCT}:project:v1`;
const BUILD_ID = '1.0.1';
const app = document.querySelector<HTMLDivElement>('#app')!;
let isDemo = location.pathname === '/demo' || new URLSearchParams(location.search).get('demo') === '1';
let project = loadProject();

function escapeHtml(value: string | number): string {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);
}

function loadProject(): Project {
  const key = isDemo ? DEMO_KEY : REAL_KEY;
  try {
    const stored = localStorage.getItem(key);
    return stored ? { ...(isDemo ? sampleProject : blankProject), ...JSON.parse(stored) } : structuredClone(isDemo ? sampleProject : blankProject);
  } catch {
    return structuredClone(isDemo ? sampleProject : blankProject);
  }
}

function saveProject(): void {
  localStorage.setItem(isDemo ? DEMO_KEY : REAL_KEY, JSON.stringify(project));
}

function icon(name: 'leaf' | 'ruler' | 'warn'): string {
  if (name === 'leaf') return '<svg aria-hidden="true" viewBox="0 0 48 48"><path d="M39 7C20 9 9 19 9 35c8 0 15-3 20-9 5-6 8-13 10-19Z"/><path d="M10 40c6-10 13-17 23-25M19 31l-1-9m8 2 8-2"/></svg>';
  if (name === 'ruler') return '<svg aria-hidden="true" viewBox="0 0 48 48"><path d="m8 34 26-26 7 7-26 26H8v-7Z"/><path d="m29 13 6 6m-12 0 3 3m-9 3 6 6m-12 0 3 3"/></svg>';
  return '<svg aria-hidden="true" viewBox="0 0 48 48"><path d="M24 6 43 40H5L24 6Z"/><path d="M24 18v11m0 5v1"/></svg>';
}

function header(): string {
  return `<a class="skip-link" href="#main">Skip to main content</a><div id="route-status" class="sr-only" aria-live="polite"></div>
  ${isDemo ? `<aside class="demo-banner" aria-label="Demo mode"><span><strong>Demo</strong> — sample data, nothing is saved to your project.</span><span><button class="text-button" data-action="reset-demo">Reset demo</button><button class="text-button" data-action="start-real">Start for real</button></span></aside>` : ''}
  <header class="site-header">
    <a class="wordmark" href="/" data-link>${icon('leaf')}<span>Shop Fit Sheet</span></a>
    <nav aria-label="Main navigation"><a href="/demo" data-link>Demo</a><a href="/#planner">Planner</a><a href="/privacy" data-link>Privacy</a></nav>
  </header>`;
}

function footer(): string {
  return `<footer><div><a class="wordmark footer-mark" href="/" data-link>${icon('leaf')}<span>Shop Fit Sheet</span></a><p>Check a fitted build before you buy sheet material.</p></div><nav aria-label="Footer navigation"><a href="/privacy" data-link>Privacy</a><a href="/terms" data-link>Terms</a><a href="https://hello-factory.sociobot.in" target="_blank" rel="noopener">Built by Param Factory <span class="sr-only">(opens in a new tab)</span></a></nav><small>Version ${BUILD_ID} · Original generated field-guide art</small></footer>`;
}

function field(label: string, key: keyof Project, options: { min?: number; step?: number; help?: string } = {}): string {
  const value = project[key];
  const id = `field-${String(key)}`;
  return `<label class="field" for="${id}"><span>${label}</span><span class="number-wrap"><input id="${id}" name="${String(key)}" data-field="${String(key)}" type="number" inputmode="decimal" min="${options.min ?? 0}" step="${options.step ?? 'any'}" value="${escapeHtml(value as number)}" ${options.help ? `aria-describedby="${id}-help"` : ''}><b aria-hidden="true">${project.unit}</b></span>${options.help ? `<small id="${id}-help">${options.help}</small>` : ''}</label>`;
}

function countField(label: string, key: 'supports' | 'shelves' | 'doors', max = 12): string {
  return `<label class="field" for="field-${key}"><span>${label}</span><input id="field-${key}" name="${key}" data-field="${key}" type="number" inputmode="numeric" min="0" max="${max}" step="1" value="${project[key]}"></label>`;
}

function calculator(): string {
  return `<section class="planner" id="planner" aria-labelledby="planner-heading">
    <div class="section-kicker">Field sheet · live calculation</div>
    <div class="planner-heading"><div><h2 id="planner-heading">Measure the space, then size the build</h2><p>All dimensions use ${project.unit === 'mm' ? 'millimetres' : 'inches'}. Results update while you type.</p></div>
      <label class="unit-switch" for="unit"><span>Units</span><select id="unit" data-unit><option value="mm" ${project.unit === 'mm' ? 'selected' : ''}>Millimetres</option><option value="in" ${project.unit === 'in' ? 'selected' : ''}>Inches</option></select></label></div>
    <div class="planner-grid">
      <form class="measure-form" novalidate>
        <fieldset><legend><b>01</b> Project note</legend><div class="two-col"><label class="field" for="field-name"><span>Project name</span><input id="field-name" data-field="name" type="text" value="${escapeHtml(project.name)}"></label><label class="field" for="field-location"><span>Fitted location</span><input id="field-location" data-field="location" type="text" value="${escapeHtml(project.location)}"></label></div></fieldset>
        <fieldset><legend><b>02</b> Space envelope</legend><div class="three-col">${field('Space width', 'spaceWidth')}${field('Space height', 'spaceHeight')}${field('Space depth', 'spaceDepth')}</div><h3>Clearance to leave</h3><div class="clearance-grid">${field('Left', 'clearanceLeft')}${field('Right', 'clearanceRight')}${field('Top', 'clearanceTop')}${field('Floor', 'clearanceBottom')}${field('Behind', 'clearanceBack', { help: 'For walls, doors, cables, or airflow.' })}</div></fieldset>
        <fieldset><legend><b>03</b> Outer build</legend><div class="three-col">${field('Build width', 'outerWidth')}${field('Build height', 'outerHeight')}${field('Build depth', 'outerDepth')}</div><div class="three-col">${field('Panel thickness', 'panelThickness', { min: 0.1 })}${countField('Centre supports', 'supports', 8)}${countField('Shelves total', 'shelves', 30)}</div></fieldset>
        <fieldset><legend><b>04</b> Doors and back</legend><div class="three-col">${countField('Doors', 'doors', 12)}<label class="field" for="door-style"><span>Door style</span><select id="door-style" data-field="doorStyle"><option value="overlay" ${project.doorStyle === 'overlay' ? 'selected' : ''}>Overlay slab</option><option value="inset" ${project.doorStyle === 'inset' ? 'selected' : ''}>Inset slab</option></select></label>${field('Door gap', 'doorGap')}</div><div class="check-row"><input id="include-back" data-field="includeBack" type="checkbox" ${project.includeBack ? 'checked' : ''}><label for="include-back">Include a back panel</label></div>${project.includeBack ? `<div class="three-col">${field('Back thickness', 'backThickness', { min: 0.1 })}</div>` : ''}</fieldset>
        <fieldset><legend><b>05</b> Stock sheet</legend><div class="two-col">${field('Sheet width', 'sheetWidth', { min: 0.1 })}${field('Sheet length', 'sheetHeight', { min: 0.1 })}</div></fieldset>
      </form>
      <aside class="result-column" aria-label="Live fit results"><div class="diagram-slot">${diagram()}</div><div class="result-slot" aria-live="polite">${results()}</div></aside>
    </div>
  </section>`;
}

function diagram(): string {
  const result = calculate(project);
  const maxW = Math.max(project.spaceWidth, 1); const maxH = Math.max(project.spaceHeight, 1);
  const w = Math.max(12, Math.min(250, (project.outerWidth / maxW) * 250));
  const h = Math.max(12, Math.min(170, (project.outerHeight / maxH) * 170));
  const supportLines = Array.from({ length: Math.max(0, Math.min(8, project.supports)) }, (_, i) => `<line x1="${24 + w * ((i + 1) / (project.supports + 1))}" x2="${24 + w * ((i + 1) / (project.supports + 1))}" y1="${25 + (170 - h)}" y2="195" />`).join('');
  const conflicts = result.findings.filter((f) => f.level === 'conflict').length;
  return `<figure class="cabinet-diagram"><svg role="img" aria-labelledby="diagram-title diagram-desc" viewBox="0 0 300 235"><title id="diagram-title">Front view of the fitted build</title><desc id="diagram-desc">The build is ${project.outerWidth} by ${project.outerHeight} ${project.unit} with ${project.supports} centre supports.</desc><rect class="space-box" x="18" y="18" width="264" height="185"/><rect class="build-box ${conflicts ? 'has-conflict' : ''}" x="24" y="${25 + (170 - h)}" width="${w}" height="${h}"/>${supportLines}<path class="dimension" d="M24 218h${w}m-${w} -4v8m${w} -8v8"/><text x="${24 + w / 2}" y="231" text-anchor="middle">${format(project.outerWidth)} ${project.unit}</text></svg><figcaption>Front view · clear envelope shown as a dashed line</figcaption></figure>`;
}

function format(value: number): string { return Number.isFinite(value) ? new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value) : '—'; }

function results(): string {
  const r = calculate(project);
  const conflicts = r.findings.filter((f) => f.level === 'conflict').length;
  const checks = r.findings.filter((f) => f.level === 'check').length;
  const status = conflicts ? `${conflicts} ${conflicts === 1 ? 'conflict' : 'conflicts'} to fix` : checks ? `Fits with ${checks} ${checks === 1 ? 'check' : 'checks'}` : 'Fits the cleared space';
  const statusClass = conflicts ? 'conflict' : checks ? 'check' : 'pass';
  const findings = r.findings.map((f) => `<li class="finding ${f.level}"><span aria-hidden="true">${f.level === 'conflict' ? '×' : f.level === 'check' ? '!' : '✓'}</span>${escapeHtml(f.text)}</li>`).join('');
  const rows = r.pieces.length ? r.pieces.map((piece) => `<tr><th scope="row">${piece.part}<small>${escapeHtml(piece.note)}</small></th><td>${piece.quantity}</td><td>${format(piece.length)} × ${format(piece.width)}</td><td>${format(piece.thickness)}</td></tr>`).join('') : '<tr><td colspan="4" class="empty-cell">Your panel list appears after you enter the space and build sizes.</td></tr>';
  const stocks = r.sheetEstimate.map((s) => `<li><strong>${s.sheets}</strong> × ${format(project.sheetWidth)} × ${format(project.sheetHeight)} ${project.unit} sheet at ${format(s.thickness)} ${project.unit}</li>`).join('');
  return `<section class="fit-verdict ${statusClass}" aria-labelledby="verdict-title"><p class="eyebrow">Fit verdict</p><h3 id="verdict-title">${status}</h3><ul>${findings}</ul></section>
    <section class="opening-note"><h3>Calculated openings</h3><dl><div><dt>Each opening</dt><dd>${format(r.openingWidth)} × ${format(r.openingHeight)} ${project.unit}</dd></div>${project.doors ? `<div><dt>Each door blank</dt><dd>${format(r.doorWidth)} × ${format(r.doorHeight)} ${project.unit}</dd></div>` : ''}<div><dt>Clear envelope</dt><dd>${format(r.availableWidth)} × ${format(r.availableHeight)} × ${format(r.availableDepth)} ${project.unit}</dd></div></dl></section>
    <section class="cut-list" aria-labelledby="cut-list-title"><div class="result-heading"><h3 id="cut-list-title">Panel list</h3><button class="secondary-button" data-action="print">Print build sheet</button></div><div class="table-wrap"><table><thead><tr><th>Part</th><th>Qty</th><th>Length × width</th><th>Thick.</th></tr></thead><tbody>${rows}</tbody></table></div>${stocks ? `<div class="stock-estimate"><h4>Rough sheet allowance</h4><ul>${stocks}</ul><p>Includes 15% area waste. This is not a cutting layout.</p></div>` : ''}</section>`;
}

function landing(): string {
  return `${header()}<main id="main" tabindex="-1">
    <section class="hero" aria-labelledby="page-title"><div class="hero-copy"><div class="specimen-label">Workshop field note · No. 01</div><h1 id="page-title" tabindex="-1">Check a fitted build before buying stock</h1><p class="lede">For home makers fitting cabinets or benches into tight garages, utility rooms, and vehicles.</p><div class="hero-actions"><a class="primary-button" href="/demo" data-link>Try it with sample data <span aria-hidden="true">→</span></a><span>See a filled plan and its conflicts.</span></div><ul class="plain-facts"><li>${icon('leaf')} Plans stay on this device</li><li>${icon('ruler')} Works offline after the first visit</li><li>${icon('warn')} Free calculator and printable build sheet</li></ul></div><figure class="hero-art"><picture><source media="(max-width: 700px)" srcset="${heroMobile}"><img src="${heroDesktop}" width="1200" height="800" alt="A plywood cabinet arranged like a botanical specimen beside a fern and folding rule." fetchpriority="high" decoding="async"></picture><figcaption>Cabinet specimen, plate 01 · generated for Shop Fit Sheet</figcaption></figure></section>
    <aside class="safety-note">${icon('warn')}<div><strong>Measure twice. Verify the result before cutting.</strong><p>This sheet is not structural or load-safety advice. Confirm fixings, spans, hinges, ventilation, and site conditions.</p></div></aside>
    ${calculator()}
    <section class="how" aria-labelledby="how-heading"><div class="section-kicker">A short field method</div><h2 id="how-heading">How the fit check works</h2><ol><li><span>01</span><div><h3>Measure the space</h3><p>Record the tightest width, height, and depth. Add room for walls, doors, cables, and airflow.</p></div></li><li><span>02</span><div><h3>Describe the build</h3><p>Enter the outer size, panel thickness, supports, shelves, and doors.</p></div></li><li><span>03</span><div><h3>Check before buying</h3><p>Fix conflicts. Then print the panel list and verify every size at the site.</p></div></li></ol></section>
    <section class="limits" aria-labelledby="limits-heading"><div><div class="section-kicker">Scope note</div><h2 id="limits-heading">A fit check, not an engineering drawing</h2></div><div><p>Shop Fit Sheet checks the outer envelope and makes a rough panel list. It does not design joints, choose fixings, test loads, or optimise cuts.</p><p>No account is needed. Your current plan stays in your browser.</p></div></section>
  </main>${footer()}`;
}

function legalPage(kind: 'privacy' | 'terms'): string {
  const privacy = kind === 'privacy';
  document.title = `${privacy ? 'Privacy' : 'Terms'} — Shop Fit Sheet`;
  return `${header()}<main id="main" class="legal" tabindex="-1"><div class="section-kicker">Field note · ${privacy ? 'Privacy' : 'Terms'}</div><h1 tabindex="-1">${privacy ? 'Your plan stays in your browser' : 'Use the sheet as a planning aid'}</h1>${privacy ? `<p class="lede">Shop Fit Sheet has no account, analytics, advertising, or tracking.</p><h2>What is stored</h2><p>Your current plan and demo plan use local browser storage. Demo data uses a separate <code>demo:</code> storage key.</p><h2>What leaves the device</h2><p>Calculator data does not leave your device. Shop Fit Sheet makes no third-party requests.</p><h2>Remove your data</h2><p>Clear this site’s browser storage to remove plans. “Reset demo” removes the demo copy.</p>` : `<p class="lede">Check every measurement and safety decision before you cut or install anything.</p><h2>Planning output only</h2><p>The calculator estimates fit, panel sizes, and sheet area from the measurements you enter. It is not engineering, structural, electrical, vehicle, or load-safety advice.</p><h2>Your responsibility</h2><p>You must verify site dimensions, material thickness, joints, fixings, loads, clearances, hinge rules, airflow, and local requirements.</p><h2>No warranty</h2><p>The software is provided “as is”, without warranty. See the MIT License in the source repository for the full terms.</p>`}</main>${footer()}`;
}

function notFound(): string {
  document.title = 'Page not found — Shop Fit Sheet';
  return `${header()}<main id="main" class="not-found" tabindex="-1"><div class="pressed-leaf">${icon('leaf')}</div><div><div class="section-kicker">Specimen not found · 404</div><h1 tabindex="-1">This page is not on the sheet</h1><p>The address may be wrong or the page may have moved.</p><a class="primary-button" href="/" data-link>Return to the fit checker</a></div></main>${footer()}`;
}

function render(): void {
  const path = location.pathname.replace(/\/$/, '') || '/';
  if (path === '/' || path === '/demo') {
    document.title = isDemo ? 'Demo — Shop Fit Sheet' : 'Shop Fit Sheet — Check a fitted build';
    app.innerHTML = landing();
    bindCalculator();
  } else if (path === '/privacy') app.innerHTML = legalPage('privacy');
  else if (path === '/terms') app.innerHTML = legalPage('terms');
  else app.innerHTML = notFound();
  bindCommon();
  updateCanonical(path);
}

function bindCalculator(): void {
  document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-field]').forEach((control) => {
    control.addEventListener('input', () => {
      const key = control.dataset.field as keyof Project;
      if (control instanceof HTMLInputElement && control.type === 'checkbox') (project[key] as boolean) = control.checked;
      else if (control instanceof HTMLInputElement && control.type === 'number') (project[key] as number) = control.value === '' ? 0 : Number(control.value);
      else (project[key] as string) = control.value;
      saveProject();
      document.querySelector('.diagram-slot')!.innerHTML = diagram();
      document.querySelector('.result-slot')!.innerHTML = results();
      document.querySelector<HTMLElement>('[data-action="print"]')?.addEventListener('click', (event) => handleAction(event.currentTarget as HTMLElement));
      if (key === 'includeBack') render();
    });
  });
  document.querySelector<HTMLSelectElement>('[data-unit]')?.addEventListener('change', (event) => {
    project = convertProject(project, (event.target as HTMLSelectElement).value as Unit); saveProject(); render();
  });
}

function bindCommon(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach((link) => link.addEventListener('click', (event) => {
    if (link.origin !== location.origin) return; event.preventDefault(); navigate(link.pathname);
  }));
  document.querySelectorAll<HTMLElement>('[data-action]').forEach((button) => button.addEventListener('click', () => handleAction(button)));
}

function handleAction(button: HTMLElement): void {
  const action = button.dataset.action;
  if (action === 'print') window.print();
  if (action === 'reset-demo') { localStorage.removeItem(DEMO_KEY); project = structuredClone(sampleProject); saveProject(); render(); }
  if (action === 'start-real') { localStorage.removeItem(DEMO_KEY); navigate('/'); }
}

function navigate(path: string): void {
  history.pushState({}, '', path); isDemo = path === '/demo'; project = loadProject(); render(); scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); requestAnimationFrame(() => { const heading = document.querySelector<HTMLElement>('h1'); heading?.focus({ preventScroll: true }); const status = document.querySelector('#route-status'); if (status) status.textContent = heading?.textContent ?? ''; });
}

function updateCanonical(path: string): void {
  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]'); if (canonical) canonical.href = `https://shop-fit-sheet.sociobot.in${path === '/' ? '/' : path}`;
}

window.addEventListener('popstate', () => { isDemo = location.pathname === '/demo'; project = loadProject(); render(); });
window.addEventListener('offline', () => { document.body.dataset.offline = 'true'; });
window.addEventListener('online', () => { delete document.body.dataset.offline; });
if (!navigator.onLine) document.body.dataset.offline = 'true';
render();
document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.setAttribute('content', new URL(socialImage, location.origin).href);
document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')?.setAttribute('content', new URL(socialImage, location.origin).href);
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));
