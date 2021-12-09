import { Directive, HostListener } from "@angular/core";

@Directive({
  selector: "[appEventPreventDefault]"
})
export class EventPreventDefaultDirective {
  @HostListener("click", ["$event"])
  public onClick(event: Event): void {
    event.preventDefault();
  }
}
