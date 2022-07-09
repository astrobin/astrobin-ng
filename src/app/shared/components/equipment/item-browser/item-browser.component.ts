import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild
} from "@angular/core";
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
import { forkJoin, Observable, of, Subscription } from "rxjs";
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
  ItemBrowserExitFullscreen,
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
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { TelescopeInterface } from "@features/equipment/types/telescope.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { AccessoryInterface } from "@features/equipment/types/accessory.interface";
import { SoftwareInterface } from "@features/equipment/types/software.interface";
import { UtilsService } from "@shared/services/utils/utils.service";
import { VariantSelectorModalComponent } from "@shared/components/equipment/item-browser/variant-selector-modal/variant-selector-modal.component";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { BaseItemEditorComponent } from "@shared/components/equipment/editors/base-item-editor/base-item-editor.component";

type Type = EquipmentItem["id"] | EquipmentItem;
type TypeUnion = EquipmentItem["id"] | EquipmentItem | EquipmentItem["id"][] | EquipmentItem[];

@Component({
  selector: "astrobin-equipment-item-browser",
  templateUrl: "./item-browser.component.html",
  styleUrls: ["./item-browser.component.scss"]
})
export class ItemBrowserComponent extends BaseComponentDirective implements OnInit, OnChanges {
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

  @Input()
  enableVariantSelection = true;

  @Input()
  enableCreation = true;

  @Input()
  enableFullscreen = false;

  @Input()
  excludeId: number;

  model: { value: TypeUnion } = { value: null };
  form: FormGroup = new FormGroup({});
  fields: FormlyFieldConfig[] = [];
  creationMode = false;
  subCreationMode = false;

  q: string = null;

  creationForm: FormGroup = new FormGroup({});
  creationModel: Partial<EquipmentItem> = {};

  currentUserSubscription: Subscription;
  itemBrowserAddSubscription: Subscription;
  itemBrowserSetSubscription: Subscription;

  @ViewChild("editor")
  editor: BaseItemEditorComponent<EquipmentItemBaseInterface, null>;

  @ViewChild("equipmentItemLabelTemplate")
  equipmentItemLabelTemplate: TemplateRef<any>;

  @ViewChild("equipmentItemOptionTemplate")
  equipmentItemOptionTemplate: TemplateRef<any>;

