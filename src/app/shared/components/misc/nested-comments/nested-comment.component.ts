import { isPlatformBrowser } from "@angular/common";
import type { AfterViewInit, OnChanges, OnDestroy, OnInit, SimpleChanges } from "@angular/core";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  Output,
  PLATFORM_ID
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import type { SafeHtml } from "@angular/platform-browser";
import { AppActionTypes } from "@app/store/actions/app.actions";
import type {
  ApproveNestedCommentFailure,
  ApproveNestedCommentSuccess,
  UpdateNestedCommentSuccess
} from "@app/store/actions/nested-comments.actions";
import {
  ApproveNestedComment,
  CreateNestedComment,
  DeleteNestedComment,
  UpdateNestedComment
} from "@app/store/actions/nested-comments.actions";
import type {
  CreateTogglePropertySuccess,
  DeleteTogglePropertySuccess
} from "@app/store/actions/toggle-property.actions";
import type { MainState } from "@app/store/state";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { NestedCommentInterface } from "@core/interfaces/nested-comment.interface";
import type { TogglePropertyInterface } from "@core/interfaces/toggle-property.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { ContentTranslateService } from "@core/services/content-translate.service";
import { DeviceService } from "@core/services/device.service";
import { HighlightService } from "@core/services/highlight.service";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { RouterService } from "@core/services/router.service";
import { UserService } from "@core/services/user.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { filter, map, take, takeUntil, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-nested-comment",
  templateUrl: "./nested-comment.component.html",
  styleUrls: ["./nested-comment.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NestedCommentComponent
  extends BaseComponentDirective
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
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

  // Weather the user can moderate the comment.
  @Input()
  allowModeration = false;

  @Input()
  commentContentType: ContentTypeInterface;

  // Whether to restrict the reply to a specific user. Useful for question/answer scenarios where you only want to owner
  // of an object to reply to a comment.
  @Input()
  restrictReplyToUserId: UserInterface["id"];

  @Output()
  formDirtyChange = new EventEmitter<boolean>();

  replyModel: { topLevelComment: string };
  replyForm = new FormGroup({});
  replyFields: FormlyFieldConfig[];
  showReplyForm = false;

  editModel: { comment: string };
  editForm = new FormGroup({});
  editFields: FormlyFieldConfig[];
  showEditForm = false;

  translating = false;
  translated = false;

  protected approving = false;
  protected deleting = false;
  protected link: string;
  protected margin: string = `0px`;
  protected userGalleryUrl: string;
  protected avatarUrl: string;
  protected html: SafeHtml;

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
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) public readonly platformId: object,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly deviceService: DeviceService,
    public readonly contentTranslateService: ContentTranslateService,
    public readonly highlightService: HighlightService
  ) {
    super(store$);
    this._isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this._updateHtml();
    this._initReplyFields();
    this._initEditFields();
    this._initHighlighted();
    this._listenToLikes();
    this._setupFormListeners();
  }

  isDirty(): boolean {
    const replyValue = this.replyForm.get("commentReply")?.value;
    const editValue = this.editForm.get("comment")?.value;

    const hasReplyContent =
      this.showReplyForm &&
      this.replyForm.dirty &&
      !!replyValue &&
      typeof replyValue === "string" &&
      !!(replyValue as string).trim();

    const hasEditContent =
      this.showEditForm &&
      this.editForm.dirty &&
      !!editValue &&
      typeof editValue === "string" &&
      !!(editValue as string).trim();

    return hasReplyContent || hasEditContent;
  }

  ngAfterViewInit() {
    if (!this._isBrowser) {
      return;
    }

    this._elementWidth = this.elementRef.nativeElement.getBoundingClientRect().width;
    this._initMarginLeft();
    this.changeDetectorRef.markForCheck();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.comment && changes.comment.currentValue) {
      this._initLink();
      this._initMarginLeft();
      this._initUserGalleryUrl();
      this._initAvatarUrl();
      this._updateHtml(); // Re-run _updateHtml which conditionally calls _initHighlightJs
    }
  }

  cancelEdit() {
    this.editForm.reset();
    this.showEditForm = false;
    this.changeDetectorRef.markForCheck();
  }

  submitEdit() {
    this.actions$
      .pipe(
        ofType(AppActionTypes.UPDATE_NESTED_COMMENT_SUCCESS),
        filter((action: UpdateNestedCommentSuccess) => action.payload.nestedComment.id === this.comment.id),
        map((action: UpdateNestedCommentSuccess) => action.payload.nestedComment),
        take(1),
        tap(() => this.cancelEdit())
      )
      .subscribe(comment => {
        this.comment = comment;
        this._updateHtml();
        this.changeDetectorRef.markForCheck();
      });

    this.store$.dispatch(
      new UpdateNestedComment({
        nestedComment: {
          ...this.comment,
          text: this.editForm.get("comment").value
        }
      })
    );
  }

  cancelReply() {
    this.replyForm.reset();
    this.showReplyForm = false;
    this.changeDetectorRef.markForCheck();
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
        .subscribe(() => {
          this.changeDetectorRef.markForCheck();
        });
    });
  }

  onApproveClicked(event: Event) {
    event.preventDefault();

    if (!this.comment.pendingModeration) {
      return;
    }

    this.approving = true;

    this.actions$
      .pipe(
        ofType(AppActionTypes.APPROVE_NESTED_COMMENT_SUCCESS),
        map((action: ApproveNestedCommentSuccess) => action.payload),
        filter(payload => payload.nestedComment.id === this.comment.id),
        take(1)
      )
      .subscribe(() => {
        this.approving = false;
        this.changeDetectorRef.markForCheck();
      });

    this.actions$
      .pipe(
        ofType(AppActionTypes.APPROVE_NESTED_COMMENT_FAILURE),
        map((action: ApproveNestedCommentFailure) => action.payload),
        filter(payload => payload.id === this.comment.id),
        take(1)
      )
      .subscribe(() => {
        this.approving = false;
        this.changeDetectorRef.markForCheck();
      });

    this.store$.dispatch(new ApproveNestedComment({ id: this.comment.id }));
    this.changeDetectorRef.markForCheck();
  }

  onDeleteClicked(event: Event) {
    event.preventDefault();

    if (this.comment.deleted) {
      return;
    }

    this.deleting = true;

    this.actions$
      .pipe(
        ofType(AppActionTypes.DELETE_NESTED_COMMENT_SUCCESS, AppActionTypes.DELETE_NESTED_COMMENT_FAILURE),
        map(() => this.comment.id),
        filter(id => id === this.comment.id),
        take(1)
      )
      .subscribe(() => {
        this.deleting = false;
        this.changeDetectorRef.markForCheck();
      });

    this.store$.dispatch(new DeleteNestedComment({ id: this.comment.id }));
    this.changeDetectorRef.markForCheck();
  }

  onEditClicked(event: Event) {
    event.preventDefault();

    if (this.comment.deleted) {
      return;
    }

    this.editModel = {
      comment: this.comment.text
    };

    this.showEditForm = true;
    this.changeDetectorRef.markForCheck();
  }

  onReplyClicked(event: Event) {
    event.preventDefault();

    if (this.comment.deleted || this.comment.pendingModeration) {
      return;
    }

    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.routerService.redirectToLogin();
        return;
      }
      this.showReplyForm = true;
      this.changeDetectorRef.markForCheck();
    });
  }

  async onShareClicked(event: Event) {
    event.preventDefault();

    const isNativeShareSupported = typeof navigator !== "undefined" && !!navigator.share;
    const isMobile = this.deviceService.isMobile();

    if (isNativeShareSupported && isMobile) {
      try {
        navigator
          .share({
            title: this.link,
            url: this.link
          })
          .catch(error => {
            console.error("Sharing failed:", error);
          });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Sharing failed:", error);
        }
      }
    } else {
      const result: boolean = await this.windowRefService.copyToClipboard(this.link);

      if (!result) {
        this.popNotificationsService.error(this.translateService.instant("Failed to copy link to clipboard."));
        return;
      }

      this.popNotificationsService.info(this.translateService.instant("Link copied to clipboard."));
    }
  }

  onTranslateClicked(event: Event) {
    event.preventDefault();

    this.translating = true;

    // Check if we have a cached translation
    const isTranslated = this.contentTranslateService.hasTranslation("comment", this.comment.id.toString());
    if (isTranslated) {
      this.translated = true;
      this._loadTranslatedContent();
      return;
    }

    // Otherwise perform new translation
    this.contentTranslateService
      .translate({
        text: this.comment.text,
        sourceLanguage: this.comment.detectedLanguage,
        format: "bbcode",
        itemType: "comment",
        itemId: this.comment.id.toString()
      })
      .subscribe(
        translatedHtml => {
          this.html = translatedHtml;
          this.translating = false;
          this.translated = true;
          this.changeDetectorRef.markForCheck();
        },
        () => {
          this.translating = false;
          this.changeDetectorRef.markForCheck();
        }
      );
  }

  onSeeOriginalClicked(event: Event) {
    event.preventDefault();

    // Clear translation preference in localStorage
    this.contentTranslateService.clearTranslation("comment", this.comment.id.toString());

    this._updateHtml();
    this.translated = false;
  }

  private _loadTranslatedContent(): void {
    this.contentTranslateService
      .translate({
        text: this.comment.text,
        sourceLanguage: this.comment.detectedLanguage,
        format: "bbcode",
        itemType: "comment",
        itemId: this.comment.id.toString()
      })
      .subscribe(
        translatedHtml => {
          this.html = translatedHtml;
          this.translating = false;
          this.changeDetectorRef.markForCheck();

          // Check for code blocks in translated content and apply highlighting if needed
          if (this._isBrowser && this.highlightService.needsHighlighting(translatedHtml as string)) {
            // Use utilsService.delay to wait for the DOM to update with the translated HTML
            this.utilsService.delay(0).subscribe(() => this._initHighlightJs());
          }
        },
        () => {
          this._updateHtml();
          this.translating = false;
          this.translated = false;
          this.changeDetectorRef.markForCheck();
        }
      );
  }

  private _initAvatarUrl(): void {
    this.avatarUrl = UtilsService.convertDefaultAvatar(this.comment.authorAvatar);
  }

  private _initHighlightJs() {
    if (!this._isBrowser) {
      return;
    }

    // Check if the comment content has code blocks that need highlighting
    const commentHtml = this.comment.html || "";

    if (!this.highlightService.needsHighlighting(commentHtml)) {
      // No code blocks found, skip loading highlight.js
      return;
    }

    // Load highlight.js dynamically
    this.highlightService
      .loadHighlightJs()
      .then(() => {
        // After successful loading, apply highlighting to code blocks
        const element = this.elementRef.nativeElement;
        this.highlightService.highlightCodeBlocks(element);
        this.changeDetectorRef.markForCheck();
      })
      .catch(error => {
        console.warn("Failed to load highlight.js:", error);
      });
  }

  private _listenToLikes() {
    this.actions$
      .pipe(
        ofType(AppActionTypes.CREATE_TOGGLE_PROPERTY_SUCCESS),
        map((action: CreateTogglePropertySuccess) => action.payload.toggleProperty),
        filter(
          (toggleProperty: TogglePropertyInterface) =>
            toggleProperty.contentType === this.commentContentType.id && toggleProperty.objectId === this.comment.id
        ),
        takeUntil(this.destroyed$)
      )
      .subscribe(toggleProperty => {
        this.comment.likes = [...this.comment.likes, toggleProperty.user];
        this.changeDetectorRef.markForCheck();
      });

    this.actions$
      .pipe(
        ofType(AppActionTypes.DELETE_TOGGLE_PROPERTY_SUCCESS),
        map((action: DeleteTogglePropertySuccess) => action.payload.toggleProperty),
        filter(
          (toggleProperty: TogglePropertyInterface) =>
            toggleProperty.contentType === this.commentContentType.id && toggleProperty.objectId === this.comment.id
        ),
        takeUntil(this.destroyed$)
      )
      .subscribe(toggleProperty => {
        this.comment.likes = this.comment.likes.filter(user => user !== toggleProperty.user);
        this.changeDetectorRef.markForCheck();
      });
  }

  private _initEditFields() {
    this.editFields = [
      {
        key: "comment",
        type: "ckeditor",
        wrappers: ["default-wrapper"],
        id: `edit-comment-field-${this.comment.id}`,
        props: {
          required: true
        }
      }
    ];
  }

  private _initReplyFields() {
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

  private _initHighlighted() {
    const hash = this.windowRefService.getCurrentUrl().hash;

    if (hash === `#c${this.comment.id}`) {
      this.highlighted = true;
    }

    if (this.highlighted) {
      this.windowRefService.scrollToElement(`#c${this.comment.id}`, {
        behavior: "smooth",
        block: "center",
        inline: "nearest"
      });
    }
  }

  private _initMarginLeft(): string {
    if (!this._elementWidth) {
      this.margin = `0px`;
      return;
    }

    const minContentWidth = 300;
    const maxMargin = this._elementWidth - minContentWidth;
    const margin = Math.min(maxMargin, (this.comment.depth - 1) * 16);
    this.margin = `${margin}px`;
  }

  private _initLink(): void {
    const url = this.windowRefService.getCurrentUrl();
    url.hash = `c${this.comment.id}`;
    this.link = url.href;
  }

  private _initUserGalleryUrl(): void {
    this.currentUserWrapper$.pipe(take(1)).subscribe(currentUserWrapper => {
      this.userGalleryUrl = this.userService.getGalleryUrl(
        this.comment.authorUsername,
        !currentUserWrapper.userProfile || currentUserWrapper.userProfile.enableNewGalleryExperience
      );
    });
  }

  private _updateHtml(): void {
    // If the content is already translated in localStorage, load the translation
    if (this.contentTranslateService.hasTranslation("comment", this.comment.id.toString())) {
      this.translated = true;
      this._loadTranslatedContent();
    } else {
      // Otherwise use the original HTML
      this.html = this.contentTranslateService.sanitizeContent(this.comment.html, "html");
    }

    // If we're in the browser and the component has been rendered, check for code blocks
    if (this._isBrowser && this.elementRef?.nativeElement) {
      // Use utilsService.delay to wait for the DOM to update with the new HTML
      this.utilsService.delay(0).subscribe(() => this._initHighlightJs());
    }
  }

  private _setupFormListeners(): void {
    // Monitor reply form
    this.replyForm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.formDirtyChange.emit(this.isDirty());
    });

    // Monitor edit form
    this.editForm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.formDirtyChange.emit(this.isDirty());
    });
  }
}
