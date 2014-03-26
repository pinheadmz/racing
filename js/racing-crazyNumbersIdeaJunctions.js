/*
***************************************
*  designed by MATTHEW ZIPKIN 2012    *
* matthew(dot)zipkin(at)gmail(dot)com *
***************************************
*/

// ***** initialize animation method for browser -- http://www.nczonline.net/blog/2011/05/03/better-javascript-animations-with-requestanimationframe/
var requestAnimationFrame = window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function( callback ){
		setTimeout(callback, 1000 / 60);
	};

// octogon shaped racetrack course for debugging
var course3 = [
	[0, 0],
	[0, -5000],
	[-3535, -8535],
	[-8535, -8535]];

var course = [
	[0, 0],
	[0, -5000],
	[3535, -8535],
	[8535, -8535],
	[12070, -5000],
	[12070, 0],
	[8535, 3535],
	[3535, 3535]];

var course2 = [
	[0, 0],
	[1150, -2000],
	[2000, -2700],
	[2500, -1500],
	[3600, -2000],
	[4500, -2000],
	[3500, -3200],
	[2700, -3300],
	[2750, -5300],
	[3700, -5420],
	[3950, -3710],
	[5700, -3530],
	[5800, -4300],
	[8600, -5700],
	[7000, -4000],
	[6700, -2000],
	[5800, -530],
	[800, -800]];

// generates array of angles to help drawing
var courseAngles = (function(){
	var a = new Array();
	for (var k = 0; k <= (course.length - 1) ; k++){
		var startX = course[k][0];	
		var startY = course[k][1];	
		var endX = course[(k == (course.length - 1)) ? 0 : (k + 1)][0];	
		var endY = course[(k == (course.length - 1)) ? 0 : (k + 1)][1];
		
		a[k] = Math.atan((endY - startY) / (endX - startX)) * (180 / Math.PI);
	}
	return a;
})();


// canvas dimensions must match canvas size in css
var canvasW = 700;
var canvasH = 640;

// for easy math
var rad2Deg = Math.PI / 180;
var rad90 = -90 * rad2Deg;

