import {
  TeamsActivityHandler,
  TurnContext,
  MessageFactory,
  CardFactory,
  MessagingExtensionAction,
  MessagingExtensionActionResponse,
  MessagingExtensionAttachment,
  MessagingExtensionQuery,
  MessagingExtensionResponse,
  Attachment
} from 'botbuilder';

import * as Util from "util";
const TextEncoder = Util.TextEncoder;

import * as debug from "debug";
const log = debug("msteams");

export class GleifAPIBot extends TeamsActivityHandler {
  private APIURL: string = "https://api.gleif.org/api/v1";

  constructor() {
    super();
  }

  protected async handleTeamsMessagingExtensionQuery(
    context: TurnContext,
    query: MessagingExtensionQuery
  ): Promise<MessagingExtensionResponse> {
    let searchQuery = "";

    if (query &&
      query.parameters &&
      query.parameters[0].name === "searchQuery" &&
      query.parameters[0].value
    ) {
      searchQuery = query.parameters[0].value.trim().toLowerCase();
    }

    return new Promise((resolve, reject) => {
      fetch(this.APIURL + "/fuzzycompletions?field=fulltext&q=" + searchQuery, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then((results) => results.json())
      .then(async (data) => {
        const searchResultsCards = this.getCompanyResultCards(data.data);

        setTimeout(() => {
          resolve({
            composeExtension: {
              type: "result",
              attachmentLayout: "list",
              attachments: searchResultsCards
            }
          });
        }, 1000)
      })
      .catch((error) => reject("Error getting gleif companies: " + error))
    });
  }

  private getCompanyResultCards(companies: any[]): Attachment[] {
    let cards: Attachment[] = [];

    companies.forEach((company) => {
      if (company.relationships) {
        fetch(company.relationships["lei-records"].links.related, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })
        .then((result) => result.json())
        .then(({ data }) => {
          const entity: any = data.attributes.entity;
          const companyInformation: string = "<div>"
            + entity.legalName.name + "<br>"
            + entity.jurisdiction + "-" + entity.registeredAs
            + " / LEI: " + data.attributes.lei + "<br><br>"
            + entity.legalForm.other + "(" + entity.jurisdiction + ")<br><br>"
            + entity.legalAddress.addressLines[0] + "<br>"
            + entity.legalAddress.postalCode + " " + entity.legalAddress.city + "<br>"
            + entity.legalAddress.country
            + "</div>";
          cards.push(CardFactory.heroCard(company.attributes.value, companyInformation));
        })
        .catch((error) => cards.push(CardFactory.heroCard("Error getting lei-records: " + error)));
      }
    });

    return cards;
  }
}
