import axios from 'axios';
//import * as moment from 'moment';
let moment = require("moment");
if ("default" in moment) {
    moment = moment["default"];
}

export class InternalAPI {
  baseURL: string = "https://mtermsportfolioapi.azurewebsites.net";
  headers: Object = {
    "Authorization": "Basic bVRlcm1zOmxtbnNhZEFTRDNmRFNGM2Zm"
  };

  getInstruments = (): Promise<Instrument[]> => new Promise<Instrument[]>((resolve) => {
    axios({
      url: this.baseURL + "/Instruments",
      method: "GET",
      headers: this.headers
    }).then((response) => resolve(response.data));
  });

  searchInstrument = (searchString: string): Promise<Instrument[]> => new Promise<Instrument[]>((resolve) => {
    axios({
      url: this.baseURL + "/Instruments/search/" + searchString,
      method: "GET",
      headers: this.headers
    }).then((response) => resolve(response.data));
  });

  getInstrumentById = (id: string): Promise<Instrument> => new Promise<Instrument>((resolve) => {
    axios({
      url: this.baseURL + "/Instruments/" + id,
      method: "GET",
      headers: this.headers
    }).then((response) => resolve(response.data));
  });

  getLatestPriceById = (id: string): Promise<Price> => new Promise<Price>((resolve) => {
    axios({
      url: this.baseURL + "/Prices/latest/" + id,
      method: "GET",
      headers: this.headers
    }).then((response) => resolve(response.data));
  });

  getPriceByDateAndId = (isoDate: string, id: string): Promise<Price> => new Promise<Price>((resolve) => {
    const date = moment(isoDate).format('YYYY-MM-DD');
    console.log(date);
    axios({
      url: this.baseURL + "/Prices/" + date + "/" + id,
      method: "GET",
      headers: this.headers
    }).then((response) => resolve(response.data));
  });

  getPriceCurves = (): Promise<Value[]> => new Promise<Value[]>((resolve) => {
    axios({
      url: this.baseURL + "/Values/priceCurves",
      method: "GET",
      headers: this.headers
    }).then((response) => resolve(response.data));
  });

  getIssuerTypes = (): Promise<Value[]> => new Promise<Value[]>((resolve) => {
    axios({
      url: this.baseURL + "/Values/issuerTypes",
      method: "GET",
      headers: this.headers
    }).then((response) => resolve(response.data));
  });

  getActivePortfolios = (): Promise<Value[]> => new Promise<Value[]>((resolve) => {
    axios({
      url: this.baseURL + "/Values/portfolios",
      method: "GET",
      headers: this.headers
    }).then((response) => resolve(response.data));
  });
}