
var server = "asdf.ngrok.io";
// Store frame for motion functions
var previousFrame = null;
var paused = false;
var pauseOnGesture = false;

//default control message
var controlMessage = "none"; 

// Setup Leap loop with frame callback function
var controllerOptions = {enableGestures: true};

// to use HMD mode:
// controllerOptions.optimizeHMD = true;
var currIndex = 0;
  var currApplicant = Applicants[currIndex];
  var translation;
Leap.loop(controllerOptions, function(frame) {

  if (paused) {
    return; // Skip this update
  }


  // Display Frame object data
  var frameOutput = document.getElementById("frameData");

  var frameString = "Frame ID: " + frame.id  + "<br />"
                  + "Timestamp: " + frame.timestamp + " &micro;s<br />";

  // Frame motion factors
  if (previousFrame && previousFrame.valid) {
    translation = frame.translation(previousFrame);
    //frameString += "Translation: " + vectorToString(translation) + " mm <br />";
    console.log(vectorToString(translation));

  }

  //frameOutput.innerHTML = "<div style='width:300px; float:left; padding:5px'>" + frameString + "</div>";


  // Display Gesture object data
  var gestureOutput = document.getElementById("gestureData");
  var gestureString = "";
  
  //console.log(Applicants[0])

  //console.log(currApplicant);
  displayApplicant(currApplicant);
  currApplicant = Applicants[currIndex];

  if (frame.gestures.length > 0) {
    if (pauseOnGesture) {
      togglePause();
    }
    for (var i = 0; i < frame.gestures.length; i++) {
      var gesture = frame.gestures[i];
      gestureString += "Gesture ID: " + gesture.id + ", "
                    + "type: " + gesture.type + ", "
                    + "state: " + gesture.state + ", "
                    + "hand IDs: " + gesture.handIds.join(", ") + ", "
                    + "pointable IDs: " + gesture.pointableIds.join(", ") + ", "
                    + "gesture direction: " + gesture.direction + ", "
                    + "duration: " + gesture.duration + " &micro;s, ";

      if (gesture.type === "swipe") {
          gestureString += "SWIPE";
            if (gesture.direction[0].toFixed(1) >= 0.5
            	&& gesture.direction[2].toFixed(1) <= Math.abs(0.7))
        	{
        		controlMessage = "SWIPE RIGHT";
            console.log(gesture.state);


        	}
            if (gesture.direction[0].toFixed(1) <= -0.5
            	&& gesture.direction[2].toFixed(1) <= Math.abs(0.7))
            {
            	controlMessage = "SWIPE LEFT";
              console.log(gesture.state);
              
            }

      }
      gestureString += "<br />";
    }
    currIndex+=1;
  }
  else {
    gestureString += "No gestures";
  }
  //gestureOutput.innerHTML = gestureString; //UNCOMMENT TO PRINT GESTURE DATA



  // Display Hand object data
  var handOutput = document.getElementById("handData");
  var handString = "";
  if (frame.hands.length > 0) {
    for (var i = 0; i < frame.hands.length; i++) {
      var hand = frame.hands[i];

      handString += "<div style='width:300px; float:left; padding:5px'>";
      handString += "Type: " + hand.type + " hand" + "<br />";


      // Pointables associated with this hand
      if (hand.pointables.length > 0) { //if there are fingers
        var fingers = [];
        var fingerTypeMap = ["Thumb", "Index finger", "Middle finger", "Ring finger", "Pinky finger"];

        for (var j = 0; j < hand.pointables.length; j++) {
        	var pointable = hand.pointables[j];
          /*----------------------------------

			     Get finger type as an integer, code:

            0 = THUMB
      			1 = INDEX
      			2 = MIDDLE
      			3 = RING
      			4 = PINKY

            -----------------------------------*/
          var currentFinger = {
  				  type: pointable.type,
  				  name: fingerTypeMap[pointable.type],
  				  extended: pointable.extended,
  				  yDirection: pointable.direction[1].toFixed(2)
			    }
  			  fingers.push(currentFinger);
          handString += "Finger Type: " + currentFinger.name + "<br />";
          handString += "Extended?: "  + currentFinger.extended + "<br />";
          handString += "Y Direction?: "  + currentFinger.yDirection + "<br />";   
      }

        if(fingers.length > 0) { //if we have fingers
        	if (fingers[0].extended === true
        		&& fingers[1].extended === false
        		&& fingers[2].extended === false
        		&& fingers[3].extended === false
        		&& fingers[4].extended === false
        		&& fingers[0].yDirection >= 0.1){
        		controlMessage = "THUMBS UP!";
        	}
        	else if (fingers[1].extended === false
        		&& fingers[2].extended === true
        		&& fingers[3].extended === false
        		&& fingers[4].extended === false){
        		controlMessage = "PEACE AMONG WORLDS!";
        	}
        	//else{
        		//controlMessage = "none";
        	//}

        }
      }
      handString += "</div>";
    }

  }
  else {
    handString += "No hands";
  }
  //handOutput.innerHTML = handString;

  



  // Store frame for motion functions
  previousFrame = frame;

  var controlOutput = document.getElementById("controlData");
  controlOutput.innerHTML = controlMessage;
  var myVar;

  if (controlMessage === "SWIPE RIGHT" && gestureString === "No gestures" 
    ){
    //clearTimeout(myVar)
     myVar = setTimeout(prevApplicant, 3000);
    controlMessage = "none";
  }
  else if (controlMessage === "SWIPE LEFT" && gestureString === "No gestures"){
    //clearTimeout(myVar)
     myVar = setTimeout(nextApplicant, 3000);
    controlMessage = "none";

  }
   else if (controlMessage === "THUMBS UP!"){
    fetch(server, {
      method: "post",
      body : JSON.stringify({
        id: currApplicant.id,
        type: "approve"
      })
    })
   } 
   else if (controlMessage === "PEACE AMONG WORLDS!"){
    fetch(server, {
      method: "post",
      body : JSON.stringify({
        id: currApplicant.id,
        type: "reject"
      })
    })
   }


})



