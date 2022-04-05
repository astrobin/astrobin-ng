import { Directive, HostListener } from "@angular/core";

@Directive({
  selector: "[appEventStopPropagation]"
})
export class EventStopPropagationDirective {
  @HostListener("click", ["$event"])
  public onClick(event: Event): void {
    event.stopPropagation();
  }
}
