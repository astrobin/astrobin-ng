import type { ElementRef, OnDestroy } from "@angular/core";
import { Directive, EventEmitter, Output } from "@angular/core";

@Directive({
  selector: "[astrobinPreventScrollClick]"
})
export class PreventScrollClickDirective implements OnDestroy {
  @Output() intentionalClick = new EventEmitter<MouseEvent | TouchEvent>();

  private touchStartPos: { x: number; y: number } | null = null;
  private isScrolling = false;
  private moveThreshold = 10; // pixels

  private touchStartHandler = (e: TouchEvent) => {
    const touch = e.touches[0];
    this.touchStartPos = {
      x: touch.clientX,
      y: touch.clientY
    };
    this.isScrolling = false;
  };

  private touchMoveHandler = (e: TouchEvent) => {
    if (!this.touchStartPos) {
      return;
    }

    const touch = e.touches[0];
    const deltaX = Math.abs(touch.clientX - this.touchStartPos.x);
    const deltaY = Math.abs(touch.clientY - this.touchStartPos.y);

    if (deltaX > this.moveThreshold || deltaY > this.moveThreshold) {
      this.isScrolling = true;
    }
  };

  private touchEndHandler = (e: TouchEvent) => {
    if (!this.isScrolling) {
      this.intentionalClick.emit(e);
    }
    this.touchStartPos = null;
    this.isScrolling = false;
  };

  private clickHandler = (e: MouseEvent) => {
    if (!this.isScrolling) {
      this.intentionalClick.emit(e);
    }
  };

  constructor(private el: ElementRef) {
    this.el.nativeElement.addEventListener("touchstart", this.touchStartHandler);
    this.el.nativeElement.addEventListener("touchmove", this.touchMoveHandler);
    this.el.nativeElement.addEventListener("touchend", this.touchEndHandler);
    this.el.nativeElement.addEventListener("click", this.clickHandler);
  }

  ngOnDestroy() {
    // Clean up event listeners
    this.el.nativeElement.removeEventListener("touchstart", this.touchStartHandler);
    this.el.nativeElement.removeEventListener("touchmove", this.touchMoveHandler);
    this.el.nativeElement.removeEventListener("touchend", this.touchEndHandler);
    this.el.nativeElement.removeEventListener("click", this.clickHandler);
  }
}
