import { AfterViewInit, Component, ElementRef, Inject, Input, OnInit, PLATFORM_ID } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { NestedCommentInterface } from "@shared/interfaces/nested-comment.interface";
import { UserInterface } from "@shared/interfaces/user.interface";
import { filter, map, take, takeUntil, tap } from "rxjs/operators";
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
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { isPlatformBrowser } from "@angular/common";
import { UserService } from "@shared/services/user.service";

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

  replyModel: { topLevelComment: string };
  replyForm = new FormGroup({});
  replyFields: FormlyFieldConfig[];
  showReplyForm = false;

  private readonly _isBrowser: boolean;
  private _elementWidth: number;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly loadingService: LoadingService,
    public readonly windowRefService: WindowRefService,
    public readonly routerService: RouterService,
    public readonly elementRef: ElementRef,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly userService: UserService,
    @Inject(PLATFORM_ID) public readonly platformId: Object
  ) {
    super(store$);
    this._isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this._initReplyFields();
    this._initHighlighted();
    this._listenToLikes();
  }

  ngAfterViewInit() {
    if (!this._isBrowser) {
      return;
    }

    this._initHighlightJs();
    this._elementWidth = this.elementRef.nativeElement.getBoundingClientRect().width;
  }

  getMarginLeft(depth: number): string {
    if (!this._elementWidth) {
      return `0px`;
    }

    const minContentWidth = 300;
    const maxMargin = this._elementWidth - minContentWidth;
    const margin = Math.min(maxMargin, (depth - 1) * 16);
    return `${margin}px`;
  }

  getAvatarUrl(avatar: string) {
    return UtilsService.convertDefaultAvatar(avatar);
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

  _initHighlightJs() {
    if (!this._isBrowser) {
      return;
    }

    const _win = this.windowRefService.nativeWindow as any;

    if (typeof _win.hljs !== undefined) {
      const $elements = this.elementRef.nativeElement.querySelectorAll("pre code");
      for (const $element of $elements) {
        const brPlugin = {
          "before:highlightBlock": ({ block }) => {
            block.innerHTML = block.innerHTML.replace(/<br[ /]*>/g, "\n");
          },
          "after:highlightBlock": ({ result }) => {
            result.value = result.value.replace(/\n/g, "<br>");
          }
        };

        _win.hljs.addPlugin(brPlugin);
        _win.hljs.highlightElement($element);
        _win.hljs.initLineNumbersOnLoad();
      }
    }
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
      ];
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
