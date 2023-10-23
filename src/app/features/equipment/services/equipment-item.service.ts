import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType,
  EquipmentItemUsageType
} from "@features/equipment/types/equipment-item-base.interface";
import { TranslateService } from "@ngx-translate/core";
import {
  EditProposalChange,
  EditProposalInterface,
  EditProposalReviewStatus
} from "@features/equipment/types/edit-proposal.interface";
import { Observable, of } from "rxjs";
import { getEquipmentItemType, selectEquipmentItem } from "@features/equipment/store/equipment.selectors";
import { EquipmentItemServiceFactory } from "@features/equipment/services/equipment-item.service-factory";
import { BrandInterface } from "@features/equipment/types/brand.interface";
import { EquipmentApiService } from "@features/equipment/services/equipment-api.service";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { LoadEquipmentItem } from "@features/equipment/store/equipment.actions";
import { EquipmentItem } from "@features/equipment/types/equipment-item.type";
import { filter, map, switchMap, take } from "rxjs/operators";
import { BBCodeToHtmlPipe } from "@shared/pipes/bbcode-to-html.pipe";
import { CKEditorService } from "@shared/services/ckeditor.service";
import { environment } from "@env/environment";
import { WindowRefService } from "@shared/services/window-ref.service";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { MarketplaceListingShippingMethod } from "@features/equipment/types/marketplace-listing.interface";
import { MarketplaceListingCondition } from "@features/equipment/types/marketplace-line-item.interface";

export enum EquipmentItemDisplayProperty {
  BRAND = "BRAND",
  NAME = "NAME",
  VARIANT_OF = "VARIANT_OF",
  WEBSITE = "WEBSITE",
  IMAGE = "IMAGE",
  COMMUNITY_NOTES = "COMMUNITY_NOTES"
}

@Injectable({
  providedIn: "root"
})
export class EquipmentItemService extends BaseService {
  constructor(
    public readonly store$: Store<State>,
    public readonly loadingService: LoadingService,
    public readonly utilsService: UtilsService,
    public readonly translateService: TranslateService,
    public readonly equipmentItemServiceFactory: EquipmentItemServiceFactory,
    public readonly equipmentApiService: EquipmentApiService,
    public readonly ckEditorService: CKEditorService,
    public readonly windowRefService: WindowRefService,
    public readonly popNotificationsService: PopNotificationsService,
    @Inject(PLATFORM_ID) public readonly platformId: Object
  ) {
    super(loadingService);
  }

  trackBy(index, item: EquipmentItem) {
    return item.id;
  }

  getType(item: EquipmentItemBaseInterface): EquipmentItemType {
    return getEquipmentItemType(item);
  }

  humanizeType(itemType: EquipmentItemType) {
    switch (itemType) {
      case EquipmentItemType.CAMERA:
        return this.translateService.instant("Camera");
      case EquipmentItemType.SENSOR:
        return this.translateService.instant("Sensor");
      case EquipmentItemType.TELESCOPE:
        return this.translateService.instant("Telescope or lens");
      case EquipmentItemType.MOUNT:
        return this.translateService.instant("Mount");
      case EquipmentItemType.FILTER:
        return this.translateService.instant("Filter");
      case EquipmentItemType.ACCESSORY:
        return this.translateService.instant("Accessory");
      case EquipmentItemType.SOFTWARE:
        return this.translateService.instant("Software");
    }
  }

  humanizeUsageType(usageType: EquipmentItemUsageType) {
    switch (usageType) {
      case EquipmentItemUsageType.IMAGING:
        return this.translateService.instant("Imaging");
      case EquipmentItemUsageType.GUIDING:
        return this.translateService.instant("Guiding");
    }
  }

