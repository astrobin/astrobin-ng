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
 * Represents a complete annotation with shape and optional title and message
 */
export interface Annotation {
  id: string;
  shape: AnnotationShape;
  title?: string;
  message?: string;
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
  title?: string;
  message?: string;
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
 * Parameters for updating an annotation message
 */
export interface UpdateAnnotationMessageParams {
  title?: string;
  message?: string;
}
