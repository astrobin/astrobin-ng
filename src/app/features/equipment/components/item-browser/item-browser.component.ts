import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { State } from "@app/store/state";
import { Action, Store } from "@ngrx/store";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { of } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import {
  CreateAccessory,
  CreateCamera,
  CreateFilter,
  CreateMount,
  CreateSensor,
  CreateSoftware,
  CreateTelescope,
  EquipmentActionTypes,
  EquipmentItemCreationSuccessPayloadInterface,
  FindAllEquipmentItems,
  FindAllEquipmentItemsSuccess,
  LoadBrand
} from "@features/equipment/store/equipment.actions";
import { filter, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { Actions, ofType } from "@ngrx/effects";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { selectBrand, selectBrands, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { WindowRefService } from "@shared/services/window-ref.service";
import { LoadingService } from "@shared/services/loading.service";
import { ConfirmItemCreationModalComponent } from "@features/equipment/components/editors/confirm-item-creation-modal/confirm-item-creation-modal.component";
import { SensorInterface } from "@features/equipment/types/sensor.interface";
import { CameraInterface } from "@features/equipment/types/camera.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { SoftwareInterface } from "@features/equipment/types/software.interface";

@Component({
  selector: "astrobin-equipment-item-browser",
  templateUrl: "./item-browser.component.html",
  styleUrls: ["./item-browser.component.scss"]
})
export class ItemBrowserComponent extends BaseComponentDirective implements OnInit {
  EquipmentItemType = EquipmentItemType;

  model: Partial<EquipmentItemBaseInterface> = {};
  form: FormGroup = new FormGroup({});
  fields: FormlyFieldConfig[] = [];
  creationMode = false;
  subCreationMode = false;

  q: string = null;

  creationForm: FormGroup = new FormGroup({});
  creationModel: Partial<EquipmentItemBaseInterface> = {};

  @ViewChild("equipmentItemLabelTemplate")
  equipmentItemLabelTemplate: TemplateRef<any>;

  @ViewChild("equipmentItemOptionTemplate")
  equipmentItemOptionTemplate: TemplateRef<any>;

  @Input()
  type: EquipmentItemType;

  @Output()
  creationModeStarted = new EventEmitter<void>();

  @Output()
  creationModeEnded = new EventEmitter<void>();

  @Output()
  subCreationModeStarted = new EventEmitter<void>();

  @Output()
  subCreationModeEnded = new EventEmitter<void>();

  @Output()
  itemSelected = new EventEmitter<EquipmentItemBaseInterface | null>();

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly windowRefService: WindowRefService,
    public readonly modalService: NgbModal,
    public readonly equipmentItemService: EquipmentItemService
  ) {
    super(store$);
  }

  ngOnInit() {
    setTimeout(() => this._setFields(), 1);
  }

  reset() {
    this.model = {};
    this.form.reset();
    this.fields.find(field => field.key === "equipment-item").templateOptions.options = of([]);
  }

  startCreationMode() {
    this.creationMode = true;
    this.creationModeStarted.emit();
  }

  endCreationMode() {
    this.creationMode = false;
    this.creationForm.reset();
    this.creationModel = {};
    this.creationModeEnded.emit();
  }

  startSubCreationMode() {
    this.subCreationMode = true;
    this.subCreationModeStarted.emit();
  }

  endSubCreationMode() {
    this.subCreationMode = false;
    this.subCreationModeEnded.emit();
  }

  setItem(item: EquipmentItemBaseInterface) {
    const _doSetItem = brand => {
      const fieldConfig = this.fields.find(field => field.key === "equipment-item");
      fieldConfig.templateOptions.options = [this._getNgOptionValue(brand, item)];
      this.model = { ...this.model, ...{ "equipment-item": item.id } };
      this.form.get("equipment-item").setValue(item.id);
      this.itemSelected.emit(item);
    };

    if (!!item.brand) {
      this.store$
        .select(selectBrand, item.brand)
        .pipe(
          filter(brand => !!brand),
          take(1)
        )
        .subscribe(brand => {
          _doSetItem(brand);
        });
    } else {
      _doSetItem(null);
    }
  }

  createItem() {
    const data: EquipmentItemBaseInterface = {
      ...this.creationModel,
      ...this.creationForm.value
    };

    const modalRef = this.modalService.open(ConfirmItemCreationModalComponent);
    modalRef.componentInstance.item = data;

    modalRef.closed.pipe(take(1)).subscribe((item: EquipmentItemBaseInterface) => {
      if (item.id === undefined) {
        let action: Action;
        let actionSuccessType: EquipmentActionTypes;

        switch (this.type) {
          case EquipmentItemType.SENSOR:
            action = new CreateSensor({ sensor: item as SensorInterface });
            actionSuccessType = EquipmentActionTypes.CREATE_SENSOR_SUCCESS;
            break;
          case EquipmentItemType.CAMERA:
            const createModifiedVariant = (data as any).createModifiedVariant || false;
            delete (data as any).createModifiedVariant;

            action = new CreateCamera({ camera: item as CameraInterface, createModifiedVariant });
            actionSuccessType = EquipmentActionTypes.CREATE_CAMERA_SUCCESS;
            break;
          case EquipmentItemType.TELESCOPE:
            action = new CreateTelescope({ telescope: item as TelescopeInterface });
            actionSuccessType = EquipmentActionTypes.CREATE_TELESCOPE_SUCCESS;
            break;
          case EquipmentItemType.MOUNT:
            action = new CreateMount({ mount: item as MountInterface });
            actionSuccessType = EquipmentActionTypes.CREATE_MOUNT_SUCCESS;
            break;
          case EquipmentItemType.FILTER:
            action = new CreateFilter({ filter: item as FilterInterface });
            actionSuccessType = EquipmentActionTypes.CREATE_FILTER_SUCCESS;
            break;
          case EquipmentItemType.ACCESSORY:
            action = new CreateAccessory({ accessory: item as AccessoryInterface });
            actionSuccessType = EquipmentActionTypes.CREATE_ACCESSORY_SUCCESS;
            break;
          case EquipmentItemType.SOFTWARE:
            action = new CreateSoftware({ software: item as SoftwareInterface });
            actionSuccessType = EquipmentActionTypes.CREATE_SOFTWARE_SUCCESS;
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
    this.endCreationMode();
    this.endSubCreationMode();

    const _setItem = () => {
      this.setItem(item);
      setTimeout(() => {
        this.windowRefService.nativeWindow.document
          .querySelector("#equipment-item-field")
          .scrollIntoView({ behavior: "smooth" });
      }, 1);
    };

    if (!!item.brand) {
      this.store$.dispatch(new LoadBrand({ id: item.brand }));

      this.store$
        .select(selectBrand, item.brand)
        .pipe(
          filter(brand => !!brand),
          take(1)
        )
        .subscribe(brand => {
          _setItem();
        });
    } else {
      _setItem();
    }
  }

  onCancel() {
    this.endSubCreationMode();
    this.endCreationMode();
  }

  onSubCreationInProgress(inProgress: boolean) {
    if (inProgress) {
      this.startSubCreationMode();
    } else {
      this.endSubCreationMode();
    }
  }

  _setFields() {
    const _addTag = () => {
      this.startCreationMode();
      setTimeout(() => {
        this.windowRefService.nativeWindow.document
          .getElementById("create-new-item")
          .scrollIntoView({ behavior: "smooth" });
      }, 1);
    };

    this.currentUser$
      .pipe(
        takeUntil(this.destroyed$),
        map(currentUser => {
          this.fields = [
            {
              key: "equipment-item",
              type: "ng-select",
              id: "equipment-item-field",
              expressionProperties: {
                "templateOptions.disabled": () => this.creationMode
              },
              templateOptions: {
                required: true,
                clearable: true,
                label: this.translateService.instant("Find equipment item"),
                options: of([]),
                onSearch: (term: string) => {
                  this._onSearch(term);
                },
                labelTemplate: this.equipmentItemLabelTemplate,
                optionTemplate: this.equipmentItemOptionTemplate,
                addTag: !!currentUser ? _addTag : undefined,
                striped: true
              },
              hooks: {
                onInit: (field: FormlyFieldConfig) => {
                  field.formControl.valueChanges
                    .pipe(
                      takeUntil(this.destroyed$),
                      switchMap((id: EquipmentItemBaseInterface["id"]) =>
                        this.store$
                          .select(selectEquipmentItem, {
                            id,
                            type: this.type
                          })
                          .pipe(
                            filter(item => !!item),
                            take(1)
                          )
                      )
                    )
                    .subscribe((item: EquipmentItemBaseInterface) => this.itemSelected.emit(item));
                }
              }
            }
          ];
        })
      )
      .subscribe();
  }

  _onSearch(q: string) {
    if (!q || q.length < 1) {
      return of([]);
    }

    this.q = q;

    const field = this.fields.find(f => f.key === "equipment-item");
    this.store$.dispatch(
      new FindAllEquipmentItems({
        q,
        type: this.type
      })
    );

    field.templateOptions.options = this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_ALL_EQUIPMENT_ITEMS_SUCCESS),
      take(1),
      map((action: FindAllEquipmentItemsSuccess) => action.payload.items),
      tap(items => {
        const uniqueBrands: BrandInterface["id"][] = [];
        for (const item of items) {
          if (!!item.brand && uniqueBrands.indexOf(item.brand) === -1) {
            uniqueBrands.push(item.brand);
          }
        }
        uniqueBrands.forEach(id => this.store$.dispatch(new LoadBrand({ id })));
      }),
      switchMap(items =>
        this.store$.select(selectBrands).pipe(
          filter(brands => {
            for (const item of items) {
              if (!!item.brand && !brands.find(brand => brand.id === item.brand)) {
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
          return this._getNgOptionValue(brand, item);
        })
      )
    );
  }

  _getNgOptionValue(brand: BrandInterface | null, item: EquipmentItemBaseInterface): any {
    return {
      value: item.id,
      label: `${!!brand ? brand.name : this.translateService.instant("(DIY)")} ${item.name}`,
      brand,
      item
    };
  }
}
