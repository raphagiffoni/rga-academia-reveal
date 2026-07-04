// Região da logo em proporções do canvas (ajustar após ver as imagens em tela)
// x, y = canto superior esquerdo; w, h = largura e altura — todos entre 0 e 1
export const LOGO_REGION = { x: 0.27, y: 0.12, w: 0.46, h: 0.70 };

// Porcentagem mínima de pixels revelados na região da logo para exibir o CTA
export const CTA_THRESHOLD = 0.5;

// Raio do pincel em pixels
export const BRUSH_RADIUS = { desktop: 70, touch: 90 };

// URL de destino do botão CTA — troque aqui sem tocar no resto do código
export const CTA_URL = 'https://chat.whatsapp.com/EVP11rV4tiC2sT57n0K5eZ?mode=gi_t';

/**
 * Conta quantos pixels têm alpha = 0 (foram apagados pelo canvas).
 * rawPixelData é o array plano de getImageData().data (R,G,B,A por pixel).
 */
export function countErasedPixels(rawPixelData) {
  let count = 0;
  for (let i = 3; i < rawPixelData.length; i += 4) {
    if (rawPixelData[i] === 0) count++;
  }
  return count;
}

/**
 * Retorna true se a proporção de pixels apagados atingiu o threshold.
 */
export function isThresholdReached(erasedCount, totalPixels) {
  return erasedCount / totalPixels >= CTA_THRESHOLD;
}

/**
 * Converte a LOGO_REGION (proporções) em coordenadas de pixel para getImageData.
 */
export function getLogoRegionBounds(canvasWidth, canvasHeight) {
  return {
    x: Math.floor(LOGO_REGION.x * canvasWidth),
    y: Math.floor(LOGO_REGION.y * canvasHeight),
    w: Math.floor(LOGO_REGION.w * canvasWidth),
    h: Math.floor(LOGO_REGION.h * canvasHeight),
  };
}
