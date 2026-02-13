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
const bgMenu = document.getElementById("bgMenu") as HTMLImageElement | null;

pong.width = window.innerWidth;
pong.height = window.innerHeight;

windowWidth = ctx.canvas.width;
windowHeight = ctx.canvas.height;

type PongScreen = 'menu' | 'game' | 'auth';

let currentScreen: PongScreen = 'menu';

const bo = new Audio("./bo.mp3");
bo.preload = "auto";
bo.loop = true;
bo.volume = 0.3;

// for bot
const botSpeed = 260;          // plus petit que playerVelocity
const botPrecision = 25;       // erreur humaine (pixels)
const botReaction = 0.15;      // temps de réaction (sec)
let botThinkTimer = 0;
let botTargetY = windowHeight / 2;

let hasSound = true;
const myWhite = "#E0FBFC";
const ballColor = "#FFD166";
const playerPaddleColor = "#00F5FF";
const botPaddleColor = "#9B5CFF";
const ballRadius = 10;
let windowWasResized = false;
const padding = 20;
const paddleWidth = 10;
const paddleHeight = 150;
let playerMoveUp = false;
let playerMoveDown = false;
let playerMoveRight = false;
let playerMoveLeft = false;
const playerVelocity = 300;
let paused = false;

interface Vector2 {
	x: number,
	y: number,
}

let ballPos = {
	x: windowWidth / 2,
	y: windowHeight / 2
}

const ballSpeed = 400;
let ballVelocity = {
	x: ballSpeed,
	y: ballSpeed
}

let playerPos = {
	x: padding,
	y: (windowHeight - paddleHeight) / 2,
}

let botPos = {
	x: windowWidth - paddleWidth - padding,
	y: (windowHeight - paddleHeight) / 2,
}

function drawGame(ctx: CanvasRenderingContext2D) {
	ctx.clearRect(0, 0, windowWidth, windowHeight);
	if (pong) {
		if (bgMenu)
			ctx.drawImage(bgMenu, 0, 0, windowWidth, windowHeight);
		// platform
		drawLine(ctx, {x: windowWidth / 2, y: 0}, {x: windowWidth / 2, y: windowHeight}, myWhite);
		// left Line
		drawLine(ctx, {x: 0, y: 0}, {x: 0, y: windowHeight}, myWhite);
		// right Line
		drawLine(ctx, {x: windowWidth, y: 0}, {x: windowWidth, y: windowHeight}, myWhite);
		drawLine(ctx, {x: 0, y: 0}, {x: windowWidth, y: 0}, myWhite);
		drawLine(ctx, {x: 0, y: windowHeight}, {x: windowWidth, y: windowHeight}, myWhite);

		// ball
		drawCircle(ctx, ballPos, ballRadius, ballColor);

		// paddles 
		drawRectangle(ctx, playerPos, paddleWidth, paddleHeight, playerPaddleColor);
		drawRectangle(ctx, botPos, paddleWidth, paddleHeight, botPaddleColor);

		// Pause
		if (paused) {
			drawText(ctx, {
				x: windowWidth / 2, y: windowHeight / 2
			}, "SuperPixel", 30, "Pause", "#E0FBFC");
		}
	}
}

const menuItems: string[] = [
	"Solo",
	"Multiplayer",
	"Toggle Sound [on]",
];
let menuItemFocus = 0;

function drawMenu(ctx: CanvasRenderingContext2D) {
	const TITLE_PADDING_TOP = 169;
	const TITLE_PADDING_BOTTOM = 200;
	const ITEM_GAP = 120;
	const menuFont = "SuperPixel"

	bo.pause();
	ctx.clearRect(0, 0, windowWidth, windowHeight);
	if (bgMenu) {
		ctx.drawImage(bgMenu, 0, 0, windowWidth, windowHeight);
	}
	drawTextCenterX(ctx, {x: windowWidth / 2, y: TITLE_PADDING_TOP}, menuFont, 69, "Pixel Pong", "#7de2d1");
	let itemPosY = TITLE_PADDING_TOP + TITLE_PADDING_BOTTOM;
	menuItems.forEach((item, i) => {
		if (i === menuItemFocus) {
			drawTextCenterX(ctx, {x: windowWidth / 2, y: itemPosY + i * ITEM_GAP}, menuFont, 42, item, "#339989");
		} else {
			drawTextCenterX(ctx, {x: windowWidth / 2, y: itemPosY + i * ITEM_GAP}, menuFont, 42, item, myWhite);
		}
	})
}

