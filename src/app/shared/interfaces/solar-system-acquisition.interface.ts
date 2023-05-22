export enum SeeingScale {
  VERY_BAD = 1,
  BAD,
  ACCEPTABLE,
  GOOD,
  EXCELLENT
}

export enum TransparencyScale {
  EXTREMELY_BAD = 1,
  VERY_BAD,
  BAD,
  MEDIOCRE,
  ACCEPTABLE,
  FAIR,
  GOOD,
  VERY_GOOD,
  EXCELLENT,
  SUPERB
}

export interface SolarSystemAcquisitionInterface {
  id: number;
  date: string;
  image: number; // Avoiding circular import.
  frames: number | null;
  fps: number | null;
  exposurePerFrame: number | null;
  focalLength: number | null;
  iso: number | null;
  gain: number | null;
  cmi: number | null;
  cmii: number | null;
  cmiii: number | null;
  seeing: SeeingScale | null;
  transparency: TransparencyScale | null;
  time: string | null;
}
