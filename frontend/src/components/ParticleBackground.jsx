import { useEffect, useRef } from "react";

const ParticleBackground = ({ color = "139,92,246", particleCount = 80, connectionDistance = 150, speed = 0.5 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const bubblesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create main particles
    const createParticles = () => {
      const particles = [];
      const count = Math.min(particleCount, Math.floor((canvas.width * canvas.height) / 10000));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          radius: Math.random() * 3 + 1,
          baseOpacity: Math.random() * 0.5 + 0.2,
          pulsePhase: Math.random() * Math.PI * 2,
          hue: Math.random() * 30 - 15, // Color variation
        });
      }
      return particles;
    };

    // Create floating bubbles
    const createBubbles = () => {
      const bubbles = [];
      for (let i = 0; i < 15; i++) {
        bubbles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 200,
          radius: Math.random() * 40 + 20,
          speed: Math.random() * 0.8 + 0.3,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: Math.random() * 0.02 + 0.01,
          opacity: Math.random() * 0.08 + 0.02,
        });
      }
      return bubbles;
    };

    particlesRef.current = createParticles();
    bubblesRef.current = createBubbles();

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;
      const bubbles = bubblesRef.current;
      const time = Date.now() * 0.001;

      // Draw floating bubbles
      for (let bubble of bubbles) {
        bubble.y -= bubble.speed;
        bubble.wobble += bubble.wobbleSpeed;
        bubble.x += Math.sin(bubble.wobble) * 0.5;

        // Reset bubble when it goes off screen
        if (bubble.y + bubble.radius < 0) {
          bubble.y = canvas.height + bubble.radius;
          bubble.x = Math.random() * canvas.width;
        }

        // Draw bubble with gradient
        const gradient = ctx.createRadialGradient(
          bubble.x - bubble.radius * 0.3, bubble.y - bubble.radius * 0.3, 0,
          bubble.x, bubble.y, bubble.radius
        );
        gradient.addColorStop(0, `rgba(${color}, ${bubble.opacity * 2})`);
        gradient.addColorStop(0.5, `rgba(${color}, ${bubble.opacity})`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);
        
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Bubble highlight
        ctx.beginPath();
        ctx.arc(bubble.x - bubble.radius * 0.3, bubble.y - bubble.radius * 0.3, bubble.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${bubble.opacity * 0.5})`;
        ctx.fill();
      }

      // Draw particles with enhanced effects
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        p.x = Math.max(0, Math.min(canvas.width, p.x));
        p.y = Math.max(0, Math.min(canvas.height, p.y));

        const pulse = Math.sin(time * 2 + p.pulsePhase) * 0.4 + 0.6;
        const finalOpacity = p.baseOpacity * pulse;

        // Mouse interaction with attraction/repulsion
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let mouseGlow = 0;
        if (dist < 250) {
          const force = (250 - dist) / 250;
          // Repel particles from mouse
          p.vx -= (dx / dist) * force * 0.1;
          p.vy -= (dy / dist) * force * 0.1;
          mouseGlow = force * 0.6;
        }

        // Speed damping
        p.vx *= 0.995;
        p.vy *= 0.995;

        // Ensure minimum movement
        const currentSpeed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (currentSpeed < speed * 0.3) {
          p.vx += (Math.random() - 0.5) * 0.1;
          p.vy += (Math.random() - 0.5) * 0.1;
        }

        // Enhanced glow effect
        if (mouseGlow > 0.1) {
          const glowGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 6);
          glowGradient.addColorStop(0, `rgba(${color},${mouseGlow * 0.3})`);
          glowGradient.addColorStop(1, `rgba(${color},0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 6, 0, Math.PI * 2);
          ctx.fillStyle = glowGradient;
          ctx.fill();
        }

        // Draw particle with inner glow
        const particleGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
        particleGradient.addColorStop(0, `rgba(${color},${finalOpacity + mouseGlow})`);
        particleGradient.addColorStop(0.5, `rgba(${color},${(finalOpacity + mouseGlow) * 0.5})`);
        particleGradient.addColorStop(1, `rgba(${color},0)`);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
        ctx.fillStyle = particleGradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${finalOpacity * 0.8})`;
        ctx.fill();

        // Draw mesh connections with gradient
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist < connectionDistance) {
            const lineOpacity = (1 - cdist / connectionDistance) * 0.3;
            const lineGradient = ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
            lineGradient.addColorStop(0, `rgba(${color},${lineOpacity})`);
            lineGradient.addColorStop(0.5, `rgba(${color},${lineOpacity * 1.5})`);
            lineGradient.addColorStop(1, `rgba(${color},${lineOpacity})`);
            
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = lineGradient;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Mouse connections with glow
        if (dist < 250) {
          const lineOpacity = (1 - dist / 250) * 0.4;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.strokeStyle = `rgba(${color},${lineOpacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [color, particleCount, connectionDistance, speed]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default ParticleBackground;
