/**
 * Gera public/logo-farolfix.png com fundo transparente.
 *
 * Fundo preto (padrão): flood fill a partir das bordas — remove só o preto ligado ao
 * retângulo externo; pretos no desenho (ex.: capô) permanecem se não forem conectados
 * ao contorno por pixels escuros contínuos.
 *
 * Execute: node scripts/logo-remove-white-bg.mjs [entrada.png]
 * Padrão: scripts/ref/logo-farolfix-source.png
 *
 * Fundo branco (JPEG): node scripts/logo-remove-white-bg.mjs --white [entrada.jpg]
 */
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const args = process.argv.slice(2);
const whiteMode = args.includes("--white");
const fileArgs = args.filter((a) => a !== "--white");
const input =
  fileArgs[0] ??
  join(
    root,
    "scripts",
    "ref",
    whiteMode ? "logo-farolfix-source.jpg" : "logo-farolfix-source.png"
  );
const output = join(root, "public", "logo-farolfix.png");

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width: w, height: h, channels } = info;
if (channels !== 4) {
  throw new Error(`Esperado RGBA, canais=${channels}`);
}

const out = Buffer.from(data);

function alphaFromWhite(r, g, b) {
  const dist = Math.hypot(255 - r, 255 - g, 255 - b);
  const softMin = 22;
  const softMax = 58;
  if (dist <= softMin) return 0;
  if (dist >= softMax) return 255;
  return Math.round(((dist - softMin) / (softMax - softMin)) * 255);
}

/** Preto “do fundo”: vizinho na expansão; anti-alias do retângulo costuma ficar ≤ ~18 */
function nearEdgeBlack(r, g, b, tol) {
  return Math.max(r, g, b) <= tol;
}

function removeBlackByFloodFill(tol = 16) {
  const mask = new Uint8Array(w * h);
  const stack = [];
  const idx = (x, y) => (y * w + x) * 4;
  const key = (x, y) => y * w + x;

  const pushIfBlack = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const k = key(x, y);
    if (mask[k]) return;
    const o = idx(x, y);
    if (!nearEdgeBlack(out[o], out[o + 1], out[o + 2], tol)) return;
    mask[k] = 1;
    stack.push(k);
  };

  for (let x = 0; x < w; x++) {
    pushIfBlack(x, 0);
    pushIfBlack(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    pushIfBlack(0, y);
    pushIfBlack(w - 1, y);
  }

  while (stack.length) {
    const k = stack.pop();
    const x = k % w;
    const y = (k / w) | 0;
    if (x > 0) pushIfBlack(x - 1, y);
    if (x < w - 1) pushIfBlack(x + 1, y);
    if (y > 0) pushIfBlack(x, y - 1);
    if (y < h - 1) pushIfBlack(x, y + 1);
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const k = key(x, y);
      const o = idx(x, y);
      if (mask[k]) {
        out[o + 3] = 0;
      } else {
        out[o + 3] = 255;
      }
    }
  }

  /** Borda suave 1px entre máscara e desenho */
  const alphaCopy = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) {
    alphaCopy[i] = mask[i] ? 0 : 255;
  }
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const k = key(x, y);
      if (alphaCopy[k] !== 0) continue;
      let neigh = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          if (alphaCopy[key(x + dx, y + dy)] === 255) neigh++;
        }
      }
      if (neigh > 0) {
        const o = idx(x, y);
        out[o + 3] = Math.min(255, 40 + neigh * 28);
      }
    }
  }
}

if (whiteMode) {
  for (let i = 0; i < out.length; i += 4) {
    const a = alphaFromWhite(out[i], out[i + 1], out[i + 2]);
    out[i + 3] = Math.min(out[i + 3], a);
  }
} else {
  removeBlackByFloodFill(16);
}

await sharp(out, {
  raw: { width: w, height: h, channels: 4 }
})
  .png({ compressionLevel: 9, effort: 10 })
  .toFile(output);

console.log("OK:", output, `${w}x${h}`, whiteMode ? "(fundo branco)" : "(fundo preto, flood fill)");
