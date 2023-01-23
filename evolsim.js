//Generate Species
function generateSpecies(count) {
  var species = [];
  for (var a = 0; a < count; a++) {
    var organism = {
      points: [],
      joints: {}
    };
    var pointCount = Math.floor(Math.random() * 4) + 4;
    for (var b = 0; b < pointCount; b++) {
      var thisPoint = organism.points.length;
      organism.points.push({
        offsetX: Math.random() * 10 - 5,
        offsetY: Math.random() * 10 - 5,
        size: Math.random() * 5 + 1
      });
      for (var c = 0; c < pointCount; c++) {
        if (Math.floor(Math.random() * 3) != 0) { //Random Chance of no joint
          if (c != thisPoint) { //Do not join to self
            var jointName = c < thisPoint ? c + "-" + thisPoint : thisPoint + "-" + c;
            if (!organism.joints[jointName]) { //Do not create joint when it already exists
              organism.joints[jointName] = {
                stretch: Math.random() * 5 + 1
              };
            }
          }
        }
      }
    }
    species.push(organism);
  }
  return species;
}

//Draw Creature on to canvas
function drawCreature(creatureData, element, size, showAvgX) {
  element.width = size;
  element.height = size;
  var ctx = element.getContext("2d");
  //Clear
  ctx.clearRect(0, 0, size, size);
  //Border
  ctx.rect(0, 0, size, size);
  ctx.stroke();
  //Center Mark
  ctx.rect(size * 0.45, size * 0.45, size * 0.1, size * 0.1);
  ctx.stroke();
  //Draw Points
  for (var i = 0; i < creatureData.points.length; i++) {
    var x = (size / 2) + ((size / 15) * creatureData.points[i].offsetX);
    var y = (size / 2) + ((size / 15) * creatureData.points[i].offsetY);
    var radius = (size / 100) * creatureData.points[i].size;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
  }
  //Draw Joints
  for (var i = 0; i < Object.keys(creatureData.joints).length; i++) {
    var jointId = Object.keys(creatureData.joints)[i];
    var joint = creatureData.joints[jointId];
    var pointA = creatureData.points[Number(jointId.split("-")[0])];
    var pointB = creatureData.points[Number(jointId.split("-")[1])];
    var ax = (size / 2) + ((size / 15) * pointA.offsetX);
    var ay = (size / 2) + ((size / 15) * pointA.offsetY);
    var bx = (size / 2) + ((size / 15) * pointB.offsetX);
    var by = (size / 2) + ((size / 15) * pointB.offsetY);
    ctx.lineWidth = joint.stretch;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
  }
  //Draw Average X
  if (showAvgX) {
    ctx.font = "30px Arial";
    ctx.fillText(Math.round(avgxpos(creatureData.points)), 20, 50);
  }
}

//Draw All Creatures
function drawAll(creatures) {
  for (var i = 0; i < creatures.length; i++) {
    var canvas = document.createElement("canvas");
    canvas.creatureData = creatures[i];
    canvas.onclick = function () {
      open("viewsim.html#" + encodeURIComponent(JSON.stringify(this.creatureData)));
    }
    drawCreature(creatures[i], canvas, 300);
    document.body.appendChild(canvas);
  }
}

//Move Creature
function moveCreature(creatureData, floor) {
  for (var a = 0; a < creatureData.points.length; a++) {
    //Gravity
    creatureData.points[a].offsetY += creatureData.points[a].size * (creatureData.points[a].offsetY < floor ? 0.01 : -0.05);
    //Find Joints
    for (var b = 0; b < Object.keys(creatureData.joints).length; b++) {
      if (a == Object.keys(creatureData.joints)[b].split("-")[0] || a == Object.keys(creatureData.joints)[b].split("-")[1]) { //Connected Joint
        var connectedPoint = a == Object.keys(creatureData.joints)[b].split("-")[0] ? creatureData.points[Object.keys(creatureData.joints)[b].split("-")[1]] : creatureData.points[Object.keys(creatureData.joints)[b].split("-")[0]];
        //Check Stretch
        if (jointLength(creatureData.points[a].offsetX, creatureData.points[a].offsetY, connectedPoint.offsetX, connectedPoint.offsetY) > creatureData.joints[Object.keys(creatureData.joints)[b]].stretch) {
          //Too stretched
          creatureData.points[a].offsetX += (creatureData.points[a].offsetX < connectedPoint.offsetX ? connectedPoint.size * 0.01 : connectedPoint.size * -0.01);
          creatureData.points[a].offsetY += (creatureData.points[a].offsetY < connectedPoint.offsetY ? connectedPoint.size * 0.01 : connectedPoint.size * -0.01);
        } else if (jointLength(creatureData.points[a].offsetX, creatureData.points[a].offsetY, connectedPoint.offsetX, connectedPoint.offsetY) < creatureData.joints[Object.keys(creatureData.joints)[b]].stretch / 2) {
          //Push
          creatureData.points[a].offsetX += (creatureData.points[a].offsetX > connectedPoint.offsetX ? 0.05 : -0.05);
          creatureData.points[a].offsetY += (creatureData.points[a].offsetY > connectedPoint.offsetY ? 0.01 : -0.01);
        }
      }
    }
  };
  return creatureData;
}

//Joint Length
function jointLength(ax, ay, bx, by) {
  var xDistance = ax > bx ? ax - bx : bx - ax;
  var yDistance = ay > by ? ay - by : by - ay;
  var length = Math.sqrt(xDistance ^ 2 + yDistance ^ 2);
  return length;
}

//Find Mean X Pos
function avgxpos(points) {
  var avg = 0;
  for (var i = 0; i < points.length; i++) {
    avg += points[i].offsetX;
  }
  avg = avg / points.length;
  return avg;
}