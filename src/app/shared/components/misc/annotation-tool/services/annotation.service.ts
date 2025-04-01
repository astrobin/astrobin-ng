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
    '#FF5252', // Red
    '#448AFF', // Blue
    '#4CAF50', // Green
    '#FFC107', // Amber
    '#9C27B0', // Purple
    '#00BCD4', // Cyan
    '#FF9800', // Orange
    '#607D8B'  // Blue-gray
  ];

  // Store annotations in a BehaviorSubject for reactive updates
  private _annotations = new BehaviorSubject<Annotation[]>([]);

  // Color rotation index
  private _colorIndex = 0;

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
        color: params.color || this.getNextColor(),
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
    this._colorIndex = 0; // Reset color index
  }

  /**
   * Get URL parameter representation of all annotations for sharing
   */
  public getUrlParam(): string {
    const annotations = this._annotations.getValue();
    if (annotations.length === 0) {
      return '';
    }

    // Convert to a compact format for URL
    const compactData = annotations.map(a => this.serializeAnnotation(a));

    // Convert to Base64 for URL-safe encoding
    return btoa(JSON.stringify(compactData));
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

      // Set as current annotations
      this._annotations.next(annotations);
    } catch (e) {
      console.error('Failed to parse annotation URL parameter', e);
      throw new Error('Invalid annotation data format');
    }
  }

  /**
   * Recalculate positions of all annotations after a window resize
   * @param widthRatio Ratio of new width to old width
   * @param heightRatio Ratio of new height to old height
   */
  public recalculatePositionsAfterResize(widthRatio: number, heightRatio: number): void {
    if (widthRatio === 1 && heightRatio === 1) {
      return; // No change
    }

    const annotations = this._annotations.getValue();
    if (annotations.length === 0) {
      return;
    }

    // Create updated annotations with adjusted positions
    const updatedAnnotations = annotations.map(annotation => {
      // Create a deep copy
      const updated = { ...annotation };

      // Update shape points
      updated.shape = {
        ...updated.shape,
        points: updated.shape.points.map(point => ({
          x: point.x, // Keep X as percentage
          y: point.y  // Keep Y as percentage
        }))
      };

      // Update note position if it exists
      if (updated.note) {
        updated.note = {
          ...updated.note,
          position: {
            x: updated.note.position.x, // Keep X as percentage
            y: updated.note.position.y  // Keep Y as percentage
          }
        };
      }

      return updated;
    });

    this._annotations.next(updatedAnnotations);
  }

  /**
   * Get the next color in the rotation
   */
  public getNextColor(): string {
    const color = this.ANNOTATION_COLORS[this._colorIndex];
    this._colorIndex = (this._colorIndex + 1) % this.ANNOTATION_COLORS.length;
    return color;
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
        color: data.s.c || this.getNextColor(),
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
