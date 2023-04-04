const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const uuid = require('uuid');

const userName = process.env.MONGOUSER;
const password = process.env.MONGOPASSWORD;
const hostname = process.env.MONGOHOSTNAME;

if (!userName) {
    throw Error('Database not configured. Set environment variables');
}

const url = `mongodb+srv://${userName}:${password}@${hostname}`;

const client = new MongoClient(url);
const userCollection = client.db('startup').collection('user');
const eventCollection = client.db('startup').collection('event');

function getUser(email) {
    return userCollection.findOne({ email: email });
}

function getUserByToken(token) {
    return userCollection.findOne({ token: token });
}

async function createUser(email, password, username) {
    // Hash the password before we insert it into the database
    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
        email: email,
        password: passwordHash,
        username: username,
        token: uuid.v4(),
    };
    await userCollection.insertOne(user);

    return user;
}

function addEvent(event) {
    eventCollection.insertOne(event);
}

function getEventByCode(code) {
    const query = { code: code };
    const event = eventCollection.findOne(query);
    return event;
}

function getEvents(username) {
    const query = { participants: username };
    const cursor = eventCollection.find(query);
    return cursor.toArray();
}

module.exports = { 
    getUser,
    getUserByToken,
    createUser, 
    addEvent, 
    getEventByCode,
    getEvents,
};
