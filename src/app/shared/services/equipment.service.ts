import { EquipmentPresetInterface } from "@features/equipment/types/equipment-preset.interface";
import { Observable } from "rxjs";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { filter, map, take } from "rxjs/operators";
import { DeleteEquipmentPreset, DeleteEquipmentPresetSuccess, EquipmentActionTypes } from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { LoadingService } from "@shared/services/loading.service";
import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";

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
}
