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
var RUN = false;
var startComplete = false;

var course = [];
var courseCoords;
var courses = [
	[[0, 0],
	[0, -1000],
	[-1000, -2000],
	[-1000, -3000],
	[2000, -3000],
	[6000, 1000],
	[6000, -3000],
	[8000, -3000],
	[12000, -1000],
	[8000, 2000],
	[4000, 2000],
	[4000, 4000],
	[2000, 6000]
	],
	[
	[0, 0],
	[0, -5000],
	[3535, -8535],
	[8535, -8535],
	[12070, -5000],
	[12070, 0],
	[8535, 3535],
	[3535, 3535]
	],
	[
	[0, 0],
	[0,  -1000],
	[1000, -1000],
	[1000, 0],
	[2000, 0],
	[1000, 1000]
	]];

// canvas dimensions must match canvas size in css
var canvasW = 700;
var canvasH = 640;
var roadW = 500;
var roadC = roadW / 2;

// for easy math
var rad2Deg = Math.PI / 180;

function initCourse(){

	// object stores start and end coordinates for each segment
	courseCoords = new Array();
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

// handles little map in corner
var MAPobject = function(){
	this.mapCanvas = $('#map')[0];
	this.mapCanvas.width = 200;
	this.mapCanvas.height = 200;
	this.mapctx = this.mapCanvas.getContext('2d');

	this.mapLocCanvas = $('#mapLoc')[0];
	this.mapLocCanvas.width = 200;
	this.mapLocCanvas.height = 200;
	this.mapLocctx = this.mapLocCanvas.getContext('2d');

	this.offset = 20;

	// draw tiny version of full course on map
	this.minX = (function(){
		var minX = 99999999;
		for (var i = 0; i < course.length; i++){
			minX = Math.min(minX, course[i][0]);
		}
		return minX;
	})();
	this.maxX = (function(){
		var maxX = -99999999;
		for (var i = 0; i < course.length; i++){
			maxX = Math.max(maxX, course[i][0]);
		}
		return maxX;
	})();
	this.minY = (function(){
		var minY = 99999999;
		for (var i = 0; i < course.length; i++){
			minY = Math.min(minY, course[i][1]);
		}
		return minY;
	})();
	this.maxY = (function(){
		var maxY= -99999999;
		for (var i = 0; i < course.length; i++){
			maxY = Math.max(maxY, course[i][1]);
		}
		return maxY;
	})();

	var bigSide = Math.max((this.maxX - this.minX), (this.maxY - this.minY));
	var factor = (this.mapCanvas.width - this.offset) / bigSide
	var xOff = (this.maxX - this.minX) >= (this.maxY - this.minY) ? 0 : ((this.maxX - this.minX) - (this.maxY - this.minY)) / -2;
	var yOff = (this.maxY - this.minY) >= (this.maxX - this.minX) ? 0 : ((this.maxY - this.minY) - (this.maxX - this.minX)) / -2;
	xOff *= factor;
	yOff *= factor;
	xOff += this.offset / 2;
	yOff += this.offset / 2;

	// draw lines to scale!
	this.mapctx.strokeStyle = 'black';
	this.mapctx.lineWidth = 10;
	this.mapctx.lineJoin = 'round';
	this.mapctx.beginPath();
	this.mapctx.moveTo((course[0][0] * factor) - (this.minX * factor) + xOff, (course[0][1] * factor) - (this.minY * factor) + yOff);

	for (var i = 1; i < course.length; i++)
		this.mapctx.lineTo((course[i][0] * factor) - (this.minX * factor) + xOff, (course[i][1] * factor) - (this.minY * factor) + yOff);

	this.mapctx.closePath();
	this.mapctx.stroke();

	// update car location on map!
	this.draw = function(){
		this.mapLocctx.clearRect(0,0,this.mapLocCanvas.width,this.mapLocCanvas.height);
		
		// indicate car location
		this.mapLocctx.fillStyle = 'red';
		this.mapLocctx.fillRect((BG.centerX * factor) - (this.minX * factor) + xOff, (BG.centerY * factor)  - (this.minY * factor) + yOff - 7 , 10, 10);

		// indicate cleared checkpoints
		for (var i = 0; i < course.length; i++){
			if (courseCoords[i].checkpoint){
				this.mapLocctx.fillStyle = 'yellow';
				this.mapLocctx.fillRect((course[i][0] * factor) - (this.minX * factor) + xOff,
							(course[i][1] * factor)  - (this.minY * factor) + yOff - 7 , 5, 5);
			}
		}
	}
}






// handles gas cans!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
var GASobject = function(){
	this.MAXcans = 2; // number on screen at any time
	this.fuel = 10; // amount of gas added when picked up
	this.easy = 5; // from 1 (hardest) to 10 (easiest) probability of getting a 'good' gas can

	// init canvas
	this.gasCanvas = document.createElement('canvas');
	this.imageWidth = 130;
	this.gasCanvas.width = this.imageWidth * this.MAXcans;
	this.gasCanvas.height = 100;
	this.ctx = this.gasCanvas.getContext('2d');

	// load gas can image
	this.img = new Image();
	this.img.src = 'i/can.png';
	
	// variables and art styles for writing numbner on gas can
	this.ctx.fillStyle = "black";
	this.ctx.font = "normal 60px monospace";
	this.key = 0;

	// matrix of can locations and values
	this.list = new Array();
	
	// variables to flash good/bad colors at user
	this.good = false;
	this.bad = false;
	this.goodColor = 0;
	this.badColor = 0;

	// choose a key number for this level
	this.setKey = function(){
		this.keyC =	$('#keyC');

		this.key = Math.floor(Math.random() * 9) + 1;
		$('#key').html(this.key);

		// build first batch of cans
		for (var i = 0; i < this.MAXcans; i++){
			this.build(i);
		}
	}

	// draws all gas cans in offline canvas
	this.build= function(which){
		this.ctx.clearRect(this.imageWidth * which, 0, this.imageWidth, this.gasCanvas.height);
		this.ctx.drawImage(this.img, 0, 0, this.imageWidth, this.gasCanvas.height,
							this.imageWidth * which, 0, this.imageWidth, this.gasCanvas.height);
		
		// choose good or evil and then pick a number
		var winner = Math.floor(Math.random() * 10) + 1 <= this.easy ? true : false;
			if (this.key == 1)
				winner = true;
		var factor = Math.floor(Math.random() * 9) + 1;
		this.value = 0;
		if (winner){
			this.value = factor * this.key;
		} else {
			do {
				this.value = (Math.floor(Math.random() * 9) + 1) * (Math.floor(Math.random() * 9) + 1);
			} while (this.value % this.key == 0);
		}

		// add number to graphic
		var x = this.value > 9 ? 40 : 60;
		this.ctx.fillText(this.value, x + (this.imageWidth * which), 85);
		
		// draw it somewhere off-screen to start
		var absDir = CAR.bearing % 360;
		if (absDir > 45 && absDir < 135){		
			var locX = BG.X + canvasW + 100;
			var locY = BG.Y + Math.floor(Math.random() * canvasH);
		} else if (absDir > 135 && absDir < 225){		
			var locY = BG.Y + canvasH + 100;
			var locX = BG.X + Math.floor(Math.random() * canvasW);
		} else if (absDir > 225 && absDir < 315){		
			var locX = BG.X - 100;
			var locY = BG.Y + Math.floor(Math.random() * canvasH);
		} else {		
			var locY = BG.Y - 100;
			var locX = BG.X + Math.floor(Math.random() * canvasW);
		}
		
		// store value, xy coordinates, 'has it been seen yet', and if its a WINNER
		this.list[which] = [this.value, locX, locY, false, winner];		
	}

	// copies gas can graphics to main canvas
	this.draw = function(){	
		for (var i = 0; i <= this.list.length - 1; i++){
			// ***** check distance from can before doing any more calcualtions ******
			this.distToCan = Math.sqrt(Math.pow((BG.centerX - (this.list[i][1] + (this.imageWidth / 2)) ),2) +
								Math.pow((BG.centerY - (this.list[i][2] + (this.gasCanvas.height / 2)) ),2));
			if ((this.distToCan > BG.canvasC + 100) && (this.list[i][3] === true)){
				this.build(i); // ALSO replace cans that have been seen AND are too far away
				continue;
			} if (this.distToCan > 1000){
				this.build(i); // replace cans that are just way too far away
				continue;
			} else if (this.distToCan > BG.canvasC + 100)
				continue;
			// **********************************************************************************

			ctx.drawImage(this.gasCanvas, this.imageWidth * i, 0, this.imageWidth, this.gasCanvas.height,
					this.list[i][1] - BG.X, this.list[i][2] - BG.Y, this.imageWidth, this.gasCanvas.height);
			this.list[i][3] = true;

			// get gas! or lose gas!!
			if (this.distToCan < (CAR.height / 2) ){
				if (this.list[i][4]){
					this.build(i); // can disappears
					CAR.gas = Math.min(CAR.gas + this.fuel, CAR.MAXgas);
					this.good = true;
					this.bad = false;
				} else {
					this.build(i); // can disappears
					CAR.gas -= this.fuel;
					this.good = false;
					this.bad = true;
				}
			}
		}

		// handle key background color for good and bad colisions
		if (this.good){
			this.goodColor = 256;
			this.badColor = 0;
			this.good = false;
		}
		if (this.bad){
			this.goodColor = 0;
			this.badColor = 256;
			this.bad = false;
		}
		// fade colors out
		if (this.goodColor > 0 || this.badColor > 0){
			this.goodColor = Math.max(0, this.goodColor - 5);
			this.badColor = Math.max(0, this.badColor - 5);
			
			this.keyC.css({'background-color' : 'rgb(' + this.badColor + ',' + this.goodColor + ', 0)'});
		}

	}


};
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


// ***** object handles background scrolling
var BG = new (function(){
	// dimensions of visible frame and actual file size
	this.width = 70;
	this.height = 64;
	this.fileHeight = 1040;
	this.fileWidth = 890;
	
	// initialize current position
	this.initX = -350;
	this.initY = -440
	this.X = this.initX;
	this.Y = this.initY;
	
	// store all graphics variables in object so memory gets recycled
	this.canvasC = canvasW / 2;
	this.centerX = 0;
	this.centerY = 0;
	this.laneW = 20;
	this.laneH = 150;
	this.borderW = 30;
	this.borderH = 40;
	this.closestRoad = 10000;

	// store image of starting line
	this.startingLinePatternImage = new Image();
	this.startingLinePatternImage.src = 'i/checkered.jpg';

	// store bitmap for road junctions so draw it once only
	// init canvas
	this.junctionCanvas = document.createElement('canvas');
	this.junctionCanvas.width = roadW + (this.borderW * 2);
	this.junctionCanvas.height = roadW + (this.borderW * 2);
	this.junctx = this.junctionCanvas.getContext('2d');
	// ROAD circles
	var junctionGradient = this.junctx.createRadialGradient((this.junctionCanvas.width / 2), (this.junctionCanvas.height / 2), roadC * 0.7,
								(this.junctionCanvas.width / 2), (this.junctionCanvas.height / 2), roadC * 1.3);
	junctionGradient.addColorStop(0, '#202020');
	junctionGradient.addColorStop(0.5, '#787878');
	this.junctx.fillStyle = junctionGradient;
	this.junctx.beginPath();
	this.junctx.arc((this.junctionCanvas.width / 2), (this.junctionCanvas.height / 2), roadC * 1.1, 0, 2 * Math.PI, false);
	this.junctx.fill();
	// RED border
	this.junctx.strokeStyle = '#ff0000';
	this.junctx.lineWidth = this.borderW;
	this.junctx.beginPath();
	this.junctx.arc((this.junctionCanvas.width / 2), (this.junctionCanvas.height / 2), roadC * 1.06, 0, 2 * Math.PI, false);
	this.junctx.stroke();
	// WHITE strokes border
	this.junctx.strokeStyle = '#ffffff';
	this.junctx.lineWidth = this.borderW;
	var tinyAngle = Math.tan(this.borderH / roadC);
	var circumference = (2 * roadC * Math.PI);
	for (var x = 0; x < (circumference / this.borderH); x += 2){
		this.junctx.beginPath();
		this.junctx.arc((this.junctionCanvas.width / 2), (this.junctionCanvas.height / 2),
					roadC * 1.06, x * tinyAngle, x * tinyAngle + tinyAngle, false);
		this.junctx.stroke();
	}


	// draw current portion of race course to canvas
	this.draw = function(){
		this.closestRoad = 10000;
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
			this.distToJunction = Math.sqrt(Math.pow((this.centerX - this.startX),2) + Math.pow((this.centerY - this.startY),2));
			if (this.distToJunction > this.canvasC + roadC + this.borderW)
				continue;
			// **********************************************************************************

			ctx.drawImage(this.junctionCanvas, 0, 0, this.junctionCanvas.width, this.junctionCanvas.height,
								this.startX - this.X - (this.junctionCanvas.width / 2),
								this.startY - this.Y - (this.junctionCanvas.height / 2),
								this.junctionCanvas.width, this.junctionCanvas.height);

			// rendering juntion to screen is like passing through a checkpoint
			courseCoords[i].checkpoint = true;
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
			this.Bangle = Math.acos( ((this.bLen*this.bLen) + (this.cLen*this.cLen) -
							(this.aLen*this.aLen)) / (2 * this.bLen * this.cLen) );
			this.Aangle = Math.acos( ((this.aLen*this.aLen) + (this.cLen*this.cLen) -
							(this.bLen*this.bLen)) / (2 * this.aLen * this.cLen) );

			if (this.Bangle * 180 / Math.PI > 90)
				this.distToRoad = this.bLen;
			else if (this.Aangle * 180 / Math.PI > 90)
				this.distToRoad = this.aLen;
			else
				this.distToRoad = Math.sin(this.Bangle) * this.bLen;

			if (this.distToRoad < this.closestRoad)
				this.closestRoad = this.distToRoad;
			if (this.distToRoad > this.canvasC + roadW)
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
			this.whiteLength1 = Math.sqrt(Math.pow((this.RedEndX1 - this.RedStartX1), 2) +
							Math.pow((this.RedEndY1 - this.RedStartY1), 2));
			this.whiteLength2 = Math.sqrt(Math.pow((this.RedEndX2 - this.RedStartX2), 2) +
							Math.pow((this.RedEndY2 - this.RedStartY2), 2));
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

		// draw start/finish line at [0, 0] if close enough
		this.distToLine = Math.sqrt(Math.pow(this.centerX,2) + Math.pow(this.centerY, 2));
		if (this.distToLine < this.canvasC + roadC){
			ctx.drawImage(this.startingLinePatternImage,
					courseCoords[0].roadX1 - this.X + (Math.cos(courseCoords[0].segAngleRad) * 125),
					courseCoords[0].roadY1 - this.Y + (Math.sin(courseCoords[0].segAngleRad) * 125));

			// if you are here, and all checkpoints are cleared, you have finished a lap!
			if (this.centerY < 10 && this.centerX > courseCoords[0].roadX1 && this.centerX < courseCoords[0].roadX2){
				this.lapFinished = false;
				for (var i = 0; i < course.length; i++){
					if (!courseCoords[i].checkpoint){
						this.lapFinished = false;
						break;
					} else
						this.lapFinished = true;
				}
				if (this.lapFinished){
						CAR.speed = 0;
						RUN = false;
						winner();
				}
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
	this.width = 128;
	this.height = 184;
	this.initOffset = 200;
	
	// initialize current position (all the way to the bottom of image)
	this.X = Math.floor((canvasW / 2) - (this.width / 2));
	this.Y = Math.floor((canvasH - this.height) - this.initOffset);
	
	// rotate angle (temporary, for fun graphic) for turning to bearing (permanent ordinal direction)
	this.initAngle = 0;
	this.angle = this.initAngle;
	this.bearing = this.initAngle;
	this.gravity = 2;

	// initial speed and range, odometer
	this.speed = 0; // pixels per frame
	this.MAXspeed = 10;
	this.MINspeed = 0;
	this.odo = 0;

	// initial fuel tank
	this.gas = 100;
	this.MAXgas = 100;
	this.MINgas = 0;
	this.burnRate = 0.025; // gas used per frame

	// every frame this car does stuff **** RUNTIME STATE CHANGES ***********
	this.accel = false;
	this.brake = false;
	this.newFrame = function(){

		// cant get too far from roads!
		if (BG.closestRoad > (roadC + (canvasH / 2.25)) && BG.closestRoad < 10000){
			this.speed = 2;
		}

		if (!this.accel){
			this.speed = Math.max((this.speed - (this.gravity / 20)), this.MINspeed);
			$('#gas').removeClass('active');
		} else {
			this.speed = Math.min((this.speed + (this.gravity / 10)), this.MAXspeed);
			$('#gas').addClass('active');
		}
		if (!this.brake){
			$('#brake').removeClass('active');
		} else {
			this.speed = Math.max((this.speed - (this.gravity / 3)), this.MINspeed);
			$('#brake').addClass('active');
		}

		// update gas and odo -- are you out of gas?
		this.odo += this.speed;
		this.gas -= this.burnRate;
		if (this.gas <= 0){
			this.speed = 0;
			RUN = false;
			loser();
		}
	}
	// *********************************************************************************

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
				this.angle += distance;
				this.bearing = this.angle;
	}
})();


// ***** runs on game start! +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
function gameStart() {
	//store jquery variables for faster updating
	gasBarL = $('#gasBarLine');
	speedBarL = $('#speedBarLine');

	// init canvas
	c = $("#c")[0];
	c.width = canvasW;
	c.height = canvasH;
	ctx = c.getContext('2d');

	// start arrow keys
	window.onkeydown = function(key){pressKey(key.keyCode, true)};
	window.onkeyup = function(key){pressKey(key.keyCode, false)};
	
	// start accelerometer
	window.ondevicemotion = function(event){tiltKey(event)};

	// start touch controls
	$('.pedal').bind('touchstart', function(event){
		touchKey(event, true);
	}).bind('touchend', function(){
		touchKey(event, false)
	});

	// start mouse clicks on game screen
	$('#c').mousedown(function(event){
		clickKey(event);
	});

	// prevent default touch controls
	document.ontouchmove = function(e){ e.preventDefault(); }
	
	startComplete = true;
	playStart();
}

function playStart(){
	// start game
	// init map
	MAP = new MAPobject();
	GAS.setKey();
	RUN = true;
	requestAnimationFrame(function(){gameLoop()});
}

// ***** redraw canvas
function draw(){
	// clear canvas
	ctx.clearRect(0, 0, canvasW, canvasH);

	// redraw background and car and any gas cans
	BG.draw();
	GAS.draw();
	CAR.draw();
	MAP.draw();

	// update readout
	updateData();
} 

// **************** the game! ****************
function gameLoop(){
	// calculate game data
	CAR.newFrame();
	BG.scroll();

	draw();
	requestAnimationFrame(function(){
		if (RUN)
			gameLoop();
	});
}

// ***** handle keyboard
function pressKey(key, down){
	switch (key){
	case 37:
		if (down)
			CAR.turn(-10);
		break;
	case 39:
		if (down)
			CAR.turn(10);
		break;
	case 38:
		CAR.accel = down;
		break;
	case 40:
		CAR.brake = down;
		break;
	}
}

// ***** handle pedals on screen
function touchKey(event, down){
	switch (event.target.dataset.pedal){
	case '0':
		CAR.brake = down;
		break;
	case '1':
		CAR.accel = down;
		break;
	}
}

// ***** handle accelerometer
function tiltKey(event){
	switch (orientation){
	case 90:
		CAR.turn(event.accelerationIncludingGravity.y * -1)
		break;
	case -90:
		CAR.turn(event.accelerationIncludingGravity.y * 1)
		break;
	case 0:
		CAR.turn(event.accelerationIncludingGravity.x * 1)
		break;
	case 180:
		CAR.turn(event.accelerationIncludingGravity.x * -1)
		break;
	}
}


// ***** handle mouse clicks
function clickKey(event){
	var startX = event.offsetX;
	var startY = event.offsetY;

	$(window).bind('mousemove', function(e){
		// firefox uses "pageX" in event objects
		var mouseX = e.offsetX || e.pageX;
		var mouseY = e.offsetY || e.pageY;

		if (Math.abs(mouseX - startX) > 0)
			CAR.turn( 3 * ( (mouseX - startX) > 0 ? 1 : -1 ) );
		if ((mouseY - startY) < 1){
			CAR.accel = true;
			CAR.brake = false;
		} else if ((mouseY - startY) > -1){
			CAR.brake = true;
			CAR.accel = false;
		}
		
		startX = mouseX;
		startY = mouseY;
	});
	
	$(window).bind('mouseup', function(){
		CAR.accel = false;
		CAR.brake = false;
		$(window).unbind('mousemove');
	});
}

// ***** prints scoring numbers to panel
var readout = {};
function updateData(){
	readout.gasPct = CAR.gas / CAR.MAXgas;
	readout.gasGRN = Math.floor(readout.gasPct * 200);
	readout.inversePct = 1 - readout.gasPct;
 	readout.gasRED = Math.floor(readout.inversePct * 256);

	gasBarL.css({'background-color' : 'rgb(' + readout.gasRED + ',' + readout.gasGRN + ', 0)'});
	gasBarL.css({'width' : (readout.gasPct * 100) + '%'});
	speedBarL.css({'width' : ((CAR.speed / CAR.MAXspeed) * 100) + '%'});
}

// runs on page load
$(window).load( function(){

	// touch events dont  scroll window
	document.ontouchmove = function(e) {e.preventDefault()};

	// jQuery UI details for menu controls
	$(function() {
		$( "#carChoice" ).buttonset();
		$( "#courseChoice" ).buttonset();
	});
	$(function() {
		$( "#speedChoiceSlider" ).slider({
			value:10,
			min: 2,
			max: 25,
			step: 1,
			slide: function( event, ui ) {
				$( "#speedChoice" ).val(ui.value );
			}
		});
		$( "#easyChoiceSlider" ).slider({
			value:5,
			min: 1,
			max: 10,
			step: 1,
			slide: function( event, ui ) {
				$( "#easyChoice" ).val(ui.value * 10);
			}
		});
	});
	$(function() {
		$( "button" )
			.button()
			.click(function( event ) {
				event.preventDefault();	
				menuSet();
				$('#splash').remove();
				$('#menuc').slideUp(); $('#mainc').slideDown();
				if (!startComplete)
					gameStart();
				else
					playStart();
		});
		$( "ok-button" )
			.button()
			.click(function( event ) {
				event.preventDefault();
				$('#inst').slideUp(); $('#menu').slideDown();
		});
	});

	// go from splash screen to menu 1
	$('#splashLoading').remove();
	$('#splash').bind('click touchstart', function(){
		$('#menuc').slideDown();
		$('#mainc').slideUp();
	});

	// init gas cans
	GAS = new GASobject()
});

// aplies menu settings before game and initializes other variables
function menuSet(){
	// init generic
	CAR.gas = CAR.MAXgas;
	BG.X = BG.initX;
	BG.Y = BG.initY;
	CAR.angle = CAR.initAngle;
	CAR.bearing = CAR.initAngle;

	// init menu options
	CAR.image.src = 'i/car_' + $('input:radio[name=car-choice]:checked').val() + '.png';
	CAR.MAXspeed = $( "#speedChoice" ).val();
	GAS.easy = $( "#easyChoice" ).val() / 10;
	course = courses[ $('input:radio[name=course-choice]:checked').val() ];
	initCourse();
}

// out of gas!
function loser(){
	var loserPage = "<div id='loser'>You ran out of gas!<br>Your key number was: " + GAS.key + "<hr>1 x " + GAS.key + " = " + (GAS.key * 1) + "<br>2 x " + GAS.key + " = " + (GAS.key * 2) + "<br>3 x " + GAS.key + " = " + (GAS.key * 3) + "<br>4 x " + GAS.key + " = " + (GAS.key * 4) + "<br>5 x " + GAS.key + " = " + (GAS.key * 5) + "<br>6 x " + GAS.key + " = " + (GAS.key * 6) + "<br>7 x " + GAS.key + " = " + (GAS.key * 7) + "<br>8 x " + GAS.key + " = " + (GAS.key * 8) + "<br>9 x " + GAS.key + " = " + (GAS.key * 9) + "<hr><start-button>Try Again!</start-button></div>"

	setTimeout(function(){
		$('#board').append(loserPage);
		$( 'start-button' ).button().click(function( event ) {
			event.preventDefault();
			$('#mainc').slideUp();
			$('#menuc').slideDown();
			$('#c').slideDown('fast');
			$('#map').slideDown('fast');
			$('#mapLoc').slideDown('fast');
			$('#loser').remove();
		});
		$('#c').slideUp('slow');
		$('#map').slideUp('slow');
		$('#mapLoc').slideUp('slow');
	}, 1000);
}

// finished a lap!
function winner(){
	var winnerPage = "<div id='winner'>You finished a lap!<br>Your key number was: " + GAS.key + "<hr>1 x " + GAS.key + " = " + (GAS.key * 1) + "<br>2 x " + GAS.key + " = " + (GAS.key * 2) + "<br>3 x " + GAS.key + " = " + (GAS.key * 3) + "<br>4 x " + GAS.key + " = " + (GAS.key * 4) + "<br>5 x " + GAS.key + " = " + (GAS.key * 5) + "<br>6 x " + GAS.key + " = " + (GAS.key * 6) + "<br>7 x " + GAS.key + " = " + (GAS.key * 7) + "<br>8 x " + GAS.key + " = " + (GAS.key * 8) + "<br>9 x " + GAS.key + " = " + (GAS.key * 9) + "<hr><start-button>Play Again!</start-button></div>"

	setTimeout(function(){
		$('#board').append(winnerPage);
		$( 'start-button' ).button().click(function( event ) {
			event.preventDefault();
			$('#mainc').slideUp();
			$('#menuc').slideDown();
			$('#c').slideDown('fast');
			$('#map').slideDown('fast');
			$('#mapLoc').slideDown('fast');
			$('#winner').remove();
		});
		$('#c').slideUp('slow');
		$('#map').slideUp('slow');
		$('#mapLoc').slideUp('slow');
	}, 1000);
}
