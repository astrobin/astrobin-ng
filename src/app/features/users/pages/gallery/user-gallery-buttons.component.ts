import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";

export enum UserGalleryActiveLayout {
  SMALL = "small",
  LARGE = "large"
}

@Component({
  selector: "astrobin-user-gallery-buttons",
  template: `
    <div class="d-flex gap-3 justify-content-end">
      <img
        *ngIf="activeLayout === UserGalleryActiveLayout.LARGE"
        (click)="toggleLayout()"
        [ngSrc]="'/assets/images/layout-small.png?v=20241008'"
        [ngbTooltip]="'Small layout' | translate"
        alt="{{ 'Small layout' | translate }}"
        class="cursor-pointer"
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
        *ngIf="activeLayout === UserGalleryActiveLayout.SMALL"
        (click)="toggleLayout()"
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
    </div>
  `,
  styleUrls: ["./user-gallery-buttons.component.scss"]
})
export class UserGalleryButtonsComponent extends BaseComponentDirective implements OnInit {
  protected readonly UserGalleryActiveLayout = UserGalleryActiveLayout;
  protected readonly ICON_SIZE = 16;

  @Input()
  activeLayout: UserGalleryActiveLayout = UserGalleryActiveLayout.SMALL;

  @Output()
  activeLayoutChange = new EventEmitter<UserGalleryActiveLayout>();

  constructor(
    public readonly store$: Store<MainState>
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  toggleLayout() {
    this.activeLayout = this.activeLayout === UserGalleryActiveLayout.SMALL
      ? UserGalleryActiveLayout.LARGE
      : UserGalleryActiveLayout.SMALL;
    this.activeLayoutChange.emit(this.activeLayout);
  }
}
