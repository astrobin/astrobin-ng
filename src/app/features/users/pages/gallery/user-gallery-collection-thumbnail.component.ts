import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { CollectionInterface } from "@shared/interfaces/collection.interface";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { selectCollectionsByParams } from "@app/store/selectors/app/collection.selectors";
import { map, take } from "rxjs/operators";
import { DeleteCollection, DeleteCollectionFailure, UpdateCollection, UpdateCollectionFailure } from "@app/store/actions/collection.actions";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";

@Component({
  selector: "astrobin-user-gallery-collection-thumbnail",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div class="collection-container">
        <div class="collection-background">
          <div class="collection-thumbnail">
            <img *ngIf="collection.coverThumbnail" [ngSrc]="collection.coverThumbnail" fill alt="" />
            <img
              *ngIf="!collection.coverThumbnail"
              [ngSrc]="'/assets/images/stars.jpg?v=20241008'"
              alt=""
              class="empty-collection-thumbnail"
              fill
            />
          </div>
        </div>

        <div
          *ngIf="currentUserWrapper.user?.id === collection.user"
          ngbDropdown
          container="body"
          class="collection-menu"
        >
          <button
            class="btn btn-sm btn-link btn-no-block no-toggle"
            ngbDropdownToggle
            id="collection-menu-dropdown-button-{{ collection.id }}"
            astrobinEventStopPropagation
          >
            <fa-icon icon="ellipsis"></fa-icon>
          </button>

          <div
            aria-labelledby="collection-menu-dropdown-button-{{ collection.id }}"
            ngbDropdownMenu
          >
            <a href="#" class="dropdown-item" (click)="editCollection()" astrobinEventPreventDefault>
              {{ "Edit" | translate }}
            </a>

            <a href="#" class="dropdown-item text-danger" (click)="deleteCollection()" astrobinEventPreventDefault>
              {{ "Delete" | translate }}
            </a>
          </div>
        </div>

        <div class="collection-name">
          {{ collection.name }}
        </div>

        <div class="collection-count">
          {{ "{{ 0  }} images" | translate: { "0": collection.imageCount } }}
        </div>
      </div>

      <ng-template #editCollectionOffcanvas let-offcanvas>
        <div class="offcanvas-header">
          <h5 class="offcanvas-title">{{ "Edit collection" | translate }}</h5>
          <button class="btn-close" (click)="offcanvas.dismiss()"></button>
        </div>
        <div class="offcanvas-body">
          <form [formGroup]="editCollectionForm" (ngSubmit)="submitEditCollection()" novalidate>
            <formly-form [model]="editCollectionModel" [fields]="editCollectionFields" [form]="editCollectionForm">
            </formly-form>
            <div class="d-flex justify-content-end">
              <button type="submit" class="btn btn-primary">{{ "Save" | translate }}</button>
            </div>
          </form>
        </div>
      </ng-template>

      <ng-template #deleteCollectionConfirmationOffcanvas let-offcanvas>
        <div class="offcanvas-header">
          <h5 class="offcanvas-title">{{ "Delete collection" | translate }}</h5>
          <button class="btn-close" (click)="offcanvas.dismiss()"></button>
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
    </ng-container>
  `,
  styleUrls: ["./user-gallery-collection-thumbnail.component.scss"]
})
export class UserGalleryCollectionThumbnailComponent
  extends BaseComponentDirective implements OnInit, OnChanges {
  @Input() user: UserInterface;
  @Input() collection: CollectionInterface;

  @ViewChild("editCollectionOffcanvas") editCollectionOffcanvas: TemplateRef<any>;
  @ViewChild("deleteCollectionConfirmationOffcanvas") deleteCollectionConfirmationOffcanvas: TemplateRef<any>;

  protected editCollectionModel: CollectionInterface;
  protected editCollectionForm: FormGroup = new FormGroup({});
  protected editCollectionFields: FormlyFieldConfig[] = [];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly translateService: TranslateService,
    public readonly popNotificationsService: PopNotificationsService
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

  protected submitEditCollection(): void {
    this.actions$.pipe(
      ofType(AppActionTypes.UPDATE_COLLECTION_SUCCESS),
      take(1)
    ).subscribe(() => {
      this.offcanvasService.dismiss();
      this.popNotificationsService.success(this.translateService.instant("Collection updated"));
    });

    this.actions$.pipe(
      ofType(AppActionTypes.UPDATE_COLLECTION_FAILURE),
      map((action: UpdateCollectionFailure) => action.payload.error),
      take(1)
    ).subscribe(error => {
      this.popNotificationsService.error(
        this.translateService.instant("Error updating collection") + ": " + JSON.stringify(error));
    });

    this.store$.dispatch(new UpdateCollection({ collection: this.editCollectionModel }));
  }

  protected deleteCollection(): void {
    this.offcanvasService.open(this.deleteCollectionConfirmationOffcanvas, {
      position: this.deviceService.offcanvasPosition()
    });
  }

  protected submitDeleteCollection(): void {
    this.actions$.pipe(
      ofType(AppActionTypes.DELETE_COLLECTION_SUCCESS),
      take(1)
    ).subscribe(() => {
      this.offcanvasService.dismiss();
      this.popNotificationsService.success(this.translateService.instant("Collection deleted"));
    });

    this.actions$.pipe(
      ofType(AppActionTypes.DELETE_COLLECTION_FAILURE),
      map((action: DeleteCollectionFailure) => action.payload.error),
      take(1)
    ).subscribe(error => {
      this.popNotificationsService.error(
        this.translateService.instant("Error deleting collection") + ": " + JSON.stringify(error));
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
            map(collections =>
              [
                {
                  label: this.translateService.instant("No parent"),
                  value: null
                },
                ...collections.map(collection => ({
                  label: collection.name,
                  value: collection.id
                }))
              ]
            )
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
        className: "d-none"
      },
      {
        key: "imageCount",
        type: "input",
        className: "d-none"
      }
    ];
  }
}
