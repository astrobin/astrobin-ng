import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  PLATFORM_ID,
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
import { FormlyFieldConfig, FormlyFormOptions } from "@ngx-formly/core";
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
  FindRecentlyUsedEquipmentItems,
  FindRecentlyUsedEquipmentItemsSuccess,
  ItemBrowserAdd,
  ItemBrowserExitFullscreen,
  ItemBrowserSet,
  LoadBrand,
  LoadEquipmentItem
} from "@features/equipment/store/equipment.actions";
import { filter, first, map, switchMap, take, takeUntil } from "rxjs/operators";
import { Actions, ofType } from "@ngrx/effects";
import { selectBrand, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
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
import { isPlatformBrowser } from "@angular/common";

type Type = EquipmentItem["id"];
type TypeUnion = EquipmentItem["id"] | EquipmentItem["id"][];

export enum ItemBrowserLayout {
  HORIZONTAL,
  VERTICAL,
}

@Component({
  selector: "astrobin-equipment-item-browser",
  templateUrl: "./item-browser.component.html",
  styleUrls: ["./item-browser.component.scss"]
})
export class ItemBrowserComponent extends BaseComponentDirective implements OnInit, OnChanges {
  readonly isPlatformBrowser = isPlatformBrowser;
  readonly EquipmentItemType = EquipmentItemType;

  @Input()
  id = "equipment-item-field";

  @Input()
  type: EquipmentItemType;

  @Input()
  usageType: EquipmentItemUsageType;

  @Input()
  value: TypeUnion = null;

  @Input()
  showItemTypeSelector = false;

  @Input()
  label: string;

  @Input()
  showLabel = true;

  @Input()
  description: string;

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
  enableSelectFrozen = true;

  @Input()
  restrictToUserEquipment = false;

  @Input()
  excludeId: number;

  @Input()
  layout: ItemBrowserLayout = ItemBrowserLayout.HORIZONTAL;

  @Input()
  allowedTypes: EquipmentItemType[] = Object.keys(EquipmentItemType).map(key => EquipmentItemType[key]);

  model: { klass: EquipmentItemType; value: TypeUnion } = {
    klass: null,
    value: null
  };
  form: FormGroup = new FormGroup({});
  fields: FormlyFieldConfig[] = [];
  options: FormlyFormOptions = {
    formState: {
      creationMode: false,
      subCreationMode: false
    }
  };

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

  @ViewChild("fullScreenBodyTemplate")
  fullScreenBodyTemplate: TemplateRef<any>;

  @Output()
  creationModeStarted = new EventEmitter<void>();

  @Output()
  creationModeEnded = new EventEmitter<void>();

  @Output()
  subCreationModeStarted = new EventEmitter<void>();

  @Output()
  subCreationModeEnded = new EventEmitter<void>();

  @Output()
  itemTypeChanged = new EventEmitter<EquipmentItemType>();

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
    public readonly popNotificationsService: PopNotificationsService,
    public readonly utilsService: UtilsService,
    @Inject(PLATFORM_ID) public readonly platformId
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();
    this.utilsService.delay(1).subscribe(() => this._setFields());
  }

  ngOnChanges(changes: SimpleChanges) {
    let equals = false;
    let setFieldsAgain = false;

    if (
      changes.initialValue &&
      changes.initialValue.previousValue !== undefined &&
      changes.initialValue.previousValue !== null &&
      changes.initialValue.currentValue !== undefined &&
      changes.initialValue.currentValue !== null
    ) {
      if (this.multiple) {
        equals =
          [...changes.initialValue.previousValue].sort() + "" === [...changes.initialValue.currentValue].sort() + "";
      } else {
        equals = changes.initialValue.previousValue === changes.initialValue.currentValue;
      }

      if (!equals) {
        setFieldsAgain = true;
      }
    }

    if (changes.required) {
      setFieldsAgain = true;
    }

    if (setFieldsAgain) {
      this._setFields();
    }

    if (changes.type && !!this.form && !!this.form.controls.klass) {
      this.form.get("klass").setValue(changes.type.currentValue);
    }
  }

  reset() {
    const valueField = this._getValueField();

    this.model.value = null;
    this.form.get("value").reset();

    valueField.props = {
      ...valueField.props,
      options: of([])
    };
  }

  startCreationMode() {
    this.options.formState.creationMode = true;
    this.creationModeStarted.emit();
  }

  endCreationMode() {
    this.options.formState.creationMode = false;
    this.creationForm.reset();
    this.creationModel = {};
    this.creationModeEnded.emit();
  }

  startSubCreationMode() {
    this.options.formState.subCreationMode = true;
    this.subCreationModeStarted.emit();
  }

  endSubCreationMode() {
    this.options.formState.subCreationMode = false;
    this.subCreationModeEnded.emit();
  }

  setValue(value: TypeUnion) {
    const _doSetValue = (item: EquipmentItemBaseInterface) => {
      const id = !!item ? item.id : null;
      const fieldConfig = this._getValueField();
      const options = !!item ? [this._getNgOptionValue(item)] : [];

      fieldConfig.props = {
        ...fieldConfig.props,
        options: of(options)
      };

      if (!!this.form.get("value")) {
        this.form.get("value").setValue(id, { onlySelf: true, emitEvent: false });
      }

      this.model = { klass: this.type, value: id };

      this.valueChanged.emit(item);
    };

    const _doSetValues = (items: EquipmentItemBaseInterface[] = []) => {
      const fieldConfig = this._getValueField();
      const options =
        items.length > 0
          ? UtilsService.arrayUniqueObjects(
            items.map(item => this._getNgOptionValue(item)),
            "value"
          )
          : [];
      const ids = items.map(item => item.id);

      fieldConfig.props = {
        ...fieldConfig.props,
        options: of(options)
      };

      this.model = { klass: this.type, value: ids };

      if (this.form.get("value")) {
        this.form.get("value").setValue(ids, { onlySelf: true, emitEvent: false });
      }

      this.valueChanged.emit(items);
    };

    if (this.multiple) {
      if (!value || (value as Type[]).length === 0) {
        _doSetValues([]);
        return;
      }

      (value as Type[]).forEach((id: EquipmentItem["id"]) =>
        this.store$.dispatch(
          new LoadEquipmentItem({
            id,
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
          id: value as Type,
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
      UtilsService.notifyAboutFieldsWithErrors(this.editor.fields, this.popNotificationsService, this.translateService);
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
          this.setValue([...((this.model.value as EquipmentItem["id"][]) || []), value.id]);
        } else {
          this.setValue(value.id);
        }
      };

      if (itemToAdd.frozenAsAmbiguous && !this.enableSelectFrozen) {
        return this.equipmentItemService.cannotSelectedBecauseFrozenAsAmbiguousError();
      }

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
      const componentInstance: VariantSelectorModalComponent = modal.componentInstance;
      componentInstance.variants = [...[item], ...item.variants].filter(variant => !variant.frozenAsAmbiguous);
      componentInstance.enableSelectFrozen = this.enableSelectFrozen;

      modal.closed.pipe(take(1)).subscribe((variant: EquipmentItem) => {
        _doAddItem(variant);

        if (!this.multiple) {
          this.store$.dispatch(new ItemBrowserExitFullscreen());
        }
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
    const item: EquipmentItem = obj.item;

    if (this.enableVariantSelection && item.variants?.length > 0) {
      $event.preventDefault();
      $event.stopPropagation();
      this.addItem(obj.item);
      return true;
    }

    if (item.frozenAsAmbiguous && !this.enableSelectFrozen) {
      $event.preventDefault();
      $event.stopPropagation();
      this.equipmentItemService.cannotSelectedBecauseFrozenAsAmbiguousError();
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

  updateLabelAndDescription(itemType: EquipmentItemType): void {
    if (this.fields && this.fields.length > 0) {
      const field = this._getValueField();

      switch (itemType) {
        case EquipmentItemType.SENSOR:
          field.props = { ...field.props, label: this.translateService.instant("Find sensor") };
          break;
        case EquipmentItemType.CAMERA:
          field.props = { ...field.props, label: this.translateService.instant("Find camera") };
          break;
        case EquipmentItemType.TELESCOPE:
          field.props = { ...field.props, label: this.translateService.instant("Find telescope or lens") };
          break;
        case EquipmentItemType.MOUNT:
          field.props = { ...field.props, label: this.translateService.instant("Find mount") };
          break;
        case EquipmentItemType.ACCESSORY:
          field.props = { ...field.props, label: this.translateService.instant("Find accessory") };
          break;
        case EquipmentItemType.FILTER:
          field.props = { ...field.props, label: this.translateService.instant("Find filter") };
          break;
        case EquipmentItemType.SOFTWARE:
          field.props = { ...field.props, label: this.translateService.instant("Find software") };
          break;
        default:
          field.props = { ...field.props, label: this.translateService.instant("Find equipment item") };
      }

      if (!this.showLabel) {
        field.props = { ...field.props, label: this.translateService.instant("Find equipment item") };
      }

      const valueField = this._getValueField();
      valueField.props = {
        ...valueField.props,
        description: this.description
      };
    }
  }

  onItemSetByBrowsingByProperties(item: EquipmentItem): void {
    if (this.multiple) {
      this.store$.dispatch(new ItemBrowserAdd({ type: this.type, usageType: this.usageType, item }));
    } else {
      this.addItem(item);
    }

    if (!this.multiple) {
      this.store$.dispatch(new ItemBrowserExitFullscreen());
    }
  }

  onCreateClickedBrowsingByProperties(): void {
    this.store$.dispatch(new ItemBrowserExitFullscreen());
    this.q = "";
    this.startCreationMode();
    this.windowRefService.scrollToElement("#create-new-item");
  }

  _setFields() {
    const _addTag = () => {
      this.startCreationMode();
      this.windowRefService.scrollToElement("#create-new-item");
    };

    this.model = { klass: this.type, value: this.value };

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
              fieldGroupClassName: this.layout === ItemBrowserLayout.HORIZONTAL ? "row no-gutters" : "row",
              fieldGroup: [
                {
                  className:
                    this.layout === ItemBrowserLayout.HORIZONTAL ? "col-12 col-lg-3 pr-lg-2 mb-3 mb-lg-0" : "col-12",
                  key: "klass",
                  type: "ng-select",
                  id: "klass",
                  wrappers: ["default-wrapper"],
                  expressions: {
                    "props.disabled": "formState.creationMode"
                  },
                  hideExpression: () => !this.showItemTypeSelector,
                  defaultValue: this.type,
                  props: {
                    label: this.translateService.instant("Item class"),
                    clearable: false,
                    required: true,
                    options: (
                      this.allowedTypes || Object.keys(EquipmentItemType).map(key => key as keyof EquipmentItemType)
                    ).map(itemType => ({
                      value: itemType,
                      label: this.equipmentItemService.humanizeType(itemType)
                    }))
                  },
                  hooks: {
                    onInit: (field: FormlyFieldConfig) => {
                      field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
                        const previousType = this.type;
                        this.type = value;
                        this.updateLabelAndDescription(value);

                        if (value !== previousType) {
                          this.setValue(null);
                        }

                        if (this.restrictToUserEquipment) {
                          this.store$.dispatch(
                            new FindRecentlyUsedEquipmentItems({
                              type: this.model.klass,
                              usageType: null,
                              includeFrozen: true
                            })
                          );

                          this.actions$
                            .pipe(
                              ofType(EquipmentActionTypes.FIND_RECENTLY_USED_EQUIPMENT_ITEMS_SUCCESS),
                              map((action: FindRecentlyUsedEquipmentItemsSuccess) => action.payload),
                              take(1),
                              map(payload => payload.items)
                            )
                            .subscribe(items => {
                              const field = this.fields[0].fieldGroup.find(f => f.key === "value");
                              field.props = {
                                ...field.props,
                                options: of(items.map(item => ({
                                  value: item.id,
                                  label: item.name,
                                  item
                                })))
                              };
                            });
                        }

                        this.itemTypeChanged.emit(value);
                      });
                    }
                  }
                },
                {
                  className:
                    this.showItemTypeSelector && this.layout === ItemBrowserLayout.HORIZONTAL
                      ? "col-12 col-lg-9 pr-lg-2 mb-3 mb-lg-0"
                      : "col-12",
                  key: "value",
                  type: "ng-select",
                  id: `${this.id}`,
                  wrappers: ["default-wrapper"],
                  expressions: {
                    "props.disabled": config => {
                      return this.options.formState.creationMode || !this.model.klass;
                    }
                  },
                  defaultValue: this.model,
                  props: {
                    required: this.required,
                    clearable: true,
                    label: this.showLabel ? this.label || this.translateService.instant("Find equipment item") : null,
                    description: this.description,
                    fullScreenLabel: this.label || this.translateService.instant("Find equipment item"),
                    options: this._getOptions().pipe(takeUntil(this.destroyed$)),
                    onSearch: (term: string): Observable<any[]> => {
                      return this._onSearch(term);
                    },
                    labelTemplate: this.equipmentItemLabelTemplate,
                    optionTemplate: this.equipmentItemOptionTemplate,
                    footerTemplateExtra: this.footerTemplateExtra,
                    addTag: !!currentUser && this.enableCreation ? _addTag : undefined,
                    addTagPlaceholder: this.translateService.instant(
                      "Type to search options or to create a new one..."
                    ),
                    striped: true,
                    multiple: this.multiple,
                    closeOnSelect: true,
                    enableFullscreen: this.enableFullscreen,
                    fullScreenBodyTemplate: this.fullScreenBodyTemplate,
                    showArrow: false,
                    classNames: "equipment-select",
                    enableSelectFrozen: this.enableSelectFrozen
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
                            this.setValue(items.map(item => item.id));
                          } else {
                            if (!!items && items.length > 0) {
                              this.setValue(items[0].id);
                            } else {
                              this.setValue(null);
                            }
                          }
                        });
                    }
                  }
                }
              ]
            }
          ];
        })
      )
      .subscribe(() => {
      });

    // The adding and setting here is only happening from the image editor.
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
        this.addItem(item);
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

    this.setValue(this.value);
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

      (value as Type[]).forEach((id: EquipmentItem["id"]) =>
        this.store$.dispatch(
          new LoadEquipmentItem({
            id,
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
        id: this.model.value as Type,
        type: this.type
      })
    );

    return this.store$.select(selectEquipmentItem, { id: this.model.value, type: this.type }).pipe(
      filter(item => !!item),
      take(1),
      map(item => this._getNgOptionValue(item))
    );
  }

  _onSearchRestrictedToUserEquipment(q: string): Observable<any[]> {
    return this.currentUser$.pipe(
      switchMap(currentUser => {
        if (!currentUser) {
          return of([]);
        }

        this.store$.dispatch(
          new FindRecentlyUsedEquipmentItems({
            type: this.model.klass,
            usageType: null,
            includeFrozen: true,
            query: q
          })
        );

        return this.actions$.pipe(
          ofType(EquipmentActionTypes.FIND_RECENTLY_USED_EQUIPMENT_ITEMS_SUCCESS),
          map((action: FindRecentlyUsedEquipmentItemsSuccess) => action.payload),
          take(1),
          map(payload => payload.items)
        );
      })
    );
  }

  _onSearchUnrestricted(q: string): Observable<any[]> {
    this.store$.dispatch(
      new FindAllEquipmentItems({
        type: this.type,
        options: {
          query: q
        }
      })
    );

    return this.actions$.pipe(
      ofType(EquipmentActionTypes.FIND_ALL_EQUIPMENT_ITEMS_SUCCESS),
      take(1),
      map((action: FindAllEquipmentItemsSuccess) => action.payload.items)
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

      let searchMethod: (q: string) => Observable<any[]>;

      if (this.restrictToUserEquipment) {
        searchMethod = this._onSearchRestrictedToUserEquipment.bind(this);
      } else {
        searchMethod = this._onSearchUnrestricted.bind(this);
      }

      searchMethod(q).subscribe((items: EquipmentItemBaseInterface[]) => {
        items = items
          .filter(item => item.id !== this.excludeId)
          .map(item => {
            return this._getNgOptionValue(item);
          });

        const field = this._getValueField();
        field.props = { ...field.props, options: of(items) };
        observer.next(items);
        observer.complete();
      });
    });
  }

  _getNgOptionValue(item: EquipmentItemBaseInterface): any {
    return {
      value: item.id,
      label: `${!!item.brandName ? item.brandName : this.translateService.instant("(DIY)")} ${item.name}`,
      item
    };
  }

  _getValueField(): FormlyFieldConfig {
    return this.fields[0].fieldGroup[1];
  }
}
