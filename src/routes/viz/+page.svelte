<script>
    import Viz from "@components/Viz.svelte";
    import { onMount } from "svelte";

    let data = [];
    let range = 100;

    onMount(async () => {
        const response = await fetch("weather.json");
        data = await response.json();
        range = data.length;
    });

    $: splitData = data.slice(0, range);

    let fullParams = [
        // "baromabs",
        "baromrel",
        // "beaufortscale",
        "dewpoint",
        "drain_piezo",
        "erain_piezo",
        "feelslike",
        "frostpoint",
        // "gain10_piezo",
        // "gain20_piezo",
        // "gain30_piezo",
        // "gain40_piezo",
        // "gain50_piezo",
        // "heap",
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
        // "soilbatt1",
        // "soilbatt2",
        // "soilmoisture1",
        // "soilmoisture2",
        "solarradiation",
        "solarradiation_perceived",
        "temp",
        // "temp1",
        // "tempin",
        // "tf_batt1",
        // "tf_ch1",
        "uv",
        "wh90batt",
        "winddir",
        "windgust",
        "windspeed",
        "wrain_piezo",
        // "ws90_ver",
        // "ws90cap_volt",
        "yrain_piezo",
    ];
    $: selectedParams = ["humidity", "windspeed", "winddir"];

    $: console.log(
        selectedParams,
        selectedParams.map((d) => selectedParams[0][d]),
    );

    function getRandomParams() {
        const shuffled = fullParams.sort(() => 0.5 - Math.random());
        selectedParams = shuffled.slice(0, 3);
    }

    setInterval(getRandomParams, 10000);
</script>

<!-- <label for="range"
    >Range:
    <input
        type="number"
        id="range"
        bind:value={range}
        min="0"
        max={data.length}
        step="10"
    />
</label> -->

<!-- {#each fullParams as param}
    <label>
        <input
            type="checkbox"
            name="flavours"
            value={param}
            bind:group={selectedParams}
        />
        {param}
    </label>
{/each} -->

<article>
    {#if splitData.length > 0}
        <section>
            <Viz data={splitData} {selectedParams} />
        </section>
    {/if}
</article>

<style>
    article {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
    }
    label {
        margin-bottom: 10px;
    }
</style>
