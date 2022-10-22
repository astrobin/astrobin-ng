import { Injectable, OnDestroy } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { Observable, Subject, Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

@Injectable()
export class BaseService implements OnDestroy {
  destroyedSubject = new Subject<void>();
  destroyed$ = this.destroyedSubject.asObservable();

  loadingSubject = new Subject<boolean>();
  loading$: Observable<boolean> = this.loadingSubject.asObservable().pipe(debounceTime(LoadingService.DEBOUNCE_TIME));

  private loadingSubscription: Subscription;

  constructor(public readonly loadingService: LoadingService) {
    this.loadingSubscription = this.loading$.subscribe(value => this.loadingService.setLoading(value));
  }

  ngOnDestroy(): void {
    this.destroyedSubject.next();
    this.loadingSubscription.unsubscribe();
  }
}
