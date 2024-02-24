import { testBrand, testTelescope } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create telescope with brand process creation", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer/telescope");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findTelescopes");
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

      it("should not allow the word OAG", () => {
        cy.get("#equipment-item-field-name").clear().type("My OAG foo");
        cy.get("formly-validation-message")
          .contains("Off-axis guiders are found among Accessories. Please find your item in that category, thanks!")
          .should("be.visible");
        cy.get("#equipment-item-field-name").clear().type("Test");
      });

      it("should not allow the word Hyperstar", () => {
        cy.get("#equipment-item-field-name").clear().type("C11 hyperstar");
        cy.get("formly-validation-message")
          .contains(
            "The Starizona Hyperstar models are found among Accessories. Please find your item in that category, thanks!"
          )
          .should("be.visible");
        cy.get("#equipment-item-field-name").clear().type("Test");
      });

      it("should not allow the word teleconverter", () => {
        cy.get("#equipment-item-field-name").clear().type("Teleconverter");
        cy.get("formly-validation-message")
          .contains("Teleconverters are found among Accessories. Please find your item in that category, thanks!")
          .should("be.visible");
        cy.get("#equipment-item-field-name").clear().type("Test");
      });

      it("should not allow the word reducer", () => {
        cy.get("#equipment-item-field-name").clear().type("0.75x Reducer");
        cy.get("formly-validation-message")
          .contains(
            "Focal reducers/modifiers/correctors/field flatteners are found among Accessories."
          )
          .should("be.visible");
        cy.get("#equipment-item-field-name").clear().type("Test");
      });

      it("should not allow the word barlow", () => {
        cy.get("#equipment-item-field-name").clear().type("2x barlow lens");
        cy.get("formly-validation-message")
          .contains(
            "Focal reducers/modifiers/correctors/field flatteners are found among Accessories."
          ).should("be.visible");
        cy.get("#equipment-item-field-name").clear().type("Test");
      });

      it("should not allow the word skywatcher", () => {
        cy.get("#equipment-item-field-name").clear().type("Skywatcher");
        cy.get("formly-validation-message").contains("Sky-Watcher is spelled with a dash sign.").should("be.visible");
        cy.get("#equipment-item-field-name").clear().type("Test");
      });

      it("should fill the type", () => {
        cy.ngSelectOpen("#telescope-field-type");
        cy.ngSelectOptionClick("#telescope-field-type", 1);
        cy.ngSelectValueShouldContain("#telescope-field-type", "Refractor: achromatic");
      });

      it("should hide the 'Aperture' and show naming convention info if type is 'Camera lens'", () => {
        cy.ngSelectOpen("#telescope-field-type");
        cy.ngSelectOptionClick("#telescope-field-type", 29);

        cy.wait(1000);

        cy.get("#telescope-field-aperture").should("not.be.visible");
        cy.get(".info-feedback span")
          .contains("The recommended naming convention for camera lenses is")
          .should("be.visible");

        cy.ngSelectOpen("#telescope-field-type");
        cy.ngSelectOptionClick("#telescope-field-type", 1);

        cy.get("#telescope-field-aperture").should("be.visible");
      });

      it("should input the 'Aperture'", () => {
        cy.get("#telescope-field-aperture").type("80");
      });

      it("should show 'Min/Max focal length' only if 'Fixed focal length' is unchecked", () => {
        cy.get("#telescope-field-min-focal-length").should("not.be.visible");
        cy.get("#telescope-field-max-focal-length").should("not.be.visible");
        cy.get("label[for=telescope-field-fixed-focal-length]").click();
        cy.get("#telescope-field-min-focal-length").should("be.visible");
        cy.get("#telescope-field-max-focal-length").should("be.visible");
        cy.get("#telescope-field-min-focal-length").type("800");
        cy.get("#telescope-field-max-focal-length").type("1600");
      });

      it("should create the item", () => {
        cy.route("post", "**/api/v2/equipment/telescope/", testTelescope).as("createTelescope");

        cy.get("#create-new-item .btn-primary").click();

        cy.get(".modal-title").contains("Confirm item creation").should("be.visible");

        cy.equipmentItemSummaryShouldHaveItem(".modal", "Test Brand", "Test");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Class", "Telescope");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Type", "Refractor: achromatic");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Diameter", "80 mm");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Focal length", "800 - 1600 mm");

        cy.get("[for=confirm-no-typos]").click();
        cy.get("[for=confirm-no-duplication]").click();
        cy.get("[for=confirm-naming-convention]").click();
        cy.get("[for=confirm-unambiguous]").click();
        cy.get("[for=confirm-english]").click();
        cy.get("[for=confirm-no-personal-information]").click();
        cy.get(".modal-footer .btn").contains("Confirm").click();

        cy.wait("@createTelescope");

        cy.equipmentItemBrowserShouldContain("#equipment-item-field", "Test Brand", "Test telescope");
      });
    });
  });
});
