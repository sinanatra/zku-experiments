<script>
    import P5 from "p5-svelte";
    import { onMount } from "svelte";

    let width, height;
    let data = [];
    let signals = [];
    let params = [];
    let maxValues = [];
    let meta = "";
    let flowField = [];
    let cols, rows;
    let colWidth;
    let signalIdx = 1;
    const resolution = 1;

    onMount(async () => {
        const response = await fetch("https://zku-middleware.vercel.app/api/weather");
        data = await response.json();
        params = Object.keys(data[0]).filter(
            (key) => typeof data[0][key] === "number",
        );

        const signalResponse = await fetch("https://zku-middleware.vercel.app/api/signal");
        const signalData = await signalResponse.json();
        signals = signalData.map((d) => d.signal);

        maxValues = params.map((param) => getMaxValue(param));
    });

    const sketch = (s) => {
        s.setup = () => {
            s.createCanvas(width, height);
            s.colorMode(s.HSL);
            s.background(0);
            cols = params.length;
            colWidth = width / cols;
            rows = s.floor(height / resolution);
            initializeFlowField(s);
        };

        s.draw = () => {
            s.background(0, 0.01);
            if (!data.length || !signals.length) return;

            const rowIdx = s.frameCount % rows;

            signalIdx = (signalIdx + resolution) % signals.length;
            let signal = s.map(signals[signalIdx], -100, -60, 1, 30) || 1;

            for (let col = 0; col < cols; col++) {
                const x = col * colWidth;
                const y = rowIdx * resolution;

                s.strokeWeight(1);

                s.push();
                s.translate(x, y + resolution);

                s.rotate(flowField[rowIdx][col].heading());

                s.stroke(255);
                s.line(x, y, signal, 0);
                
                s.stroke("yellow");
                s.line(0, 0, colWidth, 0);

                s.pop();
                updateFlowField(s, rowIdx);
            }
        };

        function updateFlowField(s, rowIdx) {
            let idx = s.frameCount % data.length;

            let record = data[idx];

            for (let col = 0; col < cols; col++) {
                let normalizedValue = s.map(
                    record[params[col]],
                    0,
                    maxValues[col],
                    0,
                    s.TWO_PI,
                );

                flowField[rowIdx][col] = s.createVector(
                    s.cos(normalizedValue),
                    s.sin(normalizedValue),
                );
            }

            meta = record.time;
        }

        function initializeFlowField(s) {
            flowField = new Array(rows);
            for (let i = 0; i < rows; i++) {
                flowField[i] = new Array(cols);
                for (let j = 0; j < cols; j++) {
                    flowField[i][j] = s.createVector(0, 0);
                }
            }
        }
    };

    function getMaxValue(param) {
        return Math.max(...data.map((d) => d[param]));
    }
</script>

{#if data.length === 0}
    <article>Loading...</article>
{:else}
    <!-- <div>{meta}</div> -->
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
        display: flex;
        min-height: 100vh;
        background-color: black;
        color: white;
    }
</style>