  humanizeCondition(condition: MarketplaceListingCondition) {
    switch (condition) {
      case MarketplaceListingCondition.NEW:
        return this.translateService.instant("New");
      case MarketplaceListingCondition.USED:
        return this.translateService.instant("Used");
      case MarketplaceListingCondition.DAMAGED_OR_DEFECTIVE:
        return this.translateService.instant("Damaged or defective");
      case MarketplaceListingCondition.UNOPENED:
        return this.translateService.instant("Unopened");
      case MarketplaceListingCondition.OTHER:
        return this.translateService.instant("Unspecified condition");
    }

    return this.translateService.instant("Unknown");
  }

  humanizeShippingMethod(shippingMethod: MarketplaceListingShippingMethod) {
    switch (shippingMethod) {
      case MarketplaceListingShippingMethod.STANDARD_MAIL:
        return this.translateService.instant("Standard mail");
      case MarketplaceListingShippingMethod.COURIER:
        return this.translateService.instant("Courier");
      case MarketplaceListingShippingMethod.ELECTRONIC:
        return this.translateService.instant("Electronic");
      case MarketplaceListingShippingMethod.OTHER:
        return this.translateService.instant("Other");
    }

    return this.translateService.instant("Unknown");
  }

  getFullDisplayName$(item: EquipmentItem): Observable<string> {
    const brandName = item.brandName || this.translateService.instant("(DIY)");
    return this.getName$(item).pipe(map(name => `${brandName} ${name}`));
  }

  getName$(item: EquipmentItemBaseInterface | BrandInterface): Observable<string> {
    try {
      return this.getPrintableProperty$(
        item as EquipmentItemBaseInterface,
        EquipmentItemDisplayProperty.NAME,
        item.name
      );
    } catch (e) {
      return of(item.name);
    }
  }

  getPrintableProperty$(
    item: EquipmentItemBaseInterface,
    propertyName: any,
    propertyValue?: any,
    shortForm?: boolean
  ): Observable<string | null> {
    if (propertyValue === undefined || propertyValue === null) {
      return of(null);
    }

    const service = this.equipmentItemServiceFactory.getService(item);
    if (service.getSupportedPrintableProperties().indexOf(propertyName) > -1) {
      return service.getPrintableProperty$(item, propertyName, propertyValue, shortForm);
    }

    switch (propertyName) {
      case EquipmentItemDisplayProperty.BRAND:
        return of(propertyValue.toString());
      case EquipmentItemDisplayProperty.NAME:
        return of(propertyValue.toString());
      case EquipmentItemDisplayProperty.VARIANT_OF:
        const payload = { id: propertyValue, type: item.klass };
        this.store$.dispatch(new LoadEquipmentItem(payload));
        return this.store$.select(selectEquipmentItem, payload).pipe(
          filter(variantOf => !!variantOf),
          take(1),
          switchMap(variantOf =>
            this.getFullDisplayName$(variantOf).pipe(
              map(fullDisplayName => ({
                variantOf,
                fullDisplayName
              }))
            )
          ),
          map(
            ({ variantOf, fullDisplayName }) =>
              `<a
                 href="/equipment/explorer/${variantOf.klass.toLowerCase()}/${variantOf.id}"
                 target="_blank"
               >
                 ${fullDisplayName}
               </a>`
          )
        );
      case EquipmentItemDisplayProperty.WEBSITE:
        const website = propertyValue || item[propertyName];

        return of(
          website
            ? `<a href="${website}" target="_blank">
                 ${shortForm ? UtilsService.shortenUrl(website) : website}
               </a>`
            : null
        );
      case EquipmentItemDisplayProperty.IMAGE:
        return of(
          propertyValue || item[propertyName]
            ? `<a href="${propertyValue || item[propertyName]}" target="_blank">
                 <img src="${propertyValue || item[propertyName]}">
               </a>`
            : null
        );
      case EquipmentItemDisplayProperty.COMMUNITY_NOTES:
        return of(
          new BBCodeToHtmlPipe(
            this.ckEditorService,
            this.windowRefService,
            this.platformId
          ).transform(propertyValue.toString())
        );
    }
  }

