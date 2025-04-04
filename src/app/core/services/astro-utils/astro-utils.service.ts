import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { CoordinatesFormatterService } from "../coordinates-formatter.service";

export interface SolutionMatrix {
  matrixRect: string;
  matrixDelta: number;
  raMatrix: string;
  decMatrix: string;
}

@Injectable({
  providedIn: "root"
})
export class AstroUtilsService {
  private readonly _isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private readonly coordinatesFormatter: CoordinatesFormatterService
  ) {
    this._isBrowser = isPlatformBrowser(platformId);
  }

  raDegreesToMinutes(ra: number): number {
    return ra * 4;
  }

  formatRa(valueInMinutes: number): string {
    if (valueInMinutes === undefined || valueInMinutes === null) {
      return "";
    }

    const hours = Math.floor(valueInMinutes / 60);
    const minutes = valueInMinutes % 60;
    return `${hours}h ${minutes.toFixed(2).replace(".00", "")}m`;
  }

  formatDec(value: number): string {
    if (value === undefined || value === null) {
      return "";
    }

    const degrees = Math.floor(value);
    const minutes = Math.abs(value - degrees) * 60;
    return `${degrees}° ${minutes.toFixed(2).replace(".00", "")}'`;
  }

  /**
   * Checks if the solution matrix has all required properties and values
   */
  isValidSolutionMatrix(solutionMatrix: SolutionMatrix): boolean {
    return !!(
      solutionMatrix &&
      solutionMatrix.matrixRect !== null &&
      solutionMatrix.matrixRect !== undefined &&
      solutionMatrix.matrixDelta !== null &&
      solutionMatrix.matrixDelta !== undefined &&
      solutionMatrix.raMatrix !== null &&
      solutionMatrix.raMatrix !== undefined &&
      solutionMatrix.decMatrix !== null &&
      solutionMatrix.decMatrix !== undefined
    );
  }

  /**
   * Calculate celestial coordinates at a given screen position
   */
  calculateCoordinatesAtPoint(
    x: number,
    y: number,
    solutionMatrix: SolutionMatrix,
    imageElement: HTMLElement
  ): { ra: number; dec: number } | null {
    try {
      if (!this._isBrowser || !this.isValidSolutionMatrix(solutionMatrix)) {
        return null;
      }

      if (!imageElement) {
        return null;
      }

      // Create a synthetic mouse event with the coordinates
      const syntheticEvent = new MouseEvent("mousemove", {
        clientX: x,
        clientY: y
      });

      // Use the shared service to calculate raw coordinates
      const result = this.coordinatesFormatter.calculateRawCoordinates(
        syntheticEvent,
        imageElement,
        solutionMatrix,
        {
          useClientCoords: true,
          naturalWidth: (imageElement as HTMLImageElement).naturalWidth
        }
      );

      if (!result || !result.coordinates) {
        return null;
      }

      // Convert the raw coordinate data to decimal format
      const raData = result.coordinates.ra;
      const decData = result.coordinates.dec;

      // Convert HMS to decimal hours
      const raDecimal = raData.hours + (raData.minutes / 60) + (raData.seconds / 3600);

      // Convert DMS to decimal degrees
      const decDecimal = decData.sign * (decData.degrees + (decData.minutes / 60) + (decData.seconds / 3600));

      return {
        ra: raDecimal,
        dec: decDecimal
      };
    } catch (error) {
      console.error("Error calculating coordinates:", error);
      return null;
    }
  }

  /**
   * Calculate angular distance between two celestial points
   */
  calculateAngularDistance(ra1: number, dec1: number, ra2: number, dec2: number): number {
    // Convert to radians
    const ra1Rad = ra1 * Math.PI / 12; // RA is in hours (0-24), so divide by 12 to get to range 0-2π
    const dec1Rad = dec1 * Math.PI / 180;
    const ra2Rad = ra2 * Math.PI / 12;
    const dec2Rad = dec2 * Math.PI / 180;

    // Use the haversine formula for great circle distance
    const dra = ra2Rad - ra1Rad;
    const ddec = dec2Rad - dec1Rad;
    const a = Math.sin(ddec / 2) * Math.sin(ddec / 2) +
      Math.cos(dec1Rad) * Math.cos(dec2Rad) *
      Math.sin(dra / 2) * Math.sin(dra / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Convert to degrees
    return c * 180 / Math.PI;
  }

  /**
   * Formats astronomical angles according to standard notation
   * - Less than 60 arcseconds: shows as arcseconds only
   * - Less than 60 arcminutes: shows as arcminutes and arcseconds
   * - Otherwise: shows as degrees, arcminutes, and arcseconds
   * Always rounds to the nearest arcsecond with no decimal places
   */
  formatAstronomicalAngle(arcseconds: number): string {
    // Round to the nearest arcsecond
    const totalArcseconds = Math.round(arcseconds);

    // Calculate components
    const degrees = Math.floor(totalArcseconds / 3600);
    const arcminutes = Math.floor((totalArcseconds % 3600) / 60);
    const remainingArcseconds = totalArcseconds % 60;

    // Format based on size
    if (totalArcseconds < 60) {
      // Less than 1 arcminute: show only arcseconds
      return `${remainingArcseconds}″`;
    } else if (totalArcseconds < 3600) {
      // Less than 1 degree: show arcminutes and arcseconds
      return `${arcminutes}′ ${remainingArcseconds}″`;
    } else {
      // 1 degree or more: show degrees, arcminutes, and arcseconds
      return `${degrees}° ${arcminutes}′ ${remainingArcseconds}″`;
    }
  }

  /**
   * Format angular distance with stable precision
   */
  formatAngularDistance(angularDistance: number): string {
    // Stabilize the input value to reduce flickering
    const stableAngularDistance = this.stabilizeValue(angularDistance);

    // Convert to arcseconds - this is what formatAstronomicalAngle expects
    const arcseconds = stableAngularDistance * 3600;

    // Use the standardized astronomical angle formatter
    return this.formatAstronomicalAngle(arcseconds);
  }

  /**
   * Convert celestial coordinates (RA/Dec) to pixel positions on the image using recursive search
   *
   * @param ra Right ascension in hours (0-24)
   * @param dec Declination in degrees (-90 to +90)
   * @param solutionMatrix The solution matrix for the image
   * @param imageElement The image element to get dimensions from
   * @returns Pixel coordinates {x,y} or null if conversion failed
   */
  calculatePixelPositionFromCoordinates(
    ra: number,
    dec: number,
    solutionMatrix: SolutionMatrix,
    imageElement: HTMLElement
  ): { x: number; y: number } | null {
    try {
      if (!this._isBrowser || !this.isValidSolutionMatrix(solutionMatrix) || !imageElement) {
        return null;
      }

      const imageRect = imageElement.getBoundingClientRect();
      const imageWidth = imageRect.width;
      const imageHeight = imageRect.height;

      // Define the initial search area (the entire image)
      const searchArea = {
        minX: 0,
        minY: 0,
        maxX: imageWidth,
        maxY: imageHeight
      };

      // Define search parameters
      const maxIterations = 10; // Maximum iterations for the search
      const targetPrecision = 1.0; // Target precision in pixels

      // Start recursive search
      const result = this._recursiveQuadrantSearch(
        ra,
        dec,
        solutionMatrix,
        imageElement,
        searchArea,
        maxIterations,
        targetPrecision
      );

      if (!result) {
        return null;
      }

      // Return the found coordinates
      return {
        x: result.x,
        y: result.y
      };
    } catch (error) {
      console.error("Error calculating pixel position from coordinates:", error);
      return null;
    }
  }

  /**
   * Recursive quadrant search to find pixel coordinates for a given RA/Dec
   *
   * This method divides the search area into quadrants and recursively searches
   * the quadrant that is closest to the target coordinates.
   */
  private _recursiveQuadrantSearch(
    targetRa: number,
    targetDec: number,
    solutionMatrix: SolutionMatrix,
    imageElement: HTMLElement,
    searchArea: { minX: number, minY: number, maxX: number, maxY: number },
    maxIterations: number,
    targetPrecision: number,
    currentIteration: number = 0
  ): { x: number, y: number, iterations: number } | null {
    try {
      const imageRect = imageElement.getBoundingClientRect();

      // Check for max iteration limit to prevent infinite recursion
      if (currentIteration >= maxIterations) {
        // Return the center of the current search area as best approximation
        const centerX = (searchArea.minX + searchArea.maxX) / 2;
        const centerY = (searchArea.minY + searchArea.maxY) / 2;
        return { x: imageRect.left + centerX, y: imageRect.top + centerY, iterations: currentIteration };
      }

      // Calculate the current search area width and height
      const areaWidth = searchArea.maxX - searchArea.minX;
      const areaHeight = searchArea.maxY - searchArea.minY;

      // If we've reached the target precision, return the current position
      if (areaWidth <= targetPrecision && areaHeight <= targetPrecision) {
        const finalX = (searchArea.minX + searchArea.maxX) / 2;
        const finalY = (searchArea.minY + searchArea.maxY) / 2;
        return { x: imageRect.left + finalX, y: imageRect.top + finalY, iterations: currentIteration };
      }

      // Calculate midpoints of the search area
      const midX = (searchArea.minX + searchArea.maxX) / 2;
      const midY = (searchArea.minY + searchArea.maxY) / 2;

      // Define the four quadrants
      const quadrants = [
        { // Top-left
          minX: searchArea.minX,
          minY: searchArea.minY,
          maxX: midX,
          maxY: midY
        },
        { // Top-right
          minX: midX,
          minY: searchArea.minY,
          maxX: searchArea.maxX,
          maxY: midY
        },
        { // Bottom-left
          minX: searchArea.minX,
          minY: midY,
          maxX: midX,
          maxY: searchArea.maxY
        },
        { // Bottom-right
          minX: midX,
          minY: midY,
          maxX: searchArea.maxX,
          maxY: searchArea.maxY
        }
      ];

      // Calculate celestial coordinates at the center of each quadrant
      const quadrantCoordinates = quadrants.map(quadrant => {
        const centerX = imageRect.left + ((quadrant.minX + quadrant.maxX) / 2);
        const centerY = imageRect.top + ((quadrant.minY + quadrant.maxY) / 2);
        const coordinates = this.calculateCoordinatesAtPoint(centerX, centerY, solutionMatrix, imageElement);
        return {
          quadrant,
          coordinates,
          centerX,
          centerY
        };
      });

      // Find the quadrant with the closest coordinates to our target
      let closestQuadrant = null;
      let minDistance = Number.MAX_VALUE;

      for (const quadrantData of quadrantCoordinates) {
        if (quadrantData.coordinates) {
          // Calculate angular distance between current coordinates and target
          const distance = this.calculateAngularDistance(
            quadrantData.coordinates.ra,
            quadrantData.coordinates.dec,
            targetRa,
            targetDec
          );

          if (distance < minDistance) {
            minDistance = distance;
            closestQuadrant = quadrantData.quadrant;
          }
        }
      }

      // If we didn't find any valid quadrants, use current center as best approximation
      if (!closestQuadrant) {
        return {
          x: imageRect.left + (searchArea.minX + searchArea.maxX) / 2,
          y: imageRect.top + (searchArea.minY + searchArea.maxY) / 2,
          iterations: currentIteration
        };
      }

      // Recursively search the closest quadrant
      return this._recursiveQuadrantSearch(
        targetRa,
        targetDec,
        solutionMatrix,
        imageElement,
        closestQuadrant,
        maxIterations,
        targetPrecision,
        currentIteration + 1
      );
    } catch (error) {
      console.error("Error in recursive quadrant search:", error);
      return null;
    }
  }

  /**
   * Get the pixel scale (arcseconds per pixel) from a solution object
   * @param solution The solution object containing plate solving information
   * @returns The pixel scale in arcseconds per pixel or null if not available
   */
  getPixelScale(solution: any): number | null {
    if (!solution) {
      return null;
    }

    // First try to get the pre-calculated values
    if (solution.advancedPixscale) {
      return parseFloat(solution.advancedPixscale);
    }

    if (solution.pixscale) {
      return parseFloat(solution.pixscale);
    }

    return null;
  }

  /**
   * Helper to stabilize floating-point values for consistent display
   */
  private stabilizeValue(value: number, decimals: number = 4): number {
    return parseFloat(value.toFixed(decimals));
  }
}
