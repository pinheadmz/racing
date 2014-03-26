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
	[0, -3000],
	[3000, -3000],
	[3000, 0]];

var course = [
	[0, 0],
	[0, -5000],
	[3535, -8535],
	[8535, -8535],
	[12070, -5000],
	[12070, 0],
	[8535, 3535],
	[3535, 3535]];

var course3 = [
	[0, 0],
	[0, -5000],
	[-3535, -8535],
	[-8535, -8535]];

var course6 = [
	[0, 0],
	[3000, -3000],
	[0, -6000],
	[3000, -7000],
	[0, -8000],
	[-3000, -4000]];

// canvas dimensions must match canvas size in css
var canvasW = 700;
var canvasH = 640;

// for easy math
var rad2Deg = Math.PI / 180;

// ***** function returns intersection of two lines http://www.kevlindev.com/gui/math/intersection/Intersection.js
function intersection(a1, a2, b1, b2) {
	var result;
	var ua_t = (b2.x - b1.x) * (a1.y - b1.y) - (b2.y - b1.y) * (a1.x - b1.x);
	var ub_t = (a2.x - a1.x) * (a1.y - b1.y) - (a2.y - a1.y) * (a1.x - b1.x);
	var u_b  = (b2.y - b1.y) * (a2.x - a1.x) - (b2.x - b1.x) * (a2.y - a1.y);

	if ( u_b != 0 ) {
		var ua = ua_t / u_b;
		var ub = ub_t / u_b;

		if ( 0 <= ua && ua <= 1 && 0 <= ub && ub <= 1 ) {
			result = new Array();
			result.push(
				new Array(
					Math.floor(a1.x + ua * (a2.x - a1.x)),
					Math.floor(a1.y + ua * (a2.y - a1.y))
				)
			);
		} else {
			result = false;
		}
	} else {
		if ( ua_t == 0 || ub_t == 0 ) {
			result = false;
		} else {
			result = false;
		}
	}
	return result;
};

