import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { LoadingService } from "@shared/services/loading.service";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import { UserInterface } from "@shared/interfaces/user.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { TranslateService } from "@ngx-translate/core";
import { filter, map, switchMap, take, tap } from "rxjs/operators";
import { AssignItem, AssignItemSuccess, EquipmentActionTypes } from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { selectUser } from "@features/account/store/auth.selectors";
import { UsernameService } from "@shared/components/misc/username/username.service";

@Component({
  selector: "astrobin-assign-item-modal",
  templateUrl: "./assign-item-modal.component.html",
  styleUrls: ["./assign-item-modal.component.scss"]
})
export class AssignItemModalComponent extends BaseComponentDirective implements OnInit {
  @Input()
  item: EquipmentItem;

  fields: FormlyFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: {
    assignee: UserInterface["id"] | null;
  } = {
    assignee: null
  };
  loadingAssignees = true;

  constructor(
    public readonly store$: Store<State>,
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
    this.model.assignee = this.item.assignee;
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
          options: this.equipmentApiService.getPossibleItemAssignees(this.item.klass, this.item.id).pipe(
            map(possibleAssignees => {
              return [{ key: null, value: this.translateService.instant("Any moderator") }, ...possibleAssignees];
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
      .pipe(ofType(EquipmentActionTypes.ASSIGN_ITEM_SUCCESS))
      .pipe(
        take(1),

        map((action: AssignItemSuccess) => action.payload.item)
      )
      .subscribe(item => {
        this.loadingService.setLoading(false);
        this.modal.close(item);
        if (!!item.assignee) {
          this.store$
            .select(selectUser, item.assignee)
            .pipe(
              filter(user => !!user),
              take(1),
              switchMap(user => this.usernameService.getDisplayName$(user))
            )
            .subscribe(username => {
              this.popNotificationsService.success(
                this.translateService.instant("Equipment item assigned to {{0}} for review.", { 0: username })
              );
            });
        } else {
          this.popNotificationsService.success(
            this.translateService.instant("Equipment item unassigned: any moderator can review it.")
          );
        }
      });
  }

  save() {
    this.loadingService.setLoading(true);
    this.store$.dispatch(
      new AssignItem({ itemType: this.item.klass, itemId: this.item.id, assignee: this.model.assignee })
    );
  }
}
