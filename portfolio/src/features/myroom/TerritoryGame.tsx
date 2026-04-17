'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Trophy, RotateCcw, X } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Player = 'red' | 'blue'
type TileType = 1 | 2 | 'bomb'
type GamePhase = 'playing' | 'bombing' | 'scoring' | 'result'

interface Cell {
  owner: Player | null
  tileType: TileType | null
  attackProgress: number // clicks received from opponent
  installOrder: number  // global placement order (for bomb sequencing)
}

interface Inventory {
  one: number
  two: number
  bomb: number
}

interface Scores {
  red: number
  blue: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const GRID_SIZE = 5
const INITIAL_INVENTORY: Inventory = { one: 10, two: 5, bomb: 1 }
const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]] as const

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

function createEmptyGrid(): Cell[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => ({
      owner: null, tileType: null, attackProgress: 0, installOrder: 0,
    }))
  )
}

function inventoryKey(t: TileType): keyof Inventory {
  return t === 1 ? 'one' : t === 2 ? 'two' : 'bomb'
}

function attacksRequired(t: TileType): number {
  return t === 1 ? 1 : t === 2 ? 2 : 3
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function TerritoryGame() {
  const [grid, setGrid]               = useState<Cell[][]>(createEmptyGrid)
  const [displayGrid, setDisplayGrid] = useState<Cell[][]>(createEmptyGrid)
  const [phase, setPhase]             = useState<GamePhase>('playing')
  const [currentPlayer, setCurrentPlayer] = useState<Player>('red')
  const [selectedTile, setSelectedTile]   = useState<TileType>(1)
  const [installCounter, setInstallCounter] = useState(0)
  const [inventory, setInventory] = useState<{ red: Inventory; blue: Inventory }>({
    red: { ...INITIAL_INVENTORY },
    blue: { ...INITIAL_INVENTORY },
  })
  const [scores, setScores] = useState<Scores>({ red: 0, blue: 0 })

  // animation state
  const [highlightedBomb, setHighlightedBomb]   = useState<string | null>(null)
  const [explodingCells, setExplodingCells]     = useState<Set<string>>(new Set())
  const [scoringCell, setScoringCell]           = useState<string | null>(null)
  const [bombPhaseMsg, setBombPhaseMsg]         = useState('')

  // keep displayGrid in sync while playing
  useEffect(() => {
    if (phase === 'playing') setDisplayGrid(grid)
  }, [grid, phase])

  // ── Keyboard: 1/2/3 selects tile ──────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== 'playing') return
      if (e.key === '1') setSelectedTile(1)
      else if (e.key === '2') setSelectedTile(2)
      else if (e.key === '3') setSelectedTile('bomb')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  // ── Cell click handler ─────────────────────────────────────────────────────
  const handleCellClick = useCallback((row: number, col: number) => {
    if (phase !== 'playing') return
    const cell = grid[row][col]

    if (cell.owner === null) {
      // Place tile on empty cell
      const key = inventoryKey(selectedTile)
      if (inventory[currentPlayer][key] <= 0) return

      const next = grid.map(r => r.map(c => ({ ...c })))
      next[row][col] = { owner: currentPlayer, tileType: selectedTile, attackProgress: 0, installOrder: installCounter }
      setGrid(next)
      setInstallCounter(n => n + 1)
      setInventory(prev => ({
        ...prev,
        [currentPlayer]: { ...prev[currentPlayer], [key]: prev[currentPlayer][key] - 1 },
      }))
    } else if (cell.owner !== currentPlayer && cell.tileType !== null) {
      // Attack opponent's tile
      const needed = attacksRequired(cell.tileType)
      const newProg = cell.attackProgress + 1
      const next = grid.map(r => r.map(c => ({ ...c })))

      if (newProg >= needed) {
        // Tile destroyed → return to original owner
        const returnKey = inventoryKey(cell.tileType)
        const originalOwner = cell.owner
        next[row][col] = { owner: null, tileType: null, attackProgress: 0, installOrder: 0 }
        setInventory(prev => ({
          ...prev,
          [originalOwner]: { ...prev[originalOwner], [returnKey]: prev[originalOwner][returnKey] + 1 },
        }))
      } else {
        next[row][col] = { ...cell, attackProgress: newProg }
      }
      setGrid(next)
    }
    // Own tile: no action (낙장불입)
  }, [phase, grid, currentPlayer, selectedTile, inventory, installCounter])

  // ── End game → bomb animations → scoring → result ─────────────────────────
  const handleEndGame = useCallback(() => {
    const snapshot = grid.map(r => r.map(c => ({ ...c })))
    setPhase('bombing')

    // fire-and-forget async animation chain
    ;(async () => {
      // ── Phase 1: Bombs ──────────────────────────────────────────────────
      const bombs: { r: number; c: number; owner: Player; order: number }[] = []
      snapshot.forEach((row, r) => row.forEach((cell, c) => {
        if (cell.tileType === 'bomb' && cell.owner !== null)
          bombs.push({ r, c, owner: cell.owner, order: cell.installOrder })
      }))
      bombs.sort((a, b) => a.order - b.order)

      const g = snapshot.map(r => r.map(c => ({ ...c })))

      if (bombs.length === 0) {
        setBombPhaseMsg('💣 폭탄 없음! 바로 집계합니다...')
        await delay(800)
      }

      for (const bomb of bombs) {
        setBombPhaseMsg(`💥 (${bomb.r},${bomb.c}) 폭탄 폭발!`)
        setHighlightedBomb(`${bomb.r}-${bomb.c}`)
        await delay(600)

        // Find opponent tiles in 8 directions
        const affected: string[] = []
        for (const [dr, dc] of DIRS) {
          const nr = bomb.r + dr; const nc = bomb.c + dc
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            if (g[nr][nc].owner !== null && g[nr][nc].owner !== bomb.owner)
              affected.push(`${nr}-${nc}`)
          }
        }

        setExplodingCells(new Set(affected))
        await delay(450)

        // Convert opponent tiles to bomb owner
        for (const key of affected) {
          const [nr, nc] = key.split('-').map(Number)
          g[nr][nc] = { ...g[nr][nc], owner: bomb.owner }
        }
        setDisplayGrid(g.map(r => r.map(c => ({ ...c }))))
        setHighlightedBomb(null)
        setExplodingCells(new Set())
        await delay(350)
      }

      // ── Phase 2: Scoring ────────────────────────────────────────────────
      setPhase('scoring')
      setBombPhaseMsg('')
      const acc: Scores = { red: 0, blue: 0 }

      for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
          setScoringCell(`${r}-${c}`)
          await delay(160)
          const cell = g[r][c]
          if (cell.owner && typeof cell.tileType === 'number') {
            acc[cell.owner] += cell.tileType
            setScores({ ...acc })
          }
        }
      }

      setScoringCell(null)
      await delay(600)
      setPhase('result')
    })()
  }, [grid])

  // ── Reset ──────────────────────────────────────────────────────────────────
  const resetGame = () => {
    const empty = createEmptyGrid()
    setGrid(empty)
    setDisplayGrid(empty)
    setPhase('playing')
    setCurrentPlayer('red')
    setSelectedTile(1)
    setInstallCounter(0)
    setInventory({ red: { ...INITIAL_INVENTORY }, blue: { ...INITIAL_INVENTORY } })
    setScores({ red: 0, blue: 0 })
    setHighlightedBomb(null)
    setExplodingCells(new Set())
    setScoringCell(null)
    setBombPhaseMsg('')
  }

  // ─── Render helpers ─────────────────────────────────────────────────────────
  const inv = inventory[currentPlayer]

  return (
    <div className="flex flex-col gap-3 select-none relative">

      {/* ── Top bar: player toggle + end game ── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {(['red', 'blue'] as Player[]).map(p => (
            <button
              key={p}
              disabled={phase !== 'playing'}
              onClick={() => setCurrentPlayer(p)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                currentPlayer === p
                  ? p === 'red'
                    ? 'bg-red-500 text-white shadow-sm ring-2 ring-red-300'
                    : 'bg-blue-500 text-white shadow-sm ring-2 ring-blue-300'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {p === 'red' ? '🔴 빨강' : '🔵 파랑'}
            </button>
          ))}
        </div>

        {/* Inventory summary for both players */}
        <div className="flex gap-2 text-xs text-gray-400">
          <span className="text-red-400">
            1×{inventory.red.one} 2×{inventory.red.two} 💣×{inventory.red.bomb}
          </span>
          <span>/</span>
          <span className="text-blue-400">
            1×{inventory.blue.one} 2×{inventory.blue.two} 💣×{inventory.blue.bomb}
          </span>
        </div>
      </div>

      {/* ── Tile selector ── */}
      {phase === 'playing' && (
        <div className="flex gap-2">
          {([1, 2, 'bomb'] as TileType[]).map((type, i) => {
            const key = inventoryKey(type)
            const count = inv[key]
            const active = selectedTile === type
            return (
              <button
                key={String(type)}
                onClick={() => setSelectedTile(type)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                  active
                    ? currentPlayer === 'red'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-blue-500 bg-blue-50 text-blue-700'
                    : count > 0
                    ? 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                    : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                }`}
              >
                <span className="block">{type === 'bomb' ? '💣' : `${type}점`}</span>
                <span className="text-xs opacity-60">[{i + 1}키] ×{count}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* ── 5×5 Grid ── */}
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
      >
        {displayGrid.map((row, r) =>
          row.map((cell, c) => {
            const key    = `${r}-${c}`
            const isBomb = highlightedBomb === key
            const isExp  = explodingCells.has(key)
            const isScore = scoringCell === key
            const needed = cell.tileType !== null ? attacksRequired(cell.tileType) : 1
            const isOpponent = cell.owner !== null && cell.owner !== currentPlayer

            return (
              <motion.button
                key={key}
                onClick={() => handleCellClick(r, c)}
                whileTap={phase === 'playing' ? { scale: 0.92 } : {}}
                animate={
                  isBomb    ? { scale: [1, 1.3, 0.85, 1.12, 1], rotate: [0, -10, 10, -5, 0] }
                  : isExp   ? { scale: [1, 0.65, 1.05, 1] }
                  : isScore ? { scale: [1, 1.1, 1] }
                  : {}
                }
                transition={{ duration: 0.35 }}
                className={[
                  'aspect-square rounded-md border-2 flex flex-col items-center justify-center',
                  'text-base font-bold relative overflow-hidden transition-colors',
                  cell.owner === 'red'  ? 'bg-red-100  border-red-300'  : '',
                  cell.owner === 'blue' ? 'bg-blue-100 border-blue-300' : '',
                  cell.owner === null   ? 'bg-gray-50  border-gray-200' : '',
                  isBomb                ? 'ring-2 ring-offset-1 ring-orange-500' : '',
                  isScore               ? 'ring-2 ring-offset-1 ring-yellow-400' : '',
                  phase === 'playing' && cell.owner === null   ? 'hover:bg-gray-100 cursor-pointer' : '',
                  phase === 'playing' && isOpponent            ? 'hover:brightness-95 cursor-pointer' : '',
                  phase === 'playing' && cell.owner === currentPlayer ? 'cursor-not-allowed' : '',
                  phase !== 'playing'   ? 'cursor-default' : '',
                ].join(' ')}
              >
                {/* Tile label */}
                {cell.tileType === 'bomb' && <span className="text-lg leading-none">💣</span>}
                {cell.tileType === 1 && (
                  <span className={`leading-none ${cell.owner === 'red' ? 'text-red-600' : 'text-blue-600'}`}>1</span>
                )}
                {cell.tileType === 2 && (
                  <span className={`leading-none ${cell.owner === 'red' ? 'text-red-600' : 'text-blue-600'}`}>2</span>
                )}
                {cell.owner === null && phase === 'playing' && (
                  <span className="text-gray-200 text-xs">·</span>
                )}

                {/* Attack-progress bar */}
                {cell.attackProgress > 0 && cell.tileType !== null && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                    <motion.div
                      className="h-full bg-orange-400"
                      animate={{ width: `${(cell.attackProgress / needed) * 100}%` }}
                      transition={{ duration: 0.15 }}
                    />
                  </div>
                )}

                {/* Attack-count badge */}
                {cell.attackProgress > 0 && cell.tileType !== null && (
                  <div className="absolute top-0.5 right-0.5 text-[9px] font-bold text-orange-500 leading-none">
                    {cell.attackProgress}/{needed}
                  </div>
                )}

                {/* Explosion flash overlay */}
                <AnimatePresence>
                  {isExp && (
                    <motion.div
                      className="absolute inset-0 bg-orange-400/60 rounded"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })
        )}
      </div>

      {/* ── Phase status messages ── */}
      <AnimatePresence mode="wait">
        {phase === 'bombing' && bombPhaseMsg && (
          <motion.p
            key={bombPhaseMsg}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-sm text-orange-500 font-medium"
          >
            {bombPhaseMsg}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Score display (scoring + result phases) ── */}
      <AnimatePresence>
        {(phase === 'scoring' || phase === 'result') && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-around items-center bg-gray-50 rounded-xl p-3 border border-gray-100"
          >
            <div className="text-center">
              <motion.div
                key={scores.red}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                className="text-red-500 font-bold text-2xl tabular-nums"
              >
                {scores.red}
              </motion.div>
              <div className="text-xs text-gray-400 mt-0.5">빨강</div>
            </div>
            <div className="text-gray-300 font-light text-lg">vs</div>
            <div className="text-center">
              <motion.div
                key={scores.blue}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                className="text-blue-500 font-bold text-2xl tabular-nums"
              >
                {scores.blue}
              </motion.div>
              <div className="text-xs text-gray-400 mt-0.5">파랑</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── End game button ── */}
      {phase === 'playing' && (
        <button
          onClick={handleEndGame}
          className="w-full py-2 rounded-lg bg-gray-800 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          게임 종료 →
        </button>
      )}

      {/* ── Result overlay ── */}
      <AnimatePresence>
        {phase === 'result' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className="absolute inset-0 bg-white/96 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center gap-4 shadow-xl border border-gray-100"
          >
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
            >
              <Trophy className="w-14 h-14 text-yellow-400" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-center"
            >
              {scores.red === scores.blue
                ? '🤝 무승부!'
                : scores.red > scores.blue
                ? '🔴 빨강 승리!'
                : '🔵 파랑 승리!'}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-8 text-xl font-semibold"
            >
              <span className="text-red-500">{scores.red}점</span>
              <span className="text-gray-300">vs</span>
              <span className="text-blue-500">{scores.blue}점</span>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={resetGame}
              className="mt-1 px-6 py-2.5 rounded-xl bg-gray-800 text-white font-medium flex items-center gap-2 hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              다시 시작
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
