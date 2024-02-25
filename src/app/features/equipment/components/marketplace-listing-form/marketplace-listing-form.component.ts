import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import {
  MarketplaceListingExpiration,
  MarketplaceListingInterface,
  MarketplaceListingShippingMethod
} from "@features/equipment/types/marketplace-listing.interface";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { LoadingService } from "@shared/services/loading.service";
import { selectRequestCountry } from "@app/store/selectors/app/app.selectors";
import { filter, map, startWith, switchMap, take, takeUntil, tap } from "rxjs/operators";
import {
  MarketplaceLineItemFindItemMode,
  MarketplaceListingCondition
} from "@features/equipment/types/marketplace-line-item.interface";
import { ItemBrowserLayout } from "@shared/components/equipment/item-browser/item-browser.component";
import { FormlyFieldEquipmentItemBrowserComponent } from "@shared/components/misc/formly-field-equipment-item-browser/formly-field-equipment-item-browser.component";
import { selectContentType, selectContentTypeById } from "@app/store/selectors/app/content-type.selectors";
import { LoadContentType, LoadContentTypeById } from "@app/store/actions/content-type.actions";
import { Constants } from "@shared/constants";
import { TranslateService } from "@ngx-translate/core";
import * as countryJs from "country-js";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { forkJoin } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";

@Component({
  selector: "astrobin-marketplace-listing-form",
  templateUrl: "./marketplace-listing-form.component.html",
  styleUrls: ["./marketplace-listing-form.component.scss"]
})
export class MarketplaceListingFormComponent extends BaseComponentDirective implements OnInit {
  readonly maxImages: number = 9;

