<script>
    import Clouds3d from "@components/Clouds3d.svelte";
    import { onMount } from "svelte";
    let idx = 0;
    let every = 5;
    let path = "clouds";

    let data = [];
    let images = [];
    let metadata = "";
    onMount(async () => {
        const response = await fetch("weather.json");
        data = await response.json();
        // data.reverse();

        updateIndex();
    });

    let render = false;
    function updateIndex() {
        if (idx < data.length - 1) {
            idx += every;
            if (render) {
                requestAnimationFrame(captureImage);
            }

            metadata = `${new Date(data[idx].time).toLocaleString()} - `;
            metadata += `Solar Radiation: ${data[idx].solarradiation} - `;
            metadata += `humidity: ${data[idx].humidity} - `;
            metadata += `dewpoint: ${data[idx].dewpoint} - `;
            metadata += `windspeed: ${data[idx].windspeed} - `;
            metadata += `winddir: ${data[idx].winddir} - `;
            render = true;
            setTimeout(updateIndex, 20000);
        }
    }

    function captureImage() {
        const canvas = document.querySelector("canvas");
        if (canvas) {
            const url = canvas.toDataURL("image/png");
            // images = [url, ...images];

            if (images.length > 500) {
                images = [{ url, metadata }];
            } else {
                images = [{ url, metadata }, ...images];
            }
        }
    }
</script>

<label>
    IDX:
    <input
        type="number"
        bind:value={idx}
        min="0"
        max={data.length - 1}
        step="1"
    />
    Every:
    <input
        type="number"
        bind:value={every}
        min="0"
        max={data.length - 1}
        step="1"
    />
</label>
<article>
    {#if data.length > 0}
        <section>
            <Clouds3d {path} data={data[idx]} />
        </section>
        <p>
            {metadata}
        </p>
        <div class="images">
            {#each images as img}
                <div>
                    <img src={img.url} alt="Cloud snapshot" />
                    <p>
                        {img.metadata}
                    </p>
                </div>
            {/each}
        </div>
    {/if}
</article>

<style>
    article {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }

    section {
        height: 800px;
        width: 800px;
    }

    .images {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: left;
        width: 100vw;
    }

    .images div {
        width: 100%;
        width: calc(20% - 10px);

        margin: 5px;
        border-radius: 5px;
        font-size: 0.875rem;
    }

    .images img {
        width: 100%;
        object-fit: contain;
    }
</style>
