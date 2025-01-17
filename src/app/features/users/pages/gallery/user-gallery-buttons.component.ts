import { Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { CookieService } from "ngx-cookie";
import { isPlatformBrowser } from "@angular/common";

export enum UserGalleryActiveLayout {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  TABLE = "table"
}

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
  `,
  styleUrls: ["./user-gallery-buttons.component.scss"]
})
export class UserGalleryButtonsComponent extends BaseComponentDirective implements OnInit {
  @Input()
  activeLayout: UserGalleryActiveLayout = UserGalleryActiveLayout.MEDIUM;

  @Input()
  subsection: string;

  @Input()
  ordering: string;

  @Output()
  activeLayoutChange = new EventEmitter<UserGalleryActiveLayout>();

  @Output()
  sortChange = new EventEmitter<string>();

  protected readonly UserGalleryActiveLayout = UserGalleryActiveLayout;

  private readonly _isBrowser: boolean;
  private readonly _cookieKey = "astrobin-user-gallery-layout";

  constructor(
    public readonly store$: Store<MainState>,
    public readonly cookieService: CookieService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    super(store$);
    this._isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this._isBrowser) {
      const cookie = this.cookieService.get(this._cookieKey);
      if (cookie) {
        this.setLayout(cookie as UserGalleryActiveLayout);
      } else {
        this.setLayout(UserGalleryActiveLayout.MEDIUM);
      }
    }
  }

  setLayout(layout: UserGalleryActiveLayout) {
    this.activeLayout = layout;
    this.activeLayoutChange.emit(this.activeLayout);

    if (this._isBrowser) {
      this.cookieService.put(this._cookieKey, layout);
    }
  }
}
