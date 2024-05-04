<script>
    import P5 from "p5-svelte";
    let width = 500;
    let height = 500;

    export let data;
    export let keys;

    let test = "";
    let date;

    const sketch = (s) => {
        let myShader;
        let frameCount = 0;

        s.setup = () => {
            s.createCanvas(width, height, s.WEBGL);
            s.pixelDensity(1);
            s.angleMode(s.DEGREES);
            myShader = s.createShader(vs, fs);
            s.shader(myShader);
        };

        s.draw = () => {
            // s.frameRate(1 / 60);

            const rrain_piezo = s.map(data.rrain_piezo, 0, 10, 1, 0.6);
            const light = s.map(data.solarradiation, 0, 1000, 0, 1);
            const wind = s.map(data.windspeed, 0, 30, 0, 2);

            const temp = s.map(data.temp, -10, 40, 1, 0);
            const dewpoint = s.map(data.dewpoint, 0, 30, 0, 1);
            const humidity = s.map(data.humidity, 0, 100, 0, 1);

            let cloudDensity = Math.abs(humidity - dewpoint) + 0.1;

            test = cloudDensity;

            let tempHue = 198;
            let timeOfDay = new Date(data.time).getHours();
            let hueAdjustment = s.map(timeOfDay, 0, 23, -10, 10);
            let adjustedHue = (tempHue + hueAdjustment) / 360;

            myShader.setUniform("u_cloud_density", cloudDensity);
            myShader.setUniform("u_seed", timeOfDay);
            myShader.setUniform("u_time", (frameCount / 60) * wind);
            myShader.setUniform("u_resolution", [width, height]);
            myShader.setUniform("u_skyHue", adjustedHue);
            myShader.setUniform("u_rrain_piezo", rrain_piezo);
            myShader.setUniform("u_light", light);

            s.fill(255); // Set the fill color
            s.beginShape();
            s.vertex(0, 0);
            s.vertex(width, 0);
            s.vertex(width, height);
            s.vertex(0, height);
            s.beginContour();
            for (let i = 360; i > 0; i--) {
                let x = (s.cos(s.radians(i)) * width) / 2;
                let y = (s.sin(s.radians(i)) * height) / 2;
                s.vertex(width / 2 + x, height / 2 + y);
            }
            s.endContour();
            s.endShape();

            s.quad(-1, -1, -1, 1, 1, 1, 1, -1);

            date = data.time;
            frameCount++;
        };
    };

    let vs =
        "precision mediump float;" +
        "attribute vec3 aPosition;" +
        "void main(void){" +
        "  gl_Position = vec4(aPosition, 1.0);" +
        "}";

    let fs =
        "precision mediump float;" +
        "uniform vec2 u_resolution;" +
        "uniform float u_cloud_density;" +
        "uniform float u_rrain_piezo;" +
        "uniform float u_light;" +
        "uniform float u_time;" +
        "uniform float u_seed;" +
        "uniform float u_skyHue;" +
        "const float pi = 3.14159;" +
        "const vec2 r_vector = vec2(12.9898, 78.233);" +
        "const float r_coeff = 43758.5453123;" +
        "const int octaves = 6;" +
        "vec2 random2(vec2 st, float k){" +
        "  vec2 v = vec2(0.0);" +
        "  st = mod(st, k);" +
        "  v.x = sin(dot(st, vec2(127.1, 311.7))) * r_coeff;" +
        "  v.y = sin(dot(st, vec2(269.5, 183.3))) * r_coeff;" +
        "  return -1.0 + 2.0 * fract(v);" +
        "}" +
        "float dnoise(vec2 p, float k){" +
        "  vec2 i = floor(p);" +
        "  vec2 f = fract(p);" +
        "  vec2 u = f * f * (3.0 - 2.0 * f);" +
        "  vec2 p_00 = vec2(0.0, 0.0);" +
        "  vec2 p_01 = vec2(0.0, 1.0);" +
        "  vec2 p_10 = vec2(1.0, 0.0);" +
        "  vec2 p_11 = vec2(1.0, 1.0);" +
        "  float value_00 = dot(random2(i + p_00, k), f - p_00);" +
        "  float value_01 = dot(random2(i + p_01, k), f - p_01);" +
        "  float value_10 = dot(random2(i + p_10, k), f - p_10);" +
        "  float value_11 = dot(random2(i + p_11, k), f - p_11);" +
        "  return mix(mix(value_00, value_10, u.x), mix(value_01, value_11, u.x), u.y);" +
        "}" +
        "float fbm(vec2 st){" +
        "  float value = 0.0;" +
        "  float amplitude = 0.5;" +
        "  float k = 4.0;" +
        "  for(int i = 0; i < octaves; i++){" +
        "    value += amplitude * dnoise(st, k);" +
        "    st *= 2.0;" +
        "    k *= 2.0;" +
        "    amplitude *= 0.5;" +
        "  }" +
        "  return value;" +
        "}" +
        "vec3 getHSB(float r, float g, float b){" +
        "    vec3 c = vec3(r, g, b);" +
        "    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);" +
        "    rgb = rgb * rgb * (3.0 - 2.0 * rgb);" +
        "    return c.z * mix(vec3(1.0), rgb, c.y);" +
        "}" +
        "void main(void){" +
        "  vec2 p = gl_FragCoord.xy / min(u_resolution.x, u_resolution.y);" +
        "  vec2 st = p + u_seed + u_time*0.1;" +
        "  float n = fbm(st) - u_cloud_density;" +
        "  n = n * n * (3.0 - 2.0 * n);" +
        "  vec3 skyColor = getHSB(u_skyHue, u_rrain_piezo, u_light);" +
        "  vec3 cloudColor = getHSB(0.0, 0.0, u_rrain_piezo);" +
        "  float depthFactor = 1.0 - gl_FragCoord.y / u_resolution.y;" +
        "  n -= depthFactor * 0.2;" +
        "  vec3 col;" +
        "  col = mix(skyColor, cloudColor, smoothstep(0.0, 1.0, n));" +
        "  gl_FragColor = vec4(col, 1.0);" +
        "}";
</script>

{#if data.length == 0}
    <article>Loading...</article>
{:else}
    <section bind:clientWidth={width} bind:clientHeight={height}>
        <P5 {sketch} />
        <p>
            {date?.split("T")[0]} - {date?.split("T")[1]?.split(".")[0]}
        </p>
    </section>
{/if}

<style>
    section {
        height: 100%;
    }

    p {
        position: absolute;
        z-index: 1000;
        bottom: 0px;
        width: 100%;
        margin: 0;
        padding: 0;
        background: white;
    }
</style>