function drawAuth(ctx: CanvasRenderingContext2D) {
	ctx.beginPath();
	ctx.fillStyle = "blue";
	ctx.rect(0, 0, windowWidth, windowHeight);
	ctx.fill();
}

function playGame(ctx: CanvasRenderingContext2D, dt: number) {
	if (!paused) {
		if (ballPos.x + ballRadius >= windowWidth) {
			ballVelocity.x *= -1;
		}
		if (ballPos.x - ballRadius <= 0) {
			ballVelocity.x *= -1;
		}
		if (ballPos.y + ballRadius >= windowHeight || ballPos.y - ballRadius <= 0) {
			ballVelocity.y *= -1;
		}

		if (checkCollisionRecCircle(playerPos, paddleWidth, paddleHeight, ballPos, ballRadius) ||
			checkCollisionRecCircle(botPos, paddleWidth, paddleHeight, ballPos, ballRadius)) {
			ballVelocity.x *= -1;
		}

		ballPos.x += ballVelocity.x * dt;
		ballPos.y += ballVelocity.y * dt;

		if (playerMoveUp && playerPos.y > 0) {
			playerPos.y -= playerVelocity * dt;
		} else if (playerMoveDown && playerPos.y + paddleHeight < windowHeight) {
			playerPos.y += playerVelocity * dt;
		} else if (playerMoveLeft && playerPos.x > 0) {
			playerPos.x -= playerVelocity * dt;
		} else if (playerMoveRight && playerPos.x + paddleWidth < windowWidth / 2) {
			playerPos.x += playerVelocity * dt;
		}
	}
	if (!paused)
		updateBot(dt);
	drawGame(ctx);
}

