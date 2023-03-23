const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server, { cors: { origin: "*" }})
const { createClient } = require('@supabase/supabase-js')

// const quadrilateral = {
//     "version": 10,
//     "randomSeed": "1d934f054c2848c02cbc452cd862b903",
//     "graph": {
//         "viewport": {
//             "xmin": -10,
//             "ymin": -10,
//             "xmax": 10,
//             "ymax": 10
//         }
//     },
//     "expressions": {
//         "list": [
//             {
//                 "type": "folder",
//                 "id": "2",
//                 "title": "Polygon Between Points",
//                 "secret": true
//             },
//             {
//                 "type": "expression",
//                 "id": "3",
//                 "folderId": "2",
//                 "color": "#2d70b3",
//                 "latex": "\\operatorname{polygon}\\left(P_{1},P_{2},P_{3},P_{4}\\right)"
//             }
//         ]
//     }
// }

// const parallel_lines = {
//     "version": 10,
//     "randomSeed": "42435fa95de915b55435b61323925a6c",
//     "graph": {
//         "viewport": {
//             "xmin": -10,
//             "ymin": -10,
//             "xmax": 10,
//             "ymax": 10
//         },
//         "squareAxes": false
//     },
//     "expressions": {
//         "list": [
//             {
//                 "type": "folder",
//                 "id": "10",
//                 "title": "Connecting Lines",
//                 "collapsed": true,
//                 "secret": true
//             },
//             {
//                 "type": "expression",
//                 "id": "7",
//                 "folderId": "10",
//                 "color": "#000000",
//                 "latex": "L_{1}=P_{1},P_{2}",
//                 "points": false,
//                 "lines": true,
//                 "dragMode": "NONE"
//             },
//             {
//                 "type": "expression",
//                 "id": "8",
//                 "folderId": "10",
//                 "color": "#000000",
//                 "latex": "L_{2}=P_{3},P_{4}",
//                 "points": false,
//                 "lines": true,
//                 "dragMode": "NONE"
//             },
//             {
//                 "type": "expression",
//                 "id": "11",
//                 "folderId": "10",
//                 "color": "#000000",
//                 "latex": "n_{SlopeL1}=\\frac{P_{2}.y-P_{1}.y}{P_{2}.x-P_{1}.x}"
//             },
//             {
//                 "type": "expression",
//                 "id": "12",
//                 "folderId": "10",
//                 "color": "#c74440",
//                 "latex": "n_{SlopeL2}=\\frac{P_{4}.y-P_{3}.y}{P_{4}.x-P_{3}.x}"
//             },
//             {
//                 "type": "expression",
//                 "id": "13",
//                 "folderId": "10",
//                 "color": "#2d70b3",
//                 "latex": "n_{Error}=\\left|n_{SlopeL1}-n_{SlopeL2}\\right|"
//             },
//             {
//                 "type": "expression",
//                 "id": "15",
//                 "folderId": "10",
//                 "color": "#6042a6",
//                 "latex": "e_{rrorFunction}\\left(x\\right)=\\min\\left(m_{1}x+b_{1},255\\right)"
//             },
//             {
//                 "type": "expression",
//                 "id": "16",
//                 "folderId": "10",
//                 "color": "#000000",
//                 "latex": "\\left[0,255\\right]\\sim m_{1}\\cdot\\left[0,0.07\\right]+b_{1}",
//                 "residualVariable": "e_{1}",
//                 "regressionParameters": {
//                     "m_{1}": 3642.8571428571427,
//                     "b_{1}": 0
//                 }
//             },
//             {
//                 "type": "expression",
//                 "id": "17",
//                 "folderId": "10",
//                 "color": "#c74440",
//                 "latex": "n_{ColorAdjustment}=e_{rrorFunction}\\left(n_{Error}\\right)"
//             },
//             {
//                 "type": "expression",
//                 "id": "14",
//                 "folderId": "10",
//                 "color": "#388c46",
//                 "latex": "C_{Feedback}=\\operatorname{rgb}\\left(n_{ColorAdjustment},255-n_{ColorAdjustment},0\\right)"
//             },
//             {
//                 "type": "expression",
//                 "id": "18",
//                 "folderId": "10",
//                 "color": "#2d70b3",
//                 "latex": "\\operatorname{polygon}\\left(\\left[-20,20,20,-20\\right],\\left[-20,-20,20,20\\right]\\right)",
//                 "colorLatex": "C_{Feedback}",
//                 "fillOpacity": "0.3"
//             }
//         ]
//     }
// }

