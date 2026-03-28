"use client"

import * as React from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Sparkles, Stars } from "@react-three/drei"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import * as THREE from "three"

import type { Intro3dSceneId } from "@/lib/intro-3d-scenes"

export type Intro3dFxLevel = "off" | "low" | "medium" | "high"

export type Intro3dFxConfig = {
  stars: number
  sparkles: number
  dust: number
  bloom: boolean
  bloomIntensity: number
}

/** Bruit déterministe (React purity). */
function det01(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233 + 311.7) * 43758.5453123
  return x - Math.floor(x)
}

export function fxConfig(fx: Intro3dFxLevel): Intro3dFxConfig {
  switch (fx) {
    case "off":
      return { stars: 0, sparkles: 0, dust: 0, bloom: false, bloomIntensity: 0 }
    case "low":
      return { stars: 1800, sparkles: 28, dust: 900, bloom: true, bloomIntensity: 0.42 }
    case "high":
      return { stars: 8000, sparkles: 110, dust: 4200, bloom: true, bloomIntensity: 0.92 }
    default:
      return { stars: 4500, sparkles: 64, dust: 2400, bloom: true, bloomIntensity: 0.68 }
  }
}

function OrbitalDust({
  count,
  color,
  size = 0.038,
  speed = 0.028,
  shellMin = 3.2,
  shellMax = 10.7,
}: {
  count: number
  color: string
  size?: number
  speed?: number
  shellMin?: number
  shellMax?: number
}) {
  const ref = React.useRef<THREE.Points>(null)
  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const u = det01(i, 1)
      const v = det01(i, 2)
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      const r = shellMin + det01(i, 3) * (shellMax - shellMin)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [count, shellMin, shellMax])

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.9}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function PostBloom({
  enabled,
  intensity,
  threshold = 0.25,
  smoothing = 0.35,
}: {
  enabled: boolean
  intensity: number
  threshold?: number
  smoothing?: number
}) {
  if (!enabled || intensity <= 0) return null
  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom
        luminanceThreshold={threshold}
        luminanceSmoothing={smoothing}
        intensity={intensity}
        mipmapBlur
      />
    </EffectComposer>
  )
}

/* ——— Portail néon (original) ——— */

function NeonPortal() {
  const group = React.useRef<THREE.Group>(null)
  useFrame((state, dt) => {
    if (!group.current) return
    group.current.rotation.z += dt * 0.1
    const targetTilt = Math.sin(state.clock.elapsedTime * 0.32) * 0.07
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetTilt, 0.06)
  })

  return (
    <group ref={group}>
      <Float speed={1.35} rotationIntensity={0.12} floatIntensity={0.4}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <torusGeometry args={[2.08, 0.048, 28, 200]} />
            <meshPhysicalMaterial
              color="#4c1d95"
              emissive="#8b5cf6"
              emissiveIntensity={2.1}
              metalness={0.96}
              roughness={0.14}
              clearcoat={0.55}
              clearcoatRoughness={0.18}
            />
          </mesh>
          <mesh>
            <torusGeometry args={[2.32, 0.016, 20, 120]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#38bdf8"
              emissiveIntensity={3.2}
              metalness={1}
              roughness={0.06}
            />
          </mesh>
          <mesh rotation={[0, 0, 0.15]}>
            <torusGeometry args={[2.2, 0.006, 12, 96]} />
            <meshBasicMaterial
              color="#e9d5ff"
              transparent
              opacity={0.55}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
        <mesh>
          <icosahedronGeometry args={[0.42, 2]} />
          <meshStandardMaterial
            wireframe
            color="#1e1b4b"
            emissive="#6366f1"
            emissiveIntensity={0.55}
            metalness={0.35}
            roughness={0.4}
          />
        </mesh>
      </Float>
    </group>
  )
}

