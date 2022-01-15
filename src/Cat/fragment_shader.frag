precision highp float;
uniform sampler2D uMainTexture;
uniform sampler2D uMainColorTexture;
uniform sampler2D uFeatureTexture;
uniform vec3 uColor;
uniform vec3 uFeatureColor;
uniform vec2 uResolution;
varying vec2 vTextureCoord;

void main(void) {
    vec2 uv = vTextureCoord;
    vec4 resultColor = texture2D(uMainTexture, uv);

    vec4 featureColor = texture2D(uFeatureTexture, uv);
    float isFeatureColorExist = length(featureColor);

    if (featureColor.x > 0.1) {
        resultColor += (featureColor * vec4(uFeatureColor, 1.0));
    } else {
        resultColor += (texture2D(uMainColorTexture, uv) * vec4(uColor, 1.0));
    }

    gl_FragColor = resultColor;
}
