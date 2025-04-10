import { ElementRef, Component, Inject, PLATFORM_ID } from "@angular/core";
import { selectBackendConfig, selectIotdMaxSubmissionsPerDay } from "@app/store/selectors/app/app.selectors";
import { MainState } from "@app/store/state";
import { ImageInterface } from "@core/interfaces/image.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { LoadingService } from "@core/services/loading.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { BasePromotionEntryComponent } from "@features/iotd/components/base-promotion-entry/base-promotion-entry.component";
import { DeleteSubmission, PostSubmission } from "@features/iotd/store/iotd.actions";
import {
  selectSubmissionForImage,
  selectSubmissionQueueEntry,
  selectSubmissions
} from "@features/iotd/store/iotd.selectors";
import { SubmissionImageInterface } from "@features/iotd/types/submission-image.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { CookieService } from "ngx-cookie";
import { Observable, of } from "rxjs";
import { distinctUntilChanged, filter, map, switchMap, take, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-submission-entry",
  templateUrl: "../base-promotion-entry/base-promotion-entry.component.html",
  styleUrls: ["../base-promotion-entry/base-promotion-entry.component.scss"]
})
export class SubmissionEntryComponent extends BasePromotionEntryComponent {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly elementRef: ElementRef,
    public readonly loadingService: LoadingService,
    public readonly modalService: NgbModal,
    public readonly cookieService: CookieService,
    public readonly windowRefService: WindowRefService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly translateService: TranslateService,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) public readonly platformId: Object
  ) {
    super(
      store$,
      actions$,
      elementRef,
      modalService,
      cookieService,
      windowRefService,
      classicRoutesService,
      translateService,
      utilsService,
      platformId
    );
  }

  isPromoted$(imageId: ImageInterface["pk"]): Observable<boolean> {
    return this.store$.select(selectSubmissionForImage, imageId).pipe(
      map(submission => submission !== null),
      distinctUntilChanged()
    );
  }

  mayPromote$(imageId: ImageInterface["pk"]): Observable<boolean> {
    const count$ = this.store$.select(selectSubmissions).pipe(map(submissions => submissions.length));
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
    this.store$.dispatch(new PostSubmission({ imageId }));
  }

  retractPromotion(imageId: ImageInterface["pk"]): void {
    this.store$
      .select(selectSubmissionForImage, imageId)
      .pipe(
        take(1),
        tap(submission => this.store$.dispatch(new DeleteSubmission({ id: submission.id })))
      )
      .subscribe();
  }

  setExpiration(pk: SubmissionImageInterface["pk"]): void {
    this.store$
      .select(selectSubmissionQueueEntry, pk)
      .pipe(
        filter(entry => !!entry),
        switchMap(entry =>
          this.store$.select(selectBackendConfig).pipe(map(backendConfig => ({ entry, backendConfig })))
        ),
        map(({ entry, backendConfig }) => {
          const date = new Date(entry.submittedForIotdTpConsideration + "Z");
          date.setDate(date.getDate() + backendConfig.IOTD_SUBMISSION_WINDOW_DAYS);
          return date.toUTCString();
        }),
        take(1)
      )
      .subscribe(date => {
        this.expirationDate = date;
      });
  }
}
