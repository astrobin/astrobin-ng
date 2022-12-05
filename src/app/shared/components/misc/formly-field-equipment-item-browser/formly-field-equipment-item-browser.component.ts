import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
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
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";

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
  recentUsed = false;
  hasRecent = false;

  noRecentMessage: string = this.translateService.instant(
    "You don't have any recently used items in this class. Please find your equipment using the input box above, " +
    "and the next time you edit an image, they will available for quick selection here. PS: you can also save/load " +
    "presets to make it easier to add equipment next time! Look for the preset buttons at the end of this form."
  );

  allRecentUsedMessage: string = this.translateService.instant(
    "All your recent items of this equipment class are already used above."
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  get value(): EquipmentItem["id"] | EquipmentItem["id"][] {
    const value = this.formControl.value;

    if (!this.formControl.value) {
      return this.to.multiple ? [] : null;
    }

    return value;
  }

  ngOnInit() {
    this._loadRecent();
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

  onValueChanged(value: EquipmentItem | EquipmentItem[]) {
    this._loadRecent();

    if (!value) {
      if (!!this.formControl.value) {
        this.formControl.markAsTouched();
        this.formControl.markAsDirty();
      }

      this.formControl.setValue(this.to.multiple ? [] : null);
      return;
    }

    if (this.to.multiple) {
      const values = (value as EquipmentItem[]).map(x => x.id);
      const formValues = this.formControl.value as EquipmentItem[];

      if (JSON.stringify([...values].sort()) !== JSON.stringify([...formValues].sort())) {
        this.formControl.markAsTouched();
        this.formControl.markAsDirty();
      }

      this.formControl.setValue(values);
    } else {
      const id = (value as EquipmentItem).id;
      if (id !== this.formControl.value) {
        this.formControl.markAsTouched();
        this.formControl.markAsDirty();
      }

      this.formControl.setValue(id);
    }
  }

  quickAddItem(item: EquipmentItemBaseInterface) {
    this.store$.dispatch(new ItemBrowserAdd({ type: this.to.itemType, usageType: this.to.usageType, item }));
    this.recentUsed = true;
  }

  _loadRecent(): void {
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
          if (this.to.multiple) {
            this.recent = items.filter(x => (this.value as EquipmentItem["id"][]).indexOf(x.id) === -1);
          } else {
            this.recent = items.filter(x => x.id !== this.value);
          }
          this.recentLoaded = true;
          this.changeDetectorRef.detectChanges();
        });
    }
  }
}
