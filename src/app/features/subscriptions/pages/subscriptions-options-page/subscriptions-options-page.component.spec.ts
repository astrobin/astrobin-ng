import { ComponentFixture, TestBed } from "@angular/core/testing";

import { testAppImports } from "@app/test-app.imports";
import { SubscriptionsOptionsPageComponent } from "./subscriptions-options-page.component";

describe("SubscriptionsOptionsPageComponent", () => {
  let component: SubscriptionsOptionsPageComponent;
  let fixture: ComponentFixture<SubscriptionsOptionsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [testAppImports],
      declarations: [SubscriptionsOptionsPageComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubscriptionsOptionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
