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
    scene.background = new THREE.Color(0x000000); // Fundo preto

    // Configuração da câmera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);

    try {
        // Adicionar controles de órbita otimizados para touch
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.5;
        controls.pinchSpeed = 1;
        controls.touches = {
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN
        };

        // Configuração da iluminação
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Criação do "ambiente" (caverna)
        const createCave = () => {
            const caveGeometry = new THREE.IcosahedronGeometry(30, 1);
            const caveMaterial = new THREE.MeshPhongMaterial({
                color: 0x505050,
                side: THREE.BackSide,
                wireframe: true
            });
            const cave = new THREE.Mesh(caveGeometry, caveMaterial);
            scene.add(cave);
        };
        createCave();

        // Criação do "morcego" (emissor de som)
        const createBat = () => {
            const group = new THREE.Group();

            // Corpo
            const bodyGeometry = new THREE.ConeGeometry(0.5, 2, 32);
            const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            body.rotation.x = Math.PI / 2;
            group.add(body);

            // Asas
            const wingGeometry = new THREE.BoxGeometry(3, 0.1, 1);
            const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
            const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
            const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
            leftWing.position.set(-1.5, 0, 0);
            rightWing.position.set(1.5, 0, 0);
            group.add(leftWing);
            group.add(rightWing);

            return group;
        };

        const bat = createBat();
        scene.add(bat);

        // Criação de obstáculos mais interessantes
        const createObstacle = (x, y, z) => {
            const types = [
                new THREE.BoxGeometry(2, 2, 2),
                new THREE.SphereGeometry(1, 16, 16),
                new THREE.ConeGeometry(1, 2, 16),
                new THREE.TorusGeometry(1, 0.4, 16, 32)
            ];
            const geometry = types[Math.floor(Math.random() * types.length)];
            const material = new THREE.MeshPhongMaterial({ 
                color: 0x808080,
                roughness: 0.7,
                metalness: 0.3
            });
            const obstacle = new THREE.Mesh(geometry, material);
            obstacle.position.set(x, y, z);
            obstacle.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            obstacle.castShadow = true;
            obstacle.receiveShadow = true;
            scene.add(obstacle);
            return obstacle;
        };

        // Adicionar obstáculos em posições aleatórias
        const obstacles = [];
        for (let i = 0; i < 15; i++) {
            const x = (Math.random() - 0.5) * 40;
            const y = (Math.random() - 0.5) * 40;
            const z = (Math.random() - 0.5) * 40;
            obstacles.push(createObstacle(x, y, z));
        }

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
                this.maxRadius = 20;
                this.collisionChecked = new Set();
                scene.add(this.mesh);
            }

            update() {
                this.mesh.scale.x += this.speed;
                this.mesh.scale.y += this.speed;
                this.mesh.scale.z += this.speed;
                
                const currentRadius = this.mesh.scale.x * 0.1;
                this.mesh.material.opacity = 0.8 * (1 - (currentRadius / this.maxRadius));
                
                this.checkCollisions();
                
                return currentRadius < this.maxRadius;
            }

            checkCollisions() {
                const radius = this.mesh.scale.x * 0.1;
                obstacles.forEach((obstacle, index) => {
                    if (!this.collisionChecked.has(index)) {
                        const distance = this.mesh.position.distanceTo(obstacle.position);
                        if (distance <= radius + 1) {
                            this.collisionChecked.add(index);
                            this.highlightObstacle(obstacle);
                        }
                    }
                });
            }

            highlightObstacle(obstacle) {
                const originalColor = obstacle.material.color.getHex();
                obstacle.material.color.setHex(0x00ff88);
                setTimeout(() => {
                    obstacle.material.color.setHex(originalColor);
                }, 500);
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
            camera.position.set(0, 5, 15);
            camera.lookAt(0, 0, 0);
            controls.reset();
        };

        // Configurar controles de movimento do morcego
        const moveSpeed = 0.3;
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

                    // Suporte para mouse também
                    button.addEventListener('mousedown', () => startMove(direction));
                    button.addEventListener('mouseup', () => stopMove(direction));
                    button.addEventListener('mouseleave', () => stopMove(direction));
                }
            });

            return activeMoves;
        };

        const activeMoves = setupTouchControls();

        // Posicionar a câmera
        resetCamera();

        // Função de animação
        function animate() {
            requestAnimationFrame(animate);
            
            // Atualizar controles de órbita
            controls.update();
            
            // Mover o morcego com base nos controles ativos
            if (keys['ArrowLeft'] || activeMoves.has('left')) bat.position.x -= moveSpeed;
            if (keys['ArrowRight'] || activeMoves.has('right')) bat.position.x += moveSpeed;
            if (keys['ArrowUp'] || activeMoves.has('up')) bat.position.z -= moveSpeed;
            if (keys['ArrowDown'] || activeMoves.has('down')) bat.position.z += moveSpeed;
            if (keys['Shift']) bat.position.y += moveSpeed;
            if (keys['Control']) bat.position.y -= moveSpeed;
            
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