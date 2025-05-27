// Esperar o DOM carregar completamente
window.addEventListener('load', init);

let scene, camera, renderer, controls, bat;
let waves = [];
let autoEmit = false;

function init() {
    // Verificar se Three.js está carregado
    if (typeof THREE === 'undefined') {
        console.error('Three.js não foi carregado corretamente!');
        alert('Erro ao carregar a biblioteca 3D. Por favor, recarregue a página.');
        return;
    }

    // Verificar se OrbitControls está disponível
    if (typeof window.OrbitControls === 'undefined') {
        console.error('OrbitControls não foi carregado corretamente!');
        alert('Erro ao carregar os controles. Por favor, recarregue a página.');
        return;
    }

    // Cena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Câmera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding; // Melhor reprodução de cores
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Melhor balanço de luz
    renderer.toneMappingExposure = 1.0; // Ajuste de exposição
    document.body.appendChild(renderer.domElement);

    try {
        // Controles da câmera
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 3;
        controls.maxDistance = 20;

        // Configuração da iluminação - apenas luz ambiente fraca
        const ambientLight = new THREE.AmbientLight(0x111111, 0.2);
        scene.add(ambientLight);

        // Luz principal
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.5); // Reduzir intensidade
        mainLight.position.set(5, 8, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 50;
        mainLight.shadow.camera.left = -15;
        mainLight.shadow.camera.right = 15;
        mainLight.shadow.camera.top = 15;
        mainLight.shadow.camera.bottom = -15;
        scene.add(mainLight);

        // Luzes adicionais para melhor visibilidade
        const createPointLight = (x, y, z, intensity = 0.2) => { // Reduzir intensidade
            const light = new THREE.PointLight(0xffffff, intensity, 15); // Adicionar distância máxima
            light.position.set(x, y, z);
            scene.add(light);
        };

        createPointLight(-5, 5, -5, 0.2);
        createPointLight(5, 5, -5, 0.2);
        createPointLight(-5, 5, 5, 0.2);
        createPointLight(5, 5, 5, 0.2);

        // Criar chão
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x999999, // Cinza médio
            side: THREE.DoubleSide,
            shininess: 10
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // Criar paredes
        const createWall = (width, height, depth, x, y, z) => {
            const wallGeometry = new THREE.BoxGeometry(width, height, depth);
            const wallMaterial = new THREE.MeshPhongMaterial({ 
                color: 0xBBBBBB, // Cinza claro
                shininess: 5
            });
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(x, y, z);
            wall.castShadow = true;
            wall.receiveShadow = true;
            scene.add(wall);
            return wall;
        };

        // Paredes da casa
        createWall(20, 8, 0.2, 0, 4, 10);
        createWall(20, 8, 0.2, 0, 4, -10);
        createWall(0.2, 8, 20, 10, 4, 0);
        createWall(0.2, 8, 20, -10, 4, 0);

        // Criar móveis
        const createFurniture = () => {
            // Mesa
            const tableGeometry = new THREE.BoxGeometry(3, 1, 2);
            const tableMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x5C3A21, // Marrom mais escuro
                shininess: 20
            });
            const table = new THREE.Mesh(tableGeometry, tableMaterial);
            table.position.set(0, 0.5, 0);
            table.castShadow = true;
            table.receiveShadow = true;
            scene.add(table);

            // Sofá
            const couchGeometry = new THREE.BoxGeometry(4, 1.5, 1.5);
            const couchMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x2A4B8D, // Azul mais escuro
                shininess: 10
            });
            const couch = new THREE.Mesh(couchGeometry, couchMaterial);
            couch.position.set(-5, 0.75, -7);
            couch.castShadow = true;
            couch.receiveShadow = true;
            scene.add(couch);

            // Estante
            const bookshelfGeometry = new THREE.BoxGeometry(3, 4, 0.5);
            const bookshelfMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x5C3A21, // Marrom mais escuro
                shininess: 20
            });
            const bookshelf = new THREE.Mesh(bookshelfGeometry, bookshelfMaterial);
            bookshelf.position.set(8, 2, -8);
            bookshelf.castShadow = true;
            bookshelf.receiveShadow = true;
            scene.add(bookshelf);

            // TV
            const tvGeometry = new THREE.BoxGeometry(4, 2.5, 0.2);
            const tvMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x111111,
                shininess: 90,
                emissive: 0x222222 // Adicionar brilho suave
            });
            const tv = new THREE.Mesh(tvGeometry, tvMaterial);
            tv.position.set(0, 3, 9.8);
            tv.castShadow = true;
            scene.add(tv);

            // Rack da TV
            const rackGeometry = new THREE.BoxGeometry(5, 1, 1);
            const rackMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x5C3A21, // Marrom mais escuro
                shininess: 20
            });
            const rack = new THREE.Mesh(rackGeometry, rackMaterial);
            rack.position.set(0, 0.5, 9);
            rack.castShadow = true;
            rack.receiveShadow = true;
            scene.add(rack);
        };

        createFurniture();

        // Morcego (triângulo verde)
        const batGeometry = new THREE.ConeGeometry(0.5, 1);
        const batMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        bat = new THREE.Mesh(batGeometry, batMaterial);
        scene.add(bat);

        // Eventos
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('resize', onWindowResize);

        // Função para emitir uma nova onda sonora
        window.emitWave = emitWave;

        // Função para resetar a câmera
        window.resetCamera = () => {
            camera.position.set(0, 0, 5);
            controls.reset();
        };

        // Posicionar a câmera inicialmente
        resetCamera();

        // Função de animação
        function animate() {
            requestAnimationFrame(animate);
            
            // Atualizar controles de órbita
            controls.update();
            
            // Atualizar ondas
            for(let i = waves.length - 1; i >= 0; i--) {
                const wave = waves[i];
                wave.scale += 0.1;
                wave.mesh.scale.set(wave.scale, wave.scale, wave.scale);
                wave.mesh.material.opacity = 1 - (wave.scale / 10);
                
                if (wave.scale > 10) {
                    scene.remove(wave.mesh);
                    waves.splice(i, 1);
                }
            }
            
            renderer.render(scene, camera);
        }

        // Iniciar animação
        animate();

        // Ajustar tamanho da janela
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Log de inicialização bem-sucedida
        console.log('Simulação inicializada com sucesso!');
    } catch (error) {
        console.error('Erro durante a inicialização:', error);
        alert('Ocorreu um erro ao inicializar a simulação. Por favor, recarregue a página.');
    }
}

