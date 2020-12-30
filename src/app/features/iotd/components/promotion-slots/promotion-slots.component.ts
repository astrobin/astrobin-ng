import { Component, EventEmitter, Input, Output } from "@angular/core";
import { selectIotdMaxSubmissionsPerDay } from "@app/store/selectors/app/app.selectors";
import { State } from "@app/store/state";
import { SubmissionInterface } from "@features/iotd/services/submission-queue-api.service";
import { SubmissionImageInterface } from "@features/iotd/store/iotd.reducer";
import { selectSubmissions } from "@features/iotd/store/iotd.selectors";
import { select, Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { Observable } from "rxjs";
import { take, takeUntil } from "rxjs/operators";

interface Slot {
  id: number;
  submission: SubmissionInterface | null;
}

@Component({
  selector: "astrobin-promotion-slots",
  templateUrl: "./promotion-slots.component.html",
  styleUrls: ["./promotion-slots.component.scss"]
})
export class PromotionSlotsComponent extends BaseComponentDirective {
  ImageAlias = ImageAlias;
  submissions$: Observable<SubmissionInterface[]> = this.store$.select(selectSubmissions);
  slotsCount$: Observable<number> = this.store$.pipe(select(selectIotdMaxSubmissionsPerDay));
  slots: Slot[] = [];

  @Input()
  availableSubmissionEntries: SubmissionImageInterface[] = [];

  @Output()
  slotClick = new EventEmitter();

  constructor(public readonly store$: Store<State>) {
    super();

    this.slotsCount$.pipe(take(1)).subscribe(count => {
      for (let i = 0; i < count; ++i) {
        this.slots.push({
          id: i,
          submission: null
        });
      }
    });

    this.submissions$.pipe(takeUntil(this.destroyed$)).subscribe(submissions => {
      this.slots.forEach(slot => (slot.submission = null));
      submissions.forEach((submission, i) => {
        this.slots[i].submission = submission;
      });
    });
  }

  slotClicked(imageId: number): void {
    if (this.clickableSlot(imageId)) {
      this.slotClick.emit(imageId);
    }
  }

  clickableSlot(imageId: number): boolean {
    return this.availableSubmissionEntries.map(submission => submission.pk).indexOf(imageId) !== -1;
  }
}