let lastTime = performance.now();
function gameLoop(now: number) {
	const dt = (now - lastTime) / 1000;
	lastTime = now;
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
	if (ctx) {
		if (currentScreen === 'game')
			playGame(ctx, dt);
		else if (currentScreen === 'menu')
			drawMenu(ctx);
		else if (currentScreen === 'auth')
			drawAuth(ctx);
	}
	requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

window.addEventListener("click", () => {
	if (currentScreen === 'game') {
		console.log(currentScreen);
		ctx.lineWidth = 4;
		bo.play();
	}
}, {once: true})

window.addEventListener("resize", () => {
	windowWasResized = true;
});

window.addEventListener("keypress", (e) => {
	if (e.code === 'Space' && currentScreen === 'game') {
		paused = !paused;
		if (paused)
			bo.pause();
		else if (hasSound)
			bo.play();
	}
	if (e.code === 'KeyT') { // toggle menu
		if (currentScreen === 'game' || currentScreen === 'auth') {
			currentScreen = 'menu';
			paused = true;
		}
		else if (currentScreen === 'menu') currentScreen = 'game';
	}
	// Action on Menu items
	if (e.code === 'Enter' && currentScreen === 'menu') {
		switch (menuItemFocus) {
			case 0: { // Solo
				currentScreen = 'game';
			} break;
			case 1: { // Multiplayer
				currentScreen = 'auth';
			} break;
			case 2: { // Toogle sound
				if (hasSound) {
					bo.pause();
					bo.currentTime = 0;
					menuItems[2] = "Toggle Sound [off]";
					hasSound = false;
				} else {
					menuItems[2] = "Toggle Sound [on]"
					hasSound = true;
				}
			}
		}
	}
})

window.addEventListener("keydown", (e) => {
	switch (e.code) {
		case 'KeyW': {
			playerMoveUp = true;
		} break;
		case 'KeyS': {
			playerMoveDown = true;
		} break;
		case 'KeyD': {
			playerMoveRight = true;
		} break;
		case 'KeyA': {
			playerMoveLeft = true;
		} break;
		case 'ArrowUp': {
			if (menuItemFocus == 0) menuItemFocus = 2;
			else menuItemFocus -= 1;
			drawMenu(ctx);
		} break;
		case 'ArrowDown': {
			if (menuItemFocus == 2) menuItemFocus = 0;
			else menuItemFocus += 1;
			drawMenu(ctx);
		} break;
	}
})

window.addEventListener("keyup", (e) => {
	switch (e.code) {
		case 'KeyW': {
			playerMoveUp = false;
		} break;
		case 'KeyS': {
			playerMoveDown = false;
		} break;
		case 'KeyD': {
			playerMoveRight = false;
		} break;
		case 'KeyA': {
			playerMoveLeft = false;
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
	ctx.shadowBlur = 15;
	ctx.shadowColor = "#FFB703"; // TODO: make dynamic
	ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
	ctx.fill();
	ctx.shadowBlur = 0;
}

function drawLine(ctx: CanvasRenderingContext2D, startPos: Vector2, endPos: Vector2, color: string) {
	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.moveTo(startPos.x, startPos.y);
	ctx.lineTo(endPos.x, endPos.y);
	ctx.lineWidth = 4;
	ctx.stroke();
}

function drawText(ctx: CanvasRenderingContext2D, pos: Vector2, fontFamily: string, fontSize: number, text: string, color: string) {
	const font = fontSize.toString() + "px " + fontFamily;
	ctx.fillStyle = color;
	ctx.font = font;
	ctx.fillText(text, pos.x, pos.y);
}

function drawTextCenterX(ctx: CanvasRenderingContext2D, pos: Vector2, fontFamily: string, fontSize: number, text: string, color: string) {
	const font = fontSize.toString() + "px " + fontFamily;
	ctx.fillStyle = color;
	ctx.font = font;
	ctx.textAlign = "center";
	ctx.fillText(text, pos.x, pos.y);
}

// TODO: try to understand this function
function predictBallY(): number {
	let simulatedY = ballPos.y;
	let simulatedVy = ballVelocity.y;
	let simulatedX = ballPos.x;
	let simulatedVx = ballVelocity.x;

	// simule jusqu'au mur droit
	while (simulatedX < botPos.x) {
		simulatedX += simulatedVx * 0.016;
		simulatedY += simulatedVy * 0.016;

		// rebond haut/bas
		if (simulatedY <= ballRadius || simulatedY >= windowHeight - ballRadius) {
			simulatedVy *= -1;
		}
	}

	return simulatedY;
}

function updateBot(dt: number) {

	// réagit seulement si la balle vient vers lui
	if (ballVelocity.x <= 0) return;

	botThinkTimer -= dt;

	if (botThinkTimer <= 0) {
		botThinkTimer = botReaction;

		botTargetY = predictBallY();

		// erreur humaine
		botTargetY += (Math.random() * 2 - 1) * botPrecision;
	}

	const botCenter = botPos.y + paddleHeight / 2;
	const diff = botTargetY - botCenter;

	if (Math.abs(diff) > 5) {
		if (diff >= 0)
			botPos.y += botSpeed * dt;
		else
			botPos.y += -botSpeed * dt;
	}

	// clamp écran
	botPos.y = Math.max(0, Math.min(windowHeight - paddleHeight, botPos.y));
}

function checkCollisionRecCircle(recPos: Vector2, recWidth: number, recHeight: number, circlePos: Vector2, circleRadius: number): boolean {
	const recCenter: Vector2 = {
		x: recPos.x + (recWidth / 2),
		y: recPos.y + (recHeight / 2)
	};
	const delta: Vector2 = {
		x: Math.abs(recCenter.x - circlePos.x),
		y: Math.abs(recCenter.y - circlePos.y)
	}
	if (delta.x > (recWidth / 2 + circleRadius)) return (false);
	if (delta.y > (recHeight / 2 + circleRadius)) return (false);

	if (delta.x <= (recWidth / 2)) return (true);
	if (delta.y <= (recHeight / 2)) return (true);

	const cornerDistanceSq = (delta.x - recWidth / 2) ** 2 + (delta.y - recHeight / 2) ** 2;

	return cornerDistanceSq <= (circleRadius * circleRadius);
}
