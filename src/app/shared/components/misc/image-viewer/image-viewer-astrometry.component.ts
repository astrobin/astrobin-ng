import { Component, OnChanges, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { ImageService } from "@shared/services/image/image.service";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { WindowRefService } from "@shared/services/window-ref.service";
import { AstroUtilsService } from "@shared/services/astro-utils/astro-utils.service";
import { SearchCoordsFilterComponent } from "@features/search/components/filters/search-coords-filter/search-coords-filter.component";

@Component({
  selector: "astrobin-image-viewer-astrometry",
  template: `
    <div *ngIf="image?.solution" class="metadata-section">
      <div *ngIf="celestialHemisphere" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon
            [ngbTooltip]="'Celestial hemisphere' | translate"
            triggers="hover click"
            container="body"
            icon="globe"
          ></fa-icon>
        </div>
        <div class="metadata-label">
          {{ celestialHemisphere }}
        </div>
      </div>

      <div *ngIf="constellation" class="metadata-item">
        <div class="metadata-icon">
          <img
            [ngbTooltip]="'Constellation' | translate"
            triggers="hover click"
            container="body"
            src="/assets/images/subject-types/constellation-white.png?v=1"
            alt=""
          />
        </div>
        <div (click)="constellationClicked($event, constellation)" class="metadata-link search">
          {{ constellation }}
        </div>
      </div>

      <div *ngIf="coordinates" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon
            [ngbTooltip]="'Coordinates' | translate"
            triggers="hover click"
            container="body"
            icon="crosshairs"
          ></fa-icon>
        </div>
        <div class="metadata-label">
          <span
            (click)="openFindImagesInTheSameArea()"
            [innerHTML]="coordinates"
            astrobinEventPreventDefault
            class="coordinates"
            data-toggle="offcanvas"
          >
          </span>
        </div>
      </div>

      <div *ngIf="fieldRadius" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon
            [ngbTooltip]="'Field radius' | translate"
            triggers="hover click"
            container="body"
            icon="arrows-left-right-to-line"
          ></fa-icon>
        </div>
        <div [innerHTML]="fieldRadius" class="metadata-label">
        </div>
      </div>

      <div *ngIf="pixelScale" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon
            [ngbTooltip]="'Pixel scale' | translate"
            triggers="hover click"
            container="body"
            icon="square"
          ></fa-icon>
        </div>
        <div [innerHTML]="pixelScale" class="metadata-label">
        </div>
      </div>

      <div class="metadata-item">
        <div class="metadata-icon">
          <fa-icon
            [ngbTooltip]="'More info' | translate"
            triggers="hover"
            container="body"
            (click)="openMoreInfo($event)"
            data-toggle="offcanvas"
            icon="circle-info"
          ></fa-icon>
        </div>
      </div>
    </div>

    <ng-template #moreInfoTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h4 class="offcanvas-title">{{ "Astrometry details" | translate }}</h4>
        <button type="button" class="btn-close" aria-label="Close" (click)="offcanvas.dismiss()"></button>
      </div>
      <div class="offcanvas-body offcanvas-users">
        <table class="table table-striped">
          <tbody>
          <tr *ngIf="celestialHemisphere">
            <th>{{ "Celestial hemisphere" | translate }}</th>
            <td>{{ celestialHemisphere }}</td>
          </tr>
          <tr *ngIf="constellation">
            <th>{{ "Constellation" | translate }}</th>
            <td>{{ constellation }}</td>
          </tr>
          <tr *ngIf="coordinates">
            <th>{{ "Coordinates" | translate }}</th>
            <td [innerHTML]="coordinates"></td>
          </tr>
          <tr *ngIf="fieldRadius">
            <th>{{ "Field radius" | translate }}</th>
            <td [innerHTML]="fieldRadius"></td>
          </tr>
          <tr *ngIf="pixelScale">
            <th>{{ "Pixel scale" | translate }}</th>
            <td [innerHTML]="pixelScale"></td>
          </tr>
          <tr *ngIf="orientation">
            <th>{{ "Orientation" | translate }}</th>
            <td [innerHTML]="orientation"></td>
          </tr>
          <tr *ngIf="astrometryNetJobId">
            <th>Astrometry.net ID</th>
            <td>
              <a
                [href]="'https://nova.astrometry.net/status/' + astrometryNetJobId"
                [innerHTML]="astrometryNetJobId"
                target="_blank"
              ></a>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </ng-template>

    <ng-template #findImagesInTheSameAreaOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h4 class="offcanvas-title">{{ "Find images in the same area" | translate }}</h4>
        <button type="button" class="btn-close" aria-label="Close" (click)="offcanvas.dismiss()"></button>
      </div>
      <div class="offcanvas-body">
        <p>
          {{
            "Select how many degrees around the center coordinates you'd like to search for astro images, " +
            "ranging from 1 to 5 degrees." | translate
          }}
        </p>
        <div class="degree-choices d-flex flex-nowrap gap-3 mt-4">
          <button
            *ngFor="let degree of [1, 2, 3, 4, 5]"
            (click)="findImagesInTheSameArea(degree)"
            astrobinEventPreventDefault
            class="btn btn-outline-secondary m-0 p-2"
          >
            <span class="symbol">±</span><span class="value">{{ degree }}</span><span class="symbol">°</span>
          </button>
        </div>
      </div>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-astrometry.component.scss"]
})
export class ImageViewerAstrometryComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  revision: ImageInterface | ImageRevisionInterface;
  celestialHemisphere: string;
  constellation: string;
  coordinates: string;
  fieldRadius: string;
  pixelScale: string;
  orientation: string;
  astrometryNetJobId: string;

  @ViewChild("moreInfoTemplate")
  moreInfoTemplate: TemplateRef<any>;

  @ViewChild("findImagesInTheSameAreaOffcanvas")
  findImagesInTheSameAreaOffcanvas: TemplateRef<any>;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly imageService: ImageService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly windowRefService: WindowRefService,
    public readonly astroUtilsService: AstroUtilsService,
  ) {
    super(store$, searchService, router, imageViewerService, windowRefService);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.image && changes.image.currentValue || changes.revisionLabel && changes.revisionLabel.currentValue) {
      const image = this.image;
      this.revision = this.imageService.getRevision(image, this.revisionLabel);
      this.celestialHemisphere = this.imageService.getCelestialHemisphere(image, this.revisionLabel);
      this.constellation = this.imageService.getConstellation(image, this.revisionLabel);
      this.coordinates = this.imageService.getCoordinates(image, this.revisionLabel);
      this.fieldRadius = this.imageService.getFieldRadius(image, this.revisionLabel);
      this.pixelScale = this.imageService.getPixelScale(image, this.revisionLabel);
      this.orientation = this.imageService.getOrientation(image, this.revisionLabel);
      this.astrometryNetJobId = this.revision?.solution?.submissionId?.toString();
    }
  }

  constellationClicked(event: MouseEvent, constellation: string): void {
    event.preventDefault();

    this.search({ constellation });
  }

  openMoreInfo(event: MouseEvent): void {
    event.preventDefault();
    this.offcanvasService.open(this.moreInfoTemplate, {
      panelClass: "offcanvas-more-info",
      position: this.deviceService.offcanvasPosition()
    });
  }

  openFindImagesInTheSameArea(): void {
    this.offcanvasService.open(this.findImagesInTheSameAreaOffcanvas, {
      panelClass: "offcanvas-find-images-in-the-same-area",
      position: this.deviceService.offcanvasPosition()
    });
  }

  findImagesInTheSameArea(degree: number): void {
    this.offcanvasService.dismiss();

    const minimumSubscription = SearchCoordsFilterComponent.minimumSubscription;

    this.searchService.allowFilter$(minimumSubscription).subscribe(allow => {
      if (allow) {
        this._doFindImagesInTheSameArea(degree);
      } else {
        this.searchService.openSubscriptionRequiredModal(minimumSubscription);
      }
    });
  }

  private _doFindImagesInTheSameArea(degrees: number): void {
    const ra = parseFloat(this.revision.solution.advancedRa || this.revision.solution.ra);
    const dec = parseFloat(this.revision.solution.advancedDec || this.revision.solution.dec);

    const raMin = this.astroUtilsService.raDegreesToMinutes(Math.max(ra - degrees, 0));
    const raMax = this.astroUtilsService.raDegreesToMinutes(Math.min(ra + degrees, 360));
    const decMin = Math.max(dec - degrees, -90);
    const decMax = Math.min(dec + degrees, 90);

    this.search({
      coords: {
        ra: {
          min: raMin,
          max: raMax
        },
        dec: {
          min: decMin,
          max: decMax
        }
      },
      field_radius: {
        min: 0,
        max: degrees
      }
    });
  }
}