// ***** object handles background scrolling
var BG = new (function(){
	// init bg pattern
	this.image = new Image();
	this.image.src = 'i/course.png';

	// dimensions of visible frame and actual file size
	this.width = 70;
	this.height = 64;
	this.fileHeight = 1040;
	this.fileWidth = 890;
	
	// initialize current position 
	this.X = -350;
	this.Y = -440;

	
	// draw current portion of image to canvas
	this.draw = function(){
		var roadW = 500;
		var canvasC = canvasW / 2;
		var centerX = canvasC + this.X;
		var centerY = (canvasH / 2) + this.Y;
		var roadC = roadW / 2;
		var laneW = 20;
		var laneH = 150;
		var borderW = 30;
		var borderH = 40;

		// big green background
		ctx.fillStyle = '#339933';
		ctx.fillRect(0,0,canvasW,canvasH);

		// draw each segment of the road
		for (var i = 0; i < course.length; i++){
			var startX = course[i][0];	
			var startY = course[i][1];	
			var endX = course[(i == (course.length - 1)) ? 0 : (i + 1)][0];	
			var endY = course[(i == (course.length - 1)) ? 0 : (i + 1)][1];

			// ***** check distance from road segment before doing any more calcualtions ******
			var aLen = Math.sqrt(Math.pow((endX-centerX),2) + Math.pow((endY-centerY),2));
			var bLen = Math.sqrt(Math.pow((centerX-startX),2) + Math.pow((centerY-startY),2));
			var cLen = Math.sqrt(Math.pow((endX-startX),2) + Math.pow((endY-startY),2));
			var Aangle = Math.acos( ((bLen*bLen) + (cLen*cLen) - (aLen*aLen)) / (2 * bLen * cLen) );
			var distToRoad = Math.sin(Aangle) * bLen;
			if (distToRoad > canvasC + roadW)
				continue;
	
			var sideWay = (endX >= startX) ? 1 : -1;
			var segLength = Math.sqrt(Math.pow((endX - startX), 2) + Math.pow((endY - startY), 2));
			var segAngle = courseAngles[i];
			var segAngleRad = segAngle * rad2Deg;
			var prevAngle = courseAngles[ (i == 0) ? (course.length - 1) : (i - 1) ];
			var prevAngleRad = prevAngle * rad2Deg;
			var roadX1 = (Math.sin(segAngleRad) * roadC * 1) + startX - this.X;
			var roadY1 = (Math.cos(segAngleRad) * roadC * -1) + startY - this.Y;
			var roadX2 = (Math.sin(segAngleRad) * roadC * -1) + startX - this.X;
			var roadY2 = (Math.cos(segAngleRad) * roadC * 1) + startY - this.Y;

			// get end points of last road to mask clipping area for junction
			var prevEndX1 = (Math.sin(prevAngleRad) * roadC * 1) + startX - this.X;
			var prevEndY1 = (Math.cos(prevAngleRad) * roadC * -1) + startY - this.Y;
			var prevEndX2 = (Math.sin(prevAngleRad) * roadC * -1) + startX - this.X;
			var prevEndY2 = (Math.cos(prevAngleRad) * roadC * 1) + startY - this.Y;
			var xDelta = endX - startX;
			var yDelta = endY - startY;
			var roadEndX1 = roadX1 + xDelta;
			var roadEndY1 = roadY1 + yDelta;
			var roadEndX2 = roadX2 + xDelta;
			var roadEndY2 = roadY2 + yDelta;
/*
			// mask
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(roadEndX1, roadEndY1);
			ctx.lineTo(roadEndX2, roadEndY2);
			ctx.lineTo(prevEndX2 + 100, prevEndY2 + 100);
			ctx.lineTo(prevEndX1 + 100, prevEndY1 + 100);
			ctx.closePath();
			ctx.clip();	
*/
			// road
			ctx.beginPath();
			var roadGradient = ctx.createLinearGradient(roadX1, roadY1, roadX2, roadY2);
			roadGradient.addColorStop(0, '#787878');
			roadGradient.addColorStop(0.15, '#202020');
			roadGradient.addColorStop(0.85, '#202020');
			roadGradient.addColorStop(1, '#787878');
			ctx.strokeStyle = roadGradient;
			ctx.lineWidth = roadW;
			ctx.lineCap = 'round';
			ctx.moveTo(startX - this.X, startY - this.Y);
			ctx.lineTo(endX - this.X, endY - this.Y);
			ctx.stroke();
/*
			ctx.restore();
*/
/*
			// junctions
			var junctionGradient = ctx.createRadialGradient(endX - this.X, endY - this.Y, roadC * 0.7,
									endX - this.X, endY - this.Y, roadC + borderW);
			junctionGradient.addColorStop(0, '#202020');
			junctionGradient.addColorStop(1, '#787878');
			ctx.fillStyle = junctionGradient;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(endX - this.X, endY - this.Y);
			ctx.arc(endX - this.X, endY - this.Y, roadC , segAngleRad + rad90 - 0.02, nextAngleRad + rad90 + 0.02, false);
			ctx.closePath();
			ctx.fill();
*/
			// lane markers YELLOW
			ctx.strokeStyle = '#ffff66';
			ctx.lineWidth = laneW;
			ctx.lineCap = 'butt';
			for (var j = 0; j <= segLength; j += (laneH * 2)){
				ctx.beginPath();
				ctx.moveTo(startX - this.X + (Math.cos(segAngleRad) * sideWay * j),
						startY - this.Y + (Math.sin(segAngleRad) * sideWay * j));
				ctx.lineTo(startX - this.X + (Math.cos(segAngleRad) * sideWay * (j + laneH)),
						startY - this.Y + (Math.sin(segAngleRad) * sideWay * (j + laneH)));
				ctx.stroke();				
			}
	
			// road edge markers RED
			ctx.strokeStyle = '#ff0000';
			ctx.lineWidth = borderW;
			ctx.beginPath();
			ctx.moveTo( (Math.sin(segAngleRad) * (roadC + (borderW / 2)) * 1) + startX - this.X,
					(Math.cos(segAngleRad) * (roadC + (borderW / 2)) * -1) + startY - this.Y );
			ctx.lineTo( (Math.sin(segAngleRad) * (roadC + (borderW / 2)) * 1) + startX - this.X + (endX-startX),
					(Math.cos(segAngleRad) * (roadC + (borderW / 2)) * -1) + startY - this.Y + (endY-startY) );

			ctx.moveTo( (Math.sin(segAngleRad) * (roadC + (borderW / 2)) * -1) + startX - this.X,
					(Math.cos(segAngleRad) * (roadC + (borderW / 2)) * 1) + startY - this.Y );
			ctx.lineTo( (Math.sin(segAngleRad) * (roadC + (borderW / 2)) * -1) + startX - this.X + (endX-startX),
					(Math.cos(segAngleRad) * (roadC + (borderW / 2)) * 1) + startY - this.Y + (endY-startY) );
			ctx.stroke();	

			// WHITE
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = borderW;
			for (var j = 0; j <= segLength; j += (borderH * 2)){
				ctx.beginPath();
				ctx.moveTo( (Math.sin(segAngleRad) * (roadC + (borderW / 2)) * 1) + startX - this.X +
							(Math.cos(segAngleRad) * sideWay * j),
						(Math.cos(segAngleRad) * (roadC + (borderW / 2)) * -1) + startY - this.Y +
							(Math.sin(segAngleRad) * sideWay * j)
				);

				ctx.lineTo( (Math.sin(segAngleRad) * (roadC + (borderW / 2)) * 1) + startX - this.X +
							(Math.cos(segAngleRad) * sideWay * (j + borderH)),
						(Math.cos(segAngleRad) * (roadC + (borderW / 2)) * -1) + startY - this.Y +
							(Math.sin(segAngleRad) * sideWay * (j + borderH))
				);

				ctx.moveTo( (Math.sin(segAngleRad) * (roadC + (borderW / 2)) * -1) + startX - this.X +
							(Math.cos(segAngleRad) * sideWay * j),
						(Math.cos(segAngleRad) * (roadC + (borderW / 2)) * 1) + startY - this.Y +
							(Math.sin(segAngleRad) * sideWay * j)
				);

				ctx.lineTo( (Math.sin(segAngleRad) * (roadC + (borderW / 2)) * -1) + startX - this.X +
							(Math.cos(segAngleRad) * sideWay * (j + borderH)),
						(Math.cos(segAngleRad) * (roadC + (borderW / 2)) * 1) + startY - this.Y +
							(Math.sin(segAngleRad) * sideWay * (j + borderH))
				);

				ctx.stroke();
			}
		}
	}

	// moves the bg image
	this.scroll = function(){
		// HOLY COW, TRIG!
		var acRatio = Math.sin((90 - CAR.bearing) * rad2Deg);
		this.Y -= (acRatio * CAR.speed);
		var bcRatio = Math.cos((90 - CAR.bearing) * rad2Deg);
		this.X += (bcRatio * CAR.speed);	
	}

})();

