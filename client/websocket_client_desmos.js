var my_uuid = ""
var initialized = false

let url = new URLSearchParams(window.location.search).get('url')

let initialState;
let initialStateURL = "https://saved-work.desmos.com/calc-states/production/" + url

if (url !== null) {
  initialStateCall = async () => await fetch(initialStateURL)
    .then( (response) => response.json())
    .then( (responseJson) => {
      initialState = responseJson
      Calc.setState(initialState)
    })
  initialStateCall()
}

const socket = io('https://ec2-52-14-66-122.us-east-2.compute.amazonaws.com')
socket.on('connect', () => {
  my_uuid = socket.id
  // Clean up any Variables
  for (var i = 0; i < 10; i++) {
    Calc.removeExpression({id: `P_{${i}}`});
  }
  // Update Button State to indicate connected
  document.getElementById("status-icon").className = "bi bi-record-fill"
  document.getElementById("status-icon").style.color = "red"
  var buttonStart = document.getElementById("connect-web-socket-button")
  buttonStart.style.display = "none"
  var buttonStop = document.getElementById("stop-websocket")
  buttonStop.style.display = "inline"

})

socket.on("init", (message) => {
  // console.log(message)
  // init_state = message.init_state
  // Calc.setState(init_state)

  // Create a draggable point for myself
  Calc.setExpression({
    "id": 'my-point',
    "latex": 'P_{Me}=(0,0)',
    "dragMode": Desmos.DragModes.XY,
  })

  console.log("Connected!")

  // Listen for changes in the P_Me point. When there is, send updated value
  // to socket
  var list_helper = Calc.HelperExpression({
    "latex": "\\left[P_{Me}.x,P_{Me}.y\\right]"
  })
  // When there is a change in the value, send the updates to the server
  list_helper.observe('listValue', function() {
    if (typeof list_helper.listValue !== 'undefined') {
      var my_point_pose_x = list_helper.listValue[0]
      var my_point_pose_y = list_helper.listValue[1]

      var message = {
        "uuid": my_uuid,
        "data": {
          "x": my_point_pose_x,
          "y": my_point_pose_y
        }
      }
      socket.emit("message", message)
    }
  })
})

socket.on("point update", (message) => {
  update_list = message.update_list

  update_list.map( (user) => {
    if (my_uuid !== user.socket_connection_id) {
      Calc.setExpression( {
        "id": user.socket_connection_id,
        "latex": `P_{${user.id}}=(${user.mouse_x}, ${user.mouse_y})`,
        "dragMode": Desmos.DragModes.NONE,
        "color": Desmos.Colors.BLACK,
      })
    } else {
      Calc.setExpression( {
        "id": user.socket_connection_id,
        "latex": `P_{${user.id}}=P_{Me}`,
        "dragMode": Desmos.DragModes.NONE,
        "color": Desmos.Colors.BLACK,
        "hidden": true
      })
    }
  })
})

socket.on("point delete", (message) => {
  delete_list = message.delete_list

  delete_list.map( (user) => {
    if (my_uuid !== user.socket_connection_id) {
      Calc.removeExpression( {
        "id": user.socket_connection_id,
      })
    }
  })
})

socket.on("disconnect", (reason) => {
   // websocket is closed.
   status_icon_element = document.getElementById("status-icon")
   status_icon_element.style.color = "black"
   status_icon_element.className = "bi bi-pause-circle"
   var buttonStart = document.getElementById("connect-web-socket-button")
   buttonStart.style.display = "inline"
   var buttonStop = document.getElementById("stop-websocket")
   buttonStop.style.display = "none"

});
