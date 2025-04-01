import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

/**
 * A structural directive similar to ngIf but without the conditional check.
 * It creates a context in the template where complex expressions can be stored
 * in a variable to avoid re-evaluation.
 */
@Directive({
  selector: '[ngLet]',
})
export class NgLetDirective<T> {
  private context = {
    ngLet: null as unknown as T,
  };

  constructor(
    private viewContainer: ViewContainerRef,
    private templateRef: TemplateRef<{ ngLet: T }>
  ) {
    this.viewContainer.createEmbeddedView(this.templateRef, this.context);
  }

  @Input()
  set ngLet(value: T) {
    this.context.ngLet = value;
  }
}
