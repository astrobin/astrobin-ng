import { Component, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/core";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType,
  EquipmentItemUsageType
} from "@features/equipment/types/equipment-item-base.interface";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import {
  EquipmentActionTypes,
  FindRecentlyUsedEquipmentItems,
  FindRecentlyUsedEquipmentItemsSuccess,
  ItemBrowserAdd
} from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { filter, map, take } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { UtilsService } from "@shared/services/utils/utils.service";

export enum FormlyFieldEquipmentItemBrowserMode {
  ID,
  OBJECT
}

@Component({
  selector: "astrobin-formly-field-equipment-item-browser",
  templateUrl: "./formly-field-equipment-item-browser.component.html",
  styleUrls: ["./formly-field-equipment-item-browser.component.scss"]
})
export class FormlyFieldEquipmentItemBrowserComponent extends FieldType implements OnInit {
  EquipmentItemType: typeof EquipmentItemType = EquipmentItemType;
  EquipmentItemUsageType: typeof EquipmentItemUsageType = EquipmentItemUsageType;

  recent: EquipmentItemBaseInterface[] = [];
  recentLoaded = false;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService
  ) {
    super();
  }

  ngOnInit() {
    if (this.to.showQuickAddRecent) {
      this.store$.dispatch(
        new FindRecentlyUsedEquipmentItems({
          type: this.to.itemType,
          usageType: this.to.usageType
        })
      );
      this.actions$
        .pipe(
          ofType(EquipmentActionTypes.FIND_RECENTLY_USED_EQUIPMENT_ITEMS_SUCCESS),
          map((action: FindRecentlyUsedEquipmentItemsSuccess) => action.payload),
          filter(payload => payload.type === this.to.itemType && payload.usageType === this.to.usageType),
          take(1),
          map(payload => payload.items)
        )
        .subscribe(items => {
          this.recent = items;
          this.recentLoaded = true;
        });
    }
  }

  get initialValue() {
    if (this.to.mode === FormlyFieldEquipmentItemBrowserMode.ID) {
      return this.formControl.value;
    }

    if (!this.formControl.value) {
      return null;
    }

    if (this.to.multiple) {
      return this.formControl.value.map(value => value.id);
    }

    return this.formControl.value.id;
  }

  onCreationModeStarted() {
    if (this.to.creationModeStarted && UtilsService.isFunction(this.to.creationModeStarted)) {
      this.to.creationModeStarted();
    }
  }

  onCreationModeEnded() {
    if (this.to.creationModeEnded && UtilsService.isFunction(this.to.creationModeEnded)) {
      this.to.creationModeEnded();
    }
  }

  onValueChanged(value: EquipmentItemBaseInterface | EquipmentItemBaseInterface[]) {
    if (this.to.multiple) {
      const arrayValue = value as EquipmentItemBaseInterface[];

      if (arrayValue.length > 0) {
        this.formControl.setValue(
          this.to.mode === FormlyFieldEquipmentItemBrowserMode.ID ? arrayValue.map(item => item.id) : arrayValue
        );
      } else {
        this.formControl.setValue([]);
      }
    } else {
      const singleValue = value as EquipmentItemBaseInterface;

      if (!!singleValue) {
        this.formControl.setValue(
          this.to.mode === FormlyFieldEquipmentItemBrowserMode.ID ? singleValue.id : singleValue
        );
      } else {
        this.formControl.setValue(null);
      }
    }

    this.formControl.markAsTouched();
    this.formControl.markAsDirty();
  }

  quickAddItem(item: EquipmentItemBaseInterface) {
    this.store$.dispatch(new ItemBrowserAdd({ type: this.to.itemType, usageType: this.to.usageType, item }));
  }
}
