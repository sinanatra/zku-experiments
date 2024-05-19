<script>
    import Viz from "@components/Viz.svelte";
    import { onMount } from "svelte";

    let data = [];
    let range = 100;

    onMount(async () => {
        const response = await fetch("weather.json");
        data = await response.json();
        // data.reverse();
    });

    $: splitData = data.slice(0, range);

    let selectedParams = [];

    $: console.log(selectedParams);
</script>

<label for="range"
    >Range:
    <input
        type="number"
        id="range"
        bind:value={range}
        min="0"
        max={data.length}
        step="10"
    />
</label>

{#each ["baromabs", "baromrel", "beaufortscale", "dewpoint", "drain_piezo", "erain_piezo", "feelslike", "frostpoint", "gain10_piezo", "gain20_piezo", "gain30_piezo", "gain40_piezo", "gain50_piezo", "heap", "heatindex", "hrain_piezo", "humidex", "humidity", "humidity1", "humidityabs", "humidityabsin", "humidityin", "interval", "maxdailygust", "mrain_piezo", "rrain_piezo", "runtime", "safe_exposure_time_skin_type_1", "safe_exposure_time_skin_type_2", "safe_exposure_time_skin_type_3", "safe_exposure_time_skin_type_4", "safe_exposure_time_skin_type_5", "safe_exposure_time_skin_type_6", "simmerindex", "soilbatt1", "soilbatt2", "soilmoisture1", "soilmoisture2", "solarradiation", "solarradiation_perceived", "temp", "temp1", "tempin", "tf_batt1", "tf_ch1", "uv", "wh25batt", "wh90batt", "windchill", "winddir", "windgust", "windspeed", "wrain_piezo", "ws90_ver", "ws90cap_volt", "yrain_piezo"] as param}
    <label>
        <input
            type="checkbox"
            name="flavours"
            value={param}
            bind:group={selectedParams}
        />
        {param}
    </label>
{/each}

<article>
    {#if splitData.length > 0}
        <section>
            <Viz data={splitData} {selectedParams}/>
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
