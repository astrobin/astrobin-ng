import { ChangeDetectorRef, OnDestroy, OnInit, Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { MainState } from "@app/store/state";
import { ImageInterface, ImageRevisionInterface, FINAL_REVISION_LABEL } from "@core/interfaces/image.interface";
import { CollapseSyncService } from "@core/services/collapse-sync.service";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { SearchService } from "@core/services/search.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { CookieService } from "ngx-cookie";
import { Subscription } from "rxjs";
import { filter } from "rxjs/operators";

const COLLAPSE_COOKIE_PREFIX = "astrobin-collapse-";

@Component({
  selector: "astrobin-image-viewer-section-base",
  template: ""
})
export abstract class ImageViewerSectionBaseComponent extends BaseComponentDirective implements OnInit, OnDestroy {
  @Input()
  image: ImageInterface;

  @Input()
  revisionLabel: ImageRevisionInterface["label"] = FINAL_REVISION_LABEL;

  // Used to highlight things on the page.
  @Input()
  searchModel: SearchModelInterface;

  protected collapsed = false;
  private collapseSubscription: Subscription;

  protected constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly windowRefService: WindowRefService,
    public readonly cookieService: CookieService,
    public readonly collapseSyncService: CollapseSyncService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();
    this.collapsed = this.cookieService.get(`${COLLAPSE_COOKIE_PREFIX}${this.constructor.name}`) === "true";

    this.collapseSubscription = this.collapseSyncService.collapseState$
      .pipe(filter(state => state.componentType === this.constructor.name))
      .subscribe(state => {
        this.collapsed = state.isCollapsed;
        this.changeDetectorRef.markForCheck();
        this._updateCollapseCookie();
      });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    if (this.collapseSubscription) {
      this.collapseSubscription.unsubscribe();
    }
  }

  protected search(model: SearchModelInterface): void {
    const params = this.searchService.modelToParams(model);
    this.imageViewerService.closeSlideShow(false);
    void this.router.navigateByUrl(`/search?p=${params}`);
  }

  protected toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this._updateCollapseCookie();
    this.collapseSyncService.emitCollapseState(this.constructor.name, this.collapsed);
  }

  private _updateCollapseCookie(): void {
    if (this.collapsed) {
      this.cookieService.put(`${COLLAPSE_COOKIE_PREFIX}${this.constructor.name}`, "true");
    } else {
      this.cookieService.remove(`${COLLAPSE_COOKIE_PREFIX}${this.constructor.name}`);
    }
  }
}
