var JMath = {};

JMath.DegreesToRadians = function (angle){
    return angle*0.0174533;
}

JMath.RadiansToDegrees = function (rads){
    return rads*57.2958;
}

JMath.Distance = function (x,y){
    return Math.sqrt(x*x+y*y);
}

var Vector2 = {};

Vector2.Add = function (a, b){
    return {x:a.x+b.x, y:a.y+b.y};
}

var Matrix = {};

Matrix.MultiplyPoint = function (matrix, point) {
    var x = point.x*matrix[0] + point.y* matrix[4] + point.z*matrix[8] + matrix[12];
    var y = point.x*matrix[1] + point.y*matrix[5] + point.z*matrix[9] + matrix[13];
    var z = point.x*matrix[2] + point.y*matrix[6] + point.z*matrix[10] + matrix[14];
    var w = point.x*matrix[3] + point.y*matrix[7] + point.z*matrix[11] + matrix[15];
    return {x:x/w, y:y/w, z:z/w};
}

Matrix.Multiply = function (a, b) {
  
  // TODO - Simplify for explanation
  // currently taken from https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js#L306-L337
  
  var result = [];
  
  var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
      a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
      a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
      a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

  // Cache only the current line of the second matrix
  var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
  result[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  result[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  result[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  result[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
  result[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  result[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  result[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  result[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
  result[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  result[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  result[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  result[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
  result[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
  result[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
  result[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
  result[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

  return result;
}

Matrix.Translate = function (x, y, z) {
	return [
	    1,    0,    0,   0,
	    0,    1,    0,   0,
	    0,    0,    1,   0,
	    x,    y,    z,   1
	];
}

Matrix.RotateZ = function (a) {
    var cos = Math.cos;
    var sin = Math.sin;
    return [
      cos(a), -sin(a),    0,    0,
      sin(a),  cos(a),    0,    0,
           0,       0,    1,    0,
           0,       0,    0,    1
    ];
  }

function DrawTriangle(x,y,radius,angle,fillStyle){
    var translate = Matrix.Translate(x,y,0);
    var rotate = Matrix.RotateZ(JMath.DegreesToRadians(-angle));
    var matrix = Matrix.Multiply(translate, rotate);
    var a = Matrix.MultiplyPoint(matrix, {x:-radius, y:-radius, z:0});
    var b = Matrix.MultiplyPoint(matrix, {x:0, y:radius*1.2, z:0});
    var c = Matrix.MultiplyPoint(matrix, {x:radius, y:-radius, z:0});
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.fill();
}

function DrawLine(x,y,x2,y2,strokeStyle){
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}

function DrawCircle(x,y,radius,fillStyle){
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();
}

function Fire(o){
    if(o.timeUntilShootAgain < 0){
        o.timeUntilShootAgain = 5;
        var rads = JMath.DegreesToRadians(o.angle);
        objects.push({
            type:'bullet', 
            velocity:{x:o.velocity.x + Math.cos(rads)*20, y:o.velocity.y + Math.sin(rads)*20}, 
            position:{x:o.position.x, y:o.position.y}, 
            color:{r:1,g:0,b:0}, 
            timeLeft:35});
    }
    o.timeUntilShootAgain--;
}

function Accelerate(o){
    var rads = JMath.DegreesToRadians(o.angle);
    o.velocity = Vector2.Add(o.velocity, {x:Math.cos(rads)*o.acceleration, y:Math.sin(rads)*o.acceleration});
    var speed = JMath.Distance(o.velocity.x, o.velocity.y);
    var fspeed = o.topSpeed/speed;
    if(fspeed<1){
        o.velocity.x*=fspeed;
        o.velocity.y*=fspeed;
    }
}

function Draw(){
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height);

    for(var i=0;i<objects.length;i++){
        var o = objects[i];

        if(o.controller == 'Player'){
            if(keys.ArrowLeft) o.angle--;
            if(keys.ArrowRight) o.angle++;
            if(keys.ArrowUp){
                Accelerate(o);
            }
            if(keys[' ']){
                Fire(o);
            }
        }
        if(o.controller == 'AI'){
            var targDiffX = o.target.position.x - o.position.x;
            var targDiffY = o.target.position.y - o.position.y;
            var angle = JMath.RadiansToDegrees(Math.atan2(targDiffY, targDiffX));
            var diffAngle = angle - o.angle;
            while(diffAngle<-180){
                diffAngle+=360;
            }
            while(diffAngle>180){
                diffAngle-=360;
            }
            
            if(Math.abs(diffAngle) < 1){
                Accelerate(o);
                o.angle+=diffAngle;
            }
            else if(diffAngle < 0){
                o.angle--;
            }
            else{
                o.angle++;
            }

            Fire(o);
        }

        var x = o.position.x-player.position.x+ctx.canvas.width*0.5;
        var y = o.position.y-player.position.y+ctx.canvas.height*0.5;
        var color = 'rgb('+o.color.r*255+','+o.color.g*255+','+o.color.b*255+')';
        if(o.type == 'planet'){
            DrawCircle(x,y,o.radius,color);
        }
        else if(o.type == 'ship'){
            var angle = o.angle-90;
            DrawTriangle(x,y,o.radius,angle, color);
        }
        else if(o.type == 'bullet'){
            DrawLine(x+o.velocity.x,y+o.velocity.y,x,y,color);
            o.timeLeft--;
            if(o.time<0){
                objects.splice(i,1);
                i--;
            }
        }

        if(o.velocity){
            o.position.x += o.velocity.x;
            o.position.y += o.velocity.y;
        }
    }

    requestAnimationFrame(Draw);
}

function KeyDown(e){
    keys[e.key] = true;
}

function KeyUp(e){
    keys[e.key] = false;
}

function CreateCanvas(parent){
    var canvas = document.createElement('canvas');
    parent.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    return canvas.getContext('2d');
}

function RandColor(){
    return {r:Math.random(), g:Math.random(), b:Math.random()};
}

var player = {
    type:'ship', 
    angle:0, 
    radius:20, 
    position:{x:0,y:0}, 
    velocity:{x:0,y:0}, 
    acceleration:0.05, 
    color:{r:0,g:0,b:1}, 
    timeUntilShootAgain:0, 
    controller:'Player',
    topSpeed:5};
var objects = [];
var radius = 2000;
for(var i=0;i<10;i++){
    objects.push({type:'planet', position:{x:Math.random()*radius-radius*0.5, y:Math.random()*radius-radius*0.5}, color:RandColor(), radius:Math.random()*100});
}
objects.push({
    type:'ship', 
    angle:0, 
    radius:25, 
    position:{x:20, y:20}, 
    velocity:{x:0,y:0}, 
    acceleration:0.05, 
    color:{r:1,g:1,b:0}, 
    timeUntilShootAgain:0, 
    controller:'AI', 
    target:player,
    topSpeed:5});
objects.push(player);

var keys = {};
var ctx = CreateCanvas(document.body);
document.body.style.margin = '0px';
document.body.style.overflow = 'hidden';

requestAnimationFrame(Draw);
addEventListener('keydown', KeyDown);
addEventListener('keyup', KeyUp);