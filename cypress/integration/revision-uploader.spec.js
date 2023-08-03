/// <reference types="cypress" />

import { Constants } from "../../src/app/shared/constants";

context("revision uploader", () => {
  beforeEach(() => {
    cy.server();
    cy.route("get", "**/images/image/1", "fixture:api/images/image_1.json").as("getImage");
    cy.route("get", "**/images/thumbnail-group/?image=1", "fixture:api/images/image_1.json").as("getThumbnailGroup");

    cy.route("get", "**/images/image/2", "fixture:api/images/image_2.json").as("getImage");
    cy.route("get", "**/images/thumbnail-group/?image=2", "fixture:api/images/image_2.json").as("getThumbnailGroup");

    cy.route("get", "**/api/v2/images/image-revision/?image=*", { count: 0, results: [] });
  });

  describe("when logged out", () => {
    it("should redirect to the login page", () => {
      cy.setupInitializationRoutes();
      cy.route("get", "**/common/userprofiles/current", []).as("getCurrentUserProfile");

      cy.visitPage("/uploader/revision/1");
      cy.url().should("contain", "/account/logging-in");
    });
  });

  describe("when logged in", () => {
    beforeEach(() => {
      cy.setupInitializationRoutes();
    });

    describe("when the website is in read-only mode", () => {
      beforeEach(() => {
        cy.login();
        cy.route("get", "**/json-api/common/app-config/", "fixture:api/json/app-config-read-only.json").as("appConfig");
      });

      it("should show the read-only mode alert", () => {
        cy.visitPage("/uploader/revision/1");

        cy.get("astrobin-read-only-mode").should("exist");
      });
    });

    describe("when the website is not in read-only mode", () => {
      beforeEach(() => {
        cy.login();

        cy.route("get", "**/common/userprofiles/current", "fixture:api/common/userprofile_current_2.json").as(
          "getCurrentUserProfile"
        );
        cy.route("get", "**/common/users/*", "fixture:api/common/users_2.json").as("getUser");
        cy.route("get", "**/images/image/2", "fixture:api/images/image_2.json").as("getImage");
        cy.route("get", "**/images/thumbnail-group/?image=2", "fixture:api/images/image_2.json").as(
          "getThumbnailGroup"
        );

        cy.route(
          "GET",
          "**/common/usersubscriptions/?user=*",
          "fixture:api/common/usersubscriptions_2_ultimate.json"
        ).as("getUserSubscriptions");
      });

      it("should not show the read-only mode alert", () => {
        cy.visitPage("/uploader/revision/2");

        cy.get("astrobin-read-only-mode").should("not.exist");
      });

      describe("when the user is on Ultimate", () => {
        beforeEach(() => {
          cy.route(
            "GET",
            "**/common/usersubscriptions/?user=*",
            "fixture:api/common/usersubscriptions_2_ultimate.json"
          ).as("getUserSubscriptions");

          cy.visitPage("/uploader/revision/2");
        });

        it("should show the correct messages about number of revisions", () => {
          cy.get("h1 + small")
            .contains("Enjoy your unlimited revisions per image!")
            .should("be.visible");
        });

        it("should have all form controls", () => {
          cy.get("#image_file").should("exist");
          cy.get("#description").should("exist");
          cy.get("#skip_notifications").should("exist");
          cy.get("#mark_as_final").should("exist");
          Constants.ALLOWED_UPLOAD_EXTENSIONS.forEach(format => {
            cy.get(".accepted-formats")
              .should("contain.text", format.replace(".", "").toUpperCase());
          });
        });

        it("should allow the upload also if the user has a large number of revisions on this image", () => {
          cy.route("get", "**/api/v2/image/image-revision/?image=*", {
            count: 5,
            results: [
              {
                pk: 1,
                image: 2
              },
              {
                pk: 2,
                image: 2
              },
              {
                pk: 3,
                image: 2
              },
              {
                pk: 4,
                image: 2
              },
              {
                pk: 5,
                image: 2
              }
            ]
          });

          cy.visitPage("/uploader/revision/2");

          cy.get("#image_file").should("exist");
          cy.get("upload-not-allowed").should("not.exist");
        });
      });

      describe("when the user is on Premium", () => {
        beforeEach(() => {
          cy.route(
            "GET",
            "**/common/usersubscriptions/?user=*",
            "fixture:api/common/usersubscriptions_2_premium.json"
          ).as("getUserSubscriptions");

          cy.visitPage("/uploader/revision/2");
        });

        it("should show the correct messages about number of revisions", () => {
          cy.get("h1 + small")
            .contains("Enjoy your unlimited revisions per image!")
            .should("be.visible");
        });

        it("should have all form controls", () => {
          cy.get("#image_file").should("exist");
          cy.get("#description").should("exist");
          cy.get("#skip_notifications").should("exist");
          cy.get("#mark_as_final").should("exist");
        });

        it("should allow the upload also if the user has a large number of revisions on this image", () => {
          cy.route("get", "**/api/v2/images/image-revision/?image=*", {
            count: 5,
            results: [
              {
                pk: 1,
                image: 2
              },
              {
                pk: 2,
                image: 2
              },
              {
                pk: 3,
                image: 2
              },
              {
                pk: 4,
                image: 2
              },
              {
                pk: 5,
                image: 2
              }
            ]
          });

          cy.visitPage("/uploader/revision/2");

          cy.get("#image_file").should("exist");
          cy.get("upload-not-allowed").should("not.exist");
        });
      });

      describe("when the user is on Premium autorenew", () => {
        beforeEach(() => {
          cy.route(
            "GET",
            "**/common/usersubscriptions/?user=*",
            "fixture:api/common/usersubscriptions_2_premium.json"
          ).as("getUserSubscriptions");

          cy.visitPage("/uploader/revision/2");
        });

        it("should show the correct messages about number of revisions", () => {
          cy.get("h1 + small")
            .contains("Enjoy your unlimited revisions per image!")
            .should("be.visible");
        });

        it("should have all form controls", () => {
          cy.get("#image_file").should("exist");
          cy.get("#description").should("exist");
          cy.get("#skip_notifications").should("exist");
          cy.get("#mark_as_final").should("exist");
        });

        it("should allow the upload also if the user has a large number of revisions on this image", () => {
          cy.route("get", "**/api/v2/image/image-revisions/?image=*", {
            count: 5,
            results: [
              {
                pk: 1,
                image: 2
              },
              {
                pk: 2,
                image: 2
              },
              {
                pk: 3,
                image: 2
              },
              {
                pk: 4,
                image: 2
              },
              {
                pk: 5,
                image: 2
              }
            ]
          });

          cy.visitPage("/uploader/revision/2");

          cy.get("#image_file").should("exist");
          cy.get("upload-not-allowed").should("not.exist");
        });
      });

      describe("when the user is on Lite", () => {
        beforeEach(() => {
          cy.route("get", "**/common/usersubscriptions/?user=*", "fixture:api/common/usersubscriptions_2_lite.json").as(
            "getUserSubscriptions"
          );

          cy.visitPage("/uploader/revision/2");
        });

        it("should show the correct messages about number of revisions", () => {
          cy.get("h1 + small")
            .contains("Enjoy your unlimited revisions per image!")
            .should("be.visible");
        });

        it("should have all form controls", () => {
          cy.get("#image_file").should("exist");
          cy.get("#description").should("exist");
          cy.get("#skip_notifications").should("exist");
          cy.get("#mark_as_final").should("exist");
        });

        it("should allow the upload also if the user has a large number of revisions on this image", () => {
          cy.route("get", "**/api/v2/image/image-revisions/?image=*", {
            count: 5,
            results: [
              {
                pk: 1,
                image: 2
              },
              {
                pk: 2,
                image: 2
              },
              {
                pk: 3,
                image: 2
              },
              {
                pk: 4,
                image: 2
              },
              {
                pk: 5,
                image: 2
              }
            ]
          });

          cy.visitPage("/uploader/revision/2");

          cy.get("#image_file").should("exist");
          cy.get("upload-not-allowed").should("not.exist");
        });
      });

      describe("when the user is on Lite autorenew", () => {
        beforeEach(() => {
          cy.route("get", "**/common/usersubscriptions/?user=*", "fixture:api/common/usersubscriptions_2_lite.json").as(
            "getUserSubscriptions"
          );

          cy.visitPage("/uploader/revision/2");
        });

        it("should show the correct messages about number of revisions", () => {
          cy.get("h1 + small")
            .contains("Enjoy your unlimited revisions per image!")
            .should("be.visible");
        });

        it("should have all form controls", () => {
          cy.get("#image_file").should("exist");
          cy.get("#description").should("exist");
          cy.get("#skip_notifications").should("exist");
          cy.get("#mark_as_final").should("exist");
        });

        it("should allow the upload also if the user has a large number of revisions on this image", () => {
          cy.route("get", "**/api/v2/image/image-revisions/?image=*", {
            count: 5,
            results: [
              {
                pk: 1,
                image: 2
              },
              {
                pk: 2,
                image: 2
              },
              {
                pk: 3,
                image: 2
              },
              {
                pk: 4,
                image: 2
              },
              {
                pk: 5,
                image: 2
              }
            ]
          });

          cy.visitPage("/uploader/revision/2");

          cy.get("#image_file").should("exist");
          cy.get(".upload-not-allowed").should("not.exist");
        });
      });

      describe("when the user is on Premium 2020", () => {
        beforeEach(() => {
          cy.route(
            "GET",
            "**/common/usersubscriptions/?user=*",
            "fixture:api/common/usersubscriptions_2_premium_2020.json"
          ).as("getUserSubscriptions");

          cy.visitPage("/uploader/revision/2");
        });

        it("should show the correct messages about number of revisions", () => {
          cy.get("h1 + small")
            .contains("You may have up to 5 revisions per image.")
            .should("be.visible");
        });

        it("should have all form controls", () => {
          cy.get("#image_file").should("exist");
          cy.get("#description").should("exist");
          cy.get("#skip_notifications").should("exist");
          cy.get("#mark_as_final").should("exist");
        });

        it("should not allow the upload if the user has more revisions than allowed", () => {
          cy.route("get", "**/api/v2/images/image-revision/?image=*", {
            count: 5,
            results: [
              {
                pk: 1,
                image: 2
              },
              {
                pk: 2,
                image: 2
              },
              {
                pk: 3,
                image: 2
              },
              {
                pk: 4,
                image: 2
              },
              {
                pk: 5,
                image: 2
              }
            ]
          });

          cy.visitPage("/uploader/revision/2");

          cy.get("#image_file").should("not.exist");
          cy.get(".upload-not-allowed").should("exist");
        });
      });

      describe("when the user is on Lite 2020", () => {
        beforeEach(() => {
          cy.route(
            "GET",
            "**/common/usersubscriptions/?user=*",
            "fixture:api/common/usersubscriptions_2_lite_2020.json"
          ).as("getUserSubscriptions");

          cy.visitPage("/uploader/revision/2");
        });

        it("should show the correct messages about number of revisions", () => {
          cy.get("h1 + small")
            .contains("You may have up to one revision per image.")
            .should("be.visible");
        });

        it("should have all form controls", () => {
          cy.get("#image_file").should("exist");
          cy.get("#description").should("exist");
          cy.get("#skip_notifications").should("exist");
          cy.get("#mark_as_final").should("exist");
        });

        it("should not allow the upload if the user has more revisions than allowed", () => {
          cy.route("get", "**/api/v2/images/image-revision/?image=*", {
            count: 5,
            results: [
              {
                pk: 1,
                image: 2
              }
            ]
          });

          cy.visitPage("/uploader/revision/2");

          cy.get("#image_file").should("not.exist");
          cy.get(".upload-not-allowed").should("exist");
        });
      });

      describe("when on a free account", () => {
        beforeEach(() => {
          cy.route("get", "**/common/usersubscriptions/?user=*", []).as("getUserSubscriptions");

          cy.visitPage("/uploader/revision/2");
        });

        it("should show the correct messages about number of revisions", () => {
          cy.get("h1 + small")
            .contains("Sorry, revisions are not included at your membership level.")
            .should("be.visible");
        });

        it("should not have all form controls", () => {
          cy.get("#image_file").should("not.exist");
          cy.get("#description").should("not.exist");
          cy.get("#skip_notifications").should("not.exist");
          cy.get("#mark_as_final").should("not.exist");

          cy.get(".upload-not-allowed").should("exist");
        });
      });
    });
  });
});
