import { isPlatformBrowser } from "@angular/common";
import type { AfterViewInit, ChangeDetectorRef, OnInit, QueryList } from "@angular/core";
import { Component, Inject, PLATFORM_ID, ViewChildren } from "@angular/core";
import type { ActivatedRoute, Router } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import type { MainState } from "@app/store/state";
import type { BackendConfigInterface } from "@core/interfaces/backend-config.interface";
import type { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import type { PopNotificationsService } from "@core/services/pop-notifications.service";
import type { TitleService } from "@core/services/title/title.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import { BasePromotionQueueComponent } from "@features/iotd/components/base-promotion-queue/base-promotion-queue.component";
import { ReviewEntryComponent } from "@features/iotd/components/review-entry/review-entry.component";
import type { ReviewerSeenImage, VoteInterface } from "@features/iotd/services/iotd-api.service";
import {
  ClearReviewQueue,
  LoadDismissedImages,
  LoadReviewerSeenImages,
  LoadReviewQueue,
  LoadVotes,
  MarkReviewerSeenImage
} from "@features/iotd/store/iotd.actions";
import { selectReviewerSeenImages, selectReviewQueue, selectReviews } from "@features/iotd/store/iotd.selectors";
import type { ReviewImageInterface } from "@features/iotd/types/review-image.interface";
import type { Actions } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import type { CookieService } from "ngx-cookie";
import type { Observable } from "rxjs";
import { fromEvent, throttleTime } from "rxjs";
import { filter, take, takeUntil, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-review-queue",
  templateUrl: "./review-queue.component.html",
  styleUrls: ["./review-queue.component.scss"]
})
export class ReviewQueueComponent extends BasePromotionQueueComponent implements OnInit, AfterViewInit {
  queue$: Observable<PaginatedApiResultInterface<ReviewImageInterface>> = this.store$.select(selectReviewQueue).pipe(
    filter(queue => !!queue),
    tap(() => (this.loadingQueue = false)),
    takeUntil(this.destroyed$)
  );

  promotions$: Observable<VoteInterface[]> = this.store$.select(selectReviews).pipe(takeUntil(this.destroyed$));

  reviewerSeenImages$: Observable<ReviewerSeenImage[]> = this.store$.select(selectReviewerSeenImages);

  @ViewChildren(ReviewEntryComponent)
  reviewEntryComponents: QueryList<ReviewEntryComponent>;

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
    if (isPlatformBrowser(this.platformId)) {
      fromEvent(this.windowRefService.nativeWindow, "scroll")
        .pipe(takeUntil(this.destroyed$), throttleTime(100))
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
      if (rect.top < viewportHeight + scrollPosition && rect.bottom > scrollPosition) {
        this.reviewerSeenImages$.pipe(take(1)).subscribe(seenImages => {
          if (seenImages.map(seen => seen.image).includes(component.entry.pk)) {
            this.markingAsSeen = this.markingAsSeen.filter(pk => pk !== component.entry.pk);
          }

          const isAlreadySeen = !!seenImages.find(seenImage => seenImage.image === component.entry.pk);
          const isBeingMarkedAsSeen = this.markingAsSeen.includes(component.entry.pk);

          if (!isAlreadySeen && !isBeingMarkedAsSeen) {
            this.store$.dispatch(new MarkReviewerSeenImage({ id: component.entry.pk }));
            this.markingAsSeen.push(component.entry.pk);
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
