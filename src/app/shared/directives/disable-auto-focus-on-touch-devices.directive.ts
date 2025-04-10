import { isPlatformBrowser } from "@angular/common";
import type { AfterViewInit } from "@angular/core";
import { Directive, ElementRef, Inject, PLATFORM_ID } from "@angular/core";
import { DeviceService } from "@core/services/device.service";

@Directive({
  selector: "[disableAutoFocusOnTouchDevices]"
})
export class DisableAutoFocusOnTouchDevicesDirective implements AfterViewInit {
  constructor(
    public readonly elementRef: ElementRef,
    @Inject(PLATFORM_ID) public readonly platformId: object,
    public readonly deviceService: DeviceService
  ) {}

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId) && this.deviceService.isTouchEnabled()) {
      requestAnimationFrame(() => {
        (this.elementRef.nativeElement as HTMLElement).blur();
      });
    }
  }
}
