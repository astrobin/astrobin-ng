import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from "@angular/core";
import { AbstractControl, FormControl, FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { of } from "rxjs";
import {
  CreateBrand,
  CreateBrandSuccess,
  EquipmentActionTypes,
  FindAllBrands,
  FindAllBrandsSuccess,
  FindAllEquipmentItemsSuccess,
  FindSimilarInBrand
} from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { filter, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { WindowRefService } from "@shared/services/window-ref.service";
import { LoadingService } from "@shared/services/loading.service";
import { State } from "@app/store/state";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { selectBrand } from "@features/equipment/store/equipment.selectors";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";

@Component({
  selector: "astrobin-base-equipment-item-editor",
  template: ""
})
export class BaseEquipmentItemEditorComponent<T extends EquipmentItemBaseInterface> extends BaseComponentDirective {
  fields: FormlyFieldConfig[];

  @Input()
  form: FormGroup = new FormGroup({});

  @Input()
  model: Partial<T> = {};

  @Input()
  name: string;

  @Input()
  returnToSelector: string;

  @Output()
  subCreationInProgress = new EventEmitter<boolean>();

  @Output()
  suggestionSelected = new EventEmitter<EquipmentItemBaseInterface>();

  @ViewChild("brandOptionTemplate")
  brandOptionTemplate: TemplateRef<any>;

  @ViewChild("similarItemsTemplate")
  similarItemsTemplate: TemplateRef<any>;

  brandCreation: {
    inProgress: boolean;
    form: FormGroup;
    name: string;
  } = {
    inProgress: false,
    form: new FormGroup({}),
    name: null
  };

  subCreation: {
    inProgress: boolean;
  } = {
    inProgress: false
  };

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService
  ) {
    super(store$);
  }

  resetBrandCreation() {
    this.brandCreation.inProgress = false;
    this.subCreationInProgress.emit(false);
    this.brandCreation.form.reset();
  }

  createBrand() {
    const { id, ...brand } = this.brandCreation.form.value;
    this.loadingService.setLoading(true);
    this.store$.dispatch(new CreateBrand({ brand }));
    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.CREATE_BRAND_SUCCESS),
        map((action: CreateBrandSuccess) => action.payload.brand)
      )
      .subscribe(newBrand => {
        this.brandCreated(newBrand);
        this.loadingService.setLoading(false);
      });
  }

  brandCreated(brand: BrandInterface) {
    this.resetBrandCreation();
    this.fields.find(field => field.key === "brand").templateOptions.options = [
      {
        value: brand.id,
        label: brand.name,
        brand
      }
    ];
    this.model = { ...this.model, ...{ brand: brand.id } };
    this.form.controls.brand.setValue(brand.id);
    this.brandCreation.name = brand.name;

    if (this.returnToSelector) {
      setTimeout(() => {
        this.windowRefService.nativeWindow.document
          .querySelector(this.returnToSelector)
          .scrollIntoView({ behavior: "smooth" });
      }, 1);
    }
  }

  protected _getBrandField() {
    return {
      key: "brand",
      type: "ng-select",
      id: "equipment-item-field-brand",
      expressionProperties: {
        "templateOptions.disabled": () => this.brandCreation.inProgress
      },
      templateOptions: {
        required: true,
        clearable: true,
        label: this.translateService.instant("Brand"),
        options: of([]),
        onSearch: (term: string) => {
          this._onBrandSearch(term);
        },
        optionTemplate: this.brandOptionTemplate,
        addTag: () => {
          this.brandCreation.inProgress = true;
          this.subCreationInProgress.emit(true);
          this.form.get("brand").setValue(null);
          setTimeout(() => {
            this.windowRefService.nativeWindow.document
              .getElementById("create-new-brand")
              .scrollIntoView({ behavior: "smooth" });
          }, 1);
        }
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          field.formControl.valueChanges
            .pipe(
              takeUntil(this.destroyed$),
              filter(value => !!value),
              tap(value => {
                if (this.form.get("name").value) {
                  this.form.get("name").markAsTouched();
                }
              }),
              switchMap((value: BrandInterface["id"]) => {
                return this.equipmentApiService.getBrand(value);
              }),
              tap((brand: BrandInterface) => {
                this.brandCreation.name = brand.name;
                this._validateBrandInName();
                this._similarItemSuggestion();
              })
            )
            .subscribe();
        }
      }
    };
  }

  protected _getNameField() {
    return {
      key: "name",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "equipment-item-field-name",
      defaultValue: this.name,
      expressionProperties: {
        "templateOptions.disabled": () => this.brandCreation.inProgress
      },
      templateOptions: {
        required: true,
        label: this.translateService.instant("Name"),
        description: this.translateService.instant(
          "The name of this product. Do not include the brand's name and make sure it's spelled correctly."
        ),
        warningMessage: null
      },
      hooks: {
        onInit: (field: FormlyFieldConfig) => {
          field.formControl.valueChanges
            .pipe(
              takeUntil(this.destroyed$),
              filter(value => !!value),
              tap((value: string) => {
                this._validateBrandInName();
                this._similarItemSuggestion();
              })
            )
            .subscribe();
        }
      },
      asyncValidators: {
        uniqueForBrand: {
          expression: (control: FormControl) => {
            const type: EquipmentItemType = this.equipmentItemService.getType(this.form.value);
            return this.equipmentApiService.getByNameAndType(control.value, type).pipe(map(item => !item));
          },
          message: this.translateService.instant("An item of the same type and the same name already exists.")
        }
      }
    };
  }

  protected _getImageField() {
    return {
      key: "image",
      type: "file",
      id: "camera-field-image",
      templateOptions: {
        required: false,
        label: this.translateService.instant("Image"),
        description: this.translateService.instant("Official (or official looking) product image. Max. 1MB."),
        accept: "image/jpeg, image/png"
      },

      validators: {
        validation: [{ name: "file-size", options: { max: 1024 * 1024 } }, { name: "image-file" }]
      }
    };
  }

  protected _onBrandSearch(term: string) {
    this.brandCreation.name = term;

    if (!this.brandCreation.name) {
      return of([]);
    }

    const field = this.fields.find(f => f.key === "brand");
    this.store$.dispatch(new FindAllBrands({ q: this.brandCreation.name }));
    field.templateOptions.options = this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_ALL_BRANDS_SUCCESS),
      map((action: FindAllBrandsSuccess) => action.payload.brands),
      map(brands =>
        brands.map(brand => {
          return {
            value: brand.id,
            label: brand.name,
            brand
          };
        })
      )
    );
  }

  private _similarItemSuggestion() {
    const brandControl: AbstractControl = this.form.get("brand");
    const nameControl: AbstractControl = this.form.get("name");
    const nameFieldConfig: FormlyFieldConfig = this.fields.find(field => field.key === "name");
    const type: EquipmentItemType = this.equipmentItemService.getType(this.form.value);

    if (!type || !brandControl.value || !nameControl.value) {
      return;
    }

    this.store$.dispatch(new FindSimilarInBrand({ brand: brandControl.value, q: nameControl.value, type }));
    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.FIND_SIMILAR_IN_BRAND_SUCCESS),
        map((action: FindAllEquipmentItemsSuccess) => action.payload.items),
        take(1)
      )
      .subscribe(similarItems => {
        let template = null;
        let data = null;

        if (similarItems.length > 1) {
          template = this.similarItemsTemplate;
          data = similarItems;
        }

        nameFieldConfig.templateOptions.warningTemplate = template;
        nameFieldConfig.templateOptions.warningTemplateData = data;
      });
  }

  private _validateBrandInName() {
    const brandControl: AbstractControl = this.form.get("brand");
    const nameControl: AbstractControl = this.form.get("name");
    const brandFieldConfig: FormlyFieldConfig = this.fields.find(field => field.key === "brand");
    const nameFieldConfig: FormlyFieldConfig = this.fields.find(field => field.key === "name");
    let message;

    if (!brandControl.value || !nameControl.value) {
      return;
    }

    this.store$
      .select(selectBrand, brandControl.value)
      .pipe(filter(brand => !!brand))
      .subscribe(brand => {
        if (nameControl.value.toLowerCase().indexOf(brand.name.toLowerCase()) > -1) {
          message = "Careful! The item's name contains the brand's name, and it probably shouldn't.";
        } else {
          message = null;
        }

        brandFieldConfig.templateOptions.warningMessage = message;
        nameFieldConfig.templateOptions.warningMessage = message;
      });
  }
}
