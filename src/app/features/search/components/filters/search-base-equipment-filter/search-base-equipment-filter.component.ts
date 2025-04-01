import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { EquipmentItemType, EquipmentItemUsageType } from "@features/equipment/types/equipment-item-base.interface";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { filter, map, take } from "rxjs/operators";
import { forkJoin, Observable } from "rxjs";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { UtilsService } from "@core/services/utils/utils.service";
import { Actions, ofType } from "@ngrx/effects";
import { EquipmentActionTypes, LoadEquipmentItem, LoadEquipmentItemSuccess } from "@features/equipment/store/equipment.actions";
import { MatchType } from "@features/search/enums/match-type.enum";
import { SearchFilterService } from "@features/search/services/search-filter.service";
import { SearchAutoCompleteType } from "@features/search/enums/search-auto-complete-type.enum";

@Component({
  selector: "astrobin-search-base-equipment-filter.search-filter-component",
  template: ""
})
export abstract class SearchBaseEquipmentFilterComponent extends SearchBaseFilterComponent {
  abstract readonly itemType: EquipmentItemType;
  editFields: FormlyFieldConfig[];

  protected constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly domSanitizer: DomSanitizer,
    public readonly modalService: NgbModal,
    public readonly searchFilterService: SearchFilterService,
    public readonly actions$: Actions
  ) {
    super(
      store$,
      translateService,
      domSanitizer,
      modalService,
      searchFilterService
    );
  }

  initFields(key: SearchAutoCompleteType, supportsExactMatch = false, supportsUsageType = false): void {
    this.editFields = [
      {
        key,
        fieldGroup: [
          {
            key: "value",
            type: "equipment-item-browser",
            wrappers: ["default-wrapper"],
            expressions: {
              className: () => {
                if (supportsExactMatch) {
                  return this.value?.value.length === 0 ? "mb-0" : "";
                } else {
                  return this.value?.value?.length <= 1 ? "mb-0" : "";
                }
              }
            },
            props: {
              required: false,
              hideOptionalMarker: true,
              multiple: true,
              itemType: this.itemType,
              enableCreation: false,
              enableFullscreen: false,
              enableSelectFrozen: true
            },
            hooks: {
              onInit: (field: FormlyFieldConfig) => {
                const value: { id: EquipmentItem["id"]; name: string }[] = field.formControl.value;
                if (UtilsService.isArray(value)) {
                  field.formControl.setValue(value.map(x => x.id), { emitEvent: false });
                }
              }
            }
          },
          {
            key: "usageType",
            type: "ng-select",
            wrappers: ["default-wrapper"],
            hide: !supportsUsageType,
            props: {
              label: this.translateService.instant("Usage type"),
              options: [
                {
                  value: EquipmentItemUsageType.IMAGING,
                  label: this.translateService.instant("Imaging")
                },
                {
                  value: EquipmentItemUsageType.GUIDING,
                  label: this.translateService.instant("Guiding")
                },
                {
                  value: EquipmentItemUsageType.ANY,
                  label: this.translateService.instant("Any")
                }
              ],
              searchable: false,
              clearable: false,
              required: true,
              hideRequiredMarker: true
            },
            hooks: {
              onInit: (field: FormlyFieldConfig) => {
                if (this.value === null || this.value.usageType === undefined) {
                  field.formControl.setValue(EquipmentItemUsageType.IMAGING, { emitEvent: false });
                }
              }
            }
          },
          {
            key: "exactMatch",
            type: "toggle",
            wrappers: ["default-wrapper"],
            expressions: {
              className: () => {
                let value = this.editForm.get(key).value.value;
                return (
                  !value ||
                  value?.length > 1 ||
                  value?.length === 0 ||
                  !supportsExactMatch ||
                  (
                    supportsUsageType &&
                    this.editForm.get(key).value.usageType !== EquipmentItemUsageType.IMAGING
                  )
                ) ? "d-none" : "";
              }
            },
            props: {
              toggleLabel: this.translateService.instant("Exact match"),
              description: this.translateService.instant(
                "Only images that use exactly these items (images featuring additional equipment of the same type" +
                " will be excluded)."
              ),
            }
          },
          this.getMatchTypeField(`${key}.value`, undefined, supportsExactMatch)
        ]
      }
    ];
  }

  readonly valueTransformer: (value: {
    value: EquipmentItem["id"][],
    exactMatch: boolean,
    matchType: MatchType,
    usageType?: boolean
  }) => Observable<{
    value: {
      id: EquipmentItem["id"];
      name: string
    }[],
    exactMatch: boolean,
    matchType: MatchType,
    usageType?: boolean
  }> = value => {
    return new Observable<{
      value: {
        id: EquipmentItem["id"];
        name: string
      }[],
      exactMatch: boolean,
      matchType: MatchType,
      usageType?: boolean
    }>(observer => {
      const observables$ = value.value.map((id: EquipmentItem["id"]) =>
        this.actions$.pipe(
          ofType(EquipmentActionTypes.LOAD_EQUIPMENT_ITEM_SUCCESS),
          map((action: LoadEquipmentItemSuccess) => action.payload.item),
          filter((item: EquipmentItem) => item.id === id && item.klass === this.itemType),
          take(1)
        )
      );

      forkJoin(observables$).pipe(take(1)).subscribe((equipmentItems: EquipmentItem[]) => {
        const newValue = {
          value: equipmentItems.map(equipmentItem => ({
            id: equipmentItem.id,
            name: (
              equipmentItem.brandName || `(${this.translateService.instant("DIY")})`
            ) + " " + equipmentItem.name
          })),
          exactMatch: value.exactMatch,
          matchType: value.matchType,
          usageType: value.usageType
        };
        observer.next(newValue);
        observer.complete();
      });

      value.value.forEach(
        (id: EquipmentItem["id"]) => this.store$.dispatch(new LoadEquipmentItem({
          id,
          type: this.itemType
        }))
      );
    });
  };

  render(): SafeHtml {
    if (!this.value || !this.value.value) {
      return this.domSanitizer.bypassSecurityTrustHtml("...");
    }

    if (this.value.value.length === 0) {
      return this.domSanitizer.bypassSecurityTrustHtml("...");
    }

    if (this.value.value?.length === 1) {
      return this.domSanitizer.bypassSecurityTrustHtml(
        this.value?.value[0].name || "..."
      );
    }

    const names = this.value.value.map(item => item.name);
    return this.domSanitizer.bypassSecurityTrustHtml(
      names.map((name: string) => name || "...").join(", ")
    );
  }
}
