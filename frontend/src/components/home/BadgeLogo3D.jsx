import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const INDIGO = 0x3b4cca;
const TEAL = 0x14b8a6;

const easeOutBack = (x) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const easeInOut = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const clamp01 = (x) => Math.min(1, Math.max(0, x));

export default function BadgeLogo3D({ size = 72, active = false, className = '' }) {
  const mountRef = useRef(null);
  const activeRef = useRef(active);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- Scene setup ---------- */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mount.appendChild(renderer.domElement);

    /* ---------- Lights (soft, physical-object look) ---------- */
    scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    const key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(3, 4, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffffff, 0.45);
    fill.position.set(-4, -2, 4);
    scene.add(fill);

    /* ---------- Logo group ---------- */
    const logo = new THREE.Group();
    scene.add(logo);

    // Outer indigo ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.17, 32, 120),
      new THREE.MeshStandardMaterial({ color: INDIGO, roughness: 0.35, metalness: 0.15 })
    );
    logo.add(ring);

    // White badge
    const badge = new THREE.Mesh(
      new THREE.CylinderGeometry(1.34, 1.34, 0.2, 80),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.0 })
    );
    badge.rotation.x = Math.PI / 2;
    logo.add(badge);

    // Thin teal edge on the badge
    const edge = new THREE.Mesh(
      new THREE.TorusGeometry(1.3, 0.045, 16, 100),
      new THREE.MeshStandardMaterial({ color: TEAL, roughness: 0.4, metalness: 0.1 })
    );
    edge.position.z = 0.1;
    logo.add(edge);

    // Checkmark (tube that draws itself)
    const checkCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-0.58, 0.0, 0.2),
        new THREE.Vector3(-0.22, -0.4, 0.2),
        new THREE.Vector3(0.6, 0.48, 0.2),
      ],
      false,
      'catmullrom',
      0.1
    );
    const TUBE_SEGMENTS = 48;
    const RADIAL_SEGMENTS = 14;
    const checkGeo = new THREE.TubeGeometry(checkCurve, TUBE_SEGMENTS, 0.15, RADIAL_SEGMENTS, false);
    const checkMat = new THREE.MeshStandardMaterial({ color: TEAL, roughness: 0.35, metalness: 0.1 });
    const check = new THREE.Mesh(checkGeo, checkMat);
    check.geometry.setDrawRange(0, 0);
    logo.add(check);

    // Round caps for the checkmark ends
    const capGeo = new THREE.SphereGeometry(0.15, 24, 24);
    const startCap = new THREE.Mesh(capGeo, checkMat);
    startCap.position.copy(checkCurve.getPoint(0));
    startCap.visible = false;
    const endCap = new THREE.Mesh(capGeo, checkMat);
    endCap.position.copy(checkCurve.getPoint(1));
    endCap.visible = false;
    logo.add(startCap, endCap);

    // Thin orbiting teal ring (tilted)
    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(2.05, 0.03, 12, 120),
      new THREE.MeshStandardMaterial({ color: TEAL, roughness: 0.5, metalness: 0.05 })
    );
    orbit.rotation.x = Math.PI / 2.6;
    logo.add(orbit);

    // Floating particles (indigo and teal, matte)
    const particles = new THREE.Group();
    const dotGeo = new THREE.SphereGeometry(0.07, 12, 12);
    const dotMatIndigo = new THREE.MeshStandardMaterial({ color: INDIGO, roughness: 0.6 });
    const dotMatTeal = new THREE.MeshStandardMaterial({ color: TEAL, roughness: 0.6 });
    const PARTICLE_COUNT = 22;
    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const dot = new THREE.Mesh(dotGeo, i % 2 === 0 ? dotMatIndigo : dotMatTeal);
      const radius = 2.15 + Math.random() * 0.35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      dot.position.set(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi) * 0.6
      );
      const s = 0.6 + Math.random() * 0.9;
      dot.scale.setScalar(s);
      particles.add(dot);
    }
    logo.add(particles);

    /* ---------- Sizing ---------- */
    const resize = () => {
      const w = mount.clientWidth || size;
      const h = mount.clientHeight || size;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    /* ---------- Pointer tilt ---------- */
    const pointer = { x: 0, y: 0 };
    const onPointerMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (!reduceMotion) window.addEventListener('pointermove', onPointerMove, { passive: true });

    /* ---------- Animation loop ---------- */
    const clock = new THREE.Clock();
    let hoverScale = 1;
    let rafId = 0;

    const animate = () => {
      rafId = requestAnimationFrame(animate);
      if (document.hidden) return; // pause when tab is hidden

      const t = clock.getElapsedTime();

      // Intro: badge pops in, then the checkmark draws
      const popP = reduceMotion ? 1 : clamp01(t / 0.9);
      const drawP = reduceMotion ? 1 : easeInOut(clamp01((t - 0.5) / 0.9));

      const introScale = 0.55 + 0.45 * easeOutBack(popP);
      hoverScale += ((activeRef.current ? 1.12 : 1) - hoverScale) * 0.1;
      logo.scale.setScalar(introScale * hoverScale);

      const drawCount = Math.floor(drawP * TUBE_SEGMENTS) * RADIAL_SEGMENTS * 6;
      check.geometry.setDrawRange(0, drawCount);
      startCap.visible = drawP > 0.02;
      endCap.visible = drawP >= 0.99;

      if (!reduceMotion) {
        // gentle sway + mouse tilt (never a full spin, so the check stays readable)
        const targetY = pointer.x * 0.55 + Math.sin(t * 0.7) * 0.18;
        const targetX = pointer.y * 0.35;
        logo.rotation.y += (targetY - logo.rotation.y) * 0.08;
        logo.rotation.x += (targetX - logo.rotation.x) * 0.08;

        orbit.rotation.z = t * 0.5;
        particles.rotation.y = t * 0.15;
        particles.rotation.z = Math.sin(t * 0.3) * 0.2;
        ring.rotation.z = Math.sin(t * 0.5) * 0.05;
      }

      renderer.render(scene, camera);
    };
    animate();

    /* ---------- Cleanup ---------- */
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      ro.disconnect();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [size]);

  return (
    <div
      ref={mountRef}
      role="img"
      aria-label="Smart Attendance logo"
      className={className}
      style={{ width: size, height: size }}
    />
  );
}