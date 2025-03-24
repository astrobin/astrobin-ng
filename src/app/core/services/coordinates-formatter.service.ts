import { Injectable } from "@angular/core";

interface FormattedCoordinates {
  raHtml: string;
  decHtml: string;
  galacticRaHtml: string;
  galacticDecHtml: string;
}

@Injectable({
  providedIn: "root"
})
export class CoordinatesFormatterService {
  constructor() {}

  /**
   * Calculate mouse coordinates from a mouse event and interpolation matrix
   * @param event Mouse event containing clientX and clientY or offsetX and offsetY
   * @param imageElement The image DOM element to get dimensions from
   * @param interpolationMatrix The matrix information for coordinate calculation
   * @param options Additional options for calculation
   * @returns Formatted coordinate strings and raw x/y positions
   */
  calculateMouseCoordinates(
    event: MouseEvent,
    imageElement: HTMLElement,
    interpolationMatrix: {
      raMatrix: string;
      decMatrix: string;
      matrixRect: string;
      matrixDelta: number;
    },
    options?: {
      useClientCoords?: boolean; // Whether to use client coordinates instead of offset
      naturalWidth?: number;    // Optional natural width if not available from image element
      imageScale?: number;      // Optional scale to apply (for zoom)
    }
  ): {
    coordinates: FormattedCoordinates;
    x: number;
    y: number;
  } {
    if (!interpolationMatrix || !interpolationMatrix.raMatrix || !imageElement) {
      return null;
    }

    // Determine x/y position relative to the image
    let relativeX, relativeY;

    if (options?.useClientCoords) {
      // Get image position in the document
      const rect = imageElement.getBoundingClientRect();
      
      // Check if mouse is within bounds
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
        return null;
      }
      
      // Use client coordinates relative to element bounds
      relativeX = event.clientX - rect.left;
      relativeY = event.clientY - rect.top;
    } else {
      // Use offset coordinates directly
      relativeX = event.offsetX;
      relativeY = event.offsetY;
    }

    // Get image dimensions
    const imageRenderedWidth = options?.useClientCoords 
      ? imageElement.getBoundingClientRect().width 
      : imageElement.clientWidth;
      
    const imageNaturalWidth = options?.naturalWidth || 
      ((imageElement as HTMLImageElement).naturalWidth) || 1824;
    
    // HD_WIDTH is a fixed reference width that the plate-solving matrix is based on
    const HD_WIDTH = 1824;
    
    // Calculate x/y in HD space for coordinate interpolation
    let scaledX, scaledY;
    
    if (options?.useClientCoords) {
      // For fullscreen view: scaled coordinates based on rendered/HD ratio
      scaledX = relativeX / imageRenderedWidth * HD_WIDTH;
      scaledY = relativeY / imageRenderedWidth * HD_WIDTH;
    } else {
      // For regular view: calculate scale and apply to offset
      const scale = imageRenderedWidth / Math.min(imageNaturalWidth, HD_WIDTH);
      scaledX = relativeX / scale;
      scaledY = relativeY / scale;
    }
    
    // Parse matrix data
    const raMatrix = interpolationMatrix.raMatrix.split(",").map(Number);
    const decMatrix = interpolationMatrix.decMatrix.split(",").map(Number);
    const rect = interpolationMatrix.matrixRect.split(",").map(Number);
    const delta = interpolationMatrix.matrixDelta;

    // Set appropriate scale for the interpolation
    const interpolationScale = options?.useClientCoords 
      ? undefined   // Not needed for fullscreen, handled by scaledX/Y
      : imageRenderedWidth / Math.min(imageNaturalWidth, HD_WIDTH);
    
    // @ts-ignore - CoordinateInterpolation is defined globally in assets/js/CoordinateInterpolation.js
    const interpolation = new CoordinateInterpolation(
      raMatrix,
      decMatrix,
      rect[0],
      rect[1],
      rect[2],
      rect[3],
      delta,
      undefined,
      interpolationScale
    );

    const interpolationText = interpolation.interpolateAsText(
      scaledX,
      scaledY,
      false,
      true,
      true
    );

    // Format the coordinates
    const coordinates = this.formatFromInterpolationObject(interpolationText);

