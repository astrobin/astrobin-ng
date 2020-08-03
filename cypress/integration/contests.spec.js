/// <reference types="cypress" />

context("contests", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.visitPage("/contests");
  });

  it("should render all tables", () => {
    cy.get("#running-contests").should("exist");
    cy.get("#running-contests td")
      .contains("Test contest")
      .should("exist");
    cy.get("#running-contests td")
      .contains("Test contest 2")
      .should("exist");
    cy.get("#running-contests td")
      .contains("AstroBin Dev")
      .should("exist");

    cy.get("#open-contests").should("exist");
    cy.get("#open-contests td")
      .contains("Test contest")
      .should("exist");
    cy.get("#open-contests td")
      .contains("Test contest 2")
      .should("exist");
    cy.get("#open-contests td")
      .contains("AstroBin Dev")
      .should("exist");

    cy.get("#closed-contests").should("exist");
    cy.get("#closed-contests td")
      .contains("Test contest")
      .should("exist");
    cy.get("#closed-contests td")
      .contains("Test contest 2")
      .should("exist");
    cy.get("#closed-contests td")
      .contains("AstroBin Dev")
      .should("exist");
    open;
  });
});
