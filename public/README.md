# Startup
## Notes
In this assignment, I learned how to:
- Use Git
- Use Git functionality in VS Code
- Resolve merge conflicts
- Push/Pull changes <br><br>

AWS:
- IP: http://3.15.103.8/
- `ssh -i [key pair file] ubuntu@3.15.103.8`
- URL: https://smartscheduler.link/ <br>

Simon:
- Structure HTML pages
- Link pages using hyperlinks
- Create elements like tables and SVGs
- Use a deployment script

Simon CSS:
- Use CSS selectors
- Use CSS classes
- Use CSS flex
- Use Bootstrap

Startup HTML and CSS:
- Putting together things learned previously
- Understanding flex better
- Learning Bootstrap class names

Simon JavaScript:
- Use JS to manipulate the DOM
- Use LocalStorage
- Use event listeners

Startup JavaScript:
- Apply JS principles to a page of my own design
- Use LocalStorage more
- Use JSON
- Adding and modifying elements using the DOM
- Changing element styles using JS

Simon Service:
- Use node.js
- Use express to serve webpage
- Make request calls in application
- Use express to respond to API calls

Simon DB:
- Use MongoDB in a node application
- Use a database to persist data across sessions
- Use environment variables to keep sensitive information outside of code

Simon Login:
- Implement login/register functionality using express and MongoDB
- Show different behavior based on if a user is logged in or not
- Use cookies for authentication

Simon WebSocket:
- Use WebSockets to enable peer-to-peer communication
- Broadcast messages
- Listen for messages

Simon React:
 - Convert standard HTML and JS to React
 - Use React components
 - Use a service with React

 Startup Service:
 - Convert my application to a Node.js application
 - Use WebSockets to synchronize data between users
 - Have separate WebSocket connections at the same time
 - Store users and other data in MongoDB
 - Handle Authentication
 - Define and use endpoints
 - Use 3rd party API endpoints

# Smart Scheduler
## Design
Have you ever tried to coordinate a meeting or event with several different people who all have different schedules? It is never easy. Smart Scheduler makes it easy to plan events and find a time that works for everyone. One person can create an event and can specify how long it is expected to take. Everyone involved in the meeting can open the application, import their schedule for that day from their Google calendar, and make any adjustments to the schedule. Smart Scheduler will then display the times that everyone is free. Once a time is selected, users will have the choice to add the event to their calendar. <br><br>
![Project Sketch](sketch.PNG)

### Key Features
- Secure Login over HTTPS
- Ability to import from Google Calendar
- Ability to modify available times
- Display of available/not available times
- Compare/update schedules in realtime
