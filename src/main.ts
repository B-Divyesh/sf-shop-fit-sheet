import './style.css';
import { blankProject, calculate, convertProject, COUNT_LIMITS, DIMENSION_KEYS, sampleProject, type CountKey, type Project, type Unit } from './model';
import heroMobile from './assets/hero-720.webp';
import heroDesktop from './assets/hero-1200.webp';
import socialImage from './assets/social.webp';

const PRODUCT = 'shop-fit-sheet';
const REAL_KEY = `${PRODUCT}:project:v1`;
const DEMO_KEY = `demo:${PRODUCT}:project:v1`;
const BUILD_ID = '1.0.5';
const app = document.querySelector<HTMLDivElement>('#app')!;
const dimensionKeys = new Set<keyof Project>(DIMENSION_KEYS);
const countKeys = new Set<keyof Project>(['supports', 'shelves', 'doors']);
let isDemo = isDemoUrl(new URL(location.href));

interface StoredProject {
  schemaVersion: 2;
  displayUnit: Unit;
  canonicalProject: Project;
}

const initialState = loadProject();
let canonicalProject = initialState.canonicalProject;
let displayUnit = initialState.displayUnit;
let project = convertProject(canonicalProject, displayUnit);

function escapeHtml(value: string | number): string {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);
}

function isDemoUrl(url: URL): boolean {
  return url.pathname === '/demo' || url.searchParams.get('demo') === '1';
}

function loadProject(): { canonicalProject: Project; displayUnit: Unit } {
  const key = isDemo ? DEMO_KEY : REAL_KEY;
  const fallback = structuredClone(isDemo ? sampleProject : blankProject);
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return { canonicalProject: fallback, displayUnit: fallback.unit };
    const parsed = JSON.parse(stored) as Partial<StoredProject> & Partial<Project>;
    if (parsed.schemaVersion === 2 && parsed.canonicalProject) {
      const unit = parsed.displayUnit === 'in' ? 'in' : 'mm';
      return { canonicalProject: { ...fallback, ...parsed.canonicalProject, unit: 'mm' }, displayUnit: unit };
    }
    const legacy = { ...fallback, ...parsed } as Project;
    const unit: Unit = legacy.unit === 'in' ? 'in' : 'mm';
    return { canonicalProject: convertProject({ ...legacy, unit }, 'mm'), displayUnit: unit };
  } catch {
    return { canonicalProject: fallback, displayUnit: fallback.unit };
  }
}

function saveProject(): void {
  const stored: StoredProject = { schemaVersion: 2, displayUnit, canonicalProject: { ...canonicalProject, unit: 'mm' } };
  localStorage.setItem(isDemo ? DEMO_KEY : REAL_KEY, JSON.stringify(stored));
}

function reloadProject(): void {
  const loaded = loadProject();
  canonicalProject = loaded.canonicalProject;
  displayUnit = loaded.displayUnit;
  project = convertProject(canonicalProject, displayUnit);
}

function syncDisplayProject(): void {
  project = convertProject(canonicalProject, displayUnit);
}

function inputValue(value: number): number {
  return Math.round(value * 100) / 100;
}

function countError(key: CountKey): string {
  const value = project[key];
  if (!Number.isInteger(value) || value < 0) return `Enter a whole number from 0 to ${COUNT_LIMITS[key]}.`;
  if (value > COUNT_LIMITS[key]) return `Enter no more than ${COUNT_LIMITS[key]}.`;
  return '';
}

function icon(name: 'leaf' | 'ruler' | 'warn'): string {
  if (name === 'leaf') return '<svg aria-hidden="true" viewBox="0 0 48 48"><path d="M39 7C20 9 9 19 9 35c8 0 15-3 20-9 5-6 8-13 10-19Z"/><path d="M10 40c6-10 13-17 23-25M19 31l-1-9m8 2 8-2"/></svg>';
  if (name === 'ruler') return '<svg aria-hidden="true" viewBox="0 0 48 48"><path d="m8 34 26-26 7 7-26 26H8v-7Z"/><path d="m29 13 6 6m-12 0 3 3m-9 3 6 6m-12 0 3 3"/></svg>';
  return '<svg aria-hidden="true" viewBox="0 0 48 48"><path d="M24 6 43 40H5L24 6Z"/><path d="M24 18v11m0 5v1"/></svg>';
}

