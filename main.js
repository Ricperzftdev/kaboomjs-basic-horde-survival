import kaboom from "kaboom";

kaboom({
  width: 320,
  height: 240,
  background: [17, 16, 24],
});

const UI = add([fixed(), z(100)]);
const SHOOTING_AREA = add([fixed(), z(0)]);
const ENTITIES = add([fixed(), z(1)]);

let score = 0;
let coins = 0;
let enemyHealth = 2;
let coinsPerKill = 2;
let playerDamage = 1;
let playerAttackSpeed = 0.723;
let playerDamageLevel = 1;
let playerAttackSpeeLevel = 1;
let coinsToUpgrade = 4;
const timeObj = {
  minute: 0,
  second: 0,
};

const timerLabel = UI.add([
  text("0:00", { size: 14 }),
  anchor("center"),
  pos(width() / 2, 24),
  "timer",
]);

loop(1, () => {
  if (time().toFixed() >= 60) {
    timeObj.minute++;
    timeObj.second = 0;
  }

  timeObj.second++;

  timerLabel.text = `${timeObj.minute}:${timeObj.second >= 10 ? "" : 0}${
    timeObj.second
  }`;
});

const scoreBoard = UI.add([
  pos(20, 20),
  rect(40, 30),
  outline(2, Color.fromArray([45, 59, 70])),
  color(17, 16, 24),
  area(),
  "scoreboard",
]);

const enemyStatsBoard = scoreBoard.add([
  pos(44, 0),
  rect(150, 30),
  outline(2, Color.fromArray([45, 59, 70])),
  color(17, 16, 24),
  area(),
  opacity(0),
]);

const enemyHealthLabel = enemyStatsBoard.add([
  pos(5, 3),
  text(`Enemy healh: ${enemyHealth}`, { size: 12 }),
  opacity(0),
]);

const coinsPerKillLabel = enemyStatsBoard.add([
  pos(5, 15),
  text(`Coins per kill: ${coinsPerKill}`, { size: 12 }),
  opacity(0),
]);

onHoverUpdate("scoreboard", () => {
  enemyStatsBoard.opacity = 1;
  enemyHealthLabel.opacity = 1;
  coinsPerKillLabel.opacity = 1;
});

onHoverEnd("scoreboard", () => {
  enemyStatsBoard.opacity = 0;
  enemyHealthLabel.opacity = 0;
  coinsPerKillLabel.opacity = 0;
});

const enemyIcon = scoreBoard.add([
  pos(5, 5),
  rect(5, 5),
  outline(2, Color.fromArray([185, 26, 89])),
  color(17, 16, 24),
]);

const coinIcon = scoreBoard.add([
  pos(5, 20),
  circle(2.5),
  anchor("topleft"),
  color(225, 195, 103),
]);

const statsBoard = UI.add([
  pos(20, height() - 50),
  rect(150, 30),
  outline(2, Color.fromArray([45, 59, 70])),
  color(17, 16, 24),
  area(),
  "stats",
]);

const playerDamageLabel = statsBoard.add([
  pos(5, 3),
  text(`Damage: ${playerDamage}`, { size: 12 }),
]);

const playerAttackSpeedLabel = statsBoard.add([
  pos(5, 15),
  text(`Attack Speed: ${playerAttackSpeed}/s`, { size: 12 }),
]);

const scoreLabel = enemyIcon.add([pos(10, -2), text(score, { size: 10 })]);

const coinsLabel = coinIcon.add([pos(10, -2), text(coins, { size: 10 })]);

function addButton(txt, p, f, tag, level, coins) {
  const btn = UI.add([
    rect(80, 30, { radius: 8 }),
    pos(...p),
    area(),
    anchor("center"),
    tag,
  ]);

  btn.add([
    text(txt, { size: 12, align: "center" }),
    anchor("center"),
    color(0, 0, 0),
  ]);

  btn.onHoverUpdate(() => {
    setCursor("pointer");
  });

  btn.onHoverEnd(() => {
    setCursor("default");
  });

  btn.onClick(f);

  return btn;
}

addButton(
  `Upgrade
damage`,
  [width() - 60, height() - 70],
  () => {
    if (coins >= coinsToUpgrade * playerDamageLevel) {
      coins -= coinsToUpgrade * playerDamageLevel;
      coinsLabel.text = coins;
      playerDamageLevel++;
      playerDamage++;
      playerDamageLabel.text = `Damage: ${playerDamage}`;
    }
  },
  "damageBtn",
  playerDamageLevel,
  coinsToUpgrade * playerDamageLevel
);

