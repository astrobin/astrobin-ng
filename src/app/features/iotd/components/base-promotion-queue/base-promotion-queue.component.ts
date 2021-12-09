import { Component, ElementRef, OnInit, QueryList, ViewChildren } from "@angular/core";
import { selectApp, selectBackendConfig } from "@app/store/selectors/app/app.selectors";
import { State } from "@app/store/state";
import { HiddenImage, SubmissionInterface, VoteInterface } from "@features/iotd/services/iotd-api.service";
import { LoadDismissedImages, LoadHiddenImages } from "@features/iotd/store/iotd.actions";
import { ReviewImageInterface, SubmissionImageInterface } from "@features/iotd/store/iotd.reducer";
import { selectHiddenImages, selectSubmissions } from "@features/iotd/store/iotd.selectors";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { distinctUntilChangedObj } from "@shared/services/utils/utils.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Observable } from "rxjs";
import { filter, map, switchMap, take, takeUntil } from "rxjs/operators";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";

const FILL_SLOT_REMINDER_COOKIE = "astrobin-iotd-fill-slot-reminder";

@Component({
  selector: "astrobin-base-promotion-queue",
  template: ""
})
export abstract class BasePromotionQueueComponent extends BaseComponentDirective implements OnInit {
  ImageAlias = ImageAlias;

  page;
  pageSize$: Observable<number> = this.store$
    .select(selectBackendConfig)
    .pipe(map(backendConfig => backendConfig.IOTD_QUEUES_PAGE_SIZE));

  hiddenImages$: Observable<HiddenImage[]> = this.store$.select(selectHiddenImages);

  abstract queue$: Observable<PaginatedApiResultInterface<SubmissionImageInterface | ReviewImageInterface>>;
  abstract promotions$: Observable<SubmissionInterface[] | VoteInterface[]>;

  @ViewChildren("promotionQueueEntries")
  promotionQueueEntries: QueryList<any>;

  protected constructor(
    public readonly store$: Store<State>,
    public readonly router: Router,
    public readonly activatedRoute: ActivatedRoute,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly cookieService: CookieService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this.page = this.activatedRoute.snapshot.queryParamMap.get("page") || 1;

    this.promotions$
      .pipe(
        takeUntil(this.destroyed$),
        distinctUntilChangedObj(),
        switchMap(promotions =>
          this.store$.select(selectBackendConfig).pipe(map(backendConfig => ({ promotions, backendConfig })))
        )
      )
      .subscribe(({ promotions, backendConfig }) => {
        const showInfo = !this.cookieService.check(FILL_SLOT_REMINDER_COOKIE);
        if (showInfo && promotions.length === this.maxPromotionsPerDay(backendConfig)) {
          this.popNotificationsService
            .info(
              this.translateService.instant(
                "Please note: you don't <strong>have to</strong> use all your slots. It's ok to use fewer if you " +
                  "don't think there are that many worthy images today."
              ),
              null,
              {
                enableHtml: true,
                buttons: [
                  {
                    id: "1",
                    title: this.translateService.instant("Don't remind me for a month"),
                    classList: "btn btn-sm btn-secondary"
                  }
                ]
              }
            )
            .onAction.subscribe(() => {
              this.cookieService.set(FILL_SLOT_REMINDER_COOKIE, "1", 30, "/");
            });
        }
      });

    this.queue$
      .pipe(
        takeUntil(this.destroyed$),
        filter(queue => !!queue)
      )
      .subscribe(() => {
        this.promotionQueueEntries.changes.pipe(take(1)).subscribe(entries => {
          entries.forEach((entry, index) => {
            setTimeout(() => {
              entry.loadImage();
            }, index * 500);
          });
        });
      });

    this.refresh();
  }

  refresh(sort: "newest" | "oldest" | "default" = "default"): void {
    this.store$.dispatch(new LoadHiddenImages());
    this.store$.dispatch(new LoadDismissedImages());

    this.loadQueue(this.page, sort);
    this.loadPromotions();
  }

  abstract loadQueue(page: number, sort: "newest" | "oldest" | "default"): void;

  abstract loadPromotions(): void;

  abstract maxPromotionsPerDay(backendConfig: BackendConfigInterface): number;

  pageChange(page: number): void {
    this.page = page;

    const queryParams: Params = { page };

    this.router
      .navigate([], {
        relativeTo: this.activatedRoute,
        queryParams,
        queryParamsHandling: "merge"
      })
      .then(() => {
        this.loadQueue(page, "default");
        this.windowRefService.scroll({ top: 0, behavior: "smooth" });
      });
  }

  entryExists(imageId: number): boolean {
    return this._getEntryElement(imageId) !== null;
  }

  scrollToEntry(imageId: number): void {
    const element = this._getEntryElement(imageId);

    if (element) {
      element.nativeElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  private _getEntryElement(imageId: number): ElementRef | null {
    const matches = this.promotionQueueEntries.filter(
      entry => entry.elementRef.nativeElement.id === `promotion-queue-entry-${imageId}`
    );

    if (matches.length > 0) {
      return matches[0].elementRef;
    }

    return null;
  }
}
