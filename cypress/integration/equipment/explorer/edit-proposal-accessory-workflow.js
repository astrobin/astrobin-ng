import {
  testBrand,
  testAccessory,
  testAccessoryEditProposal
} from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();

    cy.route("get", "**/api/v2/equipment/accessory-edit-proposal/?edit_proposal_target=*", { results: [] });
  });

  context("Explorer", () => {
    it("should not have the 'Propose edit' button if logged out", () => {
      cy.visitPage("/equipment/explorer/accessory");
      cy.url().should("contain", "logging-in");

      // TODO: replace above with the commented part when the equipment explorer is open to non moderators.
      // cy.equipmentItemBrowserSelectFirstAccessory("#equipment-item-field", "Test", testAccessory);
      //
      // cy.get(".card .card-header")
      //   .contains("Accessory")
      //   .should("be.visible");
      //
      // cy.get(".card .card-body astrobin-equipment-item-summary").should("be.visible");
      //
      // cy.get("[data-test=propose-edit]").should("not.exist");
    });

    it("should have the 'Propose edit' button if logged in", () => {
      cy.login();
      cy.visitPage("/equipment/explorer/accessory");

      cy.equipmentItemBrowserSelectFirstAccessory("#equipment-item-field", "Test", testAccessory);

      cy.get(".card .card-header")
        .contains("Accessory")
        .should("be.visible");

      cy.get(".card .card-body astrobin-equipment-item-summary").should("be.visible");

      cy.get("[data-test=propose-edit]").should("be.visible");
    });

    it("should show all the prefilled data in the form", () => {
      cy.get("[data-test=propose-edit]").click();
      cy.get("astrobin-accessory-editor").should("be.visible");
      cy.ngSelectValueShouldContain("#equipment-item-field-brand", testBrand.name);
      cy.get("#equipment-item-field-name").should("have.value", testAccessory.name);
    });

    it("should the comment field", () => {
      cy.get("#equipment-item-field-edit-proposal-comment").should("be.visible");
    });

    it("should show warning if name is changed", () => {
      cy.route("get", "**/api/v2/equipment/accessory/?name=*", {
        count: 0,
        next: null,
        previous: null,
        results: []
      }).as("findAccessoriesByName");

      cy.get("#equipment-item-field-name")
        .clear()
        .type("Foo");

      cy.wait("@findAccessoriesByName");

      cy.get(".alert-warning span")
        .contains("Change the name only to fix a typo")
        .should("be.visible");
    });

    it("should submit the form", () => {
      cy.route("post", "**/api/v2/equipment/accessory-edit-proposal/", testAccessoryEditProposal).as(
        "saveEditProposal"
      );
      cy.route("get", "**/api/v2/equipment/accessory-edit-proposal/?edit_proposal_target=*", {
        results: [testAccessoryEditProposal]
      }).as("getEditProposals");

      cy.get("[data-test=propose-edit-confirm]").click();

      cy.wait("@saveEditProposal");
      cy.wait("@getEditProposals");

      cy.get(".toast-message")
        .contains("Your edit proposal has been submitted")
        .should("be.visible");

      cy.get("astrobin-accessory-editor").should("not.be.visible");
    });

    it("should show the new edit proposal on the page", () => {
      cy.get("astrobin-item-edit-proposal").should("be.visible");
      cy.get("astrobin-item-edit-proposal .edit-proposal astrobin-username .username").should(
        "contain",
        "AstroBin Dev"
      );
      cy.get("astrobin-item-edit-proposal").click();
      cy.get("astrobin-item-edit-proposal .change .property-name")
        .contains("Name:")
        .should("be.visible");
      cy.get("astrobin-item-edit-proposal .change .before")
        .contains("Test accessory")
        .should("be.visible");
      cy.get("astrobin-item-edit-proposal .change .after")
        .contains("Test accessory Pro")
        .should("be.visible");
    });

    it("should have disabled buttons because the proposer cannot review", () => {
      cy.get("astrobin-item-edit-proposal .btn")
        .contains("Reject edit…")
        .should("be.visible")
        .should("be.disabled");
      cy.get("astrobin-item-edit-proposal .btn")
        .contains("Approve edit…")
        .should("be.visible")
        .should("be.disabled");
      cy.get("astrobin-item-edit-proposal .alert")
        .contains("You cannot review this edit proposal because you were the one who proposed it.")
        .should("be.visible");
    });
  });
});
