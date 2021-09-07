import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { MigrationFlag } from "@shared/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { takeUntil } from "rxjs/operators";

enum RejectMigrationReason {
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
  model: any = {};

  @Input()
  legacyItem: any;

  @Input()
  equipmentItem: EquipmentItemBaseInterface;

  constructor(public readonly store$: Store<State>, public readonly modal: NgbActiveModal) {
    super(store$);
  }

  ngOnInit(): void {
    this.fields = [
      {
        key: "reason",
        type: "ng-select",
        id: "reason",
        templateOptions: {
          label: "Reason",
          required: true,
          clearable: false,
          options:
            this.legacyItem.migrationFlag === MigrationFlag.MIGRATE
              ? [
                  this._incorrectStrategyOption(),
                  this._wrongMigrationTargetOption(),
                  this._badMigrationTargetOption(),
                  this._otherOption()
                ]
              : [this._incorrectStrategyOption(), this._otherOption()]
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
                    "correctly, it is not the correct item onto which to perform this migration";
                  break;
                case RejectMigrationReason.REJECTED_BAD_MIGRATION_TARGET:
                  description =
                    "<strong>Bad migration target</strong> means that the item onto which to perform this migration " +
                    "was created incorrectly.";
                  warning =
                    "<strong>Please be very careful</strong> with your decision to select this option. You need to " +
                    "be very sure that the target item has incorrect data. If you select this option, the target " +
                    "item will be deleted and all the migration proposals associated with it will be undone.";
                  break;
                case RejectMigrationReason.REJECTED_OTHER:
                  description = "Please specify your reason in the comment box below.";
                  break;
              }

              field.templateOptions.description = description;
              field.templateOptions.warningMessage = warning;
            });
          }
        }
      },
      {
        key: "comment",
        type: "textarea",
        id: "comment",
        wrappers: ["default-wrapper"],
        templateOptions: {
          label: "Comment",
          required: false,
          rows: 4
        }
      }
    ];
  }

  reject() {}

  _incorrectStrategyOption(): { value: string; label: string } {
    return {
      value: RejectMigrationReason.REJECTED_INCORRECT_STRATEGY,
      label: "Incorrect strategy"
    };
  }

  _wrongMigrationTargetOption(): { value: string; label: string } {
    return {
      value: RejectMigrationReason.REJECTED_WRONG_MIGRATION_TARGET,
      label: "Wrong migration strategy"
    };
  }

  _badMigrationTargetOption(): { value: string; label: string } {
    return {
      value: RejectMigrationReason.REJECTED_BAD_MIGRATION_TARGET,
      label: "Bad migration strategy"
    };
  }

  _otherOption(): { value: string; label: string } {
    return {
      value: RejectMigrationReason.REJECTED_OTHER,
      label: "Other"
    };
  }
}
