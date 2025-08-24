import { useRef, useEffect } from "react";

export default function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // checa se o canvas existe
    const ctx = canvas.getContext("2d");
    if (!ctx) return; // checa se o contexto existe

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const gridSize = 40; // tamanho de cada quadrado

    const draw = (mouse?: { x: number; y: number }) => {
      ctx.clearRect(0, 0, width, height);

      // linhas verticais
      for (let x = 0; x <= width; x += gridSize) {
        let opacity = 0.2;
        if (mouse && Math.abs(mouse.x - x) < 100) opacity = 0.8;

        ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // linhas horizontais
      for (let y = 0; y <= height; y += gridSize) {
        let opacity = 0.2;
        if (mouse && Math.abs(mouse.y - y) < 100) opacity = 0.8;

        ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
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
    draw();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ backgroundColor: "black" }} />;
}
