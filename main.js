import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs";

const k = kaboom({
	width: 800,
	height: 600
})

k.loadSprite("bean", "sprites/bean.png")

const SPEED = 200

const iterations = [[]]
const doneIter = []

k.scene("game", () => {
	k.setGravity(2000)

	const door = k.add([
		k.rect(70, 100),
		k.outline(4),
		k.pos(100, k.height() - 48),
		k.anchor("bot"),
		k.color(k.CYAN),
		k.z(-3),
		k.area(),
	])

	for (const iter of iterations.slice(0, -1)) {
		const clone = k.add([
			k.pos(100, k.height() - 48),
			k.sprite("bean"),
			k.anchor("center"),
			k.z(-2),
			k.area({ collisionIgnore: ["player"] }),
			k.body(),
			"player"
		])

		let i = 0
		clone.onUpdate(() => {
			if (iter[i] == "REWIND") {
				if (clone.isColliding(door)) {
					k.destroy(clone)
					k.debug.log("done")
					doneIter.push(true)
				} else {
					k.debug.log("paradox")
				}

				return;
			} else if (iter[i] == "RIGHT") {
				clone.move(SPEED, 0)
			} else if (iter[i] == "LEFT") {
				clone.move(-SPEED, 0)
			} else if (iter[i] == "JUMP") {
				if (clone.isGrounded()) {
					clone.jump(600)
				}
			}
			i++;
		})
	}

	const player = k.add([
		k.pos(100, k.height() - 48),
		k.sprite("bean"),
		k.anchor("center"),
		k.z(-1),
		k.area({ collisionIgnore: ["player"] }),
		k.body(),
		"player"
	])

	player.onUpdate(() => {
		iterations[iterations.length - 1].push("")
	})

	k.onKeyDown("right", () => {
		player.move(SPEED, 0)
		iterations[iterations.length - 1][(iterations[iterations.length - 1]).length - 1] = "RIGHT"
	})
	k.onKeyDown("left", () => {
		player.move(-SPEED, 0)
		iterations[iterations.length - 1][(iterations[iterations.length - 1]).length - 1] = "LEFT"
	})
	k.onKeyDown("up", () => {
		if (player.isGrounded()) {
			player.jump(600)
			iterations[iterations.length - 1][(iterations[iterations.length - 1]).length - 1] = "JUMP"
		}
	})

	k.onKeyPress("space", () => {
		if (!player.isColliding(door) || doneIter.length < iterations.length - 1) return

		k.debug.log("rewind")
		iterations[iterations.length - 1][(iterations[iterations.length - 1]).length - 1] = "REWIND"
		iterations.push([])
		doneIter.length = 0

		k.go('game')
	})

	const button = k.add([
		k.rect(70, 10),
		k.outline(4),
		k.pos(700, k.height() - 48),
		k.anchor("bot"),
		k.color(k.BLACK),
		k.area(),
	])

	const tower = k.add([
		k.rect(150, 20),
		k.outline(4),
		k.area(),
		k.pos(450, k.height() - 48),
		k.body({ isStatic: true }),
		k.anchor("bot"),
	])

	let pressed = false

	button.onCollideUpdate('player', () => {
		pressed = true
	})

	button.onUpdate(() => {
		if (pressed && tower.pos.y > 200) {
			tower.move(0, -200)
		} else if (!pressed && tower.pos.y < k.height() - 49) {
			tower.move(0, 200)
		}
		pressed = false
	})

	k.add([
		k.rect(k.width() - 4, 46),
		k.outline(4),
		k.area(),
		k.pos(2, k.height() - 48),
		k.body({ isStatic: true }),
	])

	k.add([
		k.rect(300, 46),
		k.outline(4),
		k.area(),
		k.pos(2, 170),
		k.body({ isStatic: true }),
	])

	k.add([
		k.rect(70, 100),
		k.outline(4),
		k.pos(100, 170),
		k.anchor("bot"),
		k.color(k.GREEN),
		k.z(-3),
		k.area(),
		"win"
	])

	k.onCollideUpdate("win", "player", () => {
		if (k.get("player").length > 1) return

		k.debug.log("win")
	});
})

k.go("game")