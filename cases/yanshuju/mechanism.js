export function renderMechanism(shot){return `
<section id="yd-mechanism" class="yd-section yd-mechanism">
 <header class="yd-heading"><h2>AI 分析机制</h2><p>AI 选择组件与参数，系统绑定数据；结论、图表和追问共同组成回复。</p></header>
 <figure class="yd-generation-flow" aria-label="从用户提问到图表回复的生成链路">
  <div><strong>用户提问</strong><p>明确对象、问题与条件</p></div><div><strong>AI 选择组件</strong><p>输出类型和结构化参数</p></div><div><strong>系统校验与取数</strong><p>核对字段、年份和口径</p></div><div><strong>对话内呈现</strong><p>结论、图表、依据与追问</p></div>
 </figure>
 <p class="yd-mechanism-question">“比较这三个专业的学费，预算最多 6 万元。”</p>
 <div class="yd-generation-board">
  <div class="yd-generation-spec">
   <h3>组件指令</h3>
   <dl class="yd-component-spec"><div><dt>组件类型</dt><dd>学费与学制 · cost</dd></div><div><dt>比较对象</dt><dd>同济设计、江南设计、苏大设计</dd></div><div><dt>资料年份</dt><dd>2026 年</dd></div><div><dt>预算参数</dt><dd>60,000 元 · 预览</dd></div><div><dt>绑定字段</dt><dd>全程学费、学制、资料来源</dd></div></dl>
   <div class="yd-component-map"><h3>问题决定组件</h3><dl><div><dt>投入对比</dt><dd>费用条形图与学制</dd></div><div><dt>历年变化</dt><dd>分数线折线、人数柱状图</dd></div><div><dt>准备要求</dt><dd>科目与材料对照表</dd></div><div><dt>偏好表达</dt><dd>重要程度量表</dd></div><div><dt>条件调整</dt><dd>候选变化预览</dd></div></dl></div>
  </div>
  <figure class="yd-reply-anatomy" aria-label="一条包含分析组件的 AI 回复结构">
   <div class="yd-reply-heading">小研 <span>AI 回复</span></div>
   <div class="yd-reply-part"><strong>结论</strong><p>按全程学费比较，江南和苏大在 6 万元预算内，同济高于预算。</p></div>
   <div class="yd-reply-part yd-reply-chart"><strong>图表</strong>${shot('mechanism-chart','数据层提供数值，组件按统一刻度绘制')}<p class="yd-reply-source">依据：2026 年专业资料 · 全程学费与学制</p></div>
   <div class="yd-reply-part"><strong>追问</strong><p>先保留 6 万元预算，还是继续了解同济的培养内容？</p></div>
  </figure>
 </div>
 <div class="yd-rule-design">
  <header><h3>规则从上到下约束输出</h3><p>产品规则优先于本轮任务，用户输入始终在既定权限内处理。</p></header>
  <ol class="yd-rule-stack"><li><strong>产品规则</strong><div><p>数值读取数据字段，组件来自预设类型。</p><p>限制：不补造缺失数字，不推断录取概率。</p></div></li><li><strong>本轮任务</strong><div><p>沿用已选专业、资料年份与统计口径。</p><p>限制：对象不明先追问，口径不齐先核对。</p></div></li><li><strong>单次回复</strong><div><p>说明发现，展示组件，保留依据，再提出追问。</p><p>限制：建议只生成预览，条件变更由用户确认。</p></div></li></ol>
 </div>
 <div class="yd-mechanism-states">
  <figure><figcaption>对象不明确时，先缩小问题</figcaption><div class="yd-rule-message"><p class="yd-sample-user">“设计专业哪个更好？”</p><p>你想先比较哪个方向？</p><div class="yd-static-options"><span>交互设计</span><span>视觉传达</span><span>产品设计</span></div></div></figure>
  <figure><figcaption>口径不一致时，先核对数据</figcaption><div class="yd-rule-message"><p class="yd-sample-user">“这两个专业哪个更便宜？”</p><p>一个按学年收费，一个按全程收费。先核对学制，再比较全程投入。</p><div class="yd-static-result">先核对学制与收费口径</div></div></figure>
  <figure><figcaption>条件改变时，先展示影响</figcaption><div class="yd-rule-message"><p class="yd-sample-user">“把预算改到 9 万元。”</p><dl class="yd-static-preview"><div><dt>全程学费上限</dt><dd>6 万元 → 9 万元</dd></div><div><dt>候选库当前范围</dt><dd>19 → 21 个专业</dd></div></dl><div class="yd-static-result">等待用户确认</div></div></figure>
 </div>
</section>`}
