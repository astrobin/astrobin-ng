export enum SolutionStatus {
  MISSING = 0,
  PENDING = 1,
  FAILED = 2,
  SUCCESS = 3,
  ADVANCED_PENDING = 4,
  ADVANCED_FAILED = 5,
  ADVANCED_SUCCESS = 6
}

export interface SolutionInterface {
  id: number;
  status: SolutionStatus;
  submissionId: number;
  objectId: string;
  imageFile: string;
  skyplotZoom1: string;
  objectsInField: string;
  ra: string;
  dec: string;
  pixscale: string;
  orientation: string;
  radius: string;
  annotations: string;
  pixinsightSerialNumber: string;
  pixinsightSvgAnnotationHd: string;
  pixinsightSvgAnnotationRegular: string;
  pixinsightFindingChartSmall: string;
  pixinsightFindingChart: string;
  pixinsightQueueSize?: number;
  pixinsightStage?: string;
  advancedRa: string;
  advancedRaTopLeft: string;
  advancedRaTopRight: string;
  advancedRaBottomLeft: string;
  advancedRaBottomRight: string;
  advancedDec: string;
  advancedDecTopLeft: string;
  advancedDecTopRight: string;
  advancedDecBottomLeft: string;
  advancedDecBottomRight: string;
  advancedPixscale: string;
  advancedOrientation: string;
  advancedFlipped: boolean;
  advancedWcsTransformation: string;
  advancedMatrixRect: string;
  advancedMatrixDelta: string;
  advancedRaMatrix: string;
  advancedDecMatrix: string;
  advancedAnnotations: string;
  advancedAnnotationsRegular: string;
  settings: number;
  contentType: number;
  advancedSettings: number;
}
