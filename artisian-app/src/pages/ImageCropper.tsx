// frontend/src/pages/ImageCropper.tsx
import { useState, useRef, useEffect } from "react";

const C = {
  orange: "#D85A30", white: "#ffffff",
  gray200: "#E7E5E4", gray400: "#A8A29E", gray700: "#44403C",
};

interface Props {
  imageSrc: string;
  onCropDone: (croppedFile: File) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<Props> = ({ imageSrc, onCropDone, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const SIZE = 380;

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      drawCanvas(img, scale, offsetX, offsetY);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const drawCanvas = (img: HTMLImageElement, sc: number, ox: number, oy: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, SIZE, SIZE);
    const w = img.width * sc;
    const h = img.height * sc;
    ctx.drawImage(img, SIZE / 2 - w / 2 + ox, SIZE / 2 - h / 2 + oy, w, h);
    // Darken outside the frame
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, SIZE, SIZE * 0.1);
    ctx.fillRect(0, SIZE * 0.9, SIZE, SIZE * 0.1);
    ctx.fillRect(0, SIZE * 0.1, SIZE * 0.1, SIZE * 0.8);
    ctx.fillRect(SIZE * 0.9, SIZE * 0.1, SIZE * 0.1, SIZE * 0.8);
    // Draw frame border
    ctx.strokeStyle = "rgba(255,255,255,0.8)";
    ctx.lineWidth = 2;
    ctx.strokeRect(SIZE * 0.1, SIZE * 0.1, SIZE * 0.8, SIZE * 0.8);
   
  };

  const handleScale = (newScale: number) => {
    setScale(newScale);
    if (imgRef.current) drawCanvas(imgRef.current, newScale, offsetX, offsetY);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    const newOx = offsetX + dx;
    const newOy = offsetY + dy;
    setOffsetX(newOx);
    setOffsetY(newOy);
    setLastPos({ x: e.clientX, y: e.clientY });
    if (imgRef.current) drawCanvas(imgRef.current, scale, newOx, newOy);
  };

  const handleMouseUp = () => setDragging(false);

  const handleDone = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current) return;
    // Crop the inner square area
    const cropX = SIZE * 0.1;
    const cropY = SIZE * 0.1;
    const cropSize = SIZE * 0.8;
    const outCanvas = document.createElement("canvas");
    outCanvas.width = cropSize;
    outCanvas.height = cropSize;
    const ctx = outCanvas.getContext("2d")!;
    ctx.drawImage(canvas, cropX, cropY, cropSize, cropSize, 0, 0, cropSize, cropSize);
    outCanvas.toBlob((blob) => {
      if (blob) onCropDone(new File([blob], "cropped.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.9);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: C.white, borderRadius: 16, overflow: "hidden", width: 420, maxWidth: "95vw" }}>
        <div style={{ background: C.orange, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: C.white, fontWeight: 700, fontSize: 15 }}>✂ Crop Image</span>
          <button onClick={onCancel} style={{ background: "transparent", border: "none", color: C.white, cursor: "pointer", fontSize: 20 }}>✕</button>
        </div>
        <div style={{ padding: "8px 20px", background: "#f0f0f0", textAlign: "center", fontSize: 12, color: C.gray400 }}>
          🖱 Drag to move the image • Use slider to zoom
        </div>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          style={{ display: "block", width: "100%", cursor: dragging ? "grabbing" : "grab" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <div style={{ padding: "14px 20px", background: "#f9f9f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: C.gray700 }}>🔍 Zoom</span>
            <input
              type="range" min={0.5} max={3} step={0.05} value={scale}
              onChange={(e) => handleScale(Number(e.target.value))}
              style={{ flex: 1, accentColor: C.orange }}
            />
            <span style={{ fontSize: 12, color: C.gray700 }}>{scale.toFixed(1)}x</span>
          </div>
        </div>
        <div style={{ padding: "12px 20px", display: "flex", gap: 10, borderTop: `1px solid ${C.gray200}` }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", border: `2px solid ${C.orange}`, borderRadius: 8, background: C.white, color: C.orange, fontWeight: 700, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleDone} style={{ flex: 1, padding: "10px 0", border: "none", borderRadius: 8, background: C.orange, color: C.white, fontWeight: 700, cursor: "pointer" }}>✓ Use this image</button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;