<script>
    import { onMount, afterUpdate } from "svelte";
    import * as THREE from "three";
    import * as d3 from "d3";
    import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
    import Delaunator from "delaunator";

    export let data;
    export let selectedParams;
    let container;
    let renderer, scene, camera, controls, points, mesh;

    onMount(() => {
        init();
        animate();
    });

    afterUpdate(() => {
        updateVisualization();
    });

    function init() {
        const width = container.clientWidth;
        const height = container.clientHeight;

        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);

        camera = new THREE.PerspectiveCamera();
        camera.position.set(0, 0, -1000);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 10;
        controls.maxDistance = 200;
        controls.maxPolarAngle = Math.PI / 2;

        setupScene();
    }

    function setupScene() {
        if (scene) {
            while (scene.children.length > 0) {
                scene.remove(scene.children[0]);
            }
        } else {
            scene = new THREE.Scene();
            scene.background = new THREE.Color("#222");
        }

        const positions = [];
        const delaunayPoints = [];
        const colors = [];

        if (selectedParams.length >= 3) {
            let normalizedData = normalizeData(data, selectedParams);

            normalizedData.forEach((point) => {
                const x = point.x;
                const y = point.y;
                const z = point.z;

                if (x && y && z) {
                    positions.push(x, y, z);
                    delaunayPoints.push([x, z]);
                    const color = new THREE.Color().setHSL(
                        mapValue(point.x, 0, 50, 0.4, 0.5),
                        1,
                        0.6,
                    );
                    colors.push(color.r, color.g, color.b);
                }
            });

            const pointsGeometry = new THREE.BufferGeometry();
            pointsGeometry.setAttribute(
                "position",
                new THREE.Float32BufferAttribute(positions, 3),
            );
            pointsGeometry.setAttribute(
                "color",
                new THREE.Float32BufferAttribute(colors, 3),
            );

            const delaunator = Delaunator.from(delaunayPoints);
            const meshIndex = Array.from(delaunator.triangles);
            pointsGeometry.setIndex(meshIndex);
            pointsGeometry.computeVertexNormals();

            points = new THREE.Points(
                pointsGeometry,
                new THREE.PointsMaterial({
                    size: 6,
                    vertexColors: true,
                    sizeAttenuation: true,
                    transparent: true,
                    opacity: 1,
                    map: new THREE.TextureLoader().load(
                        "https://threejs.org/examples/textures/sprites/circle.png",
                    ),
                    alphaTest: 0.5,
                }),
            );

            scene.add(points);

            mesh = new THREE.Mesh(
                pointsGeometry,
                new THREE.MeshBasicMaterial({
                    color: "#fefefe",
                    wireframe: true,
                }),
            );
            scene.add(mesh);

            const center = new THREE.Vector3();
            pointsGeometry.computeBoundingBox();
            pointsGeometry.boundingBox.getCenter(center);
            points.geometry.center();
            mesh.geometry.center();
            camera.lookAt(center);
        }
    }

    function updateVisualization() {
        if (data && container) {
            setupScene();
            renderer.render(scene, camera);
        }
    }

    function animate() {
        requestAnimationFrame(animate);

        points.rotation.y += 0.001;
        mesh.rotation.y += 0.001;

        points.rotation.z += 0.001;
        mesh.rotation.z += 0.001;

        controls.update();
        renderer.render(scene, camera);
    }

    function mapValue(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }

    function normalizeData(data, params) {
        const limits = params.map((param) => ({
            param: param,
            min: d3.min(data, (d) => d[param]),
            max: d3.max(data, (d) => d[param]),
        }));

        return data.map((d) => ({
            x: normalize(d[params[0]], limits[0].min, limits[0].max),
            y: normalize(d[params[1]], limits[1].min, limits[1].max),
            z: normalize(d[params[2]], limits[2].min, limits[2].max),
        }));
    }

    function normalize(value, min, max) {
        return ((value - min) / (max - min)) * 200;
    }
</script>

<div bind:this={container} style="width: 100%; height: 100%;"></div>

<style>
    div {
        position: relative;
        overflow: hidden;
        width: 100%;
        height: 100%;
    }
</style>
