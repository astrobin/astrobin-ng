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
import { FilterType } from "@features/equipment/types/filter.interface";
import { FilterService } from "@features/equipment/services/filter.service";
import { TranslateService } from "@ngx-translate/core";
import { WindowRefService } from "@shared/services/window-ref.service";

interface FilterSummary {
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
    <div class="metadata-section">
      <div *ngIf="dates?.length" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon
            icon="calendar"
            [ngbTooltip]="'Acquisition dates' | translate"
            container="body"
            triggers="hover click"
          ></fa-icon>
        </div>
        <div class="metadata-label">
          <astrobin-image-viewer-acquisition-dates [dates]="dates"></astrobin-image-viewer-acquisition-dates>
        </div>
      </div>

      <div *ngIf="deepSkyIntegrationTime" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon
            [ngbTooltip]="'Integration' | translate"
            triggers="hover click"
            container="body"
            icon="clock"
          ></fa-icon>
        </div>
        <div class="metadata-label">
          <span
            (click)="openDeepSkyIntegrationDetails($event)"
            [innerHTML]="deepSkyIntegrationTime"
            data-toggle="offcanvas"
          ></span>
        </div>
      </div>

      <div *ngIf="solarSystemIntegration" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon
            [ngbTooltip]="'Integration' | translate"
            triggers="hover click"
            container="body"
            icon="clock"
          ></fa-icon>
        </div>
        <div class="metadata-label" [innerHTML]="solarSystemIntegration">
        </div>
      </div>

      <div *ngIf="!deepSkyIntegrationTime && !solarSystemIntegration" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon
            [ngbTooltip]="'Integration' | translate"
            triggers="hover click"
            container="body"
            icon="clock"
          ></fa-icon>
        </div>
        <div class="metadata-label">
          {{ "n/d" | translate }}
        </div>
      </div>

      <div *ngIf="image.averageMoonIllumination !== null" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon
            [ngbTooltip]="'Average moon illumination' | translate"
            triggers="hover click"
            container="body"
            icon="moon"
          ></fa-icon>
        </div>
        <div class="metadata-label">
          <span>{{ image.averageMoonIllumination | percent }}</span>
        </div>
      </div>
    </div>

    <ng-template #deepSkyIntegrationDetailsTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h4 class="offcanvas-title">{{ "Acquisition sessions" | translate }}</h4>
        <button type="button" class="btn-close" aria-label="Close" (click)="offcanvas.dismiss()"></button>
      </div>
      <div class="offcanvas-body offcanvas-users">
        <ngb-accordion>
          <ngb-panel *ngFor="let filterType of filterTypes">
            <ng-container *ngIf="filterSummaries[filterType]">
              <ng-template ngbPanelTitle>
                <div class="filter-details-title">
                  <strong>{{ humanizeFilterType(filterType) }}</strong>
                  <span
                    [innerHTML]="imageService.formatIntegration(filterSummaries[filterType].totalIntegration)"></span>
                </div>
              </ng-template>
              <ng-template ngbPanelContent>
                <div *ngFor="let detail of filterSummaries[filterType].details" class="filter-details">
                  <span *ngIf="detail.date" class="date">{{ detail.date | localDate | date:"mediumDate" }}</span>
                  <ng-container *ngIf="detail.name">
                    <span class="brand">{{ detail.brand }}</span>
                    <span class="name">{{ detail.name }}</span>:
                  </ng-container>

                  <span class="number">{{ detail.number }}</span>
                  <span class="times">&times;</span>
                  <span class="duration">{{ detail.duration }}&Prime;</span>
                </div>
              </ng-template>
            </ng-container>
          </ngb-panel>
        </ngb-accordion>
      </div>
    </ng-template>
  `,
  styles: [`
    ::ng-deep .offcanvas-deep-sky-integration-details {
      &:not(.offcanvas-bottom) {
        width: 40vw !important;
      }

      .filter-details-title {
        display: flex;
        justify-content: space-between;
        width: calc(100% - 2rem);

        strong {
          font-weight: bold;
          color: var(--white);
        }

        span {
          color: var(--lighterGrey);
        }
      }

      .filter-details {
        .date {
          color: var(--lighterGrey);
          margin-right: .5rem;
        }

        .number {
          margin-left: .5rem;
        }

        .number,
        .duration {
          color: var(--lightestGrey);
        }
      }
    }
  `]
})
export class ImageViewerAcquisitionComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  dates: string[];
  deepSkyIntegrationTime: string;
  solarSystemIntegration: string;
  filterTypes: string[];
  filterSummaries: { [key: string]: FilterSummary } = {};

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

  getFilterSummaries(): { [key: string]: FilterSummary } {
    const filterSummaries: { [key: string]: FilterSummary } = {};

    this.image.deepSkyAcquisitions.forEach(acquisition => {
      const filterType = acquisition.filter2Type || acquisition.filterType || "UNKNOWN";
      const name = acquisition.filter2Name || acquisition.filterName;
      const brand = acquisition.filter2Brand || acquisition.filterMake || this.translateService.instant("DIY");
      const date = acquisition.date;
      const duration = parseFloat(acquisition.duration).toFixed(2).replace(".00", "");
      const key = `${date}_${brand}_${name || 'UNKNOWN'}_${duration}`;

      if (!filterSummaries[filterType]) {
        filterSummaries[filterType] = {
          totalIntegration: 0,
          details: []
        };
      }

      const existingDetail = filterSummaries[filterType].details.find(detail => detail.key === key);

      if (existingDetail) {
        // Aggregate exposures if the same date, brand, name, and duration match
        existingDetail.number += acquisition.number;
      } else {
        // Otherwise, create a new entry
        filterSummaries[filterType].details.push({
          key, // Store the key for easy aggregation later
          date,
          brand,
          name,
          number: acquisition.number,
          duration
        });
      }

      filterSummaries[filterType].totalIntegration += acquisition.number * parseFloat(acquisition.duration);
    });

    return filterSummaries;
  }


  humanizeFilterType(filterType: string): string {
    if (filterType === "UNKNOWN") {
      return this.translateService.instant("Unknown or no filter");
    }

    return this.filterService.humanizeType(filterType as FilterType);
  }

  openDeepSkyIntegrationDetails(event: MouseEvent): void {
    event.preventDefault();
    this.filterSummaries = this.getFilterSummaries();
    this.filterTypes = Object.keys(this.filterSummaries);

    this.filterTypes.sort((a, b) => {
      if (a === "UNKNOWN") {
        return 1;
      }
      if (b === "UNKNOWN") {
        return -1;
      }
      return a.localeCompare(b);
    });

    this.offcanvasService.open(this.deepSkyIntegrationDetailsTemplate, {
      panelClass: "offcanvas-deep-sky-integration-details",
      position: this.deviceService.offcanvasPosition()
    });
  }
}
