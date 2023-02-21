import { FilterInterface } from "@features/equipment/types/filter.interface";
import { UserInterface } from "@shared/interfaces/user.interface";

export interface DeepSkyAcquisitionPresetInterface {
  id: number | null;
  name: string | null;
  isSynthetic: boolean | null;
  filter2: FilterInterface | null;
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
  savedOn: string | null;
  user: UserInterface["id"] | null;
}
