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
    scene.background = new THREE.Color(0x222222);

    // Configuração da câmera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

        // Configuração da iluminação
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        scene.add(ambientLight);

        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(5, 5, 5);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        scene.add(mainLight);

        // Criar chão
        const floorGeometry = new THREE.PlaneGeometry(20, 20);
        const floorMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x808080,
            side: THREE.DoubleSide
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // Criar paredes
        const createWall = (width, height, depth, x, y, z) => {
            const wallGeometry = new THREE.BoxGeometry(width, height, depth);
            const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc });
            const wall = new THREE.Mesh(wallGeometry, wallMaterial);
            wall.position.set(x, y, z);
            wall.castShadow = true;
            wall.receiveShadow = true;
            scene.add(wall);
            return wall;
        };

        // Paredes da casa
        createWall(20, 8, 0.2, 0, 4, 10); // Parede fundo
        createWall(20, 8, 0.2, 0, 4, -10); // Parede frente
        createWall(0.2, 8, 20, 10, 4, 0); // Parede direita
        createWall(0.2, 8, 20, -10, 4, 0); // Parede esquerda

        // Criar móveis
        const createFurniture = () => {
            // Mesa
            const tableGeometry = new THREE.BoxGeometry(3, 1, 2);
            const tableMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
            const table = new THREE.Mesh(tableGeometry, tableMaterial);
            table.position.set(0, 0.5, 0);
            table.castShadow = true;
            table.receiveShadow = true;
            scene.add(table);

            // Sofá
            const couchGeometry = new THREE.BoxGeometry(4, 1.5, 1.5);
            const couchMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });
            const couch = new THREE.Mesh(couchGeometry, couchMaterial);
            couch.position.set(-5, 0.75, -7);
            couch.castShadow = true;
            couch.receiveShadow = true;
            scene.add(couch);

            // Estante
            const bookshelfGeometry = new THREE.BoxGeometry(3, 4, 0.5);
            const bookshelfMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
            const bookshelf = new THREE.Mesh(bookshelfGeometry, bookshelfMaterial);
            bookshelf.position.set(8, 2, -8);
            bookshelf.castShadow = true;
            bookshelf.receiveShadow = true;
            scene.add(bookshelf);

            // TV
            const tvGeometry = new THREE.BoxGeometry(4, 2.5, 0.2);
            const tvMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
            const tv = new THREE.Mesh(tvGeometry, tvMaterial);
            tv.position.set(0, 3, 9.8);
            tv.castShadow = true;
            scene.add(tv);

            // Rack da TV
            const rackGeometry = new THREE.BoxGeometry(5, 1, 1);
            const rackMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
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

            // Corpo principal (mais arredondado)
            const bodyGeometry = new THREE.SphereGeometry(0.3, 32, 32);
            const bodyMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x1a1a1a,
                shininess: 30
            });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.castShadow = true;
            group.add(body);

            // Cabeça
            const headGeometry = new THREE.SphereGeometry(0.2, 32, 32);
            const headMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x1a1a1a,
                shininess: 30
            });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.z = 0.25;
            head.castShadow = true;
            group.add(head);

            // Orelhas
            const earGeometry = new THREE.ConeGeometry(0.1, 0.2, 32);
            const earMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
            const leftEar = new THREE.Mesh(earGeometry, earMaterial);
            const rightEar = new THREE.Mesh(earGeometry, earMaterial);
            leftEar.position.set(-0.1, 0.15, 0.25);
            rightEar.position.set(0.1, 0.15, 0.25);
            leftEar.castShadow = true;
            rightEar.castShadow = true;
            group.add(leftEar);
            group.add(rightEar);

            // Asas (estrutura mais complexa)
            const createWing = (isLeft) => {
                const wingGroup = new THREE.Group();
                
                // Membrana principal
                const mainWingGeometry = new THREE.PlaneGeometry(1.5, 0.8);
                const wingMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0x333333,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.9
                });
                const mainWing = new THREE.Mesh(mainWingGeometry, wingMaterial);
                
                // "Dedos" da asa
                const fingerMaterial = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
                const createFinger = (length, angle, posX, posY) => {
                    const fingerGeometry = new THREE.CylinderGeometry(0.02, 0.01, length);
                    const finger = new THREE.Mesh(fingerGeometry, fingerMaterial);
                    finger.rotation.z = angle;
                    finger.position.set(posX, posY, 0);
                    return finger;
                };

                // Adicionar múltiplos "dedos"
                wingGroup.add(createFinger(1.5, 0.3, 0.4, -0.2));
                wingGroup.add(createFinger(1.2, 0.1, 0.2, -0.1));
                wingGroup.add(createFinger(1.0, -0.1, 0, 0));

                wingGroup.add(mainWing);
                wingGroup.position.x = isLeft ? -0.3 : 0.3;
                wingGroup.rotation.y = isLeft ? 0.2 : -0.2;

                return wingGroup;
            };

            const leftWing = createWing(true);
            const rightWing = createWing(false);
            leftWing.castShadow = true;
            rightWing.castShadow = true;
            group.add(leftWing);
            group.add(rightWing);

            // Adicionar animação das asas
            const animate = () => {
                const wingSpeed = 0.15;
                const wingAmplitude = 0.5;
                
                // Animação suave das asas
                leftWing.rotation.z = Math.sin(Date.now() * wingSpeed) * wingAmplitude;
                rightWing.rotation.z = -Math.sin(Date.now() * wingSpeed) * wingAmplitude;
                
                // Pequena rotação do corpo
                group.rotation.x = Math.sin(Date.now() * wingSpeed * 0.5) * 0.1;
                
                requestAnimationFrame(animate);
            };
            animate();

            return group;
        };

        const bat = createBat();
        bat.position.set(0, 3, 0);
        bat.scale.set(0.8, 0.8, 0.8); // Ajustar tamanho geral
        scene.add(bat);

        // Classe para criar ondas sonoras melhoradas
        class SoundWave {
            constructor(position) {
                const geometry = new THREE.IcosahedronGeometry(0.1, 1);
                const material = new THREE.MeshBasicMaterial({
                    color: 0x00ff88,
                    transparent: true,
                    opacity: 0.6,
                    wireframe: true
                });
                this.mesh = new THREE.Mesh(geometry, material);
                this.mesh.position.copy(position);
                this.speed = 0.3;
                this.maxRadius = 15;
                this.collisionChecked = new Set();
                scene.add(this.mesh);
            }

            update() {
                this.mesh.scale.x += this.speed;
                this.mesh.scale.y += this.speed;
                this.mesh.scale.z += this.speed;
                
                const currentRadius = this.mesh.scale.x * 0.1;
                this.mesh.material.opacity = 0.8 * (1 - (currentRadius / this.maxRadius));
                
                return currentRadius < this.maxRadius;
            }

            remove() {
                scene.remove(this.mesh);
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