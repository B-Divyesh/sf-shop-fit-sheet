export type Unit = 'mm' | 'in';
export type DoorStyle = 'overlay' | 'inset';
export type CountKey = 'supports' | 'shelves' | 'doors';

export interface Project {
  name: string;
  location: string;
  unit: Unit;
  spaceWidth: number;
  spaceHeight: number;
  spaceDepth: number;
  clearanceLeft: number;
  clearanceRight: number;
  clearanceTop: number;
  clearanceBottom: number;
  clearanceBack: number;
  outerWidth: number;
  outerHeight: number;
  outerDepth: number;
  panelThickness: number;
  supports: number;
  shelves: number;
  doors: number;
  doorStyle: DoorStyle;
  doorGap: number;
  includeBack: boolean;
  backThickness: number;
  sheetWidth: number;
  sheetHeight: number;
}

export interface Piece {
  part: string;
  quantity: number;
  length: number;
  width: number;
  thickness: number;
  note: string;
}

export interface Finding {
  level: 'conflict' | 'check' | 'pass';
  text: string;
}

export interface Result {
  availableWidth: number;
  availableHeight: number;
  availableDepth: number;
  openingWidth: number;
  openingHeight: number;
  doorWidth: number;
  doorHeight: number;
  pieces: Piece[];
  findings: Finding[];
  sheetEstimate: Array<{ thickness: number; sheets: number; area: number; allowance: number; totalArea: number }>;
}

/** Added to each material-thickness panel area before rough sheet counting. */
export const SHEET_AREA_ALLOWANCE = 0.15;

export const COUNT_LIMITS: Record<CountKey, number> = {
  supports: 8,
  shelves: 30,
  doors: 12,
};

export const DIMENSION_KEYS = [
  'spaceWidth', 'spaceHeight', 'spaceDepth',
  'clearanceLeft', 'clearanceRight', 'clearanceTop', 'clearanceBottom', 'clearanceBack',
  'outerWidth', 'outerHeight', 'outerDepth', 'panelThickness', 'doorGap', 'backThickness',
  'sheetWidth', 'sheetHeight',
] as const satisfies ReadonlyArray<keyof Project>;

export type DimensionKey = typeof DIMENSION_KEYS[number];

export const blankProject: Project = {
  name: 'Untitled fit sheet', location: '', unit: 'mm',
  spaceWidth: 0, spaceHeight: 0, spaceDepth: 0,
  clearanceLeft: 10, clearanceRight: 10, clearanceTop: 10, clearanceBottom: 0, clearanceBack: 20,
  outerWidth: 0, outerHeight: 0, outerDepth: 0,
  panelThickness: 18, supports: 0, shelves: 0, doors: 0, doorStyle: 'overlay', doorGap: 2,
  includeBack: true, backThickness: 6, sheetWidth: 1220, sheetHeight: 2440,
};

export const sampleProject: Project = {
  name: 'Van bed utility cabinet', location: 'Left bay below the bed platform', unit: 'mm',
  spaceWidth: 1400, spaceHeight: 840, spaceDepth: 780,
  clearanceLeft: 15, clearanceRight: 15, clearanceTop: 20, clearanceBottom: 10, clearanceBack: 40,
  outerWidth: 1350, outerHeight: 800, outerDepth: 750,
  panelThickness: 18, supports: 1, shelves: 2, doors: 2, doorStyle: 'overlay', doorGap: 3,
  includeBack: true, backThickness: 6, sheetWidth: 1220, sheetHeight: 2440,
};

const positive = (value: number) => Number.isFinite(value) && value > 0;
const round = (value: number) => Math.abs(value) > 0 && Math.abs(value) < 0.01
  ? Math.round(value * 10_000) / 10_000
  : Math.round(value * 100) / 100;
const validCount = (key: CountKey, value: number) => Number.isInteger(value) && value >= 0 && value <= COUNT_LIMITS[key];

