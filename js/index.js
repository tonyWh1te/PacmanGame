'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas'),
    c = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  class Boundary {
    static width = 40;
    static height = 40;

    constructor({ position, img }) {
      this.position = position;
      this.width = Boundary.width;
      this.height = Boundary.height;
      this.img = img;
    }

    draw() {
      // c.fillStyle = 'blue';
      // c.fillRect(this.position.x, this.position.y, this.width, this.height);

      c.drawImage(this.img, this.position.x, this.position.y);
    }
  }

  class Circle {
    constructor({ position, color, radius }) {
      this.position = position;
      this.color = color;
      this.radius = radius;
    }

    draw() {
      c.beginPath();
      c.arc(this.position.x, this.position.y, this.radius, Math.PI * 2, 0);
      c.fillStyle = this.color;
      c.fill();
      c.closePath();
    }
  }

  class Player extends Circle {
    constructor({ position, velocity, color, radius }) {
      super({ position, color, radius });
      this.velocity = velocity;
    }

    update() {
      this.draw();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }

  class Pellet extends Circle {

  }

  //здесь отрисовка границ карты черточками
  const map = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
    ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3'],
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

  const pellets = [],
    boundaries = [];
    
  const player = new Player({
    position: {
      x: Boundary.width + Boundary.width / 2,
      y: Boundary.height + Boundary.height / 2,
    },
    velocity: {
      x: 0,
      y: 0,
    },
    color: 'yellow',
    radius: 16
  });

  const createImage = (src) => {
    const img = new Image();
    img.src = src;

    return img;
  };

  const createBoundary = (j, i, src) =>
    new Boundary({
      position: {
        x: Boundary.width * j,
        y: Boundary.height * i,
      },
      img: createImage(src),
    });

  //формируем массив с границами
  map.forEach((row, i) => {
    row.forEach((symbol, j) => {
      switch (symbol) {
        case '-':
          boundaries.push(
            createBoundary(j, i, 'assets/pipeHorizontal.png')
            );
          break;
        case '|':
          boundaries.push(
            createBoundary(j, i, 'assets/pipeVertical.png')
            );
          break;
        case '1':
          boundaries.push(
            createBoundary(j, i, 'assets/pipeCorner1.png')
            );
          break;
        case '2':
          boundaries.push(
            createBoundary(j, i, 'assets/pipeCorner2.png')
            );
          break;
        case '3':
          boundaries.push(
            createBoundary(j, i, 'assets/pipeCorner3.png')
            );
          break;
        case '4':
          boundaries.push(
            createBoundary(j, i, 'assets/pipeCorner4.png')
            );
          break;
        case 'b':
          boundaries.push(
            createBoundary(j, i, 'assets/block.png')
            );
          break;
        case '[':
          boundaries.push(
            createBoundary(j, i, 'assets/capLeft.png')
            );
          break;
        case ']':
          boundaries.push(
            createBoundary(j, i, 'assets/capRight.png')
            );
          break;
        case '_':
          boundaries.push(
            createBoundary(j, i, 'assets/capBottom.png')
            );
          break;
        case '^':
          boundaries.push(
            createBoundary(j, i, 'assets/capTop.png')
            );
          break;
        case '+':
          boundaries.push(
            createBoundary(j, i, 'assets/pipeCross.png')
            );
          break;
        case '5':
          boundaries.push(
            createBoundary(j, i, 'assets/pipeConnectorTop.png')
            );
          break;
        case '6':
          boundaries.push(
            createBoundary(j, i, 'assets/pipeConnectorRight.png')
          );
          break;
        case '7':
          boundaries.push(
            createBoundary(j, i, 'assets/pipeConnectorBottom.png')
          );
          break;
        case '8':
          boundaries.push(
            createBoundary(j, i, 'assets/pipeConnectorLeft.png')
            );
          break;
        case '.':
          pellets.push(
            new Pellet({
              position: {
                x: j * Boundary.width + Boundary.width / 2,
                y: i * Boundary.height + Boundary.height / 2
              },
              color: 'white',
              radius: 3
            })
          );
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
                y: -4,
              },
            },
            rectangle: boundary,
          })
        ) {
          player.velocity.y = 0;
          break;
        } else {
          player.velocity.y = -4;
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
                x: -4,
                y: 0,
              },
            },
            rectangle: boundary,
          })
        ) {
          player.velocity.x = 0;
          break;
        } else {
          player.velocity.x = -4;
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
                y: 4,
              },
            },
            rectangle: boundary,
          })
        ) {
          player.velocity.y = 0;
          break;
        } else {
          player.velocity.y = 4;
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
                x: 4,
                y: 0,
              },
            },
            rectangle: boundary,
          })
        ) {
          player.velocity.x = 0;
          break;
        } else {
          player.velocity.x = 4;
        }
      }
    }

    for (let i = pellets.length - 1; i > 0; i--) {
      const pellet = pellets[i];

      pellet.draw();

      if (
        Math.hypot(
          pellet.position.x - player.position.x,
          pellet.position.y - player.position.y
        ) <
        pellet.radius + player.radius
      ) {
        console.log('touch');
        pellets.splice(i, 1);
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
        console.log('boom');
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
