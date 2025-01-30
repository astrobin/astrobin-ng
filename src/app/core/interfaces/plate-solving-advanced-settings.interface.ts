import { SolutionInterface } from "@core/interfaces/solution.interface";

export interface PlateSolvingAdvancedSettingsInterface {
  id: number;
  solution: SolutionInterface["id"];
  sampleRawFrameFile: { file: File, url: string }[] | string | null;
  scaledFontSize: "S" | "M" | "L";
  showGrid: boolean;
  showEcliptic: boolean;
  showGalacticEquator: boolean;
  showConstellationBorders: boolean;
  showConstellationLines: boolean;
  showNamedStars: boolean;
  showHd: boolean
  hdMaxMagnitude: string | null;
  showMessier: boolean;
  showNgcIc: boolean;
  showVdb: boolean;
  showSharpless: boolean;
  showBarnard: boolean;
  showLbn: boolean;
  showLdn: boolean;
  showPgc: boolean;
  showPlanets: boolean;
  showAsteroids: boolean;
  showGcvs: boolean;
  gcvsMaxMagnitude: string | null;
  showTycho2: boolean;
  tycho2MaxMagnitude: string | null;
  showCgpn: boolean;
  showQuasars: boolean;
}
