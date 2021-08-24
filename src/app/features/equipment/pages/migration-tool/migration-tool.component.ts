import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { GearApiService } from "@shared/services/api/classic/astrobin/gear/gear-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { filter, map, switchMap, takeUntil, tap } from "rxjs/operators";
import {
  EquipmentItemBaseInterface,
  equipmentItemType,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { TitleService } from "@shared/services/title/title.service";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { EMPTY, Observable, of } from "rxjs";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { MigrationFlag } from "@shared/services/api/classic/astrobin/migratable-gear-item.service-interface";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { Store } from "@ngrx/store";
import {
  EquipmentActionTypes,
  FindAllEquipmentItems,
  FindAllEquipmentItemsSuccess,
  LoadBrand
} from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { selectBrands, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { HttpStatusCode } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import { CameraApiService } from "@shared/services/api/classic/astrobin/camera/camera-api.service";
import { TelescopeApiService } from "@shared/services/api/classic/astrobin/telescope/telescope-api.service";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TranslateService } from "@ngx-translate/core";
import { WindowRefService } from "@shared/services/window-ref.service";

@Component({
  selector: "astrobin-migration-tool",
  templateUrl: "./migration-tool.component.html",
  styleUrls: ["./migration-tool.component.scss"]
})
export class MigrationToolComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  @ViewChild("equipmentItemOptionTemplate")
  equipmentItemOptionTemplate: TemplateRef<any>;

  title = "Legacy equipment migration tool";
  activeType = this.activatedRoute.snapshot.paramMap.get("itemType");
  randomNonMigrated$ = this.getRandomNonMigrated$();

  migration: {
    inProgress: boolean;
    model: Partial<EquipmentItemBaseInterface>;
    form: FormGroup;
    fields: FormlyFieldConfig[];
    q: string;
  } = {
    inProgress: false,
    model: {},
    form: new FormGroup({}),
    fields: null,
    q: null
  };

  creation: {
    inProgress: boolean;
    form: FormGroup;
  } = {
    inProgress: false,
    form: new FormGroup({})
  };

  constructor(
    public readonly store$: Store,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly loadingService: LoadingService,
    public readonly legacyGearApi: GearApiService,
    public readonly legacyCameraApi: CameraApiService,
    public readonly legacyTelescopeApi: TelescopeApiService,
    public readonly titleService: TitleService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService
  ) {
    super();
  }

  get selectedMigrationItem(): number | undefined {
    if (this.migration.form.value.hasOwnProperty("equipment-item") && !!this.migration.form.value["equipment-item"]) {
      return this.migration.form.value["equipment-item"];
    }
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.title);
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translateService.instant("Equipment")
          },
          {
            label: "Migrate legacy"
          }
        ]
      })
    );
    this.router.events.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.activeType = this.activatedRoute.snapshot.paramMap.get("itemType");
      this.skip();
    });
  }

  ngAfterViewInit() {
    this.migration.fields = [
      {
        key: "equipment-item",
        type: "ng-select",
        id: "equipment-item-field",
        expressionProperties: {
          "templateOptions.disabled": () => this.creation.inProgress
        },
        templateOptions: {
          required: true,
          clearable: true,
          label: "Migrate to",
          options: of([]),
          onSearch: (event: { term: string; items: EquipmentItemBaseInterface[] }) => {
            this._onMigrationSearch(event);
          },
          optionTemplate: this.equipmentItemOptionTemplate,
          addTag: () => {
            this.creation.inProgress = true;
            setTimeout(() => {
              this.windowRefService.nativeWindow.document
                .getElementById("create-new-item")
                .scrollIntoView({ behavior: "smooth" });
            }, 1);
          }
        }
      }
    ];
  }

  getRandomNonMigrated$(): Observable<any[]> {
    const itemType = this.activatedRoute.snapshot.paramMap.get("itemType");
    let api;

    switch (itemType.toLowerCase()) {
      case EquipmentItemType.CAMERA.toLowerCase():
        api = this.legacyCameraApi;
        break;
      case EquipmentItemType.TELESCOPE.toLowerCase():
        api = this.legacyTelescopeApi;
        break;
      default:
        this.popNotificationsService.error("Wrong item type requested.");
    }

    if (api) {
      return new Observable<any[]>(observer => {
        api
          .getRandomNonMigrated()
          .pipe(
            switchMap((items: any[]) => {
              if (items && items.length === 1) {
                return this.legacyGearApi.lockForMigration(items[0].pk).pipe(map(() => items));
              }

              return of(items);
            })
          )
          .subscribe(items => {
            observer.next(items);
            observer.complete();
          });
      });
    }

    return EMPTY;
  }

  skip() {
    this.loadingService.setLoading(true);
    this.randomNonMigrated$ = this.getRandomNonMigrated$().pipe(tap(() => this.loadingService.setLoading(false)));
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
    setTimeout(() => {
      this.windowRefService.nativeWindow.document
        .getElementById("select-item-to-migrate-to")
        .scrollIntoView({ behavior: "smooth" });
    }, 1);
  }

  confirmMigration(object: any) {
    this.store$.select(selectEquipmentItem, this.selectedMigrationItem).subscribe(item => {
      this._applyMigration(
        object,
        [object.pk, MigrationFlag.MIGRATE, equipmentItemType(item), item.id],
        "ready to migrate"
      );
    });
  }

  cancelMigration() {
    this.migration.inProgress = false;
  }

  cancelItemCreation() {
    this.creation.inProgress = false;
  }

  _onMigrationSearch(event: { term: string; items: EquipmentItemBaseInterface[] }) {
    this.migration.q = event.term;

    if (!this.migration.q || this.migration.q.length < 3) {
      return of([]);
    }

    const field = this.migration.fields.find(f => f.key === "equipment-item");
    this.store$.dispatch(
      new FindAllEquipmentItems({
        q: this.migration.q,
        type: EquipmentItemType[this.activatedRoute.snapshot.paramMap.get("itemType").toUpperCase()]
      })
    );
    field.templateOptions.options = this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_ALL_EQUIPMENT_ITEMS_SUCCESS),
      map((action: FindAllEquipmentItemsSuccess) => action.payload.items),
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
    this.legacyGearApi.setMigration.apply(this.legacyGearApi, setMigrateArgs).subscribe(
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