function header(): string {
  const home = isDemo ? '/?demo=1' : '/';
  const privacy = isDemo ? '/privacy?demo=1' : '/privacy';
  return `<a class="skip-link" href="#main">Skip to main content</a><div id="route-status" class="sr-only" aria-live="polite" aria-atomic="true"></div>
  ${isDemo ? `<aside class="demo-banner" aria-label="Demo mode"><span class="demo-message"><strong>Demo</strong> — sample data, nothing is saved.</span><span class="demo-actions"><button class="text-button" data-action="reset-demo">Reset demo</button><button class="text-button" data-action="start-real">Start for real</button></span></aside>` : ''}
  <header class="site-header">
    <a class="wordmark" href="${home}" data-link>${icon('leaf')}<span>Shop Fit Sheet</span></a>
    <nav aria-label="Main navigation"><a href="/?demo=1" data-link>Demo</a><a href="${isDemo ? '/?demo=1#planner' : '/#planner'}">Planner</a><a href="${privacy}" data-link>Privacy</a></nav>
  </header>`;
}

function footer(): string {
  const home = isDemo ? '/?demo=1' : '/';
  const suffix = isDemo ? '?demo=1' : '';
  return `<footer><div><a class="wordmark footer-mark" href="${home}" data-link>${icon('leaf')}<span>Shop Fit Sheet</span></a><p>Check a fitted build before you buy sheet material.</p></div><nav aria-label="Footer navigation"><a href="/privacy${suffix}" data-link>Privacy</a><a href="/terms${suffix}" data-link>Terms</a><a href="https://hello-factory.sociobot.in" target="_blank" rel="noopener">Built by Param Factory <span class="sr-only">(opens in a new tab)</span></a></nav><small>Version ${BUILD_ID} · Original generated field-guide art</small></footer>`;
}

function field(label: string, key: keyof Project, options: { min?: number; step?: number; help?: string } = {}): string {
  const value = project[key];
  const id = `field-${String(key)}`;
  return `<label class="field" for="${id}"><span>${label}</span><span class="number-wrap"><input id="${id}" name="${String(key)}" data-field="${String(key)}" type="number" inputmode="decimal" min="${options.min ?? 0}" step="${options.step ?? 'any'}" value="${escapeHtml(inputValue(value as number))}" ${options.help ? `aria-describedby="${id}-help"` : ''}><b aria-hidden="true">${project.unit}</b></span>${options.help ? `<small id="${id}-help">${options.help}</small>` : ''}</label>`;
}

function countField(label: string, key: CountKey): string {
  const error = countError(key);
  const errorId = `field-${key}-error`;
  return `<div class="field"><label for="field-${key}">${label}</label><input id="field-${key}" name="${key}" data-field="${key}" type="number" inputmode="numeric" min="0" max="${COUNT_LIMITS[key]}" step="1" value="${project[key]}" aria-describedby="${errorId}" ${error ? 'aria-invalid="true"' : ''}><small id="${errorId}" class="field-error" aria-live="polite">${error}</small></div>`;
}

