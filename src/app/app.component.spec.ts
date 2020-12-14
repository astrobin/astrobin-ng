import { RouterModule } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { AppComponent } from "@app/app.component";
import { AppModule } from "@app/app.module";
import { MockBuilder, MockRender } from "ng-mocks";

describe("AppComponent", () => {
  beforeEach(() =>
    MockBuilder(AppComponent, AppModule)
      .keep(RouterModule)
      .keep(RouterTestingModule.withRoutes([]))
  );

  it("should create the app", () => {
    const fixture = MockRender(AppComponent);
    expect(fixture.point.componentInstance).toEqual(jasmine.any(AppComponent));
  });
});
