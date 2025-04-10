import { EventEmitter } from "@angular/core";

export enum SearchFilterCategory {
  GENERAL,
  DATETIME,
  SKY_AND_SUBJECTS,
  EQUIPMENT,
  EQUIPMENT_ATTRIBUTES,
  ACQUISITION_ATTRIBUTES,
  FILE_ATTRIBUTES
}

export interface SearchFilterComponentInterface {
  category: SearchFilterCategory;
  label: string;
  value: any;
  valueChanges: EventEmitter<any>;
  hasValue: () => boolean;
  valueTransformer?: (value: any) => any;
  remove: EventEmitter<void>;
  edit: () => void;
}
