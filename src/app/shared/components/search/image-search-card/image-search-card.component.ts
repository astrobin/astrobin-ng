import type { ChangeDetectorRef, ElementRef, OnChanges, SimpleChanges } from "@angular/core";
import { ChangeDetectionStrategy, Component, Inject, Input, PLATFORM_ID, ViewChild } from "@angular/core";
import type { Router } from "@angular/router";
import type { MainState } from "@app/store/state";
import { ImageAlias } from "@core/enums/image-alias.enum";
import type { ImageSearchInterface } from "@core/interfaces/image-search.interface";
import type { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import type { ClassicRoutesService } from "@core/services/classic-routes.service";
import type { EquipmentItemService } from "@core/services/equipment-item.service";
import type { SearchService } from "@core/services/search.service";
import { UtilsService } from "@core/services/utils/utils.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import { LoadEquipmentItem } from "@features/equipment/store/equipment.actions";
import { selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { EquipmentItemType, EquipmentItemUsageType } from "@features/equipment/types/equipment-item-base.interface";
import type { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import type { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageSearchComponent } from "@shared/components/search/image-search/image-search.component";
import { filter, take } from "rxjs/operators";

@Component({
  selector: "astrobin-image-search-card",
  templateUrl: "./image-search-card.component.html",
  styleUrls: ["./image-search-card.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  alias: ImageAlias.GALLERY | ImageAlias.REGULAR = ImageAlias.REGULAR;

  @Input()
  loadMoreOnScroll = true;

  @Input()
  showUsageButton = true;

  @Input()
  showSortButton = true;

  @Input()
  showMoreButton = true;

  @Input()
  showRetailers = true;

  @Input()
  showMarketplaceItems = true;

  @Input()
  showStaticOverlay = true;

  next: string;
  loading = true;
  images: ImageSearchInterface[] = [];
  searchUrl: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    public readonly translateService: TranslateService,
    @Inject(PLATFORM_ID) public readonly platformId: Record<string, unknown>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.model.ordering) {
      this.model = { ...this.model, ordering: "-likes" };
    }
    this.updateSearchUrl();
  }

  sortBy(ordering: string): void {
    this.model = { ...this.model, ordering, page: 1 };
    this.updateSearchUrl();
  }

  setUsageType(usageType: EquipmentItemUsageType): void {
    this.model = {
      ...this.model,
      [this.model.itemType]: {
        ...this.model[this.model.itemType],
        usageType
      },
      usageType,
      page: 1
    };
    this.updateSearchUrl();
  }

  updateSearchUrl(): void {
    this.currentUserProfile$.pipe(take(1)).subscribe((userProfile: UserProfileInterface) => {
      if (userProfile && !userProfile.enableNewSearchExperience) {
        this.searchUrl = this.equipmentItemService.getClassicSearchUrl(
          {
            id: this.model.itemId,
            klass: this.model.itemType
          } as EquipmentItem,
          this.model.usageType,
          this.model.ordering
        );

        if (this.model.username) {
          this.searchUrl = UtilsService.addOrUpdateUrlParam(this.searchUrl, "username", this.model.username.toString());
        }

        this.changeDetectorRef.markForCheck();
      } else {
        const { itemId, itemType, ...model } = this.model;

        this.store$
          .select(selectEquipmentItem, { id: itemId, type: itemType })
          .pipe(
            filter(item => !!item),
            take(1)
          )
          .subscribe(item => {
            const params = this.equipmentItemService.getSearchParams(item, this.model.ordering, this.model.usageType);
            this.searchUrl = `/search?p=${params}`;
            this.changeDetectorRef.markForCheck();
          });

        this.store$.dispatch(new LoadEquipmentItem({ id: itemId, type: itemType }));
      }
    });
  }

  onMoreClicked(event: MouseEvent): void {
    this.currentUserProfile$.pipe(take(1)).subscribe((userProfile: UserProfileInterface) => {
      if (userProfile && !userProfile.enableNewSearchExperience) {
        this.windowRefService.nativeWindow.location.href = this.searchUrl;
      } else {
        this.router.navigateByUrl(this.searchUrl);
      }
    });
  }
}
