import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Ellipse,
  Circle,
  Rect,
  Path,
  G,
  Defs,
  RadialGradient,
  LinearGradient,
  LinearGradient as SvgGrad,
  Stop,
  Line,
} from 'react-native-svg';

export default function RealisticMatchstick({
  width = 18,
  height = 140,
  headSize = 22,
  isBurning = true,
  style,
}) {
  const woodW = width;
  const woodH = height;
  const headW = headSize;
  const headH = headSize * 1.35;

  return (
    <View style={[styles.wrap, { width: headW + 4, height: woodH + headH * 0.5 }, style]}>
      <Svg
        width={headW + 4}
        height={woodH + headH * 0.5}
        viewBox={`0 0 ${headW + 4} ${woodH + headH * 0.5}`}
      >
        <Defs>
          {/* 3D Pine Wood Shaft Gradient */}
          <SvgGrad id="realWoodGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#fff0c2" />
            <Stop offset="18%" stopColor="#eed08d" />
            <Stop offset="55%" stopColor="#dfac60" />
            <Stop offset="85%" stopColor="#b8803a" />
            <Stop offset="100%" stopColor="#7a4e1d" />
          </SvgGrad>

          {/* Charred wood roast gradient at top of shaft */}
          <SvgGrad id="charredRoastGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#120401" stopOpacity="0.95" />
            <Stop offset="30%" stopColor="#300d05" stopOpacity="0.85" />
            <Stop offset="70%" stopColor="#5c200e" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </SvgGrad>

          {/* 3D Sulfur Match Head Gradient */}
          <RadialGradient id="sulfurHeadGrad" cx="35%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#ff5e3b" />
            <Stop offset="25%" stopColor="#c72510" />
            <Stop offset="65%" stopColor="#781105" />
            <Stop offset="90%" stopColor="#3b0802" />
            <Stop offset="100%" stopColor="#1a0301" />
          </RadialGradient>

          {/* Glowing ember spot at base of head */}
          <RadialGradient id="headEmberGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#ffcc00" stopOpacity="0.9" />
            <Stop offset="50%" stopColor="#ff4d00" stopOpacity="0.5" />
            <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* 1. Wooden Matchstick Shaft */}
        <Rect
          x={(headW + 4 - woodW) / 2}
          y={headH * 0.45}
          width={woodW}
          height={woodH}
          rx={woodW * 0.18}
          fill="url(#realWoodGrad)"
          stroke="#422209"
          strokeWidth="1.2"
        />

        {/* Longitudinal Wood Grain Fibers */}
        <Rect
          x={(headW + 4 - woodW) / 2 + woodW * 0.25}
          y={headH * 0.45}
          width={1.2}
          height={woodH}
          fill="#fff"
          opacity={0.35}
        />
        <Rect
          x={(headW + 4 - woodW) / 2 + woodW * 0.65}
          y={headH * 0.45}
          width={1.2}
          height={woodH}
          fill="#593212"
          opacity={0.4}
        />

        {/* Scorched / Charred transition zone at the top of the stick */}
        <Rect
          x={(headW + 4 - woodW) / 2}
          y={headH * 0.45}
          width={woodW}
          height={woodH * 0.28}
          rx={woodW * 0.18}
          fill="url(#charredRoastGrad)"
        />

        {/* 2. Red-Hot Glowing Ember between head and wood */}
        {isBurning && (
          <Ellipse
            cx={(headW + 4) / 2}
            cy={headH * 0.52}
            rx={headW * 0.48}
            ry={headH * 0.25}
            fill="url(#headEmberGlow)"
          />
        )}

        {/* 3. 3D Bulbous Sulfur Match Head */}
        <Ellipse
          cx={(headW + 4) / 2}
          cy={headH * 0.46}
          rx={headW * 0.46}
          ry={headH * 0.42}
          fill="url(#sulfurHeadGrad)"
          stroke="#1e0401"
          strokeWidth="1.4"
        />

        {/* Specular White-Gloss Highlight on Sulfur Head */}
        <Ellipse
          cx={(headW + 4) / 2 - headW * 0.14}
          cy={headH * 0.32}
          rx={headW * 0.18}
          ry={headH * 0.12}
          fill="#ffffff"
          opacity={0.55}
          transform={`rotate(-20 ${(headW + 4) / 2 - headW * 0.14} ${headH * 0.32})`}
        />

        {/* Porous Sulfur Texture Specks */}
        <Circle cx={(headW + 4) / 2 + 2} cy={headH * 0.5} r={1.2} fill="#ff7a59" opacity={0.7} />
        <Circle cx={(headW + 4) / 2 - 3} cy={headH * 0.56} r={1} fill="#ff9900" opacity={0.6} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});
