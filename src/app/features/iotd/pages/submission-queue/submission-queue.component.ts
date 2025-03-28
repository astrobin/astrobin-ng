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
import { MainState } from "@app/store/state";
import { BasePromotionQueueComponent } from "@features/iotd/components/base-promotion-queue/base-promotion-queue.component";
import { SubmissionInterface, SubmitterSeenImage } from "@features/iotd/services/iotd-api.service";
import {
  ClearSubmissionQueue,
  LoadDismissedImages,
  LoadSubmissionQueue,
  LoadSubmissions,
  LoadSubmitterSeenImages,
  MarkSubmitterSeenImage
} from "@features/iotd/store/iotd.actions";
import {
  selectSubmissionQueue,
  selectSubmissions,
  selectSubmitterSeenImages
} from "@features/iotd/store/iotd.selectors";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BackendConfigInterface } from "@core/interfaces/backend-config.interface";
import { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { TitleService } from "@core/services/title/title.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { fromEvent, Observable, throttleTime } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { CookieService } from "ngx-cookie";
import { SubmissionImageInterface } from "@features/iotd/types/submission-image.interface";
import { Actions } from "@ngrx/effects";
import { filter, take, takeUntil, tap } from "rxjs/operators";
import { isPlatformBrowser } from "@angular/common";
import { SubmissionEntryComponent } from "@features/iotd/components/submission-entry/submission-entry.component";

@Component({
  selector: "astrobin-submission-queue",
  templateUrl: "./submission-queue.component.html",
  styleUrls: ["./submission-queue.component.scss"]
})
export class SubmissionQueueComponent extends BasePromotionQueueComponent implements OnInit, AfterViewInit {
  queue$: Observable<PaginatedApiResultInterface<SubmissionImageInterface>> = this.store$
    .select(selectSubmissionQueue)
    .pipe(
      filter(queue => !!queue),
      tap(() => (this.loadingQueue = false)),
      takeUntil(this.destroyed$)
    );

  promotions$: Observable<SubmissionInterface[]> = this.store$
    .select(selectSubmissions)
    .pipe(takeUntil(this.destroyed$));

  submitterSeenImages$: Observable<SubmitterSeenImage[]> = this.store$.select(selectSubmitterSeenImages);

  @ViewChildren(SubmissionEntryComponent)
  submissionEntryComponents: QueryList<SubmissionEntryComponent>;

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

    const title = this.translateService.instant("Submission queue");
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
          this.markVisibleImageAsSubmitterSeen();
        });
    }
  }

  markVisibleImageAsSubmitterSeen(): void {
    const viewportHeight = this.windowRefService.nativeWindow.innerHeight;
    const scrollPosition = this.windowRefService.nativeWindow.scrollY;

    this.submissionEntryComponents.forEach((component, index) => {
      const rect = component.elementRef.nativeElement.getBoundingClientRect();
      if (rect.top < (viewportHeight + scrollPosition) && rect.bottom > scrollPosition) {
        this.submitterSeenImages$.pipe(take(1)).subscribe(seenImages => {
          if (seenImages.map(seen => seen.image).includes(component.entry.pk)) {
            this.markingAsSeen = this.markingAsSeen.filter(pk => pk !== component.entry.pk);
          }

          const isAlreadySeen = !!seenImages.find(seenImage => seenImage.image === component.entry.pk);
          const isBeingMarkedAsSeen = this.markingAsSeen.includes(component.entry.pk);

            if (!isAlreadySeen && !isBeingMarkedAsSeen) {
            this.store$.dispatch(new MarkSubmitterSeenImage({ id: component.entry.pk }));
            this.markingAsSeen.push(component.entry.pk);
          }
        });
      }
    });
  }

  refresh(sort: "newest" | "oldest" | "default" = "default"): void {
    super.refresh(sort);
    this.store$.dispatch(new LoadDismissedImages());
    this.store$.dispatch(new LoadSubmitterSeenImages());
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
