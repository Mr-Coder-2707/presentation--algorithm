// --- STATE MANAGEMENT ---
let currentSlide = 0;
const totalSlides = 8;
let isAnimating = false;

// Slide metadata for navigator
const slideData = [
    { title: "Title", desc: "StoneSort - Visual Sorting Lab", icon: "fa-home" },
    { title: "Overview", desc: "Educational, 3D, Interactive", icon: "fa-info-circle" },
    { title: "Key Features", desc: "22+ Themes, Monaco Editor, 3D Viz", icon: "fa-star" },
    { title: "Algorithms", desc: "Bubble, Quick, Merge, Heap, etc.", icon: "fa-code" },
    { title: "Tech Stack", desc: "Flask, Vue.js, Three.js, Tailwind", icon: "fa-layer-group" },
    { title: "Future Roadmap", desc: "Graphs, Trees, Enhancements", icon: "fa-rocket" },
    { title: "Get Started", desc: "Installation & Shortcuts", icon: "fa-play-circle" },
    { title: "Thank You", desc: "Contact & Links", icon: "fa-heart" }
];

// --- NAVIGATOR FUNCTIONS ---
function toggleNavigator() {
    const nav = document.getElementById('slide-navigator');
    nav.classList.toggle('open');
}

function goToSlide(index) {
    if (index === currentSlide || isAnimating) return;
    
    const direction = index > currentSlide ? 1 : -1;
    const steps = Math.abs(index - currentSlide);
    
    // Direct jump
    jumpToSlide(index);
    
    // Close navigator
    toggleNavigator();
}

function jumpToSlide(targetIndex) {
    if (isAnimating || targetIndex === currentSlide) return;
    
    isAnimating = true;
    const currentEl = document.getElementById(`slide-${currentSlide}`);
    const nextEl = document.getElementById(`slide-${targetIndex}`);

    if (typeof gsap !== 'undefined') {
        gsap.to(currentEl, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                currentEl.classList.remove('active');
                currentSlide = targetIndex;
                nextEl.classList.add('active');
                
                gsap.fromTo(nextEl, 
                    { opacity: 0, scale: 0.95 },
                    { 
                        opacity: 1, 
                        scale: 1, 
                        duration: 0.3,
                        onComplete: () => {
                            isAnimating = false;
                            updateNavigator();
                        }
                    }
                );

                animateSlideElements(currentSlide);
                animateCameraTransition(currentSlide);
                updateProgressBar();
                updateSlideCounter();
            }
        });
    } else {
        currentEl.classList.remove('active');
        currentSlide = targetIndex;
        nextEl.classList.add('active');
        
        setTimeout(() => {
            isAnimating = false;
            updateNavigator();
            animateSlideElements(currentSlide);
            animateCameraTransition(currentSlide);
            updateProgressBar();
            updateSlideCounter();
        }, 300);
    }
}

function updateNavigator() {
    const thumbs = document.querySelectorAll('.slide-thumb');
    thumbs.forEach((thumb, index) => {
        if (index === currentSlide) {
            thumb.classList.add('active');
        } else {
            thumb.classList.remove('active');
        }
    });
}

function populateNavigator() {
    const list = document.getElementById('slide-list');
    list.style.cssText = 'display: flex; gap: 1rem; padding: 0; margin: 0;';
    list.innerHTML = '';
    
    slideData.forEach((slide, index) => {
        const thumb = document.createElement('div');
        thumb.className = 'slide-thumb';
        if (index === currentSlide) {
            thumb.classList.add('active');
        }
        thumb.onclick = () => goToSlide(index);
        
        // Create preview
        const previewDiv = document.createElement('div');
        previewDiv.className = 'slide-thumb-preview';
        previewDiv.id = `thumb-preview-${index}`;
        
        // Add icon overlay
        const overlay = document.createElement('div');
        overlay.className = 'preview-overlay';
        overlay.innerHTML = `<i class="fas ${slide.icon}"></i>`;
        previewDiv.appendChild(overlay);
        
        // Add slide number
        const numberBadge = document.createElement('span');
        numberBadge.className = 'slide-thumb-number';
        numberBadge.textContent = index + 1;
        previewDiv.appendChild(numberBadge);
        
        thumb.appendChild(previewDiv);
        list.appendChild(thumb);
    });
    
    // Generate previews after DOM is ready
    setTimeout(() => generateSlidePreviews(), 100);
}

function generateSlidePreviews() {
    slideData.forEach((slide, index) => {
        const slideElement = document.getElementById(`slide-${index}`);
        const previewContainer = document.getElementById(`thumb-preview-${index}`);
        
        if (!slideElement || !previewContainer) return;
        
        // Clone the slide content for preview
        const clone = slideElement.cloneNode(true);
        clone.style.cssText = `
            position: absolute;
            width: 1000px;
            height: 600px;
            transform: scale(0.2);
            transform-origin: top left;
            pointer-events: none;
            opacity: 0.75;
            left: 0;
            top: 0;
        `;
        clone.classList.add('active');
        clone.id = `clone-${index}`;
        
        // Remove animations and make visible
        const animElements = clone.querySelectorAll('.element-anim');
        animElements.forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        
        // Insert clone before overlay
        const overlay = previewContainer.querySelector('.preview-overlay');
        previewContainer.insertBefore(clone, overlay);
    });
}

