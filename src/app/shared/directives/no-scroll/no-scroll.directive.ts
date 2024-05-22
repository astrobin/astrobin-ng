import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
  selector: "[astrobinNoScroll]"
})
export class NoScrollDirective {
  constructor(public readonly el: ElementRef) {
  }

  @HostListener("wheel", ["$event"])
  @HostListener("scroll", ["$event"])
  onWheel(event: WheelEvent): void {
    const element = this.el.nativeElement;
    if (element === document.activeElement) {
      // Prevent the default behavior of changing the input value
      event.preventDefault();

      // Manually dispatch a new wheel event on the parent element to ensure page scroll
      element.blur(); // Temporarily blur the input to allow the parent to handle the event
      const newEvent = new WheelEvent(event.type, event);
      element.parentElement.dispatchEvent(newEvent);
    }
  }
}
