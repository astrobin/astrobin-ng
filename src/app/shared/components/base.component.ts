import { Directive, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

@Directive()
// tslint:disable-next-line:directive-class-suffix
export class BaseComponent implements OnDestroy {
  destroyedSubject = new Subject();
  destroyed$ = this.destroyedSubject.asObservable();

  ngOnDestroy(): void {
    this.destroyedSubject.next();
  }
}
