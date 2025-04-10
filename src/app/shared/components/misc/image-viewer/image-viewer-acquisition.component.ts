import {
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ChangeDetectionStrategy,
  Component,
  ViewChild
} from "@angular/core";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { DeepSkyAcquisitionInterface } from "@core/interfaces/deep-sky-acquisition.interface";
import { ImageInterface } from "@core/interfaces/image.interface";
import { CollapseSyncService } from "@core/services/collapse-sync.service";
import { DeviceService } from "@core/services/device.service";
import { ImageInfoService } from "@core/services/image/image-info.service";
import { ImageService } from "@core/services/image/image.service";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { SearchService } from "@core/services/search.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { FilterAcquisitionService, FilterSummary } from "@features/equipment/services/filter-acquisition.service";
import { FilterService } from "@features/equipment/services/filter.service";
import { FilterTypePriority } from "@features/equipment/types/filter.interface";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { CookieService } from "ngx-cookie";

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
    binning: DeepSkyAcquisitionInterface["binning"];
    iso: DeepSkyAcquisitionInterface["iso"];
    gain: DeepSkyAcquisitionInterface["gain"];
    fNumber: DeepSkyAcquisitionInterface["fNumber"];
    sensorCooling: DeepSkyAcquisitionInterface["sensorCooling"];
    darks: DeepSkyAcquisitionInterface["darks"];
    flats: DeepSkyAcquisitionInterface["flats"];
    flatDarks: DeepSkyAcquisitionInterface["flatDarks"];
    bias: DeepSkyAcquisitionInterface["bias"];
    bortle: DeepSkyAcquisitionInterface["bortle"];
    meanSqm: DeepSkyAcquisitionInterface["meanSqm"];
    meanFwhm: DeepSkyAcquisitionInterface["meanFwhm"];
    temperature: DeepSkyAcquisitionInterface["temperature"];
  }[];
}

