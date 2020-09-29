import { CardFactory, TeamsActivityHandler } from "botbuilder";
import * as debug from "debug";
import * as AdaptiveCards from "adaptivecards";
import { DBClient } from "../TeamsAppsComponents";
import * as moment from 'moment';
const log = debug("msteams");

export class PersonalChatBot extends TeamsActivityHandler {
  history: String[] = [];

  dbClient = new DBClient();
  adaptiveCard = new AdaptiveCards.AdaptiveCard();

  isinCard = require("../cards/isin.json");

  constructor() {
    super();
    this.onMessage(async (context, next) => {
      await this.dbClient.connect();

      const regexpIsin = new RegExp('[A-Z]{2}([A-Z0-9]){9}[0-9]');
      const messageSplit: string[] = context.activity.text.split(" ");
      const isIsin = regexpIsin.test(context.activity.text);
		
			const monthSubstitutions = { 'jan' : '01', 'uary' : '', 'uar':'' };
			var dateText = context.activity.text.replace(/-/g, '/').replace(/:/g, '/').replace(/\./g, '/').replace(/ /g, '/');
			for (var i = 0; i < dateText.length; ++i) {
				for (var pattern_length = 2; pattern_length < 9 && i + pattern_length < dateText.length; ++pattern_length) { 
					if (dateText.substring(i, i + pattern_length).toLowerCase() in monthSubstitutions) {
						dateText = dateText.substring(0, i) + monthSubstitutions[dateText.substring(i, i + pattern_length).toLowerCase()] + dateText.substr(i + pattern_length);
					}
				}
			}
			dateText = dateText.replace(/[a-z]{0, 9}/gi, m => monthSubstitutions[m]);
			
			const date = this.parseDate(dateText);

      if (isIsin) {
        const isin = messageSplit.find((i) => regexpIsin.test(i));
        const textMessage = await this.getDocumentByISIN(isin);
        
        await context.sendActivity({ text: textMessage, attachments: [CardFactory.adaptiveCard(this.isinCard)] });
        this.history.push(context.activity.text);
        await next();
      } else if (date != null) {
        await context.sendActivity({ text: "Date on standard format: " + dateText });
        this.history.push(context.activity.text);
        await next()
		  } else {
				await context.sendActivity({ text: dateText });
        // await context.sendActivity({ text: "Enter a ISIN number" });
        this.history.push(context.activity.text);
        await next()
      }
    });

    // Adaptive cards event handler
    this.adaptiveCard.onExecuteAction = function(action) {
      console.log('action: ', action);
    }
  }

	parseDate(str) {
		function pad(x){return (((''+x).length==2) ? '' : '0') + x; }
		var m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
			, d = (m) ? new Date(m[3], m[2]-1, m[1]) : null
			, matchesPadded = (d&&(str==[pad(d.getDate()),pad(d.getMonth()+1),d.getFullYear()].join('/')))
			, matchesNonPadded = (d&&(str==[d.getDate(),d.getMonth()+1,d.getFullYear()].join('/')));
		return (matchesPadded || matchesNonPadded) ? d : null;
	}


  async getDocumentByISIN(_isin: string | undefined) {
    if (_isin === undefined) return "No isin found";
    
    console.log('_isin: ', _isin);
    const result = await this.dbClient.getDocumentByISIN(_isin);

    console.log(result);

    this.isinCard.body[0].text = result.Instrument;
    this.isinCard.body[1].text = "ISIN: " + result.ISIN;
    this.isinCard.body[2].text = "ACT: " + result.AccruedDayCountConvention;
    this.isinCard.body[3].text = "Term date: " + result.TermDate;

    const textMessage: string = "Here is the information about: " + result.ISIN;

    return textMessage;
  }
}
