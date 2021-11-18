import { Injectable } from "@angular/core";
import { LoadImages } from "@app/store/actions/image.actions";
import { LoadSolutions } from "@app/store/actions/solution.actions";
import { selectBackendConfig } from "@app/store/selectors/app/app.selectors";
import { selectImages } from "@app/store/selectors/app/image.selectors";
import { selectSolutions } from "@app/store/selectors/app/solution.selectors";
import { State } from "@app/store/state";
import { IotdApiService } from "@features/iotd/services/iotd-api.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { LoadingService } from "@shared/services/loading.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { of } from "rxjs";
import { catchError, map, mergeMap, skip, switchMap, take, tap } from "rxjs/operators";
import {
  DeleteSubmissionFailure,
  DeleteSubmissionSuccess,
  DeleteVoteFailure,
  DeleteVoteSuccess,
  DismissImageSuccess,
  HideImageSuccess,
  IotdActions,
  IotdActionTypes,
  LoadDismissedImagesSuccess,
  LoadHiddenImagesSuccess,
  LoadReviewQueueFailure,
  LoadReviewQueueSuccess,
  LoadSubmissionQueueFailure,
  LoadSubmissionQueueSuccess,
  LoadSubmissionsFailure,
  LoadSubmissionsSuccess,
  LoadVotesFailure,
  LoadVotesSuccess,
  PostSubmissionFailure,
  PostSubmissionSuccess,
  PostVoteFailure,
  PostVoteSuccess,
  ShowImageSuccess
} from "./iotd.actions";

@Injectable()
export class IotdEffects {
  loadSubmissionQueue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.LOAD_SUBMISSION_QUEUE),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(action =>
        this.iotdApiService.getSubmissionQueueEntries(action.payload.page).pipe(
          tap(entries => this.store$.dispatch(new LoadImages(entries.results.map(entry => entry.pk)))),
          switchMap(entries =>
            this.store$.select(selectBackendConfig).pipe(
              map(backendConfig => ({
                entries,
                contentTypeId: backendConfig.IMAGE_CONTENT_TYPE_ID
              }))
            )
          ),
          tap(({ entries, contentTypeId }) =>
            this.store$.dispatch(
              new LoadSolutions({ contentType: contentTypeId, objectIds: entries.results.map(entry => "" + entry.pk) })
            )
          ),
          map(({ entries, contentTypeId }) => new LoadSubmissionQueueSuccess(entries)),
          catchError(error => of(new LoadSubmissionQueueFailure()))
        )
      )
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

  loadReviewQueue$ = createEffect(() =>
    this.actions$.pipe(
      ofType(IotdActionTypes.LOAD_REVIEW_QUEUE),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(action =>
        this.iotdApiService.getReviewQueueEntries(action.payload.page).pipe(
          tap(entries => this.store$.dispatch(new LoadImages(entries.results.map(entry => entry.pk)))),
          switchMap(entries =>
            this.store$.select(selectBackendConfig).pipe(
              map(backendConfig => ({
                entries,
                contentTypeId: backendConfig.IMAGE_CONTENT_TYPE_ID
              }))
            )
          ),
          tap(({ entries, contentTypeId }) =>
            this.store$.dispatch(
              new LoadSolutions({ contentType: contentTypeId, objectIds: entries.results.map(entry => "" + entry.pk) })
            )
          ),
          map(({ entries, contentTypeId }) => new LoadReviewQueueSuccess(entries)),
          catchError(() => of(new LoadReviewQueueFailure()))
        )
      )
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

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions<IotdActions>,
    public readonly iotdApiService: IotdApiService,
    public readonly loadingService: LoadingService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly windowRef: WindowRefService
  ) {}
}
