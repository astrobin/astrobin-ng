import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ToggleButtonComponent } from "./toggle-button.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("ToggleButtonComponent", () => {
  let component: ToggleButtonComponent;
  let fixture: ComponentFixture<ToggleButtonComponent>;

  beforeEach(async () => MockBuilder(ToggleButtonComponent, AppModule).provide(provideMockStore({ initialState })));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToggleButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
