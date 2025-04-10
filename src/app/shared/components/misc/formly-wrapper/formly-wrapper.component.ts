import { ChangeDetectorRef, OnDestroy, Component } from "@angular/core";
import { FormlyFieldMessage, FormlyFieldService } from "@core/services/formly-field.service";
import { FieldWrapper } from "@ngx-formly/core";
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
