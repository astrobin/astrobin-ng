import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { filter, take } from "rxjs/operators";
import { DeleteImage, DeleteImageSuccess } from "@app/store/actions/image.actions";
import { ModalService } from "@shared/services/modal.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-user-gallery-image-menu",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div
        ngbDropdown
        container="body"
        class="image-menu"
      >
        <button
          class="btn btn-sm btn-link btn-no-block no-toggle"
          ngbDropdownToggle
          id="image-menu-dropdown-button-{{ image.hash || image.pk }}"
          astrobinEventStopPropagation
          astrobinEventPreventDefault
        >
          <fa-icon icon="ellipsis"></fa-icon>
        </button>

        <div
          aria-labelledby="image-menu-dropdown-button-{{ image.hash || image.pk }}"
          ngbDropdownMenu
        >
          <a class="dropdown-item" [routerLink]="['/i', image.hash || image.pk, 'edit']">
            Edit
          </a>

          <a class="dropdown-item text-danger" astrobinEventPreventDefault (click)="delete()">
            Delete
          </a>
        </div>
      </div>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-image-menu.component.scss"]
})
export class UserGalleryImageMenuComponent extends BaseComponentDirective {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;
  @Input() image: ImageInterface;

  @Output() imageDeleted = new EventEmitter<ImageInterface["pk"]>();

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly modalService: ModalService,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  delete() {
    const modalRef: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
    const instance: ConfirmationDialogComponent = modalRef.componentInstance;

    instance.message = this.translateService.instant(
      "Your image will be deleted along with all revisions and metadata. If you want to delete a specific " +
      "revision only, please do so from the image page."
    );

    modalRef.closed.subscribe(() => {
      const loadingModalRef: NgbModalRef = this.modalService.openLoadingDialog();

      this.actions$.pipe(
        ofType(AppActionTypes.DELETE_IMAGE_SUCCESS),
        filter((action: DeleteImageSuccess) => action.payload.pk === this.image.pk),
        take(1)
      ).subscribe(() => {
        loadingModalRef.close();
        this.imageDeleted.emit(this.image.pk);
      });

      this.store$.dispatch(new DeleteImage({ pk: this.image.pk }));
    });
  }
}
