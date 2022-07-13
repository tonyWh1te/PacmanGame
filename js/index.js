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
    ['-', '-', '-', '-', '-', '-', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', ' ', '-', ' ', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', ' ', '-', ' ', '-', ' ', '-'],
    ['-', ' ', ' ', ' ', ' ', ' ', '-'],
    ['-', '-', '-', '-', '-', '-', '-'],
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

  //если какая-то из частей круга с учетом скорости станет больше границы по координатам, то игрока останавливают
  const circleCollidesWithRectangle = ({ circle, rectangle }) => {
    return (
      circle.position.y - circle.radius + circle.velocity.y <=
        rectangle.position.y + rectangle.height &&
      circle.position.x + circle.radius + circle.velocity.x >=
        rectangle.position.x &&
      circle.position.y + circle.radius + circle.velocity.y >=
        rectangle.position.y &&
      circle.position.x - circle.radius + circle.velocity.x <=
        rectangle.position.x + rectangle.width
    );
  };

  //анимация движения
  const animate = () => {
    requestAnimationFrame(animate);

    c.clearRect(0, 0, canvas.width, canvas.height);

    if (keys.w.pressed && lastKey === 'w') {
      //то, что в цикле помогает проще проходить в 2 параллельные друг другу границы (потом попробовать засунуть в функцию)
      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];

        if (
          circleCollidesWithRectangle({
            circle: {
              ...player,
              velocity: {
                x: 0,
                y: -3,
              },
            },
            rectangle: boundary,
          })
        ) {
          player.velocity.y = 0;
          break;
        } else {
          player.velocity.y = -3;
        }
      }
    } else if (keys.a.pressed && lastKey === 'a') {
      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];

        if (
          circleCollidesWithRectangle({
            circle: {
              ...player,
              velocity: {
                x: -3,
                y: 0,
              },
            },
            rectangle: boundary,
          })
        ) {
          player.velocity.x = 0;
          break;
        } else {
          player.velocity.x = -3;
        }
      }
    } else if (keys.s.pressed && lastKey === 's') {
      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];

        if (
          circleCollidesWithRectangle({
            circle: {
              ...player,
              velocity: {
                x: 0,
                y: 3,
              },
            },
            rectangle: boundary,
          })
        ) {
          player.velocity.y = 0;
          break;
        } else {
          player.velocity.y = 3;
        }
      }
    } else if (keys.d.pressed && lastKey === 'd') {
      for (let i = 0; i < boundaries.length; i++) {
        const boundary = boundaries[i];

        if (
          circleCollidesWithRectangle({
            circle: {
              ...player,
              velocity: {
                x: 3,
                y: 0,
              },
            },
            rectangle: boundary,
          })
        ) {
          player.velocity.x = 0;
          break;
        } else {
          player.velocity.x = 3;
        }
      }
    }

    boundaries.forEach((boundary) => {
      boundary.draw();

      if (
        circleCollidesWithRectangle({
          circle: player,
          rectangle: boundary,
        })
      ) {
        console.log('rbtbtr');
        player.velocity.x = 0;
        player.velocity.y = 0;
      }
    });

    player.update();
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
