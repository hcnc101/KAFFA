import React from "react";
import { View, StyleSheet, Text as RNText } from "react-native";
import Svg, { Polygon, Line, Text as SvgText, Circle } from "react-native-svg";

interface RadarChartProps {
  values: number[]; // e.g. [flavour, aroma, body, acidity, strength]
  labels: string[];
  max?: number; // default 10
  size?: number; // px, default 240 (slightly smaller for compactness)
  caption?: string;
}

const RadarChart: React.FC<RadarChartProps> = ({
  values,
  labels,
  max = 10,
  size = 240,
  caption = "Adjust the sliders to shape your coffee's profile",
}) => {
  const numAxes = labels.length;
  // Increase padding for labels to prevent cutoff
  const padding = 40;
  const svgSize = size + padding * 2;
  // Shift center to allow for left/top padding
  const center = svgSize / 2;
  const radius = size * 0.32;
  const angleStep = (2 * Math.PI) / numAxes;

  // Calculate points for the polygon
  const getPoint = (val: number, i: number, r = radius) => {
    const angle = i * angleStep - Math.PI / 2;
    const valueRadius = (val / max) * r;
    return [
      center + valueRadius * Math.cos(angle),
      center + valueRadius * Math.sin(angle),
    ];
  };

  const points = values.map((val, i) => getPoint(val, i).join(",")).join(" ");

  // For grid (concentric polygons)
  const gridLevels = 4;
  const gridPolygons = Array.from({ length: gridLevels }, (_, l) => {
    const r = radius * ((l + 1) / gridLevels);
    const pts = labels.map((_, i) => getPoint(max, i, r).join(",")).join(" ");
    return (
      <Polygon
        key={l}
        points={pts}
        fill="none"
        stroke="#d3d3d3"
        strokeWidth={1}
      />
    );
  });

  // Axis lines
  const axes = labels.map((_, i) => {
    const [x, y] = getPoint(max, i);
    return (
      <Line
        key={i}
        x1={center}
        y1={center}
        x2={x}
        y2={y}
        stroke="#bca18a"
        strokeWidth={1.5}
      />
    );
  });

  // Axis labels with values (two lines)
  const labelOffset = 35;
  const labelEls = labels.map((label, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const [x, y] = getPoint(max + 1.5, i, radius + labelOffset);

    // Better text anchor positioning based on angle
    let textAnchor: "start" | "middle" | "end" = "middle";
    if (angle > Math.PI / 6 && angle < (Math.PI * 5) / 6) {
      textAnchor = "start"; // Right side
    } else if (angle > (Math.PI * 7) / 6 && angle < (Math.PI * 11) / 6) {
      textAnchor = "end"; // Left side
    }

    return (
      <React.Fragment key={`label-group-${i}`}>
        <SvgText
          x={x}
          y={y - 7}
          fontSize={12}
          fill="#6F4E37"
          fontWeight="bold"
          textAnchor={textAnchor}
          alignmentBaseline="middle"
        >
          {label}
        </SvgText>
        <SvgText
          x={x}
          y={y + 8}
          fontSize={11}
          fill="#6F4E37"
          fontWeight="600"
          textAnchor={textAnchor}
          alignmentBaseline="middle"
        >
          {values[i]}
        </SvgText>
      </React.Fragment>
    );
  });

  return (
    <View style={styles.container}>
      <Svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
      >
        {/* Grid */}
        {gridPolygons}
        {/* Axes */}
        {axes}
        {/* Data polygon (no drop shadow for mobile compatibility) */}
        <Polygon
          points={points}
          fill="#6F4E37AA"
          stroke="#6F4E37"
          strokeWidth={2}
        />
        {/* Data points */}
        {values.map((val, i) => {
          const [x, y] = getPoint(val, i);
          return (
            <Circle
              key={i}
              cx={x}
              cy={y}
              r={5}
              fill="#D4AF37"
              stroke="#6F4E37"
              strokeWidth={1.5}
            />
          );
        })}
        {/* Center dot */}
        <Circle cx={center} cy={center} r={3} fill="#6F4E37" />
        {/* Labels */}
        {labelEls}
      </Svg>
      <RNText style={styles.caption}>{caption}</RNText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8, // reduced vertical margin
  },
  caption: {
    marginTop: 4,
    color: "#6F4E37",
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    opacity: 0.85,
  },
});

export default RadarChart;
