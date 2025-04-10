import type { AfterViewInit, ElementRef } from "@angular/core";
import { Directive } from "@angular/core";
import type { Router } from "@angular/router";

@Directive({
  selector: "[dynamicRouterLink]"
})
export class DynamicRouterLinkDirective implements AfterViewInit {
  constructor(private el: ElementRef, private router: Router) {}

  ngAfterViewInit() {
    const links = this.el.nativeElement.getElementsByTagName("a");
    Array.from(links).forEach((link: HTMLAnchorElement) => {
      const routerLink = link.getAttribute("routerLink");
      if (routerLink) {
        link.addEventListener("click", (e: Event) => {
          e.preventDefault();
          this.router.navigateByUrl(routerLink);
        });
      }
    });
  }
}
