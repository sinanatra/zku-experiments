<script>
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import Clouds from "@components/Clouds.svelte";

    let data = [];
    let keys = [];

    onMount(async (d) => {
        const response = await fetch("weather.json");
        data = await response.json();
        keys = Object.keys(data[0]);
    });
</script>

{#if data.length == 0}
    <article>Loading...</article>
{:else}
    <article>
        <section>
            <Clouds data={data[0]} {keys} />
        </section>
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
        height: 90vh;
    }
</style>
