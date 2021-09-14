context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
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
