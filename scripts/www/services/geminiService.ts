
import { GoogleGenAI, Type } from "@google/genai";
import { SimulationResult, LotteryType, GameConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzeSimulation(
  type: LotteryType,
  config: GameConfig,
  result: SimulationResult
): Promise<string> {
  const prompt = `
    作为一名高级统计学家和博弈论专家，请分析以下经过“环境因子干预”的彩票模拟结果。
    
    游戏名称: ${config.name}
    模拟方法: 深度马尔可夫链蒙特卡洛 (MCMC)
    模拟样本: ${result.simulationCount.toLocaleString()} 次
    应用环境因子:
    - 奇偶目标比: ${(result.appliedFactors.parityTarget * 100).toFixed(0)}%
    - 质数权重提升: ${result.appliedFactors.primeBias.toFixed(2)}x
    - 连号趋势权重: ${result.appliedFactors.consecutiveWeight.toFixed(2)}
    
    推荐号码组合: ${result.topNumbers.join(', ')} ${result.extraNumbers ? ` | 特别号: ${result.extraNumbers.join(', ')}` : ''}
    
    请结合这些特定的环境干预因子，评价该推荐组合的统计意义，并向用户解释这种模拟如何反映了网络上常见的“走势分析”观点。最后请强调彩票的独立随机本质和理性娱乐。
    输出要求：使用 Markdown 格式，语气严谨且专业。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.75,
        topP: 0.9,
      }
    });
    return response.text || "分析生成失败。";
  } catch (error) {
    console.error("AI Analysis error:", error);
    return "AI 分析暂不可用。";
  }
}
