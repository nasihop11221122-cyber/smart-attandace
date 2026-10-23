import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * AttendanceLogo3D (Clean Light Theme)
 * 
 * Physical 3D emblem designed for light paper background (#FAF8F4):
 * - Deep Indigo (#3B4CCA) main torus ring
 * - Pure White (#FFFFFF) circular badge with Teal (#14B8A6) rim
 * - Animated self-drawing checkmark tube (CatmullRomCurve3)
 * - Thin Teal orbiting ring
 * - 80 solid matte floating particles (Indigo & Teal)
 * - Soft contact ground shadow plane on transparent canvas
 * - Multi-stage dynamic reaction to button hover ('manual' vs 'online')
 * - Full memory disposal, visibility pause, and reduced-motion support
 */
export default function AttendanceLogo3D({ hoveredMode = null }) {
  const containerRef = useRef(null);
  const hoveredModeRef = useRef(hoveredMode);

  // Keep latest hover mode in ref for requestAnimationFrame loop
  useEffect(() => {
    hoveredModeRef.current = hoveredMode;
  }, [hoveredMode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    // Dimensions
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // 1. Scene setup
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    camera.position.set(0, 0.1, 5.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    // Master emblem group (for tilt, idle rotation, hover scale)
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 2. Lighting (Natural physical studio light for light background)
    const ambientLight = new THREE.AmbientLight(0xfffdfa, 1.25);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(3.5, 4.5, 4.0);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd9e2ec, 0.8);
    fillLight.position.set(-3.5, 1.5, 2.5);
    scene.add(fillLight);

    const bottomBounceLight = new THREE.DirectionalLight(0xfaf8f4, 0.5);
    bottomBounceLight.position.set(0, -3.0, 1.0);
    scene.add(bottomBounceLight);

    // 3. Ground contact shadow (radial gradient plane directly on paper background)
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const sCtx = shadowCanvas.getContext('2d');
    const radGrad = sCtx.createRadialGradient(128, 128, 15, 128, 128, 120);
    radGrad.addColorStop(0, 'rgba(20, 33, 61, 0.22)');
    radGrad.addColorStop(0.35, 'rgba(20, 33, 61, 0.10)');
    radGrad.addColorStop(0.7, 'rgba(20, 33, 61, 0.03)');
    radGrad.addColorStop(1, 'rgba(20, 33, 61, 0)');
    sCtx.fillStyle = radGrad;
    sCtx.fillRect(0, 0, 256, 256);

    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(3.6, 3.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.set(0, -1.82, 0);
    scene.add(shadowMesh);

    // 4. Geometries & Materials for Emblem

    // A. Bold Torus Ring in Deep Indigo (#3B4CCA)
    const torusGeo = new THREE.TorusGeometry(1.35, 0.15, 32, 100);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0x3b4cca,
      roughness: 0.35,
      metalness: 0.1,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    masterGroup.add(torusMesh);

    // B. Inner white circular badge (#FFFFFF)
    const badgeGeo = new THREE.CylinderGeometry(1.12, 1.12, 0.08, 48);
    const badgeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.45,
      metalness: 0.05,
    });
    const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
    badgeMesh.rotation.x = Math.PI / 2;
    masterGroup.add(badgeMesh);

    // C. Thin Teal (#14B8A6) rim around the badge
    const badgeRimGeo = new THREE.TorusGeometry(1.13, 0.03, 16, 64);
    const tealMat = new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      roughness: 0.35,
      metalness: 0.15,
    });
    const badgeRimMesh = new THREE.Mesh(badgeRimGeo, tealMat);
    masterGroup.add(badgeRimMesh);

    // D. Animated checkmark built from CatmullRomCurve3 & TubeGeometry
    const checkPoints = [
      new THREE.Vector3(-0.48, -0.04, 0.08),
      new THREE.Vector3(-0.30, -0.22, 0.10),
      new THREE.Vector3(-0.12, -0.38, 0.12),
      new THREE.Vector3(0.08, -0.10, 0.13),
      new THREE.Vector3(0.30, 0.18, 0.14),
      new THREE.Vector3(0.50, 0.42, 0.15),
    ];
    const checkCurve = new THREE.CatmullRomCurve3(checkPoints);
    const checkTubeSegments = 70;
    const checkGeo = new THREE.TubeGeometry(
      checkCurve,
      checkTubeSegments,
      0.09,
      16,
      false
    );

    // Animated checkmark material in solid Teal
    const checkMat = new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      roughness: 0.28,
      metalness: 0.15,
    });
    const checkMesh = new THREE.Mesh(checkGeo, checkMat);
    masterGroup.add(checkMesh);

    // Total indices count for self-drawing tube
    const totalIndices = checkGeo.index
      ? checkGeo.index.count
      : checkTubeSegments * 16 * 6;
    checkGeo.setDrawRange(0, 0); // Start hidden for draw-in animation

    // E. Second thin orbiting ring in Teal (#14B8A6)
    const orbitRingGeo = new THREE.TorusGeometry(1.85, 0.02, 16, 100);
    const orbitRingMesh = new THREE.Mesh(orbitRingGeo, tealMat);
    orbitRingMesh.rotation.x = Math.PI / 3;
    orbitRingMesh.rotation.y = Math.PI / 7;
    masterGroup.add(orbitRingMesh);

    // F. Solid Matte Floating Particles (80 count: Indigo & Teal)
    const particleCount = 80;
    const particleGeo = new THREE.SphereGeometry(0.032, 10, 10);
    const indigoMat = new THREE.MeshStandardMaterial({
      color: 0x3b4cca,
      roughness: 0.5,
      metalness: 0.05,
    });
    const particleTealMat = new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      roughness: 0.5,
      metalness: 0.05,
    });

    const particlesGroup = new THREE.Group();
    masterGroup.add(particlesGroup);

    const particleData = [];
    for (let i = 0; i < particleCount; i++) {
      const isIndigo = i % 2 === 0;
      const pMesh = new THREE.Mesh(
        particleGeo,
        isIndigo ? indigoMat : particleTealMat
      );

      // Distribute particles in a spherical shell around the emblem
      const radius = 1.6 + Math.random() * 0.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi) * 0.7; // slight flatten on Z

      pMesh.position.set(x, y, z);
      particlesGroup.add(pMesh);

      particleData.push({
        mesh: pMesh,
        originX: x,
        originY: y,
        originZ: z,
        speed: 0.6 + Math.random() * 0.8,
        offset: Math.random() * Math.PI * 2,
      });
    }

    // 5. Interaction State (Mouse tilt with lerp)
    const targetTilt = { x: 0, y: 0 };
    const currentTilt = { x: 0, y: 0 };

    const handleMouseMove = (event) => {
      if (prefersReducedMotion) return;
      const rect = container.getBoundingClientRect();
      const mouseX = (event.clientX - rect.left) / rect.width - 0.5;
      const mouseY = (event.clientY - rect.top) / rect.height - 0.5;
      targetTilt.y = mouseX * 0.55;
      targetTilt.x = -mouseY * 0.55;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // 6. Draw-in animation & Render Loop
    let animationFrameId;
    let isVisible = true;
    let startTime = null;
    let currentScale = 1.0;
    let speedMultiplier = 1.0;

    const animate = (timestamp) => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;

      // Draw-in checkmark over 1.3 seconds on page load
      const drawProgress = Math.min(1, elapsed / 1.3);
      if (drawProgress <= 1) {
        const visibleIndices = Math.floor(totalIndices * drawProgress);
        checkGeo.setDrawRange(0, visibleIndices);
      }

      // Check hover mode from button
      const activeMode = hoveredModeRef.current;
      const isHovered = Boolean(activeMode);

      // Smooth hover scale pulse & energetic response
      const targetScale = isHovered ? 1.08 : 1.0;
      currentScale += (targetScale - currentScale) * 0.08;
      masterGroup.scale.set(currentScale, currentScale, currentScale);

      // Dynamic speed ramp when hovered
      const targetSpeed = activeMode === 'manual' ? 2.2 : activeMode === 'online' ? 2.5 : 1.0;
      speedMultiplier += (targetSpeed - speedMultiplier) * 0.06;

      // Smooth mouse tilt with lerp
      if (!prefersReducedMotion) {
        currentTilt.x += (targetTilt.x - currentTilt.x) * 0.06;
        currentTilt.y += (targetTilt.y - currentTilt.y) * 0.06;

        // Extra dynamic tilt bias on hover
        const hoverBiasY = activeMode === 'manual' ? -0.15 : activeMode === 'online' ? 0.15 : 0;
        const hoverBiasX = isHovered ? 0.1 : 0;

        // Idle floating & subtle rotation
        const idleRotY = Math.sin(elapsed * 0.7 * speedMultiplier) * 0.12;
        const idleRotX = Math.cos(elapsed * 0.5 * speedMultiplier) * 0.08;

        masterGroup.rotation.y = currentTilt.y + idleRotY + hoverBiasY;
        masterGroup.rotation.x = currentTilt.x + idleRotX + hoverBiasX;

        // Orbit ring dynamic spin (reverses or speeds up according to button)
        const ringDir = activeMode === 'online' ? -1.8 : 1.0;
        orbitRingMesh.rotation.z += 0.012 * speedMultiplier * ringDir;

        // Particle floating drift with dynamic excitation
        for (let i = 0; i < particleData.length; i++) {
          const p = particleData[i];
          const particleExcitement = isHovered ? 1.4 : 1.0;
          p.mesh.position.y =
            p.originY +
            Math.sin(elapsed * p.speed * speedMultiplier + p.offset) * (0.09 * particleExcitement);
          p.mesh.position.x =
            p.originX +
            Math.cos(elapsed * (p.speed * 0.8) * speedMultiplier + p.offset) * (0.06 * particleExcitement);
        }
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // 7. Tab Visibility Handling (Pause loop when tab is hidden)
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 8. Responsive Resize with ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    // 9. Full Memory Disposal on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      resizeObserver.disconnect();

      // Dispose Geometries
      shadowGeo.dispose();
      torusGeo.dispose();
      badgeGeo.dispose();
      badgeRimGeo.dispose();
      checkGeo.dispose();
      orbitRingGeo.dispose();
      particleGeo.dispose();

      // Dispose Materials & Textures
      shadowMat.dispose();
      shadowTexture.dispose();
      torusMat.dispose();
      badgeMat.dispose();
      tealMat.dispose();
      checkMat.dispose();
      indigoMat.dispose();
      particleTealMat.dispose();

      // Dispose Renderer & DOM Element
      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex h-full w-full items-center justify-center select-none"
      aria-label="3D Smart Attendance Emblem"
    />
  );
}
