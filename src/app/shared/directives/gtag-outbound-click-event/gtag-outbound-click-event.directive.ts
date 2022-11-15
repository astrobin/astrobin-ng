import { Directive, HostListener, Input } from "@angular/core";
import { WindowRefService } from "@shared/services/window-ref.service";
import { LoadingService } from "@shared/services/loading.service";

declare const gtag: any;

@Directive({
  selector: "[astrobinGtagOutboundClickEvent]"
})
export class GtagOutboundClickEventDirective {
  @Input()
  href: string;

  @Input()
  target: string;

  constructor(public readonly windowRefService: WindowRefService, public readonly loadingService: LoadingService) {
  }

  @HostListener("click", ["$event"])
  public onClick(event: Event): void {
    if (typeof gtag !== "undefined") {
      gtag("event", "click", {
        event_category: "Outbound link",
        event_action: this.href,
        event_label: this.windowRefService.getCurrentUrl().toString(),
        transport_type: "beacon"
      });
    }

    if (this.target === "_blank") {
      this.windowRefService.nativeWindow.open(this.href, "_blank");
    } else {
      this.windowRefService.locationAssign(this.href);
    }
  }
}
