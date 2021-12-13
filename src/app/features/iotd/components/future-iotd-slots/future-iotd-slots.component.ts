import { Component, OnInit } from "@angular/core";
import { selectIotdMaxFutureIotds } from "@app/store/selectors/app/app.selectors";
import { State } from "@app/store/state";
import { BasePromotionSlotsComponent } from "@features/iotd/components/base-promotion-slots/base-promotion-slots.component";
import { IotdInterface } from "@features/iotd/services/iotd-api.service";
import { selectFutureIotds } from "@features/iotd/store/iotd.selectors";
import { select, Store } from "@ngrx/store";
import { Observable } from "rxjs";

@Component({
  selector: "astrobin-future-iotd-slots",
  templateUrl: "../base-promotion-slots/base-promotion-slots.component.html",
  styleUrls: ["../base-promotion-slots/base-promotion-slots.component.scss"]
})
export class FutureIotdSlotsComponent extends BasePromotionSlotsComponent implements OnInit {
  promotions$: Observable<IotdInterface[]> = this.store$.select(selectFutureIotds);
  slotsCount$: Observable<number> = this.store$.pipe(select(selectIotdMaxFutureIotds));

  constructor(public readonly store$: Store<State>) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();
    this.slotsAreFutureDate = true;
  }
}
