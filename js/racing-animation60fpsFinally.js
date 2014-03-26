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
var course1 = [
	[0, 0],
	[0, -5000],
	[3535, -8535],
	[8535, -8535],
	[12070, -5000],
	[12070, 0],
	[8535, 3535],
	[3535, 3535]];


var course = [
	[0, 0],
	[500, -600],
	[0, -1200],
	[0, -2000],
	[-1000, -1800],
	[-1000, -800],
	[-1500, 0]];

// canvas dimensions must match canvas size in css
var canvasW = 700;
var canvasH = 640;
var roadW = 500;
var roadC = roadW / 2;

// for easy math
var rad2Deg = Math.PI / 180;

// object stores start and end coordinates for each segment
var courseCoords = new Array();
for (var q = 0; q <= (course.length - 1); q++){
	courseCoords[q] = new Object();
	courseCoords[q].startX = course[q][0];	
	courseCoords[q].startY = course[q][1];
	courseCoords[q].endX = course[(q == (course.length - 1)) ? 0 : (q + 1)][0];	
	courseCoords[q].endY = course[(q == (course.length - 1)) ? 0 : (q + 1)][1];

	courseCoords[q].segLength = Math.sqrt(Math.pow((courseCoords[q].endX - courseCoords[q].startX), 2) +
					Math.pow((courseCoords[q].endY - courseCoords[q].startY), 2));
	courseCoords[q].segAngle = Math.atan((courseCoords[q].endY - courseCoords[q].startY) /
					(courseCoords[q].endX - courseCoords[q].startX)) * (180 / Math.PI);
	courseCoords[q].segAngleRad = courseCoords[q].segAngle * rad2Deg;

	courseCoords[q].roadX1 = (Math.sin(courseCoords[q].segAngleRad) * roadC * 1) + courseCoords[q].startX;
	courseCoords[q].roadY1 = (Math.cos(courseCoords[q].segAngleRad) * roadC * -1) + courseCoords[q].startY;
	courseCoords[q].roadX2 = (Math.sin(courseCoords[q].segAngleRad) * roadC * -1) + courseCoords[q].startX;
	courseCoords[q].roadY2 = (Math.cos(courseCoords[q].segAngleRad) * roadC * 1) + courseCoords[q].startY;
	var xDelta = courseCoords[q].endX - courseCoords[q].startX;
	var yDelta = courseCoords[q].endY - courseCoords[q].startY;
	courseCoords[q].roadEndX1 = courseCoords[q].roadX1 + xDelta;
	courseCoords[q].roadEndY1 = courseCoords[q].roadY1 + yDelta;
	courseCoords[q].roadEndX2 = courseCoords[q].roadX2 + xDelta;
	courseCoords[q].roadEndY2 = courseCoords[q].roadY2 + yDelta;
}

