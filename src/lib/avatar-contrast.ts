// Avatar initials are real text rendered over a data-driven fill color, so
// their text color must be derived from the fill to stay readable.

const WHITE = "rgb(255, 255, 255)";
const BLACK = "rgb(0, 0, 0)";

// WCAG 2.x minimum contrast ratio for normal-size text. Avatar initials are
// 8-10px, far below the large-text allowance, so the 4.5:1 bar always applies.
const AA_MIN_CONTRAST = 4.5;

type Rgb = [number, number, number];

export function parseColor(color: string): Rgb | null {
  const hex = color.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(hex) || /^[0-9a-fA-F]{3}$/.test(hex)) {
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((ch) => ch + ch)
            .join("")
        : hex;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16),
    ];
  }
  const rgb = color.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return null;
}

// WCAG 2.x relative luminance of an sRGB triplet.
export function relativeLuminance([r, g, b]: Rgb): number {
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: number, b: number): number {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * White or black, whichever meets the 4.5:1 WCAG AA contrast minimum against
 * `background` (white wins when both pass, keeping dark fills unchanged).
 * Falls back to white for unparseable colors, matching the previous rendering.
 */
export function readableTextColor(background: string): string {
  const rgb = parseColor(background);
  if (!rgb) return WHITE;
  const backgroundLuminance = relativeLuminance(rgb);
  return contrastRatio(1, backgroundLuminance) >= AA_MIN_CONTRAST
    ? WHITE
    : BLACK;
}
