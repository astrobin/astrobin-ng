import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { ImageService } from "@shared/services/image/image.service";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { ImageViewerService } from "@shared/services/image-viewer.service";

@Component({
  selector: "astrobin-image-viewer-photographers",
  template: `
    <div class="avatars">
      <a
        *ngIf="image.collaborators?.length === 0"
        [href]="classicRoutesService.GALLERY(image.username)"
        target="_blank"
        class="me-2"
      >
        <img [src]="image.userAvatar" alt="" />
      </a>

      <fa-icon
        *ngIf="image.collaborators?.length > 0"
        icon="user-group"
        class="me-2"
      ></fa-icon>
    </div>

    <div class="name flex-grow-1 d-flex gap-2">
      <a
        [href]="classicRoutesService.GALLERY(image.username)"
        target="_blank"
        class="display-name"
      >
        {{ image.userDisplayName }}
      </a>

      <div
        *ngIf="image.collaborators?.length > 0"
        class="plus-others"
      >
        <span class="badge rounded-pill bg-danger border border-light">
          +{{ image.collaborators?.length }}
        </span>
      </div>
    </div>

    <div *ngIf="publicationDate" class="flex-grow-1 text-end">
      <fa-icon icon="calendar" class="me-2"></fa-icon>
      {{ publicationDate | localDate | timeago:true }}
    </div>
  `,
  styles: [`
    :host {
      .avatars {
        img {
          border-radius: 50%;
        }
      }
    }
  `]
})
export class ImageViewerPhotographersComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  @Input()
  image: ImageInterface;

  publicationDate: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly imageService: ImageService
  ) {
    super(store$, searchService, router, imageViewerService);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.image && changes.image.currentValue) {
      this.publicationDate = this.imageService.getPublicationDate(changes.image.currentValue);
    }
  }
}
