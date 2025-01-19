import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { EventStopPropagationDirective } from "@shared/directives/event-stop-propagation/event-stop-propagation.directive";
import { EventPreventDefaultDirective } from "@shared/directives/event-prevent-default/event-prevent-default.directive";
import { GtagOutboundClickEventDirective } from "@shared/directives/gtag-outbound-click-event/gtag-outbound-click-event.directive";
import { NoScrollDirective } from "@shared/directives/no-scroll/no-scroll.directive";
import { ScrollToggleDirective } from "@shared/directives/scroll-toggle.directive";
import { StickyDirective } from "@shared/directives/sticky-active.directive";
import { DynamicRouterLinkDirective } from "@shared/directives/dynamic-router-link.directive";
import { ScrollVisibilityDirective } from "@shared/directives/scroll-visibility.directive";

@NgModule({
  declarations: [
    EventPreventDefaultDirective,
    EventStopPropagationDirective,
    GtagOutboundClickEventDirective,
    NoScrollDirective,
    ScrollToggleDirective,
    StickyDirective,
    DynamicRouterLinkDirective,
    ScrollVisibilityDirective
  ],
  exports: [
    EventPreventDefaultDirective,
    EventStopPropagationDirective,
    GtagOutboundClickEventDirective,
    NoScrollDirective,
    ScrollToggleDirective,
    StickyDirective,
    DynamicRouterLinkDirective,
    ScrollVisibilityDirective
  ],
  imports: [CommonModule]
})
export class DirectivesModule {
}
