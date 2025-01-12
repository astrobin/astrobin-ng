import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnChanges, OnInit, PLATFORM_ID } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { UtilsService } from "@shared/services/utils/utils.service";
import { isPlatformBrowser } from "@angular/common";
import { UserGalleryActiveLayout } from "@features/users/pages/gallery/user-gallery-buttons.component";
import { MasonryBreakpoints } from "@shared/components/masonry-layout/masonry-layout.component";

@Component({
  selector: "astrobin-user-gallery-loading",
  template: `
    <ng-container *ngIf="isBrowser">
      <div class="loading-container" [style.--gutter]="gutter">
        <astrobin-image-loading-indicator
          *ngFor="let placeholder of placeholders"
          [style.height.px]="placeholder.h"
          [style.--columns-xs]="breakpoints.xs"
          [style.--columns-sm]="breakpoints.sm"
          [style.--columns-md]="breakpoints.md"
          [style.--columns-lg]="breakpoints.lg"
          [style.--columns-xl]="breakpoints.xl"
          [style.--gutter]="gutter"
          class="loading-item"
        ></astrobin-image-loading-indicator>
      </div>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-loading.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGalleryLoadingComponent extends BaseComponentDirective implements AfterViewInit, OnChanges {
  @Input() numberOfImages: number;
  @Input() activeLayout: UserGalleryActiveLayout = UserGalleryActiveLayout.TINY;

  protected readonly isBrowser: boolean;
  protected placeholders: any[] = []; // All we need is w and h.
  protected size = 200;
  protected breakpoints: MasonryBreakpoints;
  protected gutter: number;

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
    if (this.activeLayout === UserGalleryActiveLayout.TINY) {
      this.size = 130;
      this.breakpoints = {
        xs: 4,
        sm: 5,
        md: 7,
        lg: 8,
        xl: 9
      };
      this.gutter = 8;
    }

    if (this.activeLayout === UserGalleryActiveLayout.SMALL) {
      this.size = 150;
      this.breakpoints = {
        xs: 2,
        sm: 3,
        md: 4,
        lg: 5,
        xl: 5
      };
      this.gutter = 12;
    }

    if (this.activeLayout === UserGalleryActiveLayout.LARGE) {
      this.size = 300;
      this.breakpoints = {
        xs: 1,
        sm: 1,
        md: 2,
        lg: 3,
        xl: 3
      };
      this.gutter = 16;
    }

    this.changeDetectorRef.markForCheck();
  }

  ngAfterViewInit() {
    this.utilsService.delay(1).subscribe(() => {
      this.placeholders = Array.from({ length: this.numberOfImages }).map(() => ({
        h: this.size
      }));
      this.changeDetectorRef.markForCheck();
    });
  }
}
