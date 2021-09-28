import { Component, OnInit, ViewChild } from "@angular/core";
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
import { filter, map, switchMap, take, takeUntil } from "rxjs/operators";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { FormGroup } from "@angular/forms";
import { LoadingService } from "@shared/services/loading.service";
import {
  ApproveEquipmentItemSuccess,
  CreateCameraEditProposal,
  CreateSensorEditProposal,
  EquipmentActionTypes,
  FindEquipmentItemEditProposals,
  LoadBrand,
  LoadEquipmentItem
} from "@features/equipment/store/equipment.actions";
import { SensorInterface } from "@features/equipment/interfaces/sensor.interface";
import { CameraInterface } from "@features/equipment/interfaces/camera.interface";
import { Actions, ofType } from "@ngrx/effects";
import { EditProposalInterface } from "@features/equipment/interfaces/edit-proposal.interface";
import { EquipmentItemEditorMode } from "@features/equipment/components/editors/base-item-editor/base-item-editor.component";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { ItemBrowserComponent } from "@features/equipment/components/item-browser/item-browser.component";
import { Observable } from "rxjs";
import {
  selectBrand,
  selectEditProposalsForItem,
  selectEquipmentItem
} from "@features/equipment/store/equipment.selectors";
import { WindowRefService } from "@shared/services/window-ref.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { Location } from "@angular/common";
import { ExplorerBaseComponent } from "@features/equipment/pages/explorer-base/explorer-base.component";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { RejectMigrationModalComponent } from "@features/equipment/components/migration/reject-migration-modal/reject-migration-modal.component";
import { RejectItemModalComponent } from "@features/equipment/components/reject-item-modal/reject-item-modal.component";
import { ApproveItemModalComponent } from "@features/equipment/components/approve-item-modal/approve-item-modal.component";

@Component({
  selector: "astrobin-equipment-explorer",
  templateUrl: "./explorer.component.html",
  styleUrls: ["./explorer.component.scss"]
})
export class ExplorerComponent extends ExplorerBaseComponent implements OnInit {
  EquipmentItemType = EquipmentItemType;
  EquipmentItemEditorMode = EquipmentItemEditorMode;

  title = this.translateService.instant("Equipment explorer");

  selectedItem: EquipmentItemBaseInterface | null = null;

  editMode = false;
  editForm = new FormGroup({});
  editModel: Partial<EditProposalInterface<EquipmentItemBaseInterface>> = {};

  selectedItemEditProposals$: Observable<EditProposalInterface<EquipmentItemBaseInterface>[]>;

  @ViewChild("itemBrowser")
  private _itemBrowser: ItemBrowserComponent;
  private _activeId: EquipmentItemBaseInterface["id"];

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
    public readonly windowRefService: WindowRefService,
    public readonly location: Location,
    public readonly modalService: NgbModal
  ) {
    super(store$, actions$, activatedRoute, router);
  }

  ngOnInit(): void {
    super.ngOnInit();

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

    this._activeId = parseInt(this.activatedRoute.snapshot.paramMap.get("itemId"), 10);

    if (this._activeId) {
      this.store$.dispatch(new LoadEquipmentItem({ id: this._activeId, type: this._activeType }));

      this.store$
        .select(selectEquipmentItem, { id: this._activeId, type: this.activeType })
        .pipe(
          filter(item => !!item),
          take(1)
        )
        .subscribe(item => this.setItem(item));
    }

    this.router.events.pipe(takeUntil(this.destroyed$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeType = this.activatedRoute.snapshot.paramMap.get("itemType");
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

  startApproval() {
    const modal: NgbModalRef = this.modalService.open(ApproveItemModalComponent);
    const componentInstance: ApproveItemModalComponent = modal.componentInstance;

    componentInstance.equipmentItem = this.selectedItem;

    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_SUCCESS),
        map((action: ApproveEquipmentItemSuccess) => action.payload.item),
        filter(item => item.id === this.selectedItem.id),
        take(1)
      )
      .subscribe(item => {
        this.setItem(item);
      });
  }

  startRejection() {
    const modal: NgbModalRef = this.modalService.open(RejectItemModalComponent);
    const componentInstance: RejectMigrationModalComponent = modal.componentInstance;

    componentInstance.equipmentItem = this.selectedItem;

    modal.closed.pipe(take(1)).subscribe(() => {
      this.resetBrowser();
    });
  }

  resetBrowser() {
    this._itemBrowser.reset();
    this.selectedItem = null;
  }

  setItem(item: EquipmentItemBaseInterface) {
    this.selectedItem = item;
    this.store$.dispatch(new LoadBrand({ id: item.brand }));
    this.loadEditProposals();
  }

  onItemSelected(item: EquipmentItemBaseInterface) {
    if (item) {
      this.store$
        .select(selectBrand, item.brand)
        .pipe(
          filter(brand => !!brand),
          take(1)
        )
        .subscribe(brand => {
          const slug = UtilsService.slugify(`${brand.name} ${item.name}`);
          this.setItem(item);
          this.location.replaceState(`/equipment/explorer/${this._activeType.toLowerCase()}/${item.id}/${slug}`);
        });
    } else {
      this.location.replaceState(`/equipment/explorer/${this._activeType.toLowerCase()}`);
    }
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
    this.selectedItemEditProposals$ = this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_EQUIPMENT_ITEM_EDIT_PROPOSALS_SUCCESS),
      take(1),
      switchMap(() => this.store$.select(selectEditProposalsForItem, this.selectedItem))
    );
  }
}
