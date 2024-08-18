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
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { FINAL_REVISION_LABEL } from "@shared/interfaces/image.interface";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { debounceTime, takeUntil, tap } from "rxjs/operators";
import { DeviceService } from "@shared/services/device.service";
import { isPlatformBrowser } from "@angular/common";

type SpanClass = "wide" | "medium" | "normal";

@Component({
  selector: "astrobin-image-search",
  templateUrl: "./image-search.component.html",
  styleUrls: ["./image-search.component.scss"]
})
export class ImageSearchComponent extends ScrollableSearchResultsBaseComponent<ImageSearchInterface> implements OnInit {
  readonly EquipmentItemType = EquipmentItemType;
  readonly EquipmentItemUsageType = EquipmentItemUsageType;
  @Input()
  alias: ImageAlias.GALLERY | ImageAlias.REGULAR = ImageAlias.REGULAR;
  protected gridItems: Array<ImageSearchInterface & { spanClass: SpanClass, randomHeight: number }> = [];
  protected readonly ImageAlias = ImageAlias;

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

  fetchData(): Observable<PaginatedApiResultInterface<ImageSearchInterface>> {
    return this.imageSearchApiService.search({ ...this.model, pageSize: this.model.pageSize || this.pageSize });
  }

  assignWidthsToGridItems(): void {
    const totalCols = 12;
    const colSpans = this._getColSpansForScreenWidth();

    let currentRowCols = 0;
    let currentRowHasWideItem = false;
    let currentRowHeight = this._getRandomHeight();

    this.gridItems = []; // Reset grid items

    this.results.forEach((image, index) => {
      if (currentRowCols === 0) {
        // Start the row with a new random height
        currentRowHeight = this._getRandomHeight();
      }

      const spanClass = this._getSpanClassForCurrentImage(currentRowCols, currentRowHasWideItem, totalCols, colSpans);
      if (spanClass === "wide") {
        currentRowHasWideItem = true;
      }
      currentRowCols += colSpans[spanClass];

      this.gridItems.push({ ...image, spanClass, randomHeight: currentRowHeight });

      // Reset row column count when full
      if (currentRowCols === totalCols) {
        currentRowCols = 0;
        currentRowHasWideItem = false;
      }
    });
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

  private _getColSpansForScreenWidth(): { wide: number; medium: number; normal: number } {
    if (this.deviceService.xsMax()) {
      return { wide: 6, medium: 6, normal: 6 };
    } else if (this.deviceService.smMax()) {
      return { wide: 6, medium: 3, normal: 3 };
    } else if (this.deviceService.mdMax()) {
      return { wide: 4, medium: 3, normal: 2 };
    } else if (this.deviceService.lgMax()) {
      return { wide: 4, medium: 3, normal: 2 };
    } else {
      return { wide: 4, medium: 3, normal: 2 };
    }
  }

  private _getSpanClassForCurrentImage(
    currentRowCols: number,
    currentRowHasWideItem: boolean,
    totalCols: number,
    colSpans: { [key: string]: number }
  ): SpanClass {
    const remainingCols = totalCols - currentRowCols;
    const random = Math.random();

    if (currentRowCols === 0) {
      return this._getRandomSpanClass(random);
    } else {
      return this._getSpanClassBasedOnRemainingCols(currentRowHasWideItem, remainingCols, colSpans, random);
    }
  }

  private _getRandomSpanClass(random: number): SpanClass {
    if (random < 1 / 3) {
      return "wide";
    } else if (random < 2 / 3) {
      return "medium";
    } else {
      return "normal";
    }
  }

  private _getSpanClassBasedOnRemainingCols(
    currentRowHasWideItem: boolean,
    remainingCols: number,
    colSpans: { [key: string]: number }, random: number
  ): SpanClass {
    if (!currentRowHasWideItem && remainingCols >= colSpans.wide && remainingCols % colSpans.wide === 0) {
      return "wide";
    } else if (remainingCols >= colSpans.medium && remainingCols % colSpans.medium === 0) {
      return "medium";
    } else {
      return "normal";
    }
  }

  private _getRandomHeight(): number {
    const max = 350;
    const min = 150;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
