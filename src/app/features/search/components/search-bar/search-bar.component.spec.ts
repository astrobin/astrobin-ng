import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchBarComponent } from "./search-bar.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { SearchService } from "@core/services/search.service";
import { WindowRefService } from "@core/services/window-ref.service";

describe("SearchBarComponent", () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchBarComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      {
        provide: WindowRefService,
        useValue: {
          nativeWindow: {
            document: {
              addEventListener: () => {},
              removeEventListener: () => {}
            }
          }
        }
      }
    ]).mock(SearchService);

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    component.model = {
      text: {
        value: ""
      }
    }
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
