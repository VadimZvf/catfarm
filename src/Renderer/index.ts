import {
  Scene,
  PerspectiveCamera,
  PointLight,
  AmbientLight,
  WebGLRenderer,
  PlaneGeometry,
  Mesh,
  Vector2,
  MeshBasicMaterial,
  Vector3,
  Object3D,
  Raycaster
} from 'three';

interface IParams {
  screenSize: {
    width: number;
    height: number;
  };
  fieldSize: Vector2;
}

export default class Renderer {
  constructor(params: IParams) {
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.render = this.render.bind(this);
    this.update = this.update.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleClick = this.handleClick.bind(this);

    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      70,
      params.screenSize.width / params.screenSize.height,
      1,
      2000
    );
    this.camera.position.x = this.defaultCameraPosition.x;
    this.camera.position.y = this.defaultCameraPosition.y;
    this.camera.position.z = this.defaultCameraPosition.z;
    this.camera.lookAt(this.scene.position);
    this.camera.updateProjectionMatrix();

    this.renderer = new WebGLRenderer({ canvas: canvas });
    this.renderer.setSize(params.screenSize.width, params.screenSize.height);
    this.renderer.setClearColor(0xeeeeee, 1);

    this.fieldSize.x = params.fieldSize.x;
    this.fieldSize.y = params.fieldSize.y;

    this.init();
  }

  private camera: PerspectiveCamera;
  private scene: Scene;
  private renderer: WebGLRenderer;
  private material: MeshBasicMaterial;
  private field: Mesh;
  private defaultCameraPosition: Vector3 = new Vector3(0, 260, 460);
  private fieldSize: Vector2 = new Vector2(0, 0);
  private raycaster: Raycaster = new Raycaster();
  private mouseClickPoint: Vector2 = new Vector2(0, 0);
  private clickListeners: Array<(point: Vector3) => void> = [];

  public addToScene(obj: Object3D) {
    this.scene.add(obj);
  }

  public addClickListener(listener: (point: Vector3) => void) {
    this.clickListeners.push(listener);
  }

  private init() {
    this.createLight();
    this.createField();

    window.requestAnimationFrame(this.update);

    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('click', this.handleClick);
    window.addEventListener('resize', this.handleResize);
  }

  private update() {
    this.render();
    window.requestAnimationFrame(this.update);
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  private createField() {
    const geometry = new PlaneGeometry(this.fieldSize.x, this.fieldSize.y);
    this.material = new MeshBasicMaterial({
      color: 0xcccccc
    });
    this.field = new Mesh(geometry, this.material);
    this.field.position.x = 0;
    this.field.position.y = 0;
    this.field.position.z = 0;
    this.field.rotation.x = -Math.PI / 2;
    this.field.rotation.y = 0;
    this.field.rotation.z = 0;

    this.scene.add(this.field);
  }

  private createLight() {
    const ambientLight = new AmbientLight(0xcccccc, 0.7);
    this.scene.add(ambientLight);

    const pointLight = new PointLight(0xffffff, 0.8);
    pointLight.position.y = 260;
    pointLight.position.z = 20;
    this.camera.add(pointLight);
    this.scene.add(this.camera);
  }

  private handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private handleMouseMove(event: MouseEvent) {
    const mouseX = (event.clientX - window.innerWidth / 2) / 2;
    const mouseY = (event.clientY - window.innerHeight / 2) / 2;

    this.camera.position.x = this.defaultCameraPosition.x + mouseX;
    this.camera.position.y = this.defaultCameraPosition.y - mouseY;
    this.camera.lookAt(this.scene.position);
  }

  private handleClick(event: MouseEvent) {
    this.mouseClickPoint.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouseClickPoint.y = -(event.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouseClickPoint, this.camera);
    const intersects = this.raycaster.intersectObjects([this.field]);

    const clickPoint = intersects[0] ? intersects[0].point : new Vector3(0);
    this.clickListeners.forEach((listener) => {
      listener(clickPoint);
    });
  }
}
