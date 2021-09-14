import { Component, OnInit, ViewChild } from "@angular/core";
import { GearApiService } from "@shared/services/api/classic/astrobin/gear/gear-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { TitleService } from "@shared/services/title/title.service";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { EMPTY, forkJoin, Observable, of } from "rxjs";
import { MigrationFlag } from "@shared/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { Store } from "@ngrx/store";
import { Actions } from "@ngrx/effects";
import { selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { HttpStatusCode } from "@angular/common/http";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { CameraApiService } from "@shared/services/api/classic/astrobin/camera/camera-api.service";
import { TelescopeApiService } from "@shared/services/api/classic/astrobin/telescope/telescope-api.service";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TranslateService } from "@ngx-translate/core";
import { WindowRefService } from "@shared/services/window-ref.service";
import { State } from "@app/store/state";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { GearService } from "@shared/services/gear/gear.service";
import { ItemBrowserComponent } from "@features/equipment/components/item-browser/item-browser.component";

@Component({
  selector: "astrobin-migration-tool",
  templateUrl: "./migration-tool.component.html",
  styleUrls: ["./migration-tool.component.scss"]
})
export class MigrationToolComponent extends BaseComponentDirective implements OnInit {
  @ViewChild("equipmentItemBrowser")
  equipmentItemBrowser: ItemBrowserComponent;

  activeType = this.activatedRoute.snapshot.paramMap.get("itemType");

  title = "Migration tool";
  randomNonMigrated$ = this.getRandomNonMigrated$();

  migrationTarget: EquipmentItemBaseInterface = null;
  migrationMode = false;
  creationMode = false;

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
    public readonly gearService: GearService
  ) {
    super(store$);
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
        this.skip();
      }
    });

    this.nonMigratedCamerasCount$ = this.legacyCameraApi.getNonMigratedCount();
  }

  getActiveType(): EquipmentItemType {
    return EquipmentItemType[this.activeType.toUpperCase()];
  }

  getRandomNonMigrated$(): Observable<any[]> {
    let api;

    // TODO: complete
    switch (this.getActiveType()) {
      case EquipmentItemType.CAMERA:
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

    // TODO: complete
    switch (this.getActiveType()) {
      case EquipmentItemType.CAMERA:
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
    const type = this.getActiveType();

    const selectedSimilarItems = this._getSelectedSimilarItems();
    const similarItems = this.migrationConfirmation.similarItems.filter(
      item => selectedSimilarItems.indexOf(item.pk) > -1
    );

    for (const itemToMigrate of [...[object], ...similarItems]) {
      this.store$.select(selectEquipmentItem, { id: this.migrationTarget.id, type }).subscribe(item => {
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
