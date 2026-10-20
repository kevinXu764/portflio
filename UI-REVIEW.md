# UI 迭代记录 · 2026-10-13

使用 ui-polish 技能，中等幅度调整主页面；此处记录首轮优化；当时保留五个项目和两套辅助方案。随后按用户要求仅保留 The Original 卡片网站，移除两套辅助方案及导航页。工作源来自登记的 Windows `WIN-BOG6EEAE2HG` / `Administrator`，目标目录为 `C:\Users\Administrator\Desktop\徐自泉文件\学习文件\exp\card`。本地实现与验证在 `/Users/iosdev/.cc-connect/work_dir/xuzq-codex/tasks/card-polish-20261013`。

## 单站整理 · v2.2

当前唯一入口为 `index.html`。主站导航链接及对应样式已移除；顶部在桌面和手机均显示作品集标识与动态按钮。辅助页面、共用源码、辅助脚本包和旧服务器脚本已移除，构建入口及使用说明同步精简。

最新截图：[桌面](outputs/original-only/desktop.png) · [手机](outputs/original-only/mobile.png)。验证记录：`outputs/original-only/results.json`。下方截图和四入口测试为移除前的历史记录。

## 基线问题与设计方向

| 位置 / 证据 | 调整 | 验收点 |
| --- | --- | --- |
| 1440px 桌面主区域仅 432px，卡片最大 352px | 灰色外边距、最大 1240px 白色画布，介绍和卡片双栏 | 同视口桌面前后图；卡片最大 560px |
| 首屏按钮漂浮在画布外；切换按钮首屏不可见 | 顶部导航与动态控制、底部固定切换、明确浏览入口 | 初始/选中状态与键盘操作 |
| 卡片 DPR 上限低、圆角曲线 4 段、线纹 UV 超出正确范围 | 保留 MSAA、受预算限制的 DPR≤2、12 段圆角、纹理过滤及 UV 修复 | 放大后的边缘和卡面线纹，移动端截图 |
| 白色背景缺少细节 | 低对比十字纹理，斜向无缝循环 | 可见移动、暂停、低动态模式；WebGL 静止不重绘 |
| 每帧重复写尺寸和状态，按住不动继续渲染 | 状态写入分离、按需调度、输入合帧 | 静止按压时渲染次数不再增长 |

## 主题参考（查看日期 2026-10-13）

1. [Portfolio / Minimap Progress Bar — Eduard Bodak](https://dribbble.com/shots/25990814-Portfolio-Minimap-Progress-Bar)：实际查看发布图中的浅色画布、灰色外场、边界对齐和紧凑编号。借鉴表面层级与计数秩序；本项目使用可读中文和 44px 操作按钮，不复制图中的极小字号。
2. [Ali Ali—Transition — Robbert Schefman / Exo Ape](https://dribbble.com/shots/13966270-Ali-Ali-Transition)：实际查看其左侧标题/说明、右侧主视觉及边缘导航的构图。借鉴双栏主次关系；本项目保留白底和彩色卡片，不采用照片和全黑品牌色。
3. [Ali Ali — Director’s Portfolio / Behance](https://www.behance.net/gallery/98991841/Ali-Ali-Directors-Portfolio)：已检索并打开作品页；Behance 原图下载受网络限制，视觉核查采用同作者/同项目的 Dribbble 发布图。未把文字摘要当作看图证据。
4. [Portfolio / Card Reveal on Scroll](https://dribbble.com/shots/25990452-Portfolio-Card-Reveal-on-Scroll)：作为主题检索候选；没有取得可核查原图，不用于声称验证滚动效果。

从参考到实现的四条规则：大画布留出外边距；让卡片成为唯一彩色焦点；标题/说明/操作保持同一左边线；纹理和辅助信息低于作品对比度。移动端重新排布，避免等比缩小桌面。

## 迭代与证据

- 第一轮：完成桌面构图、纹理、控件与卡片画质。截图发现首屏淡入时可产生短暂叠色；第二轮去掉卡面背景过渡，并在首帧准备好后直接显示卡片。
- 第二轮：降低纹理对比度，给切换计数增加不透明底色；修正带 hash 的详情返回和触控隐式捕获转交逻辑。
- 最终截图使用相同 Chrome 视口与 DPR=2：桌面 1440×900，手机 390×844。项目数据、初始卡堆、滚动位置一致；循环纹理位置属于动态差异。

[桌面修改前](outputs/ui-polish/before-desktop.png) · [桌面修改后](outputs/ui-polish/after-desktop.png) · [桌面选中项目](outputs/ui-polish/after-desktop-active.png) · [桌面详情](outputs/ui-polish/after-desktop-detail.png)

[手机修改前](outputs/ui-polish/before-mobile.png) · [手机修改后](outputs/ui-polish/after-mobile.png) · [手机选中项目](outputs/ui-polish/after-mobile-active.png) · [320px 窄屏](outputs/ui-polish/after-320-active.png)

## 验证范围与限制

- 主页面检查宽度 320 / 390 / 768 / 900 / 1024 / 1440 / 1920px；检查横向溢出、卡片边界、切换、详情与返回。
- 键盘、滚轮、鼠标拖动、五个项目边界、详情下一个、Esc、直接 hash 链接、真实 touchStart/touchMove/touchEnd 事件链。
- 背景移动/暂停/系统低动态，主场景静止停帧，按住不动停帧，WebGL 不可用时仍可进入详情。
- 四个入口使用 file:// 打开；检查相互导航、辅助页翻面/详情/关闭、本地资源及外部请求。
- 无头环境的计时受运行负载影响，不据此承诺实机 FPS。对比采样中旧版静止按压仍产生渲染，新版为 0；画质提高同时保留按需渲染。Windows 回写另做 SHA-256 一致性检查。
- 当前没有完成所有浏览器和手机实机覆盖。保持示例项目内容，未添加真实 CMS 或外部数据服务。

检查结果：`outputs/ui-polish/main-results.json`、`static-access-results.json`、`performance-results.json`。
