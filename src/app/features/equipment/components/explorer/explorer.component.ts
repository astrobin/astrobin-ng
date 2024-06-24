import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import { Action, Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { ActivatedRoute, Router } from "@angular/router";
import {
  EquipmentItemBaseInterface,
  EquipmentItemReviewerDecision,
  EquipmentItemType
} from "@features/equipment/types/equipment-item-base.interface";
import { filter, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { FormGroup } from "@angular/forms";
import { LoadingService } from "@shared/services/loading.service";
import {
  ApproveEquipmentItemEditProposalSuccess,
  ApproveEquipmentItemSuccess,
  AssignItemSuccess,
  CreateAccessoryEditProposal,
  CreateCameraEditProposal,
  CreateFilterEditProposal,
  CreateMountEditProposal,
  CreateSensorEditProposal,
  CreateSoftwareEditProposal,
  CreateTelescopeEditProposal,
  EquipmentActionTypes,
  FindEquipmentItemEditProposals,
  FreezeEquipmentItemAsAmbiguous,
  FreezeEquipmentItemAsAmbiguousSuccess,
  LoadEquipmentItem,
  LoadMarketplaceListings,
  UnapproveEquipmentItemSuccess,
  UnfreezeEquipmentItemAsAmbiguous,
  UnfreezeEquipmentItemAsAmbiguousSuccess
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
  selectMarketplaceListings
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
import { distinctUntilChangedObj, UtilsService } from "@shared/services/utils/utils.service";
import { UnapproveItemModalComponent } from "@features/equipment/components/unapprove-item-modal/unapprove-item-modal.component";
import { ActiveToast } from "ngx-toastr";
import { CompareService } from "@features/equipment/services/compare.service";
import { isPlatformBrowser, Location } from "@angular/common";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { RouterService } from "@shared/services/router.service";
import { MarketplaceListingInterface } from "@features/equipment/types/marketplace-listing.interface";
import { UserService } from "@shared/services/user.service";
import { Constants } from "@shared/constants";

@Component({
  selector: "astrobin-equipment-explorer",
  templateUrl: "./explorer.component.html",
  styleUrls: ["./explorer.component.scss"]
})
export class ExplorerComponent extends BaseComponentDirective implements OnInit, OnChanges, OnDestroy {
  readonly EquipmentItemType = EquipmentItemType;
  readonly EquipmentItemEditorMode = EquipmentItemEditorMode;
  readonly EquipmentItemReviewerDecision = EquipmentItemReviewerDecision;
  readonly CameraType = CameraType;
  readonly isBrowser = isPlatformBrowser(this.platformId);

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
  showImagesUsing = true;

  @Input()
  showForum = true;

  @Input()
  goBackOnClose = false;

  @Output()
  valueChanged = new EventEmitter<EquipmentItemBaseInterface>();

  @Output()
  approved = new EventEmitter();

  @Output()
  unapproved = new EventEmitter();

  @Output()
  frozenAsAmbiguous = new EventEmitter();

  @Output()
  unfrozenAsAmbiguous = new EventEmitter();

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

  marketplaceListings$: Observable<MarketplaceListingInterface[]> = this.store$.select(selectMarketplaceListings).pipe(
    map(listings =>
      listings?.filter(
        listing => listing.lineItems.some(
          lineItem =>
            lineItem.itemObjectId === this.selectedItem.id &&
            lineItem.itemContentType === this.selectedItem.contentType
        )
      )
    ),
    distinctUntilChangedObj(),
    takeUntil(this.destroyed$)
  );

  reviewPendingEditNotification: ActiveToast<any>;

  commentsSectionInfoMessage$: Observable<string> = this.currentUser$.pipe(
    take(1),
    switchMap(user => {
      if (user.id === this.selectedItem.createdBy) {
        return this.translateService.stream(
          "This comment section is only visible to you and AstroBin equipment moderators."
        );
      }

      return this.translateService.stream(
        "This comment section is only visible to AstroBin equipment moderators and the user who created this item."
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
    public readonly modalService: NgbModal,
    public readonly compareService: CompareService,
    public readonly location: Location,
    @Inject(PLATFORM_ID) public readonly platformId,
    public readonly routerService: RouterService,
    public readonly userService: UserService
  ) {
    super(store$);
  }

  get contentType$(): Observable<ContentTypeInterface | null> {
    return this.store$
      .select(selectContentType, { appLabel: "astrobin_apps_equipment", model: `${this.activeType.toLowerCase()}` })
      .pipe(filter(contentType => !!contentType));
  }

  ngOnInit() {
    super.ngOnInit();

    this._initActions();
    this._initActiveId();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!!changes.activeId && !changes.activeId.firstChange) {
      this._initActiveId();
    }

    if (!!changes.activeType && !!this._itemBrowser) {
      this._itemBrowser.updateLabelAndDescription(changes.activeType.currentValue);
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    if (!!this.reviewPendingEditNotification) {
      this.popNotificationsService.remove(this.reviewPendingEditNotification.toastId);
    }
  }

  onItemTypeChanged(itemType: EquipmentItemType) {
    if (!!itemType && itemType !== this.activeType) {
      this.activeType = itemType;
      this.router.navigateByUrl(`/equipment/explorer/${itemType.toLowerCase()}`);
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

  _initActiveId() {
    if (this.activeId) {
      this.store$.dispatch(new LoadEquipmentItem({ id: this.activeId, type: this.activeType }));

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

    this.actions$
      .pipe(ofType(EquipmentActionTypes.ASSIGN_ITEM_SUCCESS))
      .pipe(
        takeUntil(this.destroyed$),
        map((action: AssignItemSuccess) => action.payload.item),
        filter(item => !!this.selectedItem && item.id === this.selectedItem.id)
      )
      .subscribe(item => {
        this.selectedItem = item;
      });

    this.actions$
      .pipe(ofType(EquipmentActionTypes.ASSIGN_EDIT_PROPOSAL_SUCCESS))
      .pipe(takeUntil(this.destroyed$))
      .subscribe(() => {
        this.expandEditProposals();
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

  asCamera(item: EquipmentItemBaseInterface): CameraInterface {
    return item as unknown as CameraInterface;
  }

  sellInMarketplace() {
    this.router.navigate(["/equipment/marketplace/create"], {
      queryParams: {
        lineItemCount: 1,
        equipmentItemId: this.selectedItem.id,
        equipmentItemContentTypeId: this.selectedItem.contentType
      }
    });
  }

  startEditMode() {
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!user) {
        this.routerService.redirectToLogin();
        return;
      }

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

      this.loadingService.setLoading(true);

      this.equipmentApiService.acquireEditProposalLock(this.selectedItem.klass, this.selectedItem.id).subscribe(() => {
        this.loadingService.setLoading(false);

        this.editMode = true;
        this.editModel = { ...this.selectedItem };

        this.windowRefService.scrollToElement("#edit-item");
      });
    });
  }

  _endEditMode() {
    this.editMode = false;
    this.editModel = {};
    this.editForm.reset();
  }

  cancelEditMode() {
    this.loadingService.setLoading(true);
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (!!user) {
        this.equipmentApiService
          .releaseEditProposalLock(this.selectedItem.klass, this.selectedItem.id)
          .subscribe(() => {
            this._endEditMode();
            this.loadingService.setLoading(false);
          });
      } else {
        this._endEditMode();
        this.loadingService.setLoading(false);
      }
    });
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

    this.loadingService.setLoading(true);

    this.equipmentApiService.acquireReviewerLock(this.selectedItem.klass, this.selectedItem.id).subscribe(() => {
      this.loadingService.setLoading(false);

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
    });
  }

  startUnapproval() {
    if (!this._verifyCameraVariantCanBeEdited()) {
      return;
    }

    this.loadingService.setLoading(true);

    this.equipmentApiService.acquireReviewerLock(this.selectedItem.klass, this.selectedItem.id).subscribe(() => {
      this.loadingService.setLoading(false);

      const modal: NgbModalRef = this.modalService.open(UnapproveItemModalComponent);
      const componentInstance: UnapproveItemModalComponent = modal.componentInstance;

      componentInstance.equipmentItem = this.selectedItem;

      this.actions$
        .pipe(
          ofType(EquipmentActionTypes.UNAPPROVE_EQUIPMENT_ITEM_SUCCESS),
          map((action: UnapproveEquipmentItemSuccess) => action.payload.item),
          filter(item => item.id === this.selectedItem.id),
          take(1)
        )
        .subscribe(item => {
          this.setItem(item);
          this.unapproved.emit();
          this.popNotificationsService.success(this.translateService.instant("Item unapproved."));
        });
    });
  }

  startFreezeAsAmbiguous() {
    if (!this._verifyCameraVariantCanBeEdited()) {
      return;
    }

    if (!this.selectedItem.variants?.length) {
      this.popNotificationsService.error(
        "" +
        "You cannot freeze this item as ambiguous because it doesn't have any variants. Please first create the " +
        "appropriate unambiguous variants, and then try again."
      );
      return;
    }

    this.loadingService.setLoading(true);

    this.equipmentApiService.acquireReviewerLock(this.selectedItem.klass, this.selectedItem.id).subscribe(() => {
      this.loadingService.setLoading(false);

      const modal: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
      const componentInstance: ConfirmationDialogComponent = modal.componentInstance;

      componentInstance.message = this.translateService.instant(
        "You are about to freeze this item as ambiguous. The item will remain associated the images it's " +
        "currently associated with. Nobody will be able to see this item (except moderators and the item's " +
        "creator). Nobody will be able to add this item to images. Any items marked as 'variant of' this item will " +
        "lose the relationship."
      );

      this.actions$
        .pipe(
          ofType(EquipmentActionTypes.FREEZE_EQUIPMENT_ITEM_AS_AMBIGUOUS_SUCCESS),
          map((action: FreezeEquipmentItemAsAmbiguousSuccess) => action.payload.item),
          filter(item => item.id === this.selectedItem.id),
          take(1)
        )
        .subscribe(item => {
          this.popNotificationsService.success(this.translateService.instant("Item frozen as ambiguous."));
          this.setItem(item);
          this.frozenAsAmbiguous.emit();
        });

      modal.closed.subscribe(item => {
        this.store$.dispatch(new FreezeEquipmentItemAsAmbiguous({ item: this.selectedItem }));
      });
    });
  }

  startUnfreezeAsAmbiguous() {
    if (!this._verifyCameraVariantCanBeEdited()) {
      return;
    }

    this.loadingService.setLoading(true);

    this.equipmentApiService.acquireReviewerLock(this.selectedItem.klass, this.selectedItem.id).subscribe(() => {
      this.loadingService.setLoading(false);

      const modal: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
      const componentInstance: ConfirmationDialogComponent = modal.componentInstance;

      componentInstance.message = this.translateService.instant(
        "You are about to unfreeze this item as ambiguous. Users will be able to see it and use it again."
      );

      this.actions$
        .pipe(
          ofType(EquipmentActionTypes.UNFREEZE_EQUIPMENT_ITEM_AS_AMBIGUOUS_SUCCESS),
          map((action: UnfreezeEquipmentItemAsAmbiguousSuccess) => action.payload.item),
          filter(item => item.id === this.selectedItem.id),
          take(1)
        )
        .subscribe(item => {
          this.popNotificationsService.success(this.translateService.instant("Item unfrozen."));
          this.setItem(item);
          this.unfrozenAsAmbiguous.emit();
        });

      modal.closed.subscribe(item => {
        this.store$.dispatch(new UnfreezeEquipmentItemAsAmbiguous({ item: this.selectedItem }));
      });
    });
  }

  startRejection() {
    if (!this._verifyCameraVariantCanBeEdited()) {
      return;
    }

    this.loadingService.setLoading(true);

    this.equipmentApiService.acquireReviewerLock(this.selectedItem.klass, this.selectedItem.id).subscribe(() => {
      this.loadingService.setLoading(false);

      const modal: NgbModalRef = this.modalService.open(RejectItemModalComponent);
      const componentInstance: RejectItemModalComponent = modal.componentInstance;

      componentInstance.equipmentItem = this.selectedItem;

      modal.closed.pipe(take(1)).subscribe(() => {
        this.resetBrowser();
        this.rejected.emit();
        this.loadingService.setLoading(false);
      });
    });
  }

  resetBrowser(overrideGoBackOnClose?: boolean) {
    if (!!this._itemBrowser) {
      this._itemBrowser.reset();
    }

    this.selectedItem = null;
    this._endEditMode();

    if (overrideGoBackOnClose ?? this.goBackOnClose) {
      this.location.back();
    }
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

    this._endEditMode();
    this._loadEditProposals();
    this._loadMarketplaceLineItems();
  }

  onCreationModeStarted() {
    this.resetBrowser(false);
    this.creationMode.emit(true);
  }

  onCreationModeEnded() {
    this.creationMode.emit(false);
  }

  proposeEdit() {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      UtilsService.notifyAboutFieldsWithErrors(this.editor.fields, this.popNotificationsService, this.translateService);
      return;
    }

    if (JSON.stringify(this.editModel) === JSON.stringify(this.selectedItem)) {
      this.popNotificationsService.error("In order to make an edit proposal, you need to edit some properties.");
      return;
    }

    const _createEditProposal = () => {
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
    };

    if (this.editModel.name !== this.selectedItem.name) {
      const modal: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
      const componentInstance: ConfirmationDialogComponent = modal.componentInstance;
      componentInstance.message = this.equipmentItemService.nameChangeWarningMessage();

      modal.closed.pipe(take(1)).subscribe(() => {
        _createEditProposal();
      });
    } else {
      _createEditProposal();
    }
  }

  editProposalCreated() {
    this.popNotificationsService.success(
      this.translateService.instant("Your edit proposal has been submitted and will be reviewed as soon as possible."),
      this.translateService.instant("Thank you so much for contributing to the AstroBin equipment database! 🙌")
    );
    this._loadEditProposals();
    this.cancelEditMode();
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

  showEditProposals(): boolean {
    return this.editProposalsByStatus(this.editProposals, null)?.length > 0 || !this.editProposalsCollapsed;
  }

  typeSupportsMigrateInto() {
    return this.activeType !== EquipmentItemType.SENSOR;
  }

  private _loadEditProposals() {
    if (!this.selectedItem) {
      return;
    }

    if (!!this.editProposalsSubscription) {
      this.editProposalsSubscription.unsubscribe();
    }

    this.editProposalsSubscription = this.store$
      .select(selectEditProposalsForItem, this.selectedItem)
      .pipe(distinctUntilChangedObj(), takeUntil(this.destroyed$))
      .subscribe(editProposals => {
        this.editProposals = editProposals;
        this.editProposalsCollapsed =
          this.editProposalsByStatus(editProposals, null).length === 0 && !this.activeEditProposalId;

        const pendingEditProposals = this.editProposalsByStatus(editProposals, null);
        for (const pendingEditProposal of pendingEditProposals) {
          this.currentUser$.pipe(take(1)).subscribe(user => {
            if (!!user && user.id !== pendingEditProposal.editProposalBy) {
              if (!!this.reviewPendingEditNotification) {
                this.popNotificationsService.remove(this.reviewPendingEditNotification.toastId);
              }

              this.reviewPendingEditNotification = this.popNotificationsService.info(
                this.translateService.instant("This item has a pending edit proposal. Please review it!")
              );

              return;
            }
          });
        }
      });

    this.store$.dispatch(new FindEquipmentItemEditProposals({ item: this.selectedItem }));
  }

  private _loadMarketplaceLineItems() {
    this.currentUser$.pipe(filter(user => !!user), take(1)).subscribe(user => {
      if (this.selectedItem && this.userService.isInAstroBinGroup(user, Constants.BETA_TESTERS_ASTROBIN_GROUP)) {
        this.store$.dispatch(new LoadMarketplaceListings({
          options: {
            page: 1,
            itemId: this.selectedItem.id,
            contentTypeId: this.selectedItem.contentType,
            sold: false,
            pendingModeration: false
          }
        }));
      }
    });
  }
}
