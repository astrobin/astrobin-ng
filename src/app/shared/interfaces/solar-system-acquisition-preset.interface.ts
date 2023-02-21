import { UserInterface } from "@shared/interfaces/user.interface";

export interface SolarSystemAcquisitionPresetInterface {
  id: number;
  name: string;
  frames: number | null;
  fps: number | null;
  exposurePerFrame: number | null;
  focalLength: number | null;
  user: UserInterface["id"];
}
