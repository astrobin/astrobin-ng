import { FilterInterface as LegacyFilterInterface } from "@shared/interfaces/filter.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";

export enum BortleScale {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FOUR_POINT_FIVE = 4.5,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
  EIGHT = 8,
  NINE = 9
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
