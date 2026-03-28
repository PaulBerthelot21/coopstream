"use client"

import * as React from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Sparkles, Stars, useGLTF } from "@react-three/drei"
import { Bloom, EffectComposer } from "@react-three/postprocessing"
import * as THREE from "three"

export type IntroCsFxLevel = "off" | "low" | "medium" | "high"

function fxConfig(fx: IntroCsFxLevel) {
  switch (fx) {
    case "off":
      return { stars: 0, sparkles: 0, dust: 0, bloom: false, bloomIntensity: 0 }
    case "low":
      return { stars: 1200, sparkles: 20, dust: 600, bloom: true, bloomIntensity: 0.38 }
    case "high":
      return { stars: 6000, sparkles: 85, dust: 3200, bloom: true, bloomIntensity: 0.82 }
    default:
      return { stars: 3200, sparkles: 48, dust: 1800, bloom: true, bloomIntensity: 0.58 }
  }
}

function det01(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233 + 311.7) * 43758.5453123
  return x - Math.floor(x)
}

function DustField({
  count,
  color,
  size = 0.028,
  speed = 0.018,
}: {
  count: number
  color: string
  size?: number
  speed?: number
}) {
  const ref = React.useRef<THREE.Points>(null)
  const positions = React.useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const u = det01(i, 1)
      const v = det01(i, 2)
      const theta = 2 * Math.PI * u
      const phi = Math.acos(2 * v - 1)
      const r = 2.5 + det01(i, 3) * 6
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4 + 0.2
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [count])

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
        opacity={0.82}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

/** Couteau tactique bas poly — inspiration inspect CS, sans asset Valve. */
function ProceduralKnife() {
  const root = React.useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!root.current) return
    const t = state.clock.elapsedTime
    root.current.rotation.y = t * 0.22 + Math.sin(t * 0.4) * 0.35
    root.current.rotation.x = Math.sin(t * 0.55) * 0.14 + 0.08
    root.current.rotation.z = Math.sin(t * 0.33) * 0.06
    root.current.position.y = Math.sin(t * 0.9) * 0.035
    root.current.position.z = Math.sin(t * 0.25) * 0.06
  })

  return (
    <group ref={root} position={[0, 0.05, 0]}>
      <group rotation={[0, Math.PI * 0.12, 0]}>
        <mesh position={[0, 0, 0.32]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.085, 0.018, 0.52]} />
          <meshPhysicalMaterial
            color="#9ca3af"
            metalness={0.92}
            roughness={0.22}
            clearcoat={0.7}
            clearcoatRoughness={0.15}
          />
        </mesh>
        <mesh position={[0, 0.002, 0.58]} rotation={[0.08, 0, 0]}>
          <boxGeometry args={[0.072, 0.012, 0.14]} />
          <meshStandardMaterial
            color="#d1d5db"
            metalness={0.98}
            roughness={0.12}
            emissive="#e5e7eb"
            emissiveIntensity={0.08}
          />
        </mesh>
        <mesh position={[0, 0, -0.08]}>
          <boxGeometry args={[0.038, 0.032, 0.22]} />
          <meshStandardMaterial
            color="#1c1917"
            metalness={0.25}
            roughness={0.78}
            emissive="#292524"
            emissiveIntensity={0.04}
          />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <boxGeometry args={[0.11, 0.022, 0.05]} />
          <meshStandardMaterial color="#44403c" metalness={0.6} roughness={0.45} />
        </mesh>
      </group>
    </group>
  )
}

function UserGltfWeapon() {
  const { scene } = useGLTF("/models/cs-intro.glb")
  const ref = React.useRef<THREE.Group>(null)
  const cloned = React.useMemo(() => {
    const c = scene.clone(true)
    c.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(c)
    const size = new THREE.Vector3()
    box.getSize(size)
    const max = Math.max(size.x, size.y, size.z, 0.001)
    const s = 1.35 / max
    c.scale.setScalar(s)
    c.updateMatrixWorld(true)
    const box2 = new THREE.Box3().setFromObject(c)
    const center = new THREE.Vector3()
    box2.getCenter(center)
    c.position.sub(center)
    return c
  }, [scene])

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y = t * 0.2 + Math.sin(t * 0.38) * 0.4
    ref.current.rotation.x = Math.sin(t * 0.5) * 0.12 + 0.06
    ref.current.position.y = Math.sin(t * 0.85) * 0.04
  })

  return <primitive ref={ref} object={cloned} />
}

