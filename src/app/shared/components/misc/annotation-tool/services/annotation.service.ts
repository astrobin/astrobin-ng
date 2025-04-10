import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

import { AnnotationShapeType } from "../models/annotation-shape-type.enum";
import {
  Annotation,
  AnnotationPoint,
  CreateAnnotationParams,
  UpdateAnnotationShapeParams,
  UpdateAnnotationMessageParams
} from "../models/annotation.model";

@Injectable({
  providedIn: "root"
})
export class AnnotationService {
  // Available colors for annotations
  private readonly ANNOTATION_COLORS = [
    "#FFFFFF", // White (default)
    "#000000", // Black
    "#FF5252", // Red
    "#448AFF", // Blue
    "#4CAF50", // Green
    "#FFC107", // Amber
    "#9C27B0", // Purple
    "#00BCD4", // Cyan
    "#FF9800" // Orange
  ];

  // Store annotations in a BehaviorSubject for reactive updates
  private _annotations = new BehaviorSubject<Annotation[]>([]);

  // Track annotations that came from the saved revision
  private _savedAnnotationIds: string[] = [];

  // Track annotations that came from URL
  private _urlAnnotationIds: string[] = [];

  // Default to white
  private _defaultColorIndex = 0;

  // Expose annotations as an Observable
  public readonly annotations$: Observable<Annotation[]> = this._annotations.asObservable();

  // Expose saved annotation IDs
  public get savedAnnotationIds(): string[] {
    return this._savedAnnotationIds;
  }

  // Expose URL annotation IDs
  public get urlAnnotationIds(): string[] {
    return this._urlAnnotationIds;
  }

  constructor() {}

  /**
   * Creates a new annotation
   * @param params The parameters for creating the annotation
   * @returns The created annotation
   */
  public createAnnotation(params: CreateAnnotationParams): Annotation {
    // Generate a hash-based ID using the annotation's properties
    const id = this.generateUniqueId({
      shapeType: params.shapeType,
      points: params.points || [],
      color: params.color || this.getDefaultColor(),
      title: params.title || "",
      message: params.message || ""
    });

    const annotation: Annotation = {
      id: id,
      shape: {
        type: params.shapeType,
        points: params.points || [],
        color: params.color || this.getDefaultColor(),
        lineWidth: params.lineWidth || 2
      },
      timestamp: Date.now()
    };

    // Add title and message if provided
    if (params.title) {
      annotation.title = params.title;
    }

    if (params.message) {
      annotation.message = params.message;
    }

    // Add to the list of annotations
    const currentAnnotations = this._annotations.getValue();
    this._annotations.next([...currentAnnotations, annotation]);

    return annotation;
  }

  /**
   * Set title and message of an existing annotation
   * @param id The ID of the annotation
   * @param title The title of the annotation
   * @param message The message content of the annotation
   */
  public setAnnotationTitleAndMessage(id: string, title: string, message: string): void {
    const annotations = this._annotations.getValue();
    const index = annotations.findIndex(a => a.id === id);

    if (index !== -1) {
      const oldAnnotation = annotations[index];
      const annotation = { ...oldAnnotation };

      // Update title and message
      annotation.title = title || "";
      annotation.message = message || "";

      // Generate a new ID based on updated properties
      annotation.id = this.generateUniqueId({
        shapeType: annotation.shape.type,
        points: annotation.shape.points,
        color: annotation.shape.color,
        title: annotation.title,
        message: annotation.message
      });

      // Update saved and URL annotations IDs arrays if needed
      this._updateAnnotationIdInArrays(oldAnnotation.id, annotation.id);

      // Update the annotation
      const updatedAnnotations = [...annotations];
      updatedAnnotations[index] = annotation;
      this._annotations.next(updatedAnnotations);

      console.log("Updated annotation title and message:", annotation);
    } else {
      console.warn("Could not find annotation with ID:", id);
    }
  }

