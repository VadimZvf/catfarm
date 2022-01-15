import {
  Mesh,
  Group,
  AnimationMixer,
  Vector2,
  Vector3,
  MeshPhongMaterial
} from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import CatTextureRenderer from './CatTextureRenderer';
import cat from './models/cat.fbx';

interface IParams {
  availableFieldSize: Vector2;
  initialPosition: Vector3;
}

const textureRenderer = new CatTextureRenderer();

export default class Cat extends Group {
  constructor(params: IParams) {
    super();

    this.availableFieldSize = params.availableFieldSize;
    this.position.x = params.initialPosition.x;
    this.position.z = params.initialPosition.z;
    this.init();
  }

  private animationMixer: AnimationMixer;
  private currentWalkTargetPoint: Vector3 = new Vector3(0, 0, 0);
  private currentWalkDirection: Vector3 = new Vector3(0, 0, 1);
  private availableFieldSize: Vector2;
  private walkSpeed: number = 2;

  public update(delta: number = 0) {
    if (this.animationMixer) {
      this.animationMixer.update(delta);
    }

    if (this.position.distanceTo(this.currentWalkTargetPoint) <= 10) {
      this.updateWalkTarget();
    }

    this.currentWalkDirection
      .add(this.currentWalkTargetPoint.clone().sub(this.position).normalize())
      .normalize()
      .multiplyScalar(this.walkSpeed);

    this.position.add(this.currentWalkDirection);

    this.lookAt(this.position.clone().add(this.currentWalkDirection));
  }

  private async init() {
    this.updateWalkTarget();

    const catModel = await this.load();

    this.add(catModel);

    this.animationMixer = new AnimationMixer(catModel);
    const walkAmination = this.animationMixer.clipAction(
      catModel.animations[0]
    );
    walkAmination.play();
  }

  private async load(): Promise<Group> {
    const modelPromise = this.loadModel();
    const materialPromise = this.loadMaterial();

    return Promise.all([modelPromise, materialPromise]).then(
      ([model, material]) => {
        model.traverse((child) => {
          if (child instanceof Mesh && child.isMesh && child.name === 'Cat') {
            child.material = material;
          }
        });
        return model;
      }
    );
  }

  private async loadModel(): Promise<Group> {
    return new Promise((resolve) => {
      const loader = new FBXLoader();
      loader.load(cat, (object) => {
        object.scale.x = 0.2;
        object.scale.y = 0.2;
        object.scale.z = 0.2;
        resolve(object);
      });
    });
  }

  private async loadMaterial(): Promise<MeshPhongMaterial> {
    const texture = await textureRenderer.getTexture();

    return new MeshPhongMaterial({
      map: texture
    });
  }

  private updateWalkTarget() {
    const randomXPoint = (Math.random() - 0.5) * this.availableFieldSize.x;
    const randomZPoint = (Math.random() - 0.5) * this.availableFieldSize.y;

    this.currentWalkTargetPoint.x = randomXPoint;
    this.currentWalkTargetPoint.z = randomZPoint;
  }
}
