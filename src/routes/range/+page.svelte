<script>
    import { onMount } from "svelte";
    import Clouds3d from "@components/Clouds3d.svelte";

    let data = [];
    let idx = 10;
    onMount(async (d) => {
        const response = await fetch("weather.json");
        data = await response.json();
    });

    $: datum = data.reverse().filter((_, index) => index % idx === 0);
</script>

{#if data.length == 0}
    <article>Loading...</article>
{:else}
    <label>
        Every {idx} minutes:
        <input
            type="number"
            bind:value={idx}
            min="1"
            max={data.length - 1}
            step="1"
        />
    </label>
    <article>
        {#each datum.slice(0, 16) as d, i}
            <section>
                <Clouds3d data={d} />
            </section>
        {/each}
    </article>
{/if}

<style>
    article {
        display: flex;
        flex-wrap: wrap;
    }

    section {
        width: 100%;
        margin: 10px;
        width: calc(25vw - 20px);
        height: calc(25vw - 20px);

        border-radius: 5px;
        background-color: white;
        overflow: hidden;
    }
</style>
