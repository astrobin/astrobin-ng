import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";

import {
  BackendGroupInterface,
  BackendPermissionInterface,
  BackendUserInterface,
  CommonApiAdaptorService
} from "./common-api-adaptor.service";

describe("CommonApiAdaptorService", () => {
  let service: CommonApiAdaptorService;

  beforeEach(async () => {
    await MockBuilder(CommonApiAdaptorService);
    service = TestBed.inject(CommonApiAdaptorService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("permissionFromBackend", () => {
    it("should convert correctly", () => {
      const backendPermission: BackendPermissionInterface = {
        id: 1,
        name: "foo",
        codename: "bar",
        content_type: 2
      };

      expect(service.permissionFromBackend(backendPermission)).toEqual({
        id: 1,
        name: "foo",
        codeName: "bar",
        contentType: 2
      });
    });
  });

  describe("GroupFromBackend", () => {
    it("should convert correctly", () => {
      const backendGroup: BackendGroupInterface = {
        id: 1,
        name: "foo",
        permissions: [
          {
            id: 1,
            name: "foo",
            codename: "bar",
            content_type: 2
          },
          {
            id: 2,
            name: "foo2",
            codename: "bar2",
            content_type: 2
          }
        ]
      };

      expect(service.authGroupFromBackend(backendGroup)).toEqual({
        id: 1,
        name: "foo",
        permissions: [
          {
            id: 1,
            name: "foo",
            codeName: "bar",
            contentType: 2
          },
          {
            id: 2,
            name: "foo2",
            codeName: "bar2",
            contentType: 2
          }
        ]
      });
    });
  });

  describe("UserFromBackend", () => {
    it("should convert correctly", () => {
      const backendUser: BackendUserInterface = {
        id: 1,
        avatar: "/foo/avatar.jpg",
        large_avatar: "/foo/large-avatar.jpg",
        userprofile: 1,
        last_login: "2020-04-10T19:05:51.400207",
        is_superuser: true,
        username: "foo",
        display_name: "Foo",
        first_name: "Foo",
        is_staff: true,
        is_active: true,
        date_joined: "2020-04-09T19:45:21.522611",
        groups: [
          {
            id: 1,
            name: "foo",
            permissions: [
              {
                id: 1,
                name: "foo",
                codename: "bar",
                content_type: 2
              },
              {
                id: 2,
                name: "foo2",
                codename: "bar2",
                content_type: 2
              }
            ]
          }
        ],
        astrobin_groups: [],
        user_permissions: [
          {
            id: 1,
            name: "foo",
            codename: "bar",
            content_type: 2
          },
          {
            id: 2,
            name: "foo2",
            codename: "bar2",
            content_type: 2
          }
        ],
        marketplace_feedback: null,
        marketplace_feedback_count: 0,
        marketplace_listing_count: 0
      };

      expect(service.userFromBackend(backendUser)).toEqual({
        id: 1,
        avatar: "/foo/avatar.jpg",
        largeAvatar: "/foo/large-avatar.jpg",
        userProfile: 1,
        lastLogin: "2020-04-10T19:05:51.400207",
        isSuperUser: true,
        username: "foo",
        firstName: "Foo",
        isStaff: true,
        isActive: true,
        dateJoined: "2020-04-09T19:45:21.522611",
        displayName: "Foo",
        groups: [
          {
            id: 1,
            name: "foo",
            permissions: [
              {
                id: 1,
                name: "foo",
                codeName: "bar",
                contentType: 2
              },
              {
                id: 2,
                name: "foo2",
                codeName: "bar2",
                contentType: 2
              }
            ]
          }
        ],
        astrobinGroups: [],
        userPermissions: [
          {
            id: 1,
            name: "foo",
            codeName: "bar",
            contentType: 2
          },
          {
            id: 2,
            name: "foo2",
            codeName: "bar2",
            contentType: 2
          }
        ],
        marketplaceFeedback: null,
        marketplaceFeedbackCount: 0,
        marketplaceListingCount: 0
      });
    });
  });
});
