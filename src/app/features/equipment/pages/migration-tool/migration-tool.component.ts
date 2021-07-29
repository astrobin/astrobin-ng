import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { GearApiService } from "@shared/services/api/classic/astrobin/gear/gear-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { map, switchMap, tap } from "rxjs/operators";
import {
  EquipmentItemBaseInterface,
  equipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { TitleService } from "@shared/services/title/title.service";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { forkJoin, of } from "rxjs";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { MigrationFlag } from "@shared/services/api/classic/astrobin/migratable-gear-item.service-interface";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { Store } from "@ngrx/store";
import { EquipmentActionTypes, FindAll, FindAllSuccess } from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";

@Component({
  selector: "astrobin-migration-tool",
  templateUrl: "./migration-tool.component.html",
  styleUrls: ["./migration-tool.component.scss"]
})
export class MigrationToolComponent implements OnInit, AfterViewInit {
  @ViewChild("equipmentItemOptionTemplate")
  equipmentItemOptionTemplate: TemplateRef<any>;

  title = "Legacy equipment migration tool";
  randomNonMigrated$ = this.legacyGearApi.getRandomNonMigrated();
  migration: {
    inProgress: boolean;
    model: Partial<EquipmentItemBaseInterface>;
    form: FormGroup;
    fields: FormlyFieldConfig[];
  } = {
    inProgress: false,
    model: {},
    form: new FormGroup({}),
    fields: null
  };

  constructor(
    public readonly store$: Store,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly legacyGearApi: GearApiService,
    public readonly titleService: TitleService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly utilsService: UtilsService,
    public readonly popNotificationsService: PopNotificationsService
  ) {}

  get selectedMigrationItem(): number | undefined {
    if (this.migration.form.value.hasOwnProperty("equipment-item") && !!this.migration.form.value["equipment-item"]) {
      return this.migration.form.value["equipment-item"];
    }
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
  }

  ngAfterViewInit() {
    this.migration.fields = [
      {
        key: "equipment-item",
        type: "ng-select",
        id: "equipment-item-field",
        templateOptions: {
          required: true,
          clearable: true,
          label: "Migrate to",
          options: of([]),
          onSearch: (event: { term: string; items: EquipmentItemBaseInterface[] }) => {
            this._onMigrationSearch(event);
          },
          optionTemplate: this.equipmentItemOptionTemplate
        }
      }
    ];
  }

  skip() {
    this.loadingService.setLoading(true);
    this.randomNonMigrated$ = this.legacyGearApi
      .getRandomNonMigrated()
      .pipe(tap(() => this.loadingService.setLoading(false)));
  }

  markAsMultiple(object: any) {
    // TODO: implement
  }

  markAsDIY(object: any) {
    // TODO: implement
  }

  beginMigration(object: any) {
    this.migration.inProgress = true;
  }

  confirmMigration(object: any) {
    this.loadingService.setLoading(true);
    this.legacyGearApi
      .setMigration(object.id, MigrationFlag.MIGRATE, equipmentItemType(object.item), this.selectedMigrationItem)
      .subscribe(() => {
        this.loadingService.setLoading(false);
        this.popNotificationsService.success(
          `Item <strong>${object.make} ${object.name}</strong> marked for migration! Do another one now! 😃`
        );
      });
  }

  _onMigrationSearch(event: { term: string; items: EquipmentItemBaseInterface[] }) {
    const q = event.term;

    if (!q || q.length < 3) {
      return of([]);
    }

    const field = this.migration.fields.find(f => f.key === "equipment-item");
    this.store$.dispatch(new FindAll({ q }));
    field.templateOptions.options = this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_ALL_SUCCESS),
      map((action: FindAllSuccess) => action.payload.items),
      switchMap(items =>
        forkJoin(items.map(item => this.equipmentApiService.getBrand(item.brand))).pipe(
          map(brands => ({
            brands: this.utilsService.arrayUniqueObjects(brands),
            items: this.utilsService.arrayUniqueObjects(items)
          }))
        )
      ),
      map((result: { brands: BrandInterface[]; items: EquipmentItemBaseInterface[] }) =>
        result.items.map(item => {
          const brand = result.brands.find(b => b.id === item.brand);
          return {
            value: item.id,
            label: `${brand.name} ${item.name}`,
            brand,
            item
          };
        })
      )
    );
  }
}
