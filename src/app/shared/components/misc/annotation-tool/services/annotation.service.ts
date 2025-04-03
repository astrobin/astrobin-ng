import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Annotation, AnnotationPoint, CreateAnnotationParams, UpdateAnnotationNoteParams, UpdateAnnotationShapeParams } from '../models/annotation.model';
import { AnnotationShapeType } from '../models/annotation-shape-type.enum';

@Injectable({
  providedIn: 'root'
})
export class AnnotationService {
  // Available colors for annotations
  private readonly ANNOTATION_COLORS = [
    '#FFFFFF', // White (default)
    '#000000', // Black
    '#FF5252', // Red
    '#448AFF', // Blue
    '#4CAF50', // Green
    '#FFC107', // Amber
    '#9C27B0', // Purple
    '#00BCD4', // Cyan
    '#FF9800'  // Orange
  ];

  // Store annotations in a BehaviorSubject for reactive updates
  private _annotations = new BehaviorSubject<Annotation[]>([]);

  // Default to white
  private _defaultColorIndex = 0;

  // Expose annotations as an Observable
  public readonly annotations$: Observable<Annotation[]> = this._annotations.asObservable();

  constructor() {}

  /**
   * Creates a new annotation
   * @param params The parameters for creating the annotation
   * @returns The created annotation
   */
  public createAnnotation(params: CreateAnnotationParams): Annotation {
    const annotation: Annotation = {
      id: this.generateUniqueId(),
      shape: {
        type: params.shapeType,
        points: params.points || [],
        color: params.color || this.getDefaultColor(),
        lineWidth: params.lineWidth || 2
      },
      timestamp: Date.now()
    };

    // Add note if provided
    if (params.note) {
      annotation.note = {
        text: params.note.text,
        position: params.note.position || this.getDefaultNotePosition(),
        expanded: true
      };
    }

    // Add to the list of annotations
    const currentAnnotations = this._annotations.getValue();
    this._annotations.next([...currentAnnotations, annotation]);

    return annotation;
  }

