<script>
    import P5 from "p5-svelte";
    let width = 500;
    let height = 500;

    export let data;
    export let idx;
    let previdx;
    let date;
    let randomSeed = 0;

    const sketch = (s) => {
        let myShader;
        let frameCount = 0;

        s.setup = () => {
            s.createCanvas(width, height, s.WEBGL);
            s.pixelDensity(1);
            s.angleMode(s.DEGREES);
            myShader = s.createShader(vs, fs);
            s.shader(myShader);
            randomSeed = s.random(1000);
        };

        s.draw = () => {
            if (idx != previdx) {
                randomSeed = s.random(1000);
            }
            previdx = idx;
            const rain = s.map(data.humidity, 40, 100, 1, 0);
            const light = s.map(data.solarradiation, 0, 600, 0.2, 1);

            const wind = s.map(data.windspeed, 0, 30, 0, 2);
            const windDirection = data.winddir;

            const dewpointDensity = s.map(data.dewpoint, 0, 30, 0, 1);
            const humidityDensity = s.map(data.humidity, 50, 100, 0, 1);

            let cloudDensity =
                data.rrain_piezo > 0
                    ? 0.2 * dewpointDensity + 0.8 * humidityDensity
                    : 0.5 * dewpointDensity + 0.5 * humidityDensity;

            const tempHue = 210;
            const timeOfDay = new Date(data.time).getHours();

            const hueAdjustment = s.map(timeOfDay, 0, 23, -5, 5);
            const adjustedHue = (tempHue + hueAdjustment) / 360;

            myShader.setUniform("u_cloud_density", cloudDensity);
            myShader.setUniform("u_seed", randomSeed);
            myShader.setUniform(
                "u_time",
                wind != 0 ? (frameCount / 60) * wind : 0,
            );
            myShader.setUniform("u_resolution", [width, height]);
            myShader.setUniform("u_windDirection", windDirection);
            myShader.setUniform("u_skyHue", adjustedHue);
            myShader.setUniform("u_rain", rain);
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

    let vs = `
       precision mediump float;
       attribute vec3 aPosition;
       void main(void){
        gl_Position = vec4(aPosition, 1.0);
       }`;

    let fs = `precision mediump float;
    uniform vec2 u_resolution;
    uniform float u_cloud_density;
    uniform float u_rain;  // Rain intensity
    uniform float u_light;  // Ambient light intensity
    uniform float u_time;
    uniform float u_windDirection;
    uniform float u_seed;
    uniform float u_skyHue;
    const float pi = 3.14159;
    const vec2 r_vector = vec2(12.9898, 78.233);
    const float r_coeff = 43758.5453123;
    const int octaves = 10;
    vec2 random2(vec2 st, float k) {
        vec2 v = vec2(0.0);
        st = mod(st, k);
        v.x = sin(dot(st, vec2(127.1, 311.7))) * r_coeff;
        v.y = sin(dot(st, vec2(269.5, 183.3))) * r_coeff;
        return -1.0 + 2.0 * fract(v);
    }
    float dnoise(vec2 p, float k) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        vec2 p_00 = vec2(0.0, 0.0);
        vec2 p_01 = vec2(0.0, 1.0);
        vec2 p_10 = vec2(1.0, 0.0);
        vec2 p_11 = vec2(1.0, 1.0);
        float value_00 = dot(random2(i + p_00, k), f - p_00);
        float value_01 = dot(random2(i + p_01, k), f - p_01);
        float value_10 = dot(random2(i + p_10, k), f - p_10);
        float value_11 = dot(random2(i + p_11, k), f - p_11);
        return mix(mix(value_00, value_10, u.x), mix(value_01, value_11, u.x), u.y);
    }
    float fbm(vec2 st) {
        float value = 0.0;
        float amplitude = 2.5;
        float k = 40.0;
        for (int i = 0; i < octaves; i++) {
            value += amplitude * dnoise(st, u_seed);
            st *= 2.0;
            k *= 2.0;
            amplitude *= 0.5;
        }
        return value;
    }
    vec3 getHSB(float hue, float saturation, float brightness) {
        vec3 c = vec3(hue, saturation, brightness);
        vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        rgb = rgb * rgb * (3.0 - 2.0 * rgb);
        return c.z * mix(vec3(1.0), rgb, c.y);
    }
    void main(void) {
        vec2 p = gl_FragCoord.xy / min(u_resolution.x, u_resolution.y);
        float angle = radians(u_windDirection);
        vec2 windOffset = vec2(cos(angle), sin(angle)) * u_time * 0.1;
        vec2 st = p + u_seed + windOffset;
        float n = fbm(st) - u_cloud_density;
        n = n * n * (2.0 - 2.0 * n);
        float cloudIntensity = smoothstep(0.0, 5.0, n);

        vec3 lightCloudColor = vec3(1.0, 1.0, 1.0);  
        vec3 darkCloudColor = vec3(0.8, 0.8, 0.8);  
        float rainInfluence = smoothstep(0.1, 0.0, u_rain); 
        
        vec3 rainCloudColor = mix(lightCloudColor, darkCloudColor, rainInfluence); // Darker when rainy
        vec3 cloudColor = mix(rainCloudColor, darkCloudColor, cloudIntensity);

        vec3 skyColor = getHSB(u_skyHue, 0.5, u_light);

        float depthFactor = 1.0 - gl_FragCoord.y / u_resolution.y;
        n -= depthFactor * 0.01;
        vec3 col;
        col = mix(skyColor, cloudColor, smoothstep(0.0, 1.0, n));

        // Reduce overall brightness based on rain
        float finalBrightness = mix(1.0, 0.5, rainInfluence); 
        gl_FragColor = vec4(col * finalBrightness, 1.0);
    }`;
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