// ***** object handles player's vehicle
var CAR = new (function(){
	// init icon
	this.image = new Image();
	this.image.src = 'i/car.png';

	// dimensions of car graphic file
	this.width = 66;
	this.height = 94;
	this.initOffset = 200;
	
	// initialize current position (all the way to the bottom of image)
	this.X = (canvasW / 2) - (this.width / 2);
	this.Y = (canvasH - this.height) - this.initOffset;
	
	// rotate angle (temporary, for fun graphic) for turning to bearing (permanent ordinal direction)
	this.angle = 0;
	this.bearing = 0;
	this.gravity = 2;

	// initial speed and range, odometer
	this.speed = 0; // pixels per frame
	this.MAXspeed = 50;
	this.MINspeed = 0;
	this.odo = 0;

	// initial fuel tank
	this.gas = 100;
	this.MAXgas = 100;
	this.MINgas = 0;
	this.burnRate = 0.001; // gas used per frame

	// every frame this car does stuf **** RUNTIME CHANGES ****
	this.newFrame = function(){
		this.odo += this.speed;
		this.gas -= this.burnRate;
		//this.bearing += (this.angle / (this.gravity * 5));


		// BOOM!
		if (this.gas <= 0){
			this.speed = 0;
			requestAnimationFrame = function(){alert("YOU CRASHED!");};
		}
	}

	// draw current portion of image to canvas
	this.draw = function(){
		if (this.angle == 0){
			try {
				ctx.drawImage(this.image, 0, 0, this.width, this.height, this.X, this.Y, this.width, this.height);
			} catch (e) {}
		}
		else {
			try {
				// car is turning, rotate canvas around center of car and redraw graphic at an angle
				ctx.save();
				ctx.translate( (this.X + (this.width / 2)) , (this.Y + (this.height / 2)) );
				ctx.rotate( (Math.PI/180) * this.angle );
				ctx.drawImage(this.image, 0, 0, this.width, this.height, (this.width / -2), (this.height / -2), this.width, this.height);
				ctx.translate( this.X * -1, this.Y * -1);
				ctx.restore();
			} catch (e) {}
			// gradually return car orientation to striaght
			//this.angle += (this.gravity * (this.angle > 0 ? -1 : 1));
			//if (Math.abs(this.angle) < 2)
			//	this.angle = 0;
		}
	}

	// moves the car left or right
	this.turn = function(distance){
		if ( ((this.X + distance) <= (canvasW - this.width)) && ((this.X + distance) >= 0) ){
			//this.X += distance;
			//if ( Math.abs(this.angle) <= 45 )
				this.angle += distance;
				this.bearing = this.angle;
		}
	}

	// moves the car forward and backward
	this.forward = function(gas){
		if ( ((this.speed + gas) <= this.MAXspeed) && ((this.speed + gas) >= this.MINspeed) )
			this.speed += gas;
	}
})();


