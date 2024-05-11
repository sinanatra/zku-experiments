<script>
    import { onMount } from "svelte";
    import * as THREE from "three";

    export let data;
    export let path;

    let container;
    let scene,
        camera,
        renderer,
        cloudMeshes = [];

    let windSpeed = 0;
    let windDirection = 0;
    let cloudTextures = [];

    const texturePaths = [
        path + "/cloud_0.png",
        path + "/cloud_1.png",
        path + "/cloud_2.png",
        path + "/cloud_3.png",
        path + "/cloud_4.png",
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

        const light = mapValue(datum.solarradiation, 0, 1000, 10, 100);
        scene.background = new THREE.Color(
            `hsl(${adjustedHue}, 50%, ${light}%)`,
        );

        const rain = mapValue(datum.humidity, 50, 100, 100, 0);
        // let cloudColorBrightness = Math.max(0, light *  + rain * 0.);
        let cloudColor = new THREE.Color(`hsl(0, 0%, ${rain}%)`);

        const dewpoint = mapValue(datum.dewpoint, 0, 30, 0, 20);
        const humidity = mapValue(datum.humidity, 50, 100, 0, 50);

        // let cloudDensity = humidity;
        const dewpointDensity = mapValue(datum.dewpoint, 0, 30, 0, 20);
        const humidityDensity = mapValue(datum.humidity, 50, 100, 0, 20);

        let cloudDensity =
            datum.rrain_piezo > 0
                ? 0.2 * dewpointDensity + 0.8 * humidityDensity
                : 0.5 * dewpointDensity + 0.5 * humidityDensity;

        // console.log(cloudDensity);

        windSpeed = mapValue(datum.windspeed, 0, 50, 0, 1);
        windDirection = datum.winddir;

        let cloudOpacity = mapValue(datum.solarradiation, 0, 1000, 0.6, 1);

        updateClouds(cloudDensity, cloudColor, cloudOpacity);
    }

    function updateClouds(cloudCover, cloudColor, cloudOpacity) {
        cloudMeshes.forEach((mesh) => scene.remove(mesh));
        cloudMeshes = [];

        for (let i = 0; i < cloudCover; i++) {
            let nr = i % texturePaths.length;
            const texture = cloudTextures[nr];

            const material = new THREE.ShaderMaterial({
                uniforms: {
                    map: { value: texture },
                    cloudColor: {
                        value: new THREE.Color(cloudColor).toArray(),
                    },
                    cloudOpacity: { value: cloudOpacity },
                    fogNear: { value: 50 },
                    fogFar: { value: 1500 },
                },
                vertexShader: vertexShader,
                fragmentShader: fragmentShader,
                transparent: true,
                depthWrite: false, // Ensure depth writing is off for proper transparency handling
                side: THREE.DoubleSide,
            });

            let plane = new THREE.Mesh(
                new THREE.PlaneGeometry(600, 600),
                material,
            );
            plane.position.set(
                Math.random() * 500 - 250,
                Math.random() * 500 - 250,
                Math.random() * 1000 - 400,
            );

            let n = Math.random() * Math.PI;
            // scene.rotation.x = n;
            // scene.rotation.y = n;
            scene.rotation.z = n;
            // plane.rotation.z = Math.random() * Math.PI;

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
    uniform vec3 cloudColor;
    uniform float cloudOpacity;
    uniform float fogNear;
    uniform float fogFar;
    varying vec2 vUv;

    void main() {
        float depth = gl_FragCoord.z / gl_FragCoord.w;
        float fogFactor = smoothstep(fogNear, fogFar, depth);
        vec4 texColor = texture2D(map, vUv);

        // Apply the cloud color to the texture color based on cloud opacity
        // vec4 modulatedColor = vec4(cloudColor * texColor.rgb, texColor.a * cloudOpacity);
        vec4 modulatedColor = vec4(cloudColor * texColor.rgb, texColor.a );

        // Combine modulated texture color with the background fog color based on the fog factor
        gl_FragColor = mix(modulatedColor, vec4(cloudColor, modulatedColor.a), fogFactor);
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
