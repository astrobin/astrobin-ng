import { Component, OnInit, ViewChild } from "@angular/core";
import { GearApiService } from "@shared/services/api/classic/astrobin/gear/gear-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { delay, filter, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { TitleService } from "@shared/services/title/title.service";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { concat, EMPTY, forkJoin, Observable, of } from "rxjs";
import { MigrationFlag } from "@shared/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { Store } from "@ngrx/store";
import { Actions } from "@ngrx/effects";
import { selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
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
import {
  ItemBrowserComponent,
  ItemBrowserLayout
} from "@shared/components/equipment/item-browser/item-browser.component";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { FilterApiService } from "@shared/services/api/classic/astrobin/filter/filter-api.service";
import { SoftwareApiService } from "@shared/services/api/classic/astrobin/software/software-api.service";
import { isGroupMember } from "@shared/operators/is-group-member.operator";
import { CombinedAccessoryAndFocalReducerApiService } from "@shared/services/api/classic/astrobin/combined-accessory-and-focal-reducer/combined-accessory-and-focal-reducer-api.service";
import { GearUserInfoInterface } from "@shared/interfaces/gear-user-info.interface";
import { PaginatedApiResultInterface } from "@shared/services/api/interfaces/paginated-api-result.interface";
import { GearMigrationStrategyApiService } from "@shared/services/api/classic/astrobin/grar-migration-strategy/gear-migration-strategy-api.service";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ActiveToast } from "ngx-toastr";
import { UtilsService } from "@shared/services/utils/utils.service";

@Component({
  selector: "astrobin-migration-tool",
  templateUrl: "./migration-tool.component.html",
  styleUrls: ["./migration-tool.component.scss"]
})
export class MigrationToolComponent extends BaseComponentDirective implements OnInit {
  readonly EquipmentItemType = EquipmentItemType;
  readonly ItemBrowserLayout = ItemBrowserLayout;

  @ViewChild("equipmentItemBrowser")
  equipmentItemBrowser: ItemBrowserComponent;

  activeType = this.activatedRoute.snapshot?.paramMap.get("itemType");

  title = "Migration tool";
  randomNonMigrated$: any = this.getRandomNonMigrated$();

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

  migrationSuccessfulNotification: ActiveToast<any>;

  nonMigratedCamerasCount$: Observable<number>;
  nonMigratedTelescopesCount$: Observable<number>;
  nonMigratedMountsCount$: Observable<number>;
  nonMigratedFiltersCount$: Observable<number>;
  nonMigratedAccessoriesCount$: Observable<number>;
  nonMigratedSoftwareCount$: Observable<number>;