function PortalScene({ cfg }: { cfg: Intro3dFxConfig }) {
  return (
    <>
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 6.5, 24]} />
      <ambientLight intensity={0.12} />
      <pointLight position={[7, 3.5, 6]} intensity={95} color="#c4b5fd" distance={28} decay={2} />
      <pointLight position={[-6, -2, 5]} intensity={55} color="#38bdf8" distance={24} decay={2} />
      <spotLight
        position={[0, 9, 1.5]}
        angle={0.55}
        penumbra={0.85}
        intensity={38}
        color="#ddd6fe"
        distance={30}
        decay={2}
      />
      {cfg.stars > 0 ? (
        <Stars
          radius={90}
          depth={38}
          count={cfg.stars}
          factor={3.2}
          saturation={0.12}
          fade
          speed={0.35}
        />
      ) : null}
      {cfg.dust > 0 ? (
        <OrbitalDust count={cfg.dust} color="#c4b5fd" shellMin={3.2} shellMax={10.7} />
      ) : null}
      <NeonPortal />
      {cfg.sparkles > 0 ? (
        <Sparkles
          count={cfg.sparkles}
          scale={11}
          size={2.8}
          speed={0.45}
          opacity={0.85}
          color="#7dd3fc"
        />
      ) : null}
      <PostBloom enabled={cfg.bloom} intensity={cfg.bloomIntensity} threshold={0.25} />
    </>
  )
}

/* ——— Élégance : studio noir, or rose, verre ——— */

function EleganceRings() {
  const root = React.useRef<THREE.Group>(null)
  useFrame((state, dt) => {
    if (!root.current) return
    root.current.rotation.z += dt * 0.038
    const wobble = Math.sin(state.clock.elapsedTime * 0.28) * 0.04
    root.current.rotation.x = THREE.MathUtils.lerp(root.current.rotation.x, wobble, 0.05)
  })

  return (
    <group ref={root}>
      <Float speed={0.65} rotationIntensity={0.06} floatIntensity={0.22}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh>
            <torusGeometry args={[2.02, 0.012, 32, 200]} />
            <meshPhysicalMaterial
              color="#1c1917"
              emissive="#9a3412"
              emissiveIntensity={0.18}
              metalness={1}
              roughness={0.06}
              clearcoat={1}
              clearcoatRoughness={0.08}
            />
          </mesh>
          <mesh>
            <torusGeometry args={[2.18, 0.0035, 16, 120]} />
            <meshStandardMaterial
              color="#fafaf9"
              emissive="#fcd34d"
              emissiveIntensity={0.35}
              metalness={0.95}
              roughness={0.18}
            />
          </mesh>
        </group>
        <mesh>
          <sphereGeometry args={[0.34, 64, 64]} />
          <meshPhysicalMaterial
            color="#f5f5f4"
            metalness={0.2}
            roughness={0.18}
            emissive="#78716c"
            emissiveIntensity={0.06}
            clearcoat={1}
            clearcoatRoughness={0.12}
          />
        </mesh>
      </Float>
    </group>
  )
}

function EleganceScene({ cfg }: { cfg: Intro3dFxConfig }) {
  const starCount = cfg.stars > 0 ? Math.max(400, Math.floor(cfg.stars * 0.22)) : 0
  const dustCount = cfg.dust > 0 ? Math.floor(cfg.dust * 0.45) : 0
  const sparkCount = cfg.sparkles > 0 ? Math.floor(cfg.sparkles * 0.35) : 0

  return (
    <>
      <color attach="background" args={["#050506"]} />
      <fog attach="fog" args={["#050506", 10, 36]} />
      <ambientLight intensity={0.045} />
      <spotLight
        position={[4.5, 9, 5]}
        angle={0.42}
        penumbra={1}
        intensity={32}
        color="#fffbeb"
        distance={40}
        decay={2}
      />
      <pointLight position={[-5.5, 1.5, 4]} intensity={22} color="#e9d5ff" distance={28} decay={2} />
      <pointLight position={[3.5, -2.5, 5]} intensity={14} color="#fbbf24" distance={22} decay={2} />
      {starCount > 0 ? (
        <Stars
          radius={120}
          depth={60}
          count={starCount}
          factor={1.8}
          saturation={0}
          fade
          speed={0.06}
        />
      ) : null}
      {dustCount > 0 ? (
        <OrbitalDust
          count={dustCount}
          color="#d6d3d1"
          size={0.022}
          speed={0.018}
          shellMin={4}
          shellMax={11}
        />
      ) : null}
      <EleganceRings />
      {sparkCount > 0 ? (
        <Sparkles
          count={sparkCount}
          scale={9}
          size={1.6}
          speed={0.22}
          opacity={0.45}
          color="#fef3c7"
        />
      ) : null}
      <PostBloom
        enabled={cfg.bloom}
        intensity={cfg.bloomIntensity * 0.52}
        threshold={0.52}
        smoothing={0.42}
      />
    </>
  )
}