  /**
   * Helper method to handle annotation ID changes
   * @param oldId The old annotation ID
   * @param newId The new annotation ID
   */
  private _updateAnnotationIdInArrays(oldId: string, newId: string): void {
    // IMPORTANT: When an annotation is modified, it should no longer be considered
    // as coming from the saved annotations or from the URL.
    // We remove it from both tracking arrays instead of updating the ID.

    // Remove from saved annotations array if it was there
    const savedIndex = this._savedAnnotationIds.indexOf(oldId);
    if (savedIndex !== -1) {
      this._savedAnnotationIds.splice(savedIndex, 1);
      console.log(`Annotation ${oldId} was removed from saved annotations after modification`);
    }

    // Remove from URL annotations array if it was there
    const urlIndex = this._urlAnnotationIds.indexOf(oldId);
    if (urlIndex !== -1) {
      this._urlAnnotationIds.splice(urlIndex, 1);
      console.log(`Annotation ${oldId} was removed from URL annotations after modification`);
    }

    // The new ID is not added to either array, which means:
    // - It won't show the "saved" icon
    // - It won't show the "shared" icon
    // This is the desired behavior for modified annotations
  }

  /**
   * Updates an annotation's shape
   * @param id The ID of the annotation
   * @param params The parameters to update
   */
  public updateAnnotationShape(id: string, params: UpdateAnnotationShapeParams): void {
    const annotations = this._annotations.getValue();
    const index = annotations.findIndex(a => a.id === id);

    if (index !== -1) {
      const oldAnnotation = annotations[index];
      const annotation = { ...oldAnnotation };
      annotation.shape = {
        ...annotation.shape,
        ...(params.type !== undefined ? { type: params.type } : {}),
        ...(params.points !== undefined ? { points: params.points } : {}),
        ...(params.color !== undefined ? { color: params.color } : {}),
        ...(params.lineWidth !== undefined ? { lineWidth: params.lineWidth } : {})
      };

      // Generate a new ID based on updated properties
      annotation.id = this.generateUniqueId({
        shapeType: annotation.shape.type,
        points: annotation.shape.points,
        color: annotation.shape.color,
        title: annotation.title || "",
        message: annotation.message || ""
      });

      // Update saved and URL annotations IDs arrays if needed
      this._updateAnnotationIdInArrays(oldAnnotation.id, annotation.id);

      // Update the annotation
      const updatedAnnotations = [...annotations];
      updatedAnnotations[index] = annotation;
      this._annotations.next(updatedAnnotations);
    }
  }

  /**
   * Updates an annotation's message details
   * @param id The ID of the annotation
   * @param params The parameters to update
   */
  public updateAnnotationMessage(id: string, params: UpdateAnnotationMessageParams): void {
    const annotations = this._annotations.getValue();
    const index = annotations.findIndex(a => a.id === id);

    if (index !== -1) {
      const oldAnnotation = annotations[index];
      const annotation = { ...oldAnnotation };

      // Update title and message if provided
      if (params.title !== undefined) {
        annotation.title = params.title;
      }

      if (params.message !== undefined) {
        annotation.message = params.message;
      }

      // Generate a new ID based on updated properties
      annotation.id = this.generateUniqueId({
        shapeType: annotation.shape.type,
        points: annotation.shape.points,
        color: annotation.shape.color,
        title: annotation.title || "",
        message: annotation.message || ""
      });

      // Update saved and URL annotations IDs arrays if needed
      this._updateAnnotationIdInArrays(oldAnnotation.id, annotation.id);

      // Update the annotation
      const updatedAnnotations = [...annotations];
      updatedAnnotations[index] = annotation;
      this._annotations.next(updatedAnnotations);
    }
  }

  // Note: toggleNoteExpanded method removed as part of simplification
  // We no longer need note.expanded since we're using a modal for displaying messages

  /**
   * Removes an annotation
   * @param id The ID of the annotation to remove
   */
  public removeAnnotation(id: string): void {
    const annotations = this._annotations.getValue();
    this._annotations.next(annotations.filter(a => a.id !== id));
  }

