require(`dotenv`).config()
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const DB = require('./database');
const { PeerProxy } = require('./peerProxy');

const authCookieName = 'token';

// The service port. In production the application is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Use the cookie parser middleware for tracking authentication tokens
app.use(cookieParser());

// Serve up the application's static content
app.use(express.static('public'));

// Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

// CreateAuth token for a new user
apiRouter.post('/auth/register', async (req, res) => {
    if (await DB.getUser(req.body.email)) {
        res.status(409).send({ msg: 'Existing user' });
    } else {
        const user = await DB.createUser(req.body.email, req.body.password, req.body.username);

        // Set the cookie
        setAuthCookie(res, user.token);

        res.send({
            id: user._id,
            email: user.email,
            username: user.username,
        });
    }
});

// GetAuth token for the provided credentials
apiRouter.post('/auth/login', async (req, res) => {
    const user = await DB.getUser(req.body.email);
    if (user) {
        if (await bcrypt.compare(req.body.password, user.password)) {
            setAuthCookie(res, user.token);
            res.send({ id: user._id, email: user.email, username: user.username });
            return;
        }
    }
    res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth token if stored in cookie
apiRouter.delete('/auth/logout', (_req, res) => {
    res.clearCookie(authCookieName);
    res.status(204).end();
});

// GetUser returns information about a user
apiRouter.get('/user/:email', async (req, res) => {
    const user = await DB.getUser(req.params.email);
    if (user) {
        const token = req?.cookies.token;
        res.send({ email: user.email, username: user.username, authenticated: token === user.token });
        return;
    }
    res.status(404).send({ msg: 'Unknown' });
});

var secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

secureApiRouter.use(async (req, res, next) => {
    authToken = req.cookies[authCookieName];
    const user = await DB.getUserByToken(authToken);
    if (user) {
        next();
    } else {
        res.status(401).send({ msg: 'Unauthorized' });
    }
});

secureApiRouter.get('/events', async (req, res) => {
    authToken = req.cookies[authCookieName];
    const user = await DB.getUserByToken(authToken);
    const events = await DB.getEvents(user.email);
    res.send(events);
});

secureApiRouter.get('/event/:id', async (req, res) => {
    const event = await DB.getEventByCode(req.params.id);
    if (event) {
        res.send(event);
        return;
    }
    res.status(404).send({ msg: 'Unknown' });
});

secureApiRouter.post('/event/:id/join', async (req, res) => {
    authToken = req.cookies[authCookieName];
    const user = await DB.getUserByToken(authToken);
    const event = await DB.getEventByCode(req.params.id);
    if (event) {
        if (event.participants.includes(user.email)) {
            res.status(409).send({ msg: 'Already joined' });
        } else {
            await DB.addParticipantToEvent(req.params.id, user.email);
            res.send(event);
        }
        return;
    }
    res.status(404).send({ msg: 'Unknown' });
});

secureApiRouter.post('/event/:id/accept', async (req, res) => {
    const event = await DB.getEventByCode(req.params.id);
    if (event) {
        let resp = await DB.acceptTime(req.params.id, req.body.time, req.body.start, req.body.end, req.body.busyTimes);
        res.send(resp);
    }
    else {
        res.status(404).send({ msg: 'Unknown' });
    }
});

// Add Event
secureApiRouter.post('/event', async (req, res) => {
    authToken = req.cookies[authCookieName];
    const user = await DB.getUserByToken(authToken);
    let event = {...req.body, participants: [user.email]}
    await DB.addEvent(event);
    const events = await DB.getEvents(user.email);
    res.send(events);
});

// Default error handler
app.use(function (err, req, res, next) {
    res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

// setAuthCookie in the HTTP response
function setAuthCookie(res, authToken) {
    res.cookie(authCookieName, authToken, {
        secure: true,
        httpOnly: true,
        sameSite: 'strict',
    });
}

const httpService = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

new PeerProxy(httpService);