import { Directive } from "@angular/core";
import type { ControlValueAccessor } from "@angular/forms";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

@Directive({
  // eslint-disable-next-line
  selector: "input[type=file]",
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: {
    "(change)": "onChange($event.target.files)",
    "(blur)": "onTouched()"
  },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: FileValueAccessorDirective, multi: true }]
})
export class FileValueAccessorDirective implements ControlValueAccessor {
  value: any;

  onChange = () => {
    // Called when file input changes
  };

  onTouched = () => {
    // Called on input blur
  };

  writeValue() {
    // Implement as required by ControlValueAccessor
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }
}
