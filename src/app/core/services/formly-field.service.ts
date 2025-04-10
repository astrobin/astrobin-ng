import type { TemplateRef } from "@angular/core";
import { Injectable } from "@angular/core";
import type { SafeHtml } from "@angular/platform-browser";
import { BaseService } from "@core/services/base.service";
import type { LoadingService } from "@core/services/loading.service";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import type { Observable } from "rxjs";
import { Subject } from "rxjs";

export enum FormlyFieldMessageLevel {
  INFO = "INFO",
  WARNING = "WARNING"
}

export interface FormlyFieldMessage {
  level: FormlyFieldMessageLevel;
  scope: string; // Identifier for the source of the message (validator name, component, etc.)
  text?: string | SafeHtml;
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

  /**
   * Clears messages from a specific scope.
   * @param config The FormlyFieldConfig to clear messages from
   * @param scope The scope identifier. Only messages with this scope will be cleared.
   */
  clearMessages(config: FormlyFieldConfig, scope: string) {
    if (config["messages"] === undefined) {
      config["messages"] = [];
      return;
    }

    // Only clear messages with the matching scope
    config["messages"] = config["messages"].filter(m => m.scope !== scope);

    this.messagesChangesSubject.next(config["messages"]);
  }

  /**
   * Adds a message to a field
   * @param config The FormlyFieldConfig to add a message to
   * @param message The message to add. Scope is required for new code.
   */
  addMessage(config: FormlyFieldConfig, message: FormlyFieldMessage) {
    if (config["messages"] === undefined) {
      config["messages"] = [];
    }

    if (!message.text && !message.template) {
      return;
    }

    // Default scope for backward compatibility
    if (!message.scope) {
      message.scope = "default";
    }

    // Clear duplicates by text or template/data within the same scope.
    this.removeMessage(config, message, false);

    config["messages"] = [...config["messages"], message];

    this.messagesChangesSubject.next(config["messages"]);
  }

  /**
   * Removes a message from a field
   * @param config The FormlyFieldConfig to remove a message from
   * @param message The message to remove
   * @param emitEvent Whether to emit a change event
   */
  removeMessage(config: FormlyFieldConfig, message: FormlyFieldMessage, emitEvent = true) {
    if (config["messages"] !== undefined) {
      // Default scope for backward compatibility
      if (!message.scope) {
        message.scope = "default";
      }

      // Only remove messages that match both the scope and content
      config["messages"] = config["messages"].filter(m => m.scope !== message.scope || !this._equals(m, message));

      if (emitEvent) {
        this.messagesChangesSubject.next(config["messages"]);
      }
    }
  }

  private _equals(a: FormlyFieldMessage, b: FormlyFieldMessage): boolean {
    return (
      a.scope === b.scope &&
      a.text === b.text &&
      a.template === b.template &&
      JSON.stringify(a.data) === JSON.stringify(b.data)
    );
  }
}
