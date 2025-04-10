import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { OthersInBrandComponent } from "./others-in-brand.component";

describe("OthersInBrandComponent", () => {
  let component: OthersInBrandComponent;
  let fixture: ComponentFixture<OthersInBrandComponent>;

  beforeEach(async () => {
    await MockBuilder(OthersInBrandComponent, AppModule).provide(provideMockStore({ initialState: initialMainState }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OthersInBrandComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
