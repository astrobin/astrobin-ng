/// <reference types="cypress" />

context("logging-out-page", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.login();
    cy.visitPage("/notifications");
  });

  it("should redirect to the logged out page", () => {
    cy.get(".user-dropdown-toggle").click();
    cy.get(".user-sidebar .nav-link")
      .contains("Logout")
      .click();
    cy.url().should("equal", "http://localhost:4400/account/logging-out");
  });
});
