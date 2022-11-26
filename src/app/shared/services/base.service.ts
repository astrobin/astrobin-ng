import { Injectable, OnDestroy } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { Observable, ReplaySubject, Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";

@Injectable()
export class BaseService implements OnDestroy {
  destroyedSubject = new ReplaySubject<void>(1);
  destroyed$ = this.destroyedSubject.asObservable();

  loadingSubject = new Subject<boolean>();
  loading$: Observable<boolean> = this.loadingSubject
    .asObservable()
    .pipe(takeUntil(this.destroyed$), debounceTime(LoadingService.DEBOUNCE_TIME));

  constructor(public readonly loadingService: LoadingService) {
    this.loading$.subscribe((value) => this.loadingService.setLoading(value));
  }

  ngOnDestroy(): void {
    this.destroyedSubject.next();
    this.destroyedSubject.complete();
  }
}
