import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { testAppImports } from "@app/test-app.imports";
import { EmptyListComponent } from "@shared/components/misc/empty-list/empty-list.component";
import { UsernameComponent } from "@shared/components/misc/username/username.component";
import { MockComponents } from "ng-mocks";
import { ContestsListComponent } from "./contests-list.component";

describe("ContestsListComponent", () => {
  let component: ContestsListComponent;
  let fixture: ComponentFixture<ContestsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [testAppImports],
      declarations: [ContestsListComponent, MockComponents(EmptyListComponent, UsernameComponent)]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContestsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
