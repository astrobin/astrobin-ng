import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { EditProposalChange, EditProposalInterface } from "@features/equipment/interfaces/edit-proposal.interface";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { LoadBrand, LoadEquipmentItem } from "@features/equipment/store/equipment.actions";
import { selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { UserInterface } from "@shared/interfaces/user.interface";
import { selectUser } from "@features/account/store/auth.selectors";
import { LoadUser } from "@features/account/store/auth.actions";
import { UsernameService } from "@shared/components/misc/username/username.service";
import { filter, switchMap, take, tap } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-item-edit-proposal",
  templateUrl: "./item-edit-proposal.component.html",
  styleUrls: ["./item-edit-proposal.component.scss"]
})
export class ItemEditProposalComponent extends BaseComponentDirective implements OnInit {
  @Input()
  editProposal: EditProposalInterface<EquipmentItemBaseInterface>;

  item: EquipmentItemBaseInterface;
  type: EquipmentItemType;
  proposedBy: UserInterface;
  userProposedEditMessage: string;

  changes: EditProposalChange[] = [];

  opened = false;

  constructor(
    public readonly store$: Store<State>,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly usernameService: UsernameService,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    const type: EquipmentItemType = this.equipmentItemService.getType(this.editProposal);

    this.store$.dispatch(new LoadEquipmentItem({ id: this.editProposal.editProposalTarget, type }));
    this.store$.dispatch(new LoadBrand({ id: this.editProposal.brand }));
    this.store$.dispatch(new LoadUser({ id: this.editProposal.editProposalBy }));

    this.store$
      .select(selectEquipmentItem, { id: this.editProposal.editProposalTarget, type })
      .pipe(
        filter(item => !!item),
        take(1)
      )
      .subscribe(item => {
        this.item = item;
        this.type = this.equipmentItemService.getType(this.item);
        this.changes = this.equipmentItemService.changes(this.item, this.editProposal);
      });

    this.store$
      .select(selectUser, this.editProposal.editProposalBy)
      .pipe(
        filter(user => !!user),
        take(1),
        tap(user => (this.proposedBy = user)),
        switchMap(user => this.usernameService.getDisplayName$(user)),
        tap(
          displayName =>
            (this.userProposedEditMessage = this.translateService.instant("{{0}} proposed an edit to this item", {
              0: `<a href="">${displayName}</a>`
            }))
        )
      )
      .subscribe();
  }

  getPropertyDisplay(change: EditProposalChange): string {
    const enumValue = this.equipmentItemService.propertyNameToPropertyEnum(change.propertyName);
    return this.equipmentItemService.getPrintablePropertyName(this.type, enumValue, true);
  }

  getBeforeDisplay(change: EditProposalChange): string {
    const enumValue = this.equipmentItemService.propertyNameToPropertyEnum(change.propertyName);
    return this.equipmentItemService.getPrintableProperty(this.item, enumValue, change.before);
  }

  getAfterDisplay(change: EditProposalChange): string {
    const enumValue = this.equipmentItemService.propertyNameToPropertyEnum(change.propertyName);
    return this.equipmentItemService.getPrintableProperty(this.editProposal, enumValue, change.after);
  }
}
