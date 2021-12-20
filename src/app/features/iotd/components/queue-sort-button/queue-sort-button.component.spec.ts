import { ComponentFixture, TestBed } from "@angular/core/testing";

import { QueueSortButtonComponent } from "./queue-sort-button.component";
import { MockBuilder } from "ng-mocks";
import { IotdModule } from "@features/iotd/iotd.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";

describe("QueueSortButtonComponent", () => {
  let component: QueueSortButtonComponent;
  let fixture: ComponentFixture<QueueSortButtonComponent>;

  beforeEach(async () => {
    await MockBuilder(QueueSortButtonComponent, IotdModule).provide(provideMockStore({ initialState }));
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
