import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceFeedbackComponent } from './marketplace-feedback.component';

describe('MarketplaceFeedbackComponent', () => {
  let component: MarketplaceFeedbackComponent;
  let fixture: ComponentFixture<MarketplaceFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarketplaceFeedbackComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketplaceFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
