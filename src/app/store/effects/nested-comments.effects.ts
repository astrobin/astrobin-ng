import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { All, AppActionTypes } from "@app/store/actions/app.actions";
import { MainState } from "@app/store/state";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { LoadingService } from "@shared/services/loading.service";
import { fromEvent, Observable, of } from "rxjs";
import { catchError, debounceTime, filter, first, map, mapTo, mergeMap, take, tap } from "rxjs/operators";
import {
  CreateNestedCommentFailure,
  CreateNestedCommentSuccess,
  LoadNestedCommentFailure,
  LoadNestedCommentsSuccess,
  LoadNestedCommentSuccess
} from "@app/store/actions/nested-comments.actions";
import { NestedCommentsApiService } from "@shared/services/api/classic/nested-comments/nested-comments-api.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { NestedCommentInterface } from "@shared/interfaces/nested-comment.interface";
import { WindowRefService } from "@shared/services/window-ref.service";
import { selectNestedCommentById } from "@app/store/selectors/app/nested-comments.selectors";
import { isPlatformBrowser } from "@angular/common";

@Injectable()
export class NestedCommentsEffects {
  LoadNestedComments: Observable<LoadNestedCommentsSuccess> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_NESTED_COMMENTS),
      map(action => action.payload),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(payload =>
        this.nestedCommentsApiService.getForContentTypeIdAndObjectId(payload.contentTypeId, payload.objectId).pipe(
          map(nestedComments => new LoadNestedCommentsSuccess({
            contentTypeId: payload.contentTypeId,
            objectId: payload.objectId,
            nestedComments
          })),
          tap(() => this.loadingService.setLoading(false))
        )
      )
    )
  );

  LoadNestedComment: Observable<LoadNestedCommentSuccess | LoadNestedCommentFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.LOAD_NESTED_COMMENT),
      map(action => action.payload),
      mergeMap(payload =>
        this.nestedCommentsApiService.getById(payload.id).pipe(
          map(nestedComment => new LoadNestedCommentSuccess({ nestedComment })),
          catchError(() => of(new LoadNestedCommentFailure({ id: payload.id })))
        )
      )
    )
  );

  CreateNestedComment: Observable<CreateNestedCommentSuccess | CreateNestedCommentFailure> = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActionTypes.CREATE_NESTED_COMMENT),
      map(action => action.payload.nestedComment),
      tap(() => this.loadingService.setLoading(true)),
      mergeMap(nestedComment =>
        this.nestedCommentsApiService.create(nestedComment).pipe(
          map(newNestedComment => new CreateNestedCommentSuccess({ nestedComment: newNestedComment })),
          catchError(() => of(new CreateNestedCommentFailure({ nestedComment })))
        )
      )
    )
  );

  CreateNestedCommentSuccess: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.CREATE_NESTED_COMMENT_SUCCESS),
        map(action => UtilsService.objectToCamelCase(action.payload.nestedComment)),
        tap((nestedComment: NestedCommentInterface) => {
          this.loadingService.setLoading(false);

          this.store$
            .select(selectNestedCommentById, nestedComment.id)
            .pipe(
              filter(selectedNestedComment => !!selectedNestedComment),
              take(1)
            )
            .subscribe(selectedNestedComment => {
              this.utilsService.delay(1).subscribe(() => {
                const element = this.windowRefService.nativeWindow.document.getElementById(`c${nestedComment.id}`);
                element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
                if (isPlatformBrowser(this.platformId)) {
                  fromEvent(this.windowRefService.nativeWindow, "scroll")
                    .pipe(debounceTime(50), first(), mapTo(true))
                    .subscribe(() => {
                      element.classList.add("created");

                      this.utilsService.delay(1000).subscribe(() => {
                        element.classList.remove("created");
                      });
                    });
                }
              });
            });
        }),
        map(() => void 0)
      ),
    { dispatch: false }
  );

  CreateNestedCommentFailure: Observable<void> = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AppActionTypes.CREATE_NESTED_COMMENT_FAILURE),
        map(action => action.payload.nestedComment),
        tap(() => this.loadingService.setLoading(false)),
        map(() => void 0)
      ),
    { dispatch: false }
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions<All>,
    public readonly loadingService: LoadingService,
    public readonly nestedCommentsApiService: NestedCommentsApiService,
    public readonly windowRefService: WindowRefService,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) public readonly platformId: Object
  ) {
  }
}
