type Point = [number, number];
type Color = [number, number, number];

type ShapeType = "line" | "square" | "polygon";
type Mode = "selecting" | ShapeType | "color";

type PolygonObject = {
  color: Color;
  pointList: Point[];
};
