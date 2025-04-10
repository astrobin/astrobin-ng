import { ChangeDetectorRef, OnInit, Component, EventEmitter, Output } from "@angular/core";
import { MainState } from "@app/store/state";
import { UtilsService } from "@core/services/utils/utils.service";
import {
  EquipmentActionTypes,
  FindRecentlyUsedEquipmentItems,
  ItemBrowserAdd,
  FindRecentlyUsedEquipmentItemsSuccess
} from "@features/equipment/store/equipment.actions";
import {
  EquipmentItemType,
  EquipmentItemUsageType,
  EquipmentItemBaseInterface
} from "@features/equipment/types/equipment-item-base.interface";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { ofType, Actions } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { FieldType } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { ItemBrowserLayout } from "@shared/components/equipment/item-browser/item-browser.component";
import { filter, map, take } from "rxjs/operators";

@Component({
  selector: "astrobin-formly-field-equipment-item-browser",
  templateUrl: "./formly-field-equipment-item-browser.component.html",
  styleUrls: ["./formly-field-equipment-item-browser.component.scss"]
})
export class FormlyFieldEquipmentItemBrowserComponent extends FieldType implements OnInit {
  readonly EquipmentItemType: typeof EquipmentItemType = EquipmentItemType;
  readonly EquipmentItemUsageType: typeof EquipmentItemUsageType = EquipmentItemUsageType;
  readonly ItemBrowserLayout: typeof ItemBrowserLayout = ItemBrowserLayout;

  @Output()
  itemTypeChanged = new EventEmitter<EquipmentItemType>();

  recent: EquipmentItemBaseInterface[] = [];
  recentLoaded = false;
  recentUsed = false;

  noRecentMessage: string = this.translateService.instant("You don't have any recently used items in this class.");

  allRecentUsedMessage: string = this.translateService.instant(
    "All your recent items of this equipment class are already used above."
  );

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly translateService: TranslateService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  get value(): EquipmentItem["id"] | EquipmentItem["id"][] {
    const value = this.formControl.value;

    if (!this.formControl.value) {
      return this.props.multiple ? [] : null;
    }

    return value;
  }

  ngOnInit() {
    this._loadRecent();
  }

  onCreationModeStarted() {
    if (this.props.creationModeStarted && UtilsService.isFunction(this.props.creationModeStarted)) {
      this.props.creationModeStarted();
    }
  }

  onCreationModeEnded() {
    if (this.props.creationModeEnded && UtilsService.isFunction(this.props.creationModeEnded)) {
      this.props.creationModeEnded();
    }
  }

  onValueChanged(value: EquipmentItem | EquipmentItem[]) {
    this._loadRecent();

    if (!value) {
      if (!!this.formControl.value) {
        this.formControl.markAsTouched();
        this.formControl.markAsDirty();
      }

      this.formControl.setValue(this.props.multiple ? [] : null);
      return;
    }

    if (this.props.multiple) {
      const values = (value as EquipmentItem[]).map(x => x.id);
      const formValues = (this.formControl.value || []) as EquipmentItem[];

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
    this.store$.dispatch(
      new ItemBrowserAdd({
        type: this.props.itemType,
        usageType: this.props.usageType,
        item,
        componentId: this.props.componentId
      })
    );
    this.recentUsed = true;
  }

  _loadRecent(): void {
    if (this.props.quickAddRecentFromUserId) {
      this.store$.dispatch(
        new FindRecentlyUsedEquipmentItems({
          type: this.props.itemType,
          usageType: this.props.usageType,
          userId: this.props.quickAddRecentFromUserId
        })
      );
      this.actions$
        .pipe(
          ofType(EquipmentActionTypes.FIND_RECENTLY_USED_EQUIPMENT_ITEMS_SUCCESS),
          map((action: FindRecentlyUsedEquipmentItemsSuccess) => action.payload),
          filter(payload => payload.type === this.props.itemType && payload.usageType === this.props.usageType),
          take(1),
          map(payload => payload.items)
        )
        .subscribe(items => {
          if (this.props.multiple) {
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
