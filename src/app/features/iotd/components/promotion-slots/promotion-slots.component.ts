import { Component, EventEmitter, Output } from "@angular/core";
import { selectIotdMaxSubmissionsPerDay } from "@app/store/selectors/app/app.selectors";
import { State } from "@app/store/state";
import { SubmissionInterface } from "@features/iotd/services/submission-queue-api.service";
import { selectSubmissions } from "@features/iotd/store/iotd.selectors";
import { select, Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "astrobin-promotion-slots",
  templateUrl: "./promotion-slots.component.html",
  styleUrls: ["./promotion-slots.component.scss"]
})
export class PromotionSlotsComponent extends BaseComponentDirective {
  ImageAlias = ImageAlias;
  submissions$: Observable<SubmissionInterface[]> = this.store$.select(selectSubmissions);
  promotionSlots$: Observable<number[]> = this.store$.pipe(
    select(selectIotdMaxSubmissionsPerDay),
    map(amount => Array(amount))
  );

  @Output()
  slotClick = new EventEmitter();

  constructor(public readonly store$: Store<State>) {
    super();
  }
}