  /**
   * Moves an annotation's shape by the specified delta
   * @param id The ID of the annotation
   * @param deltaX Percentage delta X to move
   * @param deltaY Percentage delta Y to move
   */
  public moveAnnotationShape(id: string, deltaX: number, deltaY: number): void {
    const annotations = this._annotations.getValue();
    const index = annotations.findIndex(a => a.id === id);

    if (index !== -1) {
      console.log("Moving annotation, current ID:", id);
      console.log("Current saved annotation IDs:", this._savedAnnotationIds);
      console.log("Current URL annotation IDs:", this._urlAnnotationIds);

      const oldAnnotation = annotations[index];
      const annotation = { ...oldAnnotation };

      // Move all shape points
      annotation.shape = {
        ...annotation.shape,
        points: annotation.shape.points.map(point => ({
          x: Math.max(0, Math.min(100, point.x + deltaX)),
          y: Math.max(0, Math.min(100, point.y + deltaY))
        }))
      };

      // Generate a new ID based on updated properties
      annotation.id = this.generateUniqueId({
        shapeType: annotation.shape.type,
        points: annotation.shape.points,
        color: annotation.shape.color,
        title: annotation.title || "",
        message: annotation.message || ""
      });

      console.log("Generated new ID after move:", annotation.id);

      // Update saved and URL annotations IDs arrays if needed
      this._updateAnnotationIdInArrays(oldAnnotation.id, annotation.id);

      console.log("After update, saved annotation IDs:", this._savedAnnotationIds);
      console.log("After update, URL annotation IDs:", this._urlAnnotationIds);

      // Update the annotation
      const updatedAnnotations = [...annotations];
      updatedAnnotations[index] = annotation;
      this._annotations.next(updatedAnnotations);
    }
  }

  // Note: moveAnnotationNote method removed as part of simplification
  // We no longer have separate note position with the simplified model

  /**
   * Clear all annotations
   */
  public clearAllAnnotations(): void {
    this._annotations.next([]);
    this._savedAnnotationIds = [];
    this._urlAnnotationIds = [];
  }

  /**
   * Convert legacy annotation format to the standardized Annotation interface
   */
  private convertToStandardFormat(annotation: any): Annotation | null {
    try {
      console.log("Converting annotation format:", annotation);

      if (!annotation) {
        console.error("Null or undefined annotation");
        return null;
      }

      if (!annotation.id) {
        console.error("Annotation missing ID property:", annotation);
        // Generate an ID since it's missing
        annotation.id = this.generateUniqueId();
        console.log("Generated ID for annotation:", annotation.id);
      }

      // Extract title and message from direct properties
      const title = annotation.title || "";
      const message = annotation.message || "";

      // Handle circle format
      if (annotation.type === "circle") {
        console.log("Converting circle annotation");
        if (annotation.cx === undefined || annotation.cy === undefined || annotation.r === undefined) {
          console.error("Circle annotation missing required properties:", annotation);
        }

        return {
          id: annotation.id,
          timestamp: Date.now(),
          shape: {
            type: AnnotationShapeType.CIRCLE,
            points: [
              { x: annotation.cx || 50, y: annotation.cy || 50 }, // Center point
              { x: (annotation.cx || 50) + (annotation.r || 10), y: annotation.cy || 50 } // Point to determine radius
            ],
            color: annotation.color || this.getDefaultColor(),
            lineWidth: 2
          },
          title: title,
          message: message
        };
      }

      // Handle rectangle format
      if (annotation.type === "rectangle") {
        console.log("Converting rectangle annotation");
        if (
          annotation.x === undefined ||
          annotation.y === undefined ||
          annotation.width === undefined ||
          annotation.height === undefined
        ) {
          console.error("Rectangle annotation missing required properties:", annotation);
        }

        return {
          id: annotation.id,
          timestamp: Date.now(),
          shape: {
            type: AnnotationShapeType.RECTANGLE,
            points: [
              { x: annotation.x || 10, y: annotation.y || 10 }, // Top-left corner
              {
                x: (annotation.x || 10) + (annotation.width || 20),
                y: (annotation.y || 10) + (annotation.height || 20)
              } // Bottom-right corner
            ],
            color: annotation.color || this.getDefaultColor(),
            lineWidth: 2
          },
          title: title,
          message: message
        };
      }

      // Handle arrow format
      if (annotation.type === "arrow") {
        console.log("Converting arrow annotation");
        if (
          annotation.startX === undefined ||
          annotation.startY === undefined ||
          annotation.endX === undefined ||
          annotation.endY === undefined
        ) {
          console.error("Arrow annotation missing required properties:", annotation);
        }

        return {
          id: annotation.id,
          timestamp: Date.now(),
          shape: {
            type: AnnotationShapeType.ARROW,
            points: [
              { x: annotation.startX || 35, y: annotation.startY || 50 }, // Start point
              { x: annotation.endX || 65, y: annotation.endY || 50 } // End point
            ],
            color: annotation.color || this.getDefaultColor(),
            lineWidth: 2
          },
          title: title,
          message: message
        };
      }

      // If it already matches the standard format, return as is
      if (annotation.shape && annotation.shape.type && annotation.shape.points) {
        console.log("Annotation already in standard format");
        // Make a copy and ensure the color is set
        const standardAnnotation = { ...annotation };
        standardAnnotation.shape = {
          ...standardAnnotation.shape,
          color: standardAnnotation.shape.color || this.getDefaultColor()
        };
        return standardAnnotation;
      }

      console.warn("Unknown annotation format:", annotation);

      return null;
    } catch (error) {
      console.error("Error converting annotation format:", error);
      return null;
    }
  }

