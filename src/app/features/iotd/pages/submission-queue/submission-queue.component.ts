import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { State } from "@app/store/state";
import { BasePromotionQueueComponent } from "@features/iotd/components/base-promotion-queue/base-promotion-queue.component";
import { SubmissionInterface } from "@features/iotd/services/iotd-api.service";
import { ClearSubmissionQueue, LoadSubmissionQueue, LoadSubmissions } from "@features/iotd/store/iotd.actions";
import { selectSubmissionQueue, selectSubmissions } from "@features/iotd/store/iotd.selectors";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { TitleService } from "@shared/services/title/title.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Observable } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from "ngx-cookie";
import { SubmissionImageInterface } from "@features/iotd/types/submission-image.interface";
import { Actions } from "@ngrx/effects";
import { filter, takeUntil, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-submission-queue",
  templateUrl: "./submission-queue.component.html",
  styleUrls: ["./submission-queue.component.scss"]
})
export class SubmissionQueueComponent extends BasePromotionQueueComponent implements OnInit {
  queue$: Observable<PaginatedApiResultInterface<SubmissionImageInterface>> = this.store$
    .select(selectSubmissionQueue)
    .pipe(filter(queue => !!queue), tap(() => this.loadingQueue = false), takeUntil(this.destroyed$));
  promotions$: Observable<SubmissionInterface[]> = this.store$
    .select(selectSubmissions)
    .pipe(takeUntil(this.destroyed$));

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
    public readonly changeDetectorRef: ChangeDetectorRef
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

    const title = this.translateService.instant("Submission queue");
    this.titleService.setTitle(title);
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [{ label: "IOTD" }, { label: title }]
      })
    );
  }

  loadQueue(page: number, sort: "newest" | "oldest" | "default" = "default"): void {
    this.store$.dispatch(new ClearSubmissionQueue());

    this.loadingQueue = true;
    this.changeDetectorRef.detectChanges();

    this.store$.dispatch(new LoadSubmissionQueue({ page, sort }));
  }

  loadPromotions(): void {
    this.store$.dispatch(new LoadSubmissions());
  }

  maxPromotionsPerDay(backendConfig: BackendConfigInterface): number {
    return backendConfig.IOTD_SUBMISSION_MAX_PER_DAY;
  }
}
