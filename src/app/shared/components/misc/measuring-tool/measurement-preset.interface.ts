import { UserInterface } from "@core/interfaces/user.interface";

export interface MeasurementPresetInterface {
  id?: number;
  name: string;
  notes?: string;
  user?: UserInterface["id"];
  created?: string;
  updated?: string;
  widthArcseconds?: number | null;    // Width in arcseconds (for rectangular measurements)
  heightArcseconds?: number | null;   // Height in arcseconds (for rectangular measurements)
}