  /**
   * Get URL parameter representation of all annotations for sharing
   */
  public getUrlParam(): string {
    const annotations = this._annotations.getValue();
    if (!annotations || annotations.length === 0) {
      return "";
    }

    console.log("Original annotations:", annotations);

    // Convert annotations to standard format if needed
    const standardizedAnnotations = annotations
      .map(a => this.convertToStandardFormat(a))
      .filter(a => a !== null) as Annotation[];

    console.log("Standardized annotations:", standardizedAnnotations);

    if (standardizedAnnotations.length === 0) {
      console.error("Failed to convert annotations to standard format");
      return "";
    }

    // Convert to a compact format for URL
    const compactData = standardizedAnnotations.map(a => this.serializeAnnotation(a)).filter(a => a !== null); // Remove any null serialized annotations

    if (compactData.length === 0) {
      console.error("Failed to serialize any annotations");
      return "";
    }

    // Convert to Base64 for URL-safe encoding
    try {
      return btoa(JSON.stringify(compactData));
    } catch (error) {
      console.error("Error encoding annotations for URL", error);
      return "";
    }
  }

  /**
   * Load annotations from URL parameter
   * @param param The URL parameter containing encoded annotations
   */
  public loadFromUrlParam(param: string): void {
    try {
      // Decode Base64
      const jsonData = atob(param);

      // Parse JSON
      const compactData = JSON.parse(jsonData);

      // Convert compact format back to annotations
      const annotations = compactData.map(d => this.deserializeAnnotation(d));

      // Convert annotations to display format
      const displayReady = annotations.map(annotation => this.convertToDisplayFormat(annotation));

      // Store the IDs of annotations loaded from URL
      // Important: URL annotations IDs are tracked separately from saved annotation IDs
      // An annotation can be in both arrays if it was saved and also loaded from URL
      this._urlAnnotationIds = displayReady.map(annotation => annotation.id);
      console.log("URL annotation IDs:", this._urlAnnotationIds);
      console.log("Saved annotation IDs:", this._savedAnnotationIds);

      // Set as current annotations
      this._annotations.next(displayReady);
    } catch (e) {
      console.error("Failed to parse annotation URL parameter", e);
      throw new Error("Invalid annotation data format");
    }
  }

  /**
   * Load annotations from a JSON string
   * @param jsonString The JSON string containing the annotations
   */
  public loadFromJsonString(jsonString: string): void {
    try {
      // Parse JSON string
      console.log("loadFromJsonString called with string:", jsonString);
      const annotationsData = JSON.parse(jsonString);
      console.log("Parsed annotations data:", annotationsData);

      // If it's already in the right format, use it directly
      if (Array.isArray(annotationsData)) {
        console.log("Data is an array with", annotationsData.length, "items");

        // Convert each annotation to display format if needed
        const displayReady = annotationsData
          .map(annotation => {
            // Check if it needs conversion to standard format first
            console.log("Processing annotation:", annotation);
            const standardFormat = this.convertToStandardFormat(annotation);

            if (standardFormat) {
              console.log("Converted to standard format:", standardFormat);
              const displayFormat = this.convertToDisplayFormat(standardFormat);
              console.log("Converted to display format:", displayFormat);
              return displayFormat;
            }
            // If already in display format, use as is
            console.log("Using original format:", annotation);
            return annotation;
          })
          .filter(ann => ann !== null && ann !== undefined);

        console.log("Final displayReady annotations:", displayReady);

        // Store IDs of annotations loaded from JSON (saved annotations)
        this._savedAnnotationIds = displayReady.map(annotation => annotation.id);
        console.log("Saved annotation IDs:", this._savedAnnotationIds);

        // Set as current annotations
        this._annotations.next(displayReady);
      } else {
        console.error("Annotations data is not an array:", annotationsData);
        throw new Error("Annotations data is not an array");
      }
    } catch (e) {
      console.error("Failed to parse annotations JSON string", e);
      throw new Error("Invalid annotations data format");
    }
  }

