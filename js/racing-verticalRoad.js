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

// canvas dimensions must match canvas size in css
var canvasW = 700;
var canvasH = 640;


// ***** object handles background scrolling
var BG = new (function(){
	// init bg pattern
	this.image = new Image();
	this.image.src = 'i/road.jpg';

	// dimensions of visible frame and actual file size
	this.width = canvasW;
	this.height = canvasH;
	this.fileHeight = 1680;
	
	// initialize current position (all the way to the bottom of image)
	this.X = 0;
	this.Y = this.fileHeight - this.height;
	
	// draw current portion of image to canvas
	this.draw = function(){
		try {
			// repeat image if we run out of image
			if (this.Y > 0)
				ctx.drawImage(this.image, this.X, this.Y, this.width, this.height, 0, 0, canvasW, canvasH);
			else {
				// continue with top of image where its supposed to go
				ctx.drawImage(this.image, this.X, 0, this.width, this.height, 0, (this.Y * -1), canvasW, canvasH);
				// fill in remainder with repeated image
				ctx.drawImage(this.image, this.X, (this.fileHeight + this.Y), this.width, (this.Y * -1), 0, 0, canvasW, (this.Y * -1));
				// reset after seam is off screen
				if ((this.Y * -1) >= this.height)
					this.Y += this.fileHeight;
			}
		} catch (e) {}
	}

	// moves the bg image
	this.scroll = function(distance){
		this.Y -= distance;
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
	this.initOffset = 10;
	
	// initialize current position (all the way to the bottom of image)
	this.X = (canvasW / 2) - (this.width / 2);
	this.Y = (canvasH - this.height) - this.initOffset;
	
	// rotate angle for turning
	this.angle = 0;
	this.gravity = 2;

	// initial speed and range, odometer
	this.speed = 1;
	this.MAXspeed = 50;
	this.MINspeed = 1;
	this.odo = 0;
	this.burnRate = 0.001;

	// initial fuel tank
	this.gas = 100;
	this.MAXgas = 100;
	this.MINgas = 0;

	// every frame this car consumes gas,  etc.
	this.newFrame = function(){
		this.odo += this.speed;
		this.gas -= this.burnRate;

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
			this.angle += (this.gravity * (this.angle > 0 ? -1 : 1));
			if (Math.abs(this.angle) < 2)
				this.angle = 0;
		}
	}

	// moves the car left or right
	this.turn = function(distance){
		if ( ((this.X + distance) <= (canvasW - this.width)) && ((this.X + distance) >= 0) ){
			this.X += distance;
			if ( Math.abs(this.angle) <= 45 )
				this.angle += distance;
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
	$('#c').mousedown(function(event){clickKey(event)});

	// start game
	requestAnimationFrame(function(){gameLoop()});

	// prevent default touch controls
	document.ontouchmove = function(e){ e.preventDefault(); }
});

// ***** redraw canvas
function draw(){
	// calculate game data
	CAR.newFrame();

	// clear canvas
	ctx.clearRect(0, 0, canvasW, canvasH);

	// redraw background and car
	BG.draw();
	CAR.draw();

	// update readout
	updateData();
} 

// ***** the game!
function gameLoop(){
	// scroll background
	BG.scroll(CAR.speed);
	
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
	var readout = "Speed: " + CAR.speed + "<br>Angle: " + CAR.angle + "<br>Odometer: " + CAR.odo + "<br>Fuel: " + CAR.gas.toFixed(3);
	$("#readout").html(readout);
}
