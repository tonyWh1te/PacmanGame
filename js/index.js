'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas'),
    score = document.querySelector('#score'),
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

  class Ghost extends Circle {
    static speed = 4;

    constructor({ position, velocity, color, radius }) {
      super({ position, color, radius });
      this.velocity = velocity;
      this.prevCollisions = [];
      this.speed = Ghost.speed;
    }

    update() {
      this.draw();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }

  class Pellet extends Circle {}

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

  let lastKey = '',
    count = 0;

  const pellets = [],
    boundaries = [],
    ghosts = [
      new Ghost({
        position: {
          x: Boundary.width * 6 + Boundary.width / 2,
          y: Boundary.height + Boundary.height / 2
        },
        velocity: {
          x: Ghost.speed,
          y: 0
        },
        color: 'red',
        radius: 16
      })
    ];
    
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
    const padding = Boundary.width / 2  - circle.radius - 2; //расстояние между кругом и границей

    return (
      circle.position.y - circle.radius + circle.velocity.y <=
        rectangle.position.y + rectangle.height + padding &&
      circle.position.x + circle.radius + circle.velocity.x >=
        rectangle.position.x - padding &&
      circle.position.y + circle.radius + circle.velocity.y >=
        rectangle.position.y - padding &&
      circle.position.x - circle.radius + circle.velocity.x <=
        rectangle.position.x + rectangle.width + padding
    );
  };

  let animationId;

  //анимация движения
  const animate = () => {
   animationId = requestAnimationFrame(animate); //любой кадр на котором находимся

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
                y: -5,
              },
            },
            rectangle: boundary,
          })
        ) {
          player.velocity.y = 0;
          break;
        } else {
          player.velocity.y = -5;
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
                x: -5,
                y: 0,
              },
            },
            rectangle: boundary,
          })
        ) {
          player.velocity.x = 0;
          break;
        } else {
          player.velocity.x = -5;
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
                y: 5,
              },
            },
            rectangle: boundary,
          })
        ) {
          player.velocity.y = 0;
          break;
        } else {
          player.velocity.y = 5;
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
                x: 5,
                y: 0,
              },
            },
            rectangle: boundary,
          })
        ) {
          player.velocity.x = 0;
          break;
        } else {
          player.velocity.x = 5;
        }
      }
    }

    const choiceDirection = (ghost, collisions) => {
      //проверка на доп. пути, чтобы если что тоже добавить это в список путей
      if (ghost.velocity.x > 0) {
        ghost.prevCollisions.push('right');
      } else if (ghost.velocity.x < 0) {
        ghost.prevCollisions.push('left');
      } else if (ghost.velocity.y < 0) {
        ghost.prevCollisions.push('up');
      } else if (ghost.velocity.y > 0) {
        ghost.prevCollisions.push('down');
      }

      //ищем те пути, которые есть в prevCollisions, но нет в collisions
      const pathways = ghost.prevCollisions.filter(
        (collision) => !collisions.includes(collision)
      );

      return pathways[Math.floor(Math.random() * pathways.length)];
    };

    //перебор массива с конца, чтобы избавиться от мерцаний во время поедания шариков (это происходило из-за их смещения после удаления одного из шаров)
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
        count += 10;
        score.textContent = count;
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
        player.velocity.x = 0;
        player.velocity.y = 0;
      }
    });

    player.update();
    
    ghosts.forEach((ghost) => {
      ghost.update();

      //обработка столкновения с призраком
      if (
        Math.hypot(
          ghost.position.x - player.position.x,
          ghost.position.y - player.position.y
        ) <
        ghost.radius + player.radius
      ) {
        cancelAnimationFrame(animationId);
        console.log('loser');
      }

      const collisions = [];

      boundaries.forEach((boundary) => {

        //попробовать обернуть в функцию
        if (
          !collisions.includes('right') &&
          circleCollidesWithRectangle({
            circle: {
              ...ghost,
              velocity: {
                x: ghost.speed,
                y: 0,
              },
            },
            rectangle: boundary,
          })
        ) {
          collisions.push('right');
        }

        if (
          !collisions.includes('left') &&
          circleCollidesWithRectangle({
            circle: {
              ...ghost,
              velocity: {
                x: -ghost.speed,
                y: 0,
              },
            },
            rectangle: boundary,
          })
        ) {
          collisions.push('left');
        }

        if (
          !collisions.includes('up') &&
          circleCollidesWithRectangle({
            circle: {
              ...ghost,
              velocity: {
                x: 0,
                y: -ghost.speed
              },
            },
            rectangle: boundary,
          })
        ) {
          collisions.push('up');
        }

        if (
          !collisions.includes('down') &&
          circleCollidesWithRectangle({
            circle: {
              ...ghost,
              velocity: {
                x: 0,
                y: ghost.speed
              },
            },
            rectangle: boundary,
          })
        ) {
          collisions.push('down');
        }
      });

      if (collisions.length > ghost.prevCollisions.length) {
        ghost.prevCollisions = collisions;      
      }

      //проверка на появление новых путей
      if (JSON.stringify(collisions) !== JSON.stringify(ghost.prevCollisions)) {
        const direction = choiceDirection(ghost, collisions);

        switch (direction) {
          case 'down':
            ghost.velocity.y = ghost.speed;
            ghost.velocity.x = 0;
            break;
          case 'up':
            ghost.velocity.y = -ghost.speed;
            ghost.velocity.x = 0;
            break;
          case 'right':
            ghost.velocity.y = 0;
            ghost.velocity.x = ghost.speed;
            break;
          case 'left':
            ghost.velocity.y = 0;
            ghost.velocity.x = -ghost.speed;
            break;
        }

        ghost.prevCollisions = [];
      }
    });
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
