import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { WindowRefService } from "@core/services/window-ref.service";
import { CoordinatesFormatterService } from "@core/services/coordinates-formatter.service";

export enum CoordinateFormat {
  SEXAGESIMAL = 'sexagesimal',
  DECIMAL = 'decimal',
  HMS_DMS = 'hms_dms'
}

/**
 * Interface for coordinate data point
 */
interface CoordinatePoint {
  text: string;
  ra: number;
  dec: number;
}

/**
 * Interface for measurement data structure
 */
interface MeasurementExportData {
  centerCoordinates: CoordinatePoint;
  corners: {
    topLeft: CoordinatePoint;
    topRight: CoordinatePoint;
    bottomLeft: CoordinatePoint;
    bottomRight: CoordinatePoint;
  };
}

/**
 * Interface for formatted coordinate output
 */
interface FormattedCoordinateData {
  centerCoordinates: string;
  corners: {
    topLeft: string;
    topRight: string;
    bottomLeft: string;
    bottomRight: string;
  };
}

@Component({
  selector: "astrobin-export-measurement-modal",
  templateUrl: "./export-measurement-modal.component.html",
  styleUrls: ["./export-measurement-modal.component.scss"]
})
export class ExportMeasurementModalComponent implements OnInit {
  @Input() measurementData: MeasurementExportData;
  @Input() windowRefService: WindowRefService;
  @Input() translateService: TranslateService;
  @Input() coordinatesFormatter: CoordinatesFormatterService;

  // Export format variables
  formats = CoordinateFormat;
  selectedFormat: CoordinateFormat = CoordinateFormat.SEXAGESIMAL;
  
  // UI state
  copiedField: string = null;

  // Formatted coordinate data
  formattedData: FormattedCoordinateData = {
    centerCoordinates: '',
    corners: {
      topLeft: '',
      topRight: '',
      bottomLeft: '',
      bottomRight: ''
    }
  };

  constructor(public readonly activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    this.formatCoordinates();
  }

  /**
   * Format all coordinates based on the selected format
   */
  formatCoordinates(): void {
    // Format center coordinates
    this.formattedData = {
      centerCoordinates: this.formatSingleCoordinate(this.measurementData.centerCoordinates),
      corners: {
        topLeft: this.formatSingleCoordinate(this.measurementData.corners?.topLeft),
        topRight: this.formatSingleCoordinate(this.measurementData.corners?.topRight),
        bottomLeft: this.formatSingleCoordinate(this.measurementData.corners?.bottomLeft),
        bottomRight: this.formatSingleCoordinate(this.measurementData.corners?.bottomRight)
      }
    };
  }

  /**
   * Format a single coordinate point based on the selected format
   */
  private formatSingleCoordinate(point: CoordinatePoint): string {
    if (!point) {
      return 'N/A';
    }

    if (this.hasRawCoordinates(point)) {
      return this.coordinatesFormatter.formatCoordinatesVerbose(
        point.ra,
        point.dec,
        this.selectedFormat
      );
    } else {
      return point.text || 'N/A';
    }
  }

  /**
   * Checks if coordinate data has raw RA/Dec values for formatting
   */
  private hasRawCoordinates(data: CoordinatePoint): boolean {
    return data && typeof data.ra === 'number' && typeof data.dec === 'number';
  }

  /**
   * Copy coordinate text to clipboard
   */
  async copyToClipboard(text: string, field: string): Promise<void> {
    if (!text || text === 'N/A') {
      return;
    }
    
    const result = await this.windowRefService.copyToClipboard(text);
    
    if (result) {
      this.copiedField = field;
      setTimeout(() => {
        this.copiedField = null;
      }, 2000);
    }
  }

  /**
   * Close the modal
   */
  close(): void {
    this.activeModal.close();
  }

  /**
   * Change the coordinate format and update all displayed values
   */
  changeFormat(format: CoordinateFormat): void {
    this.selectedFormat = format;
    this.formatCoordinates();
  }

  /**
   * Determines if a field value has content to display
   */
  hasContent(value: string): boolean {
    return value && value !== 'N/A';
  }
}