  getPrintablePropertyName(type: EquipmentItemType, propertyName: any, shortForm = false): string {
    if (!!type) {
      const service = this.equipmentItemServiceFactory.getServiceByType(type);

      if (service.getSupportedPrintableProperties().indexOf(propertyName) > -1) {
        return service.getPrintablePropertyName(propertyName, shortForm);
      }
    }

    switch (propertyName) {
      case EquipmentItemDisplayProperty.BRAND:
        return `${this.translateService.instant("Brand")} / ${this.translateService.instant("Company")}`;
      case EquipmentItemDisplayProperty.NAME:
        return shortForm
          ? this.translateService.instant("Name")
          : this.translateService.instant("Official and complete product name");
      case EquipmentItemDisplayProperty.VARIANT_OF:
        return this.translateService.instant("Variant of");
      case EquipmentItemDisplayProperty.WEBSITE:
        return this.translateService.instant("Website");
      case EquipmentItemDisplayProperty.IMAGE:
        return this.translateService.instant("Image");
      case EquipmentItemDisplayProperty.COMMUNITY_NOTES:
        return this.translateService.instant("Community notes");
    }

    throw Error(`Invalid property: ${propertyName}`);
  }

  propertyNameToPropertyEnum(propertyName: string): string {
    return UtilsService.camelCaseToCapsCase(propertyName);
  }

