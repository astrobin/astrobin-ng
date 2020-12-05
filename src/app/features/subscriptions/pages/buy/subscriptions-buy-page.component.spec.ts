import { ComponentFixture, TestBed } from "@angular/core/testing";

import { testAppImports } from "@app/test-app.imports";
import { testAppProviders } from "@app/test-app.providers";
import { SubscriptionsBuyPageComponent } from "./subscriptions-buy-page.component";

describe("BuyLitePageComponent", () => {
  let component: SubscriptionsBuyPageComponent;
  let fixture: ComponentFixture<SubscriptionsBuyPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [testAppImports],
      providers: [testAppProviders],
      declarations: [SubscriptionsBuyPageComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionsBuyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