  /**
   * Adds a note to an existing annotation
   * @param id The ID of the annotation
   * @param text The text content of the note
   */
  public addNoteToAnnotation(id: string, text: string): void {
    const annotations = this._annotations.getValue();
    const index = annotations.findIndex(a => a.id === id);

    if (index !== -1) {
      const annotation = { ...annotations[index] };

      // If text is empty, use a placeholder
      const noteText = text.trim() !== '' ? text : 'Annotation ' + (index + 1);

      // Create note or update existing note
      annotation.note = {
        text: noteText,
        position: annotation.note?.position || this.getNotePositionForShape(annotation),
        expanded: true
      };

      // Update the annotation
      const updatedAnnotations = [...annotations];
      updatedAnnotations[index] = annotation;
      this._annotations.next(updatedAnnotations);

      console.log('Added note to annotation:', annotation);
    } else {
      console.warn('Could not find annotation with ID:', id);
    }
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
      const annotation = { ...annotations[index] };
      annotation.shape = {
        ...annotation.shape,
        ...(params.type !== undefined ? { type: params.type } : {}),
        ...(params.points !== undefined ? { points: params.points } : {}),
        ...(params.color !== undefined ? { color: params.color } : {}),
        ...(params.lineWidth !== undefined ? { lineWidth: params.lineWidth } : {})
      };

      // Update the annotation
      const updatedAnnotations = [...annotations];
      updatedAnnotations[index] = annotation;
      this._annotations.next(updatedAnnotations);
    }
  }

  /**
   * Updates an annotation's note
   * @param id The ID of the annotation
   * @param params The parameters to update
   */
  public updateAnnotationNote(id: string, params: UpdateAnnotationNoteParams): void {
    const annotations = this._annotations.getValue();
    const index = annotations.findIndex(a => a.id === id);

    if (index !== -1 && annotations[index].note) {
      const annotation = { ...annotations[index] };
      annotation.note = {
        ...annotation.note,
        ...(params.text !== undefined ? { text: params.text } : {}),
        ...(params.position !== undefined ? { position: params.position } : {}),
        ...(params.expanded !== undefined ? { expanded: params.expanded } : {})
      };

      // Update the annotation
      const updatedAnnotations = [...annotations];
      updatedAnnotations[index] = annotation;
      this._annotations.next(updatedAnnotations);
    }
  }

  /**
   * Toggle a note's expanded state
   * @param id The ID of the annotation
   */
  public toggleNoteExpanded(id: string): void {
    const annotations = this._annotations.getValue();
    const index = annotations.findIndex(a => a.id === id);

    if (index !== -1 && annotations[index].note) {
      const annotation = { ...annotations[index] };
      annotation.note = {
        ...annotation.note,
        expanded: !annotation.note.expanded
      };

      // Update the annotation
      const updatedAnnotations = [...annotations];
      updatedAnnotations[index] = annotation;
      this._annotations.next(updatedAnnotations);
    }
  }

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
      const annotation = { ...annotations[index] };

      // Move all shape points
      annotation.shape = {
        ...annotation.shape,
        points: annotation.shape.points.map(point => ({
          x: Math.max(0, Math.min(100, point.x + deltaX)),
          y: Math.max(0, Math.min(100, point.y + deltaY))
        }))
      };

      // If note exists, move it too to maintain the relationship
      if (annotation.note) {
        annotation.note = {
          ...annotation.note,
          position: {
            x: Math.max(0, Math.min(100, annotation.note.position.x + deltaX)),
            y: Math.max(0, Math.min(100, annotation.note.position.y + deltaY))
          }
        };
      }

      // Update the annotation
      const updatedAnnotations = [...annotations];
      updatedAnnotations[index] = annotation;
      this._annotations.next(updatedAnnotations);
    }
  }

  /**
   * Moves just an annotation's note by the specified delta
   * @param id The ID of the annotation
   * @param deltaX Percentage delta X to move
   * @param deltaY Percentage delta Y to move
   */
  public moveAnnotationNote(id: string, deltaX: number, deltaY: number): void {
    const annotations = this._annotations.getValue();
    const index = annotations.findIndex(a => a.id === id);

    if (index !== -1 && annotations[index].note) {
      const annotation = { ...annotations[index] };

      annotation.note = {
        ...annotation.note,
        position: {
          x: Math.max(0, Math.min(100, annotation.note.position.x + deltaX)),
          y: Math.max(0, Math.min(100, annotation.note.position.y + deltaY))
        }
      };

      // Update the annotation
      const updatedAnnotations = [...annotations];
      updatedAnnotations[index] = annotation;
      this._annotations.next(updatedAnnotations);
    }
  }

  /**
   * Clear all annotations
   */
  public clearAllAnnotations(): void {
    this._annotations.next([]);
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

      // Handle circle format
      if (annotation.type === 'circle') {
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
              { x: annotation.cx || 50, y: annotation.cy || 50 },  // Center point
              { x: (annotation.cx || 50) + (annotation.r || 10), y: annotation.cy || 50 }  // Point to determine radius
            ],
            color: annotation.color || this.getDefaultColor(),
            lineWidth: 2
          },
          note: annotation.note ? annotation.note : annotation.title ? {
            text: annotation.title,
            position: { x: (annotation.cx || 50) + (annotation.r || 10) + 5, y: (annotation.cy || 50) - 5 },
            expanded: true
          } : undefined
        };
      }

      // Handle rectangle format
      if (annotation.type === 'rectangle') {
        console.log("Converting rectangle annotation");
        if (annotation.x === undefined || annotation.y === undefined ||
            annotation.width === undefined || annotation.height === undefined) {
          console.error("Rectangle annotation missing required properties:", annotation);
        }

        return {
          id: annotation.id,
          timestamp: Date.now(),
          shape: {
            type: AnnotationShapeType.RECTANGLE,
            points: [
              { x: annotation.x || 10, y: annotation.y || 10 },  // Top-left corner
              { x: (annotation.x || 10) + (annotation.width || 20), y: (annotation.y || 10) + (annotation.height || 20) }  // Bottom-right corner
            ],
            color: annotation.color || this.getDefaultColor(),
            lineWidth: 2
          },
          note: annotation.note ? annotation.note : annotation.title ? {
            text: annotation.title,
            position: { x: (annotation.x || 10) + (annotation.width || 20) + 5, y: (annotation.y || 10) - 5 },
            expanded: true
          } : undefined
        };
      }

      // Handle arrow format
      if (annotation.type === 'arrow') {
        console.log("Converting arrow annotation");
        if (annotation.startX === undefined || annotation.startY === undefined ||
            annotation.endX === undefined || annotation.endY === undefined) {
          console.error("Arrow annotation missing required properties:", annotation);
        }

        return {
          id: annotation.id,
          timestamp: Date.now(),
          shape: {
            type: AnnotationShapeType.ARROW,
            points: [
              { x: annotation.startX || 35, y: annotation.startY || 50 },  // Start point
              { x: annotation.endX || 65, y: annotation.endY || 50 }  // End point
            ],
            color: annotation.color || this.getDefaultColor(),
            lineWidth: 2
          },
          note: annotation.note ? annotation.note : annotation.title ? {
            text: annotation.title,
            position: { x: (annotation.endX || 65) + 5, y: (annotation.endY || 50) - 5 },
            expanded: true
          } : undefined
        };
      }

      // If it already matches the standard format, return as is
      if (annotation.shape && annotation.shape.type && annotation.shape.points) {
        console.log("Annotation already in standard format");
        // Make a copy and ensure the color is set
        const standardAnnotation = {...annotation};
        standardAnnotation.shape = {...standardAnnotation.shape, color: standardAnnotation.shape.color || this.getDefaultColor()};
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
      return '';
    }

    console.log("Original annotations:", annotations);

    // Convert annotations to standard format if needed
    const standardizedAnnotations = annotations
      .map(a => this.convertToStandardFormat(a))
      .filter(a => a !== null) as Annotation[];

    console.log("Standardized annotations:", standardizedAnnotations);

    if (standardizedAnnotations.length === 0) {
      console.error('Failed to convert annotations to standard format');
      return '';
    }

    // Convert to a compact format for URL
    const compactData = standardizedAnnotations
      .map(a => this.serializeAnnotation(a))
      .filter(a => a !== null); // Remove any null serialized annotations

    if (compactData.length === 0) {
      console.error('Failed to serialize any annotations');
      return '';
    }

    // Convert to Base64 for URL-safe encoding
    try {
      return btoa(JSON.stringify(compactData));
    } catch (error) {
      console.error('Error encoding annotations for URL', error);
      return '';
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

      // Set as current annotations
      this._annotations.next(displayReady);
    } catch (e) {
      console.error('Failed to parse annotation URL parameter', e);
      throw new Error('Invalid annotation data format');
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
        const displayReady = annotationsData.map(annotation => {
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
        }).filter(ann => ann !== null && ann !== undefined);

        console.log("Final displayReady annotations:", displayReady);

        // Set as current annotations
        this._annotations.next(displayReady);
      } else {
        console.error("Annotations data is not an array:", annotationsData);
        throw new Error('Annotations data is not an array');
      }
    } catch (e) {
      console.error('Failed to parse annotations JSON string', e);
      throw new Error('Invalid annotations data format');
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
        note: annotation.note,
        title: annotation.note?.text || '' // Use note text as title if available
      };

      if (annotation.shape.type === AnnotationShapeType.RECTANGLE) {
        displayAnnotation.type = 'rectangle';

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
      }
      else if (annotation.shape.type === AnnotationShapeType.CIRCLE) {
        displayAnnotation.type = 'circle';

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
      }
      else if (annotation.shape.type === AnnotationShapeType.ARROW) {
        displayAnnotation.type = 'arrow';

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
      console.error('Error converting annotation to display format:', error, annotation);
      return {
        id: annotation.id || this.generateUniqueId(),
        type: 'rectangle',
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

  /**
   * Create a default position for a note based on the shape
   */
  private getNotePositionForShape(annotation: Annotation): AnnotationPoint {
    if (!annotation.shape.points.length) {
      return { x: 50, y: 50 }; // Default center
    }

    switch (annotation.shape.type) {
      case AnnotationShapeType.ARROW: {
        // Place the note near the end of the arrow (target)
        const endPoint = annotation.shape.points[1] || annotation.shape.points[0];
        return {
          x: Math.min(Math.max(endPoint.x + 5, 0), 95),
          y: Math.min(Math.max(endPoint.y - 5, 0), 95)
        };
      }

      case AnnotationShapeType.RECTANGLE: {
        // Place the note at the top-right corner of the rectangle
        const startPoint = annotation.shape.points[0];
        const endPoint = annotation.shape.points[1] || startPoint;

        const topRightX = Math.max(startPoint.x, endPoint.x);
        const topRightY = Math.min(startPoint.y, endPoint.y);

        return {
          x: Math.min(topRightX + 5, 95),
          y: Math.max(topRightY - 5, 5)
        };
      }

      case AnnotationShapeType.CIRCLE: {
        // Place the note at the top-right of the circle
        const centerPoint = annotation.shape.points[0];
        const radiusPoint = annotation.shape.points[1] || centerPoint;

        // Calculate the radius
        const dx = radiusPoint.x - centerPoint.x;
        const dy = radiusPoint.y - centerPoint.y;
        const radius = Math.sqrt(dx * dx + dy * dy);

        return {
          x: Math.min(centerPoint.x + radius + 5, 95),
          y: Math.max(centerPoint.y - radius - 5, 5)
        };
      }

      default:
        return { x: 50, y: 50 }; // Default center
    }
  }

  /**
   * Get a default position for a new note
   */
  private getDefaultNotePosition(): AnnotationPoint {
    return { x: 50, y: 30 };
  }

  /**
   * Generate a unique ID for an annotation
   */
  private generateUniqueId(): string {
    return 'ann_' + Date.now().toString() + '_' + Math.floor(Math.random() * 10000);
  }

  /**
   * Serialize an annotation to a compact format for URL storage
   */
  private serializeAnnotation(annotation: Annotation): any {
    // Validate annotation structure to avoid TypeError
    if (!annotation || !annotation.shape || !annotation.shape.type || !annotation.shape.points || !Array.isArray(annotation.shape.points)) {
      console.error('Invalid annotation structure:', annotation);
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

      if (annotation.note) {
        compact.n = {
          t: annotation.note.text,
          p: [this.roundToTwo(annotation.note.position.x), this.roundToTwo(annotation.note.position.y)],
          e: annotation.note.expanded ? 1 : 0
        };
      }

      return compact;
    } catch (error) {
      console.error('Error serializing annotation:', error, annotation);
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

    if (data.n) {
      annotation.note = {
        text: data.n.t || '',
        position: {
          x: data.n.p[0],
          y: data.n.p[1]
        },
        expanded: data.n.e === 1
      };
    }

    return annotation;
  }

  /**
   * Serialize shape type to a compact format
   */
  private serializeShapeType(type: AnnotationShapeType): number {
    switch (type) {
      case AnnotationShapeType.ARROW: return 0;
      case AnnotationShapeType.RECTANGLE: return 1;
      case AnnotationShapeType.CIRCLE: return 2;
      case AnnotationShapeType.CUSTOM_PATH: return 3;
      default: return 0;
    }
  }

  /**
   * Deserialize shape type from a compact format
   */
  private deserializeShapeType(type: number): AnnotationShapeType {
    switch (type) {
      case 0: return AnnotationShapeType.ARROW;
      case 1: return AnnotationShapeType.RECTANGLE;
      case 2: return AnnotationShapeType.CIRCLE;
      case 3: return AnnotationShapeType.CUSTOM_PATH;
      default: return AnnotationShapeType.ARROW;
    }
  }

  /**
   * Round a number to two decimal places for storage efficiency
   */
  private roundToTwo(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100;
  }
}
