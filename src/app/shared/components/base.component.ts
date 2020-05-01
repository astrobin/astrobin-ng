import { OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

export class BaseComponent implements OnDestroy {
  destroyedSubject = new Subject();
  destroyed$ = this.destroyedSubject.asObservable();

  ngOnDestroy(): void {
    this.destroyedSubject.next();
  }
}
