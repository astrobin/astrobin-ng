import type { OnInit } from "@angular/core";
import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import type { MainState } from "@app/store/state";
import type { LoadingService } from "@core/services/loading.service";
import type { PopNotificationsService } from "@core/services/pop-notifications.service";
import type {
  CreateEquipmentPresetSuccess,
  UpdateEquipmentPresetSuccess
} from "@features/equipment/store/equipment.actions";
import {
  CreateEquipmentPreset,
  EquipmentActionTypes,
  UpdateEquipmentPreset
} from "@features/equipment/store/equipment.actions";
import { selectEquipmentPresets } from "@features/equipment/store/equipment.selectors";
import type { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import type { NgbActiveModal, NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import type { Actions } from "@ngrx/effects";
import { ofType } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import type { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { filter, take } from "rxjs/operators";

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

  @Input()
  initialPreset: EquipmentPresetInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal,
    public readonly modalService: NgbModal,
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
          label: this.translateService.instant("Setup name"),
          description: this.translateService.instant(
            `Here you can save an equipment setup, so you can easily load it later on a different image <em>(e.g. "Home ` +
              `observatory", "Solar setup", "Travel setup 2022", etc.)</em>`
          ),
          required: true,
          maxLength: 128
        }
      }
    ];
  }

  create() {
    const preset = { ...this.initialPreset, ...{ name: this.model.name } };

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
            `Equipment setup created! You will be able to load it later on a different image.`
          )
        );
      });

    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.CREATE_EQUIPMENT_PRESET_FAILURE),
        filter((action: CreateEquipmentPresetSuccess) => action.payload.preset.name === this.model.name),
        take(1)
      )
      .subscribe(() => {
        this.loadingService.setLoading(false);
        this.popNotificationsService.error(this.translateService.instant("Failed to create equipment setup."));
      });
  }

  update(preset: EquipmentPresetInterface) {
    const update = { ...preset, ...this.initialPreset, ...{ name: this.model.name } };

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
        this.popNotificationsService.success(this.translateService.instant("Equipment setup updated."));
      });

    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.UPDATE_EQUIPMENT_PRESET_FAILURE),
        filter((action: UpdateEquipmentPresetSuccess) => action.payload.preset.name === this.model.name),
        take(1)
      )
      .subscribe(() => {
        this.loadingService.setLoading(false);
        this.popNotificationsService.error(this.translateService.instant("Failed to update equipment setup."));
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
            "You will overwrite your existing setup with the same name."
          );

          modalRef.closed.pipe(take(1)).subscribe(() => {
            this.update(existingPreset);
          });
        } else {
          this.create();
        }
      });
  }
}
