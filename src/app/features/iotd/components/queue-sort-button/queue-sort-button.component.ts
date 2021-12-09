import { Component, EventEmitter, Output } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { LoadingService } from "@shared/services/loading.service";

@Component({
  selector: "astrobin-queue-sort-button",
  templateUrl: "./queue-sort-button.component.html",
  styleUrls: ["./queue-sort-button.component.scss"]
})
export class QueueSortButtonComponent extends BaseComponentDirective {
  @Output()
  selected = new EventEmitter<"newest" | "oldest">();

  constructor(public readonly store$: Store<State>, public readonly loadingService: LoadingService) {
    super(store$);
  }
}
