import type { AfterViewInit } from "@angular/core";
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { AppActionTypes } from "@app/store/actions/app.actions";
import type { CreateCollectionSuccess } from "@app/store/actions/collection.actions";
import { CreateCollection } from "@app/store/actions/collection.actions";
import { selectCollectionsByParams } from "@app/store/selectors/app/collection.selectors";
import type { MainState } from "@app/store/state";
import { CollectionInterface } from "@core/interfaces/collection.interface";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { ImageApiService } from "@core/services/api/classic/images/image/image-api.service";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { map, take, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-user-gallery-collection-create",
  template: `
    <form *ngIf="!createdCollection" [formGroup]="form" (ngSubmit)="onSubmit()">
      <formly-form [form]="form" [fields]="fields" [model]="model"></formly-form>
      <div class="d-flex justify-content-end mt-4">
        <button
          (click)="cancelClick.emit(null)"
          class="btn btn-secondary btn-no-block me-2"
          translate="Cancel"
          type="button"
        ></button>
        <button
          [class.loading]="loadingService.loading$ | async"
          [disabled]="!form.valid"
          class="btn btn-primary btn-no-block"
          translate="Create"
          type="submit"
        ></button>
      </div>
    </form>

    <ng-container *ngIf="createdCollection">
      <astrobin-user-gallery-collection-add-remove-images
        [user]="user"
        [userProfile]="userProfile"
        [collection]="createdCollection"
      ></astrobin-user-gallery-collection-add-remove-images>

      <div class="d-flex justify-content-center mt-4">
        <button class="btn btn-secondary" (click)="cancelClick.emit(null)" translate="Close" type="button"></button>
      </div>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-collection-create.component.scss"]
})
export class UserGalleryCollectionCreateComponent extends BaseComponentDirective implements AfterViewInit {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;
  @Input() parent: CollectionInterface;

  @Output() cancelClick = new EventEmitter<void>();
  @Output() collectionCreate = new EventEmitter<CollectionInterface>();

  protected model: Partial<CollectionInterface> = {};
  protected form: FormGroup = new FormGroup({});
  protected fields: FormlyFieldConfig[] = [];
  protected createdCollection: CollectionInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly action$: Actions,
    public readonly translateService: TranslateService,
    public readonly imageApiService: ImageApiService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly loadingService: LoadingService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  ngAfterViewInit() {
    this._initFields();
  }

  protected onSubmit() {
    if (!this.form.valid) {
      return;
    }

    this.action$
      .pipe(
        ofType(AppActionTypes.CREATE_COLLECTION_SUCCESS),
        map((action: CreateCollectionSuccess) => action.payload.collection),
        take(1)
      )
      .subscribe(collection => {
        this.createdCollection = collection;
        this.changeDetectorRef.detectChanges();
        this.collectionCreate.emit(collection);
      });

    this.store$.dispatch(
      new CreateCollection({
        parent: this.model.parent,
        name: this.model.name,
        description: this.model.description,
        orderByTag: this.model.orderByTag
      })
    );
  }

  private _initFields() {
    this.fields = [
      {
        key: "user",
        type: "input",
        className: "d-none",
        defaultValue: this.user.id
      },
      {
        key: "parent",
        type: "ng-select",
        wrappers: ["default-wrapper"],
        defaultValue: this.parent?.id,
        props: {
          label: this.translateService.instant("Parent collection"),
          description: this.translateService.instant(
            "If you want to create a nested collection, select the parent collection here."
          ),
          options: this.store$.select(selectCollectionsByParams({ user: this.user.id })).pipe(
            map(collections => collections.map(collection => ({ label: collection.name, value: collection.id }))),
            takeUntil(this.destroyed$)
          ),
          searchable: true,
          clearable: true
        }
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
          rows: 5
        }
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
      }
    ];
  }
}
