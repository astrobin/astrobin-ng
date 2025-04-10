import { Component } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { NgbModalOptions } from "@ng-bootstrap/ng-bootstrap";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-loading-dialog",
  template: `
    <div class="modal-body">
      <astrobin-loading-indicator></astrobin-loading-indicator>
    </div>
  `,
  styleUrls: ["./loading-dialog.component.scss"],
  providers: [
    {
      provide: NgbActiveModal,
      useFactory: (): NgbActiveModal => {
        const modalRef = new NgbActiveModal();
        const defaultOptions: NgbModalOptions = {
          backdrop: "static",
          keyboard: false
        };
        Object.assign(modalRef, defaultOptions);
        return modalRef;
      },
      deps: [Store]
    }
  ]
})
export class LoadingDialogComponent extends BaseComponentDirective {
  constructor(public readonly store$: Store<MainState>, public readonly modal: NgbActiveModal) {
    super(store$);
  }
}