function calculator(): string {
  return `<section class="planner" id="planner" aria-labelledby="planner-heading">
    <div class="section-kicker">Live calculation</div>
    <div class="planner-heading"><div><h2 id="planner-heading">Measure the space, then size the build</h2><p>All dimensions use ${project.unit === 'mm' ? 'millimetres' : 'inches'}. Results update while you type.</p></div>
      <label class="unit-switch" for="unit"><span>Units</span><select id="unit" data-unit><option value="mm" ${project.unit === 'mm' ? 'selected' : ''}>Millimetres</option><option value="in" ${project.unit === 'in' ? 'selected' : ''}>Inches</option></select></label></div>
    <div class="planner-grid">
      <form class="measure-form" novalidate>
        <fieldset><legend><b>01</b> Project note</legend><div class="two-col"><label class="field" for="field-name"><span>Project name</span><input id="field-name" data-field="name" type="text" value="${escapeHtml(project.name)}"></label><label class="field" for="field-location"><span>Fitted location</span><input id="field-location" data-field="location" type="text" value="${escapeHtml(project.location)}"></label></div></fieldset>
        <fieldset><legend><b>02</b> Space envelope</legend><div class="three-col">${field('Space width', 'spaceWidth')}${field('Space height', 'spaceHeight')}${field('Space depth', 'spaceDepth')}</div><h3>Clearance to leave</h3><div class="clearance-grid">${field('Left', 'clearanceLeft')}${field('Right', 'clearanceRight')}${field('Top', 'clearanceTop')}${field('Floor', 'clearanceBottom')}${field('Behind', 'clearanceBack', { help: 'For walls, doors, cables, or airflow.' })}</div></fieldset>
        <fieldset><legend><b>03</b> Outer build</legend><div class="three-col">${field('Build width', 'outerWidth')}${field('Build height', 'outerHeight')}${field('Build depth', 'outerDepth')}</div><div class="three-col">${field('Panel thickness', 'panelThickness', { min: 0.1 })}${countField('Centre supports', 'supports')}${countField('Shelves total', 'shelves')}</div></fieldset>
        <fieldset><legend><b>04</b> Doors and back</legend><div class="three-col">${countField('Doors', 'doors')}<label class="field" for="door-style"><span>Door style</span><select id="door-style" data-field="doorStyle"><option value="overlay" ${project.doorStyle === 'overlay' ? 'selected' : ''}>Overlay slab</option><option value="inset" ${project.doorStyle === 'inset' ? 'selected' : ''}>Inset slab</option></select></label>${field('Door gap', 'doorGap')}</div><label class="check-row" for="include-back"><input id="include-back" data-field="includeBack" type="checkbox" ${project.includeBack ? 'checked' : ''}><span>Include a back panel</span></label>${project.includeBack ? `<div class="three-col">${field('Back thickness', 'backThickness', { min: 0.1 })}</div>` : ''}</fieldset>
        <fieldset><legend><b>05</b> Stock sheet</legend><div class="two-col">${field('Sheet width', 'sheetWidth', { min: 0.1 })}${field('Sheet length', 'sheetHeight', { min: 0.1 })}</div></fieldset>
      </form>
      <aside class="result-column" aria-label="Live fit results"><div class="diagram-slot">${diagram()}</div><div class="result-slot" aria-live="polite">${results(!isDemo)}</div></aside>
    </div>
  </section>`;
}

function diagram(): string {
  const result = calculate(project);
  const maxW = Math.max(project.spaceWidth, 1); const maxH = Math.max(project.spaceHeight, 1);
  const w = Math.max(12, Math.min(250, (project.outerWidth / maxW) * 250));
  const h = Math.max(12, Math.min(170, (project.outerHeight / maxH) * 170));
  const supports = Number.isInteger(project.supports) && project.supports >= 0 && project.supports <= COUNT_LIMITS.supports ? project.supports : 0;
  const supportLines = Array.from({ length: supports }, (_, i) => `<line x1="${24 + w * ((i + 1) / (supports + 1))}" x2="${24 + w * ((i + 1) / (supports + 1))}" y1="${25 + (170 - h)}" y2="195" />`).join('');
  const conflicts = result.findings.filter((f) => f.level === 'conflict').length;
  const supportDescription = supports === project.supports
    ? `${supports} centre ${supports === 1 ? 'support' : 'supports'}`
    : 'a support count that needs correction';
  return `<figure class="cabinet-diagram"><svg role="img" aria-labelledby="diagram-title diagram-desc" viewBox="0 0 300 235"><title id="diagram-title">Front view of the fitted build</title><desc id="diagram-desc">The build is ${format(project.outerWidth)} by ${format(project.outerHeight)} ${project.unit} with ${supportDescription}.</desc><rect class="space-box" x="18" y="18" width="264" height="185"/><rect class="build-box ${conflicts ? 'has-conflict' : ''}" x="24" y="${25 + (170 - h)}" width="${w}" height="${h}"/>${supportLines}<path class="dimension" d="M24 218h${w}m-${w} -4v8m${w} -8v8"/><text x="${24 + w / 2}" y="231" text-anchor="middle">${format(project.outerWidth)} ${project.unit}</text></svg><figcaption>Front view · clear envelope shown as a dashed line</figcaption></figure>`;
}