  allStrategies$: Observable<PaginatedApiResultInterface<any>>;

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
    public readonly legacyCombinedAccessoryAndFocalReducerApi: CombinedAccessoryAndFocalReducerApiService,
    public readonly legacySoftwareApi: SoftwareApiService,
    public readonly titleService: TitleService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly legacyGearService: GearService,
    public readonly gearMigrationStrategyApiService: GearMigrationStrategyApiService,
    public readonly modalService: NgbModal,
    public readonly utilsService: UtilsService
  ) {
    super(store$);
  }

  get isEquipmentModerator(): Observable<boolean> {
    return this.currentUser$.pipe(isGroupMember("equipment_moderators"));
  }

  ngOnInit(): void {
    super.ngOnInit();

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

    this.router.events?.pipe(takeUntil(this.destroyed$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeType = this.activatedRoute.snapshot?.paramMap.get("itemType");
        this.skip();
      }
    });

    this._updateCounts();
    this._updateAppliedMigrations();
  }

  getActiveType(): EquipmentItemType {
    return EquipmentItemType[this.activeType.toUpperCase()];
  }

  getRandomNonMigrated$(): Observable<{ item: any; userInfo: GearUserInfoInterface | null }> {
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

      return new Observable<any>(observer => {
        this.currentUser$
          .pipe(
            take(1),
            isGroupMember("equipment_moderators"),
            switchMap(isEquipmentModerator =>
              api.getRandomNonMigrated(isEquipmentModerator).pipe(
                map((items: any[]) => ({
                  isEquipmentModerator,
                  item: items.length > 0 ? items[0] : null
                }))
              )
            ),
            switchMap((result: { isEquipmentModerator: boolean; item: any }) => {
              if (!!result.item) {
                return this.legacyGearApi.lockForMigration(result.item.pk).pipe(map(() => result));
              }

              return of(result);
            }),
            switchMap((result: { isEquipmentModerator: boolean; item: any }) => {
              if (!!result.item && !result.isEquipmentModerator) {
                return this.currentUser$.pipe(
                  take(1),
                  switchMap(user => this.legacyGearService.getUserInfo(user, result.item)),
                  map(gearUserInfo => ({
                    isEquipmentModerator: result.isEquipmentModerator,
                    item: result.item,
                    userInfo: gearUserInfo
                  }))
                );
              }
              return of(result);
            })
          )
          .subscribe((result: { isEquipmentModerator: boolean; item: any; userInfo: GearUserInfoInterface | null }) => {
            observer.next({ item: result.item, userInfo: result.userInfo });
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
      this._updateAppliedMigrations();

      if (!!this.equipmentItemBrowser) {
        this.equipmentItemBrowser.reset();
      }

      this.cancelMigration();

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

  markAsMultiple(event: Event, object: any) {
    event.preventDefault();

    const modalRef = this.modalService.open(ConfirmationDialogComponent, { size: "sm" });
    const componentInstant: ConfirmationDialogComponent = modalRef.componentInstance;
    componentInstant.message = this.translateService.instant(
      "Only do this if the legacy item is actually multiple products lumped together under the same name. " +
      "This typically happens for LRGB filter sets when you didn't create individual filters back when you added " +
      "this legacy item to the database. Sometimes this happens when you actually added multiple products using the " +
      "same text box (e.g. 'Canon 70D / Canon 80D')."
    );

    modalRef.closed.pipe(take(1)).subscribe(() => {
      this._applyMigration(
        object,
        [object.pk, MigrationFlag.MULTIPLE_ITEMS],
        this.translateService.instant("multiple items")
      ).subscribe();
    });
  }

  markAsNotEnoughInfo(event: Event, object: any) {
    event.preventDefault();

    const modalRef = this.modalService.open(ConfirmationDialogComponent, { size: "sm" });
    const componentInstant: ConfirmationDialogComponent = modalRef.componentInstance;
    componentInstant.message = this.translateService.instant(
      "Only do this if the legacy item cannot be determined unambiguously. Sometimes this happens if back when you " +
      "added this legacy item to the equipment database, you didn't specify a key property in its name, e.g. color vs " +
      "mono, and then you used it for several images indiscriminately of that property. E.g. have an Atik 4000 Color " +
      "and an Atik 4000 Mono, and you added a generic 'Atik 4000' and used it both for color and mono images. You " +
      "cannot migrate it to either the color or mono variant of the new database entry, because some of your images " +
      "will present the wrong information once their equipment association is changed."
    );

    modalRef.closed.pipe(take(1)).subscribe(() => {
      this._applyMigration(
        object,
        [object.pk, MigrationFlag.NOT_ENOUGH_INFO],
        this.translateService.instant("not enough info")
      ).subscribe();
    });
  }

  beginMigration() {
    this.migrationMode = true;

    const _focus = () => {
      const document = this.windowRefService.nativeWindow.document;

      if (!!document.querySelector("#equipment-item-field .ng-input input")) {
        this.windowRefService.scrollToElement("#select-item-to-migrate-to");
        (document.querySelector("#equipment-item-field .ng-input input") as HTMLElement).focus();
      } else {
        this.utilsService.delay(100).subscribe(() => {
          _focus();
        });
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
          switchMap(isEquipmentModerator => {
            if (isEquipmentModerator) {
              return api.getSimilarNonMigrated(object.pk, isEquipmentModerator);
            }

            return of([]);
          }),
          switchMap((legacyItems: any[]) => {
            this.migrationConfirmation.similarItems = legacyItems;

            if (legacyItems.length === 0) {
              return of(legacyItems);
            }

            return forkJoin(
              ...([legacyItems.map(item => this.legacyGearApi.lockForMigration(item.pk))] as const)
            ).pipe(map(() => legacyItems));
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
              props: {
                required: false,
                label: this.legacyGearService.getDisplayName(item.make, item.name),
                value: item.pk
              }
            }));
            this.windowRefService.scrollToElement("#confirm-migration");
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
    this.currentUser$
      .pipe(
        filter(user => !!user),
        take(1),
        isGroupMember("equipment_moderators")
      )
      .subscribe(isEquipmentModerator => {
        const modalRef = this.modalService.open(ConfirmationDialogComponent, { size: "sm" });
        const componentInstant: ConfirmationDialogComponent = modalRef.componentInstance;

        if (isEquipmentModerator) {
          componentInstant.message = this.translateService.instant(
            "AstroBin will update <strong>all images by all users</strong> that use the legacy equipment item " +
            "<strong>{{0}}</strong> to the new one that you selected." +
            "<br/><br/>" +
            this.translateService.instant("For this reason, they need to represent the same product."),
            {
              0: `${object.make} ${object.name}`
            }
          );
        } else {
          componentInstant.message = this.translateService.instant(
            "AstroBin will update <strong>all your images</strong> that use the legacy equipment item " +
            "<strong>{{0}}</strong> to the new one that you selected." +
            "<br/><br/>" +
            this.translateService.instant("For this reason, they need to represent the same product."),
            {
              0: `${object.make} ${object.name}`
            }
          );
        }

        modalRef.closed.pipe(take(1)).subscribe(() => {
          const type = this.equipmentItemBrowser.type;
          const selectedSimilarItemsPks = this._getSelectedSimilarItemsPks();
          const similarItems = this.migrationConfirmation.similarItems.filter(
            item => selectedSimilarItemsPks.indexOf(item.pk) > -1
          );
          const observables = [...[object], ...similarItems].map(itemToMigrate =>
            this.store$.select(selectEquipmentItem, { id: this.migrationTarget.id, type }).pipe(
              filter(item => !!item),
              take(1),
              switchMap(item =>
                this._applyMigration(
                  itemToMigrate,
                  [itemToMigrate.pk, MigrationFlag.MIGRATE, type, item.id],
                  "ready to migrate"
                )
              ),
              delay(200)
            )
          );

          concat(...observables).subscribe();
        });
      });
  }

  cancelMigration() {
    this.migrationMode = false;
  }

  undoMigration(strategy) {
    this.loadingService.setLoading(true);
    this.gearMigrationStrategyApiService
      .undo(strategy.pk)
      .pipe(tap(() => this.loadingService.setLoading(false)))
      .subscribe(() => this.skip());
  }

  multipleTooltip(): string {
    return this.translateService.instant(
      "The legacy object cannot be migrated because it consists of multiple objects in the same item (e.g. " +
      "LRGB filter set, or multiple unrelated products)."
    );
  }

  notEnoughInfoTooltip(): string {
    return this.translateService.instant(
      "The legacy object cannot be migrated because the correct target product cannot be unambiguously determined."
    );
  }

  _updateCounts() {
    this.currentUser$.pipe(take(1), isGroupMember("equipment_moderators")).subscribe(isEquipmentModerator => {
      this.nonMigratedCamerasCount$ = this.legacyCameraApi.getNonMigratedCount(isEquipmentModerator);
      this.nonMigratedTelescopesCount$ = this.legacyTelescopeApi.getNonMigratedCount(isEquipmentModerator);
      this.nonMigratedMountsCount$ = this.legacyMountApi.getNonMigratedCount(isEquipmentModerator);
      this.nonMigratedFiltersCount$ = this.legacyFilterApi.getNonMigratedCount(isEquipmentModerator);
      this.nonMigratedAccessoriesCount$ =
        this.legacyCombinedAccessoryAndFocalReducerApi.getNonMigratedCount(isEquipmentModerator);
      this.nonMigratedSoftwareCount$ = this.legacySoftwareApi.getNonMigratedCount(isEquipmentModerator);
    });
  }

  _updateAppliedMigrations() {
    this.allStrategies$ = this.gearMigrationStrategyApiService.getAll();
  }

  _applyMigration(object: any, setMigrateArgs: any[], markedAs: string): Observable<void> {
    return new Observable<void>(observer => {
      this.loadingService.setLoading(true);

      this.isEquipmentModerator
        .pipe(
          take(1),
          switchMap(isEquipmentModerator =>
            this.legacyGearApi.setMigration
              .apply(this.legacyGearApi, setMigrateArgs)
              .pipe(map(() => isEquipmentModerator))
          )
        )
        .subscribe(
          isEquipmentModerator => {
            this.loadingService.setLoading(false);
            this.cancelMigration();
            this.resetMigrationConfirmation();
            this.skip(object);

            let message: string = this.translateService.instant(
              "Item <strong>{{0}}</strong> marked as <strong>{{1}}</strong>.",
              {
                0: this.legacyGearService.getDisplayName(object.make, object.name),
                1: markedAs
              }
            );

            if (setMigrateArgs[1] === MigrationFlag.MIGRATE) {
              if (isEquipmentModerator) {
                message +=
                  "<br/><br/>" +
                  this.translateService.instant(
                    "The migration will complete within a few moments and all affected images will be automatically updated."
                  );
              } else {
                message +=
                  "<br/><br/>" +
                  this.translateService.instant(
                    "The migration will complete within a few moments and your images will be automatically updated."
                  );
              }
            }

            if (!!this.migrationSuccessfulNotification) {
              this.popNotificationsService.clear(this.migrationSuccessfulNotification.toastId);
              this.migrationSuccessfulNotification = null;
            }

            this.migrationSuccessfulNotification = this.popNotificationsService.success(message, null, {
              enableHtml: true,
              timeOut: 10000,
              progressBar: false
            });

            this.migrationSuccessfulNotification.onHidden.pipe(take(1)).subscribe(() => {
              this.migrationSuccessfulNotification = null;
            });

            observer.next(void 0);
            observer.complete();
          },
          error => {
            this._operationError(error);
            observer.next(void 0);
            observer.complete();
          }
        );
    });
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
