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
          "Test Brand",
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
        cy.ngSelectOpen("#filter-field-size");
        cy.ngSelectOptionClick("#filter-field-size", 1);
        cy.ngSelectValueShouldContain("#filter-field-size", 'Round 1.25"');
      });

      it("should have generated the name", () => {
        cy.get("#equipment-item-field-name").should("have.value", `H-alpha 3nm 1.25"`);
      });

      it("should override the name", () => {
        cy.get("#filter-field-override-name + label").click();
        cy.get("#equipment-item-field-name").clear().type("Test filter");
        cy.get("#equipment-item-field-website").click();
      });

      it("should have the filter name info messages", () => {
        cy.get(".alert-info").contains("contain the bandwidth").should("be.visible");
      });

      it("should create the item", () => {
        cy.route("post", "**/api/v2/equipment/filter/", testFilter).as("createFilter");

        cy.get("#create-new-item .btn-primary").click();

        cy.get(".modal-title").contains("Confirm item creation").should("be.visible");

        cy.equipmentItemSummaryShouldHaveItem(".modal", "Test Brand", "Test");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Class", "Filter");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Type", "Hydrogen-alpha (Hα)");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Bandwidth", "3 nm");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Size", 'Round 1.25"');

        cy.get("[for=confirm-no-typos]").click();
        cy.get("[for=confirm-no-duplication]").click();
        cy.get("[for=confirm-naming-convention]").click();
        cy.get("[for=confirm-unambiguous]").click();
        cy.get("[for=confirm-english]").click();
        cy.get("[for=confirm-no-personal-information]").click();
        cy.get(".modal-footer .btn").contains("Confirm").click();

        cy.wait("@createFilter");

        cy.equipmentItemBrowserShouldContain("#equipment-item-field", "Test Brand", "Test filter");
      });
    });
  });
});
