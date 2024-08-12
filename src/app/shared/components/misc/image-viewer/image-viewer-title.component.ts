import { Component, OnChanges, SimpleChanges } from "@angular/core";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { ImageService } from "@shared/services/image/image.service";

@Component({
  selector: "astrobin-image-viewer-title",
  template: `
    <h2>
      {{ image.title }}

      <small *ngIf="resolution || size">
        <span *ngIf="resolution" class="resolution" [innerHTML]="resolution"></span>
        <span *ngIf="size" class="file-size" [innerHTML]="size | filesize"></span>
      </small>
    </h2>
  `,
  styles: [`
    h2 {
      font-size: 1.33rem;
      padding-bottom: .75rem;
      border-bottom: 1px solid rgba(255, 255, 255, .1);
    }

    small {
      font-size: .75rem;
      color: var(--lightGrey);
      margin-left: .5rem;
      display: inline-block;
      vertical-align: middle;

      .resolution {
        margin-right: .5rem;
      }
    }
  `]
})
export class ImageViewerTitleComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  resolution: string;
  size: number;

  public constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly imageService: ImageService
  ) {
    super(store$, searchService, router, imageViewerService);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.image && changes.image.currentValue || changes.revisionLabel && changes.revisionLabel.currentValue) {
      this.setResolutionAndFileSize(this.image, this.revisionLabel);
    }
  }

  setResolutionAndFileSize(image: ImageInterface, revisionLabel: ImageRevisionInterface["label"]): void {
    const revision = this.imageService.getRevision(image, revisionLabel);
    this.resolution = `${revision.w}&times;${revision.h}`;
    this.size = revision.uploaderUploadLength;
  }
}
