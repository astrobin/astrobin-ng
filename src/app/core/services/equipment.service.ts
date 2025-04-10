import { Injectable } from "@angular/core";
import type { MainState } from "@app/store/state";
import { BaseService } from "@core/services/base.service";
import type { LoadingService } from "@core/services/loading.service";
import type { PopNotificationsService } from "@core/services/pop-notifications.service";
import { DeleteEquipmentPreset, EquipmentActionTypes } from "@features/equipment/store/equipment.actions";
import type { DeleteEquipmentPresetSuccess } from "@features/equipment/store/equipment.actions";
import type { CameraInterface } from "@features/equipment/types/camera.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import type { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import type { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import type { FilterInterface } from "@features/equipment/types/filter.interface";
import type { MountInterface } from "@features/equipment/types/mount.interface";
import type { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { TelescopeType } from "@features/equipment/types/telescope.interface";
import type { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ofType } from "@ngrx/effects";
import type { Actions } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import type { TranslateService } from "@ngx-translate/core";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { Observable } from "rxjs";
import { filter, map, take } from "rxjs/operators";

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
        this.actions$
          .pipe(
            ofType(EquipmentActionTypes.DELETE_EQUIPMENT_PRESET_SUCCESS),
            map((action: DeleteEquipmentPresetSuccess) => action.payload.id),
            filter(id => id === preset.id),
            take(1)
          )
          .subscribe(() => {
            this.loadingService.setLoading(false);
            this.popNotificationsService.success(this.translateService.instant("Equipment setup deleted."));
            observer.next();
            observer.complete();
          });
      });
    });
  }

  humanizeTelescopeLabel(item: TelescopeInterface): string {
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

  humanizeCameraLabel(item: CameraInterface): string {
    return this.translateService.instant("Camera");
  }

  humanizeMountLabel(item: MountInterface): string {
    return this.translateService.instant("Mount");
  }

  humanizeFilterLabel(item: FilterInterface): string {
    return this.translateService.instant("Filter");
  }

  humanizeAccessoryLabel(): string {
    return this.translateService.instant("Accessory");
  }

  humanizeSoftwareLabel(): string {
    return this.translateService.instant("Software");
  }

  humanizeEquipmentItemLabel(item: EquipmentItem): string {
    if (item.klass === EquipmentItemType.TELESCOPE) {
      return this.humanizeTelescopeLabel(item as TelescopeInterface);
    }

    if (item.klass === EquipmentItemType.CAMERA) {
      return this.humanizeCameraLabel(item as CameraInterface);
    }

    if (item.klass === EquipmentItemType.MOUNT) {
      return this.humanizeMountLabel(item as MountInterface);
    }

    if (item.klass === EquipmentItemType.FILTER) {
      return this.humanizeFilterLabel(item as FilterInterface);
    }

    if (item.klass === EquipmentItemType.ACCESSORY) {
      return this.humanizeAccessoryLabel();
    }

    if (item.klass === EquipmentItemType.SOFTWARE) {
      return this.humanizeSoftwareLabel();
    }

    return this.translateService.instant("Equipment");
  }
}
