import { Pipe, PipeTransform } from "@angular/core";
import { MeasurementPoint } from "./measuring-tool.component";

@Pipe({
  name: "calculateDistance",
  pure: true
})
export class CalculateDistancePipe implements PipeTransform {
  transform(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }
}

@Pipe({
  name: "formatCoordinatesCompact",
  pure: true
})
export class FormatCoordinatesCompactPipe implements PipeTransform {
  transform(ra: number | null, dec: number | null): string {
    // If either coordinate is null, return empty string
    if (ra === null || dec === null) {
      return "";
    }

    // Convert ra/dec to formatted strings
    const raHours = Math.floor(ra);
    const raMinutesFull = (ra - raHours) * 60;
    const raMinutes = Math.floor(raMinutesFull);
    const raSecondsFull = (raMinutesFull - raMinutes) * 60;
    // Round to nearest second for consistent display with verbose formatter
    const raSeconds = Math.round(raSecondsFull);

    // Handle carryover when seconds round up to 60
    let finalRaHours = raHours;
    let finalRaMinutes = raMinutes;
    let finalRaSeconds = raSeconds;

    if (finalRaSeconds >= 60) {
      finalRaSeconds = 0;
      finalRaMinutes += 1;
      
      if (finalRaMinutes >= 60) {
        finalRaMinutes = 0;
        finalRaHours += 1;
        
        if (finalRaHours >= 24) {
          finalRaHours = 0;
        }
      }
    }

    // Do the same for declination
    const decDegrees = Math.abs(dec);
    const decSign = dec >= 0 ? "+" : "-";
    const decDegreesInt = Math.floor(decDegrees);
    const decMinutesFull = (decDegrees - decDegreesInt) * 60;
    const decMinutesInt = Math.floor(decMinutesFull);
    const decSecondsFull = (decMinutesFull - decMinutesInt) * 60;
    // Round to nearest second for consistent display
    const decSeconds = Math.round(decSecondsFull);

    // Handle carryover when seconds round up to 60
    let finalDecDegrees = decDegreesInt;
    let finalDecMinutes = decMinutesInt;
    let finalDecSeconds = decSeconds;

    if (finalDecSeconds >= 60) {
      finalDecSeconds = 0;
      finalDecMinutes += 1;
      
      if (finalDecMinutes >= 60) {
        finalDecMinutes = 0;
        finalDecDegrees += 1;
      }
    }

    return `${finalRaHours.toString().padStart(2, "0")}h ${finalRaMinutes.toString().padStart(2, "0")}m ${finalRaSeconds.toString().padStart(2, "0")}s, ${decSign}${finalDecDegrees.toString().padStart(2, "0")}° ${finalDecMinutes.toString().padStart(2, "0")}' ${finalDecSeconds.toString().padStart(2, "0")}"`;
  }
}

@Pipe({
  name: "getCelestialDistance",
  pure: true
})
export class GetCelestialDistancePipe implements PipeTransform {
  transform(points: {
      startX: number;
      startY: number;
      endX: number;
      endY: number;
      startRa: number | null;
      startDec: number | null;
      endRa: number | null;
      endDec: number | null;
      distance: string;
    }, orientation: "horizontal" | "vertical",
    advancedSolutionMatrix: any | null,
    calculateCoordinatesAtPointFn: (x: number, y: number) => { ra: number, dec: number } | null,
    calculateAngularDistanceFn: (ra1: number, dec1: number, ra2: number, dec2: number) => number,
    formatAstronomicalAngleFn: (arcseconds: number) => string): string {

    // If no valid advanced solution, return empty (template will show px)
    if (!advancedSolutionMatrix ||
      !advancedSolutionMatrix.matrixRect ||
      !advancedSolutionMatrix.matrixDelta ||
      !advancedSolutionMatrix.raMatrix ||
      !advancedSolutionMatrix.decMatrix) {
      return "";
    }

    let startCoords, endCoords;

    if (orientation === "horizontal") {
      // For horizontal measurement
      const minX = Math.min(points.startX, points.endX);
      const maxX = Math.max(points.startX, points.endX);
      const midY = (points.startY + points.endY) / 2;

      // Get coordinates at endpoints
      startCoords = calculateCoordinatesAtPointFn(minX, midY);
      endCoords = calculateCoordinatesAtPointFn(maxX, midY);
    } else {
      // For vertical measurement
      const minY = Math.min(points.startY, points.endY);
      const maxY = Math.max(points.startY, points.endY);
      const midX = (points.startX + points.endX) / 2;

      // Get coordinates at endpoints
      startCoords = calculateCoordinatesAtPointFn(midX, minY);
      endCoords = calculateCoordinatesAtPointFn(midX, maxY);
    }

    // If we have valid coordinates, calculate angular distance
    if (startCoords && endCoords) {
      const angularDistance = calculateAngularDistanceFn(
        startCoords.ra,
        startCoords.dec,
        endCoords.ra,
        endCoords.dec
      );

      // Convert to arcseconds
      const arcseconds = angularDistance * 3600;

      // Format using standardized astronomical notation
      return formatAstronomicalAngleFn(arcseconds);
    }

    // If we couldn't calculate celestial coordinates, return empty string
    return "";
  }
}

