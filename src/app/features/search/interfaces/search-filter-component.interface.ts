import { EventEmitter } from "@angular/core";

export interface SearchFilterComponentInterface {
  label: string;
  value: any;
  valueChanges: EventEmitter<any>;
  hasValue: () => boolean;
  valueTransformer?: (value: any) => any;
  remove: EventEmitter<void>;
  edit: () => void;
}
