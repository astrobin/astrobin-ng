import { Injectable, TemplateRef } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable, Subject } from "rxjs";
import { FormlyFieldConfig } from "@ngx-formly/core";

export enum FormlyFieldMessageLevel {
  INFO = "INFO",
  WARNING = "WARNING",
}

export interface FormlyFieldMessage {
  level: FormlyFieldMessageLevel;
  text?: string;
  template?: TemplateRef<any>;
  data?: any;
  dismissible?: boolean;
}

export interface FormlyFieldMessages {
  [id: string]: FormlyFieldMessage[];
}

@Injectable({
  providedIn: "root"
})
export class FormlyFieldService extends BaseService {
  readonly messagesChangesSubject = new Subject<FormlyFieldMessages>();
  readonly messagesChanges$: Observable<FormlyFieldMessages> = this.messagesChangesSubject.asObservable();

  constructor(public readonly loadingService: LoadingService) {
    super(loadingService);
  }

  clearMessages(config: FormlyFieldConfig) {
    config["messages"] = [];
    this.messagesChangesSubject.next(config["messages"]);
  }

  addMessage(config: FormlyFieldConfig, message: FormlyFieldMessage) {
    if (config["messages"] === undefined) {
      config["messages"] = [];
    }

    if (!message.text && !message.template) {
      return;
    }

    // Clear duplicates by text or template/data.
    this.removeMessage(config, message, false);

    config["messages"] = [...config["messages"], message];

    this.messagesChangesSubject.next(config["messages"]);
  }

  removeMessage(config: FormlyFieldConfig, message: FormlyFieldMessage, emitEvent = true) {
    if (config["messages"] !== undefined) {
      config["messages"] = config["messages"].filter(m => !this._equals(m, message));

      if (emitEvent) {
        this.messagesChangesSubject.next(config["messages"]);
      }
    }
  }

  private _equals(a: FormlyFieldMessage, b: FormlyFieldMessage): boolean {
    return a.text === b.text && a.template === b.template && JSON.stringify(a.data) === JSON.stringify(b.data);
  }
}
