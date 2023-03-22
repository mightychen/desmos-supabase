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
let delete_list = []

supabase
.channel("public:desmos")
.on(
  "postgres_changes",
  { event: "*", schema: "public", table: "desmos" }, (payload) => {
    if ((payload.eventType === 'INSERT') || (payload.eventType === 'UPDATE')) {
      payload.new['time'] = new Date()
      update_list.push(payload.new);
    }
    // else if (payload.eventType == 'DELETE') {
    //   // console.log(payload)
    //   // delete_list.push(payload)
    // }
  }
)
.subscribe();

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.send("hello world");
})

server.listen(3001, () => {
  console.log("Server running..");
});

io.on("connection", async (socket) => {
  console.log("User ID connected: " + socket.id)

  // Grab all existing users and send them to the client to initialize points
  // Used to also determine the id of each point
  // TODO: add filter on room_id
  const { data, selectError } = await supabase
    .from('desmos')
    .select()


  // Add user to the database upon init
  const { error } = await supabase
    .from('desmos')
    .insert({
      socket_connection_id: socket.id,
      mouse_x: 0,
      mouse_y: 0,
      room_id: "TEMP",
      id: data.length + 1
    })


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

  // When a user disconnects, remove them from the database
  socket.on("disconnect", async () => {
    // Get point ID before deleting
    const { data, selectError } = await supabase
      .from('desmos')
      .select()
      .eq('socket_connection_id', socket.id)

    if (data.length > 0) {
      data[0]['time'] = new Date()
      delete_list.push(data[0])
    }

    const { error } = await supabase
      .from('desmos')
      .delete()
      .eq('socket_connection_id', socket.id)
  })

  function process_update_list(update_list) {
    processed_list_dict = {}
    // This should be in chronological order, so we squash any messages
    // by iterative over all update messages
    update_list.map( (update_message) => {
      processed_list_dict[update_message.socket_connection_id] = update_message
    })

    // Filter out old messages
    processed_update_list = Object.values(processed_list_dict)

    current_time = new Date().getTime()
    final_update_list = processed_update_list.filter( (row) => {
      return current_time < row.time.getTime() + 1000
    })

    return final_update_list
  }

  function process_delete_list(delete_list) {
    current_time = new Date().getTime()

    updated_delete_list = delete_list.filter( (row) => {
      return current_time < row.time.getTime() + 1000
    })
    return updated_delete_list
  }

  setInterval( () => {
    // console.log(delete_list)

    update_list = process_update_list(update_list)
    delete_list = process_delete_list(delete_list)

    socket.emit("point update", {
      update_list: update_list
    })

    if (delete_list.length > 0) {
      // console.log(processed_delete_list)
      socket.emit("point delete", {
        delete_list: delete_list
      })
    }

  }, 100)
})
