<script>
    import P5 from "p5-svelte";
    import { onMount } from "svelte";

    let width, height;
    let data = [];
    let params = [];
    let idx = 0;
    let point = 2;
    let meta = "";

    let nr = 0;
    let nr1 = 0;
    let inc = 0.0;
    let rand = 0;
    let columnWidth = 80;
    let yPosition = columnWidth;
    let xPosition = columnWidth;
    let jump = false;

    onMount(async () => {
        const response = await fetch("sept.json");
        data = await response.json();
        params = Object.keys(data[0]).filter(
            (key) => typeof data[0][key] === "number",
        );

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

        // getRandomParams();
    });

    function getRandomParams() {
        nr = Math.floor(Math.random() * params.length);
        nr1 = Math.floor(Math.random() * params.length);
        rand = Math.floor((Math.random() * columnWidth) / 2);

        const delays = [100, 200, 500, 1000, 2000, 3000];
        const randomDelay = delays[Math.floor(Math.random() * delays.length)];
        jump = true;
        setTimeout(getRandomParams, randomDelay);
    }

    getRandomParams();

    const sketch = (s) => {
        s.setup = () => {
            s.createCanvas(width, height);
            s.background(255);
        };

        s.draw = () => {
            // s.background(255, 5);
            // s.frameRate(2);
            const record = data[idx];

            let param = s.map(record[params[nr]], 0, columnWidth, 10, 50) || 1;
            let param1 = s.map(record[params[nr]], 0, columnWidth, 1, 10) || 1;

            s.stroke("black");
            s.strokeWeight(1.5);

            s.line(
                xPosition + rand,
                yPosition + param,
                xPosition + rand + param1 + s.noise(inc) * 100,
                yPosition,
            );

            inc += 0.02;
            yPosition += point;

            if (jump) {
                jump = false;
            }

            if (yPosition + s.random(10, columnWidth) > height) {
                xPosition += columnWidth + 10;
                yPosition = s.random(10, columnWidth);
            }

            if (xPosition > width) {
                xPosition = columnWidth;
                yPosition = s.random(10, columnWidth);
                s.background(255);
            }

            idx = (idx + 10) % data.length;
            meta =
                `${record.time} , ${params[nr]}, ${params[nr1]}, ${record.runtime}` ||
                meta;
        };
    };
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
    div {
        background-color: black;
        color: white;
    }
    article {
        font-family: sans-serif;
        display: flex;
        height: 100vh;
    }
</style>
