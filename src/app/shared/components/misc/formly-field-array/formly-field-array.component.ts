import { Component } from "@angular/core";
import { FieldArrayType, FormlyFieldConfig } from "@ngx-formly/core";
import { animate, state, style, transition, trigger } from "@angular/animations";
import { WindowRefService } from "@shared/services/window-ref.service";

@Component({
  selector: "astrobin-formly-field-array",
  templateUrl: "./formly-field-array.component.html",
  styleUrls: ["./formly-field-array.component.scss"],
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
export class FormlyFieldArrayComponent extends FieldArrayType {
  collapsedIndexes = [];

  constructor(public readonly windowRefService: WindowRefService) {
    super();
  }

  get props() {
    return (this.field.fieldArray as FormlyFieldConfig).props;
  }

  toggleCollapse(event: Event, index: number) {
    event.stopPropagation();

    if (!this.props.collapsible) {
      return;
    }

    if (!this.collapsedIndexes.includes(index)) {
      this.collapsedIndexes.push(index);
    } else {
      this.collapsedIndexes = this.collapsedIndexes.filter(i => i !== index);
    }
  }

  remove(i: number) {
    if (this.mayRemove(i)) {
      return super.remove(i, { markAsDirty: true });
    }

    return false;
  }

  mayAdd() {
    const mayAddFunction = this.props.mayAdd;
    const hasMayAddFunction = mayAddFunction && typeof mayAddFunction === "function";
    return hasMayAddFunction ? mayAddFunction() : true;
  }

  mayRemove(i: number) {
    const mayRemoveFunction = this.field.fieldGroup[i].props.mayRemove;
    const hasMayRemoveFunction = mayRemoveFunction && typeof mayRemoveFunction === "function";
    return hasMayRemoveFunction ? mayRemoveFunction(i) : true;
  }
}
