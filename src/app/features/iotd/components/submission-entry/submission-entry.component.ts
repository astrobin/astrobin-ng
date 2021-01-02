import { Component } from "@angular/core";
import { State } from "@app/store/state";
import { BasePromotionEntryComponent } from "@features/iotd/components/base-promotion-entry/base-promotion-entry.component";
import { DeleteSubmission, HideSubmissionEntry, PostSubmission } from "@features/iotd/store/iotd.actions";
import { selectSubmissionForImage } from "@features/iotd/store/iotd.selectors";
import { Store } from "@ngrx/store";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";
import { distinctUntilChanged, map, take, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-submission-entry",
  templateUrl: "../base-promotion-entry/base-promotion-entry.component.html",
  styleUrls: ["../base-promotion-entry/base-promotion-entry.component.scss"]
})
export class SubmissionEntryComponent extends BasePromotionEntryComponent {
  constructor(public readonly store$: Store<State>, public readonly loadingService: LoadingService) {
    super(store$);
  }

  isPromoted$(imageId: number): Observable<boolean> {
    return this.store$.select(selectSubmissionForImage, imageId).pipe(
      map(submission => submission !== null),
      distinctUntilChanged()
    );
  }

  hide(imageId: number): void {
    this.store$.dispatch(new HideSubmissionEntry({ id: imageId }));
  }

  hideDisabled$(imageId: number): Observable<boolean> {
    return this.store$.select(selectSubmissionForImage, imageId).pipe(map(submission => !!submission));
  }

  promote(imageId: number): void {
    this.store$.dispatch(new PostSubmission({ imageId }));
  }

  retractPromotion(imageId: number): void {
    this.store$
      .select(selectSubmissionForImage, imageId)
      .pipe(
        take(1),
        tap(submission => this.store$.dispatch(new DeleteSubmission({ id: submission.id })))
      )
      .subscribe();
  }
}
