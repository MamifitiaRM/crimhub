import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "../context/ThemeContext";

export default function CartoonScene3D({ height = 260 }) {
  const mountRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const W = mount.clientWidth, H = height;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? "#191923" : "#e4e1db");
    scene.fog = new THREE.Fog(isDark ? "#191923" : "#e4e1db", 12, 28);

    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 3, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, isDark ? 0.5 : 0.8);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xfff5e0, isDark ? 1.2 : 1.5);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);
    const fillLight = new THREE.DirectionalLight(isDark ? 0x8b5cf6 : 0x4488ff, 0.4);
    fillLight.position.set(-5, 2, -3);
    scene.add(fillLight);

    // Toon material helper
    const toon = (color, outlineThick = 0) => {
      const mat = new THREE.MeshToonMaterial({ color });
      return mat;
    };

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(30, 30);
    const groundMat = new THREE.MeshToonMaterial({ color: isDark ? 0x22222f : 0xd9d5ce });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.5;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid lines on ground
    const gridHelper = new THREE.GridHelper(20, 20, 0x333344, isDark ? 0x2a2a3a : 0xc0bdb8);
    gridHelper.position.y = -1.48;
    scene.add(gridHelper);

    // ─── BUILDING ───────────────────────────────────
    const buildGroup = new THREE.Group();
    scene.add(buildGroup);

    // Main body
    const bodyGeo = new THREE.BoxGeometry(2.8, 3.5, 1.8);
    const bodyMat = toon(0xFF6B35);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(-3, 0.25, 0);
    body.castShadow = true;
    buildGroup.add(body);

    // Roof
    const roofGeo = new THREE.ConeGeometry(2.2, 1.2, 4);
    const roofMat = toon(0xFF2D55);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(-3, 2.35, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    buildGroup.add(roof);

    // Windows
    const winMat = new THREE.MeshToonMaterial({ color: 0xFFD93D, emissive: isDark ? 0xFFAA00 : 0x000000, emissiveIntensity: isDark ? 0.4 : 0 });
    [[-0.8, 0.4], [0.8, 0.4], [0, -0.6]].forEach(([x, y]) => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.1), winMat);
      w.position.set(-3 + x, y, 0.92);
      buildGroup.add(w);
    });

    // Door
    const doorGeo = new THREE.BoxGeometry(0.6, 0.9, 0.1);
    const doorMat = toon(0x8338EC);
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(-3, -1.0, 0.92);
    buildGroup.add(door);

    // ─── SAFE / VAULT (floating) ─────────────────────
    const safeGroup = new THREE.Group();
    safeGroup.position.set(0, 0.5, 0);
    scene.add(safeGroup);

    const safeBody = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 1.4), toon(0x444455));
    safeBody.castShadow = true;
    safeGroup.add(safeBody);

    // Safe door
    const safeDoor = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 0.15), toon(0x666677));
    safeDoor.position.z = 0.75;
    safeGroup.add(safeDoor);

    // Dial
    const dialGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.1, 16);
    const dial = new THREE.Mesh(dialGeo, toon(0xFFD93D));
    dial.rotation.x = Math.PI / 2;
    dial.position.set(0, 0.15, 0.84);
    safeGroup.add(dial);

    // Handle
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.08), toon(0xFF6B35));
    handle.position.set(0.45, -0.3, 0.84);
    safeGroup.add(handle);

    // Stars around safe
    const starGeo = new THREE.OctahedronGeometry(0.12);
    const starMat = new THREE.MeshToonMaterial({ color: 0xFFD93D });
    [0, 1, 2, 3, 4].forEach(i => {
      const star = new THREE.Mesh(starGeo, starMat);
      const angle = (i / 5) * Math.PI * 2;
      star.position.set(Math.cos(angle) * 1.4, Math.sin(angle) * 0.8 + 0.5, 0.2);
      scene.add(star);
    });

    // ─── THIEF CHARACTER ────────────────────────────
    const thiefGroup = new THREE.Group();
    thiefGroup.position.set(2.8, -0.2, 0);
    scene.add(thiefGroup);

    // Body
    const torsoMat = toon(0x222233);
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.35, 0.7, 4, 8) : new THREE.CylinderGeometry(0.35, 0.35, 0.7, 8), torsoMat);
    torso.position.y = 0.5;
    torso.castShadow = true;
    thiefGroup.add(torso);

    // Head
    const headMat = toon(0xFFB347);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 12), headMat);
    head.position.y = 1.25;
    head.castShadow = true;
    thiefGroup.add(head);

    // Mask
    const maskMat = toon(0x111122);
    const mask = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.22, 0.4), maskMat);
    mask.position.set(0, 1.27, 0.22);
    mask.rotation.x = -0.1;
    thiefGroup.add(mask);

    // Hat
    const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.06, 12), torsoMat);
    hatBrim.position.y = 1.56;
    thiefGroup.add(hatBrim);
    const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.5, 12), torsoMat);
    hatTop.position.y = 1.84;
    thiefGroup.add(hatTop);

    // Bag (sack of loot)
    const bagMat = toon(0xFF6B35);
    const bag = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), bagMat);
    bag.position.set(-0.7, 0.1, 0);
    bag.scale.set(1, 1.2, 0.9);
    bag.castShadow = true;
    thiefGroup.add(bag);

    // ─── GOLD COINS ─────────────────────────────────
    const coinMat = new THREE.MeshToonMaterial({ color: 0xFFD700, emissive: isDark ? 0x886600 : 0x000000, emissiveIntensity: 0.2 });
    for (let i = 0; i < 6; i++) {
      const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 12), coinMat);
      coin.position.set(
        (Math.random() - 0.5) * 4,
        -0.8 + Math.random() * 0.6,
        (Math.random() - 0.5) * 2
      );
      coin.rotation.x = Math.random() * Math.PI;
      coin.castShadow = true;
      scene.add(coin);
    }

    // ─── FLOATING SIGNS ─────────────────────────────
    const signGeo = new THREE.BoxGeometry(1.8, 0.6, 0.08);
    const signMat = toon(0xFFD93D);
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(-3, 3.8, 0);
    sign.castShadow = true;
    scene.add(sign);

    // ─── OUTLINES (black edge effect) ───────────────
    const outlineMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
    function addOutline(mesh, scale = 1.06) {
      const outlineGeo = mesh.geometry.clone();
      const outline = new THREE.Mesh(outlineGeo, outlineMat);
      outline.scale.set(scale, scale, scale);
      mesh.add(outline);
    }
    addOutline(body, 1.07);
    addOutline(head, 1.08);
    addOutline(torso, 1.08);
    addOutline(safeBody, 1.06);
    addOutline(bag, 1.08);

    // ─── ANIMATION LOOP ──────────────────────────────
    let t = 0;
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.016;

      // Safe floating
      safeGroup.position.y = 0.5 + Math.sin(t * 1.2) * 0.15;
      safeGroup.rotation.y = t * 0.4;

      // Thief bobbing
      thiefGroup.position.y = -0.2 + Math.sin(t * 2) * 0.06;
      thiefGroup.rotation.y = Math.sin(t * 0.5) * 0.15;

      // Camera gentle orbit
      camera.position.x = Math.sin(t * 0.2) * 1.5;
      camera.position.y = 3 + Math.sin(t * 0.15) * 0.3;
      camera.lookAt(0, 0.5, 0);

      // Dial spinning
      dial.rotation.z += 0.04;

      // Stars orbiting
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const onResize = () => {
      const w = mount.clientWidth;
      camera.aspect = w / H;
      camera.updateProjectionMatrix();
      renderer.setSize(w, H);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [isDark, height]);

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        height: `${height}px`,
        borderRadius: "0 0 14px 14px",
        overflow: "hidden",
        border: "4px solid #0d0d0d",
        borderTop: "none",
        boxShadow: "0 8px 0 #0d0d0d",
      }}
    />
  );
}
