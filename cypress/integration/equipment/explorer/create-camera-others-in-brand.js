import { testBrand, testCamera } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create camera and see that 'others in brand' works", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findCameras");
      });

      it("should see 'others in brand' info", () => {
        cy.route("get", "**/api/v2/equipment/camera/others-in-brand/*", [testCamera]);

        cy.equipmentItemBrowserSelectFirstBrand("#equipment-item-field-brand", "Test brand", testBrand);

        cy.get("astrobin-equipment-others-in-brand").should("be.visible");
        cy.get("astrobin-equipment-others-in-brand .item")
          .contains("Test")
          .should("be.visible");
      });
    });
  });
});
