<script>
    import { onMount, afterUpdate } from "svelte";
    import * as THREE from "three";
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

        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 10, 50);

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
            // Clear existing scene objects
            while (scene.children.length > 0) {
                scene.remove(scene.children[0]);
            }
        } else {
            scene = new THREE.Scene();
            scene.background = new THREE.Color("black");
        }

        const positions = [];
        const delaunayPoints = [];
        const colors = [];

        data.forEach((point) => {

            
            const x = selectedParams.length == 3 ? point[selectedParams[0]]  : point.humidity;
            const y = selectedParams.length == 3 ? point[selectedParams[1]]  : point.feelslike;
            const z = selectedParams.length == 3 ? point[selectedParams[2]]  : point.frostpoint;
            
            positions.push(x, y, z);
            delaunayPoints.push([x, z]);
            const color = new THREE.Color().setHSL(
                mapValue(point.temp, 0, 50, 0.1, 0.9),
                1,
                0.6,
            );
            colors.push(color.r, color.g, color.b);
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
                size: .5,
                vertexColors: true,
            }),
        );
        scene.add(points);

        mesh = new THREE.Mesh(
            pointsGeometry,
            new THREE.MeshBasicMaterial({ color: "white", wireframe: true }),
        );
        scene.add(mesh);

        const center = new THREE.Vector3();
        pointsGeometry.computeBoundingBox();
        pointsGeometry.boundingBox.getCenter(center);
        points.geometry.center();
        mesh.geometry.center();
        camera.lookAt(center);
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
</script>

<div bind:this={container} style="width: 100vw; height: 100vh;"></div>

<style>
    div {
        position: relative;
        overflow: hidden;
        width: 100%;
        height: 100%;
    }
</style>
