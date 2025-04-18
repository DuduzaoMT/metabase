const { H } = cy;
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";

const { ORDERS, ORDERS_ID, PRODUCTS, PRODUCTS_ID } = SAMPLE_DATABASE;

const questionDetails = {
  name: "Orders join Products",
  query: {
    "source-table": ORDERS_ID,
    joins: [
      {
        fields: "all",
        "source-table": PRODUCTS_ID,
        condition: [
          "=",
          ["field-id", ORDERS.PRODUCT_ID],
          ["joined-field", "Products", ["field-id", PRODUCTS.ID]],
        ],
        alias: "Products",
      },
    ],
    limit: 5,
  },
};

const filter = {
  name: "Text",
  slug: "text",
  id: "7653fdfa",
  type: "string/=",
  sectionId: "string",
};

const dashboardDetails = {
  parameters: [filter],
};

describe("scenarios > dashboard > filters", () => {
  beforeEach(() => {
    cy.intercept("GET", `/api/dashboard/*/params/${filter.id}/values`).as(
      "filterValues",
    );

    H.restore();
    cy.signInAsAdmin();

    H.createQuestionAndDashboard({ questionDetails, dashboardDetails }).then(
      ({ body: dashboardCard }) => {
        const { card_id, dashboard_id } = dashboardCard;

        const updatedCardDetails = {
          size_x: 21,
          size_y: 10,
          parameter_mappings: [
            {
              parameter_id: filter.id,
              card_id,
              target: [
                "dimension",
                [
                  "field",
                  PRODUCTS.TITLE,
                  {
                    "join-alias": "Products",
                  },
                ],
              ],
            },
          ],
        };

        H.editDashboardCard(dashboardCard, updatedCardDetails);

        H.visitDashboard(dashboard_id);
      },
    );
  });

  it("should work properly when connected to the explicitly joined field", () => {
    H.filterWidget().click();
    cy.wait("@filterValues");

    cy.findByPlaceholderText("Search the list").type("Awe");

    selectFromDropdown(["Awesome Concrete Shoes", "Awesome Iron Hat"]);

    cy.button("Add filter").click();

    cy.location("search").should(
      "eq",
      "?text=Awesome+Concrete+Shoes&text=Awesome+Iron+Hat",
    );

    H.filterWidget().contains("2 selections");

    cy.findByTestId("dashcard").within(() => {
      cy.findAllByText("Awesome Concrete Shoes");
      cy.findAllByText("Awesome Iron Hat");
    });
  });
});

function selectFromDropdown(values) {
  values.forEach((value) => {
    cy.findByLabelText(value).should("be.visible").click();
  });
}