function format(value: number): string { return Number.isFinite(value) ? new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value) : '—'; }

function formatArea(value: number): string {
  const divisor = project.unit === 'mm' ? 1_000_000 : 144;
  const unit = project.unit === 'mm' ? 'm²' : 'ft²';
  return `${format(value / divisor)} ${unit}`;
}

function verdict(): string {
  const r = calculate(project);
  const conflicts = r.findings.filter((f) => f.level === 'conflict').length;
  const checks = r.findings.filter((f) => f.level === 'check').length;
  const status = conflicts ? `${conflicts} ${conflicts === 1 ? 'conflict' : 'conflicts'} to fix` : checks ? `Fits with ${checks} ${checks === 1 ? 'check' : 'checks'}` : 'Fits the cleared space';
  const statusClass = conflicts ? 'conflict' : checks ? 'check' : 'pass';
  const findings = r.findings.map((f) => `<li class="finding ${f.level}"><span aria-hidden="true">${f.level === 'conflict' ? '×' : f.level === 'check' ? '!' : '✓'}</span>${escapeHtml(f.text)}</li>`).join('');
  return `<section class="fit-verdict ${statusClass}" aria-labelledby="verdict-title"><p class="eyebrow">Fit verdict</p><h3 id="verdict-title">${status}</h3><ul>${findings}</ul></section>`;
}

function results(includeVerdict = true): string {
  const r = calculate(project);
  const rows = r.pieces.length ? r.pieces.map((piece) => `<tr><th scope="row">${piece.part}<small>${escapeHtml(piece.note)}</small></th><td>${piece.quantity}</td><td>${format(piece.length)} × ${format(piece.width)}</td><td>${format(piece.thickness)}</td></tr>`).join('') : '<tr><td colspan="4" class="empty-cell">Your panel list appears after you enter the space and build sizes.</td></tr>';
  const stocks = r.sheetEstimate.map((s) => `<li data-stock-thickness="${s.thickness}"><strong>${s.sheets}</strong> × ${format(project.sheetWidth)} × ${format(project.sheetHeight)} ${project.unit} sheet at ${format(s.thickness)} ${project.unit}<span class="stock-area">Panel area ${formatArea(s.area)} + 15% allowance (${formatArea(s.allowance)}) = ${formatArea(s.totalArea)}.</span></li>`).join('');
  return `${includeVerdict ? verdict() : ''}<section class="opening-note"><h3>Calculated openings</h3><dl><div><dt>Each opening</dt><dd>${format(r.openingWidth)} × ${format(r.openingHeight)} ${project.unit}</dd></div>${r.doorWidth > 0 ? `<div><dt>Each door blank</dt><dd>${format(r.doorWidth)} × ${format(r.doorHeight)} ${project.unit}</dd></div>` : ''}<div><dt>Clear envelope</dt><dd>${format(r.availableWidth)} × ${format(r.availableHeight)} × ${format(r.availableDepth)} ${project.unit}</dd></div></dl></section>
    <section class="cut-list" aria-labelledby="cut-list-title"><div class="result-heading"><h3 id="cut-list-title">Panel list</h3><button class="secondary-button" data-action="print">Print build sheet</button></div><div class="table-wrap"><table><thead><tr><th>Part</th><th>Qty</th><th>Length × width</th><th>Thick.</th></tr></thead><tbody>${rows}</tbody></table></div>${stocks ? `<div class="stock-estimate"><h4>Rough sheet allowance</h4><ul>${stocks}</ul><p>Each material thickness adds 15% of its panel area before sheet counting. This is not a cutting layout.</p></div>` : ''}</section>`;
}

function supportingSections(): string {
  return `<section class="how" aria-labelledby="how-heading"><h2 id="how-heading">How the fit check works</h2><ol><li><span>01</span><div><h3>Measure the space</h3><p>Record the tightest width, height, and depth. Add room for walls, doors, cables, and airflow.</p></div></li><li><span>02</span><div><h3>Describe the build</h3><p>Enter the outer size, panel thickness, supports, shelves, and doors.</p></div></li><li><span>03</span><div><h3>Check before buying</h3><p>Fix conflicts. Then print the panel list and verify every size at the site.</p></div></li></ol></section>
    <section class="limits" aria-labelledby="limits-heading"><div><h2 id="limits-heading">A fit check, not an engineering drawing</h2></div><div><p>Shop Fit Sheet checks the outer envelope and makes a rough panel list. It does not design joints, choose fixings, test loads, or optimise cuts.</p><p>Your current plan stays in your browser.</p></div></section>`;
}

