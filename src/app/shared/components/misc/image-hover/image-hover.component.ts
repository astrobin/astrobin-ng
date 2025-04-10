import { isPlatformBrowser } from "@angular/common";
import type { OnChanges } from "@angular/core";
import { ChangeDetectionStrategy, Component, Inject, Input, PLATFORM_ID } from "@angular/core";
import { ImageGalleryLayout } from "@core/enums/image-gallery-layout.enum";
import type { ImageSearchInterface } from "@core/interfaces/image-search.interface";
import type { ImageInterface } from "@core/interfaces/image.interface";
import { ImageService } from "@core/services/image/image.service";
import { SearchService } from "@core/services/search.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";

@Component({
  selector: "astrobin-image-hover",
  template: `
    <div class="static-overlay" *ngIf="staticOverlay">
      <ng-container *ngTemplateOutlet="staticOverlayTemplate"></ng-container>
    </div>

    <div
      class="hover d-flex align-items-end gap-2"
      [class.small]="activeLayout === ActiveLayout.SMALL"
      [class.medium]="activeLayout === ActiveLayout.MEDIUM"
      [class.large]="activeLayout === ActiveLayout.LARGE"
    >
      <div class="flex-grow-1">
        <div class="title" [innerHTML]="image.title | highlight : searchTerms"></div>
        <div *ngIf="showAuthor" class="author" [innerHTML]="image.userDisplayName | highlight : searchTerms"></div>
        <div *ngIf="published" class="published">{{ published | localDate | timeago }}</div>
        <div *ngIf="!published && uploaded" class="uploaded">{{ uploaded | localDate | timeago }}</div>
      </div>

      <div class="counters d-flex flex-column">
        <div class="counter views">
          <fa-icon icon="eye"></fa-icon>
          <span class="value">{{ views | numberSuffix }}</span>
        </div>
        <div class="counter likes">
          <fa-icon icon="thumbs-up"></fa-icon>
          <span class="value">{{ likes | numberSuffix }}</span>
        </div>
        <div class="counter bookmarks">
          <fa-icon icon="bookmark"></fa-icon>
          <span class="value">{{ bookmarks | numberSuffix }}</span>
        </div>
        <div class="counter comments">
          <fa-icon icon="comment"></fa-icon>
          <span class="value">{{ comments | numberSuffix }}</span>
        </div>
      </div>
    </div>

    <ng-template #staticOverlayTemplate>
      <div class="static-overlay-content">
        <span *ngIf="staticOverlay?.includes('comments')">
          <fa-icon icon="comment"></fa-icon> {{ comments | numberSuffix }}
        </span>

        <span *ngIf="staticOverlay?.includes('likes')">
          <fa-icon icon="thumbs-up"></fa-icon> {{ likes | numberSuffix }}
        </span>

        <span *ngIf="staticOverlay?.includes('bookmarks')">
          <fa-icon icon="bookmark"></fa-icon> {{ bookmarks | numberSuffix }}
        </span>

        <span *ngIf="staticOverlay?.includes('views')">
          <fa-icon icon="eye"></fa-icon> {{ views | numberSuffix }}
        </span>

        <span *ngIf="staticOverlay?.includes('integration') && !!integration" [innerHTML]="integration"> </span>

        <span *ngIf="staticOverlay?.includes('field_radius')"> {{ image.fieldRadius | number : "1.2-2" }}&deg; </span>

        <span *ngIf="staticOverlay?.includes('pixel_scale')">
          {{ image.pixelScale | number : "1.2-2" }}&Prime;/px
        </span>

        <span *ngIf="staticOverlay?.includes('coord_ra_min') && !!ra" [innerHTML]="ra"> </span>

        <span *ngIf="staticOverlay?.includes('coord_dec_min') && !!dec" [innerHTML]="dec"> </span>
      </div>
    </ng-template>
  `,
  styleUrls: ["./image-hover.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageHoverComponent implements OnChanges {
  @Input() image: ImageInterface | ImageSearchInterface;
  @Input() showAuthor = true;
  @Input() staticOverlay: string;
  @Input() activeLayout: string;

  protected readonly ActiveLayout = ImageGalleryLayout;
  protected readonly isBrowser: boolean;

  protected published: string;
  protected uploaded: string;
  protected likes: number;
  protected bookmarks: number;
  protected comments: number;
  protected views: number;
  protected integration: string;
  protected ra: string;
  protected dec: string;
  protected searchTerms: string;

  constructor(
    public readonly imageService: ImageService,
    public readonly searchService: SearchService,
    @Inject(PLATFORM_ID) public readonly platformId: object,
    public readonly windowRefService: WindowRefService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnChanges(): void {
    if (this.image.hasOwnProperty("likeCount")) {
      this.published = (this.image as ImageInterface).published;
      this.uploaded = (this.image as ImageInterface).uploaded;
      this.likes = (this.image as ImageInterface).likeCount;
      this.bookmarks = (this.image as ImageInterface).bookmarkCount;
      this.comments = (this.image as ImageInterface).commentCount;
      this.views = (this.image as ImageInterface).viewCount;
    } else {
      this.published = (this.image as ImageSearchInterface).published;
      this.uploaded = null;
      this.likes = (this.image as ImageSearchInterface).likes;
      this.bookmarks = (this.image as ImageSearchInterface).bookmarks;
      this.comments = (this.image as ImageSearchInterface).comments;
      this.views = (this.image as ImageSearchInterface).views;
      this.integration = this.imageService.formatIntegration((this.image as ImageSearchInterface).integration);
      this.ra = this.imageService.formatRightAscension((this.image as ImageSearchInterface).coordRaMin);
      this.dec = this.imageService.formatDeclination((this.image as ImageSearchInterface).coordDecMin);
    }

    this._initSearchTerms();
  }

  private _initSearchTerms() {
    if (!this.isBrowser) {
      return;
    }

    const currentUrl = this.windowRefService.getCurrentUrl();
    const p = UtilsService.getUrlParam(currentUrl.toString(), "p");
    if (p) {
      const searchModel = this.searchService.paramsToModel(p);
      this.searchTerms = searchModel?.text?.value;
    }
  }
}
