const Jimp = require('jimp-compact');
const path = require('path');

const SIZE = 1024;
const out = path.join(__dirname, 'assets', 'icon.png');

async function main() {
  const img = new Jimp(SIZE, SIZE, 0x00000000);

  // ── Background: dark navy rounded rect ──────────────────────────────
  const bgColor = 0x1C1B2Eff; // deep navy
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const r = 160; // corner radius
      const inCorner = (dx, dy) => Math.sqrt(dx * dx + dy * dy) > r;
      const tl = x < r && y < r && inCorner(x - r, y - r);
      const tr = x > SIZE - r && y < r && inCorner(x - (SIZE - r), y - r);
      const bl = x < r && y > SIZE - r && inCorner(x - r, y - (SIZE - r));
      const br = x > SIZE - r && y > SIZE - r && inCorner(x - (SIZE - r), y - (SIZE - r));
      if (!tl && !tr && !bl && !br) {
        // subtle radial gradient: slightly lighter in center
        const cx = x - SIZE / 2, cy = y - SIZE / 2;
        const dist = Math.sqrt(cx * cx + cy * cy) / (SIZE * 0.7);
        const light = Math.floor(dist * 20);
        const r2 = Math.max(0, 0x1C - light);
        const g2 = Math.max(0, 0x1B - light);
        const b2 = Math.max(0, 0x2E + light * 2);
        img.setPixelColor(Jimp.rgbaToInt(r2, g2, b2, 255), x, y);
      }
    }
  }

  // ── Shield shape (purple-blue gradient) ─────────────────────────────
  const shieldCX = SIZE / 2;
  const shieldTY = 200, shieldBY = 820;
  const shieldW = 440;

  for (let y = shieldTY; y < shieldBY; y++) {
    const t = (y - shieldTY) / (shieldBY - shieldTY);
    // Shield width narrows toward bottom
    const halfW = t < 0.75
      ? shieldW / 2
      : (shieldW / 2) * (1 - (t - 0.75) / 0.25);
    // Bottom point
    if (t > 0.92) {
      const tip = (1 - (t - 0.92) / 0.08) * halfW * 0.3;
      for (let x = shieldCX - tip; x <= shieldCX + tip; x++) {
        const xt = (x - (shieldCX - shieldW / 2)) / shieldW;
        const r2 = Math.round(0x7C + (0x5B - 0x7C) * xt);
        const g2 = Math.round(0x6F + (0x8D - 0x6F) * xt);
        const b2 = Math.round(0xF7 + (0xEF - 0xF7) * xt);
        img.setPixelColor(Jimp.rgbaToInt(r2, g2, b2, 220), Math.round(x), y);
      }
      continue;
    }
    for (let x = shieldCX - halfW; x <= shieldCX + halfW; x++) {
      const xt = (x - (shieldCX - shieldW / 2)) / shieldW;
      const r2 = Math.round(0x7C + (0x5B - 0x7C) * xt);
      const g2 = Math.round(0x6F + (0x8D - 0x6F) * xt);
      const b2 = Math.round(0xF7 + (0xEF - 0xF7) * xt);
      img.setPixelColor(Jimp.rgbaToInt(r2, g2, b2, 210), Math.round(x), y);
    }
  }

  // ── Clipboard body (off-white) ───────────────────────────────────────
  const cbX = SIZE / 2 - 140, cbY = 280, cbW = 280, cbH = 360, cbR = 24;
  const cbColor = Jimp.rgbaToInt(0xF2, 0xF1, 0xEC, 255);

  for (let y = cbY; y < cbY + cbH; y++) {
    for (let x = cbX; x < cbX + cbW; x++) {
      const lx = x - cbX, ly = y - cbY;
      const inC = (dx, dy) => Math.sqrt(dx * dx + dy * dy) > cbR;
      const tl = lx < cbR && ly < cbR && inC(lx - cbR, ly - cbR);
      const tr = lx > cbW - cbR && ly < cbR && inC(lx - (cbW - cbR), ly - cbR);
      const bl = lx < cbR && ly > cbH - cbR && inC(lx - cbR, ly - (cbH - cbR));
      const br = lx > cbW - cbR && ly > cbH - cbR && inC(lx - (cbW - cbR), ly - (cbH - cbR));
      if (!tl && !tr && !bl && !br) {
        img.setPixelColor(cbColor, x, y);
      }
    }
  }

  // ── Clipboard clip (dark) ────────────────────────────────────────────
  const clipW = 80, clipH = 28, clipR = 10;
  const clipX = SIZE / 2 - clipW / 2, clipY = cbY - 14;
  for (let y = clipY; y < clipY + clipH; y++) {
    for (let x = clipX; x < clipX + clipW; x++) {
      const lx = x - clipX, ly = y - clipY;
      const inC = (dx, dy) => Math.sqrt(dx * dx + dy * dy) > clipR;
      const tl = lx < clipR && ly < clipR && inC(lx - clipR, ly - clipR);
      const tr = lx > clipW - clipR && ly < clipR && inC(lx - (clipW - clipR), ly - clipR);
      const bl = lx < clipR && ly > clipH - clipR && inC(lx - clipR, ly - (clipH - clipR));
      const br = lx > clipW - clipR && ly > clipH - clipR && inC(lx - (clipW - clipR), ly - (clipH - clipR));
      if (!tl && !tr && !bl && !br) {
        img.setPixelColor(Jimp.rgbaToInt(0x2D, 0x37, 0x48, 255), x, y);
      }
    }
  }

  // ── Lines on clipboard (dark grey) ───────────────────────────────────
  const lineColor = Jimp.rgbaToInt(0xC0, 0xBE, 0xB8, 255);
  const lineX = cbX + 32, lineEndX = cbX + cbW - 32;
  [[340, 1.0], [380, 1.0], [420, 0.6]].forEach(([ly, alpha]) => {
    for (let x = lineX; x < lineEndX; x++) {
      for (let t = 0; t < 6; t++) {
        img.setPixelColor(Jimp.rgbaToInt(0xC0, 0xBE, 0xB8, Math.round(255 * alpha)), x, ly + t);
      }
    }
  });

  // ── Lock icon (amber/gold) at bottom-right of clipboard ──────────────
  const lkCX = cbX + cbW - 62, lkCY = cbY + cbH - 72;
  const lkR = 34;
  // shackle arc
  for (let angle = Math.PI; angle <= 2 * Math.PI; angle += 0.02) {
    const sx = lkCX + Math.cos(angle) * lkR * 0.55;
    const sy = lkCY - 30 + Math.sin(angle) * lkR * 0.55;
    for (let t = -4; t <= 4; t++) {
      for (let s = -4; s <= 4; s++) {
        if (t * t + s * s <= 16) {
          img.setPixelColor(Jimp.rgbaToInt(0xF5, 0xA6, 0x23, 255), Math.round(sx + t), Math.round(sy + s));
        }
      }
    }
  }
  // lock body
  for (let y = lkCY - 10; y < lkCY + lkR; y++) {
    for (let x = lkCX - lkR * 0.7; x < lkCX + lkR * 0.7; x++) {
      img.setPixelColor(Jimp.rgbaToInt(0xF5, 0xA6, 0x23, 255), Math.round(x), Math.round(y));
    }
  }
  // keyhole
  const khR = 9;
  for (let y = lkCY + 4; y < lkCY + lkR - 6; y++) {
    for (let x = lkCX - 4; x <= lkCX + 4; x++) {
      img.setPixelColor(Jimp.rgbaToInt(0x1C, 0x1B, 0x2E, 255), Math.round(x), Math.round(y));
    }
  }
  for (let angle = 0; angle < 2 * Math.PI; angle += 0.02) {
    const kx = lkCX + Math.cos(angle) * khR;
    const ky = lkCY + 4 + Math.sin(angle) * khR;
    for (let t = -3; t <= 3; t++) {
      for (let s = -3; s <= 3; s++) {
        if (t * t + s * s <= 9) {
          img.setPixelColor(Jimp.rgbaToInt(0x1C, 0x1B, 0x2E, 255), Math.round(kx + t), Math.round(ky + s));
        }
      }
    }
  }

  await img.writeAsync(out);
  console.log('Icon saved to', out);
}

main().catch(console.error);
