
import { LotteryType, GameConfig } from './types';

export const GAME_CONFIGS: Record<LotteryType, GameConfig> = {
  [LotteryType.SUPER_LOTTO]: {
    name: '超级大乐透',
    description: '前区35选5，后区12选2',
    rules: {
      mainRange: [1, 35],
      mainCount: 5,
      extraRange: [1, 12],
      extraCount: 2
    }
  },
  [LotteryType.DOUBLE_COLOR]: {
    name: '双色球',
    description: '红球33选6，蓝球16选1',
    rules: {
      mainRange: [1, 33],
      mainCount: 6,
      extraRange: [1, 16],
      extraCount: 1
    }
  },
  [LotteryType.HAPPY_8]: {
    name: '快乐八 (选十)',
    description: '80选20开奖，模拟选十玩法',
    rules: {
      mainRange: [1, 80],
      mainCount: 10
    }
  }
};
