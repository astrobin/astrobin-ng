import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup } from '@angular/forms';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { MeasurementData } from '../measuring-tool.component';
import { Store } from '@ngrx/store';
import { MainState } from '@app/store/state';
import { BaseComponentDirective } from '@shared/components/base-component.directive';

// Define the form model interface
interface MeasurementFormModel {
  name: string;
  notes: string;
}

@Component({
  selector: 'astrobin-save-measurement-modal',
  templateUrl: './save-measurement-modal.component.html',
  styleUrls: ['./save-measurement-modal.component.scss']
})
export class SaveMeasurementModalComponent extends BaseComponentDirective implements OnInit {
  form = new FormGroup({});
  model: MeasurementFormModel = { name: '', notes: '' };
  fields: FormlyFieldConfig[] = [];
  measurementData: MeasurementData;
  defaultName: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    // Initialize the model with default values
    this.model.name = this.defaultName || '';

    this.fields = [
      {
        template: `
          <div class="alert alert-dark mb-3">
            <small>
              ${this.translateService.instant('Saved measurements store only the distance and relative positions of measurement points. When loaded on another image, they will be placed in the center and can be repositioned freely.')}
            </small>
          </div>
        `
      },
      {
        key: 'name',
        type: 'input',
        wrappers: ['default-wrapper'],
        props: {
          required: true,
          label: this.translateService.instant('Name'),
          placeholder: this.translateService.instant('Enter a name for this measurement'),
          autofocus: true
        },
        validation: {
          messages: {
            required: this.translateService.instant('Name is required')
          }
        }
      },
      {
        key: 'notes',
        type: 'textarea',
        wrappers: ['default-wrapper'],
        props: {
          label: this.translateService.instant('Notes'),
          placeholder: this.translateService.instant('Add notes about this measurement (optional)'),
          rows: 3
        }
      }
    ];
  }

  dismiss(): void {
    this.modal.dismiss();
  }

  save(): void {
    if (this.form.valid) {
      this.modal.close({
        name: this.model.name,
        notes: this.model.notes
      });
    }
  }
}
