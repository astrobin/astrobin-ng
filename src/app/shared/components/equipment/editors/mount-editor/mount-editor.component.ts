import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import {
  BaseItemEditorComponent,
  EquipmentItemEditorMode
} from "@shared/components/equipment/editors/base-item-editor/base-item-editor.component";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { State } from "@app/store/state";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { FormlyFieldService } from "@shared/services/formly-field.service";
import { MountDisplayProperty, MountService } from "@features/equipment/services/mount.service";
import { MountInterface, MountType } from "@features/equipment/types/mount.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { switchMap, take, takeUntil } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";
import { isGroupMember } from "@shared/operators/is-group-member.operator";

@Component({
  selector: "astrobin-mount-editor",
  templateUrl: "./mount-editor.component.html",
  styleUrls: ["./mount-editor.component.scss", "../base-item-editor/base-item-editor.component.scss"]
})
export class MountEditorComponent extends BaseItemEditorComponent<MountInterface, null> implements OnInit {
  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly formlyFieldService: FormlyFieldService,
    public readonly mountService: MountService,
    public readonly modalService: NgbModal,
    public readonly utilsService: UtilsService,
    public readonly changeDetectorRef: ChangeDetectorRef
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
      changeDetectorRef
    );
  }

  ngOnInit() {
    super.ngOnInit();

    if (!this.returnToSelector) {
      this.returnToSelector = "#mount-editor-form";
    }

    this.model.klass = EquipmentItemType.MOUNT;
    this._initFields();
  }

  private _initFields() {
    this.initBrandAndName()
      .pipe(switchMap(() => this.currentUser$.pipe(take(1), isGroupMember("equipment_moderators"))))
      .subscribe(isModerator => {
        if (this.editorMode === EquipmentItemEditorMode.CREATION || !this.model.reviewerDecision || isModerator) {
          this.fields = [
            this._getDIYField(),
            this._getBrandField(),
            this._getNameField(),
            this._getVariantOfField(EquipmentItemType.MOUNT),
            this._getTypeField(),
            this._getWeightField(),
            this._getMaxPayloadField(),
            this._getComputerizedField(),
            this._getPeriodicErrorField(),
            this._getPecField(),
            this._getSlewSpeedField()
          ];
        } else {
          this.fields = [this._getNameField(), this._getVariantOfField(EquipmentItemType.MOUNT)];

          if (!this.model.type || this.model.type === MountType.OTHER) {
            this.fields.push(this._getTypeField());
          }

          if (!this.model.weight) {
            this.fields.push(this._getWeightField());
          }

          if (!this.model.maxPayload) {
            this.fields.push(this._getMaxPayloadField());
          }

          if (this.model.computerized === null) {
            this.fields.push(this._getComputerizedField());
          }

          if (this.model.periodicError === null) {
            this.fields.push(this._getPeriodicErrorField());
          }

          if (this.model.pec === null) {
            this.fields.push(this._getPecField());
          }

          if (!this.model.slewSpeed) {
            this.fields.push(this._getSlewSpeedField());
          }
        }

        this.fields = [...this.fields, this._getImageField(), this._getWebsiteField(), this._getCommunityNotesField()];

        this._addBaseItemEditorFields();
      });
  }

  private _getTypeField() {
    return {
      key: "type",
      type: "ng-select",
      id: "mount-field-type",
      expressionProperties: {
        "props.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
      },
      props: {
        label: this.mountService.getPrintablePropertyName(MountDisplayProperty.TYPE),
        required: true,
        clearable: true,
        options: Object.keys(MountType).map(mountType => ({
          value: MountType[mountType],
          label: this.mountService.humanizeType(MountType[mountType])
        }))
      },
      hooks: {
        onInit: field => {
          field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(mountType => {
            if (mountType === MountType.TRIPOD) {
              this.model.computerized = false;
              field.formControl.get("computerized").setValue(false, { onlySelf: true, emitEvent: false });
            }
          });
        }
      }
    };
  }

  private _getWeightField() {
    return {
      key: "weight",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "mount-field-weight",
      expressionProperties: {
        "props.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
      },
      props: {
        type: "number",
        step: 1,
        label: this.mountService.getPrintablePropertyName(MountDisplayProperty.WEIGHT)
      },
      validators: {
        validation: [
          "number",
          {
            name: "min-value",
            options: {
              minValue: 0.01
            }
          },
          {
            name: "max-decimals",
            options: {
              value: 2
            }
          }
        ]
      }
    };
  }

  private _getMaxPayloadField() {
    return {
      key: "maxPayload",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "mount-field-max-payload",
      expressionProperties: {
        "props.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
      },
      props: {
        type: "number",
        step: 1,
        label: this.mountService.getPrintablePropertyName(MountDisplayProperty.MAX_PAYLOAD)
      },
      validators: {
        validation: [
          "number",
          {
            name: "min-value",
            options: {
              minValue: 0.01
            }
          }
        ]
      }
    };
  }

  private _getComputerizedField() {
    return {
      key: "computerized",
      type: "checkbox",
      wrappers: ["default-wrapper"],
      id: "mount-field-computerized",
      hideExpression: () => this.model.type === MountType.TRIPOD,
      expressionProperties: {
        "props.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
      },
      props: {
        label: this.mountService.getPrintablePropertyName(MountDisplayProperty.COMPUTERIZED)
      }
    };
  }

  private _getPeriodicErrorField() {
    return {
      key: "periodicError",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "mount-field-periodic-error",
      hideExpression: () => !this.model.computerized,
      expressionProperties: {
        "props.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
      },
      props: {
        type: "number",
        step: 1,
        label: this.mountService.getPrintablePropertyName(MountDisplayProperty.PERIODIC_ERROR)
      },
      validators: {
        validation: [
          "number",
          {
            name: "min-value",
            options: {
              minValue: 0
            }
          },
          {
            name: "max-decimals",
            options: {
              value: 2
            }
          }
        ]
      }
    };
  }

  private _getPecField() {
    return {
      key: "pec",
      type: "checkbox",
      wrappers: ["default-wrapper"],
      id: "mount-field-pec",
      defaultValue: false,
      hideExpression: () => !this.model.computerized,
      expressionProperties: {
        "props.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
      },
      props: {
        label: this.mountService.getPrintablePropertyName(MountDisplayProperty.PEC)
      }
    };
  }

  private _getSlewSpeedField() {
    return {
      key: "slewSpeed",
      type: "input",
      wrappers: ["default-wrapper"],
      id: "mount-field-slew-speed",
      hideExpression: () => !this.model.computerized,
      expressionProperties: {
        "props.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
      },
      props: {
        type: "number",
        step: 0.1,
        label: this.mountService.getPrintablePropertyName(MountDisplayProperty.SLEW_SPEED)
      },
      validators: {
        validation: [
          "number",
          {
            name: "min-value",
            options: {
              minValue: 0.1
            }
          },
          {
            name: "max-decimals",
            options: {
              value: 2
            }
          }
        ]
      }
    };
  }
}
