import { ElementRef, OnInit, QueryList, Component, Input, ViewChildren } from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { selectBackendConfig } from "@app/store/selectors/app/app.selectors";
import { MainState } from "@app/store/state";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { BackendConfigInterface } from "@core/interfaces/backend-config.interface";
import { ImageInterface } from "@core/interfaces/image.interface";
import { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { distinctUntilChangedObj } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import {
  HiddenImage,
  IotdInterface,
  SubmissionInterface,
  VoteInterface
} from "@features/iotd/services/iotd-api.service";
import { LoadHiddenImages } from "@features/iotd/store/iotd.actions";
import { selectHiddenImages } from "@features/iotd/store/iotd.selectors";
import { ReviewImageInterface } from "@features/iotd/types/review-image.interface";
import { SubmissionImageInterface } from "@features/iotd/types/submission-image.interface";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { CookieService } from "ngx-cookie";
import { Observable } from "rxjs";
import { map, switchMap, takeUntil } from "rxjs/operators";

const FILL_SLOT_REMINDER_COOKIE = "astrobin-iotd-fill-slot-reminder";
const IOTD_PROMOTION_QUEUE_DISPLAY_HIDDEN_IMAGES_COOKIE = "astrobin-iotd-promotion-queue-display-hidden-images";

@Component({
  selector: "astrobin-base-promotion-queue",
  template: ""
})
export abstract class BasePromotionQueueComponent extends BaseComponentDirective implements OnInit {
  ImageAlias = ImageAlias;

  @Input()
  supportsMaxPromotionsPerDayInfo = true;

  page;
  pageSize$: Observable<number> = this.store$.select(selectBackendConfig).pipe(
    takeUntil(this.destroyed$),
    map(backendConfig => backendConfig.IOTD_QUEUES_PAGE_SIZE)
  );

  hiddenImages$: Observable<HiddenImage[]> = this.store$.select(selectHiddenImages).pipe(takeUntil(this.destroyed$));
  displayHiddenImages = true;

  loadingQueue: boolean;
  markingAsSeen: ImageInterface["pk"][] = [];

  abstract queue$: Observable<PaginatedApiResultInterface<SubmissionImageInterface | ReviewImageInterface>>;
  abstract promotions$: Observable<SubmissionInterface[] | VoteInterface[] | IotdInterface[]>;

  @ViewChildren("promotionQueueEntries")
  promotionQueueEntries: QueryList<any>;

  protected constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly router: Router,
    public readonly activatedRoute: ActivatedRoute,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly cookieService: CookieService,
    public readonly platformId: Object
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.page = this.activatedRoute.snapshot?.queryParamMap.get("page") || 1;

    const displayHiddenImagesCookieValue = this.cookieService.get(IOTD_PROMOTION_QUEUE_DISPLAY_HIDDEN_IMAGES_COOKIE);
    if (displayHiddenImagesCookieValue === null) {
      this.displayHiddenImages = false;
      this.toggleDisplayHiddenImages();
    } else if (displayHiddenImagesCookieValue === "1") {
      this.displayHiddenImages = true;
    } else if (displayHiddenImagesCookieValue === "0") {
      this.displayHiddenImages = false;
    }

    this.promotions$
      .pipe(
        takeUntil(this.destroyed$),
        distinctUntilChangedObj(),
        switchMap(promotions =>
          this.store$.select(selectBackendConfig).pipe(map(backendConfig => ({ promotions, backendConfig })))
        )
      )
      .subscribe(({ promotions, backendConfig }) => {
        const showInfo = this.supportsMaxPromotionsPerDayInfo && !this.cookieService.get(FILL_SLOT_REMINDER_COOKIE);
        if (showInfo && promotions.length === this.maxPromotionsPerDay(backendConfig)) {
          const notification = this.popNotificationsService.info(
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
          );

          if (!!notification && !!notification.onAction) {
            notification.onAction.subscribe(() => {
              this.cookieService.put(FILL_SLOT_REMINDER_COOKIE, "1", {
                path: "/",
                expires: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
              });
            });
          }
        }
      });

    this.refresh();
  }

  refresh(sort: "newest" | "oldest" | "default" = "default"): void {
    this.store$.dispatch(new LoadHiddenImages());

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
        this.windowRefService.scroll({ top: 0 });
      });
  }

  toggleDisplayHiddenImages(): void {
    this.displayHiddenImages = !this.displayHiddenImages;
    this.cookieService.put(IOTD_PROMOTION_QUEUE_DISPLAY_HIDDEN_IMAGES_COOKIE, this.displayHiddenImages ? "1" : "0", {
      path: "/",
      expires: null
    });
  }

  entryExists(imageId: number): boolean {
    return this._getEntryElement(imageId) !== null;
  }

  isHidden(imageId, hiddenImages): boolean {
    return hiddenImages.some(hiddenImage => hiddenImage.image === imageId);
  }

  scrollToEntry(imageId: number): void {
    const element = this._getEntryElement(imageId);

    if (element) {
      element.nativeElement.scrollIntoView({ behavior: "smooth" });
    }
  }

  comeBackInMinutesMessage(minutes: number): string {
    return this.translateService.instant("Please come back in {{0}} minutes!", {
      0: minutes
    });
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
