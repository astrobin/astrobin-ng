import type { ApplicationRef, TransferState } from "@angular/core";
import { Injectable, makeStateKey } from "@angular/core";
import type { Store } from "@ngrx/store";
import { filter, take } from "rxjs/operators";

export const NGRX_STATE_KEY = makeStateKey<any>("NGRX_STATE");

@Injectable({ providedIn: "root" })
export class StoreTransferService {
  constructor(private appRef: ApplicationRef, private transferState: TransferState, private store: Store) {}

  public init(): void {
    // Wait for Angular to be stable before capturing the state
    this.appRef.isStable
      .pipe(
        filter(stable => stable),
        take(1)
      )
      .subscribe(() => {
        // Capture the current state and transfer it
        this.store.pipe(take(1)).subscribe(state => {
          this.transferState.set(NGRX_STATE_KEY, state);
        });
      });
  }
}
