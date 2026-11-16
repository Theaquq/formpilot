import { analyzePostureImages, analyzePractice } from './analysis.js';
import { buildPlan } from './exercises.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const e = (value = '') => String(value).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));

const paths = {
  shield: '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z"/><path d="m9 12 2 2 4-4"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3"/>',
  upload: '<path d="M12 13V3"/><path d="m7 8 5-5 5 5"/><path d="M20 15v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/>',
  plan: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h4"/>',
  score: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  alert: '<path d="M10.3 3.6 2.4 18a2 2 0 0 0 1.8 3h15.6a2 2 0 0 0 1.8-3L13.7 3.6a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  print: '<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  refresh: '<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 8a7 7 0 0 1 11.8-2L20 8M4 16l2.1 2a7 7 0 0 0 11.8-2"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  video: '<rect x="3" y="5" width="14" height="14" rx="2"/><path d="m17 10 5-3v10l-5-3"/>',
  play: '<circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4Z"/>',
  trash: '<path d="M3 6h18M8 6V3h8v3M19 6l-1 15H6L5 6M10 11v5M14 11v5"/>',
  spark: '<path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3ZM19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/>'
};
function icon(name, size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.info}</svg>`;
}

const viewDefs = [
  { id: 'front', name: '正面照', hint: '面向镜头' },
  { id: 'back', name: '背面照', hint: '背向镜头' },
  { id: 'left', name: '左侧面照', hint: '身体左侧朝镜头' },
  { id: 'right', name: '右侧面照', hint: '身体右侧朝镜头' }
];
const stepDefs = [
  { id: 1, name: '体态评估', sub: '上传四视图', icon: 'scan' },
  { id: 2, name: '训练计划', sub: '针对性普拉提', icon: 'plan' },
  { id: 3, name: '动作纠错', sub: '照片或视频评分', icon: 'score' },
  { id: 4, name: '完整报告', sub: '汇总与导出', icon: 'file' }
];
function freshState() {
  return {
    step: 1,
    uploads: {},
    assessment: null,
    preferences: { level: 'beginner', duration: 20, goal: '改善体态与肩颈控制' },
    plan: [],
    practice: {},
    activeExercise: null,
    busy: false,
    busyText: ''
  };
}
let state = freshState();

function brandMarkup() {
  return `<div class="brand"><div class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></div><div><div class="brand-name">形体智练</div><div class="brand-en">FormPilot</div></div></div>`;
}
function render() {
  const hasProgress = state.step > 1 || Object.keys(state.uploads).length > 0;
  $('#app').innerHTML = `
    <header class="topbar">
      ${brandMarkup()}
      <div class="topbar-actions">
        <span class="local-badge"><span class="local-dot"></span>媒体仅在本地浏览器分析</span>
        ${hasProgress ? `<button class="btn btn-ghost btn-icon" data-action="reset" title="重新开始">${icon('refresh', 17)}</button>` : ''}
      </div>
    </header>
    <div class="workspace">
      ${renderSidebar()}
      <main class="main">${renderCurrentStep()}</main>
    </div>
    ${state.busy ? renderBusy() : ''}`;
}
function renderSidebar() {
  return `<aside class="sidebar">
    <div class="sidebar-kicker">Your posture journey</div>
    <div class="sidebar-title">四步完成<br>科学形体管理</div>
    <div class="step-list">${stepDefs.map(step => {
      const cls = state.step === step.id ? 'active' : state.step > step.id ? 'done' : '';
      return `<div class="step-item ${cls}">
        <span class="step-number">${state.step > step.id ? icon('check', 15) : `0${step.id}`}</span>
        <span class="step-name">${step.name}<span class="step-sub">${step.sub}</span></span>
        ${state.step < step.id ? icon('lock', 13) : state.step === step.id ? icon('arrow', 14) : ''}
      </div>`;
    }).join('')}</div>
    <div class="sidebar-note"><strong>${icon('shield', 14)} 隐私与安全</strong>照片、视频不会上传服务器。评估仅作训练参考，不替代医疗诊断。</div>
  </aside>`;
}
function renderCurrentStep() {
  if (state.step === 2) return renderPlanStep();
  if (state.step === 3) return renderPracticeStep();
  if (state.step === 4) return renderReportStep();
  return state.assessment ? renderAssessment() : renderPhotoUpload();
}
function heading(kicker, title, description, meta = '') {
  return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p class="page-description">${description}</p></div>${meta ? `<div class="heading-meta">${meta}</div>` : ''}</div>`;
}
function renderPhotoUpload() {
  const count = viewDefs.filter(v => state.uploads[v.id]).length;
  const fingerprints = Object.values(state.uploads).map(x => x.fingerprint);
  const hasDuplicate = new Set(fingerprints).size !== fingerprints.length;
  return `${heading('Step 01 · Posture screening', '先了解身体，再开始训练', '请上传自然站立的四视图。系统通过 MediaPipe 提取人体关键点，计算角度与距离比例，不靠主观目测。', `${count} / 4 张照片`)}
    <section class="card section-card">
      <div class="section-head"><div><h2>上传体态照片</h2><p>请穿紧身、贴身的运动衣物，保证肩颈、躯干和腿部轮廓清晰。</p></div><span class="section-index">JPG / PNG / WebP</span></div>
      <div class="notice info">${icon('camera')}<div><strong>拍摄前请准备</strong>赤脚自然站立，不要刻意挺胸或收腹；全身入镜、镜头水平、光线均匀。四张照片尽量使用相同距离和机位高度。</div></div>
      ${hasDuplicate ? `<div class="notice warning">${icon('alert')}<div><strong>检测到重复照片</strong>不同视角不能使用同一个文件，请更换后再分析。</div></div>` : ''}
      <div class="upload-grid">${viewDefs.map(renderUploadCard).join('')}</div>
      <div class="photo-guide">
        <div class="guide-item">${icon('user', 18)}<div><strong>全身完整入镜</strong>头顶到脚底均不可裁切，双臂自然下垂。</div></div>
        <div class="guide-item">${icon('scan', 18)}<div><strong>减少识别干扰</strong>头发扎起，避免宽松衣物、强逆光和复杂遮挡。</div></div>
        <div class="guide-item">${icon('shield', 18)}<div><strong>本地隐私处理</strong>图片只在当前浏览器内解码分析，刷新后自动清除。</div></div>
      </div>
      <div class="action-bar"><span class="action-hint">${count < 4 ? `还需上传 ${4 - count} 张照片，完成后才能评估` : hasDuplicate ? '请先替换重复照片' : '照片已齐全，可以开始量化评估'}</span><button class="btn btn-primary btn-large" data-action="analyze-posture" ${count < 4 || hasDuplicate ? 'disabled' : ''}>${icon('scan')}开始体态评估${icon('arrow')}</button></div>
    </section>`;
}
function renderUploadCard(view) {
  const item = state.uploads[view.id];
  return `<div class="upload-card">
    <input class="upload-input" id="upload-${view.id}" type="file" accept="image/jpeg,image/png,image/webp" data-upload-view="${view.id}" />
    <label class="upload-label ${item ? 'has-file' : ''}" for="upload-${view.id}">
      <div class="upload-preview">${item ? `<img src="${e(item.url)}" alt="${view.name}预览">` : `<div class="upload-placeholder"><span class="upload-icon">${icon('camera', 21)}</span><span class="upload-view-name">${view.hint}</span><span class="small">点击上传</span></div>`}</div>
      <div class="upload-footer"><span class="upload-title">${view.name}</span><span class="upload-status ${item ? 'ready' : ''}">${item ? `${icon('checkCircle', 14)} 已添加` : '待上传'}</span></div>
    </label>
  </div>`;
}
function statusTag(status, customText = '') {
  const good = ['good', 'normal', 'pass', '正常'].includes(status);
  const bad = ['bad', 'issue', '异常'].includes(status);
  const cls = good ? 'good' : bad ? 'bad' : ['warn', 'attention', 'warning', '关注'].includes(status) ? 'warn' : 'neutral';
  const text = customText || (good ? '未见异常' : bad ? '需关注' : cls === 'warn' ? '需复核' : '参考');
  return `<span class="tag ${cls}">${e(text)}</span>`;
}
function confidenceText(value) {
  return typeof value === 'number' ? `${Math.round(value <= 1 ? value * 100 : value)}%` : e(value || '中等');
}
function renderAssessment() {
  const a = state.assessment;
  return `${heading('Step 01 · Assessment report', '你的体态量化初筛报告', '结果来自四视图关键点指标。筛查用于发现姿势倾向，不作为疾病诊断或疗效承诺。', `识别可信度 ${confidenceText(a.confidence)}`)}
    <div class="summary-banner"><div><h2>${a.findings.length ? `发现 ${a.findings.length} 项需要关注的姿势倾向` : '未发现达到筛查阈值的明显偏移'}</h2><p>${a.findings.length ? '训练计划将只针对有数据支持的项目生成。' : '将生成以肩胛稳定、核心控制为主的基础计划。'}</p></div><div class="summary-count"><div><strong>${a.findings.length}</strong><span>关注项</span></div></div></div>
    <section class="card section-card"><div class="section-head"><div><h2>量化指标</h2><p>所有数值均为二维图像估算，角度与比例用于筛查参考。</p></div><span class="section-index">MediaPipe Pose</span></div>
      <div class="metric-table-wrap"><table class="metric-table"><thead><tr><th>评估指标</th><th>测量结果</th><th>筛查参考</th><th>结论</th></tr></thead><tbody>${a.metrics.map(m => `<tr><td><strong>${e(m.label)}</strong>${m.note ? `<div class="small muted">${e(m.note)}</div>` : ''}</td><td>${e(m.value)}</td><td class="muted">${e(m.reference)}</td><td>${statusTag(m.status, m.statusText)}</td></tr>`).join('')}</tbody></table></div>
    </section>
    <section class="card section-card"><div class="section-head"><div><h2>问题与可能影响</h2><p>“可能影响”表示长期保持该姿势时的风险，不代表已经出现症状。</p></div></div>
      ${a.findings.length ? `<div class="finding-list">${a.findings.map(f => `<article class="finding-item"><div class="finding-top"><h3>${e(f.title)}</h3>${statusTag('warn', f.severity === 'mild' ? '轻度倾向' : '需要关注')}</div><p><strong>数据依据：</strong>${e(f.evidence)}</p><p><strong>可能影响：</strong>${e(f.impact)}</p></article>`).join('')}</div>` : `<div class="empty-state"><div class="empty-icon">${icon('checkCircle', 25)}</div><h3>当前指标未见明确异常</h3><p>不强行贴体态标签，后续以对称控制和稳定训练为主。</p></div>`}
    </section>
    <section class="card section-card"><div class="section-head"><div><h2>评估边界</h2><p>以下项目不能通过本次照片直接确诊。</p></div></div><ul class="limitation-list">${a.limitations.map(x => `<li>${e(x)}</li>`).join('')}</ul><div class="notice warning" style="margin:18px 0 0">${icon('alert')}<div>若存在持续疼痛、麻木、明显脊柱畸形或近期损伤，请先咨询医生或专业康复人员。</div></div>
      <div class="action-bar"><span class="action-hint">确认报告后才会生成训练计划，不能跳过本步骤</span><button class="btn btn-primary btn-large" data-action="confirm-assessment">确认报告，生成训练计划${icon('arrow')}</button></div>
    </section>`;
}
function renderPlanStep() {
  const p = state.preferences;
  return `${heading('Step 02 · Personalized Pilates', '你的针对性普拉提计划', '计划仅围绕评估中有依据的姿势倾向生成。先熟悉动作，再进入拍照或视频纠错。', `${state.plan.length} 个动作`)}
    <section class="card section-card">
      <div class="section-head"><div><h2>训练设置</h2><p>调整后计划会即时更新，不修改已确认的体态报告。</p></div><span class="section-index">居家 · 无器械</span></div>
      <div class="preferences">
        <div class="field"><label for="pref-level">训练基础</label><select id="pref-level" data-pref="level"><option value="beginner" ${p.level === 'beginner' ? 'selected' : ''}>新手，以稳定控制为主</option><option value="experienced" ${p.level === 'experienced' ? 'selected' : ''}>有训练经验，可增加组数</option></select></div>
        <div class="field"><label for="pref-duration">单次可用时长</label><select id="pref-duration" data-pref="duration"><option value="15" ${p.duration === 15 ? 'selected' : ''}>约 15 分钟</option><option value="20" ${p.duration === 20 ? 'selected' : ''}>约 20 分钟</option><option value="30" ${p.duration === 30 ? 'selected' : ''}>约 30 分钟</option></select></div>
        <div class="field"><label for="pref-goal">主要目标</label><select id="pref-goal" data-pref="goal"><option ${p.goal === '改善体态与肩颈控制' ? 'selected' : ''}>改善体态与肩颈控制</option><option ${p.goal === '提升核心与全身稳定' ? 'selected' : ''}>提升核心与全身稳定</option><option ${p.goal === '放松紧张与恢复活动度' ? 'selected' : ''}>放松紧张与恢复活动度</option></select></div>
      </div>
      <div class="plan-meta"><span>${icon('timer', 15)}每次约 ${p.duration} 分钟</span><span>${icon('target', 15)}每周建议 4 次</span><span>${icon('shield', 15)}低冲击 · 无负重</span></div>
    </section>
    <section class="card section-card"><div class="section-head"><div><h2>动作安排</h2><p>展开每个动作查看完整做法、停留时间与标准要点。</p></div><span class="section-index">先质量，后次数</span></div>
      <div class="plan-list">${state.plan.map((ex, i) => renderExerciseCard(ex, i)).join('')}</div>
      <div class="notice warning" style="margin:20px 0 0">${icon('alert')}<div>训练中不应出现疼痛、麻木或眩晕。出现不适请立即停止，不要强压肩颈或追求过大幅度。</div></div>
      <div class="action-bar"><span class="action-hint">请先熟悉并尝试以上动作，确认可无痛完成</span><button class="btn btn-primary btn-large" data-action="confirm-plan">开始动作练习与纠错${icon('arrow')}</button></div>
    </section>`;
}
function renderExerciseCard(ex, i, open = false) {
  return `<details class="exercise-card" ${open ? 'open' : ''}><summary class="exercise-summary"><span class="exercise-number">${String(i + 1).padStart(2, '0')}</span><div class="exercise-title"><h3>${e(ex.name)}</h3><p>${e(ex.category)} · ${e(ex.target)}</p></div><div class="exercise-dose">${e(ex.dose)}</div></summary><div class="exercise-detail"><div><h4>动作做法</h4><ol>${ex.steps.map(x => `<li>${e(x)}</li>`).join('')}</ol></div><div><h4>标准要点</h4><ul>${ex.keyPoints.map(x => `<li>${e(x)}</li>`).join('')}</ul></div><div class="exercise-tags"><span>停留 ${e(ex.hold || '按动作节奏')}</span><span>组数 ${e(ex.sets)} 组</span>${ex.commonErrors.slice(0, 2).map(x => `<span>避免：${e(x)}</span>`).join('')}</div></div></details>`;
}
function currentExercise() {
  return state.plan.find(x => x.id === state.activeExercise) || state.plan[0];
}
function renderPracticeStep() {
  const ex = currentExercise();
  const entry = state.practice[ex.id] || {};
  const scoredCount = state.plan.filter(x => state.practice[x.id]?.result).length;
  const allScored = scoredCount === state.plan.length;
  return `${heading('Step 03 · Movement review', '对照标准，完成动作纠错', '逐个动作上传练习照片或视频。系统只评价当前媒体中可观察的内容，不会凭空判断呼吸或遮挡关节。', `${scoredCount} / ${state.plan.length} 已评分`)}
    <div class="practice-tabs">${state.plan.map((item, i) => `<button class="practice-tab ${item.id === ex.id ? 'active' : ''} ${state.practice[item.id]?.result ? 'scored' : ''}" data-action="select-exercise" data-id="${item.id}">${state.practice[item.id]?.result ? icon('checkCircle', 14) : `<span>${i + 1}</span>`}${e(item.name)}</button>`).join('')}</div>
    <div class="practice-layout">
      <section class="standard-panel"><span class="tag">标准动作 ${String(state.plan.indexOf(ex) + 1).padStart(2, '0')}</span><h2>${e(ex.name)}</h2><p class="standard-target">${e(ex.target)}</p><div class="standard-dose"><strong>训练剂量</strong><br>${e(ex.dose)} · 端点停留 ${e(ex.hold || '按节奏')} · 组数 ${e(ex.sets)} 组</div><ol>${ex.steps.map(x => `<li>${e(x)}</li>`).join('')}</ol><div class="standard-cues"><strong>评分重点</strong>${ex.keyPoints.map(x => `<span>· ${e(x)}</span>`).join('')}</div></section>
      <section class="upload-panel"><div class="section-head"><div><h3>上传本动作练习媒体</h3><p>${e(ex.mediaTip)}</p></div><span class="section-index">照片 / 视频</span></div>
        <input class="upload-input" id="practice-file" type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" data-practice-file />
        <label for="practice-file" class="practice-drop ${entry.file ? 'has-media' : ''}">${renderPracticeMedia(entry)}</label>
        ${entry.file ? `<div class="practice-file-info"><span>${icon(entry.mediaType === 'video' ? 'video' : 'image', 15)} ${e(entry.file.name)}</span><button class="btn btn-ghost btn-icon" data-action="remove-practice" title="移除媒体">${icon('trash', 15)}</button></div>` : ''}
        <div class="notice info" style="margin:14px 0 0">${icon('info')}<div>照片采用静态评分，视频采用动态评分；两种分数的评价维度不同。</div></div>
        <div class="practice-actions"><label for="practice-file" class="btn btn-secondary">${icon('upload')}${entry.file ? '更换媒体' : '选择媒体'}</label><button class="btn btn-primary" data-action="analyze-practice" ${!entry.file ? 'disabled' : ''}>${icon('scan')}${entry.result ? '重新评分' : '开始评分'}</button></div>
      </section>
    </div>
    ${entry.result ? renderScore(entry.result) : ''}
    <div class="action-bar"><span class="action-hint">${allScored ? '全部动作已完成评分，可以生成完整报告' : `还有 ${state.plan.length - scoredCount} 个动作未评分，不能提前生成报告`}</span><button class="btn btn-primary btn-large" data-action="confirm-scores" ${!allScored ? 'disabled' : ''}>确认评分，生成完整报告${icon('arrow')}</button></div>`;
}
function renderPracticeMedia(entry) {
  if (!entry.file) return `<div class="practice-placeholder"><span class="upload-icon">${icon('upload', 22)}</span><strong>上传练习照片或视频</strong><p>建议视频连续记录 3–5 次动作<br>全身入镜，固定机位，避免关键关节被遮挡</p><span class="tag neutral">图片 ≤ 15MB · 视频 ≤ 100MB</span></div>`;
  if (entry.mediaType === 'video') return `<video src="${e(entry.url)}" controls playsinline muted></video>`;
  return `<img src="${e(entry.url)}" alt="练习动作预览">`;
}
function renderScore(result) {
  const circumference = 2 * Math.PI * 45;
  const offset = circumference * (1 - result.score / 100);
  return `<section class="score-card"><div class="section-head"><div><h2>动作评分结果</h2><p>${result.mediaType === 'video' ? `动态分析 · ${result.frameCount} 个采样帧` : '静态照片分析'} · 可信度 ${confidenceText(result.confidence)}</p></div><span class="tag ${result.score >= 85 ? 'good' : result.score >= 60 ? 'warn' : 'bad'}">${result.score >= 85 ? '动作较好' : result.score >= 60 ? '仍需调整' : '建议退阶练习'}</span></div>
    <div class="score-head"><div class="score-ring"><svg viewBox="0 0 110 110"><circle class="ring-bg" cx="55" cy="55" r="45"></circle><circle class="ring-value" cx="55" cy="55" r="45" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"></circle></svg><div class="score-number"><strong>${result.score}</strong><span>/ 100 分</span></div></div><div class="dimension-list">${result.dimensions.map(d => `<div class="dimension-row"><span>${e(d.name)}</span><div class="dimension-track"><div class="dimension-fill" style="width:${d.observed === false ? 0 : Math.max(0, d.score / d.max * 100)}%"></div></div><span class="dimension-score">${d.observed === false ? '不可判定' : `${d.score}/${d.max}`}</span></div>`).join('')}</div></div>
    ${result.errors.length ? `<div class="error-list">${result.errors.map(err => `<div class="error-item"><strong>${e(err.title)}</strong><p>${e(err.evidence)}</p><p><b>标准：</b>${e(err.standard)}</p></div>`).join('')}</div>` : `<div class="empty-state" style="margin-top:20px"><div class="empty-icon">${icon('checkCircle', 23)}</div><h3>未发现明显动作偏差</h3><p>继续保持当前排列与控制，注意不要在后续重复中耸肩。</p></div>`}
    ${result.corrections.length ? `<div class="correction-box"><strong>修正建议</strong><ul>${result.corrections.map(x => `<li>${e(x)}</li>`).join('')}</ul></div>` : ''}
  </section>`;
}
function renderReportStep() {
  return `${heading('Step 04 · Complete report', '完整形体训练报告已生成', '评估数据、训练计划和每个动作的评分纠错已汇总。可下载 HTML 存档，或打印为 PDF。', '流程已完成')}
    <div class="report-toolbar"><button class="btn btn-primary" data-action="export-report">${icon('download')}下载完整报告</button><button class="btn btn-white" data-action="print-report">${icon('print')}打印 / 保存 PDF</button><button class="btn btn-ghost" data-action="reset">${icon('refresh')}开始新评估</button></div>
    ${reportDocumentMarkup()}`;
}
function reportDocumentMarkup() {
  const a = state.assessment;
  const date = new Date().toLocaleString('zh-CN', { hour12: false });
  return `<article class="report-document" id="report-document">
    <div class="report-cover"><div><div class="eyebrow">FormPilot · Personal report</div><h1>形体塑身一体化报告</h1><p>生成时间：${date} · 体态评估 / 普拉提计划 / 动作纠错</p></div><div class="report-seal">LOCAL<br>ANALYSIS</div></div>
    <section class="report-section"><div class="report-section-title"><span class="report-section-number">01</span><h2>体态评估报告</h2></div>
      <div class="metric-table-wrap"><table class="metric-table"><thead><tr><th>指标</th><th>结果</th><th>筛查参考</th><th>结论</th></tr></thead><tbody>${a.metrics.map(m => `<tr><td>${e(m.label)}</td><td>${e(m.value)}</td><td>${e(m.reference)}</td><td>${e(m.statusText || m.status)}</td></tr>`).join('')}</tbody></table></div>
      ${a.findings.length ? `<div class="finding-list" style="margin-top:18px">${a.findings.map(f => `<div class="finding-item"><h3>${e(f.title)}</h3><p><strong>依据：</strong>${e(f.evidence)}</p><p><strong>可能影响：</strong>${e(f.impact)}</p></div>`).join('')}</div>` : `<div class="notice info" style="margin-top:18px">${icon('checkCircle')}<div>本次指标未发现达到筛查阈值的明显姿势偏移。</div></div>`}
      <ul class="limitation-list" style="margin-top:18px">${a.limitations.map(x => `<li>${e(x)}</li>`).join('')}</ul>
    </section>
    <section class="report-section"><div class="report-section-title"><span class="report-section-number">02</span><h2>个性化普拉提训练计划</h2></div><p class="muted">训练目标：${e(state.preferences.goal)} · 每周 4 次 · 每次约 ${state.preferences.duration} 分钟</p><div class="plan-list">${state.plan.map((ex, i) => renderExerciseCard(ex, i, true)).join('')}</div></section>
    <section class="report-section"><div class="report-section-title"><span class="report-section-number">03</span><h2>动作纠错评分结果</h2></div>
      <div class="report-score-table">${state.plan.map(ex => { const r = state.practice[ex.id].result; return `<div class="report-score-item"><strong>${r.score}<small>/100</small></strong><span>${e(ex.name)} · ${r.mediaType === 'video' ? '视频' : '照片'}</span></div>`; }).join('')}</div>
      ${state.plan.map(ex => { const r = state.practice[ex.id].result; return `<div class="report-section"><h3>${e(ex.name)} · ${r.score} 分</h3><p class="small muted">分析${r.mediaType === 'video' ? `视频 ${r.frameCount} 帧` : '静态照片'} · 可信度 ${confidenceText(r.confidence)}</p>${r.errors.length ? `<div class="error-list">${r.errors.map(err => `<div class="error-item"><strong>${e(err.title)}</strong><p>${e(err.evidence)}</p><p><b>标准：</b>${e(err.standard)}</p></div>`).join('')}</div>` : `<p class="muted">未发现明显动作偏差。</p>`}${r.corrections.length ? `<div class="correction-box"><strong>修正建议</strong><ul>${r.corrections.map(x => `<li>${e(x)}</li>`).join('')}</ul></div>` : ''}</div>`; }).join('')}
    </section>
    <footer class="report-footer">本报告由浏览器端 MediaPipe 关键点模型与规则量表生成，仅作训练和复评参考，不替代医疗诊断、影像学检查或专业康复治疗。如出现疼痛、麻木、眩晕或持续不适，请停止训练并寻求专业帮助。</footer>
  </article>`;
}
function renderBusy() {
  return `<div class="busy-overlay"><div class="busy-card"><div class="spinner"></div><h3>正在进行关键点分析</h3><p id="busy-text">${e(state.busyText || '首次运行需要加载姿态模型，请保持页面开启。')}</p><div class="progress-wrap"><div class="progress-track"><div class="progress-bar" id="busy-progress" style="width:8%"></div></div></div></div></div>`;
}
function setBusy(value, text = '') {
  state.busy = value;
  state.busyText = text;
  render();
}
function updateBusy(text, progress) {
  const label = $('#busy-text');
  if (label) label.textContent = text;
  if (typeof progress === 'number' && $('#busy-progress')) $('#busy-progress').style.width = `${Math.max(5, Math.min(100, progress <= 1 ? progress * 100 : progress))}%`;
}
function toast(message, type = '') {
  const item = document.createElement('div');
  item.className = `toast ${type}`;
  item.textContent = message;
  $('#toast-region').appendChild(item);
  setTimeout(() => item.remove(), 3600);
}
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('照片读取失败，请更换文件'));
    img.src = url;
  });
}
async function handlePostureAnalysis() {
  try {
    setBusy(true, '正在加载 MediaPipe 姿态模型，首次运行可能需要片刻…');
    const images = {};
    for (const view of viewDefs) images[view.id] = await loadImage(state.uploads[view.id].url);
    state.assessment = await analyzePostureImages(images, updateBusy);
    setBusy(false);
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error) {
    setBusy(false);
    toast(error.message || '分析失败，请检查网络与照片后重试', 'error');
  }
}
async function handlePracticeAnalysis() {
  const ex = currentExercise();
  const entry = state.practice[ex.id];
  if (!entry?.file) return;
  try {
    setBusy(true, '正在准备练习媒体…');
    entry.result = await analyzePractice(entry.file, ex, updateBusy);
    setBusy(false);
    render();
    setTimeout(() => $('.score-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  } catch (error) {
    setBusy(false);
    toast(error.message || '媒体分析失败，请更换照片或视频', 'error');
  }
}
function handleUpload(view, file) {
  if (!file || !file.type.startsWith('image/')) return toast('请选择 JPG、PNG 或 WebP 照片', 'error');
  if (file.size > 15 * 1024 * 1024) return toast('单张照片不能超过 15MB', 'error');
  const old = state.uploads[view];
  if (old) URL.revokeObjectURL(old.url);
  state.uploads[view] = { file, url: URL.createObjectURL(file), fingerprint: `${file.name}:${file.size}:${file.lastModified}` };
  render();
}
function handlePracticeFile(file) {
  const ex = currentExercise();
  if (!file || !/^(image|video)\//.test(file.type)) return toast('请选择照片或视频文件', 'error');
  const isVideo = file.type.startsWith('video/');
  const max = isVideo ? 100 * 1024 * 1024 : 15 * 1024 * 1024;
  if (file.size > max) return toast(isVideo ? '视频不能超过 100MB' : '照片不能超过 15MB', 'error');
  const old = state.practice[ex.id];
  if (old) URL.revokeObjectURL(old.url);
  state.practice[ex.id] = { file, url: URL.createObjectURL(file), mediaType: isVideo ? 'video' : 'image', result: null };
  render();
}
function exportReport() {
  const styles = `body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans SC',sans-serif;color:#17362e;line-height:1.65;max-width:1000px;margin:35px auto;padding:0 24px}h1,h2,h3{line-height:1.35}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:10px;border-bottom:1px solid #dfe4dd;font-size:13px}.report-cover{border-bottom:2px solid #183f35;margin-bottom:28px}.report-seal{display:none}.report-section{margin-top:30px}.report-section-title{display:flex;gap:10px;align-items:center}.report-section-number{background:#183f35;color:white;padding:4px 8px;border-radius:6px}.finding-item,.error-item,.correction-box{padding:14px;margin:10px 0;border-radius:10px;background:#f5f4ee}.error-item{background:#fff0ed}.correction-box{background:#eef3ec}.exercise-card{display:block;border:1px solid #dfe4dd;padding:16px;margin:12px 0;border-radius:10px}.exercise-summary{display:block}.exercise-number{font-weight:bold}.exercise-dose{font-weight:bold}.exercise-detail{display:block}.exercise-tags{display:flex;gap:8px;flex-wrap:wrap}.exercise-tags span{background:#f5f4ee;padding:4px 8px}.report-score-table{display:flex;gap:10px;flex-wrap:wrap}.report-score-item{border:1px solid #dfe4dd;padding:12px;min-width:130px}.report-score-item strong{font-size:25px;display:block}.report-footer{margin-top:30px;border-top:1px solid #ddd;padding-top:16px;font-size:12px;color:#587068}.muted{color:#587068}.small{font-size:12px}.eyebrow{font-size:11px;color:#d66f4b;letter-spacing:.1em}.metric-table-wrap{overflow:auto}@media print{body{margin:0}.exercise-card,.report-section{break-inside:avoid}}`;
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>形体塑身一体化报告</title><style>${styles}</style></head><body>${reportDocumentMarkup()}</body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `形体智练报告-${new Date().toISOString().slice(0, 10)}.html`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('完整报告已下载，可用浏览器打开或打印为 PDF');
}
function resetApp() {
  if (!window.confirm('确定重新开始吗？当前照片、评分和报告将被清除。')) return;
  Object.values(state.uploads).forEach(x => URL.revokeObjectURL(x.url));
  Object.values(state.practice).forEach(x => URL.revokeObjectURL(x.url));
  state = freshState();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('click', async event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'reset') return resetApp();
  if (action === 'analyze-posture') return handlePostureAnalysis();
  if (action === 'confirm-assessment') {
    state.plan = buildPlan(state.assessment, state.preferences);
    state.activeExercise = state.plan[0]?.id;
    state.step = 2;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (action === 'confirm-plan') {
    state.step = 3;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (action === 'select-exercise') {
    state.activeExercise = button.dataset.id;
    render();
  }
  if (action === 'analyze-practice') return handlePracticeAnalysis();
  if (action === 'remove-practice') {
    const ex = currentExercise();
    const entry = state.practice[ex.id];
    if (entry) URL.revokeObjectURL(entry.url);
    delete state.practice[ex.id];
    render();
  }
  if (action === 'confirm-scores') {
    if (!state.plan.every(x => state.practice[x.id]?.result)) return;
    state.step = 4;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  if (action === 'export-report') exportReport();
  if (action === 'print-report') window.print();
});

document.addEventListener('change', event => {
  const input = event.target;
  if (input.matches('[data-upload-view]')) handleUpload(input.dataset.uploadView, input.files[0]);
  if (input.matches('[data-practice-file]')) handlePracticeFile(input.files[0]);
  if (input.matches('[data-pref]')) {
    state.preferences[input.dataset.pref] = input.dataset.pref === 'duration' ? Number(input.value) : input.value;
    state.plan = buildPlan(state.assessment, state.preferences);
    state.activeExercise = state.plan[0]?.id;
    render();
  }
});

render();
