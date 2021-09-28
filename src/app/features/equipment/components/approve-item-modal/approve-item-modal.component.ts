import { Component, Input, OnInit } from "@angular/core";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { FormGroup } from "@angular/forms";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { LoadingService } from "@shared/services/loading.service";
import { map, take } from "rxjs/operators";
import {
  ApproveEquipmentItem,
  EquipmentActionTypes,
  FindSimilarInBrand,
  FindSimilarInBrandSuccess
} from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { Observable } from "rxjs";

@Component({
  selector: "astrobin-approve-item-modal",
  templateUrl: "./approve-item-modal.component.html",
  styleUrls: ["./approve-item-modal.component.scss"]
})
export class ApproveItemModalComponent extends BaseComponentDirective implements OnInit {
  fields: FormlyFieldConfig[];
  form: FormGroup = new FormGroup({});
  model: {
    comment?: string;
  } = {
    comment: null
  };

  @Input()
  equipmentItem: EquipmentItemBaseInterface;

  similarItemsPreamble: string;
  similarItems$: Observable<EquipmentItemBaseInterface[]>;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly modal: NgbActiveModal,
    public readonly equipmentItemService: EquipmentItemService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this.fields = [
      {
        key: "comment",
        type: "textarea",
        id: "comment",
        wrappers: ["default-wrapper"],
        templateOptions: {
          label: this.translateService.instant("Comment"),
          required: false,
          rows: 4
        }
      }
    ];

    this.similarItemsPreamble =
      this.translateService.instant("We found the following similar items from the same brand.") +
      " " +
      this.translateService.instant("Please DO NOT approve this item if it's a duplicate of another one!");

    this._findSimilarItems();
  }

  approve() {
    this.loadingService.setLoading(true);

    const comment: string = this.form.get("comment").value;

    this.store$.dispatch(
      new ApproveEquipmentItem({
        item: this.equipmentItem,
        comment
      })
    );

    this.actions$.pipe(ofType(EquipmentActionTypes.APPROVE_EQUIPMENT_ITEM_SUCCESS), take(1)).subscribe(() => {
      this.loadingService.setLoading(false);
      this.modal.close();
    });
  }

  private _findSimilarItems() {
    const type: EquipmentItemType = this.equipmentItemService.getType(this.equipmentItem);

    this.store$.dispatch(new FindSimilarInBrand({ brand: this.equipmentItem.brand, q: this.equipmentItem.name, type }));
    this.similarItems$ = this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_SIMILAR_IN_BRAND_SUCCESS),
      map((action: FindSimilarInBrandSuccess) => action.payload.items),
      take(1)
    );
  }
}
