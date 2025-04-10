import {
  AfterViewInit,
  ElementRef,
  OnInit,
  TemplateRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { LoadContentType, LoadContentTypeById } from "@app/store/actions/content-type.actions";
import { selectRequestCountry } from "@app/store/selectors/app/app.selectors";
import { selectContentType, selectContentTypeById } from "@app/store/selectors/app/content-type.selectors";
import { MainState } from "@app/store/state";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { CountryService } from "@core/services/country.service";
import { EquipmentItemService } from "@core/services/equipment-item.service";
import { GoogleMapsService } from "@core/services/google-maps/google-maps.service";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { UserService } from "@core/services/user.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import {
  MarketplaceLineItemFindItemMode,
  MarketplaceListingCondition,
  MarketplaceShippingCostType
} from "@features/equipment/types/marketplace-line-item.interface";
import {
  MarketplaceListingExpiration,
  MarketplaceListingShippingMethod,
  MarketplaceListingType,
  MarketplaceListingInterface
} from "@features/equipment/types/marketplace-listing.interface";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ItemBrowserLayout } from "@shared/components/equipment/item-browser/item-browser.component";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { FormlyFieldEquipmentItemBrowserComponent } from "@shared/components/misc/formly-field-equipment-item-browser/formly-field-equipment-item-browser.component";
import { Constants } from "@shared/constants";
import * as countryJs from "country-js";
import { forkJoin } from "rxjs";
import { filter, map, startWith, switchMap, take, takeUntil, tap } from "rxjs/operators";

declare let google: any;

export enum MARKETPLACE_SALE_TYPE {
  MULTIPLE_IN_A_BUNDLE = "multiple-in-a-bundle",
  MULTIPLE_SEPARATELY = "multiple-separately",
  SINGLE = "single"
}

export interface MarketplaceListingFormInitialCountInterface {
  count?: number;
  saleType?: MARKETPLACE_SALE_TYPE;
}

