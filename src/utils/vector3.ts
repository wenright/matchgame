export class Vector3 {
  public x = 0;
  public y = 0;
  public z = 0;

  constructor(x?: number, y?: number, z?: number) {
    this.set(x ?? 0, y ?? 0, z ?? 0);
  }

  public set(x: number, y: number, z: number): void {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public add(v: Vector3): Vector3 {
    const newVec = new Vector3(this.x, this.y, this.z);
    newVec.x += v.x;
    newVec.y += v.y;
    newVec.z += v.z;

    return newVec;
  }

  public sub(v: Vector3): Vector3 {
    const newVec = new Vector3(this.x, this.y, this.z);
    newVec.x -= v.x;
    newVec.y -= v.y;
    newVec.z -= v.z;

    return newVec;
  }

  public mul(v: Vector3): Vector3 {
    const newVec = new Vector3(this.x, this.y, this.z);
    newVec.x *= v.x;
    newVec.y *= v.y;
    newVec.z *= v.z;

    return newVec;
  }

  public div(v: Vector3): Vector3 {
    const newVec = new Vector3(this.x, this.y, this.z);
    newVec.x /= v.x;
    newVec.y /= v.y;
    newVec.z /= v.z;

    return newVec;
  }

  public scale(s: number): Vector3 {
    const newVec = new Vector3(this.x, this.y, this.z);
    newVec.x *= s;
    newVec.y *= s;
    newVec.z *= s;

    return newVec;
  }

  public dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  public cross(v: Vector3): Vector3 {
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  public magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  public normalize(): Vector3 {
    const newVec = new Vector3(this.x, this.y, this.z);
    const length = this.magnitude();
    newVec.x /= length;
    newVec.y /= length;
    newVec.z /= length;

    return newVec;
  }
}