  changes(
    item: EquipmentItemBaseInterface,
    editProposal: EditProposalInterface<EquipmentItemBaseInterface>
  ): Observable<EditProposalChange[]> {
    if (this.getType(item) !== this.getType(editProposal)) {
      throw Error("Cannot detect changes for items of different types");
    }

    const service = this.equipmentItemServiceFactory.getService(item);
    const baseAllowedKeys = Object.values(EquipmentItemDisplayProperty) as string[];
    const serviceAllowedKeys = service.getSupportedPrintableProperties();
    const allowedKeys = [
      ...new Set([...baseAllowedKeys, ...serviceAllowedKeys])
    ].map(key => key.toLowerCase());

    const ignoredKeys = [
      "id",
      "contentType",
      "brand",
      "brandName",
      "created",
      "createdBy",
      "updated",
      "deleted",
      "klass",
      "group",

      "reviewedBy",
      "reviewedTimestamp",
      "reviewerDecision",
      "reviewerRejectionReason",
      "reviewerRejectionDuplicateOf",
      "reviewerRejectionDuplicateOfKlass",
      "reviewerRejectionDuplicateOfUsageType",
      "reviewerComment",
      "reviewerLock",
      "reviewerLockTimestamp",

      "editProposalOriginalProperties",
      "editProposalTarget",
      "editProposalBy",
      "editProposalCreated",
      "editProposalUpdated",
      "editProposalIp",
      "editProposalComment",
      "editProposalReviewedBy",
      "editProposalReviewTimestamp",
      "editProposalReviewIp",
      "editProposalReviewComment",
      "editProposalReviewStatus",
      "editProposalLock",
      "editProposalLockTimestamp",

      "modified",
      "variants",
      "userCount",
      "imageCount",
      "lastAddedOrRemovedFromImage",
      "searchFriendlyName",
      "listings",
      "forum",
      "cameras" // For sensors.
    ];

    const _autoConvertValue = (value: any): any => {
      if (value === "null" || value === "" || value === null || value === undefined) {
        value = null;
      } else if (value.toString().toLowerCase() === "true") {
        value = true;
      } else if (value.toString().toLowerCase() === "false") {
        value = false;
      } else if (UtilsService.isString(value) && UtilsService.isNumeric(value) && value.indexOf(".") > -1) {
        try {
          value = parseFloat(value);
        } catch (e) {
        }
      } else if (UtilsService.isString(value) && UtilsService.isNumeric(value)) {
        try {
          value = parseInt(value, 10);
        } catch (e) {
        }
      }

      return value;
    };

    const _getNameValuePair = (property): { name: string; value: any } => {
      const pair = property.split("=");
      const name = pair[0];
      const value: any = _autoConvertValue(pair[1]);

      return { name, value };
    };

    const _parseData = (data: string, keys: string[]): string[] => {
      const result: string[] = [];

      // Step 1: Construct the indexes of the keys
      const indexes: { key: string; index: number }[] = keys.map(key => {
        return { key: key, index: data.indexOf(key + "=") };
      });

      // Step 2: Sort the indexes in ascending order
      indexes.sort((a, b) => a.index - b.index);

      // Step 3: Iterate through the sorted indexes and extract the key/value pairs
      for (let i = 0; i < indexes.length; i++) {
        const start = indexes[i].index;
        const end = i < indexes.length - 1 ? indexes[i + 1].index : data.length;

        if (start === -1) {
          continue;
        } // Skip if the key is not found

        const keyValue = data.substring(start, end).replace(/,$/, ""); // Remove trailing comma if present
        result.push(keyValue);
      }

      return result;
    };

    const _getChanges = (): EditProposalChange[] => {
      const changes: EditProposalChange[] = [];

      let originalProperties:
        | {
        name: string;
        value: string | null;
      }[]
        | null = null;

      if (editProposal.editProposalOriginalProperties) {
        originalProperties = _parseData(editProposal.editProposalOriginalProperties, allowedKeys).map(property => {
          return _getNameValuePair(property);
        });
      }

      for (const key of Object.keys(item)) {
        if (ignoredKeys.indexOf(key) > -1) {
          continue;
        }

        let originalProperty = null;

        if (!!editProposal.editProposalReviewStatus && !!originalProperties) {
          originalProperty = originalProperties.find(property => UtilsService.toCamelCase(property.name) === key);
        }

        let itemValue: any;
        let editProposalValue: any = _autoConvertValue(editProposal[key]);

        if (editProposal.editProposalReviewStatus === EditProposalReviewStatus.APPROVED && !!originalProperty) {
          itemValue = originalProperty.value;
        } else {
          itemValue = _autoConvertValue(item[key]);
        }

        if (key === "image") {
          if (!!itemValue && itemValue.indexOf("http") !== 0) {
            itemValue = `${environment.cdnUrl}/${itemValue}`;
          }

          if (!!editProposalValue && editProposalValue.indexOf("http") !== 0) {
            editProposalValue = `${environment.cdnUrl}/${editProposalValue}`;
          }
        }

        if (itemValue !== editProposalValue) {
          changes.push({ propertyName: key, before: itemValue, after: editProposalValue });
        }
      }

      return changes;
    };

    return of(_getChanges());
  }

  nameChangeWarningMessage(): string {
    return this.translateService.instant(
      "<strong>Careful!</strong> Change the name only to fix a typo or the naming convention. This operation will " +
      "change the name of this equipment item <strong>for all AstroBin images that use it</strong>, so you should " +
      "not change the name if it becomes a different product."
    );
  }

  cannotSelectedBecauseFrozenAsAmbiguousError() {
    this.popNotificationsService.error(
      this.translateService.instant(
        "This item cannot be selected it's been marked as ambiguous. Consider selecting or creating a non " +
        "ambiguous variant instead."
      )
    );
  }

  hasOagInWrongClassError(field: FormlyFieldConfig, value: string): void {
    const oagWords = ["oag", "off-axis", "off axis"];

    let hasOAG = false;

    for (const word of oagWords) {
      if (value.toLowerCase().indexOf(word) > -1) {
        hasOAG = true;
        break;
      }
    }

    if (hasOAG) {
      field.formControl.setErrors({ "has-oag-in-wrong-class": true });
      field.formControl.markAsTouched();
      field.formControl.markAsDirty();
    }
  }
}
