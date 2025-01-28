import { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import { Observable } from "rxjs";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { filter, map, take } from "rxjs/operators";
import { DeleteEquipmentPreset, DeleteEquipmentPresetSuccess, EquipmentActionTypes } from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { LoadingService } from "@core/services/loading.service";
import { Injectable } from "@angular/core";
import { BaseService } from "@core/services/base.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { TelescopeInterface, TelescopeType } from "@features/equipment/types/telescope.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { CameraInterface } from "@features/equipment/types/camera.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

@Injectable({
  providedIn: "root"
})
export class EquipmentService extends BaseService {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly modalService: NgbModal,
    public readonly translateService: TranslateService,
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(loadingService);
  }

  deleteEquipmentPreset(preset: EquipmentPresetInterface): Observable<void> {
    return new Observable(observer => {
      const modalRef = this.modalService.open(ConfirmationDialogComponent, { size: "sm" });
      const componentInstance: ConfirmationDialogComponent = modalRef.componentInstance;

      componentInstance.message = this.translateService.instant("This operation cannot be undone.");

      modalRef.closed.pipe(take(1)).subscribe(() => {
        this.loadingService.setLoading(true);
        this.store$.dispatch(new DeleteEquipmentPreset({ id: preset.id }));
        this.actions$.pipe(
          ofType(EquipmentActionTypes.DELETE_EQUIPMENT_PRESET_SUCCESS),
          map((action: DeleteEquipmentPresetSuccess) => action.payload.id),
          filter(id => id === preset.id),
          take(1)
        ).subscribe(() => {
          this.loadingService.setLoading(false);
          this.popNotificationsService.success(
            this.translateService.instant("Equipment setup deleted.")
          );
          observer.next();
          observer.complete();
        });
      });
    });
  }

  humanizeTelescopeType(item: TelescopeInterface): string {
    if (item.type === TelescopeType.CAMERA_LENS) {
      return this.translateService.instant("Lens");
    }

    if (item.type === TelescopeType.BINOCULARS) {
      return this.translateService.instant("Binoculars");
    }

    if (item.type === TelescopeType.OTHER) {
      return this.translateService.instant("Optics");
    }

    return this.translateService.instant("Telescope");
  }

  humanizeCameraType(item: CameraInterface): string {
    return this.translateService.instant("Camera");
  }

  humanizeMountType(item: MountInterface): string {
    return this.translateService.instant("Mount");
  }

  humanizeFilterType(item: FilterInterface): string {
    return this.translateService.instant("Filter");
  }

  humanizeEquipmentItemType(item: EquipmentItem): string {
    if (item.klass === EquipmentItemType.TELESCOPE) {
      return this.humanizeTelescopeType(item as TelescopeInterface);
    }

    if (item.klass === EquipmentItemType.CAMERA) {
      return this.humanizeCameraType(item as CameraInterface);
    }

    if (item.klass === EquipmentItemType.MOUNT) {
      return this.humanizeMountType(item as MountInterface);
    }

    if (item.klass === EquipmentItemType.FILTER) {
      return this.humanizeFilterType(item as FilterInterface);
    }

    return this.translateService.instant("Equipment");
  }
}
