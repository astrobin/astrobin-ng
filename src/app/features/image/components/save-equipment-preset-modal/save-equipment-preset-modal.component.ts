import { Component, OnInit } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { LoadingService } from "@shared/services/loading.service";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { selectEquipmentPresets } from "@features/equipment/store/equipment.selectors";
import { filter, take } from "rxjs/operators";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import { ImageEditService } from "@features/image/services/image-edit.service";
import {
  CreateEquipmentPreset,
  CreateEquipmentPresetSuccess,
  EquipmentActionTypes,
  UpdateEquipmentPreset,
  UpdateEquipmentPresetSuccess
} from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";

@Component({
  selector: "astrobin-create-equipment-preset-modal",
  templateUrl: "./save-equipment-preset-modal.component.html",
  styleUrls: ["./save-equipment-preset-modal.component.scss"]
})
export class SaveEquipmentPresetModalComponent extends BaseComponentDirective implements OnInit {
  fields: FormlyFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: {
    name: string;
  } = {
    name: null
  };

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal,
    public readonly modalService: NgbModal,
    public readonly imageEditService: ImageEditService,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.fields = [
      {
        key: "name",
        type: "input",
        id: "name",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("Preset name"),
          description: this.translateService.instant(
            `Here you can save an equipment preset so you can easily load it later on a different image <em>(e.g. "Home ` +
            `observatory", "Solar setup", "Travel setup 2022", etc)</em>`
          ),
          required: true,
          maxLength: 128
        }
      }
    ];
  }

  create() {
    const preset = this._getPreset();

    this.loadingService.setLoading(true);

    this.store$.dispatch(new CreateEquipmentPreset({ preset }));
    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.CREATE_EQUIPMENT_PRESET_SUCCESS),
        filter((action: CreateEquipmentPresetSuccess) => action.payload.preset.name === this.model.name),
        take(1)
      )
      .subscribe(() => {
        this.modal.close();
        this.loadingService.setLoading(false);
        this.popNotificationsService.success(
          this.translateService.instant(
            `Equipment preset created! You can use the "Load preset" button on a different image to assign the
            same equipment to it.`
          )
        );
      });
  }

  update(preset: EquipmentPresetInterface) {
    const update = { ...preset, ...this._getPreset() };

    this.loadingService.setLoading(true);

    this.store$.dispatch(new UpdateEquipmentPreset({ preset: update }));
    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.UPDATE_EQUIPMENT_PRESET_SUCCESS),
        filter((action: UpdateEquipmentPresetSuccess) => action.payload.preset.name === this.model.name),
        take(1)
      )
      .subscribe(() => {
        this.modal.close();
        this.loadingService.setLoading(false);
        this.popNotificationsService.success(this.translateService.instant("Equipment preset updated."));
      });
  }

  onCreateClicked() {
    this.store$
      .select(selectEquipmentPresets)
      .pipe(take(1))
      .subscribe(presets => {
        const existingPreset = presets.find(preset => preset.name === this.model.name);

        if (!!existingPreset) {
          const modalRef: NgbModalRef = this.modalService.open(ConfirmationDialogComponent, { size: "sm" });
          const componentInstance: ConfirmationDialogComponent = modalRef.componentInstance;

          componentInstance.message = this.translateService.instant(
            "You will overwrite your existing preset with the same name."
          );

          modalRef.closed.pipe(take(1)).subscribe(() => {
            this.update(existingPreset);
          });
        } else {
          this.create();
        }
      });
  }

  _getPreset(): EquipmentPresetInterface {
    return {
      name: this.model.name,
      imagingTelescopes: this.imageEditService.model.imagingTelescopes2,
      guidingTelescopes: this.imageEditService.model.guidingTelescopes2,
      imagingCameras: this.imageEditService.model.imagingCameras2,
      guidingCameras: this.imageEditService.model.guidingCameras2,
      mounts: this.imageEditService.model.mounts2,
      filters: this.imageEditService.model.filters2,
      accessories: this.imageEditService.model.accessories2,
      software: this.imageEditService.model.software2
    };
  }
}
