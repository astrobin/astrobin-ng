import { Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { ImageSearchInterface } from "@shared/interfaces/image-search.interface";
import { ImageSearchApiService } from "@shared/services/api/classic/images/image/image-search-api.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { fromEvent } from "rxjs";
import { debounceTime, distinctUntilChanged, takeUntil } from "rxjs/operators";
import { WindowRefService } from "@shared/services/window-ref.service";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";

@Component({
  selector: "astrobin-image-search",
  templateUrl: "./image-search.component.html",
  styleUrls: ["./image-search.component.scss"]
})
export class ImageSearchComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input()
  header = this.translateService.instant("Search results");

  @Input()
  text: string;

  @Input()
  itemType: EquipmentItemType;

  @Input()
  itemId: EquipmentItem["id"];

  @Input()
  ordering: string;

  page = 1;
  next: string;
  initialLoading = true;
  loading = true;
  images: ImageSearchInterface[] = [];
  searchUrl: string;

  constructor(
    public readonly store$: Store<State>,
    public readonly imageSearchApiService: ImageSearchApiService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly windowRefService: WindowRefService,
    public readonly elementRef: ElementRef,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    fromEvent(this.windowRefService.nativeWindow, "scroll")
      .pipe(takeUntil(this.destroyed$), debounceTime(50), distinctUntilChanged())
      .subscribe(() => this._onScroll());
  }

  ngOnChanges(changes: SimpleChanges) {
    this.searchUrl = `${this.classicRoutesService.SEARCH}?d=i&sort=${this.ordering}&q="${encodeURIComponent(
      this.text
    )}"`;
    this._loadData(false);
  }

  sortBy(ordering: string): void {
    this.ordering = ordering;
    this.page = 1;
    this._loadData(false);
  }

  private _loadData(cumulative = true): void {
    this.loading = true;

    if (this.page === 1) {
      this.initialLoading = true;
    }

    this.imageSearchApiService
      .search({ itemType: this.itemType, itemId: this.itemId, ordering: this.ordering, page: this.page })
      .subscribe(response => {
        this.next = response.next;

        if (!cumulative) {
          this.images = [];
        }

        this.images = [...this.images, ...response.results.filter(image => !!image.galleryThumbnail)];
        this.loading = false;
        this.initialLoading = false;

        this._onScroll();
      });
  }

  private _onScroll() {
    const window = this.windowRefService.nativeWindow;
    const rect = this.elementRef.nativeElement.getBoundingClientRect();

    if (!this.loading && !!this.next && rect.bottom < window.innerHeight + 200) {
      this.page += 1;
      this._loadData();
    }
  }
}
