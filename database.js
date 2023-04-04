const { MongoClient } = require('mongodb');

const userName = process.env.MONGOUSER;
const password = process.env.MONGOPASSWORD;
const hostname = process.env.MONGOHOSTNAME;

if (!userName) {
    throw Error('Database not configured. Set environment variables');
}

const url = `mongodb+srv://${userName}:${password}@${hostname}`;

const client = new MongoClient(url);
const eventCollection = client.db('startup').collection('event');

function addEvent(score) {
    eventCollection.insertOne(score);
}

function getEvents() {
    //   const query = { participants: username };
    const query = {};
    const cursor = eventCollection.find(query);
    return cursor.toArray();
}

module.exports = { addEvent, getEvents };
