const svg = (body: string) =>
  `<svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

/** Hand-drawn pictograms, one per toolbar entry and HUD control. Static markup only. */
export const ICONS: Record<string, string> = {
  miner: svg(
    '<rect x="5" y="23" width="22" height="4" rx="1.5" fill="#566074"/>' +
      '<path d="M9 23V8h14v15" stroke="#f2b632" stroke-width="2.6"/>' +
      '<rect x="12" y="5" width="8" height="5" rx="1.2" fill="#f2b632"/>' +
      '<path d="M16 10v6" stroke="#cdd3dc" stroke-width="2.4"/>' +
      '<path d="M12 15h8l-4 8z" fill="#cdd3dc"/>',
  ),
  conveyor: svg(
    '<rect x="3" y="12" width="26" height="9" rx="4.5" fill="#3b4252" stroke="#7b869b" stroke-width="1.6"/>' +
      '<path d="M9 14.5l2.5 2-2.5 2M15 14.5l2.5 2-2.5 2M21 14.5l2.5 2-2.5 2" stroke="#ffb547" stroke-width="1.8"/>' +
      '<circle cx="8" cy="24.5" r="1.6" fill="#7b869b"/><circle cx="24" cy="24.5" r="1.6" fill="#7b869b"/>',
  ),
  furnace: svg(
    '<rect x="6" y="10" width="20" height="17" rx="2.5" fill="#b9583c"/>' +
      '<rect x="19" y="3" width="5" height="8" rx="1" fill="#566074"/>' +
      '<rect x="10" y="15" width="12" height="9" rx="1.5" fill="#2e3440"/>' +
      '<path d="M16 16.5c2.4 2 3 3.4 3 4.6a3 3 0 01-6 0c0-1 .5-1.8 1.4-2.6.2 1 .7 1.4 1.200 1.400.2-1.200.2-2.200.4-3.400z" fill="#ffb547"/>',
  ),
  assembler: svg(
    '<rect x="5" y="19" width="22" height="8" rx="2" fill="#3d8f9c"/>' +
      '<path d="M8 19V6h16v13" stroke="#f2b632" stroke-width="2.4"/>' +
      '<path d="M16 6v7" stroke="#cdd3dc" stroke-width="2.6"/>' +
      '<rect x="11.5" y="12" width="9" height="3.5" rx="1" fill="#cdd3dc"/>' +
      '<circle cx="16" cy="23" r="2.2" fill="#e0a83c"/>',
  ),
  fabricator: svg(
    '<rect x="4" y="21" width="24" height="7" rx="2" fill="#6b5fa8"/>' +
      '<rect x="7" y="17" width="6" height="5" rx="1" fill="#f2b632"/>' +
      '<path d="M10 17l5-9 8 4" stroke="#f2b632" stroke-width="2.6"/>' +
      '<path d="M23 12v5" stroke="#cdd3dc" stroke-width="2.4"/>' +
      '<circle cx="15" cy="8" r="2.200" fill="#3b4252"/><circle cx="23" cy="12" r="1.800" fill="#3b4252"/>',
  ),
  seller: svg(
    '<path d="M4 13l3-7h18l3 7z" fill="#d9534f"/>' +
      '<rect x="6" y="13" width="20" height="14" rx="1.5" fill="#efe2c4"/>' +
      '<circle cx="16" cy="20" r="5" fill="#ffcf40" stroke="#c98f1a" stroke-width="1.4"/>' +
      '<path d="M17.600 18.400c-.5-.6-1.100-.8-1.800-.8-1 0-1.700.5-1.700 1.200 0 1.700 3.600.8 3.600 2.500 0 .8-.8 1.300-1.800 1.300-.8 0-1.500-.3-2-.9M16 16.600v6.800" stroke="#8a5a00" stroke-width="1.2"/>',
  ),
  splitter: svg(
    '<rect x="11" y="11" width="10" height="10" rx="2" fill="#f2b632"/>' +
      '<path d="M3 16h8" stroke="#59c36a" stroke-width="2.6"/>' +
      '<path d="M21 16h8M16 11V4M16 21v7" stroke="#ff9d3c" stroke-width="2.6"/>' +
      '<path d="M26 13l3 3-3 3M13 7l3-3 3 3M13 25l3 3 3-3" stroke="#ff9d3c" stroke-width="2"/>',
  ),
  merger: svg(
    '<rect x="11" y="11" width="10" height="10" rx="2" fill="#3d8f9c"/>' +
      '<path d="M3 16h8M16 4v7M16 28v-7" stroke="#59c36a" stroke-width="2.6"/>' +
      '<path d="M21 16h8" stroke="#ff9d3c" stroke-width="2.6"/>' +
      '<path d="M26 13l3 3-3 3" stroke="#ff9d3c" stroke-width="2"/>',
  ),
  storage: svg(
    '<path d="M4 13l12-7 12 7v13H4z" fill="#7f8ea8"/>' +
      '<path d="M4 13l12-7 12 7" stroke="#566074" stroke-width="2.4"/>' +
      '<rect x="10" y="17" width="12" height="9" rx="1" fill="#7a5236"/>' +
      '<path d="M10 21.500h12M16 17v9" stroke="#553823" stroke-width="1.4"/>',
  ),
  wind_turbine: svg(
    '<path d="M16 15v13" stroke="#eef1f5" stroke-width="2.6"/>' +
      '<path d="M11 28h10" stroke="#566074" stroke-width="2.6"/>' +
      '<path d="M16 14V3.500l3 4.500zM16 14l-9.300 5 5.600.300zM16 14l9.300 5-2-5.300z" fill="#eef1f5"/>' +
      '<circle cx="16" cy="14" r="2.400" fill="#ffb547"/>',
  ),
  power: svg('<path d="M18 3L7 18h7l-2 11 13-16h-8z" fill="currentColor"/>'),
  bottleneck: svg(
    '<path d="M6 22a10 10 0 0120 0" stroke="currentColor" stroke-width="2.6"/>' +
      '<path d="M16 22l5-8" stroke="currentColor" stroke-width="2.6"/>' +
      '<circle cx="16" cy="22" r="2.2" fill="currentColor"/>',
  ),
  copy: svg(
    '<rect x="11" y="11" width="15" height="15" rx="2.500" stroke="#60a5fa" stroke-width="2.400"/>' +
      '<path d="M8 21H7a2 2 0 01-2-2V7a2 2 0 012-2h12a2 2 0 012 2v1" stroke="#60a5fa" stroke-width="2.400"/>',
  ),
  blueprints: svg(
    '<rect x="5" y="6" width="22" height="20" rx="2.500" stroke="currentColor" stroke-width="2.400"/>' +
      '<path d="M5 13h22M12 13v13M12 19.500h15" stroke="currentColor" stroke-width="2"/>',
  ),
  prestige: svg(
    '<path d="M16 4l3.600 7.600 8.400 1-6.200 5.700 1.700 8.200L16 22.400l-7.500 4.100 1.700-8.200L4 12.600l8.400-1z" fill="currentColor"/>',
  ),
  achievements: svg(
    '<path d="M10 5h12v7a6 6 0 01-12 0z" stroke="currentColor" stroke-width="2.4"/>' +
      '<path d="M10 7H5.500v2a4 4 0 004.500 4M22 7h4.500v2a4 4 0 01-4.500 4M16 18v5M11 27h10M13 23h6" stroke="currentColor" stroke-width="2.4"/>',
  ),
  contracts: svg(
    '<rect x="7" y="6" width="18" height="21" rx="2.5" stroke="currentColor" stroke-width="2.4"/>' +
      '<rect x="12" y="3.500" width="8" height="5" rx="1.5" fill="currentColor"/>' +
      '<path d="M11.500 15l2.200 2.200 4.300-4.400M11.500 22h9" stroke="currentColor" stroke-width="2.2"/>',
  ),
  expand: svg(
    '<rect x="11" y="11" width="10" height="10" rx="1.5" fill="currentColor" opacity="0.55"/>' +
      '<path d="M5 12V5h7M27 12V5h-7M5 20v7h7M27 20v7h-7" stroke="currentColor" stroke-width="2.6"/>',
  ),
  research: svg(
    '<path d="M13 5h6M14 5v8l-6 11a2 2 0 001.800 3h12.400a2 2 0 001.800-3l-6-11V5" stroke="currentColor" stroke-width="2.4"/>' +
      '<path d="M10.500 21h11" stroke="currentColor" stroke-width="2.4"/>',
  ),
  delete: svg(
    '<path d="M7 10h18M13 10V7h6v3M9.500 10l1 16h11l1-16M14 14v8M18 14v8" stroke="#f87171" stroke-width="2.2"/>',
  ),
  pause: svg('<path d="M11 8v16M21 8v16" stroke="currentColor" stroke-width="4"/>'),
  settings: svg(
    '<circle cx="16" cy="16" r="4" stroke="currentColor" stroke-width="2.4"/>' +
      '<path d="M16 4v4M16 24v4M4 16h4M24 16h4M7.500 7.500l2.800 2.800M21.700 21.700l2.800 2.800M24.500 7.500l-2.800 2.800M10.300 21.700l-2.800 2.800" stroke="currentColor" stroke-width="2.6"/>',
  ),
};
