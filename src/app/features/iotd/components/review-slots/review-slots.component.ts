import type { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import type { ActivatedRoute } from "@angular/router";
import { selectIotdMaxReviewsPerDay } from "@app/store/selectors/app/app.selectors";
import type { MainState } from "@app/store/state";
import type { PopNotificationsService } from "@core/services/pop-notifications.service";
import {
  BasePromotionSlotsComponent,
  SlotType
} from "@features/iotd/components/base-promotion-slots/base-promotion-slots.component";
import type { VoteInterface } from "@features/iotd/services/iotd-api.service";
import { selectReviews } from "@features/iotd/store/iotd.selectors";
import type { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import type { Store } from "@ngrx/store";
import { select } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import type { Observable } from "rxjs";

@Component({
  selector: "astrobin-review-slots",
  templateUrl: "../base-promotion-slots/base-promotion-slots.component.html",
  styleUrls: ["../base-promotion-slots/base-promotion-slots.component.scss"]
})
export class ReviewSlotsComponent extends BasePromotionSlotsComponent implements OnInit {
  promotions$: Observable<VoteInterface[]> = this.store$.select(selectReviews);
  slotsCount$: Observable<number> = this.store$.pipe(select(selectIotdMaxReviewsPerDay));

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modalService: NgbModal,
    public readonly translateService: TranslateService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$, modalService, translateService, activatedRoute, popNotificationsService);
  }

  ngOnInit() {
    this.slotType = SlotType.REVIEW;
    super.ngOnInit();
  }
}
