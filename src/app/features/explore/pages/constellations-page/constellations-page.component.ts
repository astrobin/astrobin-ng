import { Component, OnInit } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@core/services/title/title.service";
import { ConstellationInterface, ConstellationsService } from "@features/explore/services/constellations.service";
import { ViewportScroller } from "@angular/common";
import { LoadingService } from "@core/services/loading.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { startWith, takeUntil } from "rxjs/operators";
import { SearchService } from "@core/services/search.service";
import { Router } from "@angular/router";

@Component({
  selector: "astrobin-constellations-page",
  templateUrl: "./constellations-page.component.html",
  styleUrls: ["./constellations-page.component.scss"]
})
export class ConstellationsPageComponent extends BaseComponentDirective implements OnInit {
  pageTitle = this.translateService.instant("Constellations");
  constellations: ConstellationInterface[] = [];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly constellationsService: ConstellationsService,
    public readonly viewportScroller: ViewportScroller,
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService,
    public readonly searchService: SearchService,
    public readonly router: Router
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.titleService.setTitle(this.pageTitle);
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [{ label: this.translateService.instant("Explore") }, { label: this.pageTitle }]
      })
    );

    this.translateService.onLangChange
      .pipe(takeUntil(this.destroyed$), startWith({ lang: this.translateService.currentLang }))
      .subscribe(event => {
        this.constellations = this.constellationsService.getConstellations(event.lang);
      });
  }

  jumpTo(constellation: ConstellationInterface) {
    this.viewportScroller.scrollToAnchor(`constellation-${constellation.id}`);
  }

  getFindImagesUrl(constellation: ConstellationInterface): string {
    const params = this.searchService.modelToParams({ constellation: constellation.id });
    return `/search?p=${params}`;
  }

  findImages(event: MouseEvent, constellation: ConstellationInterface){
    if (event.ctrlKey || event.metaKey || event.button === 1) {
      return;
    }

    event.preventDefault();

    this.router.navigateByUrl(this.getFindImagesUrl(constellation));
  }
}
