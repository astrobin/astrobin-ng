import { Directive, HostListener } from "@angular/core";

@Directive({
  selector: "[astrobinEventPreventDefault]"
})
export class EventPreventDefaultDirective {
  @HostListener("click", ["$event"])
  public onClick(event: Event): void {
    event.preventDefault();
  }
}
