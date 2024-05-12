<script>
    import P5 from "p5-svelte";
    let width = 800;
    let height = 800;

    export let data;
    export let idx;
    let date;
    let randomSeed = 0;
    let previdx;

    const sketch = (s) => {
        let myShader;

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

            const rain = s.map(data.humidity, 40, 100, 0.5, 0);
            const light = s.map(data.solarradiation, 0, 600, 0.2, 0.5);

            const wind = s.map(data.windspeed, 0, 60, 0, 1);
            const windDirection = data.winddir;

            const dewpointDensity = s.map(data.dewpoint, 10, 20, 0.01, 4);
            const humidityDensity = s.map(data.humidity, 60, 100, 0.01, 4);

            let cloudDensity = dewpointDensity * humidityDensity;


            const tempHue = 250;
            const timeOfDay = new Date(data.time).getHours();

            const hueAdjustment = s.map(timeOfDay, 0, 23, -10, 10);
            const adjustedHue = (tempHue + hueAdjustment) / 360;

            myShader.setUniform("iResolution", [width, height]);
            myShader.setUniform("iTime", s.millis() / 5000 + randomSeed);

            myShader.setUniform("iwindDirection", windDirection);
            myShader.setUniform("skyDarkness", adjustedHue);

            myShader.setUniform("speed", wind);
            myShader.setUniform("cloudscale", 1.1);
            myShader.setUniform("clouddark", rain);
            myShader.setUniform("cloudlight", light);
            myShader.setUniform("cloudcover", cloudDensity); //0.3
            myShader.setUniform("cloudalpha", 8.0);
            myShader.setUniform("skytint", adjustedHue);

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

            date = data.time;
        };
    };

    // Vertex Shader
    let vs = `
        attribute vec3 aPosition;
        void main() {
            gl_Position = vec4(aPosition, 1.0);
        }
    `;

    // Fragment Shader
    let fs = `
        precision highp float;

        uniform vec2 iResolution;
        uniform float iTime;
        uniform float iwindDirection;
        uniform float skyDarkness;

        uniform float cloudscale;
        uniform float speed;
        uniform float clouddark;
        uniform float cloudlight;
        uniform float cloudcover;
        uniform float cloudalpha;
        uniform float skytint;
        
        const vec3 skycolour1 = vec3(0.2, 0.4, 0.6);
        const vec3 skycolour2 = vec3(0.4, 0.7, 1.0);

        const mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );

        vec2 hash( vec2 p ) {
            p = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)));
            return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
        }

        float noise( in vec2 p ) {
            const float K1 = 0.366025404; // (sqrt(3)-1)/2;
            const float K2 = 0.211324865; // (3-sqrt(3))/6;
            vec2 i = floor(p + (p.x+p.y)*K1);	
            vec2 a = p - i + (i.x+i.y)*K2;
            vec2 o = (a.x > a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
            vec2 b = a - o + K2;
            vec2 c = a - 1.0 + 2.0 * K2;
            vec3 h = max(0.5 - vec3(dot(a,a), dot(b,b), dot(c,c)), 0.0);
            vec3 n = h*h*h*h * vec3( dot(a, hash(i + 0.0)), dot(b, hash(i + o)), dot(c, hash(i + 1.0)));
            return dot(n, vec3(70.0));	
        }

        float fbm(vec2 n) {
            float total = 0.0, amplitude = 0.1;
            for (int i = 0; i < 7; i++) {
                total += noise(n) * amplitude;
                n = m * n;
                amplitude *= 0.4;
            }
            return total;
        }

        void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
            vec2 p = fragCoord.xy / iResolution.xy;

            vec2 uv = p * vec2(iResolution.x/iResolution.y,1.0);    
            float time = iTime * speed;
            float q = fbm(uv * cloudscale * 0.5);
            
            //ridged noise shape
            float r = 0.0;
            uv *= cloudscale;
            uv -= q - time;
            float weight = 0.8;
            for (int i = 0; i < 8; i++){
                r += abs(weight * noise(uv));
                uv = m * uv + time;
                weight *= 0.7;
            }
            
            //noise shape
            float f = 0.0;
            uv = p * vec2(iResolution.x/iResolution.y,1.0);
            
            uv *= cloudscale;
            uv -= q - time;
            weight = 0.7;
            for (int i = 0; i < 8; i++){
                f += weight * noise(uv);
                uv = m * uv + time;
                weight *= 0.6;
            }
            
            f *= r + f;
            
            //noise colour
            float c = 0.0;
            time = iTime * speed * 2.0;
            uv = p * vec2(iResolution.x/iResolution.y,1.0);
            uv *= cloudscale * 2.0;
            uv -= q - time;
            weight = 0.4;
            for (int i = 0; i < 7; i++){
                c += weight * noise(uv);
                uv = m * uv + time;
                weight *= 0.6;
            }
            
            //noise ridge colour
            float c1 = 0.0;
            time = iTime * speed * 3.0;
            uv = p * vec2(iResolution.x/iResolution.y,1.0);
            uv *= cloudscale * 3.0;
            uv -= q - time;
            weight = 0.4;
            for (int i = 0; i < 7; i++){
                c1 += abs(weight * noise(uv));
                uv = m * uv + time;
                weight *= 0.6;
            }
            
            c += c1;
            
            vec3 skycolour = mix(skycolour2, skycolour1, p.y);
             
            
            skycolour = vec3(skycolour.r * skyDarkness, skycolour.g * skyDarkness, skycolour.b * skyDarkness);


            vec3 cloudcolour = vec3(1.1, 1.1, 0.9) * clamp((clouddark + cloudlight * c), 0.0, 1.0);
           
            f = cloudcover + cloudalpha * f * r;
            
            vec3 result = mix(skycolour, clamp(skytint * skycolour + cloudcolour, 0.0, 1.0), clamp(f + c, 0.0, 1.0));
            
            fragColor = vec4(result, 1.0);
        }

        void main() {
            mainImage(gl_FragColor, gl_FragCoord.xy);
        }
    `;
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
