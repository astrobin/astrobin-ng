import { Component, ElementRef, OnInit, QueryList, ViewChildren } from "@angular/core";
import { selectApp } from "@app/store/selectors/app/app.selectors";
import { State } from "@app/store/state";
import { VoteInterface } from "@features/iotd/services/review-queue-api.service";
import { SubmissionInterface } from "@features/iotd/services/submission-queue-api.service";
import {
  PromotionImageInterface,
  ReviewImageInterface,
  SubmissionImageInterface
} from "@features/iotd/store/iotd.reducer";
import { selectSubmissions } from "@features/iotd/store/iotd.selectors";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { distinctUntilChangedObj } from "@shared/services/utils/utils.service";
import { Observable } from "rxjs";
import { filter, map, switchMap, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-base-promotion-queue",
  template: ""
})
export abstract class BasePromotionQueueComponent extends BaseComponentDirective implements OnInit {
  page = 1;
  ImageAlias = ImageAlias;

  abstract hiddenEntries$: Observable<number[]>;
  abstract queue$: Observable<PaginatedApiResultInterface<SubmissionImageInterface | ReviewImageInterface>>;
  abstract promotions$: Observable<SubmissionInterface[] | VoteInterface[]>;

  @ViewChildren("promotionQueueEntries")
  promotionQueueEntries: QueryList<ElementRef>;

  protected constructor(
    public readonly store$: Store<State>,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.store$
      .select(selectApp)
      .pipe(
        takeUntil(this.destroyed$),
        map(state => state.backendConfig),
        filter(backendConfig => !!backendConfig),
        distinctUntilChangedObj(),
        switchMap(backendConfig =>
          this.store$.select(selectSubmissions).pipe(map(submissions => ({ backendConfig, submissions })))
        )
      )
      .subscribe(({ backendConfig, submissions }) => {
        if (submissions.length === this.maxPromotionsPerDay(backendConfig)) {
          this.popNotificationsService.info(
            this.translateService.instant(
              "Please note: you don't <strong>have to</strong> use all your slots. It's ok to use fewer if you " +
                "don't think there are that many worthy images today."
            ),
            null,
            {
              enableHtml: true
            }
          );
        }
      });

    this.refresh();
  }

  refresh(): void {
    this.loadHiddenEntries();
    this.loadQueue(1);
    this.loadPromotions();
  }

  abstract loadQueue(page: number): void;

  abstract loadHiddenEntries(): void;

  abstract loadPromotions(): void;

  abstract maxPromotionsPerDay(backendConfig: BackendConfigInterface): number;

  pageChange(page: number): void {
    this.page = page;
    this.loadQueue(page);
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

  excludeHiddenEntries(entries: PromotionImageInterface[], hiddenEntries: number[]): PromotionImageInterface[] {
    return entries.filter(entry => {
      return hiddenEntries.indexOf(entry.pk) === -1;
    });
  }

  private _getEntryElement(imageId: number): ElementRef | null {
    const matches = this.promotionQueueEntries.filter(
      entry => entry.nativeElement.id === `promotion-queue-entry-${imageId}`
    );

    if (matches.length > 0) {
      return matches[0];
    }

    return null;
  }
}
