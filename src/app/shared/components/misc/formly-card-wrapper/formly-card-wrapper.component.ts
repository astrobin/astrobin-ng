import { Component, ViewChild, ViewContainerRef } from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";
import { animate, state, style, transition, trigger } from "@angular/animations";

@Component({
  selector: "astrobin-formly-card-wrapper",
  templateUrl: "./formly-card-wrapper.component.html",
  styleUrls: ["./formly-card-wrapper.component.scss"],
  animations: [
    trigger("collapse", [
      state("collapsed", style({
        maxHeight: "0px",
        padding: "0"
      })),
      state("expanded", style({
        maxHeight: "9999px",
        padding: "1rem"
      })),
      transition("expanded => collapsed", [
        style({ padding: "0" }), // Apply styles immediately when collapsing
        style({ maxHeight: "0px" })
      ]),
      transition("collapsed => expanded", [
        style({ padding: "1rem" }), // Apply padding immediately when expanding
        animate("0.3s ease-in", style({ maxHeight: "9999px" }))
      ])
    ])
  ]
})
export class FormlyCardWrapperComponent extends FieldWrapper {
  @ViewChild("fieldComponent", { read: ViewContainerRef })
  fieldComponent: ViewContainerRef;

  toggleCollapse(event: Event) {
    event.stopPropagation();

    if (!this.field.props.collapsible) {
      return;
    }

    this.field.props.collapsed = !this.field.props.collapsed;
  }
}
