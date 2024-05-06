<script>
    import { onMount } from "svelte";
    import * as THREE from "three";

    export let data;

    let container;
    let scene,
        camera,
        renderer,
        cloudMeshes = [];

    let windSpeed = 0;
    let windDirection = 0;
    let cloudTextures = [];
    const texturePaths = [
        "cloud1.png",
        "cloud2.png",
        "cloud3.png",
        "cloud4.png",
        "cloud5.png",
        // "cloud6.png",
    ];

    function loadTextures() {
        const loader = new THREE.TextureLoader();
        texturePaths.forEach((path) => {
            cloudTextures.push(loader.load(path));
        });
    }

    onMount(async () => {
        initThreeJS();
        loadTextures();
        animate();
        updateEnvironment(data);
    });

    $: {
        try {
            updateEnvironment(data);
        } catch (error) {}
    }

    function initThreeJS() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(
            75,
            container.clientWidth / container.clientHeight,
            0.1,
            1000,
        );

        renderer = new THREE.WebGLRenderer({ alpha: false });
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);
        renderer.setClearColor(0x000000, 1);

        camera.position.z = 5;
    }

    function animate() {
        requestAnimationFrame(animate);

        const radians = THREE.MathUtils.degToRad(windDirection);
        const xSpeed = Math.sin(radians) * windSpeed;
        const ySpeed = -Math.cos(radians) * windSpeed;

        cloudMeshes.forEach((mesh) => {
            mesh.position.x += xSpeed;
            mesh.position.y += ySpeed;

            if (mesh.position.x > 1000) mesh.position.x = -1000;
            if (mesh.position.x < -1000) mesh.position.x = 1000;
            if (mesh.position.y > 500) mesh.position.y = -500;
            if (mesh.position.y < -500) mesh.position.y = 500;
        });

        renderer.render(scene, camera);
    }

    function updateEnvironment(datum) {
        const tempHue = 210;
        const timeOfDay = new Date(datum.time).getHours();

        const hueAdjustment = mapValue(timeOfDay, 0, 23, -10, 10);
        const adjustedHue = tempHue + hueAdjustment;

        const light = mapValue(datum.solarradiation, 0, 1000, 20, 100);
        scene.background = new THREE.Color(
            `hsl(${adjustedHue}, 50%, ${light}%)`,
        );

        const rain = mapValue(datum.humidity, 50, 100, 50, 0);
        let cloudColorBrightness = Math.max(0, light * 0.5 + rain * 0.5);
        let cloudColor = new THREE.Color(
            `hsl(0, 0%, ${cloudColorBrightness}%)`,
        );

        const dewpoint = mapValue(datum.dewpoint, 0, 30, 0, 20);
        const humidity = mapValue(datum.humidity, 50, 100, 0, 50);
        let cloudDensity = humidity;
        windSpeed = mapValue(datum.windspeed, 0, 50, 0, 1);
        windDirection = datum.winddir;

        let cloudOpacity = mapValue(light, 0, 100, 0.3, 1);

        updateClouds(cloudDensity, cloudColor, cloudOpacity);
    }

    function updateClouds(cloudCover, cloudColor, cloudOpacity) {
        cloudMeshes.forEach((mesh) => scene.remove(mesh));
        cloudMeshes = [];

        const texture =
            cloudTextures[Math.floor(Math.random() * cloudTextures.length)];
        const material = new THREE.ShaderMaterial({
            uniforms: {
                map: { value: texture },
                cloudColor: { value: cloudColor },
                cloudOpacity: { value: cloudOpacity },
                fogNear: { value: 50 },
                fogFar: { value: 1500 },
            },
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            side: THREE.DoubleSide,
        });
        for (let i = 0; i < cloudCover; i++) {
            let plane = new THREE.Mesh(
                new THREE.PlaneGeometry(cloudCover * 40, cloudCover * 40),
                material,
            );
            plane.position.set(
                Math.random() * 1000 - 500,
                Math.random() * 500 - 250,
                Math.random() * 600 - 200,
            );

            plane.rotation.z = Math.random() * 1000 - 750 * Math.PI;
            scene.add(plane);
            cloudMeshes.push(plane);
        }
    }

    function mapValue(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
        }
    `;

    const fragmentShader = `
        uniform sampler2D map;
        uniform vec3 fogColor;
        uniform float fogNear;
        uniform float fogFar;
        uniform float cloudOpacity;
        varying vec2 vUv;

        void main() {
            float depth = gl_FragCoord.z / gl_FragCoord.w;
            float fogFactor = smoothstep(fogNear, fogFar, depth);
            vec4 color = texture2D(map, vUv);
            color.w *= pow(gl_FragCoord.z, 20.0);
            color.w *= cloudOpacity;
            gl_FragColor = mix(color, vec4(fogColor, color.w), fogFactor);
        }
    `;
</script>

<div bind:this={container}></div>
<style>
    div {
        height: 100%;
        width: 100%;
    }
</style>
