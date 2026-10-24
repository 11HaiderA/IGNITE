import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

export default function MatchstickProgressBar({ progress = 0, current = 0, target = 1, fontFamily }) {
  // progress is 0 to 1
  const pct = Math.max(0, Math.min(1, progress));
  const barWidth = 200;
  const flameX = 28 + pct * (barWidth - 40);

  return (
    <View style={styles.container}>
      <View style={styles.matchstickRow}>
        <Svg width={barWidth + 10} height={36} viewBox={`0 0 ${barWidth + 10} 36`}>
          <Defs>
            <SvgGrad id="progWood" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#d19c53" />
              <Stop offset="50%" stopColor="#f5d491" />
              <Stop offset="100%" stopColor="#9e6e2f" />
            </SvgGrad>

            <SvgGrad id="burnedWood" x1="0%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%" stopColor="#3d1b11" />
              <Stop offset="100%" stopColor="#1a0a06" />
            </SvgGrad>
          </Defs>

          {/* Unburned Wood Shaft (full length) */}
          <Rect
            x="24"
            y="13"
            width={barWidth - 24}
            height="10"
            rx="3"
            fill="url(#progWood)"
            stroke="#4a2408"
            strokeWidth="1.5"
          />

          {/* Burned/consumed portion if pct > 0 */}
          {pct > 0 && (
            <Rect
              x="24"
              y="13"
              width={pct * (barWidth - 30)}
              height="10"
              rx="2"
              fill="url(#burnedWood)"
            />
          )}

          {/* Charred Sulfur Head on Left */}
          <Ellipse cx="16" cy="18" rx="10" ry="8" fill="#3a1208" stroke="#1d0702" strokeWidth="1.5" />
          <Ellipse cx="16" cy="17" rx="7" ry="5.5" fill="#a8230d" />

          {/* Burning flame licking at current progress point */}
          <Path
            d={`M${flameX - 8} 18 C${flameX - 4} 4, ${flameX + 4} 4, ${flameX + 8} 18 Z`}
            fill="#ff4d00"
          />
          <Path
            d={`M${flameX - 5} 18 C${flameX - 2} 8, ${flameX + 2} 8, ${flameX + 5} 18 Z`}
            fill="#ffaa00"
          />
          <Path
            d={`M${flameX - 2} 18 C${flameX} 11, ${flameX + 1} 11, ${flameX + 2} 18 Z`}
            fill="#fff275"
          />
        </Svg>

        {/* Counter Badge (e.g. 0/1) */}
        <View style={styles.countBadge}>
          <Text style={[styles.countText, fontFamily && { fontFamily }]}>
            {current}/{target}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  matchstickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1b0904',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#421706',
    shadowColor: '#ff6600',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  countBadge: {
    backgroundColor: '#301107',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#592009',
    marginLeft: 4,
  },
  countText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffc83b',
    letterSpacing: 1,
  },
});