@Component({
  selector: "astrobin-marketplace-listing-form",
  templateUrl: "./marketplace-listing-form.component.html",
  styleUrls: ["./marketplace-listing-form.component.scss"]
})
export class MarketplaceListingFormComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  @ViewChild("multipleSaleOptionTemplate")
  multipleSaleOptionTemplate: TemplateRef<any>;

  @Input()
  model: MarketplaceListingInterface = {
    listingType: MarketplaceListingType.FOR_SALE,
    created: null,
    updated: null,
    approved: null,
    approvedBy: null,
    expiration: null,
    title: null,
    description: null,
    deliveryByBuyerPickUp: true,
    deliveryBySellerDelivery: true,
    deliveryByShipping: true,
    shippingMethod: null,
    latitude: null,
    longitude: null,
    country: null,
    areaLevel1: null,
    city: null,
    lineItems: [
      {
        listing: null,
        created: null,
        updated: null,
        sold: null,
        soldTo: null,
        reserved: null,
        reservedTo: null,
        price: null,
        currency: null,
        condition: null,
        yearOfPurchase: null,
        shippingCostType: MarketplaceShippingCostType.FIXED,
        shippingCost: null,
        description: null,
        findItemMode: MarketplaceLineItemFindItemMode.PLAIN,
        itemObjectId: null,
        itemContentType: null,
        itemContentTypeSelector: null,
        images: []
      }
    ]
  };
  form: FormGroup = new FormGroup({});
  formInitialized = false;
  fields: FormlyFieldConfig[];

  initialLineItemCountModel: MarketplaceListingFormInitialCountInterface = {
    count: 0,
    saleType: null
  };
  initialLineItemCountForm = new FormGroup({});
  initialLineItemCountFields: FormlyFieldConfig[];
  initialLineItemCount = null;

  googleMapsAvailable = false;

  @Output()
  save: EventEmitter<MarketplaceListingInterface & MarketplaceListingFormInitialCountInterface> =
    new EventEmitter<MarketplaceListingInterface>();

  @ViewChild("findItemModeOptionTemplate")
  findItemModeOptionTemplate: TemplateRef<any>;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly modalService: NgbModal,
    public readonly router: Router,
    public readonly activatedRoute: ActivatedRoute,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly googleMapsService: GoogleMapsService,
    public readonly countryService: CountryService,
    public readonly elementRef: ElementRef,
    public readonly utilsService: UtilsService,
    public readonly userService: UserService
  ) {
    super(store$);
  }

  async ngOnInit() {
    super.ngOnInit();
    await this.googleMapsService.loadGoogleMaps();
  }

  ngAfterViewInit() {
    this.googleMapsAvailable = !!this.googleMapsService.maps;

    const providedLineItemCount = this.activatedRoute.snapshot.queryParams.lineItemCount;
    const isWanted = this.activatedRoute.snapshot.queryParams.wanted === "true";

    if (isWanted) {
      this.model.listingType = MarketplaceListingType.WANTED;
      this.initialLineItemCountModel.saleType = MARKETPLACE_SALE_TYPE.SINGLE;
      this.initialLineItemCountModel.count = 1;
      this.initialLineItemCount = 1;
    } else if (providedLineItemCount && providedLineItemCount === "1") {
      this.initialLineItemCount = parseInt(providedLineItemCount, 10);
    } else if (this.model.id) {
      this.initialLineItemCount = this.model.lineItems.length;
    } else {
      this._initInitialLineItemCountFields();
    }

    this._initFields();
  }

  setFirstFormlyGroupVisible() {
    this.utilsService.delay(100).subscribe(() => {
      const lineItemGroups = this.elementRef.nativeElement.querySelectorAll(".field-group-line-items");
      if (lineItemGroups.length > 0) {
        lineItemGroups.forEach((group: HTMLElement) => {
          const elements = group.querySelectorAll(":scope > formly-field:not(.hidden)");
          if (elements.length > 0) {
            elements[0].classList.add("first-visible");
            elements[elements.length - 1].classList.add("last-visible");
          }
        });
      }
    });
  }

  setInitialLineItemCount(event: Event) {
    event.stopPropagation();

    if (this.initialLineItemCountForm.get("terms") && !this.initialLineItemCountForm.get("terms").value) {
      this.popNotificationsService.error(this.translateService.instant("You must agree to the terms of service."));
      return;
    }

    this.initialLineItemCount = this.initialLineItemCountForm.get("count").value;
    this._initFields();
  }

  onSave(event: Event) {
    event.stopPropagation();

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      UtilsService.notifyAboutFieldsWithErrors(this.fields, this.popNotificationsService, this.translateService);
      return;
    }

    this.save.emit({ ...this.form.value, ...this.initialLineItemCountForm.value });
  }

  onCancel(event: Event) {
    event.stopPropagation();

    const _doCancel = () => {
      this.form.reset();
      this.router.navigate(["../"], { relativeTo: this.activatedRoute });
    };

    if (this.form.dirty) {
      const modal = this.modalService.open(ConfirmationDialogComponent);
      modal.componentInstance.message = this.translateService.instant("This will discard your changes.");
      modal.closed.pipe(take(1)).subscribe(result => {
        _doCancel();
      });
    } else {
      _doCancel();
    }
  }

  formPreviewClicked(event: Event) {
    event.stopPropagation();

    this.popNotificationsService.info(
      this.translateService.instant(
        "This is a preview of your listing. You can't edit it here. If you want to make changes, please use the form area."
      )
    );
  }

  private _initInitialLineItemCountFields() {
    this.currentUserProfile$.pipe(take(1)).subscribe(userProfile => {
      this.initialLineItemCountFields = [
        {
          key: "saleType",
          type: "custom-radio",
          wrappers: ["default-wrapper"],
          defaultValue: null,
          props: {
            required: true,
            label: this.translateService.instant("How many items do you want to sell?"),
            options: [
              {
                value: MARKETPLACE_SALE_TYPE.SINGLE,
                label: this.translateService.instant("Just one"),
                description: this.translateService.instant("Create a listing for a single item.")
              },
              {
                value: MARKETPLACE_SALE_TYPE.MULTIPLE_IN_A_BUNDLE,
                label: this.translateService.instant("Multiple items in a bundle"),
                description: this.translateService.instant(
                  "All items in the bundle will be sold together. Users will not be able to make offers for " +
                    "individual items."
                )
              },
              {
                value: MARKETPLACE_SALE_TYPE.MULTIPLE_SEPARATELY,
                label: this.translateService.instant("Multiple items separately"),
                description: this.translateService.instant(
                  "AstroBin will automatically create multiple listings for each item in the bundle, " +
                    "allowing users to make offers for individual items. All listings will share common " +
                    "information, such as the location of the objects and the shipping method."
                )
              }
            ]
          },
          hooks: {
            onInit: (field: FormlyFieldConfig) => {
              field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
                if (value === MARKETPLACE_SALE_TYPE.SINGLE) {
                  this.initialLineItemCountModel.count = 1;
                  this.initialLineItemCountForm.patchValue({ count: 1 });
                } else {
                  this.initialLineItemCountModel.count = null;
                  this.initialLineItemCountForm.patchValue({ count: null });
                }
              });
            }
          }
        },
        {
          key: "count",
          type: "custom-number",
          wrappers: ["default-wrapper"],
          defaultValue: 1,
          props: {
            label: this.translateService.instant("How many?"),
            placeholder: this.translateService.instant("Enter a number"),
            description: this.translateService.instant(
              "The AstroBin Marketplace supports multiple line items per listing. This makes it easy for you to " +
                "have a bundle sale or avoid repeating the same information in multiple listings if you're selling " +
                "multiple items. PS: you can always add more line items later."
            ),
            min: 1
          },
          expressions: {
            className: (config: FormlyFieldConfig) =>
              config.model.saleType === MARKETPLACE_SALE_TYPE.SINGLE || config.model.saleType === null ? "hidden" : "",
            "props.required": config => config.model.saleType !== MARKETPLACE_SALE_TYPE.SINGLE
          }
        },
        {
          key: "terms",
          type: "checkbox",
          wrappers: ["default-wrapper"],
          defaultValue: false,
          props: {
            label: this.translateService.instant("I agree to the AstroBin Marketplace terms of service"),
            description: this.translateService.instant(
              "By creating a listing on the AstroBin Marketplace, you agree to the {{0}}terms of service{{1}}.",
              {
                0: `<a href="${this.classicRoutesService.MARKETPLACE_TERMS}" target="_blank">`,
                1: "</a>"
              }
            ),
            required: true
          },
          expressions: {
            hide: () => !!userProfile.agreedToMarketplaceTerms
          }
        }
      ];
    });
  }

  private _initFields() {
    const _preprocessModel = (model: MarketplaceListingInterface): MarketplaceListingInterface => {
      if (!!model.lineItems && model.lineItems.length > 0) {
        model.lineItems = model.lineItems.map(lineItem => {
          lineItem.images = lineItem.images.map(image => image.imageFile);
          lineItem.listing = model.id;
          lineItem.findItemMode =
            lineItem.findItemMode ||
            (lineItem.itemPlainText ? MarketplaceLineItemFindItemMode.PLAIN : MarketplaceLineItemFindItemMode.USER);
          return lineItem;
        });
      }

      return model;
    };

    const _doInitFields = (
      lineItemMap: Map<number, EquipmentItemType>,
      initialCurrency: string,
      isModerator: boolean
    ) => {
      this.model = _preprocessModel(this.model);

      this.fields = [
        {
          key: "id",
          type: "input",
          className: "hidden"
        },
        {
          key: "hash",
          type: "input",
          className: "hidden"
        },
        {
          key: "user",
          type: "input",
          className: "hidden"
        },
        {
          key: "latitude",
          type: "input",
          className: "hidden"
        },
        {
          key: "longitude",
          type: "input",
          className: "hidden"
        },
        {
          key: "listingType",
          type: "input",
          className: "hidden"
        },
        {
          key: "lineItems",
          type: "array",
          wrappers: ["default-wrapper"],
          fieldArray: {
            props: {
              addLabel: this.translateService.instant("Add another item to this listing"),
              mayAdd: () => this.initialLineItemCount > 1,
              mayRemove: index => !this.model.lineItems[index].sold,
              collapsible: this.initialLineItemCount > 1
            },
            expressions: {
              "props.label": config => {
                const index = this.model.lineItems.indexOf(config.model);
                const isWanted = this.model.listingType === MarketplaceListingType.WANTED;

                if (isWanted) {
                  return this.translateService.instant("Equipment item wanted");
                }

                return this.initialLineItemCount > 1
                  ? this.translateService.instant("Equipment item for sale") + ` #${index + 1}`
                  : this.translateService.instant("Equipment item for sale");
              },
              fieldGroupClassName: config => {
                let className = "field-group-line-items";

                if (config.model.sold) {
                  className += " sold";
                } else if (config.model.reserved) {
                  className += " reserved";
                }

                return className;
              }
            },
            fieldGroup: [
              {
                type: "formly-template",
                template: this.translateService.instant("You cannot edit this line item because it has been sold."),
                expressions: {
                  className: config => {
                    let className = "cannot-edit-because-sold";

                    // Add hidden class if this is not a sold item
                    if (!config.model.sold) {
                      className += " hidden";
                    }

                    return className;
                  }
                }
              },
              {
                type: "formly-template",
                template: this.translateService.instant(
                  "You cannot edit this line item because it's marked as reserved."
                ),
                className: "cannot-edit-because-reserved",
                expressions: {
                  className: config => {
                    let className = "cannot-edit-because-reserved";

                    // Add hidden class if this is not a reserved item
                    if (!config.model.reserved) {
                      className += " hidden";
                    }

                    return className;
                  }
                }
              },
              {
                key: "id",
                type: "input",
                className: "hidden"
              },
              {
                key: "hash",
                type: "input",
                className: "hidden"
              },
              {
                key: "user",
                type: "input",
                className: "hidden"
              },
              {
                key: "listing",
                type: "input",
                className: "hidden",
                defaultValue: this.model.id
              },
              {
                key: "created",
                type: "input",
                className: "hidden"
              },
              {
                key: "updated",
                type: "input",
                className: "hidden"
              },
              {
                key: "reserved",
                type: "input",
                className: "hidden"
              },
              {
                key: "reservedTo",
                type: "input",
                className: "hidden"
              },
              {
                key: "sold",
                type: "input",
                className: "hidden"
              },
              {
                key: "soldTo",
                type: "input",
                className: "hidden"
              },
              {
                key: "findItemMode",
                type: "ng-select",
                wrappers: ["default-wrapper"],
                className: "border-bottom-0 pb-0",
                props: {
                  required: true,
                  searchable: false,
                  clearable: false,
                  label: this.translateService.instant("How do you want to input your item?"),
                  optionTemplate: this.findItemModeOptionTemplate,
                  options: [
                    {
                      label: this.translateService.instant("Simple text"),
                      description: this.translateService.instant(
                        "Keep things simple and let a moderator associate your " +
                          "listing to an equipment item in the AstroBin equipment database."
                      ),
                      value: MarketplaceLineItemFindItemMode.PLAIN
                    },
                    {
                      label: this.translateService.instant("Search equipment used on your images"),
                      description: this.translateService.instant(
                        "Associate this listing to an equipment item you have used on your images."
                      ),
                      value: MarketplaceLineItemFindItemMode.USER
                    },
                    {
                      label: this.translateService.instant("Search all equipment available on AstroBin"),
                      description: this.translateService.instant(
                        "Associate this listing to any equipment item available on AstroBin."
                      ),
                      value: MarketplaceLineItemFindItemMode.ALL
                    }
                  ]
                },
                expressions: {
                  "props.options": () => {
                    const simpleTextOption = {
                      label: this.translateService.instant("Simple text"),
                      description: this.translateService.instant(
                        "Keep things simple and let a moderator associate your " +
                          "listing to an equipment item in the AstroBin equipment database."
                      ),
                      value: MarketplaceLineItemFindItemMode.PLAIN
                    };

                    const userOption = {
                      label: this.translateService.instant("Search equipment used on your images"),
                      description: this.translateService.instant(
                        "Associate this listing to an equipment item you have used on your images."
                      ),
                      value: MarketplaceLineItemFindItemMode.USER
                    };

                    const allOption = {
                      label: this.translateService.instant("Search all equipment available on AstroBin"),
                      description: this.translateService.instant(
                        "Associate this listing to any equipment item available on AstroBin."
                      ),
                      value: MarketplaceLineItemFindItemMode.ALL
                    };

                    const isWanting = this.model.listingType === MarketplaceListingType.WANTED;

                    if (isWanting) {
                      return [simpleTextOption, allOption];
                    }

                    return [simpleTextOption, userOption, allOption];
                  }
                }
              },
              {
                key: "itemContentType",
                type: "input",
                className: "hidden"
              },
              {
                key: "itemContentTypeSelector",
                type: "ng-select",
                wrappers: ["default-wrapper"],
                className: "border-top-0 border-bottom-0 pb-0",
                expressions: {
                  hide: config => config.model.findItemMode !== MarketplaceLineItemFindItemMode.PLAIN,
                  "props.required": config => config.model.findItemMode === MarketplaceLineItemFindItemMode.PLAIN,
                  "props.label": () => {
                    const isWanted = this.model.listingType === MarketplaceListingType.WANTED;
                    return isWanted
                      ? this.translateService.instant("What kind of item are you looking for?")
                      : this.translateService.instant("What kind of item are you selling?");
                  }
                },
                props: {
                  options: [
                    EquipmentItemType.CAMERA,
                    EquipmentItemType.TELESCOPE,
                    EquipmentItemType.MOUNT,
                    EquipmentItemType.FILTER,
                    EquipmentItemType.ACCESSORY,
                    EquipmentItemType.SOFTWARE
                  ].map(itemType => ({
                    label: this.equipmentItemService.humanizeType(itemType),
                    value: itemType
                  }))
                },
                hooks: {
                  onInit: field => {
                    const index = this.model.lineItems.indexOf(field.parent.model);
                    if (this.model.lineItems[index].itemContentType) {
                      this._setContentTypeSelectorValue(field, this.model.lineItems[index].itemContentType);
                    }
                    field.formControl.valueChanges.subscribe((value: EquipmentItemType) => {
                      this._setContentTypeValue(field, value);
                    });
                  }
                }
              },
              {
                key: "itemPlainText",
                type: "input",
                wrappers: ["default-wrapper"],
                className: "border-top-0",
                props: {
                  label: this.translateService.instant("What are you selling?"),
                  description: this.translateService.instant(
                    "Enter only one item. If you want to sell multiple items, add them as separate line items " +
                      "using the button below."
                  )
                },
                expressions: {
                  hide: config => config.model.findItemMode !== MarketplaceLineItemFindItemMode.PLAIN,
                  "props.required": config => config.model.findItemMode === MarketplaceLineItemFindItemMode.PLAIN,
                  "props.label": () => {
                    const isWanted = this.model.listingType === MarketplaceListingType.WANTED;
                    return isWanted
                      ? this.translateService.instant("What are you looking for?")
                      : this.translateService.instant("What are you selling?");
                  },
                  "props.description": () => {
                    const isWanted = this.model.listingType === MarketplaceListingType.WANTED;

                    if (isWanted) {
                      return null;
                    }

                    if (this.initialLineItemCount > 1) {
                      return this.translateService.instant(
                        "Enter only one item. If you want to sell multiple items, add them as separate line items " +
                          "using the button below."
                      );
                    }

                    return null;
                  }
                }
              },
              {
                key: "itemObjectId",
                type: "equipment-item-browser",
                wrappers: ["default-wrapper"],
                props: {
                  quickAddRecentFromUserId: null,
                  showPlaceholderImage: false,
                  multiple: false,
                  enableCreation: false,
                  showItemTypeSelector: true,
                  layout: ItemBrowserLayout.VERTICAL,
                  itemType: lineItemMap.get(0),
                  allowedTypes: [
                    EquipmentItemType.CAMERA,
                    EquipmentItemType.TELESCOPE,
                    EquipmentItemType.MOUNT,
                    EquipmentItemType.FILTER,
                    EquipmentItemType.ACCESSORY,
                    EquipmentItemType.SOFTWARE
                  ]
                },
                expressions: {
                  hide: config => config.model.findItemMode === MarketplaceLineItemFindItemMode.PLAIN,
                  "props.required": config => config.model.findItemMode !== MarketplaceLineItemFindItemMode.PLAIN,
                  "props.restrictToUserEquipment": config => {
                    return config.model.findItemMode === MarketplaceLineItemFindItemMode.USER;
                  }
                },
                hooks: {
                  onInit: field => {
                    let componentInstance: FormlyFieldEquipmentItemBrowserComponent;
                    for (const ref of (field as any)._componentRefs) {
                      if (ref.instance instanceof FormlyFieldEquipmentItemBrowserComponent) {
                        componentInstance = ref.instance;
                      }
                    }

                    if (!!componentInstance) {
                      const index = this.model.lineItems.indexOf(field.model);
                      field.props.itemType = lineItemMap.get(index);

                      componentInstance.itemTypeChanged.subscribe((value: EquipmentItemType) => {
                        this._setContentTypeValue(field, value);
                      });
                    }
                  }
                }
              },
              {
                key: "",
                fieldGroupClassName: "row",
                props: {
                  label: this.translateService.instant("Item information")
                },
                fieldGroup: [
                  {
                    key: "condition",
                    type: "ng-select",
                    wrappers: ["default-wrapper"],
                    defaultValue: MarketplaceListingCondition.USED,
                    props: {
                      required: true,
                      label: this.translateService.instant("Condition"),
                      options: Object.keys(MarketplaceListingCondition).map(key => ({
                        value: key,
                        label: this.equipmentItemService.humanizeCondition(MarketplaceListingCondition[key])
                      }))
                    },
                    expressions: {
                      className: () => {
                        const isWanted = this.model.listingType === MarketplaceListingType.WANTED;
                        return isWanted ? "hidden" : "col-12 col-lg-6";
                      }
                    }
                  },
                  {
                    key: "yearOfPurchase",
                    type: "custom-number",
                    wrappers: ["default-wrapper"],
                    props: {
                      label: this.translateService.instant("Year of purchase")
                    },
                    expressions: {
                      className: () => {
                        const isWanted = this.model.listingType === MarketplaceListingType.WANTED;
                        return isWanted ? "hidden" : "col-12 col-lg-6";
                      }
                    },
                    validators: {
                      validation: [
                        { name: "min-value", options: { minValue: 1900 } },
                        { name: "max-value", options: { maxValue: new Date().getFullYear() } }
                      ]
                    }
                  },
                  {
                    key: "description",
                    type: "textarea",
                    wrappers: ["default-wrapper"],
                    props: {
                      label: this.translateService.instant("Description"),
                      description: this.translateService.instant(
                        "Describe the item you are selling. This field refers to this specific equipment item, " +
                          "and down below you can find a Description field that refers to the entire listing."
                      ),
                      rows: 4,
                      modelOptions: {
                        updateOn: "blur"
                      }
                    },
                    expressions: {
                      "props.description": () => {
                        const isWanted = this.model.listingType === MarketplaceListingType.WANTED;

                        if (isWanted) {
                          return this.translateService.instant("Describe the item you are looking for.");
                        }

                        if (this.initialLineItemCount === 1) {
                          return this.translateService.instant("Describe the item you are selling.");
                        }

                        return this.translateService.instant(
                          "Describe the item you are selling. This field refers to this specific equipment item, " +
                            "and down below you can find a Description field that refers to the entire listing."
                        );
                      }
                    }
                  }
                ]
              },
              {
                key: "",
                props: {
                  label: this.translateService.instant("Pricing information")
                },
                fieldGroup: [
                  {
                    key: "",
                    fieldGroupClassName: "row",
                    fieldGroup: [
                      {
                        key: "currency",
                        type: "ng-select",
                        wrappers: ["default-wrapper"],
                        defaultValue: initialCurrency,
                        className: "col-12",
                        props: {
                          label: this.translateService.instant("Currency"),
                          options: Object.keys(Constants.ALL_CURRENCIES).map(code => ({
                            value: code,
                            label: `${Constants.ALL_CURRENCIES[code]} (${code})`
                          })),
                          placeholder: this.translateService.instant("Select a currency")
                        },
                        expressions: {
                          "props.required": () => {
                            const isWanted = this.model.listingType === MarketplaceListingType.WANTED;
                            return !isWanted;
                          }
                        }
                      },
                      {
                        key: "price",
                        type: "custom-number",
                        wrappers: ["default-wrapper"],
                        className: "col-12",
                        props: {
                          min: 0,
                          label: this.translateService.instant("Price")
                        },
                        expressions: {
                          "props.required": () => {
                            const isWanted = this.model.listingType === MarketplaceListingType.WANTED;
                            return !isWanted;
                          }
                        }
                      },
                      {
                        key: "shippingCostType",
                        type: "ng-select",
                        wrappers: ["default-wrapper"],
                        className: "col-12",
                        props: {
                          required: true,
                          label: this.translateService.instant("Shipping cost type"),
                          options: Object.keys(MarketplaceShippingCostType).map(key => ({
                            value: key,
                            label: this.equipmentItemService.humanizeShippingCostType(MarketplaceShippingCostType[key])
                          }))
                        },
                        hooks: {
                          onInit: (field: FormlyFieldConfig) => {
                            field.formControl.valueChanges
                              .pipe(takeUntil(this.destroyed$))
                              .subscribe((value: MarketplaceShippingCostType) => {
                                const listing = this.model;
                                const index = listing.lineItems.indexOf(field.model);
                                const lineItem = listing.lineItems[index];

                                if (value === MarketplaceShippingCostType.NO_SHIPPING) {
                                  lineItem.shippingCost = null;
                                  this.form.get(`lineItems.${index}`).patchValue({ shippingCost: null });
                                } else if (value === MarketplaceShippingCostType.COVERED_BY_SELLER) {
                                  listing.deliveryByShipping = true;
                                  this.form.get("deliveryByShipping").patchValue(true);
                                  lineItem.shippingCost = 0;
                                  this.form.get(`lineItems.${index}`).patchValue({ shippingCost: 0 });
                                } else if (value === MarketplaceShippingCostType.FIXED) {
                                  listing.deliveryByShipping = true;
                                  this.form.get("deliveryByShipping").patchValue(true);
                                } else if (value === MarketplaceShippingCostType.TO_BE_AGREED) {
                                  listing.deliveryByShipping = true;
                                  this.form.get("deliveryByShipping").patchValue(true);
                                  lineItem.shippingCost = null;
                                  this.form.get(`lineItems.${index}`).patchValue({ shippingCost: null });
                                }

                                // If all line items have NO_SHIPPING, set deliveryByShipping to false and shippingMethod to null
                                if (
                                  listing.lineItems.every(
                                    item => item.shippingCostType === MarketplaceShippingCostType.NO_SHIPPING
                                  )
                                ) {
                                  listing.deliveryByShipping = false;
                                  this.form.get("deliveryByShipping").patchValue(false);
                                  listing.shippingMethod = null;
                                  this.form.get("shippingMethod").patchValue(null);
                                }

                                this.model = { ...listing, lineItems: [...listing.lineItems] };
                              });
                          }
                        }
                      },
                      {
                        key: "shippingCost",
                        type: "custom-number",
                        wrappers: ["default-wrapper"],
                        className: "col-12",
                        expressions: {
                          hide: field => {
                            const index = this.model.lineItems.indexOf(field.model);
                            const lineItem = this.model.lineItems[index];
                            return (
                              !this.model.deliveryByShipping ||
                              lineItem.shippingCostType !== MarketplaceShippingCostType.FIXED
                            );
                          }
                        },
                        props: {
                          label: this.translateService.instant("Shipping cost"),
                          description: this.translateService.instant("Leave blank for free shipping"),
                          min: 0
                        }
                      }
                    ]
                  }
                ],
                expressions: {
                  className: () => {
                    const isWanted = this.model.listingType === MarketplaceListingType.WANTED;
                    return isWanted ? "hidden" : "";
                  }
                }
              },
              {
                key: "images",
                type: "file",
                wrappers: ["default-wrapper"],
                props: {
                  label: this.translateService.instant("Images"),
                  accept: "image/jpeg, image/png",
                  image: true,
                  multiple: true,
                  maxFiles: 20
                },
                expressions: {
                  className: () => {
                    const isWanted = this.model.listingType === MarketplaceListingType.WANTED;
                    return isWanted ? "hidden" : "col-12";
                  },
                  "props.required": () => {
                    const isWanted = this.model.listingType === MarketplaceListingType.WANTED;
                    return !isWanted;
                  }
                },
                validators: {
                  validation: [
                    {
                      name: "file-size",
                      options: { max: 1024 * 1024 * 10 }
                    },
                    {
                      name: "image-or-video-file"
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          key: "",
          wrappers: ["card-wrapper"],
          props: {
            label: this.translateService.instant("General information")
          },
          fieldGroup: [
            {
              key: "title",
              type: "input",
              wrappers: ["default-wrapper"],
              expressions: {
                hide: () =>
                  (this.model.lineItems.length === 1 ||
                    this.initialLineItemCountModel.saleType === MARKETPLACE_SALE_TYPE.MULTIPLE_SEPARATELY) &&
                  !this.model.title &&
                  !isModerator
              },
              props: {
                label: this.translateService.instant("Title for the entire listing"),
                description: this.translateService.instant(
                  "If omitted, AstroBin will use the equipment item names to create a title."
                ),
                required: false,
                modelOptions: {
                  updateOn: "blur"
                },
                maxLength: 256
              }
            },
            {
              key: "description",
              type: "textarea",
              wrappers: ["default-wrapper"],
              expressions: {
                hide: () =>
                  (this.model.lineItems.length === 1 ||
                    this.initialLineItemCountModel.saleType === MARKETPLACE_SALE_TYPE.MULTIPLE_SEPARATELY) &&
                  !this.model.description
              },
              props: {
                label: this.translateService.instant("Description for the entire listing"),
                description: this.translateService.instant(
                  "This description field is for generic information that pertain this listing. You can find " +
                    "Description field for individual equipment items above. Please do not list your equipment items " +
                    "here, but rather describe the listing as a whole, if needed. If you're selling multiple items, " +
                    "please add multiple equipment items above."
                ),
                rows: 6,
                modelOptions: {
                  updateOn: "blur"
                }
              }
            },
            {
              key: "",
              fieldGroupClassName: "row",
              fieldGroup: [
                {
                  key: "country",
                  type: "ng-select",
                  className: this.googleMapsAvailable ? "hidden" : "col-6 mb-0",
                  props: {
                    label: this.translateService.instant("Country"),
                    options: this.countryService.getCountries(this.translateService.currentLang).map(country => ({
                      value: country.code,
                      label: country.name
                    }))
                  },
                  expressions: {
                    "props.required": () => !this.googleMapsAvailable
                  }
                },
                {
                  key: "areaLevel1",
                  type: "input",
                  className: this.googleMapsAvailable ? "hidden" : "col-6 mb-0",
                  props: {
                    label: this.translateService.instant("Country")
                  },
                  expressions: {
                    "props.required": () => !this.googleMapsAvailable,
                    "props.label": () => {
                      const regionLabels = {
                        US: "State",
                        IT: "Regione",
                        CH: "Canton",
                        CA: "Province",
                        AU: "State",
                        DE: "Bundesland",
                        FR: "Région",
                        ES: "Comunidad Autónoma",
                        GB: "Country",
                        BR: "Estado",
                        MX: "Estado",
                        JP: "Prefecture",
                        CN: "Province",
                        IN: "State",
                        RU: "Oblast"
                      };

                      return regionLabels[this.model.country] || this.translateService.instant("State/Region");
                    }
                  }
                },
                {
                  key: "city",
                  type: "input",
                  className: this.googleMapsAvailable ? "hidden" : "col-6 mb-0",
                  props: {
                    label: this.translateService.instant("City")
                  },
                  expressions: {
                    "props.required": () => !this.googleMapsAvailable
                  }
                },
                {
                  key: "",
                  type: "google-map",
                  wrappers: ["default-wrapper"],
                  className: this.googleMapsAvailable ? "col-12" : "hidden",
                  props: {
                    height: 300,
                    label: this.translateService.instant("Location"),
                    required: true,
                    description: this.translateService.instant(
                      "Drag the map to set the location. AstroBin will not disclose your exact location, but " +
                        "only the city and country where the item is located. The location information will be used to " +
                        "find listings within a certain distance from the user's location."
                    ),
                    scrollwheel: false,
                    latitude: this.model.latitude,
                    longitude: this.model.longitude
                  },
                  validators: {
                    validation: ["valid-coordinates"]
                  },
                  hooks: {
                    onInit: field => {
                      const form = field.parent.formControl;

                      field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(coordinates => {
                        if (coordinates) {
                          const geocoder = new google.maps.Geocoder();

                          geocoder.geocode({ location: coordinates }, (results, status) => {
                            if (status === "OK") {
                              if (results[0]) {
                                const addressComponents = results[0].address_components;
                                const country =
                                  this.googleMapsService.getCountryFromAddressComponent(addressComponents);
                                const region = this.googleMapsService.getRegionFromAddressComponent(addressComponents);
                                const city = this.googleMapsService.getCityFromAddressComponent(addressComponents);

                                if (country) {
                                  form.get("country").setValue(country);
                                }

                                if (region) {
                                  form.get("areaLevel1").setValue(region);
                                }

                                if (city) {
                                  form.get("city").setValue(city);
                                }
                              }
                            }
                          });

                          form.get("latitude").setValue(coordinates.lat());
                          form.get("longitude").setValue(coordinates.lng());
                        }
                      });
                    }
                  }
                }
              ]
            },
            {
              key: "",
              type: "ng-select",
              wrappers: ["default-wrapper"],
              defaultValue: MarketplaceListingExpiration.ONE_MONTH,
              props: {
                readonly: this.model.id !== undefined,
                label: this.translateService.instant("Expiration"),
                options: [
                  {
                    value: MarketplaceListingExpiration.ONE_WEEK,
                    label: this.translateService.instant("One week")
                  },
                  {
                    value: MarketplaceListingExpiration.TWO_WEEKS,
                    label: this.translateService.instant("Two weeks")
                  },
                  {
                    value: MarketplaceListingExpiration.ONE_MONTH,
                    label: this.translateService.instant("One month")
                  }
                ],
                required: true,
                description: this.translateService.instant(
                  "After this period, the listing will be automatically removed from the marketplace, but " +
                    "you will be able to renew it."
                )
              },
              hooks: {
                onInit: field => {
                  field.formControl.valueChanges
                    .pipe(takeUntil(this.destroyed$), startWith(field.formControl.value))
                    .subscribe(value => {
                      if (!!value) {
                        const now = new Date();
                        const expirationDate = new Date(now);

                        switch (value) {
                          case MarketplaceListingExpiration.ONE_WEEK:
                            expirationDate.setDate(now.getDate() + 7);
                            break;
                          case MarketplaceListingExpiration.TWO_WEEKS:
                            expirationDate.setDate(now.getDate() + 14);
                            break;
                          case MarketplaceListingExpiration.ONE_MONTH:
                            expirationDate.setMonth(now.getMonth() + 1);
                            break;
                        }

                        // Update the actual value with the computed datetime string
                        this.form.get("expiration").setValue(expirationDate.toISOString());
                      }
                    });
                }
              }
            },
            {
              key: "expiration",
              type: "input",
              className: "hidden"
            }
          ]
        },
        {
          key: "",
          wrappers: ["card-wrapper"],
          props: {
            label: this.translateService.instant("Available delivery options")
          },
          fieldGroup: [
            {
              key: "deliveryByBuyerPickUp",
              type: "toggle",
              wrappers: ["default-wrapper"],
              defaultValue: this.model.deliveryByBuyerPickUp !== undefined ? this.model.deliveryByBuyerPickUp : true,
              props: {
                label: this.translateService.instant("Buyer picks up")
              }
            },
            {
              key: "deliveryBySellerDelivery",
              type: "toggle",
              wrappers: ["default-wrapper"],
              defaultValue:
                this.model.deliveryBySellerDelivery !== undefined ? this.model.deliveryBySellerDelivery : true,
              props: {
                label: this.translateService.instant("Seller delivers in person")
              }
            },
            {
              key: "deliveryByShipping",
              type: "toggle",
              wrappers: ["default-wrapper"],
              defaultValue: this.model.deliveryByShipping !== undefined ? this.model.deliveryByShipping : true,
              props: {
                label: this.translateService.instant("Seller ships")
              },
              hooks: {
                onInit: field => {
                  field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
                    if (!value) {
                      this.model.shippingMethod = null;
                      this.form.get("shippingMethod").setValue(null);

                      this.model.lineItems.forEach(lineItem => {
                        lineItem.shippingCostType = MarketplaceShippingCostType.NO_SHIPPING;
                        lineItem.shippingCost = null;

                        this.form.get(`lineItems.${lineItem.id}`).patchValue({
                          shippingCostType: MarketplaceShippingCostType.NO_SHIPPING,
                          shippingCost: null
                        });
                      });
                    }

                    this.model = {
                      ...this.model,
                      lineItems: this.model.lineItems
                    };
                  });
                }
              }
            },
            {
              key: "shippingMethod",
              type: "ng-select",
              wrappers: ["default-wrapper"],
              expressions: {
                hide: "!model.deliveryByShipping",
                "props.required": () => {
                  const isWanted = this.model.listingType === MarketplaceListingType.WANTED;

                  if (isWanted) {
                    return false;
                  }

                  return !!this.model.deliveryByShipping;
                }
              },
              props: {
                label: this.translateService.instant("Shipping method"),
                options: Object.keys(MarketplaceListingShippingMethod).map(key => ({
                  value: key,
                  label: this.equipmentItemService.humanizeShippingMethod(MarketplaceListingShippingMethod[key])
                }))
              }
            }
          ],
          expressions: {
            className: () => {
              const isWanted = this.model.listingType === MarketplaceListingType.WANTED;
              return isWanted ? "hidden" : "";
            }
          }
        },
        {
          type: "formly-template",
          className: "alert alert-info",
          expressions: {
            hide: config => !!this.initialLineItemCountForm.get("terms")?.value,
            template: config => {
              const prefix = `<a href="${this.classicRoutesService.MARKETPLACE_TERMS}" target="_blank">`;
              const suffix = "</a>";

              if (config.model.id) {
                return this.translateService.instant(
                  "By updating a listing on the AstroBin Marketplace, you agree to the {{0}}terms of service{{1}}.",
                  {
                    0: prefix,
                    1: suffix
                  }
                );
              } else {
                return this.translateService.instant(
                  "By creating a listing on the AstroBin Marketplace, you agree to the {{0}}terms of service{{1}}.",
                  {
                    0: prefix,
                    1: suffix
                  }
                );
              }
            }
          }
        }
      ];

      this.setFirstFormlyGroupVisible();

      this.formInitialized = true;
    };

    return this.store$
      .select(selectRequestCountry)
      .pipe(
        take(1),
        switchMap(requestCountry => this.currentUser$.pipe(map(user => ({ requestCountry, user }))))
      )
      .subscribe(({ requestCountry, user }) => {
        let initialCurrency = "USD";

        if (!!requestCountry && requestCountry !== "UNKNOWN") {
          const currencyResults = countryJs.search(requestCountry);
          if (currencyResults.length > 0) {
            initialCurrency = currencyResults[0].currency.currencyCode;
          }
        }

        this.model = {
          ...this.model,
          user: user.id,
          country: this.model.country || requestCountry,
          lineItems: this.model.lineItems.map(lineItem => ({
            ...lineItem,
            currency: lineItem.currency || initialCurrency,
            condition: lineItem.condition || MarketplaceListingCondition.USED
          }))
        };

        const lineItemMap: Map<number, EquipmentItemType> = new Map();

        if (!this.model.id && this.initialLineItemCount > 0) {
          this.model.lineItems = Array.from({ length: this.initialLineItemCount }).map(() => ({
            user: user.id,
            listing: null,
            created: null,
            updated: null,
            sold: null,
            soldTo: null,
            reserved: null,
            reservedTo: null,
            price: null,
            currency: initialCurrency,
            condition: MarketplaceListingCondition.USED,
            yearOfPurchase: null,
            shippingCostType: MarketplaceShippingCostType.FIXED,
            shippingCost: null,
            description: null,
            findItemMode: MarketplaceLineItemFindItemMode.PLAIN,
            itemObjectId: null,
            itemContentType: null,
            itemContentTypeSelector: null,
            images: []
          }));

          if (
            this.initialLineItemCount === 1 &&
            this.activatedRoute.snapshot.queryParams["equipmentItemId"] &&
            this.activatedRoute.snapshot.queryParams["equipmentItemContentTypeId"]
          ) {
            const itemId = parseInt(this.activatedRoute.snapshot.queryParams["equipmentItemId"], 10);
            const itemContentTypeId = parseInt(
              this.activatedRoute.snapshot.queryParams["equipmentItemContentTypeId"],
              10
            );

            this.model.lineItems[0].itemObjectId = itemId;
            this.model.lineItems[0].itemContentType = itemContentTypeId;
            this.model.lineItems[0].findItemMode = MarketplaceLineItemFindItemMode.ALL;
          }
        }

        if (
          this.model.lineItems &&
          this.model.lineItems.length > 0 &&
          this.model.lineItems.filter(lineItem => !!lineItem.itemObjectId && !!lineItem.itemContentType).length > 0
        ) {
          forkJoin(
            this.model.lineItems.map((lineItem, index) =>
              this.store$.select(selectContentTypeById, { id: lineItem.itemContentType }).pipe(
                filter(contentType => !!contentType),
                take(1),
                map(contentType => EquipmentItemType[contentType.model.toUpperCase()]),
                tap(itemType => lineItemMap.set(index, itemType))
              )
            )
          )
            .pipe(
              switchMap(() => this.currentUser$),
              take(1)
            )
            .subscribe(user => {
              const isModerator = user && this.userService.isInGroup(user, Constants.MARKETPLACE_MODERATORS_GROUP);
              _doInitFields(lineItemMap, initialCurrency, isModerator);
            });

          this.model.lineItems.forEach(lineItem => {
            this.store$.dispatch(new LoadContentTypeById({ id: lineItem.itemContentType }));
          });
        } else {
          this.currentUser$.pipe(take(1)).subscribe(user => {
            const isModerator = user && this.userService.isInGroup(user, Constants.MARKETPLACE_MODERATORS_GROUP);
            _doInitFields(lineItemMap, initialCurrency, isModerator);
          });
        }
      });
  }

  private _setContentTypeValue(field: FormlyFieldConfig, value: EquipmentItemType) {
    if (!value) {
      return;
    }

    const payload = {
      appLabel: "astrobin_apps_equipment",
      model: value.toLowerCase()
    };

    this.store$
      .select(selectContentType, payload)
      .pipe(
        tap(contentType => {
          if (!contentType) {
            this.store$.dispatch(new LoadContentType(payload));
          }
        }),
        filter(contentType => !!contentType),
        take(1)
      )
      .subscribe(contentType => {
        const index = this.model.lineItems.indexOf(field.model);
        this.model.lineItems[index].itemContentType = contentType.id;
        this.form.get(`lineItems.${index}`).patchValue({ itemContentType: contentType.id });
      });
  }

  private _setContentTypeSelectorValue(field: FormlyFieldConfig, contentTypeId: ContentTypeInterface["id"]) {
    this.store$
      .select(selectContentTypeById, { id: contentTypeId })
      .pipe(
        tap(contentType => {
          if (!contentType) {
            this.store$.dispatch(new LoadContentTypeById({ id: contentTypeId }));
          }
        }),
        filter(contentType => !!contentType),
        take(1)
      )
      .subscribe(contentType => {
        const index = this.model.lineItems.indexOf(field.model);
        const value = EquipmentItemType[contentType.model.toUpperCase()];
        this.model.lineItems[index].itemContentTypeSelector = value;
        this.form.get(`lineItems.${index}`).patchValue({ itemContentTypeSelector: value });
      });
  }
}
