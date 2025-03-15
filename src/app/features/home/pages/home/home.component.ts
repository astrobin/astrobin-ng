import { AfterViewInit, Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TitleService } from "@core/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { isPlatformBrowser } from "@angular/common";
import { WindowRefService } from "@core/services/window-ref.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, pairwise, takeUntil } from "rxjs/operators";
import { ImageService } from "@core/services/image/image.service";
import { ImageViewerService } from "@core/services/image-viewer.service";

@Component({
  selector: "astrobin-home",
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
          gap-3 gap-sm-2
          mb-3
        ">
            <h4>{{ "Latest from the forums" | translate }}</h4>
            <div class="d-flex gap-2 align-items-center">
              <a
                [href]="classicRoutesService.FORUM_LATEST"
                class="no-wrap btn btn-link link-primary btn-xs m-0"
              >
                {{ "View all" | translate }}
              </a>

              <a
                [href]="classicRoutesService.FORUM_HOME + '#new-topic'"
                class="no-wrap btn btn-primary btn-xs"
              >
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
  styleUrls: ["./home.component.scss"]
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
    public readonly router: Router,
    public readonly activatedRoute: ActivatedRoute,
    public readonly imageService: ImageService,
    public readonly imageViewerService: ImageViewerService
  ) {
    super(store$);
    this.isBrowser = isPlatformBrowser(this.platformId);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      pairwise(),
      takeUntil(this.destroyed$)
    ).subscribe(([prev, current]: [NavigationEnd, NavigationEnd]) => {
      const isBack = this.router.getCurrentNavigation()?.trigger === "popstate";
      const isSameUrl = prev.urlAfterRedirects === current.urlAfterRedirects;
      if (this.isBrowser && isSameUrl && !isBack) {
        this.windowRefService.nativeWindow.location.reload();
      }
    });
  }

  ngOnInit() {
    super.ngOnInit();

    this.store$.dispatch(new SetBreadcrumb({ breadcrumb: [] }));

    if (this.activatedRoute.snapshot.data.image) {
      this.imageService.setMetaTags(this.activatedRoute.snapshot.data.image);
    } else {
      this.titleService.setTitle(this.translateService.instant("Home of Astrophotography"));
    }
  }

  ngAfterViewInit() {
    this.imageViewerService.autoOpenSlideshow(this.componentId, this.activatedRoute);
  }
}
