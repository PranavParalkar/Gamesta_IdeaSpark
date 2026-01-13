type SparklineProps = {
  data?: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
};

export default function Sparkline({
  data = [2, 4, 1, 5, 3, 6],
  width = 200,
  height = 40,
  stroke = '#4ade80',
  fill = 'transparent',
}: SparklineProps) {
  const max = Math.max(...data, 1);
  const step = width / Math.max(data.length - 1, 1);
  const path = data
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${i * step},${height - (p / max) * height}`)
    .join(' ');
  const area = `${path} L ${width},${height} L 0,${height} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {fill !== 'transparent' && (
        <path d={area} fill={fill} stroke="none" />
      )}
      <path d={path} fill="none" stroke={stroke} strokeWidth={2} />
    </svg>
  );
}
