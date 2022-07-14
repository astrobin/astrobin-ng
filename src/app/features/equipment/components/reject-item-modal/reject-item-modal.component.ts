import { Component, Input, OnInit } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import {
  EquipmentItemBaseInterface,
  EquipmentItemReviewerRejectionReason,
  EquipmentItemType,
  EquipmentItemUsageType
} from "@features/equipment/types/equipment-item-base.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { LoadingService } from "@shared/services/loading.service";
import { catchError, map, switchMap, take, takeUntil } from "rxjs/operators";
import { EquipmentActionTypes, RejectEquipmentItem } from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { FormlyFieldMessageLevel, FormlyFieldService } from "@shared/services/formly-field.service";
import { Router } from "@angular/router";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { EMPTY } from "rxjs";
import { UtilsService } from "@shared/services/utils/utils.service";

@Component({
  selector: "astrobin-reject-item-modal",
  templateUrl: "./reject-item-modal.component.html",
  styleUrls: ["./reject-item-modal.component.scss"]
})
export class RejectItemModalComponent extends BaseComponentDirective implements OnInit {
  fields: FormlyFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: {
    reason?: EquipmentItemReviewerRejectionReason;
    duplicateOf?: EquipmentItem["id"];
    duplicateOfKlass?: EquipmentItemType;
    duplicateOfUsageType?: EquipmentItemUsageType;
    comment: string;
  } = {
    reason: null,
    comment: null
  };

  @Input()
  equipmentItem: EquipmentItemBaseInterface;

  consultHandbookMessage = this.translateService.instant(
    "Please consult the {{0}}AstroBin Equipment Moderator Handbook{{1}}.",
    {
      0: `<a href="https://welcome.astrobin.com/equipment-database-moderator-handbook" target="_blank">`,
      1: "</a>"
    }
  );

