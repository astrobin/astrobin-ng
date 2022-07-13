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
  ItemBrowserAdd,
  LoadEquipmentItem
} from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { filter, map, take } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { UtilsService } from "@shared/services/utils/utils.service";
import { Observable, of } from "rxjs";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { selectEquipmentItem, selectEquipmentItems } from "@features/equipment/store/equipment.selectors";

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

  noRecentMessage: string = this.translateService.instant(
    "You don't have any recently used items in this class. Please find your equipment using the input box above, " +
      "and the next time you edit an image, they will available for quick selection here. PS: you can also save/load " +
      "presets to make it easier to add equipment next time! Look for the preset buttons at the end of this form."
  );

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

  get initialValue$(): Observable<EquipmentItem | EquipmentItem[]> {
    const value = this.formControl.value;

    if (!this.formControl.value) {
      return of(this.to.multiple ? [] : null);
    }

    if (this.to.multiple) {
      if (UtilsService.isObject(value[0])) {
        return of(value);
      } else {
        for (const id of value) {
          this.store$.dispatch(new LoadEquipmentItem({ type: this.to.itemType, id }));
        }

        return this.store$.select(selectEquipmentItems).pipe(
          filter(items => items.length > 0),
          map(items => items.filter(item => item.klass === this.to.itemType && value.indexOf(item.id) > -1)),
          take(1)
        );
      }
    } else {
      if (UtilsService.isObject(value)) {
        return of(value);
      } else {
        const payload = { type: this.to.itemType, id: value };
        this.store$.dispatch(new LoadEquipmentItem(payload));
        return this.store$.select(selectEquipmentItem, payload).pipe(
          filter(item => !item),
          take(1)
        );
      }
    }
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
    if (JSON.stringify(value) !== JSON.stringify(this.formControl.value)) {
      this.formControl.markAsTouched();
      this.formControl.markAsDirty();
    }

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
  }

  quickAddItem(item: EquipmentItemBaseInterface) {
    this.store$.dispatch(new ItemBrowserAdd({ type: this.to.itemType, usageType: this.to.usageType, item }));
  }
}
