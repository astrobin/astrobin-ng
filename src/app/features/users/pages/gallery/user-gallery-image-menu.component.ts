import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
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
import { CollectionInterface } from "@shared/interfaces/collection.interface";
import { ActivatedRoute } from "@angular/router";
import { RemoveImageFromCollection, SetCollectionCoverImage } from "@app/store/actions/collection.actions";

@Component({
  selector: "astrobin-user-gallery-image-menu",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div
        *ngIf="currentUserWrapper.user?.id === user.id"
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
            {{ "Edit" | translate }}
          </a>

          <a
            *ngIf="collectionId"
            (click)="setAsCoverImage()"
            class="dropdown-item"
            astrobinEventPreventDefault
          >
            {{ "Set as cover image" | translate }}
          </a>

          <a class="dropdown-item text-danger" astrobinEventPreventDefault (click)="delete()">
            {{ "Delete" | translate }}
          </a>

          <a
            *ngIf="collectionId"
            (click)="removeFromCollection()"
            astrobinEventPreventDefault
            class="dropdown-item text-danger"
          >
            {{ "Remove from collection" | translate }}
          </a>
        </div>
      </div>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-image-menu.component.scss"]
})
export class UserGalleryImageMenuComponent extends BaseComponentDirective implements OnInit {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;
  @Input() image: ImageInterface;

  @Output() imageDeleted = new EventEmitter<ImageInterface["pk"]>();
  @Output() imageRemovedFromCollection = new EventEmitter<{
    imageId: ImageInterface["pk"],
    collectionId: CollectionInterface["id"]
  }>();

  protected collectionId: CollectionInterface["id"];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly modalService: ModalService,
    public readonly translateService: TranslateService,
    public readonly activatedRoute: ActivatedRoute
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();
    this.collectionId = parseInt(this.activatedRoute.snapshot.queryParamMap.get("collection"), 10);
  }

  protected setAsCoverImage() {
    this.store$.dispatch(new SetCollectionCoverImage({
      collectionId: this.collectionId,
      imageId: this.image.pk
    }));
  }

  protected delete() {
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

  protected removeFromCollection() {
    const modalRef: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
    const instance: ConfirmationDialogComponent = modalRef.componentInstance;

    instance.message = this.translateService.instant(
      "Are you sure you want to remove this image from the collection?"
    );

    modalRef.closed.subscribe(() => {
      const loadingModalRef: NgbModalRef = this.modalService.openLoadingDialog();

      this.actions$.pipe(
        ofType(AppActionTypes.REMOVE_IMAGE_FROM_COLLECTION_SUCCESS),
        filter((action: RemoveImageFromCollection) =>
          action.payload.imageId === this.image.pk &&
          action.payload.collectionId === this.collectionId
        ),
        take(1)
      ).subscribe(() => {
        loadingModalRef.close();
        this.imageRemovedFromCollection.emit({
          imageId: this.image.pk,
          collectionId: this.collectionId
        });
      });

      this.store$.dispatch(new RemoveImageFromCollection({
        collectionId: this.collectionId,
        imageId: this.image.pk
      }));
    });
  }
}
