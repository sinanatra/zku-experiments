<article>
    <div class="cube">
        <div class="face front">
            <iframe
                src="/page_1"
                title="1"
                width="100%"
                height="100%"
                frameborder="0"
            ></iframe>
        </div>
        <div class="face back">
            <iframe
                src="/page_2"
                title="2"
                width="100%"
                height="100%"
                frameborder="0"
            ></iframe>
        </div>
        <div class="face left">
            <iframe
                src="/page_3"
                title="3"
                width="100%"
                height="100%"
                frameborder="0"
            ></iframe>
        </div>
        <div class="face right">
           <img src="https://www.dwd.de/DWD/wetter/sat/bilder/meteosat/satbild_hrvir_akt.png" alt="">
            <!-- <iframe
                src="/page_3"
                title="clouds"
                width="100%"
                height="100%"
                frameborder="0"
            ></iframe> -->
        </div>
        <div class="face top">
            <iframe
                src="/page_4"
                title="clouds"
                width="100%"
                height="100%"
                frameborder="0"
            ></iframe>
        </div>
        <div class="face bottom">
            <iframe
                src="/page_4"
                title="clouds"
                width="100%"
                height="100%"
                frameborder="0"
            ></iframe>
        </div>
    </div>
</article>

<style>
    article {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
        margin: 0;
        padding: 0;
        background-color: black;
    }

    .cube {
        width: 90vw;
        height: 90vw;
        position: relative;
        transform-style: preserve-3d;
        transform: rotateX(-20deg) rotateY(20deg);
        animation: rotate 60s infinite linear;
    }

    .face {
        position: absolute;
        width: 100%;
        height: 100%;
        background: black;
        border: 1px solid yellow;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 2rem;
        color: yellow;
        box-sizing: border-box;
    }

    .front {
        transform: rotateY(0deg) translateZ(45vw);
    }
    .back {
        transform: rotateY(180deg) translateZ(45vw);
    }
    .left {
        transform: rotateY(-90deg) translateZ(45vw);
    }
    .right {
        transform: rotateY(90deg) translateZ(45vw);
    }
    .top {
        transform: rotateX(90deg) translateZ(45vw);
    }
    .bottom {
        transform: rotateX(-90deg) translateZ(45vw);
    }

    @keyframes rotate {
        0% {
            transform: rotateX(-90deg) rotateY(0deg);
        }
        50% {
            transform: rotateX(90deg) rotateY(180deg);
        }
        100% {
            transform: rotateX(-90deg) rotateY(360deg);
        }
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
</style>
