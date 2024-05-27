import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceOfferSummaryModalComponent } from './marketplace-offer-summary-modal.component';

describe('MarketplaceOfferSummaryModalComponent', () => {
  let component: MarketplaceOfferSummaryModalComponent;
  let fixture: ComponentFixture<MarketplaceOfferSummaryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarketplaceOfferSummaryModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketplaceOfferSummaryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
