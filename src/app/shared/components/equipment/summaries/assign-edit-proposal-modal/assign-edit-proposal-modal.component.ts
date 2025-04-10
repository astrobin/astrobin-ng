import type { OnInit } from "@angular/core";
import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import type { MainState } from "@app/store/state";
import type { UserInterface } from "@core/interfaces/user.interface";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { selectUser } from "@features/account/store/auth.selectors";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import type { AssignEditProposalSuccess } from "@features/equipment/store/equipment.actions";
import { AssignEditProposal, EquipmentActionTypes } from "@features/equipment/store/equipment.actions";
import { EditProposalInterface } from "@features/equipment/types/edit-proposal.interface";
import type { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { UsernameService } from "@shared/components/misc/username/username.service";
import { filter, map, switchMap, take, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-assign-edit-proposal-modal",
  templateUrl: "./assign-edit-proposal-modal.component.html",
  styleUrls: ["./assign-edit-proposal-modal.component.scss"]
})
export class AssignEditProposalModalComponent extends BaseComponentDirective implements OnInit {
  @Input()
  editProposal: EditProposalInterface<EquipmentItem>;

  fields: FormlyFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: {
    assignee: UserInterface["id"] | null;
  } = {
    assignee: null
  };
  loadingAssignees = true;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly modal: NgbActiveModal,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly translateService: TranslateService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly usernameService: UsernameService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this.model.assignee = this.editProposal.editProposalAssignee;
    this.loadingService.setLoading(true);

    this.fields = [
      {
        key: "assignee",
        type: "radio",
        wrappers: ["default-wrapper"],
        props: {
          required: false,
          labelProp: "value",
          valueProp: "key",
          options: this.equipmentApiService
            .getPossibleEditProposalAssignees(this.editProposal.klass, this.editProposal.id)
            .pipe(
              map(possibleAssignees => {
                return [{ key: null, value: this.translateService.instant("Anyone") }, ...possibleAssignees];
              }),
              tap(() => {
                this.loadingService.setLoading(false);
                this.loadingAssignees = false;
              })
            )
        }
      }
    ];

    this.actions$
      .pipe(ofType(EquipmentActionTypes.ASSIGN_EDIT_PROPOSAL_SUCCESS))
      .pipe(
        take(1),
        map((action: AssignEditProposalSuccess) => action.payload.editProposal)
      )
      .subscribe(editProposal => {
        this.loadingService.setLoading(false);
        this.modal.close(editProposal);
        if (!!editProposal.editProposalAssignee) {
          this.store$
            .select(selectUser, editProposal.editProposalAssignee)
            .pipe(
              filter(user => !!user),
              take(1),
              switchMap(user => this.usernameService.getDisplayName$(user))
            )
            .subscribe(username => {
              this.popNotificationsService.success(
                this.translateService.instant("Edit proposal assigned to {{0}} for review.", { 0: username })
              );
            });
        } else {
          this.popNotificationsService.success(
            this.translateService.instant("Edit proposal unassigned: anyone can review it.")
          );
        }
      });
  }

  save() {
    this.loadingService.setLoading(true);
    this.store$.dispatch(
      new AssignEditProposal({
        itemType: this.editProposal.klass,
        editProposalId: this.editProposal.id,
        assignee: this.model.assignee
      })
    );
  }
}
