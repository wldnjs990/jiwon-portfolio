"use client";

import { Stage, Layer, Line, Rect, Shape } from "react-konva";
import { useDrawingCanvas, DOOR_SHAPE } from "./useDrawingCanvas";
import type Konva from "konva";

interface DrawingCanvasProps {
  width: number;
  height: number;
  onExport: (dataUrl: string) => void;
  onClear: () => void;
}

// 문 모양 clip 경로 함수 (Konva clipFunc / sceneFunc 공통)
function drawDoorPath(ctx: CanvasRenderingContext2D | Konva.Context) {
  const { cx, archCy, r, bottom } = DOOR_SHAPE;
  ctx.beginPath();
  ctx.moveTo(cx - r, bottom);
  ctx.lineTo(cx - r, archCy);
  (ctx as CanvasRenderingContext2D).arc(cx, archCy, r, Math.PI, 0, false);
  ctx.lineTo(cx + r, bottom);
  ctx.closePath();
}

export default function DrawingCanvas({
  width,
  height,
  onExport,
  onClear,
}: DrawingCanvasProps) {
  const {
    stageRef,
    drawingLayerRef,
    lines,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    clearCanvas,
    exportImage,
  } = useDrawingCanvas();

  const handleClear = () => {
    clearCanvas();
    onClear();
  };

  const handleComplete = () => {
    const url = exportImage();
    if (url) onExport(url);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 캔버스 영역 */}
      <div
        className="rounded-2xl overflow-hidden shadow-2xl border-2 border-white/30"
        style={{ background: "#f0f0f8", cursor: "crosshair" }}
      >
        <Stage
          ref={stageRef}
          width={width}
          height={height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
        >
          {/* 가이드 레이어 (하단) — 문 모양 점선 가이드 */}
          <Layer listening={false}>
            <Shape
              sceneFunc={(ctx, shape) => {
                drawDoorPath(ctx as unknown as CanvasRenderingContext2D);
                (ctx as unknown as CanvasRenderingContext2D).fillStyle =
                  "rgba(200, 210, 255, 0.18)";
                (ctx as unknown as CanvasRenderingContext2D).fill();
                ctx.fillStrokeShape(shape);
              }}
              stroke="rgba(90, 110, 240, 0.55)"
              strokeWidth={2}
              dash={[8, 5]}
              fill="transparent"
            />
          </Layer>

          {/* 드로잉 레이어 — 문 모양으로 clip, export 시 바깥은 투명 */}
          <Layer
            ref={drawingLayerRef}
            clipFunc={(ctx) =>
              drawDoorPath(ctx as unknown as CanvasRenderingContext2D)
            }
          >
            {/* 흰 배경 — clip 안쪽만 채워짐 */}
            <Rect x={0} y={0} width={width} height={height} fill="white" />
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={line.width}
                tension={0.5}
                lineCap="round"
                lineJoin="round"
                globalCompositeOperation="source-over"
              />
            ))}
          </Layer>

          {/* 가이드 아웃라인 레이어 (최상단) — 드로잉 위에 경계선 표시 */}
          <Layer listening={false}>
            <Shape
              sceneFunc={(ctx, shape) => {
                drawDoorPath(ctx as unknown as CanvasRenderingContext2D);
                ctx.fillStrokeShape(shape);
              }}
              stroke="rgba(90, 110, 240, 0.4)"
              strokeWidth={1.5}
              dash={[8, 5]}
              fill="transparent"
            />
          </Layer>
        </Stage>
      </div>

      {/* 버튼 영역 */}
      <div className="flex gap-3">
        <button
          onClick={handleClear}
          className="px-5 py-2 rounded-full bg-white/20 text-white text-sm font-medium
            border border-white/30 hover:bg-white/30 active:scale-95 transition-all"
        >
          지우기
        </button>
        <button
          onClick={handleComplete}
          disabled={lines.length === 0}
          className="px-6 py-2 rounded-full bg-white text-black text-sm font-semibold
            hover:bg-white/90 active:scale-95 transition-all
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          완료
        </button>
      </div>
    </div>
  );
}
