import {
  ChangeDetectorRef,
  OnChanges,
  TemplateRef,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild
} from "@angular/core";
import { DeepSkyAcquisitionInterface } from "@core/interfaces/deep-sky-acquisition.interface";
import { ImageInterface } from "@core/interfaces/image.interface";
import { SolarSystemAcquisitionInterface } from "@core/interfaces/solar-system-acquisition.interface";
import { DeviceService } from "@core/services/device.service";
import { ImageService } from "@core/services/image/image.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-image-viewer-acquisition-csv-export",
  template: `
    <fa-icon
      *ngIf="showExportButton"
      [ngbTooltip]="'Export to CSV' | translate"
      (click)="openCsvExport($event)"
      class="ms-2 export-csv-button"
      container="body"
      icon="file-csv"
      triggers="hover"
    ></fa-icon>

    <ng-template #csvExportTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "Export acquisition sessions" | translate }}</h5>
        <button (click)="offcanvas.dismiss()" class="btn-close" aria-label="Close" type="button"></button>
      </div>
      <div class="offcanvas-body">
        <textarea [value]="csvContent" class="form-control" readonly rows="20"></textarea>

        <div class="form-text mt-2">
          {{ "This format is compatible with the CSV import feature in the image data editor." | translate }}
          <a href="https://welcome.astrobin.com/importing-acquisitions-from-csv" target="_blank">
            {{ "Learn more" | translate }}.
          </a>
        </div>

        <button (click)="copyCsvContent()" class="btn btn-secondary mt-3">{{ copyButtonLabel }}</button>
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

  csvContent = "";
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
      this.image?.deepSkyAcquisitions?.length > 0 || this.image?.solarSystemAcquisitions?.length > 0;
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

    // Define headers according to the import format
    const headers = [
      "date",
      "filter",
      "filterName", // Added for better usability
      "number",
      "duration",
      "iso",
      "binning",
      "gain",
      "sensorCooling",
      "fNumber",
      "darks",
      "flats",
      "flatDarks",
      "bias",
      "bortle",
      "meanSqm",
      "meanFwhm",
      "temperature"
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

    // Format duration correctly - convert to seconds if needed
    let durationInSeconds = acq.duration;
    if (acq.duration && !isNaN(parseFloat(acq.duration))) {
      // If duration is in minutes (as commonly displayed), convert to seconds
      const durationNum = parseFloat(acq.duration);
      if (durationNum < 100) {
        // Assume it's minutes if small number
        durationInSeconds = (durationNum * 60).toFixed(4);
      } else {
        // Ensure 4 decimal places max
        durationInSeconds = parseFloat(acq.duration).toFixed(4);
      }
    }

    // Create human-readable filter name based on whether it's new equipment or legacy
    let humanReadableFilterName = "";

    if (acq.filter2) {
      // New equipment database
      const brand = acq.filter2Brand || this.translateService.instant("DIY");
      const name = acq.filter2Name || "";
      if (name) {
        humanReadableFilterName = `${brand} ${name}`;
      }
    } else if (acq.filter) {
      // Legacy equipment database
      const make = acq.filterMake || "";
      const name = acq.filterName || "";
      if (name) {
        humanReadableFilterName = make ? `${make} ${name}` : name;
      }
    }

    // Create array of values
    const values = [
      escapeValue(acq.date),
      escapeValue(acq.filter2 || acq.filter), // Use the filter ID
      escapeValue(humanReadableFilterName),
      escapeValue(acq.number),
      escapeValue(durationInSeconds),
      escapeValue(acq.iso),
      escapeValue(acq.binning),
      escapeValue(acq.gain !== null ? parseFloat(String(acq.gain)).toFixed(2) : ""),
      escapeValue(acq.sensorCooling),
      escapeValue(acq.fNumber !== null ? parseFloat(String(acq.fNumber)).toFixed(2) : ""),
      escapeValue(acq.darks),
      escapeValue(acq.flats),
      escapeValue(acq.flatDarks),
      escapeValue(acq.bias),
      escapeValue(acq.bortle),
      escapeValue(acq.meanSqm !== null ? parseFloat(String(acq.meanSqm)).toFixed(2) : ""),
      escapeValue(acq.meanFwhm !== null ? parseFloat(String(acq.meanFwhm)).toFixed(2) : ""),
      escapeValue(acq.temperature !== null ? parseFloat(String(acq.temperature)).toFixed(2) : "")
    ];

    return values.join(",");
  }

  private generateSolarSystemCsv(): string {
    if (!this.image?.solarSystemAcquisitions?.length) {
      return "";
    }

    // Define headers according to the import format
    const headers = [
      "date",
      "time",
      "frames",
      "fps",
      "exposurePerFrame",
      "focalLength",
      "iso",
      "gain",
      "cmi",
      "cmii",
      "cmiii",
      "seeing",
      "transparency"
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
      escapeValue(acq.fps !== null ? parseFloat(String(acq.fps)).toFixed(5) : ""),
      escapeValue(acq.exposurePerFrame !== null ? parseFloat(String(acq.exposurePerFrame)).toFixed(2) : ""),
      escapeValue(acq.focalLength),
      escapeValue(acq.iso),
      escapeValue(acq.gain !== null ? parseFloat(String(acq.gain)).toFixed(2) : ""),
      escapeValue(acq.cmi !== null ? parseFloat(String(acq.cmi)).toFixed(2) : ""),
      escapeValue(acq.cmii !== null ? parseFloat(String(acq.cmii)).toFixed(2) : ""),
      escapeValue(acq.cmiii !== null ? parseFloat(String(acq.cmiii)).toFixed(2) : ""),
      escapeValue(acq.seeing),
      escapeValue(acq.transparency)
    ];

    return values.join(",");
  }
}
