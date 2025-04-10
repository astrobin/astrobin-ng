import type { OnInit } from "@angular/core";
import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import type { MainState } from "@app/store/state";
import { GearMigrationStrategyApiService } from "@core/services/api/classic/astrobin/grar-migration-strategy/gear-migration-strategy-api.service";
import { MigrationFlag } from "@core/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { FormlyFieldMessageLevel, FormlyFieldService } from "@core/services/formly-field.service";
import { LoadingService } from "@core/services/loading.service";
import { EquipmentActionTypes, RejectEquipmentItem } from "@features/equipment/store/equipment.actions";
import {
  EquipmentItemBaseInterface,
  EquipmentItemReviewerDecision,
  EquipmentItemReviewerRejectionReason
} from "@features/equipment/types/equipment-item-base.interface";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Actions, ofType } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { of } from "rxjs";
import { switchMap, take, takeUntil } from "rxjs/operators";

export enum RejectMigrationReason {
  REJECTED_INCORRECT_STRATEGY = "REJECTED_INCORRECT_STRATEGY",
  REJECTED_WRONG_MIGRATION_TARGET = "REJECTED_WRONG_MIGRATION_TARGET",
  REJECTED_BAD_MIGRATION_TARGET = "REJECTED_BAD_MIGRATION_TARGET",
  REJECTED_OTHER = "REJECTED_OTHER"
}

@Component({
  selector: "astrobin-reject-migration-modal",
  templateUrl: "./reject-migration-modal.component.html",
  styleUrls: ["./reject-migration-modal.component.scss"]
})
export class RejectMigrationModalComponent extends BaseComponentDirective implements OnInit {
  fields: FormlyFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: {
    reason: RejectMigrationReason;
    badMigrationTargetReason?: EquipmentItemReviewerRejectionReason;
    comment: string;
  } = {
    reason: null,
    comment: null
  };

  @Input()
  migrationStrategy: any;

