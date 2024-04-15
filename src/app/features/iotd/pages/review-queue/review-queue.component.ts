import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  QueryList,
  ViewChildren
} from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { State } from "@app/store/state";
import { BasePromotionQueueComponent } from "@features/iotd/components/base-promotion-queue/base-promotion-queue.component";
import { ReviewerSeenImage, VoteInterface } from "@features/iotd/services/iotd-api.service";
import {
  ClearReviewQueue,
  LoadDismissedImages,
  LoadReviewerSeenImages,
  LoadReviewQueue,
  LoadVotes,
  MarkReviewerSeenImage
} from "@features/iotd/store/iotd.actions";
import { selectReviewerSeenImages, selectReviewQueue, selectReviews } from "@features/iotd/store/iotd.selectors";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { TitleService } from "@shared/services/title/title.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { fromEvent, Observable } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from "ngx-cookie";
import { ReviewImageInterface } from "@features/iotd/types/review-image.interface";
import { Actions } from "@ngrx/effects";
import { debounceTime, distinctUntilChanged, filter, takeUntil, tap } from "rxjs/operators";
import { isPlatformBrowser } from "@angular/common";
import { ReviewEntryComponent } from "@features/iotd/components/review-entry/review-entry.component";

@Component({
  selector: "astrobin-review-queue",
  templateUrl: "./review-queue.component.html",
  styleUrls: ["./review-queue.component.scss"]
})
export class ReviewQueueComponent extends BasePromotionQueueComponent implements OnInit, AfterViewInit {
  queue$: Observable<PaginatedApiResultInterface<ReviewImageInterface>> = this.store$
    .select(selectReviewQueue)
    .pipe(filter(queue => !!queue), tap(() => this.loadingQueue = false), takeUntil(this.destroyed$));

  promotions$: Observable<VoteInterface[]> = this.store$.select(selectReviews).pipe(takeUntil(this.destroyed$));

  reviewerSeenImages$: Observable<ReviewerSeenImage[]> = this.store$
    .select(selectReviewerSeenImages)
    .pipe(takeUntil(this.destroyed$));

  @ViewChildren(ReviewEntryComponent)
  reviewEntryComponents: QueryList<ReviewEntryComponent>;

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
    public readonly changeDetectorRef: ChangeDetectorRef,
    @Inject(PLATFORM_ID) public readonly platformId: Object
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

  ngOnInit(): void {
    super.ngOnInit();

    const title = this.translateService.instant("Review queue");
    this.titleService.setTitle(title);
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [{ label: "IOTD" }, { label: title }]
      })
    );
  }

  ngAfterViewInit(): void {
    super.ngAfterViewInit();

    if (isPlatformBrowser(this.platformId)) {
      fromEvent(this.windowRefService.nativeWindow, "scroll")
        .pipe(takeUntil(this.destroyed$), debounceTime(100), distinctUntilChanged())
        .subscribe(() => {
          this.markVisibleImageAsReviewerSeen();
        });
    }
  }

  markVisibleImageAsReviewerSeen(): void {
    const viewportHeight = this.windowRefService.nativeWindow.innerHeight;
    const scrollPosition = this.windowRefService.nativeWindow.scrollY;

    this.reviewEntryComponents.forEach((component, index) => {
      const rect = component.elementRef.nativeElement.getBoundingClientRect();
      if (rect.top < (viewportHeight + scrollPosition) && rect.bottom > scrollPosition) {
        this.reviewerSeenImages$.subscribe(seenImages => {
          if (!seenImages.find(seenImage => seenImage.image === component.entry.pk)) {
            this.store$.dispatch(new MarkReviewerSeenImage({ id: component.entry.pk }));
          }
        });
      }
    });
  }

  refresh(sort: "newest" | "oldest" | "default" = "default"): void {
    super.refresh(sort);
    this.store$.dispatch(new LoadDismissedImages());
    this.store$.dispatch(new LoadReviewerSeenImages());
  }

  loadQueue(page: number, sort: "newest" | "oldest" | "default" = "default"): void {
    this.store$.dispatch(new ClearReviewQueue());

    this.loadingQueue = true;
    this.changeDetectorRef.detectChanges();

    this.store$.dispatch(new LoadReviewQueue({ page, sort }));
  }

  loadPromotions(): void {
    this.store$.dispatch(new LoadVotes());
  }

  maxPromotionsPerDay(backendConfig: BackendConfigInterface): number {
    return backendConfig.IOTD_REVIEW_MAX_PER_DAY;
  }
}
