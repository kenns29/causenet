// @flow
export {default as progressFetch} from './progress-fetch';
export * from './clustering-utils';
export const isNull = v => v === null || v === undefined;

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

export const makeLineArrow = ({
  line: [[sx = 0, sy = 0, sz = 0], [tx = 0, ty = 0, tz = 0]],
  l,
  w
}) => {
  const hyp = Math.sqrt(
    (tx - sx) * (tx - sx) + (ty - sy) * (ty - sy) + (tz - sz) * (tz - sz)
  );
  const sin = (ty - sy) / hyp;
  const cos = (tx - sx) / hyp;
  const trig = [
    [hyp - l / 2, -w / 2, tz],
    [hyp - l / 2, w / 2, tz],
    [hyp, 0, tz]
  ];
  const rotTrig = rotatePolygonOnZ({
    points: trig,
    origin: [0, 0, 0],
    cos,
    sin
  });
  return rotTrig.map(([rx, ry, rz]) => [rx + sx, ry + sy, rz + sz]);
};
