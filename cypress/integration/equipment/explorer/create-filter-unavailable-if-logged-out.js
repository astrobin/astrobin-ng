context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    it("should not have the 'Add' tag", () => {
      cy.visitPage("/equipment/explorer/filter");
      cy.url().should("contain", "logging-in");

      // TODO: replace above with the commented part when the equipment explorer is open to non moderators.
      // cy.get("#equipment-item-field .ng-input input").type("Test");
      // cy.wait("@findFilters");
      //
      // cy.get("#equipment-item-field .ng-option").should("have.length", 1);
      // cy.get("#equipment-item-field .ng-option:nth-child(1)").should("contain", "No items found");
    });
  });
});
