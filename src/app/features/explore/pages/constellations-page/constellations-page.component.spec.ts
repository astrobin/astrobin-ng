import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ConstellationsPageComponent } from "./constellations-page.component";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { AppModule } from "@app/app.module";

describe("ConstellationsPageComponent", () => {
  let component: ConstellationsPageComponent;
  let fixture: ComponentFixture<ConstellationsPageComponent>;

  beforeEach(async () => {
    await MockBuilder(ConstellationsPageComponent, AppModule).provide(provideMockStore({ initialState }));
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
