
import React, { useState, useCallback } from 'react';
import { LotteryType, SimulationResult } from './types';
import { GAME_CONFIGS } from './constants';
import { SimulationEngine } from './services/simulationEngine';
import { analyzeSimulation } from './services/geminiService';
import DistributionChart from './components/DistributionChart';
import { Activity, Brain, ShieldAlert, Zap, TrendingUp, Info } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LotteryType>(LotteryType.SUPER_LOTTO);
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');

  const runSimulation = useCallback(async () => {
    setIsSimulating(true);
    setResult(null);
    setAiAnalysis('');

    const config = GAME_CONFIGS[activeTab];
    
    try {
      const simResult = await SimulationEngine.simulate(activeTab, config, 1000000);
      setResult(simResult);
      const analysis = await analyzeSimulation(activeTab, config, simResult);
      setAiAnalysis(analysis);
    } catch (err) {
      console.error("Simulation failed:", err);
    } finally {
      setIsSimulating(false);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Activity size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
            MCMC 深度偏差实验室
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            基于马尔可夫链蒙特卡洛算法的百万级博弈仿真系统
          </p>
        </header>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {(Object.keys(GAME_CONFIGS) as LotteryType[]).map((type) => (
            <button
              key={type}
              onClick={() => { if(!isSimulating) { setActiveTab(type); setResult(null); setAiAnalysis(''); } }}
              className={`px-8 py-3 rounded-2xl font-bold transition-all duration-300 border ${
                activeTab === type 
                ? 'bg-cyan-600 border-cyan-400 text-white shadow-lg shadow-cyan-900/40' 
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
              } ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {GAME_CONFIGS[type].name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Config */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 rounded-3xl">
              <h2 className="text-xl font-bold mb-6 flex items-center text-slate-100">
                <Zap size={20} className="mr-2 text-cyan-400" /> 控制台
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">模拟深度</label>
                  <div className="text-3xl font-mono font-black text-white">1,000,000 <span className="text-sm text-slate-500 font-normal">ITERATIONS</span></div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase block">活跃环境因子</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['热冷号偏置 1.45x', '动态奇偶平衡', '马尔可夫连号加权', '质数迁移概率'].map(f => (
                      <div key={f} className="flex items-center text-sm text-slate-300 bg-slate-800/50 p-2 rounded-lg border border-slate-700/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 mr-2 shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={runSimulation}
                  disabled={isSimulating}
                  className={`w-full py-5 rounded-2xl font-black text-lg transition-all transform active:scale-95 ${
                    isSimulating 
                    ? 'bg-slate-800 text-slate-600 cursor-wait' 
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-xl shadow-cyan-500/20 hover:brightness-110'
                  }`}
                >
                  {isSimulating ? '正在执行百万次采样...' : '启动多因子深度模拟'}
                </button>
              </div>
            </div>

            {result && (
              <div className="glass-panel p-6 rounded-3xl border-l-4 border-amber-500">
                <h3 className="text-sm font-black text-amber-500 uppercase mb-4 flex items-center">
                  <TrendingUp size={16} className="mr-2" /> 环境快照
                </h3>
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>目标分布:</span>
                    <span className="text-white">{(result.appliedFactors.parityTarget * 100).toFixed(1)}% 奇数</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>质数增强:</span>
                    <span className="text-white">{result.appliedFactors.primeBias.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>处理耗时:</span>
                    <span className="text-white">{(result.runtimeMs / 1000).toFixed(2)}s</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl">
              <div className="flex items-start">
                <ShieldAlert size={18} className="text-amber-600 mr-3 mt-1 flex-shrink-0" />
                <p className="text-[11px] text-slate-500 leading-relaxed uppercase font-bold tracking-tighter">
                  法律免责：本工具仅供统计学研究。彩票为完全随机事件，任何模拟预测均无法改变其中奖概率。请保持理性，切勿沉迷。
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className="lg:col-span-2 space-y-8">
            {isSimulating ? (
              <div className="glass-panel p-20 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                <div className="relative w-24 h-24 mb-8">
                   <div className="absolute inset-0 border-[6px] border-cyan-500/10 rounded-full"></div>
                   <div className="absolute inset-0 border-[6px] border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(6,182,212,0.3)]"></div>
                </div>
                <h3 className="text-3xl font-black mb-4 text-white">正在构建概率矩阵</h3>
                <p className="text-slate-500 max-w-sm font-medium">系统正在根据预设的环境偏差因子，在 MCMC 模型下进行百万次随机行走采样...</p>
              </div>
            ) : result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Result Card */}
                <div className="glass-panel p-8 rounded-[2.5rem] border-l-8 border-cyan-500 shadow-2xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                      <h3 className="text-2xl font-black text-white">推荐最优模拟组合</h3>
                      <p className="text-sm text-slate-500 font-bold uppercase mt-1">基于百万次采样中出现频率最高的号码</p>
                    </div>
                    <div className="px-4 py-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400 text-xs font-black">
                      MATCH PROBABILITY OPTIMIZED
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex flex-wrap gap-3">
                      {result.topNumbers.map((num) => (
                        <div key={`main-${num}`} className="lottery-ball red-ball text-white">
                          {num.toString().padStart(2, '0')}
                        </div>
                      ))}
                    </div>
                    {result.extraNumbers && (
                      <>
                        <div className="h-10 w-px bg-slate-800 mx-2 hidden md:block"></div>
                        <div className="flex flex-wrap gap-3">
                          {result.extraNumbers.map((num) => (
                            <div key={`extra-${num}`} className="lottery-ball blue-ball text-white">
                              {num.toString().padStart(2, '0')}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Chart Card */}
                <div className="glass-panel p-8 rounded-[2.5rem]">
                  <div className="flex items-center mb-6">
                    <TrendingUp className="text-cyan-400 mr-2" size={20} />
                    <h3 className="text-xl font-black text-slate-100">偏差影响热图</h3>
                  </div>
                  <DistributionChart data={result.distribution} highlighted={result.topNumbers} />
                  <div className="mt-6 flex items-start p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30">
                    <Info size={16} className="text-slate-500 mr-3 mt-1" />
                    <p className="text-xs text-slate-500 leading-normal">
                      上图展示了数字分布的非均匀性。在应用环境因子后，部分号码（金色标记）在模拟中表现出显著的统计学优势，这反映了走势分析中的“热号倾向”。
                    </p>
                  </div>
                </div>

                {/* AI Analysis */}
                {aiAnalysis && (
                  <div className="glass-panel p-8 rounded-[2.5rem] bg-indigo-500/[0.03] border-t-2 border-indigo-500/30">
                    <h3 className="text-xl font-black mb-6 flex items-center text-indigo-400">
                      <Brain size={24} className="mr-3" /> 专家分析报告
                    </h3>
                    <div className="prose prose-invert max-w-none text-slate-400 leading-relaxed text-sm font-medium">
                      {aiAnalysis.split('\n').map((line, i) => (
                        <p key={i} className="mb-3">{line}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="glass-panel p-24 rounded-[2.5rem] flex flex-col items-center justify-center text-center opacity-40">
                <div className="p-8 rounded-full bg-slate-900 mb-8">
                  <Activity size={64} className="text-slate-700" />
                </div>
                <h3 className="text-3xl font-black text-slate-400 uppercase tracking-widest">系统待机中</h3>
                <p className="text-slate-600 mt-4 max-w-xs mx-auto">请在左侧选择彩票种类并启动深度模拟引擎</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
