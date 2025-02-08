import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { SearchService } from "@core/services/search.service";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { CookieService } from "ngx-cookie";
import { CollapseSyncService } from "@core/services/collapse-sync.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-image-viewer-revision-summary",
  template: `
    <div
      (click)="toggleCollapse()"
      [class.collapsed]="collapsed"
      class="metadata-header supports-collapsing"
    >
      {{ "Revision" | translate }}: {{ label }}
    </div>

    <div
      [collapsed]="collapsed"
      collapseAnimation
      class="metadata-section"
    >
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

            <div *ngIf="isRevision && revision.uploaded">
              <strong>{{ "Published" | translate }}</strong>
              {{ revision.uploaded | date: "medium" }}
            </div>

            <div *ngIf="!isRevision && (revision.published || revision.uploaded)">
              <strong>{{ "Published" | translate }}</strong>
              {{ (revision.published || revision.uploaded) | date: "medium" }}
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

  ngOnChanges(changes: SimpleChanges) {
    this.isRevision =this.revision.hasOwnProperty("label");

    if (this.isRevision) {
      this.label = (this.revision as ImageRevisionInterface).label
    } else {
      this.label = this.translateService.instant("Original");
    }
  }
}