@Pipe({
  name: "mathMin",
  pure: true
})
export class MathMinPipe implements PipeTransform {
  transform(a: number, b: number): number {
    return Math.min(a, b);
  }
}

@Pipe({
  name: "mathMax",
  pure: true
})
export class MathMaxPipe implements PipeTransform {
  transform(a: number, b: number): number {
    return Math.max(a, b);
  }
}

@Pipe({
  name: "mathAbs",
  pure: true
})
export class MathAbsPipe implements PipeTransform {
  transform(value: number): number {
    return Math.abs(value);
  }
}

@Pipe({
  name: "getMidpoint",
  pure: true
})
export class GetMidpointPipe implements PipeTransform {
  transform(a: number, b: number): number {
    return (a + b) / 2;
  }
}

interface LabelPosition {
  x: number;
  y: number;
}

interface LabelBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  priority: number;
  type: "point" | "dimension";
}

@Pipe({
  name: "calculateLabelPosition",
  pure: true
})
export class CalculateLabelPositionPipe implements PipeTransform {
  transform(
    startPoint: MeasurementPoint | null,
    endPoint: MeasurementPoint | null,
    position: "start" | "end"
  ): LabelPosition {
    if (!startPoint || !endPoint) {
      return { x: 0, y: 0 };
    }

    // Calculate the angle of the line
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);

    // Set offset parameters
    const pointRadius = 6;
    const baseLabelDistance = 24;
    const labelDistance = position === "end" ? baseLabelDistance * 1.5 : baseLabelDistance;

    // Calculate how horizontal the line is
    const absAngle = Math.abs(angle);
    const horizontalness = Math.min(
      Math.abs(absAngle),
      Math.abs(absAngle - Math.PI)
    );

    // Determine if line is nearly horizontal or vertical
    const isNearlyHorizontal = horizontalness < Math.PI / 8;
    const isNearlyVertical = Math.abs(absAngle - Math.PI / 2) < Math.PI / 12;

    // Calculate diagonal factor
    const diagonalFactor = Math.abs(Math.sin(2 * angle)) / 1.0;
    const verticalBoost = labelDistance * 0.8 * diagonalFactor;

    let extraDistance = 0;
    if (isNearlyHorizontal) {
      const horizontalFactor = 1 - (horizontalness / (Math.PI / 8));
      extraDistance = labelDistance * 3.5 * horizontalFactor + verticalBoost;
    } else {
      extraDistance = verticalBoost;
    }

    // Calculate initial position
    const pointToUse = position === "start" ? startPoint : endPoint;
    const directionFactor = position === "start" ? -1 : 1;

    let posX = pointToUse.x + directionFactor * (labelDistance + pointRadius + extraDistance) * Math.cos(angle);
    let posY = pointToUse.y + directionFactor * (labelDistance + pointRadius + extraDistance) * Math.sin(angle);

    // For vertical lines, add horizontal offset
    if (isNearlyVertical) {
      const horizontalOffset = 15;
      if (angle > 0) { // Line pointing downward
        posX += (position === "start" ? -1 : 1) * horizontalOffset;
      } else { // Line pointing upward
        posX += (position === "start" ? 1 : -1) * horizontalOffset;
      }
    }

    // Define label dimensions for collision detection
    const coordLabelWidth = 150;  // Width of RA/Dec label
    const coordLabelHeight = 20;  // Height of RA/Dec label
    const dimLabelWidth = 60;     // Width of dimension label
    const dimLabelHeight = 20;    // Height of dimension label

    // Create bounding boxes for collision detection
    const currentLabel: LabelBoundingBox = {
      x: posX - coordLabelWidth / 2,
      y: posY - coordLabelHeight / 2,
      width: coordLabelWidth,
      height: coordLabelHeight,
      priority: 2,  // Point coordinates have medium priority
      type: "point"
    };

    // Create dimension label positions
    const labels: LabelBoundingBox[] = [];

    // Width dimension label (horizontal)
    const widthLabelX = (Math.min(startPoint.x, endPoint.x) +
      Math.abs(endPoint.x - startPoint.x) / 2) - dimLabelWidth / 2;
    const widthLabelY = Math.max(startPoint.y, endPoint.y) + 20;

    labels.push({
      x: widthLabelX,
      y: widthLabelY,
      width: dimLabelWidth,
      height: dimLabelHeight,
      priority: 1,  // Dimension labels have higher priority
      type: "dimension"
    });

    // Height dimension label (vertical)
    const heightLabelX = Math.max(startPoint.x, endPoint.x) + 20;
    const heightLabelY = (Math.min(startPoint.y, endPoint.y) +
      Math.abs(endPoint.y - startPoint.y) / 2) - dimLabelHeight / 2;

