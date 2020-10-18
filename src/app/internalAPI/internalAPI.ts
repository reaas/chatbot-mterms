import axios from 'axios';
import moment = require('moment');

export class InternalAPI {
  baseURL: string = "https://mtermsportfolioapi.azurewebsites.net";
  headers: Object = {
    "Authorization": "Basic bVRlcm1zOmxtbnNhZEFTRDNmRFNGM2Zm"
  };

  async getInstruments(): Promise<Instrument[]> {
    const response = await axios({
      url: this.baseURL + "/Instruments",
      method: "GET",
      headers: this.headers
    });

    return response.data;
  }

  async searchInstrument(searchString: string): Promise<Instrument[]> {
    const response = await axios({
      url: this.baseURL + "/Instruments/search/" + searchString,
      method: "GET",
      headers: this.headers
    });

    return response.data;
  }

  async getInstumentById(id: string): Promise<Instrument> {
    const response = await axios({
      url: this.baseURL + "/Instruments/" + id,
      method: "GET",
      headers: this.headers
    });

    return response.data;
  }

  async getLatestPriceById(id: string): Promise<Price> {
    const response = await axios({
      url: this.baseURL + "/Prices/latest/" + id,
      method: "GET",
      headers: this.headers
    });

    return response.data;
  }

  async getPriceByDateAndId(isoDate: string, id: string): Promise<Price> {
    const response = await axios({
      url: this.baseURL + "/Prices/" + moment(isoDate).format('yyyy-mm-dd') + "/" + id,
      method: "GET",
      headers: this.headers
    });

    return response.data;
  }

  async getPriceCurves(): Promise<Value[]> {
    const response = await axios({
      url: this.baseURL + "/Values/priceCurves",
      method: "GET",
      headers: this.headers
    });

    return response.data;
  }

  async getIssuerTypes(): Promise<Value[]> {
    const response = await axios({
      url: this.baseURL + "/Values/issuerTypes",
      method: "GET",
      headers: this.headers
    });

    return response.data;
  }

  async getActivePortfolios(): Promise<Value[]> {
    const response = await axios({
      url: this.baseURL + "/Values/portfolios",
      method: "GET",
      headers: this.headers
    });

    return response.data;
  }
}