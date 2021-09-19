import { Component, OnInit, ViewChild } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Action, Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TitleService } from "@shared/services/title/title.service";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { map, take, takeUntil } from "rxjs/operators";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { FormGroup } from "@angular/forms";
import { LoadingService } from "@shared/services/loading.service";
import {
  CreateCameraEditProposal,
  CreateSensorEditProposal,
  EquipmentActionTypes,
  FindEquipmentItemEditProposals,
  LoadBrand
} from "@features/equipment/store/equipment.actions";
import { SensorInterface } from "@features/equipment/interfaces/sensor.interface";
import { CameraInterface } from "@features/equipment/interfaces/camera.interface";
import { Actions, ofType } from "@ngrx/effects";
import { EditProposalInterface } from "@features/equipment/interfaces/edit-proposal.interface";
import { EquipmentItemEditorMode } from "@features/equipment/components/editors/base-item-editor/base-item-editor.component";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { ItemBrowserComponent } from "@features/equipment/components/item-browser/item-browser.component";
import { Observable } from "rxjs";
import { selectEditProposalsForItem } from "@features/equipment/store/equipment.selectors";
import { WindowRefService } from "@shared/services/window-ref.service";

@Component({
  selector: "astrobin-equipment-explorer",
  templateUrl: "./explorer.component.html",
  styleUrls: ["./explorer.component.scss"]
})
export class ExplorerComponent extends BaseComponentDirective implements OnInit {
  EquipmentItemType = EquipmentItemType;
  EquipmentItemEditorMode = EquipmentItemEditorMode;

  title = this.translateService.instant("Equipment explorer");

  cameraCount$: Observable<number>;

  selectedItem: EquipmentItemBaseInterface | null = null;

  editMode = false;
  editForm = new FormGroup({});
  editModel: Partial<EditProposalInterface<EquipmentItemBaseInterface>> = {};

  editProposals$: Observable<EditProposalInterface<EquipmentItemBaseInterface>[]>;

  @ViewChild("itemBrowser")
  private _itemBrowser: ItemBrowserComponent;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly loadingService: LoadingService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly windowRefService: WindowRefService
  ) {
    super(store$);
  }

  private _activeType: string;

  get activeType(): EquipmentItemType {
    return EquipmentItemType[this._activeType.toUpperCase()];
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);

    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translateService.instant("Equipment")
          },
          {
            label: this.translateService.instant("Explorer")
          }
        ]
      })
    );

    this._activeType = this.activatedRoute.snapshot.paramMap.get("itemType");

    this.cameraCount$ = this.equipmentApiService.getAllEquipmentItems(EquipmentItemType.CAMERA).pipe(
      takeUntil(this.destroyed$),
      map(response => response.count)
    );

    this.router.events.pipe(takeUntil(this.destroyed$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this._activeType = this.activatedRoute.snapshot.paramMap.get("itemType").toUpperCase();
      }
    });
  }

  startEditMode() {
    this.editMode = true;
    this.editModel = { ...this.selectedItem };

    setTimeout(() => {
      this.windowRefService.nativeWindow.document
        .querySelector("#equipment-item-field-name")
        .scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  endEditMode() {
    this.editMode = false;
    this.editModel = {};
    this.editForm.reset();
  }

  resetBrowser() {
    this._itemBrowser.reset();
    this.selectedItem = null;
  }

  onItemSelected(item: EquipmentItemBaseInterface) {
    this.selectedItem = item;
    this.loadEditProposals();
  }

  onCreationModeStarted() {
    this.selectedItem = null;
  }

  proposeEdit() {
    let action: Action;
    let actionSuccessType: EquipmentActionTypes;

    // Remove id and set `editModelTarget`.
    const { id, ...editModelWithTarget } = { ...this.editModel, ...{ editProposalTarget: this.editModel.id } };

    switch (this.activeType) {
      case EquipmentItemType.SENSOR:
        action = new CreateSensorEditProposal({
          sensor: editModelWithTarget as EditProposalInterface<SensorInterface>
        });
        actionSuccessType = EquipmentActionTypes.CREATE_SENSOR_EDIT_PROPOSAL_SUCCESS;
        break;
      case EquipmentItemType.CAMERA:
        action = new CreateCameraEditProposal({
          camera: editModelWithTarget as EditProposalInterface<CameraInterface>
        });
        actionSuccessType = EquipmentActionTypes.CREATE_CAMERA_EDIT_PROPOSAL_SUCCESS;
        break;
    }

    if (action) {
      this.loadingService.setLoading(true);
      this.store$.dispatch(action);
      this.actions$
        .pipe(
          ofType(actionSuccessType),
          take(1),
          map(
            (result: { payload: { editProposal: EditProposalInterface<EquipmentItemBaseInterface> } }) =>
              result.payload.editProposal
          )
        )
        .subscribe((createdEditProposal: EditProposalInterface<EquipmentItemBaseInterface>) => {
          this.editProposalCreated(createdEditProposal);
          this.loadingService.setLoading(false);
        });
    }
  }

  editProposalCreated(editProposal: EditProposalInterface<EquipmentItemBaseInterface>) {
    this.popNotificationsService.success(
      this.translateService.instant(
        "Thanks! Your edit proposal has been submitted and well be reviewed as soon as possible."
      )
    );
    this.loadEditProposals();
    this.endEditMode();
  }

  loadEditProposals() {
    this.store$.dispatch(new FindEquipmentItemEditProposals({ item: this.selectedItem }));
    this.editProposals$ = this.store$.select(selectEditProposalsForItem, this.selectedItem);
  }
}
