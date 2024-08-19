import { SolutionInterface, SolutionStatus } from "@shared/interfaces/solution.interface";

export class SolutionGenerator {
  static solution(source: Partial<SolutionInterface> = {}): SolutionInterface {
    return {
      id: source.id || 1,
      status: SolutionStatus.ADVANCED_SUCCESS,
      submissionId: 1,
      objectId: "1",
      imageFile: null,
      skyplotZoom1: null,
      objectsInField: "",
      ra: null,
      dec: null,
      pixscale: null,
      orientation: null,
      radius: null,
      annotations: "",
      pixinsightSerialNumber: null,
      pixinsightSvgAnnotationHd: null,
      pixinsightSvgAnnotationRegular: null,
      pixinsightFindingChart: null,
      pixinsightFindingChartSmall: null,
      advancedRa: null,
      advancedRaTopLeft: null,
      advancedRaTopRight: null,
      advancedRaBottomLeft: null,
      advancedRaBottomRight: null,
      advancedDec: null,
      advancedDecTopLeft: null,
      advancedDecTopRight: null,
      advancedDecBottomLeft: null,
      advancedDecBottomRight: null,
      advancedPixscale: null,
      advancedOrientation: null,
      advancedFlipped: null,
      advancedWcsTransformation: null,
      advancedMatrixRect: null,
      advancedMatrixDelta: null,
      advancedRaMatrix: "",
      advancedDecMatrix: "",
      advancedAnnotations: "",
      advancedAnnotationsRegular: "",
      settings: 1,
      contentType: 1,
      advancedSettings: 1
    };
  }
}