    labels.push({
      x: heightLabelX,
      y: heightLabelY,
      width: dimLabelWidth,
      height: dimLabelHeight,
      priority: 1,
      type: "dimension"
    });

    // Check for collisions with dimension labels
    for (const label of labels) {
      if (this.doLabelsOverlap(currentLabel, label)) {
        const newPos = this.resolveCollision(currentLabel, label);
        // Update our position
        posX = newPos.x + coordLabelWidth / 2;
        posY = newPos.y + coordLabelHeight / 2;
        // Update the current label for subsequent collision checks
        currentLabel.x = newPos.x;
        currentLabel.y = newPos.y;
      }
    }

    return { x: posX, y: posY };
  }

  // Helper method to detect collisions between labels
  private doLabelsOverlap(label1: LabelBoundingBox, label2: LabelBoundingBox): boolean {
    return (
      label1.x < label2.x + label2.width &&
      label1.x + label1.width > label2.x &&
      label1.y < label2.y + label2.height &&
      label1.y + label1.height > label2.y
    );
  }

  // Helper method to resolve collisions by moving labels
  private resolveCollision(label1: LabelBoundingBox, label2: LabelBoundingBox): { x: number, y: number } {
    // Determine which label to move (higher priority number gets moved)
    const labelToMove = label1.priority > label2.priority ? label1 : label2;
    const fixedLabel = label1.priority > label2.priority ? label2 : label1;

    // Calculate overlap amounts
    const overlapX = Math.min(
      labelToMove.x + labelToMove.width - fixedLabel.x,
      fixedLabel.x + fixedLabel.width - labelToMove.x
    );

    const overlapY = Math.min(
      labelToMove.y + labelToMove.height - fixedLabel.y,
      fixedLabel.y + fixedLabel.height - labelToMove.y
    );

    // Determine which direction requires less movement
    let newX = labelToMove.x;
    let newY = labelToMove.y;

    // For point labels, prefer to move in the same direction as original offset
    if (labelToMove.type === "point") {
      // Check relative position
      const isRightOfFixed = labelToMove.x > fixedLabel.x + fixedLabel.width / 2;
      const isBelowFixed = labelToMove.y > fixedLabel.y + fixedLabel.height / 2;

      // Move horizontally or vertically based on smaller overlap
      if (overlapX < overlapY) {
        newX = isRightOfFixed ?
          fixedLabel.x + fixedLabel.width + 5 :
          fixedLabel.x - labelToMove.width - 5;
      } else {
        newY = isBelowFixed ?
          fixedLabel.y + fixedLabel.height + 5 :
          fixedLabel.y - labelToMove.height - 5;
      }
    }
    // For dimension labels, prefer vertical movement
    else if (labelToMove.type === "dimension") {
      newY = labelToMove.y > fixedLabel.y ?
        fixedLabel.y + fixedLabel.height + 5 :
        fixedLabel.y - labelToMove.height - 5;
    }

    return { x: newX, y: newY };
  }
}

@Pipe({
  name: "isOutsideImageBoundaries",
  pure: true
})
export class IsOutsideImageBoundariesPipe implements PipeTransform {
  transform(
    measurement: { startX: number; startY: number; endX: number; endY: number; } | 
              { x: number; y: number; } | 
              { isCurrentMeasurement: boolean; },
    imageElement: HTMLElement | null,
    startPoint?: { x: number; y: number; } | null,
    endPoint?: { x: number; y: number; } | null
  ): boolean {
    // If no image element, we can't check boundaries
    if (!imageElement) {
      return false;
    }

    const imageRect = imageElement.getBoundingClientRect();

    // Case 1: Checking a measurement object with startX, startY, endX, endY properties
    if ('startX' in measurement && 'endX' in measurement) {
      return (
        measurement.startX < imageRect.left ||
        measurement.startX > imageRect.right ||
        measurement.startY < imageRect.top ||
        measurement.startY > imageRect.bottom ||
        measurement.endX < imageRect.left ||
        measurement.endX > imageRect.right ||
        measurement.endY < imageRect.top ||
        measurement.endY > imageRect.bottom
      );
    }
    
    // Case 2: Checking a single point with x, y properties
    if ('x' in measurement && 'y' in measurement) {
      return (
        measurement.x < imageRect.left ||
        measurement.x > imageRect.right ||
        measurement.y < imageRect.top ||
        measurement.y > imageRect.bottom
      );
    }
    
    // Case 3: Current measurement check (using startPoint and endPoint)
    if ('isCurrentMeasurement' in measurement && measurement.isCurrentMeasurement && startPoint && endPoint) {
      return (
        startPoint.x < imageRect.left ||
        startPoint.x > imageRect.right ||
        startPoint.y < imageRect.top ||
        startPoint.y > imageRect.bottom ||
        endPoint.x < imageRect.left ||
        endPoint.x > imageRect.right ||
        endPoint.y < imageRect.top ||
        endPoint.y > imageRect.bottom
      );
    }
    
    // Default case, no valid parameters provided
    return false;
  }
}
