import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { ConstellationsPageComponent } from "./constellations-page.component";

describe("ConstellationsPageComponent", () => {
  let component: ConstellationsPageComponent;
  let fixture: ComponentFixture<ConstellationsPageComponent>;

  beforeEach(async () => {
    await MockBuilder(ConstellationsPageComponent, AppModule).provide(
      provideMockStore({ initialState: initialMainState })
    );
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstellationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
