import { AfterViewInit, Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { MasonryLayoutGridItem } from "@shared/directives/masonry-layout.directive";
import { UserGalleryActiveLayout } from "@features/users/pages/gallery/user-gallery-buttons.component";

@Component({
  selector: "astrobin-user-gallery-loading",
  template: `
    <div
      class="masonry-layout-container"
      [astrobinMasonryLayout]="placeholders"
      [activeLayout]="activeLayout"
      (gridItemsChange)="onGridItemsChange($event)"
    >
      <ng-container *ngIf="gridItems?.length > 0">
        <ng-container *ngIf="activeLayout === UserGalleryActiveLayout.TINY">
          <astrobin-image-loading-indicator
            *ngFor="let item of gridItems"
            class="tiny"
          ></astrobin-image-loading-indicator>
        </ng-container>

        <ng-container
          *ngIf="activeLayout === UserGalleryActiveLayout.SMALL || activeLayout === UserGalleryActiveLayout.LARGE"
        >
          <astrobin-image-loading-indicator
            *ngFor="let item of gridItems"
            [style.width.px]="item.displayWidth * averageHeight / item.displayHeight"
            [style.height.px]="averageHeight"
            [style.flex-grow]="item.displayWidth * averageHeight / item.displayHeight"
            [style.min-width.px]="averageHeight"
            [style.min-height.px]="averageHeight"
          >
          </astrobin-image-loading-indicator>
        </ng-container>

        <ng-container *ngIf="activeLayout === UserGalleryActiveLayout.TABLE">
          <astrobin-loading-indicator></astrobin-loading-indicator>
        </ng-container>
      </ng-container>
    </div>
  `,
  styleUrls: ["./user-gallery-loading.component.scss"]
})
export class UserGalleryLoadingComponent extends BaseComponentDirective implements AfterViewInit, OnInit {
  @Input() numberOfImages: number;
  @Input() activeLayout: UserGalleryActiveLayout = UserGalleryActiveLayout.TINY;

  protected readonly ImageAlias = ImageAlias;

  protected gridItems: MasonryLayoutGridItem[] = [];
  protected averageHeight = 200;
  protected placeholders: any[] = []; // All we need is w and h.

  ngOnInit() {
    super.ngOnInit();

    if (this.activeLayout === UserGalleryActiveLayout.TINY) {
      this.averageHeight = 150;
    }

    if (this.activeLayout === UserGalleryActiveLayout.SMALL) {
      this.averageHeight = 200;
    }

    if (this.activeLayout === UserGalleryActiveLayout.LARGE) {
      this.averageHeight = 300;
    }
  }

  ngAfterViewInit() {
    this.placeholders = Array.from({ length: this.numberOfImages }).map(() => ({
      w: Math.random() * this.averageHeight + this.averageHeight,
      h: this.averageHeight
    }));
  }

  onGridItemsChange(event: { gridItems: any[]; averageHeight: number }): void {
    this.gridItems = event.gridItems;
    this.averageHeight = event.averageHeight;
  }

  protected readonly UserGalleryActiveLayout = UserGalleryActiveLayout;
}
