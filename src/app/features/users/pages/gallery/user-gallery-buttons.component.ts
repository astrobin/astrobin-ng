import { Component, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { CookieService } from "ngx-cookie";
import { isPlatformBrowser } from "@angular/common";

export enum UserGalleryActiveLayout {
  TINY = "tiny",
  SMALL = "small",
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
          </button>
          <button
            class="dropdown-item"
            (click)="sortChange.emit('uploaded')"
          >
            {{ "Publication date" | translate }}
          </button>
          <button
            class="dropdown-item"
            (click)="sortChange.emit('acquired')"
          >
            {{ "Acquisition date" | translate }}
          </button>
        </div>
      </div>

      <img
        *ngIf="activeLayout !== UserGalleryActiveLayout.TINY"
        (click)="setLayout(UserGalleryActiveLayout.TINY)"
        [ngSrc]="'/assets/images/layout-tiny.png?v=20241008'"
        [ngbTooltip]="'Tiny layout' | translate"
        alt="{{ 'Tiny layout' | translate }}"
        class="cursor-pointer"
        container="body"
        height="{{ ICON_SIZE }}"
        width="{{ ICON_SIZE }}"
      />
      <img
        *ngIf="activeLayout === UserGalleryActiveLayout.TINY"
        [ngSrc]="'/assets/images/layout-tiny-active.png?v=20241008'"
        [ngbTooltip]="'Tiny layout' | translate"
        alt="{{ 'Tiny layout' | translate }}"
        container="body"
        height="{{ ICON_SIZE }}"
        width="{{ ICON_SIZE }}"
      />
      <img
        *ngIf="activeLayout !== UserGalleryActiveLayout.SMALL"
        (click)="setLayout(UserGalleryActiveLayout.SMALL)"
        [ngSrc]="'/assets/images/layout-small.png?v=20241008'"
        [ngbTooltip]="'Small layout' | translate"
        alt="{{ 'Small layout' | translate }}"
        class="cursor-pointer d-none d-lg-inline"
        container="body"
        height="{{ ICON_SIZE }}"
        width="{{ ICON_SIZE }}"
      />
      <img
        *ngIf="activeLayout === UserGalleryActiveLayout.SMALL"
        [ngSrc]="'/assets/images/layout-small-active.png?v=20241008'"
        [ngbTooltip]="'Small layout' | translate"
        alt="{{ 'Small layout' | translate }}"
        container="body"
        height="{{ ICON_SIZE }}"
        width="{{ ICON_SIZE }}"
      />
      <img
        *ngIf="activeLayout !== UserGalleryActiveLayout.LARGE"
        (click)="setLayout(UserGalleryActiveLayout.LARGE)"
        [ngSrc]="'/assets/images/layout-large.png?v=20241008'"
        [ngbTooltip]="'Large layout' | translate"
        alt="{{ 'Large layout' | translate }}"
        class="cursor-pointer"
        container="body"
        height="{{ ICON_SIZE }}"
        width="{{ ICON_SIZE }}"
      />
      <img
        *ngIf="activeLayout === UserGalleryActiveLayout.LARGE"
        [ngSrc]="'/assets/images/layout-large-active.png?v=20241008'"
        [ngbTooltip]="'Large layout' | translate"
        alt="{{ 'Large layout' | translate }}"
        container="body"
        height="{{ ICON_SIZE }}"
        width="{{ ICON_SIZE }}"
      />
      <fa-icon
        *ngIf="activeLayout !== UserGalleryActiveLayout.TABLE"
        (click)="setLayout(UserGalleryActiveLayout.TABLE)"
        [icon]="['fas', 'bars']"
        [ngbTooltip]="'Table layout' | translate"
        class="cursor-pointer"
        container="body"
      ></fa-icon>
      <fa-icon
        *ngIf="activeLayout === UserGalleryActiveLayout.TABLE"
        [icon]="['fas', 'bars']"
        [ngbTooltip]="'Table layout' | translate"
        container="body"
        class="active"
      ></fa-icon>
    </div>
  `,
  styleUrls: ["./user-gallery-buttons.component.scss"]
})
export class UserGalleryButtonsComponent extends BaseComponentDirective implements OnInit {
  @Input()
  activeLayout: UserGalleryActiveLayout = UserGalleryActiveLayout.TINY;

  @Output()
  activeLayoutChange = new EventEmitter<UserGalleryActiveLayout>();

  @Output()
  sortChange = new EventEmitter<string>();

  protected readonly UserGalleryActiveLayout = UserGalleryActiveLayout;
  protected readonly ICON_SIZE = 16;

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
