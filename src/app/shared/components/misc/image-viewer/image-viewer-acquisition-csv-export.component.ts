import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, TemplateRef, ViewChild } from "@angular/core";
import { ImageInterface } from "@core/interfaces/image.interface";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@core/services/device.service";
import { TranslateService } from "@ngx-translate/core";
import { ImageService } from "@core/services/image/image.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { DeepSkyAcquisitionInterface } from "@core/interfaces/deep-sky-acquisition.interface";
import { SolarSystemAcquisitionInterface } from "@core/interfaces/solar-system-acquisition.interface";

@Component({
  selector: "astrobin-image-viewer-acquisition-csv-export",
  template: `
    <fa-icon
      *ngIf="showExportButton"
      (click)="openCsvExport($event)"
      [ngbTooltip]="'Export to CSV' | translate"
      triggers="hover"
      class="ms-2 export-csv-button"
      container="body"
      icon="file-csv"
    ></fa-icon>

    <ng-template #csvExportTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ 'Export acquisition sessions' | translate }}</h5>
        <button
          type="button"
          class="btn-close"
          (click)="offcanvas.dismiss()"
          aria-label="Close"
        ></button>
      </div>
      <div class="offcanvas-body">
        <p>{{ 'Copy the CSV data below' | translate }}</p>
        
        <textarea
          class="form-control"
          rows="20"
          readonly
          [value]="csvContent"
        ></textarea>

        <button class="btn btn-secondary mt-3" (click)="copyCsvContent()">{{ copyButtonLabel }}</button>
      </div>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-acquisition-csv-export.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerAcquisitionCsvExportComponent implements OnChanges {
  @Input() image: ImageInterface;
  @Input() filterType: string;
  
  @ViewChild("csvExportTemplate")
  csvExportTemplate: TemplateRef<any>;
  
  csvContent: string = "";
  copyButtonLabel = this.translateService.instant("Copy");
  showExportButton = false;
  
  constructor(
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly translateService: TranslateService,
    public readonly imageService: ImageService,
    public readonly windowRefService: WindowRefService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {}
  
  ngOnChanges(): void {
    // Show export button if there are acquisitions
    this.showExportButton = 
      (this.image?.deepSkyAcquisitions?.length > 0) || 
      (this.image?.solarSystemAcquisitions?.length > 0);
  }
  
  openCsvExport(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    this.generateCsvContent();
    
    this.offcanvasService.open(this.csvExportTemplate, {
      position: this.deviceService.offcanvasPosition(),
      panelClass: "image-viewer-offcanvas acquisition-csv-export-offcanvas",
      backdropClass: "image-viewer-offcanvas-backdrop"
    });
  }
  
  async copyCsvContent(): Promise<void> {
    const result: boolean = await this.windowRefService.copyToClipboard(this.csvContent);
    
    if (!result) {
      this.popNotificationsService.error(this.translateService.instant("Failed to copy CSV to clipboard."));
      return;
    }
    
    this.copyButtonLabel = this.translateService.instant("Copied!");
    this.changeDetectorRef.markForCheck();
    
    this.utilsService.delay(2000).subscribe(() => {
      this.copyButtonLabel = this.translateService.instant("Copy");
      this.changeDetectorRef.markForCheck();
    });
  }
  
  private generateCsvContent(): void {
    if (this.image?.deepSkyAcquisitions?.length > 0) {
      this.csvContent = this.generateDeepSkyCsv();
    } else if (this.image?.solarSystemAcquisitions?.length > 0) {
      this.csvContent = this.generateSolarSystemCsv();
    } else {
      this.csvContent = "";
    }
  }
  
  private generateDeepSkyCsv(): string {
    if (!this.image?.deepSkyAcquisitions?.length) {
      return "";
    }
    
    // Define headers
    const headers = [
      "Date",
      "Filter Type",
      "Filter Brand",
      "Filter Name",
      "Number",
      "Duration",
      "Binning",
      "ISO",
      "Gain",
      "F-Number",
      "Sensor Cooling",
      "Darks",
      "Flats",
      "Flat Darks",
      "Bias",
      "Bortle",
      "Mean SQM",
      "Mean FWHM",
      "Temperature",
      "Moon Illumination"
    ];
    
    // Create CSV content
    let csvContent = headers.join(",") + "\n";
    
    const rows = this.image.deepSkyAcquisitions.map(acq => this.formatDeepSkyAcquisitionRow(acq));
    csvContent += rows.join("\n");
    
    return csvContent;
  }
  
  private formatDeepSkyAcquisitionRow(acq: DeepSkyAcquisitionInterface): string {
    // Helper function to escape CSV values
    const escapeValue = (value: any): string => {
      if (value === null || value === undefined) {
        return "";
      }
      
      const stringValue = String(value);
      // If the value contains commas, quotes, or newlines, wrap it in quotes
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
      }
      
      return stringValue;
    };
    
    // Create array of values
    const values = [
      escapeValue(acq.date),
      escapeValue(acq.filter2Type || acq.filterType),
      escapeValue(acq.filter2Brand || acq.filterMake),
      escapeValue(acq.filter2Name || acq.filterName),
      escapeValue(acq.number),
      escapeValue(acq.duration),
      escapeValue(acq.binning),
      escapeValue(acq.iso),
      escapeValue(acq.gain),
      escapeValue(acq.fNumber),
      escapeValue(acq.sensorCooling),
      escapeValue(acq.darks),
      escapeValue(acq.flats),
      escapeValue(acq.flatDarks),
      escapeValue(acq.bias),
      escapeValue(acq.bortle),
      escapeValue(acq.meanSqm),
      escapeValue(acq.meanFwhm),
      escapeValue(acq.temperature),
      escapeValue(acq.moonIllumination !== null && acq.moonIllumination !== undefined ? 
        Number(acq.moonIllumination).toFixed(2) : null)
    ];
    
    return values.join(",");
  }
  
  private generateSolarSystemCsv(): string {
    if (!this.image?.solarSystemAcquisitions?.length) {
      return "";
    }
    
    // Define headers
    const headers = [
      "Date",
      "Time",
      "Frames",
      "FPS",
      "Exposure Per Frame",
      "Focal Length",
      "ISO", 
      "Gain",
      "CMI",
      "CMII",
      "CMIII",
      "Seeing",
      "Transparency",
      "Moon Illumination"
    ];
    
    // Create CSV content
    let csvContent = headers.join(",") + "\n";
    
    const rows = this.image.solarSystemAcquisitions.map(acq => this.formatSolarSystemAcquisitionRow(acq));
    csvContent += rows.join("\n");
    
    return csvContent;
  }
  
  private formatSolarSystemAcquisitionRow(acq: SolarSystemAcquisitionInterface): string {
    // Helper function to escape CSV values
    const escapeValue = (value: any): string => {
      if (value === null || value === undefined) {
        return "";
      }
      
      const stringValue = String(value);
      // If the value contains commas, quotes, or newlines, wrap it in quotes
      if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
        return '"' + stringValue.replace(/"/g, '""') + '"';
      }
      
      return stringValue;
    };
    
    // Create array of values
    const values = [
      escapeValue(acq.date),
      escapeValue(acq.time),
      escapeValue(acq.frames),
      escapeValue(acq.fps),
      escapeValue(acq.exposurePerFrame),
      escapeValue(acq.focalLength),
      escapeValue(acq.iso),
      escapeValue(acq.gain),
      escapeValue(acq.cmi),
      escapeValue(acq.cmii),
      escapeValue(acq.cmiii),
      escapeValue(acq.seeing),
      escapeValue(acq.transparency),
      escapeValue(acq.moonIllumination !== null && acq.moonIllumination !== undefined ? 
        Number(acq.moonIllumination).toFixed(2) : null)
    ];
    
    return values.join(",");
  }
}