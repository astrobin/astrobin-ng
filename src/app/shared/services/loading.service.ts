import { Injectable } from "@angular/core";
import { LoadingServiceInterface } from "@shared/services/loading.service-interface";
import { Observable, Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class LoadingService implements LoadingServiceInterface {
  static readonly DEBOUNCE_TIME = 100;

  loadingSubject = new Subject<boolean>();
  loading$: Observable<boolean> = this.loadingSubject.asObservable().pipe(debounceTime(LoadingService.DEBOUNCE_TIME));

  private _isLoading = false;
  private _loadingStack = 0;

  isLoading(): Observable<boolean> {
    return this.loading$;
  }

  setLoading(value: boolean): void {
    if (value) {
      this._isLoading = true;
      this._loadingStack += 1;
    } else {
      this._loadingStack -= 1;

      if (this._loadingStack < 0) {
        this._loadingStack = 0;
      }

      if (this._loadingStack === 0) {
        this._isLoading = false;
      }
    }

    this.loadingSubject.next(this._isLoading);
  }
}
