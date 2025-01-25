import { ChangeDetectionStrategy, Component, OnChanges, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
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
  selector: "astrobin-image-viewer-objects",
  template: `
    <div *ngIf="objectsInField?.length > 0" class="metadata-header">{{ "Objects" | translate }}</div>
    <div *ngIf="objectsInField?.length > 0" class="metadata-section bg-transparent">
      <div class="metadata-item objects-in-field">
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
        <ul>
          <li *ngFor="let item of moreObjectsInField">
            <a (click)="objectInFieldClicked($event, item)" href="#" class="value">
              <span class="name" [innerHTML]="item"></span>
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
  revision: ImageInterface | ImageRevisionInterface;
  objectsInField: string[];
  moreObjectsInField: string[];

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
      this.objectsInField = this.solutionService.getObjectsInField(this.revision.solution);
      this.moreObjectsInField = this.objectsInField.slice(10);
      this.objectsInField = this.objectsInField.slice(0, 10);
    }
  }

  objectInFieldClicked(event: MouseEvent, subject: string): void {
    event.preventDefault();
    this.offcanvasService.dismiss();
    this.search({
      subjects: {
        value: [
          subject
        ],
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
