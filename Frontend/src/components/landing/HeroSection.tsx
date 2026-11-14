import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Spline from '@splinetool/react-spline';
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


const ease = [0.22, 1, 0.36, 1] as const;

const heroTimeline = {
  badge: { initial: { opacity: 0, y: -20, scale: 0.8 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.6, ease } },
  headlineTop: { initial: { opacity: 0, y: 40, skewY: 2 }, animate: { opacity: 1, y: 0, skewY: 0 }, transition: { duration: 0.8, delay: 0.15, ease } },
  headlineBottom: { initial: { opacity: 0, y: 40, skewY: 2 }, animate: { opacity: 1, y: 0, skewY: 0 }, transition: { duration: 0.8, delay: 0.3, ease } },
  subtext: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay: 0.5, ease: "easeOut" as const } },
  ctas: { initial: { opacity: 0, y: 20, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.6, delay: 0.7, ease } },
  proof: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1, delay: 1.0 } },
};

const HeroSection = () => {
  const { user } = useAuth();
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const splineAppRef = useRef<any>(null);

  // Position tracking using refs to avoid re-renders on mousemove
  const targetPos = useRef<{ x: number; y: number } | null>(null);
  const currentPos = useRef<{ x: number; y: number } | null>(null);
  const isHovering = useRef(false);
  const animFrameId = useRef<number | null>(null);

  const handleSplineLoad = useCallback((app: any) => {
    splineAppRef.current = app;
    if (app?.canvas) {
      canvasRef.current = app.canvas;
    } else if (containerRef.current) {
      canvasRef.current = containerRef.current.querySelector("canvas");
    }
  }, []);

  useEffect(() => {
    // Respect reduced-motion preferences & detect touch devices
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    if (prefersReducedMotion || isTouchDevice) {
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    const getCanvasElement = (): HTMLCanvasElement | null => {
      if (canvasRef.current) return canvasRef.current;
      if (splineAppRef.current?.canvas) {
        canvasRef.current = splineAppRef.current.canvas;
        return canvasRef.current;
      }
      if (containerRef.current) {
        canvasRef.current = containerRef.current.querySelector("canvas");
        return canvasRef.current;
      }
      return null;
    };

    // Smooth animation loop using linear interpolation (lerp)
    const updateEyeMovement = () => {
      const canvas = getCanvasElement();
      if (!canvas || !targetPos.current) {
        animFrameId.current = null;
        return;
      }

      if (!currentPos.current) {
        currentPos.current = { ...targetPos.current };
      }

      const lerpSpeed = 0.12; // Smooth buttery spring interpolation
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * lerpSpeed;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * lerpSpeed;

      const rect = canvas.getBoundingClientRect();
      const botCenterX = rect.left + rect.width / 2;
      const botCenterY = rect.top + rect.height * 0.45;

      const curX = currentPos.current.x;
      const curY = currentPos.current.y;

      // Dispatch synthetic pointermove to Spline canvas
      const pointerEvent = new PointerEvent("pointermove", {
        clientX: curX,
        clientY: curY,
        pageX: curX + window.scrollX,
        pageY: curY + window.scrollY,
        bubbles: true,
        cancelable: true,
        pointerType: "mouse",
        isPrimary: true,
      });
      canvas.dispatchEvent(pointerEvent);
      splineAppRef.current?.requestRender?.();

      // If cursor left hero section and eyes returned close to center, settle and stop loop
      if (!isHovering.current) {
        const distToCenter = Math.hypot(curX - botCenterX, curY - botCenterY);
        if (distToCenter < 0.8) {
          currentPos.current = { x: botCenterX, y: botCenterY };
          const centerEvent = new PointerEvent("pointermove", {
            clientX: botCenterX,
            clientY: botCenterY,
            pageX: botCenterX + window.scrollX,
            pageY: botCenterY + window.scrollY,
            bubbles: true,
            cancelable: true,
            pointerType: "mouse",
          });
          canvas.dispatchEvent(centerEvent);
          canvas.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
          splineAppRef.current?.requestRender?.();
          animFrameId.current = null;
          return;
        }
      }

      animFrameId.current = requestAnimationFrame(updateEyeMovement);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;

      const canvas = getCanvasElement();
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const botCenterX = rect.left + rect.width / 2;
      const botCenterY = rect.top + rect.height * 0.45;

      // Relative delta from bot position
      const deltaX = e.clientX - botCenterX;
      const deltaY = e.clientY - botCenterY;

      // Normalize relative to bot dimensions
      const maxRadius = Math.min(rect.width, rect.height) * 0.55;
      const normX = deltaX / (maxRadius || 1);
      const normY = deltaY / (maxRadius || 1);

      // Clamp pupil displacement within natural eye boundaries
      const maxOffset = 0.85;
      const dist = Math.hypot(normX, normY);
      let clampedNormX = normX;
      let clampedNormY = normY;
      if (dist > maxOffset) {
        clampedNormX = (normX / dist) * maxOffset;
        clampedNormY = (normY / dist) * maxOffset;
      }

      // Map clamped coordinates back to canvas target coordinates
      const targetX = botCenterX + clampedNormX * (rect.width * 0.38);
      const targetY = botCenterY + clampedNormY * (rect.height * 0.38);

      if (!isHovering.current) {
        isHovering.current = true;
        canvas.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
      }

      targetPos.current = { x: targetX, y: targetY };

      if (!animFrameId.current) {
        animFrameId.current = requestAnimationFrame(updateEyeMovement);
      }
    };

    const handlePointerLeave = () => {
      const canvas = getCanvasElement();
      if (!canvas) return;

      isHovering.current = false;
      const rect = canvas.getBoundingClientRect();
      const botCenterX = rect.left + rect.width / 2;
      const botCenterY = rect.top + rect.height * 0.45;

      // Smoothly return to neutral forward-facing position
      targetPos.current = { x: botCenterX, y: botCenterY };

      if (!animFrameId.current) {
        animFrameId.current = requestAnimationFrame(updateEyeMovement);
      }
    };

    section.addEventListener("pointermove", handlePointerMove, { passive: true });
    section.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    return () => {
      section.removeEventListener("pointermove", handlePointerMove);
      section.removeEventListener("pointerleave", handlePointerLeave);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, []);
  
  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center section-padding overflow-hidden">
      {/* Animated background glows */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse-glow pointer-events-none"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] animate-pulse-glow pointer-events-none"
        style={{ animationDelay: "1.5s" }}
      />

      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-primary/30 pointer-events-none"
          style={{
            left: `${15 + i * 18}%`,
            top: `${20 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5,
          }}
        />
      ))}

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Column: Text content */}
          <div className="flex-1 text-center lg:text-left text-balance">
            {/* Badge */}
            <motion.div
              {...heroTimeline.badge}
              className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8 text-sm text-muted-foreground"
            >
              <motion.span
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              AI-Powered Interview Practice
            </motion.div>

            {/* Headline with split animation */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1] mb-6 overflow-hidden">
              <motion.span {...heroTimeline.headlineTop} className="block">
                Ace your next
              </motion.span>
              <motion.span {...heroTimeline.headlineBottom} className="block text-gradient-primary">
                tech interview
              </motion.span>
            </h1>

            {/* Subtext */}
            <motion.p
              {...heroTimeline.subtext}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed"
            >
              Practice with AI interviewers that adapt to your skill level.
              Get instant, actionable feedback on coding, system design, and behavioral questions.
            </motion.p>

            {/* CTAs with hover animations */}
            <motion.div {...heroTimeline.ctas} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link to="/interview">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="hero" size="lg" className="text-base px-8 py-6">
                    Get Started (Free Trial)
                    <motion.span
                      className="inline-block ml-1"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>

            {/* Social proof with count-up feel */}
            <motion.p
              {...heroTimeline.proof}
              className="mt-10 text-sm text-muted-foreground"
            >
              Trusted by <span className="text-foreground font-medium">12,000+</span> engineers at top tech companies
            </motion.p>
          </div>

          {/* Right Column: Spline 3D Component with safe non-blocking pointer events */}
          <div ref={containerRef} className="flex-1 w-full h-[350px] sm:h-[480px] lg:h-[650px] relative pointer-events-none select-none overflow-hidden touch-pan-y">
            <div className="w-full h-full pointer-events-none [&_canvas]:pointer-events-none [&_canvas]:touch-pan-y">
              <Spline
                scene="https://prod.spline.design/fT6u-SNGjIccSXRI/scene.splinecode" 
                onLoad={handleSplineLoad}
              />
            </div>
            {/* Small black box overlay at the bottom right */}
            <div className="absolute bottom-2 right-2 w-[150px] h-[50px] bg-black z-50 rounded-sm pointer-events-none"></div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
