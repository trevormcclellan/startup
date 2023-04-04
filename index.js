const express = require('express');
const app = express();

// The service port. In production the application is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 4000;

// JSON body parsing using built-in middleware
app.use(express.json());

// Serve up the application's static content
app.use(express.static('public'));

// Router for service endpoints
var apiRouter = express.Router();
app.use(`/api`, apiRouter);

apiRouter.get('/events', (_req, res) => {
    res.send(events);
});

// SubmitScore
apiRouter.post('/event', (req, res) => {
    events = updateEvents(req.body, events);
    res.send(events);
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
    res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

let events = [];
function updateEvents(newEvent, events) {
    events.push(newEvent);
    return events;
}