function demoOverview(): string {
  return `<section class="demo-overview" aria-labelledby="page-title"><div class="demo-project"><p class="section-kicker">Sample fit check</p><h1 id="page-title" data-project-title tabindex="-1">${escapeHtml(project.name || 'Untitled fit sheet')}</h1><p class="demo-location" data-project-location>${escapeHtml(project.location)}</p><a class="secondary-button" href="#planner">Edit sample measurements <span aria-hidden="true">↓</span></a></div><div class="demo-verdict-slot" aria-live="polite">${verdict()}</div></section>`;
}

function landing(): string {
  if (isDemo) {
    return `${header()}<main id="main" class="demo-page" tabindex="-1">
      ${demoOverview()}
      <aside class="safety-note demo-safety">${icon('warn')}<div><strong>Measure twice. Verify the result before cutting.</strong><p>This sheet is not structural or load-safety advice. Confirm fixings, spans, hinges, ventilation, and site conditions.</p></div></aside>
      ${calculator()}
      ${supportingSections()}
    </main>${footer()}`;
  }
  return `${header()}<main id="main" tabindex="-1">
    <section class="hero" aria-labelledby="page-title"><div class="hero-copy"><h1 id="page-title" tabindex="-1">Check a fitted build before buying sheet material</h1><p class="lede">For home makers fitting cabinets or benches into tight garages, utility rooms, and vehicles.</p><div class="hero-actions"><a class="primary-button" href="/?demo=1" data-link>Try it with sample data <span aria-hidden="true">→</span></a><span>See a filled plan and its conflicts.</span></div><ul class="plain-facts"><li>${icon('leaf')} Plans stay on this device</li><li>${icon('ruler')} Works offline after the first visit</li><li>${icon('warn')} Calculator and printable build sheet</li></ul></div><figure class="hero-art"><picture><source media="(max-width: 700px)" srcset="${heroMobile}"><img src="${heroDesktop}" width="1200" height="800" alt="A plywood cabinet arranged like a botanical specimen beside a fern and folding rule." fetchpriority="high" decoding="async"></picture><figcaption>Cabinet planning reference image, generated for Shop Fit Sheet</figcaption></figure></section>
    <aside class="safety-note">${icon('warn')}<div><strong>Measure twice. Verify the result before cutting.</strong><p>This sheet is not structural or load-safety advice. Confirm fixings, spans, hinges, ventilation, and site conditions.</p></div></aside>
    ${calculator()}
    ${supportingSections()}
  </main>${footer()}`;
}

function legalPage(kind: 'privacy' | 'terms'): string {
  const privacy = kind === 'privacy';
  document.title = `${privacy ? 'Privacy' : 'Terms'} — Shop Fit Sheet`;
  return `${header()}<main id="main" class="legal" tabindex="-1"><h1 tabindex="-1">${privacy ? 'Your plan stays in your browser' : 'Use the sheet as a planning aid'}</h1>${privacy ? `<p class="lede">Shop Fit Sheet has no account, analytics, advertising, or tracking.</p><h2>What is stored</h2><p>Your current plan and demo plan use local browser storage. Demo data uses a separate <code>demo:</code> storage key.</p><h2>What leaves the device</h2><p>Calculator data does not leave your device. Shop Fit Sheet makes no third-party requests.</p><h2>Remove your data</h2><p>Clear this site’s browser storage to remove plans. “Reset demo” removes the demo copy.</p>` : `<p class="lede">Check every measurement and safety decision before you cut or install anything.</p><h2>Planning output only</h2><p>The calculator estimates fit, panel sizes, and sheet area from the measurements you enter. It is not engineering, structural, electrical, vehicle, or load-safety advice.</p><h2>Your responsibility</h2><p>You must verify site dimensions, material thickness, joints, fixings, loads, clearances, hinge rules, airflow, and local requirements.</p><h2>No warranty</h2><p>The software is provided “as is”, without warranty. See the MIT License in the source repository for the full terms.</p>`}</main>${footer()}`;
}

