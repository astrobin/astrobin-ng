import type { ChangeDetectorRef, OnChanges, SimpleChanges, TemplateRef } from "@angular/core";
import { ChangeDetectionStrategy, Component, ViewChild } from "@angular/core";
import type { Router } from "@angular/router";
import type { MainState } from "@app/store/state";
import type { ImageInterface, ImageRevisionInterface } from "@core/interfaces/image.interface";
import type { CollapseSyncService } from "@core/services/collapse-sync.service";
import type { DeviceService } from "@core/services/device.service";
import type { ImageService } from "@core/services/image/image.service";
import type { ImageViewerService } from "@core/services/image-viewer.service";
import type { SearchService } from "@core/services/search.service";
import type { SolutionService } from "@core/services/solution/solution.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import type { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import type { CookieService } from "ngx-cookie";

@Component({
  selector: "astrobin-image-viewer-objects",
  template: `
    <div
      *ngIf="objectsInField?.length > 0"
      (click)="toggleCollapse()"
      [class.collapsed]="collapsed"
      class="metadata-header supports-collapsing"
    >
      {{ "Objects" | translate }}
    </div>

    <div
      *ngIf="objectsInField?.length > 0"
      [collapsed]="collapsed"
      collapseAnimation
      class="metadata-section bg-transparent"
    >
      <div class="metadata-item objects-in-field">
        <div class="metadata-label flex-wrap">
          <a *ngFor="let item of objectsInField" (click)="objectInFieldClicked($event, item)" href="#" class="value">
            <span class="name" [innerHTML]="item | highlight : highlightTerms"></span>
          </a>

          <a
            *ngIf="moreObjectsInField?.length > 0"
            (click)="moreObjectsInFieldClicked($event)"
            href="#"
            class="value more"
          >
            {{ "+ {{ count }} more" | translate: { count: moreObjectsInField.length } }}
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
        <ul class="flex-wrap">
          <li *ngFor="let item of moreObjectsInField">
            <a (click)="objectInFieldClicked($event, item)" href="#" class="value">
              <span class="name" [innerHTML]="item | highlight : highlightTerms"></span>
            </a>
          </li>
        </ul>
      </div>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-objects.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerObjectsComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  protected revision: ImageInterface | ImageRevisionInterface;
  protected objectsInField: string[];
  protected moreObjectsInField: string[];
  protected highlightTerms: string;

  @ViewChild("moreObjectsInFieldTemplate")
  protected moreObjectsInFieldTemplate: TemplateRef<any>;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly imageService: ImageService,
    public readonly solutionService: SolutionService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
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

  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes.image && changes.image.currentValue) ||
      (changes.revisionLabel && changes.revisionLabel.currentValue)
    ) {
      const image = this.image;
      this.revision = this.imageService.getRevision(image, this.revisionLabel);
      this.objectsInField = this.solutionService.getObjectsInField(this.revision.solution);
      this.moreObjectsInField = this.objectsInField.slice(10);
      this.objectsInField = this.objectsInField.slice(0, 10);
    }

    if (changes.searchModel && changes.searchModel.currentValue) {
      this.highlightTerms = "";

      if (this.searchModel.text?.value) {
        this.highlightTerms = this.searchModel.text.value;
      }

      if (this.searchModel.subjects?.value) {
        this.highlightTerms = " " + this.searchModel.subjects.value.join(" ");
      }
    }
  }

  objectInFieldClicked(event: MouseEvent, subject: string): void {
    event.preventDefault();
    this.offcanvasService.dismiss();
    this.search({
      subjects: {
        value: [subject],
        matchType: null
      }
    });
  }

  moreObjectsInFieldClicked(event: MouseEvent): void {
    event.preventDefault();
    this.offcanvasService.open(this.moreObjectsInFieldTemplate, {
      panelClass: "image-viewer-offcanvas offcanvas-more-objects-in-field",
      backdropClass: "image-viewer-offcanvas-backdrop",
      position: this.deviceService.offcanvasPosition()
    });
  }
}
