import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { EventStopPropagationDirective } from "@shared/directives/event-stop-propagation/event-stop-propagation.directive";
import { EventPreventDefaultDirective } from "@shared/directives/event-prevent-default/event-prevent-default.directive";

const directives = [EventPreventDefaultDirective, EventStopPropagationDirective];

@NgModule({
  declarations: directives,
  exports: directives,
  imports: [CommonModule]
})
export class DirectivesModule {}
