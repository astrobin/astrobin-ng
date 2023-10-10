import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { TranslateService } from "@ngx-translate/core";
import { TitleService } from "@shared/services/title/title.service";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import {
  MarketplaceListingCondition,
  MarketplaceListingInterface,
  MarketplaceListingShippingMethod
} from "@features/equipment/types/marketplace-listing.interface";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Constants } from "@shared/constants";
import { take } from "rxjs/operators";
import { selectRequestCountry } from "@app/store/selectors/app/app.selectors";
import * as countryJs from "country-js";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { ItemBrowserLayout } from "@shared/components/equipment/item-browser/item-browser.component";
import { UtilsService } from "@shared/services/utils/utils.service";

@Component({
  selector: "astrobin-marketplace-create-listing",
  templateUrl: "./marketplace-create-listing.page.component.html",
  styleUrls: ["./marketplace-create-listing.page.component.scss"]
})
export class MarketplaceCreateListingPageComponent extends BaseComponentDirective implements OnInit {
  readonly UtilsService = UtilsService;
  readonly maxImages = 9;

  readonly title = this.translateService.instant("Create listing");
  readonly breadcrumb = new SetBreadcrumb({
    breadcrumb: [
      {
        label: this.translateService.instant("Equipment"),
        link: "/equipment/explorer"
      },
      {
        label: this.translateService.instant("Marketplace"),
        link: "/equipment/marketplace"
      },
      {
        label: this.translateService.instant("Create listing")
      }
    ]
  });

  model: Partial<MarketplaceListingInterface> = {};
  form: FormGroup = new FormGroup({});
  fields: FormlyFieldConfig[];

  constructor(
    public readonly store$: Store<State>,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService,
    public readonly equipmentItemService: EquipmentItemService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.titleService.setTitle(this.title);
    this.store$.dispatch(this.breadcrumb);

    this._initFields();
  }

  private _initFields() {
    const getFileField = (n: number): FormlyFieldConfig => {
      return {
        key: `image_${n}`,
        type: "file",
        props: {
          accept: "image/jpeg, image/png",
          image: true
        },
        validators: {
          validation: [{ name: "file-size", options: { max: 1024 * 1024 * 10 } }, { name: "image-or-video-file" }]
        }
      };
    };

    return this.store$
      .select(selectRequestCountry)
      .pipe(take(1))
      .subscribe(requestCountry => {
        let initialCurrency = "USD";

        if (!!requestCountry && requestCountry !== "UNKNOWN") {
          const currencyResults = countryJs.search(requestCountry);
          if (currencyResults.length > 0) {
            initialCurrency = currencyResults[0].currency.currencyCode;
          }
        }

        this.fields = [
          {
            key: "",
            wrappers: ["card-wrapper"],
            props: {
              label: this.translateService.instant("Equipment item for sale")
            },
            fieldGroup: [
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
                  layout: ItemBrowserLayout.VERTICAL
                }
              }
            ]
          }, {
            key: "",
            wrappers: ["card-wrapper"],
            fieldGroupClassName: "d-flex flex-wrap flex-column flex-xl-row justify-content-evenly field-group-images",
            props: {
              label: this.translateService.instant("Up to {{0}} images", { 0: this.maxImages })
            },
            fieldGroup: [...Array(this.maxImages).keys()].map(n => getFileField(n))
          },
          {
            key: "",
            wrappers: ["card-wrapper"],
            fieldGroupClassName: "row",
            props: {
              label: this.translateService.instant("Item information")
            },
            fieldGroup: [
              {
                key: "condition",
                type: "ng-select",
                defaultValue: MarketplaceListingCondition.USED,
                wrappers: ["default-wrapper"],
                className: "col-xl-6",
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
                  min: 1900,
                  max: new Date().getFullYear(),
                  label: this.translateService.instant("Year of purchase")
                }
              },
              {
                key: "description",
                type: "textarea",
                wrappers: ["default-wrapper"],
                props: {
                  label: this.translateService.instant("Description"),
                  rows: 6
                }
              }
            ]
          },
          {
            key: "",
            wrappers: ["card-wrapper"],
            props: {
              label: this.translateService.instant("Pricing information")
            },
            fieldGroup: [
              {
                key: "",
                fieldGroupClassName: "row",
                fieldGroup: [
                  {
                    key: "price",
                    type: "input",
                    wrappers: ["default-wrapper"],
                    className: "col-xl-5 mb-xl-0",
                    props: {
                      type: "number",
                      min: 0,
                      label: this.translateService.instant("Price"),
                      required: true
                    }
                  },
                  {
                    key: "currency",
                    type: "ng-select",
                    defaultValue: initialCurrency,
                    wrappers: ["default-wrapper"],
                    className: "col-xl-7",
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
          },
          {
            key: "",
            wrappers: ["card-wrapper"],
            fieldGroupClassName: "row",
            props: {
              label: this.translateService.instant("Available delivery options")
            },
            fieldGroup: [
              {
                key: "deliveryByBuyerPickUp",
                type: "toggle",
                wrappers: ["default-wrapper"],
                defaultValue: true,
                props: {
                  label: this.translateService.instant("Buyer picks up the item")
                }
              },
              {
                key: "deliveryBySellerDelivery",
                type: "toggle",
                wrappers: ["default-wrapper"],
                defaultValue: true,
                props: {
                  label: this.translateService.instant("Seller delivers in person")
                }
              },
              {
                key: "deliveryByShipping",
                type: "toggle",
                wrappers: ["default-wrapper"],
                defaultValue: true,
                props: {
                  label: this.translateService.instant("Seller ships the item")
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
                className: "col-xl-6",
                props: {
                  label: this.translateService.instant("Shipping method"),
                  options: Object.keys(MarketplaceListingShippingMethod).map(key => ({
                    value: key,
                    label: this.equipmentItemService.humanizeShippingMethod(MarketplaceListingShippingMethod[key])
                  }))
                }
              },
              {
                key: "shippingCost",
                type: "input",
                wrappers: ["default-wrapper"],
                expressions: {
                  hide: "!model.deliveryByShipping",
                  "props.label": field =>
                    `${this.translateService.instant("Shipping cost")} (${field.model.currency})`
                },
                className: "col-xl-6",
                props: {
                  type: "number",
                  description: this.translateService.instant("Leave blank for free shipping"),
                  min: 0
                }
              }
            ]
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
            key: "",
            wrappers: ["card-wrapper"],
            props: {
              label: this.translateService.instant("Location")
            },
            fieldGroup: [
              {
                key: "",
                type: "google-map",
                wrappers: ["default-wrapper"],
                props: {
                  height: 300,
                  description: this.translateService.instant(
                    "Drag the map to set the location. AstroBin will not disclose your exact location, but " +
                    "only the country where the item is located. The location information will be used to find " +
                    "listings within a certain distance from the user's location."
                  )
                },
                hooks: {
                  onInit: field => {
                    const form = field.parent.formControl;

                    field.formControl.valueChanges.subscribe(coordinates => {
                      if (coordinates) {
                        const geocoder = new google.maps.Geocoder;

                        geocoder.geocode({ "location": coordinates }, function(results, status) {
                          if (status === "OK") {
                            if (results[0]) {
                              const addressComponents = results[0].address_components;
                              const countryComponent = addressComponents.find(component => component.types.includes("country"));
                              if (countryComponent) {
                                form.get("country").setValue(countryComponent.short_name);
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
          }
        ];
      });
  }
}