function vectorToString(vector, digits) {
  if (typeof digits === "undefined") {
    digits = 1;
  }
  return "(" + vector[0].toFixed(digits) + ", "
             + vector[1].toFixed(digits) + ", "
             + vector[2].toFixed(digits) + ")";
}

function togglePause() {
  paused = !paused;

  if (paused) {
    document.getElementById("pause").innerText = "Resume";
  } else {
    document.getElementById("pause").innerText = "Pause";
  }
}

function pauseForGestures() {
  if (document.getElementById("pauseOnGesture").checked) {
    pauseOnGesture = true;
  } else {
    pauseOnGesture = false;
  }
}


function displayApplicant(thisObj)
{   
  //console.log(thisObj.id);
  if (!thisObj.firstName)
    var fullNameString = "None ? :0!!"
  else
    var fullNameString = thisObj.firstName + " "+ thisObj.middleName + " " + thisObj.lastName + "<br />";

  document.getElementById("fullName").innerHTML = fullNameString;
  document.getElementById("currentEmail").innerHTML = thisObj.email;

  var educationString = "";
  console.log();
  if (thisObj.education.length > 0)
    educationString += "Degree: " + thisObj.education[0]["degree"] + "<br>School: " + thisObj.education[0]["school"] +  "<br>Major: " + thisObj.education[0]["major"] + "<br>Graduation Date: " + thisObj.education[0]["graduationDate"];
  else{
    educationString = "None :,("
  }


  document.getElementById("currentEducation").innerHTML = educationString;

  var skillString = "";
  if (thisObj.skills.length > 0){
    for (skill in thisObj.skills) {
        skillString += thisObj.skills[skill]["level"] + " at " + thisObj.skills[skill]["name"] + "<br />";

    }
  }
  else
    skillString = "None :,(";

  document.getElementById("currentSkills").innerHTML = skillString;
}

function nextApplicant(){
  currIndex++;
  if (currIndex >= Applicants.length)
      currIndex = 0;
  //displayApplicant(Applicants[currIndex]);
}

function prevApplicant(){
  currIndex--;
  if (currIndex < 0)
      currIndex = Applicants.length;
  //displayApplicant(Applicants[currIndex]);

}

