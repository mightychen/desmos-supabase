const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors: { origin: "*" }})
const fs = require('fs')
const https = require('https')
const { createClient } = require('@supabase/supabase-js')

const PRODUCTION = false;

let key;
let cert;
let httpsServer;

// const init_state_url = "https://saved-work.desmos.com/calc-states/production/i6ovjlu7yi"

if (PRODUCTION) {
  key = fs.readFileSync('private.key')
  cert = fs.readFileSync('certificate.crt')
  let cred = {
    key,
    cert
  }
  httpsServer = https.createServer(cred,app)
  httpsServer.listen(8443, '0.0.0.0');
}

function getNextID(current_ids) {
  new_id = 0
  for (var i = 0; i < current_ids.length; i++) {
    if (current_ids[i] - (i + 1) !== 0) {
      new_id = i + 1;
      break;
    }
  }
  if (new_id == 0) {
    new_id = current_ids.length + 1
  }
  return new_id
}

const supabase = createClient(
  process.env.SUPABASE_HOST,
  process.env.SUPABASE_ANON_KEY,
);

let update_list = []
let delete_list = []

// Clear database upon starting the server
supabase
.channel("public:desmos")
.on(
  "postgres_changes",
  { event: "*", schema: "public", table: "desmos" }, (payload) => {
    if ((payload.eventType === 'INSERT') || (payload.eventType === 'UPDATE')) {
      io
        .to(payload.new.room_id)
        .emit("point update", {
        update: payload.new
      })
    }
    else if (payload.eventType == 'DELETE') {
      // console.log(payload)
    }
  }
)
.subscribe();

clearDatabase = async () => await supabase
  .from('desmos')
  .delete()
  .gte('id', 0)
  .then( console.log("Database cleared."))

clearDatabase()

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("hello world");
})

server.listen(3001, () => {
  console.log("Server running..");
});

io.on("connection", async (socket) => {
  console.log("User ID connected: " + socket.id)

  // room id is the URL of the Desmos graph
  let room_id = socket.request._query['url']
  socket.join(room_id)

  // Grab all existing users and send them to the client to initialize points
  // Used to also determine the id of each point
  // TODO: add filter on room_id
  const { data, selectError } = await supabase
    .from('desmos')
    .select()
    .eq('room_id', room_id)


  new_id = getNextID(data.map( (row) => row.id).sort())

  // Add user to the database upon init
  const { error } = await supabase
    .from('desmos')
    .insert({
      socket_connection_id: socket.id,
      mouse_x: 0,
      mouse_y: 0,
      room_id: room_id,
      id: new_id
    })

  data.map( (update) => {
    io
      .to(room_id)
      .emit("point update", {
      update: update
    })
  })


  // Upon receiving a message from the client, send an update to the database
  socket.on("message", async (message) => {
    const { error } = await supabase
      .from('desmos')
      .update({
        mouse_x: message.data.x,
        mouse_y: message.data.y
      })
      .eq('socket_connection_id', message.uuid)
  })

  // When a user disconnects, remove them from the database
  socket.on("disconnecting", async () => {

    let rooms = Array.from(socket.rooms)
    rooms.map( (room) => {
      io
      .to(room)
      .emit("point delete", {
        socket_connection_id: socket.id
      })
    })

    const { error } = await supabase
      .from('desmos')
      .delete()
      .eq('socket_connection_id', socket.id)
  })

})
