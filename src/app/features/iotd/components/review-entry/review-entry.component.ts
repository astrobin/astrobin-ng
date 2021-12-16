import { Component, ElementRef } from "@angular/core";
import { State } from "@app/store/state";
import { BasePromotionEntryComponent } from "@features/iotd/components/base-promotion-entry/base-promotion-entry.component";
import { DeleteVote, PostVote } from "@features/iotd/store/iotd.actions";
import { selectReviewForImage, selectReviews } from "@features/iotd/store/iotd.selectors";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { LoadingService } from "@shared/services/loading.service";
import { Observable, of } from "rxjs";
import { distinctUntilChanged, map, switchMap, take, tap } from "rxjs/operators";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { selectIotdMaxSubmissionsPerDay } from "@app/store/selectors/app/app.selectors";
import { CookieService } from "ngx-cookie-service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { TranslateService } from "@ngx-translate/core";
import { ReviewImageInterface } from "@features/iotd/types/review-image.interface";
import { PromotionImageInterface } from "@features/iotd/types/promotion-image.interface";

@Component({
  selector: "astrobin-review-entry",
  templateUrl: "../base-promotion-entry/base-promotion-entry.component.html",
  styleUrls: ["../base-promotion-entry/base-promotion-entry.component.scss"]
})
export class ReviewEntryComponent extends BasePromotionEntryComponent {
  constructor(
    public readonly store$: Store<State>,
    public readonly elementRef: ElementRef,
    public readonly loadingService: LoadingService,
    public readonly modalService: NgbModal,
    public readonly cookieService: CookieService,
    public readonly windowRefService: WindowRefService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly translateService: TranslateService
  ) {
    super(store$, elementRef, modalService, cookieService, windowRefService, classicRoutesService, translateService);
  }

  isPromoted$(imageId: ImageInterface["pk"]): Observable<boolean> {
    return this.store$.select(selectReviewForImage, imageId).pipe(
      map(review => review !== null),
      distinctUntilChanged()
    );
  }

  mayPromote$(imageId: ImageInterface["pk"]): Observable<boolean> {
    const count$ = this.store$.select(selectReviews).pipe(map(votes => votes.length));
    const max$ = this.store$.select(selectIotdMaxSubmissionsPerDay);

    return this.isPromoted$(imageId).pipe(
      take(1),
      switchMap(isPromoted => {
        return isPromoted
          ? of(false)
          : max$.pipe(
              take(1),
              switchMap(max => count$.pipe(map(count => ({ max, count })))),
              map(({ max, count }) => count < max)
            );
      })
    );
  }

  promote(imageId: ImageInterface["pk"]): void {
    this.store$.dispatch(new PostVote({ imageId }));
  }

  retractPromotion(imageId: ImageInterface["pk"]): void {
    this.store$
      .select(selectReviewForImage, imageId)
      .pipe(
        take(1),
        tap(review => this.store$.dispatch(new DeleteVote({ id: review.id })))
      )
      .subscribe();
  }

  setExpiration(pk: PromotionImageInterface["pk"]): void {}
}