function emitWave() {
    const waveGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const waveMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
        transparent: true,
        opacity: 0.8
    });
    const wave = {
        mesh: new THREE.Mesh(waveGeometry, waveMaterial),
        scale: 0.1
    };
    wave.mesh.position.copy(bat.position);
    scene.add(wave.mesh);
    waves.push(wave);
}

function onKeyDown(event) {
    const moveDistance = 0.1;
    switch(event.key) {
        case 'ArrowLeft':
            bat.position.x -= moveDistance;
            break;
        case 'ArrowRight':
            bat.position.x += moveDistance;
            break;
        case 'ArrowUp':
            bat.position.y += moveDistance;
            break;
        case 'ArrowDown':
            bat.position.y -= moveDistance;
            break;
        case 'Shift':
            bat.position.z += moveDistance;
            break;
        case 'Control':
            bat.position.z -= moveDistance;
            break;
        case ' ':
            emitWave();
            break;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function resetCamera() {
    camera.position.set(0, 0, 5);
    controls.reset();
}

function createWave() {
    const wave = new THREE.Mesh(
        new THREE.SphereGeometry(0.1, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
    );
    wave.position.copy(bat.position);
    scene.add(wave);
    waves.push({ mesh: wave, scale: 0.1 });
}

function emitSoundWave() {
    createWave();
}

function toggleAutoEmit() {
    autoEmit = !autoEmit;
} 