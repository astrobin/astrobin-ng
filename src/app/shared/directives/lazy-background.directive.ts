import { Directive, ElementRef, Input, OnInit, Renderer2 } from "@angular/core";

@Directive({
  selector: "[astrobinLazyBackground]"
})
export class LazyBackgroundDirective implements OnInit {
  @Input("astrobinLazyBackground") regularUrl: string;
  @Input() highResolutionUrl: string;
  @Input() useHighResolution = false;

  constructor(
    public readonly el: ElementRef,
    public readonly renderer: Renderer2
  ) {
    this.renderer.setStyle(this.el.nativeElement, "position", "relative");
  }

  ngOnInit() {
    const options = { rootMargin: "50px" };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const commonStyles = {
            width: "100%",
            height: "100%"
          };

          // Create and set up the regular layer
          const regularLayer = this.renderer.createElement('div');
          Object.entries(commonStyles).forEach(([key, value]) => {
            this.renderer.setStyle(regularLayer, key, value);
          });
          this.renderer.setStyle(regularLayer, "background-image", `url(${this.regularUrl})`);

          // Copy background styling from parent
          const styles = window.getComputedStyle(this.el.nativeElement);
          ['background-position', 'background-size', 'background-repeat'].forEach(prop => {
            this.renderer.setStyle(regularLayer, prop, styles.getPropertyValue(prop));
          });

          this.renderer.appendChild(this.el.nativeElement, regularLayer);

          if (this.useHighResolution && this.highResolutionUrl) {
            // Create and set up the high resolution layer only if needed
            const highResLayer = this.renderer.createElement('div');
            Object.entries(commonStyles).forEach(([key, value]) => {
              this.renderer.setStyle(highResLayer, key, value);
            });
            this.renderer.setStyle(highResLayer, "transition", "opacity 0.3s ease-in-out");
            this.renderer.setStyle(highResLayer, "opacity", "0");

            // Copy background styling from parent
            ['background-position', 'background-size', 'background-repeat'].forEach(prop => {
              this.renderer.setStyle(highResLayer, prop, styles.getPropertyValue(prop));
            });

            this.renderer.appendChild(this.el.nativeElement, highResLayer);

            const highResImage = new Image();
            highResImage.onload = () => {
              this.renderer.setStyle(highResLayer, "background-image", `url(${this.highResolutionUrl})`);
              // Listen for transition end to remove the regular layer after fade-in
              const transitionListener = this.renderer.listen(highResLayer, 'transitionend', () => {
                this.renderer.removeChild(this.el.nativeElement, regularLayer);
                transitionListener(); // Clean up the listener
              });
              this.renderer.setStyle(highResLayer, "opacity", "1");
            };
            highResImage.src = this.highResolutionUrl;
          }

          observer.unobserve(this.el.nativeElement);
        }
      });
    }, options);

    observer.observe(this.el.nativeElement);
  }
}
