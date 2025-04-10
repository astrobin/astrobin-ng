import { Injectable } from "@angular/core";
import { selectBackendConfig } from "@app/store/selectors/app/app.selectors";
import { MainState } from "@app/store/state";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { IotdApiService } from "@features/iotd/services/iotd-api.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { of } from "rxjs";
import { catchError, map, mergeMap, switchMap, take, tap } from "rxjs/operators";

import {
  IotdActions,
  MarkReviewerSeenImage,
  DeleteIotdFailure,
  DeleteIotdSuccess,
  DeleteSubmissionFailure,
  DeleteSubmissionSuccess,
  DeleteVoteFailure,
  DeleteVoteSuccess,
  DismissImageSuccess,
  HideImageSuccess,
  IotdActionTypes,
  LoadDismissedImagesSuccess,
  LoadFutureIodsFailure,
  LoadFutureIodsSuccess,
  LoadHiddenImagesSuccess,
  LoadJudgementQueueFailure,
  LoadJudgementQueueSuccess,
  LoadReviewerSeenImagesSuccess,
  LoadReviewQueueFailure,
  LoadReviewQueueSuccess,
  LoadStaffMemberSettings,
  LoadStaffMemberSettingsSuccess,
  LoadSubmissionQueueFailure,
  LoadSubmissionQueueSuccess,
  LoadSubmissionsFailure,
  LoadSubmissionsSuccess,
  LoadSubmitterSeenImagesSuccess,
  LoadVotesFailure,
  LoadVotesSuccess,
  MarkReviewerSeenImageSuccess,
  MarkSubmitterSeenImageSuccess,
  PostIotdFailure,
  PostIotdSuccess,
  PostSubmissionFailure,
  PostSubmissionSuccess,
  PostVoteFailure,
  PostVoteSuccess,
  ShowImageSuccess
} from "./iotd.actions";

