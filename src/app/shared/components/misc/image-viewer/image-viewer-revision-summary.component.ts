import { Component, Input } from "@angular/core";
import { ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { WindowRefService } from "@shared/services/window-ref.service";

@Component({
  selector: "astrobin-image-viewer-revision-summary",
  template: `
    <div class="metadata-header">
      {{ "Revision" | translate }} {{ revision.label }}
    </div>

    <div class="metadata-section">
      <div class="metadata-item">
        <div class="metadata-label">
          <div class="revision-summary">
            <div *ngIf="revision.title">
              <strong>{{ "Title" | translate }}</strong>
              {{ revision.title }}
            </div>

            <div *ngIf="revision.description">
              <strong>{{ "Description" | translate }}</strong>
              {{ revision.description }}
            </div>

            <div *ngIf="revision.uploaded">
              <strong>{{ "Published" | translate }}</strong>
              {{ revision.uploaded | date: "medium" }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./image-viewer-revision-summary.component.scss"]
})
export class ImageViewerRevisionSummaryComponent extends ImageViewerSectionBaseComponent {
  @Input() revision: ImageRevisionInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService,
  ) {
    super(store$, searchService, router, imageViewerService, windowRefService);
  }
}
