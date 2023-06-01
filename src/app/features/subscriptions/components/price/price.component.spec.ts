import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PriceComponent } from "./price.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("PriceComponent", () => {
  let component: PriceComponent;
  let fixture: ComponentFixture<PriceComponent>;

  beforeEach(async () => {
    await MockBuilder(PriceComponent, AppModule).provide([provideMockStore({ initialState })]);

    fixture = TestBed.createComponent(PriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
