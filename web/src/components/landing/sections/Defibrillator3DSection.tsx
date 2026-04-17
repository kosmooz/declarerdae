"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import * as THREE from "three";

const MODEL_PATH = "/models/zoll-aed3.glb";

function RotatingModel() {
  const { scene } = useGLTF(MODEL_PATH);
  const clonedScene = useMemo(() => scene.clone(), [scene]);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    // Slow auto-rotation
    groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.2;
    // Subtle float
    groupRef.current.position.y = 0.1 + Math.sin(t * 0.8) * 0.03;
    groupRef.current.rotation.x = 0.08 + Math.cos(t * 0.5) * 0.015;
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 8, 5]} intensity={1.5} />
      <directionalLight position={[-3, 3, -3]} intensity={0.6} />
      <pointLight position={[0, 2, 4]} intensity={0.5} />
      <pointLight position={[2, 1, -2]} intensity={0.4} color="#d92d20" />
      <Environment preset="studio" />
      <RotatingModel />
    </>
  );
}

export default function Defibrillator3DSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <div className="container">
        <div className="relative bg-gray-900 rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2 items-center">
            {/* 3D Canvas */}
            <div className="relative h-[350px] md:h-[450px]">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-[#d92d20] animate-pulse" />
                  </div>
                }
              >
                <Canvas
                  camera={{ position: [0, 0, 4], fov: 40 }}
                  gl={{ antialias: true, alpha: true }}
                  style={{ background: "transparent" }}
                >
                  <Scene />
                </Canvas>
              </Suspense>
            </div>

            {/* Content */}
            <motion.div
              ref={ref}
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="p-8 md:p-12"
            >
              <div className="inline-flex items-center gap-2 bg-[#d92d20]/20 text-[#d92d20] text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Nouveau
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl text-white mb-4 leading-tight">
                Découvrez le{" "}
                <span className="text-[#d92d20]">ZOLL AED 3</span>
              </h2>
              <p className="text-gray-400 text-sm md:text-base mb-3 leading-relaxed">
                Le défibrillateur le plus avancé de sa catégorie. Écran LCD
                couleur, feedback CPR en temps réel, électrodes universelles.
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  "Écran HD avec instructions visuelles",
                  "Analyse automatique du rythme cardiaque",
                  "Mode adulte & pédiatrique intégré",
                  "Garantie 8 ans constructeur",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-gray-300 text-sm"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#d92d20] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/defibrillateur">
                <Button
                  size="lg"
                  className="bg-[#d92d20] hover:bg-[#b91c1c] text-white font-bold text-sm px-6 py-5 shadow-lg shadow-red-900/30"
                >
                  Explorer en 3D
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
