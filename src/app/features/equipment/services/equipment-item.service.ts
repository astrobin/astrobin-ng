import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { SensorInterface } from "@features/equipment/interfaces/sensor.interface";
import { CameraInterface } from "@features/equipment/interfaces/camera.interface";
import { TelescopeInterface } from "@features/equipment/interfaces/telescope.interface";
import { TranslateService } from "@ngx-translate/core";
import { EditProposalChange, EditProposalInterface } from "@features/equipment/interfaces/edit-proposal.interface";
import { SensorService } from "@features/equipment/services/sensor.service";
import { TelescopeService } from "@features/equipment/services/telescope.service";
import { CameraService } from "@features/equipment/services/camera.service";
import { Observable, of } from "rxjs";
import { getEquipmentItemType } from "@features/equipment/store/equipment.selectors";

export enum EquipmentItemDisplayProperty {
  NAME = "NAME",
  BRAND = "BRAND",
  IMAGE = "IMAGE"
}

@Injectable({
  providedIn: "root"
})
export class EquipmentItemService extends BaseService {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly utilsService: UtilsService,
    public readonly translateService: TranslateService,
    public readonly cameraService: CameraService,
    public readonly sensorService: SensorService,
    public readonly telescopeService: TelescopeService
  ) {
    super(loadingService);
  }

  getType(item: EquipmentItemBaseInterface): EquipmentItemType {
    return getEquipmentItemType(item);
  }

  humanizeType(type: EquipmentItemType) {
    switch (type) {
      case EquipmentItemType.CAMERA:
        return this.translateService.instant("Camera");
      case EquipmentItemType.SENSOR:
        return this.translateService.instant("Sensor");
      case EquipmentItemType.TELESCOPE:
        return this.translateService.instant("Telescope");
    }
  }

  getPrintableProperty$(
    item: EquipmentItemBaseInterface,
    propertyName: any,
    propertyValue: any
  ): Observable<string | null> {
    if (propertyValue === undefined || propertyValue === null) {
      return of(null);
    }

    const type: EquipmentItemType = this.getType(item);

    switch (propertyName) {
      case EquipmentItemDisplayProperty.NAME:
        return of(propertyValue.toString().replace("=", "="));
      case EquipmentItemDisplayProperty.BRAND:
        return of(propertyValue.toString());
      case EquipmentItemDisplayProperty.IMAGE:
        return of(
          propertyValue || item[propertyName]
            ? `<a href="${propertyValue || item[propertyName]}" target="_blank">${this.translateService.instant(
                "Image"
              )}</a>`
            : null
        );
    }

    switch (type) {
      case EquipmentItemType.CAMERA:
        return this.cameraService.getPrintableProperty$(item as CameraInterface, propertyName, propertyValue);
      case EquipmentItemType.SENSOR:
        return this.sensorService.getPrintableProperty$(item as SensorInterface, propertyName, propertyValue);
      case EquipmentItemType.TELESCOPE:
        return this.telescopeService.getPrintableProperty$(item as TelescopeInterface, propertyName, propertyValue);
    }

    return of(null);
  }

  getPrintablePropertyName(type: EquipmentItemType, propertyName: any, shortForm = false): string {
    switch (propertyName) {
      case EquipmentItemDisplayProperty.NAME:
        return this.translateService.instant("Name");
      case EquipmentItemDisplayProperty.BRAND:
        return this.translateService.instant("Brand");
      case EquipmentItemDisplayProperty.IMAGE:
        return this.translateService.instant("Image");
    }

    switch (type) {
      case EquipmentItemType.CAMERA:
        return this.cameraService.getPrintablePropertyName(propertyName, shortForm);
      case EquipmentItemType.SENSOR:
        return this.sensorService.getPrintablePropertyName(propertyName, shortForm);
      case EquipmentItemType.TELESCOPE:
        return this.telescopeService.getPrintablePropertyName(propertyName, shortForm);
    }
  }

  propertyNameToPropertyEnum(propertyName: string): string {
    return UtilsService.camelCaseToCapsCase(propertyName);
  }

  changes(
    item: EquipmentItemBaseInterface,
    editProposal: EditProposalInterface<EquipmentItemBaseInterface>
  ): EditProposalChange[] {
    if (this.getType(item) !== this.getType(editProposal)) {
      throw Error("Cannot detect changes for items of different types");
    }

    const ignoredKeys = [
      "id",
      "created",
      "createdBy",
      "updated",
      "deleted",

      "reviewedBy",
      "reviewedTimestamp",
      "reviewerDecision",
      "reviewerRejectionReason",
      "reviewerComment",

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
      "editProposalReviewStatus"
    ];

    const changes: EditProposalChange[] = [];

    let originalProperties:
      | {
          name: string;
          value: string | null;
        }[]
      | null = null;

    if (editProposal.editProposalOriginalProperties) {
      originalProperties = editProposal.editProposalOriginalProperties.split(",").map(property => {
        const pair = property.split("=");
        return {
          name: pair[0],
          value: pair[1] || null
        };
      });
    }

    for (const key of Object.keys(item)) {
      let originalProperty = null;

      if (!!editProposal.editProposalReviewStatus && !!originalProperties) {
        originalProperty = originalProperties.find(property => UtilsService.toCamelCase(property.name) === key);
      }

      if (
        ignoredKeys.indexOf(key) === -1 &&
        ((!!originalProperty && originalProperty.value !== editProposal[key]) || item[key] !== editProposal[key])
      ) {
        if (!editProposal.editProposalReviewStatus) {
          // The edit proposal is pending: build a diff using the current status of the item.
          changes.push({ propertyName: key, before: item[key], after: editProposal[key] });
        } else if (!!originalProperties) {
          // The edit proposal has been finalized: build a diff using the original edit proposal properties.
          if (!!originalProperty) {
            changes.push({ propertyName: key, before: originalProperty.value, after: editProposal[key] });
          }
        }
      }
    }

    return changes;
  }

  nameChangeWarningMessage(): string {
    return this.translateService.instant(
      "<strong>Careful!</strong> Change the name only to fix a typo or the naming convention. This operation will " +
        "change the name of this equipment item <strong>for all AstroBin images that use it</strong>, so you should " +
        "not change the name if it becomes a different product."
    );
  }
}
