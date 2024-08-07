import { Component, ElementRef, Inject, Input, OnChanges, PLATFORM_ID, SimpleChanges, ViewChild } from "@angular/core";
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
export class ImageSearchCardComponent extends BaseComponentDirective implements OnChanges {
  readonly EquipmentItemType = EquipmentItemType;
  readonly EquipmentItemUsageType = EquipmentItemUsageType;

  @ViewChild("imageSearchComponent", { read: ImageSearchComponent })
  imageSearchComponent: ImageSearchComponent;

  @Input()
  header = this.translateService.instant("Search results");

  @Input()
  model: SearchModelInterface;

  @Input()
  loadMoreOnScroll = true;

  @Input()
  showUsageButton = true;

  @Input()
  showSortButton = true;

  next: string;
  initialLoading = true;
  loading = true;
  images: ImageSearchInterface[] = [];
  searchUrl: string;

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

  ngOnChanges(changes: SimpleChanges) {
    if (changes.model) {
      const urlParams = new URLSearchParams();
      urlParams.set("d", "i");
      urlParams.set("sort", this.model.ordering);

      if (this.model.itemType) {
        urlParams.set(`${this.model.itemType.toLowerCase()}_ids`, this.model.itemId.toString());
      }

      if (this.model.username) {
        urlParams.set("username", this.model.username.toString());
      }

      this.searchUrl = `${this.classicRoutesService.SEARCH}?${urlParams.toString()}`;
    }
  }

  sortBy(ordering: string): void {
    this.model = { ...this.model, ordering, page: 1 };
  }

  setUsageType(usageType: EquipmentItemUsageType): void {
    this.model = { ...this.model, usageType, page: 1 };
  }
}
