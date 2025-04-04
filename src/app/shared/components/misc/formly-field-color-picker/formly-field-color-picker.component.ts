import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldType } from '@ngx-formly/core';

@Component({
  selector: 'astrobin-formly-field-color-picker',
  templateUrl: './formly-field-color-picker.component.html',
  styleUrls: ['./formly-field-color-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormlyFieldColorPickerComponent extends FieldType {
  // If there's no options provided, use a default set of colors
  defaultColors: string[] = [
    '#FFFFFF', // White
    '#FF5252', // Red
    '#448AFF', // Blue
    '#4CAF50', // Green
    '#FFC107', // Amber
    '#9C27B0', // Purple
    '#00BCD4', // Cyan
  ];

  get colors(): string[] {
    return this.props.colors || this.defaultColors;
  }

  selectColor(color: string): void {
    this.formControl.setValue(color);
    this.formControl.markAsDirty();
  }
}
