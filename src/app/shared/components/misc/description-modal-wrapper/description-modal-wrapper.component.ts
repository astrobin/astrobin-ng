import { Component, Input, TemplateRef } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'description-modal-wrapper',
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ title }}</h5>
      <button type="button" class="btn-close text-reset" (click)="activeModal.close()"></button>
    </div>
    <div class="modal-body">
      <ng-container 
        *ngIf="contentTemplate" 
        [ngTemplateOutlet]="contentTemplate"
        [ngTemplateOutletContext]="context">
      </ng-container>
    </div>
  `
})
export class DescriptionModalWrapperComponent {
  @Input() contentTemplate: TemplateRef<any>;
  @Input() title: string;
  @Input() context: any = {};
  
  constructor(public activeModal: NgbActiveModal) {}
}