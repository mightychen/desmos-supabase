var my_uuid = ""
var initialized = false

function getColor(id) {
  color = Desmos.Colors.BLACK;
  if (id == 1) {
    color = Desmos.Colors.RED;
  }
  else if (id == 2) {
    color = Desmos.Colors.BLUE;
  }
  else if (id == 3) {
    color = Desmos.Colors.GREEN;
  }
  else if (id == 4) {
    color = Desmos.Colors.PURPLE;
  }
  else if (id == 5) {
    color = Desmos.Colors.ORANGE;
  }
  return color;
}

function create_web_socket_connection() {
  // This code is run on the client end
  var ws = new WebSocket("ws://127.0.0.1:8000/echo");
  console.log("hello!")

  ws.onopen = function() {
     // Web Socket is connected, send data using send()
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

     // Ask the client for a unique uuid key
     ws.send(JSON.stringify({
       "message-type": "init",
       "data": {}
     }))

     buttonStop.onclick = function() {
       if (ws.readyState === WebSocket.OPEN) {
         console.log("Closing..")
         ws.close();
       }
     }
  };

  ws.onmessage = function (evt) {
    var received_msg = evt.data;
    // Python sends single quotes, JS needs double quotes
    // Convert string to Array of Objects
    received_msg = received_msg.replaceAll("'", "\"");
    var parsed = JSON.parse(received_msg);
    console.log("received:", parsed)

    if (parsed["message-type"] == "init-res") {
      my_uuid = parsed["data"]["uuid"]
      console.log("my uuid: ", my_uuid)
      var initialized = true

      // Create a draggable point for myself
      Calc.setExpression({
        "id": 'my-point',
        "latex": 'P_{Me}=(0,0)',
        "dragMode": Desmos.DragModes.XY,
      })

      var list_helper = Calc.HelperExpression({
        "latex": "\\left[P_{Me}.x,P_{Me}.y\\right]"
      })
      // When there is a change in the value, send the updates to the server
      list_helper.observe('listValue', function() {
        var my_point_pose_x = list_helper.listValue[0]
        var my_point_pose_y = list_helper.listValue[1]

        var response = {
          "message-type": "point-update",
          "uuid": my_uuid,
          "data": {
            "x": my_point_pose_x,
            "y": my_point_pose_y
          }
        }
        ws.send(JSON.stringify(response))
      })
    }
    if (parsed["message-type"] == "point-update") {
      // Remove the connected user with my uuid
      var connected_users_map = new Map(
          Object.entries(parsed["data"]["connected-users"])
      )
      connected_users_map.delete(my_uuid)

      for (let [key,value] of connected_users_map) {
        console.log(value)
        var x_val = value["x"]
        var y_val = value["y"]
        var id = value["id"]
        Calc.setExpression( {
          "id": key,
          "latex": `P_{${id}}=(${x_val}, ${y_val})`,
          "dragMode": Desmos.DragModes.NONE,
          "color": Desmos.Colors.BLACK,
        })
      }
    }
  };

  ws.onclose = function() {
     // websocket is closed.
     status_icon_element = document.getElementById("status-icon")
     status_icon_element.style.color = "black"
     status_icon_element.className = "bi bi-pause-circle"
     var buttonStart = document.getElementById("connect-web-socket-button")
     buttonStart.style.display = "inline"
     var buttonStop = document.getElementById("stop-websocket")
     buttonStop.style.display = "none"
  };

  window.addEventListener("unload", function () {
    if(ws.readyState === WebSocket.OPEN) {
      console.log("closing!")
        ws.close();
    }
  });
}
