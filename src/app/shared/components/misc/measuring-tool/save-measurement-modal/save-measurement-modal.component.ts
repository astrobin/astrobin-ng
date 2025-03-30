import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MeasurementData } from '../measuring-tool.component';

@Component({
  selector: 'astrobin-save-measurement-modal',
  templateUrl: './save-measurement-modal.component.html',
  styleUrls: ['./save-measurement-modal.component.scss']
})
export class SaveMeasurementModalComponent implements OnInit {
  form: FormGroup;
  measurementData: MeasurementData;
  defaultName: string;

  constructor(
    public modal: NgbActiveModal,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    console.log('SaveMeasurementModalComponent initialized with defaultName:', this.defaultName);
    console.log('SaveMeasurementModalComponent measurementData:', this.measurementData);
    
    this.form = this.formBuilder.group({
      name: [this.defaultName || '', Validators.required],
      notes: ['']
    });
  }

  dismiss(): void {
    this.modal.dismiss();
  }

  save(): void {
    if (this.form.valid) {
      console.log('SaveMeasurementModalComponent: Form is valid, closing modal with data:', {
        name: this.form.get('name').value,
        notes: this.form.get('notes').value
      });
      
      this.modal.close({
        name: this.form.get('name').value,
        notes: this.form.get('notes').value
      });
    } else {
      console.error('SaveMeasurementModalComponent: Form is invalid:', this.form.errors);
    }
  }
}