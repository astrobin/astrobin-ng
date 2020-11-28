import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";
import { testAppImports } from "@app/test-app.imports";
import { NotFound404PageComponent } from "./not-found-404-page.component";

describe("NotFoundPageComponent", () => {
  let component: NotFound404PageComponent;
  let fixture: ComponentFixture<NotFound404PageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [testAppImports],
      declarations: [NotFound404PageComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotFound404PageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
