<script>
    import { onMount } from "svelte";
    import * as THREE from "three";

    let scene,
        camera,
        renderer,
        cloudMeshes = [];
    let data = [];
    let idx = 0;
    let time = "";
    let windSpeed = 0;
    let windDirection = 0;

    onMount(async () => {
        initThreeJS();
        animate();
        const response = await fetch("2d.json");
        data = await response.json();
        data = data.reverse();
        updateEnvironment(data[idx]);
    });

    function initThreeJS() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000,
        );
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);
        camera.position.z = 5;
    }

    function animate() {
        requestAnimationFrame(animate);

        const radians = THREE.MathUtils.degToRad(windDirection);
        const xSpeed = Math.sin(radians) * windSpeed;
        const ySpeed = -Math.cos(radians) * windSpeed; // Negative because y-coordinates increase downwards in screen space

        cloudMeshes.forEach((mesh) => {
            mesh.position.x += xSpeed;
            mesh.position.y += ySpeed;

            // Reset position when moving out of view for looping effect
            if (mesh.position.x > 1000) mesh.position.x = -1000;
            if (mesh.position.x < -1000) mesh.position.x = 1000;
            if (mesh.position.y > 500) mesh.position.y = -500;
            if (mesh.position.y < -500) mesh.position.y = 500;
        });

        renderer.render(scene, camera);
    }

    function updateEnvironment(datum) {
        const tempHue = 200;
        const timeOfDay = new Date(datum.time).getHours();

        const hueAdjustment = mapValue(timeOfDay, 0, 23, -10, 10);
        const adjustedHue = tempHue + hueAdjustment;

        const rain = mapValue(datum.humidity, 0, 100, 100, 0);
        const light = mapValue(datum.solarradiation, 0, 1000, 20, 100);

        scene.background = new THREE.Color(
            `hsl(${adjustedHue}, 50%, ${light}%)`,
        );

        let cloudColor = new THREE.Color(`hsl(0, 0%, ${100 - rain}%)`);

        const dewpoint = mapValue(datum.dewpoint, 0, 30, 0, 20);
        const humidity = mapValue(datum.humidity, 50, 100, 0, 20);
        let cloudDensity = humidity; // Math.abs(humidity + dewpoint);
        windSpeed = mapValue(datum.windspeed, 0, 30, 0, 2);
        windDirection = datum.winddir;

        let cloudOpacity = mapValue(light, 0, 100, 0.1, 1);

        updateClouds(cloudDensity, cloudColor, cloudOpacity);
        time = datum.time + " | " + cloudDensity + " | " + rain;
    }

    function updateClouds(cloudCover, cloudColor, cloudOpacity) {
        cloudMeshes.forEach((mesh) => scene.remove(mesh));
        cloudMeshes = [];

        const texture = new THREE.TextureLoader().load("cloud3.png");
        const fog = new THREE.Fog(scene.background, 50, 1500);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                map: { value: texture },
                fogColor: { value: cloudColor },
                cloudOpacity: { value: cloudOpacity },
                fogNear: { value: fog.near },
                fogFar: { value: fog.far },
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
            plane.rotation.x = Math.random() * Math.PI;
            plane.rotation.y = Math.random() * Math.PI; 
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

<label>
    Index:
    <input
        type="number"
        bind:value={idx}
        min="0"
        max={data.length - 1}
        step="10"
        on:input={() => updateEnvironment(data[idx])}
    />
    {time}
</label>