function notFound(): string {
  document.title = 'Page not found — Shop Fit Sheet';
  return `${header()}<main id="main" class="not-found" tabindex="-1"><div class="pressed-leaf">${icon('leaf')}</div><div><h1 tabindex="-1">Page not found</h1><p>The address may be wrong or the page may have moved.</p><a class="primary-button" href="/" data-link>Return to the fit checker</a></div></main>${footer()}`;
}

function render(): void {
  const path = location.pathname.replace(/\/$/, '') || '/';
  if (path === '/' || path === '/demo') {
    app.innerHTML = landing();
    bindCalculator();
  } else if (path === '/privacy') app.innerHTML = legalPage('privacy');
  else if (path === '/terms') app.innerHTML = legalPage('terms');
  else app.innerHTML = notFound();
  bindCommon();
  updateMetadata(path);
}

function bindCalculator(): void {
  document.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-field]').forEach((control) => {
    control.addEventListener('input', () => {
      const key = control.dataset.field as keyof Project;
      if (control instanceof HTMLInputElement && control.type === 'checkbox') {
        (project[key] as boolean) = control.checked;
        (canonicalProject[key] as boolean) = control.checked;
      } else if (control instanceof HTMLInputElement && control.type === 'number') {
        const value = control.value === '' ? 0 : Number(control.value);
        (project[key] as number) = value;
        (canonicalProject[key] as number) = dimensionKeys.has(key) && displayUnit === 'in' ? value * 25.4 : value;
      } else {
        (project[key] as string) = control.value;
        (canonicalProject[key] as string) = control.value;
      }
      saveProject();
      if (control instanceof HTMLInputElement && countKeys.has(key)) {
        const error = countError(key as CountKey);
        if (error) control.setAttribute('aria-invalid', 'true');
        else control.removeAttribute('aria-invalid');
        const errorElement = document.querySelector<HTMLElement>(`#${control.id}-error`);
        if (errorElement) errorElement.textContent = error;
      }
      document.querySelector('.diagram-slot')!.innerHTML = diagram();
      document.querySelector('.result-slot')!.innerHTML = results(!isDemo);
      const demoVerdict = document.querySelector<HTMLElement>('.demo-verdict-slot');
      if (demoVerdict) demoVerdict.innerHTML = verdict();
      const projectTitle = document.querySelector<HTMLElement>('[data-project-title]');
      if (projectTitle) projectTitle.textContent = project.name.trim() || 'Untitled fit sheet';
      const projectLocation = document.querySelector<HTMLElement>('[data-project-location]');
      if (projectLocation) projectLocation.textContent = project.location;
      document.querySelector<HTMLElement>('[data-action="print"]')?.addEventListener('click', (event) => handleAction(event.currentTarget as HTMLElement));
      if (key === 'includeBack') render();
    });
  });
  document.querySelector<HTMLSelectElement>('[data-unit]')?.addEventListener('change', (event) => {
    displayUnit = (event.target as HTMLSelectElement).value as Unit; syncDisplayProject(); saveProject(); render();
  });
}

function bindCommon(): void {
  document.querySelector<HTMLAnchorElement>('.skip-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    const main = document.querySelector<HTMLElement>('#main');
    main?.focus({ preventScroll: true });
    main?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  });
  document.querySelectorAll<HTMLAnchorElement>('a[data-link]').forEach((link) => link.addEventListener('click', (event) => {
    if (link.origin !== location.origin) return; event.preventDefault(); navigate(`${link.pathname}${link.search}${link.hash}`);
  }));
  document.querySelectorAll<HTMLElement>('[data-action]').forEach((button) => button.addEventListener('click', () => handleAction(button)));
  document.querySelector<HTMLElement>('#main')?.addEventListener('focusin', (event) => {
    if (!isDemo || !(event.target instanceof HTMLElement)) return;
    const focusTarget = event.target;
    requestAnimationFrame(() => {
      const banner = document.querySelector<HTMLElement>('.demo-banner');
      if (!banner) return;
      const targetBox = focusTarget.getBoundingClientRect();
      const bannerBox = banner.getBoundingClientRect();
      if (targetBox.top < bannerBox.bottom + 8) window.scrollBy({ top: targetBox.top - bannerBox.bottom - 16, behavior: 'auto' });
    });
  });
}

