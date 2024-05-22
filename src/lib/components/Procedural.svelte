<script>
    import P5 from "p5-svelte";
    let width = 800;
    let height = 800;

    export let data;
    export let idx;
    let randomSeed = 0;
    let previdx;
    let distortion = 0.05; //1.0;
    let amplitude = 0.1;

    const sketch = (s) => {
        let myShader;

        s.setup = () => {
            s.createCanvas(width, height, s.WEBGL);
            // s.pixelDensity(1);
            s.angleMode(s.DEGREES);
            myShader = s.createShader(vs, fs);
            s.shader(myShader);
            randomSeed = s.random(200);
        };

        s.draw = () => {
            if (idx != previdx) {
                randomSeed = s.random(200);
            }
            previdx = idx;

            const rain = s.map(data[idx].humidity, 40, 100, 0.5, 0);
            const light = s.map(data[idx].solarradiation, 0, 600, 0.2, 1.0);
            const solar =
                data[idx].solarradiation == 0
                    ? 0.1
                    : s.map(data[idx].solarradiation, 1, 300, 0.5, 1.0);

            const wind = s.map(data[idx].windspeed, 0, 60, 0.01, 2);

            const windDirection = (data[idx].winddir + 180) % 360;
            const windVector = [s.cos(windDirection), s.sin(windDirection)];

            const dewpointDensity = s.map(data[idx].dewpoint, 10, 20, 0.01, 4);
            const humidityDensity = s.map(data[idx].humidity, 60, 100, 0.01, 4);

            let cloudDensity = dewpointDensity * humidityDensity;

            // const timeOfDay = new Date(data[idx].time).getHours();
            // const hueAdjustment = s.map(timeOfDay, 0, 23, -10, 0);
            const tempHue = 213 / 360;

            myShader.setUniform("iResolution", [width, height]);
            myShader.setUniform("windVector", windVector);
            myShader.setUniform("iTime", s.millis() / 6000 + randomSeed);
            myShader.setUniform("skyDarkness", tempHue);
            myShader.setUniform("speed", wind);
            myShader.setUniform("cloudscale", 0.8);
            myShader.setUniform("clouddark", rain);
            myShader.setUniform("cloudlight", light);
            myShader.setUniform("solar", solar);
            myShader.setUniform("cloudcover", cloudDensity); //0.3
            myShader.setUniform("cloudalpha", 8.0);
            myShader.setUniform("skytint", tempHue);

            myShader.setUniform("distortion", distortion);
            myShader.setUniform("iAmplitude", amplitude);

            // draw
            s.fill(255);
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
        };
    };

    let vs = `
        attribute vec3 aPosition;
        void main() {
            gl_Position = vec4(aPosition, 1.0);
        }
    `;

    let fs = `
    precision highp float;

    uniform vec2 iResolution;
    uniform float iTime;
    uniform float skyDarkness;
    uniform float distortion;
    uniform float iAmplitude;

    uniform float cloudscale;
    uniform float speed;
    uniform float clouddark;
    uniform float cloudlight;
    uniform float solar;

    uniform float cloudcover;
    uniform float cloudalpha;
    uniform float skytint;

    uniform vec2 windVector;

    const mat2 m = mat2(1.6, 1.2, -1.2, 1.6);

    vec2 hash(vec2 p) {
        p = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
    }

    float noise(in vec2 p) {
        const float K1 = 0.366025404; // (sqrt(3)-1)/2;
        const float K2 = 0.211324865; // (3-sqrt(3))/6;
        vec2 i = floor(p + (p.x+p.y)*K1);
        vec2 a = p - i + (i.x+i.y)*K2;
        vec2 o = (a.x > a.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec2 b = a - o + K2;
        vec2 c = a - 1.0 + 2.0 * K2;
        vec3 h = max(0.5 - vec3(dot(a,a), dot(b,b), dot(c,c)), 0.0);
        vec3 n = h*h*h*h * vec3(dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
        return dot(n, vec3(70.0));
    }

    float fbm(vec2 n) {
        float nr = distortion; // test, def is 1.0
        float total = 0.0, amplitude = iAmplitude; // test higher original is 0.1
        for (int i = 0; i < 7; i++) {
            total += noise(n) * amplitude;
            n = m * n * nr;
            amplitude *= 0.4;
        }
        return total;
    }

    

    vec3 getHSB(float hue, float saturation, float brightness) {
        hue = mod(hue, 1.0);  
        float c = brightness * saturation;
        float x = c * (1.0 - abs(mod(hue * 6.0, 2.0) - 1.0));
        float m = brightness - c;
        vec3 rgb;

        if (hue < 1.0 / 6.0) rgb = vec3(c, x, 0.0);
        else if (hue < 1.0 / 3.0) rgb = vec3(x, c, 0.0);
        else if (hue < 0.5) rgb = vec3(0.0, c, x);
        else if (hue < 2.0 / 3.0) rgb = vec3(0.0, x, c);
        else if (hue < 5.0 / 6.0) rgb = vec3(x, 0.0, c);
        else rgb = vec3(c, 0.0, x);

        rgb += vec3(m);
        return rgb;
    }

    void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 p = fragCoord.xy / iResolution.xy;
        vec2 uv = p * vec2(iResolution.x / iResolution.y, 1.0);
        float time = iTime * speed;
        float q = fbm(uv * cloudscale * 0.5);

        float r = 0.0;
        uv *= cloudscale;
        uv -= q - time * windVector;
        float weight = 0.8;
        for (int i = 0; i < 8; i++) {
            r += abs(weight * noise(uv));
            uv = m * uv + time * windVector;
            weight *= 0.7;
        }

        float f = 0.0;
        uv = p * vec2(iResolution.x / iResolution.y, 1.0);
        uv *= cloudscale;
        uv -= q - time * windVector;
        weight = 0.7;
        for (int i = 0; i < 8; i++) {
            f += weight * noise(uv);
            uv = m * uv + time * windVector;
            weight *= 0.6;
        }

        f *= r + f;

        float c = 0.0;
        time = iTime * speed * 2.0;
        uv = p * vec2(iResolution.x / iResolution.y, 1.0);
        uv *= cloudscale * 2.0;
        uv -= q - time * windVector;
        weight = 0.4;
        for (int i = 0; i < 7; i++) {
            c += weight * noise(uv);
            uv = m * uv + time * windVector;
            weight *= 0.6;
        }

        float c1 = 0.0;
        time = iTime * speed * 3.0;
        uv = p * vec2(iResolution.x / iResolution.y, 1.0);
        uv *= cloudscale * 3.0;
        uv -= q - time * windVector;
        weight = 0.4;
        for (int i = 0; i < 7; i++) {
            c1 += abs(weight * noise(uv));
            uv = m * uv + time * windVector;
            weight *= 0.6;
        }

        c += c1;

        vec3 skycolour1 = getHSB(skyDarkness, 0.8, solar);
        vec3 skycolour2 = getHSB(skyDarkness, 0.6, solar + 0.3);
        vec3 skycolour = mix(skycolour2, skycolour1, clamp(p.y, 0.0, 1.0));
        skycolour = skycolour * skyDarkness;

        vec3 cloudcolour = vec3(1.1, 1.1, 0.9) * clamp((clouddark + cloudlight * c), 0.0, 1.0);

        f = cloudcover + cloudalpha * f * r;

        vec3 result = mix(skycolour, clamp(skytint * skycolour + cloudcolour, 0.0, 1.0), clamp(f + c, 0.0, 1.0));

        fragColor = vec4(result, 1.0);
    }

    void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy);
    }

    `;

    function directionToArrow(windDir) {
        if (
            (windDir >= 337.5 && windDir <= 360) ||
            (windDir >= 0 && windDir < 22.5)
        )
            return "↑"; // North
        if (windDir >= 22.5 && windDir < 67.5) return "↗"; // Northeast
        if (windDir >= 67.5 && windDir < 112.5) return "→"; // East
        if (windDir >= 112.5 && windDir < 157.5) return "↘"; // Southeast
        if (windDir >= 157.5 && windDir < 202.5) return "↓"; // South
        if (windDir >= 202.5 && windDir < 247.5) return "↙"; // Southwest
        if (windDir >= 247.5 && windDir < 292.5) return "←"; // West
        if (windDir >= 292.5 && windDir < 337.5) return "↖"; // Northwest
    }
</script>

{#if data[idx].length == 0}
    <article>Loading...</article>
{:else}
    <!-- Distortion:
    <input
        type="number"
        bind:value={distortion}
        min="1.0"
        max="30000"
        step="0.1"
    />
    Amplitude:
    <input type="number" bind:value={amplitude} min="0.0" max="5" step="0.01" /> -->
    <section bind:clientWidth={width} bind:clientHeight={height}>
        <P5 {sketch} />
    </section>
    <div class="metadata">
        <span>
            {new Date(data[idx].time).toLocaleString()}
        </span>
        <span>
            Solar Radiation:{data[idx].solarradiation} /
        </span>
        <span>
            humidity:{data[idx].humidity} /
        </span>
        <span>
            dewpoint:{data[idx].dewpoint} /
        </span>
        <span>
            windspeed:{data[idx].windspeed} /
        </span>
        <span>
            winddir:{data[idx].winddir}
        </span>
    </div>
{/if}

<style>
    section {
        height: 100%;
    }

    .metadata {
        position: absolute;
        bottom: 0;
        font-size: 20px;
        padding: 5px;
        color: black;
    }
    .metadata span:first-of-type {
        color: yellow;
    }
</style>
