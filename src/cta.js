import { CTA_URL } from './reveal-logic.js';

export function initCTA() {
  const btn = document.getElementById('cta-button');
  btn.href = CTA_URL;
}

export function showCTA() {
  const btn = document.getElementById('cta-button');
  btn.classList.add('visible');
}
