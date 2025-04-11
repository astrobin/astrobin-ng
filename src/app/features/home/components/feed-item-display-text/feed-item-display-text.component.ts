import { OnChanges, ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { FeedItemInterface, FeedItemVerb } from "@features/home/interfaces/feed-item.interface";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-feed-item-display-text",
  template: ` <span [innerHTML]="message" dynamicRouterLink></span> `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeedItemDisplayTextComponent implements OnChanges {
  @Input() feedItem!: FeedItemInterface;

  protected message: SafeHtml = "";

  constructor(
    private translateService: TranslateService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnChanges(): void {
    this.message = this._getSanitizedMessage();
  }

  private _getSanitizedMessage(): SafeHtml {
    const rawMessage = this._getMessage();
    return this.sanitizer.bypassSecurityTrustHtml(rawMessage);
  }

  private _getMessage(): string {
    const actorUrl = `/u/${this.feedItem.actorUsername}`;
    const actorLink = `<a
      href="${actorUrl}"
      routerLink="${actorUrl}"
    >${this.feedItem.actorDisplayName}</a>`;

    switch (this.feedItem.verb) {
      case FeedItemVerb.VERB_UPLOADED_IMAGE:
        return this.translateService.instant("{{ actor }} published an image.", { actor: actorLink });

      case FeedItemVerb.VERB_UPLOADED_REVISION:
        return this.translateService.instant("{{ actor }} published an image revision.", { actor: actorLink });

      case FeedItemVerb.VERB_LIKED_IMAGE:
        return this.translateService.instant("{{ actor }} liked this image.", { actor: actorLink });

      case FeedItemVerb.VERB_BOOKMARKED_IMAGE:
        if (this.feedItem.othersCount > 0) {
          return this.translateService.instant("{{ actor }} and {{ count }} others bookmarked this image.", {
            actor: actorLink,
            count: this.feedItem.othersCount
          });
        }
        return this.translateService.instant("{{ actor }} bookmarked this image.", { actor: actorLink });

      case FeedItemVerb.VERB_COMMENTED_IMAGE:
        if (this.feedItem.othersCount > 0) {
          return this.translateService.instant("{{ actor }} and {{ count }} others commented on this image.", {
            actor: actorLink,
            count: this.feedItem.othersCount
          });
        }
        return this.translateService.instant("{{ actor }} commented on this image.", { actor: actorLink });

      case FeedItemVerb.VERB_CREATED_PUBLIC_GROUP:
        return this.translateService.instant("{{ actor }} created a public group.", { actor: actorLink });

      case FeedItemVerb.VERB_JOINED_GROUP:
        return this.translateService.instant("{{ actor }} joined a group.", { actor: actorLink });

      case FeedItemVerb.VERB_CREATED_MARKETPLACE_LISTING:
        return this.translateService.instant("{{ actor }} created a marketplace listing.", { actor: actorLink });
    }
  }
}