    return {
      coordinates,
      x: event.offsetX,
      y: event.offsetY
    };
  }

  /**
   * Format RA/Dec coordinates in HTML format
   * @param raHours Hours component of right ascension
   * @param raMinutes Minutes component of right ascension
   * @param raSeconds Seconds component of right ascension
   * @param decDegrees Degrees component of declination
   * @param decMinutes Minutes component of declination
   * @param decSeconds Seconds component of declination
   * @param decSign Sign of declination (positive or negative)
   */
  formatEquatorialCoordinates(
    raHours: number | string,
    raMinutes: number | string,
    raSeconds: number | string,
    decDegrees: number | string,
    decMinutes: number | string,
    decSeconds: number | string,
    decSign: string = ""
  ): { raHtml: string, decHtml: string } {
    // Ensure proper padding
    const paddedRaHours = raHours.toString().padStart(2, '0');
    const paddedRaMinutes = raMinutes.toString().padStart(2, '0');
    const paddedRaSeconds = raSeconds.toString().padStart(2, '0');

    const paddedDecDegrees = decDegrees.toString().padStart(2, '0');
    const paddedDecMinutes = decMinutes.toString().padStart(2, '0');
    const paddedDecSeconds = decSeconds.toString().padStart(2, '0');

    const raHtml = `
      <span class="symbol">α</span>:
      <span class="value">${paddedRaHours}</span><span class="unit">h</span>
      <span class="value">${paddedRaMinutes}</span><span class="unit">m</span>
      <span class="value">${paddedRaSeconds}</span><span class="unit">s</span>
    `;

    const decHtml = `
      <span class="symbol">δ</span>:
      <span class="value">${decSign}${paddedDecDegrees}</span><span class="unit">°</span>
      <span class="value">${paddedDecMinutes}</span><span class="unit">'</span>
      <span class="value">${paddedDecSeconds}</span><span class="unit">"</span>
    `;

    return { raHtml, decHtml };
  }

  /**
   * Format galactic coordinates in HTML format
   * @param lDegrees Degrees component of galactic longitude
   * @param lMinutes Minutes component of galactic longitude
   * @param lSeconds Seconds component of galactic longitude
   * @param bDegrees Degrees component of galactic latitude
   * @param bMinutes Minutes component of galactic latitude
   * @param bSeconds Seconds component of galactic latitude
   * @param bSign Sign of galactic latitude (positive or negative)
   */
  formatGalacticCoordinates(
    lDegrees: number | string,
    lMinutes: number | string,
    lSeconds: number | string,
    bDegrees: number | string,
    bMinutes: number | string,
    bSeconds: number | string,
    bSign: string = ""
  ): { galacticRaHtml: string, galacticDecHtml: string } {
    // Ensure proper padding
    const paddedLDegrees = lDegrees.toString().padStart(3, '0');
    const paddedLMinutes = lMinutes.toString().padStart(2, '0');
    const paddedLSeconds = lSeconds.toString().padStart(2, '0');

    const paddedBDegrees = bDegrees.toString().padStart(2, '0');
    const paddedBMinutes = bMinutes.toString().padStart(2, '0');
    const paddedBSeconds = bSeconds.toString().padStart(2, '0');

    const galacticRaHtml = `
      <span class="symbol">l</span>:
      <span class="value">${paddedLDegrees}</span><span class="unit">°</span>
      <span class="value">${paddedLMinutes}</span><span class="unit">'</span>
      <span class="value">${paddedLSeconds}</span><span class="unit">"</span>
    `;

    const galacticDecHtml = `
      <span class="symbol">b</span>:
      <span class="value">${bSign}${paddedBDegrees}</span><span class="unit">°</span>
      <span class="value">${paddedBMinutes}</span><span class="unit">'</span>
      <span class="value">${paddedBSeconds}</span><span class="unit">"</span>
    `;

    return { galacticRaHtml, galacticDecHtml };
  }

  /**
   * Format all coordinates from interpolation text
   * @param raValues Array of RA values [hours, minutes, seconds]
   * @param decValues Array of Dec values [degrees, minutes, seconds]
   * @param includeGalactic Whether to include galactic coordinates
   * @param decIsPositive Whether declination is positive
   * @param galacticLValues Array of galactic longitude values [degrees, minutes, seconds]
   * @param galacticBValues Array of galactic latitude values [degrees, minutes, seconds]
   */
  formatFromInterpolationText(
    raValues: string[],
    decValues: string[],
    includeGalactic: boolean = true,
    decIsPositive: boolean = true,
    galacticLValues?: string[],
    galacticBValues?: string[]
  ): FormattedCoordinates {
    // Format equatorial coordinates
    const { raHtml, decHtml } = this.formatEquatorialCoordinates(
      raValues[0],
      raValues[1],
      raValues[2],
      decValues[0],
      decValues[1],
      decValues[2],
      decIsPositive ? '' : '-'
    );

    // Format galactic coordinates if requested
    let galacticRaHtml = '';
    let galacticDecHtml = '';

    if (includeGalactic && galacticLValues && galacticBValues) {
      // Galactic coordinates are already calculated by CoordinateInterpolation
      const bIsPositive = !galacticBValues[0].startsWith('-');
      // Remove any existing sign character from the degree value
      let bDeg = galacticBValues[0];
      if (bDeg.startsWith('+') || bDeg.startsWith('-')) {
        bDeg = bDeg.substring(1);
      }

      const galacticCoords = this.formatGalacticCoordinates(
        galacticLValues[0],
        galacticLValues[1],
        galacticLValues[2],
        bDeg,
        galacticBValues[1],
        galacticBValues[2],
        bIsPositive ? '+' : '-'
      );

      galacticRaHtml = galacticCoords.galacticRaHtml;
      galacticDecHtml = galacticCoords.galacticDecHtml;
    }

    return {
      raHtml,
      decHtml,
      galacticRaHtml,
      galacticDecHtml
    };
  }

  /**
   * Process interpolation text from CoordinateInterpolation and format into HTML
   * @param interpolationText The interpolation text object from CoordinateInterpolation
   * @returns Formatted coordinate HTML strings
   */
  formatFromInterpolationObject(interpolationText: any): FormattedCoordinates {
    const ra = interpolationText.alpha.trim().split(" ").map(x => x.padStart(2, "0"));
    const dec = interpolationText.delta.trim().split(" ").map(x => x.padStart(2, "0"));
    const galacticL = interpolationText.l.trim().split(" ").map(x => x.padStart(2, "0"));
    const galacticB = interpolationText.b.trim().split(" ").map(x => x.padStart(2, "0"));
    
    return this.formatFromInterpolationText(
      ra, 
      dec, 
      true, 
      true,
      galacticL,
      galacticB
    );
  }
}
