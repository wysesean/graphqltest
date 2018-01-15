import { MongoClient } from 'mongodb';

export class MongoDb {
  constructor(_database){
    this._database = _database
  }
  getCollection(name) {
    let collection;

    if (!this._database) {
      throw new Error('MongoDB database is not connected');
    }

    collection = this._database.collection(name);
    if (!collection) {
      throw new Error(`MongoDB collection ${name} does not exist`);
    }
    
    return collection;
  }

  connect(location) {
    return MongoClient.connect(location).then(client => {
      this._database = client.db('test')
    })
  }

}

export const mongoDb = new MongoDb();
