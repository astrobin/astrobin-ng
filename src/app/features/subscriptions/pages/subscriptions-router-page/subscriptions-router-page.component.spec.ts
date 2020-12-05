import { ComponentFixture, TestBed } from "@angular/core/testing";

import { testAppImports } from "@app/test-app.imports";
import { testAppProviders } from "@app/test-app.providers";
import { SubscriptionsRouterPageComponent } from "./subscriptions-router-page.component";

describe("SubscriptionsRouterPageComponent", () => {
  let component: SubscriptionsRouterPageComponent;
  let fixture: ComponentFixture<SubscriptionsRouterPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [testAppImports],
      providers: [testAppProviders],
      declarations: [SubscriptionsRouterPageComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionsRouterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
