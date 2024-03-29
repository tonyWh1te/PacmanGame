'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.querySelector('canvas'),
    score = document.querySelector('#score'),
    c = canvas.getContext('2d');

  setCanvasSize();

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
      c.fillStyle = this.color;
      c.arc(this.position.x, this.position.y, this.radius, Math.PI * 2, 0);
      c.fill();
      c.closePath();
    }
  }

  class Player extends Circle {
    constructor({ position, velocity, color, radius }) {
      super({ position, color, radius });
      this.velocity = velocity;
      this.radians = 0.75;
      this.openRate = 0.12;
      this.rotation = 0;
    }

    draw() {
      c.save();
      c.translate(this.position.x, this.position.y); //перемещает начало холста прямо в пакмана
      c.rotate(this.rotation);
      c.translate(-this.position.x, -this.position.y); //возвращаем холст обратно
      c.beginPath();
      c.fillStyle = this.color;
      c.arc(
        this.position.x,
        this.position.y,
        this.radius,
        this.radians,
        Math.PI * 2 - this.radians
      );
      c.lineTo(this.position.x, this.position.y);
      c.fill();
      c.closePath();
      c.restore();
    }

    update() {
      this.draw();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      if (this.radians < 0 || this.radians > 0.75) {
        this.openRate = -this.openRate;
      }

      this.radians += this.openRate;
    }
  }

  class Ghost extends Circle {
    static speed = 3;

    constructor({ position, velocity, color, radius }) {
      super({ position, color, radius });
      this.velocity = velocity;
      this.prevCollisions = [];
      this.speed = Ghost.speed;
      this.scared = false;
    }

    draw() {
      c.beginPath();
      c.fillStyle = this.scared ? 'white' : this.color;
      c.arc(this.position.x, this.position.y, this.radius, Math.PI * 2, 0);
      c.fill();
      c.closePath();
    }

    update() {
      this.draw();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    }
  }

  class Pellet extends Circle {}

  class PowerUp extends Circle {}

  //здесь отрисовка границ карты черточками
  const map = [
    ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '7', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
    ['|', 'p', '.', '.', '.', '.', '.', '.', '.', '.', '.','|', '.', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
    ['|', '.', '[', ']', '.', '[', '-', '-', '-', ']', '.', '_', '.', '[', '-', '-', '-', ']', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.',  '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', '[', ']', '.', '^', '.', '[', '-', '-', '-', '7', '-', '-', '-', ']', '.', '^', '.', '[', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '|'],
    ['4', '-', '-', '2', '.', '4', '-', '-', '-', ']', '.', '_', '.', '[', '-', '-', '-', '3', '.', '1', '-', '-', '3'],
    ['', '', '', '|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|', '', '', ''],
    ['1', '-', '-', '3', '.', 'b', '.', '[', '-', '-', '-', '-', '-', '-', '-', ']', '.', 'b', '.', '4', '-', '-', '2'],
    ['|', 'p', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['|', '.', '[', '2', '.', '[', '-', ']', '.', 'b', '.', 'b', '.', 'b', '.', '[', '-', ']', '.', '1', ']', '.', '|'],
    ['|', '.', '.', '|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|', '.', 'p', '|'],
    ['|', 'b', '.', '_', '.', '^', '.', '[', '-', '-', '-', '7', '-', '-', '-', ']', '.', '^', '.', '_', '.', 'b', '|'],
    ['|', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '.', '|', '.', '.', '.', '.', '|'],
    ['|', '.', '[', '-', '-', '5', '-', '-', '-', ']', '.', '_', '.', '[', '-', '-', '-', '5', '-', '-', ']', '.', '|'],
    ['|', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
    ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3'],
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
    powerUps = [],
    ghosts = [
      // new Ghost({
      //   position: {
      //     x: Boundary.width * 13 + Boundary.width / 2,
      //     y: Boundary.height * 5 + Boundary.height / 2,
      //   },
      //   velocity: {
      //     x: Ghost.speed,
      //     y: 0,
      //   },
      //   color: 'red',
      //   radius: 16,
      // })
    ];

  //получили призраков из бд
  fetch('./db.json')
    .then((data) => data.json())
    .then((res) =>
      Object.keys(res).forEach((key) =>
        res[key].forEach((ghost) => ghosts.push(new Ghost(ghost)))
      )
    );
    
  const player = new Player({
    position: {
      x: Boundary.width * 11 + Boundary.width / 2,
      y: Boundary.height * 15 + Boundary.height / 2,
    },
    velocity: {
      x: 0,
      y: 0,
    },
    color: 'yellow',
    radius: 16
  });

  function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

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
          case 'p':
            powerUps.push(
              new PowerUp({
                position: {
                  x: j * Boundary.width + Boundary.width / 2,
                  y: i * Boundary.height + Boundary.height / 2,
                },
                color: 'orange',
                radius: 8
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

  const circleCollidesWithCircle = ({firstCircle, secondCircle}) => {
    return (
      Math.hypot(
        firstCircle.position.x - secondCircle.position.x,
        firstCircle.position.y - secondCircle.position.y
      ) <
      firstCircle.radius + secondCircle.radius
    );
  };

  const collisionCheck = (side, sides, circle, rectangle) => {
    let x = 0,
      y = 0;

    switch (side) {
      case 'left':
        x = -circle.speed;
        break;
      case 'right':
        x = circle.speed;
        break;
      case 'up':
        y = -circle.speed;
        break;
      case 'down':
        y = circle.speed;
        break;
    }

    return (
      !sides.includes(side) &&
      circleCollidesWithRectangle({
        circle: {
          ...circle,
          velocity: {
            x: x,
            y: y,
          },
        },
        rectangle: rectangle,
      })
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

    // условие выигрыша
    if (pellets.length === 0) {
      console.log('win');
      cancelAnimationFrame(animationId);
    }

    //перебор массива с конца, чтобы избавиться от мерцаний во время поедания шариков (это происходило из-за их смещения после удаления одного из шаров)
    for (let i = pellets.length - 1; i >= 0; i--) {
      const pellet = pellets[i];

      pellet.draw();

      if (
        circleCollidesWithCircle({
        firstCircle: pellet,
        secondCircle: player
      })) {
        count += 10;
        score.textContent = count;
        pellets.splice(i, 1);
      }
    }

    //усиление (заставляет призраков испугаться) (убрать повторение кода этого и предыдущего цикла)
    for (let i = powerUps.length - 1; i >= 0; i--) {
      const powerUp = powerUps[i];

      powerUp.draw();

      if (
        circleCollidesWithCircle({
          firstCircle: powerUp,
          secondCircle: player,
        })
      ) {
        powerUps.splice(i, 1);

        ghosts.forEach((ghost) => {
          ghost.scared = true;

          setTimeout(() => {
            ghost.scared = false;
          }, 5000);
        });
      }
    }

    //обработка столкновения с призраком
    for (let i = ghosts.length - 1; i >= 0; i--) {
      const ghost = ghosts[i];

      if (
        circleCollidesWithCircle({
          firstCircle: ghost,
          secondCircle: player,
        })
      ) {
        if (ghost.scared) {
          ghosts.splice(i, 1);
        } else {
          cancelAnimationFrame(animationId);
          console.log('loser');
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
        player.velocity.x = 0;
        player.velocity.y = 0;
      }
    });

    player.update();

    ghosts.forEach((ghost) => {
      ghost.update();

      const collisions = [];

      boundaries.forEach((boundary) => {
        //попробовать обернуть в функцию
        if (collisionCheck('right', collisions, ghost, boundary)) {
          collisions.push('right');
        }

        if (collisionCheck('left', collisions, ghost, boundary)) {
          collisions.push('left');
        }

        if (collisionCheck('up', collisions, ghost, boundary)) {
          collisions.push('up');
        }

        if (collisionCheck('down', collisions, ghost, boundary)) {
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

    if (player.velocity.x > 0) {
      player.rotation = 0;
    } else if (player.velocity.x < 0) {
      player.rotation = Math.PI;
    } else if (player.velocity.y > 0) {
      player.rotation = Math.PI / 2;
    } else if (player.velocity.y < 0) {
      player.rotation = Math.PI * 1.5;
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
