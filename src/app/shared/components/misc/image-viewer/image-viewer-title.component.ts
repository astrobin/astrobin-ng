import { Component, OnChanges, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { ImageService } from "@shared/services/image/image.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";

@Component({
  selector: "astrobin-image-viewer-title",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">

      <div class="image-viewer-title d-flex flex-row justify-content-between align-items-start gap-2">
        <h2 class="flex-grow-1 mb-0 text-center text-sm-start">
          {{ image.title }}

          <small
            *ngIf="currentUserWrapper.user?.id === image.user && image.uploaderName"
            class="justify-content-center justify-content-sm-start"
          >
            <span class="original-filename" [innerHTML]="image.uploaderName"></span>
          </small>

          <small class="justify-content-center justify-content-sm-start">
            <span *ngIf="publicationDate">
              <fa-icon
                *ngIf="licenseIcon && licenseTooltip"
                [icon]="licenseIcon"
                [ngbTooltip]="licenseTooltip"
                triggers="hover click"
                container="body"
                class="license-icon"
              ></fa-icon>
              {{ publicationDate | localDate | timeago:true }}
            </span>

            <span class="view-count">
              <span *ngIf="image.viewCount === 0" [translate]="'No views'"></span>
              <span *ngIf="image.viewCount === 1" [translate]="'One view'"></span>
              <span
                *ngIf="image.viewCount > 1"
                [translateParams]="{ '0': image.viewCount | numberSuffix }"
                [translate]="'{{0}} views'"
              ></span>
            </span>

            <span *ngIf="resolution" class="resolution" [innerHTML]="resolution"></span>

            <span *ngIf="size" class="file-size" [innerHTML]="size | filesize"></span>
          </small>

          <div class="iotd-tp">
            <div
              *ngIf="!image.iotdDate && (image.isTopPick || image.isTopPickNomination)"
            >
              <span
                *ngIf="!image.iotdDate && image.isTopPick"
                class="top-pick"
              >
                <span class="label">
                  <fa-icon icon="star"></fa-icon>
                  {{ "Top Pick" | translate }}
                </span>
                <ng-container [ngTemplateOutlet]="iotdInfoLinkTemplate"></ng-container>
              </span>

              <span
                *ngIf="!image.iotdDate && !image.isTopPick && image.isTopPickNomination"
                class="top-pick-nomination"
              >
                <span class="label">
                  <fa-icon icon="arrow-up"></fa-icon>
                  {{ "Top Pick Nomination" | translate }}
                </span>
                <ng-container [ngTemplateOutlet]="iotdInfoLinkTemplate"></ng-container>
              </span>
            </div>

            <span
              *ngIf="currentUserWrapper.user?.id === image.user && !image.iotdDate && !image.isTopPick && !image.isTopPickNomination && image.isInIotdQueue"
              class="in-iotd-queue"
            >
              <span class="label">
                <fa-icon icon="gavel"></fa-icon>
                {{ "Currently in the IOTD/TP queues" | translate }}
              </span>

              <a
                (click)="viewIotdTpStats()"
                astrobinEventPreventDefault
                astrobinEventStopPropagation
                class="ms-2"
                href="#"
              >
                <fa-icon icon="info-circle"></fa-icon>
              </a>
            </span>
          </div>
        </h2>

        <div ngbDropdown class="dropdown w-auto d-none d-md-block mt-1">
          <fa-icon
            ngbDropdownToggle
            icon="ellipsis-v"
            class="dropdown-toggle no-toggle"
            aria-haspopup="true"
            aria-expanded="false"
          ></fa-icon>
          <div ngbDropdownMenu class="dropdown-menu">
            <astrobin-image-viewer-menu
              [image]="image"
              [revisionLabel]="revisionLabel"
              itemClass="dropdown-item"
              dividerClass="dropdown-divider"
            ></astrobin-image-viewer-menu>
          </div>
        </div>

        <astrobin-image-viewer-share-button
          [image]="image"
          [revisionLabel]="revisionLabel"
          class="d-none d-md-block p-1 pe-0"
        ></astrobin-image-viewer-share-button>
      </div>
    </ng-container>

    <ng-template #iotdInfoLinkTemplate>
      <a
        href="https://welcome.astrobin.com/iotd"
        class="ms-2 no-external-link-icon"
        rel="noopener"
        target="_blank"
      >
        <fa-icon icon="info-circle"></fa-icon>
      </a>
    </ng-template>

    <ng-template #viewIotdTpStatsOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">
          {{ "IOTD/TP stats" | translate }}
          <fa-icon icon="lock" class="ms-2"></fa-icon>
        </h5>
        <button type="button" class="btn-close" (click)="offcanvas.dismiss()"></button>
      </div>
      <div class="offcanvas-body">
        <astrobin-image-viewer-iotd-tp-stats
          [image]="image"
        ></astrobin-image-viewer-iotd-tp-stats>
      </div>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-title.component.scss"]
})
export class ImageViewerTitleComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  @ViewChild("viewIotdTpStatsOffcanvas") viewIotdTpStatsOffcanvas: TemplateRef<any>;

  protected resolution: string;
  protected size: number;
  protected publicationDate: string;
  protected licenseIcon: IconProp;
  protected licenseTooltip: string;

  public constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly imageService: ImageService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly windowRefService: WindowRefService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService
  ) {
    super(store$, searchService, router, imageViewerService, windowRefService);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.image && changes.image.currentValue || changes.revisionLabel && changes.revisionLabel.currentValue) {
      this.setResolutionAndFileSize(this.image, this.revisionLabel);
      this.setPublicationDate(this.image);
      this.setLicenseIconAndTooltip(this.image);
    }
  }

  setResolutionAndFileSize(image: ImageInterface, revisionLabel: ImageRevisionInterface["label"]): void {
    const revision = this.imageService.getRevision(image, revisionLabel);
    this.resolution = `${revision.w}&times;${revision.h}`;
    this.size = revision.uploaderUploadLength;
  }

  setPublicationDate(image: ImageInterface): void {
    this.publicationDate = this.imageService.getPublicationDate(image);
  }

  setLicenseIconAndTooltip(image: ImageInterface): void {
    this.licenseIcon = this.imageService.getLicenseIcon(image.license);
    this.licenseTooltip = this.imageService.humanizeLicenseOption(image.license);
  }

  viewIotdTpStats() {
    this.offcanvasService.dismiss(); // Avoids nested offcanvases.
    this.offcanvasService.open(this.viewIotdTpStatsOffcanvas, {
      panelClass: "image-iotd-tp-stats-offcanvas",
      position: this.deviceService.offcanvasPosition()
    });
  }
}
