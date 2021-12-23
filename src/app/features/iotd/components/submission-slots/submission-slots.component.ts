import { Component, OnInit } from "@angular/core";
import { selectIotdMaxSubmissionsPerDay } from "@app/store/selectors/app/app.selectors";
import { State } from "@app/store/state";
import {
  BasePromotionSlotsComponent,
  SlotType
} from "@features/iotd/components/base-promotion-slots/base-promotion-slots.component";
import { SubmissionInterface } from "@features/iotd/services/iotd-api.service";
import { selectSubmissions } from "@features/iotd/store/iotd.selectors";
import { select, Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute } from "@angular/router";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";

@Component({
  selector: "astrobin-submission-slots",
  templateUrl: "../base-promotion-slots/base-promotion-slots.component.html",
  styleUrls: ["../base-promotion-slots/base-promotion-slots.component.scss"]
})
export class SubmissionSlotsComponent extends BasePromotionSlotsComponent implements OnInit {
  promotions$: Observable<SubmissionInterface[]> = this.store$.select(selectSubmissions);
  slotsCount$: Observable<number> = this.store$.pipe(select(selectIotdMaxSubmissionsPerDay));

  constructor(
    public readonly store$: Store<State>,
    public readonly modalService: NgbModal,
    public readonly translateService: TranslateService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$, modalService, translateService, activatedRoute, popNotificationsService);
  }

  ngOnInit() {
    this.slotType = SlotType.SUBMISSION;
    super.ngOnInit();
  }
}
