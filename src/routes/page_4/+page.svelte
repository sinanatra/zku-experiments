<script>
    import Clouds from "@components/Clouds.svelte";

    import { onMount } from "svelte";
    let idx = 0;
    let every = 1;
    let data = [];

    onMount(async () => {
        const response = await fetch(
            "https://zku-middleware.vercel.app/api/weather",
        );
        // const response = await fetch("weather.json");
        data = await response.json();
        // data = data.reverse()
        updateIndex();
    });

    function updateIndex() {
        if (idx < data.length - 1) {
            idx += every;

            // setTimeout(updateIndex, 1000);
        }
        // idx =  Math.floor(Math.random() * data.length) + 1
        setTimeout(updateIndex, 10000);
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
