import { ChangeDetectorRef, Component, OnDestroy } from "@angular/core";
import { FieldWrapper } from "@ngx-formly/core";
import { FormlyFieldMessage, FormlyFieldService } from "@shared/services/formly-field.service";
import { Subscription } from "rxjs";

@Component({
  selector: "astrobin-formly-wrapper",
  templateUrl: "./formly-wrapper.component.html",
  styleUrls: ["./formly-wrapper.component.scss"]
})
export class FormlyWrapperComponent extends FieldWrapper implements OnDestroy {
  private readonly _messagesChangesSubscription: Subscription;

  constructor(
    public readonly formlyFieldService: FormlyFieldService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super();

    this._messagesChangesSubscription = this.formlyFieldService.messagesChanges$.subscribe(() => {
      this.changeDetectorRef.detectChanges();
    });
  }

  ngOnDestroy() {
    this._messagesChangesSubscription.unsubscribe();
  }

  closeMessage(message: FormlyFieldMessage) {
    this.formlyFieldService.removeMessage(this.field, message);
  }
}
