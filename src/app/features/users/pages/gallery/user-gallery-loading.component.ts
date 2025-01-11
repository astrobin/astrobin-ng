import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, Input, OnInit, PLATFORM_ID } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { UtilsService } from "@shared/services/utils/utils.service";
import { isPlatformBrowser } from "@angular/common";
import { UserGalleryActiveLayout } from "@features/users/pages/gallery/user-gallery-buttons.component";

@Component({
  selector: "astrobin-user-gallery-loading",
  template: `
    <ng-container *ngIf="isBrowser">
      <astrobin-loading-indicator></astrobin-loading-indicator>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-loading.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGalleryLoadingComponent extends BaseComponentDirective implements AfterViewInit, OnInit {
  @Input() numberOfImages: number;
  @Input() activeLayout: UserGalleryActiveLayout = UserGalleryActiveLayout.TINY;

  protected readonly isBrowser: boolean;
  protected placeholders: any[] = []; // All we need is w and h.

  constructor(
    public readonly store$: Store<MainState>,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    super(store$);
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    super.ngOnInit();

    this.changeDetectorRef.markForCheck();
  }

  ngAfterViewInit() {
  }
}
