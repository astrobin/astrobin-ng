import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import {
  EquipmentActionTypes,
  FindAllEquipmentItemsSuccess,
  FindSimilarInBrand
} from "@features/equipment/store/equipment.actions";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { Actions, ofType } from "@ngrx/effects";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";

export enum ConfirmItemCreationResult {
  CANCEL
}

@Component({
  selector: "astrobin-confirm-item-creation-modal",
  templateUrl: "./confirm-item-creation-modal.component.html",
  styleUrls: ["./confirm-item-creation-modal.component.scss"]
})
export class ConfirmItemCreationModalComponent extends BaseComponentDirective implements OnInit {
  ConfirmItemCreationResult = ConfirmItemCreationResult;

  @Input()
  item: EquipmentItemBaseInterface;

  similarItems$: Observable<EquipmentItemBaseInterface[]>;

  fields: FormlyFieldConfig[];

  form: FormGroup = new FormGroup({});

  model: {
    confirmNoTypos: boolean;
    confirmNoDuplication: boolean;
    confirmNamingConvention: boolean;
    confirmNoPersonalInformation: boolean;
  } = {
    confirmNoTypos: false,
    confirmNoDuplication: false,
    confirmNamingConvention: false,
    confirmNoPersonalInformation: false
  };

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly modal: NgbActiveModal,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnInit() {
    const type: EquipmentItemType = this.equipmentItemService.getType(this.item);

    this.store$.dispatch(new FindSimilarInBrand({ brand: this.item.brand, q: this.item.name, type }));

    this.similarItems$ = this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_SIMILAR_IN_BRAND_SUCCESS),
      map((action: FindAllEquipmentItemsSuccess) => action.payload.items)
    );

    this.fields = [
      {
        key: "confirmNoTypos",
        type: "checkbox",
        id: "confirm-no-typos",
        wrappers: ["default-wrapper"],
        templateOptions: {
          label: this.translateService.instant("I have carefully checked for typos")
        }
      },
      {
        key: "confirmNoDuplication",
        type: "checkbox",
        id: "confirm-no-duplication",
        wrappers: ["default-wrapper"],
        templateOptions: {
          label: this.translateService.instant(
            "I have carefully checked that this item does not duplicate an existing one"
          )
        }
      },
      {
        key: "confirmNamingConvention",
        type: "checkbox",
        id: "confirm-naming-convention",
        wrappers: ["default-wrapper"],
        templateOptions: {
          label: this.translateService.instant(
            "I have carefully checked that this item conforms to existing naming conventions for this brand"
          )
        }
      }
    ];

    if (!!this.item.brand) {
      this.fields.push({
        key: "confirmNoPersonalInformation",
        type: "checkbox",
        id: "confirm-no-personal-information",
        wrappers: ["default-wrapper"],
        templateOptions: {
          label: this.translateService.instant(
            "I have not included information that pertains to my personal item " +
              "(e.g. sold/broken/refurbished...) and this is the general description of a product"
          )
        }
      });
    }
  }

  useSuggestion(item: EquipmentItemBaseInterface) {
    this.modal.close(item);
  }

  formIsValid(): boolean {
    if (!!this.item.brand) {
      return (
        this.model.confirmNoTypos &&
        this.model.confirmNoDuplication &&
        this.model.confirmNamingConvention &&
        this.model.confirmNoPersonalInformation
      );
    }

    return this.model.confirmNoTypos && this.model.confirmNoDuplication && this.model.confirmNamingConvention;
  }
}
