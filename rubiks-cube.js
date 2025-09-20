// 3D Rubik's Cube Simulation
class RubiksCube {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.cube = null;
        
        // Rubik's cube standard colors - enhanced brightness
        this.colors = {
            white: 0xffffff,   // Top
            yellow: 0xffd700,  // Bottom - brighter gold-yellow
            red: 0xff0000,     // Front
            orange: 0xff4500,  // Back - brighter orange-red
            blue: 0x0066ff,    // Right - brighter blue
            green: 0x00cc00    // Left - brighter green
        };
        
        this.init();
    }
    
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createRubiksCube();
        this.createControls();
        this.startAnimation();
        
        // Handle window resize
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }
    
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222222);
    }
    
    createCamera() {
        const container = document.getElementById('canvas-container');
        const aspect = container.clientWidth / container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);
    }
    
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(
            document.getElementById('canvas-container').clientWidth,
            document.getElementById('canvas-container').clientHeight
        );
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);
    }
    
    createLights() {
        // Brighter ambient light for better overall illumination
        const ambientLight = new THREE.AmbientLight(0x606060, 0.5);
        this.scene.add(ambientLight);
        
        // Main directional light from top-front
        const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight1.position.set(8, 8, 8);
        directionalLight1.castShadow = true;
        directionalLight1.shadow.mapSize.width = 2048;
        directionalLight1.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight1);
        
        // Secondary light from bottom-back to illuminate yellow and orange faces
        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight2.position.set(-5, -5, -8);
        this.scene.add(directionalLight2);
        
        // Additional light from the side for better color visibility
        const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.4);
        directionalLight3.position.set(0, 5, -8);
        this.scene.add(directionalLight3);
        
        // Point light for additional depth and warmth
        const pointLight = new THREE.PointLight(0xffffff, 0.4, 100);
        pointLight.position.set(0, 0, 10);
        this.scene.add(pointLight);
    }
    
    createRubiksCube() {
        this.cube = new THREE.Group();
        
        // Create 27 individual cubes (3x3x3)
        const cubeSize = 0.95; // Slightly smaller than 1 to show gaps
        const spacing = 1.0;
        
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const cubie = this.createCubie(cubeSize);
                    cubie.position.set(x * spacing, y * spacing, z * spacing);
                    
                    // Apply colors based on position
                    this.applyCubieColors(cubie, x, y, z);
                    
                    this.cube.add(cubie);
                }
            }
        }
        
        this.scene.add(this.cube);
    }
    
    createCubie(size) {
        const geometry = new THREE.BoxGeometry(size, size, size);
        
        // Create materials for each face - using MeshPhongMaterial for better color rendering
        const materials = [
            new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 30 }), // Right
            new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 30 }), // Left
            new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 30 }), // Top
            new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 30 }), // Bottom
            new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 30 }), // Front
            new THREE.MeshPhongMaterial({ color: 0x222222, shininess: 30 })  // Back
        ];
        
        const cubie = new THREE.Mesh(geometry, materials);
        cubie.castShadow = true;
        cubie.receiveShadow = true;
        
        // Add black edges for better definition
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        cubie.add(wireframe);
        
        return cubie;
    }
    
    applyCubieColors(cubie, x, y, z) {
        const materials = cubie.material;
        
        // Right face (x = 1) - Blue
        if (x === 1) {
            materials[0].color.setHex(this.colors.blue);
        }
        
        // Left face (x = -1) - Green
        if (x === -1) {
            materials[1].color.setHex(this.colors.green);
        }
        
        // Top face (y = 1) - White
        if (y === 1) {
            materials[2].color.setHex(this.colors.white);
        }
        
        // Bottom face (y = -1) - Yellow
        if (y === -1) {
            materials[3].color.setHex(this.colors.yellow);
        }
        
        // Front face (z = 1) - Red
        if (z === 1) {
            materials[4].color.setHex(this.colors.red);
        }
        
        // Back face (z = -1) - Orange
        if (z === -1) {
            materials[5].color.setHex(this.colors.orange);
        }
    }
    
    createControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        
        // Configure controls for smooth interaction
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        
        // Set zoom limits
        this.controls.minDistance = 3;
        this.controls.maxDistance = 15;
        
        // Set rotation limits (optional - remove these lines for full 360° rotation)
        // this.controls.maxPolarAngle = Math.PI;
        
        // Auto-rotate for a nice effect (optional)
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.5;
    }
    
    startAnimation() {
        const animate = () => {
            requestAnimationFrame(animate);
            
            // Update controls
            this.controls.update();
            
            // Render the scene
            this.renderer.render(this.scene, this.camera);
        };
        
        animate();
    }
    
    onWindowResize() {
        const container = document.getElementById('canvas-container');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }
}

// Initialize the Rubik's cube when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.rubiksCube = new RubiksCube();
});

// Add keyboard controls for additional interaction
document.addEventListener('keydown', (event) => {
    switch(event.code) {
        case 'KeyR':
            // Reset camera position
            const cube = window.rubiksCube;
            if (cube && cube.controls) {
                cube.controls.reset();
            }
            break;
        case 'Space':
            // Toggle auto-rotation
            const cubeSpace = window.rubiksCube;
            if (cubeSpace && cubeSpace.controls) {
                cubeSpace.controls.autoRotate = !cubeSpace.controls.autoRotate;
            }
            event.preventDefault();
            break;
    }
});

