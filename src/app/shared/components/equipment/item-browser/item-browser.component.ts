import { Component, EventEmitter, Input, OnChanges, Output, TemplateRef, ViewChild } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { State } from "@app/store/state";
import { Action, Store } from "@ngrx/store";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType,
  EquipmentItemUsageType
} from "@features/equipment/types/equipment-item-base.interface";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { forkJoin, Observable, of } from "rxjs";
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
  ItemBrowserAdd,
  ItemBrowserSet,
  LoadBrand,
  LoadEquipmentItem
} from "@features/equipment/store/equipment.actions";
import { filter, first, map, switchMap, take, takeUntil, tap } from "rxjs/operators";
import { Actions, ofType } from "@ngrx/effects";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { selectBrand, selectBrands, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { WindowRefService } from "@shared/services/window-ref.service";
import { LoadingService } from "@shared/services/loading.service";
import { ConfirmItemCreationModalComponent } from "@shared/components/equipment/editors/confirm-item-creation-modal/confirm-item-creation-modal.component";
import { SensorInterface } from "@features/equipment/types/sensor.interface";
import { CameraInterface } from "@features/equipment/types/camera.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { SoftwareInterface } from "@features/equipment/types/software.interface";
import { UtilsService } from "@shared/services/utils/utils.service";

type Type = EquipmentItemBaseInterface["id"];
type TypeUnion = Type | Type[] | null;

@Component({
  selector: "astrobin-equipment-item-browser",
  templateUrl: "./item-browser.component.html",
  styleUrls: ["./item-browser.component.scss"]
})
export class ItemBrowserComponent extends BaseComponentDirective implements OnChanges {
  EquipmentItemType = EquipmentItemType;

  @Input()
  id = "equipment-item-field";

  @Input()
  type: EquipmentItemType;

  @Input()
  usageType: EquipmentItemUsageType;

  @Input()
  initialValue: TypeUnion = null;

  @Input()
  label: string;

  @Input()
  showLabel = true;

  @Input()
  required = false;

  @Input()
  multiple = false;

  @Input()
  enableSummaryModal = false;

  model: { value: TypeUnion } = { value: null };
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

  @Output()
  creationModeStarted = new EventEmitter<void>();

  @Output()
  creationModeEnded = new EventEmitter<void>();

  @Output()
  subCreationModeStarted = new EventEmitter<void>();

  @Output()
  subCreationModeEnded = new EventEmitter<void>();

  @Output()
  valueChanged = new EventEmitter<EquipmentItemBaseInterface | EquipmentItemBaseInterface[] | null>();

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

  ngOnChanges() {
    setTimeout(() => this._setFields(), 1);
  }

  reset() {
    this.model = { value: null };
    this.form.reset();
    this.fields[0].templateOptions.options = of([]);
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

  setValue(value: TypeUnion) {
    const _doSetValue = (brand: BrandInterface, item: EquipmentItemBaseInterface) => {
      const fieldConfig = this.fields[0];
      const options = !!item ? [this._getNgOptionValue(brand, item)] : [];
      const id = !!item ? item.id : null;

      fieldConfig.templateOptions.options = of(options);

      if (!!this.form.get("value")) {
        this.form.get("value").setValue(id);
      }

      this.model = { value: id };

      this.valueChanged.emit(item);
    };

    const _doSetValues = (values: { brand: BrandInterface; item: EquipmentItemBaseInterface }[] = []) => {
      const fieldConfig = this.fields[0];
      const options =
        values.length > 0
          ? UtilsService.arrayUniqueObjects(
              values.map(result => this._getNgOptionValue(result.brand, result.item)),
              "value"
            )
          : [];
      const items = values.map(v => v.item);
      const ids = items.map(item => item.id);

      fieldConfig.templateOptions.options = of(options);

      this.model = { value: ids };

      if (this.form.get("value")) {
        this.form.get("value").setValue(ids);
      }

      this.valueChanged.emit(items);
    };

    if (this.multiple) {
      if ((value as Type[]).length === 0) {
        _doSetValues([]);
        return;
      }

      (value as Type[]).forEach(id => this.store$.dispatch(new LoadEquipmentItem({ id, type: this.type })));

      forkJoin(
        (value as Type[]).map(id =>
          this.store$.select(selectEquipmentItem, { id, type: this.type }).pipe(
            filter(item => !!item),
            tap(item => {
              if (!!item.brand) {
                this.store$.dispatch(new LoadBrand({ id: item.brand }));
              }
            }),
            switchMap(item => {
              if (!!item.brand) {
                return this.store$.select(selectBrand, item.brand).pipe(
                  filter(brand => !!brand),
                  map(brand => ({ item, brand }))
                );
              }

              return of({ item, brand: null });
            }),
            first()
          )
        )
      )
        .pipe(first())
        .subscribe((results: { item: EquipmentItemBaseInterface; brand: BrandInterface }[]) => {
          _doSetValues(results);
        });
    } else {
      if (!value) {
        _doSetValue(null, null);
        return;
      }

      this.store$.dispatch(new LoadEquipmentItem({ id: value as Type, type: this.type }));
      this.store$
        .select(selectEquipmentItem, { id: value, type: this.type })
        .pipe(
          filter(item => !!item),
          tap(item => {
            if (!!item.brand) {
              this.store$.dispatch(new LoadBrand({ id: item.brand }));
            }
          }),
          switchMap(item => {
            if (!!item.brand) {
              return this.store$.select(selectBrand, item.brand).pipe(
                filter(brand => !!brand),
                map(brand => ({ item, brand }))
              );
            }

            return of({ item, brand: null });
          })
        )
        .subscribe(({ item, brand }) => {
          _doSetValue(brand, item);
        });
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
            action = new CreateCamera({ camera: item as CameraInterface });
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

    const _addItem = () => {
      if (this.multiple) {
        this.setValue([...((this.model.value as Type[]) || []), item.id]);
      } else {
        this.setValue(item.id);
      }

      setTimeout(() => {
        this.windowRefService.nativeWindow.document.querySelector(`#${this.id}`).scrollIntoView({ behavior: "smooth" });
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
          _addItem();
        });
    } else {
      _addItem();
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

    this.model = { value: this.initialValue };

    this.currentUser$
      .pipe(
        takeUntil(this.destroyed$),
        map(currentUser => {
          this.fields = [
            {
              key: "value",
              type: "ng-select",
              id: `${this.id}`,
              expressionProperties: {
                "templateOptions.disabled": () => this.creationMode
              },
              defaultValue: this.model,
              templateOptions: {
                required: this.required,
                clearable: true,
                label: this.showLabel ? this.label || this.translateService.instant("Find equipment item") : null,
                options: this._getOptions().pipe(takeUntil(this.destroyed$)),
                onSearch: (term: string): Observable<void> => {
                  return this._onSearch(term);
                },
                labelTemplate: this.equipmentItemLabelTemplate,
                optionTemplate: this.equipmentItemOptionTemplate,
                addTag: !!currentUser ? _addTag : undefined,
                striped: true,
                multiple: this.multiple,
                closeOnSelect: true
              },
              hooks: {
                onInit: (field: FormlyFieldConfig) => {
                  field.formControl.valueChanges
                    .pipe(
                      takeUntil(this.destroyed$),
                      switchMap((value: TypeUnion) => {
                        if (!value || (Array.isArray(value) && value.length === 0)) {
                          return of([]);
                        }

                        if (Array.isArray(value)) {
                          return forkJoin(
                            (value as EquipmentItemBaseInterface["id"][]).map(id =>
                              this.store$
                                .select(selectEquipmentItem, {
                                  id,
                                  type: this.type
                                })
                                .pipe(
                                  filter(item => !!item),
                                  first()
                                )
                            )
                          ).pipe(filter(items => items.length > 0));
                        }

                        return this.store$
                          .select(selectEquipmentItem, {
                            id: value as EquipmentItemBaseInterface["id"],
                            type: this.type
                          })
                          .pipe(
                            filter(item => !!item),
                            map(item => [item])
                          );
                      })
                    )
                    .subscribe((items: EquipmentItemBaseInterface[]) => {
                      this.valueChanged.emit(this.multiple ? items : items[0]);
                    });
                }
              }
            }
          ];
        })
      )
      .subscribe(() => {
        if (!!this.initialValue) {
          this.setValue(this.initialValue);
        }
      });

    this.actions$
      .pipe(
        takeUntil(this.destroyed$),
        ofType(EquipmentActionTypes.ITEM_BROWSER_ADD),
        map((action: ItemBrowserAdd) => action.payload),
        filter(payload => payload.type === this.type && payload.usageType === this.usageType),
        map(payload => payload.item)
      )
      .subscribe(item => {
        if (this.multiple) {
          if (!!this.model.value) {
            this.setValue([...((this.model.value as Type[]) || []), item.id]);
          } else {
            this.setValue([item.id]);
          }
        } else {
          this.setValue(item.id);
        }
      });

    this.actions$
      .pipe(
        takeUntil(this.destroyed$),
        ofType(EquipmentActionTypes.ITEM_BROWSER_SET),
        map((action: ItemBrowserSet) => action.payload),
        filter(payload => payload.type === this.type && payload.usageType === this.usageType),
        map(payload => payload.items)
      )
      .subscribe(items => {
        if (this.multiple) {
          this.setValue(items.map(item => item.id));
        } else {
          if (items.length > 0) {
            this.setValue(items[0].id);
          } else {
            this.setValue(null);
          }
        }
      });
  }

  _getOptions(): Observable<any> {
    if (!this.model.value) {
      return of([]);
    }

    if (this.multiple) {
      const value: Type[] = this.model.value as Type[];

      if (!value || value.length === 0) {
        return of([]);
      }

      (value as Type[]).forEach(id => this.store$.dispatch(new LoadEquipmentItem({ id, type: this.type })));

      return forkJoin(
        value.map(itemId =>
          this.store$.select(selectEquipmentItem, { id: itemId, type: this.type }).pipe(
            takeUntil(this.destroyed$),
            filter(item => !!item),
            tap(item => {
              if (!!item.brand) {
                this.store$.dispatch(new LoadBrand({ id: item.brand }));
              }
            }),
            switchMap(item => {
              if (!!item.brand) {
                return this.store$.select(selectBrand, item.brand).pipe(
                  takeUntil(this.destroyed$),
                  filter(brand => !!brand),
                  map(brand => ({ brand, item }))
                );
              }

              return of({ brand: null, item });
            }),
            map(({ brand, item }) => this._getNgOptionValue(brand, item)),
            first()
          )
        )
      );
    }

    this.store$.dispatch(new LoadEquipmentItem({ id: this.model.value as Type, type: this.type }));

    return this.store$.select(selectEquipmentItem, { id: this.model.value, type: this.type }).pipe(
      filter(item => !!item),
      tap(item => {
        if (!!item.brand) {
          this.store$.dispatch(new LoadBrand({ id: item.brand }));
        }
      }),
      switchMap(item => {
        if (!!item.brand) {
          return this.store$.select(selectBrand, item.brand).pipe(
            takeUntil(this.destroyed$),
            filter(brand => !!brand),
            map(brand => ({ brand, item }))
          );
        }

        return of({ brand: null, item });
      }),
      map(({ brand, item }) => this._getNgOptionValue(brand, item))
    );
  }

  _onSearch(q: string): Observable<void> {
    return new Observable<void>(observer => {
      if (!q || q.length < 1) {
        observer.next();
        observer.complete();
        return;
      }

      this.q = q;

      const field = this.fields[0];
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
        ),
        tap(() => {
          observer.next();
          observer.complete();
        })
      );
    });
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
