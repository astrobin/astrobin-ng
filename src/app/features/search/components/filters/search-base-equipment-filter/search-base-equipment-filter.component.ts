import { Component } from "@angular/core";
import { SearchBaseFilterComponent } from "@features/search/components/filters/search-base-filter/search-base-filter.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { SearchAutoCompleteType, SearchService } from "@features/search/services/search.service";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { filter, map, take } from "rxjs/operators";
import { forkJoin, Observable } from "rxjs";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { UtilsService } from "@shared/services/utils/utils.service";
import { Actions, ofType } from "@ngrx/effects";
import { EquipmentActionTypes, LoadEquipmentItem, LoadEquipmentItemSuccess } from "@features/equipment/store/equipment.actions";
import { MatchType } from "@features/search/enums/match-type.enum";

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
    public readonly searchService: SearchService,
    public readonly actions$: Actions
  ) {
    super(
      store$,
      translateService,
      domSanitizer,
      modalService,
      searchService
    );
  }

  initFields(key: SearchAutoCompleteType): void {
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
                return this.value?.value?.length <= 1 ? "mb-0" : "";
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
          this.getMatchTypeField(`${key}.value`)
        ]
      }
    ];
  }

  valueTransformer: (value: {value: EquipmentItem["id"][], matchType: MatchType}) => Observable<{
    value: {
      id: EquipmentItem["id"];
      name: string
    }[],
    matchType: MatchType
  }> = value => {
    return new Observable<{
      value: {
        id: EquipmentItem["id"];
        name: string
      }[],
      matchType: MatchType
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
          matchType: value.matchType
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
    if (!this.value) {
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