/* ——— Nébuleuse ——— */

function NebulaSatellites() {
  const g = React.useRef<THREE.Group>(null)
  const n = 7
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * 0.12
  })

  return (
    <group ref={g}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2
        const r = 1.35 + det01(i, 9) * 0.25
        const y = (det01(i, 10) - 0.5) * 0.5
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * r, y, Math.sin(a) * r]}
            rotation={[det01(i, 11) * Math.PI, det01(i, 12) * Math.PI, 0]}
          >
            <icosahedronGeometry args={[0.11 + det01(i, 13) * 0.06, 0]} />
            <meshStandardMaterial
              color="#6b21a8"
              emissive={i % 2 === 0 ? "#e879f9" : "#22d3ee"}
              emissiveIntensity={1.35}
              metalness={0.65}
              roughness={0.28}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function NebulaHalo() {
  const ref = React.useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.2) * 0.05
    ref.current.rotation.z = state.clock.elapsedTime * 0.09
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[2.45, 0.004, 12, 100]} />
      <meshBasicMaterial
        color="#c026d3"
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  )
}

function NebulaScene({ cfg }: { cfg: Intro3dFxConfig }) {
  const d1 = cfg.dust > 0 ? Math.floor(cfg.dust * 0.55) : 0
  const d2 = cfg.dust > 0 ? Math.floor(cfg.dust * 0.4) : 0

  return (
    <>
      <color attach="background" args={["#0f0220"]} />
      <fog attach="fog" args={["#1a0630", 5.5, 26]} />
      <ambientLight intensity={0.08} />
      <pointLight position={[6, 4, 2]} intensity={70} color="#f0abfc" distance={26} decay={2} />
      <pointLight position={[-5, -1, 6]} intensity={48} color="#22d3ee" distance={24} decay={2} />
      <pointLight position={[0, 5, -4]} intensity={28} color="#a78bfa" distance={22} decay={2} />
      {cfg.stars > 0 ? (
        <Stars
          radius={95}
          depth={45}
          count={cfg.stars}
          factor={4}
          saturation={0.45}
          fade
          speed={0.22}
        />
      ) : null}
      {d1 > 0 ? (
        <OrbitalDust count={d1} color="#f0abfc" size={0.042} speed={0.022} shellMin={2.8} shellMax={9.5} />
      ) : null}
      {d2 > 0 ? (
        <OrbitalDust count={d2} color="#67e8f9" size={0.032} speed={-0.031} shellMin={3.5} shellMax={11} />
      ) : null}
      <Float speed={1.1} floatIntensity={0.32} rotationIntensity={0.1}>
        <NebulaSatellites />
        <NebulaHalo />
      </Float>
      {cfg.sparkles > 0 ? (
        <Sparkles
          count={Math.floor(cfg.sparkles * 1.1)}
          scale={12}
          size={3.2}
          speed={0.5}
          opacity={0.9}
          color="#fae8ff"
        />
      ) : null}
      <PostBloom enabled={cfg.bloom} intensity={cfg.bloomIntensity * 1.08} threshold={0.18} />
    </>
  )
}

/* ——— Vitesse : grille + prismes ——— */

