import { AfterViewInit, Component, EventEmitter, Input, Output } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { ImageApiService } from "@shared/services/api/classic/images/image/image-api.service";
import { Actions, ofType } from "@ngrx/effects";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { LoadingService } from "@shared/services/loading.service";
import { CollectionInterface } from "@shared/interfaces/collection.interface";
import { selectCollectionsByParams } from "@app/store/selectors/app/collection.selectors";
import { map, take, takeUntil } from "rxjs/operators";
import { CreateCollection } from "@app/store/actions/collection.actions";
import { AppActionTypes } from "@app/store/actions/app.actions";

@Component({
  selector: "astrobin-user-gallery-collection-create",
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
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
  `,
  styleUrls: ["./user-gallery-header-change-image.component.scss"]
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

  constructor(
    public readonly store$: Store<MainState>,
    public readonly action$: Actions,
    public readonly translateService: TranslateService,
    public readonly imageApiService: ImageApiService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly loadingService: LoadingService
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

    this.action$.pipe(
      ofType(AppActionTypes.CREATE_COLLECTION_SUCCESS),
      take(1)
    ).subscribe((action: any) => {
      this.collectionCreate.emit(action.payload.collection);
    });

    this.store$.dispatch(new CreateCollection({
      parent: this.model.parent,
      name: this.model.name,
      description: this.model.description,
      orderByTag: this.model.orderByTag
    }));
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
          options: this.store$
            .select(selectCollectionsByParams({ user: this.user.id }))
            .pipe(
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
          rows: 5,
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
          ),
        }
      }
    ];
  }
}