const match_parabola = {
    "version": 10,
    "randomSeed": "78b53da43c85ce4bd25903fcd9eca442",
    "graph": {
        "viewport": {
            "xmin": -25,
            "ymin": -20,
            "xmax": 25,
            "ymax": 20
        },
        "squareAxes": false
    },
    "expressions": {
        "list": [
            {
                "type": "text",
                "id": "14",
                "text": "This graph has specific id values on each point to act as a protocol for the motion capture system."
            },
            {
                "type": "folder",
                "id": "student_points",
                "title": "Student Points",
                "collapsed": true,
                "secret": true
            },
            {
                "type": "expression",
                "id": "s_list",
                "folderId": "student_points",
                "color": "#2d70b3",
                "latex": "S=\\left[P_{1},\\ P_{2}\\right]",
                "hidden": true
            },
            {
                "type": "expression",
                "id": "80",
                "folderId": "student_points",
                "color": "#000000",
                "latex": "T_{1}=S\\left[1\\right]",
                "hidden": true
            },
            {
                "type": "expression",
                "id": "81",
                "folderId": "student_points",
                "color": "#c74440",
                "latex": "T_{2}=S\\left[2\\right]",
                "hidden": true
            },
            {
                "type": "expression",
                "id": "71",
                "folderId": "student_points",
                "color": "#c74440",
                "latex": "\\left\\{\\operatorname{length}\\left(S\\right)>2:\\left(0,0\\right)\\right\\}",
                "showLabel": true,
                "label": "There are too many people! This activity only runs with 2 people.",
                "hidden": true,
                "labelSize": "3"
            },
            {
                "type": "expression",
                "id": "8",
                "folderId": "student_points",
                "color": "#388c46",
                "latex": "S_{x}=\\left[S\\left[i\\right].x\\ \\operatorname{for}\\ i=\\left[1...\\operatorname{length}\\left(S\\right)\\right]\\right]"
            },
            {
                "type": "expression",
                "id": "9",
                "folderId": "student_points",
                "color": "#6042a6",
                "latex": "S_{y}=\\left[S\\left[i\\right].y\\ \\operatorname{for}\\ i\\ =\\left[1...\\operatorname{length}\\left(S\\right)\\right]\\right]"
            },
            {
                "type": "expression",
                "id": "15",
                "folderId": "student_points",
                "color": "#000000",
                "latex": "a=\\frac{T_{2}.y-T_{1}.y}{\\left(T_{2}.x-T_{1}.x\\right)^{2}}",
                "hidden": true,
                "residualVariable": "e_{y}"
            },
            {
                "type": "expression",
                "id": "72",
                "folderId": "student_points",
                "color": "#2d70b3",
                "latex": "k=-T_{1}.x"
            },
            {
                "type": "expression",
                "id": "73",
                "folderId": "student_points",
                "color": "#388c46",
                "latex": "h=T_{1}.y"
            },
            {
                "type": "expression",
                "id": "79",
                "folderId": "student_points",
                "color": "#6042a6",
                "latex": "f\\left(x\\right)=a\\left(x+k\\right)^{2}+h",
                "hidden": true
            },
            {
                "type": "expression",
                "id": "47",
                "folderId": "student_points",
                "color": "#000000",
                "latex": "v_{regression}=\\left\\{W_{in}=0:a\\left(x+k\\right)^{2}+h\\right\\}"
            },
            {
                "type": "folder",
                "id": "27",
                "title": "Regression // Goal State",
                "collapsed": true,
                "secret": true
            },
            {
                "type": "text",
                "id": "30",
                "folderId": "27",
                "text": "Rounded Values from the parabola regression line"
            },
            {
                "type": "expression",
                "id": "74",
                "folderId": "27",
                "color": "#6042a6",
                "latex": "a_{r}=\\frac{\\operatorname{round}\\left(10a\\right)}{10}"
            },
            {
                "type": "expression",
                "id": "75",
                "folderId": "27",
                "color": "#000000",
                "latex": "k_{r}=\\frac{\\operatorname{round}\\left(10k\\right)}{10}"
            },
            {
                "type": "expression",
                "id": "76",
                "folderId": "27",
                "color": "#c74440",
                "latex": "k_{rn}=-k_{r}"
            },
            {
                "type": "expression",
                "id": "77",
                "folderId": "27",
                "color": "#2d70b3",
                "latex": "h_{r}=\\frac{\\operatorname{round}\\left(10h\\right)}{10}"
            },
            {
                "type": "expression",
                "id": "78",
                "folderId": "27",
                "color": "#388c46",
                "latex": "h_{rn}=-h_{r}"
            },
            {
                "type": "expression",
                "id": "21",
                "folderId": "27",
                "color": "#388c46",
                "latex": "g_{a}=\\left[1,-1\\right].\\operatorname{random}\\left(1,s_{eed}\\right)\\left[1\\right]"
            },
            {
                "type": "expression",
                "id": "20",
                "folderId": "27",
                "color": "#2d70b3",
                "latex": "g_{k}=\\left(\\operatorname{join}\\left(\\left[-15,\\ -14,\\ ...\\ -1\\right],\\left[1...15\\right]\\right)\\right).\\operatorname{random}\\left(1,s_{eed}\\right)\\left[1\\right]"
            },
            {
                "type": "expression",
                "id": "60",
                "folderId": "27",
                "color": "#6042a6",
                "latex": "g_{kn}=-g_{k}"
            },
            {
                "type": "expression",
                "id": "17",
                "folderId": "27",
                "color": "#6042a6",
                "latex": "g_{h}=\\left(\\operatorname{join}\\left(\\left[-10,\\ -9,\\ ...\\ -1\\right],\\left[1...10\\right]\\right)\\right).\\operatorname{random}\\left(1,s_{eed}\\right)\\left[1\\right]"
            },
            {
                "type": "expression",
                "id": "61",
                "folderId": "27",
                "color": "#000000",
                "latex": "g_{hn}=-g_{h}"
            },
            {
                "type": "text",
                "id": "33",
                "folderId": "27",
                "text": "text for the goal and state"
            },
            {
                "type": "expression",
                "id": "22",
                "folderId": "27",
                "color": "#6042a6",
                "latex": "T_{goal1}=\\left\\{g_{k}\\ge0:\\left\\{g_{h}\\ge0:\\left(-15.28,16.74\\right)\\right\\}\\right\\}",
                "showLabel": true,
                "label": "Goal: ${g_a}(x + ${g_k})² + ${g_h}",
                "hidden": true,
                "dragMode": "XY",
                "labelSize": "2.5",
                "pointOpacity": "1"
            },
            {
                "type": "expression",
                "id": "59",
                "folderId": "27",
                "color": "#6042a6",
                "latex": "T_{goal2}=\\left\\{g_{k}<0:\\left\\{g_{h}\\ge0:\\left(-15.28,16.74\\right)\\right\\}\\right\\}",
                "showLabel": true,
                "label": "Goal: ${g_a}(x - ${g_{kn}})² + ${g_h}",
                "hidden": true,
                "dragMode": "XY",
                "labelSize": "2.5",
                "pointOpacity": "1"
            },
            {
                "type": "expression",
                "id": "58",
                "folderId": "27",
                "color": "#6042a6",
                "latex": "T_{goal3}=\\left\\{g_{k}\\ge0:\\left\\{g_{h}<0:\\left(-15.28,16.74\\right)\\right\\}\\right\\}",
                "showLabel": true,
                "label": "Goal: ${g_a}(x + ${g_k})² - ${g_hn}",
                "hidden": true,
                "dragMode": "XY",
                "labelSize": "2.5",
                "pointOpacity": "1"
            },
            {
                "type": "expression",
                "id": "57",
                "folderId": "27",
                "color": "#6042a6",
                "latex": "T_{goal4}=\\left\\{g_{k}<0:\\left\\{g_{h}<0:\\left(-15.28,16.74\\right)\\right\\}\\right\\}",
                "showLabel": true,
                "label": "Goal: ${g_a}(x - ${g_{kn}})² - ${g_hn}",
                "hidden": true,
                "dragMode": "XY",
                "labelSize": "2.5",
                "pointOpacity": "1"
            },
            {
                "type": "expression",
                "id": "32",
                "folderId": "27",
                "color": "#2d70b3",
                "latex": "T_{you1}=\\left\\{k_{r}\\ge0:\\left\\{h_{r}\\ge0:\\left(-15.03,14.1\\right)\\right\\}\\right\\}",
                "showLabel": true,
                "label": "You: ${a_r}(x + ${k_r})² + ${h_r}",
                "hidden": true,
                "dragMode": "XY",
                "labelSize": "2.5"
            },
            {
                "type": "expression",
                "id": "67",
                "folderId": "27",
                "color": "#2d70b3",
                "latex": "T_{you2}=\\left\\{k_{r}<0:\\left\\{h_{r}\\ge0:\\left(-15.03,14.1\\right)\\right\\}\\right\\}",
                "showLabel": true,
                "label": "You: ${a_r}(x - ${k_{rn}})² + ${h_r}",
                "hidden": true,
                "dragMode": "XY",
                "labelSize": "2.5"
            },
            {
                "type": "expression",
                "id": "66",
                "folderId": "27",
                "color": "#2d70b3",
                "latex": "T_{you3}=\\left\\{k_{r}\\ge0:\\left\\{h_{r}<0:\\left(-15.03,14.1\\right)\\right\\}\\right\\}",
                "showLabel": true,
                "label": "You: ${a_r}(x + ${k_r})² - ${h_rn}",
                "hidden": true,
                "dragMode": "XY",
                "labelSize": "2.5"
            },
            {
                "type": "expression",
                "id": "65",
                "folderId": "27",
                "color": "#2d70b3",
                "latex": "T_{you4}=\\left\\{k_{r}<0:\\left\\{h_{r}<0:\\left(-15.03,14.1\\right)\\right\\}\\right\\}",
                "showLabel": true,
                "label": "You: ${a_r}(x - ${k_{rn}})² - ${h_rn}",
                "hidden": true,
                "dragMode": "XY",
                "labelSize": "2.5"
            },
            {
                "type": "text",
                "id": "36",
                "folderId": "27",
                "text": "To handle if the x-ints get swapped, plug in a few points to check score"
            },
            {
                "type": "expression",
                "id": "37",
                "folderId": "27",
                "color": "#000000",
                "latex": "r\\left(x\\right)=a_{r}\\left(x+k_{r}\\right)^{2}+h_{r}",
                "hidden": true
            },
            {
                "type": "expression",
                "id": "39",
                "folderId": "27",
                "color": "#2d70b3",
                "latex": "g\\left(x\\right)=g_{a}\\left(x+g_{k}\\right)^{2}+g_{h}",
                "hidden": true
            },
            {
                "type": "expression",
                "id": "41",
                "folderId": "27",
                "color": "#6042a6",
                "latex": "t_{estpoints}=\\left[g_{k},\\ g_{k}-1,\\ g_{k}+1,\\ g_{k}-3,\\ g_{k}+3\\right]"
            },
            {
                "type": "expression",
                "id": "38",
                "folderId": "27",
                "color": "#c74440",
                "latex": "R_{esid}=\\sqrt{\\left(r\\left(t_{estpoints}\\right)-g\\left(t_{estpoints}\\right)\\right)^{2}}"
            },
            {
                "type": "expression",
                "id": "40",
                "folderId": "27",
                "color": "#388c46",
                "latex": "E_{rror}=\\sum_{n=1}^{\\operatorname{length}\\left(R_{esid}\\right)}R_{esid}\\left[n\\right]"
            },
            {
                "type": "expression",
                "id": "42",
                "folderId": "27",
                "color": "#000000",
                "latex": "T_{olerance}=30"
            },
            {
                "type": "expression",
                "id": "43",
                "folderId": "27",
                "color": "#c74440",
                "latex": "W_{in}=\\left\\{E_{rror}\\le T_{olerance}:1,0\\right\\}"
            },
            {
                "type": "expression",
                "id": "54",
                "folderId": "27",
                "color": "#c74440",
                "latex": "W_{in}"
            },
            {
                "type": "expression",
                "id": "44",
                "folderId": "27",
                "color": "#388c46",
                "latex": "T_{almost}=\\left\\{W_{in}=1:\\left\\{-25\\le x_{anim}<25:\\left(T_{1}.x,10\\right)\\right\\}\\right\\}",
                "showLabel": true,
                "label": "Hold it.....",
                "hidden": true,
                "dragMode": "XY",
                "labelSize": "3"
            },
            {
                "type": "expression",
                "id": "49",
                "folderId": "27",
                "color": "#388c46",
                "latex": "T_{success}=\\left\\{W_{in}=1:\\left\\{x_{anim}=25:\\left(T_{1}.x,10\\right)\\right\\}\\right\\}",
                "showLabel": true,
                "label": "⭐ NICE! ⭐",
                "hidden": true,
                "labelSize": "3",
                "clickableInfo": {
                    "enabled": true,
                    "latex": "n_{ext}"
                }
            },
            {
                "type": "expression",
                "id": "45",
                "folderId": "27",
                "color": "#388c46",
                "latex": "g_{anim}=\\left\\{W_{in}=1:g\\left(x\\right)\\right\\}\\left\\{-25<x<x_{anim}\\right\\}"
            },
            {
                "type": "expression",
                "id": "46",
                "folderId": "27",
                "color": "#6042a6",
                "latex": "x_{anim}=-25",
                "slider": {
                    "hardMin": true,
                    "min": "-25"
                }
            },
            {
                "type": "expression",
                "id": "53",
                "folderId": "27",
                "color": "#000000",
                "latex": "h_{old}=\\left\\{W_{in}=1:x_{anim}\\to\\min\\left(x_{anim}+0.2,\\ 25\\right),\\ x_{anim}\\to\\max\\left(x_{anim}-0.1,\\ -25\\right)\\right\\}"
            },
            {
                "type": "folder",
                "id": "51",
                "title": "Actions to Reset & Play Next",
                "collapsed": true,
                "secret": true
            },
            {
                "type": "expression",
                "id": "52",
                "folderId": "51",
                "color": "#6042a6",
                "latex": "n_{ext}=s_{eed}\\to s_{eed}+0.01,\\ x_{anim}\\to-25"
            },
            {
                "type": "expression",
                "id": "18",
                "folderId": "51",
                "color": "#000000",
                "latex": "s_{eed}=10.19",
                "hidden": true,
                "slider": {
                    "max": "10.07"
                }
            }
        ],
        "ticker": {
            "handlerLatex": "h_{old}",
            "minStepLatex": "10",
            "playing": true,
            "open": true
        }
    }
}

const initalState = match_parabola

function getNextID(current_ids) {
  console.log(current_ids)
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
      payload.new['time'] = new Date()
      update_list.push(payload.new);
    }
    else if (payload.eventType == 'DELETE') {
      payload.old['time'] = new Date()
      delete_list.push(payload.old)
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

  // Grab all existing users and send them to the client to initialize points
  // Used to also determine the id of each point
  // TODO: add filter on room_id
  const { data, selectError } = await supabase
    .from('desmos')
    .select()


  new_id = getNextID(data.map( (row) => row.id).sort())

  // Add user to the database upon init
  const { error } = await supabase
    .from('desmos')
    .insert({
      socket_connection_id: socket.id,
      mouse_x: 0,
      mouse_y: 0,
      room_id: "TEMP",
      id: new_id
    })

  socket.emit("init", {
    init_state: initalState
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
    if (update_list.length > 0) {
      socket.emit("point update", {
        update_list: update_list
      })
    }

    if (delete_list.length > 0) {
      // console.log(processed_delete_list)
      socket.emit("point delete", {
        delete_list: delete_list
      })
    }

  }, 100)
})
