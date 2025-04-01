import { AnnotationShapeType } from "./annotation-shape-type.enum";

/**
 * Represents a point in percentage coordinates (0-100) relative to the image
 */
export interface AnnotationPoint {
  x: number;
  y: number;
}

/**
 * Represents a shape in an annotation
 */
export interface AnnotationShape {
  type: AnnotationShapeType;
  points: AnnotationPoint[];
  color: string;
  lineWidth?: number;
}

/**
 * Represents a text note in an annotation
 */
export interface AnnotationNote {
  text: string;
  position: AnnotationPoint;
  expanded: boolean;
}

/**
 * Represents a complete annotation with shape and optional note
 */
export interface Annotation {
  id: string;
  shape: AnnotationShape;
  note?: AnnotationNote;
  timestamp: number;
}

/**
 * Parameters for creating a new annotation
 */
export interface CreateAnnotationParams {
  shapeType: AnnotationShapeType;
  points?: AnnotationPoint[];
  color: string;
  lineWidth?: number;
  note?: {
    text: string;
    position?: AnnotationPoint;
  };
}

/**
 * Parameters for updating an annotation shape
 */
export interface UpdateAnnotationShapeParams {
  type?: AnnotationShapeType;
  points?: AnnotationPoint[];
  color?: string;
  lineWidth?: number;
}

/**
 * Parameters for updating an annotation note
 */
export interface UpdateAnnotationNoteParams {
  text?: string;
  position?: AnnotationPoint;
  expanded?: boolean;
}
