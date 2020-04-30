import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";

// tslint:disable-next-line:no-empty-interface
export interface CustomWindowInterface extends Window {}

function getWindow(): any {
  return window;
}

@Injectable()
export class WindowRefService extends BaseService {
  get nativeWindow(): CustomWindowInterface {
    return getWindow();
  }
}
