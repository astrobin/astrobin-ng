import { RouterModule } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { AppComponent } from "@app/app.component";
import { AppModule } from "@app/app.module";
import { initialState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { TestBed } from "@angular/core/testing";

describe("AppComponent", () => {
  let component: AppComponent;

  beforeEach(() =>
    MockBuilder(AppComponent, AppModule)
      .keep(RouterModule)
      .keep(RouterTestingModule.withRoutes([]), { export: true })
      .provide(provideMockStore({ initialState }))
  );

  beforeEach(() => {
    const fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create the app", () => {
    expect(component).toBeDefined();
  });
});
