import { OnInit, ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { RemoveImageFromCollection, SetCollectionCoverImage } from "@app/store/actions/collection.actions";
import { DeleteImageSuccess, DeleteImage } from "@app/store/actions/image.actions";
import { MainState } from "@app/store/state";
import { CollectionInterface } from "@core/interfaces/collection.interface";
import { ImageInterface } from "@core/interfaces/image.interface";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { ImageService } from "@core/services/image/image.service";
import { ModalService } from "@core/services/modal.service";
import { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { filter, take } from "rxjs/operators";

@Component({
  selector: "astrobin-user-gallery-image-menu",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div *ngIf="currentUserWrapper.user?.id === user.id" class="image-menu" container="body" ngbDropdown>
        <button
          id="image-menu-dropdown-button-{{ image.hash || image.pk }}"
          class="btn btn-sm btn-link btn-no-block no-toggle"
          astrobinEventPreventDefault
          astrobinEventStopPropagation
          ngbDropdownToggle
        >
          <fa-icon icon="ellipsis"></fa-icon>
        </button>

        <div [attr.aria-labelledby]="'image-menu-dropdown-button-' + (image.hash || image.pk)" ngbDropdownMenu>
          <a (click)="imageService.navigateToEdit(image)" class="dropdown-item" astrobinEventPreventDefault>
            {{ "Edit" | translate }}
          </a>

          <a *ngIf="collectionId" (click)="setAsCoverImage()" class="dropdown-item" astrobinEventPreventDefault>
            {{ "Set as cover image" | translate }}
          </a>

          <a (click)="delete()" class="dropdown-item text-danger" astrobinEventPreventDefault>
            {{ "Delete" | translate }}
          </a>

          <a
            *ngIf="collectionId"
            (click)="removeFromCollection()"
            class="dropdown-item text-danger"
            astrobinEventPreventDefault
          >
            {{ "Remove from collection" | translate }}
          </a>
        </div>
      </div>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-image-menu.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGalleryImageMenuComponent extends BaseComponentDirective implements OnInit {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;
  @Input() image: ImageInterface;

  @Output() imageDeleted = new EventEmitter<ImageInterface["pk"]>();
  @Output() imageRemovedFromCollection = new EventEmitter<{
    imageId: ImageInterface["pk"];
    collectionId: CollectionInterface["id"];
  }>();

  protected collectionId: CollectionInterface["id"];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly modalService: ModalService,
    public readonly translateService: TranslateService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly imageService: ImageService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();
    this.collectionId = parseInt(this.activatedRoute.snapshot.queryParamMap.get("collection"), 10);
  }

  protected setAsCoverImage() {
    this.store$.dispatch(
      new SetCollectionCoverImage({
        collectionId: this.collectionId,
        imageId: this.image.pk
      })
    );
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

      this.actions$
        .pipe(
          ofType(AppActionTypes.DELETE_IMAGE_SUCCESS),
          filter((action: DeleteImageSuccess) => action.payload.pk === this.image.pk),
          take(1)
        )
        .subscribe(() => {
          loadingModalRef.close();
          this.imageDeleted.emit(this.image.pk);
        });

      this.store$.dispatch(new DeleteImage({ pk: this.image.pk }));
    });
  }

  protected removeFromCollection() {
    const modalRef: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
    const instance: ConfirmationDialogComponent = modalRef.componentInstance;

    instance.message = this.translateService.instant("Are you sure you want to remove this image from the collection?");

    modalRef.closed.subscribe(() => {
      const loadingModalRef: NgbModalRef = this.modalService.openLoadingDialog();

      this.actions$
        .pipe(
          ofType(AppActionTypes.REMOVE_IMAGE_FROM_COLLECTION_SUCCESS),
          filter(
            (action: RemoveImageFromCollection) =>
              action.payload.imageId === this.image.pk && action.payload.collectionId === this.collectionId
          ),
          take(1)
        )
        .subscribe(() => {
          loadingModalRef.close();
          this.imageRemovedFromCollection.emit({
            imageId: this.image.pk,
            collectionId: this.collectionId
          });
        });

      this.store$.dispatch(
        new RemoveImageFromCollection({
          collectionId: this.collectionId,
          imageId: this.image.pk
        })
      );
    });
  }
}
