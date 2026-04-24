// Route 67 highway shield — Singapore colors, Route 66 shape.
// Ported from design/project/app/ui.jsx.

type Shield67Props = {
  size?: number;
};

export function Shield67({ size = 64 }: Shield67Props) {
  const h = size * 1.055;
  return (
    <svg
      width={size}
      height={h}
      viewBox="0 0 110 116"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'block',
        filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.5))',
      }}
    >
      <path
        d="M55 4 L104 22 L104 62 Q104 98 55 112 Q6 98 6 62 L6 22 Z"
        fill="#EF2B2D"
        stroke="#fff"
        strokeWidth="3"
      />
      <path
        d="M55 13 L96 28 L96 62 Q96 91 55 103 Q14 91 14 62 L14 28 Z"
        fill="#fff"
      />
      <path
        d="M55 13 L96 28 L96 38 L14 38 L14 28 Z"
        fill="#EF2B2D"
      />
      <text
        x="55"
        y="34"
        textAnchor="middle"
        fontFamily="'Archivo Black', sans-serif"
        fontSize="13"
        fontWeight="900"
        fill="#fff"
        letterSpacing="3"
      >
        ROUTE
      </text>
      <text
        x="55"
        y="82"
        textAnchor="middle"
        fontFamily="'Archivo Black', sans-serif"
        fontSize="48"
        fontWeight="900"
        fill="#EF2B2D"
        letterSpacing="-2"
      >
        67
      </text>
      <path
        d="M14 90 L96 90 L96 98 Q55 108 14 98 Z"
        fill="#EF2B2D"
      />
      <text
        x="55"
        y="97"
        textAnchor="middle"
        fontFamily="'Archivo Black', sans-serif"
        fontSize="9"
        fontWeight="900"
        fill="#fff"
        letterSpacing="1.5"
      >
        SINGAPORE
      </text>
    </svg>
  );
}

export default Shield67;
