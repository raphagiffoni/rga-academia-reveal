import './style.css';
import { initCanvasReveal } from './canvas-reveal.js';
import { initCTA, showCTA } from './cta.js';
import { initPixel, trackLead } from './pixel.js';

const canvas = document.getElementById('reveal-canvas');

initPixel();
initCTA();
initCanvasReveal(canvas, showCTA);

document.getElementById('cta-button').addEventListener('click', trackLead);
