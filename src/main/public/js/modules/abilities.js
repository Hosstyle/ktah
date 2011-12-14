/**
 * abilities.js
 *
 * Handles ability usage from the standpoint
 * of clients being informed by the change in
 * gamestate.
 */

$(function () {
  
  // Informs the host of the use of an ability, who then
  // reports it to the other players on their respective "gets"
  ktah.abilities.postAbilityUse = function (ability, posX, posY, posZ, angle, cd) {
    $.ajax({
      type: 'POST',
      url: '/abilities/' + ktah.gamestate.environment.game,
      data: JSON.stringify(
        {
          "name": ability,
          "x": posX,
          "y": posY,
          "z": posZ,
          "theta": angle,
          "cooldown": cd
        }
      ),
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
      },
      dataType: 'json',
      contentType: 'application/json'
    });
  };
  
  // Used by each player to see an ability used
  ktah.abilities.renderAbilities = function (abilityQueue) {
    for (var i = 0; i < abilityQueue.length; i++) {
      var currentAbility = abilityQueue[i];
      abilityMap[currentAbility.name](currentAbility.x, currentAbility.y, currentAbility.z, currentAbility.theta, currentAbility.cooldown);
    }
  };
  
  // Takes in an effect after ability is used, and adds it to ktah effects array
  ktah.abilities.addEffect = function (effect) {
    if (!ktah.effectsMax) { ktah.effectsMax = 20;}
    if (ktah.effects[ktah.effectsCurrent]) { ktah.effects[ktah.effectsCurrent].die()}
    ktah.effects[ktah.effectsCurrent] = effect;
    if (ktah.effectsCurrent < ktah.effectsMax - 1) {
      ktah.effectsCurrent++;
    } else {
      ktah.effectsCurrent = 0;
    } 
  };
  
  // Takes an effect name and adds an effect for it
  ktah.abilities.useEffect = function (name, pos) {
    // make sure some position exists
    if (!pos) { pos = new CL3D.Vect3d(0,0,0);}
    
    // then make effect based on name
    switch(name){
      case "mud":
        ktah.abilities.addEffect(new ktah.types.Mud({},{Pos: pos}));
        break;
      case "path":
        ktah.abilities.addEffect(new ktah.types.Path({},{Pos: pos}));
        break;
      case "pow":
        ktah.abilities.addEffect(new ktah.types.Pow({},{Pos: pos}));
        break;
      case "start":
        ktah.abilities.addEffect(new ktah.types.Start({},{Pos: pos}));
        break;
      default:
        ktah.abilities.addEffect(new ktah.types.Effect());
        break;
    } 
  };

  // Renders an architect's wall via copperlicht scene node
  ktah.abilities.buildWall = function (x, y, z, theta, cooldown) {
    var wall = ktah.scene.getSceneNodeFromName('wall').createClone(ktah.scene.getRootSceneNode());
    // TODO: Fix the maffs on the wall building
    wall.Rot.Y = theta + 270;
    wall.Pos.X = x + 10 * Math.cos(wall.Rot.Y + 180);
    wall.Pos.Y = y + 15;
    wall.Pos.Z = z + 10 * Math.sin(wall.Rot.Y);
    wall.Scale.Y = 4;
    wall.Scale.Z = 5;
    setTimeout(function () {
      ktah.scene.getRootSceneNode().removeChild(wall);
    }, cooldown * 1000);
  };
  
  // Pioneer's Path
  ktah.abilities.makePath = function (x, y, z, theta, cooldown) {
    ktah.abilities.useEffect("path", new CL3D.Vect3d(x,y,z));
  };
  
  // Architect's Mud, or "Churn the Earth"
  ktah.abilities.churnTheEarth = function (x, y, z, theta, cooldown) {
    ktah.abilities.useEffect("mud", new CL3D.Vect3d(x,y,z));
  };
  
  var abilityMap = 
    {
      "simpleWall": ktah.abilities.buildWall,
      "path": ktah.abilities.makePath,
      "mud": ktah.abilities.churnTheEarth
    };
  
});