// --- THREE.JS SETUP ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Fog for depth
scene.fog = new THREE.FogExp2(0x0f172a, 0.03);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// --- PARTICLES & OBJECTS ---

// 1. Grid of Cubes (Sorting Visualization Metaphor)
const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const material = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.3 });

const cubes = [];
const group = new THREE.Group();

// Create a cloud of cubes
for (let i = 0; i < 150; i++) {
    const cube = new THREE.Mesh(geometry, material);
    
    // Random positions
    cube.position.x = (Math.random() - 0.5) * 60;
    cube.position.y = (Math.random() - 0.5) * 40;
    cube.position.z = (Math.random() - 0.5) * 30;
    
    // Random rotation
    cube.rotation.x = Math.random() * Math.PI;
    cube.rotation.y = Math.random() * Math.PI;
    
    // Store initial scale for animation
    cube.userData = {
        scaleSpeed: Math.random() * 0.02,
        rotSpeed: (Math.random() - 0.5) * 0.02
    };

    cubes.push(cube);
    group.add(cube);
}
scene.add(group);

// 2. Connecting Lines (Network Metaphor)
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.15 });
const lineGeometry = new THREE.BufferGeometry();
const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
scene.add(lines);

// --- MOUSE INTERACTION ---
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.05;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.05;
});

// --- ANIMATION LOOP ---
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();

    // Smooth camera movement based on mouse
    targetX = mouseX * 0.5;
    targetY = mouseY * 0.5;
    group.rotation.y += 0.002; // Auto rotation
    group.rotation.x += (mouseY * 0.001 - group.rotation.x) * 0.05;
    group.rotation.y += (mouseX * 0.001 - group.rotation.y) * 0.05;

    // Animate individual cubes
    cubes.forEach((cube, i) => {
        cube.rotation.x += cube.userData.rotSpeed;
        cube.rotation.y += cube.userData.rotSpeed;
        
        // Gentle floating
        cube.position.y += Math.sin(time + i) * 0.01;
        
        // Dynamic scaling based on active slide (simplified reaction)
        const scale = 1 + Math.sin(time * 2 + i) * 0.3;
        cube.scale.set(scale, scale, scale);
    });

    // Update Lines dynamically to connect close cubes
    updateLines();

    renderer.render(scene, camera);
}

function updateLines() {
    // Only connect a subset to save performance
    const positions = [];
    // Connect first 30 cubes to their nearest neighbors among the first 30
    const limit = 40; 
    for(let i = 0; i < limit; i++) {
        for(let j = i + 1; j < limit; j++) {
            const dist = cubes[i].position.distanceTo(cubes[j].position);
            if(dist < 8) {
                positions.push(
                    cubes[i].position.x, cubes[i].position.y, cubes[i].position.z,
                    cubes[j].position.x, cubes[j].position.y, cubes[j].position.z
                );
            }
        }
    }
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
}

animate();

// --- RESIZE HANDLER ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- SLIDE LOGIC ---

function updateProgressBar() {
    const progress = ((currentSlide) / (totalSlides - 1)) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

function animateSlideElements(slideIndex) {
    // GSAP Animation for entering elements
    const elements = document.querySelectorAll(`#slide-${slideIndex} .element-anim`);
    
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(elements, 
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
        );
    } else {
        // Fallback: Simple fade in
        elements.forEach((el, i) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, i * 100);
        });
    }
}

function animateCameraTransition(slideIndex) {
    if (typeof THREE === 'undefined' || !camera) return;
    
    // Move camera to different positions based on slide for "Prezi" feel
    let pos = { x: 0, y: 0, z: 30 };

    switch(slideIndex % 4) {
        case 0: pos = {x:0, y:0, z:30}; break;
        case 1: pos = {x:10, y:5, z:20}; break;
        case 2: pos = {x:-10, y:-5, z:25}; break;
        case 3: pos = {x:0, y:10, z:40}; break;
    }

    if (typeof gsap !== 'undefined') {
        gsap.to(camera.position, {
            x: pos.x,
            y: pos.y,
            z: pos.z,
            duration: 1.5,
            ease: "power2.inOut"
        });
    } else {
        // Fallback: Instant camera position
        camera.position.set(pos.x, pos.y, pos.z);
    }
    
    // Change cube colors based on section
    const colors = [0x38bdf8, 0xfbbf24, 0xa855f7, 0x22c55e, 0xef4444];
    const color = colors[slideIndex % colors.length];
    
    if (cubes && cubes.length > 0) {
        cubes.forEach(cube => {
            if (typeof gsap !== 'undefined') {
                gsap.to(cube.material.color, {
                    r: new THREE.Color(color).r,
                    g: new THREE.Color(color).g,
                    b: new THREE.Color(color).b,
                    duration: 1
                });
            } else {
                cube.material.color.set(color);
            }
        });
    }
}

