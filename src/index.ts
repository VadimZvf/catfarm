import { Clock, Vector2, Vector3 } from 'three';
import Renderer from './Renderer';
import Cat from './Cat';
import './index.css';

function main() {
  const cats: Cat[] = [];
  const fieldSize = new Vector2(700, 700);

  const clock = new Clock();

  const renderer = new Renderer({
    screenSize: {
      width: window.innerWidth,
      height: innerHeight
    },
    fieldSize
  });
  renderer.addClickListener(handleClick);

  function handleClick(point: Vector3) {
    const cat = new Cat({
      availableFieldSize: fieldSize,
      initialPosition: point
    });
    renderer.addToScene(cat);
    cats.push(cat);
  }

  function update() {
    const delta = clock.getDelta();

    cats.forEach((cat) => {
      cat.update(delta);
    });

    window.requestAnimationFrame(update);
  }

  window.requestAnimationFrame(update);
}

main();
