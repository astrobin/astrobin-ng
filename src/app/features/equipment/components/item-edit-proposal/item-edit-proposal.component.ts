import { AfterViewInit, Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import {
  EditProposalChange,
  EditProposalInterface,
  EditProposalReviewStatus
} from "@features/equipment/types/edit-proposal.interface";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import {
  ApproveEquipmentItemEditProposalSuccess,
  EquipmentActionTypes,
  LoadEquipmentItem,
  RejectEquipmentItemEditProposalSuccess
} from "@features/equipment/store/equipment.actions";
import { selectEditProposalsForItem, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { UserInterface } from "@shared/interfaces/user.interface";
import { LoadUser } from "@features/account/store/auth.actions";
import { filter, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, Observable } from "rxjs";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { selectUser } from "@features/account/store/auth.selectors";
import { LoadingService } from "@shared/services/loading.service";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { RejectEditProposalModalComponent } from "@features/equipment/components/reject-edit-proposal-modal/reject-edit-proposal-modal.component";
import { Actions, ofType } from "@ngrx/effects";
import { ApproveEditProposalModalComponent } from "@features/equipment/components/approve-edit-proposal-modal/approve-edit-proposal-modal.component";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { AssignEditProposalModalComponent } from "@shared/components/equipment/summaries/assign-edit-proposal-modal/assign-edit-proposal-modal.component";
import { UtilsService } from "@shared/services/utils/utils.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";

@Component({
  selector: "astrobin-item-edit-proposal",
  templateUrl: "./item-edit-proposal.component.html",
  styleUrls: ["./item-edit-proposal.component.scss"]
})
export class ItemEditProposalComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  @Input()
  editProposal: EditProposalInterface<EquipmentItemBaseInterface>;

  @Input()
  opened = false;

  editProposalBy$: Observable<UserInterface>;
  item: EquipmentItemBaseInterface;
  type: EquipmentItemType;
  changes: EditProposalChange[] = [];

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly translateService: TranslateService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly loadingService: LoadingService,
    public readonly modalService: NgbModal,
    public readonly utilsService: UtilsService,
    public readonly windowRefService: WindowRefService,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$);
  }

  get reviewStatusText(): string {
    switch (this.editProposal.editProposalReviewStatus) {
      case EditProposalReviewStatus.APPROVED:
        return this.translateService.instant("Approved");
      case EditProposalReviewStatus.REJECTED:
        return this.translateService.instant("Rejected");
      case EditProposalReviewStatus.SUPERSEDED:
        return this.translateService.instant("Superseded");
      default:
        return this.translateService.instant("Pending");
    }
  }

  get hasChanges(): boolean {
    return this.changes.length > 0;
  }

  get showReviewButtons$(): Observable<boolean> {
    return this.currentUser$.pipe(map(currentUser => !!currentUser && !this.editProposal.editProposalReviewStatus));
  }

  get approveButtonsStatus$(): Observable<{ disabled: boolean; reason: string | null }> {
    return this.store$.select(selectEditProposalsForItem, this.item).pipe(
      map(editProposals =>
        editProposals.filter(
          editProposal =>
            editProposal.editProposalReviewStatus === null &&
            new Date(editProposal.editProposalCreated) < new Date(this.editProposal.editProposalCreated)
        )
      ),
      switchMap(editProposals => this.currentUser$.pipe(map(currentUser => ({ editProposals, currentUser })))),
      map(({ editProposals, currentUser }) => {
        if (!!this.editProposal.editProposalAssignee && this.editProposal.editProposalAssignee !== currentUser.id) {
          return {
            disabled: true,
            reason: this.translateService.instant(
              "You cannot review this edit proposal because it's assigned to another user."
            )
          };
        }

        if (currentUser.id === this.editProposal.editProposalBy) {
          return {
            disabled: true,
            reason: this.translateService.instant(
              "You cannot approve this edit proposal because you were the one who proposed it."
            )
          };
        }

        if (editProposals.length > 0) {
          return {
            disabled: true,
            reason: this.translateService.instant(
              "You cannot review this edit proposal because there are previous pending proposals."
            )
          };
        }

        return {
          disabled: false,
          reason: null
        };
      })
    );
  }

  get rejectButtonsStatus$(): Observable<{ disabled: boolean; reason: string | null }> {
    return this.store$.select(selectEditProposalsForItem, this.item).pipe(
      map(editProposals =>
        editProposals.filter(
          editProposal =>
            editProposal.editProposalReviewStatus === null &&
            new Date(editProposal.editProposalCreated) < new Date(this.editProposal.editProposalCreated)
        )
      ),
      switchMap(editProposals => this.currentUser$.pipe(map(currentUser => ({ editProposals, currentUser })))),
      map(({ editProposals, currentUser }) => {
        if (!!this.editProposal.editProposalAssignee && this.editProposal.editProposalAssignee !== currentUser.id) {
          return {
            disabled: true,
            reason: this.translateService.instant(
              "You cannot review this edit proposal because it's assigned to another user."
            )
          };
        }

        if (editProposals.length > 0) {
          return {
            disabled: true,
            reason: this.translateService.instant(
              "You cannot review this edit proposal because there are previous pending proposals."
            )
          };
        }

        return {
          disabled: false,
          reason: null
        };
      })
    );
  }

  get contentType$(): Observable<ContentTypeInterface | null> {
    return this.store$
      .select(selectContentType, {
        appLabel: "astrobin_apps_equipment",
        model: `${this.type.toLowerCase()}editproposal`
      })
      .pipe(filter(contentType => !!contentType));
  }

  ngOnInit(): void {
    super.ngOnInit();

    const type: EquipmentItemType = this.equipmentItemService.getType(this.editProposal);

    this._loadData(type);
    this._loadEquipmentItem(type);
  }

  ngAfterViewInit() {
    if (this.windowRefService.getCurrentUrl().href.indexOf("/edit-proposals/") && this.opened) {
      this.windowRefService.scrollToElement(`.edit-proposal[data-id="${this.editProposal.id}"]`);
      if (this.editProposal.editProposalReviewStatus !== null) {
        this.currentUser$.pipe(take(1)).subscribe(user => {
          if (!user || this.editProposal.editProposalReviewedBy !== user.id) {
            this.popNotificationsService.warning(
              this.translateService.instant("This edit proposal has already been reviewed.")
            );
          }
        });
      }
    }
  }

  assign() {
    const modalRef = this.modalService.open(AssignEditProposalModalComponent);
    const componentInstance: AssignEditProposalModalComponent = modalRef.componentInstance;
    componentInstance.editProposal = this.editProposal;
    modalRef.closed.subscribe((editProposal: EditProposalInterface<EquipmentItem>) => {
      this.editProposal = editProposal;

      if (!!this.editProposal.editProposalAssignee) {
        this.store$.dispatch(new LoadUser({ id: this.editProposal.editProposalAssignee }));
      }
    });
  }

  approveEdit() {
    const type: EquipmentItemType = this.equipmentItemService.getType(this.editProposal);

    this.loadingService.setLoading(true);

    this.equipmentApiService.acquireEditProposalReviewLock(type, this.editProposal.id).subscribe(() => {
      this.loadingService.setLoading(false);

      const modal: NgbModalRef = this.modalService.open(ApproveEditProposalModalComponent);
      const componentInstance: ApproveEditProposalModalComponent = modal.componentInstance;

      componentInstance.editProposal = this.editProposal;

      this.actions$
        .pipe(
          ofType(EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS),
          map((action: ApproveEquipmentItemEditProposalSuccess) => action.payload.editProposal),
          take(1)
        )
        .subscribe(editProposal => (this.editProposal = editProposal));
    });
  }

  rejectEdit() {
    const type: EquipmentItemType = this.equipmentItemService.getType(this.editProposal);

    this.loadingService.setLoading(true);

    this.equipmentApiService.acquireEditProposalReviewLock(type, this.editProposal.id).subscribe(() => {
      this.loadingService.setLoading(false);

      const modal: NgbModalRef = this.modalService.open(RejectEditProposalModalComponent);
      const componentInstance: RejectEditProposalModalComponent = modal.componentInstance;

      componentInstance.editProposal = this.editProposal;

      this.actions$
        .pipe(
          ofType(EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_EDIT_PROPOSAL_SUCCESS),
          map((action: RejectEquipmentItemEditProposalSuccess) => action.payload.editProposal),
          take(1)
        )
        .subscribe(editProposal => (this.editProposal = editProposal));
    });
  }

  private _loadData(type: EquipmentItemType) {
    this.store$.dispatch(new LoadEquipmentItem({ id: this.editProposal.editProposalTarget, type }));
    this.store$.dispatch(new LoadUser({ id: this.editProposal.editProposalBy }));
    this.store$.dispatch(
      new LoadContentType({ appLabel: "astrobin_apps_equipment", model: `${type.toLowerCase()}editproposal` })
    );

    this.editProposalBy$ = this.store$
      .select(selectUser, this.editProposal.editProposalBy)
      .pipe(filter(user => !!user));
  }

  private _loadEquipmentItem(type: EquipmentItemType) {
    this.store$
      .select(selectEquipmentItem, { id: this.editProposal.editProposalTarget, type })
      .pipe(
        filter(item => !!item),
        take(1),
        tap(item => {
          this.item = item;
          this.type = this.equipmentItemService.getType(this.item);
        }),
        switchMap(() => this.equipmentItemService.changes(this.item, this.editProposal))
      )
      .subscribe(changes => {
        changes.forEach(change => {
          const enumValue = this.equipmentItemService.propertyNameToPropertyEnum(change.propertyName);

          forkJoin({
            before: this.equipmentItemService.getPrintableProperty$(this.item, enumValue, change.before),
            after: this.equipmentItemService.getPrintableProperty$(this.editProposal, enumValue, change.after)
          }).subscribe(({ before, after }) => {
            const propertyName = this.equipmentItemService.getPrintablePropertyName(this.type, enumValue, true);
            this.changes.push({ propertyName, before, after });
          });
        });
      });
  }
}