export function calculate(p: Project): Result {
  const supports = validCount('supports', p.supports) ? p.supports : 0;
  const shelves = validCount('shelves', p.shelves) ? p.shelves : 0;
  const doors = validCount('doors', p.doors) ? p.doors : 0;
  const availableWidth = p.spaceWidth - p.clearanceLeft - p.clearanceRight;
  const availableHeight = p.spaceHeight - p.clearanceTop - p.clearanceBottom;
  const availableDepth = p.spaceDepth - p.clearanceBack;
  const innerWidth = p.outerWidth - (2 + supports) * p.panelThickness;
  const openingWidth = innerWidth / Math.max(1, supports + 1);
  const openingHeight = p.outerHeight - 2 * p.panelThickness;
  const insetWidth = innerWidth / Math.max(1, doors);
  const doorWidth = doors > 0
    ? p.doorStyle === 'inset' ? insetWidth - 2 * p.doorGap : (p.outerWidth - (doors + 1) * p.doorGap) / doors
    : 0;
  const doorHeight = p.doorStyle === 'inset' ? openingHeight - 2 * p.doorGap : p.outerHeight - 2 * p.doorGap;

  const pieces: Piece[] = [];
  if (positive(p.outerHeight) && positive(p.outerDepth)) pieces.push({ part: 'Side', quantity: 2, length: p.outerHeight, width: p.outerDepth, thickness: p.panelThickness, note: 'Full cabinet height' });
  if (positive(innerWidth) && positive(p.outerDepth)) pieces.push({ part: 'Top / bottom', quantity: 2, length: innerWidth + supports * p.panelThickness, width: p.outerDepth, thickness: p.panelThickness, note: 'Fits between sides' });
  if (supports > 0 && positive(openingHeight)) pieces.push({ part: 'Centre support', quantity: supports, length: openingHeight, width: p.outerDepth, thickness: p.panelThickness, note: 'Fits between top and bottom' });
  if (shelves > 0 && positive(openingWidth)) pieces.push({ part: 'Shelf', quantity: shelves, length: openingWidth, width: p.outerDepth, thickness: p.panelThickness, note: 'One opening wide; trim for hardware' });
  if (doors > 0 && positive(doorWidth) && positive(doorHeight)) pieces.push({ part: 'Door', quantity: doors, length: doorHeight, width: doorWidth, thickness: p.panelThickness, note: `${p.doorStyle === 'inset' ? 'Inset' : 'Overlay'} slab; confirm hinge overlay` });
  if (p.includeBack && positive(p.outerWidth) && positive(p.outerHeight)) pieces.push({ part: 'Back', quantity: 1, length: p.outerHeight, width: p.outerWidth, thickness: p.backThickness, note: 'Overall size; adjust for grooves or rebates' });

  const findings: Finding[] = [];
  const required = [p.spaceWidth, p.spaceHeight, p.spaceDepth, p.outerWidth, p.outerHeight, p.outerDepth, p.panelThickness, p.sheetWidth, p.sheetHeight];
  if (p.includeBack) required.push(p.backThickness);
  if (required.some((v) => !positive(v))) findings.push({ level: 'conflict', text: 'Enter positive space, build, panel, and stock measurements.' });
  const clearances = [p.clearanceLeft, p.clearanceRight, p.clearanceTop, p.clearanceBottom, p.clearanceBack, p.doorGap];
  if (clearances.some((v) => !Number.isFinite(v) || v < 0)) findings.push({ level: 'conflict', text: 'Clearances and gaps cannot be negative.' });
  const counts = [p.supports, p.shelves, p.doors];
  if (counts.some((v) => !Number.isInteger(v) || v < 0)) findings.push({ level: 'conflict', text: 'Supports, shelves, and doors must use whole numbers of zero or more.' });
  const boundedCounts: Array<[string, CountKey, number]> = [
    ['Centre supports', 'supports', p.supports],
    ['Shelves', 'shelves', p.shelves],
    ['Doors', 'doors', p.doors],
  ];
  for (const [label, key, value] of boundedCounts) {
    if (Number.isFinite(value) && Number.isInteger(value) && value > COUNT_LIMITS[key]) findings.push({ level: 'conflict', text: `${label} must be no more than ${COUNT_LIMITS[key]}.` });
  }
  const axes: Array<[string, number, number]> = [['width', p.outerWidth, availableWidth], ['height', p.outerHeight, availableHeight], ['depth', p.outerDepth, availableDepth]];
  for (const [axis, outer, available] of axes) {
    if (positive(outer) && positive(available) && outer > available) findings.push({ level: 'conflict', text: `Build ${axis} exceeds the cleared space by ${round(outer - available)} ${p.unit}.` });
  }
  if (positive(p.outerWidth) && innerWidth <= 0) findings.push({ level: 'conflict', text: 'Supports and side panels leave no usable opening width.' });
  if (positive(openingHeight) === false && positive(p.outerHeight)) findings.push({ level: 'conflict', text: 'Top and bottom panels leave no usable opening height.' });
  const spanLimit = p.unit === 'mm' ? 900 : 35.43;
  const doorLimit = p.unit === 'mm' ? 600 : 23.62;
  if (openingWidth > spanLimit) findings.push({ level: 'check', text: `An opening spans ${round(openingWidth)} ${p.unit}. Consider another support or confirm sag limits.` });
  if (doorWidth > doorLimit) findings.push({ level: 'check', text: `Each door is ${round(doorWidth)} ${p.unit} wide. Confirm hinge limits and door weight.` });
  for (const piece of pieces) {
    const fits = (piece.length <= p.sheetHeight && piece.width <= p.sheetWidth) || (piece.length <= p.sheetWidth && piece.width <= p.sheetHeight);
    if (!fits && positive(p.sheetWidth) && positive(p.sheetHeight)) findings.push({ level: 'conflict', text: `${piece.part} at ${round(piece.length)} × ${round(piece.width)} ${p.unit} does not fit the chosen stock sheet.` });
  }
  if (!findings.some((f) => f.level === 'conflict') && required.every(positive)) findings.unshift({ level: 'pass', text: 'The outer build fits inside the clear envelope.' });
  if (findings.length === 0) findings.push({ level: 'check', text: 'Add measurements to check this build.' });

  const groups = new Map<number, number>();
  for (const piece of pieces) groups.set(piece.thickness, (groups.get(piece.thickness) ?? 0) + piece.quantity * piece.length * piece.width);
  const sheetArea = p.sheetWidth * p.sheetHeight;
  const sheetEstimate = [...groups.entries()].map(([thickness, area]) => {
    const allowance = area * SHEET_AREA_ALLOWANCE;
    const totalArea = area + allowance;
    return { thickness, area, allowance, totalArea, sheets: sheetArea > 0 ? Math.ceil(totalArea / sheetArea) : 0 };
  });

  return { availableWidth, availableHeight, availableDepth, openingWidth, openingHeight, doorWidth, doorHeight, pieces, findings, sheetEstimate };
}

export function convertProject(project: Project, unit: Unit): Project {
  if (project.unit === unit) return { ...project };
  const factor = unit === 'in' ? 1 / 25.4 : 25.4;
  const converted = { ...project, unit };
  for (const key of DIMENSION_KEYS) (converted[key] as number) = (project[key] as number) * factor;
  return converted;
}
