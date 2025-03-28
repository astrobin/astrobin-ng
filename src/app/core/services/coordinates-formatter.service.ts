import { Injectable } from "@angular/core";

// Interface for raw coordinate data
export interface CoordinateData {
  // Celestial coordinates
  ra: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  dec: {
    sign: number; // 1 or -1
    degrees: number;
    minutes: number;
    seconds: number;
  };
  // Galactic coordinates (optional)
  galactic?: {
    l: {
      degrees: number;
      minutes: number;
      seconds: number;
    };
    b: {
      sign: number; // 1 or -1
      degrees: number;
      minutes: number;
      seconds: number;
    };
  };
}

// Interface for HTML-formatted coordinates
export interface FormattedCoordinates {
  raHtml: string;
  decHtml: string;
  galacticRaHtml: string;
  galacticDecHtml: string;
}

@Injectable({
  providedIn: "root"
})
export class CoordinatesFormatterService {
  constructor() {
  }

  /**
   * Calculate raw coordinate data from a mouse event and interpolation matrix
   * @param event Mouse event containing clientX and clientY or offsetX and offsetY
   * @param imageElement The image DOM element to get dimensions from
   * @param interpolationMatrix The matrix information for coordinate calculation
   * @param options Additional options for calculation
   * @returns Raw coordinate data and mouse positions
   */
  calculateRawCoordinates(
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
      rotationDegrees?: number; // Optional rotation angle in degrees
    }
  ): {
    coordinates: CoordinateData;
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
      
    const imageRenderedHeight = options?.useClientCoords
      ? imageElement.getBoundingClientRect().height
      : imageElement.clientHeight;

    const imageNaturalWidth = options?.naturalWidth ||
      ((imageElement as HTMLImageElement).naturalWidth) || 1824;

    // HD_WIDTH is a fixed reference width that the plate-solving matrix is based on
    const HD_WIDTH = 1824;

    // Apply rotation if specified
    if (options?.rotationDegrees && options.rotationDegrees !== 0) {
      // Calculate image center for rotation
      const centerX = imageRenderedWidth / 2;
      const centerY = imageRenderedHeight / 2;
      
      // Rotate the point around the center
      const rotatedPoint = this._rotatePointAroundCenter(
        relativeX, 
        relativeY, 
        centerX, 
        centerY, 
        -options.rotationDegrees // Use negative angle to counter the applied rotation
      );
      
      relativeX = rotatedPoint.x;
      relativeY = rotatedPoint.y;
    }

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

    // Get raw values from the interpolation
    const interpolationResult = interpolation.interpolate(scaledX, scaledY, true, true);
    
    if (!interpolationResult || typeof interpolationResult.alpha !== 'number') {
      return null;
    }
    
    // Convert RA from degrees (0-360) to hours (0-24)
    const raDegrees = interpolationResult.alpha;
    const raHours = raDegrees / 15;
    
    // Helper function to avoid rounding errors
    const fixFloatingPointIssues = (value: number): number => {
      // Convert to fixed precision (4 decimal places) then back to number to avoid precision issues
      return parseFloat(value.toFixed(4));
    };
    
    // Calculate HMS components with stable precision
    const raHoursInt = Math.floor(raHours);
    const raMinutesFull = (raHours - raHoursInt) * 60;
    const raMinutesInt = Math.floor(raMinutesFull);
    const raSeconds = fixFloatingPointIssues((raMinutesFull - raMinutesInt) * 60);
    
    // Calculate DMS components with stable precision
    const decDegrees = Math.abs(interpolationResult.delta);
    const decSign = interpolationResult.delta >= 0 ? 1 : -1;
    const decDegreesInt = Math.floor(decDegrees);
    const decMinutesFull = (decDegrees - decDegreesInt) * 60;
    const decMinutesInt = Math.floor(decMinutesFull);
    const decSeconds = fixFloatingPointIssues((decMinutesFull - decMinutesInt) * 60);
    
    // Handle carryover when seconds are very close to 60
    let finalRaHours = raHoursInt;
    let finalRaMinutes = raMinutesInt;
    let finalRaSeconds = raSeconds;
    
    if (finalRaSeconds >= 59.995) {
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
    
    let finalDecDegrees = decDegreesInt;
    let finalDecMinutes = decMinutesInt;
    let finalDecSeconds = decSeconds;
    
    if (finalDecSeconds >= 59.995) {
      finalDecSeconds = 0;
      finalDecMinutes += 1;
      
      if (finalDecMinutes >= 60) {
        finalDecMinutes = 0;
        finalDecDegrees += 1;
      }
    }
    
    // Create the coordinate data object with stabilized values
    const coordinates: CoordinateData = {
      ra: {
        hours: finalRaHours,
        minutes: finalRaMinutes,
        seconds: Math.round(finalRaSeconds)
      },
      dec: {
        sign: decSign,
        degrees: finalDecDegrees,
        minutes: finalDecMinutes,
        seconds: Math.round(finalDecSeconds)
      }
    };
    
    // Add galactic coordinates if available
    if (interpolationResult.l !== undefined && interpolationResult.b !== undefined) {
      const lDegrees = Math.abs(interpolationResult.l);
      const lDegreesInt = Math.floor(lDegrees);
      const lMinutesFull = (lDegrees - lDegreesInt) * 60;
      const lMinutesInt = Math.floor(lMinutesFull);
      const lSeconds = fixFloatingPointIssues((lMinutesFull - lMinutesInt) * 60);
      
      const bDegrees = Math.abs(interpolationResult.b);
      const bSign = interpolationResult.b >= 0 ? 1 : -1;
      const bDegreesInt = Math.floor(bDegrees);
      const bMinutesFull = (bDegrees - bDegreesInt) * 60;
      const bMinutesInt = Math.floor(bMinutesFull);
      const bSeconds = fixFloatingPointIssues((bMinutesFull - bMinutesInt) * 60);
      
      // Handle carryover for galactic longitude (l)
      let finalLDegrees = lDegreesInt;
      let finalLMinutes = lMinutesInt;
      let finalLSeconds = lSeconds;
      
      if (finalLSeconds >= 59.995) {
        finalLSeconds = 0;
        finalLMinutes += 1;
        
        if (finalLMinutes >= 60) {
          finalLMinutes = 0;
          finalLDegrees += 1;
          
          if (finalLDegrees >= 360) {
            finalLDegrees = 0;
          }
        }
      }
      
      // Handle carryover for galactic latitude (b)
      let finalBDegrees = bDegreesInt;
      let finalBMinutes = bMinutesInt;
      let finalBSeconds = bSeconds;
      
      if (finalBSeconds >= 59.995) {
        finalBSeconds = 0;
        finalBMinutes += 1;
        
        if (finalBMinutes >= 60) {
          finalBMinutes = 0;
          finalBDegrees += 1;
        }
      }
      
      coordinates.galactic = {
        l: {
          degrees: finalLDegrees,
          minutes: finalLMinutes,
          seconds: Math.round(finalLSeconds)
        },
        b: {
          sign: bSign,
          degrees: finalBDegrees,
          minutes: finalBMinutes,
          seconds: Math.round(finalBSeconds)
        }
      };
    }

    return {
      coordinates,
      x: event.offsetX,
      y: event.offsetY
    };
  }

  /**
   * Calculate mouse coordinates from a mouse event and interpolation matrix and format as HTML
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
      rotationDegrees?: number; // Optional rotation angle in degrees
    }
  ): {
    coordinates: FormattedCoordinates;
    x: number;
    y: number;
  } {
    // Get the raw coordinate data
    const result = this.calculateRawCoordinates(event, imageElement, interpolationMatrix, options);
    
    if (!result) {
      return null;
    }
    
    // Format the coordinates as HTML
    const formattedCoordinates = this.formatCoordinateData(result.coordinates);
    
    return {
      coordinates: formattedCoordinates,
      x: result.x,
      y: result.y
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
    const paddedRaHours = raHours.toString().padStart(2, "0");
    const paddedRaMinutes = raMinutes.toString().padStart(2, "0");
    const paddedRaSeconds = raSeconds.toString().padStart(2, "0");

    const paddedDecDegrees = decDegrees.toString().padStart(2, "0");
    const paddedDecMinutes = decMinutes.toString().padStart(2, "0");
    const paddedDecSeconds = decSeconds.toString().padStart(2, "0");

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
    const paddedLDegrees = lDegrees.toString().padStart(3, "0");
    const paddedLMinutes = lMinutes.toString().padStart(2, "0");
    const paddedLSeconds = lSeconds.toString().padStart(2, "0");

    const paddedBDegrees = bDegrees.toString().padStart(2, "0");
    const paddedBMinutes = bMinutes.toString().padStart(2, "0");
    const paddedBSeconds = bSeconds.toString().padStart(2, "0");

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
      decIsPositive ? "" : "-"
    );

    // Format galactic coordinates if requested
    let galacticRaHtml = "";
    let galacticDecHtml = "";

    if (includeGalactic && galacticLValues && galacticBValues) {
      // Galactic coordinates are already calculated by CoordinateInterpolation
      const bIsPositive = !galacticBValues[0].startsWith("-");
      // Remove any existing sign character from the degree value
      let bDeg = galacticBValues[0];
      if (bDeg.startsWith("+") || bDeg.startsWith("-")) {
        bDeg = bDeg.substring(1);
      }

      const galacticCoords = this.formatGalacticCoordinates(
        galacticLValues[0],
        galacticLValues[1],
        galacticLValues[2],
        bDeg,
        galacticBValues[1],
        galacticBValues[2],
        bIsPositive ? "+" : "-"
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
   * Format raw coordinate data into HTML representation
   * @param coordinateData Raw coordinate data to format
   * @returns Formatted HTML coordinates
   */
  formatCoordinateData(coordinateData: CoordinateData): FormattedCoordinates {
    if (!coordinateData) {
      return {
        raHtml: "",
        decHtml: "",
        galacticRaHtml: "",
        galacticDecHtml: ""
      };
    }
    
    // Format equatorial coordinates
    const { raHtml, decHtml } = this.formatEquatorialCoordinates(
      coordinateData.ra.hours.toString(),
      coordinateData.ra.minutes.toString(),
      coordinateData.ra.seconds.toString(),
      coordinateData.dec.degrees.toString(),
      coordinateData.dec.minutes.toString(),
      coordinateData.dec.seconds.toString(),
      coordinateData.dec.sign > 0 ? "" : "-"
    );
    
    // Format galactic coordinates if available
    let galacticRaHtml = "";
    let galacticDecHtml = "";
    
    if (coordinateData.galactic) {
      const galacticCoords = this.formatGalacticCoordinates(
        coordinateData.galactic.l.degrees.toString(),
        coordinateData.galactic.l.minutes.toString(),
        coordinateData.galactic.l.seconds.toString(),
        coordinateData.galactic.b.degrees.toString(),
        coordinateData.galactic.b.minutes.toString(),
        coordinateData.galactic.b.seconds.toString(),
        coordinateData.galactic.b.sign > 0 ? "+" : "-"
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

  /**
   * Rotates a point around a center point by a given angle in degrees
   * @param x X coordinate of the point to rotate
   * @param y Y coordinate of the point to rotate
   * @param centerX X coordinate of the center point
   * @param centerY Y coordinate of the center point
   * @param angleDegrees Angle in degrees to rotate by
   * @returns The rotated point coordinates
   */
  private _rotatePointAroundCenter(
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    angleDegrees: number
  ): { x: number; y: number } {
    // Convert degrees to radians
    const angleRadians = (angleDegrees * Math.PI) / 180;

    // Translate point to origin
    const translatedX = x - centerX;
    const translatedY = y - centerY;

    // Apply rotation
    const rotatedX = translatedX * Math.cos(angleRadians) - translatedY * Math.sin(angleRadians);
    const rotatedY = translatedX * Math.sin(angleRadians) + translatedY * Math.cos(angleRadians);

    // Translate back from origin
    return {
      x: rotatedX + centerX,
      y: rotatedY + centerY
    };
  }
}
