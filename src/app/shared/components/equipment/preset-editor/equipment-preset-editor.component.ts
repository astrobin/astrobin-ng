import { OnInit, Component, EventEmitter, Input, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MainState } from "@app/store/state";
import { UserInterface } from "@core/interfaces/user.interface";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import {
  UpdateEquipmentPresetSuccess,
  CreateEquipmentPreset,
  CreateEquipmentPresetSuccess,
  EquipmentActionTypes,
  UpdateEquipmentPreset
} from "@features/equipment/store/equipment.actions";
import { EquipmentItemType, EquipmentItemUsageType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { filter, take } from "rxjs/operators";

@Component({
  selector: "astrobin-equipment-preset-editor",
  templateUrl: "./equipment-preset-editor.component.html",
  styleUrls: ["./equipment-preset-editor.component.scss"]
})
export class EquipmentPresetEditorComponent extends BaseComponentDirective implements OnInit {
  @Input() preset: EquipmentPresetInterface;
  @Output() readonly presetSaved = new EventEmitter<EquipmentPresetInterface>();

  protected form: FormGroup = new FormGroup({});
  protected fields: FormlyFieldConfig[];
  protected model: EquipmentPresetInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$);
  }

  ngOnInit() {
    if (this.preset) {
      this.model = { ...this.preset };
    } else {
      this.model = {
        id: null,
        name: "",
        description: "",
        imageFile: null,
        imagingTelescopes: [],
        imagingCameras: [],
        mounts: [],
        filters: [],
        accessories: [],
        software: [],
        guidingTelescopes: [],
        guidingCameras: []
      };
    }

    this._initFields();
  }

  onSaveClicked() {
    if (!this.form.valid) {
      this.form.markAllAsTouched();
      this.popNotificationsService.error(
        this.translateService.instant("Please check the form for errors and try again.")
      );
      return;
    }

    this.loadingService.setLoading(true);

    if (this.model.id) {
      this.actions$
        .pipe(
          ofType(EquipmentActionTypes.UPDATE_EQUIPMENT_PRESET_SUCCESS),
          filter((action: UpdateEquipmentPresetSuccess) => action.payload.preset.id === this.model.id),
          take(1)
        )
        .subscribe(() => {
          this.loadingService.setLoading(false);
          this.popNotificationsService.success(this.translateService.instant("Equipment setup updated."));
          this.presetSaved.emit(this.form.value);
        });

      this.actions$
        .pipe(
          ofType(EquipmentActionTypes.UPDATE_EQUIPMENT_PRESET_FAILURE),
          filter((action: UpdateEquipmentPresetSuccess) => action.payload.preset.id === this.model.id),
          take(1)
        )
        .subscribe(() => {
          this.loadingService.setLoading(false);
          this.popNotificationsService.error(this.translateService.instant("Failed to update equipment setup."));
        });

      this.store$.dispatch(new UpdateEquipmentPreset({ preset: this.model }));
    } else {
      this.actions$.pipe(ofType(EquipmentActionTypes.CREATE_EQUIPMENT_PRESET_SUCCESS), take(1)).subscribe(() => {
        this.loadingService.setLoading(false);
        this.popNotificationsService.success(this.translateService.instant("Equipment setup created."));
        this.presetSaved.emit(this.form.value);
      });

      this.actions$.pipe(ofType(EquipmentActionTypes.CREATE_EQUIPMENT_PRESET_FAILURE), take(1)).subscribe(() => {
        this.loadingService.setLoading(false);
        this.popNotificationsService.error(this.translateService.instant("Failed to create equipment setup."));
      });

      this.store$.dispatch(new CreateEquipmentPreset({ preset: this.model }));
    }
  }

  private _equipmentField(
    user: UserInterface,
    key: string,
    label: string,
    itemType: EquipmentItemType,
    usageType?: EquipmentItemUsageType
  ): FormlyFieldConfig {
    return {
      key,
      type: "equipment-item-browser",
      props: {
        multiple: true,
        required: false,
        label,
        itemType,
        usageType,
        quickAddRecentFromUserId: user.id,
        showPlaceholderImage: false,
        enableCreation: true,
        enableFullscreen: true,
        enableSelectFrozen: false,
        componentId: this.componentId
      }
    };
  }

  private _initFields() {
    this.currentUser$.subscribe(user => {
      this.fields = [
        {
          key: "name",
          type: "input",
          wrappers: ["default-wrapper"],
          props: {
            label: this.translateService.instant("Name"),
            required: true,
            maxLength: 128
          }
        },
        {
          key: "description",
          type: "ckeditor",
          wrappers: ["default-wrapper"],
          props: {
            label: this.translateService.instant("Description")
          }
        },
        {
          key: "imageFile",
          type: "file",
          wrappers: ["default-wrapper"],
          props: {
            required: false,
            label: this.translateService.instant("Image"),
            accept: "image/jpeg, image/png",
            image: true
          }
        },
        this._equipmentField(
          user,
          "imagingTelescopes",
          this.translateService.instant("Acquisition telescopes or lenses"),
          EquipmentItemType.TELESCOPE,
          EquipmentItemUsageType.IMAGING
        ),
        this._equipmentField(
          user,
          "imagingCameras",
          this.translateService.instant("Acquisition cameras"),
          EquipmentItemType.CAMERA,
          EquipmentItemUsageType.IMAGING
        ),
        this._equipmentField(user, "mounts", this.translateService.instant("Mounts"), EquipmentItemType.MOUNT),
        this._equipmentField(user, "filters", this.translateService.instant("Filters"), EquipmentItemType.FILTER),
        this._equipmentField(
          user,
          "accessories",
          this.translateService.instant("Accessories"),
          EquipmentItemType.ACCESSORY
        ),
        this._equipmentField(user, "software", this.translateService.instant("Software"), EquipmentItemType.SOFTWARE),
        this._equipmentField(
          user,
          "guidingTelescopes",
          this.translateService.instant("Guiding telescopes or lenses"),
          EquipmentItemType.TELESCOPE,
          EquipmentItemUsageType.GUIDING
        ),
        this._equipmentField(
          user,
          "guidingCameras",
          this.translateService.instant("Guiding cameras"),
          EquipmentItemType.CAMERA,
          EquipmentItemUsageType.GUIDING
        )
      ];
    });
  }
}
