let gamePaused = false;
document.addEventListener("visibilitychange", () => {
  gamePaused = document.hidden;
});

const map = document.querySelector('#map_box');
const player = document.getElementById('player');
const playerBody = player.querySelector('img');
const leftLeg = document.getElementById('left_leg');
const rightLeg = document.getElementById('right_leg');

const keys = {};
const moveKeys = ['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
let speed = 1, leftDeg = 0, rightDeg = 0, degDirection = -1, playerHp = 100;

window.addEventListener('keydown', (event) => {
  if (!moveKeys.includes(event.key)) {
    moveKeys.forEach(key => keys[key] = false);
    return;
  }
  keys[event.key] = true;
});
window.addEventListener('keyup', (event) => {
  if (moveKeys.includes(event.key)) {
    keys[event.key] = false;
  }
});

let x = map.clientWidth / 2;
let y = map.clientHeight / 2;

const movePlayer = () => {
  if (gamePaused) {
    requestAnimationFrame(movePlayer);
    return;
  }

  let dx = 0, dy = 0;
  if (keys['w'] || keys['ArrowUp']) dy -= speed;
  if (keys['s'] || keys['ArrowDown']) dy += speed;
  if (keys['a'] || keys['ArrowLeft']) dx -= speed;
  if (keys['d'] || keys['ArrowRight']) dx += speed;

  const magnitude = Math.hypot(dx, dy);
  if (magnitude > 0) {
    dx /= magnitude;
    dy /= magnitude;
  }

  x += dx * speed;
  y += dy * speed;

  x = Math.max(player.offsetWidth / 2, Math.min(x, map.clientWidth - player.offsetWidth / 2));
  y = Math.max(player.offsetHeight / 2, Math.min(y, map.clientHeight - player.offsetHeight / 2));

  player.style.left = `${x}px`;
  player.style.top = `${y}px`;

  if (dx < 0) {
    playerBody.style.transform = 'scaleX(-1)';
  } else if (dx > 0) {
    playerBody.style.transform = 'scaleX(1)';
  }

  requestAnimationFrame(movePlayer);
};
movePlayer();

const playerWalk = () => {
  if (gamePaused) {
    requestAnimationFrame(playerWalk);
    return;
  }

  if (moveKeys.some(key => keys[key])) {
    leftDeg += (speed * 0.6) * degDirection;
    rightDeg -= (speed * 0.6) * degDirection;
    if (leftDeg <= -15 || leftDeg >= 15) {
      degDirection *= -1;
    }
  } else {
    if (leftDeg > 0) {
      leftDeg = Math.max(0, leftDeg - speed * 0.5);
      rightDeg = Math.min(0, rightDeg + speed * 0.5);
    } else if (leftDeg < 0) {
      leftDeg = Math.min(0, leftDeg + speed * 0.5);
      rightDeg = Math.max(0, rightDeg - speed * 0.5);
    }
  }
  leftLeg.style.transform = `rotate(${leftDeg}deg)`;
  rightLeg.style.transform = `rotate(${rightDeg}deg)`;
  requestAnimationFrame(playerWalk);
};
playerWalk();

let createTime = 3000;
let enemySpeed = 0.5;
let far = 40;
const enemies = [];
let enemyHp = 100;

const Enemy = () => {
  const creat = () => {
    if (gamePaused) return;

    const enemy = document.createElement('div');
    enemy.classList.add('enemy');

    const side = Math.floor(Math.random() * 4);
    let randomX, randomY;
    if (side === 0) { // 상단
      randomX = Math.floor(Math.random() * (map.clientWidth - far * 2 + 1) + far);
      randomY = far;
    } else if (side === 1) { // 하단
      randomX = Math.floor(Math.random() * (map.clientWidth - far * 2 + 1) + far);
      randomY = map.clientHeight - far;
    } else if (side === 2) { // 좌측
      randomX = far;
      randomY = Math.floor(Math.random() * (map.clientHeight - far * 2 + 1) + far);
    } else if (side === 3) { // 우측
      randomX = map.clientWidth - far;
      randomY = Math.floor(Math.random() * (map.clientHeight - far * 2 + 1) + far);
    }

    enemy.style.left = `${randomX}px`;
    enemy.style.top = `${randomY}px`;
    map.appendChild(enemy);

    const enemyData = {
      element: enemy,
      x: randomX,
      y: randomY,
      speed: enemySpeed,
      hp: enemyHp
    };
    enemies.push(enemyData);

    const move = () => {
      if (gamePaused) {
        requestAnimationFrame(move);
        return;
      }

      const px = x - enemyData.x;
      const py = y - enemyData.y;
      const distance = Math.sqrt(px * px + py * py);

      if (distance > player.offsetWidth) {
        enemyData.x += (px / distance) * enemyData.speed;
        enemyData.y += (py / distance) * enemyData.speed;

        for (const other of enemies) {
          if (other === enemyData) continue;
          const ex = other.x - enemyData.x;
          const ey = other.y - enemyData.y;
          const enemyDistance = Math.sqrt(ex * ex + ey * ey);
          if (enemyDistance < player.offsetWidth) {
            enemyData.x -= (ex / enemyDistance) * enemyData.speed;
            enemyData.y -= (ey / enemyDistance) * enemyData.speed;
          }
        }
      } else {
        enemyData.x -= (px / distance) * speed;
        enemyData.y -= (py / distance) * speed;
      }

      const enemyWidth = enemyData.element.offsetWidth;
      const enemyHeight = enemyData.element.offsetHeight;
      enemyData.x = Math.max(enemyWidth / 2, Math.min(enemyData.x, map.clientWidth - enemyWidth / 2));
      enemyData.y = Math.max(enemyHeight / 2, Math.min(enemyData.y, map.clientHeight - enemyHeight / 2));

      enemyData.element.style.left = `${enemyData.x}px`;
      enemyData.element.style.top = `${enemyData.y}px`;

      requestAnimationFrame(move);
    };
    move();
  };

  setInterval(() => {
    if (!gamePaused) creat();
  }, createTime);
};
Enemy();

const attackTime = 1;
const bulletSpeed = 3;
const bullets = [];
const bulletDamage = 50;

const findClosestEnemy = () => {
  let closestEnemy = null;
  let minDistance = Infinity;
  for (const enemy of enemies) {
    const px = x - enemy.x;
    const py = y - enemy.y;
    const distance = Math.sqrt(px * px + py * py);
    if (distance < minDistance) {
      minDistance = distance;
      closestEnemy = enemy;
    }
  }
  return closestEnemy;
};

const shoot = () => {
  if (gamePaused) return;

  const target = findClosestEnemy();
  if (!target) return;

  const bullet = document.createElement('div');
  bullet.classList.add('bullet');
  bullet.style.left = `${x}px`;
  bullet.style.top = `${y}px`;
  map.appendChild(bullet);

  const deltaX = target.x - x;
  const deltaY = target.y - y;
  const distance = Math.hypot(deltaX, deltaY);
  if (distance === 0) return;

  const vx = deltaX / distance;
  const vy = deltaY / distance;
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  bullet.style.transform = `rotate(${angle}deg)`;

  const bulletData = {
    element: bullet,
    x: x,
    y: y,
    vx: vx,
    vy: vy,
    target: target
  };
  bullets.push(bulletData);

  const moveBullet = () => {
    if (gamePaused) {
      requestAnimationFrame(moveBullet);
      return;
    }

    bulletData.x += bulletData.vx * bulletSpeed;
    bulletData.y += bulletData.vy * bulletSpeed;
    bulletData.element.style.left = `${bulletData.x}px`;
    bulletData.element.style.top = `${bulletData.y}px`;

    const bulletRect = bulletData.element.getBoundingClientRect();
    const targetRect = bulletData.target.element.getBoundingClientRect();
    if (
      bulletRect.left < targetRect.right &&
      bulletRect.right > targetRect.left &&
      bulletRect.top < targetRect.bottom &&
      bulletRect.bottom > targetRect.top
    ) {
      bulletData.element.remove();
      bullets.splice(bullets.indexOf(bulletData), 1);

      bulletData.target.hp -= bulletDamage;
      if (bulletData.target.hp <= 0) {
        bulletData.target.element.remove();
        enemies.splice(enemies.indexOf(bulletData.target), 1);
      }
      return;
    }

    if (
      bulletData.x < 0 ||
      bulletData.x > map.clientWidth ||
      bulletData.y < 0 ||
      bulletData.y > map.clientHeight
    ) {
      bulletData.element.remove();
      bullets.splice(bullets.indexOf(bulletData), 1);
      return;
    }

    requestAnimationFrame(moveBullet);
  };
  moveBullet();
};

setInterval(() => {
  if (!gamePaused) shoot();
}, attackTime * 1000);