  /**
   * Convert an annotation from the internal format to the display format
   * with properties like x, y, width, height, cx, cy, r, etc.
   */
  private convertToDisplayFormat(annotation: Annotation): any {
    try {
      const displayAnnotation: any = {
        id: annotation.id,
        timestamp: annotation.timestamp,
        color: annotation.shape.color,
        title: annotation.title || "",
        message: annotation.message || ""
      };

      if (annotation.shape.type === AnnotationShapeType.RECTANGLE) {
        displayAnnotation.type = "rectangle";

        // Get the points that define the rectangle
        const p1 = annotation.shape.points[0] || { x: 0, y: 0 };
        const p2 = annotation.shape.points[1] || { x: 0, y: 0 };

        // Calculate rectangle properties
        const left = Math.min(p1.x, p2.x);
        const top = Math.min(p1.y, p2.y);
        const width = Math.abs(p2.x - p1.x);
        const height = Math.abs(p2.y - p1.y);

        // Assign to the display annotation
        displayAnnotation.x = left;
        displayAnnotation.y = top;
        displayAnnotation.width = width;
        displayAnnotation.height = height;
      } else if (annotation.shape.type === AnnotationShapeType.CIRCLE) {
        displayAnnotation.type = "circle";

        // Get the points that define the circle
        const center = annotation.shape.points[0] || { x: 50, y: 50 };
        const radiusPoint = annotation.shape.points[1] || { x: 60, y: 50 };

        // Calculate circle properties
        const dx = radiusPoint.x - center.x;
        const dy = radiusPoint.y - center.y;
        const radius = Math.sqrt(dx * dx + dy * dy);

        // Assign to the display annotation
        displayAnnotation.cx = center.x;
        displayAnnotation.cy = center.y;
        displayAnnotation.r = radius;
      } else if (annotation.shape.type === AnnotationShapeType.ARROW) {
        displayAnnotation.type = "arrow";

        // Get the points that define the arrow
        const start = annotation.shape.points[0] || { x: 35, y: 50 };
        const end = annotation.shape.points[1] || { x: 65, y: 50 };

        // Assign to the display annotation
        displayAnnotation.startX = start.x;
        displayAnnotation.startY = start.y;
        displayAnnotation.endX = end.x;
        displayAnnotation.endY = end.y;
      }

      console.log("Converted to display format:", displayAnnotation);
      return displayAnnotation;
    } catch (error) {
      console.error("Error converting annotation to display format:", error, annotation);
      return {
        id: annotation.id || this.generateUniqueId(),
        type: "rectangle",
        x: 10,
        y: 10,
        width: 20,
        height: 20,
        color: this.getDefaultColor()
      };
    }
  }

  /**
   * Recalculate positions of all annotations after a window resize
   * @param widthRatio Ratio of new width to old width
   * @param heightRatio Ratio of new height to old height
   */
  public recalculatePositionsAfterResize(widthRatio: number, heightRatio: number): void {
    // We don't need to recalculate positions since we're using percentages
    // Percentages should scale automatically with the image

    // For legacy purposes, just make sure we maintain the same annotations
    const annotations = this._annotations.getValue();
    if (annotations.length === 0) {
      return;
    }

    console.log("Window resize detected, but no position recalculation needed since we use percentages.");

    // Notify of non-changes to trigger UI refresh
    // This is a no-op as we're just ensuring references don't change
    const updatedAnnotations = annotations.map(annotation => ({ ...annotation }));
    this._annotations.next(updatedAnnotations);
  }

  /**
   * Get all available annotation colors
   */
  public getColors(): string[] {
    return [...this.ANNOTATION_COLORS];
  }

