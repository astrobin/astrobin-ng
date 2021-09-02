import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Component, Input, TemplateRef, ViewChild } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import {
  AnyEquipmentItemType,
  EquipmentItemBaseInterface
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { of } from "rxjs";
import {
  CreateBrand,
  CreateBrandSuccess,
  EquipmentActionTypes,
  FindAllBrands,
  FindAllBrandsSuccess
} from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { map } from "rxjs/operators";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { WindowRefService } from "@shared/services/window-ref.service";
import { LoadingService } from "@shared/services/loading.service";
import { State } from "@app/store/state";

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

  @ViewChild("brandOptionTemplate")
  brandOptionTemplate: TemplateRef<any>;

  brandCreation: {
    inProgress: boolean;
    form: FormGroup;
    name: string;
  } = {
    inProgress: false,
    form: new FormGroup({}),
    name: null
  };

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService
  ) {
    super(store$);
  }

  cancelBrandCreation() {
    this.brandCreation.inProgress = false;
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
    this.cancelBrandCreation();
    this.fields.find(field => field.key === "brand").templateOptions.options = [
      {
        value: brand.id,
        label: brand.name,
        brand
      }
    ];
    this.model = { ...this.model, ...{ brand: brand.id } };
    this.form.controls.brand.setValue(brand.id);
    setTimeout(() => {
      this.windowRefService.nativeWindow.document
        .getElementById("equipment-item-editor-form")
        .scrollIntoView({ behavior: "smooth" });
    }, 1);
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
        onSearch: (event: { term: string; items: EquipmentItemBaseInterface[] }) => {
          this._onBrandSearch(event);
        },
        optionTemplate: this.brandOptionTemplate,
        addTag: () => {
          this.brandCreation.inProgress = true;
          this.form.controls.brand.setValue(null);
          setTimeout(() => {
            this.windowRefService.nativeWindow.document
              .getElementById("create-new-brand")
              .scrollIntoView({ behavior: "smooth" });
          }, 1);
        }
      }
    };
  }

  protected _getNameField() {
    return {
      key: "name",
      type: "input",
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
        )
      }
    };
  }

  protected _onBrandSearch(event: { term: string; items: BrandInterface[] }) {
    this.brandCreation.name = event.term;

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
}
