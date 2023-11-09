import kaboom from "https://unpkg.com/kaboom@3000.0.1/dist/kaboom.mjs";

const k = kaboom({
	width: 800,
	height: 600,
})

k.loadSprite("bean", "sprites/bean.png")

const SPEED = 200

const iterations = []

k.scene("game", () => {
	k.setGravity(2000)

	for (const iter of iterations) {
		const clone = k.add([
			k.pos(100, k.height() - 48),
			k.sprite("bean"),
			k.anchor("center"),
			k.z(-2),
			k.area({ collisionIgnore: ["player"] }),
			k.body(),
			"player"
		])

		let i = 1;
		clone.onUpdate(() => {
			if (iter[i] == null) {
				k.addKaboom(clone.pos)
				k.destroy(clone)
				return;
			} else if (iter[i] == "RIGHT") {
				clone.move(SPEED, 0)
			} else if (iter[i] == "LEFT") {
				clone.move(-SPEED, 0)
			} else if (iter[i] == "JUMP") {
				clone.jump(600)
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
	iterations.push([]);

	player.onUpdate(() => {
		iterations[iterations.length - 1].push("")
	})

	k.onKeyDown("right", () => {
		player.move(SPEED, 0)
		iterations[iterations.length - 1].pop()
		iterations[iterations.length - 1].push("RIGHT")
	})
	k.onKeyDown("left", () => {
		player.move(-SPEED, 0)
		iterations[iterations.length - 1].pop()
		iterations[iterations.length - 1].push("LEFT")
	})
	k.onKeyDown("up", () => {
		if (player.isGrounded()) {
			player.jump(600)
			iterations[iterations.length - 1].pop()
			iterations[iterations.length - 1].push("JUMP")
		}
	})
	k.onKeyPress("space", () => {
		k.debug.log("rewind")
		k.addKaboom(player.pos)
		k.go("game")
	})

	const button = k.add([
		k.rect(70, 10),
		k.outline(4),
		k.pos(700, k.height() - 48),
		k.anchor("bot"),
		k.color(k.BLACK),
		k.area(),
	])


	let collided = false;
	const tower = k.add([
		k.rect(150, 20),
		k.outline(4),
		k.area(),
		k.pos(450, k.height() - 48),
		// Give objects a body() component if you don't want other solid objects pass through
		k.body({ isStatic: true }),
		k.anchor("bot"),
	])

	button.onCollide("player", () => {
		collided = true
	})
	button.onCollideEnd("player", () => {
		collided = false
	})

	button.onUpdate(() => {
		if (collided && tower.pos.y > 200) {
			tower.move(0, -200)
		} else if (!collided && tower.pos.y < k.height() - 48) {
			tower.move(0, 200)
		}

	})

	k.add([
		k.rect(k.width() - 4, 46),
		k.outline(4),
		k.area(),
		k.pos(2, k.height() - 48),
		// Give objects a body() component if you don't want other solid objects pass through
		k.body({ isStatic: true }),
	])

	k.add([
		k.rect(300, 46),
		k.outline(4),
		k.area(),
		k.pos(2, 170),
		// Give objects a body() component if you don't want other solid objects pass through
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

	k.add([
		k.rect(70, 100),
		k.outline(4),
		k.pos(100, k.height() - 48),
		k.anchor("bot"),
		k.color(k.CYAN),
		k.z(-3)
	])

	k.onCollide("win", "player", () => {
		k.debug.log("win")
	});
})

k.go("game")