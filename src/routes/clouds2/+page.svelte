<script>
    import P5 from "p5-svelte";
    import { onMount } from "svelte";
    let width = 500;
    let height = 500;

    let data = [];
    let keys = [];
    let idx = 0;

    const columns = 4;
    // const rows = Math.ceil(data.length / columns);
    const rows = 4;

    let size = Math.ceil(columns / 2.5);

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
            s.noLoop();
        };

        s.draw = (d) => {
            // s.frameRate(5);

            // Clear the canvas
            s.background(255);

            // Iterate over the grid
            for (let col = 0; col < columns; col++) {
                for (let row = 0; row < rows; row++) {
                    // Calculate the current idx based on the column and row
                    idx = idx = (idx + 30) % data.length;

                    // Calculate the x and y position based on the column and row
                    let x = (col * width) / columns;
                    let y = (row * height) / rows;

                    // Draw content based on the current idx
                    // You can adjust this part based on your specific drawing logic
                    let skyHue = s.map(data[idx].temp, 0, 40, 240, 140);
                    let solarRadiation = s.map(
                        data[idx].solarradiation,
                        1,
                        1000,
                        20,
                        100,
                    );
                    let cloudDensity = data[idx].humidity;

                    for (let i = 0; i < width / size; i++) {
                        for (let j = 0; j < height / size; j++) {
                            const ran = s.noise(
                                i / (size * 2),
                                j / (size * 2),
                                idx,
                            );
                            const col = s.map(ran, 0, 1, 0, cloudDensity);
                            s.fill(skyHue, col, solarRadiation);
                            s.rect(x + i * size, y + j * size, size, size);
                        }
                    }

                    // CLIP - Assuming you want to repeat this for each column
                    s.fill(255);
                    s.beginShape();
                    s.vertex(x, y);
                    s.vertex(x + width / columns, y);
                    s.vertex(x + width / columns, y + height / rows);
                    s.vertex(x, y + height / rows);
                    s.beginContour();
                    for (var i = 360; i > 0; i--) {
                        var angleX =
                            (s.cos(s.radians(i)) * width) / columns / 2;
                        var angleY = (s.sin(s.radians(i)) * height) / rows / 2;
                        s.vertex(
                            x + width / columns / 2 + angleX,
                            y + height / rows / 2 + angleY,
                        );
                    }
                    s.endContour();
                    s.endShape();

                    // Draw the time for the current data point
                    s.fill(0);
                    s.text(data[idx].time, x, y - 10);
                }
            }
        };
    };
</script>

{#if data.length == 0}
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

    section {
        margin-bottom: 20px;
        display: flex;
        gap: 10px;
    }

    article {
        font-family: sans-serif;
        color: white;
        display: flex;
        min-height: 100vh;
    }
</style>
