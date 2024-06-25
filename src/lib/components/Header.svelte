<header>
    <div>
        <a href="/page_4">One Minute Skies</a>
        ⎯ Weather Frequencies:
        <a href="/page_1">Seismograph</a>
        ⎯
        <a href="/page_2">Lines</a>
        ⎯
        <a href="/page_3">Blocks</a>
        <!-- ⎯
        <a href="/page_6">Circles</a> -->
    </div>
</header>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }

    header {
        width: 100%;
        color: white;
        z-index: 10000;
        position: fixed;
        top: 0;
    }

    div {
        background-color: black;
        visibility: hidden;
    }

    header:hover > div {
        visibility: visible;
    }

    a {
        color: yellow;
        text-decoration: none;
    }
</style>
