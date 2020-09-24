const { MongoClient } = require("mongodb");

export class DBClient {
  client = new MongoClient("mongodb://mterms:yFj3MhkExiIVoIJaxrdEf01aSLgy0rb8hFQVliOQ5gxD7jaonzd99uGtBLPzsxyBMDphvK7pqlmgmpGpNqtCsw%3D%3D@mterms.mongo.cosmos.azure.com:10255/?ssl=true&appName=@mterms@");
  database;
  async connect() {
    await this.client.connect();
    this.database = this.client.db("mterms");
  }

  async getDocumentByISIN(_isin: String) {
    const collection = this.database.collection("isin");

    const result = await collection.findOne({ ISIN: _isin });

    return result;
  }

  // Deprecated
  async insertMock() {
    try {
      const collection = this.database.collection("isin");

      const mock = require("./mockdata.json");

      const result = await collection.insertMany(mock);

      return result;
    } catch (error) {
      console.error("Error inserting mockdata: ", error);
    } finally {
      await this.client.close();
    }
  }
}