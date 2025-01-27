import { Inject, Injectable, OnDestroy, PLATFORM_ID } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable, Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";
import { TogglePropertyInterface } from "@shared/interfaces/toggle-property.interface";
import { MainState } from "@app/store/state";
import { LoadToggleProperties } from "@app/store/actions/toggle-property.actions";
import { isPlatformBrowser } from "@angular/common";

interface PendingCheck {
  propertyType: TogglePropertyInterface["propertyType"];
  userId: TogglePropertyInterface["user"];
  objectId: TogglePropertyInterface["objectId"];
  contentType: TogglePropertyInterface["contentType"];
  subject: Subject<boolean>;
}

@Injectable({
  providedIn: "root"
})
export class TogglePropertyBatchService implements OnDestroy {
  private _destroyed$ = new Subject<void>();
  private _pendingChecks = new Map<string, PendingCheck>();
  private _batchSubject = new Subject<void>();
  private readonly _BATCH_DELAY = 500; // ms to wait before sending batch

  constructor(
    private store$: Store<MainState>,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this._initBatchProcessing();
    }
  }

  checkToggleProperty(
    propertyType: TogglePropertyInterface["propertyType"],
    userId: TogglePropertyInterface["user"],
    objectId: TogglePropertyInterface["objectId"],
    contentType: TogglePropertyInterface["contentType"]
  ): Observable<boolean> {
    if (!isPlatformBrowser(this.platformId)) {
      return new Observable(observer => observer.complete());
    }

    const subject = new Subject<boolean>();
    const key = this._createKey(propertyType, userId, objectId, contentType + "");

    this._pendingChecks.set(key, {
      propertyType,
      userId,
      objectId,
      contentType,
      subject
    });

    this._batchSubject.next();

    return subject.asObservable();
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  private _initBatchProcessing(): void {
    this._batchSubject.pipe(
      debounceTime(this._BATCH_DELAY),
      takeUntil(this._destroyed$)
    ).subscribe(() => {
      this._processBatch();
    });
  }

  private _createKey(
    propertyType: string,
    userId: number,
    objectId: number,
    contentType: string
  ): string {
    return `${propertyType}-${userId}-${objectId}-${contentType}`;
  }

  private _processBatch(): void {
    if (this._pendingChecks.size === 0) {
      return;
    }

    // Group checks by property type and content type
    const groups = new Map<string, PendingCheck[]>();

    for (const check of this._pendingChecks.values()) {
      const groupKey = `${check.propertyType}-${check.contentType}`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey).push(check);
    }

    // Dispatch actions for each group
    for (const [_, checks] of groups) {
      this.store$.dispatch(new LoadToggleProperties({
        toggleProperties: checks.map(check => ({
          propertyType: check.propertyType,
          user: check.userId,
          objectId: check.objectId,
          contentType: check.contentType
        }))
      }));
    }

    // Clear pending checks after dispatching
    this._pendingChecks.clear();
  }
}
