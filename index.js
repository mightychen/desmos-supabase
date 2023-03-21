const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors: { origin: "*" }})
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_HOST,
  process.env.SUPABASE_ANON_KEY,
);

let update_list = []

supabase
.channel("public:desmos")
.on(
  "postgres_changes",
  { event: "*", schema: "public", table: "desmos" }, (payload) => {
    update_list.push(payload.new)
  }
)
.subscribe();


// const channel = supabase.channel('test')
//
// channel
// .on('broadcast', {event: 'cursor-pos'}, (payload) => {
//   console.log("34", "Received Message!")
//   console.log(payload)
// })
//
// channel
// .subscribe( (status) => {
//   if (status === 'SUBSCRIBED') {
//     // now you can start broadcasting cursor positions
//     setInterval(() => {
//       channel.send({
//         type: 'broadcast',
//         event: 'cursor-pos',
//         payload: { x: Math.random(), y: Math.random() },
//       })
//       console.log(status)
//     }, 100)
//   }
// })


app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("hello world");
})

server.listen(3001, () => {
  console.log("Server running..");
});

io.on("connection", async (socket) => {
  console.log("User ID connected: " + socket.id)
  // Add user to the database upon init
  const { error } = await supabase
    .from('desmos')
    .insert({
      socket_connection_id: socket.id,
      mouse_x: 0,
      mouse_y: 0,
      room_id: "TEMP",
    })

  // Grab all existing users and send them to the client to initialize points
  // TODO: add filter on room_id
  const { data, selectError } = await supabase
    .from('desmos')
    .select()

  socket.emit("point update", {
    update_list: data
  })

  // Upon receiving a message from the client, send an update to the database
  socket.on("message", async (message) => {
    // console.log(message)
    const { error } = await supabase
      .from('desmos')
      .update({
        mouse_x: message.data.x,
        mouse_y: message.data.y
      })
      .eq('socket_connection_id', message.uuid)
  })

  function process_update_list(update_list) {
    processed_list_dict = {}
    // This should be in chronological order, so we squash any messages
    // by iterative over all update messages
    update_list.map( (update_message) => {
      processed_list_dict[update_message.socket_connection_id] = update_message
    })
    return Object.values(processed_list_dict)
  }

  setInterval( () => {
    processed_udpate_list = process_update_list(update_list)
    socket.emit("point update", {
      update_list: processed_udpate_list
    })
  }, 10)
})
