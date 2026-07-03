import { countErasedPixels, isThresholdReached, getLogoRegionBounds } from './reveal-logic.js';

export function initCanvasReveal(canvas, onThresholdReached) {
  const ctx = canvas.getContext('2d');
  let thresholdMet = false;
  let hintHidden = false;
  const img = new Image();

  function fit() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawInitialImage();
  }

  // Computes draw dimensions matching object-fit:cover, with optional zoom-out for portrait
  function computeDraw() {
    const imgRatio = img.width / img.height;
    const canvasRatio = canvas.width / canvas.height;
    const isPortrait = canvasRatio < 1;
    let dw, dh;
    if (isPortrait) {
      // Portrait mobile: scale by height (image fills screen height), zoom out 80%
      dh = canvas.height * 0.8;
      dw = dh * imgRatio;
    } else {
      // Desktop: contain — never crop regardless of monitor aspect ratio
      if (canvasRatio > imgRatio) {
        dh = canvas.height;
        dw = dh * imgRatio;
      } else {
        dw = canvas.width;
        dh = dw / imgRatio;
      }
    }
    return { dw, dh, dx: (canvas.width - dw) / 2, dy: (canvas.height - dh) / 2 };
  }

  function drawInitialImage() {
    const { dw, dh, dx, dy } = computeDraw();
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(img, dx, dy, dw, dh);
    // Vignette over top edge to cover baked-in "ARRASTE E DESCUBRA" text
    const vignH = dh * 0.18;
    const vig = ctx.createLinearGradient(0, dy, 0, dy + vignH);
    vig.addColorStop(0,    'rgba(10,10,10,1)');
    vig.addColorStop(0.55, 'rgba(10,10,10,1)');
    vig.addColorStop(1,    'rgba(10,10,10,0)');
    ctx.fillStyle = vig;
    ctx.fillRect(dx, dy, dw, vignH);
    syncFinalImage(dw, dh, dx, dy);
  }

  // Keeps #final-image pixel-perfect behind the canvas
  function syncFinalImage(dw, dh, dx, dy) {
    const el = document.getElementById('final-image');
    if (el) {
      el.style.objectFit = 'fill';
      el.style.width = dw + 'px';
      el.style.height = dh + 'px';
      el.style.left = dx + 'px';
      el.style.top = dy + 'px';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      el.style.opacity = '1';
    }

    // If the image doesn't fill the full screen height (portrait zoom-out),
    // move the CTA button to the dark area below the image
    const hint = document.getElementById('hint');
    if (hint) {
      hint.style.top = (dy + dh * 0.5) + 'px';
    }

    const cta = document.getElementById('cta-button');
    if (cta) {
      const imageBottom = dy + dh;
      if (imageBottom < canvas.height - 10) {
        const spaceBelow = canvas.height - imageBottom;
        cta.style.top = (imageBottom + spaceBelow * 0.35) + 'px';
        cta.style.bottom = 'auto';
      } else {
        cta.style.top = '';
        cta.style.bottom = '';
      }
    }
  }

  // Brush radius relative to smaller screen dimension — works on any screen size
  function brushRadius(isTouch) {
    const minDim = Math.min(canvas.width, canvas.height);
    return isTouch ? minDim * 0.10 : minDim * 0.09;
  }

  function erase(x, y, radius) {
    if (!hintHidden) {
      hintHidden = true;
      const hint = document.getElementById('hint');
      if (hint) hint.classList.add('hidden');
    }

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(0.6, 'rgba(0,0,0,0.8)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    if (!thresholdMet) checkThreshold();
  }

  function checkThreshold() {
    const { x, y, w, h } = getLogoRegionBounds(canvas.width, canvas.height);
    const { data } = ctx.getImageData(x, y, w, h);
    const erased = countErasedPixels(data);
    if (isThresholdReached(erased, w * h)) {
      thresholdMet = true;
      onThresholdReached();
    }
  }

  // Desktop: revela ao mover o mouse (sem precisar clicar)
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    erase(e.clientX - rect.left, e.clientY - rect.top, brushRadius(false));
  });

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    erase(touch.clientX - rect.left, touch.clientY - rect.top, brushRadius(true));
  }, { passive: false });

  img.onload = fit;
  img.src = '/tela-inicial.png';
  window.addEventListener('resize', fit);
}
