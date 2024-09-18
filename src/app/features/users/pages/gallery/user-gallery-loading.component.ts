import { AfterViewInit, Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { MasonryLayoutGridItem } from "@shared/directives/masonry-layout.directive";

@Component({
  selector: "astrobin-user-gallery-loading",
  template: `
    <div
      class="masonry-layout-container"
      [astrobinMasonryLayout]="placeholders"
      [alias]="ImageAlias.REGULAR"
      (gridItemsChange)="onGridItemsChange($event)"
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
    </div>
  `,
  styleUrls: ["./user-gallery-loading.component.scss"]
})
export class UserGalleryLoadingComponent extends BaseComponentDirective implements AfterViewInit {
  @Input() numberOfImages: number;

  protected readonly ImageAlias = ImageAlias;

  protected gridItems: MasonryLayoutGridItem[] = [];
  protected averageHeight = 200;
  protected placeholders: any[] = []; // All we need is w and h.

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
}
