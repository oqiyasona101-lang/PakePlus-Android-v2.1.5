
export enum LotteryType {
  SUPER_LOTTO = 'SUPER_LOTTO', // 大乐透
  DOUBLE_COLOR = 'DOUBLE_COLOR', // 双色球
  HAPPY_8 = 'HAPPY_8' // 快乐八
}

export interface SimulationFactors {
  hotNumbers: number[];
  coldNumbers: number[];
  primeBias: number; // 质数偏好
  parityTarget: number; // 目标奇数比例 (0-1)
  consecutiveWeight: number; // 连号权重
}

export interface SimulationResult {
  topNumbers: number[];
  extraNumbers?: number[];
  distribution: Record<number, number>;
  simulationCount: number;
  runtimeMs: number;
  appliedFactors: SimulationFactors;
}

export interface GameConfig {
  name: string;
  description: string;
  rules: {
    mainRange: [number, number];
    mainCount: number;
    extraRange?: [number, number];
    extraCount?: number;
  };
}
