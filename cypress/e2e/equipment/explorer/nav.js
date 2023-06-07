import { testCamera } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();

    cy.route("get", "**/api/v2/equipment/camera/?page=*", {
      count: 1,
      next: null,
      previous: null,
      results: [testCamera]
    }).as("getCameras");
  });

  context("Explorer", () => {
    context("Nav", () => {
      it("should have the equipment types", () => {
        cy.login();
        cy.visitPage("/equipment/explorer");

        ["Cameras", "Telescopes & lenses", "Mounts", "Filters", "Accessories", "Software"].forEach(label => {
          cy.get(".nav-link")
            .contains(label)
            .should("exist");
        });
      });
    });
  });
});
