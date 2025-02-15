import type { IdRectangle, Rectangle } from "@retro/common";
import RBush, { type BBox } from "rbush";
import TinyQueue from "tinyqueue";

class SearchTree extends RBush<IdRectangle> {
  toBBox(item: IdRectangle) {
    const { x, y, width: width, height: height } = item;
    return {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height,
    };
  }
  compareMinX(a: IdRectangle, b: IdRectangle) {
    return a.x - b.x;
  }
  compareMinY(a: IdRectangle, b: IdRectangle) {
    return a.y - b.y;
  }
}

class Search {
  private tree: SearchTree | null = null;
  public Search() {}
  init(): void {
    this.tree = new SearchTree();
  }

  getTree() {
    return this.tree;
  }

  addItems(items: IdRectangle[]): void {
    if (this.tree === null) throw new Error("Search tree is null");
    this.tree.load(items);
  }

  addItem(item: IdRectangle): void {
    if (this.tree === null) throw new Error("Search tree is null");
    this.tree.insert(item);
  }

  removeItem(item: IdRectangle): void {
    if (this.tree === null) throw new Error("Search tree is null");
    this.tree.remove(item, (a, b) => a.id == b.id);
  }

  searchByRectangle(rect: Rectangle): IdRectangle[] {
    if (this.tree === null) throw new Error("Search tree is null");
    const result = this.tree.search({
      minX: rect.x,
      minY: rect.y,
      maxX: rect.x + rect.width,
      maxY: rect.y + rect.height,
    });
    return result;
  }

  collides(position: Rectangle) {
    if (this.tree === null) throw new Error("Search tree is null");
    return this.tree.collides({
      minX: position.x,
      minY: position.y,
      maxX: position.x + position.width,
      maxY: position.y + position.height,
    });
  }

  clearAll(): void {
    if (this.tree === null) return;
    this.tree.clear();
  }
}

export default Search;

export function knn(
  passedTree: Search,
  x: number,
  y: number,
  n: number,
  //
  predicate?: (candidate: unknown) => boolean,
  maxDistance?: number,
): IdRectangle[] | null {
  const tree = passedTree.getTree();
  if (!tree) return null;
  // @ts-expect-error this actually exists but not shown in types
  let node = tree?.data;
  const result: IdRectangle[] = [];
  const toBBox = tree.toBBox;
  let i, child, dist, candidate;

  const queue = new TinyQueue(undefined, compareDist);

  while (node) {
    for (i = 0; i < node.children.length; i++) {
      child = node.children[i];
      dist = boxDist(x, y, node.leaf ? toBBox(child) : child);
      if (!maxDistance || dist <= maxDistance * maxDistance) {
        queue.push({
          node: child,
          isItem: node.leaf,
          dist: dist,
        });
      }
    }

    while (queue.length && queue.peek().isItem) {
      candidate = queue.pop().node;
      if (!predicate || predicate(candidate)) result.push(candidate);
      if (n && result.length === n) return result;
    }

    node = queue.pop();
    if (node) node = node.node;
  }

  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const compareDist = (a: any, b: any) => {
  return a.dist - b.dist;
};

function boxDist(x: number, y: number, box: BBox) {
  const dx = axisDist(x, box.minX, box.maxX);
  const dy = axisDist(y, box.minY, box.maxY);
  return dx * dx + dy * dy;
}

function axisDist(k: number, min: number, max: number) {
  return k < min ? min - k : k <= max ? 0 : k - max;
}
