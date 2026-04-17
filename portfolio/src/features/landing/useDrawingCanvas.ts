"use client";

import { useRef, useState } from "react";
import type { KonvaEventObject } from "konva/lib/Node";
import type Konva from "konva";

interface Line {
  points: number[];
  color: string;
  width: number;
}

// 캔버스(320×320) 기준 문 모양 clip 경로
export const DOOR_SHAPE = { cx: 160, archCy: 150, r: 90, bottom: 300 };

export function useDrawingCanvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const drawingLayerRef = useRef<Konva.Layer>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [currentColor] = useState("#1a1a1a");
  const [currentWidth] = useState(3);
  const isDrawing = useRef(false);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    isDrawing.current = true;
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;
    setLines((prev) => [
      ...prev,
      { points: [pos.x, pos.y], color: currentColor, width: currentWidth },
    ]);
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;
    setLines((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (!last) return prev;
      updated[updated.length - 1] = {
        ...last,
        points: [...last.points, pos.x, pos.y],
      };
      return updated;
    });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => setLines([]);

  const exportImage = (): string | null => {
    if (!drawingLayerRef.current) return null;
    // 전체 Stage 대신 드로잉 레이어만 export → clip 범위 밖 = 투명
    return drawingLayerRef.current.toDataURL({ pixelRatio: 2 });
  };

  return {
    stageRef,
    drawingLayerRef,
    lines,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    clearCanvas,
    exportImage,
  };
}
