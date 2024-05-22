<script>
    import Viz from "@components/Viz.svelte";
    import { onMount } from "svelte";

    let data = [];
    const numberOfViz = 10;
    let dataSegments = [];

    onMount(async () => {
        const response = await fetch("weather.json");
        data = await response.json();
        updateDataSegments();
        getRandomParams()
    });

    function updateDataSegments() {
        const segmentSize = Math.ceil(data.length / numberOfViz);
        dataSegments = Array.from({ length: numberOfViz }, (_, i) => {
            const start = i * segmentSize;
            return data.slice(start, start + segmentSize);
        });
    }

    let fullParams = [
        "baromrel",
        "dewpoint",
        "drain_piezo",
        "erain_piezo",
        "feelslike",
        "frostpoint",
        "heatindex",
        "hrain_piezo",
        "humidex",
        "humidity",
        "humidity1",
        "humidityabs",
        "humidityabsin",
        "humidityin",
        "maxdailygust",
        "mrain_piezo",
        "rrain_piezo",
        "runtime",
        "simmerindex",
        "solarradiation",
        "solarradiation_perceived",
        "temp",
        "uv",
        "wh90batt",
        "winddir",
        "windgust",
        "windspeed",
        "wrain_piezo",
        "yrain_piezo",
    ];

    let selectedParams = [];

    function getRandomParams() {
        const shuffled = fullParams.sort(() => 0.5 - Math.random());
        selectedParams = shuffled.slice(0, 3);
    }

    setInterval(getRandomParams, 2000);
</script>

<article>
    {#if dataSegments.length > 0}
        {#each dataSegments as segment}
            <section>
                <Viz data={segment} {selectedParams} />
            </section>
        {/each}
    {/if}
</article>

<style>
    article {
        display: flex;
        flex-wrap: wrap;
    }
    section {
        width: calc(20vw - 2px);
        height: calc(50vh - 2px);
        border: 0.5px solid yellow;
    }
</style>
