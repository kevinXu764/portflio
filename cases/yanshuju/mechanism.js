export function renderMechanism(shot){return `
<section id="yd-mechanism" class="yd-section yd-mechanism">
 <header class="yd-heading"><h2>AI 分析机制</h2><p>AI 选择组件，系统校验并绑定数据，再把结论、图表与追问放回对话。</p></header>
 <figure class="yd-generation-flow" aria-label="从用户提问到图表回复的生成链路">
  <div><strong>用户提问</strong><p>明确对象、问题与条件</p></div><div><strong>AI 选择组件</strong><p>输出类型与结构化参数</p></div><div><strong>系统校验取数</strong><p>核对字段、年份与口径</p></div><div><strong>对话内呈现</strong><p>结论、图表、依据与追问</p></div>
 </figure>
 <p class="yd-mechanism-question">以“比较三个专业的学费，预算最多 6 万元”为例：</p>
 <div class="yd-generation-board">
  <div class="yd-generation-spec">
   <div class="yd-component-instruction"><h3>组件指令</h3>
   <dl class="yd-component-spec"><div><dt>组件类型</dt><dd>学费与学制 · cost</dd></div><div><dt>比较对象</dt><dd>同济设计、江南设计、苏大设计</dd></div><div><dt>资料年份</dt><dd>2026 年</dd></div><div><dt>预算参数</dt><dd>60,000 元 · 预览</dd></div><div><dt>绑定字段</dt><dd>全程学费、学制、资料来源</dd></div></dl></div>
   <div class="yd-component-map"><h3>问题与组件对应</h3><dl><div><dt>投入对比</dt><dd>费用条形图与学制</dd></div><div><dt>历年变化</dt><dd>分数线折线、人数柱状图</dd></div><div><dt>准备要求</dt><dd>科目与材料对照表</dd></div><div><dt>偏好表达</dt><dd>重要程度量表</dd></div><div><dt>条件调整</dt><dd>候选变化预览</dd></div></dl></div>
  </div>
  <figure class="yd-reply-anatomy" aria-label="一条包含分析组件的 AI 回复结构">
   <div class="yd-reply-heading">小研 <span>AI 回复</span></div>
   <div class="yd-reply-part"><strong>结论</strong><p>按全程学费比较，江南和苏大在 6 万元预算内，同济高于预算。</p></div>
   <div class="yd-reply-part yd-reply-chart"><strong>图表</strong>${shot('mechanism-chart','数据层提供数值，组件按统一刻度绘制')}<p class="yd-reply-source">依据：2026 年专业资料 · 全程学费与学制</p></div>
   <div class="yd-reply-part"><strong>追问</strong><p>保留 6 万元预算，还是继续了解同济的培养内容？</p></div>
  </figure>
 </div>
 <div class="yd-rule-design">
  <header><h3>输出约束</h3><p>产品规则优先，任务与回复在既定权限内执行。</p></header>
  <ol class="yd-rule-stack"><li><strong>产品规则</strong><p>只使用预设组件与数据字段；不补造数字，不推断录取概率。</p></li><li><strong>本轮任务</strong><p>沿用所选专业、年份与口径；对象不明先追问，口径不齐先核对。</p></li><li><strong>单次回复</strong><p>结论、图表与依据一起呈现，再提出追问；建议先预览，条件变更由用户确认。</p></li></ol>
 </div>
 <div class="yd-mechanism-states">
  <h3>遇到不确定时</h3>
  <dl class="yd-exception-list"><div><dt>对象不明</dt><dd>“设计专业哪个更好？”先确认交互设计、视觉传达或产品设计方向。</dd></div><div><dt>口径不齐</dt><dd>按学年与按全程收费时，先核对学制，再比较全程投入。</dd></div><div><dt>条件改变</dt><dd>预算 6 万元改为 9 万元，候选从 19 增至 21 个专业；展示影响，等待用户确认。</dd></div></dl>
 </div>
</section>`}
