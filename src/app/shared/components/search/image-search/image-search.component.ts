import { Component, ElementRef, Inject, Input, OnChanges, OnInit, PLATFORM_ID, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { ImageSearchInterface } from "@shared/interfaces/image-search.interface";
import { ImageSearchApiService } from "@shared/services/api/classic/images/image/image-search-api.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { fromEvent } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentItemType, EquipmentItemUsageType } from "@features/equipment/types/equipment-item-base.interface";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";

@Component({
  selector: "astrobin-image-search",
  templateUrl: "./image-search.component.html",
  styleUrls: ["./image-search.component.scss"]
})
export class ImageSearchComponent extends BaseComponentDirective implements OnInit, OnChanges {
  readonly EquipmentItemType = EquipmentItemType;
  readonly EquipmentItemUsageType = EquipmentItemUsageType;

  @Input()
  model: SearchModelInterface;

  @Input()
  loadMoreOnScroll = true;

  next: string;
  initialLoading = true;
  loading = true;
  images: ImageSearchInterface[] = [];

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

  ngOnInit(): void {
    super.ngOnInit();

    if (isPlatformBrowser(this.platformId)) {
      fromEvent(this.windowRefService.nativeWindow, "scroll")
        .pipe(takeUntil(this.destroyed$), debounceTime(200), distinctUntilChanged())
        .subscribe(() => this._onScroll());
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.model) {
      this.loadData(false);
    }
  }

  loadData(cumulative = true): void {
    this.loading = true;

    if (this.model.page === 1) {
      this.initialLoading = true;
    }

    this.imageSearchApiService.search({ ...this.model, pageSize: 100 })
      .subscribe(response => {
        this.next = response.next;

        if (!cumulative) {
          this.images = [];
        }

        this.images = [...this.images, ...response.results.filter(image => !!image.galleryThumbnail)];
        this.loading = false;
        this.initialLoading = false;
      });
  }

  private _onScroll() {
    if (isPlatformServer(this.platformId)) {
      return;
    }

    if (!this.loadMoreOnScroll) {
      return;
    }

    const window = this.windowRefService.nativeWindow;
    const rect = this.elementRef.nativeElement.getBoundingClientRect();

    if (!this.loading && !!this.next && rect.bottom < window.innerHeight + 2000) {
      this.model = { ...this.model, page: (this.model.page || 1) + 1 };
      this.loadData();
    }
  }
}