  /**
   * Get the default color
   */
  public getDefaultColor(): string {
    return this.ANNOTATION_COLORS[this._defaultColorIndex];
  }

  // Note: getNotePositionForShape and getDefaultNotePosition methods removed as part of simplification
  // We no longer have separate note positions with the simplified model

  /**
   * Generate a unique ID for an annotation based on its properties
   * @param annotation Optional annotation to generate ID from
   * @returns A unique ID string
   */
  private generateUniqueId(properties?: {
    shapeType?: string;
    points?: Array<{ x: number; y: number }>;
    color?: string;
    title?: string;
    message?: string;
  }): string {
    if (!properties) {
      // If no properties provided, use a timestamp-based ID
      return "ann_" + Date.now().toString() + "_" + Math.floor(Math.random() * 10000);
    }

    // Create a string representation of the annotation's key properties
    const shapeType = properties.shapeType || "";
    const points = properties.points ? JSON.stringify(properties.points) : "";
    const color = properties.color || "";
    const title = properties.title || "";
    const message = properties.message || "";

    // Combine all properties into a single string
    const propertyString = `${shapeType}|${points}|${color}|${title}|${message}`;

    // Create a simple hash of the property string
    // This implementation uses a basic hash function that produces a 32-bit integer hash
    let hash = 0;
    for (let i = 0; i < propertyString.length; i++) {
      const char = propertyString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }

    // Return a string ID with a prefix to make it recognizable
    return "ann_" + Math.abs(hash).toString(16);
  }

  /**
   * Serialize an annotation to a compact format for URL storage
   */
  private serializeAnnotation(annotation: Annotation): any {
    // Validate annotation structure to avoid TypeError
    if (
      !annotation ||
      !annotation.shape ||
      !annotation.shape.type ||
      !annotation.shape.points ||
      !Array.isArray(annotation.shape.points)
    ) {
      console.error("Invalid annotation structure:", annotation);
      return null;
    }

    try {
      const compact: any = {
        i: annotation.id,
        t: annotation.timestamp,
        s: {
          t: this.serializeShapeType(annotation.shape.type),
          p: annotation.shape.points.map(p => [this.roundToTwo(p.x), this.roundToTwo(p.y)]),
          c: annotation.shape.color,
          w: annotation.shape.lineWidth
        }
      };

      // Add title and message if they exist
      if (annotation.title) {
        compact.title = annotation.title;
      }

      if (annotation.message) {
        compact.msg = annotation.message;
      }

      return compact;
    } catch (error) {
      console.error("Error serializing annotation:", error, annotation);
      return null;
    }
  }

  /**
   * Deserialize a compact annotation from URL storage
   */
  private deserializeAnnotation(data: any): Annotation {
    const annotation: Annotation = {
      id: data.i || this.generateUniqueId(),
      timestamp: data.t || Date.now(),
      shape: {
        type: this.deserializeShapeType(data.s.t),
        points: (data.s.p || []).map(p => ({ x: p[0], y: p[1] })),
        color: data.s.c || this.getDefaultColor(),
        lineWidth: data.s.w || 2
      }
    };

    // Add title and message if they exist in the data
    if (data.title) {
      annotation.title = data.title;
    }

    if (data.msg) {
      annotation.message = data.msg;
    }

    return annotation;
  }

  /**
   * Serialize shape type to a compact format
   */
  private serializeShapeType(type: AnnotationShapeType): number {
    switch (type) {
      case AnnotationShapeType.ARROW:
        return 0;
      case AnnotationShapeType.RECTANGLE:
        return 1;
      case AnnotationShapeType.CIRCLE:
        return 2;
      case AnnotationShapeType.CUSTOM_PATH:
        return 3;
      default:
        return 0;
    }
  }

  /**
   * Deserialize shape type from a compact format
   */
  private deserializeShapeType(type: number): AnnotationShapeType {
    switch (type) {
      case 0:
        return AnnotationShapeType.ARROW;
      case 1:
        return AnnotationShapeType.RECTANGLE;
      case 2:
        return AnnotationShapeType.CIRCLE;
      case 3:
        return AnnotationShapeType.CUSTOM_PATH;
      default:
        return AnnotationShapeType.ARROW;
    }
  }

  /**
   * Round a number to two decimal places for storage efficiency
   */
  private roundToTwo(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }
}
