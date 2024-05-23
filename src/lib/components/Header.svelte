<header>
    <span>
        <a href="/">Procedural</a>
        ⎯
        <a href="/viz">Three</a>
    </span>
</header>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }

    header {
        width: 100%;
        height: 100px;
        position: absolute;
        top: 0;
        color: white;
        z-index: 10000;
    }

    span {
        display: none;
    }

    header:hover span {
        display: block;
    }

    header {
        margin-bottom: 5px;
    }

    a {
        color: white;
        text-decoration: none;
    }
</style>
