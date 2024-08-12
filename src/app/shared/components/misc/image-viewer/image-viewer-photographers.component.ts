import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { ImageService } from "@shared/services/image/image.service";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { UserInterface } from "@shared/interfaces/user.interface";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";

@Component({
  selector: "astrobin-image-viewer-photographers",
  template: `
    <div class="metadata-section">
      <div class="metadata-item avatars">
        <a
          *ngFor="let avatar of avatars"
          [href]="classicRoutesService.GALLERY(avatar.username)"
          target="_blank"
          class="me-1"
        >
          <img [src]="avatar.url" alt="" />
        </a>
      </div>

      <div *ngIf="users?.length === 1" class="metadata-item flex-grow-1 text-start">
        <a
          *ngFor="let user of users"
          [href]="classicRoutesService.GALLERY(user.username)"
          target="_blank"
          class="d-block w-100"
        >
          {{ user.displayName }}
        </a>
      </div>

      <div *ngIf="publicationDate" class="metadata-item text-end flex-row">
        <fa-icon icon="calendar"></fa-icon>
        {{ publicationDate | localDate | timeago:true }}
      </div>
    </div>
  `,
  styleUrls: ["./image-viewer-photographers.component.scss"]
})
export class ImageViewerPhotographersComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  @Input()
  image: ImageInterface;

  avatars: {
    url: string;
    username: UserInterface["username"];
  }[];

  users: {
    username: UserInterface["username"];
    displayName: UserProfileInterface["realName"];
  }[];

  publicationDate: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly imageService: ImageService
  ) {
    super(store$, searchService, router, imageViewerService);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.image && changes.image.currentValue) {
      this.publicationDate = this.imageService.getPublicationDate(changes.image.currentValue);
      this.setAvatarUrls(changes.image.currentValue);
      this.setUsers(changes.image.currentValue);
    }
  }

  setAvatarUrls(image: ImageInterface): void {
    this.avatars = [
      {
        url: image.userAvatar,
        username: image.username
      },
      ...image.collaborators.map(collaborator => ({
        url: collaborator.avatar,
        username: collaborator.username
      }))
    ].map(avatar => ({
      url: avatar.url.indexOf("default-avatar") > -1 ? "/assets/images/default-avatar.jpeg?v=2" : avatar.url,
      username: avatar.username
    }));
  }

  setUsers(image: ImageInterface): void {
    this.users = [
      {
        username: image.username,
        displayName: image.userDisplayName
      },
      ...image.collaborators.map(collaborator => ({
        username: collaborator.username,
        displayName: collaborator.displayName
      }))
    ];
  }
}
