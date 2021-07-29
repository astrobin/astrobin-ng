import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { GearApiService } from "@shared/services/api/classic/astrobin/gear/gear-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { filter, map, switchMap, tap } from "rxjs/operators";
import { EquipmentItemBaseInterface } from "@features/equipment/interfaces/equipment-item-base.interface";
import { TitleService } from "@shared/services/title/title.service";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { of } from "rxjs";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { MigrationFlag } from "@shared/services/api/classic/astrobin/migratable-gear-item.service-interface";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { Store } from "@ngrx/store";
import { EquipmentActionTypes, FindAll, FindAllSuccess, LoadBrand } from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { selectBrands, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { HttpStatusCode } from "@angular/common/http";

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

  markAsWrongType(object: any) {
    this._applyMigration(object, [object.pk, MigrationFlag.WRONG_TYPE], "wrong type");
  }

  markAsMultiple(object: any) {
    this._applyMigration(object, [object.pk, MigrationFlag.MULTIPLE_ITEMS], "multiple items");
  }

  markAsDIY(object: any) {
    this._applyMigration(object, [object.pk, MigrationFlag.DIY], "DIY");
  }

  beginMigration(object: any) {
    this.migration.inProgress = true;
  }

  confirmMigration(object: any) {
    this._applyMigration(object, [object.pk, MigrationFlag.MIGRATE], "ready to migrate");
  }

  cancelMigration() {
    this.migration.inProgress = false;
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
      tap(items => {
        items.forEach(item => this.store$.dispatch(new LoadBrand({ id: item.brand })));
        return items;
      }),
      switchMap(items =>
        this.store$.select(selectBrands).pipe(
          filter(brands => brands && brands.length > 0),
          map(brands => ({
            brands,
            items
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

  _applyMigration(object: any, setMigrateArgs: any[], markedAs: string) {
    this.loadingService.setLoading(true);
    this.store$
      .select(selectEquipmentItem, this.selectedMigrationItem)
      .pipe(switchMap(item => this.legacyGearApi.setMigration.apply(this.legacyGearApi, setMigrateArgs)))
      .subscribe(
        () => {
          this.loadingService.setLoading(false);
          this.migration.inProgress = false;
          this.skip();
          this.popNotificationsService.success(
            `Good job! Item <strong>${object.make} ${object.name}</strong> marked as <strong>${markedAs}</strong>! Do another one now! 😃`,
            null,
            {
              enableHtml: true
            }
          );
        },
        error => {
          this._operationError(error);
        }
      );
  }

  _operationError(error) {
    let skip = false;

    this.loadingService.setLoading(false);

    let message: string;

    if (error.status === HttpStatusCode.Conflict) {
      message = "This object was already processed by someone else at the same time. We'll get you another one!";
      skip = true;
    } else {
      message = `Sorry, something went wrong: <em>${error.message}</em>`;
    }

    this.popNotificationsService.error(message, null, {
      enableHtml: true
    });

    if (skip) {
      this.skip();
    }
  }
}
