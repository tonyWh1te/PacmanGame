"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.querySelector("canvas"),
    c = canvas.getContext("2d");

  class Boundary {
    static width = 30;
    static height = 30;

    constructor({ position }) {
      this.position = position;
      this.width = 30;
      this.height = 30;
    }

    draw() {
      c.fillStyle = "blue";
      c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
  }

  //здесь отрисовка границ карты черточками
  const map = [
      ["-", "-", "-", "-", "-", "-"],
      ["-", " ", " ", " ", " ", "-"],
      ["-", " ", "-", "-", " ", "-"],
      ["-", " ", " ", " ", " ", "-"],
      ["-", "-", "-", "-", "-", "-"],
    ],
    boundaries = [];

  //формируем массив с границами
  map.forEach((row, index) => {
    row.forEach((symbol, j) => {
      switch (symbol) {
        case "-":
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

  boundaries.forEach((boundary) => boundary.draw());
});
