import { Component, ComponentRef, ElementRef, Inject, PLATFORM_ID, ViewChild, ViewContainerRef } from "@angular/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { ImageSearchInterface } from "@shared/interfaces/image-search.interface";
import { ImageSearchApiService } from "@shared/services/api/classic/images/image/image-search-api.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { Observable } from "rxjs";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentItemType, EquipmentItemUsageType } from "@features/equipment/types/equipment-item-base.interface";
import { ScrollableSearchResultsBaseComponent } from "@shared/components/search/scrollable-search-results-base/scrollable-search-results-base.component";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { FINAL_REVISION_LABEL } from "@shared/interfaces/image.interface";

@Component({
  selector: "astrobin-image-search",
  templateUrl: "./image-search.component.html",
  styleUrls: ["./image-search.component.scss"]
})
export class ImageSearchComponent extends ScrollableSearchResultsBaseComponent<ImageSearchInterface> {
  readonly EquipmentItemType = EquipmentItemType;
  readonly EquipmentItemUsageType = EquipmentItemUsageType;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageSearchApiService: ImageSearchApiService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    public readonly translateService: TranslateService,
    @Inject(PLATFORM_ID) public readonly platformId: Record<string, unknown>,
    public readonly viewContainerRef: ViewContainerRef,
    public readonly imageViewerService: ImageViewerService
  ) {
    super(store$, windowRefService, elementRef, platformId);
  }

  fetchData(): Observable<PaginatedApiResultInterface<ImageSearchInterface>> {
    return this.imageSearchApiService.search({ ...this.model, pageSize: this.model.pageSize || this.pageSize });
  }

  openImage(image: ImageSearchInterface): void {
    let activeImageViewer = this.imageViewerService.activeImageViewer;

    if (!activeImageViewer) {
      activeImageViewer =  this.imageViewerService.openImageViewer(
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
}
