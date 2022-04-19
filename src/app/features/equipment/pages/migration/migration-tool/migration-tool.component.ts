import { Component, OnInit, ViewChild } from "@angular/core";
import { GearApiService } from "@shared/services/api/classic/astrobin/gear/gear-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { filter, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { TitleService } from "@shared/services/title/title.service";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { EMPTY, forkJoin, Observable, of } from "rxjs";
import { MigrationFlag } from "@shared/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { Store } from "@ngrx/store";
import { Actions } from "@ngrx/effects";
import { selectBrand, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { HttpStatusCode } from "@angular/common/http";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { CameraApiService } from "@shared/services/api/classic/astrobin/camera/camera-api.service";
import { TelescopeApiService } from "@shared/services/api/classic/astrobin/telescope/telescope-api.service";
import { MountApiService } from "@shared/services/api/classic/astrobin/mount/mount-api.service";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TranslateService } from "@ngx-translate/core";
import { WindowRefService } from "@shared/services/window-ref.service";
import { State } from "@app/store/state";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { GearService } from "@shared/services/gear/gear.service";
import { ItemBrowserComponent } from "@shared/components/equipment/item-browser/item-browser.component";
import { CameraInterface } from "@features/equipment/types/camera.interface";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { FilterApiService } from "@shared/services/api/classic/astrobin/filter/filter-api.service";
import { AccessoryApiService } from "@shared/services/api/classic/astrobin/accessory/accessory-api.service";
import { SoftwareApiService } from "@shared/services/api/classic/astrobin/software/software-api.service";
import { isGroupMember } from "@shared/operators/is-group-member.operator";
import { CombinedAccessoryAndFocalReducerApiService } from "@shared/services/api/classic/astrobin/combined-accessory-and-focal-reducer/combined-accessory-and-focal-reducer-api.service";

@Component({
  selector: "astrobin-migration-tool",
  templateUrl: "./migration-tool.component.html",
  styleUrls: ["./migration-tool.component.scss"]
})
export class MigrationToolComponent extends BaseComponentDirective implements OnInit {
  EquipmentItemType = EquipmentItemType;

  @ViewChild("equipmentItemBrowser")
  equipmentItemBrowser: ItemBrowserComponent;

  activeType = this.activatedRoute.snapshot.paramMap.get("itemType");

  title = "Migration tool";
  randomNonMigrated$ = this.getRandomNonMigrated$();

  migrationTarget: EquipmentItemBaseInterface = null;
  migrationMode = false;
  subCreationMode = false;

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

