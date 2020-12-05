import { ComponentFixture, TestBed } from "@angular/core/testing";

import { testAppImports } from "@app/test-app.imports";
import { testAppProviders } from "@app/test-app.providers";
import { SubscriptionsViewSubscriptionsPageComponent } from "./subscriptions-view-subscriptions-page.component";

describe("SubscriptionsViewSubscriptionsPageComponent", () => {
  let component: SubscriptionsViewSubscriptionsPageComponent;
  let fixture: ComponentFixture<SubscriptionsViewSubscriptionsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [testAppImports],
      providers: [testAppProviders],
      declarations: [SubscriptionsViewSubscriptionsPageComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionsViewSubscriptionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
