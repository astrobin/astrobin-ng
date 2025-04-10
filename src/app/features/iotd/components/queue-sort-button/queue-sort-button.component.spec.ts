import { ComponentFixture, TestBed } from "@angular/core/testing";
import { initialMainState } from "@app/store/state";
import { IotdModule } from "@features/iotd/iotd.module";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { QueueSortButtonComponent } from "./queue-sort-button.component";

describe("QueueSortButtonComponent", () => {
  let component: QueueSortButtonComponent;
  let fixture: ComponentFixture<QueueSortButtonComponent>;

  beforeEach(async () => {
    await MockBuilder(QueueSortButtonComponent, IotdModule).provide(
      provideMockStore({ initialState: initialMainState })
    );
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueueSortButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
