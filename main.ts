let windowWidth: number;
let windowHeight: number;
const pong = document.getElementById("pong") as HTMLCanvasElement | null;
if (pong == null) {
	throw new Error("No element with the id 'pong'");
}
const ctx = pong.getContext("2d");
if (ctx == null) {
	throw new Error("Cannot support 2d platform");
}
pong.width = window.innerWidth;
pong.height = window.innerHeight;

windowWidth = ctx.canvas.width;
windowHeight = ctx.canvas.height;

const lineColor = "#fffafb";
const ballColor = "#7de2d1";
const paddleColor = "#339989";
const ballRadius = 10;
let windowWasResized = false;
const padding = 20;
const paddleWidth = 10;
const paddleHeight = 80;
let playerMoveUp = false;
let playerMoveDown = false;
const playerVelocity = 250;

interface Vector2 {
	x: number,
	y: number,
}

let ballPos: Vector2 = {
	x: windowWidth / 2,
	y: windowHeight / 2,
}

let ballVelocity: Vector2 = {
	x: 300,
	y: 300,
}

let playerPos: Vector2 = {
	x: padding,
	y: (windowHeight - paddleHeight) / 2,
}

let botPos: Vector2 = {
	x: windowWidth - paddleWidth - padding,
	y: (windowHeight - paddleHeight) / 2,
}

function drawGame(ctx: CanvasRenderingContext2D) {
	ctx.clearRect(0, 0, windowWidth, windowHeight);
	if (pong) {
		// platform
		drawLine(ctx, {x: windowWidth / 2, y: 0}, {x: windowWidth / 2, y: windowHeight}, lineColor);
		drawLine(ctx, {x: 0, y: 0}, {x: 0, y: windowHeight}, lineColor);
		drawLine(ctx, {x: windowWidth, y: 0}, {x: windowWidth, y: windowHeight}, lineColor);
		drawLine(ctx, {x: 0, y: 0}, {x: windowWidth, y: 0}, lineColor);
		drawLine(ctx, {x: 0, y: windowHeight}, {x: windowWidth, y: windowHeight}, lineColor);

		// ball
		drawCircle(ctx, ballPos, ballRadius, ballColor);

		// paddles 
		drawRectangle(ctx, playerPos, paddleWidth, paddleHeight, paddleColor);
		drawRectangle(ctx, botPos, paddleWidth, paddleHeight, paddleColor);

		// Title
		const metrics = ctx.measureText("Pong");
		const textWidth = metrics.width;
		drawText(ctx, {
			x: (windowWidth - textWidth) / 2, y: 69
		}, "SuperPixel", 42, "Pong", "#fffafb");
	}
}

let lastTime = performance.now();
function gameLoop(now: number) {
	const dt = (now - lastTime) / 1000;
	lastTime = now;
	if (ctx) {
		if (ballPos.x + ballRadius >= windowWidth || ballPos.x - ballRadius <= 0) {
			ballVelocity.x *= -1;
		}
		if (ballPos.y + ballRadius >= windowHeight || ballPos.y - ballRadius <= 0) {
			ballVelocity.y *= -1;
		}

		ballPos.x += ballVelocity.x * dt;
		ballPos.y += ballVelocity.y * dt;

		if (windowWasResized) {
			if (pong) {
				pong.width = window.innerWidth;
				pong.height = window.innerHeight;
			}
			windowWidth = window.innerWidth;
			windowHeight = window.innerHeight;
			playerPos.y = (windowHeight - paddleHeight) / 2;
			botPos.x = windowWidth - paddleWidth - padding;
			botPos.y = (windowHeight - paddleHeight) / 2;
			windowWasResized = false;
		}

		if (playerMoveUp && playerPos.y > 0) {
			playerPos.y -= playerVelocity * dt;
		} else if (playerMoveDown && playerPos.y + paddleHeight < windowHeight) {
			playerPos.y += playerVelocity * dt;
		}
		drawGame(ctx);
	}
	requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

window.addEventListener("resize", () => {
	windowWasResized = true;
});

window.addEventListener("keydown", (e) => {
	switch (e.key) {
		case 'w': {
			playerMoveUp = true;
		} break;
		case 's': {
			playerMoveDown = true;
		} break;
	}
})

window.addEventListener("keyup", (e) => {
	switch (e.key) {
		case 'w': {
			playerMoveUp = false;
		} break;
		case 's': {
			playerMoveDown = false;
		} break;
	}
})

function drawRectangle(ctx: CanvasRenderingContext2D, pos: Vector2, width: number, height: number, color: string) {
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.rect(pos.x, pos.y, width, height);
	ctx.fill();
}

function drawCircle(ctx: CanvasRenderingContext2D, pos: Vector2, radius: number, color: string) {
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
	ctx.fill();
}

function drawLine(ctx: CanvasRenderingContext2D, startPos: Vector2, endPos: Vector2, color: string) {
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.moveTo(startPos.x, startPos.y);
	ctx.lineTo(endPos.x, endPos.y);
	ctx.stroke();
}

function drawText(ctx: CanvasRenderingContext2D, pos: Vector2, fontFamily: string, fontSize: number, text: string, color: string) {
	const font = fontSize.toString() + "px " + fontFamily;
	ctx.fillStyle = color;
	ctx.font = font;
	ctx.fillText(text, pos.x, pos.y);
}
