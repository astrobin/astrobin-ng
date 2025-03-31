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
    const raMinutes = Math.floor((ra - raHours) * 60);
    const raSeconds = Math.floor(((ra - raHours) * 60 - raMinutes) * 60);

    const decDegrees = Math.floor(Math.abs(dec));
    const decMinutes = Math.floor((Math.abs(dec) - decDegrees) * 60);
    const decSeconds = Math.floor(((Math.abs(dec) - decDegrees) * 60 - decMinutes) * 60);

    const sign = dec >= 0 ? "+" : "-";

    return `${raHours.toString().padStart(2, "0")}h ${raMinutes.toString().padStart(2, "0")}m ${raSeconds.toString().padStart(2, "0")}s, ${sign}${decDegrees.toString().padStart(2, "0")}° ${decMinutes.toString().padStart(2, "0")}' ${decSeconds.toString().padStart(2, "0")}"`;
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
    const labelDistance = 24;

    // Calculate how horizontal the line is
    // 0 = perfectly horizontal, PI/2 = perfectly vertical
    const absAngle = Math.abs(angle);
    const horizontalness = Math.min(
      Math.abs(absAngle), // Angle from positive x-axis
      Math.abs(absAngle - Math.PI) // Angle from negative x-axis
    );

    // Expand what constitutes "nearly horizontal" to include slacker angles
    const isNearlyHorizontal = horizontalness < Math.PI / 8; // Within ~22.5 degrees of horizontal (more forgiving)
    const isNearlyVertical = Math.abs(absAngle - Math.PI / 2) < Math.PI / 12; // Within 15 degrees of vertical

    // Calculate extra distance based on how horizontal the line is
    // As the line gets more horizontal (horizontalness approaches 0), increase the distance
    let extraDistance = 0;

    // Calculate a diagonal factor - maximum at 45 and 135 degrees, minimum at 0 or 90 degrees
    // Math.abs ensures we get a positive factor regardless of the line direction
    // This gives us a value between 0 and 1, with 1 being at 45 or 135 degrees
    const diagonalFactor = Math.abs(Math.sin(2 * angle)) / 1.0; // abs(sin(2x)) peaks at 45 and 135 degrees

    // Add some vertical offset based on diagonal factor
    const verticalBoost = labelDistance * 0.8 * diagonalFactor; // 0.8x gives a more noticeable boost

    if (isNearlyHorizontal) {
      // For nearly horizontal lines, add significant extra distance to avoid overlap
      // The closer to horizontal, the larger the extra distance
      const horizontalFactor = 1 - (horizontalness / (Math.PI / 8)); // 0 to 1 factor, adjusted for wider angle
      extraDistance = labelDistance * 3.5 * horizontalFactor + verticalBoost; // Scale up with vertical boost
    } else {
      // For non-horizontal lines, still add the vertical boost
      extraDistance = verticalBoost;
    }

    const pointToUse = position === "start" ? startPoint : endPoint;
    let posX, posY;

    // Start label - place in opposite direction of the line
    // End label - place in the direction of the line
    const directionFactor = position === "start" ? -1 : 1;

    posX = pointToUse.x + directionFactor * (labelDistance + pointRadius + extraDistance) * Math.cos(angle);
    posY = pointToUse.y + directionFactor * (labelDistance + pointRadius + extraDistance) * Math.sin(angle);

    // For vertical lines, add a slight horizontal offset to avoid direct overlap
    if (isNearlyVertical) {
      const horizontalOffset = 15;
      if (angle > 0) { // Line pointing downward
        posX += (position === "start" ? -1 : 1) * horizontalOffset;
      } else { // Line pointing upward
        posX += (position === "start" ? 1 : -1) * horizontalOffset;
      }
    }

    return { x: posX, y: posY };
  }
}