  @ViewChild("footerTemplateExtra")
  footerTemplateExtra: TemplateRef<any>;

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
    public readonly equipmentItemService: EquipmentItemService,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$);
  }

  ngOnInit() {
    setTimeout(() => this._setFields(), 1);
  }

  ngOnChanges(changes: SimpleChanges) {
    let equals = false;

    if (
      changes.initialValue &&
      changes.initialValue.previousValue !== undefined &&
      changes.initialValue.currentValue !== undefined
    ) {
      if (this.multiple) {
        equals =
          [...changes.initialValue.previousValue].sort() + "" === [...changes.initialValue.currentValue].sort() + "";
      } else {
        equals = changes.initialValue.previousValue === changes.initialValue.currentValue;
      }

      if (!equals) {
        this._setFields();
      }
    }
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
    const _doSetValue = (item: EquipmentItemBaseInterface) => {
      const id = !!item ? item.id : null;
      const fieldConfig = this.fields[0];
      const options = !!item ? [this._getNgOptionValue(item)] : [];

      fieldConfig.templateOptions.options = of(options);

      if (!!this.form.get("value")) {
        this.form.get("value").setValue(id, { onlySelf: true, emitEvent: false });
      }

      this.model = { value: id };

      this.valueChanged.emit(item);
    };

    const _doSetValues = (items: EquipmentItemBaseInterface[] = []) => {
      const fieldConfig = this.fields[0];
      const options =
        items.length > 0
          ? UtilsService.arrayUniqueObjects(
              items.map(item => this._getNgOptionValue(item)),
              "value"
            )
          : [];
      const ids = items.map(item => item.id);

      fieldConfig.templateOptions.options = of(options);

      this.model = { value: ids };

      if (this.form.get("value")) {
        this.form.get("value").setValue(ids, { onlySelf: true, emitEvent: false });
      }

      this.valueChanged.emit(items);
    };

    if (this.multiple) {
      if ((value as Type[]).length === 0) {
        _doSetValues([]);
        return;
      }

      (value as Type[]).forEach((x: EquipmentItem | EquipmentItem["id"]) =>
        this.store$.dispatch(
          new LoadEquipmentItem({
            id: UtilsService.isObject(x) ? (x as EquipmentItem).id : (x as EquipmentItem["id"]),
            type: this.type
          })
        )
      );

      forkJoin(
        (value as Type[]).map(id =>
          this.store$.select(selectEquipmentItem, { id, type: this.type }).pipe(
            filter(item => !!item),
            take(1)
          )
        )
      )
        .pipe(take(1))
        .subscribe(items => {
          _doSetValues(items);
        });
    } else {
      if (!value) {
        _doSetValue(null);
        return;
      }

      this.store$.dispatch(
        new LoadEquipmentItem({
          id: UtilsService.isObject(value) ? (value as EquipmentItem).id : (value as EquipmentItem["id"]),
          type: this.type
        })
      );

      this.store$
        .select(selectEquipmentItem, { id: value, type: this.type })
        .pipe(
          filter(item => !!item),
          take(1)
        )
        .subscribe(item => {
          _doSetValue(item);
        });
    }
  }

  createItem() {
    if (!this.creationForm.valid) {
      this.creationForm.markAllAsTouched();
      const errorList: string[] = [];
      this.editor.fields.forEach(field => {
        if (field.formControl.errors !== null) {
          errorList.push(`<li>${field.templateOptions.label}</li>`);
        }
      });
      this.popNotificationsService.error(
        `
        <p>
          ${this.translateService.instant("The following form fields have errors, please correct them and try again:")}
        </p>
        <ul>
          ${errorList.join("\n")}
        </ul>
        `,
        null,
        {
          enableHtml: true
        }
      );
      return;
    }

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

  addItem(item: EquipmentItemBaseInterface) {
    const _doAddItem = (itemToAdd: EquipmentItemBaseInterface) => {
      const _doSetValue = (value: EquipmentItemBaseInterface) => {
        if (this.multiple) {
          if (UtilsService.isObject(value)) {
            this.setValue([...((this.model.value as EquipmentItem["id"][]) || []), value.id]);
          } else {
            this.setValue([...((this.model.value as EquipmentItem[]) || []), value]);
          }
        } else {
          if (UtilsService.isObject(value)) {
            this.setValue(value.id);
          } else {
            this.setValue(value);
          }
        }
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
            _doSetValue(itemToAdd);
          });
      } else {
        _doSetValue(itemToAdd);
      }

      this.windowRefService.scrollToElement(`#${this.id}`);
    };

    if (this.enableVariantSelection && item.variants?.length > 0) {
      const modal: NgbModalRef = this.modalService.open(VariantSelectorModalComponent);
      modal.componentInstance.variants = [...[item], ...item.variants];

      modal.closed.pipe(take(1)).subscribe((variant: EquipmentItem) => {
        _doAddItem(variant);
        this.store$.dispatch(new ItemBrowserExitFullscreen());
      });
    } else {
      _doAddItem(item);
    }
  }

  itemCreated(item: EquipmentItemBaseInterface) {
    this.popNotificationsService.success(
      this.translateService.instant(
        "Because of your contribution in adding this equipment item, the next person who wants to associate it " +
          "with their images won't have to repeat the same process."
      ),
      this.translateService.instant("Thank you so much for contributing to the AstroBin equipment database! 🙌")
    );

    this.endCreationMode();
    this.endSubCreationMode();
    this.addItem(item);
  }

  onOptionClicked($event, obj): boolean {
    if (this.enableVariantSelection && obj.item.variants?.length > 0) {
      $event.preventDefault();
      $event.stopPropagation();
      this.addItem(obj.item);
      return true;
    }

    return false;
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

  variantsMessage(numberOfVariants: number): string {
    return this.translateService.instant("Available in {{0}} additional variants:", {
      0: numberOfVariants
    });
  }

  _setFields() {
    const _addTag = () => {
      this.startCreationMode();
      this.windowRefService.scrollToElement("#create-new-item");
    };

    this.model = { value: this.initialValue };

    if (!!this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
      this.currentUserSubscription = null;
    }
    this.currentUserSubscription = this.currentUser$
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
                onSearch: (term: string): Observable<any[]> => {
                  return this._onSearch(term);
                },
                labelTemplate: this.equipmentItemLabelTemplate,
                optionTemplate: this.equipmentItemOptionTemplate,
                footerTemplateExtra: this.footerTemplateExtra,
                addTag: !!currentUser && this.enableCreation ? _addTag : undefined,
                addTagPlaceholder: this.translateService.instant("Type to search options or to create a new one..."),
                striped: true,
                multiple: this.multiple,
                closeOnSelect: true,
                enableFullscreen: this.enableFullscreen,
                classNames: "equipment-select"
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
                      if (this.multiple) {
                        if (!!items && items.length > 0 && UtilsService.isObject(items[0])) {
                          this.setValue(items.map(item => item.id));
                        } else {
                          this.setValue(items);
                        }
                      } else {
                        if (!!items && items.length > 0) {
                          if (UtilsService.isObject(items[0])) {
                            this.setValue(items[0].id);
                          } else {
                            this.setValue(items[0]);
                          }
                        } else {
                          this.setValue(null);
                        }
                      }
                    });
                }
              }
            }
          ];
        })
      )
      .subscribe(() => {});

    // The adding and setting here is only happening from the image editor.
    // TODO: account for ID vs OBJECT mode, as right now it's hardcoded as ID, pretty much.
    if (!!this.itemBrowserAddSubscription) {
      this.itemBrowserAddSubscription.unsubscribe();
      this.itemBrowserAddSubscription = null;
    }
    this.itemBrowserAddSubscription = this.actions$
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
            this.setValue([...((this.model.value as EquipmentItem["id"][]) || []), item.id]);
          } else {
            this.setValue([item.id]);
          }
        } else {
          this.setValue(item.id);
        }
      });

    if (!!this.itemBrowserSetSubscription) {
      this.itemBrowserSetSubscription.unsubscribe();
      this.itemBrowserSetSubscription = null;
    }
    this.itemBrowserSetSubscription = this.actions$
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

    this.setValue(this.initialValue);
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

      (value as Type[]).forEach((x: EquipmentItem | EquipmentItem["id"]) =>
        this.store$.dispatch(
          new LoadEquipmentItem({
            id: UtilsService.isObject(x) ? (x as EquipmentItem).id : (x as EquipmentItem["id"]),
            type: this.type
          })
        )
      );

      return forkJoin(
        value.map(itemId =>
          this.store$.select(selectEquipmentItem, { id: itemId, type: this.type }).pipe(
            takeUntil(this.destroyed$),
            filter(item => !!item),
            take(1),
            map(item => this._getNgOptionValue(item))
          )
        )
      );
    }

    this.store$.dispatch(
      new LoadEquipmentItem({
        id: UtilsService.isObject(this.model.value)
          ? (this.model.value as EquipmentItem).id
          : (this.model.value as EquipmentItem["id"]),
        type: this.type
      })
    );

    return this.store$.select(selectEquipmentItem, { id: this.model.value, type: this.type }).pipe(
      filter(item => !!item),
      take(1),
      map(item => this._getNgOptionValue(item))
    );
  }

  _onSearch(q: string): Observable<any[]> {
    return new Observable<any[]>(observer => {
      if (!q || q.length < 1) {
        observer.next();
        observer.complete();
        return;
      }

      this.q = q;

      const field = this.fields[0];
      this.store$.dispatch(
        new FindAllEquipmentItems({
          type: this.type,
          options: {
            query: q
          }
        })
      );

      field.templateOptions.options = this.actions$.pipe(
        ofType(EquipmentActionTypes.FIND_ALL_EQUIPMENT_ITEMS_SUCCESS),
        take(1),
        map((action: FindAllEquipmentItemsSuccess) => action.payload.items),
        map(items => {
          if (items.length > 0) {
            return items
              .filter(item => item.id !== this.excludeId)
              .map(item => {
                return this._getNgOptionValue(item);
              });
          }

          return [];
        }),
        tap(options => {
          observer.next(options);
          observer.complete();
        })
      );
    });
  }

  _getNgOptionValue(item: EquipmentItemBaseInterface): any {
    return {
      value: item.id,
      label: `${!!item.brandName ? item.brandName : this.translateService.instant("(DIY)")} ${item.name}`,
      item
    };
  }
}
