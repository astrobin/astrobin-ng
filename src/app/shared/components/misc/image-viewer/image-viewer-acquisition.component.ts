import { Component, OnChanges, SimpleChanges } from "@angular/core";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { DeepSkyAcquisitionInterface } from "@shared/interfaces/deep-sky-acquisition.interface";
import { ImageService } from "@shared/services/image/image.service";

@Component({
  selector: "astrobin-image-viewer-acquisition",
  template: `
    <div *ngIf="image.deepSkyAcquisitions?.length || image.solarSystemAcquisitions?.length" class="metadata-section">
      <div *ngIf="dates?.length" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon icon="calendar"></fa-icon>
        </div>
        <div class="metadata-label">
          <astrobin-image-viewer-acquisition-dates [dates]="dates"></astrobin-image-viewer-acquisition-dates>
        </div>
      </div>

      <div *ngIf="image.deepSkyAcquisitions?.length" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon icon="clock"></fa-icon>
        </div>
        <div class="metadata-label" [innerHTML]="deepSkyIntegrationTime">
        </div>
      </div>
    </div>
  `,
  styles: [`
  `]
})
export class ImageViewerAcquisitionComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  dates: string[];
  deepSkyIntegrationTime: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly imageService: ImageService
  ) {
    super(store$, searchService, router, imageViewerService);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.image && changes.image.currentValue) {
      const image: ImageInterface = changes.image.currentValue;
      const deepSkyDates = image.deepSkyAcquisitions.map(acquisition => acquisition.date);
      const solarSystemDates = image.solarSystemAcquisitions.map(acquisition => acquisition.date);

      this.setDates([...deepSkyDates, ...solarSystemDates].filter(date => !!date));
      this.setDeepSkyIntegrationTime(image);
    }
  }

  setDates(dates: string[]) {
    this.dates = dates;
  }

  setDeepSkyIntegrationTime(image: ImageInterface) {
    this.deepSkyIntegrationTime = this.imageService.getDeepSkyIntegration(image);
  }
}
