"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";
import type { ScrollData } from "@/hooks/useScrollAnimation";

const MODEL_PATH = "/models/zoll-aed3.glb";

useGLTF.preload(MODEL_PATH);

// Keyframes: position [x,y,z], rotation [x,y,z], scale
// Front-facing only — small Y rotations (±15°) to keep it looking good
const KEYFRAMES = [
  // Section 1 - Hero: right side, raised up
  { pos: [0.8, 0.4, 0], rot: [0.05, 0.1, 0.02], scale: 1.0 },
  // Section 2 - Features: shifted right, slight angle
  { pos: [1.0, 0.1, 0], rot: [0.05, -0.2, 0], scale: 0.9 },
  // Section 3 - Specs: shifted left, leave right side clear for text
  { pos: [-1.1, 0.1, 0], rot: [0.1, 0.15, 0], scale: 0.9 },
  // Section 4 - Usage: shifted left, slight angle
  { pos: [-1.0, 0.1, 0], rot: [0.08, 0.2, -0.03], scale: 1.0 },
  // Section 5 - CTA: centered, just above text, compact
  { pos: [0, 0.75, 0], rot: [0.1, -0.1, 0.02], scale: 0.45 },
];

function lerpValue(a: number, b: number, t: number) {
  return THREE.MathUtils.lerp(a, b, t);
}

// Radial gradient texture for fake shadow
function createShadowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );
  gradient.addColorStop(0, "rgba(0,0,0,0.25)");
  gradient.addColorStop(0.6, "rgba(0,0,0,0.1)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

const shadowTexture = createShadowTexture();

interface DefibrillatorSceneProps {
  scrollRef: React.RefObject<ScrollData | null>;
  onReady?: () => void;
}

export default function DefibrillatorScene({ scrollRef, onReady }: DefibrillatorSceneProps) {
  const { scene } = useGLTF(MODEL_PATH);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const smoothOffset = useRef(0);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Smooth damping on scroll offset (replaces ScrollControls damping)
    const rawOffset = THREE.MathUtils.clamp(scrollRef.current?.offset ?? 0, 0, 1);
    smoothOffset.current = THREE.MathUtils.damp(smoothOffset.current, rawOffset, 4, delta);
    const offset = smoothOffset.current;

    const time = state.clock.elapsedTime;

    // Map offset (0-1) to section index (0-4)
    const totalSections = 5;
    const sectionFloat = offset * (totalSections - 1);
    const sectionIndex = Math.min(
      Math.floor(sectionFloat),
      totalSections - 2
    );
    const sectionProgress = sectionFloat - sectionIndex;

    const from = KEYFRAMES[sectionIndex];
    const to = KEYFRAMES[sectionIndex + 1];

    // Smooth easing
    const t = THREE.MathUtils.smoothstep(sectionProgress, 0, 1);

    // Target values from keyframes
    let targetX = lerpValue(from.pos[0], to.pos[0], t);
    let targetY = lerpValue(from.pos[1], to.pos[1], t);
    const targetZ = lerpValue(from.pos[2], to.pos[2], t);
    let targetRotX = lerpValue(from.rot[0], to.rot[0], t);
    let targetRotY = lerpValue(from.rot[1], to.rot[1], t);
    const targetRotZ = lerpValue(from.rot[2], to.rot[2], t);
    const targetScale = lerpValue(from.scale, to.scale, t);

    // Idle animation: gentle float + slow rotation when not scrolling
    const idleStrength = Math.max(0, 1 - offset * 6);
    targetY += Math.sin(time * 1.2) * 0.04 * idleStrength;
    targetX += Math.sin(time * 0.8) * 0.015 * idleStrength;
    targetRotY += Math.sin(time * 0.6) * 0.08 * idleStrength;
    targetRotX += Math.cos(time * 0.9) * 0.02 * idleStrength;

    // Damped lerp for smooth transitions
    const damping = 1 - Math.pow(0.001, delta);
    const g = groupRef.current;

    g.position.x = THREE.MathUtils.lerp(g.position.x, targetX, damping);
    g.position.y = THREE.MathUtils.lerp(g.position.y, targetY, damping);
    g.position.z = THREE.MathUtils.lerp(g.position.z, targetZ, damping);

    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetRotX, damping);
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetRotY, damping);
    g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, targetRotZ, damping);

    const s = THREE.MathUtils.lerp(g.scale.x, targetScale, damping);
    g.scale.setScalar(s);

    // Shadow follows model X/Z but stays flat below it
    if (shadowRef.current) {
      shadowRef.current.position.x = g.position.x;
      shadowRef.current.position.z = g.position.z;
      // Shadow shrinks/grows based on model height (higher = smaller shadow)
      const shadowScale = Math.max(0.5, 1.2 - g.position.y * 0.3) * s;
      shadowRef.current.scale.setScalar(shadowScale);
    }
  });

  return (
    <>
      {/* Lighting: 3-point + red accent */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} />
      <directionalLight position={[-5, 3, -3]} intensity={0.4} />
      <pointLight position={[0, 2, 4]} intensity={0.6} />
      <pointLight position={[2, 1, -2]} intensity={0.3} color="#d92d20" />

      <Environment preset="studio" />

      <group ref={groupRef}>
        <primitive object={clonedScene} />
      </group>

      {/* Fake shadow: flat disc that follows model position */}
      <mesh ref={shadowRef} rotation-x={-Math.PI / 2} position-y={-1.3}>
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial
          map={shadowTexture}
          transparent
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
