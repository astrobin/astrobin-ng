import type { OnInit } from "@angular/core";
import { ChangeDetectorRef, Component, Inject, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import type { MainState } from "@app/store/state";
import type { BackendConfigInterface } from "@core/interfaces/backend-config.interface";
import type { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { TitleService } from "@core/services/title/title.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { BasePromotionQueueComponent } from "@features/iotd/components/base-promotion-queue/base-promotion-queue.component";
import type { IotdInterface } from "@features/iotd/services/iotd-api.service";
import { IotdApiService } from "@features/iotd/services/iotd-api.service";
import { ClearJudgementQueue, LoadFutureIods, LoadJudgementQueue } from "@features/iotd/store/iotd.actions";
import { selectFutureIotds, selectJudgementQueue } from "@features/iotd/store/iotd.selectors";
import type { ReviewImageInterface } from "@features/iotd/types/review-image.interface";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { CookieService } from "ngx-cookie";
import { TimeagoClock, TimeagoFormatter, TimeagoIntl, TimeagoPipe } from "ngx-timeago";
import type { Observable } from "rxjs";
import { forkJoin } from "rxjs";
import { filter, takeUntil, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-judgement-queue",
  templateUrl: "./judgement-queue.component.html",
  styleUrls: ["./judgement-queue.component.scss"]
})
export class JudgementQueueComponent extends BasePromotionQueueComponent implements OnInit {
  queue$: Observable<PaginatedApiResultInterface<ReviewImageInterface>> = this.store$.select(selectJudgementQueue).pipe(
    filter(queue => !!queue),
    tap(() => (this.loadingQueue = false)),
    takeUntil(this.destroyed$)
  );
  promotions$: Observable<IotdInterface[]> = this.store$.select(selectFutureIotds).pipe(takeUntil(this.destroyed$));
  cannotSelectReason: string;
  nextAvailableSelectionTime: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly router: Router,
    public readonly activatedRoute: ActivatedRoute,
    public readonly translateService: TranslateService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly titleService: TitleService,
    public readonly windowRefService: WindowRefService,
    public readonly cookieService: CookieService,
    public readonly iotdApiService: IotdApiService,
    public readonly timeagoIntl: TimeagoIntl,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly timeagoFormatter: TimeagoFormatter,
    public readonly timeagoClock: TimeagoClock,
    public readonly classicRoutesService: ClassicRoutesService,
    @Inject(PLATFORM_ID) public readonly platformId: object
  ) {
    super(
      store$,
      actions$,
      router,
      activatedRoute,
      popNotificationsService,
      translateService,
      windowRefService,
      cookieService,
      platformId
    );
  }

  get cannotSelectMessage(): string {
    return this.translateService.instant(
      "Sorry, you cannot select an IOTD right now: <strong>{{ reason }}</strong>. Please try again in <strong>{{ time }}</strong>.",
      {
        reason: this.cannotSelectReason,
        time: new TimeagoPipe(
          this.timeagoIntl,
          this.changeDetectorRef,
          this.timeagoFormatter,
          this.timeagoClock
        ).transform(this.nextAvailableSelectionTime)
      }
    );
  }

  ngOnInit(): void {
    this.supportsMaxPromotionsPerDayInfo = false;

    const title = this.translateService.instant("Judgement queue");
    this.titleService.setTitle(title);
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [{ label: "IOTD" }, { label: title }]
      })
    );

    super.ngOnInit();
  }

  refresh(sort: "newest" | "oldest" | "default" = "default"): void {
    super.refresh(sort);

    forkJoin([
      this.iotdApiService.getCannotSelectNowReason(),
      this.iotdApiService.getNextAvailableSelectionTime()
    ]).subscribe(results => {
      this.cannotSelectReason = results[0];
      this.nextAvailableSelectionTime = results[1];
    });
  }

  loadQueue(page: number, sort: "newest" | "oldest" | "default" = "default"): void {
    this.store$.dispatch(new ClearJudgementQueue());

    this.loadingQueue = true;
    this.changeDetectorRef.detectChanges();

    this.store$.dispatch(new LoadJudgementQueue({ page, sort }));
  }

  loadPromotions(): void {
    this.store$.dispatch(new LoadFutureIods());
  }

  maxPromotionsPerDay(backendConfig: BackendConfigInterface): number {
    return backendConfig.IOTD_JUDGEMENT_MAX_PER_DAY;
  }
}