  @Input()
  equipmentItem: EquipmentItemBaseInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly modal: NgbActiveModal,
    public readonly loadingService: LoadingService,
    public readonly gearMigrationStrategyApiService: GearMigrationStrategyApiService,
    public readonly translateService: TranslateService,
    public readonly formlyFieldService: FormlyFieldService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.fields = [
      {
        key: "reason",
        type: "ng-select",
        id: "reason",
        props: {
          label: "Reason",
          required: true,
          clearable: false,
          options: this._reasonOptions()
        },
        hooks: {
          onInit: (field: FormlyFieldConfig) => {
            field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
              let description: string;
              let warning: string;

              switch (value) {
                case RejectMigrationReason.REJECTED_INCORRECT_STRATEGY:
                  description =
                    "<strong>Incorrect strategy</strong> means that this item should be migrated in a different way " +
                    "altogether.";
                  break;
                case RejectMigrationReason.REJECTED_WRONG_MIGRATION_TARGET:
                  description =
                    "<strong>Wrong migration target</strong> means that although the migration target was defined " +
                    "correctly, it is not the correct item onto which to perform this migration.";
                  break;
                case RejectMigrationReason.REJECTED_BAD_MIGRATION_TARGET:
                  description =
                    "<strong>Bad migration target</strong> means that the item onto which to perform this migration " +
                    "was created incorrectly.";
                  warning =
                    "<br/><strong>Please be very careful</strong> with your decision to select this option. <br/><br/>" +
                    "You need to be very sure that the target item has incorrect data. If you select this option, " +
                    "the target item will be deleted and all the migration proposals associated with it will be " +
                    "undone. <br/><br/>" +
                    "Consider using <em>Wrong migration target</em> if the migration target has the correct data " +
                    "but this legacy item should not be migrated to it.<br/><br/>";
                  break;
                case RejectMigrationReason.REJECTED_OTHER:
                  description = "Please specify your reason in the comment box below.";
                  break;
              }

              field.props = {
                ...field.props,
                description
              };

              const message = {
                scope: "migrationWarning",
                level: FormlyFieldMessageLevel.WARNING,
                text: warning
              };

              if (warning) {
                this.formlyFieldService.addMessage(field, message);
              } else {
                this.formlyFieldService.removeMessage(field, message);
              }
            });
          }
        }
      },
      {
        key: "badMigrationTargetReason",
        type: "ng-select",
        id: "bad-migration-target-reason",
        hideExpression: () => this.model.reason !== RejectMigrationReason.REJECTED_BAD_MIGRATION_TARGET,
        expressions: {
          "props.required": "model.reason === 'REJECTED_BAD_MIGRATION_TARGET'"
        },
        props: {
          label: "Bad migration target reason",
          clearable: false,
          options: this._badMigrationTargetReasonOptions()
        }
      },
      {
        key: "comment",
        type: "textarea",
        id: "comment",
        wrappers: ["default-wrapper"],
        props: {
          label: "Comment",
          required: false,
          rows: 4
        }
      }
    ];
  }

  reject() {
    this.loadingService.setLoading(true);

    const reason: RejectMigrationReason = this.form.get("reason").value;
    const comment: string = this.form.get("comment").value;

    this.gearMigrationStrategyApiService
      .reject(this.migrationStrategy.pk, reason, comment)
      .pipe(
        switchMap(item => {
          if (
            this.migrationStrategy.migrationFlag === MigrationFlag.MIGRATE &&
            this.equipmentItem &&
            reason === RejectMigrationReason.REJECTED_BAD_MIGRATION_TARGET
          ) {
            this.store$.dispatch(
              new RejectEquipmentItem({
                item: this.equipmentItem,
                reason: this.model.badMigrationTargetReason,
                comment,
                duplicateOf: null,
                duplicateOfKlass: null,
                duplicateOfUsageType: null
              })
            );
            return this.actions$.pipe(ofType(EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_SUCCESS), take(1));
          } else {
            return of(item);
          }
        })
      )
      .subscribe(() => {
        this.loadingService.setLoading(false);
        this.modal.close();
      });
  }

  _reasonOptions(): { value: string; label: string }[] {
    if (this.migrationStrategy.migrationFlag === MigrationFlag.MIGRATE) {
      if (this.equipmentItem.reviewerDecision === EquipmentItemReviewerDecision.APPROVED) {
        return [this._incorrectStrategyOption(), this._wrongMigrationTargetOption(), this._otherOption()];
      }

      return [
        this._incorrectStrategyOption(),
        this._wrongMigrationTargetOption(),
        this._badMigrationTargetOption(),
        this._otherOption()
      ];
    }

    return [this._incorrectStrategyOption(), this._otherOption()];
  }

  _incorrectStrategyOption(): { value: string; label: string } {
    return {
      value: RejectMigrationReason.REJECTED_INCORRECT_STRATEGY,
      label: "Incorrect strategy"
    };
  }

  _wrongMigrationTargetOption(): { value: string; label: string } {
    return {
      value: RejectMigrationReason.REJECTED_WRONG_MIGRATION_TARGET,
      label: "Wrong migration target"
    };
  }

  _badMigrationTargetOption(): { value: string; label: string } {
    return {
      value: RejectMigrationReason.REJECTED_BAD_MIGRATION_TARGET,
      label: "Bad migration target"
    };
  }

  _otherOption(): { value: string; label: string } {
    return {
      value: RejectMigrationReason.REJECTED_OTHER,
      label: "Other"
    };
  }

  _badMigrationTargetReasonOptions(): { value: string; label: string }[] {
    return [
      {
        value: EquipmentItemReviewerRejectionReason.TYPO,
        label: this.translateService.instant("The target item has a typo in its name")
      },
      {
        value: EquipmentItemReviewerRejectionReason.WRONG_BRAND,
        label: this.translateService.instant("The target item doesn't seem to have the correct brand")
      },
      {
        value: EquipmentItemReviewerRejectionReason.INACCURATE_DATA,
        label: this.translateService.instant("The target item has some inaccurate data")
      },
      {
        value: EquipmentItemReviewerRejectionReason.INSUFFICIENT_DATA,
        label: this.translateService.instant("The target item has insufficient data")
      },

      {
        value: EquipmentItemReviewerRejectionReason.DUPLICATE,
        label: this.translateService.instant("The target item is a duplicate of an existing equipment item")
      },
      {
        value: EquipmentItemReviewerRejectionReason.OTHER,
        label: this.translateService.instant("Other")
      }
    ];
  }
}
