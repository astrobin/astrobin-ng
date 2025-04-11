import {
  ChangeDetectorRef,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { AppActionTypes } from "@app/store/actions/app.actions";
import {
  DeleteCollection,
  UpdateCollection,
  DeleteCollectionFailure,
  UpdateCollectionFailure
} from "@app/store/actions/collection.actions";
import { selectCollectionsByParams } from "@app/store/selectors/app/collection.selectors";
import { MainState } from "@app/store/state";
import { CollectionInterface } from "@core/interfaces/collection.interface";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { DeviceService } from "@core/services/device.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { ofType, Actions } from "@ngrx/effects";
import { select, Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { map, take, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-user-gallery-collection-menu",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div class="collection-menu" container="body" ngbDropdown>
        <button
          id="collection-menu-dropdown-button-{{ collection.id }}"
          class="btn btn-sm btn-link btn-no-block no-toggle"
          astrobinEventStopPropagation
          ngbDropdownToggle
        >
          <fa-icon icon="ellipsis"></fa-icon>
        </button>

        <div [attr.aria-labelledby]="'collection-menu-dropdown-button-' + collection.id" ngbDropdownMenu>
          <a (click)="editCollection()" class="dropdown-item" astrobinEventPreventDefault href="#">
            {{ "Edit" | translate }}
          </a>

          <a (click)="addRemoveImages()" class="dropdown-item" astrobinEventPreventDefault href="#">
            {{ "Add/Remove images" | translate }}
          </a>

          <a (click)="createCollection()" class="dropdown-item" astrobinEventPreventDefault href="#">
            {{ "Create nested collection" | translate }}
          </a>

          <a (click)="deleteCollection()" class="dropdown-item text-danger" astrobinEventPreventDefault href="#">
            {{ "Delete" | translate }}
          </a>
        </div>
      </div>
    </ng-container>

    <ng-template #editCollectionOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "Edit collection" | translate }}</h5>
        <button (click)="offcanvas.dismiss()" class="btn-close"></button>
      </div>
      <div class="offcanvas-body">
        <form [formGroup]="editCollectionForm" (ngSubmit)="submitEditCollection()" novalidate>
          <formly-form [fields]="editCollectionFields" [form]="editCollectionForm" [model]="editCollectionModel">
          </formly-form>
          <div class="d-flex justify-content-end">
            <button class="btn btn-primary" type="submit">{{ "Save" | translate }}</button>
          </div>
        </form>
      </div>
    </ng-template>

    <ng-template #addRemoveImagesOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "Add/remove images" | translate }}</h5>
        <button (click)="offcanvas.dismiss()" class="btn-close"></button>
      </div>
      <div class="offcanvas-body">
        <astrobin-user-gallery-collection-add-remove-images
          [collection]="collection"
          [user]="user"
          [userProfile]="userProfile"
        ></astrobin-user-gallery-collection-add-remove-images>

        <div class="d-flex justify-content-center mt-4">
          <button (click)="offcanvas.dismiss()" class="btn btn-secondary" translate="Close" type="button"></button>
        </div>
      </div>
    </ng-template>

    <ng-template #createCollectionOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "Create collection" | translate }}</h5>
        <button (click)="offcanvas.close()" class="btn-close" type="button"></button>
      </div>
      <div class="offcanvas-body">
        <astrobin-user-gallery-collection-create
          [parent]="collection"
          [user]="user"
          [userProfile]="userProfile"
          (cancelClick)="offcanvas.close()"
        ></astrobin-user-gallery-collection-create>
      </div>
    </ng-template>

    <ng-template #deleteCollectionConfirmationOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "Delete collection" | translate }}</h5>
        <button (click)="offcanvas.dismiss()" class="btn-close"></button>
      </div>
      <div class="offcanvas-body">
        <p>{{ "Are you sure you want to delete this collection?" | translate }}</p>
        <p>{{ "The images in the collection will not be deleted." | translate }}</p>
        <div class="form-actions">
          <button (click)="offcanvas.dismiss()" class="btn btn-secondary">{{ "Cancel" | translate }}</button>
          <button (click)="submitDeleteCollection()" class="btn btn-danger">{{ "Delete" | translate }}</button>
        </div>
      </div>
    </ng-template>
  `,
  styleUrls: ["./user-gallery-collection-menu.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGalleryCollectionMenuComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;
  @Input() collection: CollectionInterface;

  @ViewChild("editCollectionOffcanvas") editCollectionOffcanvas: TemplateRef<any>;
  @ViewChild("addRemoveImagesOffcanvas") addRemoveImagesOffcanvas: TemplateRef<any>;
  @ViewChild("createCollectionOffcanvas") createCollectionOffcanvas: TemplateRef<any>;
  @ViewChild("deleteCollectionConfirmationOffcanvas") deleteCollectionConfirmationOffcanvas: TemplateRef<any>;

  protected editCollectionModel: CollectionInterface;
  protected editCollectionForm: FormGroup = new FormGroup({});
  protected editCollectionFields: FormlyFieldConfig[] = [];

  private _imagesChanged = false;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly translateService: TranslateService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly windowRefService: WindowRefService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnChanges(changes: SimpleChanges) {
    this._initEditCollectionFields();
  }

  protected editCollection(): void {
    this.offcanvasService.open(this.editCollectionOffcanvas, {
      position: this.deviceService.offcanvasPosition()
    });
  }

  protected addRemoveImages(): void {
    const offcanvas = this.offcanvasService.open(this.addRemoveImagesOffcanvas, {
      panelClass: "add-remove-images-offcanvas",
      position: this.deviceService.offcanvasPosition()
    });

    offcanvas.dismissed.subscribe(() => {
      if (this._imagesChanged && this.windowRefService.getCurrentUrl().href.includes("collection=")) {
        this.popNotificationsService.info(this.translateService.instant("Please refresh the page to see the changes."));
      }
    });

    this.actions$
      .pipe(
        ofType(
          AppActionTypes.ADD_IMAGE_TO_COLLECTION_SUCCESS,
          AppActionTypes.ADD_IMAGE_TO_COLLECTION_FAILURE,
          AppActionTypes.REMOVE_IMAGE_FROM_COLLECTION_SUCCESS,
          AppActionTypes.REMOVE_IMAGE_FROM_COLLECTION_FAILURE
        ),
        takeUntil(this.destroyed$)
      )
      .subscribe(() => {
        this._imagesChanged = true;
        this.changeDetectorRef.markForCheck();
      });
  }

  protected submitEditCollection(): void {
    this.actions$.pipe(ofType(AppActionTypes.UPDATE_COLLECTION_SUCCESS), take(1)).subscribe(() => {
      this.offcanvasService.dismiss();
      this.popNotificationsService.success(this.translateService.instant("Collection updated"));
    });

    this.actions$
      .pipe(
        ofType(AppActionTypes.UPDATE_COLLECTION_FAILURE),
        map((action: UpdateCollectionFailure) => action.payload.error),
        take(1)
      )
      .subscribe(error => {
        this.popNotificationsService.error(
          this.translateService.instant("Error updating collection") + ": " + JSON.stringify(error)
        );
      });

    this.store$.dispatch(new UpdateCollection({ collection: this.editCollectionModel }));
  }

  protected createCollection() {
    this.offcanvasService.open(this.createCollectionOffcanvas, {
      position: this.deviceService.offcanvasPosition()
    });
  }

  protected deleteCollection(): void {
    this.offcanvasService.open(this.deleteCollectionConfirmationOffcanvas, {
      position: this.deviceService.offcanvasPosition()
    });
  }

  protected submitDeleteCollection(): void {
    this.actions$.pipe(ofType(AppActionTypes.DELETE_COLLECTION_SUCCESS), take(1)).subscribe(() => {
      this.offcanvasService.dismiss();
      this.popNotificationsService.success(this.translateService.instant("Collection deleted"));
    });

    this.actions$
      .pipe(
        ofType(AppActionTypes.DELETE_COLLECTION_FAILURE),
        map((action: DeleteCollectionFailure) => action.payload.error),
        take(1)
      )
      .subscribe(error => {
        this.popNotificationsService.error(
          this.translateService.instant("Error deleting collection") + ": " + JSON.stringify(error)
        );
      });

    this.store$.dispatch(new DeleteCollection({ collectionId: this.collection.id }));
  }

  private _initEditCollectionFields(): void {
    this.editCollectionModel = { ...this.collection };
    this.editCollectionFields = [
      {
        key: "id",
        type: "input",
        className: "d-none"
      },
      {
        key: "dateCreated",
        type: "input",
        className: "d-none"
      },
      {
        key: "dateUpdated",
        type: "input",
        className: "d-none"
      },
      {
        key: "parent",
        type: "ng-select",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Parent collection"),
          options: this.store$.pipe(
            select(selectCollectionsByParams({ user: this.user.id })),
            map(collections =>
              collections
                .filter(collection => collection.id !== this.collection.id)
                .sort((a, b) => a.name.localeCompare(b.name))
            ),
            map(collections => [
              {
                label: this.translateService.instant("No parent"),
                value: null
              },
              ...collections.map(collection => ({
                label: collection.name,
                value: collection.id
              }))
            ])
          )
        }
      },
      {
        key: "user",
        type: "input",
        className: "d-none"
      },
      {
        key: "name",
        type: "input",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Name"),
          required: true,
          maxLength: 256
        }
      },
      {
        key: "description",
        type: "textarea",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Description"),
          rows: 8
        }
      },
      {
        key: "images",
        type: "input",
        className: "d-none"
      },
      {
        key: "cover",
        type: "input",
        className: "d-none"
      },
      {
        key: "coverThumbnail",
        type: "input",
        className: "d-none"
      },
      {
        key: "orderByTag",
        type: "input",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Order by image tag"),
          description: this.translateService.instant(
            "If you want to order the images in this collection by a tag, enter the tag here. " +
              `<a href="https://welcome.astrobin.com/features/image-collections" target="_blank" class="d-inline-block ms-1">` +
              this.translateService.instant("Learn more") +
              "</a>."
          )
        }
      },
      {
        key: "imageCount",
        type: "input",
        className: "d-none"
      }
    ];
  }
}
