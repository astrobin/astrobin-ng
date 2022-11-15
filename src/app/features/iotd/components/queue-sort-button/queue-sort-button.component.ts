import { Component, EventEmitter, Output } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";
import { selectStaffMemberSettings } from "@features/iotd/store/iotd.selectors";
import { map } from "rxjs/operators";
import { QueueSortOrder } from "@features/iotd/types/staff-member-settings.interface";

@Component({
  selector: "astrobin-queue-sort-button",
  templateUrl: "./queue-sort-button.component.html",
  styleUrls: ["./queue-sort-button.component.scss"]
})
export class QueueSortButtonComponent extends BaseComponentDirective {
  @Output()
  queueSortOrderChanged = new EventEmitter<"newest" | "oldest">();

  constructor(public readonly store$: Store<State>, public readonly loadingService: LoadingService) {
    super(store$);
  }

  get newestFirst$(): Observable<boolean> {
    return this.store$.select(selectStaffMemberSettings).pipe(
      map(settings => {
        return !settings || settings.queueSortOrder === QueueSortOrder.NEWEST_FIRST;
      })
    );
  }

  get oldestFirst$(): Observable<boolean> {
    return this.store$.select(selectStaffMemberSettings).pipe(
      map(settings => {
        return settings && settings.queueSortOrder === QueueSortOrder.OLDEST_FIRST;
      })
    );
  }
}
