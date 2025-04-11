import { AfterViewInit, ElementRef, Directive } from "@angular/core";
import { Router } from "@angular/router";

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
          void this.router.navigateByUrl(routerLink);
        });
      }
    });
  }
}
