declare class BicubicInterpolationBase {
  constructor(M: number[], cols: number, rows: number);
  protected M: number[];
  protected cols: number;
  protected rows: number;
  protected p0: number[];
  protected p1: number[];
  protected p2: number[];
  protected p3: number[];
  protected i1: number;
  protected j1: number;
  protected initXY(x: number, y: number): void;
  protected getRow(fp: number, j0: number, j2: number, j3: number): number[];
}

declare class BicubicSplineInterpolation extends BicubicInterpolationBase {
  constructor(M: number[], cols: number, rows: number, clamp?: number);
  protected clamp: number;
  interpolate(x: number, y: number): number;
  protected coefficients(dx: number): number[];
  protected spline(p: number[], C: number[]): number;
}

declare class EphemUtils {
  static readonly deltaAT_data: [number, number, number?, number?][];

  static julianDate(t: Date | string): {
    jdi: number;
    jdf: number;
  };

  static centuriesSinceJ2000(jd: { jdi: number; jdf: number }): number;

  static radiansToDegrees(rad: number): number;

  static degreesToRadians(deg: number): number;

  static longitudeDegreesConstrained(deg: number): number;

  static sphericalToRectangular(s: {
    lon: number;
    lat: number;
  }): {
    x: number;
    y: number;
    z: number;
  };

  static rectangularToSpherical(r: {
    x: number;
    y: number;
    z: number;
  }): {
    lon: number;
    lat: number;
  };

  static rectangularToSphericalDegreesConstrained(r: {
    x: number;
    y: number;
    z: number;
  }): {
    lon: number;
    lat: number;
  };

  static rectangularEquatorialToEcliptic(
    r: { x: number; y: number; z: number },
    se: number,
    ce: number
  ): {
    x: number;
    y: number;
    z: number;
  };

  static rectangularEquatorialToGalactic(r: {
    x: number;
    y: number;
    z: number;
  }): {
    x: number;
    y: number;
    z: number;
  };

  static deltaAT(jd: { jdi: number; jdf: number }): number;

  static obliquity(t: Date | string): number;
}

declare class CoordinateInterpolation {
  constructor(
    Ma: number[],
    Md: number[],
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    delta: number,
    date?: Date | string,
    scale?: number
  );

  protected Ma: number[];
  protected Md: number[];
  protected x0: number;
  protected x1: number;
  protected y0: number;
  protected y1: number;
  protected delta: number;
  protected date?: Date | string;
  protected rows: number;
  protected cols: number;
  protected Ia: BicubicSplineInterpolation;
  protected Id: BicubicSplineInterpolation;
  protected precision: number;
  protected se?: number;
  protected ce?: number;

  interpolate(
    x: number,
    y: number,
    withGalactic?: boolean,
    withEcliptic?: boolean
  ): {
    alpha: number;
    delta: number;
    l?: number;
    b?: number;
    lambda?: number;
    beta?: number;
  };

  interpolateAsText(
    x: number,
    y: number,
    units?: boolean,
    withGalactic?: boolean,
    withEcliptic?: boolean
  ): {
    alpha: string;
    delta: string;
    l?: string;
    b?: string;
    lambda?: string;
    beta?: string;
  };

  protected angleString(
    angle: number,
    range: number,
    sign: boolean,
    precision: number,
    units: boolean
  ): string;
}
