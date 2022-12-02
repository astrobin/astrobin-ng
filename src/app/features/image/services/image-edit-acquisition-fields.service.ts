import { Injectable } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { BaseService } from "@shared/services/base.service";
import { TranslateService } from "@ngx-translate/core";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { SubjectType } from "@shared/interfaces/image.interface";
import { selectEquipmentItems } from "@features/equipment/store/equipment.selectors";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { map, takeUntil } from "rxjs/operators";
import { distinctUntilChangedObj, UtilsService } from "@shared/services/utils/utils.service";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { AdditionalDeepSkyAcquisitionPropertiesModalComponent } from "@features/image/components/additional-deep-sky-acquisition-properties-modal/additional-deep-sky-acquisition-properties-modal.component";

@Injectable({
  providedIn: null
})
export class ImageEditAcquisitionFieldsService extends BaseService {
  constructor(
    public readonly store$: Store<State>,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly imageEditService: ImageEditService,
    public readonly modalService: NgbModal
  ) {
    super(loadingService);
  }

  getFields(): FormlyFieldConfig[] {
    if (this._isDeepSky()) {
      return this.getDeepSkyFields();
    } else if (this._isSolarSystem()) {
      return this.getSolarSystemFields();
    }

    return [];
  }

  getDeepSkyFields(): FormlyFieldConfig[] {
    return [
      {
        key: "deepSkyAcquisitions",
        type: "table",
        props: {
          label: this.translateService.instant("Deep sky acquisition sessions"),
          addLabel: this.translateService.instant("Add session"),
          additionalPropertiesClicked: (index: number) => {
            const modalRef: NgbModalRef = this.modalService.open(AdditionalDeepSkyAcquisitionPropertiesModalComponent);
            const componentInstance: AdditionalDeepSkyAcquisitionPropertiesModalComponent = modalRef.componentInstance;
            componentInstance.index = index;
          }
        },
        fieldArray: {
          fieldGroup: [
            this._getDateField(),
            this._getFilterField(),
            this._getNumberField(),
            this._getDurationField()
          ]
        }
      }
    ];
  }

  getSolarSystemFields(): FormlyFieldConfig[] {
    return [
      {
        key: "solarSystemAcquisitions",
        type: "table",
        props: {
          label: this.translateService.instant("Solar system acquisition sessions")
        },
        fieldArray: {
          fieldGroup: [this._getDateField()]
        }
      }
    ];
  }

  private _isDeepSky(): boolean {
    return [SubjectType.DEEP_SKY, SubjectType.WIDE_FIELD].indexOf(this.imageEditService.model.subjectType) > -1;
  }

  private _isSolarSystem(): boolean {
    return [SubjectType.SOLAR_SYSTEM].indexOf(this.imageEditService.model.subjectType) > -1;
  }

  private _getDateField(): FormlyFieldConfig {
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    return {
      key: "date",
      type: "input",
      wrappers: ["default-wrapper"],
      props: {
        type: "date",
        label: this.translateService.instant("Date"),
        description: this.translateService.instant("Acquisition date."),
        required: true
      },
      validators: {
        validation: [
          {
            name: "max-date",
            options: {
              value: now
            }
          }
        ]
      }
    };
  }

  private _getFilterField(): FormlyFieldConfig {
    return {
      key: "filter2",
      type: "ng-select",
      wrappers: ["default-wrapper"],
      props: {
        label: this.translateService.instant("Filter"),
        description: this.translateService.instant("Filter used (to add more, go to the equipment step)."),
        clearable: true,
        searchable: false,
        options: this.store$.select(selectEquipmentItems).pipe(
          takeUntil(this.destroyed$),
          map(items =>
            items.filter(
              item =>
                item.klass === EquipmentItemType.FILTER && this.imageEditService.model.filters2.indexOf(item.id) > -1
            )
          ),
          map(items =>
            items.map(item => ({
              value: item.id,
              label: `${item.brandName} ${item.name}`
            }))
          ),
          map(items => UtilsService.sortObjectsByProperty(items, "label")),
          distinctUntilChangedObj()
        ),
        appendTo: "body"
      }
    };
  }

  private _getNumberField(): FormlyFieldConfig {
    return {
      key: "number",
      type: "input",
      wrappers: ["default-wrapper"],
      props: {
        type: "number",
        label: this.translateService.instant("Number"),
        description: this.translateService.instant("Number of frames."),
        required: true,
        step: 1,
        min: 1
      },
      validators: {
        validation: [
          "whole-number"
        ]
      }
    };
  }

  private _getDurationField(): FormlyFieldConfig {
    return {
      key: "duration",
      type: "input",
      wrappers: ["default-wrapper"],
      props: {
        type: "number",
        label: this.translateService.instant("Duration"),
        description: this.translateService.instant("Duration of each frame in seconds."),
        required: true,
        step: 1,
        min: 0.01
      },
      validators: {
        validation: [
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
