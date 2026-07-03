import './style.css';
import { initCanvasReveal } from './canvas-reveal.js';
import { initCTA, showCTA } from './cta.js';

const canvas = document.getElementById('reveal-canvas');

initCTA();
initCanvasReveal(canvas, showCTA);
