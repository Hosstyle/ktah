/**
 * copperlicht-ui.js
 *
 * Contains the basic user-interaction elements
 * that copperlicht uses to update its display.
 */

$(function() {

  var engine = startCopperLichtFromFile('ktahCanvas', '../../assets/copperlicht/copperlichtdata/zombieTestRedux.ccbjs'),
  zombieSceneNode = null,
  zombieArray = [],
  scene = null,
  key = null;
  
  engine.addScene(scene);

  // Rate of movement per second
  var moveRate = 1.0, lastTime = 0.0, timeDiff = 0.0,

  // Camera positioning values
  camSetDist = 10, camDistRatio = 1.0,

  // Last direction traveled
  difX = -1.0, difZ = 0.0, dirAngle = 0.0,

  // Mouse Controls values
  goal = null, //new CL3D.Vect3d(),
  goalX = NaN, // where to travel to
  goalZ = NaN, // where to travel to
  originalX = NaN,
  originalZ = NaN,
  walkSpeed = 1.85, // how fast character moves

  // Camera positioning values
  camSetDist = 10,
  camDistRatio = 1.0,
  zoomDist = 10,
  zoomDistMin = -3,
  zoomDistMax = 15,
  zoomSpeed = -2,
  isometricView = true, // should be true
  cameraStarted = false,
  mouseIsDown = false,
  mouseClicked = false,
  mouseClickedTimer = 0,

  // Variables for keyboard controls
  wKey = aKey = sKey = dKey = upKey = leftKey = downKey = rightKey = resetKey = jumpKey = false;

  // Universal Camera Setup
  var cam = new CL3D.CameraSceneNode();
  var animator = new CL3D.AnimatorCameraFPS(cam, engine);
  cam.addAnimator(animator);
  
  // Gameplay mechanics
  var zombieBeingAttacked = -1,
      gameId = $("#gameId").attr("data"),
      userName = $("#userName").attr("data"),
      playerNumber = 0,
      playerCount = 0,
      
      // Function that clears and then sets up the user interface
      // called once at beginning and every time a player leaves / joins
      updateUserInterface = function () {
        var currentPlayer = "",
            nametagAccent = "";
        
        // Setup round timer and points
        $("#health-display")
        .html("")
        .append(
          "<div id='round-info'><span id='round-time'>Time: <span id='time-remaining' class='round-info-space'>0:00</span></span>"
          + "<span id='points'>Points: <span id='points-remaining' class='currentPlayerNametag'>"
          + ktah.gamestate.players[playerNumber].pointsRemaining + "</span></span></div>"
        );
        
        for (var i = 0; i < playerCount; i++) {
          currentPlayer = ktah.gamestate.players[i];
          nametagAccent = "";
          
          // Accent the nametag of the local player
          if (i === playerNumber) {
            nametagAccent = "class='currentPlayerNametag'";
          }
          
          // Setup health display
          $("#health-display").append(
            "<div id='" + currentPlayer.name + "-stats' class='player-stats'><div " + nametagAccent + ">" + currentPlayer.name + "</div>"
            + "<div id='" + currentPlayer.name + "-health-num-box' class='player-health-num-box'>"
            + "<div id='" + currentPlayer.name + "-health-bar' class='player-health-bar'>&nbsp</div>"
            + "<span class='player-healthNum'>" + currentPlayer.health + " / 100</span>"
            + "</div></div>"
          );
        }
      };

  // Called when loading the 3d scene has finished (from the coppercube file)
  engine.OnLoadingComplete = function () {
    if(ktah.gamestate.players) {
      scene = engine.getScene();
      if(scene) {
        // Setup player information
        for (var i = 0; i < ktah.gamestate.players.length; i++) {
          if (ktah.gamestate.players[i].name === userName) {
            playerNumber = i;
          }
          playerCount++;
        }
        
        // TEMPORARY: Populate the zombieArray, one for each player
        for (var i = 0; i < playerCount; i++) {
          var currentPlayer = ktah.gamestate.players[i],
              nametagAccent = "";
          
          if (i === 0) {
            // "Zombie 0" gets the original ghoul
            zombieArray[0] = scene.getSceneNodeFromName('ghoul');
          } else {
            // All other zombies are cloned and added to scene
            zombieArray[i] = zombieArray[0].createClone(scene.getRootSceneNode());
          }
          zombieArray[i].Pos.Z += i * 15;
        }
        // Grab the zombie that the player is controlling
        zombieSceneNode = zombieArray[playerNumber];
        
        updateUserInterface();
      } else {
        return;
      }
  
      // Finish setting up by adding camera to scene
      scene.getRootSceneNode().addChild(cam);
      scene.setActiveCamera(cam);
      
      // Lastly, set the update function
      window.setInterval(updateTeam, 50);
    } else {
      setTimeout(engine.OnLoadingComplete, 250);
    }    
  };
  
  // Default camera instructions
  var camFollow = function(cam, target) {
    if (isometricView) {
      isometricCam(cam, target);
    } else {
      shoulderCam(cam, target);
    }
  },
  
  // Over the shoulder camera
  shoulderCam = function(cam, target) {
    cam.Pos.X = target.Pos.X - difX * camDistRatio;
    cam.Pos.Y = target.Pos.Y + 20;
    cam.Pos.Z = target.Pos.Z - difZ * camDistRatio;
    animator.lookAt(new CL3D.Vect3d(zombieSceneNode.Pos.X, zombieSceneNode.Pos.Y + 10, zombieSceneNode.Pos.Z));
  },
  
  // Isometric camera
  isometricCam = function(cam, target) {
    cam.Pos.X = target.Pos.X + (camSetDist + zoomDist);
    cam.Pos.Y = target.Pos.Y + (camSetDist + 2*zoomDist  + 10);
    cam.Pos.Z = target.Pos.Z - (camSetDist + zoomDist);
    animator.lookAt(new CL3D.Vect3d(zombieSceneNode.Pos.X, zombieSceneNode.Pos.Y + 10, zombieSceneNode.Pos.Z));
  },
  
  // A more complicated key change state event. Uppercase and lowercase
  // letters both referenced due to keydown vs keypress differences
  keyStateChange = function(key, bool) {
    // Displays key value, for learning new key cases
    // alert(key);
    // When pressing w, move forward, s back
    // a move left, d move right
    switch (key) {
      case 'w':
      case 'W':
      case '&':
        // up arrow
        wKey = bool;
        break;
      case 's':
      case 'S':
      case '(':
        // down arrow
        sKey = bool;
        break;
      case 'a':
      case 'A':
      case '%':
        // left arrow
        aKey = bool;
        break;
      case 'd':
      case 'D':
      case "'":
        // right arrow
        dKey = bool;
        break;
      case '0':
        // reset key is zero
    	resetKey = bool;
    	break;
    	case ' ':
    	  // "Jump forward is space"
    	jumpKey = bool;
    	break;
      default:
        break;
    }
  },
  
  whileMouseDown = function() {
	var mousePoint = engine.get3DPositionFrom2DPosition(engine.getMouseDownX(),engine.getMouseDownY());
	var newGoal = scene.getCollisionGeometry().getCollisionPointWithLine(cam.Pos, mousePoint, true, null);
    
	if (newGoal) {
	  goal = newGoal;
	  goalX = goal.X;
	  goalZ = goal.Z;
      originalX = zombieSceneNode.Pos.X;
      originalZ = zombieSceneNode.Pos.Z;
	}
  },
  
  updatePos = function(zombieSceneNode, newX, newZ) {
    changeRate = 20;
    difX = (difX * (changeRate - 1) + newX) / changeRate;
    difZ = (difZ * (changeRate - 1) + newZ) / changeRate;
    camDistRatio = camSetDist / (Math.sqrt(Math.pow(difX, 2) + Math.pow(difZ, 2)));
  },
  
  // Helper function for maintaining the value of the gamestate
  processGamestate = function (data) {
    ktah.gamestate = data;
  },
  
  // Helper function for animation display
  animateCharacter = function (characterIndex, animation) {
    var currentChar = zombieArray[characterIndex];
    if (currentChar.currentAnimation !== animation) {
      currentChar.setLoopMode(animation !== "attack");
      if (currentChar.currentAnimation !== "attack") {
        currentChar.currentAnimation = animation;
        currentChar.setAnimation(animation);
      }
    }
    if (animation === "attack") {
      setTimeout(function () {currentChar.currentAnimation = "walk";}, 600);
    }
  },
  
  // Updates the positions of other players
  updateTeam = function() {
    // First, grab the gamestate
    $.ajax({
      type: 'GET',
      url: '/gamestate/' + gameId,
      data: {
        player : userName
      },
      success: function (data) {
        processGamestate(data);
        
        // Update points
        $("#points-remaining").text(ktah.gamestate.players[playerNumber].pointsRemaining);
        
        // Update player positions based on the gamestate
        for (var i = 0; i < playerCount; i++) {
          var currentPlayer = ktah.gamestate.players[i];
              
          // Update health bars
          $("#" + currentPlayer.name + "-health-num-box").children(":nth-child(2)")
            .text(currentPlayer.health + " / 100");
            
          $("#" + currentPlayer.name + "-health-bar")
            .css("width", (currentPlayer.health / 100) * 148 + "px");
          
          // Set zombie animation
          if (currentPlayer.posX !== zombieArray[i].Pos.X || currentPlayer.posZ !== zombieArray[i].Pos.Z) {
            animateCharacter(i, "walk");
          } else {
            animateCharacter(i, "look");
          }
          
          // Set attack animation
          if (currentPlayer.attacking !== -1) {
            animateCharacter(i, "attack");
          }
          
          if (i === playerNumber) {
            currentPlayer.posX = zombieArray[i].Pos.X;
            currentPlayer.posZ = zombieArray[i].Pos.Z;
            currentPlayer.posY = zombieArray[i].Pos.Y;
            currentPlayer.theta = zombieArray[i].Rot.Y;
            
            if (zombieArray[i].Pos.Y < -300 || resetKey) {
              currentPlayer.health = currentPlayer.health - 25;
              addPoints(-10);
              resetZombiePosition(i);
              resetGoal();
              camFollow(cam, zombieArray[i]);
            }
            
            if (jumpKey) {
              resetGoal();
              zombieJump(i);
              camFollow(cam, zombieArray[i]);
            }
            
            currentPlayer.attacking = zombieBeingAttacked;
            
            if (currentPlayer.beingAttacked) {
              currentPlayer.health -= 5;
              currentPlayer.beingAttacked = false;
            }
            
            if (currentPlayer.health <= 0) {
              currentPlayer.health = 100;
              resetZombiePosition(i);
              camFollow(cam, zombieArray[i]);
            }
            
            $.ajax({
              type: 'POST',
              url: '/gamestate/' + gameId + "/" + userName,
              data: JSON.stringify(currentPlayer),
              error: function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
              },
              dataType: 'json',
              contentType: 'application/json'
            });
          } else {
            zombieArray[i].Pos.X = currentPlayer.posX;
            zombieArray[i].Pos.Z = currentPlayer.posZ;
            zombieArray[i].Pos.Y = currentPlayer.posY;
            zombieArray[i].Rot.Y = currentPlayer.theta;
          }
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      },
      dataType: 'json',
      contentType: 'application/json'
    });
  },
  
  // To move any node from position origin to position destination at walkspeed
  goFromTo = function(origin, destination) {
    var newVal = 0;
    // Handle goalX if it has a new number
    if (destination != origin) {
      if (destination > origin + 1) {
        newVal += walkSpeed;
      } else if (destination < origin - 1) { 
        newVal -= walkSpeed;
      } else {
        destination = origin;
      }
    }
    return newVal;
  },
  
  resetZombiePosition = function(i){
      zombieArray[i].Pos.Y = 1.4;
      zombieArray[i].Pos.X = 64.4;
      zombieArray[i].Pos.Z = 118.4;
  },
  
  zombieJump = function (i) {
    zombieArray[i].Pos.X += 10;
    zombieArray[i].Pos.Z += 10;
  },
  
  resetGoal = function() {
      goalX = null; //zombieArray[i].Pos.X;
      goalZ = null; //zombieArray[i].Pos.Z;
  },
  
  // Helper function for adding points
  addPoints = function (points) {
    var currentPlayer = ktah.gamestate.players[playerNumber];
    currentPlayer.pointsRemaining += points;
    currentPlayer.pointsEarned += points;
  },
  
  mainLoop = function() {
    if (zombieSceneNode) {

      // Check to make sure mouse is held down, not just clicked
      if (mouseIsDown) {
        if (mouseClicked) {
          mouseClickedTimer++;
          if (mouseClickedTimer > 10) {
            mouseClicked = false;
          }
        }
        whileMouseDown();
      }
      // If mouse held and released, stop immediately
      if ((!mouseIsDown && !mouseClicked) || (aKey || dKey || sKey || wKey)) {
        resetGoal();
    	  //goalX = zombieSceneNode.Pos.X;
        //goalZ = zombieSceneNode.Pos.Z;
      }

      if (!cameraStarted) {
        camFollow(cam, zombieSceneNode);
        cameraStarted = true;
      }
      var newX = 0.0;
      var newZ = 0.0;

      // Rotate Player based on Keyboard Combinations (8 directions)
      if (wKey || aKey || sKey || dKey) {
        var angle = 0;
        if (wKey && !sKey) {
          if (aKey && !dKey) {
            angle = 270-45;
          } else if (dKey && !aKey) {
            angle = 270+45;
          } else {
            angle = 270;
          }
        } else if (sKey && !wKey) {
          if (aKey && !dKey) {
            angle = 90+45;
          } else if (dKey && !aKey) {
            angle = 90-45;
          } else {
            angle = 90;
          }
        } else {
          if (aKey && !dKey) {
            angle = 180;
          } else if (dKey) {
            angle = 0;
    	  }
    	}
      	zombieSceneNode.Rot.Y = angle + 45; // someday later, might also add in (if camera ever moves) this: + cam.Rot.Y;
      	// except that, apparently, cam.Rot values only return zero with the code we have right now.
      }
      
      // Reset attack value
      zombieBeingAttacked = -1;
      
      // Update position and camera if any changes made
      if(goalX || goalZ || aKey || wKey || dKey || sKey) {
        if (!goalX && !goalZ) { // if Keyboard Commands, just update dirAngle
          dirAngle = (270 - zombieSceneNode.Rot.Y) / 180 * Math.PI;
          // if Mouse, update rotation of player character appropriately
        } else if (goal && zombieSceneNode.Pos.getDistanceTo(new CL3D.Vect3d(goal.X, zombieSceneNode.Pos.Y,goal.Z)) > 3*walkSpeed) {
          dirAngle = Math.atan((goalZ - originalZ) / (goalX - originalX));
          if (goalX > zombieSceneNode.Pos.X) { dirAngle = Math.PI + dirAngle; }
          zombieSceneNode.Rot.Y = 270 - dirAngle * 180 / Math.PI; // dirAngle must be converted into 360
        }

        newX = newZ = 0; // reset so we can recalculate based on new angle
        newX -= walkSpeed * Math.sin(Math.PI/2 + dirAngle);
        newZ += walkSpeed * Math.cos(Math.PI/2 + dirAngle);
        // so this calculates the new X and new Z twice, but this one makes it right to the facing angle
        
        if ((!goalX && !goalZ) || (goal && zombieSceneNode.Pos.getDistanceTo(new CL3D.Vect3d(goal.X, zombieSceneNode.Pos.Y,goal.Z)) > 2*walkSpeed)) {
          zombieSceneNode.Pos.X += newX;
          zombieSceneNode.Pos.Z += newZ;
        }
        
        
        // Collision Detection between zombies
        for (var i = 0; i < playerCount; i++) {
          if (i !== playerNumber && zombieArray[playerNumber].Pos.getDistanceTo(zombieArray[i].Pos) < 4) {
            // Classic X/Z movement system
            zombieSceneNode.Pos.X += (zombieSceneNode.Pos.X - zombieArray[i].Pos.X)/2;
            zombieSceneNode.Pos.Z += (zombieSceneNode.Pos.Z - zombieArray[i].Pos.Z)/2;
            zombieBeingAttacked = i;
          }
        }
        
        updatePos(zombieSceneNode, newX, newZ);
        
        // Finally, update Camera for new positions
        camFollow(cam, zombieSceneNode);
      }
      
    }

    setTimeout(mainLoop, 20);
  };
  
  // Pass keydown to keyStateChange
  document.onkeydown = function(event) {
    key = String.fromCharCode(event.keyCode);
    keyStateChange(key, true);
  };
  // Pass keyup to keyStateChange
  document.onkeyup = function(event) {
    key = String.fromCharCode(event.keyCode);
    keyStateChange(key, false);
  };
  
  // Mouse Down register for Mouse Movement
  engine.handleMouseDown = function (event) { 
    mouseIsDown = true;
    mouseClicked = true;
    mouseClickedTimer = 0;
  };
  // Mouse Up register for Mouse Movement
  engine.handleMouseUp = function (event) {
    mouseIsDown = false;
  };
  
  // Mouse wheel for zooming
  // see http://plugins.jquery.com/project/mousewheel for more info
  // and http://plugins.jquery.com/plugin-tags/mousewheel
  // using the event helper from http://brandonaaron.net/code/mousewheel/docs
  $(document).mousewheel(function(event, delta) {
    if (zoomDist + zoomSpeed * delta <= zoomDistMax && zoomDist + zoomSpeed * delta >= zoomDistMin) {
      zoomDist += zoomSpeed * delta;
      camFollow(cam, zombieSceneNode);
    }
  });

  // Call primary recurring functions once to get the ball running
  updateTeam();
  mainLoop();
  
});
