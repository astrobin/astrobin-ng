import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { NestedCommentInterface } from "@shared/interfaces/nested-comment.interface";
import { Observable } from "rxjs";
import { UserInterface } from "@shared/interfaces/user.interface";
import { selectUser } from "@features/account/store/auth.selectors";
import { filter, map, take, takeUntil, tap } from "rxjs/operators";
import { LoadUser } from "@features/account/store/auth.actions";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { LoadingService } from "@shared/services/loading.service";
import { CreateNestedComment } from "@app/store/actions/nested-comments.actions";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { WindowRefService } from "@shared/services/window-ref.service";
import { RouterService } from "@shared/services/router.service";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { CreateTogglePropertySuccess, DeleteTogglePropertySuccess } from "@app/store/actions/toggle-property.actions";
import { TogglePropertyInterface } from "@shared/interfaces/toggle-property.interface";

@Component({
  selector: "astrobin-nested-comment",
  templateUrl: "./nested-comment.component.html",
  styleUrls: ["./nested-comment.component.scss"]
})
export class NestedCommentComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  @Input()
  comment: NestedCommentInterface;

  @Input()
  highlighted = false;

  // Whether to show the reply button or not. Some usages of this component might prefer flat comments.
  @Input()
  showReplyButton = true;

  // Whether to allow the user to reply to their own comments.
  @Input()
  allowSelfReply = true;

  @Input()
  commentContentType: ContentTypeInterface;

  // Whether to restrict the reply to a specific user. Useful for question/answer scenarios where you only want to owner
  // of an object to reply to a comment.
  @Input()
  restrictReplyToUserId: UserInterface["id"];

  user$: Observable<UserInterface>;
  replyModel: { topLevelComment: string };
  replyForm = new FormGroup({});
  replyFields: FormlyFieldConfig[];
  showReplyForm = false;

  @ViewChild("commentText", { read: ElementRef })
  private _commentText: ElementRef;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService,
    public readonly routerService: RouterService,
    public readonly elementRef: ElementRef
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.store$.dispatch(new LoadUser({ id: this.comment.author }));
    this.user$ = this.store$.select(selectUser, this.comment.author).pipe(takeUntil(this.destroyed$));
    this._initReplyFields();
    this._initHighlighted();
    this._listenToLikes();
  }

  ngAfterViewInit() {
    const window = this.windowRefService.nativeWindow as any;
    if (typeof window.hljs !== undefined) {
      const $elements = this._commentText.nativeElement.querySelectorAll("pre code");
      for (const $element of $elements) {
        const brPlugin = {
          "before:highlightBlock": ({ block }) => {
            block.innerHTML = block.innerHTML.replace(/<br[ /]*>/g, "\n");
          },
          "after:highlightBlock": ({ result }) => {
            result.value = result.value.replace(/\n/g, "<br>");
          }
        };

        window.hljs.addPlugin(brPlugin);
        window.hljs.highlightElement($element);
        window.hljs.initLineNumbersOnLoad();
      }
    }
  }

  getMarginLeft(depth: number): string {
    const width = this.elementRef.nativeElement.getBoundingClientRect().width;
    const minContentWidth = 300;
    const maxMargin = width - minContentWidth;
    const margin = Math.min(maxMargin, (depth - 1) * 20);
    return `${margin}px`;
  }

  getLink(): string {
    const url = this.windowRefService.getCurrentUrl();
    url.hash = `c${this.comment.id}`;
    return url.href;
  }

  cancelReply() {
    this.replyForm.reset();
    this.showReplyForm = false;
  }

  submitReply() {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.routerService.redirectToLogin();
        return;
      }

      this.store$.dispatch(
        new CreateNestedComment({
          nestedComment: {
            contentType: this.comment.contentType,
            objectId: this.comment.objectId,
            text: this.replyForm.get("commentReply").value,
            parent: this.comment.id
          }
        })
      );

      this.actions$
        .pipe(
          ofType(AppActionTypes.CREATE_NESTED_COMMENT_SUCCESS),
          take(1),
          tap(() => this.cancelReply())
        )
        .subscribe();
    });
  }

  onReplyClicked(event: Event) {
    event.preventDefault();

    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.routerService.redirectToLogin();
        return;
      }
      this.showReplyForm = true;
    });
  }

  _listenToLikes() {
    this.actions$.pipe(
      ofType(AppActionTypes.CREATE_TOGGLE_PROPERTY_SUCCESS),
      map((action: CreateTogglePropertySuccess) => action.payload.toggleProperty),
      filter((toggleProperty: TogglePropertyInterface) =>
        toggleProperty.contentType === this.commentContentType.id &&
        toggleProperty.objectId === this.comment.id
      ),
      takeUntil(this.destroyed$)
    ).subscribe(toggleProperty => {
      this.comment.likes = [
        ...this.comment.likes,
        toggleProperty.user
      ]
    });

    this.actions$.pipe(
      ofType(AppActionTypes.DELETE_TOGGLE_PROPERTY_SUCCESS),
      map((action: DeleteTogglePropertySuccess) => action.payload.toggleProperty),
      filter((toggleProperty: TogglePropertyInterface) =>
        toggleProperty.contentType === this.commentContentType.id &&
        toggleProperty.objectId === this.comment.id
      ),
      takeUntil(this.destroyed$)
    ).subscribe(toggleProperty => {
      this.comment.likes = this.comment.likes.filter(user => user !== toggleProperty.user);
    });
  }

  _initReplyFields() {
    this.replyFields = [
      {
        key: "commentReply",
        type: "ckeditor",
        wrappers: ["default-wrapper"],
        id: `reply-comment-field-${this.comment.id}`,
        props: {
          required: true
        }
      }
    ];
  }

  _initHighlighted() {
    const hash = this.windowRefService.getCurrentUrl().hash;

    if (hash === `#c${this.comment.id}`) {
      this.highlighted = true;
    }

    if (this.highlighted) {
      this.windowRefService.scrollToElement(`#c${this.comment.id}`);
    }
  }
}
