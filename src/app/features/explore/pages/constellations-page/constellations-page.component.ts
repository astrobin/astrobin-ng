import { Component, OnInit } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { ConstellationInterface, ConstellationsService } from "@features/explore/services/constellations.service";
import { ViewportScroller } from "@angular/common";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { startWith, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-constellations-page",
  templateUrl: "./constellations-page.component.html",
  styleUrls: ["./constellations-page.component.scss"]
})
export class ConstellationsPageComponent extends BaseComponentDirective implements OnInit {
  pageTitle = this.translateService.instant("Constellations");
  constellations: ConstellationInterface[] = [];

  constructor(
    public readonly store$: Store<State>,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly constellationsService: ConstellationsService,
    public readonly viewportScroller: ViewportScroller,
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService
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

  findImages(constellation: ConstellationInterface): boolean {
    this.loadingService.setLoading(true);
    this.windowRefService.nativeWindow.location.href = this.constellationsService.getFindImagesLink(constellation);
    return false;
  }
}
