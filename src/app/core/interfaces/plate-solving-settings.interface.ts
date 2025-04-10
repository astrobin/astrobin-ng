import type { SolutionInterface } from "@core/interfaces/solution.interface";

export interface PlateSolvingSettingsInterface {
  id: number;
  solution: SolutionInterface["id"];
  astrometryNetPubliclyVisible: boolean;
  blind: boolean;
  scaleUnits: string | null;
  scaleMin: string | null;
  scaleMax: string | null;
  centerRa: string | null;
  centerDec: string | null;
  radius: string | null;
  downsampleFactor: string | null;
  useSextractor: boolean;
}
