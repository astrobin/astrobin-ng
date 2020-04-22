import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { NotFound404PageComponent } from "./not-found-404-page.component";

describe("NotFoundPageComponent", () => {
  let component: NotFound404PageComponent;
  let fixture: ComponentFixture<NotFound404PageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
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
