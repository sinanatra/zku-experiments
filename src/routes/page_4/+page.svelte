<script>
    import ThreeD from "@components/ThreeD.svelte";
    import { onMount } from "svelte";

    let data = [];
    let range = 100;

    onMount(async () => {
        const response = await fetch("https://zku-middleware.vercel.app/api/weather");
        data = await response.json();
        range = data.length;
        getRandomParams();
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
    $: selectedParams = [];

    function getRandomParams() {
        const shuffled = fullParams.sort(() => 0.5 - Math.random());
        // selectedParams = shuffled.slice(0, 3);
        selectedParams = [ "runtime", shuffled[0], shuffled[1]];
    }

    setInterval(getRandomParams, 2000);
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
            <ThreeD data={splitData} {selectedParams} />
        </section>
    {/if}
</article>

<style>
    article {
        display: flex;
    }

    section {
        width: 100vw;
        height: 100vh;
    }
</style>
