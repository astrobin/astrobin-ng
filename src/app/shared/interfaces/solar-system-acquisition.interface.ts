export interface SolarSystemAcquisitionInterface {
  id: number;
  date: string;
  image: number; // Avoiding circular import.
  frames: number | null;
  fps: number | null;
  exposurePerFrame: number | null;
  focalLength: number | null;
  cmi: number | null;
  cmii: number | null;
  cmiii: number | null;
  seeing: number | null;
  transparency: number | null;
  time: string | null;
}
