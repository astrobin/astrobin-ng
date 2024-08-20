import { Component, ElementRef, Inject, Input, OnInit, PLATFORM_ID, ViewContainerRef } from "@angular/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { ImageSearchInterface } from "@shared/interfaces/image-search.interface";
import { ImageSearchApiService } from "@shared/services/api/classic/images/image/image-search-api.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { fromEvent, Observable } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentItemType, EquipmentItemUsageType } from "@features/equipment/types/equipment-item-base.interface";
import { ScrollableSearchResultsBaseComponent } from "@shared/components/search/scrollable-search-results-base/scrollable-search-results-base.component";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { FINAL_REVISION_LABEL } from "@shared/interfaces/image.interface";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { debounceTime, takeUntil, tap } from "rxjs/operators";
import { DeviceService } from "@shared/services/device.service";
import { isPlatformBrowser } from "@angular/common";
import { EquipmentBrandListingInterface, EquipmentItemListingInterface } from "@features/equipment/types/equipment-listings.interface";
import { SearchPaginatedApiResultInterface } from "@shared/services/api/interfaces/search-paginated-api-result.interface";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { MarketplaceLineItemInterface } from "@features/equipment/types/marketplace-line-item.interface";

@Component({
  selector: "astrobin-image-search",
  templateUrl: "./image-search.component.html",
  styleUrls: ["./image-search.component.scss"]
})
export class ImageSearchComponent extends ScrollableSearchResultsBaseComponent<ImageSearchInterface> implements OnInit {
  readonly EquipmentItemType = EquipmentItemType;
  readonly EquipmentItemUsageType = EquipmentItemUsageType;
  @Input() alias: ImageAlias.GALLERY | ImageAlias.REGULAR = ImageAlias.REGULAR;
  @Input() showRetailers = true;
  @Input() showMarketplaceItems = true;
  protected gridItems: Array<ImageSearchInterface & { displayHeight: number, displayWidth: number }> = [];
  protected readonly ImageAlias = ImageAlias;
  protected allowFullRetailerIntegration = false;
  protected itemListings: EquipmentItemListingInterface[] = [];
  protected brandListings: EquipmentBrandListingInterface[] = [];
  protected marketplaceLineItems: MarketplaceLineItemInterface[] = [];
  protected averageHeight: number = 200; // Sync with $minSize in SCSS.

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageSearchApiService: ImageSearchApiService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    public readonly translateService: TranslateService,
    @Inject(PLATFORM_ID) public readonly platformId: Record<string, unknown>,
    public readonly viewContainerRef: ViewContainerRef,
    public readonly imageViewerService: ImageViewerService,
    public readonly deviceService: DeviceService
  ) {
    super(store$, windowRefService, elementRef, platformId);
    this.dataFetched.pipe(
      takeUntil(this.destroyed$),
      tap(() => this.assignWidthsToGridItems())
    ).subscribe();
  }

  ngOnInit(): void {
    super.ngOnInit();

    if (isPlatformBrowser(this.platformId)) {
      fromEvent(this.windowRefService.nativeWindow, "resize")
        .pipe(debounceTime(100), takeUntil(this.destroyed$))
        .subscribe(() => {
          this.assignWidthsToGridItems();
        });
    }
  }

  assignWidthsToGridItems(): void {
    if (!this.results || this.results.length === 0) {
      return;
    }

    const MIN_ASPECT_RATIO = .5;
    const MAX_ASPECT_RATIO = 2;

    this.results
      .filter(image => !this.gridItems.some(item => item.objectId === image.objectId))
      .forEach((image, i) => {
        const imageAspectRatio = image.finalW && image.finalH ? image.finalW / image.finalH : 1.0;
        const { width, height } = this._getRandomDimensions(MIN_ASPECT_RATIO, MAX_ASPECT_RATIO, imageAspectRatio);

        this.gridItems.push({
          ...image,
          displayWidth: width,
          displayHeight: height
        });
      });
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
          }

          if (result.equipmentBrandListings) {
            this.brandListings = this._removeDuplicateRetailers(result.equipmentBrandListings);
          }

          if (result.marketplaceLineItems) {
            this.marketplaceLineItems = result.marketplaceLineItems;
          }
        })
      );
  }

  openImage(image: ImageSearchInterface): void {
    let activeImageViewer = this.imageViewerService.activeImageViewer;

    if (!activeImageViewer) {
      activeImageViewer = this.imageViewerService.openImageViewer(
        image.hash || image.objectId,
        this.results.map(result => result.hash || result.objectId),
        this.viewContainerRef
      );
    } else {
      this.imageViewerService.loadImage(image.hash || image.objectId).subscribe(image => {
        activeImageViewer.instance.setImage(image, FINAL_REVISION_LABEL, this.results.map(result => result.hash || result.objectId));
      });
    }

    activeImageViewer.instance.nearEndOfContext.subscribe(() => {
      this.loadMore().subscribe(() => {
        activeImageViewer.instance.navigationContext = [...this.results.map(result => result.hash || result.objectId)];
      });
    });
  }

  private _getRandomDimensions(
    minAspectRatio: number,
    maxAspectRatio: number,
    targetAspectRatio: number
  ): { width: number; height: number } {
    const sizes = [
      160, 180, 200, 220, 240, 280,
      300, 320, 360, 380,
      400, 420, 480,
      500, 520, 560,
      600, 620, 660, 680,
      720, 760,
      800, 860, 920
    ];

    let height: number;
    let bestWidth: number = sizes[0];
    let bestDiff: number = Number.MAX_VALUE;

    do {
      height = sizes[Math.floor(Math.random() * sizes.length)];

      // Reset the best diff for this particular height
      bestDiff = Number.MAX_VALUE;

      // Find the best width that gets closest to the target aspect ratio
      for (const width of sizes) {
        const aspectRatio = width / height;
        const diff = Math.abs(aspectRatio - targetAspectRatio);

        // Check if this width and height combination is the best match
        if (diff < bestDiff && aspectRatio >= minAspectRatio && aspectRatio <= maxAspectRatio) {
          bestWidth = width;
          bestDiff = diff;
        }
      }

      // If we can't find a good aspect ratio match, retry
    } while ((bestWidth / height) < minAspectRatio || (bestWidth / height) > maxAspectRatio);

    return { width: bestWidth, height };
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
