import { Component, Input, OnInit } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions, ofType } from "@ngrx/effects";
import { LoadingService } from "@shared/services/loading.service";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { filter, map, take, takeUntil, tap } from "rxjs/operators";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { DeepSkyAcquisitionPresetInterface } from "@shared/interfaces/deep-sky-acquisition-preset.interface";
import { selectDeepSkyAcquisitionPresets } from "@features/image/store/image.selectors";
import { Observable } from "rxjs";
import { DeleteDeepSkyAcquisitionPreset, ImageActionTypes } from "@features/image/store/image.actions";

@Component({
  selector: "astrobin-load-deep-sky-acquisition-preset-modal",
  templateUrl: "./load-deep-sky-acquisition-preset-modal.component.html",
  styleUrls: ["./load-deep-sky-acquisition-preset-modal.component.scss"]
})
export class LoadDeepSkyAcquisitionPresetModalComponent extends BaseComponentDirective implements OnInit {
  fields: FormlyFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: {
    preset: DeepSkyAcquisitionPresetInterface["name"] | null;
  } = {
    preset: null
  };

  presets$: Observable<DeepSkyAcquisitionPresetInterface[]> = this.store$.select(selectDeepSkyAcquisitionPresets);

  @Input()
  alreadyHasAcquisitions = false;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal,
    public readonly modalService: NgbModal
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this._setFields();

    this.actions$
      .pipe(ofType(ImageActionTypes.DELETE_DEEP_SKY_ACQUISITION_PRESET_SUCCESS), takeUntil(this.destroyed$))
      .subscribe(() => {
        this.loadingService.setLoading(false);
        this._setFields();
      });
  }

  onLoadClicked() {
    this.store$
      .select(selectDeepSkyAcquisitionPresets)
      .pipe(
        filter(presets => !!presets),
        take(1)
      )
      .subscribe(presets => {
        if (this.alreadyHasAcquisitions) {
          const modalRef = this.modalService.open(ConfirmationDialogComponent, { size: "sm" });
          const componentInstance: ConfirmationDialogComponent = modalRef.componentInstance;

          componentInstance.message = this.translateService.instant(
            "This operation will overwrite the current acquisition sessions."
          );

          modalRef.closed.pipe(take(1)).subscribe(() => {
            this.load(presets);
          });

          return;
        }

        this.load(presets);
      });
  }

  load(preset: DeepSkyAcquisitionPresetInterface[]) {
    // for (const klass of [
    //   {
    //     property: "imagingTelescopes",
    //     type: EquipmentItemType.TELESCOPE,
    //     usageType: EquipmentItemUsageType.IMAGING
    //   },
    //   {
    //     property: "imagingCameras",
    //     type: EquipmentItemType.CAMERA,
    //     usageType: EquipmentItemUsageType.IMAGING
    //   },
    //   {
    //     property: "mounts",
    //     type: EquipmentItemType.MOUNT
    //   },
    //   {
    //     property: "filters",
    //     type: EquipmentItemType.FILTER
    //   },
    //   {
    //     property: "accessories",
    //     type: EquipmentItemType.ACCESSORY
    //   },
    //   {
    //     property: "software",
    //     type: EquipmentItemType.SOFTWARE
    //   },
    //   {
    //     property: "guidingTelescopes",
    //     type: EquipmentItemType.TELESCOPE,
    //     usageType: EquipmentItemUsageType.GUIDING
    //   },
    //   {
    //     property: "guidingCameras",
    //     type: EquipmentItemType.CAMERA,
    //     usageType: EquipmentItemUsageType.GUIDING
    //   }
    // ]) {
    //   const ids = preset[klass.property] as EquipmentItemBaseInterface["id"][];
    //   ids.forEach(id => {
    //     this.store$.dispatch(new LoadEquipmentItem({ id, type: klass.type }));
    //   });
    //
    //   forkJoin(
    //     ids.map(id =>
    //       this.store$.select(selectEquipmentItem, { id, type: klass.type }).pipe(
    //         filter(item => !!item),
    //         first()
    //       )
    //     )
    //   ).subscribe(items => {
    //     this.store$.dispatch(
    //       new ItemBrowserSet({
    //         type: klass.type,
    //         usageType: klass.usageType,
    //         items
    //       })
    //     );
    //   });
    // }
    //
    // this.modal.close();
  }

  onDeleteClicked() {
    const modalRef = this.modalService.open(ConfirmationDialogComponent, { size: "sm" });
    const componentInstance: ConfirmationDialogComponent = modalRef.componentInstance;

    componentInstance.message = this.translateService.instant("This operation cannot be undone.");

    modalRef.closed.pipe(take(1)).subscribe(() => {
      this.loadingService.setLoading(true);
      this.presets$.pipe(
        take(1),
        map(presetItems => presetItems.filter(preset => preset.name === this.model.preset)),
        tap(presetItems => this.store$.dispatch(new DeleteDeepSkyAcquisitionPreset({ presetItems })))
      );
    });
  }

  _setFields() {
    this.presets$.pipe(take(1)).subscribe(presets => {
      this.fields = [
        {
          key: "preset",
          type: "radio",
          wrappers: ["default-wrapper"],
          props: {
            required: true,
            labelProp: "value",
            valueProp: "key",
            options: presets.map(preset => ({
              key: preset.name,
              value: preset.name
            }))
          }
        }
      ];
    });
  }
}
