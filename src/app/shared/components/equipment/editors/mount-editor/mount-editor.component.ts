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
import { MountDisplayProperty, MountService } from "@features/equipment/services/mount.service";
import { MountInterface, MountType } from "@features/equipment/types/mount.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "astrobin-mount-editor",
  templateUrl: "./mount-editor.component.html",
  styleUrls: ["./mount-editor.component.scss", "../base-item-editor/base-item-editor.component.scss"]
})
export class MountEditorComponent extends BaseItemEditorComponent<MountInterface, null>
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
    public readonly mountService: MountService,
    public readonly modalService: NgbModal
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
      this.returnToSelector = "#mount-editor-form";
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this._initFields();
    }, 1);

    this.model.klass = EquipmentItemType.MOUNT;

    super.ngAfterViewInit();
  }

  private _initFields() {
    this.initBrandAndName().subscribe(() => {
      this.fields = [
        this._getDIYField(),
        this._getBrandField(),
        this._getNameField(),
        this._getVariantOfField(EquipmentItemType.MOUNT),
        {
          key: "type",
          type: "ng-select",
          id: "mount-field-type",
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
            label: this.mountService.getPrintablePropertyName(MountDisplayProperty.TYPE),
            required: true,
            clearable: true,
            options: Object.keys(MountType).map(mountType => ({
              value: MountType[mountType],
              label: this.mountService.humanizeType(MountType[mountType])
            }))
          }
        },
        {
          key: "weight",
          type: "input",
          wrappers: ["default-wrapper"],
          id: "mount-field-weight",
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
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
                  minValue: 1
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
        },
        {
          key: "maxPayload",
          type: "input",
          wrappers: ["default-wrapper"],
          id: "mount-field-max-payload",
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
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
                  minValue: 1
                }
              }
            ]
          }
        },
        {
          key: "computerized",
          type: "checkbox",
          wrappers: ["default-wrapper"],
          id: "mount-field-computerized",
          defaultValue: true,
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
            label: this.mountService.getPrintablePropertyName(MountDisplayProperty.COMPUTERIZED)
          }
        },
        {
          key: "periodicError",
          type: "input",
          wrappers: ["default-wrapper"],
          id: "mount-field-periodic-error",
          hideExpression: () => !this.model.computerized,
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
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
        },
        {
          key: "pec",
          type: "checkbox",
          wrappers: ["default-wrapper"],
          id: "mount-field-pec",
          defaultValue: false,
          hideExpression: () => !this.model.computerized,
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
            label: this.mountService.getPrintablePropertyName(MountDisplayProperty.PEC)
          }
        },
        {
          key: "slewSpeed",
          type: "input",
          wrappers: ["default-wrapper"],
          id: "mount-field-slew-speed",
          hideExpression: () => !this.model.computerized,
          expressionProperties: {
            "templateOptions.disabled": () => this.subCreation.inProgress || this.brandCreation.inProgress
          },
          templateOptions: {
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
        },
        this._getImageField(),
        this._getWebsiteField()
      ];

      this._addBaseItemEditorFields();
    });
  }
}
