import { Component, Input } from "@angular/core";
import { ShowFullscreenImage } from "@app/store/actions/fullscreen-image.actions";
import { State } from "@app/store/state";
import { DeleteSubmission, PostSubmission } from "@features/iotd/store/iotd.actions";
import { SubmissionImageInterface } from "@features/iotd/store/iotd.reducer";
import { selectSubmissionForImage } from "@features/iotd/store/iotd.selectors";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";
import { distinctUntilChanged, map, take, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-promotion-entry",
  templateUrl: "./promotion-entry.component.html",
  styleUrls: ["./promotion-entry.component.scss"]
})
export class PromotionEntryComponent extends BaseComponentDirective {
  ImageAlias = ImageAlias;

  @Input()
  entry: SubmissionImageInterface;

  constructor(public readonly store$: Store<State>, public readonly loadingService: LoadingService) {
    super();
  }

  isSubmitted$(imageId: number): Observable<boolean> {
    return this.store$.select(selectSubmissionForImage, imageId).pipe(
      map(submission => submission !== null),
      distinctUntilChanged()
    );
  }

  viewFullscreen(imageId: number): void {
    this.store$.dispatch(new ShowFullscreenImage(imageId));
  }

  postSubmission(imageId: number): void {
    this.store$.dispatch(new PostSubmission({ imageId }));
  }

  deleteSubmission(imageId: number): void {
    this.store$
      .select(selectSubmissionForImage, imageId)
      .pipe(
        take(1),
        tap(submission => this.store$.dispatch(new DeleteSubmission({ id: submission.id })))
      )
      .subscribe();
  }
}
