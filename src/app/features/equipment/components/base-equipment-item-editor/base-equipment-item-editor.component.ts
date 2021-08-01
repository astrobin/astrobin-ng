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
import { EquipmentActionTypes, FindAllBrands, FindAllBrandsSuccess } from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { map } from "rxjs/operators";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-base-equipment-item-editor",
  template: ""
})
export class BaseEquipmentItemEditorComponent extends BaseComponentDirective {
  fields: FormlyFieldConfig[];

  @Input()
  form: FormGroup = new FormGroup({});

  @Input()
  model: Partial<AnyEquipmentItemType> = {};

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
    public readonly store$: Store,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService
  ) {
    super();
  }

  cancelBrandCreation() {
    this.brandCreation.inProgress = false;
  }

  protected _getBrandField() {
    return {
      key: "brand",
      type: "ng-select",
      id: "equipment-item-field-brand",
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
    this.store$.dispatch(new FindAllBrands({ name: this.brandCreation.name }));
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
