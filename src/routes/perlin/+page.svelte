<script>
    import P5 from "p5-svelte";
    import { onMount } from "svelte";
    let width = 500;
    let height = 500;

    let data = [];
    let keys = [];
    let idx = 0;
    let size = 8;

    onMount(async (d) => {
        const response = await fetch("weather.json");
        data = await response.json();
        keys = Object.keys(data[idx]);
    });

    const sketch = (s) => {
        s.setup = () => {
            s.createCanvas(width, height);
            s.colorMode(s.HSB);
            s.noStroke();
        };

        s.draw = (d) => {
            s.frameRate(1);
            // idx = (idx + 1) % data.length;

            const rrain_piezo = s.map(data[idx].rrain_piezo, 0, 10, 1, 5);
            const temperatureFactor = s.map(data[idx].temp, -10, 40, 0.5, 1.5);
            const humidity = s.map(data[idx].humidity, 0, 100, 0, 2);
            const dewpoint = s.map(data[idx].dewpoint, 0, 30, 0, 2);
            const light = s.map(data[idx].solarradiation, 0, 500, 20, 100);
            let skyHue = s.map(data[idx].temp, 0, 40, 240, 200);

            for (let i = 0; i < width / size; i++) {
                for (let j = 0; j < height / size; j++) {
                    const ran = s.noise(i / (size * 2), j / (size * 2), idx);
                    let cloudDensity = ran * humidity * dewpoint;
                    cloudDensity *= temperatureFactor;
                    cloudDensity *= rrain_piezo;
                    const col = s.map(cloudDensity, 0, 1.5, 0, 100);

                    // Fill with color based on cloud density
                    s.fill(skyHue, col, light);
                    s.rect(i * size, j * size, size, size);
                }
            }

            // CLIP
            s.fill(80);
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

            s.fill(0);
            s.textSize(18);
            s.text(data[idx].time.split("T")[0], 10, 20);
            s.text(data[idx].time.split("T")[1].split(".")[0], 10, 40);
        };
    };
</script>

{#if data.length == 0}
    <article>Loading...</article>
{:else}
    <label>
        Index
        <input
            type="number"
            bind:value={idx}
            min="1"
            max={data.length - 1}
            step="1"
        />
    </label>
    <article bind:clientWidth={width} bind:clientHeight={height}>
        <P5 {sketch} />
    </article>
{/if}

<style>
    :global(body) {
        padding: 0;
        margin: 0;
    }

    article {
        font-family: sans-serif;
        color: white;
        display: flex;
        min-height: 100vh;
    }
</style>
