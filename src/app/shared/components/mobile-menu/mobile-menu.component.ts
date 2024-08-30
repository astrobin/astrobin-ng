import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { take } from "rxjs/operators";
import { NgbOffcanvasRef } from "@ng-bootstrap/ng-bootstrap/offcanvas/offcanvas-ref";

@Component({
  selector: "astrobin-mobile-menu",
  templateUrl: "./mobile-menu.component.html",
  styleUrls: ["./mobile-menu.component.scss"]
})
export class MobileMenuComponent extends BaseComponentDirective implements OnInit {
  @Input() titleTemplate: TemplateRef<any>;
  @Input() descriptionTemplate: TemplateRef<any>;
  @Input() iconsTemplate: TemplateRef<any>;
  @Input() position: "start" | "end" | "top" | "bottom" = "start";
  @Input() template: TemplateRef<any>;
  @Input() templateContext: any;

  @Output() menuOpen = new EventEmitter<void>();
  @Output() menuClose = new EventEmitter<void>();

  @ViewChild("offcanvasTemplate") protected offcanvasTemplate: TemplateRef<any>;
  @ViewChild("offcanvasDescriptionTemplate") protected offcanvasDescriptionTemplate: TemplateRef<any>;

  private _offcanvasRef: NgbOffcanvasRef;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly offcanvasService: NgbOffcanvas
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  openOffcanvas(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this._offcanvasRef = this.offcanvasService.open(this.offcanvasTemplate, {
      panelClass: "mobile-menu",
      position: this.position
    });

    this._offcanvasRef.hidden.pipe(take(1)).subscribe(() => {
      this.menuClose.emit();
    });

    this.menuOpen.emit();
  }

  openOffcanvasDescription(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.offcanvasService.open(this.offcanvasDescriptionTemplate, {
      panelClass: "offcanvas-description",
      position: "bottom"
    });
  }

  closeOffcanvas(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.offcanvasService.dismiss();
    this.menuClose.emit();
  }
}
