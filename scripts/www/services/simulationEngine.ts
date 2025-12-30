
import { LotteryType, GameConfig, SimulationResult, SimulationFactors } from '../types';

export class SimulationEngine {
  
  private static isPrime(num: number): boolean {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i = i + 6)
      if (num % i === 0 || num % (i + 2) === 0) return false;
    return true;
  }

  private static getPrimeMap(max: number): Uint8Array {
    const primes = new Uint8Array(max + 1);
    for (let i = 1; i <= max; i++) {
      if (this.isPrime(i)) primes[i] = 1;
    }
    return primes;
  }

  private static generateFactors(config: GameConfig): SimulationFactors {
    const [min, max] = config.rules.mainRange;
    const allNums = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    const shuffled = [...allNums].sort(() => Math.random() - 0.5);
    
    return {
      hotNumbers: shuffled.slice(0, Math.floor(allNums.length * 0.2)),
      coldNumbers: shuffled.slice(-Math.floor(allNums.length * 0.2)),
      primeBias: 1.2 + Math.random() * 0.3,
      parityTarget: 0.4 + Math.random() * 0.2, 
      consecutiveWeight: 0.7 + Math.random() * 0.6
    };
  }

  // 优化后的核心采样函数
  private static generateBiasedNumbers(
    range: [number, number],
    count: number,
    factors: SimulationFactors,
    primeMap: Uint8Array,
    hotSet: Set<number>,
    coldSet: Set<number>
  ): number[] {
    const [min, max] = range;
    const result: number[] = [];
    const poolSize = max - min + 1;
    const used = new Uint8Array(max + 1);
    
    let currentOddCount = 0;

    for (let step = 0; step < count; step++) {
      let totalWeight = 0;
      const candidates: number[] = [];
      const weights: number[] = [];

      // 仅遍历有效池，减少无效计算
      for (let num = min; num <= max; num++) {
        if (used[num]) continue;
        
        let w = 1.0;
        if (hotSet.has(num)) w *= 1.5;
        if (coldSet.has(num)) w *= 0.6;
        if (primeMap[num]) w *= factors.primeBias;

        const isOdd = num % 2 !== 0;
        const currentOddRatio = step === 0 ? 0.5 : currentOddCount / step;
        if (isOdd) {
          w *= (currentOddRatio < factors.parityTarget) ? 1.6 : 0.7;
        } else {
          w *= (currentOddRatio >= factors.parityTarget) ? 1.6 : 0.7;
        }

        if (step > 0) {
          const last = result[step - 1];
          const diff = Math.abs(num - last);
          if (diff === 1) w *= factors.consecutiveWeight;
          else if (diff > 15) w *= 0.8;
        }

        candidates.push(num);
        weights.push(w);
        totalWeight += w;
      }

      let random = Math.random() * totalWeight;
      let selected = candidates[0];
      for (let i = 0; i < weights.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          selected = candidates[i];
          break;
        }
      }

      if (selected % 2 !== 0) currentOddCount++;
      used[selected] = 1;
      result.push(selected);
    }

    return result.sort((a, b) => a - b);
  }

  public static async simulate(
    type: LotteryType,
    config: GameConfig,
    iterations: number = 1000000
  ): Promise<SimulationResult> {
    const startTime = performance.now();
    const factors = this.generateFactors(config);
    const primeMap = this.getPrimeMap(config.rules.mainRange[1]);
    const hotSet = new Set(factors.hotNumbers);
    const coldSet = new Set(factors.coldNumbers);
    
    const mainFreq = new Int32Array(config.rules.mainRange[1] + 1);
    const extraFreq = new Int32Array((config.rules.extraRange?.[1] || 0) + 1);

    // 每批次 10000 次，提高 UI 响应频率
    const batchSize = 10000;
    const totalBatches = iterations / batchSize;

    for (let b = 0; b < totalBatches; b++) {
      for (let i = 0; i < batchSize; i++) {
        const mainSet = this.generateBiasedNumbers(config.rules.mainRange, config.rules.mainCount, factors, primeMap, hotSet, coldSet);
        for (let j = 0; j < mainSet.length; j++) mainFreq[mainSet[j]]++;

        if (config.rules.extraRange && config.rules.extraCount) {
          const extraSet = this.generateBiasedNumbers(config.rules.extraRange, config.rules.extraCount, factors, primeMap, new Set(), new Set());
          for (let j = 0; j < extraSet.length; j++) extraFreq[extraSet[j]]++;
        }
      }
      // 释放主线程，防止浏览器卡死
      await new Promise(r => setTimeout(r, 0));
    }

    const getTop = (freqArray: Int32Array, count: number) => {
      return Array.from(freqArray.entries())
        .filter(([num, _]) => num > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(item => item[0])
        .sort((a, b) => a - b);
    };

    const distribution: Record<number, number> = {};
    for (let n = 1; n < mainFreq.length; n++) {
      distribution[n] = mainFreq[n];
    }

    return {
      topNumbers: getTop(mainFreq, config.rules.mainCount),
      extraNumbers: config.rules.extraRange ? getTop(extraFreq, config.rules.extraCount!) : undefined,
      distribution,
      simulationCount: iterations,
      runtimeMs: performance.now() - startTime,
      appliedFactors: factors
    };
  }
}
