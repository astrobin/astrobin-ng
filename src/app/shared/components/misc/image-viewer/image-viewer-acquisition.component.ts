import { Component, OnChanges, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { ImageService } from "@shared/services/image/image.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { FilterType, FilterTypePriority } from "@features/equipment/types/filter.interface";
import { FilterService } from "@features/equipment/services/filter.service";
import { TranslateService } from "@ngx-translate/core";
import { WindowRefService } from "@shared/services/window-ref.service";

// This includes total per filter type.
interface FilterSummary {
  totalIntegration: number;
  dates: string[];
  averageMoonIllumination: number;
  number: number;
  duration: string;
}

// This includes each session.
interface DetailedFilterSummary {
  totalIntegration: number;
  details: {
    key: string;
    date: string;
    brand: string;
    name: string;
    number: number;
    duration: string;
  }[];
}

@Component({
  selector: "astrobin-image-viewer-acquisition",
  template: `
    <ng-container *ngIf="image.solarSystemAcquisitions?.length && !image.deepSkyAcquisitions?.length">
      <div class="metadata-header">{{ "Acquisition" | translate }}</div>
      <div
        *ngIf="image.solarSystemAcquisitions?.length && !image.deepSkyAcquisitions?.length"
        class="metadata-section px-2"
      >
        <div *ngIf="solarSystemIntegration" class="metadata-item">
          <div class="metadata-icon">
            <fa-icon icon="clock"></fa-icon>
          </div>
          <div class="metadata-label" [innerHTML]="solarSystemIntegration"></div>
        </div>

        <div *ngIf="dates?.length" class="metadata-item">
          <div class="metadata-icon">
            <fa-icon icon="calendar"></fa-icon>
          </div>
          <div class="metadata-label">
            <astrobin-image-viewer-acquisition-dates [dates]="dates"></astrobin-image-viewer-acquisition-dates>
          </div>
        </div>

        <div *ngIf="image.averageMoonIllumination !== null" class="metadata-item">
          <div class="metadata-icon">
            <fa-icon icon="moon"></fa-icon>
          </div>
          <div class="metadata-label">{{ image.averageMoonIllumination | percent }}</div>
        </div>
      </div>
    </ng-container>

    <div
      *ngIf="image.deepSkyAcquisitions?.length && !image.solarSystemAcquisitions?.length"
      class="metadata-section"
    >
      <table class="table">
        <thead>
        <tr>
          <th>
            {{ "Integration" | translate }}
          </th>

          <th>&nbsp;</th>

          <th>
            <span
              *ngIf="deepSkyIntegrationTime"
              [innerHTML]="deepSkyIntegrationTime"
              class="no-wrap"
            ></span>

            <span *ngIf="!deepSkyIntegrationTime">
              {{ "n/d" | translate }}
            </span>
          </th>

          <th *ngIf="dates?.length" class="d-none d-md-table-cell">
            <astrobin-image-viewer-acquisition-dates [dates]="dates"></astrobin-image-viewer-acquisition-dates>
          </th>

          <th *ngIf="dates?.length">
            <span *ngIf="image.averageMoonIllumination !== null" class="no-wrap">
              <fa-icon icon="moon"></fa-icon>
              {{ image.averageMoonIllumination | percent }}
            </span>
          </th>
        </tr>
        </thead>

        <tbody>
        <tr class="spacer-row">
          <td colspan="4"></td>
        </tr>

        <tr *ngFor="let filterSummary of filterSummaries">
          <td>
            <div class="metadata-item">
              <div class="metadata-label">
                <a
                  (click)="openDeepSkyIntegrationDetails($event)"
                  astrobinEventPreventDefault
                  data-toggle="offcanvas"
                >
                  {{ humanizeFilterType(filterSummary.filterType) }}
                </a>
              </div>
            </div>
          </td>

          <td>
            <div class="metadata-item">
              <div class="metadata-label">
                <span
                  *ngIf="filterSummary.summary.number && filterSummary.summary.duration"
                  class="no-wrap"
                >
                  <span class="number">{{ filterSummary.summary.number }}</span>
                  <span class="symbol px-1">&times;</span>
                  <span class="duration">{{ filterSummary.summary.duration }}</span>
                  <span class="symbol">&Prime;</span>
                </span>
                <span
                  *ngIf="!filterSummary.summary.number || !filterSummary.summary.duration"
                >
                  <fa-icon
                    icon="bars-staggered"
                    [ngbTooltip]="'Mix of multiple exposure times' | translate"
                    triggers="hover click"
                    container="body"
                    data-toggle="offcanvas"
                    (click)="openDeepSkyIntegrationDetails($event)"
                  ></fa-icon>
                </span>
              </div>
            </div>
          </td>

          <td>
            <div class="metadata-item">
              <div class="metadata-label">
                <span
                  [innerHTML]="imageService.formatIntegration(filterSummary.summary.totalIntegration)"
                  class="no-wrap"
                ></span>
              </div>
            </div>
          </td>

          <td *ngIf="dates?.length" class="d-none d-md-table-cell">
            <div class="metadata-item">
              <div class="metadata-label">
                <astrobin-image-viewer-acquisition-dates
                  [dates]="filterSummary.summary.dates"
                ></astrobin-image-viewer-acquisition-dates>
              </div>
            </div>
          </td>

          <td *ngIf="dates?.length">
            <div class="metadata-item">
              <div class="metadata-label">
                <span
                  *ngIf="filterSummary.summary.averageMoonIllumination !== null"
                  class="no-wrap"
                >
                  <fa-icon icon="moon"></fa-icon>
                  {{ filterSummary.summary.averageMoonIllumination | percent }}
                </span>
              </div>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <ng-template #deepSkyIntegrationDetailsTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h4 class="offcanvas-title">{{ "Acquisition sessions" | translate }}</h4>
        <button type="button" class="btn-close" aria-label="Close" (click)="offcanvas.dismiss()"></button>
      </div>
      <div class="offcanvas-body offcanvas-users">
        <table class="table">
          <ng-container *ngFor="let filterType of filterTypes; let i = index">
            <thead>
            <tr *ngIf="i > 0" class="spacer-row">
              <td colspan="3"></td>
            </tr>
            <tr>
              <th>
                {{ humanizeFilterType(filterType) }}
              </th>
              <th></th>
              <th>
                <span
                  [innerHTML]="imageService.formatIntegration(detailedFilterSummaries[filterType].totalIntegration)">
                </span>
              </th>
            </tr>
            </thead>

            <tbody>
            <tr class="small-spacer-row">
              <td colspan="3"></td>
            </tr>

            <tr *ngFor="let detail of detailedFilterSummaries[filterType].details">
              <td class="date">
                <ng-container *ngIf="detail.date">
                  {{ detail.date | localDate | date:"mediumDate" }}
                </ng-container>
                <ng-container *ngIf="!detail.date">
                  {{ "Unknown date" | translate }}
                </ng-container>
              </td>

              <td>
                <ng-container *ngIf="detail.name">
                  <span class="brand">{{ detail.brand }}</span>
                  <span class="name">{{ detail.name }}</span>
                </ng-container>
              </td>

              <td>
                <span class="number">{{ detail.number }}</span>
                <span class="times">&times;</span>
                <span class="duration">{{ detail.duration }}&Prime;</span>
              </td>
            </tr>
            </tbody>
          </ng-container>
        </table>
      </div>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-acquisition.component.scss"]
})
export class ImageViewerAcquisitionComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  dates: string[];
  deepSkyIntegrationTime: string;
  solarSystemIntegration: string;
  filterTypes: string[];
  filterSummaries: { filterType: string, summary: FilterSummary }[] = [];
  detailedFilterSummaries: { [key: string]: DetailedFilterSummary } = {};

  @ViewChild("deepSkyIntegrationDetailsTemplate")
  deepSkyIntegrationDetailsTemplate: TemplateRef<any>;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly imageService: ImageService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly filterService: FilterService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService
  ) {
    super(store$, searchService, router, imageViewerService, windowRefService);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.image && changes.image.currentValue) {
      const image: ImageInterface = changes.image.currentValue;
      const deepSkyDates = image.deepSkyAcquisitions.map(acquisition => acquisition.date);
      const solarSystemDates = image.solarSystemAcquisitions.map(acquisition => acquisition.date);

      this.setDates([...deepSkyDates, ...solarSystemDates].filter(date => !!date));
      this.setDeepSkyIntegrationTime(image);
      this.setSolarSystemFrames(image);

      this.filterSummaries = this._buildFilterSummaries();
    }
  }

  setDates(dates: string[]) {
    this.dates = dates;
  }

  setDeepSkyIntegrationTime(image: ImageInterface) {
    this.deepSkyIntegrationTime = this.imageService.getDeepSkyIntegration(image);
  }

  setSolarSystemFrames(image: ImageInterface) {
    this.solarSystemIntegration = this.imageService.getSolarSystemIntegration(image);
  }

  humanizeFilterType(filterType: string): string {
    if (filterType === "UNKNOWN") {
      return this.translateService.instant("Unknown or no filter");
    }

    return this.filterService.humanizeType(filterType as FilterType);
  }

  openDeepSkyIntegrationDetails(event: MouseEvent): void {
    event.preventDefault();
    this.detailedFilterSummaries = this._buildDetailedFilterSummaries();
    this.filterTypes = Object.keys(this.detailedFilterSummaries);

    this.filterTypes.sort((a, b) => {
      const priorityA = FilterTypePriority[a as keyof typeof FilterTypePriority] ?? Number.MAX_SAFE_INTEGER;
      const priorityB = FilterTypePriority[b as keyof typeof FilterTypePriority] ?? Number.MAX_SAFE_INTEGER;
      return priorityA - priorityB;
    });

    this.offcanvasService.open(this.deepSkyIntegrationDetailsTemplate, {
      panelClass: "offcanvas-deep-sky-integration-details",
      position: this.deviceService.offcanvasPosition()
    });
  }

  private _buildFilterSummaries(): { filterType: string, summary: FilterSummary }[] {
    const filterSummaries: { [key: string]: FilterSummary } = {};

    this.image.deepSkyAcquisitions.forEach(acquisition => {
      const filterType = acquisition.filter2Type || acquisition.filterType || "UNKNOWN";
      const date = acquisition.date;
      const duration = parseFloat(acquisition.duration).toFixed(2).replace(".00", "");

      if (!filterSummaries[filterType]) {
        filterSummaries[filterType] = {
          totalIntegration: 0,
          dates: [],
          averageMoonIllumination: null,
          number: acquisition.number,
          duration
        };
      }

      if (acquisition.number !== null && acquisition.duration !== null) {
        filterSummaries[filterType].totalIntegration += acquisition.number * parseFloat(acquisition.duration);

        const fixedAcquisitionDuration = parseFloat(acquisition.duration).toFixed(2).replace(".00", "");
        const filterExistingDuration = parseFloat(filterSummaries[filterType].duration).toFixed(2).replace(".00", "");

        if (filterExistingDuration === fixedAcquisitionDuration) {
          filterSummaries[filterType].number += acquisition.number;
        } else {
          filterSummaries[filterType].number = null;
          filterSummaries[filterType].duration = null;
        }
      }

      if (date) {
        filterSummaries[filterType].dates.push(date);
      }
    });

    for (const filterType in filterSummaries) {
      const moonIlluminations = this.image.deepSkyAcquisitions
        .filter(
          acquisition =>
            acquisition.filter2Type === filterType ||
            (acquisition.filter2Type === undefined && filterType === "UNKNOWN") ||
            (acquisition.filterType === undefined && filterType === "UNKNOWN")
        )
        .map(acquisition => acquisition.moonIllumination)
        .filter(moonIllumination => moonIllumination !== null);

      filterSummaries[filterType].averageMoonIllumination = moonIlluminations.reduce(
        (acc, moonIllumination) => acc + moonIllumination,
        0
      ) / moonIlluminations.length || null; // handle the case where there are no valid moonIlluminations
    }

    // Convert the object into an array of entries
    const filterSummaryArray = Object.entries(filterSummaries).map(([filterType, summary]) => ({
      filterType,
      summary
    }));

    // Sort the array based on FilterTypePriority
    filterSummaryArray.sort((a, b) => {
      const priorityA = FilterTypePriority[a.filterType as keyof typeof FilterTypePriority] ?? Number.MAX_SAFE_INTEGER;
      const priorityB = FilterTypePriority[b.filterType as keyof typeof FilterTypePriority] ?? Number.MAX_SAFE_INTEGER;
      return priorityA - priorityB;
    });

    return filterSummaryArray;
  }

  private _buildDetailedFilterSummaries(): { [key: string]: DetailedFilterSummary } {
    const detailedFilterSummaries: { [key: string]: DetailedFilterSummary } = {};

    this.image.deepSkyAcquisitions.forEach(acquisition => {
      const filterType = acquisition.filter2Type || acquisition.filterType || "UNKNOWN";
      const name = acquisition.filter2Name || acquisition.filterName;
      const brand = acquisition.filter2Brand || acquisition.filterMake || this.translateService.instant("DIY");
      const date = acquisition.date;
      const duration = parseFloat(acquisition.duration).toFixed(2).replace(".00", "");
      const key = `${date}_${brand}_${name || "UNKNOWN"}_${duration}`;

      if (!detailedFilterSummaries[filterType]) {
        detailedFilterSummaries[filterType] = {
          totalIntegration: 0,
          details: []
        };
      }

      const existingDetail = detailedFilterSummaries[filterType].details.find(detail => detail.key === key);

      if (existingDetail) {
        // Aggregate exposures if the same date, brand, name, and duration match
        existingDetail.number += acquisition.number;
      } else {
        // Otherwise, create a new entry
        detailedFilterSummaries[filterType].details.push({
          key, // Store the key for easy aggregation later
          date,
          brand,
          name,
          number: acquisition.number,
          duration
        });
      }

      detailedFilterSummaries[filterType].totalIntegration += acquisition.number * parseFloat(acquisition.duration);
    });

    return detailedFilterSummaries;
  }
}
