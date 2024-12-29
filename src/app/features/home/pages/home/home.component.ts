import { AfterViewInit, Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TitleService } from "@shared/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { isPlatformBrowser } from "@angular/common";
import { WindowRefService } from "@shared/services/window-ref.service";
import { NavigationEnd, Router } from "@angular/router";
import { filter, pairwise, takeUntil } from "rxjs/operators";

@Component({
  selector: 'astrobin-home',
  template: `
    <div class="page">

      <ng-container *ngIf="isBrowser; else loadingTemplate">
        <astrobin-iotd></astrobin-iotd>

        <div class="latest-from-the-forums">
          <div class="
          header
          d-flex
          justify-content-center justify-content-md-between
          align-items-center
          flex-column flex-md-row
          mb-3
        ">
            <h4>{{ "Latest from the forums" | translate }}</h4>
            <div class="d-flex gap-2">
              <a [href]="classicRoutesService.FORUM_LATEST">
                {{ "View all" | translate }}
              </a>

              <span class="text-muted">&middot;</span>

              <a [href]="classicRoutesService.FORUM_HOME + '#new-topic'">
                {{ "New topic" | translate }}
              </a>
            </div>
          </div>

          <astrobin-forum-preview
            [showHeader]="false"
            [showFooter]="false"
            [useCard]="false"
          ></astrobin-forum-preview>
        </div>

        <astrobin-feed></astrobin-feed>
      </ng-container>
    </div>

    <ng-template #loadingTemplate>
      <astrobin-loading-indicator></astrobin-loading-indicator>
    </ng-template>
  `,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  protected isBrowser: boolean;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly classicRoutesService: ClassicRoutesService,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    public readonly windowRefService: WindowRefService,
    public readonly router: Router
  ) {
    super(store$);
    this.isBrowser = isPlatformBrowser(platformId);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      pairwise(),
      takeUntil(this.destroyed$)
    ).subscribe(([prev, current]: [NavigationEnd, NavigationEnd]) => {
      if (prev.urlAfterRedirects === "/" && current.urlAfterRedirects === "/" && this.isBrowser) {
        this.windowRefService.nativeWindow.location.reload();
      }
    });
  }

  ngOnInit() {
    super.ngOnInit();

    this.store$.dispatch(new SetBreadcrumb({ breadcrumb: [] }));
    this.titleService.setTitle(this.translateService.instant('Home of Astrophotography'));
  }

  ngAfterViewInit() {
    this.windowRefService.scroll({ top: 0, behavior: "auto" });
  }
}
