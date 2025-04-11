import { isPlatformBrowser } from "@angular/common";
import {
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  PLATFORM_ID,
  ViewChild
} from "@angular/core";
import { MainState } from "@app/store/state";
import { ImageGalleryLayout } from "@core/enums/image-gallery-layout.enum";
import { ImageInterface } from "@core/interfaces/image.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { DeviceService } from "@core/services/device.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { CookieService } from "ngx-cookie";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-user-gallery-buttons",
  template: `
    <div class="d-flex gap-3 justify-content-end align-items-center">
      <div class="mb-0 p-0" ngbDropdown>
        <button class="btn btn-outline-secondary btn-sm py-1 mb-0" ngbDropdownToggle>
          {{ "Sort" | translate }}
        </button>
        <div ngbDropdownMenu>
          <button (click)="sortChange.emit('title')" class="dropdown-item">
            {{ "Title" | translate }}
            <fa-icon *ngIf="subsection === 'title'" icon="check"></fa-icon>
          </button>
          <button (click)="sortChange.emit('uploaded')" class="dropdown-item">
            {{ "Publication date" | translate }}
            <fa-icon *ngIf="subsection === 'uploaded'" icon="check"></fa-icon>
          </button>
          <button (click)="sortChange.emit('acquired')" class="dropdown-item">
            {{ "Acquisition date" | translate }}
            <fa-icon *ngIf="subsection === 'acquired'" icon="check"></fa-icon>
          </button>
          <button (click)="sortChange.emit('views')" class="dropdown-item">
            {{ "Views" | translate }}
            <fa-icon *ngIf="ordering === 'views'" icon="check"></fa-icon>
          </button>
          <button (click)="sortChange.emit('likes')" class="dropdown-item">
            {{ "Likes" | translate }}
            <fa-icon *ngIf="ordering === 'likes'" icon="check"></fa-icon>
          </button>
          <button (click)="sortChange.emit('bookmarks')" class="dropdown-item">
            {{ "Bookmarks" | translate }}
            <fa-icon *ngIf="ordering === 'bookmarks'" icon="check"></fa-icon>
          </button>
          <button (click)="sortChange.emit('comments')" class="dropdown-item">
            {{ "Comments" | translate }}
            <fa-icon *ngIf="ordering === 'comments'" icon="check"></fa-icon>
          </button>
        </div>
      </div>

      <fa-icon
        *ngIf="isOwner"
        [class.cursor-pointer]="images?.length > 0"
        [class.disabled]="!images?.length"
        [ngbTooltip]="'Export CSV' | translate"
        (click)="images?.length > 0 && openExportCsvOffcanvas()"
        container="body"
        icon="file-csv"
      ></fa-icon>

      <fa-icon
        [class.active]="activeLayout === UserGalleryActiveLayout.SMALL"
        [ngbTooltip]="'Small layout' | translate"
        (click)="setLayout(UserGalleryActiveLayout.SMALL)"
        class="cursor-pointer"
        container="body"
        icon="table-cells"
      />
      <fa-icon
        [class.active]="activeLayout === UserGalleryActiveLayout.MEDIUM"
        [ngbTooltip]="'Medium layout' | translate"
        (click)="setLayout(UserGalleryActiveLayout.MEDIUM)"
        class="cursor-pointer"
        container="body"
        icon="table-cells-large"
      />
      <fa-icon
        [class.active]="activeLayout === UserGalleryActiveLayout.LARGE"
        [ngbTooltip]="'Large layout' | translate"
        (click)="setLayout(UserGalleryActiveLayout.LARGE)"
        class="cursor-pointer"
        container="body"
        icon="square"
      />
      <fa-icon
        [class.active]="activeLayout === UserGalleryActiveLayout.TABLE"
        [icon]="['fas', 'bars']"
        [ngbTooltip]="'Table layout' | translate"
        (click)="setLayout(UserGalleryActiveLayout.TABLE)"
        class="cursor-pointer"
        container="body"
      ></fa-icon>
    </div>

    <ng-template #exportCsvOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "Export CSV" | translate }}</h5>
        <button (click)="offcanvas.close()" class="btn-close" type="button"></button>
      </div>
      <div class="offcanvas-body">
        <p class="mb-3">
          {{
            "The CSV below contains the images currently visible on this page. To include more images, scroll down your gallery to load more before exporting."
              | translate
          }}
        </p>

        <textarea [value]="csvContent" class="form-control mb-3" readonly rows="15"></textarea>

        <button (click)="copyToClipboard()" class="btn btn-secondary">
          <fa-icon class="me-2" icon="copy"></fa-icon>
          {{ "Copy" | translate }}
        </button>
      </div>
    </ng-template>
  `,
  styleUrls: ["./user-gallery-buttons.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGalleryButtonsComponent extends BaseComponentDirective implements OnInit, OnChanges {
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
  protected csvContent = "";
  protected isOwner = false;

  private _currentUser: UserInterface | null = null;
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

    this.currentUserWrapper$.pipe(takeUntil(this.destroyed$)).subscribe(currentUserWrapper => {
      this._currentUser = currentUserWrapper?.user;
      if (currentUserWrapper && this.user) {
        this.isOwner = currentUserWrapper.user?.id === this.user.id;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.user && changes.user.currentValue) {
      this.isOwner = this._currentUser?.id === this.user.id;
    }
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

    this.offcanvasService.open(this.exportCsvOffcanvas, {
      position: this.deviceService.offcanvasPosition(),
      panelClass: "gallery-csv-export-offcanvas"
    });
  }

  generateCsvContent() {
    // Create CSV header row
    const headers = ["Title", "Publication date", "Views", "Likes", "Comments", "Bookmarks"];

    // Generate CSV rows from images data
    const rows = this.images.map(image => [
      `"${image.title || ""}"`,
      image.published || image.uploaded || "",
      image.viewCount || 0,
      image.likeCount || 0,
      image.commentCount || 0,
      image.bookmarkCount || 0
    ]);

    // Combine header and rows
    this.csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
  }

  async copyToClipboard() {
    const success = await this.windowRefService.copyToClipboard(this.csvContent);

    if (success) {
      this.popNotificationsService.success(this.translateService.instant("CSV data copied to clipboard."));
    } else {
      this.popNotificationsService.error(this.translateService.instant("Failed to copy CSV data to clipboard."));
    }
  }
}
