type Point = [number, number];
type Color = [number, number, number];

type Mode = "selecting" | "line" | "square" | "polygon";

type PolygonObject = {
  color: Color;
  pointList: Point[];
};
