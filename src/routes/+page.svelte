<script>
    import Clouds from "@components/Clouds.svelte";
    import { onMount } from "svelte";
    let idx = 0;
    let every = 1;

    let data = [];
    onMount(async () => {
        const response = await fetch("http://localhost:3000/api/weather");
        // const response = await fetch("weather.json");
        data = await response.json();
        updateIndex();
    });

    function updateIndex() {
        if (idx < data.length - 1) {
            idx += every;
            idx += every;

            // setTimeout(updateIndex, 1000);
        }
        // idx =  Math.floor(Math.random() * data.length) + 1
        setTimeout(updateIndex, 6000);
    }
</script>

<!-- <label>
    IDX:
    <input
        type="number"
        bind:value={idx}
        min="0"
        max={data.length - 1}
        step={every}
    />
    Every:
    <input
        type="number"
        bind:value={every}
        min="0"
        max={data.length - 1}
        step="1"
    />
</label> -->
<article>
    {#if data.length > 0}
        <section>
            <Clouds {idx} {data} />
        </section>
    {/if}
</article>

<style>
    article {
        /* display: flex; */
        width: 100%;
        height: 100vh;
    }

    section {
        width: 100vw;
        height: 100vh;
    }
</style>
