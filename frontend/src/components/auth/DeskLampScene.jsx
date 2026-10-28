import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ==========================================================================
   ULTRA-EFFICIENT PROCEDURAL LIGHT OAK TEXTURE (256x256 - 4x Lighter Memory)
   ========================================================================== */

function createNaturalOakTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Natural light oak base
  ctx.fillStyle = '#ebdcc8';
  ctx.fillRect(0, 0, 256, 256);

  // Soft wood grain strokes
  ctx.strokeStyle = '#dcceb8';
  ctx.lineWidth = 2;
  for (let i = 0; i < 160; i++) {
    const y = Math.random() * 256;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      80,
      y + (Math.random() - 0.5) * 12,
      180,
      y + (Math.random() - 0.5) * 12,
      256,
      y
    );
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  return texture;
}

/* ==========================================================================
   HIGH-EFFICIENCY DESK LAMP SCENE (Zero Network, Low GPU Footprint)
   ========================================================================== */

export default function DeskLampScene({ isLampOn, onToggleLamp }) {
  const containerRef = useRef(null);
  const isLampOnRef = useRef(isLampOn);
  const onToggleLampRef = useRef(onToggleLamp);

  useEffect(() => {
    isLampOnRef.current = isLampOn;
  }, [isLampOn]);

  useEffect(() => {
    onToggleLampRef.current = onToggleLamp;
  }, [onToggleLamp]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, High-Efficiency Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6f3ec); // Clean academic canvas

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 1.4, 5.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      precision: 'mediump', // Optimized mobile & desktop precision
    });
    renderer.setSize(width, height);
    // Strict 1.5 pixel ratio cap to eliminate retina / 4k GPU strain
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Desk Surface
    const oakTexture = createNaturalOakTexture();
    const deskGeo = new THREE.PlaneGeometry(16, 12);
    const deskMat = new THREE.MeshStandardMaterial({
      map: oakTexture,
      roughness: 0.72,
      metalness: 0.04,
    });
    const deskMesh = new THREE.Mesh(deskGeo, deskMat);
    deskMesh.rotation.x = -Math.PI / 2;
    deskMesh.position.set(0, -1.3, 0);
    deskMesh.receiveShadow = true;
    scene.add(deskMesh);

    // 3. Vintage Brass Lamp Group (Optimized Polygon Subdivisions)
    const lampMasterGroup = new THREE.Group();
    lampMasterGroup.position.set(-1.15, -1.3, 0);
    scene.add(lampMasterGroup);

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.85,
      roughness: 0.3,
    });

    const fabricShadeMat = new THREE.MeshPhysicalMaterial({
      color: 0xfcfbf7,
      roughness: 0.68,
      metalness: 0.04,
      transmission: 0.25,
      emissive: 0xff9922,
      emissiveIntensity: 0.0,
    });

    const bulbMat = new THREE.MeshStandardMaterial({
      color: 0xffeedd,
      emissive: 0xffa020,
      emissiveIntensity: 0.0,
    });

    // Base (24 segments instead of 36 for performance)
    const baseGeo = new THREE.CylinderGeometry(0.72, 0.82, 0.14, 24);
    const baseMesh = new THREE.Mesh(baseGeo, brassMat);
    baseMesh.position.y = 0.07;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    lampMasterGroup.add(baseMesh);

    // Stem
    const stemGeo = new THREE.CylinderGeometry(0.065, 0.065, 1.35, 14);
    const stemMesh = new THREE.Mesh(stemGeo, brassMat);
    stemMesh.position.y = 0.8;
    stemMesh.castShadow = true;
    lampMasterGroup.add(stemMesh);

    // Joint
    const jointGeo = new THREE.SphereGeometry(0.12, 14, 14);
    const jointMesh = new THREE.Mesh(jointGeo, brassMat);
    jointMesh.position.y = 1.48;
    lampMasterGroup.add(jointMesh);

    // Curved Upper Arm (20 tube segments)
    const curvePoints = [
      new THREE.Vector3(0, 1.48, 0),
      new THREE.Vector3(0.15, 1.95, 0.1),
      new THREE.Vector3(0.55, 2.2, 0.25),
      new THREE.Vector3(0.85, 2.05, 0.3),
    ];
    const armCurve = new THREE.CatmullRomCurve3(curvePoints);
    const armGeo = new THREE.TubeGeometry(armCurve, 20, 0.055, 10, false);
    const armMesh = new THREE.Mesh(armGeo, brassMat);
    armMesh.castShadow = true;
    lampMasterGroup.add(armMesh);

    // Shade Group
    const shadeGroup = new THREE.Group();
    shadeGroup.position.set(0.85, 2.05, 0.3);
    shadeGroup.rotation.x = 0.15;
    shadeGroup.rotation.z = -0.15;
    lampMasterGroup.add(shadeGroup);

    // Fabric Shade (24 segments)
    const shadeGeo = new THREE.CylinderGeometry(0.35, 0.85, 0.8, 24, 1, true);
    const shadeMesh = new THREE.Mesh(shadeGeo, fabricShadeMat);
    shadeMesh.position.y = -0.32;
    shadeMesh.castShadow = true;
    shadeGroup.add(shadeMesh);

    // Shade Cap
    const capGeo = new THREE.CylinderGeometry(0.18, 0.36, 0.12, 16);
    const capMesh = new THREE.Mesh(capGeo, brassMat);
    capMesh.position.y = 0.1;
    shadeGroup.add(capMesh);

    // Inner Bulb
    const bulbGeo = new THREE.SphereGeometry(0.16, 14, 14);
    const bulbMesh = new THREE.Mesh(bulbGeo, bulbMat);
    bulbMesh.position.y = -0.32;
    shadeGroup.add(bulbMesh);

    // Pull Chain Assembly
    const chainGroup = new THREE.Group();
    chainGroup.position.set(0.22, -0.32, 0.1);
    shadeGroup.add(chainGroup);

    const chainCordGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.65, 6);
    const chainCordMesh = new THREE.Mesh(chainCordGeo, brassMat);
    chainCordMesh.position.y = -0.325;
    chainGroup.add(chainCordMesh);

    // Brass pull bead
    const beadGeo = new THREE.CylinderGeometry(0.035, 0.045, 0.16, 12);
    const beadMesh = new THREE.Mesh(beadGeo, brassMat);
    beadMesh.position.y = -0.72;
    beadMesh.castShadow = true;
    chainGroup.add(beadMesh);

    const interactiveObjects = [beadMesh, shadeMesh, baseMesh, stemMesh];

    // 4. Lights Setup (Optimized Shadow Map 512x512)
    const daylightAmbient = new THREE.AmbientLight(0xfffdfa, 1.35);
    scene.add(daylightAmbient);

    const windowLight = new THREE.DirectionalLight(0xfff8ee, 1.1);
    windowLight.position.set(4.5, 6, 3);
    windowLight.castShadow = true;
    windowLight.shadow.mapSize.width = 512;
    windowLight.shadow.mapSize.height = 512;
    windowLight.shadow.bias = -0.0008;
    scene.add(windowLight);

    const spotLight = new THREE.SpotLight(0xffedd5, 0.0, 14, Math.PI / 3.4, 0.65, 1.2);
    spotLight.position.set(lampMasterGroup.position.x + 0.85, 0.75, 0.3);
    spotLight.target.position.set(lampMasterGroup.position.x + 0.85, -1.3, 0.5);
    spotLight.castShadow = false; // Only casts shadow when lamp is ON
    spotLight.shadow.mapSize.width = 512;
    spotLight.shadow.mapSize.height = 512;
    spotLight.shadow.bias = -0.001;
    scene.add(spotLight);
    scene.add(spotLight.target);

    const pointLight = new THREE.PointLight(0xffb84d, 0.0, 8, 1.8);
    pointLight.position.set(lampMasterGroup.position.x + 0.85, 0.75, 0.3);
    scene.add(pointLight);

    // 5. Lightweight Particles (60 particles - silky smooth)
    const particleCount = 60;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = lampMasterGroup.position.x + (Math.random() - 0.2) * 2.6;
      particlePositions[i * 3 + 1] = -1.2 + Math.random() * 2.4;
      particlePositions[i * 3 + 2] = -0.5 + Math.random() * 2.4;

      particleVelocities.push({
        y: 0.002 + Math.random() * 0.003,
        drift: (Math.random() - 0.5) * 0.002,
      });
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xd4a55a,
      size: 0.034,
      transparent: true,
      opacity: 0.06,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // 6. Interactive Physics & Lamp Turn-On
    let chainPullVelocity = 0;
    let chainPullOffset = 0;
    let flickerSequence = [];
    let flickerIndex = 0;
    let flickerTimer = 0;

    const triggerPull = () => {
      chainPullOffset = -0.28;
      chainPullVelocity = 0;

      if (!isLampOnRef.current) {
        flickerSequence = [
          { duration: 0.06, spot: 1.5, point: 0.8, emissive: 1.0 },
          { duration: 0.05, spot: 0.2, point: 0.1, emissive: 0.2 },
          { duration: 0.1, spot: 3.2, point: 1.6, emissive: 2.2 },
          { duration: 9999, spot: 5.2, point: 2.4, emissive: 2.6 },
        ];
        flickerIndex = 0;
        flickerTimer = 0;
      } else {
        flickerSequence = [];
      }

      if (onToggleLampRef.current) {
        onToggleLampRef.current();
      }
    };

    // 7. Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    const onPointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(interactiveObjects, true);
      container.style.cursor = hits.length > 0 ? 'pointer' : 'default';
    };

    const onPointerDown = (e) => {
      const rect = container.getBoundingClientRect();
      const clickMouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(clickMouse, camera);
      const hits = raycaster.intersectObjects(interactiveObjects, true);
      if (hits.length > 0) {
        triggerPull();
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerdown', onPointerDown);

    // 8. Render Loop
    let animationFrameId;
    let isVisible = true;
    let previousTimestamp = performance.now();

    const animate = (timestamp) => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const delta = Math.min((timestamp - previousTimestamp) / 1000, 0.1);
      previousTimestamp = timestamp;

      // Spring oscillation on chain
      const k = 140;
      const c = 12;
      const springForce = -k * chainPullOffset;
      const dampingForce = -c * chainPullVelocity;
      const acceleration = springForce + dampingForce;

      chainPullVelocity += acceleration * delta;
      chainPullOffset += chainPullVelocity * delta;
      chainGroup.position.y = -0.32 + chainPullOffset;

      const isLit = isLampOnRef.current;
      spotLight.castShadow = isLit; // Only shadow when active

      if (isLit) {
        if (flickerSequence.length > 0 && flickerIndex < flickerSequence.length) {
          flickerTimer += delta;
          const currentStep = flickerSequence[flickerIndex];

          spotLight.intensity = currentStep.spot;
          pointLight.intensity = currentStep.point;
          bulbMat.emissiveIntensity = currentStep.emissive;
          fabricShadeMat.emissiveIntensity = currentStep.emissive * 0.35;

          if (flickerTimer >= currentStep.duration) {
            flickerTimer = 0;
            flickerIndex++;
          }
        } else {
          spotLight.intensity = THREE.MathUtils.lerp(spotLight.intensity, 5.2, 0.1);
          pointLight.intensity = THREE.MathUtils.lerp(pointLight.intensity, 2.4, 0.1);
          bulbMat.emissiveIntensity = 2.6;
          fabricShadeMat.emissiveIntensity = 0.9;
        }

        particleMat.opacity = THREE.MathUtils.lerp(particleMat.opacity, 0.45, 0.08);

        const targetCamX = width < 768 ? 0 : -0.4;
        const targetCamY = width < 768 ? 1.4 : 1.15;
        const targetCamZ = width < 768 ? 4.9 : 4.3;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.04);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.04);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.04);
      } else {
        spotLight.intensity = THREE.MathUtils.lerp(spotLight.intensity, 0.0, 0.15);
        pointLight.intensity = THREE.MathUtils.lerp(pointLight.intensity, 0.0, 0.15);
        bulbMat.emissiveIntensity = THREE.MathUtils.lerp(bulbMat.emissiveIntensity, 0.0, 0.15);
        fabricShadeMat.emissiveIntensity = THREE.MathUtils.lerp(
          fabricShadeMat.emissiveIntensity,
          0.0,
          0.15
        );
        particleMat.opacity = THREE.MathUtils.lerp(particleMat.opacity, 0.06, 0.08);

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.04);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.4, 0.04);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, 5.2, 0.04);
      }

      if (Math.abs(mouse.x) < 2) {
        camera.position.x += (mouse.x * 0.15 - camera.position.x * 0.02) * 0.05;
        camera.position.y += (-mouse.y * 0.1 - camera.position.y * 0.02) * 0.05;
      }
      camera.lookAt(lampMasterGroup.position.x + 0.85, 0.4, 0);

      // Particle simulation
      const positions = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleVelocities[i].y;
        positions[i * 3] += particleVelocities[i].drift;

        if (positions[i * 3 + 1] > 1.8) {
          positions[i * 3 + 1] = -1.2;
          positions[i * 3] = lampMasterGroup.position.x + (Math.random() - 0.2) * 2.6;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);

      if (width < 768) {
        lampMasterGroup.position.set(-0.85, -0.6, 0);
        lampMasterGroup.scale.set(0.85, 0.85, 0.85);
      } else {
        lampMasterGroup.position.set(-1.15, -1.3, 0);
        lampMasterGroup.scale.set(1.0, 1.0, 1.0);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      deskGeo.dispose();
      baseGeo.dispose();
      stemGeo.dispose();
      jointGeo.dispose();
      armGeo.dispose();
      shadeGeo.dispose();
      capGeo.dispose();
      bulbGeo.dispose();
      chainCordGeo.dispose();
      beadGeo.dispose();
      particleGeo.dispose();

      oakTexture.dispose();
      deskMat.dispose();
      brassMat.dispose();
      fabricShadeMat.dispose();
      bulbMat.dispose();
      particleMat.dispose();

      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 h-full w-full select-none"
    />
  );
}
