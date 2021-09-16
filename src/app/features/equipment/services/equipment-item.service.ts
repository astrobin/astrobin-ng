import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { instanceOfSensor, SensorInterface } from "@features/equipment/interfaces/sensor.interface";
import { CameraInterface, instanceOfCamera } from "@features/equipment/interfaces/camera.interface";
import { instanceOfTelescope, TelescopeInterface } from "@features/equipment/interfaces/telescope.interface";
import { TranslateService } from "@ngx-translate/core";
import { EditProposalChange } from "@features/equipment/interfaces/edit-proposal.interface";
import { SensorService } from "@features/equipment/services/sensor.service";
import { TelescopeService } from "@features/equipment/services/telescope.service";
import { CameraService } from "@features/equipment/services/camera.service";

export function getEquipmentItemType(item: EquipmentItemBaseInterface) {
  if (instanceOfSensor(item)) {
    return EquipmentItemType.SENSOR;
  }

  if (instanceOfCamera(item)) {
    return EquipmentItemType.CAMERA;
  }

  if (instanceOfTelescope(item)) {
    return EquipmentItemType.TELESCOPE;
  }

  // TODO: complete.
}

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

  getPrintableProperty(item: EquipmentItemBaseInterface, propertyName: any, propertyValue: any): string | null {
    if (propertyValue === undefined || propertyValue === null) {
      return null;
    }

    const type: EquipmentItemType = this.getType(item);

    switch (propertyName) {
      case EquipmentItemDisplayProperty.NAME:
      case EquipmentItemDisplayProperty.BRAND:
        return propertyValue.toString();
      case EquipmentItemDisplayProperty.IMAGE:
        return `<a href="${propertyValue}" target="_blank">${this.translateService.instant("Image")}</a>`;
    }

    switch (type) {
      case EquipmentItemType.CAMERA:
        return this.cameraService.getPrintableProperty(item as CameraInterface, propertyName);
      case EquipmentItemType.SENSOR:
        return this.sensorService.getPrintableProperty(item as SensorInterface, propertyName);
      case EquipmentItemType.TELESCOPE:
        return this.telescopeService.getPrintableProperty(item as TelescopeInterface, propertyName);
    }
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

  changes(a: EquipmentItemBaseInterface, b: EquipmentItemBaseInterface) {
    if (this.getType(a) !== this.getType(b)) {
      throw Error("Cannot detect changes for items of different types");
    }

    const changes: EditProposalChange[] = [];

    const ignoredKeys = [
      "id",
      "deleted",
      "reviewedTimestamp",
      "reviewerDecision",
      "reviewerRejectionReason",
      "reviewerComment",
      "created",
      "updated",
      "editProposalCreated",
      "editProposalUpdated",
      "editProposalIp",
      "editProposalComment",
      "editProposalReviewTimestamp",
      "editProposalReviewIp",
      "editProposalReviewComment",
      "editProposalReviewStatus",
      "createdBy",
      "reviewedBy",
      "editProposalBy",
      "editProposalReviewedBy",
      "editProposalTarget"
    ];

    for (const key of Object.keys(a)) {
      if (ignoredKeys.indexOf(key) === -1 && a[key] !== b[key]) {
        changes.push({ propertyName: key, before: a[key], after: b[key] });
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