  nonMigratedCamerasCount$: Observable<number>;
  nonMigratedTelescopesCount$: Observable<number>;
  nonMigratedMountsCount$: Observable<number>;
  nonMigratedFiltersCount$: Observable<number>;
  nonMigratedAccessoriesCount$: Observable<number>;
  nonMigratedSoftwareCount$: Observable<number>;

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly loadingService: LoadingService,
    public readonly legacyGearApi: GearApiService,
    public readonly legacyCameraApi: CameraApiService,
    public readonly legacyTelescopeApi: TelescopeApiService,
    public readonly legacyMountApi: MountApiService,
    public readonly legacyFilterApi: FilterApiService,
    public readonly legacyAccessoryApi: AccessoryApiService,
    public readonly legacyCombinedAccessoryAndFocalReducerApi: CombinedAccessoryAndFocalReducerApiService,
    public readonly legacySoftwareApi: SoftwareApiService,
    public readonly titleService: TitleService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly legacyGearService: GearService
  ) {
    super(store$);
  }

  get isEquipmentModerator(): Observable<boolean> {
    return this.currentUser$.pipe(isGroupMember("equipment_moderators"));
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

    this._updateCounts();
  }

  getActiveType(): EquipmentItemType {
    return EquipmentItemType[this.activeType.toUpperCase()];
  }

  getRandomNonMigrated$(): Observable<any[]> {
    let api;

    switch (this.getActiveType()) {
      case EquipmentItemType.CAMERA:
        api = this.legacyCameraApi;
        break;
      case EquipmentItemType.TELESCOPE:
        api = this.legacyTelescopeApi;
        break;
      case EquipmentItemType.MOUNT:
        api = this.legacyMountApi;
        break;
      case EquipmentItemType.FILTER:
        api = this.legacyFilterApi;
        break;
      case EquipmentItemType.ACCESSORY:
        api = this.legacyCombinedAccessoryAndFocalReducerApi;
        break;
      case EquipmentItemType.SOFTWARE:
        api = this.legacySoftwareApi;
        break;
      default:
        this.popNotificationsService.error("Wrong item type requested.");
    }

    if (api) {
      return new Observable<any[]>(observer => {
        this.currentUser$
          .pipe(
            take(1),
            isGroupMember("equipment_moderators"),
            switchMap(isEquipmentModerator => api.getRandomNonMigrated(isEquipmentModerator)),
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

      this._updateCounts();

      if (!!this.equipmentItemBrowser) {
        this.equipmentItemBrowser.reset();
      }

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
    this._applyMigration(object, [object.pk, MigrationFlag.WRONG_TYPE], this.translateService.instant("wrong type"));
  }

  markAsMultiple(event: Event, object: any) {
    event.preventDefault();
    this._applyMigration(
      object,
      [object.pk, MigrationFlag.MULTIPLE_ITEMS],
      this.translateService.instant("multiple items")
    );
  }

  markAsDIY(event: Event, object: any) {
    event.preventDefault();
    this._applyMigration(object, [object.pk, MigrationFlag.DIY], this.translateService.instant("DIY"));
  }

  markAsNotEnoughInfo(event: Event, object: any) {
    event.preventDefault();
    this._applyMigration(
      object,
      [object.pk, MigrationFlag.NOT_ENOUGH_INFO],
      this.translateService.instant("not enough info")
    );
  }

  beginMigration() {
    this.migrationMode = true;

    const _focus = () => {
      const document = this.windowRefService.nativeWindow.document;

      if (!!document.querySelector("#equipment-item-field .ng-input input")) {
        document.getElementById("select-item-to-migrate-to").scrollIntoView({ behavior: "smooth" });
        (document.querySelector("#equipment-item-field .ng-input input") as HTMLElement).focus();
      } else {
        setTimeout(() => {
          _focus();
        }, 100);
      }
    };

    _focus();
  }

  beginMigrationConfirmation(object) {
    let api;

    switch (this.getActiveType()) {
      case EquipmentItemType.CAMERA:
        api = this.legacyCameraApi;
        break;
      case EquipmentItemType.TELESCOPE:
        api = this.legacyTelescopeApi;
        break;
      case EquipmentItemType.MOUNT:
        api = this.legacyMountApi;
        break;
      case EquipmentItemType.FILTER:
        api = this.legacyFilterApi;
        break;
      case EquipmentItemType.ACCESSORY:
        api = this.legacyCombinedAccessoryAndFocalReducerApi;
        break;
      case EquipmentItemType.SOFTWARE:
        api = this.legacySoftwareApi;
        break;
      default:
        this.popNotificationsService.error("Wrong item type requested.");
    }

    if (api) {
      this.loadingService.setLoading(true);

      this.currentUser$
        .pipe(
          take(1),
          isGroupMember("equipment_moderators"),
          switchMap(isEquipmentModerator => api.getSimilarNonMigrated(object.pk, isEquipmentModerator)),
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
                label: this.legacyGearService.getDisplayName(item.make, item.name),
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
    const type = this.getActiveType();

    const selectedSimilarItemsPks = this._getSelectedSimilarItemsPks();
    const similarItems = this.migrationConfirmation.similarItems.filter(
      item => selectedSimilarItemsPks.indexOf(item.pk) > -1
    );

    for (const itemToMigrate of [...[object], ...similarItems]) {
      this.store$
        .select(selectEquipmentItem, { id: this.migrationTarget.id, type })
        .pipe(take(1))
        .subscribe(item => {
          this._applyMigration(
            itemToMigrate,
            [itemToMigrate.pk, MigrationFlag.MIGRATE, type, item.id],
            "ready to migrate"
          );
        });
    }
  }

  cancelMigration() {
    this.migrationMode = false;
  }

  onItemSelected(item: EquipmentItemBaseInterface) {
    this.migrationTarget = item;

    let type: EquipmentItemType;

    try {
      type = this.equipmentItemService.getType(item);
    } catch (e) {
      return;
    }

    if (type === EquipmentItemType.CAMERA) {
      const camera = item as CameraInterface;
      if (!camera.modified) {
        this.equipmentApiService
          .getByProperties(type, { brand: item.brand, name: item.name, modified: true })
          .pipe(
            take(1),
            filter(modifiedCameraVariant => !!modifiedCameraVariant),
            switchMap(modifiedCameraVariant =>
              this.store$.select(selectBrand, modifiedCameraVariant.brand).pipe(
                map(brand => ({ brand, modifiedCameraVariant })),
                // tslint:disable-next-line:no-shadowed-variable
                filter(({ brand, modifiedCameraVariant }) => !!brand),
                take(1)
              )
            )
          )
          .subscribe(({ brand, modifiedCameraVariant }) => {
            this.migrationTarget = null;
            this.equipmentItemBrowser.reset();
            this.popNotificationsService.info(
              this.translateService.instant(
                "Since a regular and a modified variant of {{0}} were created, we didn't prefill the item " +
                  "selection dropdown, to allow you to select the correct variant for this migration.",
                {
                  0: `<strong>${brand.name} ${modifiedCameraVariant.name}</strong>`
                }
              ),
              null,
              {
                enableHtml: true
              }
            );
          });
      }
    }
  }

  _updateCounts() {
    this.currentUser$.pipe(take(1), isGroupMember("equipment_moderators")).subscribe(isEquipmentModerator => {
      this.nonMigratedCamerasCount$ = this.legacyCameraApi.getNonMigratedCount(isEquipmentModerator);
      this.nonMigratedTelescopesCount$ = this.legacyTelescopeApi.getNonMigratedCount(isEquipmentModerator);
      this.nonMigratedMountsCount$ = this.legacyMountApi.getNonMigratedCount(isEquipmentModerator);
      this.nonMigratedFiltersCount$ = this.legacyFilterApi.getNonMigratedCount(isEquipmentModerator);
      this.nonMigratedAccessoriesCount$ = this.legacyCombinedAccessoryAndFocalReducerApi.getNonMigratedCount(
        isEquipmentModerator
      );
      this.nonMigratedSoftwareCount$ = this.legacySoftwareApi.getNonMigratedCount(isEquipmentModerator);
    });
  }

  _applyMigration(object: any, setMigrateArgs: any[], markedAs: string) {
    this.loadingService.setLoading(true);
    this.legacyGearApi.setMigration
      .apply(this.legacyGearApi, setMigrateArgs)
      .pipe(take(1))
      .subscribe(
        () => {
          this.loadingService.setLoading(false);
          this.cancelMigration(), this.resetMigrationConfirmation();
          this.skip(object);

          let message = this.translateService.instant("Item <strong>{{0}}</strong> marked as <strong>{{1}}</strong>.", {
            0: this.legacyGearService.getDisplayName(object.make, object.name),
            1: markedAs
          });

          if (setMigrateArgs[1] === MigrationFlag.MIGRATE) {
            message +=
              "<br/><br/>" +
              this.translateService.instant(
                "The migration will be reviewed by a moderator as soon as possible, and you will be notified of " +
                  "the outcome. If the migration is approved, you will be able to add the equipment item to your images."
              );
          }

          this.popNotificationsService.success(message, null, { enableHtml: true });
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

  _getSelectedSimilarItemsPks() {
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
