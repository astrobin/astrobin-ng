import { Component, EventEmitter, Output } from "@angular/core";
import { MainState } from "@app/store/state";
import { LoadingService } from "@core/services/loading.service";
import { selectStaffMemberSettings } from "@features/iotd/store/iotd.selectors";
import { QueueSortOrder } from "@features/iotd/types/staff-member-settings.interface";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "astrobin-queue-sort-button",
  templateUrl: "./queue-sort-button.component.html",
  styleUrls: ["./queue-sort-button.component.scss"]
})
export class QueueSortButtonComponent extends BaseComponentDirective {
  @Output()
  queueSortOrderChanged = new EventEmitter<"newest" | "oldest">();

  constructor(public readonly store$: Store<MainState>, public readonly loadingService: LoadingService) {
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
