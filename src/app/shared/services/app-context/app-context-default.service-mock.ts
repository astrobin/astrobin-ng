import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { AppContextGenerator } from "../../generators/app-context.generator";
import { AppContextInterface } from "./app-context.service";
import { AppContextServiceInterface } from "./app-context.service-interface";

@Injectable({
  providedIn: "root"
})
export class AppContextDefaultServiceMock implements AppContextServiceInterface {
  context$: Observable<AppContextInterface>;

  private _subject = new BehaviorSubject<AppContextInterface>(undefined);

  constructor() {
    this.context$ = this._subject.asObservable();
  }

  load(): Promise<any> {
    return new Promise<any>(resolve => {
      this._subject.next(AppContextGenerator.anonymous());
    });
  }

  loadForUser(): Promise<any> {
    return new Promise<any>(resolve => {
      this._subject.next(AppContextGenerator.default());
    });
  }
}
