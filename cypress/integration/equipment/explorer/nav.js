import { testCamera } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();

    cy.route("GET", "**/api/v2/equipment/camera/", {
      count: 1,
      next: null,
      previous: null,
      results: [testCamera]
    }).as("getCameras");
  });

  context("Explorer", () => {
    context("Nav", () => {
      it("should have the equipment types", () => {
        cy.visitPage("/equipment/explorer");

        ["Cameras", "Telescopes", "Mounts", "Filters", "Accessories", "Software"].forEach(label => {
          cy.get(".nav-link")
            .contains(label)
            .should("exist");
        });
      });
    });
  });
});
