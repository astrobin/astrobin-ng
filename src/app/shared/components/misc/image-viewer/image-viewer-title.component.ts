import { Component, OnChanges, SimpleChanges } from "@angular/core";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { ImageViewerService } from "@shared/services/image-viewer.service";

@Component({
  selector: "astrobin-image-viewer-title",
  template: `
    <h2>{{ image.title }}</h2>
  `,
  styles: [`
    h2 {
      font-size: 1.33rem;
      padding-bottom: .75rem;
      border-bottom: 1px solid rgba(255, 255, 255, .1);
    }
  `]
})
export class ImageViewerTitleComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  public constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService
  ) {
    super(store$, searchService, router, imageViewerService);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.image && changes.image.currentValue) {
    }
  }
}
