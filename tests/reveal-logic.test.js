import { describe, it, expect } from 'vitest';
import {
  countErasedPixels,
  isThresholdReached,
  getLogoRegionBounds,
  CTA_THRESHOLD,
} from '../src/reveal-logic.js';

describe('countErasedPixels', () => {
  it('retorna 0 quando nenhum pixel foi apagado', () => {
    // Dois pixels, ambos com alpha = 255 (opaco)
    const data = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]);
    expect(countErasedPixels(data)).toBe(0);
  });

  it('conta apenas pixels com alpha = 0', () => {
    // pixel 1: alpha=0 (apagado), pixel 2: alpha=255 (opaco), pixel 3: alpha=0 (apagado)
    const data = new Uint8ClampedArray([
      255, 0, 0, 0,
      0, 255, 0, 255,
      0, 0, 255, 0,
    ]);
    expect(countErasedPixels(data)).toBe(2);
  });

  it('retorna total quando todos os pixels foram apagados', () => {
    const data = new Uint8ClampedArray([255, 0, 0, 0, 0, 255, 0, 0]);
    expect(countErasedPixels(data)).toBe(2);
  });
});

describe('isThresholdReached', () => {
  it('retorna false quando abaixo do threshold', () => {
    expect(isThresholdReached(49, 100)).toBe(false);
  });

  it('retorna true quando igual ao threshold', () => {
    expect(isThresholdReached(50, 100)).toBe(true);
  });

  it('retorna true quando acima do threshold', () => {
    expect(isThresholdReached(75, 100)).toBe(true);
  });
});

describe('getLogoRegionBounds', () => {
  it('converte proporções em pixels a partir das dimensões do canvas', () => {
    const bounds = getLogoRegionBounds(1000, 800);
    expect(bounds.x).toBe(270);
    expect(bounds.y).toBe(96);
    expect(bounds.w).toBe(460);
    expect(bounds.h).toBe(560);
  });

  it('retorna valores inteiros para dimensões não-arredondadas', () => {
    const bounds = getLogoRegionBounds(1366, 768);
    expect(bounds.x).toBe(368);
    expect(bounds.y).toBe(92);
    expect(bounds.w).toBe(628);
    expect(bounds.h).toBe(537);
  });
});
