import { Component, ElementRef, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { VendorInterface } from "@shared/interfaces/equipment/vendor.interface";

@Component({
  selector: "astrobin-vendor",
  templateUrl: "./vendor.component.html",
  styleUrls: ["./vendor.component.scss"],
})
export class VendorComponent implements OnInit {
  @Input()
  public vendor: VendorInterface;

  @Output()
  public click = new EventEmitter<string>();

  public constructor(public readonly elementRef: ElementRef) {
  }

  public ngOnInit(): void {
    if (this.vendor) {
      this.elementRef.nativeElement.setAttribute("id", this.vendor.id);
    }
  }
}
