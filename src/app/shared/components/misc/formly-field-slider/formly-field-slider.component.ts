import { Component, OnInit } from "@angular/core";
import { FieldType } from "@ngx-formly/core";

@Component({
  selector: "astrobin-formly-field-slider",
  templateUrl: "./formly-field-slider.component.html",
  styleUrls: ["./formly-field-slider.component.scss"]
})
export class FormlyFieldSliderComponent extends FieldType implements OnInit {
  value: number;
  highValue: number;

  ngOnInit() {
    this.value = this.formControl.value.min || this.props.sliderOptions.floor || 0;
    this.highValue = this.formControl.value.max || this.props.sliderOptions.ceil || 100;

    if (!this.formControl.value) {
      this.formControl.setValue({
        min: this.value,
        max: this.highValue
      });
    }
  }

  onValueChange(value: number) {
    this.formControl.patchValue({ min: value, max: this.highValue });
  }

  onHighValueChange(highValue: number) {
    this.formControl.patchValue({ min: this.value, max: highValue });
  }
}
