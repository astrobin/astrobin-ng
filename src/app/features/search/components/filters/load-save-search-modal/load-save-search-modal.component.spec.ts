import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadSaveSearchModalComponent } from './load-save-search-modal.component';

describe('LoadSaveSearchModalComponent', () => {
  let component: LoadSaveSearchModalComponent;
  let fixture: ComponentFixture<LoadSaveSearchModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadSaveSearchModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadSaveSearchModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
