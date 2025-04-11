import {
  ChangeDetectorRef,
  OnChanges,
  OnInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import {
  LoadNestedCommentsSuccess,
  CreateNestedComment,
  LoadNestedComments
} from "@app/store/actions/nested-comments.actions";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { selectNestedCommentsByContentTypeIdAndObjectId } from "@app/store/selectors/app/nested-comments.selectors";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { NestedCommentInterface } from "@core/interfaces/nested-comment.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { LoadingService } from "@core/services/loading.service";
import { RouterService } from "@core/services/router.service";
import { distinctUntilChangedObj, UtilsService } from "@core/services/utils/utils.service";
import { Actions, ofType } from "@ngrx/effects";
import { Store, select } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { fadeInOut } from "@shared/animations";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Observable } from "rxjs";
import { filter, map, take, takeUntil, tap } from "rxjs/operators";

export enum NestedCommentsAutoStartTopLevelStrategy {
  ALWAYS = "ALWAYS",
  IF_NO_COMMENTS = "IF_NO_COMMENTS"
}

export type NestedCommentsTopLevelFormPlacement = "TOP" | "BOTTOM";

@Component({
  selector: "astrobin-nested-comments",
  templateUrl: "./nested-comments.component.html",
  styleUrls: ["./nested-comments.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut]
})
export class NestedCommentsComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input()
  contentType: ContentTypeInterface;

  @Input()
  objectId: number;

  @Input()
  highlightId: number;

  @Input()
  title: string = this.translateService.instant("Comments");

  @Input()
  info: string;

  @Input()
  addCommentLabel: string = this.translateService.instant("Add a comment");

  @Input()
  noCommentsLabel: string = this.translateService.instant("There are no comments yet.");

  @Input()
  showCloseButton = false;

  @Input()
  showReplyButton = true;

  @Input()
  allowSelfReply = true;

  @Input()
  allowModeration = false;

  @Input()
  showTopLevelButton = true;

  @Input()
  restrictReplyToUserId: UserInterface["id"];

  @Input()
  autoStartTopLevelStrategy: NestedCommentsAutoStartTopLevelStrategy = null;

  @Input()
  topLevelFormPlacement: NestedCommentsTopLevelFormPlacement = "TOP";

  @Input()
  topLevelFormHeight: number;

  @Output()
  close = new EventEmitter<void>();

  @Output()
  formDirtyChange = new EventEmitter<boolean>();

  comments$: Observable<NestedCommentInterface[]>;
  loadingComments = true;
  model: { topLevelComment: string };
  form = new FormGroup({});
  fields: FormlyFieldConfig[];
  showTopLevelForm = false;
  _lastFetchedComments: NestedCommentInterface[] = null;
  _autoStartTopLevelRetries = 0;
  hasNestedDirtyForm = false;

  // This the comment type of NestedComment, used to like comments.
  protected commentContentType: ContentTypeInterface;
  protected forceVisible = false;
  protected isInViewport = false;

  constructor(
    public readonly store$: Store,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly routerService: RouterService,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly activatedRoute: ActivatedRoute
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    const fragment = this.activatedRoute.snapshot.fragment;
    this.forceVisible = !!fragment && !!fragment.match(/^c\d+$/);

    this._initCommentContentType();
    this._setupFormListeners();
  }

  ngOnChanges() {
    this._initComments();
    this._initFields();
  }

  onVisibilityChange(isIntersecting: boolean): void {
    if (isIntersecting && !this.isInViewport) {
      this.isInViewport = true;
      this.refresh();
    }
  }

  isDirty(): boolean {
    // Check if top-level form is dirty and has content
    const topLevelValue = this.form.get("topLevelComment")?.value;

    const hasTopLevelContent =
      this.showTopLevelForm &&
      this.form.dirty &&
      !!topLevelValue &&
      typeof topLevelValue === "string" &&
      !!(topLevelValue as string).trim();

    if (hasTopLevelContent) {
      return true;
    }

    // Check if any nested comment form is dirty
    if (this.hasNestedDirtyForm) {
      return true;
    }

    return false;
  }

  onNestedCommentFormDirtyChange(isDirty: boolean): void {
    this.hasNestedDirtyForm = isDirty;
    this.formDirtyChange.emit(this.isDirty());
  }

  refresh() {
    this.actions$
      .pipe(
        ofType(AppActionTypes.LOAD_NESTED_COMMENTS_SUCCESS),
        filter(
          (action: LoadNestedCommentsSuccess) =>
            action.payload.contentTypeId === this.contentType.id && action.payload.objectId === this.objectId
        ),
        take(1)
      )
      .subscribe(() => {
        this.loadingComments = false;
        this.changeDetectorRef.markForCheck();
      });

    this.loadingComments = true;
    this.store$.dispatch(new LoadNestedComments({ contentTypeId: this.contentType.id, objectId: this.objectId }));
  }

  cancelTopLevelComment() {
    this.form.reset();
    this.showTopLevelForm = false;
  }

  submitTopLevelComment() {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        void this.routerService.redirectToLogin();
        return;
      }

      this.store$.dispatch(
        new CreateNestedComment({
          nestedComment: {
            contentType: this.contentType.id,
            objectId: this.objectId,
            text: this.form.get("topLevelComment").value,
            parent: null
          }
        })
      );

      this.actions$
        .pipe(
          ofType(AppActionTypes.CREATE_NESTED_COMMENT_SUCCESS),
          take(1),
          tap(() => this.cancelTopLevelComment())
        )
        .subscribe();
    });
  }

  onAddCommentClicked(event: Event) {
    if (event) {
      event.preventDefault();
    }

    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        void this.routerService.redirectToLogin();
        return;
      }
      this.showTopLevelForm = true;
      this.changeDetectorRef.markForCheck();
    });
  }

  protected commentTrackByFn(index: number, comment: NestedCommentInterface) {
    return comment.id;
  }

  private _initComments() {
    this.comments$ = this.store$
      .select(selectNestedCommentsByContentTypeIdAndObjectId(this.contentType.id, this.objectId))
      .pipe(
        filter(comments => comments !== null),
        distinctUntilChangedObj(),
        map(comments => UtilsService.sortParent(comments) as NestedCommentInterface[]),
        tap(() => this.loadingService.setLoading(false)),
        tap(comments => {
          this._lastFetchedComments = comments;

          this.utilsService.delay(200).subscribe(() => {
            this._autoStartTopLevel();
            this.changeDetectorRef.markForCheck();
          });
        }),
        takeUntil(this.destroyed$)
      );
  }

  private _autoStartTopLevel() {
    if (this._autoStartTopLevelRetries >= 10) {
      return;
    }

    this._autoStartTopLevelRetries++;

    if (this.loadingComments) {
      this.utilsService.delay(200).subscribe(() => {
        this._autoStartTopLevel();
        this.changeDetectorRef.markForCheck();
      });
      return;
    }

    const comments = this._lastFetchedComments;

    if (
      (!this.showTopLevelForm && this.autoStartTopLevelStrategy === NestedCommentsAutoStartTopLevelStrategy.ALWAYS) ||
      (this.autoStartTopLevelStrategy === NestedCommentsAutoStartTopLevelStrategy.IF_NO_COMMENTS &&
        comments &&
        comments.length === 0)
    ) {
      this.onAddCommentClicked(null);
    }
  }

  private _initFields() {
    this.fields = [
      {
        key: "topLevelComment",
        type: "ckeditor",
        wrappers: ["default-wrapper"],
        id: `top-level-comment-field-${this.contentType.id}-${this.objectId}`,
        props: {
          required: true,
          height: this.topLevelFormHeight || 300
        }
      }
    ];
  }

  private _initCommentContentType() {
    const payload = { appLabel: "nested_comments", model: "nestedcomment" };
    this.store$
      .pipe(
        select(selectContentType, payload),
        filter(contentType => !!contentType),
        take(1)
      )
      .subscribe(contentType => {
        this.commentContentType = contentType;
        this.changeDetectorRef.markForCheck();
      });
    this.store$.dispatch(new LoadContentType(payload));
  }

  private _setupFormListeners(): void {
    // Listen to changes in the top-level form
    this.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.formDirtyChange.emit(this.isDirty());
    });
  }
}
