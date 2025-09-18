import { useRef, useEffect } from "react";

export default function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const gridSize = 40; // tamanho de cada quadrado
    const fadeRadius = 150; // raio do “halo” ao redor do mou

    const draw = (mouse?: { x: number; y: number }) => {
      ctx.clearRect(0, 0, width, height);

      for (let x = 0; x <= width; x += gridSize) {
        for (let y = 0; y <= height; y += gridSize) {
          let opacity = 0;
          
          
          if (mouse) {
            const rect = canvas.getBoundingClientRect();
            const mouseX = mouse.x - rect.left;
            const mouseY = mouse.y - rect.top;

            const dx = mouseX - (x + gridSize / 2);
            const dy = mouseY - (y + gridSize / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < fadeRadius) {
              opacity = 0.8 * (1 - distance / fadeRadius); // centralizado no meio do mouse
            }
          }

          ctx.strokeStyle = `rgba(175, 255, 130,${opacity})`;
          ctx.beginPath();
          ctx.rect(x, y, gridSize, gridSize);
          ctx.stroke();
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      draw({ x: e.clientX, y: e.clientY });
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      draw();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    draw(); // desenha inicialmente

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ backgroundColor: "black"}} />;
}
