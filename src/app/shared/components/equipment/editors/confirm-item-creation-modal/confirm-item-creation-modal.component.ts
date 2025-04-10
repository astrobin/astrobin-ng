import type { OnInit } from "@angular/core";
import { Component, Input } from "@angular/core";
import { FormGroup } from "@angular/forms";
import type { MainState } from "@app/store/state";
import type { EquipmentItemService } from "@core/services/equipment-item.service";
import type { FindAllEquipmentItemsSuccess } from "@features/equipment/store/equipment.actions";
import { EquipmentActionTypes, FindSimilarInBrand } from "@features/equipment/store/equipment.actions";
import type { CameraInterface } from "@features/equipment/types/camera.interface";
import { CameraType } from "@features/equipment/types/camera.interface";
import type { EquipmentItemBaseInterface } from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import type { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import type { Actions } from "@ngrx/effects";
import { ofType } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import type { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";

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

  showModifiedCameraCreationNotice = false;

  model: {
    confirmNoTypos: boolean;
    confirmNoDuplication: boolean;
    confirmNamingConvention: boolean;
    confirmUnambiguous: boolean;
    confirmNoPersonalInformation: boolean;
    confirmEnglish: boolean;
  } = {
    confirmNoTypos: false,
    confirmNoDuplication: false,
    confirmNamingConvention: false,
    confirmUnambiguous: false,
    confirmNoPersonalInformation: false,
    confirmEnglish: false
  };

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly modal: NgbActiveModal,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

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
        props: {
          label: this.translateService.instant("I have carefully checked for typos")
        }
      },
      {
        key: "confirmNoDuplication",
        type: "checkbox",
        id: "confirm-no-duplication",
        wrappers: ["default-wrapper"],
        props: {
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
        props: {
          label: this.translateService.instant(
            "I have carefully checked that this item conforms to existing naming conventions for this brand"
          )
        }
      },
      {
        key: "confirmUnambiguous",
        type: "checkbox",
        id: "confirm-unambiguous",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant(
            "The name of this product identifies it in a manner that is sufficiently unambiguous"
          ),
          description: this.translateService.instant(
            "You want to be precise enough that this product's name distinguishes it from similar products that " +
              "people might want to search for on AstroBin, but not so precise as to create too many variants of " +
              "what is essentially the same product."
          )
        }
      },
      {
        key: "confirmEnglish",
        type: "checkbox",
        id: "confirm-english",
        wrappers: ["default-wrapper"],
        props: {
          label: this.translateService.instant("The name of this product is in English (if applicable)"),
          description: this.translateService.instant(
            "AstroBin does not translate product names into other languages, so if the name of this product has" +
              "words that are not in English, please fix it."
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
        props: {
          label: this.translateService.instant(
            "I have not included information that pertains to my personal item " +
              "(e.g. sold/broken/refurbished...) and this is the general description of a product"
          )
        }
      });
    }

    this.showModifiedCameraCreationNotice =
      this.equipmentItemService.getType(this.item) === EquipmentItemType.CAMERA &&
      (this.item as CameraInterface).type === CameraType.DSLR_MIRRORLESS;
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
        this.model.confirmUnambiguous &&
        this.model.confirmNoPersonalInformation &&
        this.model.confirmEnglish
      );
    }

    return (
      this.model.confirmNoTypos &&
      this.model.confirmNoDuplication &&
      this.model.confirmNamingConvention &&
      this.model.confirmUnambiguous
    );
  }
}
