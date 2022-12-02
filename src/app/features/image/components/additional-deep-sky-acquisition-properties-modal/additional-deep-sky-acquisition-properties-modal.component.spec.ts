import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalDeepSkyAcquisitionPropertiesModalComponent } from './additional-deep-sky-acquisition-properties-modal.component';

describe('AdditionalDeepSkyAcquisitionPropertiesModalComponent', () => {
  let component: AdditionalDeepSkyAcquisitionPropertiesModalComponent;
  let fixture: ComponentFixture<AdditionalDeepSkyAcquisitionPropertiesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdditionalDeepSkyAcquisitionPropertiesModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdditionalDeepSkyAcquisitionPropertiesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
