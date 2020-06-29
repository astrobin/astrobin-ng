/// <reference types="cypress" />

context("upload-metadata", () => {
  describe("when logged out", () => {
    it("should redirect to the login page", () => {
      cy.server();
      cy.setupInitializationRoutes();
      cy.route("GET", "**/common/userprofiles/current", []).as("getCurrentUserProfile");

      cy.visitPage("/upload-metadata");
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
        cy.visitPage("/upload-metadata");
      });

      it("should show the read-only mode alert", () => {
        cy.get("astrobin-read-only-mode").should("exist");
      });
    });
  });
});
