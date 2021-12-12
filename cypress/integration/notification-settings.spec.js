/// <reference types="cypress" />

context("notifications", () => {
  describe("when logged out", () => {
    it("should redirect to the login page", () => {
      cy.server();
      cy.setupInitializationRoutes();
      cy.route("GET", "**/common/userprofiles/current/", []).as("getCurrentUserProfile");

      cy.visitPage("/notifications/settings");
      cy.url().should("contain", "/account/login?redirectUrl=%2Fnotifications%2Fsettings");
    });
  });

  describe("when logged in", () => {
    before(() => {
      cy.server();
      cy.setupInitializationRoutes();

      cy.route("GET", "**/notifications/type/", [
        { id: 1, label: "test_notification", display: "Test notification", description: "" },
        { id: 2, label: "new_follower", display: "You have a new follower", description: "" },
        { id: 3, label: "new_image", display: "New image from a user you follow", description: "" }
      ]).as("getNotificationTypes");
      cy.route("GET", "**/notifications/setting/", [
        { id: 1, user: 1, noticeType: 1, medium: 1, send: true },
        { id: 2, user: 1, noticeType: 1, medium: 0, send: true },
        { id: 3, user: 1, noticeType: 2, medium: 1, send: true },
        { id: 4, user: 1, noticeType: 2, medium: 0, send: false },
        { id: 5, user: 1, noticeType: 3, medium: 1, send: true },
        { id: 6, user: 1, noticeType: 3, medium: 0, send: true }
      ]).as("getNotificationSettings");

      cy.login();
      cy.visitPage("/notifications/settings");

      cy.wait("@getNotificationTypes");
      cy.wait("@getNotificationSettings");
    });

    it("should display the panels", () => {
      cy.get(".card-header button")
        .contains("Users")
        .should("exist");
      cy.get(".card-header button")
        .contains("Images")
        .should("exist");
      cy.get(".card-header button")
        .contains("Comments")
        .should("exist");
      cy.get(".card-header button")
        .contains("Forums")
        .should("exist");
      cy.get(".card-header button")
        .contains("Groups")
        .should("exist");
      cy.get(".card-header button")
        .contains("Private messages")
        .should("exist");
      cy.get(".card-header button")
        .contains("Subscriptions")
        .should("exist");
      cy.get(".card-header button")
        .contains("Image of the Day / Top Picks")
        .should("exist");
      cy.get(".card-header button")
        .contains("Other")
        .should("exist");
    });

    it("should not display the IOTD Staff panel", () => {
      cy.get(".card-header button")
        .contains("IOTD Staff")
        .should("not.exist");
    });

    it("should show the notification forms", () => {
      cy.get("label")
        .contains("You have a new follower")
        .should("exist");
      cy.get("label")
        .contains("New image from a user you follow")
        .should("exist");
    });

    it("should not show the test notification form", () => {
      cy.get("label")
        .contains("Test notification")
        .should("not.exist");
    });

    it("should show the toggles", () => {
      cy.get("#notification-2-email .ng-toggle-left").should("exist");
      cy.get("#notification-2-onsite .ng-toggle-right").should("exist");
      cy.get("#notification-3-email .ng-toggle-left").should("exist");
      cy.get("#notification-3-onsite .ng-toggle-left").should("exist");
    });
  });
});