onUpdate("damageBtn", (btn) => {
  if (coins < coinsToUpgrade * playerDamageLevel) {
    btn.color = Color.fromArray([120, 120, 120]);
  } else {
    btn.color = Color.fromArray([255, 255, 255]);
  }
});

addButton(
  `Upgrade
A. Speed`,
  [width() - 60, height() - 35],
  () => {
    if (coins >= coinsToUpgrade * playerAttackSpeeLevel) {
      coins -= coinsToUpgrade * playerAttackSpeeLevel;
      coinsLabel.text = coins;
      playerAttackSpeeLevel++;
      playerAttackSpeed -= 0.05;
      playerAttackSpeedLabel.text = `Attack Speed: ${playerAttackSpeed.toFixed(
        3
      )}/s`;
    }
  },
  "attackSpeedBtn",
  playerAttackSpeeLevel,
  coinsToUpgrade * playerAttackSpeeLevel
);

onUpdate("attackSpeedBtn", (btn) => {
  if (coins < coinsToUpgrade * playerAttackSpeeLevel) {
    btn.color = Color.fromArray([120, 120, 120]);
  } else {
    btn.color = Color.fromArray([255, 255, 255]);
  }
});

const player = ENTITIES.add([
  pos(width() / 2 - 7.5, height() / 2 - 7.5),
  rect(15, 15),
  outline(2, Color.fromArray([173, 220, 255])),
  color(17, 16, 24),
  area(),
  body(),
  "player",
]);

const shootingAreaBackground = SHOOTING_AREA.add([
  pos(center()),
  circle(50),
  color(45, 59, 70),
  "areaBackground",
]);

const shootingAreaOutline = SHOOTING_AREA.add([
  pos(center()),
  area(),
  circle(48),
  color(17, 16, 24),
  "areaOutline",
]);

function spawnEnemy() {
  if (!player.exists()) return;
  const side = Math.floor(Math.random() * 4);
  let x, y;

  switch (side) {
    case 0: // Top
      x = Math.random() * width();
      y = -10;
      break;
    case 1: // Bot
      x = Math.random() * width();
      y = height() + 10;
      break;
    case 2: // Left
      x = -10;
      y = Math.random() * height();
      break;
    case 3: // Right
      x = width() + 10;
      y = Math.random() * height();
      break;
  }

  const enemy = ENTITIES.add([
    pos(x, y),
    rect(10, 10),
    outline(2, Color.fromArray([185, 26, 89])),
    color(17, 16, 24),
    area(),
    "enemy",
    state("move", ["move"]),
    {
      health: enemyHealth,
    },
  ]);

  const enemyBar = enemy.add([
    pos(0, -3),
    rect(10, 2),
    anchor("botleft"),
    color(185, 26, 89),
    opacity(0.5),
    "healthBar",
  ]);

  enemy.onStateUpdate("move", () => {
    const dir = player.pos.sub(enemy.pos).unit();
    enemy.move(dir.scale(50));
  });

  enemy.onCollide("areaOutline", () => {
    loop(playerAttackSpeed, () => {
      if (!enemy.exists()) return;
      const bullet = ENTITIES.add([
        pos(player.pos.x + 7.5, player.pos.y + 7.5),
        move(player.pos.angle(enemy.pos) + 180, 100),
        circle(2),
        area(),
        anchor("center"),
        color(173, 220, 255),
        "bullet",
        offscreen({ destroy: true }),
        {
          damage: playerDamage,
        },
      ]);
      bullet.onCollide("enemy", (enemy) => {
        destroy(bullet);
        enemyBar.opacity = 1;
        const enemyHealthAfterAttack = enemy.health - bullet.damage;
        enemy.health = enemyHealthAfterAttack;
        enemyBar.width =
          enemyHealthAfterAttack <= 0
            ? 0
            : enemyBar.width * (enemyHealthAfterAttack / enemyHealth);
        if (enemy.health <= 0) {
          const rewardPerKill = ENTITIES.add([
            pos(enemy.pos.x + 5, enemy.pos.y),
            text(`+${coinsPerKill} `, { size: 11 }),
            move(UP, 30),
            anchor("center"),
            color(255, 255, 255),
            "reward",
          ]);
          rewardPerKill.add([
            pos(9.5, -0.4),
            circle(3),
            color(225, 195, 103),
            anchor("center"),
          ]);

          destroy(enemy);
          score++;
          coins += coinsPerKill;
          scoreLabel.text = score;
          coinsLabel.text = coins;

          wait(0.3, () => {
            destroy(rewardPerKill);
          });
        }
      });
    });
  });

  player.onCollide("enemy", (enemy) => {
    destroy(player);
    addKaboom(player.pos);
  });
}

loop(3, spawnEnemy);
