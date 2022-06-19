import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from "@angular/core";
import { Action, Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { ActivatedRoute, Router } from "@angular/router";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { filter, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { FormGroup } from "@angular/forms";
import { LoadingService } from "@shared/services/loading.service";
import {
  ApproveEquipmentItemEditProposalSuccess,
  ApproveEquipmentItemSuccess,
  CreateAccessoryEditProposal,
  CreateCameraEditProposal,
  CreateFilterEditProposal,
  CreateMountEditProposal,
  CreateSensorEditProposal,
  CreateSoftwareEditProposal,
  CreateTelescopeEditProposal,
  EquipmentActionTypes,
  FindEquipmentItemEditProposals,
  GetImagesUsingItem,
  GetUsersUsingItem,
  LoadBrand,
  LoadEquipmentItem
} from "@features/equipment/store/equipment.actions";
import { SensorInterface } from "@features/equipment/types/sensor.interface";
import { CameraInterface, CameraType } from "@features/equipment/types/camera.interface";
import { Actions, ofType } from "@ngrx/effects";
import { EditProposalInterface, EditProposalReviewStatus } from "@features/equipment/types/edit-proposal.interface";
import {
  BaseItemEditorComponent,
  EquipmentItemEditorMode
} from "@shared/components/equipment/editors/base-item-editor/base-item-editor.component";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { ItemBrowserComponent } from "@shared/components/equipment/item-browser/item-browser.component";
import {
  selectEditProposalsForItem,
  selectEquipmentItem,
  selectImagesUsingEquipmentItem,
  selectUsersUsingEquipmentItem
} from "@features/equipment/store/equipment.selectors";
import { WindowRefService } from "@shared/services/window-ref.service";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { RejectItemModalComponent } from "@features/equipment/components/reject-item-modal/reject-item-modal.component";
import { ApproveItemModalComponent } from "@features/equipment/components/approve-item-modal/approve-item-modal.component";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MergeIntoModalComponent } from "@features/equipment/components/migration/merge-into-modal/merge-into-modal.component";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { SoftwareInterface } from "@features/equipment/types/software.interface";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { Observable, Subscription } from "rxjs";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { UserInterface } from "@shared/interfaces/user.interface";
import { ImageInterface } from "@shared/interfaces/image.interface";

@Component({
  selector: "astrobin-equipment-explorer",
  templateUrl: "./explorer.component.html",
  styleUrls: ["./explorer.component.scss"]
})
export class ExplorerComponent extends BaseComponentDirective implements OnInit, OnChanges {
  readonly EquipmentItemType = EquipmentItemType;
  readonly EquipmentItemEditorMode = EquipmentItemEditorMode;

  @Input()
  enableBrowser = true;

  @Input()
  activeType: EquipmentItemType;

  @Input()
  activeId: EquipmentItemBaseInterface["id"];

  @Input()
  activeEditProposalId: EditProposalInterface<EquipmentItemBaseInterface>["id"];

  @Input()
  routingBasePath = "/equipment/explorer";

  @Input()
  navCollapsed = false;

  @Input()
  showMostOftenUsedWith = true;

  @Input()
  showUsersUsing = true;

  @Input()
  showImagesUsing = true;

  @Input()
  showForum = true;

  @Output()
  valueChanged = new EventEmitter<EquipmentItemBaseInterface>();

  @Output()
  approved = new EventEmitter();

  @Output()
  rejected = new EventEmitter();

  @Output()
  creationMode = new EventEmitter<boolean>();

  @ViewChild("editor")
  editor: BaseItemEditorComponent<EquipmentItemBaseInterface, null>;

  selectedItem: EquipmentItemBaseInterface | null = null;
  cameraVariants: CameraInterface[] = [];

  editMode = false;
  editForm = new FormGroup({});
  editModel: Partial<EditProposalInterface<EquipmentItemBaseInterface>> = {};

  subCreationMode = false;

  editProposalsSubscription: Subscription;
  editProposals: EditProposalInterface<EquipmentItemBaseInterface>[] | null = null;
  editProposalsCollapsed = true;

  usersUsing$: Observable<UserInterface[]>;
  imagesUsing$: Observable<ImageInterface[]>;

  commentsSectionInfoMessage$: Observable<string> = this.currentUser$.pipe(
    take(1),
    switchMap(user => {
      if (user.id === this.selectedItem.createdBy) {
        return this.translateService.stream(
          "This comment section is only visible to you and AstroBin equipment moderators, and only while this " +
            "equipment item is unapproved."
        );
      }

      return this.translateService.stream(
        "This comment section is only visible to AstroBin equipment moderators and the user who created this item, " +
          "and only while this equipment item is unapproved."
      );
    })
  );

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
    public readonly windowRefService: WindowRefService,
    public readonly modalService: NgbModal
  ) {
    super(store$);
  }

  get contentType$(): Observable<ContentTypeInterface | null> {
    return this.store$
      .select(selectContentType, { appLabel: "astrobin_apps_equipment", model: `${this.activeType.toLowerCase()}` })
      .pipe(filter(contentType => !!contentType));
  }

  ngOnInit() {
    this._initActions();
    this._initActiveId();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!!changes.activeId && !changes.activeId.firstChange) {
      this._initActiveId();
    }
  }

  onSelectedItemChanged(item: EquipmentItemBaseInterface) {
    if (!item && !this.selectedItem) {
      return;
    }

    if (!!item && !!this.selectedItem) {
      if (item.id === this.selectedItem.id) {
        return;
      }
    }

    this.activeId = !!item ? item.id : null;
    this.setItem(item);
    this.valueChanged.emit(item);
  }

  modificationTitle(): string {
    return this.translateService.instant("Modified for astrophotography");
  }

  modificationPopoverMessage(): string {
    return this.translateService.instant(
      "Modifications typically include LPF2 filter removal, Baader modification, or full-spectrum modification."
    );
  }

  coolingTitle(): string {
    return this.translateService.instant("Custom-cooled");
  }

  coolingPopoverMessage(): string {
    return this.translateService.instant(
      "Custom-cooled cameras are DSLR and mirrorless cameras that are not sold with cooling as stock, but a " +
        "cooling mechanism is added as a custom modification."
    );
  }

  doShowMostOftenUsedWith(): boolean {
    return (
      this.showMostOftenUsedWith &&
      this.selectedItem &&
      [
        EquipmentItemType.CAMERA,
        EquipmentItemType.TELESCOPE,
        EquipmentItemType.MOUNT,
        EquipmentItemType.FILTER
      ].indexOf(this.activeType) > -1
    );
  }

  _initActiveId() {
    if (this.activeId) {
      this.store$.dispatch(new LoadEquipmentItem({ id: this.activeId, type: this.activeType }));
      this.store$.dispatch(new GetUsersUsingItem({ itemType: this.activeType, itemId: this.activeId }));
      this.store$.dispatch(new GetImagesUsingItem({ itemType: this.activeType, itemId: this.activeId }));

      this.usersUsing$ = this.store$.select(selectUsersUsingEquipmentItem, {
        itemType: this.activeType,
        itemId: this.activeId
      });

      this.imagesUsing$ = this.store$.select(selectImagesUsingEquipmentItem, {
        itemType: this.activeType,
        itemId: this.activeId
      });

      this.store$
        .select(selectEquipmentItem, { id: this.activeId, type: this.activeType })
        .pipe(
          filter(item => !!item && item.id === this.activeId),
          take(1)
        )
        .subscribe(item => this.setItem(item));
    } else {
      this.setItem(null);
    }
  }

  _initActions() {
    this.actions$
      .pipe(
        ofType(EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS),
        takeUntil(this.destroyed$),
        map((action: ApproveEquipmentItemEditProposalSuccess) => action.payload.editProposal),
        filter(editProposal => editProposal.editProposalTarget === this.selectedItem?.id),
        tap(() => this.store$.dispatch(new LoadEquipmentItem({ id: this.selectedItem.id, type: this.activeType }))),
        switchMap(() =>
          this.store$.select(selectEquipmentItem, { id: this.selectedItem.id, type: this.activeType }).pipe(
            filter(item => !!item),
            take(1)
          )
        )
      )
      .subscribe(item => {
        this.setItem(item);
      });
  }

  _verifyCameraVariantCanBeEdited(): boolean {
    if (this.equipmentItemService.getType(this.selectedItem) === EquipmentItemType.CAMERA) {
      const camera: CameraInterface = this.selectedItem as CameraInterface;

      if (camera.modified || (camera.type === CameraType.DSLR_MIRRORLESS && camera.cooled)) {
        this.popNotificationsService.warning(
          `Modified and/or cooled variants of DSLR or mirrorless cameras cannot be
          edited/approved/rejected directly. Please find the regular version of this camera and perform this action
          there.`
        );
        return false;
      }
    }

    return true;
  }

  startEditMode() {
    if (!this._verifyCameraVariantCanBeEdited()) {
      return;
    }

    if (
      this.editProposals &&
      this.editProposals.length > 0 &&
      this.editProposals.filter(editProposal => editProposal.editProposalReviewStatus === null).length > 0
    ) {
      this.popNotificationsService.error(
        this.translateService.instant(
          "You cannot propose an edit while there is a pending one. Please review the pending edit proposal first, " +
            "thank you!"
        )
      );
      return;
    }

    this.editMode = true;
    this.editModel = { ...this.selectedItem };

    this.windowRefService.scrollToElement("#edit-item");
  }

  endEditMode() {
    this.editMode = false;
    this.editModel = {};
    this.editForm.reset();
  }

  startMigrationMode() {
    const modal: NgbModalRef = this.modalService.open(MergeIntoModalComponent);
    const componentInstance: MergeIntoModalComponent = modal.componentInstance;

    componentInstance.activeType = this.activeType;
    componentInstance.equipmentItem = this.selectedItem;
  }

  startApproval() {
    if (!this._verifyCameraVariantCanBeEdited()) {
      return;
    }

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
        this.approved.emit();
        this.popNotificationsService.success(this.translateService.instant("Item approved."));
      });
  }

  startRejection() {
    if (!this._verifyCameraVariantCanBeEdited()) {
      return;
    }

    const modal: NgbModalRef = this.modalService.open(RejectItemModalComponent);
    const componentInstance: RejectItemModalComponent = modal.componentInstance;

    componentInstance.equipmentItem = this.selectedItem;

    modal.closed.pipe(take(1)).subscribe(() => {
      this.resetBrowser();
      this.rejected.emit();
    });
  }

  resetBrowser() {
    if (!!this._itemBrowser) {
      this._itemBrowser.reset();
    }

    this.selectedItem = null;
    this.endEditMode();
  }

  setItem(item: EquipmentItemBaseInterface | null) {
    this.selectedItem = item;

    if (!!item) {
      const type = this.equipmentItemService.getType(item);
      this.store$.dispatch(
        new LoadContentType({
          appLabel: "astrobin_apps_equipment",
          model: `${type.toLowerCase()}`
        })
      );
    }

    if (!!item?.brand) {
      this.store$.dispatch(new LoadBrand({ id: item.brand }));
    }

    this.endEditMode();
    this.loadEditProposals();
  }

  supportsVariants(item: EquipmentItemBaseInterface): boolean {
    return (
      this.equipmentItemService.getType(item) === EquipmentItemType.CAMERA &&
      (item as CameraInterface).type === CameraType.DSLR_MIRRORLESS
    );
  }

  getVariants(item: EquipmentItemBaseInterface): CameraInterface[] {
    if (!this.supportsVariants(item)) {
      throw new Error("Item is not a camera");
    }

    return (item as CameraInterface).variants;
  }

  getParentVariant(item: EquipmentItemBaseInterface): CameraInterface {
    if (!this.supportsVariants(item)) {
      throw new Error("Item is not a camera");
    }

    return (item as CameraInterface).parentVariant;
  }

  onCreationModeStarted() {
    this.resetBrowser();
    this.creationMode.emit(true);
  }

  onCreationModeEnded() {
    this.creationMode.emit(false);
  }

  proposeEdit() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      const errorList: string[] = [];
      this.editor.fields.forEach(field => {
        if (field.formControl.errors !== null) {
          errorList.push(`<li>${field.templateOptions.label}</li>`);
        }
      });
      this.popNotificationsService.error(
        `
        <p>
          ${this.translateService.instant("The following form fields have errors, please correct them and try again:")}
        </p>
        <ul>
          ${errorList.join("\n")}
        </ul>
        `,
        null,
        {
          enableHtml: true
        }
      );
      return;
    }

    if (this.editForm.untouched || this.editForm.pristine) {
      this.popNotificationsService.error("In order to make an edit proposal, you need to edit some properties.");
      return;
    }

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
      case EquipmentItemType.TELESCOPE:
        action = new CreateTelescopeEditProposal({
          telescope: editModelWithTarget as EditProposalInterface<TelescopeInterface>
        });
        actionSuccessType = EquipmentActionTypes.CREATE_TELESCOPE_EDIT_PROPOSAL_SUCCESS;
        break;
      case EquipmentItemType.MOUNT:
        action = new CreateMountEditProposal({
          mount: editModelWithTarget as EditProposalInterface<MountInterface>
        });
        actionSuccessType = EquipmentActionTypes.CREATE_MOUNT_EDIT_PROPOSAL_SUCCESS;
        break;
      case EquipmentItemType.FILTER:
        action = new CreateFilterEditProposal({
          filter: editModelWithTarget as EditProposalInterface<FilterInterface>
        });
        actionSuccessType = EquipmentActionTypes.CREATE_FILTER_EDIT_PROPOSAL_SUCCESS;
        break;
      case EquipmentItemType.ACCESSORY:
        action = new CreateAccessoryEditProposal({
          accessory: editModelWithTarget as EditProposalInterface<AccessoryInterface>
        });
        actionSuccessType = EquipmentActionTypes.CREATE_ACCESSORY_EDIT_PROPOSAL_SUCCESS;
        break;
      case EquipmentItemType.SOFTWARE:
        action = new CreateSoftwareEditProposal({
          software: editModelWithTarget as EditProposalInterface<SoftwareInterface>
        });
        actionSuccessType = EquipmentActionTypes.CREATE_SOFTWARE_EDIT_PROPOSAL_SUCCESS;
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
        .subscribe(() => {
          this.editProposalCreated();
          this.loadingService.setLoading(false);
        });
    }
  }

  editProposalCreated() {
    this.popNotificationsService.success(
      this.translateService.instant(
        "Thanks! Your edit proposal has been submitted and will be reviewed as soon as possible."
      )
    );
    this.loadEditProposals();
    this.endEditMode();
  }

  loadEditProposals() {
    if (!this.selectedItem) {
      return;
    }

    if (!!this.editProposalsSubscription) {
      this.editProposalsSubscription.unsubscribe();
    }

    this.editProposalsSubscription = this.store$
      .select(selectEditProposalsForItem, this.selectedItem)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(editProposals => {
        this.editProposals = editProposals;
        this.editProposalsCollapsed =
          this.editProposalsByStatus(editProposals, null).length === 0 && !this.activeEditProposalId;
      });

    this.store$.dispatch(new FindEquipmentItemEditProposals({ item: this.selectedItem }));
  }

  editProposalsByStatus(
    editProposals: EditProposalInterface<EquipmentItemBaseInterface>[],
    status: EditProposalReviewStatus
  ): EditProposalInterface<EquipmentItemBaseInterface>[] {
    if (!editProposals) {
      return [];
    }

    return editProposals.filter(editProposal => editProposal.editProposalReviewStatus === status);
  }

  collapsedEditProposalsMessage(editProposals: EditProposalInterface<EquipmentItemBaseInterface>[]): string {
    return this.translateService.instant("This item has a history of <strong>{{0}}</strong> approved edit proposals.", {
      "0": this.editProposalsByStatus(editProposals, EditProposalReviewStatus.APPROVED).length
    });
  }

  collapseEditProposals() {
    this.editProposalsCollapsed = true;
  }

  expandEditProposals() {
    this.editProposalsCollapsed = false;
  }

  typeSupportsMigrateInto() {
    return this.activeType !== EquipmentItemType.SENSOR;
  }
}
