import { useEffect, useRef } from "react";

interface SignalFieldProps {
  /** Zusätzliche Klassen für das <canvas> (Positionierung/Größe wird vom Aufrufer bestimmt). */
  className?: string;
  /**
   * Multiplikator für die Knotenzahl relativ zur Flächenbasis, z.B. 0.6 = ruhiger/dünner
   * (Solo), 1 = Standard, 1.3 = dichter/lebendiger (Enterprise). Default 1.
   */
  density?: number;
  /**
   * Multiplikator für Linien-/Knoten-Helligkeit und Puls-Amplitude. Default 1.
   */
  intensity?: number;
  /**
   * Farbe der seltenen "Signal feuert"-Pulse. Entweder ein CSS-Custom-Property-Name
   * (z.B. "--solo-accent", wird zur Laufzeit über getComputedStyle aufgelöst, damit die
   * Signal-Field-Farbe automatisch mit dem Design-System synchron bleibt) oder ein
   * roher HSL-Triplet-String ("38 80% 58%"). Default: "--accent" (Signal-Lime).
   */
  accentColor?: string;
  /**
   * Farbe der Basis-Knoten/-Linien. Gleiche Konvention wie accentColor.
   * Default: "--primary" (Elektro-Blau).
   */
  baseColor?: string;
}

interface FieldNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  pulsePhase: number;
  pulseSpeed: number;
  isAccent: boolean;
}

/**
 * Resolves a color prop: "--custom-property" wird zur Laufzeit gegen die aktuellen
 * CSS-Custom-Properties aufgelöst (Single Source of Truth bleibt index.css), ein roher
 * HSL-Triplet-String wird unverändert durchgereicht. Canvas-2D kann var(--x) nicht selbst
 * auflösen, deshalb passiert das hier explizit per getComputedStyle.
 */
function resolveHslTriplet(source: string, fallback: string): string {
  if (source.startsWith("--")) {
    const resolved = getComputedStyle(document.documentElement).getPropertyValue(source).trim();
    return resolved || fallback;
  }
  return source;
}

/**
 * "Signal Field": ein echtes, code-getriebenes Canvas-2D-Knotenfeld (keine CSS-Deko-Grids,
 * keine Gradient-Blobs). Dünne Linien zwischen nahen Knoten leuchten pulsierend (Nachahmung
 * neuronaler Aktivierung/Datenfluss), Knoten in Cursor-Nähe werden heller und leicht
 * angezogen. Primary-Knoten/-Linien als Basis, gelegentliche Accent-Pulse als "Signal
 * feuert"-Moment. Wiederverwendbar über density/intensity/accentColor/baseColor, damit sich
 * Solo (ruhiger/dünner), Enterprise (dichter/lebendiger) und die Startseite unterschiedlich
 * einstellen lassen.
 *
 * Barrierefreiheit/Performance: bei prefers-reduced-motion friert das Feld auf einen
 * statischen, weiterhin ansprechenden Snapshot ein (kein hartes Ausblenden). Auf schmalen
 * Viewports (<=640px) und bei hohem devicePixelRatio wird die Knotenzahl reduziert. Die
 * rAF-Loop pausiert automatisch, wenn das Canvas nicht sichtbar ist (IntersectionObserver).
 * Reines Hintergrund-Layer: pointer-events-none, aria-hidden, Text bleibt davon unabhängig
 * lesbar.
 */
export function SignalField({ className = "", density = 1, intensity = 1, accentColor, baseColor }: SignalFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const smallScreenQuery = window.matchMedia("(max-width: 640px)");

    const baseTriplet = resolveHslTriplet(baseColor ?? "--primary", "245 85% 62%");
    const accentTriplet = resolveHslTriplet(accentColor ?? "--accent", "85 70% 55%");
    const baseColorFor = (alpha: number) => `hsl(${baseTriplet} / ${alpha})`;
    const accentColorFor = (alpha: number) => `hsl(${accentTriplet} / ${alpha})`;

    let width = 0;
    let height = 0;
    let nodes: FieldNode[] = [];
    let rafId = 0;
    let isVisible = true;
    let running = false;
    const mouse = { x: -9999, y: -9999 };

    function buildNodes() {
      const isSmall = smallScreenQuery.matches;
      const dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 2);
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const areaBaseline = isSmall ? 0.00007 : 0.00012;
      const count = Math.max(8, Math.round(width * height * areaBaseline * density));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.14,
        vy: (Math.random() - 0.5) * 0.14,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.006 + Math.random() * 0.01,
        isAccent: Math.random() < 0.09,
      }));
    }

    function resize() {
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      buildNodes();
      if (reduceMotionQuery.matches) {
        drawFrame(false);
      }
    }

    function drawFrame(advance: boolean) {
      ctx.clearRect(0, 0, width, height);
      const maxDist = Math.min(width, height) * 0.18;

      if (advance) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > width) n.vx *= -1;
          if (n.y < 0 || n.y > height) n.vy *= -1;
          n.pulsePhase += n.pulseSpeed;

          const distToMouse = Math.hypot(n.x - mouse.x, n.y - mouse.y);
          if (distToMouse < 140) {
            n.x += (mouse.x - n.x) * 0.0025;
            n.y += (mouse.y - n.y) * 0.0025;
          }
        }
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            // Quadratic ease-out falloff (statt linear) haelt Verbindungen ueber einen
            // groesseren Teil der maxDist-Reichweite sichtbar - mit rein linearem Falloff
            // wirkte das Feld bei normaler Bildschirmhelligkeit fast unsichtbar, weil die
            // meisten zufaelligen Knotenpaare naeher an maxDist als an 0 liegen.
            const alpha = Math.pow(1 - dist / maxDist, 0.6) * 0.7 * intensity;
            ctx.strokeStyle = baseColorFor(alpha);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        const distToMouse = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        const proximity = Math.max(0, 1 - distToMouse / 140);
        const pulse = advance ? Math.sin(n.pulsePhase) * 0.3 + 0.7 : 0.75;
        const baseAlpha = (n.isAccent ? 1 : 0.85) * intensity * pulse;
        const alpha = Math.min(1, baseAlpha + proximity * 0.45);
        const radius = (n.isAccent ? 2.4 : 1.7) + proximity * 1.4;
        ctx.fillStyle = n.isAccent ? accentColorFor(alpha) : baseColorFor(alpha);
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop() {
      if (!running) return;
      drawFrame(true);
      rafId = requestAnimationFrame(loop);
    }

    function startLoop() {
      if (running || reduceMotionQuery.matches) return;
      running = true;
      rafId = requestAnimationFrame(loop);
    }

    function stopLoop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
    }

    function handlePointerMove(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }

    function handlePointerLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    function handleReduceMotionChange() {
      if (reduceMotionQuery.matches) {
        stopLoop();
        drawFrame(false);
      } else {
        startLoop();
      }
    }

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(parent);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
        if (isVisible) startLoop();
        else stopLoop();
      },
      { threshold: 0.01 }
    );
    intersectionObserver.observe(canvas);

    resize();
    if (reduceMotionQuery.matches) {
      drawFrame(false);
    } else if (isVisible) {
      startLoop();
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);
    reduceMotionQuery.addEventListener("change", handleReduceMotionChange);
    smallScreenQuery.addEventListener("change", resize);

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
      reduceMotionQuery.removeEventListener("change", handleReduceMotionChange);
      smallScreenQuery.removeEventListener("change", resize);
    };
  }, [density, intensity, accentColor, baseColor]);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none block h-full w-full ${className}`} />;
}
