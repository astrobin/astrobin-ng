import { Injectable } from "@angular/core";
import type { NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { LoadingDialogComponent } from "@shared/components/misc/loading-dialog/loading-dialog.component";

@Injectable({
  providedIn: "root"
})
export class ModalService {
  constructor(private modalService: NgbModal) {}

  openLoadingDialog(): NgbModalRef {
    return this.modalService.open(LoadingDialogComponent, {
      backdrop: "static",
      keyboard: false
    });
  }

  open(component: any, options?: any): NgbModalRef {
    return this.modalService.open(component, options);
  }
}
