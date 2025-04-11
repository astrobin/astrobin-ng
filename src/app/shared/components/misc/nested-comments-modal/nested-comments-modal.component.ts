import { Component, Input, ViewChild } from "@angular/core";
import { MainState } from "@app/store/state";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { NgbActiveModal, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import {
  NestedCommentsAutoStartTopLevelStrategy,
  NestedCommentsTopLevelFormPlacement,
  NestedCommentsComponent
} from "@shared/components/misc/nested-comments/nested-comments.component";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "astrobin-nested-comments-modal",
  templateUrl: "./nested-comments-modal.component.html"
})
export class NestedCommentsModalComponent extends BaseComponentDirective {
  @Input()
  contentType: ContentTypeInterface;

  @Input()
  objectId: number;

  @Input()
  highlightId: number;

  @Input()
  info: string;

  @Input()
  title: string = this.translateService.instant("Comments");

  @Input()
  addCommentLabel: string = this.translateService.instant("Add a comment");

  @Input()
  noCommentsLabel: string = this.translateService.instant("There are no comments yet.");

  @Input()
  showReplyButton = true;

  @Input()
  showTopLevelButton = true;

  @Input()
  autoStartTopLevelStrategy: NestedCommentsAutoStartTopLevelStrategy = null;

  @Input()
  topLevelFormPlacement: NestedCommentsTopLevelFormPlacement = "TOP";

  @Input()
  topLevelFormHeight: number;

  @Input()
  allowSelfReply = true;

  @Input()
  allowModeration = false;

  @ViewChild(NestedCommentsComponent)
  nestedCommentsComponent: NestedCommentsComponent;

  isFormDirty = false;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService,
    private readonly modalService: NgbModal
  ) {
    super(store$);
    // We use beforeDismiss in the open() static method instead
  }

  isDirty(): boolean {
    return this.isFormDirty || (this.nestedCommentsComponent && this.nestedCommentsComponent.isDirty());
  }

  /**
   * Handles the close button click
   * The beforeDismiss handler will take care of the confirmation if needed
   */
  handleClose(): void {
    this.modal.dismiss();
  }

  /**
   * Shows a confirmation dialog if there are unsaved changes
   * @returns Promise<boolean> - true if the user confirmed dismissal or if there are no unsaved changes
   */
  async confirmDismissIfDirty(): Promise<boolean> {
    if (!this.isDirty()) {
      return true;
    }

    const modalRef = this.modalService.open(ConfirmationDialogComponent);
    const componentInstance = modalRef.componentInstance as ConfirmationDialogComponent;

    componentInstance.title = this.translateService.instant("Unsaved Changes");
    componentInstance.message = this.translateService.instant(
      "You have unsaved changes in your comment. Are you sure you want to close this dialog and lose your changes?"
    );
    componentInstance.cancelLabel = this.translateService.instant("Cancel");
    componentInstance.confirmLabel = this.translateService.instant("Discard changes");

    try {
      await firstValueFrom(modalRef.closed);
      return true; // User confirmed
    } catch (e) {
      return false; // User canceled
    }
  }

  /**
   * Static method to open the nested comments modal with proper configuration.
   * This ensures that all instances of opening the modal use the same configuration.
   */
  static open(
    modalService: NgbModal,
    options: {
      contentType: any;
      objectId: number;
      title?: string;
      info?: string;
      addCommentLabel?: string;
      noCommentsLabel?: string;
      highlightId?: number;
      showReplyButton?: boolean;
      showTopLevelButton?: boolean;
      autoStartTopLevelStrategy?: NestedCommentsAutoStartTopLevelStrategy;
      topLevelFormPlacement?: NestedCommentsTopLevelFormPlacement;
      topLevelFormHeight?: number;
      allowSelfReply?: boolean;
      allowModeration?: boolean;
      size?: "sm" | "lg" | "xl" | "xxl"; // Modal size
    }
  ): NgbModalRef {
    // Use a beforeDismiss handler to check for unsaved changes
    const modalRef = modalService.open(NestedCommentsModalComponent, {
      size: options.size || "lg", // Default to lg if not specified
      centered: true,
      beforeDismiss: function () {
        // 'this' refers to the NgbModalRef instance
        const componentInstance = this.componentInstance as NestedCommentsModalComponent;
        // Return the Promise from confirmDismissIfDirty which resolves to a boolean
        return componentInstance.confirmDismissIfDirty();
      }
    });

    const componentInstance = modalRef.componentInstance as NestedCommentsModalComponent;

    // Set required properties
    componentInstance.contentType = options.contentType;
    componentInstance.objectId = options.objectId;

    // Set optional properties
    if (options.title !== undefined) {
      componentInstance.title = options.title;
    }
    if (options.info !== undefined) {
      componentInstance.info = options.info;
    }
    if (options.addCommentLabel !== undefined) {
      componentInstance.addCommentLabel = options.addCommentLabel;
    }
    if (options.noCommentsLabel !== undefined) {
      componentInstance.noCommentsLabel = options.noCommentsLabel;
    }
    if (options.highlightId !== undefined) {
      componentInstance.highlightId = options.highlightId;
    }
    if (options.showReplyButton !== undefined) {
      componentInstance.showReplyButton = options.showReplyButton;
    }
    if (options.showTopLevelButton !== undefined) {
      componentInstance.showTopLevelButton = options.showTopLevelButton;
    }
    if (options.autoStartTopLevelStrategy !== undefined) {
      componentInstance.autoStartTopLevelStrategy = options.autoStartTopLevelStrategy;
    }
    if (options.topLevelFormPlacement !== undefined) {
      componentInstance.topLevelFormPlacement = options.topLevelFormPlacement;
    }
    if (options.topLevelFormHeight !== undefined) {
      componentInstance.topLevelFormHeight = options.topLevelFormHeight;
    }
    if (options.allowSelfReply !== undefined) {
      componentInstance.allowSelfReply = options.allowSelfReply;
    }
    if (options.allowModeration !== undefined) {
      componentInstance.allowModeration = options.allowModeration;
    }

    // The modal component will handle the confirmation when dismissing

    return modalRef;
  }
}
