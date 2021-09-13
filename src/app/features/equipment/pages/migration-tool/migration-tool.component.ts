import { AfterViewInit, Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { GearApiService } from "@shared/services/api/classic/astrobin/gear/gear-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { filter, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { TitleService } from "@shared/services/title/title.service";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { EMPTY, forkJoin, Observable, of } from "rxjs";
import { BrandInterface } from "@features/equipment/interfaces/brand.interface";
import { MigrationFlag } from "@shared/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { Action, Store } from "@ngrx/store";
import {
  CreateCamera,
  CreateSensor,
  EquipmentActionTypes,
  EquipmentItemCreationSuccessPayloadInterface,
  FindAllEquipmentItems,
  FindAllEquipmentItemsSuccess,
  LoadBrand
} from "@features/equipment/store/equipment.actions";
import { Actions, ofType } from "@ngrx/effects";
import { selectBrand, selectBrands, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { HttpStatusCode } from "@angular/common/http";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { CameraApiService } from "@shared/services/api/classic/astrobin/camera/camera-api.service";
import { TelescopeApiService } from "@shared/services/api/classic/astrobin/telescope/telescope-api.service";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TranslateService } from "@ngx-translate/core";
import { WindowRefService } from "@shared/services/window-ref.service";
import { State } from "@app/store/state";
import { SensorInterface } from "@features/equipment/interfaces/sensor.interface";
import { CameraInterface } from "@features/equipment/interfaces/camera.interface";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { ConfirmItemCreationModalComponent } from "@features/equipment/components/confirm-item-creation-modal/confirm-item-creation-modal.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { GearService } from "@shared/services/gear/gear.service";

@Component({
  selector: "astrobin-migration-tool",
  templateUrl: "./migration-tool.component.html",
  styleUrls: ["./migration-tool.component.scss"]
})
export class MigrationToolComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  @ViewChild("equipmentItemOptionTemplate")
  equipmentItemOptionTemplate: TemplateRef<any>;

  title = "Migration tool";
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

  migrationConfirmation: {
    inProgress: boolean;
    model: boolean[];
    form: FormGroup;
    fields: FormlyFieldConfig[];
    similarItems: any[];
  } = {
    inProgress: false,
    model: [],
    form: new FormGroup({}),
    fields: null,
    similarItems: []
  };

  creation: {
    inProgress: boolean;
    form: FormGroup;
    model: Partial<EquipmentItemBaseInterface>;
  } = {
    inProgress: false,
    form: new FormGroup({}),
    model: {}
  };

  subCreation: {
    inProgress: boolean;
  } = {
    inProgress: false
  };

  // TODO: other types
  nonMigratedCamerasCount$: Observable<number>;

  constructor(
    public readonly store$: Store<State>,
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
    public readonly windowRefService: WindowRefService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly modalService: NgbModal,
    public readonly gearService: GearService
  ) {
    super(store$);
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
            label: this.title
          }
        ]
      })
    );

    this.router.events.pipe(takeUntil(this.destroyed$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeType = this.activatedRoute.snapshot.paramMap.get("itemType");
        this.skip();
      }
    });

    this.nonMigratedCamerasCount$ = this.legacyCameraApi.getNonMigratedCount();
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
          onSearch: (term: string) => {
            this._onMigrationSearch(term);
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

    // TODO: complete
    switch (itemType.toLowerCase()) {
      case EquipmentItemType.CAMERA.toLowerCase():
        api = this.legacyCameraApi;
        break;
      default:
        this.popNotificationsService.error("Wrong item type requested.");
    }

    if (api) {
      return new Observable<any[]>(observer => {
        api
          .getRandomNonMigrated()
          .pipe(
            tap(() => this.loadingService.setLoading(true)),
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
            this.loadingService.setLoading(false);
          });
      });
    }

    return EMPTY;
  }

  skip(object?: any) {
    this.loadingService.setLoading(true);

    const _doSkip = () => {
      this.randomNonMigrated$ = this.getRandomNonMigrated$();
      this.nonMigratedCamerasCount$ = this.legacyCameraApi.getNonMigratedCount();
      this.migration.model = {};
      this.migration.inProgress = false;
      this.migration.form.reset();
      this.migration.fields.find(field => field.key === "equipment-item").templateOptions.options = of([]);
      this.loadingService.setLoading(false);
    };

    if (object) {
      this.legacyGearApi
        .releaseLockForMigration(object.pk)
        .pipe(take(1))
        .subscribe(() => {
          _doSkip();
        });
    } else {
      _doSkip();
    }
  }

  markAsWrongType(event: Event, object: any) {
    event.preventDefault();
    this._applyMigration(object, [object.pk, MigrationFlag.WRONG_TYPE], "wrong type");
  }

  markAsMultiple(event: Event, object: any) {
    event.preventDefault();
    this._applyMigration(object, [object.pk, MigrationFlag.MULTIPLE_ITEMS], "multiple items");
  }

  markAsDIY(event: Event, object: any) {
    event.preventDefault();
    this._applyMigration(object, [object.pk, MigrationFlag.DIY], "DIY");
  }

  markAsNotEnoughInfo(event: Event, object: any) {
    event.preventDefault();
    this._applyMigration(object, [object.pk, MigrationFlag.NOT_ENOUGH_INFO], "not enough info");
  }

  beginMigration(object: any) {
    this.migration.inProgress = true;
    setTimeout(() => {
      const document = this.windowRefService.nativeWindow.document;
      document.getElementById("select-item-to-migrate-to").scrollIntoView({ behavior: "smooth" });
      (document.querySelector("#equipment-item-field .ng-input input") as HTMLElement).focus();
    }, 1);
  }

  beginMigrationConfirmation(object) {
    const itemType = this.activatedRoute.snapshot.paramMap.get("itemType");
    let api;

    // TODO: complete
    switch (itemType.toLowerCase()) {
      case EquipmentItemType.CAMERA.toLowerCase():
        api = this.legacyCameraApi;
        break;
      default:
        this.popNotificationsService.error("Wrong item type requested.");
    }

    if (api) {
      this.loadingService.setLoading(true);
      api
        .getSimilarNonMigrated(object.pk)
        .pipe(
          take(1),
          switchMap((legacyItems: any[]) => {
            this.migrationConfirmation.similarItems = legacyItems;

            if (legacyItems.length === 0) {
              return of(legacyItems);
            }

            return forkJoin(...[legacyItems.map(item => this.legacyGearApi.lockForMigration(item.pk))]).pipe(
              map(() => legacyItems)
            );
          })
        )
        .subscribe(legacyItems => {
          this.loadingService.setLoading(false);

          if (legacyItems.length === 0) {
            this.confirmMigration(object);
          } else {
            this.migrationConfirmation.inProgress = true;
            this.migrationConfirmation.model = legacyItems.map(item => item.pk);
            this.migrationConfirmation.fields = legacyItems.map(item => ({
              key: `similar-item-${item.pk}`,
              type: "checkbox",
              id: `similar-item-${item.pk}`,
              defaultValue: false,
              templateOptions: {
                required: false,
                label: this.gearService.getDisplayName(item.make, item.name),
                value: item.pk
              }
            }));
            setTimeout(() => {
              const document = this.windowRefService.nativeWindow.document;
              document.getElementById("confirm-migration").scrollIntoView({ behavior: "smooth" });
            }, 1);
          }
        });
    }
  }

  resetMigrationConfirmation() {
    this.migrationConfirmation.inProgress = false;
    this.migrationConfirmation.model = [];
    this.migrationConfirmation.form.reset();
  }

  confirmMigration(object: any) {
    const type: EquipmentItemType =
      EquipmentItemType[this.activatedRoute.snapshot.paramMap.get("itemType").toUpperCase()];

    const selectedSimilarItems = this._getSelectedSimilarItems();
    const similarItems = this.migrationConfirmation.similarItems.filter(
      item => selectedSimilarItems.indexOf(item.pk) > -1
    );

    for (const itemToMigrate of [...[object], ...similarItems]) {
      this.store$.select(selectEquipmentItem, { id: this.selectedMigrationItem, type }).subscribe(item => {
        this._applyMigration(
          itemToMigrate,
          [itemToMigrate.pk, MigrationFlag.MIGRATE, type, item.id],
          "ready to migrate"
        );
      });
    }
  }

  cancelMigration() {
    this.migration.inProgress = false;
  }

  resetItemCreation() {
    this.creation.inProgress = false;
    this.creation.model = {};
    this.creation.form.reset();
  }

  createItem() {
    const type: EquipmentItemType =
      EquipmentItemType[this.activatedRoute.snapshot.paramMap.get("itemType").toUpperCase()];
    const data: EquipmentItemBaseInterface = this.creation.form.value;

    const modalRef = this.modalService.open(ConfirmItemCreationModalComponent);
    modalRef.componentInstance.item = data;

    modalRef.closed.pipe(take(1)).subscribe((item: EquipmentItemBaseInterface) => {
      if (item.id === undefined) {
        let action: Action;
        let actionSuccessType: EquipmentActionTypes;

        switch (type) {
          case EquipmentItemType.SENSOR:
            action = new CreateSensor({ sensor: item as SensorInterface });
            actionSuccessType = EquipmentActionTypes.CREATE_SENSOR_SUCCESS;
            break;
          case EquipmentItemType.CAMERA:
            action = new CreateCamera({ camera: item as CameraInterface });
            actionSuccessType = EquipmentActionTypes.CREATE_CAMERA_SUCCESS;
            break;
        }

        if (action) {
          this.loadingService.setLoading(true);
          this.store$.dispatch(action);
          this.actions$
            .pipe(
              ofType(actionSuccessType),
              take(1),
              map((result: { payload: EquipmentItemCreationSuccessPayloadInterface }) => result.payload.item)
            )
            .subscribe((createdItem: EquipmentItemBaseInterface) => {
              this.itemCreated(createdItem);
              this.loadingService.setLoading(false);
            });
        }
      } else {
        this.itemCreated(item);
      }
    });
  }

  itemCreated(item: EquipmentItemBaseInterface) {
    this.resetItemCreation();

    this.store$.dispatch(new LoadBrand({ id: item.brand }));

    this.store$
      .select(selectBrand, item.brand)
      .pipe(
        takeUntil(this.destroyed$),
        filter(brand => !!brand)
      )
      .subscribe(brand => {
        this.migration.fields.find(field => field.key === "equipment-item").templateOptions.options = [
          {
            value: item.id,
            label: `${brand.name} ${item.name}`,
            item
          }
        ];
        this.migration.model = { ...this.migration.model, ...{ "equipment-item": item.id } };
        this.migration.form.get("equipment-item").setValue(item.id);

        setTimeout(() => {
          this.windowRefService.nativeWindow.document
            .querySelector("#equipment-item-field")
            .scrollIntoView({ behavior: "smooth" });
        }, 1);
      });
  }

  _onMigrationSearch(term: string) {
    this.migration.q = term;

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
      takeUntil(this.destroyed$),
      ofType(EquipmentActionTypes.FIND_ALL_EQUIPMENT_ITEMS_SUCCESS),
      map((action: FindAllEquipmentItemsSuccess) => action.payload.items),
      tap(items => {
        const uniqueBrands: BrandInterface["id"][] = [];
        for (const item of items) {
          if (uniqueBrands.indexOf(item.brand) === -1) {
            uniqueBrands.push(item.brand);
          }
        }
        uniqueBrands.forEach(id => this.store$.dispatch(new LoadBrand({ id })));
      }),
      switchMap(items =>
        this.store$.select(selectBrands).pipe(
          filter(brands => brands && brands.length > 0),
          filter(brands => {
            for (const item of items) {
              if (!brands.find(brand => brand.id === item.brand)) {
                return false;
              }
            }

            return true;
          }),
          take(1),
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
    this.legacyGearApi.setMigration
      .apply(this.legacyGearApi, setMigrateArgs)
      .pipe(take(1))
      .subscribe(
        () => {
          this.loadingService.setLoading(false);
          this.migration.inProgress = false;
          this.resetMigrationConfirmation();
          this.skip(object);
          this.popNotificationsService.success(
            `Good job! Item <strong>${this.gearService.getDisplayName(
              object.make,
              object.name
            )}</strong> marked as <strong>${markedAs}</strong>! Do another one now! 😃`,
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

  _getSelectedSimilarItems() {
    const items = [];

    for (const key of Object.keys(this.migrationConfirmation.form.value)) {
      const pk: number = +key.split("similar-item-")[1];
      const value: boolean = this.migrationConfirmation.form.value[key];

      if (value) {
        items.push(pk);
      }
    }

    return items;
  }
}
