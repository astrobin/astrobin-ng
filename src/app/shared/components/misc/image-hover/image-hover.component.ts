import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { ImageSearchInterface } from "@shared/interfaces/image-search.interface";
import { ImageService } from "@shared/services/image/image.service";
import { UserGalleryActiveLayout } from "@features/users/pages/gallery/user-gallery-buttons.component";

@Component({
  selector: 'astrobin-image-hover',
  template: `
    <div class="static-overlay" *ngIf="staticOverlay">
      <ng-container *ngTemplateOutlet="staticOverlayTemplate"></ng-container>
    </div>

    <div
      class="hover d-flex align-items-end gap-2"
      [class.tiny]="activeLayout === ActiveLayout.TINY"
      [class.small]="activeLayout === ActiveLayout.SMALL"
      [class.large]="activeLayout === ActiveLayout.LARGE"
    >
      <div class="flex-grow-1">
        <div class="title">{{ image.title }}</div>
        <div *ngIf="showAuthor" class="author">{{ image.userDisplayName }}</div>
        <div *ngIf="published" class="published">{{ published | localDate | timeago }}</div>
        <div *ngIf="!published && uploaded"
             class="uploaded">{{ uploaded | localDate | timeago }}
        </div>
      </div>

      <div class="counters d-flex flex-column gap-1">
        <div class="counter likes">
          <fa-icon icon="thumbs-up"></fa-icon>
          <span class="value">{{ likes }}</span>
        </div>
        <div class="counter bookmarks">
          <fa-icon icon="bookmark"></fa-icon>
          <span class="value">{{ bookmarks }}</span>
        </div>
        <div class="counter comments">
          <fa-icon icon="comment"></fa-icon>
          <span class="value">{{ comments }}</span>
        </div>
      </div>
    </div>

    <ng-template #staticOverlayTemplate>
      <div class="static-overlay-content">
        <span *ngIf="staticOverlay?.includes('comments')">
          {{ comments | numberSuffix }}
        </span>

        <span *ngIf="staticOverlay?.includes('likes')">
          {{ likes | numberSuffix }}
        </span>

        <span *ngIf="staticOverlay?.includes('bookmarks')">
          {{ bookmarks | numberSuffix }}
        </span>

        <span *ngIf="staticOverlay?.includes('views')">
          {{ image.views | numberSuffix }}
        </span>

        <span *ngIf="staticOverlay?.includes('integration') && !!integration" [innerHTML]="integration">
        </span>

        <span *ngIf="staticOverlay?.includes('field_radius')">
          {{ image.fieldRadius | number:"1.2-2" }}&deg;
        </span>

        <span *ngIf="staticOverlay?.includes('pixel_scale')">
          {{ image.pixelScale | number:"1.2-2" }}&Prime;/px
        </span>

        <span *ngIf="staticOverlay?.includes('coord_ra_min') && !!ra" [innerHTML]="ra">
        </span>

        <span *ngIf="staticOverlay?.includes('coord_dec_min') && !!dec" [innerHTML]="dec">
        </span>
      </div>
    </ng-template>
  `,
  styleUrls: ['./image-hover.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageHoverComponent implements OnChanges {
  @Input() image: ImageInterface | ImageSearchInterface;
  @Input() showAuthor = true;
  @Input() staticOverlay: string;
  @Input() activeLayout: string;

  protected readonly ActiveLayout = UserGalleryActiveLayout;

  protected published: string;
  protected uploaded: string;
  protected likes: number;
  protected bookmarks: number;
  protected comments: number;
  protected integration: string;
  protected ra: string;
  protected dec: string;

  constructor(public readonly imageService: ImageService) {}

  ngOnChanges(): void {
    if (this.image.hasOwnProperty('likeCount')) {
      this.published = (this.image as ImageInterface).published;
      this.uploaded = (this.image as ImageInterface).uploaded;
      this.likes = (this.image as ImageInterface).likeCount;
      this.bookmarks = (this.image as ImageInterface).bookmarkCount;
      this.comments = (this.image as ImageInterface).commentCount;
    } else {
      this.published = (this.image as ImageSearchInterface).published;
      this.uploaded = null;
      this.likes = (this.image as ImageSearchInterface).likes;
      this.bookmarks = (this.image as ImageSearchInterface).bookmarks;
      this.comments = (this.image as ImageSearchInterface).comments;
      this.integration = this.imageService.formatIntegration((this.image as ImageSearchInterface).integration);
      this.ra = this.imageService.formatRightAscension((this.image as ImageSearchInterface).coordRaMin);
      this.dec = this.imageService.formatDeclination((this.image as ImageSearchInterface).coordDecMin);
    }
  }
}
