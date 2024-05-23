<script>
    import P5 from "p5-svelte";
    import { onMount } from "svelte";

    let width, height;
    let data = [];
    let params = [];
    let maxValues = [];
    let idx = 0;
    let yVal = 0.5;
    let meta = "";
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
            s.background(0);
        };

        s.draw = () => {
            let yPosition = ((idx * yVal) % height) + 20;
            s.fill(0, 0.6);
            s.noStroke();
            s.rect(0, yPosition, width, yVal);

            if (data.length > 0) {
                const record = data[idx];
                params.forEach((param, i) => {
                    let normalizedValue = s.map(
                        record[param],
                        0,
                        maxValues[i],
                        0,
                        width,
                    );

                    let h = s.map(i, 0, params.length, 0, 360);
                    s.fill(h, 80, 50);
                    s.rect(normalizedValue, yPosition, 1, yVal);
                });

                idx = (idx + 1) % data.length;
                meta = data[idx].time;
            }
        };
    };

    function getMaxValue(param) {
        return Math.max(...data.map((d) => d[param]));
    }
</script>

{#if data.length === 0}
    <article>Loading...</article>
{:else}
    {meta}
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
        background-color: black;
        color: white;
        display: flex;
        min-height: 100vh;
    }
</style>