  @Input()
  model: MarketplaceListingInterface = {
    created: null,
    updated: null,
    expiration: null,
    title: null,
    description: null,
    bundleSaleOnly: false,
    deliveryByBuyerPickUp: true,
    deliveryBySellerDelivery: true,
    deliveryByShipping: true,
    shippingMethod: null,
    latitude: null,
    longitude: null,
    country: null,
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
        shippingCost: null,
        description: null,
        findItemMode: MarketplaceLineItemFindItemMode.USER,
        itemObjectId: null,
        itemContentType: null,
        images: []
      }
    ]
  };

  form: FormGroup = new FormGroup({});

  fields: FormlyFieldConfig[];

  @Output()
  save: EventEmitter<MarketplaceListingInterface> = new EventEmitter<MarketplaceListingInterface>();

  constructor(
    public readonly store$: Store<State>,
    public readonly loadingService: LoadingService,
    public readonly translateService: TranslateService,
    public readonly equipmentItemService: EquipmentItemService,
    public readonly popNotificationsService: PopNotificationsService,
    public readonly modalService: NgbModal,
    public readonly router: Router,
    public readonly activatedRoute: ActivatedRoute
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this._initFields();
  }

  onSave(event: Event) {
    event.stopPropagation();

    if (!this.form.valid) {
      this.form.markAllAsTouched();
      UtilsService.notifyAboutFieldsWithErrors(this.fields, this.popNotificationsService, this.translateService);
      return;
    }

    this.save.emit(this.form.value);
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

  private _initFields() {
    const _preprocessModel = (model: MarketplaceListingInterface): MarketplaceListingInterface => {
      if (!!model.lineItems && model.lineItems.length > 0) {
        model.lineItems = model.lineItems.map(lineItem => {
          lineItem.images = lineItem.images.map(image => image.imageFile);
          lineItem.listing = model.id;
          return lineItem;
        });
      }

      return model;
    };

    const _getImageField = (n: number): FormlyFieldConfig => {
      return {
        key: `${n}`,
        type: "file",
        props: {
          accept: "image/jpeg, image/png",
          image: true,
          required: n === 0
        },
        validators: {
          validation: [{ name: "file-size", options: { max: 1024 * 1024 * 10 } }, { name: "image-or-video-file" }]
        }
      };
    };

    const _doInitFields = (lineItemMap: Map<number, EquipmentItemType>, initialCurrency: string) => {
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
          key: "country",
          type: "input",
          className: "hidden"
        },
        {
          key: "city",
          type: "input",
          className: "hidden"
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
              props: {
                label: this.translateService.instant("Title"),
                description: this.translateService.instant(
                  "If omitted, AstroBin will use the equipment item names to create a title."
                ),
                required: false,
                modelOptions: {
                  updateOn: "blur"
                }
              },
              validators: {
                maxLength: {
                  value: 256
                }
              }
            },
            {
              key: "description",
              type: "textarea",
              wrappers: ["default-wrapper"],
              props: {
                label: this.translateService.instant("Description"),
                description: this.translateService.instant(
                  "This description field is for generic information that pertain this listing. You can find " +
                  "Description field for individual equipment items above."
                ),
                rows: 6,
                modelOptions: {
                  updateOn: "blur"
                }
              }
            },
            {
              key: "",
              type: "google-map",
              wrappers: ["default-wrapper"],
              props: {
                height: 300,
                label: this.translateService.instant("Location"),
                required: true,
                description: this.translateService.instant(
                  "Drag the map to set the location. AstroBin will not disclose your exact location, but " +
                  "only the city and country where the item is located. The location information will be used to " +
                  "find listings within a certain distance from the user's location."
                )
              },
              hooks: {
                onInit: field => {
                  const form = field.parent.formControl;

                  field.formControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(coordinates => {
                    if (coordinates) {
                      const geocoder = new google.maps.Geocoder();

                      geocoder.geocode({ location: coordinates }, function(results, status) {
                        if (status === "OK") {
                          if (results[0]) {
                            const addressComponents = results[0].address_components;
                            const countryComponent = addressComponents.find(component =>
                              component.types.includes("country")
                            );
                            const cityComponent = addressComponents.find(component =>
                              component.types.includes("locality")
                            );

                            if (countryComponent) {
                              form.get("country").setValue(countryComponent.short_name);
                            }

                            if (cityComponent) {
                              form.get("city").setValue(cityComponent.long_name);
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
            },
            {
              key: "bundleSaleOnly",
              type: "checkbox",
              wrappers: ["default-wrapper"],
              expressions: {
                hide: () => this.model.lineItems.length < 2
              },
              props: {
                label: this.translateService.instant("Sell as a bundle only"),
                description: this.translateService.instant(
                  "Check this if you want to sell all items together as a single package, not separately."
                )
              }
            },
            {
              key: "",
              type: "ng-select",
              wrappers: ["default-wrapper"],
              defaultValue: MarketplaceListingExpiration.ONE_WEEK,
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
                        let expirationDate = new Date(now);

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
          key: "lineItems",
          type: "array",
          wrappers: ["default-wrapper"],
          fieldArray: {
            fieldGroupClassName: "field-group-line-items",
            props: {
              label: this.translateService.instant("Equipment item for sale"),
              addLabel: this.translateService.instant("Add another item to this listing")
            },
            fieldGroup: [
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
                key: "listing",
                type: "input",
                className: "hidden",
                defaultValue: this.model.id
              },
              {
                key: "user",
                type: "input",
                className: "hidden",
                defaultValue: this.model.user
              },
              {
                key: "findItemMode",
                type: "ng-select",
                defaultValue: MarketplaceLineItemFindItemMode.USER,
                props: {
                  required: true,
                  searchable: false,
                  clearable: false,
                  label: this.translateService.instant("Find item in"),
                  description: this.translateService.instant("Where do you want to find the item you're selling?"),
                  options: [
                    {
                      label: this.translateService.instant("Equipment I used on my images"),
                      value: MarketplaceLineItemFindItemMode.USER
                    },
                    {
                      label: this.translateService.instant("All equipment on AstroBin"),
                      value: MarketplaceLineItemFindItemMode.ALL
                    }
                  ]
                }
              },
              {
                key: "itemObjectId",
                type: "equipment-item-browser",
                props: {
                  required: true,
                  label: this.translateService.instant("Item"),
                  showQuickAddRecent: false,
                  showPlaceholderImage: false,
                  multiple: false,
                  enableCreation: false,
                  showItemTypeSelector: true,
                  layout: ItemBrowserLayout.VERTICAL,
                  itemType: lineItemMap.get(0)
                },
                expressions: {
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

                      componentInstance.itemTypeChanged.subscribe(itemType => {
                        const index = this.model.lineItems.indexOf(field.model);
                        const payload = {
                          appLabel: "astrobin_apps_equipment",
                          model: `${itemType.toLowerCase()}`
                        };

                        this.store$
                          .select(selectContentType, payload)
                          .pipe(
                            filter(contentType => !!contentType),
                            take(1)
                          )
                          .subscribe(contentType => {
                            this.model.lineItems[index].itemContentType = contentType.id;
                            this.form.get(`lineItems.${index}`).patchValue({ itemContentType: contentType.id });
                          });

                        this.store$.dispatch(new LoadContentType(payload));
                      });
                    }
                  }
                }
              },
              {
                key: "itemContentType",
                type: "input",
                className: "hidden"
              },
              {
                key: "images",
                wrappers: ["default-wrapper"],
                fieldGroupClassName:
                  "d-flex flex-wrap flex-column flex-xl-row justify-content-evenly field-group-images",
                props: {
                  label: this.translateService.instant("Images"),
                  description: this.translateService.instant(
                    "You can upload up to {{ maxImages }} images. The first image will be used as the cover " +
                    "image and is required.",
                    {
                      maxImages: this.maxImages
                    }
                  ),
                  required: true
                },
                fieldGroup: [...Array(this.maxImages).keys()].map(n => _getImageField(n))
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
                    className: "col-xl-6",
                    defaultValue: MarketplaceListingCondition.USED,
                    props: {
                      required: true,
                      label: this.translateService.instant("Condition"),
                      options: Object.keys(MarketplaceListingCondition).map(key => ({
                        value: key,
                        label: this.equipmentItemService.humanizeCondition(MarketplaceListingCondition[key])
                      }))
                    }
                  },
                  {
                    key: "yearOfPurchase",
                    type: "input",
                    wrappers: ["default-wrapper"],
                    className: "col-xl-6",
                    props: {
                      type: "number",
                      label: this.translateService.instant("Year of purchase")
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
                      rows: 6,
                      modelOptions: {
                        updateOn: "blur"
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
                    fieldGroup: [
                      {
                        key: "price",
                        type: "input",
                        wrappers: ["default-wrapper"],
                        props: {
                          type: "number",
                          min: 0,
                          label: this.translateService.instant("Price"),
                          required: true
                        }
                      },
                      {
                        key: "shippingCost",
                        type: "input",
                        wrappers: ["default-wrapper"],
                        expressions: {
                          hide: () => !this.model.deliveryByShipping
                        },
                        props: {
                          label: this.translateService.instant("Shipping cost"),
                          type: "number",
                          description: this.translateService.instant("Leave blank for free shipping"),
                          min: 0
                        }
                      },
                      {
                        key: "currency",
                        type: "ng-select",
                        wrappers: ["default-wrapper"],
                        defaultValue: initialCurrency,
                        props: {
                          label: this.translateService.instant("Currency"),
                          options: Object.keys(Constants.ALL_CURRENCIES).map(code => ({
                            value: code,
                            label: `${Constants.ALL_CURRENCIES[code]} (${code})`
                          })),
                          required: true,
                          placeholder: this.translateService.instant("Select a currency")
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
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
              defaultValue: this.model.deliveryBySellerDelivery !== undefined ? this.model.deliveryBySellerDelivery : true,
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
              }
            },
            {
              key: "shippingMethod",
              type: "ng-select",
              wrappers: ["default-wrapper"],
              expressions: {
                hide: "!model.deliveryByShipping",
                "props.required": "!!model.deliveryByShipping"
              },
              props: {
                label: this.translateService.instant("Shipping method"),
                options: Object.keys(MarketplaceListingShippingMethod).map(key => ({
                  value: key,
                  label: this.equipmentItemService.humanizeShippingMethod(MarketplaceListingShippingMethod[key])
                }))
              }
            }
          ]
        }
      ];
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
            lineItems: this.model.lineItems.map(lineItem => ({
              ...lineItem,
              currency: initialCurrency,
              condition: MarketplaceListingCondition.USED
            }))
          };

          const lineItems = this.model.lineItems;
          const lineItemMap: Map<number, EquipmentItemType> = new Map();

          if (
            lineItems &&
            lineItems.length > 0 &&
            lineItems.filter(lineItem => !!lineItem.itemObjectId && !!lineItem.itemContentType).length > 0
          ) {
            forkJoin(lineItems.map((lineItem, index) =>
              this.store$.select(selectContentTypeById, { id: lineItem.itemContentType }).pipe(
                filter(contentType => !!contentType),
                take(1),
                map(contentType => EquipmentItemType[contentType.model.toUpperCase()]),
                tap(itemType => lineItemMap.set(index, itemType))
              ))).subscribe(() => {
              _doInitFields(lineItemMap, initialCurrency);
            });

            lineItems.forEach(lineItem => {
              this.store$.dispatch(new LoadContentTypeById({ id: lineItem.itemContentType }));
            });
          } else {
            _doInitFields(lineItemMap, initialCurrency);
          }
        }
      );
  }
}
