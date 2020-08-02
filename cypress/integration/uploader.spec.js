/// <reference types="cypress" />

context("upload-metadata", () => {
  describe("when logged out", () => {
    it("should redirect to the login page", () => {
      cy.server();
      cy.setupInitializationRoutes();
      cy.route("GET", "**/common/userprofiles/current", []).as("getCurrentUserProfile");

      cy.visitPage("/uploader");
      cy.url().should("contain", "/account/login?redirectUrl=%2Fuploader");
    });
  });

  describe("when logged in", () => {
    beforeEach(() => {
      cy.server();
      cy.setupInitializationRoutes();
    });

    describe("when the website is in read-only mode", () => {
      beforeEach(() => {
        cy.login();
        cy.route("GET", "**/json-api/common/app-config/", "fixture:api/json/app-config-read-only.json").as("appConfig");
        cy.visitPage("/uploader");
      });

      it("should show the read-only mode alert", () => {
        cy.get("astrobin-read-only-mode").should("exist");
      });
    });

    describe("when the website is not in read-only mode", () => {
      beforeEach(() => {
        cy.login();
        cy.visitPage("/uploader");
      });

      it("should not show the read-only mode alert", () => {
        cy.get("astrobin-read-only-mode").should("not.exist");
      });

      it("should have all form controls", () => {
        cy.get("#title").should("exist");
        cy.get("#image_file").should("exist");
        cy.get("#is_wip").should("exist");
        cy.get("#skip_notifications").should("exist");
      });

      it("should have all form controls if user is Premium", () => {
        cy.login();

        cy.route(
          "GET",
          "**/common/usersubscriptions/?user=*",
          "fixture:api/common/usersubscriptions_2_premium.json"
        ).as("getUserSubscriptions");

        cy.route("GET", "**/common/users/*", "fixture:api/common/users_2.json").as("getUser");

        cy.visitPage("/uploader");

        cy.get("#title").should("exist");
        cy.get("#image_file").should("exist");
        cy.get("#is_wip").should("exist");
        cy.get("#skip_notifications").should("exist");
      });

      it("should have all form controls if user is Premium (autorenew)", () => {
        cy.login();

        cy.route(
          "GET",
          "**/common/usersubscriptions/?user=*",
          "fixture:api/common/usersubscriptions_2_premium_autorenew.json"
        ).as("getUserSubscriptions");

        cy.route("GET", "**/common/users/*", "fixture:api/common/users_2.json").as("getUser");

        cy.visitPage("/uploader");

        cy.get("#title").should("exist");
        cy.get("#image_file").should("exist");
        cy.get("#is_wip").should("exist");
        cy.get("#skip_notifications").should("exist");
      });

      it("should redirect if user is Premium 2020", () => {
        it("should check and disable the 'skip notification' checkbox if 'staging area' is selected", () => {
          cy.get("[for='is_wip']").click();
          cy.get("#skip_notifications").should("be.disabled");
          cy.get("#skip_notifications").should("be.checked");
        });

        it("should redirect if user is not Ultimate", () => {
          cy.login();

          cy.route("GET", "**/common/usersubscriptions/?user=*", "fixture:api/common/usersubscriptions_2.json").as(
            "getUserSubscriptions"
          );

          cy.route("GET", "**/common/users/*", "fixture:api/common/users_2.json").as("getUser");

          cy.visitPage("/uploader");

          cy.url().should("contain", "/permission-denied");
        });
      });
    });
  });
});
