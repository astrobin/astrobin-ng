import { Injectable, OnDestroy } from "@angular/core";
import { LoadingServiceInterface } from "@shared/services/loading.service-interface";
import { Observable, ReplaySubject, Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class LoadingService implements LoadingServiceInterface, OnDestroy {
  static readonly DEBOUNCE_TIME = 250;

  destroyedSubject = new ReplaySubject<void>(1);
  destroyed$ = this.destroyedSubject.asObservable();
  loadingSubject = new ReplaySubject<boolean>();
  loading$: Observable<boolean> = this.loadingSubject
    .asObservable()
    .pipe(takeUntil(this.destroyed$), debounceTime(LoadingService.DEBOUNCE_TIME));

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

  ngOnDestroy(): void {
    this.destroyedSubject.next();
    this.destroyedSubject.complete();
  }
}