function PulseGrid() {
  const ref = React.useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.z = -2 + Math.sin(state.clock.elapsedTime * 0.15) * 0.15
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.35, -1]}>
      <planeGeometry args={[56, 56, 56, 56]} />
      <meshBasicMaterial
        color="#06b6d4"
        wireframe
        transparent
        opacity={0.11}
        depthWrite={false}
      />
    </mesh>
  )
}

function PulsePrisms() {
  const g = React.useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * 0.42
  })

  const scales = [1.15, 0.72, 0.44]
  const colors = ["#06b6d4", "#d946ef", "#22d3ee"]
  const emissive = ["#0891b2", "#c026d3", "#67e8f9"]

  return (
    <group ref={g}>
      {scales.map((s, i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 3, 0]}>
          <octahedronGeometry args={[s, 0]} />
          <meshStandardMaterial
            color={colors[i % colors.length]}
            emissive={emissive[i % emissive.length]}
            emissiveIntensity={0.95 + i * 0.15}
            metalness={0.92}
            roughness={0.12}
            wireframe={i === 0}
          />
        </mesh>
      ))}
      <mesh>
        <octahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial
          color="#0f172a"
          emissive="#f472b6"
          emissiveIntensity={1.1}
          metalness={1}
          roughness={0.08}
        />
      </mesh>
    </group>
  )
}

function PulseScene({ cfg }: { cfg: Intro3dFxConfig }) {
  return (
    <>
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 7, 28]} />
      <ambientLight intensity={0.06} />
      <pointLight position={[7, 3, 5]} intensity={88} color="#22d3ee" distance={28} decay={2} />
      <pointLight position={[-6, 2, 4]} intensity={72} color="#e879f9" distance={26} decay={2} />
      <spotLight
        position={[0, 10, 2]}
        angle={0.48}
        penumbra={0.9}
        intensity={28}
        color="#a5f3fc"
        distance={32}
        decay={2}
      />
      <PulseGrid />
      {cfg.stars > 0 ? (
        <Stars
          radius={85}
          depth={35}
          count={Math.floor(cfg.stars * 0.65)}
          factor={2.5}
          saturation={0.2}
          fade
          speed={0.5}
        />
      ) : null}
      {cfg.dust > 0 ? (
        <OrbitalDust count={Math.floor(cfg.dust * 0.5)} color="#67e8f9" size={0.03} speed={0.04} />
      ) : null}
      <Float speed={1.6} floatIntensity={0.2} rotationIntensity={0.18}>
        <PulsePrisms />
      </Float>
      {cfg.sparkles > 0 ? (
        <Sparkles
          count={Math.floor(cfg.sparkles * 0.85)}
          scale={10}
          size={2.4}
          speed={0.65}
          opacity={0.8}
          color="#f0abfc"
        />
      ) : null}
      <PostBloom enabled={cfg.bloom} intensity={cfg.bloomIntensity * 0.78} threshold={0.32} />
    </>
  )
}

/* ——— Routeur ——— */

export function Intro3DWorld({ scene, fx }: { scene: Intro3dSceneId; fx: Intro3dFxLevel }) {
  const cfg = fxConfig(fx)

  switch (scene) {
    case "portal":
      return <PortalScene cfg={cfg} />
    case "elegance":
      return <EleganceScene cfg={cfg} />
    case "nebula":
      return <NebulaScene cfg={cfg} />
    case "pulse":
      return <PulseScene cfg={cfg} />
    default:
      return <PortalScene cfg={cfg} />
  }
}

export function Intro3DCanvasRoot({
  scene,
  fx,
}: {
  scene: Intro3dSceneId
  fx: Intro3dFxLevel
}) {
  return (
    <Canvas
      className="h-full w-full touch-none"
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
        stencil: false,
      }}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.2, 8.4], fov: 40, near: 0.1, far: 120 }}
    >
      <Intro3DWorld scene={scene} fx={fx} />
    </Canvas>
  )
}
