import { Component, Inject, OnInit, PLATFORM_ID, ViewContainerRef } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TitleService } from "@shared/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { isPlatformBrowser } from "@angular/common";
import { WindowRefService } from "@shared/services/window-ref.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { filter, pairwise, takeUntil } from "rxjs/operators";
import { ImageService } from "@shared/services/image/image.service";
import { ImageViewerService } from "@shared/services/image-viewer.service";

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
export class HomeComponent extends BaseComponentDirective implements OnInit {
  protected isBrowser: boolean;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly classicRoutesService: ClassicRoutesService,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    public readonly windowRefService: WindowRefService,
    public readonly router: Router,
    public readonly route: ActivatedRoute,
    public readonly imageService: ImageService,
    public readonly imageViewerService: ImageViewerService,
    public readonly viewContainerRef: ViewContainerRef
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

    router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      if (!this.imageViewerService.slideshow) {
        this.imageViewerService.autoOpenSlideshow(this.componentId, this.route, this.viewContainerRef);
      } else {
        this.imageViewerService.closeSlideShow(false);
      }
    });
  }

  ngOnInit() {
    super.ngOnInit();

    this.store$.dispatch(new SetBreadcrumb({ breadcrumb: [] }));

    if (this.route.snapshot.data.image) {
      this.imageService.setMetaTags(this.route.snapshot.data.image);
    } else {
      this.titleService.setTitle(this.translateService.instant("Home of Astrophotography"));
    }
  }
}
