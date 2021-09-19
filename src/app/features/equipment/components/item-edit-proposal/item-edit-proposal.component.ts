import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import {
  EditProposalChange,
  EditProposalInterface,
  EditProposalReviewStatus
} from "@features/equipment/interfaces/edit-proposal.interface";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { LoadBrand, LoadEquipmentItem } from "@features/equipment/store/equipment.actions";
import { selectEditProposals, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { UserInterface } from "@shared/interfaces/user.interface";
import { LoadUser } from "@features/account/store/auth.actions";
import { UsernameService } from "@shared/components/misc/username/username.service";
import { filter, map, switchMap, take } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, Observable } from "rxjs";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { selectUser } from "@features/account/store/auth.selectors";
import { LoadingService } from "@shared/services/loading.service";

@Component({
  selector: "astrobin-item-edit-proposal",
  templateUrl: "./item-edit-proposal.component.html",
  styleUrls: ["./item-edit-proposal.component.scss"]
})
export class ItemEditProposalComponent extends BaseComponentDirective implements OnInit {
  @Input()
  editProposal: EditProposalInterface<EquipmentItemBaseInterface>;

  editProposalBy$: Observable<UserInterface>;
  item: EquipmentItemBaseInterface;
  type: EquipmentItemType;
  changes: EditProposalChange[] = [];

  opened = false;

  constructor(
    public readonly store$: Store<State>,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly usernameService: UsernameService,
    public readonly translateService: TranslateService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly loadingService: LoadingService
  ) {
    super(store$);
  }

  get reviewStatusText(): string {
    switch (this.editProposal.editProposalReviewStatus) {
      case EditProposalReviewStatus.ACCEPTED:
        return this.translateService.instant("Accepted");
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

  get showButtons$(): Observable<boolean> {
    return this.currentUser$.pipe(map(currentUser => !!currentUser && !this.editProposal.editProposalReviewStatus));
  }

  get buttonsStatus$(): Observable<{ disabled: boolean; reason: string | null }> {
    return this.store$.select(selectEditProposals, this.item).pipe(
      map(editProposals =>
        editProposals.filter(
          editProposal =>
            editProposal.editProposalReviewStatus === null &&
            new Date(editProposal.editProposalCreated) < new Date(this.editProposal.editProposalCreated)
        )
      ),
      switchMap(editProposals => this.currentUser$.pipe(map(currentUser => ({ editProposals, currentUser })))),
      map(({ editProposals, currentUser }) => {
        if (currentUser.id === this.editProposal.editProposalBy) {
          return {
            disabled: true,
            reason: this.translateService.instant(
              "You cannot review this edit proposal because you were the one who proposed it."
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

  ngOnInit(): void {
    const type: EquipmentItemType = this.equipmentItemService.getType(this.editProposal);

    this.store$.dispatch(new LoadEquipmentItem({ id: this.editProposal.editProposalTarget, type }));
    this.store$.dispatch(new LoadBrand({ id: this.editProposal.brand }));
    this.store$.dispatch(new LoadUser({ id: this.editProposal.editProposalBy }));

    this.editProposalBy$ = this.store$.select(selectUser, this.editProposal.editProposalBy);

    this.store$
      .select(selectEquipmentItem, { id: this.editProposal.editProposalTarget, type })
      .pipe(
        filter(item => !!item),
        take(1)
      )
      .subscribe(item => {
        this.item = item;
        this.type = this.equipmentItemService.getType(this.item);
        this.equipmentItemService.changes(this.item, this.editProposal).forEach(change => {
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
