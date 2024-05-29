<script>
    import Procedural from "@components/Procedural.svelte";
    import { onMount } from "svelte";
    let idx = 0;
    let every = 60;

    let data = [];
    let images = [];
    let metadata = "";
    onMount(async () => {
        const response = await fetch("weather.json");
        data = await response.json();
        // data.reverse();

        updateIndex();
    });

    function updateIndex() {
        // if (idx < data.length - 1) {
        //     idx += every;
        //     idx += every;

        //     setTimeout(updateIndex, 5000);
        // }
        idx =  Math.floor(Math.random() * data.length) + 1
        setTimeout(updateIndex, 60000);
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
            <Procedural {idx} {data} />
        </section>
        <p>
            {metadata}
        </p>
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
        width: 100vw;
        height: 100vh;
    }
</style>
