'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas'),
    c = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  class Boundary {
    static width = 30;
    static height = 30;

    constructor({ position }) {
      this.position = position;
      this.width = 30;
      this.height = 30;
    }

    draw() {
      c.fillStyle = 'blue';
      c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
  }

  class Player {
    constructor({ position, velocity }) {
      this.position = position;
      this.velocity = velocity;
      this.radius = 12;
    }

    draw() {
      c.beginPath();
      c.arc(this.position.x, this.position.y, this.radius, Math.PI * 2, 0);
      c.fillStyle = 'yellow';
      c.fill();
      c.closePath();
    }

    update() {
      this.draw();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }

  //здесь отрисовка границ карты черточками
  const map = [
    ['-', '-', '-', '-', '-', '-'],
    ['-', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', '-', ' ', '-'],
    ['-', ' ', ' ', ' ', ' ', '-'],
    ['-', '-', '-', '-', '-', '-'],
  ];

  const keys = {
    w: {
      pressed: false,
    },
    a: {
      pressed: false,
    },
    s: {
      pressed: false,
    },
    d: {
      pressed: false,
    },
  };

  let lastKey = '';
  
  const boundaries = [];
  const player = new Player({
    position: {
      x: Boundary.width + Boundary.width / 2,
      y: Boundary.height + Boundary.height / 2,
    },
    velocity: {
      x: 0,
      y: 0,
    },
  });

  //формируем массив с границами
  map.forEach((row, index) => {
    row.forEach((symbol, j) => {
      switch (symbol) {
        case '-':
          boundaries.push(
            new Boundary({
              position: {
                x: Boundary.width * j,
                y: Boundary.height * index,
              },
            })
          );
          break;

        default:
          break;
      }
    });
  });

  //анимация движения
  const animate = () => {
    requestAnimationFrame(animate);

    c.clearRect(0, 0, canvas.width, canvas.height);

    boundaries.forEach((boundary) => boundary.draw());

    player.update();

    player.velocity.x = 0;
    player.velocity.y = 0;

    if (keys.w.pressed && lastKey === 'w') {
      player.velocity.y = -5;
    } else if (keys.a.pressed && lastKey === 'a') {
      player.velocity.x = -5;
    } else if (keys.s.pressed && lastKey === 's') {
      player.velocity.y = 5;
    } else if (keys.d.pressed && lastKey === 'd') {
      player.velocity.x = 5;
    }
  };

  animate();

  addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'w':
        keys.w.pressed = true;
        lastKey = 'w';
        break;
      case 'a':
        keys.a.pressed = true;
        lastKey = 'a';
        break;
      case 's':
        keys.s.pressed = true;
        lastKey = 's';
        break;
      case 'd':
        keys.d.pressed = true;
        lastKey = 'd';
        break;
      default:
        break;
    }
  });

  addEventListener('keyup', (event) => {
    switch (event.key) {
      case 'w':
        keys.w.pressed = false;
        break;
      case 'a':
        keys.a.pressed = false;
        break;
      case 's':
        keys.s.pressed = false;
        break;
      case 'd':
        keys.d.pressed = false;
        break;
      default:
        break;
    }
  });
});
