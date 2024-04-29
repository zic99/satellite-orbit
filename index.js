(function($) {
	$(document).ready(function() {
		banDefaultMouse();
		var canvas = $('#myCanvas'),
			context = canvas.get(0).getContext('2d'),
			canvasWidth = canvas.width(),
			canvasHeight = canvas.height(),
			playAnimation = true,
			startButton = $('#startButton'),
			stopButton = $('#stopButton'),
			Asteroid = function(x, y, radius, vX, vY, c, aX, aY, mass) {
				this.x = x;
				this.y = y;
				this.radius = radius;
				this.vX = vX;
				this.vY = vY;
				this.c = c;
				this.aX = aX;
				this.aY = aY;
				this.mass = mass;
			}, asteroids = new Array();

		function resizeCanvas() {
			canvas.attr('width', $(window).get(0).innerWidth).attr('height', $(window).get(0).innerHeight);
			canvasWidth = canvas.width();
			canvasHeight = canvas.height();
		};
		$(window).resize(resizeCanvas);
		resizeCanvas();
		startButton.hide();
		startButton.click(function(event) {
			$(this).hide();
			stopButton.show();
			playAnimation = true;
			animate();
		});
		stopButton.click(function(event) {
			$(this).hide();
			startButton.show();
			playAnimation = false;
		});
		for (var i = 0; i < 100; i++) {
			var x = 20 + (Math.random() * (canvasWidth - 40)),
				y = 20 + (Math.random() * (canvasHeight - 40)),
				radius = 2 + Math.random() * 10,
				vX = Math.random() * 0.4 - 0.2,
				vY = Math.random() * 0.4 - 0.2,
				c = 'rgb(' + Math.floor(50 + Math.random() * 255) + ', ' + Math.floor(50 + Math.random() * 255) + ', ' + Math.floor(50 + Math.random() * 255) + ')',
				aX = Math.random() * 0.2 - 0.1,
				aY = Math.random() * 0.2 - 0.1,
				mass = radius / 2;
			asteroids.push(new Asteroid(x, y, radius, vX, vY, c, aX, aY, mass));
		};

		function animate() {
			context.clearRect(0, 0, canvasWidth, canvasHeight);
			for (var i = 0; i < asteroids.length; i++) {
				context.fillStyle = asteroids[i].c;
				context.beginPath();
				context.arc(asteroids[i].x, asteroids[i].y, asteroids[i].radius / 2, 0, Math.PI * 2, false);
				context.closePath();
				context.fill();
				context.strokeStyle = asteroids[i].c;
				context.beginPath();
				context.arc(asteroids[i].x, asteroids[i].y, asteroids[i].radius, 0, Math.PI * 2, false);
				context.closePath();
				context.stroke();
				asteroids[i].x += asteroids[i].vX;
				asteroids[i].y += asteroids[i].vY;
				asteroids[i].vX += (asteroids[i].vX < 10) ? asteroids[i].aX : 0;
				asteroids[i].vY += (asteroids[i].vY < 10) ? asteroids[i].aY : 0;
				// (Math.abs(asteroids[i].vX) > 0.1) ? asteroids[i].vX *= 0.99 : 0;
				// (Math.abs(asteroids[i].vY) > 0.1) ? asteroids[i].vY *= 0.99 : 0;
				if (asteroids[i].x - asteroids[i].radius < 0) {
					asteroids[i].x = asteroids[i].radius;
					asteroids[i].vX *= -1;
					asteroids[i].aX *= -1;
				} else if (asteroids[i].x + asteroids[i].radius > canvasWidth) {
					asteroids[i].x = canvasWidth - asteroids[i].radius;
					asteroids[i].vX *= -1;
					asteroids[i].aX *= -1;
				}
				if (asteroids[i].y - asteroids[i].radius < 0) {
					asteroids[i].y = asteroids[i].radius;
					asteroids[i].vY *= -1;
					asteroids[i].aY *= -1;
				} else if (asteroids[i].y + asteroids[i].radius > canvasHeight) {
					asteroids[i].y = canvasHeight - asteroids[i].radius;
					asteroids[i].vY *= -1;
					asteroids[i].aY *= -1;
				}
				for (var j = i + 1; j < asteroids.length; j++) {
					var dX = asteroids[j].x - asteroids[i].x,
						dY = asteroids[j].y - asteroids[i].y;
					if (Math.sqrt(dX * dX + dY * dY) < asteroids[i].radius + asteroids[j].radius) {
						var angle = Math.atan2(dY, dX),
							sine = Math.sin(angle),
							consine = Math.cos(angle),
							x = 0,
							y = 0,
							xB = dX * consine + dY * sine,
							yB = dY * consine + dX * sine,
							vX = asteroids[i].vX * consine + asteroids[i].vY * sine,
							vY = asteroids[i].vY * consine + asteroids[i].vX * sine,
							vXb = asteroids[j].vX * consine + asteroids[j].vY * sine,
							vYb = asteroids[j].vY * consine + asteroids[j].vX * sine,
							vTotal = vX - vXb;
						vX = ((asteroids[i].mass - asteroids[j].mass) * vX + 2 * asteroids[j].mass * vXb) / (asteroids[i].mass + asteroids[j].mass);
						vXb = vTotal + vX;
						xB = x + (asteroids[i].radius + asteroids[j].radius);
						asteroids[i].x = asteroids[i].x + (x * consine - y * sine);
						asteroids[i].y = asteroids[i].y + (y * consine + x * sine);
						asteroids[j].x = asteroids[i].x + (xB * consine - yB * sine);
						asteroids[j].y = asteroids[i].y + (yB * consine + xB * sine);
						asteroids[i].vX = vX * consine - vY * sine;
						asteroids[i].vY = vY * consine + vX * sine;
						asteroids[j].vX = vXb * consine - vYb * sine;
						asteroids[j].vY = vYb * consine + vXb * sine;
					}
				};
			};
			if (playAnimation) {
				setTimeout(animate, 33);
			}
		};
		animate();
	});
})(jQuery);

//禁止默認的瀏覽器右鍵

function banDefaultMouse() {
	$(document).bind('contextmenu', function() {
		return false;
	});
	$(document).bind('selectstart', function() {
		return false;
	});
	$(document).keydown(function(event) {
		if (event.keyCode === 123) {
			return false;
		}
	});
};