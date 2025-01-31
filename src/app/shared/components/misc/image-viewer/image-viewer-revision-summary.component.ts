import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { ImageRevisionInterface } from "@core/interfaces/image.interface";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { SearchService } from "@core/services/search.service";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { CookieService } from "ngx-cookie";
import { CollapseSyncService } from "@core/services/collapse-sync.service";

@Component({
  selector: "astrobin-image-viewer-revision-summary",
  template: `
    <div
      (click)="toggleCollapse()"
      [class.collapsed]="collapsed"
      class="metadata-header supports-collapsing"
    >
      {{ "Revision" | translate }} {{ revision.label }}
    </div>

    <div
      [collapsed]="collapsed"
      collapseAnimation
      class="metadata-section"
    >
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
  styleUrls: ["./image-viewer-revision-summary.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerRevisionSummaryComponent extends ImageViewerSectionBaseComponent {
  @Input() revision: ImageRevisionInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService,
    public readonly cookieService: CookieService,
    public readonly collapseSyncService: CollapseSyncService,
    public readonly changeDetectorRef: ChangeDetectorRef
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
}
