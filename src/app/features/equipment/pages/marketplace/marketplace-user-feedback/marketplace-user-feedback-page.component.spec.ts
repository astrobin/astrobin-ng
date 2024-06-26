import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceUserFeedbackPageComponent } from './marketplace-user-feedback-page.component';

describe('MarketplaceUserFeedbackPageComponent', () => {
  let component: MarketplaceUserFeedbackPageComponent;
  let fixture: ComponentFixture<MarketplaceUserFeedbackPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarketplaceUserFeedbackPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketplaceUserFeedbackPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
