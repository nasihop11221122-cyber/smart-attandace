import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/* ==========================================================================
   PROCEDURAL HIGH-REALISM TEXTURE GENERATORS (Zero external network payload)
   ========================================================================== */

/**
 * Procedural Architectural Walnut Door Texture
 * Rich wood grain with growth rings, fine fibers, and natural tone shifts.
 */
function createArchitecturalWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base rich walnut/mahogany gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 512, 1024);
  bgGrad.addColorStop(0.0, '#3E2314');
  bgGrad.addColorStop(0.35, '#4B2A18');
  bgGrad.addColorStop(0.7, '#381E11');
  bgGrad.addColorStop(1.0, '#2D170C');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 1024);

  // Vertical wood grain lines and growth fibers
  ctx.lineWidth = 1;
  for (let i = 0; i < 480; i++) {
    const x = Math.random() * 512;
    const alpha = 0.05 + Math.random() * 0.12;
    ctx.strokeStyle = Math.random() > 0.45 
      ? `rgba(26, 13, 7, ${alpha})` 
      : `rgba(110, 68, 42, ${alpha * 0.75})`;

    ctx.beginPath();
    ctx.moveTo(x, 0);
    const wobble1 = x + (Math.random() - 0.5) * 18;
    const wobble2 = x + (Math.random() - 0.5) * 18;
    ctx.bezierCurveTo(wobble1, 340, wobble2, 680, x + (Math.random() - 0.5) * 10, 1024);
    ctx.stroke();
  }

  // Subtle natural wood pores & grain flecks
  ctx.fillStyle = 'rgba(20, 10, 5, 0.14)';
  for (let p = 0; p < 800; p++) {
    const px = Math.random() * 512;
    const py = Math.random() * 1024;
    ctx.fillRect(px, py, 1, 3 + Math.random() * 5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Procedural Brushed Brass "LOGIN" Door Plaque Texture
 * Executive brushed metallic texture with beveled edge, screw fasteners, and engraved lettering.
 */
function createLoginPlaqueTexture(text = 'LOGIN') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // Brushed brass base gradient
  const brassGrad = ctx.createLinearGradient(0, 0, 512, 256);
  brassGrad.addColorStop(0.0, '#E8C766');
  brassGrad.addColorStop(0.25, '#CF9E38');
  brassGrad.addColorStop(0.5, '#FBE696');
  brassGrad.addColorStop(0.75, '#C6942E');
  brassGrad.addColorStop(1.0, '#9E7019');
  ctx.fillStyle = brassGrad;
  ctx.fillRect(0, 0, 512, 256);

  // Horizontal brushed metal streaks
  ctx.lineWidth = 1;
  for (let i = 0; i < 350; i++) {
    const y = Math.random() * 256;
    const alpha = 0.04 + Math.random() * 0.09;
    ctx.strokeStyle = Math.random() > 0.5 
      ? `rgba(255, 255, 255, ${alpha})` 
      : `rgba(60, 42, 10, ${alpha * 1.2})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Outer beveled frame border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 4;
  ctx.strokeRect(12, 12, 488, 232);

  ctx.strokeStyle = 'rgba(60, 40, 10, 0.55)';
  ctx.lineWidth = 3;
  ctx.strokeRect(16, 16, 480, 224);

  // Corner screw rivets
  const screwCoords = [
    [32, 32],
    [480, 32],
    [32, 224],
    [480, 224],
  ];
  screwCoords.forEach(([sx, sy]) => {
    ctx.fillStyle = '#6E4E16';
    ctx.beginPath();
    ctx.arc(sx, sy, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#E8CA72';
    ctx.beginPath();
    ctx.arc(sx - 1, sy - 1, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#3E2908';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx - 4, sy);
    ctx.lineTo(sx + 4, sy);
    ctx.stroke();
  });

  // Engraved lettering with inner shadow + highlight
  ctx.font = 'bold 74px "Outfit", "Plus Jakarta Sans", "Georgia", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '10px';

  // Bottom edge highlight (creates physical 3D embossed/engraved depth)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.fillText(text, 256, 130);

  // Deep dark engraving inlay
  ctx.fillStyle = '#261605';
  ctx.fillText(text, 256, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/* ==========================================================================
   HIGH-REALISM 3D INTERACTIVE LOGIN DOOR
   ========================================================================== */

export default function LoginDoorScene({ isOpen, onToggleDoor, plaqueText = 'LOGIN' }) {
  const containerRef = useRef(null);
  const isOpenRef = useRef(isOpen);
  const onToggleDoorRef = useRef(onToggleDoor);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    onToggleDoorRef.current = onToggleDoor;
  }, [onToggleDoor]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera, High-Efficiency Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfaf8f4); // Academic campus light backdrop

    const isMobile = width < 768;
    const isLargeScreen = width >= 1024;
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);

    // Initial camera position
    const baseCameraZ = isMobile ? 5.6 : 4.4;
    camera.position.set(0, 0.15, baseCameraZ);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      precision: 'mediump',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting Setup (Photorealistic Architectural Natural Light)
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.35);
    scene.add(ambientLight);

    // Key directional sunlight casting sharp-yet-soft physical shadows
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(3.2, 4.5, 4.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.camera.left = -2.5;
    keyLight.shadow.camera.right = 2.5;
    keyLight.shadow.camera.top = 2.5;
    keyLight.shadow.camera.bottom = -2.5;
    keyLight.shadow.bias = -0.0004;
    scene.add(keyLight);

    // Soft cool fill light for shadow detailing on hinge side
    const fillLight = new THREE.DirectionalLight(0xdbe6f6, 0.65);
    fillLight.position.set(-3.5, 1.8, 2.5);
    scene.add(fillLight);

    // Interior Warm Portal Light (Revealed through opening doorway)
    const interiorPointLight = new THREE.PointLight(0xffe2aa, 0, 7, 1.2);
    interiorPointLight.position.set(0.1, 0.2, -1.2);
    scene.add(interiorPointLight);

    // 3. Materials
    const woodTexture = createArchitecturalWoodTexture();
    const doorMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.42,
      metalness: 0.05,
    });

    const frameWoodMaterial = new THREE.MeshStandardMaterial({
      color: 0x2b170c,
      roughness: 0.5,
      metalness: 0.04,
    });

    const satinBrassMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.28,
      metalness: 0.88,
    });

    const darkSteelMaterial = new THREE.MeshStandardMaterial({
      color: 0x26292e,
      roughness: 0.35,
      metalness: 0.85,
    });

    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f2eb,
      roughness: 0.9,
      metalness: 0.0,
    });

    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xe6ded1,
      roughness: 0.65,
      metalness: 0.02,
    });

    // 4. Floor Surface & Wall Architecture
    const floorGeo = new THREE.PlaneGeometry(16, 12);
    const floorMesh = new THREE.Mesh(floorGeo, floorMaterial);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(0, -1.45, 0);
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Wall Surrounding the Door Frame
    const wallLeft = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.8, 0.2), wallMaterial);
    wallLeft.position.set(-2.55, 0.3, -0.05);
    wallLeft.receiveShadow = true;
    scene.add(wallLeft);

    const wallRight = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.8, 0.2), wallMaterial);
    wallRight.position.set(2.55, 0.3, -0.05);
    wallRight.receiveShadow = true;
    scene.add(wallRight);

    const wallTop = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.2), wallMaterial);
    wallTop.position.set(0, 1.8, -0.05);
    wallTop.receiveShadow = true;
    scene.add(wallTop);

    // Back interior backdrop (seen through the open door)
    const interiorBackdrop = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 4),
      new THREE.MeshBasicMaterial({ color: 0xfffcf5 })
    );
    interiorBackdrop.position.set(0, 0, -2.4);
    scene.add(interiorBackdrop);

    // 5. Door Frame (Architrave / Jamb)
    const doorWidth = 1.16;
    const doorHeight = 2.56;
    const doorThickness = 0.055;
    const frameDepth = 0.18;
    const frameWidth = 0.08;

    const frameGroup = new THREE.Group();
    scene.add(frameGroup);

    // Left Jamb
    const leftJamb = new THREE.Mesh(
      new THREE.BoxGeometry(frameWidth, doorHeight + frameWidth * 2, frameDepth),
      frameWoodMaterial
    );
    leftJamb.position.set(-(doorWidth / 2 + frameWidth / 2), 0.05, 0);
    leftJamb.castShadow = true;
    leftJamb.receiveShadow = true;
    frameGroup.add(leftJamb);

    // Right Jamb
    const rightJamb = new THREE.Mesh(
      new THREE.BoxGeometry(frameWidth, doorHeight + frameWidth * 2, frameDepth),
      frameWoodMaterial
    );
    rightJamb.position.set(doorWidth / 2 + frameWidth / 2, 0.05, 0);
    rightJamb.castShadow = true;
    rightJamb.receiveShadow = true;
    frameGroup.add(rightJamb);

    // Header Top Architrave
    const topJamb = new THREE.Mesh(
      new THREE.BoxGeometry(doorWidth + frameWidth * 2 + 0.08, frameWidth, frameDepth + 0.02),
      frameWoodMaterial
    );
    topJamb.position.set(0, doorHeight / 2 + frameWidth / 2 + 0.05, 0.01);
    topJamb.castShadow = true;
    topJamb.receiveShadow = true;
    frameGroup.add(topJamb);

    // Threshold Sill (Bottom)
    const threshold = new THREE.Mesh(
      new THREE.BoxGeometry(doorWidth + frameWidth * 2, 0.04, frameDepth + 0.04),
      satinBrassMaterial
    );
    threshold.position.set(0, -doorHeight / 2 - 0.02 + 0.05, 0.01);
    threshold.receiveShadow = true;
    frameGroup.add(threshold);

    // Strike Plate on Right Jamb
    const strikePlate = new THREE.Mesh(
      new THREE.BoxGeometry(0.015, 0.16, 0.045),
      satinBrassMaterial
    );
    strikePlate.position.set(doorWidth / 2 + 0.005, -0.05, 0.01);
    frameGroup.add(strikePlate);

    // 6. Door Hinge Group & Leaf (Realistic Hinge Pivot on Left Edge)
    // The hinge pivot line is at x = -doorWidth / 2
    const hingeGroup = new THREE.Group();
    hingeGroup.position.set(-doorWidth / 2, 0.05, 0.02);
    scene.add(hingeGroup);

    // Door Leaf Group is offset by +doorWidth / 2 so its left edge is at (0, 0, 0) of hingeGroup
    const doorLeafGroup = new THREE.Group();
    doorLeafGroup.position.set(doorWidth / 2, 0, 0);
    hingeGroup.add(doorLeafGroup);

    // Main Door Slab Base
    const doorSlabGeo = new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness);
    const doorSlab = new THREE.Mesh(doorSlabGeo, doorMaterial);
    doorSlab.castShadow = true;
    doorSlab.receiveShadow = true;
    doorLeafGroup.add(doorSlab);

    // Recessed Architectural Molded Panels (2 Upper, 2 Lower)
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x361c0d,
      roughness: 0.48,
      metalness: 0.05,
    });

    const createPanel = (px, py, pw, ph) => {
      // Recessed inlay box
      const pMesh = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, 0.014), panelMaterial);
      pMesh.position.set(px, py, doorThickness / 2 + 0.003);
      pMesh.castShadow = true;
      pMesh.receiveShadow = true;
      doorLeafGroup.add(pMesh);

      // Raised center field
      const centerField = new THREE.Mesh(
        new THREE.BoxGeometry(pw - 0.06, ph - 0.06, 0.01),
        doorMaterial
      );
      centerField.position.set(px, py, doorThickness / 2 + 0.01);
      centerField.castShadow = true;
      doorLeafGroup.add(centerField);
    };

    // Upper Panels
    createPanel(-0.25, 0.58, 0.38, 0.72);
    createPanel(0.25, 0.58, 0.38, 0.72);

    // Lower Panels
    createPanel(-0.25, -0.62, 0.38, 0.76);
    createPanel(0.25, -0.62, 0.38, 0.76);

    // 7. Hinges (3 Heavy Duty Brass Hinges on the Left)
    const hingePositions = [0.92, 0.0, -0.92];
    hingePositions.forEach((hy) => {
      const hingePin = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.11, 16),
        satinBrassMaterial
      );
      hingePin.position.set(-doorWidth / 2 - 0.006, hy, 0.03);
      hingePin.castShadow = true;
      doorLeafGroup.add(hingePin);

      // Small top and bottom decorative finial caps
      const finialTop = new THREE.Mesh(
        new THREE.SphereGeometry(0.013, 10, 10),
        satinBrassMaterial
      );
      finialTop.position.set(-doorWidth / 2 - 0.006, hy + 0.055, 0.03);
      doorLeafGroup.add(finialTop);

      const finialBottom = new THREE.Mesh(
        new THREE.SphereGeometry(0.013, 10, 10),
        satinBrassMaterial
      );
      finialBottom.position.set(-doorWidth / 2 - 0.006, hy - 0.055, 0.03);
      doorLeafGroup.add(finialBottom);
    });

    // 8. Brushed Brass "LOGIN" Plaque (Mounted at Eye Level on Lock Rail)
    const plaqueTexture = createLoginPlaqueTexture(plaqueText);
    const plaqueMat = new THREE.MeshStandardMaterial({
      map: plaqueTexture,
      metalness: 0.85,
      roughness: 0.32,
    });
    const plaqueMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.22, 0.014),
      plaqueMat
    );
    plaqueMesh.position.set(0, 0.0, doorThickness / 2 + 0.009);
    plaqueMesh.castShadow = true;
    doorLeafGroup.add(plaqueMesh);

    // 9. Metallic Handle Assembly (Mounted on the Right Side)
    const handleGroup = new THREE.Group();
    handleGroup.position.set(doorWidth * 0.38, -0.06, doorThickness / 2 + 0.008);
    doorLeafGroup.add(handleGroup);

    // Escutcheon Backplate (Beveled vertical rectangle)
    const backplate = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.32, 0.015),
      satinBrassMaterial
    );
    backplate.castShadow = true;
    handleGroup.add(backplate);

    // Keyhole / Euro Profile Lock Cylinder below handle
    const lockCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.02, 16),
      darkSteelMaterial
    );
    lockCylinder.rotation.x = Math.PI / 2;
    lockCylinder.position.set(0, -0.075, 0.012);
    handleGroup.add(lockCylinder);

    // Handle Collar / Rosette (Fixed base from which lever extends)
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.025, 20),
      satinBrassMaterial
    );
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.055, 0.018);
    collar.castShadow = true;
    handleGroup.add(collar);

    // Handle Pivot Group: rotates around its precise axle point!
    const handlePivot = new THREE.Group();
    handlePivot.position.set(0, 0.055, 0.035);
    handleGroup.add(handlePivot);

    // Forward spindle stem
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.045, 16),
      satinBrassMaterial
    );
    stem.rotation.x = Math.PI / 2;
    stem.position.set(0, 0, 0.02);
    stem.castShadow = true;
    handlePivot.add(stem);

    // Horizontal Lever Arm (Presses downward around handlePivot)
    const leverGeo = new THREE.CylinderGeometry(0.012, 0.009, 0.17, 18);
    const leverMesh = new THREE.Mesh(leverGeo, satinBrassMaterial);
    leverMesh.rotation.z = Math.PI / 2;
    leverMesh.position.set(-0.075, 0, 0.042);
    leverMesh.castShadow = true;
    handlePivot.add(leverMesh);

    // Rounded ergonomic end cap
    const leverCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 12, 12),
      satinBrassMaterial
    );
    leverCap.position.set(-0.16, 0, 0.042);
    handlePivot.add(leverCap);

    // Latch Bolt (Spring-loaded latch protruding on the right edge)
    const latchBolt = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.028, 0.035),
      satinBrassMaterial
    );
    latchBolt.position.set(doorWidth / 2 + 0.008, -0.06, 0);
    doorLeafGroup.add(latchBolt);

    // 10. Interactive Raycaster & Animation Physics
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Clickable interactive targets (Door Leaf, Handle, Plaque)
    const interactableMeshes = [doorSlab, plaqueMesh, backplate, leverMesh, leverCap];

    // Animation Timing & State Variables
    let animState = isOpenRef.current ? 'OPEN' : 'CLOSED';
    let animStartTime = 0;
    const isAnimatingRef = { current: false };

    // Target values (Inward swing: rotation.y > 0)
    let currentDoorAngle = isOpenRef.current ? 1.35 : 0;
    let targetDoorAngle = currentDoorAngle;
    let currentHandleAngle = 0;
    let targetHandleAngle = 0;
    let currentLatchOffset = 0;
    let targetLatchOffset = 0;

    // Apply initial state
    hingeGroup.rotation.y = currentDoorAngle;
    interiorPointLight.intensity = isOpenRef.current ? 3.5 : 0;

    // Parallax mouse position
    const mouseTarget = { x: 0, y: 0 };

    const handlePointerMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      mouse.x = x;
      mouse.y = y;

      mouseTarget.x = x * 0.18;
      mouseTarget.y = y * 0.12;

      // Raycast hover check
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactableMeshes);
      renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    };

    /**
     * Trigger Door Opening Interaction Sequence:
     * 1. Handle realistically rotates downward (0 - 180ms)
     * 2. Latch clicks & releases (180ms - 260ms)
     * 3. Door swings open naturally into the room (260ms - 850ms)
     * 4. As door starts revealing interior (~340ms), show existing Login Form!
     */
    const triggerOpenDoor = () => {
      if (isAnimatingRef.current || animState === 'OPEN' || animState === 'OPENING') return;

      isAnimatingRef.current = true;
      animState = 'OPENING';
      animStartTime = performance.now();

      // Dispatch form visibility as soon as door is open enough (~340ms)
      setTimeout(() => {
        if (onToggleDoorRef.current) {
          onToggleDoorRef.current(true);
        }
      }, 340);
    };

    /**
     * Trigger Door Closing Sequence
     */
    const triggerCloseDoor = () => {
      if (isAnimatingRef.current || animState === 'CLOSED' || animState === 'CLOSING') return;

      isAnimatingRef.current = true;
      animState = 'CLOSING';
      animStartTime = performance.now();

      if (onToggleDoorRef.current) {
        onToggleDoorRef.current(false);
      }
    };

    const handleClick = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactableMeshes);

      if (intersects.length > 0) {
        if (!isOpenRef.current) {
          triggerOpenDoor();
        } else {
          triggerCloseDoor();
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove, { passive: true });
    renderer.domElement.addEventListener('click', handleClick);

    // Watch for external isOpen toggle (e.g. from header toggle button)
    const prevIsOpenRef = { current: isOpenRef.current };

    // 11. Animation Frame Loop (Strict 60fps Single Loop)
    let animationFrameId;

    const animate = (currentTime) => {
      animationFrameId = requestAnimationFrame(animate);

      // Check external state change
      if (isOpenRef.current !== prevIsOpenRef.current) {
        prevIsOpenRef.current = isOpenRef.current;
        if (isOpenRef.current && animState === 'CLOSED') {
          triggerOpenDoor();
        } else if (!isOpenRef.current && animState === 'OPEN') {
          triggerCloseDoor();
        }
      }

      // Parallax smooth camera lerp (with subtle framing shift when open on desktop)
      const targetCamX = (isOpenRef.current && isLargeScreen ? 0.65 : 0) + mouseTarget.x;
      const targetCamY = 0.15 + mouseTarget.y;
      camera.position.x += (targetCamX - camera.position.x) * 0.045;
      camera.position.y += (targetCamY - camera.position.y) * 0.045;
      camera.lookAt(targetCamX * 0.3, 0.05, 0);

      // Handle Animation States
      if (animState === 'OPENING') {
        const elapsed = currentTime - animStartTime;

        // Stage 1: Handle realistically rotates downward around pivot (0 to 180ms)
        if (elapsed < 180) {
          const t = elapsed / 180;
          // Smooth downward rotation around axle (+0.65 rad ≈ 37°)
          targetHandleAngle = 0.65 * (t * t);
          targetLatchOffset = 0;
          targetDoorAngle = 0;
        }
        // Stage 2: Latch clicks & releases into door leaf (180ms to 260ms)
        else if (elapsed < 260) {
          const t = (elapsed - 180) / 80;
          targetHandleAngle = 0.65;
          // Latch bolt retracts inward
          targetLatchOffset = -0.016 * t;
          // Subtle door unseat (approx 2 degrees)
          targetDoorAngle = 0.035 * t;
        }
        // Stage 3: Door swings open naturally into room (260ms to 850ms)
        else if (elapsed < 850) {
          const t = (elapsed - 260) / 590;
          // Natural cubic ease-out for realistic physical door momentum
          const easeOut = 1 - Math.pow(1 - t, 3);
          targetDoorAngle = 0.035 + (1.35 - 0.035) * easeOut;

          // Handle springs back smoothly to horizontal resting position
          if (elapsed > 460) {
            const ht = Math.min(1, (elapsed - 460) / 250);
            targetHandleAngle = 0.65 * (1 - ht);
          }
        } else {
          // Finished opening
          targetDoorAngle = 1.35;
          targetHandleAngle = 0;
          targetLatchOffset = 0;
          animState = 'OPEN';
          isAnimatingRef.current = false;
        }
      } else if (animState === 'CLOSING') {
        const elapsed = currentTime - animStartTime;

        // Smooth door close swing (~600ms)
        if (elapsed < 600) {
          const t = elapsed / 600;
          const easeIn = t * t;
          targetDoorAngle = 1.35 * (1 - easeIn);
        } else {
          targetDoorAngle = 0;
          targetHandleAngle = 0;
          targetLatchOffset = 0;
          animState = 'CLOSED';
          isAnimatingRef.current = false;
        }
      }

      // Smooth lerp physics
      currentDoorAngle += (targetDoorAngle - currentDoorAngle) * 0.16;
      currentHandleAngle += (targetHandleAngle - currentHandleAngle) * 0.22;
      currentLatchOffset += (targetLatchOffset - currentLatchOffset) * 0.25;

      // Apply physical transforms
      hingeGroup.rotation.y = currentDoorAngle;
      handlePivot.rotation.z = currentHandleAngle;
      latchBolt.position.x = doorWidth / 2 + 0.008 + currentLatchOffset;

      // Dynamic warm light spill as door opens
      const openRatio = Math.min(1, Math.abs(currentDoorAngle) / 1.35);
      interiorPointLight.intensity = openRatio * 4.2;

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // 12. Responsive Resize Handling
    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth || window.innerWidth;
      const nh = container.clientHeight || window.innerHeight;
      camera.aspect = nw / nh;
      camera.position.z = nw < 768 ? 5.6 : 4.4;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    // 13. Comprehensive Resource Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);

      // Dispose textures, geometries, materials
      woodTexture.dispose();
      plaqueTexture.dispose();

      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [plaqueText]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full overflow-hidden"
      style={{ touchAction: 'pan-y' }}
    />
  );
}
