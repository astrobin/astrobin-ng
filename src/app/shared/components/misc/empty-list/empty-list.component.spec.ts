import { async, ComponentFixture, TestBed } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { EmptyListComponent } from "./empty-list.component";

describe("EmptyListComponent", () => {
  let component: EmptyListComponent;
  let fixture: ComponentFixture<EmptyListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [testAppImports],
      declarations: [EmptyListComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmptyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