@Component({
  selector: "astrobin-image-viewer-acquisition",
  template: `
    <ng-container *ngIf="image.solarSystemAcquisitions?.length && !image.deepSkyAcquisitions?.length">
      <div
        (click)="toggleCollapse()"
        [class.collapsed]="collapsed"
        class="metadata-header supports-collapsing d-flex justify-content-between"
      >
        <span *ngIf="currentUserWrapper$ | async as currentUserWrapper">
          {{ "Acquisition" | translate }}
          <astrobin-image-viewer-acquisition-csv-export
            *ngIf="currentUserWrapper.user?.id === image.user"
            [image]="image"
          ></astrobin-image-viewer-acquisition-csv-export>
        </span>
      </div>

      <div
        *ngIf="image.solarSystemAcquisitions?.length && !image.deepSkyAcquisitions?.length"
        class="metadata-section px-2"
        [collapsed]="collapsed"
        collapseAnimation
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

    <ng-container *ngIf="image.deepSkyAcquisitions?.length && !image.solarSystemAcquisitions?.length">
      <div
        (click)="toggleCollapse()"
        [class.collapsed]="collapsed"
        class="metadata-header supports-collapsing d-flex justify-content-between"
      >
        <span *ngIf="currentUserWrapper$ | async as currentUserWrapper">
          {{ "Integration" | translate }}
          <astrobin-image-viewer-acquisition-csv-export
            *ngIf="currentUserWrapper.user?.id === image.user"
            [image]="image"
          ></astrobin-image-viewer-acquisition-csv-export>
        </span>

        <span class="d-flex align-items-center">
          <span
            *ngIf="deepSkyIntegrationTime && collapsed"
            @fadeInOut
            [innerHTML]="deepSkyIntegrationTime"
            class="no-wrap"
          ></span>
        </span>
      </div>

      <div [collapsed]="collapsed" collapseAnimation class="metadata-section">
        <table class="table table-striped d-none d-md-table m-0">
          <tbody>
            <tr *ngFor="let filterSummary of filterSummaries">
              <td [attr.data-label]="'Filter type' | translate">
                <div class="metadata-item">
                  <div class="metadata-label">
                    <a
                      (click)="openDeepSkyIntegrationDetails($event)"
                      astrobinEventPreventDefault
                      data-toggle="offcanvas"
                    >
                      <span [class.highlight]="highlightFilterType(filterSummary.filterType)">
                        {{ humanizeFilterType(filterSummary.filterType) }}
                      </span>
                    </a>
                  </div>
                </div>
              </td>

              <td [attr.data-label]="'Frames' | translate">
                <div class="metadata-item">
                  <div class="metadata-label">
                    <ng-container *ngTemplateOutlet="deepSkyFramesTemplate; context: { $implicit: filterSummary }">
                    </ng-container>
                  </div>
                </div>
              </td>

              <td [attr.data-label]="'Integration' | translate">
                <div class="metadata-item">
                  <div class="metadata-label">
                    <span
                      [innerHTML]="imageService.formatIntegration(filterSummary.summary.totalIntegration)"
                      class="no-wrap"
                    ></span>
                  </div>
                </div>
              </td>

              <td *ngIf="dates?.length" [attr.data-label]="'Dates' | translate">
                <div class="metadata-item">
                  <div class="metadata-label">
                    <astrobin-image-viewer-acquisition-dates
                      [dates]="filterSummary.summary.dates"
                    ></astrobin-image-viewer-acquisition-dates>
                  </div>
                </div>
              </td>

              <td *ngIf="dates?.length" [attr.data-label]="'Avg. moon' | translate">
                <div class="metadata-item">
                  <div class="metadata-label">
                    <span *ngIf="filterSummary.summary.averageMoonIllumination !== null" class="no-wrap">
                      <fa-icon icon="moon"></fa-icon>
                      {{ filterSummary.summary.averageMoonIllumination | percent }}
                    </span>
                  </div>
                </div>
              </td>
            </tr>

            <tr class="totals" *ngIf="filterSummaries?.length > 1">
              <td [attr.data-label]="'Totals' | translate">
                <div class="metadata-item">
                  <div class="metadata-label">
                    <span class="no-wrap">{{ "Totals" | translate }}</span>
                  </div>
                </div>
              </td>

              <td></td>

              <td [attr.data-label]="'Integration' | translate">
                <div class="metadata-item">
                  <div class="metadata-label">
                    <span *ngIf="deepSkyIntegrationTime" [innerHTML]="deepSkyIntegrationTime" class="no-wrap"></span>

                    <span *ngIf="!deepSkyIntegrationTime">
                      {{ "n/d" | translate }}
                    </span>
                  </div>
                </div>
              </td>

              <td *ngIf="dates?.length" [attr.data-label]="'Dates' | translate">
                <div class="metadata-item">
                  <div class="metadata-label">
                    <astrobin-image-viewer-acquisition-dates
                      *ngIf="dates?.length"
                      [dates]="dates"
                    ></astrobin-image-viewer-acquisition-dates>
                  </div>
                </div>
              </td>

              <td *ngIf="dates?.length" [attr.data-label]="'Avg. moon' | translate">
                <div class="metadata-item">
                  <div class="metadata-label">
                    <span *ngIf="dates?.length && image.averageMoonIllumination !== null" class="no-wrap">
                      <fa-icon icon="moon"></fa-icon>
                      {{ image.averageMoonIllumination | percent }}
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <table class="table table-bordered d-md-none m-0">
          <tbody *ngFor="let filterSummary of filterSummaries; let last = last">
            <tr>
              <th [attr.data-label]="'Filter type' | translate">
                <div class="metadata-item">
                  <div class="metadata-label">
                    <a
                      (click)="openDeepSkyIntegrationDetails($event)"
                      astrobinEventPreventDefault
                      data-toggle="offcanvas"
                    >
                      <span [class.highlight]="highlightFilterType(filterSummary.filterType)">
                        {{ humanizeFilterType(filterSummary.filterType) }}
                      </span>
                    </a>
                  </div>
                </div>
              </th>

              <td [attr.data-label]="'Integration' | translate">
                <div class="metadata-item justify-content-end">
                  <div class="metadata-label">
                    <ng-container *ngTemplateOutlet="deepSkyFramesTemplate; context: { $implicit: filterSummary }">
                    </ng-container>

                    <span class="px-2 symbol">=</span>
                    <span
                      [innerHTML]="imageService.formatIntegration(filterSummary.summary.totalIntegration)"
                      class="no-wrap"
                    ></span>
                  </div>
                </div>
              </td>
            </tr>

            <tr></tr>

            <tr *ngIf="filterSummary.summary.dates?.length">
              <th [attr.data-label]="'Dates' | translate">
                <div class="metadata-item">
                  <div class="metadata-label">
                    <astrobin-image-viewer-acquisition-dates
                      [dates]="filterSummary.summary.dates"
                    ></astrobin-image-viewer-acquisition-dates>
                  </div>
                </div>
              </th>

              <td [attr.data-label]="'Avg. moon' | translate">
                <div class="metadata-item justify-content-end">
                  <div class="metadata-label">
                    <span *ngIf="filterSummary.summary.averageMoonIllumination !== null" class="no-wrap">
                      <fa-icon icon="moon"></fa-icon>
                      {{ filterSummary.summary.averageMoonIllumination | percent }}
                    </span>
                  </div>
                </div>
              </td>
            </tr>

            <tr *ngIf="filterSummary.summary.dates?.length && !last" class="small-spacer-row">
              <td colspan="2"></td>
            </tr>
          </tbody>

          <tbody *ngIf="filterSummaries?.length > 1">
            <tr class="small-spacer-row">
              <td colspan="2"></td>
            </tr>

            <tr class="totals">
              <td [attr.data-label]="'Totals' | translate">
                <span class="no-wrap">{{ "Totals" | translate }}</span>
              </td>
              <td [attr.data-label]="'Integration' | translate">
                <span *ngIf="deepSkyIntegrationTime" [innerHTML]="deepSkyIntegrationTime" class="no-wrap"></span>

                <span *ngIf="!deepSkyIntegrationTime">
                  {{ "n/d" | translate }}
                </span>
              </td>
            </tr>

            <tr class="totals">
              <td *ngIf="dates?.length" [attr.data-label]="'Dates' | translate">
                <astrobin-image-viewer-acquisition-dates
                  *ngIf="dates?.length"
                  [dates]="dates"
                ></astrobin-image-viewer-acquisition-dates>
              </td>
              <td *ngIf="dates?.length" [attr.data-label]="'Avg. moon' | translate">
                <span *ngIf="dates?.length && image.averageMoonIllumination !== null" class="no-wrap">
                  <fa-icon icon="moon"></fa-icon>
                  {{ image.averageMoonIllumination | percent }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>

    <ng-template #deepSkyFramesTemplate let-filterSummary>
      <span *ngIf="filterSummary.summary.number && filterSummary.summary.duration" class="no-wrap">
        <span class="number">{{ filterSummary.summary.number }}</span>
        <span class="symbol">&times;</span>
        <span class="duration">{{ filterSummary.summary.duration }}</span>
        <span class="symbol">&Prime;</span>
      </span>
      <span
        *ngIf="!filterSummary.summary.number || !filterSummary.summary.duration"
        (click)="openDeepSkyIntegrationDetails($event)"
        data-toggle="offcanvas"
      >
        <fa-icon
          [ngbTooltip]="'Mix of exposure times' | translate"
          class="d-none d-lg-inline"
          container="body"
          icon="bars-staggered"
          triggers="hover click"
        ></fa-icon>
        <span class="d-md-none">{{ "Mix of exposure times" | translate }}</span>
      </span>
    </ng-template>

    <ng-template #deepSkyIntegrationDetailsTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h4 class="offcanvas-title">{{ "Acquisition sessions" | translate }}</h4>
        <button type="button" class="btn-close" aria-label="Close" (click)="offcanvas.dismiss()"></button>
      </div>
      <div class="offcanvas-body">
        <table class="table mt-0 table-mobile-support-md">
          <ng-container *ngFor="let filterType of filterTypes; let i = index">
            <thead>
              <tr *ngIf="i > 0" class="spacer-row">
                <td colspan="3"></td>
              </tr>
              <tr>
                <th>
                  <span [class.highlight]="highlightFilterType(filterType)">
                    {{ humanizeFilterType(filterType) }}
                  </span>
                </th>
                <th class="d-lg-none"></th>
                <th>
                  <span
                    [innerHTML]="imageService.formatIntegration(detailedFilterSummaries[filterType].totalIntegration)"
                  >
                  </span>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr class="small-spacer-row d-none d-lg-block">
                <td colspan="3"></td>
              </tr>

              <tr *ngFor="let detail of detailedFilterSummaries[filterType].details">
                <td [attr.data-label]="'Date' | translate" class="date">
                  <ng-container *ngIf="detail.date">
                    {{ detail.date | date : "mediumDate" }}
                  </ng-container>
                  <ng-container *ngIf="!detail.date">
                    {{ "Unknown date" | translate }}
                  </ng-container>

                  <div
                    *ngIf="
                      (detail.binning ?? null) !== null ||
                      (detail.iso ?? null) !== null ||
                      (detail.gain ?? null) !== null ||
                      (detail.fNumber ?? null) !== null ||
                      (detail.sensorCooling ?? null) !== null ||
                      (detail.darks ?? null) !== null ||
                      (detail.flats ?? null) !== null ||
                      (detail.flatDarks ?? null) !== null ||
                      (detail.bias ?? null) !== null ||
                      (detail.bortle ?? null) !== null ||
                      (detail.meanSqm ?? null) !== null ||
                      (detail.meanFwhm ?? null) !== null ||
                      (detail.temperature ?? null) !== null
                    "
                    class="d-none d-lg-block"
                  >
                    <ng-container *ngTemplateOutlet="additionalPropertiesTemplate; context: { $implicit: detail }">
                    </ng-container>
                  </div>
                </td>

                <td [attr.data-label]="'Filter' | translate" class="d-lg-none">
                  <ng-container *ngIf="detail.name">
                    <span class="brand">{{ detail.brand }}</span>
                    <span class="name">{{ detail.name }}</span>
                  </ng-container>
                  <ng-container *ngIf="!detail.name">
                    {{ "No filter" | translate }}
                  </ng-container>
                </td>

                <td
                  *ngIf="
                    (detail.binning ?? null) !== null ||
                    (detail.iso ?? null) !== null ||
                    (detail.gain ?? null) !== null ||
                    (detail.fNumber ?? null) !== null ||
                    (detail.sensorCooling ?? null) !== null ||
                    (detail.darks ?? null) !== null ||
                    (detail.flats ?? null) !== null ||
                    (detail.flatDarks ?? null) !== null ||
                    (detail.bias ?? null) !== null ||
                    (detail.bortle ?? null) !== null ||
                    (detail.meanSqm ?? null) !== null ||
                    (detail.meanFwhm ?? null) !== null ||
                    (detail.temperature ?? null) !== null
                  "
                  [attr.data-label]="'Additional properties' | translate"
                  class="d-lg-none"
                >
                  <ng-container *ngTemplateOutlet="additionalPropertiesTemplate; context: { $implicit: detail }">
                  </ng-container>
                </td>

                <td [attr.data-label]="'Frames' | translate">
                  <span class="number">{{ detail.number }}</span>
                  <span class="times">&times;</span>
                  <span class="duration">{{ detail.duration }}&Prime;</span>
                </td>
              </tr>
            </tbody>
          </ng-container>
        </table>
      </div>

      <ng-template #additionalPropertiesTemplate let-detail>
        <div class="additional-properties">
          <span *ngIf="(detail.binning ?? null) !== null" class="iso">
            {{ "Binning" | translate }}: <span class="value">{{ detail.binning }}&times;{{ detail.binning }}</span>
          </span>

          <span *ngIf="(detail.iso ?? null) !== null" class="iso">
            ISO: <span class="value">{{ detail.iso }}</span>
          </span>

          <span *ngIf="(detail.gain ?? null) !== null" class="gain">
            Gain: <span class="value">{{ detail.gain }}</span>
          </span>

          <span *ngIf="(detail.fNumber ?? null) !== null" class="f-number">
            <span class="value">f/{{ detail.fNumber }}</span>
          </span>

          <span *ngIf="(detail.sensorCooling ?? null) !== null" class="sensor-cooling">
            {{ "Cooling" | translate }}: <span class="value">{{ detail.sensorCooling }}</span>
          </span>

          <span *ngIf="(detail.darks ?? null) !== null" class="darks">
            {{ "Darks" | translate }}: <span class="value">{{ detail.darks }}</span>
          </span>

          <span *ngIf="(detail.flats ?? null) !== null" class="flats">
            {{ "Flats" | translate }}: <span class="value">{{ detail.flats }}</span>
          </span>

          <span *ngIf="(detail.flatDarks ?? null) !== null" class="flat-darks">
            {{ "Flat darks" | translate }}: <span class="value">{{ detail.flatDarks }}</span>
          </span>

          <span *ngIf="(detail.bias ?? null) !== null" class="bias">
            {{ "Bias" | translate }}: <span class="value">{{ detail.bias }}</span>
          </span>

          <span *ngIf="(detail.bortle ?? null) !== null" class="bortle">
            Bortle: <span class="value">{{ detail.bortle }}</span>
          </span>

          <span *ngIf="(detail.meanSqm ?? null) !== null" class="mean-sqm">
            {{ "Mean SQM" | translate }}: <span class="value">{{ detail.meanSqm }}</span>
          </span>

          <span *ngIf="(detail.meanFwhm ?? null) !== null" class="mean-fwhm">
            {{ "Mean FWHM" | translate }}: <span class="value">{{ detail.meanFwhm }}</span>
          </span>

          <span *ngIf="(detail.temperature ?? null) !== null" class="temperature">
            {{ "Temperature" | translate }}: <span class="value">{{ detail.temperature }}</span>
          </span>
        </div>
      </ng-template>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-acquisition.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerAcquisitionComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  dates: string[];
  deepSkyIntegrationTime: string;
  solarSystemIntegration: string;
  filterTypes: string[];
  filterSummaries: { filterType: string; summary: FilterSummary }[] = [];
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
    public readonly windowRefService: WindowRefService,
    public readonly cookieService: CookieService,
    public readonly collapseSyncService: CollapseSyncService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    private readonly filterAcquisitionService: FilterAcquisitionService,
    private readonly imageInfoService: ImageInfoService
  ) {
    super(
      store$,
      searchService,
      router,
      imageViewerService,
      windowRefService,
      cookieService,
      collapseSyncService,
      changeDetectorRef
    );
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
    // Using filterAcquisitionService.humanizeFilterType since this particular
    // method in FilterAcquisitionService is specifically for handling filter
    // types from acquisitions, which is different from just the label.
    return this.filterAcquisitionService.humanizeFilterType(filterType);
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
      panelClass: "image-viewer-offcanvas offcanvas-deep-sky-integration-details",
      backdropClass: "image-viewer-offcanvas-backdrop",
      position: this.deviceService.offcanvasPosition()
    });
  }

  protected highlightFilterType(filterType: string): boolean {
    return (
      this.searchModel &&
      this.searchModel.filter_types &&
      this.searchModel.filter_types.value?.indexOf(filterType) !== -1
    );
  }

  private _buildFilterSummaries(): { filterType: string; summary: FilterSummary }[] {
    const filterSummaries = this.filterAcquisitionService.buildFilterSummaries(this.image, true);
    return this.filterAcquisitionService.getSortedFilterSummaries(filterSummaries);
  }

  private _buildDetailedFilterSummaries(): { [key: string]: DetailedFilterSummary } {
    const detailedFilterSummaries: { [key: string]: DetailedFilterSummary } = {};

    this.image.deepSkyAcquisitions.forEach(acquisition => {
      const filterType = this.filterAcquisitionService.determineFilterType(acquisition);
      const name = acquisition.filter2Name || acquisition.filterName;
      const brand = acquisition.filter2Brand || acquisition.filterMake || this.translateService.instant("DIY");
      const date = acquisition.date;
      const duration = parseFloat(acquisition.duration).toFixed(2).replace(".00", "");
      const binning = acquisition.binning;
      const iso = acquisition.iso;
      const gain = acquisition.gain;
      const fNumber = acquisition.fNumber;
      const sensorCooling = acquisition.sensorCooling;
      const darks = acquisition.darks;
      const flats = acquisition.flats;
      const flatDarks = acquisition.flatDarks;
      const bias = acquisition.bias;
      const bortle = acquisition.bortle;
      const meanSqm = acquisition.meanSqm;
      const meanFwhm = acquisition.meanFwhm;
      const temperature = acquisition.temperature;
      const key = `
        ${date}_
        ${brand}_
        ${name || "UNKNOWN"}_
        ${duration}_
        ${binning || "UNKNOWN"}_
        ${iso || "UNKNOWN"}_
        ${gain || "UNKNOWN"}_
        ${fNumber || "UNKNOWN"}_
        ${sensorCooling || "UNKNOWN"}_
        ${darks || "UNKNOWN"}_
        ${flats || "UNKNOWN"}_
        ${flatDarks || "UNKNOWN"}_
        ${bias || "UNKNOWN"}_
        ${bortle || "UNKNOWN"}_
        ${meanSqm || "UNKNOWN"}_
        ${meanFwhm || "UNKNOWN"}_
        ${temperature || "UNKNOWN"}
      `;

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
          duration,
          binning,
          iso,
          gain,
          fNumber,
          sensorCooling,
          darks,
          flats,
          flatDarks,
          bias,
          bortle,
          meanSqm,
          meanFwhm,
          temperature
        });
      }

      detailedFilterSummaries[filterType].totalIntegration += acquisition.number * parseFloat(acquisition.duration);
    });

    return detailedFilterSummaries;
  }
}
