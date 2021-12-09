import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { EventPreventDefaultDirective } from "@shared/directives/event-prevent-default/event-prevent-default.directive";

const directives = [EventPreventDefaultDirective];

@NgModule({
  declarations: directives,
  exports: directives,
  imports: [CommonModule]
})
export class DirectivesModule {}
