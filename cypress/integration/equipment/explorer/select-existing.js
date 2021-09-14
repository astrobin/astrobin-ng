context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
  });

  context("Explorer", () => {
    context("Select existing", () => {
      it("should select existing item", () => {
        cy.visitPage("/equipment/explorer");

        cy.route("GET", "**/api/v2/equipment/camera/?q=*", {
          count: 1,
          next: null,
          previous: null,
          results: [
            {
              id: 1,
              deleted: null,
              reviewedTimestamp: null,
              reviewerDecision: null,
              reviewerRejectionReason: null,
              reviewerComment: null,
              created: "2021-09-12T08:09:58.508643",
              updated: "2021-09-12T08:09:58.508679",
              name: "Test Camera",
              image: null,
              type: "DEDICATED_DEEP_SKY",
              cooled: true,
              maxCooling: null,
              backFocus: null,
              createdBy: 2,
              reviewedBy: null,
              brand: 1,
              sensor: null
            }
          ]
        }).as("findCameras");

        cy.route("GET", "**/api/v2/equipment/brand/1/", {
          id: 1,
          deleted: null,
          created: "2021-09-12T08:09:23.625390",
          updated: "2021-09-12T08:09:23.625437",
          name: "My Brand",
          website: "https://www.my-brand.com",
          logo: null,
          createdBy: 1
        }).as("getBrand");

        cy.get("#equipment-item-field .ng-input input").type("Test");
        cy.wait("@findCameras");
        cy.wait("@getBrand");

        cy.get("#equipment-item-field .ng-option").should("have.length", 2);
        cy.get("#equipment-item-field .ng-option:nth-child(1) astrobin-equipment-item-summary .label strong").should(
          "contain",
          "My Brand"
        );
        cy.get("#equipment-item-field .ng-option:nth-child(1) astrobin-equipment-item-summary .label").should(
          "contain",
          "Test Camera"
        );
        cy.get("#equipment-item-field .ng-option:nth-child(2) span span").should("contain", "Create new");
        cy.get("#equipment-item-field .ng-option:nth-child(2) span").should("contain", `"Test"`);
      });
    });
  });
});
