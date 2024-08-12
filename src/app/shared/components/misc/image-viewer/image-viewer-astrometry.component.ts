import { Component, OnChanges, SimpleChanges } from "@angular/core";
import { ImageService } from "@shared/services/image/image.service";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { SolutionService } from "@shared/services/solution/solution.service";

@Component({
  selector: "astrobin-image-viewer-astrometry",
  template: `
    <div *ngIf="image?.solution" class="metadata-section">
      <div *ngIf="celestialHemisphere" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon icon="globe"></fa-icon>
        </div>
        <div class="metadata-label">
          {{ celestialHemisphere }}
        </div>
      </div>

      <div *ngIf="constellation" class="metadata-item">
        <div class="metadata-icon">
          <img src="/assets/images/subject-types/constellation-white.png?v=1" alt="" />
        </div>
        <div (click)="constellationClicked($event, constellation)" class="metadata-link">
          {{ constellation }}
        </div>
      </div>

      <div *ngIf="coordinates" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon icon="crosshairs"></fa-icon>
        </div>
        <div [innerHTML]="coordinates" class="metadata-label coordinates">
        </div>
      </div>

      <div *ngIf="fieldRadius" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon icon="circle-notch"></fa-icon>
        </div>
        <div [innerHTML]="fieldRadius" class="metadata-label">
        </div>
      </div>

      <div *ngIf="pixelScale" class="metadata-item">
        <div class="metadata-icon">
          &middot;
        </div>
        <div [innerHTML]="pixelScale" class="metadata-label">
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
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./image-viewer-astrometry.component.scss"]
})
export class ImageViewerAstrometryComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  celestialHemisphere: string;
  constellation: string;
  coordinates: string;
  fieldRadius: string;
  pixelScale: string;
  objectsInField: string[];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly imageService: ImageService,
    public readonly solutionService: SolutionService
  ) {
    super(store$, searchService, router, imageViewerService);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.image && changes.image.currentValue || changes.revisionLabel && changes.revisionLabel.currentValue) {
      const image = changes.image.currentValue;
      this.celestialHemisphere = this.imageService.getCelestialHemisphere(image, this.revisionLabel);
      this.constellation = this.imageService.getConstellation(image, this.revisionLabel);
      this.coordinates = this.imageService.getCoordinates(image, this.revisionLabel);
      this.fieldRadius = this.imageService.getFieldRadius(image, this.revisionLabel);
      this.pixelScale = this.imageService.getPixelScale(image, this.revisionLabel);
      this.objectsInField = this.solutionService.getObjectsInField(
        this.imageService.getFinalRevision(this.image).solution
      );
    }
  }

  constellationClicked(event: MouseEvent, constellation: string): void {
    event.preventDefault();

    this.search({ constellation });
  }

  objectInFieldClicked(event: MouseEvent, subject: string): void {
    event.preventDefault();
    this.search({ subject });
  }
}
