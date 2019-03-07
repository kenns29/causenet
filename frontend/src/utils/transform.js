import {isNull} from './base';

export const getLineLength = ({
  line: [[sx = 0, sy = 0, sz = 0], [tx = 0, ty = 0, tz = 0]]
}) =>
  Math.sqrt(
    (tx - sx) * (tx - sx) + (ty - sy) * (ty - sy) + (tz - sz) * (tz - sz)
  );

// rotate the point on Z axis
export const rotatePointOnZ = ({
  point: [x, y, z],
  origin = [0, 0, 0], // origin of the rotation
  theta, // the rotate angle in rad
  cos, // the cosine of the rotate angle
  sin // the sine of the rotate angle
}) => {
  [x, y, z] = [x, y, z].map(v => v || 0);
  const [dx, dy] = origin.map(v => v || 0);
  cos = isNull(cos) ? Math.cos(theta) : cos;
  sin = isNull(sin) ? Math.sin(theta) : sin;
  x -= dx;
  y -= dy;
  return [x * cos - y * sin + dx, x * sin + y * cos + dy, z];
};

export const rotatePolygonOnZ = ({points = [], origin, theta, cos, sin}) => {
  return points.map(point => rotatePointOnZ({point, origin, theta, cos, sin}));
};

export const clipLine = ({
  line: [[sx = 0, sy = 0, sz = 0], [tx = 0, ty = 0, tz = 0]],
  clipLengths: [sc = 0, tc = 0]
}) => {
  const hyp = getLineLength({
    line: [[sx, sy, sz], [tx, ty, tz]]
  });
  const sin = (ty - sy) / hyp;
  const cos = (tx - sx) / hyp;
  return [
    [sx + cos * sc, sy + sin * sc, sz],
    [tx - cos * tc, ty - sin * tc, tz]
  ];
};

export const makeLineArrow = ({
  line: [[sx = 0, sy = 0, sz = 0], [tx = 0, ty = 0, tz = 0]],
  l, // the length of the arrow
  w // the width of the arrow
}) => {
  const hyp = getLineLength({
    line: [[sx, sy, sz], [tx, ty, tz]]
  });
  const sin = (ty - sy) / hyp;
  const cos = (tx - sx) / hyp;
  const trig = [
    [hyp - l / 2, -w / 2, tz],
    [hyp - l / 2, w / 2, tz],
    [hyp, 0, tz]
  ];
  return rotatePolygonOnZ({
    points: trig,
    origin: [0, 0, 0],
    cos,
    sin
  }).map(([rx, ry, rz]) => [rx + sx, ry + sy, rz + sz]);
};

export const getPointOnPerpendicularBisector = ({
  line: [[sx = 0, sy = 0, sz = 0], [tx = 0, ty = 0, tz = 0]],
  // distance of the point to the line. The point offsets the line in clockwise
  // direction by default, but in counter clockwise if distance has negative value
  distance = 0
}) => {
  const hyp = getLineLength({
    line: [[sx, sy, sz], [tx, ty, tz]]
  });
  const sin = (ty - sy) / hyp;
  const cos = (tx - sx) / hyp;

  const [rx, ry, rz] = rotatePointOnZ({
    point: [hyp / 2, distance, 0],
    sin,
    cos
  });
  return [rx + sx, ry + sy, rz + sz];
};