// ***** object handles background scrolling
var BG = new (function(){
	// dimensions of visible frame and actual file size
	this.width = 70;
	this.height = 64;
	this.fileHeight = 1040;
	this.fileWidth = 890;
	
	// initialize current position 
	this.X = -350;
	this.Y = -440;

	this.canvas = document.createElement('canvas');
	this.canvas.width = canvasW;
	this.canvas.height = canvasH;
	BGctx = this.canvas.getContext('2d');

	// draws portion of 'visible' course map to on-screen canvas
	this.draw = function(){
		ctx.drawImage(this.canvas, 0, 0, canvasW, canvasH, 0, 0, canvasW, canvasH);
	}

	// draws entire course map to hidden canvas
	this.load = function(){
		var roadW = 500;
		var roadC = roadW / 2;
		var laneW = 20;
		var laneH = 150;
		var borderW = 30;
		var borderH = 40;

		// object stores start and end coordinates for each segment
		var courseCoords = new Array();
		for (var q = 0; q <= (course.length - 1); q++){
			courseCoords[q] = new Object();

			courseCoords[q].startX = course[q][0];	
			courseCoords[q].startY = course[q][1];
			courseCoords[q].endX = course[(q == (course.length - 1)) ? 0 : (q + 1)][0];	
			courseCoords[q].endY = course[(q == (course.length - 1)) ? 0 : (q + 1)][1];

			courseCoords[q].segLength = Math.sqrt(Math.pow((courseCoords[q].endX - courseCoords[q].startX), 2) + Math.pow((courseCoords[q].endY - courseCoords[q].startY), 2));
			courseCoords[q].segAngle = Math.atan((courseCoords[q].endY - courseCoords[q].startY) / (courseCoords[q].endX - courseCoords[q].startX)) * (180 / Math.PI);
			courseCoords[q].segAngleRad = courseCoords[q].segAngle * rad2Deg;

			courseCoords[q].roadX1 = (Math.sin(courseCoords[q].segAngleRad) * roadC * 1) + courseCoords[q].startX - this.X;
			courseCoords[q].roadY1 = (Math.cos(courseCoords[q].segAngleRad) * roadC * -1) + courseCoords[q].startY - this.Y;
			courseCoords[q].roadX2 = (Math.sin(courseCoords[q].segAngleRad) * roadC * -1) + courseCoords[q].startX - this.X;
			courseCoords[q].roadY2 = (Math.cos(courseCoords[q].segAngleRad) * roadC * 1) + courseCoords[q].startY - this.Y;
			var xDelta = courseCoords[q].endX - courseCoords[q].startX;
			var yDelta = courseCoords[q].endY - courseCoords[q].startY;
			courseCoords[q].roadEndX1 = courseCoords[q].roadX1 + xDelta;
			courseCoords[q].roadEndY1 = courseCoords[q].roadY1 + yDelta;
			courseCoords[q].roadEndX2 = courseCoords[q].roadX2 + xDelta;
			courseCoords[q].roadEndY2 = courseCoords[q].roadY2 + yDelta;
		}

		// big green background
		BGctx.fillStyle = '#339933';
		BGctx.fillRect(0,0,this.canvas.width,this.canvas.height);

		// draw each junction of the road
		for (var i = 0; i < course.length; i++){
			var startX = courseCoords[i].startX;	
			var startY = courseCoords[i].startY;

			// ROAD circles
			var junctionGradient = BGctx.createRadialGradient(startX - this.X, startY - this.Y, roadC * 0.7,
				startX - this.X, startY - this.Y, roadC * 1.3);
			junctionGradient.addColorStop(0, '#202020');
			junctionGradient.addColorStop(0.5, '#787878');
			BGctx.fillStyle = junctionGradient;
			BGctx.beginPath();
			BGctx.arc(startX - this.X, startY - this.Y, roadC * 1.1, 0, 2 * Math.PI, false);
			BGctx.fill();
	
			// RED border
			BGctx.strokeStyle = '#ff0000';
			BGctx.lineWidth = borderW;
			BGctx.beginPath();
			BGctx.arc(startX - this.X, startY - this.Y, roadC * 1.06, 0, 2 * Math.PI, false);
			BGctx.stroke();

			// WHITE strokes border
			BGctx.strokeStyle = '#ffffff';
			BGctx.lineWidth = borderW;
			var tinyAngle = Math.tan(borderH / roadC);
			var circumference = (2 * roadC * Math.PI);
			for (var x = 0; x < (circumference / borderH); x += 2){
				BGctx.beginPath();
				BGctx.arc(startX - this.X, startY - this.Y, roadC * 1.06, x * tinyAngle, x * tinyAngle + tinyAngle, false);
				BGctx.stroke();
			}
		}

		// draw each segment of the road
		for (var i = 0; i < course.length; i++){
			var startX = courseCoords[i].startX;	
			var startY = courseCoords[i].startY;	
			var endX = courseCoords[i].endX;	
			var endY = courseCoords[i].endY;
			var sideWay = (endX >= startX) ? 1 : -1;
			var segLength = courseCoords[i].segLength;
			var segAngle = courseCoords[i].segAngle;
			var segAngleRad = courseCoords[i].segAngleRad;

			// find where new road start overlaps with previous road end *********************************************
			var crossPoint = false;
			var crossSide = 1;
			var otherSide = 1;
			var ii = (i > 0) ? (i - 1) : (course.length - 1);
			crossPoint = intersection( {x: courseCoords[i].roadX1, y: courseCoords[i].roadY1}, {x: courseCoords[i].roadEndX1, y: courseCoords[i].roadEndY1},
							{x: courseCoords[ii].roadX1, y: courseCoords[ii].roadY1}, {x: courseCoords[ii].roadEndX1, y: courseCoords[ii].roadEndY1});
			crossSide = 1;
			otherSide = 1;
			if (!crossPoint){
				crossPoint = intersection( {x: courseCoords[i].roadX2, y: courseCoords[i].roadY2}, {x: courseCoords[i].roadEndX2, y: courseCoords[i].roadEndY2},
								{x: courseCoords[ii].roadX2, y: courseCoords[ii].roadY2}, {x: courseCoords[ii].roadEndX2, y: courseCoords[ii].roadEndY2});
				crossSide = 2;
				otherSide = 2;
			}
			if (!crossPoint){
				crossPoint = intersection( {x: courseCoords[i].roadX1, y: courseCoords[i].roadY1}, {x: courseCoords[i].roadEndX1, y: courseCoords[i].roadEndY1},
								{x: courseCoords[ii].roadX2, y: courseCoords[ii].roadY2}, {x: courseCoords[ii].roadEndX2, y: courseCoords[ii].roadEndY2});
				crossSide = 1;
				otherSide = 2;
			}
			if (!crossPoint){
				crossPoint = intersection( {x: courseCoords[i].roadX2, y: courseCoords[i].roadY2}, {x: courseCoords[i].roadEndX2, y: courseCoords[i].roadEndY2},
								{x: courseCoords[ii].roadX1, y: courseCoords[ii].roadY1}, {x: courseCoords[ii].roadEndX1, y: courseCoords[ii].roadEndY1});
				crossSide = 2;
				otherSide = 1;
			}
			if (i == 0){
				var crossPointEnd = crossPoint;
				var crossSideEnd = otherSide;
			}
			// *****************************************************************************************************

			// road
			var roadGradient = BGctx.createLinearGradient(courseCoords[i].roadX1, courseCoords[i].roadY1, courseCoords[i].roadX2, courseCoords[i].roadY2);
			roadGradient.addColorStop(0, '#787878');
			roadGradient.addColorStop(0.15, '#202020');
			roadGradient.addColorStop(0.85, '#202020');
			roadGradient.addColorStop(1, '#787878');
			BGctx.fillStyle = roadGradient;
			BGctx.beginPath();
			if (i == 0){
				BGctx.moveTo(courseCoords[i].roadX1, courseCoords[i].roadY1);
				BGctx.lineTo(courseCoords[i].roadX2, courseCoords[i].roadY2);
				BGctx.lineTo(courseCoords[i].roadEndX2, courseCoords[i].roadEndY2);
				BGctx.lineTo(courseCoords[i].roadEndX1, courseCoords[i].roadEndY1);
				BGctx.closePath();
				BGctx.fill();
			} else	if (i < course.length - 1) {
				if (crossSide == 1){
					BGctx.moveTo(courseCoords[i].startX - this.X, courseCoords[i].startY - this.Y);
					BGctx.lineTo(crossPoint[0][0], crossPoint[0][1]);
					BGctx.lineTo(courseCoords[i].roadEndX1, courseCoords[i].roadEndY1);
					BGctx.lineTo(courseCoords[i].roadEndX2, courseCoords[i].roadEndY2);
					BGctx.lineTo(courseCoords[i].roadX2, courseCoords[i].roadY2);
					BGctx.closePath();
					BGctx.fill();
				} else {
					BGctx.moveTo(courseCoords[i].startX - this.X, courseCoords[i].startY - this.Y);
					BGctx.lineTo(crossPoint[0][0], crossPoint[0][1]);
					BGctx.lineTo(courseCoords[i].roadEndX2, courseCoords[i].roadEndY2);
					BGctx.lineTo(courseCoords[i].roadEndX1, courseCoords[i].roadEndY1);
					BGctx.lineTo(courseCoords[i].roadX1, courseCoords[i].roadY1);
					BGctx.closePath();
					BGctx.fill();
				}
			} else	if (i == course.length - 1) {
				if (crossSide == 1){
					BGctx.moveTo(courseCoords[i].startX - this.X, courseCoords[i].startY - this.Y);
					BGctx.lineTo(crossPoint[0][0], crossPoint[0][1]);
					if (crossSideEnd == 1){
						BGctx.lineTo(crossPointEnd[0][0], crossPointEnd[0][1]);
						BGctx.lineTo(courseCoords[i].endX - this.X, courseCoords[i].endY - this.Y);
						BGctx.lineTo(courseCoords[i].roadEndX2, courseCoords[i].roadEndY2);
						BGctx.lineTo(courseCoords[i].roadX2, courseCoords[i].roadY2);
					} else {
						BGctx.lineTo(courseCoords[i].roadEndX1, courseCoords[i].roadEndY1);
						BGctx.lineTo(courseCoords[i].endX - this.X, courseCoords[i].endY - this.Y);
						BGctx.lineTo(crossPointEnd[0][0], crossPointEnd[0][1]);
						BGctx.lineTo(courseCoords[i].roadX2, courseCoords[i].roadY2);
					}
					BGctx.closePath();
					BGctx.fill();
				} else {
					BGctx.moveTo(courseCoords[i].startX - this.X, courseCoords[i].startY - this.Y);
					BGctx.lineTo(crossPoint[0][0], crossPoint[0][1]);
					if (crossSideEnd == 1){
						BGctx.lineTo(courseCoords[i].roadEndX2, courseCoords[i].roadEndY2);
						BGctx.lineTo(courseCoords[i].endX - this.X, courseCoords[i].endY - this.Y);
						BGctx.lineTo(crossPointEnd[0][0], crossPointEnd[0][1]);
						BGctx.lineTo(courseCoords[i].roadX1, courseCoords[i].roadY1);
					} else {
						BGctx.lineTo(crossPointEnd[0][0], crossPointEnd[0][1]);
						BGctx.lineTo(courseCoords[i].endX - this.X, courseCoords[i].endY - this.Y);
						BGctx.lineTo(courseCoords[i].roadEndX1, courseCoords[i].roadEndY1);
						BGctx.lineTo(courseCoords[i].roadX1, courseCoords[i].roadY1);
					}
					BGctx.closePath();
					BGctx.fill();
				}
			}

			// lane markers YELLOW
			BGctx.strokeStyle = '#ffff66';
			BGctx.lineWidth = laneW;
			for (var j = 0; j <= segLength; j += (laneH * 2)){
				BGctx.beginPath();
				BGctx.moveTo(startX - this.X + (Math.cos(segAngleRad) * sideWay * j),
						startY - this.Y + (Math.sin(segAngleRad) * sideWay * j));
				BGctx.lineTo(startX - this.X + (Math.cos(segAngleRad) * sideWay * (j + laneH)),
						startY - this.Y + (Math.sin(segAngleRad) * sideWay * (j + laneH)));
				BGctx.stroke();				
			}
	
			// road edge markers RED
			BGctx.strokeStyle = '#ff0000';
			BGctx.lineWidth = borderW;
			BGctx.beginPath();
			var RedStartX1 = (crossSide == 1) ? crossPoint[0][0] : courseCoords[i].roadX1;
			var RedStartY1 = (crossSide == 1) ? crossPoint[0][1] : courseCoords[i].roadY1;
			var RedStartX2 = (crossSide == 2) ? crossPoint[0][0] : courseCoords[i].roadX2;
			var RedStartY2 = (crossSide == 2) ? crossPoint[0][1] : courseCoords[i].roadY2;
			var RedEndX1 = ((i == course.length - 1) && (crossSideEnd == 1)) ? crossPointEnd[0][0] : courseCoords[i].roadEndX1;
			var RedEndY1 = ((i == course.length - 1) && (crossSideEnd == 1)) ? crossPointEnd[0][1] : courseCoords[i].roadEndY1;
			var RedEndX2 = ((i == course.length - 1) && (crossSideEnd == 2)) ? crossPointEnd[0][0] : courseCoords[i].roadEndX2;
			var RedEndY2 = ((i == course.length - 1) && (crossSideEnd == 2)) ? crossPointEnd[0][1] : courseCoords[i].roadEndY2;
			BGctx.moveTo(RedStartX1 + (Math.sin(segAngleRad) * (borderW / 2) * 1), RedStartY1 + (Math.cos(segAngleRad) * (borderW / 2) * -1));
			BGctx.lineTo (RedEndX1 + (Math.sin(segAngleRad) * (borderW / 2) * 1), RedEndY1 + (Math.cos(segAngleRad) * (borderW / 2) * -1));
			BGctx.moveTo(RedStartX2 + (Math.sin(segAngleRad) * (borderW / 2) * -1), RedStartY2 + (Math.cos(segAngleRad) * (borderW / 2) * 1));
			BGctx.lineTo (RedEndX2 + (Math.sin(segAngleRad) * (borderW / 2) * -1), RedEndY2 + (Math.cos(segAngleRad) * (borderW / 2) * 1));
			BGctx.stroke();	

			// WHITE
			whiteLength1 = Math.sqrt(Math.pow((RedEndX1 - RedStartX1), 2) + Math.pow((RedEndY1 - RedStartY1), 2));
			whiteLength2 = Math.sqrt(Math.pow((RedEndX2 - RedStartX2), 2) + Math.pow((RedEndY2 - RedStartY2), 2));
			BGctx.strokeStyle = '#ffffff';
			BGctx.lineWidth = borderW;
			for (var j = 0; j <= whiteLength1; j += (borderH * 2)){
				BGctx.beginPath();
				BGctx.moveTo( RedStartX1 + (Math.sin(segAngleRad) * (borderW / 2) * 1) +
							(Math.cos(segAngleRad) * sideWay * j),
						RedStartY1 + (Math.cos(segAngleRad) * (borderW / 2) * -1) +
							(Math.sin(segAngleRad) * sideWay * j)
				);

				BGctx.lineTo( RedStartX1 + (Math.sin(segAngleRad) * (borderW / 2) * 1) +
							(Math.cos(segAngleRad) * sideWay * (j + borderH)),
						RedStartY1 + (Math.cos(segAngleRad) * (borderW / 2) * -1) +
							(Math.sin(segAngleRad) * sideWay * (j + borderH))
				);
				BGctx.stroke();
			}
			for (var j = 0; j <= whiteLength2; j += (borderH * 2)){
				BGctx.moveTo( RedStartX2 + (Math.sin(segAngleRad) * (borderW / 2) * -1) +
							(Math.cos(segAngleRad) * sideWay * j),
						RedStartY2 + (Math.cos(segAngleRad) * (borderW / 2) * 1) +
							(Math.sin(segAngleRad) * sideWay * j)
				);

				BGctx.lineTo( RedStartX2 + (Math.sin(segAngleRad) * (borderW / 2) * -1) +
							(Math.cos(segAngleRad) * sideWay * (j + borderH)),
						RedStartY2 + (Math.cos(segAngleRad) * (borderW / 2) * 1) +
							(Math.sin(segAngleRad) * sideWay * (j + borderH))
				);
				BGctx.stroke();
			}
		}
		// start game once BG load is done
		requestAnimationFrame(function(){gameLoop()});
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
	//requestAnimationFrame(function(){gameLoop()});
	BG.load();

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
	var readout = "Speed: " + CAR.speed + "<br>Angle: " + CAR.angle + "<br>Bearing: " + CAR.bearing.toFixed(3) + "<br>Odometer: " + CAR.odo.toFixed(2) + "<br>Fuel: " + CAR.gas.toFixed(3) + "<br>Car X: " + (BG.X + 350).toFixed(3) + "<br>Car Y: " + (BG.Y + 440).toFixed(3);
	$("#readout").html(readout);
}
