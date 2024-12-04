import { Component, Input } from "@angular/core";
import { FeedItemInterface, FeedItemVerb } from "@features/home/interfaces/feed-item.interface";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Component({
  selector: "astrobin-feed-item-display-text",
  template: `
    <span [innerHTML]="sanitizedMessage" dynamicRouterLink></span>
  `
})
export class FeedItemDisplayTextComponent {
  @Input() feedItem!: FeedItemInterface;

  constructor(
    private translateService: TranslateService,
    private sanitizer: DomSanitizer
  ) {
  }

  get sanitizedMessage(): SafeHtml {
    const rawMessage = this.getMessage();
    return this.sanitizer.bypassSecurityTrustHtml(rawMessage);
  }

  private getMessage(): string {
    const actorUrl = `/u/${this.feedItem.actorUsername}`;
    const actorLink = `<a
      href="${actorUrl}"
      routerLink="${actorUrl}"
    >${this.feedItem.actorDisplayName}</a>`;

    switch (this.feedItem.verb) {
      case FeedItemVerb.VERB_UPLOADED_IMAGE:
        return this.translateService.instant(
          "{{ actor }} published an image.",
          { actor: actorLink }
        );

      case FeedItemVerb.VERB_UPLOADED_REVISION:
        return this.translateService.instant(
          "{{ actor }} published an image revision.",
          { actor: actorLink }
        );

      case FeedItemVerb.VERB_LIKED_IMAGE:
        if (this.feedItem.othersCount > 0) {
          return this.translateService.instant(
            "{{ actor }} and {{ count }} others liked this image.",
            {
              actor: actorLink,
              count: this.feedItem.othersCount
            }
          );
        }
        return this.translateService.instant(
          "{{ actor }} liked an image.",
          { actor: actorLink }
        );

      case FeedItemVerb.VERB_BOOKMARKED_IMAGE:
        if (this.feedItem.othersCount > 0) {
          return this.translateService.instant(
            "{{ actor }} and {{ count }} others bookmarked this image.",
            {
              actor: actorLink,
              count: this.feedItem.othersCount
            }
          );
        }
        return this.translateService.instant(
          "{{ actor }} bookmarked this image.",
          { actor: actorLink }
        );

      case FeedItemVerb.VERB_COMMENTED_IMAGE:
        if (this.feedItem.othersCount > 0) {
          return this.translateService.instant(
            "{{ actor }} and {{ count }} others commented on this image.",
            {
              actor: actorLink,
              count: this.feedItem.othersCount
            }
          );
        }
        return this.translateService.instant(
          "{{ actor }} commented on this image.",
          { actor: actorLink }
        );

      case FeedItemVerb.VERB_CREATED_PUBLIC_GROUP:
        return this.translateService.instant(
          "{{ actor }} created a public group.",
          { actor: actorLink }
        );

      case FeedItemVerb.VERB_JOINED_GROUP:
        return this.translateService.instant(
          "{{ actor }} joined a group.",
          { actor: actorLink }
        );

      case FeedItemVerb.VERB_CREATED_MARKETPLACE_LISTING:
        return this.translateService.instant(
          "{{ actor }} created a marketplace listing.",
          { actor: actorLink }
        );
    }
  }
}
