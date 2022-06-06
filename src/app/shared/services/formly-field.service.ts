import { Injectable, TemplateRef } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";

export enum FormlyFieldMessageLevel {
  INFO = "INFO",
  WARNING = "WARNING"
}

export interface FormlyFieldMessage {
  level: FormlyFieldMessageLevel;
  text?: string;
  template?: TemplateRef<any>;
  data?: any;
  dismissible?: boolean;
}

@Injectable({
  providedIn: "root"
})
export class FormlyFieldService extends BaseService {
  constructor(public readonly loadingService: LoadingService) {
    super(loadingService);
  }

  clearMessages(templateOptions: any) {
    templateOptions.messages = [];
  }

  addMessage(templateOptions: any, message: FormlyFieldMessage) {
    if (!templateOptions.messages) {
      templateOptions.messages = [];
    }

    if (!message.text && !message.template) {
      return;
    }

    // Clear duplicates by text or template/data.
    this.removeMessage(templateOptions, message);

    templateOptions.messages.push(message);
  }

  removeMessage(templateOptions: any, message: FormlyFieldMessage) {
    if (!!templateOptions.messages) {
      templateOptions.messages = templateOptions.messages.filter(m => !this._equals(m, message));
    }
  }

  private _equals(a: FormlyFieldMessage, b: FormlyFieldMessage): boolean {
    return a.text === b.text && a.template === b.template && JSON.stringify(a.data) === JSON.stringify(b.data);
  }
}
