import { Injectable } from "@angular/core";

// tslint:disable-next-line:no-empty-interface
export interface CustomWindowInterface extends Window {
}

function getWindow(): any {
  return window;
}

@Injectable()
export class WindowRefService {
  get nativeWindow(): CustomWindowInterface {
    return getWindow();
  }
}
