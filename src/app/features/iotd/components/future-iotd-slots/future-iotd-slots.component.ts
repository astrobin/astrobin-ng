import type { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { selectIotdMaxFutureIotds } from "@app/store/selectors/app/app.selectors";
import type { MainState } from "@app/store/state";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import {
  BasePromotionSlotsComponent,
  SlotType
} from "@features/iotd/components/base-promotion-slots/base-promotion-slots.component";
import type { IotdInterface } from "@features/iotd/services/iotd-api.service";
import { selectFutureIotds } from "@features/iotd/store/iotd.selectors";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { select, Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import type { Observable } from "rxjs";

@Component({
  selector: "astrobin-future-iotd-slots",
  templateUrl: "../base-promotion-slots/base-promotion-slots.component.html",
  styleUrls: ["../base-promotion-slots/base-promotion-slots.component.scss", "future-iotd-slots.component.scss"]
})
export class FutureIotdSlotsComponent extends BasePromotionSlotsComponent implements OnInit {
  promotions$: Observable<IotdInterface[]> = this.store$.select(selectFutureIotds);
  slotsCount$: Observable<number> = this.store$.pipe(select(selectIotdMaxFutureIotds));

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
    this.slotType = SlotType.JUDGEMENT;
    super.ngOnInit();
  }
}
