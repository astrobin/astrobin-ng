import { ComponentFixture, TestBed } from "@angular/core/testing";

import { testAppImports } from "@app/test-app.imports";
import { testAppProviders } from "@app/test-app.providers";
import { SubscriptionsViewPaymentsPageComponent } from "./subscriptions-view-payments-page.component";

describe("SubscriptionsViewPaymentsPageComponent", () => {
  let component: SubscriptionsViewPaymentsPageComponent;
  let fixture: ComponentFixture<SubscriptionsViewPaymentsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [testAppImports],
      providers: [testAppProviders],
      declarations: [SubscriptionsViewPaymentsPageComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionsViewPaymentsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
