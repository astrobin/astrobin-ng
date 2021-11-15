import { testBrand, testFilter } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create filter with brand process creation", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer/filter");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findFilters");
      });

      it("should create a brand", () => {
        cy.equipmentItemBrowserCreateBrand(
          "#equipment-item-field-brand",
          "Test brand",
          "https://www.test-brand.com/",
          testBrand
        );
      });

      it("should have prefilled the name", () => {
        cy.get("#equipment-item-field-name").should("have.value", "Test");
      });

      it("should fill the type", () => {
        cy.ngSelectOpen("#filter-field-type");
        cy.ngSelectOptionClick("#filter-field-type", 1);
        cy.ngSelectValueShouldContain("#filter-field-type", "Hydrogen-alpha (Hα)");
      });

      it("should input the 'Bandwidth'", () => {
        cy.get("#filter-field-bandwidth").type("3");
      });

      it("should input the 'Size'", () => {
        cy.get("#filter-field-size").type("31");
      });

      it("should create the item", () => {
        cy.route("POST", "**/api/v2/equipment/filter/", testFilter).as("createFilter");

        cy.get("#create-new-item .btn-primary").click();

        cy.get(".modal-title")
          .contains("Confirm item creation")
          .should("be.visible");

        cy.equipmentItemSummaryShouldHaveItem(".modal", "Test brand", "Test");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Class", "Filter");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Type", "Hydrogen-alpha (Hα)");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Bandwidth", "3 nm");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Size", "31 mm");

        cy.get(".modal-footer .btn-danger").click();

        cy.wait("@createFilter");

        cy.ngSelectValueShouldContain("#equipment-item-field", "Test brand Test");
      });
    });
  });
});
