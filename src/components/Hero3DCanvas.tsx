import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Hero3DCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;

    // SCENE SETUP
    const scene = new THREE.Scene();
    
    // CAMERA
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 7.5);

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.2 : 1.8));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0x0e1322, 2.5);
    scene.add(ambientLight);

    // Electric Blue Light
    const blueLight = new THREE.PointLight(0x5B8CFF, isMobile ? 3 : 5, 20);
    blueLight.position.set(4, 3, 4);
    scene.add(blueLight);

    // Violet Light
    const violetLight = new THREE.PointLight(0x9B6BFF, isMobile ? 2.5 : 4.5, 20);
    violetLight.position.set(-4, -2, 3);
    scene.add(violetLight);

    // Top Key Light
    const topLight = new THREE.DirectionalLight(0xffffff, 1.2);
    topLight.position.set(0, 6, 2);
    scene.add(topLight);

    // CENTRAL 3D GROUP
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Futuristic Glass Core Sphere
    const sphereGeo = new THREE.SphereGeometry(1.3, 48, 48);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x141a2e,
      emissive: 0x182449,
      emissiveIntensity: 0.35,
      roughness: 0.1,
      metalness: 0.15,
      transmission: 0.7,
      thickness: 1.2,
      ior: 1.5,
      transparent: true,
      opacity: 0.85,
      wireframe: false,
    });
    const coreSphere = new THREE.Mesh(sphereGeo, glassMat);
    mainGroup.add(coreSphere);

    // Outer Digital Wireframe Shell
    const wireframeGeo = new THREE.IcosahedronGeometry(1.48, 2);
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x5B8CFF,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const wireframeShell = new THREE.Mesh(wireframeGeo, wireframeMat);
    mainGroup.add(wireframeShell);

    // Glowing Inner Nucleus
    const nucleusGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const nucleusMat = new THREE.MeshBasicMaterial({
      color: 0x9B6BFF,
      transparent: true,
      opacity: 0.7,
      wireframe: true
    });
    const nucleus = new THREE.Mesh(nucleusGeo, nucleusMat);
    mainGroup.add(nucleus);

    // 2. Metallic Orbital Rings
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0x9B6BFF,
      metalness: 0.9,
      roughness: 0.15,
      emissive: 0x5B8CFF,
      emissiveIntensity: 0.25,
    });

    const ringGeo1 = new THREE.TorusGeometry(2.1, 0.035, 24, 100);
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    mainGroup.add(ring1);

    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x5B8CFF,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x9B6BFF,
      emissiveIntensity: 0.2,
    });
    const ringGeo2 = new THREE.TorusGeometry(2.55, 0.025, 20, 100);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = -Math.PI / 3;
    mainGroup.add(ring2);

    // 3. Floating Geometric Crystals
    const floatingObjects: THREE.Mesh[] = [];

    // Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(0.3, 0);
    const icoMat = new THREE.MeshStandardMaterial({
      color: 0x5B8CFF,
      metalness: 0.8,
      roughness: 0.2,
      wireframe: false,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    ico.position.set(-2.5, 1.8, 0.5);
    mainGroup.add(ico);
    floatingObjects.push(ico);

    // Octahedron
    const octaGeo = new THREE.OctahedronGeometry(0.35, 0);
    const octaMat = new THREE.MeshStandardMaterial({
      color: 0x9B6BFF,
      metalness: 0.85,
      roughness: 0.25,
      wireframe: false,
    });
    const octa = new THREE.Mesh(octaGeo, octaMat);
    octa.position.set(2.6, -1.6, 0.8);
    mainGroup.add(octa);
    floatingObjects.push(octa);

    // Tetrahedron
    const tetraGeo = new THREE.TetrahedronGeometry(0.25, 0);
    const tetraMat = new THREE.MeshStandardMaterial({
      color: 0x5B8CFF,
      metalness: 0.7,
      roughness: 0.3,
      wireframe: true,
    });
    const tetra = new THREE.Mesh(tetraGeo, tetraMat);
    tetra.position.set(2.2, 1.9, -0.6);
    mainGroup.add(tetra);
    floatingObjects.push(tetra);

    // 4. Glowing Particle Cloud
    const particleCount = isMobile ? 180 : 420;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const c1 = new THREE.Color(0x5B8CFF);
    const c2 = new THREE.Color(0x9B6BFF);
    const c3 = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.4 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);

      const mixedColor = Math.random() > 0.5 ? c1 : (Math.random() > 0.5 ? c2 : c3);
      particleColors[i * 3] = mixedColor.r;
      particleColors[i * 3 + 1] = mixedColor.g;
      particleColors[i * 3 + 2] = mixedColor.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: isMobile ? 0.045 : 0.065,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particles);

    // 5. Cyber Perspective Grid (Bottom)
    const gridHelper = new THREE.GridHelper(16, 24, 0x5B8CFF, 0x1f2640);
    gridHelper.position.y = -3.2;
    gridHelper.rotation.x = 0.15;
    scene.add(gridHelper);

    // MOUSE PARALLAX TRACKING
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      targetX = (x - 0.5) * 1.5;
      targetY = (y - 0.5) * 1.5;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // RESIZE HANDLER
    const onResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', onResize);

    // INTERSECTION OBSERVER (Pause when scrolled out of view)
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Smooth Lerp Mouse Parallax
      if (!prefersReducedMotion) {
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        mainGroup.rotation.y = time * 0.15 + mouseX * 0.6;
        mainGroup.rotation.x = Math.sin(time * 0.1) * 0.1 + mouseY * 0.4;
      } else {
        mainGroup.rotation.y = time * 0.08;
      }

      // Orbital Rings Rotation
      ring1.rotation.z += 0.008;
      ring1.rotation.y += 0.004;

      ring2.rotation.z -= 0.006;
      ring2.rotation.x -= 0.005;

      // Outer wireframe shell counter-rotates
      wireframeShell.rotation.y -= 0.005;
      wireframeShell.rotation.z += 0.003;

      // Nucleus pulse
      const pulseScale = 1 + Math.sin(time * 2.5) * 0.06;
      nucleus.scale.set(pulseScale, pulseScale, pulseScale);

      // Floating objects oscillation
      floatingObjects.forEach((obj, idx) => {
        const speed = 0.8 + idx * 0.2;
        obj.rotation.x += 0.015 * speed;
        obj.rotation.y += 0.02 * speed;
        obj.position.y += Math.sin(time * 1.5 + idx) * 0.003;
      });

      // Particles subtle wave
      particles.rotation.y = -time * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // CLEANUP
    return () => {
      observer.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationFrameId);

      // Dispose geometries & materials
      scene.clear();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[460px] lg:min-h-[640px] relative pointer-events-none"
      aria-hidden="true"
    />
  );
};
