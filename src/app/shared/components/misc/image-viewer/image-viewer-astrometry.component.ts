import { Component, OnChanges, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { ImageService } from "@shared/services/image/image.service";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { SolutionService } from "@shared/services/solution/solution.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { WindowRefService } from "@shared/services/window-ref.service";

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
        <div (click)="constellationClicked($event, constellation)" class="metadata-link">
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
        <div [innerHTML]="coordinates" class="metadata-label coordinates">
        </div>
      </div>

      <div *ngIf="fieldRadius" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon
            [ngbTooltip]="'Field radius' | translate"
            triggers="hover click"
            container="body"
            icon="circle-notch"
          ></fa-icon>
        </div>
        <div [innerHTML]="fieldRadius" class="metadata-label">
        </div>
      </div>

      <div *ngIf="pixelScale" class="metadata-item">
        <fa-icon
          [ngbTooltip]="'Pixel scale' | translate"
          triggers="hover click"
          container="body"
          icon="square"
        ></fa-icon>
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

    <div *ngIf="objectsInField?.length > 0" class="metadata-section">
      <div class="metadata-item objects-in-field">
        <div class="metadata-icon">
          <fa-icon icon="binoculars"></fa-icon>
        </div>

        <div class="metadata-label">
          <a
            *ngFor="let item of objectsInField"
            (click)="objectInFieldClicked($event, item)"
            href="#"
            class="value"
          >
            <span class="name" [innerHTML]="item"></span>
          </a>

          <a
            *ngIf="moreObjectsInField?.length > 0"
            (click)="moreObjectsInFieldClicked($event)"
            href="#"
            class="value more"
          >
            {{ "+ {{count}} more" | translate: { count: moreObjectsInField.length } }}
          </a>
        </div>
      </div>
    </div>

    <ng-template #moreObjectsInFieldTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h4 class="offcanvas-title">{{ "Additional objects in this field" | translate }}</h4>
        <button type="button" class="btn-close" aria-label="Close" (click)="offcanvas.dismiss()"></button>
      </div>
      <div class="offcanvas-body">
        <ul>
          <li *ngFor="let item of moreObjectsInField">
            <a (click)="objectInFieldClicked($event, item)" href="#" class="value">
              <span class="name" [innerHTML]="item"></span>
            </a>
          </li>
        </ul>
      </div>
    </ng-template>

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
  objectsInField: string[];
  moreObjectsInField: string[];

  @ViewChild("moreInfoTemplate")
  moreInfoTemplate: TemplateRef<any>;

  @ViewChild("moreObjectsInFieldTemplate")
  moreObjectsInFieldTemplate: TemplateRef<any>;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly imageService: ImageService,
    public readonly solutionService: SolutionService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly windowRefService: WindowRefService
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
      this.objectsInField = this.solutionService.getObjectsInField(this.revision.solution);
      this.moreObjectsInField = this.objectsInField.slice(10);
      this.objectsInField = this.objectsInField.slice(0, 10);
      this.astrometryNetJobId = this.revision?.solution?.submissionId?.toString();
    }
  }

  constellationClicked(event: MouseEvent, constellation: string): void {
    event.preventDefault();

    this.search({ constellation });
  }

  objectInFieldClicked(event: MouseEvent, subject: string): void {
    event.preventDefault();
    this.offcanvasService.dismiss();
    this.search({ subject });
  }

  moreObjectsInFieldClicked(event: MouseEvent): void {
    event.preventDefault();
    const position = this.deviceService.mdMax() ? "bottom" : "end";
    this.offcanvasService.open(this.moreObjectsInFieldTemplate, {
      panelClass: "offcanvas-more-objects-in-field",
      position
    });
  }

  openMoreInfo(event: MouseEvent): void {
    event.preventDefault();
    const position = this.deviceService.mdMax() ? "bottom" : "end";
    this.offcanvasService.open(this.moreInfoTemplate, {
      panelClass: "offcanvas-more-info",
      position
    });
  }
}