function Crates() {
  return (
    <group position={[0, -0.55, -0.8]}>
      <mesh position={[-1.1, 0.35, -0.6]} rotation={[0, 0.25, 0]}>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial color="#3d3832" metalness={0.15} roughness={0.88} />
      </mesh>
      <mesh position={[0.95, 0.28, -0.45]} rotation={[0, -0.4, 0]}>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshStandardMaterial color="#57534e" metalness={0.12} roughness={0.9} />
      </mesh>
      <mesh position={[0.15, 0.2, -1.2]} rotation={[0, 0.1, 0]}>
        <boxGeometry args={[0.7, 0.4, 0.5]} />
        <meshStandardMaterial color="#44403c" metalness={0.2} roughness={0.85} />
      </mesh>
    </group>
  )
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
      <circleGeometry args={[4.5, 48]} />
      <meshStandardMaterial
        color="#6b5c4c"
        metalness={0.05}
        roughness={0.92}
        emissive="#3d3429"
        emissiveIntensity={0.03}
      />
    </mesh>
  )
}

function PostBloom({
  enabled,
  intensity,
}: {
  enabled: boolean
  intensity: number
}) {
  if (!enabled || intensity <= 0) return null
  return (
    <EffectComposer enableNormalPass={false}>
      <Bloom
        luminanceThreshold={0.28}
        luminanceSmoothing={0.38}
        intensity={intensity}
        mipmapBlur
      />
    </EffectComposer>
  )
}

function CsWorld({
  fx,
  useCustomGlb,
}: {
  fx: IntroCsFxLevel
  useCustomGlb: boolean
}) {
  const cfg = fxConfig(fx)

  return (
    <>
      <color attach="background" args={["#120f0c"]} />
      <fog attach="fog" args={["#3d3028", 2.8, 9.5]} />

      <ambientLight intensity={0.14} color="#ffe4c4" />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.35}
        color="#ffedd5"
        castShadow={false}
      />
      <pointLight position={[-3, 1.5, 2]} intensity={28} color="#34d399" distance={8} decay={2} />
      <pointLight position={[2.5, 0.8, -1]} intensity={18} color="#fbbf24" distance={7} decay={2} />

      <Ground />
      <Crates />

      {cfg.stars > 0 ? (
        <Stars
          radius={70}
          depth={28}
          count={cfg.stars}
          factor={2.2}
          saturation={0.08}
          fade
          speed={0.12}
        />
      ) : null}

      {cfg.dust > 0 ? (
        <DustField count={cfg.dust} color="#d6c4a8" size={0.026} speed={0.016} />
      ) : null}

      {useCustomGlb ? (
        <React.Suspense fallback={null}>
          <UserGltfWeapon />
        </React.Suspense>
      ) : (
        <ProceduralKnife />
      )}

      {cfg.sparkles > 0 ? (
        <Sparkles
          count={cfg.sparkles}
          scale={5}
          size={2}
          speed={0.35}
          opacity={0.55}
          color="#fef3c7"
        />
      ) : null}

      <PostBloom enabled={cfg.bloom} intensity={cfg.bloomIntensity} />
    </>
  )
}

function CsCanvasWithGlbCheck({ fx }: { fx: IntroCsFxLevel }) {
  const [useGlb, setUseGlb] = React.useState(false)
  const [checked, setChecked] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    fetch("/models/cs-intro.glb", { method: "HEAD" })
      .then((r) => {
        if (!cancelled && r.ok) setUseGlb(true)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecked(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!checked) {
    return (
      <>
        <color attach="background" args={["#120f0c"]} />
        <ambientLight intensity={0.18} color="#ffe4c4" />
      </>
    )
  }

  return <CsWorld fx={fx} useCustomGlb={useGlb} />
}

export function IntroCsCanvas({ fx }: { fx: IntroCsFxLevel }) {
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
      camera={{ position: [0, 0.15, 2.65], fov: 42, near: 0.08, far: 80 }}
    >
      <CsCanvasWithGlbCheck fx={fx} />
    </Canvas>
  )
}
