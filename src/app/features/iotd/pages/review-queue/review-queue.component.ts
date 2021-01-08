import { Component, OnInit } from "@angular/core";
import { State } from "@app/store/state";
import { environment } from "@env/environment";
import { BasePromotionQueueComponent } from "@features/iotd/components/base-promotion-queue/base-promotion-queue.component";
import { VoteInterface } from "@features/iotd/services/review-queue-api.service";
import { InitHiddenReviewEntries, LoadReviewQueue, LoadVotes } from "@features/iotd/store/iotd.actions";
import { ReviewImageInterface } from "@features/iotd/store/iotd.reducer";
import { selectHiddenReviewEntries, selectReviewQueue, selectReviews } from "@features/iotd/store/iotd.selectors";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { PaginationService } from "@shared/services/pagination.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { TitleService } from "@shared/services/title/title.service";
import { Observable } from "rxjs";

@Component({
  selector: "astrobin-review-queue",
  templateUrl: "./review-queue.component.html",
  styleUrls: ["./review-queue.component.scss"]
})
export class ReviewQueueComponent extends BasePromotionQueueComponent implements OnInit {
  hiddenEntries$: Observable<number[]> = this.store$.select(selectHiddenReviewEntries);
  queue$: Observable<PaginatedApiResultInterface<ReviewImageInterface>> = this.store$.select(selectReviewQueue);
  promotions$: Observable<VoteInterface[]> = this.store$.select(selectReviews);

  constructor(
    public readonly store$: Store<State>,
    public readonly translateService: TranslateService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly titleService: TitleService,
    public readonly paginationService: PaginationService
  ) {
    super(store$, popNotificationsService, translateService);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.titleService.setTitle(this.translateService.instant("Review queue"));
  }

  loadQueue(page: number): void {
    this.store$.dispatch(new LoadReviewQueue({ page }));
  }

  loadHiddenEntries(): void {
    this.store$.dispatch(new InitHiddenReviewEntries());
  }

  loadPromotions(): void {
    this.store$.dispatch(new LoadVotes());
  }

  maxPromotionsPerDay(backendConfig: BackendConfigInterface): number {
    return backendConfig.IOTD_REVIEW_MAX_PER_DAY;
  }
}
