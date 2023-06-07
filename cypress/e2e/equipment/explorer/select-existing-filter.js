import { testBrand, testFilter } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();

    cy.route("get", "**/api/v2/equipment/filter-edit-proposal/?edit_proposal_target=*", { results: [] });
  });

  context("Explorer", () => {
    context("Select existing", () => {
      it("should select existing item", () => {
        cy.login();
        cy.visitPage("/equipment/explorer/filter");

        cy.route("get", "**/api/v2/equipment/filter/?*q=*", {
          count: 1,
          next: null,
          previous: null,
          results: [testFilter]
        }).as("findFilters");

        cy.route("get", "**/api/v2/equipment/brand/1/", testBrand).as("getBrand");

        cy.get("#equipment-item-field  + .toggle-enable-fullscreen").scrollIntoView().click();
        cy.ngSelectType("#equipment-item-field", "Test");
        cy.wait("@findFilters");

        cy.ngSelectShouldHaveOptionsCount("#equipment-item-field", 1);
        cy.ngSelectOptionNumberSelectorShouldContain(
          "#equipment-item-field",
          1,
          "astrobin-equipment-item-display-name .brand",
          "Test Brand"
        );
        cy.ngSelectOptionNumberSelectorShouldContain(
          "#equipment-item-field",
          1,
          "astrobin-equipment-item-display-name .name",
          "Test"
        );

        cy.ngSelectOptionClick("#equipment-item-field", 1);
        cy.equipmentItemBrowserShouldContain("#equipment-item-field", "Test Brand", "Test filter");
      });

      it("should update the URL with ID and slug", () => {
        cy.url().should("include", `/equipment/explorer/filter/${testFilter.id}/test-brand-test`);
      });

      it("should show the item", () => {
        cy.get(".card astrobin-equipment-item-summary .label .brand").contains("Test Brand").should("be.visible");
        cy.get(".card astrobin-equipment-item-summary .label .name").contains("Test").should("be.visible");
      });
    });
  });
});
