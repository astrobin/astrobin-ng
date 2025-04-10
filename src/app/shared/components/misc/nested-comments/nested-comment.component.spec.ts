import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { ContentTranslateService } from "@core/services/content-translate.service";
import { HighlightService } from "@core/services/highlight.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { NestedCommentGenerator } from "@shared/generators/nested-comment.generator";
import { MockBuilder } from "ng-mocks";
import { of } from "rxjs";

import { NestedCommentComponent } from "./nested-comment.component";

describe("NestedCommentComponent", () => {
  let component: NestedCommentComponent;
  let fixture: ComponentFixture<NestedCommentComponent>;

  // Mock services
  const mockHighlightService = {
    needsHighlighting: jest.fn().mockReturnValue(false),
    loadHighlightJs: jest.fn().mockReturnValue(Promise.resolve()),
    highlightCodeBlocks: jest.fn()
  };

  const mockUtilsService = {
    delay: jest.fn().mockReturnValue(of(null))
  };

  const mockContentTranslateService = {
    hasTranslation: jest.fn().mockReturnValue(false),
    sanitizeContent: jest.fn().mockImplementation(html => html),
    translate: jest.fn().mockReturnValue(of("<div>translated content</div>")),
    clearTranslation: jest.fn()
  };

  beforeEach(async () => {
    await MockBuilder(NestedCommentComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      provideMockActions(() => of()),
      { provide: HighlightService, useValue: mockHighlightService },
      { provide: UtilsService, useValue: mockUtilsService },
      { provide: ContentTranslateService, useValue: mockContentTranslateService }
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NestedCommentComponent);
    component = fixture.componentInstance;
    component.comment = NestedCommentGenerator.nestedComment();
    jest.spyOn(component.windowRefService, "getCurrentUrl").mockReturnValue({ hash: null } as URL);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  // Rather than testing specific implementations, we'll test that the
  // appropriate services are being called when needed.

  it("should check for code blocks in comment content", () => {
    // Reset mock counts
    mockHighlightService.needsHighlighting.mockClear();

    // Set a comment with code blocks
    const htmlWithCode = "<pre><code>const example = 'test';</code></pre>";
    component.comment = {
      ...component.comment,
      html: htmlWithCode
    };

    // Manually call the method we want to test
    component._updateHtml();

    // Verify the service was called
    expect(mockHighlightService.needsHighlighting).toHaveBeenCalled();
    expect(mockContentTranslateService.sanitizeContent).toHaveBeenCalled();
  });
});
