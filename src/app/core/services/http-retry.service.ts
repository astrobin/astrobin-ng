import { Injectable } from "@angular/core";

interface RetryState {
  currentAttempt: number;
  maxAttempts: number;
}

@Injectable({
  providedIn: "root"
})
export class HttpRetryService {
  private retryingRequests = new Map<string, RetryState>();

  startRetrying(url: string, maxAttempts: number): void {
    this.retryingRequests.set(url, { currentAttempt: 0, maxAttempts });
  }

  incrementRetryAttempt(url: string): void {
    const state = this.retryingRequests.get(url);
    if (state) {
      state.currentAttempt++;
      this.retryingRequests.set(url, state);
    }
  }

  finishRetrying(url: string): void {
    this.retryingRequests.delete(url);
  }

  isRetryInProgress(url: string): boolean {
    const state = this.retryingRequests.get(url);
    if (!state) {
      return false;
    }
    return state.currentAttempt < state.maxAttempts;
  }
}
