import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "../context/ThemeContext";

// Tiny inline 3D icon - spinning loot bag, safe, or bomb
export function TinyScene3D({ type = "safe", size = 80 }) {
  const mountRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(0, 0, 3.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xfff5cc, 1.2);
    dir.position.set(3, 5, 4);
    scene.add(dir);

    const group = new THREE.Group();
    scene.add(group);

    const toon = color => new THREE.MeshToonMaterial({ color });
    const outline = (mesh, s = 1.1) => {
      const o = new THREE.Mesh(mesh.geometry.clone(), new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide }));
      o.scale.setScalar(s);
      mesh.add(o);
    };

    if (type === "safe") {
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.5, 1.1), toon(0x444466));
      outline(body); group.add(body);
      const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 0.12), toon(0x6677aa));
      door.position.z = 0.62; group.add(door);
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 16), toon(0xFFD93D));
      dial.rotation.x = Math.PI / 2; dial.position.set(0, 0.15, 0.7); group.add(dial);
    } else if (type === "bag") {
      const bag = new THREE.Mesh(new THREE.SphereGeometry(0.8, 12, 12), toon(0xFF6B35));
      bag.scale.set(1, 1.2, 0.9); outline(bag, 1.08); group.add(bag);
      const tie = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.3, 8), toon(0xFFD93D));
      tie.position.y = 0.92; group.add(tie);
      const knot = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), toon(0xFFD93D));
      knot.position.y = 1.1; group.add(knot);
    } else if (type === "bomb") {
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 14, 14), toon(0x222233));
      outline(body); group.add(body);
      const fuse = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 6), toon(0xcc6633));
      fuse.position.set(0.2, 0.95, 0); fuse.rotation.z = 0.5; group.add(fuse);
      const spark = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), toon(0xFFD93D));
      spark.position.set(0.48, 1.3, 0); group.add(spark);
    } else if (type === "coin") {
      const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.18, 20), toon(0xFFD700));
      outline(coin, 1.05); group.add(coin);
      const symbol = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.1, 6, 12), toon(0xcc9900));
      symbol.rotation.x = Math.PI / 2; symbol.position.y = 0.12; group.add(symbol);
    } else if (type === "skull") {
      const skull = new THREE.Mesh(new THREE.SphereGeometry(0.75, 10, 10), toon(0xeeeecc));
      outline(skull); group.add(skull);
      [-0.28, 0.28].forEach(x => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), toon(0x111111));
        eye.position.set(x, 0.1, 0.7); group.add(eye);
      });
    }

    let t = 0;
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.025;
      group.rotation.y = t;
      group.position.y = Math.sin(t * 1.5) * 0.08;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [type, size, isDark]);

  return <div ref={mountRef} style={{ width: size, height: size, display: "inline-block" }} />;
}

// 3D Dashboard header scene
export default TinyScene3D;
