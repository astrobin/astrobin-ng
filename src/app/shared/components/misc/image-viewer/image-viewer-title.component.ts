import { Component, OnChanges, SimpleChanges } from "@angular/core";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { ImageService } from "@shared/services/image/image.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";

@Component({
  selector: "astrobin-image-viewer-title",
  template: `
    <div class="image-viewer-title d-flex flex-row justify-content-between align-items-center gap-2">
      <h2 class="flex-grow-1">
        {{ image.title }}

        <small *ngIf="resolution || size">
          <span *ngIf="resolution" class="resolution" [innerHTML]="resolution"></span>
          <span *ngIf="size" class="file-size" [innerHTML]="size | filesize"></span>
        </small>

        <div *ngIf="image.iotdDate || image.isTopPick || image.isTopPickNomination" class="iotd-tp">
        <span *ngIf="image.iotdDate" class="iotd">
          <span class="label">
            <fa-icon icon="trophy"></fa-icon>
            {{ "Image of the day" | translate }}:
          </span>
          <span class="date">
            {{ image.iotdDate | date:"mediumDate" }}
          </span>
        </span>

          <span *ngIf="!image.iotdDate && image.isTopPick" class="top-pick">
          <span class="label">
            <fa-icon icon="star"></fa-icon>
            {{ "Top Pick" | translate }}
          </span>
        </span>

          <span *ngIf="!image.iotdDate && !image.isTopPick && image.isTopPickNomination" class="top-pick-nomination">
          <span class="label">
            <fa-icon icon="arrow-up"></fa-icon>
            {{ "Top Pick Nomination" | translate }}
          </span>
        </span>
        </div>
      </h2>

      <div ngbDropdown class="dropdown w-auto">
        <fa-icon
          ngbDropdownToggle
          icon="ellipsis-v"
          class="dropdown-toggle no-toggle"
          aria-haspopup="true"
          aria-expanded="false"
        ></fa-icon>
        <div ngbDropdownMenu class="dropdown-menu">
          <a
            [href]="classicRoutesService.IMAGE(image.hash || image.pk.toString())"
            class="dropdown-item"
          >
            {{ "Classic view" | translate }}
          </a>

          <ng-container *ngIf="image.link || image.linkToFits">
            <div class="dropdown-divider"></div>

            <a
              *ngIf="image.link"
              [href]="image.link"
              class="dropdown-item"
            >
              {{ "External link" | translate }}
            </a>

            <a
              *ngIf="image.linkToFits"
              [href]="image.linkToFits"
              class="dropdown-item"
            >
              {{ "External link to FITS" | translate }}
            </a>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      .image-viewer-title {
        padding-bottom: .75rem;
        border-bottom: 1px solid rgba(255, 255, 255, .1);

        h2 {
          font-size: 1.5rem;

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

          .iotd-tp {
            font-size: .85rem;
            margin-top: .5rem;

            .iotd {
              .label {
                color: var(--gold);
              }

              .date {
                color: var(--white);
              }
            }

            .top-pick {
              .label {
                color: var(--silver);
              }
            }

            .top-pick-nomination {
              .label {
                color: var(--bronze);
              }
            }
          }
        }

        .dropdown .ng-fa-icon {
          margin-right:  -.5rem;
          padding: .5rem;
          cursor: pointer;


          &:hover {
            color: var(--white);
          }
        }
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
    public readonly imageService: ImageService,
    public readonly classicRoutesService: ClassicRoutesService
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