function changeSlide(direction) {
    console.log('changeSlide called with direction:', direction);
    console.log('Current slide:', currentSlide, 'isAnimating:', isAnimating);
    
    if (isAnimating) {
        console.log('Animation in progress, skipping');
        return;
    }
    
    const nextIndex = currentSlide + direction;
    console.log('Next index:', nextIndex);

    if (nextIndex >= 0 && nextIndex < totalSlides) {
        isAnimating = true;

        // Get elements
        const currentEl = document.getElementById(`slide-${currentSlide}`);
        const nextEl = document.getElementById(`slide-${nextIndex}`);
        
        console.log('Current element:', currentEl);
        console.log('Next element:', nextEl);

        // Check if GSAP is loaded
        if (typeof gsap !== 'undefined') {
            // Use GSAP for smooth animation
            gsap.to(currentEl, {
                opacity: 0,
                scale: 0.9,
                duration: 0.5,
                onComplete: () => {
                    currentEl.classList.remove('active');
                    currentSlide = nextIndex;
                    nextEl.classList.add('active');
                    
                    gsap.set(nextEl, { scale: 1.1, opacity: 0 });
                    gsap.to(nextEl, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.5,
                        onComplete: () => {
                            isAnimating = false;
                            console.log('Animation completed. Now on slide:', currentSlide);
                        }
                    });

                    animateSlideElements(currentSlide);
                    animateCameraTransition(currentSlide);
                    updateProgressBar();
                    updateSlideCounter();
                    updateNavigator();
                }
            });
        } else {
            // Fallback: CSS-only transition
            console.log('GSAP not loaded, using CSS transitions');
            currentEl.classList.remove('active');
            currentSlide = nextIndex;
            nextEl.classList.add('active');
            
            setTimeout(() => {
                isAnimating = false;
                animateSlideElements(currentSlide);
                animateCameraTransition(currentSlide);
                updateProgressBar();
                updateSlideCounter();
                updateNavigator();
                console.log('CSS transition completed. Now on slide:', currentSlide);
            }, 600);
        }
    } else {
        console.log('Invalid slide index:', nextIndex);
    }
}

// --- KEYBOARD NAVIGATION ---
document.addEventListener('keydown', (e) => {
    // Don't navigate if overlay is visible
    const overlay = document.getElementById('start-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
        return;
    }

    if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        changeSlide(1);
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        changeSlide(-1);
    } else if (e.key === 'Home') {
        e.preventDefault();
        // Go to first slide
        jumpToSlide(0);
    } else if (e.key === 'End') {
        e.preventDefault();
        // Go to last slide
        jumpToSlide(totalSlides - 1);
    } else if (e.key === 'Escape') {
        // Exit fullscreen or close navigator
        const nav = document.getElementById('slide-navigator');
        if (nav && nav.classList.contains('open')) {
            toggleNavigator();
        } else if (document.exitFullscreen && document.fullscreenElement) {
            document.exitFullscreen();
        }
    } else if (e.key === 'g' || e.key === 'G') {
        // Toggle navigator with 'G' key
        e.preventDefault();
        toggleNavigator();
    } else if (e.key >= '1' && e.key <= '8') {
        // Quick jump with number keys
        e.preventDefault();
        const slideNum = parseInt(e.key) - 1;
        jumpToSlide(slideNum);
    }
});

// --- FULL SCREEN LOGIC ---
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Update icon based on state
document.addEventListener('fullscreenchange', (event) => {
    const icon = document.getElementById('fs-icon');
    if (document.fullscreenElement) {
        icon.classList.remove('fa-expand');
        icon.classList.add('fa-compress');
    } else {
        icon.classList.remove('fa-compress');
        icon.classList.add('fa-expand');
    }
});

function updateSlideCounter() {
    const counterText = document.getElementById('slide-counter-text');
    if (counterText) {
        counterText.innerText = `${currentSlide + 1} / ${totalSlides}`;
    }
}

// --- INIT ---
updateProgressBar();
updateSlideCounter();
animateSlideElements(0);
populateNavigator(); // Initialize slide navigator

// Start Presentation Function
function startPresentation() {
    const overlay = document.getElementById('start-overlay');
    
    // Hide overlay with animation
    if (overlay) {
        if (typeof gsap !== 'undefined') {
            gsap.to(overlay, {
                opacity: 0,
                duration: 0.5,
                onComplete: () => {
                    overlay.classList.add('hidden');
                }
            });
        } else {
            overlay.classList.add('hidden');
        }
    }

    // Request fullscreen
    setTimeout(() => {
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Fullscreen unavailable: ${err.message}`);
            });
        }
    }, 300);
}

// Auto-start on spacebar or Enter
document.addEventListener('keydown', (e) => {
    const overlay = document.getElementById('start-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            startPresentation();
        }
    }
});
