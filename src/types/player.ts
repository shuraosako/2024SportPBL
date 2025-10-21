// Player related types

export interface Player {
  id: string;
  name: string;
  grade: string;
  height: number;
  weight: number;
  imageURL?: string;
  creationDate?: FirebaseTimestamp;
}

export interface FirebaseTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface PlayerData {
  id?: string;
  date: string;
  releaseSpeed?: number;
  spinRate?: number;
  verticalBreak?: number;
  inducedVerticalBreak?: number;
  horizontalBreak?: number;
  releaseHeight?: number;
  releaseSide?: number;
  extension?: number;
  verticalApproachAngle?: number;
  plateLocationSide?: number;
  plateLocationHeight?: number;
  playerId?: string;
  name?: string;
}

export type SortableField = keyof PlayerData;
