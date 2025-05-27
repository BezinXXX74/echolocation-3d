// Esperar o DOM carregar completamente
window.addEventListener('load', init);

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

    // Configuração da cena Three.js
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Fundo totalmente preto

    // Configuração da câmera e renderer
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding; // Melhor reprodução de cores
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Melhor balanço de luz
    renderer.toneMappingExposure = 1.0; // Ajuste de exposição
    document.body.appendChild(renderer.domElement);

    try {
        // Adicionar controles de órbita otimizados
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.screenSpacePanning = false;
        controls.minDistance = 5;
        controls.maxDistance = 30;
        controls.maxPolarAngle = Math.PI / 2;

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

        // Criação do "morcego" (emissor de som)
        const createBat = () => {
            const group = new THREE.Group();

            // Corpo principal com material emissivo
            const bodyGeometry = new THREE.ConeGeometry(0.3, 1, 32);
            const bodyMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x444444,
                emissive: 0x222222
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.rotation.x = Math.PI / 2;
            group.add(body);

            // Asas com efeito de brilho
            const wingGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
            const wingMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x333333,
                emissive: 0x111111
            });
            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.set(-1, 0, 0);
            rightWing.position.set(1, 0, 0);
            group.add(leftWing);
            group.add(rightWing);

            // Adicionar pequena luz ao morcego
            const batLight = new THREE.PointLight(0x00ff88, 0.5, 3);
            batLight.position.set(0, 0, 0);
            group.add(batLight);

            return group;
        };

        const bat = createBat();
        bat.position.set(0, 3, 0);
        scene.add(bat);

        // Classe para criar ondas sonoras melhoradas
        class SoundWave {
            constructor(position) {
                // Geometria mais complexa para melhor visualização
                const geometry = new THREE.IcosahedronGeometry(0.1, 2);
                const material = new THREE.MeshBasicMaterial({
                    color: 0x00ff88,
                    transparent: true,
                    opacity: 0.8,
                    wireframe: true,
                    wireframeLinewidth: 2
                });
                this.mesh = new THREE.Mesh(geometry, material);
                this.mesh.position.copy(position);
                
                // Adicionar brilho (glow effect)
                const glowGeometry = new THREE.IcosahedronGeometry(0.12, 2);
                const glowMaterial = new THREE.MeshBasicMaterial({
                    color: 0x00ff88,
                    transparent: true,
                    opacity: 0.3,
                    side: THREE.BackSide
                });
                this.glow = new THREE.Mesh(glowGeometry, glowMaterial);
                this.mesh.add(this.glow);

                this.speed = 0.3;
                this.maxRadius = 15;
                scene.add(this.mesh);

                // Adicionar linhas de rastreamento
                const lineGeometry = new THREE.BufferGeometry();
                const lineMaterial = new THREE.LineBasicMaterial({
                    color: 0x00ff88,
                    transparent: true,
                    opacity: 0.3
                });
                this.lines = new THREE.Line(lineGeometry, lineMaterial);
                scene.add(this.lines);
            }

            update() {
                this.mesh.scale.x += this.speed;
                this.mesh.scale.y += this.speed;
                this.mesh.scale.z += this.speed;
                
                const currentRadius = this.mesh.scale.x * 0.1;
                const opacity = 1 - (currentRadius / this.maxRadius);
                
                this.mesh.material.opacity = opacity * 0.8;
                this.glow.material.opacity = opacity * 0.3;
                
                // Atualizar linhas de rastreamento
                const positions = [];
                for (let i = 0; i < 32; i++) {
                    const angle = (i / 32) * Math.PI * 2;
                    const radius = currentRadius;
                    positions.push(
                        Math.cos(angle) * radius + this.mesh.position.x,
                        Math.sin(angle) * radius + this.mesh.position.y,
                        this.mesh.position.z
                    );
                }
                this.lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
                this.lines.material.opacity = opacity * 0.3;

                return currentRadius < this.maxRadius;
            }

            remove() {
                scene.remove(this.mesh);
                scene.remove(this.lines);
            }
        }

        // Array para armazenar ondas sonoras ativas
        let activeWaves = [];
        let autoEmitEnabled = false;

        // Função para emitir uma nova onda sonora
        window.emitSoundWave = () => {
            const wave = new SoundWave(bat.position);
            activeWaves.push(wave);
        };

        // Função para alternar emissão automática
        window.toggleAutoEmit = () => {
            autoEmitEnabled = !autoEmitEnabled;
            const autoEmitButton = document.querySelector('button[onclick="toggleAutoEmit()"]');
            autoEmitButton.style.background = autoEmitEnabled ? '#ff4444' : '#4CAF50';
        };

        // Função para resetar a câmera
        window.resetCamera = () => {
            camera.position.set(0, 10, 15);
            camera.lookAt(0, 0, 0);
            controls.target.set(0, 0, 0);
            controls.update();
        };

        // Configurar controles de movimento do morcego
        const moveSpeed = 0.2;
        const keys = {};

        // Controles de teclado
        window.addEventListener('keydown', (e) => keys[e.key] = true);
        window.addEventListener('keyup', (e) => keys[e.key] = false);

        // Controles touch
        const setupTouchControls = () => {
            const directions = {
                up: document.getElementById('up'),
                down: document.getElementById('down'),
                left: document.getElementById('left'),
                right: document.getElementById('right')
            };

            const activeMoves = new Set();

            const startMove = (direction) => {
                activeMoves.add(direction);
            };

            const stopMove = (direction) => {
                activeMoves.delete(direction);
            };

            Object.entries(directions).forEach(([direction, button]) => {
                if (button) {
                    button.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        startMove(direction);
                    });

                    button.addEventListener('touchend', (e) => {
                        e.preventDefault();
                        stopMove(direction);
                    });

                    button.addEventListener('mousedown', () => startMove(direction));
                    button.addEventListener('mouseup', () => stopMove(direction));
                    button.addEventListener('mouseleave', () => stopMove(direction));
                }
            });

            return activeMoves;
        };

        const activeMoves = setupTouchControls();

        // Posicionar a câmera inicialmente
        resetCamera();

        // Função de animação
        function animate() {
            requestAnimationFrame(animate);
            
            // Atualizar controles de órbita
            controls.update();
            
            // Mover o morcego com base nos controles ativos
            const direction = new THREE.Vector3();
            
            if (keys['ArrowLeft'] || activeMoves.has('left')) direction.x -= 1;
            if (keys['ArrowRight'] || activeMoves.has('right')) direction.x += 1;
            if (keys['ArrowUp'] || activeMoves.has('up')) direction.z -= 1;
            if (keys['ArrowDown'] || activeMoves.has('down')) direction.z += 1;
            if (keys['Shift']) direction.y += 1;
            if (keys['Control']) direction.y -= 1;

            // Normalizar a direção e aplicar velocidade
            if (direction.length() > 0) {
                direction.normalize();
                bat.position.x += direction.x * moveSpeed;
                bat.position.y += direction.y * moveSpeed;
                bat.position.z += direction.z * moveSpeed;

                // Rotacionar o morcego na direção do movimento
                if (direction.x !== 0 || direction.z !== 0) {
                    const targetRotation = Math.atan2(direction.x, direction.z);
                    bat.rotation.y = targetRotation;
                }
            }

            // Limitar posição do morcego dentro da casa
            bat.position.x = Math.max(-9, Math.min(9, bat.position.x));
            bat.position.y = Math.max(1, Math.min(7, bat.position.y));
            bat.position.z = Math.max(-9, Math.min(9, bat.position.z));
            
            // Auto-emitir ondas sonoras
            if (autoEmitEnabled && Math.random() < 0.02) {
                emitSoundWave();
            }
            
            // Atualizar ondas sonoras
            activeWaves = activeWaves.filter(wave => {
                const keepWave = wave.update();
                if (!keepWave) {
                    wave.remove();
                }
                return keepWave;
            });
            
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