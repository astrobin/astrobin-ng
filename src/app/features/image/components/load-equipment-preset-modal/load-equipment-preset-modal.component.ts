import { Component, OnInit } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions, ofType } from "@ngrx/effects";
import { LoadingService } from "@shared/services/loading.service";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ImageEditService } from "@features/image/services/image-edit.service";
import { filter, first, take } from "rxjs/operators";
import { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import {
  selectEquipmentItem,
  selectEquipmentPreset,
  selectEquipmentPresets
} from "@features/equipment/store/equipment.selectors";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType,
  EquipmentItemUsageType
} from "@features/equipment/types/equipment-item-base.interface";
import {
  DeleteEquipmentPreset,
  EquipmentActionTypes,
  ItemBrowserSet,
  LoadEquipmentItem
} from "@features/equipment/store/equipment.actions";
import { forkJoin } from "rxjs";

@Component({
  selector: "astrobin-load-equipment-preset-modal",
  templateUrl: "./load-equipment-preset-modal.component.html",
  styleUrls: ["./load-equipment-preset-modal.component.scss"]
})
export class LoadEquipmentPresetModalComponent extends BaseComponentDirective implements OnInit {
  fields: FormlyFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: {
    preset: EquipmentPresetInterface["id"] | null;
  } = {
    preset: null
  };

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal,
    public readonly modalService: NgbModal,
    public readonly imageEditService: ImageEditService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this._setFields();
  }

  onLoadClicked() {
    this.store$
      .select(selectEquipmentPreset, { id: this.model.preset })
      .pipe(
        filter(preset => !!preset),
        take(1)
      )
      .subscribe(preset => {
        if (this.imageEditService.hasEquipmentItems()) {
          const modalRef = this.modalService.open(ConfirmationDialogComponent, { size: "sm" });
          const componentInstance: ConfirmationDialogComponent = modalRef.componentInstance;

          componentInstance.message = this.translateService.instant(
            "This operation will overwrite the current equipment selection."
          );

          modalRef.closed.pipe(take(1)).subscribe(() => {
            this.load(preset);
          });

          return;
        }

        this.load(preset);
      });
  }

  load(preset: EquipmentPresetInterface) {
    for (const klass of [
      {
        property: "imagingTelescopes",
        type: EquipmentItemType.TELESCOPE,
        usageType: EquipmentItemUsageType.IMAGING
      },
      {
        property: "imagingCameras",
        type: EquipmentItemType.CAMERA,
        usageType: EquipmentItemUsageType.IMAGING
      },
      {
        property: "mounts",
        type: EquipmentItemType.MOUNT
      },
      {
        property: "filters",
        type: EquipmentItemType.FILTER
      },
      {
        property: "accessories",
        type: EquipmentItemType.ACCESSORY
      },
      {
        property: "software",
        type: EquipmentItemType.SOFTWARE
      },
      {
        property: "guidingTelescopes",
        type: EquipmentItemType.TELESCOPE,
        usageType: EquipmentItemUsageType.GUIDING
      },
      {
        property: "guidingCameras",
        type: EquipmentItemType.CAMERA,
        usageType: EquipmentItemUsageType.GUIDING
      }
    ]) {
      const ids = preset[klass.property] as EquipmentItemBaseInterface["id"][];
      ids.forEach(id => {
        this.store$.dispatch(new LoadEquipmentItem({ id, type: klass.type }));
      });

      forkJoin(
        ids.map(id =>
          this.store$.select(selectEquipmentItem, { id, type: klass.type }).pipe(
            filter(item => !!item),
            first()
          )
        )
      ).subscribe(items => {
        this.store$.dispatch(
          new ItemBrowserSet({
            type: klass.type,
            usageType: klass.usageType,
            items
          })
        );
      });
    }

    this.modal.close();
  }

  onDeleteClicked() {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, { size: "sm" });
    const componentInstance: ConfirmationDialogComponent = modalRef.componentInstance;

    componentInstance.message = this.translateService.instant("This operation cannot be undone.");

    modalRef.closed.pipe(take(1)).subscribe(() => {
      this.loadingService.setLoading(true);
      this.store$.dispatch(new DeleteEquipmentPreset({ id: this.model.preset }));
      this.actions$.pipe(ofType(EquipmentActionTypes.DELETE_EQUIPMENT_PRESET_SUCCESS), take(1)).subscribe(() => {
        this.loadingService.setLoading(false);
        this._setFields();
      });
    });
  }

  _setFields() {
    this.store$
      .select(selectEquipmentPresets)
      .pipe(take(1))
      .subscribe(presets => {
        this.fields = [
          {
            key: "preset",
            type: "radio",
            wrappers: ["default-wrapper"],
            templateOptions: {
              required: true,
              options: presets.map(preset => ({
                key: preset.id,
                value: preset.name
              }))
            }
          }
        ];
      });
  }
}
