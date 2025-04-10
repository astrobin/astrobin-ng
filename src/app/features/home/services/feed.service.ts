import { Injectable } from "@angular/core";
import { FeedItemInterface } from "@features/home/interfaces/feed-item.interface";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: "root"
})
export class FeedService {
  constructor(public readonly translateService: TranslateService) {}

  removeDuplicates(items: FeedItemInterface[]): FeedItemInterface[] {
    const result = new Array<FeedItemInterface>(items.length);
    let resultIndex = 0;

    // Store the index where we first saw each key
    const seenActionObject = new Map<string, number>();
    const seenTarget = new Map<string, number>();

    // Single pass through the array
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Create keys only if both parts exist
      const actionKey =
        item.actionObjectObjectId && item.actionObjectContentType
          ? `${item.actionObjectObjectId}:${item.actionObjectContentType}`
          : "";
      const targetKey =
        item.targetObjectId && item.targetContentType ? `${item.targetObjectId}:${item.targetContentType}` : "";

      // Check if we've seen either key
      const seenActionIndex = actionKey ? seenActionObject.get(actionKey) || seenTarget.get(actionKey) : undefined;
      const seenTargetIndex = targetKey ? seenActionObject.get(targetKey) || seenTarget.get(targetKey) : undefined;

      // If we haven't seen either key, or if this item was the first occurrence
      if ((!actionKey || seenActionIndex === undefined) && (!targetKey || seenTargetIndex === undefined)) {
        // Store the current index
        if (actionKey) {
          seenActionObject.set(actionKey, i);
        }
        if (targetKey) {
          seenTarget.set(targetKey, i);
        }

        // Add item to result
        result[resultIndex++] = item;
      }
    }

    // Trim array to actual size
    return result.slice(0, resultIndex);
  }
}
