<script>
    import P5 from "p5-svelte";
    import { onMount } from "svelte";

    let width, height;
    let data = [];
    let signals = [];
    let params = [];
    let idx = 0;
    let signalIdx = 0;
    let every = 1;

    let point = 1;
    let meta = "";

    let nr = 0;
    let nr1 = 0;
    let inc = 0.0;
    let rand = 0;
    let columnWidth = 50;
    let yPosition = columnWidth;
    let xPosition = columnWidth;
    let previousX2 = NaN;
    let previousY2 = NaN;

    onMount(async () => {
        const response = await fetch(
            "https://zku-middleware.vercel.app/api/weather",
        );
        data = await response.json();
        params = Object.keys(data[0]).filter(
            (key) => typeof data[0][key] === "number",
        );

        const signalResponse = await fetch(
            "https://zku-middleware.vercel.app/api/signal",
        );
        const signalData = await signalResponse.json();
        signals = signalData.map((d) => d.signal);

        const maxValues = {};
        const minValues = {};

        data.forEach((record) => {
            Object.keys(record).forEach((key) => {
                if (typeof record[key] === "number") {
                    maxValues[key] = Math.max(
                        maxValues[key] || -Infinity,
                        record[key],
                    );
                    minValues[key] = Math.min(
                        minValues[key] || Infinity,
                        record[key],
                    );
                }
            });
        });

        data = data.map((record) => {
            const normalized = {};
            Object.keys(record).forEach((key) => {
                if (typeof record[key] === "number") {
                    if (maxValues[key] !== minValues[key]) {
                        normalized[key] =
                            ((record[key] - minValues[key]) /
                                (maxValues[key] - minValues[key])) *
                            columnWidth;
                    } else {
                        normalized[key] = columnWidth / 2;
                    }
                }
            });

            return {
                time: record.time,
                ...normalized,
            };
        });

        getRandomParams();
    });

    function getRandomParams() {
        nr = Math.floor(Math.random() * params.length);
        nr1 = Math.floor(Math.random() * params.length);
        rand = Math.floor((Math.random() * columnWidth) / 2);

        const delays = [100, 200, 500, 1000, 2000, 3000];
        const randomDelay = delays[Math.floor(Math.random() * delays.length)];
        setTimeout(getRandomParams, randomDelay);
    }

    const sketch = (s) => {
        s.setup = () => {
            s.createCanvas(width, height);
            s.background(255);
            s.background(0);
            s.stroke(255);
            // s.strokeWeight(0.8);
            // s.pixelDensity(1);
        };

        s.draw = () => {
            if (!data.length || !signals.length) return;

            const record = data[idx];

            let param = s.map(record[params[nr]], 0, columnWidth, 10, 20) || 1;
            let param1 = s.map(record[params[nr]], 0, columnWidth, 10, 20) || 1;
            let signal = s.map(signals[signalIdx], -90, -60, 10, 40) || 1;

            let x1 = xPosition + param;
            let y1 = previousY2 - param1 + s.noise(inc) * signal;
            let x2 = previousX2 + param + s.noise(inc) * signal;
            let y2 = yPosition + param1;

            if (!isNaN(previousX2) && !isNaN(previousY2)) {
                s.line(x1, y1, x2, y2);
            }

            inc += 0.02;
            yPosition += point;
            previousX2 = x1;
            previousY2 = y2;

            if (yPosition + s.random(10, columnWidth) >= height) {
                xPosition += columnWidth + 10;
                yPosition = s.random(10, columnWidth);
                previousX2 = NaN;
                previousY2 = NaN;
            }

            if (xPosition + columnWidth >= width || idx + 1 >= data.length) {
                xPosition = columnWidth;
                yPosition = s.random(10, columnWidth);
                previousX2 = NaN;
                previousY2 = NaN;
                s.background(255);
                getRandomParams();
            }

            idx = (idx + every) % data.length;
            signalIdx =
                signals.length > 0
                    ? (signalIdx + every) % signals.length
                    : signalIdx + every;

            // meta = `${record.time}` || meta;
        };
    };

    function onClick(event) {
        getRandomParams();
    }
</script>

{#if data.length == 0 && signals.length == 0}
    <article>Loading...</article>
{:else}
    <!-- <div>{meta}</div> -->
    <article bind:clientWidth={width} bind:clientHeight={height}>
        <P5 {sketch} />
    </article>
    <!-- <label>
        <button on:click={onClick}> Change </button>
    </label>
    <label>
        <input type="number" bind:value={every} min="0" max={data.length} />
    </label> -->
{/if}

<style>
    article {
        background-color: black;
        color: white;
        font-family: sans-serif;
        display: flex;
        height: 100vh;
    }
</style>
