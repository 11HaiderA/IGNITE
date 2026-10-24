import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  G,
  Line,
  Circle,
  Path,
  Rect,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Ellipse,
} from 'react-native-svg';
import {
  SEG,
  OPSEG,
  EQSEG,
  TOKEN_W,
  GAP,
  slotsOf,
  has,
} from '../engine/matchEngine';

export default function MatchStickBoard({
  state,
  picked,
  hint,
  boardHeight = 240,
  burnedSticks = new Set(),
  burningSticks = new Set(),
  showSmoke = false,
  onStickPress,
  onSlotPress,
  onBackgroundPress,
}) {
  if (!state || state.length === 0) return null;

  // Adaptive Multi-Row Layout for Upper / Harder Levels (6+ or 7+ tokens)
  // Ensures matchsticks remain HUGE, thick, and effortlessly playable!
  const eqIdx = state.findIndex((t) => t.t === 'e');
  const isTwoRow = state.length >= 7 && eqIdx > 0;

  const ROW_H = 210;
  const ROW_GAP = 28;

  let viewBoxW = 560;
  let viewBoxH = 236;
  let row1OffsetX = 0;
  let row2OffsetX = 0;

  if (isTwoRow) {
    const n1 = eqIdx;
    const n2 = state.length - eqIdx;
    const w1 = n1 * TOKEN_W + (n1 - 1) * GAP;
    const w2 = n2 * TOKEN_W + (n2 - 1) * GAP;
    const maxW = Math.max(w1, w2);
    viewBoxW = maxW + 28;
    viewBoxH = ROW_H * 2 + ROW_GAP + 26;
    row1OffsetX = (maxW - w1) / 2;
    row2OffsetX = (maxW - w2) / 2;
  } else {
    const w = state.length * TOKEN_W + (state.length - 1) * GAP;
    viewBoxW = w + 28;
    viewBoxH = 236;
  }

  // Token coordinate mapper
  const getTokenCoords = (idx) => {
    if (!isTwoRow) {
      return {
        x: idx * (TOKEN_W + GAP),
        y: 0,
      };
    }
    if (idx < eqIdx) {
      return {
        x: row1OffsetX + idx * (TOKEN_W + GAP),
        y: 0,
      };
    }
    return {
      x: row2OffsetX + (idx - eqIdx) * (TOKEN_W + GAP),
      y: ROW_H + ROW_GAP,
    };
  };

  // Calculate hint trajectory curve if hint is active
  let hintCurve = null;
  if (hint && hint.from && hint.to) {
    try {
      const fromToken = state[hint.from[0]];
      const toToken = state[hint.to[0]];
      const fromGeo = fromToken.t === 'd' ? SEG : OPSEG;
      const toGeo = toToken.t === 'd' ? SEG : OPSEG;
      const fCoords = fromGeo[hint.from[1]];
      const tCoords = toGeo[hint.to[1]];

      const fromPos = getTokenCoords(hint.from[0]);
      const toPos = getTokenCoords(hint.to[0]);

      const fx = fromPos.x + (fCoords[0] + fCoords[2]) / 2;
      const fy = fromPos.y + (fCoords[1] + fCoords[3]) / 2;
      const tx = toPos.x + (tCoords[0] + tCoords[2]) / 2;
      const ty = toPos.y + (tCoords[1] + tCoords[3]) / 2;

      const midX = (fx + tx) / 2;
      const midY = Math.min(fy, ty) - 28;
      hintCurve = `M ${fx} ${fy} Q ${midX} ${midY} ${tx} ${ty}`;
    } catch (e) {}
  }

  // Calculate non-overlapping touch target line coordinates with 6-unit corner inset
  const getTouchCoords = (x1, y1, x2, y2) => {
    const isHorizontal = Math.abs(y1 - y2) < 2;
    if (isHorizontal) {
      const minX = Math.min(x1, x2) + 6;
      const maxX = Math.max(x1, x2) - 6;
      return [minX, y1, maxX, y2];
    }
    const minY = Math.min(y1, y2) + 6;
    const maxY = Math.max(y1, y2) - 6;
    return [x1, minY, x2, maxY];
  };

  return (
    <View style={styles.container}>
      <Svg
        width="100%"
        height={boardHeight}
        viewBox={`-14 -14 ${viewBoxW} ${viewBoxH}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <Defs>
          {/* Natural wood body gradient (cylindrical highlight) */}
          <LinearGradient id="woodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFE3A8" />
            <Stop offset="35%" stopColor="#E5B869" />
            <Stop offset="75%" stopColor="#A66F33" />
            <Stop offset="100%" stopColor="#78471A" />
          </LinearGradient>

          {/* Charred burned stick gradient */}
          <LinearGradient id="charredGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#3A2A24" />
            <Stop offset="60%" stopColor="#180E0A" />
            <Stop offset="100%" stopColor="#050303" />
          </LinearGradient>

          {/* Sulfur match head gradient (spherical shading) */}
          <RadialGradient id="headGrad" cx="35%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#FF8A80" />
            <Stop offset="40%" stopColor="#D50000" />
            <Stop offset="85%" stopColor="#8A0000" />
            <Stop offset="100%" stopColor="#4A0000" />
          </RadialGradient>

          {/* Ash head gradient */}
          <RadialGradient id="ashGrad" cx="35%" cy="35%" r="65%">
            <Stop offset="0%" stopColor="#A8A29E" />
            <Stop offset="60%" stopColor="#57534E" />
            <Stop offset="100%" stopColor="#1C1917" />
          </RadialGradient>

          {/* Core Flame gradient */}
          <RadialGradient id="flameGrad" cx="50%" cy="80%" r="80%">
            <Stop offset="0%" stopColor="#FFFFFF" />
            <Stop offset="25%" stopColor="#FFEB3B" />
            <Stop offset="65%" stopColor="#FF5722" />
            <Stop offset="100%" stopColor="#D50000" stopOpacity="0" />
          </RadialGradient>

          {/* Outer Flame Glow */}
          <RadialGradient id="flameGlowGrad" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FF9800" stopOpacity="0.8" />
            <Stop offset="60%" stopColor="#FF5722" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#FF5722" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Board backdrop touch catcher to cancel selection when tapping empty space */}
        <Rect
          x={-14}
          y={-14}
          width={viewBoxW}
          height={viewBoxH}
          fill="#000000"
          fillOpacity={0.001}
          onPress={() => {
            if (onBackgroundPress) onBackgroundPress();
          }}
        />

        {state.map((t, i) => {
          const { x: transX, y: transY } = getTokenCoords(i);

          if (t.t === 'e') {
            // Fixed '=' token
            return (
              <G key={`eq-${i}`} transform={`translate(${transX}, ${transY})`}>
                {EQSEG.map(([x1, y1, x2, y2], idx) => {
                  const mx = (x1 + x2) / 2;
                  const my = (y1 + y2) / 2;
                  const isCharred = burnedSticks.has(`e-${i}-${idx}`);
                  const isBurning = burningSticks.has(`e-${i}-${idx}`) || burningSticks.has('all');
                  return (
                    <G key={`eq-stick-${idx}`}>
                      {/* Drop Shadow */}
                      <Line
                        x1={x1 + 2.5}
                        y1={y1 + 4.5}
                        x2={x2 + 2.5}
                        y2={y2 + 4.5}
                        stroke="#000000"
                        strokeWidth={11}
                        strokeLinecap="round"
                        opacity={0.65}
                      />
                      {/* Main Wood Body (Thick, clear, and prominent) */}
                      <Line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={isCharred ? 'url(#charredGrad)' : 'url(#woodGrad)'}
                        strokeWidth={12.5}
                        strokeLinecap="round"
                      />
                      {/* Wood grain fiber */}
                      {!isCharred && (
                        <Line
                          x1={(x1 + mx) / 2}
                          y1={(y1 + my) / 2}
                          x2={(x2 + mx) / 2}
                          y2={(y2 + my) / 2}
                          stroke="#8C531B"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          opacity={0.45}
                        />
                      )}
                      {/* Match head */}
                      <Circle
                        cx={x1}
                        cy={y1}
                        r={10.5}
                        fill={isCharred ? 'url(#ashGrad)' : 'url(#headGrad)'}
                      />
                      {/* Specular highlight */}
                      {!isCharred && (
                        <Circle
                          cx={x1 - 2.5}
                          cy={y1 - 2.5}
                          r={2.5}
                          fill="#FFFFFF"
                          opacity={0.85}
                        />
                      )}
                      {/* Ember dots on charred stick */}
                      {isCharred && (
                        <G opacity={0.9}>
                          <Circle cx={(x1 * 3 + x2) / 4} cy={(y1 * 3 + y2) / 4} r={1.8} fill="#FFB300" />
                          <Circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={2.2} fill="#FF7A00" />
                          <Circle cx={(x1 + x2 * 3) / 4} cy={(y1 + y2 * 3) / 4} r={1.6} fill="#FF9A1A" />
                        </G>
                      )}
                      {/* Burning traveling flame */}
                      {isBurning && (
                        <G>
                          <Circle cx={mx} cy={my} r={22} fill="url(#flameGlowGrad)" />
                          <Ellipse cx={mx} cy={my - 6} rx={9} ry={15} fill="url(#flameGrad)" />
                        </G>
                      )}
                    </G>
                  );
                })}
              </G>
            );
          }

          const geo = t.t === 'd' ? SEG : OPSEG;
          const slots = slotsOf(t);

          return (
            <G key={`tok-${i}`} transform={`translate(${transX}, ${transY})`}>
              {/* 1. Empty Slot Grooves (Smooth dashed recessed wood channels) */}
              {slots.map((k) => {
                if (has(t, k)) return null;
                const [x1, y1, x2, y2] = geo[k];
                const isHintDestination = hint && hint.to && hint.to[0] === i && hint.to[1] === k;

                return (
                  <G key={`empty-${k}`}>
                    {/* Shadow channel */}
                    <Line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#0D0704"
                      strokeWidth={12}
                      strokeLinecap="round"
                    />
                    {/* Dashed recessed guide channel */}
                    <Line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isHintDestination ? '#FFA500' : '#2A170C'}
                      strokeWidth={isHintDestination ? 8 : 6}
                      strokeDasharray={isHintDestination ? '6 4' : '4 6'}
                      strokeLinecap="round"
                      opacity={isHintDestination ? 0.95 : 0.65}
                    />

                    {/* Hint pulsing glow ring at destination */}
                    {isHintDestination && (
                      <Circle
                        cx={(x1 + x2) / 2}
                        cy={(y1 + y2) / 2}
                        r={15}
                        fill="none"
                        stroke="#FFD700"
                        strokeWidth={2.5}
                        strokeDasharray="4 4"
                        opacity={0.85}
                      />
                    )}
                  </G>
                );
              })}

              {/* 2. Active Matchsticks */}
              {slots.map((k) => {
                if (!has(t, k)) return null;
                const [x1, y1, x2, y2] = geo[k];
                const mx = (x1 + x2) / 2;
                const my = (y1 + y2) / 2;
                const isPicked = picked && picked[0] === i && picked[1] === k;
                const isHintSource = hint && hint.from && hint.from[0] === i && hint.from[1] === k;
                const isCharred = burnedSticks.has(`${i}-${k}`);
                const isBurning = burningSticks.has(`${i}-${k}`) || burningSticks.has('all');

                // Dynamic pick-up elevation effect
                const elevX = isPicked ? 0 : 0;
                const elevY = isPicked ? -7 : 0;
                const shadowOffX = isPicked ? 6 : 2.5;
                const shadowOffY = isPicked ? 12 : 4.5;
                const scaleFactor = isPicked ? 1.06 : 1.0;

                return (
                  <G
                    key={`active-${k}`}
                    transform={
                      isPicked
                        ? `translate(${elevX}, ${elevY}) scale(${scaleFactor}) translate(${mx * (1 - scaleFactor)}, ${my * (1 - scaleFactor)})`
                        : undefined
                    }
                  >
                    {/* Matchstick Drop Shadow */}
                    <Line
                      x1={x1 + shadowOffX}
                      y1={y1 + shadowOffY}
                      x2={x2 + shadowOffX}
                      y2={y2 + shadowOffY}
                      stroke="#000000"
                      strokeWidth={isPicked ? 13 : 11}
                      strokeLinecap="round"
                      opacity={isPicked ? 0.45 : 0.65}
                    />

                    {/* Selection / Hint Aura Glow */}
                    {(isPicked || isHintSource) && (
                      <Line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke={isPicked ? '#FFA500' : '#FFD700'}
                        strokeWidth={20}
                        strokeLinecap="round"
                        opacity={0.55}
                      />
                    )}

                    {/* Main Wood Body */}
                    <Line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isCharred ? 'url(#charredGrad)' : 'url(#woodGrad)'}
                      strokeWidth={12.5}
                      strokeLinecap="round"
                    />

                    {/* Realistic fine wood grain line */}
                    {!isCharred && (
                      <Line
                        x1={(x1 + mx) / 2}
                        y1={(y1 + my) / 2}
                        x2={(x2 + mx) / 2}
                        y2={(y2 + my) / 2}
                        stroke="#8C531B"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        opacity={0.45}
                      />
                    )}

                    {/* Match Head */}
                    <Circle
                      cx={x1}
                      cy={y1}
                      r={10.5}
                      fill={isCharred ? 'url(#ashGrad)' : 'url(#headGrad)'}
                    />

                    {/* Specular 3D bulb shine */}
                    {!isCharred && (
                      <Circle
                        cx={x1 - 2.5}
                        cy={y1 - 2.5}
                        r={2.6}
                        fill="#FFFFFF"
                        opacity={0.85}
                      />
                    )}

                    {/* Glowing ember dots on charred burnt stick */}
                    {isCharred && (
                      <G opacity={0.9}>
                        <Circle cx={(x1 * 3 + x2) / 4} cy={(y1 * 3 + y2) / 4} r={1.8} fill="#FFB300" />
                        <Circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r={2.2} fill="#FF7A00" />
                        <Circle cx={(x1 + x2 * 3) / 4} cy={(y1 + y2 * 3) / 4} r={1.6} fill="#FF9A1A" />
                      </G>
                    )}

                    {/* Burning traveling flame */}
                    {isBurning && (
                      <G>
                        <Circle cx={mx} cy={my} r={22} fill="url(#flameGlowGrad)" />
                        <Ellipse cx={mx} cy={my - 6} rx={9} ry={15} fill="url(#flameGrad)" />
                      </G>
                    )}
                  </G>
                );
              })}

              {/* 3. Non-Overlapping Generous Touch Hitbox Targets (34-unit width) */}
              {slots.map((k) => {
                const isStick = has(t, k);
                const [x1, y1, x2, y2] = geo[k];
                const [tx1, ty1, tx2, ty2] = getTouchCoords(x1, y1, x2, y2);

                return (
                  <Line
                    key={`touch-${k}`}
                    x1={tx1}
                    y1={ty1}
                    x2={tx2}
                    y2={ty2}
                    stroke="transparent"
                    strokeWidth={34}
                    strokeLinecap="round"
                    onPress={() => {
                      if (isStick) {
                        if (onStickPress) onStickPress(i, k);
                      } else {
                        if (onSlotPress) onSlotPress(i, k);
                      }
                    }}
                  />
                );
              })}
            </G>
          );
        })}

        {/* 4. Hint Quadratic Bezier Trajectory Arrow */}
        {hintCurve && (
          <G>
            <Path
              d={hintCurve}
              fill="none"
              stroke="#FFA000"
              strokeWidth={4.5}
              strokeDasharray="7 5"
              strokeLinecap="round"
              opacity={0.85}
            />
          </G>
        )}

        {/* 5. Wisps of Grey Smoke After Equation Burns */}
        {showSmoke && (
          <G opacity={0.4}>
            <Circle cx={viewBoxW * 0.25} cy={viewBoxH * 0.4} r={24} fill="#888888" />
            <Circle cx={viewBoxW * 0.5} cy={viewBoxH * 0.3} r={32} fill="#777777" />
            <Circle cx={viewBoxW * 0.75} cy={viewBoxH * 0.4} r={26} fill="#888888" />
          </G>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
