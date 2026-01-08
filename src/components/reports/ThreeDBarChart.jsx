import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ThreeDBarChart Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-full w-full items-center justify-center bg-slate-900 text-slate-400 p-6 rounded-xl">
                    <div className="text-center">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                        <p>Unable to load 3D visualization.</p>
                        <p className="text-xs mt-1 opacity-70">Check console for WebGL details.</p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

function ChartScene({ data, colorStart, colorEnd }) {
    const mountRef = useRef(null);
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, label: '', value: '' });

    useEffect(() => {
        if (!data || data.length === 0 || !mountRef.current) return;

        // Cleanup previous scene if any (though useEffect should handle this)
        while (mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }

        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;

        // 1. Scene
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0f172a);
        scene.fog = new THREE.FogExp2(0x0f172a, 0.03);

        // 2. Camera
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 8, 14);

        // 3. Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio); // Sharper rendering on Retina
        renderer.shadowMap.enabled = true;
        mountRef.current.appendChild(renderer.domElement);

        // 4. Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 1);
        spotLight.position.set(5, 15, 5);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.5;
        spotLight.castShadow = true;
        scene.add(spotLight);

        // 5. Floor
        const planeGeometry = new THREE.PlaneGeometry(50, 50);
        const planeMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1e293b,
            metalness: 0.5,
            roughness: 0.1,
            clearcoat: 0.5
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.01;
        plane.receiveShadow = true;
        scene.add(plane);

        const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b);
        scene.add(gridHelper);

        // 6. Bars
        const bars = [];
        const barWidth = 1.0;
        const gap = 0.5;
        const totalWidth = data.length * (barWidth + gap);
        const offset = -totalWidth / 2 + (barWidth + gap) / 2;

        const dummyRef = new THREE.Object3D();
        // Using InstancedMesh might be overkill for 7 bars, but separate meshes is fine.

        data.forEach((item, index) => {
            const geometry = new THREE.BoxGeometry(barWidth, item.value, barWidth);
            geometry.translate(0, item.value / 2, 0); // Pivot at bottom

            const material = new THREE.MeshPhysicalMaterial({
                color: new THREE.Color(colorStart).lerp(new THREE.Color(colorEnd), index / data.length),
                metalness: 0.3,
                roughness: 0.2,
                transmission: 0.2,
                opacity: 0.9,
                transparent: true
            });

            const bar = new THREE.Mesh(geometry, material);
            bar.position.x = offset + index * (barWidth + gap);
            bar.castShadow = true;
            bar.receiveShadow = true;

            bar.userData = { id: index, label: item.label, value: item.value, originalColor: material.color.clone() };

            scene.add(bar);
            bars.push(bar);

            // Animation
            bar.scale.y = 0;
            gsap.to(bar.scale, {
                y: 1,
                duration: 1.2,
                ease: "elastic.out(1, 0.6)",
                delay: index * 0.1
            });
        });

        // 7. Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2.1;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;

        // Interaction
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        let hoveredBar = null;

        const onMouseMove = (event) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY }));
        };

        const canvas = renderer.domElement;
        canvas.addEventListener('mousemove', onMouseMove);

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(bars);

            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (hoveredBar !== object) {
                    if (hoveredBar) {
                        gsap.to(hoveredBar.scale, { x: 1, z: 1, duration: 0.2 });
                        hoveredBar.material.emissive.setHex(0x000000);
                    }
                    hoveredBar = object;
                    controls.autoRotate = false;
                    gsap.to(hoveredBar.scale, { x: 1.1, z: 1.1, duration: 0.2 });
                    hoveredBar.material.emissive.setHex(0x333333);
                    setTooltip({
                        visible: true,
                        x: tooltip.x, y: tooltip.y,
                        label: object.userData.label,
                        value: object.userData.value
                    });
                }
            } else {
                if (hoveredBar) {
                    gsap.to(hoveredBar.scale, { x: 1, z: 1, duration: 0.2 });
                    hoveredBar.material.emissive.setHex(0x000000);
                    hoveredBar = null;
                    controls.autoRotate = true;
                    setTooltip(prev => ({ ...prev, visible: false }));
                }
            }

            renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
            if (!mountRef.current) return;
            const w = mountRef.current.clientWidth;
            const h = mountRef.current.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && mountRef.current.contains(renderer.domElement)) {
                mountRef.current.removeChild(renderer.domElement);
            }
            controls.dispose();
            renderer.dispose();
        };
    }, [data, colorStart, colorEnd]);

    return (
        <div className="relative w-full h-full">
            <div ref={mountRef} className="w-full h-full rounded-2xl overflow-hidden" />
            {/* Glassmorphism Tooltip - Fixed Position relative to Window, managed by state */}
            {tooltip.visible && (
                <div
                    className="fixed pointer-events-none z-[100] px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white shadow-2xl transform -translate-x-1/2 -translate-y-full mb-4"
                    style={{ left: tooltip.x, top: tooltip.y - 10 }}
                >
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-slate-300 font-bold tracking-widest uppercase">{tooltip.label}</span>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-cyan-200">
                            {tooltip.value}B
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ThreeDBarChart(props) {
    return (
        <ErrorBoundary>
            <Card className="relative border-0 shadow-2xl shadow-slate-900/50 bg-slate-900 h-full w-full rounded-3xl overflow-hidden">
                <ChartScene {...props} />
                {/* Overlay Title */}
                <div className="absolute top-6 left-8 pointer-events-none">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <h3 className="text-white font-bold text-xl tracking-tight">Revenue Projection</h3>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Interactive 3D Forecast Model</p>
                </div>
            </Card>
        </ErrorBoundary>
    );
}
