import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { TranslateService } from "@ngx-translate/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import {
  BaseItemEditorComponent,
  EquipmentItemEditorMode
} from "@shared/components/equipment/editors/base-item-editor/base-item-editor.component";
import { LoadingService } from "@core/services/loading.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { MainState } from "@app/store/state";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EquipmentItemService } from "@core/services/equipment-item.service";
import { FormlyFieldService } from "@core/services/formly-field.service";
import { AccessoryInterface, AccessoryType } from "@features/equipment/types/accessory.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { AccessoryDisplayProperty, AccessoryService } from "@features/equipment/services/accessory.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { switchMap, take } from "rxjs/operators";
import { isGroupMember } from "@shared/operators/is-group-member.operator";
import { Constants } from "@shared/constants";

@Component({
  selector: "astrobin-accessory-editor",
  templateUrl: "./accessory-editor.component.html",
  styleUrls: ["./accessory-editor.component.scss", "../base-item-editor/base-item-editor.component.scss"]
})
export class AccessoryEditorComponent extends BaseItemEditorComponent<AccessoryInterface, null> implements OnInit {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly accessoryService: AccessoryService,
    public readonly formlyFieldService: FormlyFieldService,
    public readonly modalService: NgbModal,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly sanitizer: DomSanitizer
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
      modalService,
      utilsService,
      changeDetectorRef,
      classicRoutesService,
      sanitizer
    );
  }

  ngOnInit() {
    if (!this.returnToSelector) {
      this.returnToSelector = "#accessory-editor-form";
    }

    this.model.klass = EquipmentItemType.ACCESSORY;
    this._initFields();
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
    this.initBrandAndName()
      .pipe(switchMap(() => this.currentUser$.pipe(take(1), isGroupMember(Constants.EQUIPMENT_MODERATORS_GROUP))))
      .subscribe(isModerator => {
        if (this.editorMode === EquipmentItemEditorMode.CREATION || !this.model.reviewerDecision || isModerator) {
          this.fields = [
            this._getDIYField(),
            this._getBrandField(),
            this._getNameField(),
            this._getVariantOfField(EquipmentItemType.ACCESSORY, isModerator),
            this._getTypeField()
          ];
        } else {
          this.fields = [this._getNameField(), this._getVariantOfField(EquipmentItemType.ACCESSORY, isModerator)];

          if (this.model.type === null || this.model.type === AccessoryType.OTHER) {
            this.fields.push(this._getTypeField());
          }
        }

        this.fields = [...this.fields, this._getWebsiteField(), this._getImageField(), this._getCommunityNotesField()];

        this._addBaseItemEditorFields();
      });
  }

  private _getTypeField() {
    return {
      key: "type",
      type: "ng-select",
      id: "accessory-field-type",
      expressions: {
        "props.disabled": "formState.subCreation.inProgress || formState.brandCreation.inProgress"
      },
      props: {
        label: this.accessoryService.getPrintablePropertyName(AccessoryDisplayProperty.TYPE),
        required: true,
        clearable: true,
        options: Object.keys(AccessoryType).map(accessoryType => ({
          value: AccessoryType[accessoryType],
          label: this.accessoryService.humanizeType(AccessoryType[accessoryType])
        }))
      }
    };
  }
}
