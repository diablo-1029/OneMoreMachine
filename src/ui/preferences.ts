import type { MotionPreference } from '../core/save/SaveSchema';

/**
 * Interface preferences that many unrelated pieces of UI need to read: how large the interface
 * is drawn and whether animation should be kept to a minimum. Set once by the App whenever
 * settings change.
 */

let scale = 1;

/** How much the whole UI layer is magnified. Screen pixels ÷ this = pixels inside the UI layer. */
export function uiScale(): number {
  return scale;
}

export function setUiScale(root: HTMLElement, value: number): void {
  scale = value;
  root.style.setProperty('--ui-scale', String(value));
  root.toggleAttribute('data-scaled', value !== 1);
}

/** True when animation should be reduced to plain appearing and disappearing. */
export function reducedMotion(): boolean {
  return document.documentElement.dataset.motion === 'reduced';
}

/** Applies the player's choice; "system" follows the operating system's setting. */
export function setMotionPreference(preference: MotionPreference): void {
  const system = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const reduced = preference === 'on' || (preference === 'system' && system);
  document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
}
