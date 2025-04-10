import { UserInterface } from "@core/interfaces/user.interface";

export interface MeasurementPresetInterface {
  id?: number;
  name: string;
  notes?: string;
  user?: UserInterface["id"];
  created?: string;
  updated?: string;
  widthArcseconds?: number | null; // Width in arcseconds (for rectangular measurements)
  heightArcseconds?: number | null; // Height in arcseconds (for rectangular measurements)

  // For storing actual coordinate points
  startRa?: number | null; // RA for start point
  startDec?: number | null; // Dec for start point
  endRa?: number | null; // RA for end point
  endDec?: number | null; // Dec for end point

  // Display options
  showRectangle?: boolean; // Whether to show as rectangle
  showCircle?: boolean; // Whether to show as circle
}
