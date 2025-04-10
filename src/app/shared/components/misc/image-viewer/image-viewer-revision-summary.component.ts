import type { OnChanges } from "@angular/core";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import type { MainState } from "@app/store/state";
import type { ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";
import { CollapseSyncService } from "@core/services/collapse-sync.service";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { SearchService } from "@core/services/search.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { CookieService } from "ngx-cookie";

@Component({
  selector: "astrobin-image-viewer-revision-summary",
  template: `
    <div (click)="toggleCollapse()" [class.collapsed]="collapsed" class="metadata-header supports-collapsing">
      {{ "Revision" | translate }}: {{ label }}
    </div>

    <div [collapsed]="collapsed" collapseAnimation class="metadata-section">
      <div class="metadata-item">
        <div class="metadata-label">
          <div class="revision-summary">
            <div *ngIf="isRevision && revision.title">
              <strong>{{ "Title" | translate }}</strong>
              {{ revision.title }}
            </div>

            <div *ngIf="isRevision && revision.description">
              <strong>{{ "Description" | translate }}</strong>
              {{ revision.description }}
            </div>

            <div *ngIf="published">
              <strong>{{ "Published" | translate }}</strong>
              {{ published | date : "medium" }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ["./image-viewer-revision-summary.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerRevisionSummaryComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  @Input() revision: ImageInterface | ImageRevisionInterface;

  protected isRevision: boolean;
  protected label: string;
  protected published: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService,
    public readonly cookieService: CookieService,
    public readonly collapseSyncService: CollapseSyncService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly translateService: TranslateService
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

  ngOnChanges() {
    this.isRevision = this.revision.hasOwnProperty("label");

    if (this.isRevision) {
      this.label = (this.revision as ImageRevisionInterface).label;
    } else {
      this.label = this.translateService.instant("Original");
    }

    if (this.isRevision) {
      this.published = (this.revision as ImageRevisionInterface).uploaded;
    } else {
      this.published = (this.revision as ImageInterface).published || (this.revision as ImageInterface).uploaded;
    }
  }
}
