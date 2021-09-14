context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();

    cy.route("GET", "**/api/v2/equipment/camera/?q=*", {
      count: 1,
      next: null,
      previous: null,
      results: []
    }).as("findCameras");
  });

  context("Explorer", () => {
    it("should not have the 'Add' tag", () => {
      cy.visitPage("/equipment/explorer");

      cy.get("#equipment-item-field .ng-input input").type("Test");
      cy.wait("@findCameras");

      cy.get("#equipment-item-field .ng-option").should("have.length", 1);
      cy.get("#equipment-item-field .ng-option:nth-child(1)").should("contain", "No items found");
    });
  });
});
