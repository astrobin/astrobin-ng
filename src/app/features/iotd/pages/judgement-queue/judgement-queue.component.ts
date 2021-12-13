import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { State } from "@app/store/state";
import { BasePromotionQueueComponent } from "@features/iotd/components/base-promotion-queue/base-promotion-queue.component";
import { IotdApiService, IotdInterface, VoteInterface } from "@features/iotd/services/iotd-api.service";
import { LoadFutureIods, LoadJudgementQueue, LoadReviewQueue, LoadVotes } from "@features/iotd/store/iotd.actions";
import {
  selectFutureIotds,
  selectJudgementQueue,
  selectReviewQueue,
  selectReviews
} from "@features/iotd/store/iotd.selectors";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { TitleService } from "@shared/services/title/title.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { forkJoin, Observable } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { ReviewImageInterface } from "@features/iotd/types/review-image.interface";
import { Actions } from "@ngrx/effects";
import { TimeagoClock, TimeagoFormatter, TimeagoIntl, TimeagoPipe } from "ngx-timeago";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";

@Component({
  selector: "astrobin-judgement-queue",
  templateUrl: "./judgement-queue.component.html",
  styleUrls: ["./judgement-queue.component.scss"]
})
export class JudgementQueueComponent extends BasePromotionQueueComponent implements OnInit {
  queue$: Observable<PaginatedApiResultInterface<ReviewImageInterface>> = this.store$.select(selectJudgementQueue);
  promotions$: Observable<IotdInterface[]> = this.store$.select(selectFutureIotds);
  cannotSelectReason: string;
  nextAvailableSelectionTime: string;

  constructor(
    public readonly store$: Store<State>,
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
    public readonly changeDectectorRef: ChangeDetectorRef,
    public readonly timeagoFormatter: TimeagoFormatter,
    public readonly timeagoClock: TimeagoClock,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(
      store$,
      actions$,
      router,
      activatedRoute,
      popNotificationsService,
      translateService,
      windowRefService,
      cookieService
    );
  }

  ngOnInit(): void {
    super.ngOnInit();

    const title = this.translateService.instant("Judgement queue");
    this.titleService.setTitle(title);
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [{ label: "IOTD" }, { label: title }]
      })
    );

    this.supportsMaxPromotionsPerDayInfo = false;
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
    this.store$.dispatch(new LoadJudgementQueue({ page, sort }));
  }

  loadPromotions(): void {
    this.store$.dispatch(new LoadFutureIods());
  }

  maxPromotionsPerDay(backendConfig: BackendConfigInterface): number {
    return backendConfig.IOTD_JUDGEMENT_MAX_PER_DAY;
  }

  get cannotSelectMessage(): string {
    return this.translateService.instant(
      "Sorry, you cannot select an IOTD right now: <strong>{{ reason }}</strong>. Please try again in <strong>{{ time }}</strong>.",
      {
        reason: this.cannotSelectReason,
        time: new TimeagoPipe(
          this.timeagoIntl,
          this.changeDectectorRef,
          this.timeagoFormatter,
          this.timeagoClock
        ).transform(this.nextAvailableSelectionTime)
      }
    );
  }
}
