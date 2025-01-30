import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnChanges, PLATFORM_ID } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import { isPlatformBrowser } from "@angular/common";
import { ImageGalleryLayout } from "@core/enums/image-gallery-layout.enum";

@Component({
  selector: "astrobin-image-gallery-loading",
  template: `
    <ng-container *ngIf="isBrowser">
      <astrobin-masonry-layout
        [items]="placeholders"
        [layout]="activeLayout === UserGalleryActiveLayout.SMALL
          ? 'small'
          : activeLayout === UserGalleryActiveLayout.MEDIUM ? 'medium' : 'large'"
        [leftAlignLastRow]="true"
      >
        <ng-template let-item>
          <astrobin-image-loading-indicator
            class="loading-item"
            [w]="item.w"
            [h]="item.h"
          ></astrobin-image-loading-indicator>
        </ng-template>
      </astrobin-masonry-layout>
    </ng-container>
  `,
  styleUrls: ["./image-gallery-loading.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageGalleryLoadingComponent extends BaseComponentDirective implements OnChanges {
  @Input() numberOfImages: number;
  @Input() activeLayout: ImageGalleryLayout = ImageGalleryLayout.SMALL;

  protected readonly isBrowser: boolean;
  protected placeholders: any[] = [];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    super(store$);
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnChanges() {
    this._updateLayout();
  }

  private _updateLayout(): void {
    this.placeholders = Array.from({ length: this.numberOfImages }).map((_, i) => {
      // Generate random aspect ratios that match our real layout's categories
      const ratio = Math.random();
      let w: number, h: number;

      if (ratio < 0.25) { // narrow
        w = 0.7;
        h = 1;
      } else if (ratio < 0.5) { // square
        w = 1;
        h = 1;
      } else if (ratio < 0.75) { // wide
        w = 1.2;
        h = 1;
      } else { // panoramic
        w = 2;
        h = 1;
      }

      return { id: i, w, h };
    });

    this.changeDetectorRef.markForCheck();
  }

  protected readonly UserGalleryActiveLayout = ImageGalleryLayout;
}
