// Label chips render a label's data-driven color as 10px text over a
// 13%-alpha tint of that same color (the chip's `${color}22` background).
// Light hues fail WCAG AA against their own tint — the seeded Bug label
// #eb5757 measures 2.97:1 on white — so the chip text color is derived from
// the label color and the surface that tint composites onto.

import {
  contrastRatio,
  parseColor,
  relativeLuminance,
} from "@/lib/avatar-contrast";

const AA_MIN_CONTRAST = 4.5;
// 0x22/0xff ≈ 13.3% — the chip background is `${label.color}22`.
const CHIP_TINT_ALPHA = 0x22 / 0xff;

type Rgb = [number, number, number];

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

// Effective backdrop the chip text renders against: the chip's translucent
// tint alpha-composited over the nearest opaque surface.
function tintOver(label: Rgb, surface: Rgb): Rgb {
  return [
    label[0] * CHIP_TINT_ALPHA + surface[0] * (1 - CHIP_TINT_ALPHA),
    label[1] * CHIP_TINT_ALPHA + surface[1] * (1 - CHIP_TINT_ALPHA),
    label[2] * CHIP_TINT_ALPHA + surface[2] * (1 - CHIP_TINT_ALPHA),
  ];
}

// The opaque surface under the chip, mirroring `--popover` in index.css (the
// modal panel and popover surface where chips render). Dark theme uses the
// lighter of its two surfaces — `--background` is darker and only raises
// contrast for light text — so one value covers every chip placement.
export function chipSurfaceForTheme(theme: "light" | "dark"): string {
  return theme === "dark" ? "#161719" : "#ffffff";
}

/**
 * Text color for a label chip: the label's own color when it already clears
 * AA against its tint, otherwise the label color mixed just far enough toward
 * black (light surfaces) or white (dark surfaces) to reach 4.5:1, preserving
 * the label's hue. Unparseable colors keep the previous raw rendering.
 */
export function readableLabelChipTextColor(
  labelColor: string,
  surface: string,
): string {
  const rgb = parseColor(labelColor);
  const surfaceRgb = parseColor(surface);
  if (!rgb || !surfaceRgb) return labelColor;

  const backdrop = tintOver(rgb, surfaceRgb);
  const meetsAA = (color: Rgb): boolean =>
    contrastRatio(relativeLuminance(color), relativeLuminance(backdrop)) >=
    AA_MIN_CONTRAST;
  if (meetsAA(rgb)) return labelColor;

  const extreme: Rgb =
    relativeLuminance(surfaceRgb) >= 0.5 ? [0, 0, 0] : [255, 255, 255];

  // Smallest mix that clears AA, rounded to whole channels — nudged toward
  // the extreme if rounding cost the margin.
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (meetsAA(mix(rgb, extreme, mid))) hi = mid;
    else lo = mid;
  }
  let t = hi;
  for (;;) {
    const mixed = mix(rgb, extreme, t);
    const rounded: Rgb = [
      Math.round(mixed[0]),
      Math.round(mixed[1]),
      Math.round(mixed[2]),
    ];
    if (meetsAA(rounded)) return `rgb(${rounded.join(", ")})`;
    if (t >= 1) break;
    t = Math.min(1, t + 0.002);
  }
  return `rgb(${extreme.join(", ")})`;
}