  get rejectWarningMessage(): string {
    switch (this.model.reason) {
      case EquipmentItemReviewerRejectionReason.DUPLICATE:
        return this.translateService.instant(
          "AstroBin will fix the images associated to this equipment item and notify the affected user."
        );
      case EquipmentItemReviewerRejectionReason.TYPO:
      case EquipmentItemReviewerRejectionReason.INACCURATE_DATA:
      case EquipmentItemReviewerRejectionReason.INSUFFICIENT_DATA:
      case EquipmentItemReviewerRejectionReason.WRONG_BRAND:
      case EquipmentItemReviewerRejectionReason.OTHER:
        return this.translateService.instant(
          "AstroBin will delete this item, remove it from all images, and notify the affected user."
        );
    }
  }

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly formlyFieldService: FormlyFieldService,
    public readonly router: Router,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly utilsService: UtilsService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this.fields = [
      {
        key: "reason",
        type: "ng-select",
        wrappers: ["default-wrapper"],
        id: "reason",
        templateOptions: {
          required: true,
          clearable: false,
          label: this.translateService.instant("Reason"),
          options: [
            {
              value: EquipmentItemReviewerRejectionReason.TYPO,
              label: this.translateService.instant("The item has a typo in its name")
            },
            {
              value: EquipmentItemReviewerRejectionReason.WRONG_BRAND,
              label: this.translateService.instant(
                "The item doesn't seem to have the correct brand, or the brand is misspelled, or it's the " +
                  "duplicate of an existing brand."
              )
            },
            {
              value: EquipmentItemReviewerRejectionReason.INACCURATE_DATA,
              label: this.translateService.instant("The item has some inaccurate data")
            },
            {
              value: EquipmentItemReviewerRejectionReason.INSUFFICIENT_DATA,
              label: this.translateService.instant("The item has insufficient data")
            },
            {
              value: EquipmentItemReviewerRejectionReason.DUPLICATE,
              label: this.translateService.instant("The item already exists in the database")
            },
            {
              value: EquipmentItemReviewerRejectionReason.OTHER,
              label: this.translateService.instant("Other")
            }
          ]
        },
        hooks: {
          onInit: (field: FormlyFieldConfig) => {
            const message = {
              level: FormlyFieldMessageLevel.WARNING,
              text:
                `${this.translateService.instant("Please note")}:` +
                this.translateService.instant("consider making an edit proposal instead.")
            };

            field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
              switch (value) {
                case EquipmentItemReviewerRejectionReason.TYPO:
                case EquipmentItemReviewerRejectionReason.INACCURATE_DATA:
                case EquipmentItemReviewerRejectionReason.INSUFFICIENT_DATA:
                  this.formlyFieldService.addMessage(field.templateOptions, message);
                  break;
                default:
                  this.formlyFieldService.removeMessage(field.templateOptions, message);
              }
            });
          }
        }
      },
      {
        key: "comment",
        type: "textarea",
        id: "comment",
        wrappers: ["default-wrapper"],
        hideExpression: () => this.model.reason !== EquipmentItemReviewerRejectionReason.OTHER,
        expressionProperties: {
          "templateOptions.required": "model.reason === 'OTHER'"
        },
        templateOptions: {
          label: this.translateService.instant("Comment"),
          rows: 4
        }
      },
      {
        key: "duplicateOfKlass",
        type: "ng-select",
        id: "duplicate-of-klass",
        hideExpression: () => this.model.reason !== EquipmentItemReviewerRejectionReason.DUPLICATE,
        expressionProperties: {
          "templateOptions.required": "model.reason === 'DUPLICATE'"
        },
        defaultValue: EquipmentItemType[this.equipmentItem.klass],
        templateOptions: {
          label: this.translateService.instant("Item class"),
          clearable: false,
          options: Object.keys(EquipmentItemType).map(itemType => ({
            value: itemType as EquipmentItemType,
            label: this.equipmentItemService.humanizeType(itemType as EquipmentItemType)
          }))
        },
        hooks: {
          onInit: (field: FormlyFieldConfig) => {
            field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
              const duplicateOfField = this._duplicateOfField();

              this.fields = this.fields.filter(x => x.key !== duplicateOfField.key);

              duplicateOfField.templateOptions.itemType = value;
              this.fields.push(duplicateOfField);
            });
          }
        }
      },
      {
        key: "duplicateOfUsageType",
        type: "ng-select",
        id: "duplicate-of-usage-type",
        hideExpression: () =>
          this.model.reason !== EquipmentItemReviewerRejectionReason.DUPLICATE ||
          [EquipmentItemType.TELESCOPE, EquipmentItemType.CAMERA].indexOf(this.model.duplicateOfKlass) === -1,
        expressionProperties: {
          "templateOptions.required": "model.reason === 'DUPLICATE'"
        },
        defaultValue: EquipmentItemUsageType.GUIDING,
        templateOptions: {
          label: this.translateService.instant("Usage type"),
          clearable: false,
          options: Object.keys(EquipmentItemUsageType).map(usageType => ({
            value: usageType as EquipmentItemUsageType,
            label: this.equipmentItemService.humanizeUsageType(usageType as EquipmentItemUsageType)
          }))
        }
      },
      this._duplicateOfField()
    ];
  }

  reject() {
    this.loadingService.setLoading(true);

    const reason: EquipmentItemReviewerRejectionReason = this.form.get("reason").value;
    const comment: string = this.form.get("comment")?.value;
    const duplicateOf: EquipmentItemBaseInterface["id"] = this.form.get("duplicateOf")?.value;
    const duplicateOfKlass: EquipmentItemType = this.form.get("duplicateOfKlass")?.value;
    const duplicateOfUsageType: EquipmentItemUsageType = this.form.get("duplicateOfUsageType")?.value;

    this.utilsService.delay(100).subscribe(() => {
      this.store$.dispatch(
        new RejectEquipmentItem({
          item: this.equipmentItem,
          reason,
          comment,
          duplicateOf,
          duplicateOfKlass,
          duplicateOfUsageType
        })
      );

      this.actions$
        .pipe(
          ofType(EquipmentActionTypes.REJECT_EQUIPMENT_ITEM_SUCCESS),
          take(1),
          switchMap(item =>
            this.equipmentApiService
              .releaseReviewerLock(this.equipmentItem.klass, this.equipmentItem.id)
              .pipe(map(() => item))
          ),
          catchError(() => {
            this.modal.close();
            return EMPTY;
          })
        )
        .subscribe(() => {
          this.modal.close();
        });
    });
  }

  cancel() {
    this.loadingService.setLoading(true);

    this.equipmentApiService.releaseReviewerLock(this.equipmentItem.klass, this.equipmentItem.id).subscribe(() => {
      this.loadingService.setLoading(false);

      this.modal.dismiss();
    });
  }

  private _duplicateOfField(): FormlyFieldConfig {
    return {
      key: "duplicateOf",
      type: "equipment-item-browser",
      id: "duplicate-of",
      hideExpression: () => this.model.reason !== EquipmentItemReviewerRejectionReason.DUPLICATE,
      expressionProperties: {
        "templateOptions.required": "model.reason === 'DUPLICATE'"
      },
      templateOptions: {
        label: this.translateService.instant("Duplicate of"),
        itemType: this.equipmentItemService.getType(this.equipmentItem),
        showQuickAddRecent: false,
        showPlaceholderImage: false,
        multiple: false,
        enableCreation: false
      }
    };
  }
}
