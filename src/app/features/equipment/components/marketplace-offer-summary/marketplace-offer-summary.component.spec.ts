import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceOfferSummaryComponent } from './marketplace-offer-summary.component';

describe('MarketplaceOfferSummaryComponent', () => {
  let component: MarketplaceOfferSummaryComponent;
  let fixture: ComponentFixture<MarketplaceOfferSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarketplaceOfferSummaryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketplaceOfferSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
