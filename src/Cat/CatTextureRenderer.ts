import {
  Mesh,
  Texture,
  ShaderMaterial,
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  BoxGeometry,
  Color
} from 'three';
import mainColorImage from './models/mainColor.png';
import mainTextureImage from './models/mainTexture.png';
import dotsImage from './models/dots.png';
import fragmentShader from './fragment_shader.frag';
import vertexShader from './vertex_shader.frag';

export default class CatTextureRenderer {
  public static availableColors: Color[] = [
    new Color(0xffe4c4),
    new Color(0xffeeee),
    new Color(0x000000),
    new Color(0x808080),
    new Color(0xffffff),
    new Color(0xffe4e1)
  ];
  private static loadedImages: { [key: string]: HTMLImageElement } = {};
  private canvas: HTMLCanvasElement;
  private renderer: WebGLRenderer;
  private scene: Scene;
  private camera: OrthographicCamera;
  private screen: Mesh;
  private material: ShaderMaterial;
  private uMainTexture: Texture;
  private uMainColorTexture: Texture;
  private uFeatureTexture: Texture;
  private uColor: Color;
  private uFeatureColor: Color;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.renderer = new WebGLRenderer({ canvas: this.canvas });
    this.scene = new Scene();
    this.camera = new OrthographicCamera();
    this.camera.position.z = 460;

    this.uMainTexture = new Texture();
    this.uMainColorTexture = new Texture();
    this.uFeatureTexture = new Texture();
    this.uColor = new Color();
    this.uFeatureColor = new Color();

    const geometry = new BoxGeometry(2, 2);
    this.material = new ShaderMaterial({
      uniforms: {
        uMainTexture: { value: this.uMainTexture },
        uMainColorTexture: { value: this.uMainColorTexture },
        uFeatureTexture: { value: this.uFeatureTexture },
        uColor: { value: this.uColor },
        uFeatureColor: { value: this.uFeatureColor }
      },
      vertexShader,
      fragmentShader
    });
    this.screen = new Mesh(geometry, this.material);
    this.scene.add(this.screen);
  }

  public async getTexture(): Promise<Texture> {
    const imagePromises = [
      this.loadImage(mainTextureImage),
      this.loadImage(mainColorImage),
      this.loadImage(dotsImage)
    ];

    const images = await Promise.all(imagePromises);

    const width = images[0].width;
    const height = images[0].height;

    this.renderer.setSize(width, height);
    this.camera.left = -width / 2;
    this.camera.right = width / 2;
    this.camera.top = height / 2;
    this.camera.bottom = -height / 2;

    this.uColor.set(this.getRandomColor());
    this.uFeatureColor.set(this.getRandomColor());

    this.uMainTexture.image = images[0];
    this.uMainTexture.needsUpdate = true;
    this.uMainColorTexture.image = images[1];
    this.uMainColorTexture.needsUpdate = true;

    if (Math.random() > 0.5) {
      this.uFeatureTexture.image = images[2];
    } else {
      this.uFeatureTexture.image = images[0];
    }
    this.uFeatureTexture.needsUpdate = true;

    this.renderer.render(this.scene, this.camera);

    return new Promise((resolve) => {
      const image = new Image();
      image.src = this.canvas.toDataURL();

      const result = new Texture();
      image.onload = () => {
        result.image = image;
        result.needsUpdate = true;
        resolve(result);
      };
    });
  }

  private getRandomColor(): Color {
    return CatTextureRenderer.availableColors[
      Math.floor(Math.random() * CatTextureRenderer.availableColors.length)
    ];
  }

  private async loadImage(imagePath: string): Promise<HTMLImageElement> {
    if (CatTextureRenderer.loadedImages[imagePath]) {
      return CatTextureRenderer.loadedImages[imagePath];
    }

    return new Promise((resolve) => {
      const image = new Image();
      image.src = imagePath;

      image.onload = () => {
        resolve(image);
      };
    });
  }
}