// add overlap junciton information to coordinates object
for (var i = 0; i <= (course.length - 1); i++){
	var ii = (i > 0) ? (i - 1) : (course.length - 1);
	var otherSide;
	courseCoords[i].crossPoint = intersection( {x: courseCoords[i].roadX1, y: courseCoords[i].roadY1},
					{x: courseCoords[i].roadEndX1, y: courseCoords[i].roadEndY1},
					{x: courseCoords[ii].roadX1, y: courseCoords[ii].roadY1},
					{x: courseCoords[ii].roadEndX1, y: courseCoords[ii].roadEndY1});
	courseCoords[i].crossSide = 1;
	otherSide = 1;
	if (!courseCoords[i].crossPoint){
		courseCoords[i].crossPoint = intersection( {x: courseCoords[i].roadX2, y: courseCoords[i].roadY2},
						{x: courseCoords[i].roadEndX2, y: courseCoords[i].roadEndY2},
						{x: courseCoords[ii].roadX2, y: courseCoords[ii].roadY2},
						{x: courseCoords[ii].roadEndX2, y: courseCoords[ii].roadEndY2});
		courseCoords[i].crossSide = 2;
		otherSide = 2;
	}
	if (!courseCoords[i].crossPoint){
		courseCoords[i].crossPoint = intersection( {x: courseCoords[i].roadX1, y: courseCoords[i].roadY1},
						{x: courseCoords[i].roadEndX1, y: courseCoords[i].roadEndY1},
						{x: courseCoords[ii].roadX2, y: courseCoords[ii].roadY2},
						{x: courseCoords[ii].roadEndX2, y: courseCoords[ii].roadEndY2});
		courseCoords[i].crossSide = 1;
		otherSide = 2;
	}
	if (!courseCoords[i].crossPoint){
		courseCoords[i].crossPoint = intersection( {x: courseCoords[i].roadX2, y: courseCoords[i].roadY2},
						{x: courseCoords[i].roadEndX2, y: courseCoords[i].roadEndY2},
						{x: courseCoords[ii].roadX1, y: courseCoords[ii].roadY1},
						{x: courseCoords[ii].roadEndX1, y: courseCoords[ii].roadEndY1});
		courseCoords[i].crossSide = 2;
		otherSide = 1;
	}
	if (i == 0){
		courseCoords[ii].crossPointEnd = courseCoords[i].crossPoint;
		courseCoords[ii].crossSideEnd = otherSide;
	}
}

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
	
	// store all graphics variables in object so memory gets recycled
	this.canvasC = canvasW / 2;
	this.centerX = 0;
	this.centerY = 0;
	this.laneW = 20;
	this.laneH = 150;
	this.borderW = 30;
	this.borderH = 40;

	// draw current portion of image to canvas
	this.draw = function(){
		this.centerX = this.canvasC + this.X;
		this.centerY = (canvasH / 2) + this.Y;

		// big green background
		ctx.fillStyle = '#339933';
		ctx.fillRect(0,0,canvasW,canvasH);

		// draw each junction of the road
		for (var i = 0; i < course.length; i++){
			this.startX = courseCoords[i].startX;	
			this.startY = courseCoords[i].startY;

			// ***** check distance from junction before doing any more calcualtions ******
			this.distToRoad = Math.sqrt(Math.pow((this.centerX - this.startX),2) + Math.pow((this.centerY - this.startY),2));
			if (this.distToRoad > this.canvasC + roadC + this.borderW)
				continue;
			// **********************************************************************************

			// ROAD circles
			var junctionGradient = ctx.createRadialGradient(this.startX - this.X, this.startY - this.Y, roadC * 0.7,
										this.startX - this.X, this.startY - this.Y, roadC * 1.3);
			junctionGradient.addColorStop(0, '#202020');
			junctionGradient.addColorStop(0.5, '#787878');
			ctx.fillStyle = junctionGradient;
			ctx.beginPath();
			ctx.arc(this.startX - this.X, this.startY - this.Y, roadC * 1.1, 0, 2 * Math.PI, false);
			ctx.fill();
	
			// RED border
			ctx.strokeStyle = '#ff0000';
			ctx.lineWidth = this.borderW;
			ctx.beginPath();
			ctx.arc(this.startX - this.X, this.startY - this.Y, roadC * 1.06, 0, 2 * Math.PI, false);
			ctx.stroke();

			// WHITE strokes border
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = this.borderW;
			var tinyAngle = Math.tan(this.borderH / roadC);
			var circumference = (2 * roadC * Math.PI);
			for (var x = 0; x < (circumference / this.borderH); x += 2){
				ctx.beginPath();
				ctx.arc(this.startX - this.X, this.startY - this.Y, roadC * 1.06, x * tinyAngle, x * tinyAngle + tinyAngle, false);
				ctx.stroke();
			}
		}

		// draw each segment of the road
		for (var i = 0; i < course.length; i++){
			this.startX = courseCoords[i].startX;	
			this.startY = courseCoords[i].startY;	
			this.endX = courseCoords[i].endX;	
			this.endY = courseCoords[i].endY;
			this.sideWay = (this.endX >= this.startX) ? 1 : -1;
			this.segLength = courseCoords[i].segLength;
			this.segAngle = courseCoords[i].segAngle;
			this.segAngleRad = courseCoords[i].segAngleRad;

			// ***** check distance from road segment before doing any more calcualtions ******
			this.aLen = Math.sqrt(Math.pow((this.endX-this.centerX),2) + Math.pow((this.endY-this.centerY),2));
			this.bLen = Math.sqrt(Math.pow((this.centerX-this.startX),2) + Math.pow((this.centerY-this.startY),2));
			this.cLen = Math.sqrt(Math.pow((this.endX-this.startX),2) + Math.pow((this.endY-this.startY),2));
			this.Aangle = Math.acos( ((this.bLen*this.bLen) + (this.cLen*this.cLen) - (this.aLen*this.aLen)) / (2 * this.bLen * this.cLen) );
			this.distToRoad = Math.sin(this.Aangle) * this.bLen;
			if (this.distToRoad > this.canvasC + roadC + this.borderW)
				continue;
			// *********************************************************************************

			this.startX = courseCoords[i].startX - this.X;
			this.startY = courseCoords[i].startY - this.Y;
			this.endX = courseCoords[i].endX - this.X;
			this.endY = courseCoords[i].endY - this.Y;
			this.roadX1 = courseCoords[i].roadX1 - this.X;
			this.roadY1 = courseCoords[i].roadY1 - this.Y;
			this.roadX2 = courseCoords[i].roadX2 - this.X;
			this.roadY2 = courseCoords[i].roadY2 - this.Y;
			this.roadEndX1 = courseCoords[i].roadEndX1 - this.X;
			this.roadEndY1 = courseCoords[i].roadEndY1 - this.Y;
			this.roadEndX2 = courseCoords[i].roadEndX2 - this.X;
			this.roadEndY2 = courseCoords[i].roadEndY2 - this.Y;
			this.crossPointX = courseCoords[i].crossPoint[0][0] - this.X;
			this.crossPointY = courseCoords[i].crossPoint[0][1] - this.Y;
			this.crossSide = courseCoords[i].crossSide;
			this.crossPointEndX = courseCoords[course.length - 1].crossPointEnd[0][0] - this.X;
			this.crossPointEndY = courseCoords[course.length - 1].crossPointEnd[0][1] - this.Y;
			this.crossSideEnd = courseCoords[course.length - 1].crossSideEnd;

			// road
			this.roadGradient = ctx.createLinearGradient(this.roadX1, this.roadY1, this.roadX2, this.roadY2);
			this.roadGradient.addColorStop(0, '#787878');
			this.roadGradient.addColorStop(0.15, '#202020');
			this.roadGradient.addColorStop(0.85, '#202020');
			this.roadGradient.addColorStop(1, '#787878');
			ctx.fillStyle = this.roadGradient;
			ctx.beginPath();
			if (i == 0){
				ctx.moveTo(this.roadX1, this.roadY1);
				ctx.lineTo(this.roadX2, this.roadY2);
				ctx.lineTo(this.roadEndX2, this.roadEndY2);
				ctx.lineTo(this.roadEndX1, this.roadEndY1);
				ctx.closePath();
				ctx.fill();
			} else	if (i < course.length - 1) {
				if (this.crossSide == 1){
					ctx.moveTo(this.startX, this.startY);
					ctx.lineTo(this.crossPointX, this.crossPointY);
					ctx.lineTo(this.roadEndX1, this.roadEndY1);
					ctx.lineTo(this.roadEndX2, this.roadEndY2);
					ctx.lineTo(this.roadX2, this.roadY2);
					ctx.closePath();
					ctx.fill();
				} else {
					ctx.moveTo(this.startX, this.startY);
					ctx.lineTo(this.crossPointX, this.crossPointY);
					ctx.lineTo(this.roadEndX2, this.roadEndY2);
					ctx.lineTo(this.roadEndX1, this.roadEndY1);
					ctx.lineTo(this.roadX1, this.roadY1);
					ctx.closePath();
					ctx.fill();
				}
			} else if (i == course.length - 1) {
				if (this.crossSide == 1){
					ctx.moveTo(this.startX, this.startY);
					ctx.lineTo(this.crossPointX, this.crossPointY);
					if (this.crossSideEnd == 1){
						ctx.lineTo(this.crossPointEndX, this.crossPointEndY);
						ctx.lineTo(this.endX, this.endY);
						ctx.lineTo(this.roadEndX2, this.roadEndY2);
						ctx.lineTo(this.roadX2, this.roadY2);
					} else {
						ctx.lineTo(this.roadEndX1, this.roadEndY1);
						ctx.lineTo(this.endX, this.endY);
						ctx.lineTo(this.crossPointEndX, this.crossPointEndY);
						ctx.lineTo(this.roadX2, this.roadY2);
					}
					ctx.closePath();
					ctx.fill();
				} else {
					ctx.moveTo(this.startX, this.startY);
					ctx.lineTo(this.crossPointX, this.crossPointY);
					if (this.crossSideEnd == 1){
						ctx.lineTo(this.roadEndX2, this.roadEndY2);
						ctx.lineTo(this.endX, this.endY);
						ctx.lineTo(this.crossPointEndX, this.crossPointEndY);
						ctx.lineTo(this.roadX1, this.roadY1);
					} else {
						ctx.lineTo(this.crossPointEndX, this.crossPointEndY);
						ctx.lineTo(this.endX, this.endY);
						ctx.lineTo(this.roadEndX1, this.roadEndY1);
						ctx.lineTo(this.roadX1, this.roadY1);
					}
					ctx.closePath();
					ctx.fill();
				}
			}

			// lane markers YELLOW
			ctx.strokeStyle = '#ffff66';
			ctx.lineWidth = this.laneW;
			for (var j = 0; j <= this.segLength; j += (this.laneH * 2)){
				this.yellowX1 = this.startX + (Math.cos(this.segAngleRad) * this.sideWay * j);
				this.yellowY1 = this.startY + (Math.sin(this.segAngleRad) * this.sideWay * j);
				this.yellowX2 = this.startX + (Math.cos(this.segAngleRad) * this.sideWay * (j + this.laneH));
				this.yellowY2 = this.startY + (Math.sin(this.segAngleRad) * this.sideWay * (j + this.laneH));

				// ****************** don't draw out of bounds ***************
				this.distToRoad = Math.sqrt(Math.pow((this.centerX - this.yellowX1 - this.X),2) +
							Math.pow((this.centerY - this.yellowY1 - this.Y),2));
				if (this.distToRoad > this.canvasC + (this.laneH * 2))
					continue;
				// ***********************************************************

				ctx.beginPath();
				ctx.moveTo(this.yellowX1, this.yellowY1);
				ctx.lineTo(this.yellowX2, this.yellowY2);
				ctx.stroke();				
			}
	
			// road edge markers RED
			ctx.strokeStyle = '#ff0000';
			ctx.lineWidth = this.borderW;
			ctx.beginPath();
			this.RedStartX1 = (this.crossSide == 1) ? this.crossPointX : this.roadX1;
			this.RedStartY1 = (this.crossSide == 1) ? this.crossPointY : this.roadY1;
			this.RedStartX2 = (this.crossSide == 2) ? this.crossPointX : this.roadX2;
			this.RedStartY2 = (this.crossSide == 2) ? this.crossPointY : this.roadY2;
			this.RedEndX1 = ((i == course.length - 1) && (this.crossSideEnd == 1)) ? this.crossPointEndX : this.roadEndX1;
			this.RedEndY1 = ((i == course.length - 1) && (this.crossSideEnd == 1)) ? this.crossPointEndY : this.roadEndY1;
			this.RedEndX2 = ((i == course.length - 1) && (this.crossSideEnd == 2)) ? this.crossPointEndX : this.roadEndX2;
			this.RedEndY2 = ((i == course.length - 1) && (this.crossSideEnd == 2)) ? this.crossPointEndY : this.roadEndY2;
			ctx.moveTo(this.RedStartX1 + (Math.sin(this.segAngleRad) * (this.borderW / 2) * 1),
							this.RedStartY1 + (Math.cos(this.segAngleRad) * (this.borderW / 2) * -1));
			ctx.lineTo (this.RedEndX1 + (Math.sin(this.segAngleRad) * (this.borderW / 2) * 1),
							this.RedEndY1 + (Math.cos(this.segAngleRad) * (this.borderW / 2) * -1));
			ctx.moveTo(this.RedStartX2 + (Math.sin(this.segAngleRad) * (this.borderW / 2) * -1),
							this.RedStartY2 + (Math.cos(this.segAngleRad) * (this.borderW / 2) * 1));
			ctx.lineTo (this.RedEndX2 + (Math.sin(this.segAngleRad) * (this.borderW / 2) * -1),
							this.RedEndY2 + (Math.cos(this.segAngleRad) * (this.borderW / 2) * 1));
			ctx.stroke();	

			// WHITE
			this.whiteLength1 = Math.sqrt(Math.pow((this.RedEndX1 - this.RedStartX1), 2) + Math.pow((this.RedEndY1 - this.RedStartY1), 2));
			this.whiteLength2 = Math.sqrt(Math.pow((this.RedEndX2 - this.RedStartX2), 2) + Math.pow((this.RedEndY2 - this.RedStartY2), 2));
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = this.borderW;
			for (var j = 0; j <= this.whiteLength1; j += (this.borderH * 2)){
				this.whiteX1 = this.RedStartX1 + (Math.sin(this.segAngleRad) * (this.borderW / 2) * 1) +
							(Math.cos(this.segAngleRad) * this.sideWay * j);
				this.whiteY1 = this.RedStartY1 + (Math.cos(this.segAngleRad) * (this.borderW / 2) * -1) +
							(Math.sin(this.segAngleRad) * this.sideWay * j);
				this.whiteX2 = this.RedStartX1 + (Math.sin(this.segAngleRad) * (this.borderW / 2) * 1) +
							(Math.cos(this.segAngleRad) * this.sideWay * (j + this.borderH));
				this.whiteY2 = this.RedStartY1 + (Math.cos(this.segAngleRad) * (this.borderW / 2) * -1) +
							(Math.sin(this.segAngleRad) * this.sideWay * (j + this.borderH));

				// ****************** don't draw out of bounds ***************
				this.distToRoad = Math.sqrt(Math.pow((this.centerX - this.whiteX1 - this.X),2) +
							Math.pow((this.centerY - this.whiteY1 - this.Y),2));
				if (this.distToRoad > this.canvasC + (this.borderH * 4))
					continue;
				// ***********************************************************

				ctx.beginPath();
				ctx.moveTo(this.whiteX1, this.whiteY1);
				ctx.lineTo(this.whiteX2,this.whiteY2);
				ctx.stroke();
			}
			for (var j = 0; j <= this.whiteLength2; j += (this.borderH * 2)){
				this.whiteX1 = this.RedStartX2 + (Math.sin(this.segAngleRad) * (this.borderW / 2) * -1) +
							(Math.cos(this.segAngleRad) * this.sideWay * j);
				this.whiteY1 = this.RedStartY2 + (Math.cos(this.segAngleRad) * (this.borderW / 2) * 1) +
							(Math.sin(this.segAngleRad) * this.sideWay * j);
				this.whiteX2 = this.RedStartX2 + (Math.sin(this.segAngleRad) * (this.borderW / 2) * -1) +
							(Math.cos(this.segAngleRad) * this.sideWay * (j + this.borderH));
				this.whiteY2 = this.RedStartY2 + (Math.cos(this.segAngleRad) * (this.borderW / 2) * 1) +
							(Math.sin(this.segAngleRad) * this.sideWay * (j + this.borderH));

				// ****************** don't draw out of bounds ***************
				this.distToRoad = Math.sqrt(Math.pow((this.centerX - this.whiteX1 - this.X),2) +
							Math.pow((this.centerY - this.whiteY1 - this.Y),2));
				if (this.distToRoad > this.canvasC + (this.borderH * 4))
					continue;
				// ***********************************************************

				ctx.beginPath();
				ctx.moveTo(this.whiteX1, this.whiteY1);
				ctx.lineTo(this.whiteX2,this.whiteY2);
				ctx.stroke();
			}
		}
	}

	// moves the bg image
	this.scroll = function(){
		// HOLY COW, TRIG!
		this.acRatio = Math.sin((90 - CAR.bearing) * rad2Deg);
		this.Y -= Math.floor(this.acRatio * CAR.speed);
		this.bcRatio = Math.cos((90 - CAR.bearing) * rad2Deg);
		this.X += Math.floor(this.bcRatio * CAR.speed);	
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
	this.X = Math.floor((canvasW / 2) - (this.width / 2));
	this.Y = Math.floor((canvasH - this.height) - this.initOffset);
	
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
			CAR.turn( 10 * ( (mouseX - startX) > 0 ? 1 : -1 ) );
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
var readoutData;
function updateData(){
	readoutData = "Speed: " + CAR.speed + "<br>Angle: " + CAR.angle + "<br>Bearing: " + CAR.bearing.toFixed(3) + "<br>Odometer: " + CAR.odo.toFixed(2) + "<br>Fuel: " + CAR.gas.toFixed(3) + "<br>Car X: " + (BG.X + 350).toFixed(3) + "<br>Car Y: " + (BG.Y + 440).toFixed(3);
	document.getElementById('readout').innerHTML = readoutData;
}
