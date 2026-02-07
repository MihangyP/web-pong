const pong = document.getElementById("pong") as HTMLCanvasElement | null;
if (pong == null) {
	throw new Error("No element with the id 'pong'");
}
const ctx = pong.getContext("2d");
if (ctx == null) {
	throw new Error("Cannot support 2d platform");
}

resize();

interface Vector2 {
	x: number,
	y: number,
}

window.addEventListener("resize", resize);

function resize() {
	if (pong != null) {
		pong.width = window.innerWidth;
		pong.height = window.innerHeight;
	}
}

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
