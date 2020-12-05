import { ComponentFixture, TestBed } from "@angular/core/testing";

import { testAppImports } from "@app/test-app.imports";
import { SubscriptionsCancelledPageComponent } from "./subscriptions-cancelled-page.component";

describe("CancelledPageComponent", () => {
  let component: SubscriptionsCancelledPageComponent;
  let fixture: ComponentFixture<SubscriptionsCancelledPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [testAppImports],
      declarations: [SubscriptionsCancelledPageComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionsCancelledPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