function handleAction(button: HTMLElement): void {
  const action = button.dataset.action;
  if (action === 'print') window.print();
  if (action === 'reset-demo') {
    localStorage.removeItem(DEMO_KEY); canonicalProject = structuredClone(sampleProject); displayUnit = 'mm'; syncDisplayProject(); saveProject(); render();
    requestAnimationFrame(() => {
      document.querySelector<HTMLButtonElement>('[data-action="reset-demo"]')?.focus({ preventScroll: true });
      const status = document.querySelector<HTMLElement>('#route-status');
      if (status) status.textContent = 'Demo reset to sample data.';
    });
  }
  if (action === 'start-real') { localStorage.removeItem(DEMO_KEY); navigate('/'); }
}

function navigate(path: string): void {
  const next = new URL(path, location.href);
  history.pushState({}, '', `${next.pathname}${next.search}${next.hash}`);
  isDemo = isDemoUrl(next);
  reloadProject();
  render();
  finishRouteChange();
}

function finishRouteChange(): void {
  scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  requestAnimationFrame(() => {
    const heading = document.querySelector<HTMLElement>('h1');
    heading?.focus({ preventScroll: true });
    const status = document.querySelector<HTMLElement>('#route-status');
    if (!status || !heading) return;
    status.textContent = '';
    setTimeout(() => { if (status.isConnected) status.textContent = `Page changed: ${heading.textContent ?? ''}`; }, 0);
  });
}

function updateMetadata(path: string): void {
  const page = path === '/' || path === '/demo'
    ? isDemo
      ? { title: 'Demo — Shop Fit Sheet', description: 'Try a sample fitted-build plan with isolated data you can reset.', canonicalPath: path === '/demo' ? '/demo' : '/?demo=1' }
      : { title: 'Shop Fit Sheet — Check a fitted build', description: 'Check cabinet clearances, panels, doors, and sheet material before you buy.', canonicalPath: '/' }
    : path === '/privacy'
      ? { title: 'Privacy — Shop Fit Sheet', description: 'Learn how Shop Fit Sheet keeps plans in your browser.', canonicalPath: '/privacy' }
      : path === '/terms'
        ? { title: 'Terms — Shop Fit Sheet', description: 'Read the planning and safety terms for Shop Fit Sheet.', canonicalPath: '/terms' }
        : { title: 'Page not found — Shop Fit Sheet', description: 'Return to the Shop Fit Sheet calculator.', canonicalPath: path };
  const absoluteUrl = `https://shop-fit-sheet.sociobot.in${page.canonicalPath}`;
  document.title = page.title;
  document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute('content', page.description);
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', absoluteUrl);
  document.querySelector<HTMLMetaElement>('meta[property="og:title"]')?.setAttribute('content', page.title);
  document.querySelector<HTMLMetaElement>('meta[property="og:description"]')?.setAttribute('content', page.description);
  document.querySelector<HTMLMetaElement>('meta[property="og:url"]')?.setAttribute('content', absoluteUrl);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')?.setAttribute('content', page.title);
  document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')?.setAttribute('content', page.description);
}

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.addEventListener('popstate', () => { isDemo = isDemoUrl(new URL(location.href)); reloadProject(); render(); finishRouteChange(); });
window.addEventListener('offline', () => { document.body.dataset.offline = 'true'; });
window.addEventListener('online', () => { delete document.body.dataset.offline; });
if (!navigator.onLine) document.body.dataset.offline = 'true';
render();
document.querySelector<HTMLMetaElement>('meta[property="og:image"]')?.setAttribute('content', new URL(socialImage, location.origin).href);
document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')?.setAttribute('content', new URL(socialImage, location.origin).href);
if ('serviceWorker' in navigator && import.meta.env.PROD) window.addEventListener('load', () => void navigator.serviceWorker.register('/sw.js'));
