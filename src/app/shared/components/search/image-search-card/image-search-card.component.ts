import { Component, ElementRef, Inject, Input, PLATFORM_ID, ViewChild } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { ImageSearchInterface } from "@shared/interfaces/image-search.interface";
import { ImageSearchApiService } from "@shared/services/api/classic/images/image/image-search-api.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentItemType, EquipmentItemUsageType } from "@features/equipment/types/equipment-item-base.interface";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { ImageSearchComponent } from "@shared/components/search/image-search/image-search.component";

@Component({
  selector: "astrobin-image-search-card",
  templateUrl: "./image-search-card.component.html",
  styleUrls: ["./image-search-card.component.scss"]
})
export class ImageSearchCardComponent extends BaseComponentDirective {
  readonly EquipmentItemType = EquipmentItemType;
  readonly EquipmentItemUsageType = EquipmentItemUsageType;

  @ViewChild("imageSearchComponent", { read: ImageSearchComponent })
  imageSearchComponent: ImageSearchComponent;

  @Input()
  header = this.translateService.instant("Search results");

  @Input()
  model: SearchModelInterface;

  @Input()
  ordering: string;

  @Input()
  loadMoreOnScroll = true;

  @Input()
  showUsageButton = true;

  @Input()
  showSortButton = true;

  @Input()
  pageSize: number;
  next: string;
  initialLoading = true;
  loading = true;
  images: ImageSearchInterface[] = [];
  searchUrl: string;
  usageType: EquipmentItemUsageType;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageSearchApiService: ImageSearchApiService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    public readonly translateService: TranslateService,
    @Inject(PLATFORM_ID) public readonly platformId: Record<string, unknown>
  ) {
    super(store$);
  }

  sortBy(ordering: string): void {
    this.ordering = ordering;
    this._loadData();
  }

  setUsageType(usageType: EquipmentItemUsageType): void {
    this.usageType = usageType;
    this._loadData();
  }

  private _loadData(): void {
    this.model = { ...this.model, page: 1 };
    this.imageSearchComponent.loadData(false);
  }
}
