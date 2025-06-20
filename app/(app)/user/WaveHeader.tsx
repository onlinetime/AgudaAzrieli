import React from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

export function WaveHeader({
  topColor = "#ff8a80",
  middleColor = "#ff5252",
  bottomColor = "#f44336",
  height = 120,
} = {}) {
  const { width } = Dimensions.get("window");

  return (
    <View style={[styles.container, { height }]}>
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={styles.svg}
      >
        {/* גל עליון */}
        <Path
          d={`M0,20 C ${width * 0.2},50 ${width * 0.8},-10 ${width},20 L ${width},${height} L 0,${height} Z`}
          fill={topColor}
        />
        {/* גל אמצעי */}
        <Path
          d={`M0,50 C ${width * 0.3},80 ${width * 0.7},30 ${width},50 L ${width},${height} L 0,${height} Z`}
          fill={middleColor}
        />
        {/* גל תחתון */}
        <Path
          d={`M0,80 C ${width * 0.25},110 ${width * 0.75},60 ${width},80 L ${width},${height} L 0,${height} Z`}
          fill={bottomColor}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    width: "100%",
    overflow: "hidden",
  },
  svg: {
    position: "absolute",
    top: 0,
  },
});