// ***** runs on page load
$(window).load(function(){
	// init canvas
	c = $("#c")[0];
	c.width = canvasW;
	c.height = canvasH;
	ctx = c.getContext('2d');

	// start arrow keys
	window.onkeydown = function(key){pressKey(key.keyCode)};
	
	// start accelerometer
	window.ondevicemotion = function(event){tiltKey(event)};

	// start touch controls
	$('.pedal').bind('touchstart', function(event){
		$(this).addClass('active');
		touchKey(event);
	}).bind('touchend', function(){
		$(this).removeClass('active');
	});

	// start mouse clicks on game screen
	$('#c').mousedown(function(event){
		clickKey(event);
	});

	// start game
	requestAnimationFrame(function(){gameLoop()});

	// prevent default touch controls
	document.ontouchmove = function(e){ e.preventDefault(); }
});

// ***** redraw canvas
function draw(){
	// clear canvas
	ctx.clearRect(0, 0, canvasW, canvasH);

	// redraw background and car
	BG.draw();
	CAR.draw();

	// update readout
	updateData();
} 

// **************** the game! ****************
function gameLoop(){
	// calculate game data
	CAR.newFrame();
	BG.scroll();

	draw();
	requestAnimationFrame(function(){gameLoop()});
}

// ***** handle keyboard
function pressKey(key){
	switch (key){
	case 37:
		CAR.turn(-10);
		break;
	case 39:
		CAR.turn(10);
		break;
	case 38:
		CAR.forward(1);
		break;
	case 40:
		CAR.forward(-1);
		break;
	}
}

// ***** handle mouse clicks
function clickKey(event){
	var startX = event.offsetX;
	var startY = event.offsetY;

	$(window).bind('mousemove', function(e){
		var mouseX = e.offsetX;
		var mouseY = e.offsetY;
		
		if (Math.abs(mouseX - startX) > 1)
			CAR.turn( 5 * ( (mouseX - startX) > 0 ? 1 : -1 ) );
		if (Math.abs(mouseY - startY) > 1)
			CAR.forward( 1 * ( (mouseY - startY) > 0 ? -1 : 1 ) );
		
		startX = mouseX;
		startY = mouseY;
	});
	$(window).bind('mouseup', function(){
		$(window).unbind('mousemove');
	});
}

// ***** handle pedals on screen
function touchKey(event){
	switch (event.target.dataset.pedal){
	case '0':
		CAR.forward(-1);
		break;
	case '1':
		CAR.forward(1);
		break;
	}
	
	// simulate mouse holding down by recursive calls until finger is lifted up
	var fingerDown = true;
	$("#" + event.target.id).bind('touchend', function(){fingerDown = false});
	setTimeout(function(){
		if (fingerDown)
			touchKey(event);
	}, 100);
}

// ***** handle accelerometer
function tiltKey(event){
	switch (orientation){
	case 90:
		CAR.turn(event.accelerationIncludingGravity.y * -2)
		break;
	case -90:
		CAR.turn(event.accelerationIncludingGravity.y * 2)
		break;
	case 0:
		CAR.turn(event.accelerationIncludingGravity.x * 2)
		break;
	case 180:
		CAR.turn(event.accelerationIncludingGravity.x * -2)
		break;
	}
}

// ***** prints scoring numbers to panel
function updateData(){
	var readout = "Speed: " + CAR.speed + "<br>Angle: " + CAR.angle + "<br>Bearing: " + CAR.bearing.toFixed(3) + "<br>Odometer: " + CAR.odo.toFixed(2) + "<br>Fuel: " + CAR.gas.toFixed(3) + "<br>BG X: " + BG.X.toFixed(3) + "<br>BG Y: " + BG.Y.toFixed(3);
	$("#readout").html(readout);
}
