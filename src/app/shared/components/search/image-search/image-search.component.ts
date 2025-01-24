import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnInit, Output, PLATFORM_ID } from "@angular/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { ImageSearchInterface } from "@shared/interfaces/image-search.interface";
import { ImageSearchApiService } from "@shared/services/api/classic/images/image/image-search-api.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { auditTime, finalize, fromEvent, Observable, Subscription } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentItemType, EquipmentItemUsageType } from "@features/equipment/types/equipment-item-base.interface";
import { ScrollableSearchResultsBaseComponent } from "@shared/components/search/scrollable-search-results-base/scrollable-search-results-base.component";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { filter, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { EquipmentBrandListingInterface, EquipmentItemListingInterface } from "@features/equipment/types/equipment-listings.interface";
import { SearchPaginatedApiResultInterface } from "@shared/services/api/interfaces/search-paginated-api-result.interface";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";
import { Router } from "@angular/router";
import { LoadingService } from "@shared/services/loading.service";
import { SearchService } from "@features/search/services/search.service";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { FINAL_REVISION_LABEL } from "@shared/interfaces/image.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { DeviceService } from "@shared/services/device.service";
import { ImageService } from "@shared/services/image/image.service";
import { UserService } from "@shared/services/user.service";
import { isPlatformBrowser } from "@angular/common";
import { ImageGalleryLayout } from "@shared/enums/image-gallery-layout.enum";
import { fadeInOut } from "@shared/animations";
import { ImageAlias } from "@shared/enums/image-alias.enum";

@Component({
  selector: "astrobin-image-search",
  templateUrl: "./image-search.component.html",
  styleUrls: ["./image-search.component.scss"],
  animations: [fadeInOut]
})
export class ImageSearchComponent extends ScrollableSearchResultsBaseComponent<ImageSearchInterface> implements OnInit {
  readonly EquipmentItemType = EquipmentItemType;
  readonly EquipmentItemUsageType = EquipmentItemUsageType;

  @Input() showRetailers = true;
  @Input() showMarketplaceItems = true;
  @Input() showDynamicOverlay = true;
  @Input() showStaticOverlay = true;

  @Output() imageOpened = new EventEmitter<ImageSearchInterface>();

  protected allowFullRetailerIntegration = false;
  protected itemListings: EquipmentItemListingInterface[] = [];
  protected brandListings: EquipmentBrandListingInterface[] = [];
  protected marketplaceLineItems: MarketplaceLineItemInterface[] = [];
  protected isMobile = false;
  protected loadingImageId: ImageSearchInterface["objectId"];

  protected readonly UserGalleryActiveLayout = ImageGalleryLayout;
  protected readonly Array = Array;

  private readonly _isBrowser: boolean;
  private _nearEndOfContextSubscription: Subscription;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageSearchApiService: ImageSearchApiService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    public readonly translateService: TranslateService,
    @Inject(PLATFORM_ID) public readonly platformId: Record<string, unknown>,
    public readonly imageViewerService: ImageViewerService,
    public readonly router: Router,
    public readonly loadingService: LoadingService,
    public readonly searchService: SearchService,
    public readonly deviceService: DeviceService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly imageService: ImageService,
    public readonly utilsService: UtilsService,
    public readonly userService: UserService
  ) {
    super(store$, windowRefService, elementRef, platformId, translateService, utilsService);
    this._isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    super.ngOnInit();

    fromEvent(this.windowRefService.nativeWindow, "resize")
      .pipe(takeUntil(this.destroyed$), auditTime(200))
      .subscribe(() => {
        this._checkMobile();
      });

    this._checkMobile();
  }

  getItemListingsMessage(listing: EquipmentItemListingInterface): string {
    return this.translateService.instant(
      "Support AstroBin by shopping for {{0}} at our partners!",
      { 0: `<strong>${listing.name}</strong>` }
    );
  }

  getBrandListingsMessage(brand: BrandInterface): string {
    return this.translateService.instant(
      "Support AstroBin by shopping for {{0}} products at our partners!",
      { 0: `<strong>${brand.name}</strong>` }
    );
  }

  getMarketplaceMessage(): string {
    return this.translateService.instant(
      "We found some items relevant to your search for sale on our marketplace!"
    );
  }

  fetchData(): Observable<SearchPaginatedApiResultInterface<ImageSearchInterface>> {
    return this.imageSearchApiService
      .search({ ...this.model, pageSize: this.model.pageSize || this.pageSize })
      .pipe(
        tap(result => {
          this.allowFullRetailerIntegration = result.allowFullRetailerIntegration;

          if (result.equipmentItemListings) {
            this.itemListings = this._removeDuplicateRetailers(result.equipmentItemListings);
          } else {
            this.itemListings = [];
          }

          if (result.equipmentBrandListings) {
            this.brandListings = this._removeDuplicateRetailers(result.equipmentBrandListings);
          } else {
            this.brandListings = [];
          }

          if (result.marketplaceLineItems) {
            this.marketplaceLineItems = result.marketplaceLineItems;
          } else {
            this.marketplaceLineItems = [];
          }
        }),
        tap(result => {
          this.searchService.searchCompleteSubject.next(result);
        })
      );
  }

  openImage(event: MouseEvent, image: ImageSearchInterface): void {
    // Check if any modifier key is pressed (cmd, ctrl, or middle-click)
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      return; // Let the default browser behavior handle the opening of a new tab
    }

    event.preventDefault();

    // If we are on an image's page, we don't want to open the image viewer but simply route to the image.
    if (this.router.url.startsWith("/i/")) {
      this._openImageByNavigation(image);
    } else {
      this.currentUserProfile$.pipe(take(1)).subscribe((userProfile: UserProfileInterface) => {
        if (!userProfile || userProfile.enableNewSearchExperience) {
          this._openImageByImageViewer(image);
        } else {
          this._openImageClassicUrl(image);
        }
      });
    }
  }

  private _openImageByNavigation(image: ImageSearchInterface): void {
    this.router.navigate([`/i/${image.hash || image.objectId}`]);
  }

  private _openImageClassicUrl(image: ImageSearchInterface): void {
    this.windowRefService.nativeWindow.open(
      this.classicRoutesService.IMAGE(image.hash || ("" + image.objectId)),
      "_self"
    );
  }

  private _checkMobile(): void {
    this.isMobile = this.deviceService.smMax();
  }

  private _openImageByImageViewer(image: ImageSearchInterface): void {
    this.loadingImageId = image.objectId;

    const navigationContext = this.results.map(result => ({
      imageId: result.hash || result.objectId,
      thumbnailUrl: result.galleryThumbnail
    }));

    this.imageService.loadImage(image.hash || image.objectId).pipe(
      switchMap(dbImage => {
        const alias: ImageAlias = this.deviceService.lgMax() ? ImageAlias.HD : ImageAlias.QHD;
        const thumbnailUrl = this.imageService.getThumbnail(dbImage, alias);
        return this.imageService.loadImageFile(thumbnailUrl, () => {});
      }),
      switchMap(() =>
        this.imageViewerService.openSlideshow(
          this.componentId,
          image.hash || image.objectId,
          FINAL_REVISION_LABEL,
          navigationContext,
          true
        )
      ),
      tap(slideshow => {
        if (this._nearEndOfContextSubscription) {
          this._nearEndOfContextSubscription.unsubscribe();
        }

        this._nearEndOfContextSubscription = slideshow.instance.nearEndOfContext.pipe(
          filter(callerComponentId => callerComponentId === this.componentId),
          takeUntil(this.destroyed$),
          switchMap(() =>
            this.loadMore().pipe(
              tap(() => {
                slideshow.instance.setNavigationContext(
                  this.results.map(result => ({
                    imageId: result.hash || result.objectId,
                    thumbnailUrl: result.galleryThumbnail
                  }))
                );
              })
            )
          )
        ).subscribe();
      }),
      switchMap(() => this.utilsService.delay(200)),
      finalize(() => {
        this.loadingImageId = null;
        this.imageOpened.emit(image);
      })
    ).subscribe({
      error: (error) => {
        console.error("Failed to load image:", error);
      }
    });
  }

  private _removeDuplicateRetailers(listings: any[]): any[] {
    return listings.reduce((acc, current) => {
      const retailerId = current.retailer.id;

      if (!acc.some(item => item.retailer.id === retailerId)) {
        acc.push(current);
      }

      return acc;
    }, []);
  }
}
