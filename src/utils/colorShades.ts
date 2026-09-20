type RGB = { r: number; g: number; b: number };

function hexToRgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

function lerpColor(a: RGB, b: RGB, t: number): RGB {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function rgbToHex({ r, g, b }: RGB): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
  );
}

const WHITE: RGB = { r: 255, g: 255, b: 255 };
const BLACK: RGB = { r: 0, g: 0, b: 0 };

export interface ColorShadesMap {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export class ColorShades {
  private base: RGB;

  constructor(hex: string) {
    this.base = hexToRgb(hex);
  }

  shade(n: number): string {
    if (n <= 500) return rgbToHex(lerpColor(WHITE, this.base, n / 500));
    return rgbToHex(lerpColor(this.base, BLACK, (n - 500) / 500));
  }

  get s50() { return this.shade(50); }
  get s100() { return this.shade(100); }
  get s200() { return this.shade(200); }
  get s300() { return this.shade(300); }
  get s400() { return this.shade(400); }
  get s500() { return this.shade(500); }
  get s600() { return this.shade(600); }
  get s700() { return this.shade(700); }
  get s800() { return this.shade(800); }
  get s900() { return this.shade(900); }
  get s950() { return this.shade(950); }

  toMap(): ColorShadesMap {
    return {
      50: this.s50,
      100: this.s100,
      200: this.s200,
      300: this.s300,
      400: this.s400,
      500: this.s500,
      600: this.s600,
      700: this.s700,
      800: this.s800,
      900: this.s900,
      950: this.s950,
    };
  }
}

export function generateColorShades(hex: string): ColorShadesMap {
  return new ColorShades(hex).toMap();
}
