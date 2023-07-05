import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BetaBannerComponent } from './beta-banner.component';

describe('BetaBannerComponent', () => {
  let component: BetaBannerComponent;
  let fixture: ComponentFixture<BetaBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BetaBannerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BetaBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
