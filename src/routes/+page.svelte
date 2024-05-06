<script>
    import { onMount } from "svelte";
    import Clouds from "@components/Clouds.svelte";

    let data = [];
    let keys = [];
    let idx = 60;
    onMount(async (d) => {
        const response = await fetch("2d.json");
        data = await response.json();
        keys = Object.keys(data[0]);
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
                <Clouds data={d} />
            </section>
        {/each}
    </article>
{/if}

<style>
    :global(body) {
        padding: 0;
        margin: 0;
    }

    article {
        display: flex;
        flex-wrap: wrap;
    }

    section {
        width: 100%;
        /* width: 12.5%; */
        height: 650px;
    }
</style>
