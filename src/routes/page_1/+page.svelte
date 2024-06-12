<script>
    import P5 from "p5-svelte";
    import { onMount } from "svelte";

    let width, height;
    let data = [];
    let signals = [];
    let params = [];
    let maxValues = [];
    let idx = 0;
    let point = 1;
    let meta = "";
    let nr;
    let interference = false;

    onMount(async () => {
        const response = await fetch("http://localhost:3000/api/weather");
        data = await response.json();
        params = Object.keys(data[0]).filter(
            (key) => typeof data[0][key] === "number",
        );

        const signalResponse = await fetch("http://localhost:3000/api/signal");
        const sigData = await signalResponse.json();
        signals = sigData.map((d) => d.signal);
        nr = Math.floor(Math.random() * params.length);
        maxValues = params.map((param) => getMaxValue(param));
    });

    const sketch = (s) => {
        s.setup = () => {
            s.createCanvas(width, height);
            s.colorMode(s.HSL);
            s.background(0);
        };

        s.draw = () => {
            let yPosition = (idx * point) % height;
            if (yPosition == 0) {
                nr = Math.floor(Math.random() * params.length) % height;
            }

            s.fill("yellow");
            s.rect(0, yPosition, width, point + 3);
            s.fill(0);
            s.noStroke();
            s.rect(0, yPosition, width, point + 2);

            if (data.length > 0) {
                const record = data[idx];
                const sig = signals[idx];
                let test = [params[nr]];
                params.forEach((param, i) => {
                    let normalizedValue = s.map(
                        record[test], //param
                        0,
                        maxValues[i],
                        0,
                        width,
                    );

                    if (interference && signals.length > 0) {
                        let normalizedSignal = s.map(
                            sig,
                            -80,
                            -70,
                            0,
                            width / 2,
                        );
                        s.fill("red");
                        s.rect(normalizedSignal, yPosition, point, point);
                        normalizedValue += normalizedSignal;
                    }

                    s.fill(0, 100, 100);
                    s.rect(normalizedValue, yPosition, point, point);
                });

                idx = (idx + 1) % data.length;
                meta = record.time;
            }
        };
    };

    function getMaxValue(param) {
        return Math.max(...data.map((d) => d[param]));
    }

    function onChange(event) {
        interference = event.currentTarget.value === "true";
    }
</script>

{#if data.length === 0 && signals.length === 0}
    <article>Loading...</article>
{:else}
    <div>{meta}</div>
    <article bind:clientWidth={width} bind:clientHeight={height}>
        <P5 {sketch} />
    </article>
    <label>
        <input
            checked={!interference}
            on:change={onChange}
            type="radio"
            name="layout"
            value="false"
        /> false
    </label>
    <label>
        <input
            checked={interference}
            on:change={onChange}
            type="radio"
            name="layout"
            value="true"
        /> true
    </label>
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
    }
</style>
