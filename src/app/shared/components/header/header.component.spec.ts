import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { AppModule } from "@app/app.module";
import { StateGenerator } from "@app/store/generators/state.generator";
import type { MainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { EMPTY, of } from "rxjs";

import { HeaderComponent } from "./header.component";

describe("HeaderComponent", () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  const initialState: MainState = StateGenerator.default();

  beforeEach(() =>
    MockBuilder(HeaderComponent, AppModule).provide([
      provideMockStore({ initialState }),
      {
        provide: Router,
        useValue: {
          events: EMPTY
        }
      }
    ])
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;

    jest.spyOn(component.authService, "isAuthenticated$").mockReturnValue(of(false));
    jest.spyOn(component.windowRefService, "getCurrentUrl").mockReturnValue(new URL("https://www.astrobin.com/"));
    component.translateService.currentLang = "en";

    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("logout", () => {
    it("should defer to a store$ event", () => {
      const mockEvent = {
        preventDefault: jest.fn()
      };

      jest.spyOn(component.store$, "dispatch");

      component.logout(mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(component.store$.dispatch).toHaveBeenCalled();
    });
  });
});