@Injectable()
export class IotdEffects {
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // GENERIC
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  loadStaffMemberSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.LOAD_STAFF_MEMBER_SETTINGS),
      mergeMap(action =>
        this.iotdApiService
          .getStaffMemberSettings()
          .pipe(map(settings => new LoadStaffMemberSettingsSuccess({ settings })))
      )
    )
  );

  loadHiddenImage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.LOAD_HIDDEN_IMAGES),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(() =>
        this.iotdApiService.loadHiddenImages().pipe(map(hiddenImages => new LoadHiddenImagesSuccess({ hiddenImages })))
      )
    )
  );

  loadHiddenImagesSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.LOAD_HIDDEN_IMAGES_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  hideImage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.HIDE_IMAGE),
      tap(() => this.loadingService.setLoading(true)),
      map(action => action.payload),
      mergeMap(payload =>
        this.iotdApiService.hideImage(payload.id).pipe(map(hiddenImage => new HideImageSuccess({ hiddenImage })))
      )
    )
  );

  hideImageSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.HIDE_IMAGE_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  showImage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.SHOW_IMAGE),
      tap(() => this.loadingService.setLoading(true)),
      map(action => action.payload),
      mergeMap(payload =>
        this.iotdApiService.showImage(payload.hiddenImage).pipe(map(id => new ShowImageSuccess({ id })))
      )
    )
  );

  showImageSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.SHOW_IMAGE_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  loadSubmitterSeenImages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.LOAD_SUBMITTER_SEEN_IMAGES),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(() =>
        this.iotdApiService
          .loadSubmitterSeenImages()
          .pipe(map(submitterSeenImages => new LoadSubmitterSeenImagesSuccess({ submitterSeenImages })))
      )
    )
  );

  loadSubmitterSeenImagesSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.LOAD_SUBMITTER_SEEN_IMAGES_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  markSubmitterSeenImage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.MARK_SUBMITTER_SEEN_IMAGE),
      map(action => action.payload),
      mergeMap(payload =>
        this.iotdApiService
          .markSubmitterSeenImage(payload.id)
          .pipe(map(submitterSeenImage => new MarkSubmitterSeenImageSuccess({ submitterSeenImage })))
      )
    )
  );

  loadReviewerSeenImages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.LOAD_REVIEWER_SEEN_IMAGES),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(() =>
        this.iotdApiService
          .loadReviewerSeenImages()
          .pipe(map(reviewerSeenImages => new LoadReviewerSeenImagesSuccess({ reviewerSeenImages })))
      )
    )
  );

  loadReviewerSeenImagesSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.LOAD_REVIEWER_SEEN_IMAGES_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  markReviewerSeenImage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.MARK_REVIEWER_SEEN_IMAGE),
      map((action: MarkReviewerSeenImage) => action.payload),
      mergeMap(payload =>
        this.iotdApiService
          .markReviewerSeenImage(payload.id)
          .pipe(map(reviewerSeenImage => new MarkReviewerSeenImageSuccess({ reviewerSeenImage })))
      )
    )
  );

  loadDismissedImage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.LOAD_DISMISSED_IMAGES),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(() =>
        this.iotdApiService
          .loadDismissedImages()
          .pipe(map(dismissedImages => new LoadDismissedImagesSuccess({ dismissedImages })))
      )
    )
  );

  loadDismissedImagesSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.LOAD_DISMISSED_IMAGES_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  dismissImage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.DISMISS_IMAGE),
      tap(() => this.loadingService.setLoading(true)),
      map(action => action.payload),
      mergeMap(payload =>
        this.iotdApiService
          .dismissImage(payload.id)
          .pipe(map(dismissedImage => new DismissImageSuccess({ dismissedImage })))
      )
    )
  );

  dismissImageSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.DISMISS_IMAGE_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // SUBMISSIONS
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  loadSubmissionQueue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.LOAD_SUBMISSION_QUEUE),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(action => this.iotdApiService.getSubmissionQueueEntries(action.payload.page, action.payload.sort)),
      switchMap(entries =>
        this.store$.select(selectBackendConfig).pipe(
          map(backendConfig => ({
            entries,
            contentTypeId: backendConfig.IMAGE_CONTENT_TYPE_ID
          }))
        )
      ),
      mergeMap(({ entries, contentTypeId }) => [
        new LoadStaffMemberSettings(),
        new LoadSubmissionQueueSuccess(entries)
      ]),
      catchError(error => of(new LoadSubmissionQueueFailure()))
    )
  );

  loadSubmissionQueueSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.LOAD_SUBMISSION_QUEUE_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  loadSubmissionQueueFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.LOAD_SUBMISSION_QUEUE_FAILURE),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  loadSubmissions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.LOAD_SUBMISSIONS),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(action =>
        this.iotdApiService.getSubmissions().pipe(
          map(submissions => new LoadSubmissionsSuccess(submissions)),
          catchError(error => of(new LoadSubmissionsFailure()))
        )
      )
    )
  );

  loadSubmissionsSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.LOAD_SUBMISSIONS_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  loadSubmissionsFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.LOAD_SUBMISSIONS_FAILURE),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  postSubmission$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.POST_SUBMISSION),
      tap(() => this.loadingService.setLoading(true)),
      map(action => action.payload),
      mergeMap(payload =>
        this.iotdApiService.addSubmission(payload.imageId).pipe(
          map(response => new PostSubmissionSuccess(response)),
          catchError(error => of(new PostSubmissionFailure(error)))
        )
      )
    )
  );

  postSubmissionSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.POST_SUBMISSION_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  postSubmissionFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.POST_SUBMISSION_FAILURE),
        map(action => action.payload.error),
        tap(error => {
          this.popNotificationsService.error(error);
          this.loadingService.setLoading(false);
        })
      ),
    { dispatch: false }
  );

  deleteSubmission$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.DELETE_SUBMISSION),
      tap(() => this.loadingService.setLoading(true)),
      map(action => action.payload),
      mergeMap(payload =>
        this.iotdApiService.retractSubmission(payload.id).pipe(
          map(() => new DeleteSubmissionSuccess({ id: payload.id })),
          catchError(error => of(new DeleteSubmissionFailure()))
        )
      )
    )
  );

  deleteSubmissionSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.DELETE_SUBMISSION_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  deleteSubmissionFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.DELETE_SUBMISSION_FAILURE),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // REVIEWS
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  loadReviewQueue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.LOAD_REVIEW_QUEUE),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(action => this.iotdApiService.getReviewQueueEntries(action.payload.page, action.payload.sort)),
      switchMap(entries =>
        this.store$.select(selectBackendConfig).pipe(
          map(backendConfig => ({
            entries,
            contentTypeId: backendConfig.IMAGE_CONTENT_TYPE_ID
          }))
        )
      ),
      mergeMap(({ entries, contentTypeId }) => [new LoadStaffMemberSettings(), new LoadReviewQueueSuccess(entries)]),
      catchError(() => of(new LoadReviewQueueFailure()))
    )
  );

  loadReviewQueueSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.LOAD_REVIEW_QUEUE_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  loadReviewQueueFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.LOAD_REVIEW_QUEUE_FAILURE),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  loadVotes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.LOAD_VOTES),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(action =>
        this.iotdApiService.getVotes().pipe(
          map(reviews => new LoadVotesSuccess(reviews)),
          catchError(error => of(new LoadVotesFailure()))
        )
      )
    )
  );

  loadVotesSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.LOAD_VOTES_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  loadVotesFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.LOAD_VOTES_FAILURE),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  postVote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.POST_VOTE),
      tap(() => this.loadingService.setLoading(true)),
      map(action => action.payload),
      mergeMap(payload =>
        this.iotdApiService.addVote(payload.imageId).pipe(
          map(response => new PostVoteSuccess(response)),
          catchError(error => of(new PostVoteFailure(error)))
        )
      )
    )
  );

  postVoteSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.POST_VOTE_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  postVoteFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.POST_VOTE_FAILURE),
        map(action => action.payload.error),
        tap(error => {
          this.popNotificationsService.error(error);
          this.loadingService.setLoading(false);
        })
      ),
    { dispatch: false }
  );

  deleteVote$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.DELETE_VOTE),
      tap(() => this.loadingService.setLoading(true)),
      map(action => action.payload),
      mergeMap(payload =>
        this.iotdApiService.retractVote(payload.id).pipe(
          map(() => new DeleteVoteSuccess({ id: payload.id })),
          catchError(() => of(new DeleteVoteFailure()))
        )
      )
    )
  );

  deleteVoteSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.DELETE_VOTE_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  deleteVoteFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.DELETE_VOTE_FAILURE),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // JUDGEMENT
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  loadJudgementQueue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.LOAD_JUDGEMENT_QUEUE),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(action => this.iotdApiService.getJudgementQueueEntries(action.payload.page, action.payload.sort)),
      mergeMap(entries =>
        this.store$.select(selectBackendConfig).pipe(
          take(1),
          map(backendConfig => ({
            entries,
            contentTypeId: backendConfig.IMAGE_CONTENT_TYPE_ID
          }))
        )
      ),
      mergeMap(({ entries, contentTypeId }) => [new LoadStaffMemberSettings(), new LoadJudgementQueueSuccess(entries)]),
      catchError(() => of(new LoadJudgementQueueFailure()))
    )
  );

  loadJudgementQueueSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.LOAD_JUDGEMENT_QUEUE_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  loadJudgementQueueFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.LOAD_JUDGEMENT_QUEUE_FAILURE),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  loadFutureIotds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.LOAD_FUTURE_IOTDS),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(action =>
        this.iotdApiService.getFutureIotds().pipe(
          map(futureIotds => new LoadFutureIodsSuccess({ futureIotds })),
          catchError(error => of(new LoadFutureIodsFailure()))
        )
      )
    )
  );

  loadFutureIotdsSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.LOAD_FUTURE_IOTDS_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  loadFutureIotdsFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.LOAD_FUTURE_IOTDS_FAILURE),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  postIotd$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.POST_IOTD),
      tap(() => this.loadingService.setLoading(true)),
      map(action => action.payload),
      mergeMap(payload =>
        this.iotdApiService.addIotd(payload.imageId).pipe(
          map(response => new PostIotdSuccess(response)),
          catchError(error => of(new PostIotdFailure(error)))
        )
      )
    )
  );

  postIotdSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.POST_IOTD_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  postIotdFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.POST_IOTD_FAILURE),
        map(action => action.payload.error),
        tap(error => {
          this.popNotificationsService.error(error);
          this.loadingService.setLoading(false);
        })
      ),
    { dispatch: false }
  );

  deleteIotd$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.DELETE_IOTD),
      tap(() => this.loadingService.setLoading(true)),
      map(action => action.payload),
      mergeMap(payload =>
        this.iotdApiService.retractIotd(payload.id).pipe(
          map(() => new DeleteIotdSuccess({ id: payload.id })),
          catchError(() => of(new DeleteIotdFailure()))
        )
      )
    )
  );

  deleteIotdSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.DELETE_IOTD_SUCCESS),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  deleteIotdFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(IotdActionTypes.DELETE_IOTD_FAILURE),
        tap(() => this.loadingService.setLoading(false))
      ),
    { dispatch: false }
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions<IotdActions>,
    public readonly iotdApiService: IotdApiService,
    public readonly loadingService: LoadingService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly windowRef: WindowRefService
  ) {}
}
