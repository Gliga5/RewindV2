import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs";

const k = kaboom({
	width: 800,
	height: 600
})

k.loadSprite("bean", "sprites/bean.png")

const SPEED = 200

const iterations = [[]]

k.scene("game", ({ firstTime }) => {
	k.setGravity(2000)
	if (!firstTime) k.shake(20)

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
			k.area({
				collisionIgnore: ["player"], shape: new k.Polygon([
					k.vec2(-61 / 2 + 10, 53 / 2 - 10),
					k.vec2(-61 / 2, 10),
					k.vec2(-61 / 2, -10),
					k.vec2(-61 / 2 + 10, -53 / 2 + 10),
					k.vec2(-10, -53 / 2),
					k.vec2(10, -53 / 2),
					k.vec2(61 / 2 - 10, -53 / 2 + 10),
					k.vec2(61 / 2, -10),
					k.vec2(61 / 2, 10),
					k.vec2(61 / 2 - 10, 53 / 2 - 10),
					k.vec2(10, 53 / 2),
					k.vec2(-10, 53 / 2),
				])
			}),
			k.body(),
			"player"
		])

		let i = 0
		clone.onUpdate(async () => {
			for (const newIter of iter[i]) {
				if (newIter == "REWIND") {
					if (clone.isColliding(door)) {
						k.destroy(clone)
						if (k.get('player').length == 0) {
							k.shake(20)
							await k.wait(1)
							k.go('game', { firstTime: false })
						}
					} else {
						k.debug.log("paradox")
						k.shake(50)
						for (const p of k.get("player")) {
							k.addKaboom(p.pos)
						}
						k.destroyAll("player")
					}

					return;
				} else if (newIter == "RIGHT") {
					if (clone.pos.x < 800 - 61 / 2) {
						clone.move(SPEED, 0)
					}

				} else if (newIter == "LEFT") {
					if (clone.pos.x > 61 / 2) {
						clone.move(-SPEED, 0)
					}
				} else if (newIter == "JUMP") {
					if (clone.isGrounded()) {
						clone.jump(600)
					}
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
		k.area({
			collisionIgnore: ["player"], shape: new k.Polygon([
				k.vec2(-61 / 2 + 10, 53 / 2 - 10),
				k.vec2(-61 / 2, 10),
				k.vec2(-61 / 2, -10),
				k.vec2(-61 / 2 + 10, -53 / 2 + 10),
				k.vec2(-10, -53 / 2),
				k.vec2(10, -53 / 2),
				k.vec2(61 / 2 - 10, -53 / 2 + 10),
				k.vec2(61 / 2, -10),
				k.vec2(61 / 2, 10),
				k.vec2(61 / 2 - 10, 53 / 2 - 10),
				k.vec2(10, 53 / 2),
				k.vec2(-10, 53 / 2),
			])
		}),
		k.body(),
		"player"
	])

	player.onUpdate(() => {
		iterations[iterations.length - 1].push([])
	})

	player.onKeyDown("right", () => {
		iterations[iterations.length - 1][(iterations[iterations.length - 1]).length - 1].push("RIGHT")

		if (player.pos.x >= 800 - 61 / 2) return

		player.move(SPEED, 0)
	})
	player.onKeyDown("left", () => {
		iterations[iterations.length - 1][(iterations[iterations.length - 1]).length - 1].push("LEFT")

		if (player.pos.x <= 61 / 2) return

		player.move(-SPEED, 0)
	})
	player.onKeyDown("up", () => {
		iterations[iterations.length - 1][(iterations[iterations.length - 1]).length - 1].push("JUMP")
		if (player.isGrounded()) {
			player.jump(600)
		}
	})

	player.onKeyPress("space", async () => {
		if (!player.isColliding(door)) return

		k.debug.log("rewind")
		iterations[iterations.length - 1][(iterations[iterations.length - 1]).length - 1].push("REWIND")
		iterations.push([])

		k.destroy(player)
		if (k.get('player').length == 0) {
			k.shake(20)
			await k.wait(1)
			k.go('game', { firstTime: false })
		}

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
			let ct = 0
			const allPlayers = k.get("player")
			for (const p of allPlayers) {
				if (!p.checkCollision(tower)?.displacement?.y != 0) ct++
			}
			if (ct == allPlayers.length) tower.move(0, 200)
		}
		pressed = false
	})

	k.add([
		k.rect(k.width() + 4, 50),
		k.outline(4),
		k.area(),
		k.pos(-2, k.height() - 48),
		k.body({ isStatic: true }),
	])

	k.add([
		k.rect(300, 46),
		k.outline(4),
		k.area(),
		k.pos(-2, 170),
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

		k.destroy(player)
		k.shake(20)
		k.debug.log("win")
	});
})

k.go("game", { firstTime: true })