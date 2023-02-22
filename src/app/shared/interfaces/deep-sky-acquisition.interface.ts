import { FilterInterface as LegacyFilterInterface } from "@shared/interfaces/filter.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";

export enum BortleScale {
  ONE = 1,
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
  NINE
}

export interface DeepSkyAcquisitionInterface {
  id: number;
  date: string;
  image: number; // Avoiding circular import.
  isSynthetic: boolean | null;
  filter: LegacyFilterInterface["pk"] | null;
  filter2: FilterInterface["id"] | null;
  binning: number | null;
  number: number | null;
  duration: number | null;
  iso: number | null;
  gain: number | null;
  fNumber: number | null;
  sensorCooling: number | null;
  darks: number | null;
  flats: number | null;
  flatDarks: number | null;
  bias: number | null;
  bortle: BortleScale | null;
  meanSqm: number | null;
  meanFwhm: number | null;
  temperature: number | null;
  advanced?: boolean;
  savedOn: string | null;
}
