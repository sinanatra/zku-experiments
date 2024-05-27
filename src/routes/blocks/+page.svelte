<script>
    import P5 from "p5-svelte";
    import { onMount } from "svelte";

    let width, height;
    let data = [];
    let params = [];
    let maxValues = [];
    let meta = "";
    let flowField = [];
    let cols, rows;
    let colWidth; // Define colWidth in the global scope
    const resolution = 20;

    onMount(async () => {
        const response = await fetch("weather.json");
        data = await response.json();
        params = Object.keys(data[0]).filter(
            (key) => typeof data[0][key] === "number",
        );
        maxValues = params.map((param) => getMaxValue(param));
    });

    const sketch = (s) => {
        s.setup = () => {
            s.createCanvas(width, height);
            s.colorMode(s.HSL);
            s.background(255);
            cols = params.length; // Set columns based on the number of parameters
            colWidth = s.width / cols; // Dynamically calculate the column width
            rows = s.floor(height / resolution);
            initializeFlowField(s);
        };

        s.draw = () => {
            s.background(255, 0.01);

            if (data.length > 0) {
                const rowIdx = s.frameCount % rows;

                for (let col = 0; col < cols; col++) {
                    const x = col * colWidth;
                    const y = rowIdx * resolution;

                    s.stroke(0);
                    s.push();
                    s.translate(x + colWidth / 2, y + resolution / 2);
                    s.rotate(flowField[rowIdx][col].heading());
                    s.line(0, 0, colWidth / 2, 0);
                    s.pop();
                }

                updateFlowField(s, rowIdx);
            }
        };

        function updateFlowField(s, rowIdx) {
            if (data.length > 0) {
                let idx = s.frameCount % data.length;
                const record = data[idx];

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
        }

        function initializeFlowField(s) {
            flowField = new Array(rows);
            for (let i = 0; i < rows; i++) {
                flowField[i] = new Array(cols);
                for (let j = 0; j < cols; j++) {
                    flowField[i][j] = s.createVector(
                        s.random(-1, 1),
                        s.random(-1, 1),
                    );
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
    <div>{meta}</div>
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
    }
</style>
