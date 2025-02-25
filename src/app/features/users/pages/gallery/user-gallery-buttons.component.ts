import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID, TemplateRef, ViewChild } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { CookieService } from "ngx-cookie";
import { isPlatformBrowser } from "@angular/common";
import { ImageGalleryLayout } from "@core/enums/image-gallery-layout.enum";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@core/services/device.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { takeUntil } from "rxjs/operators";
import { ImageInterface } from "@core/interfaces/image.interface";
import { UserInterface } from "@core/interfaces/user.interface";

@Component({
  selector: "astrobin-user-gallery-buttons",
  template: `
    <div class="d-flex gap-3 justify-content-end align-items-center">
      <div ngbDropdown class="mb-0 p-0">
        <button
          class="btn btn-outline-secondary btn-sm py-1 mb-0"
          ngbDropdownToggle
        >
          {{ "Sort" | translate }}
        </button>
        <div ngbDropdownMenu>
          <button
            class="dropdown-item"
            (click)="sortChange.emit('title')"
          >
            {{ "Title" | translate }}
            <fa-icon *ngIf="subsection === 'title'" icon="check"></fa-icon>
          </button>
          <button
            class="dropdown-item"
            (click)="sortChange.emit('uploaded')"
          >
            {{ "Publication date" | translate }}
            <fa-icon *ngIf="subsection === 'uploaded'" icon="check"></fa-icon>
          </button>
          <button
            class="dropdown-item"
            (click)="sortChange.emit('acquired')"
          >
            {{ "Acquisition date" | translate }}
            <fa-icon *ngIf="subsection === 'acquired'" icon="check"></fa-icon>
          </button>
          <button
            class="dropdown-item"
            (click)="sortChange.emit('views')"
          >
            {{ "Views" | translate }}
            <fa-icon *ngIf="ordering === 'views'" icon="check"></fa-icon>
          </button>
          <button
            class="dropdown-item"
            (click)="sortChange.emit('likes')"
          >
            {{ "Likes" | translate }}
            <fa-icon *ngIf="ordering === 'likes'" icon="check"></fa-icon>
          </button>
          <button
            class="dropdown-item"
            (click)="sortChange.emit('bookmarks')"
          >
            {{ "Bookmarks" | translate }}
            <fa-icon *ngIf="ordering === 'bookmarks'" icon="check"></fa-icon>
          </button>
          <button
            class="dropdown-item"
            (click)="sortChange.emit('comments')"
          >
            {{ "Comments" | translate }}
            <fa-icon *ngIf="ordering === 'comments'" icon="check"></fa-icon>
          </button>
        </div>
      </div>

      <fa-icon
        *ngIf="isOwner"
        (click)="images?.length > 0 && openExportCsvOffcanvas()"
        icon="file-csv"
        [ngbTooltip]="'Export CSV' | translate"
        [class.cursor-pointer]="images?.length > 0"
        [class.disabled]="!images?.length"
        container="body"
      ></fa-icon>

      <fa-icon
        (click)="setLayout(UserGalleryActiveLayout.SMALL)"
        icon="table-cells"
        [ngbTooltip]="'Small layout' | translate"
        class="cursor-pointer"
        [class.active]="activeLayout === UserGalleryActiveLayout.SMALL"
        container="body"
      />
      <fa-icon
        (click)="setLayout(UserGalleryActiveLayout.MEDIUM)"
        icon="table-cells-large"
        [ngbTooltip]="'Medium layout' | translate"
        class="cursor-pointer"
        [class.active]="activeLayout === UserGalleryActiveLayout.MEDIUM"
        container="body"
      />
      <fa-icon
        (click)="setLayout(UserGalleryActiveLayout.LARGE)"
        icon="square"
        [ngbTooltip]="'Large layout' | translate"
        class="cursor-pointer"
        [class.active]="activeLayout === UserGalleryActiveLayout.LARGE"
        container="body"
      />
      <fa-icon
        (click)="setLayout(UserGalleryActiveLayout.TABLE)"
        [icon]="['fas', 'bars']"
        [ngbTooltip]="'Table layout' | translate"
        class="cursor-pointer"
        [class.active]="activeLayout === UserGalleryActiveLayout.TABLE"
        container="body"
      ></fa-icon>
    </div>

    <ng-template #exportCsvOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "Export CSV" | translate }}</h5>
        <button type="button" class="btn-close" (click)="offcanvas.close()"></button>
      </div>
      <div class="offcanvas-body">
        <p class="alert alert-dark mb-3">
          {{ "The CSV below contains the images currently visible on this page. To include more images, scroll down to load more before exporting." | translate }}
        </p>

        <textarea
          class="form-control mb-3"
          rows="10"
          readonly
          [value]="csvContent"
        ></textarea>

        <button
          class="btn btn-secondary"
          (click)="copyToClipboard()"
        >
          <fa-icon icon="copy" class="me-2"></fa-icon>
          {{ "Copy" | translate }}
        </button>
      </div>
    </ng-template>
  `,
  styleUrls: ["./user-gallery-buttons.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGalleryButtonsComponent extends BaseComponentDirective implements OnInit {
  @Input()
  activeLayout: ImageGalleryLayout = ImageGalleryLayout.MEDIUM;

  @Input()
  subsection: string;

  @Input()
  ordering: string;

  @Input()
  images: ImageInterface[] = [];

  @Input()
  user: UserInterface;

  @Output()
  activeLayoutChange = new EventEmitter<ImageGalleryLayout>();

  @Output()
  sortChange = new EventEmitter<string>();

  @ViewChild("exportCsvOffcanvas") exportCsvOffcanvas: TemplateRef<any>;

  protected readonly UserGalleryActiveLayout = ImageGalleryLayout;
  protected csvContent: string = "";
  protected isOwner: boolean = false;

  private readonly _isBrowser: boolean;
  private readonly _cookieKey = "astrobin-user-gallery-layout";

  constructor(
    public readonly store$: Store<MainState>,
    public readonly cookieService: CookieService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly windowRefService: WindowRefService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    super(store$);
    this._isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this._isBrowser) {
      const cookie = this.cookieService.get(this._cookieKey);
      if (cookie) {
        this.setLayout(cookie as ImageGalleryLayout);
      } else {
        this.setLayout(ImageGalleryLayout.MEDIUM);
      }
    }

    this.currentUserWrapper$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(currentUserWrapper => {
        if (currentUserWrapper && this.user) {
          this.isOwner = currentUserWrapper.user?.id === this.user.id;
        }
      });
  }

  setLayout(layout: ImageGalleryLayout) {
    this.activeLayout = layout;
    this.activeLayoutChange.emit(this.activeLayout);

    if (this._isBrowser) {
      this.cookieService.put(this._cookieKey, layout);
    }
  }

  openExportCsvOffcanvas() {
    this.generateCsvContent();

    this.offcanvasService.open(
      this.exportCsvOffcanvas, {
        position: this.deviceService.offcanvasPosition(),
        panelClass: 'gallery-csv-export-offcanvas'
      }
    );
  }

  generateCsvContent() {
    // Create CSV header row
    const headers = ['Title', 'Publication date', 'Views', 'Likes', 'Comments', 'Bookmarks'];

    // Generate CSV rows from images data
    const rows = this.images.map(image => [
      `"${image.title || ''}"`,
      image.published || image.uploaded || '',
      image.viewCount || 0,
      image.likeCount || 0,
      image.commentCount || 0,
      image.bookmarkCount || 0
    ]);

    // Combine header and rows
    this.csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  async copyToClipboard() {
    const success = await this.windowRefService.copyToClipboard(this.csvContent);

    if (success) {
      this.popNotificationsService.success(
        this.translateService.instant('CSV data copied to clipboard.')
      );
    } else {
      this.popNotificationsService.error(
        this.translateService.instant('Failed to copy CSV data to clipboard.')
      );
    }
  }
}
