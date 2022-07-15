import { AfterViewInit, Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { BaseItemEditorComponent } from "@shared/components/equipment/editors/base-item-editor/base-item-editor.component";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { State } from "@app/store/state";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { FormlyFieldService } from "@shared/services/formly-field.service";
import { AccessoryInterface, AccessoryType } from "@features/equipment/types/accessory.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FilterDisplayProperty } from "@features/equipment/services/filter.service";
import { FilterType } from "@features/equipment/types/filter.interface";
import { takeUntil } from "rxjs/operators";
import { AccessoryDisplayProperty, AccessoryService } from "@features/equipment/services/accessory.service";

@Component({
  selector: "astrobin-accessory-editor",
  templateUrl: "./accessory-editor.component.html",
  styleUrls: ["./accessory-editor.component.scss", "../base-item-editor/base-item-editor.component.scss"]
})
export class AccessoryEditorComponent extends BaseItemEditorComponent<AccessoryInterface, null>
  implements OnInit, AfterViewInit {
  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly formlyFieldService: FormlyFieldService,
    public readonly modalService: NgbModal,
    public readonly accessoryService: AccessoryService
  ) {
    super(
      store$,
      actions$,
      loadingService,
      translateService,
      windowRefService,
      equipmentApiService,
      equipmentItemService,
      formlyFieldService,
      modalService
    );
  }

  ngOnInit() {
    if (!this.returnToSelector) {
      this.returnToSelector = "#accessory-editor-form";
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._initFields();
    }, 1);

    this.model.klass = EquipmentItemType.ACCESSORY;

    super.ngAfterViewInit();
  }

  protected _customNameChangesValidations(field: FormlyFieldConfig, value: string) {
    const hasTripod: boolean = !!value && value.toLowerCase().indexOf("tripod") > -1;

    if (hasTripod) {
      field.formControl.setErrors({ "has-tripod-as-accessory": true });
      field.formControl.markAsTouched();
      field.formControl.markAsDirty();
    }
  }

  private _initFields() {
    this.initBrandAndName().subscribe(() => {
      this.fields = [
        this._getDIYField(),
        this._getBrandField(),
        this._getNameField(),
        this._getVariantOfField(EquipmentItemType.ACCESSORY),
        {
          key: "type",
          type: "ng-select",
          id: "accessory-field-type",
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
            label: this.accessoryService.getPrintablePropertyName(AccessoryDisplayProperty.TYPE),
            required: true,
            clearable: true,
            options: Object.keys(AccessoryType).map(accessoryType => ({
              value: AccessoryType[accessoryType],
              label: this.accessoryService.humanizeType(AccessoryType[accessoryType])
            }))
          }
        },
        this._getWebsiteField(),
        this._getImageField(),
        this._getCommunityNotesField()
      ];

      this._addBaseItemEditorFields();
    });
  }
}
