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
    let colWidth, rowHeight;
    let signalIdx = 1;
    const resolution = 1;
    let color = 0;
    let nr = 0;
    let idx = 0;

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
        nr = Math.floor(Math.random() * params.length);

        maxValues = params.map((param) => getMaxValue(param));
    });

    const sketch = (s) => {
        s.setup = () => {
            s.createCanvas(width, height);
            s.colorMode(s.HSL);
            s.background(0);
            cols = params.length;
            colWidth = width / cols;
            rows = s.floor(height / colWidth);
            rowHeight = height / rows;
            initializeFlowField(s);
            s.pixelDensity(1);
        };

        s.draw = () => {
            const record = data[idx];

            s.background(0, 0.1);
            if (!data.length || !signals.length) return;

            signalIdx = (signalIdx + resolution) % signals.length;
            let signal = s.map(signals[signalIdx], -100, -60, 1, 30) || 1;

            let framecheck = s.frameCount % 60;
            if (framecheck == 0) {
                color = (color + 1) % 360;
            }

            let test = [params[nr]];

            const rowIdx = s.frameCount % rows;
            idx = (idx + 1) % data.length;

            params.forEach((param, i) => {
                let normalizedValue = s.map(
                    record[test], //param
                    0,
                    maxValues[i],
                    0,
                    1,
                );

                let ellipseCount = Math.floor(normalizedValue * 10);
                let endSize = s.map(signal, 1, 30, colWidth / 2, 0);

                // let endOffset = s.map(signal, 1, 30, 0, (colWidth - endSize) / 2);
                
                s.push();
                for (let i = 0; i < ellipseCount; i++) {
                    s.noStroke();
                    s.fill((i * 10) % 255);
                    // s.stroke((i * 10) % 360, 100, 50);

                    let diameter = s.map(i, 0, ellipseCount, colWidth, endSize);
                    // let offset = s.map(i, 0, ellipseCount, 0, endOffset);
                    let offset = s.map(
                        i,
                        0,
                        ellipseCount,
                        0,
                        (colWidth - endSize) / 2,
                    );

                    // let vector = flowField[row][col];

                    s.push();
                    // s.translate(offset * vector.x, offset * vector.y);
                    s.ellipse(0, 0, diameter, diameter);
                    s.pop();
                }

            });

            // for (let col = 0; col < cols; col++) {

            //     for (let row = 0; row < rows; row++) {
            //         const x = col * colWidth;
            //         const y = row * rowHeight;
            //         const maxValue = maxValues[col];
            //         const param = params[col];
            //         // const value = data[idx][param];
            //         const value = data[idx][test];

            //         let normalizedValue = s.map(value, 0, maxValue, 0, 1);

            //         let normalizedValue = s.map(
            //             record[test], //param
            //             0,
            //             maxValues[col],
            //             0,
            //             1,
            //         );

            //         s.push();
            //         s.translate(x + colWidth / 2, y + rowHeight / 2);

            //         let ellipseCount = Math.floor(normalizedValue * 10);
            //         let endSize = s.map(signal, 1, 30, colWidth / 2, 0);
            //         // let endOffset = s.map(signal, 1, 30, 0, (colWidth - endSize) / 2);

            //         s.noFill();
            //         s.stroke(color, 100, 50);

            //         for (let i = 0; i < ellipseCount; i++) {
            //             s.noStroke();
            //             s.fill((i * 10) % 255);
            //             // s.stroke((i * 10) % 360, 100, 50);

            //             let diameter = s.map(i, 0, ellipseCount, colWidth, endSize);
            //             // let offset = s.map(i, 0, ellipseCount, 0, endOffset);
            //             let offset = s.map(i, 0, ellipseCount, 0, (colWidth - endSize) / 2);

            //             let vector = flowField[row][col];

            //             s.push();
            //             s.translate(offset * vector.x, offset * vector.y);
            //             s.ellipse(0, 0, diameter, diameter);
            //             s.pop();
            //         }

            //         s.pop();
            //     }
            // }
            updateFlowField(s, rowIdx);
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
