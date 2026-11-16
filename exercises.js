export const EXERCISES = {
  breathing: {
    id: 'breathing',
    name: '肋廓呼吸放松',
    category: '呼吸与放松',
    target: '放松肩颈辅助呼吸肌，建立肋廓扩张与躯干稳定感',
    dose: '5–8个呼吸循环',
    hold: '吸气3–4秒，呼气4–6秒，全程不憋气',
    sets: 2,
    steps: [
      '仰卧屈膝或坐直，双脚有支撑，一手放上胸、一手放下肋廓。',
      '鼻吸时让肋廓向前、两侧及后方缓慢扩张，肩膀保持下沉。',
      '嘴或鼻缓慢呼气，感受下肋廓回落，不主动收腹到僵直。',
      '连续完成呼吸循环，结束前来一次自然呼吸。'
    ],
    keyPoints: [
      '肩颈放松，躯干保持稳定，呼气时肋廓缓慢回落',
      '吸气时肋廓向四周扩张，保持连续呼吸',
      '呼吸节奏舒适，不追求过深或过快'
    ],
    commonErrors: [
      '耸肩并挺直到僵直，呼气时肋廓突然塌陷',
      '刻意鼓肚或憋气',
      '呼吸过快，肩颈跟着起伏'
    ],
    corrections: [
      '减少动作幅度，让肩髋保持安静，只感受肋廓缓慢运动',
      '改为轻柔的鼻吸口呼，腹部允许自然起伏但不要故意推出',
      '延长呼气并降低频率，出现头晕时立即停止并恢复自然呼吸'
    ],
    mediaTip: '侧面或前上方拍摄，画面中完整保留肩、胸廓和髋部。',
    rules: ['trunkStable'],
    dynamic: false
  },

  'upper-trap-stretch': {
    id: 'upper-trap-stretch',
    name: '上斜方肌拉伸',
    category: '颈部放松',
    target: '放松单侧上斜方肌，改善肩部紧张造成的高低差',
    dose: '每侧20–30秒，紧张侧可重复2次',
    hold: '舒适拉伸点停留20–30秒',
    sets: 2,
    steps: [
      '坐直，双脚踩稳，将被拉伸侧的手放在臀下或轻压椅面。',
      '保持脸朝正前方，将头缓慢倒向另一侧，直到患侧颈肩有轻度牵拉感。',
      '另一只手仅轻放头顶，不额外硬拉；自然呼吸并保持肩膀下沉。',
      '缓慢回到中立位，再按需要换侧。'
    ],
    keyPoints: [
      '头部在舒适范围内侧屈，不强行拉扯，也不追求大幅转动',
      '被拉伸侧肩膀下沉，躯干不随头部侧倒',
      '保持轻至中度牵拉感，不出现麻痛或眩晕'
    ],
    commonErrors: [
      '头部侧屈不足或过度，甚至强行拉扯头部',
      '躯干随头一起侧倒，肩膀被带起',
      '屏息或拉伸到疼痛'
    ],
    corrections: [
      '减小侧屈幅度，保持下颌水平，只在无痛牵拉范围内停留',
      '先坐稳并固定被拉伸侧手部，再让头独立移动',
      '放松手部力量并恢复自然呼吸，有麻痛、眩晕时立即停止'
    ],
    mediaTip: '正面上半身拍摄，露出双耳、双肩和双手支撑位置。',
    rules: ['headTilt', 'trunkStable'],
    dynamic: false
  },

  'chin-tuck': {
    id: 'chin-tuck',
    name: '下颌轻收训练',
    category: '颈深屈肌控制',
    target: '改善头前伸姿势，练习颈部中立位控制',
    dose: '8–12次',
    hold: '后收后停留5–8秒',
    sets: 2,
    steps: [
      '坐直或靠墙站立，眼睛平视，双肩自然下沉。',
      '像做出轻微双下巴一样，让头水平向后平移，不抬头也不低头。',
      '保持颈前微收、颈后有延伸感，正常呼吸。',
      '缓慢回到中立位，不突然把头送向前方。'
    ],
    keyPoints: [
      '下颌水平后收，视线保持稳定，耳肩关系不过度前移',
      '肩膀和躯干保持放松稳定，不用后仰代偿',
      '动作缓慢，颈前不过度绷紧'
    ],
    commonErrors: [
      '抬头或低头代替水平后收，耳肩明显错位',
      '耸肩、躯干后仰或腰椎用力',
      '动作过快或用力憋气'
    ],
    corrections: [
      '把动作缩小为水平后移，可用手指轻触下颌提醒方向',
      '先让背部和骨盆找到支撑，再做小幅下颌后收',
      '降低速度并保持呼吸，以颈部无挤压感为准'
    ],
    mediaTip: '优先从侧面拍摄，耳朵、肩峰和髋部需清晰可见。',
    rules: ['headTilt', 'trunkStable'],
    dynamic: false
  },

  'chest-stretch': {
    id: 'chest-stretch',
    name: '门边胸肌拉伸',
    category: '胸前筋膜放松',
    target: '放松胸大肌与胸小肌，改善圆肩时的胸前紧张',
    dose: '每侧20–30秒',
    hold: '胸前轻度牵拉处停留20–30秒',
    sets: 2,
    steps: [
      '站在门边，将一侧前臂贴住门框，肘部约与肩同高或略低。',
      '同侧脚向前迈小步，身体整体缓慢前移，直到胸前有轻度牵拉。',
      '保持肩膀远离耳朵、肋廓不过度前顶，头部朝正前方。',
      '缓慢退回并换侧，两侧都保持自然呼吸。'
    ],
    keyPoints: [
      '双肩放松且尽量保持水平，不让拉伸侧肩膀耸起',
      '躯干正对前方，避免旋转、肋骨外翻和腰部后仰',
      '胸前有牵拉即可，肩前侧不夹痛'
    ],
    commonErrors: [
      '两侧肩膀高度不一或拉伸侧耸肩',
      '躯干旋转、肋骨外翻或腰部过度后仰',
      '步子过大，强行压肩造成前侧疼痛'
    ],
    corrections: [
      '降低手臂位置并主动放松肩部，镜前检查两侧肩线',
      '缩短跨步，轻收下肋并保持骨盆与胸口同向',
      '退回到无痛位置，以轻柔牵拉代替强压'
    ],
    mediaTip: '正面或斜前方拍摄，完整显示双肩、肘部和躯干。',
    rules: ['shoulderLevel', 'trunkStable'],
    dynamic: false
  },

  'scapular-slide': {
    id: 'scapular-slide',
    name: '坐姿肩胛滑动',
    category: '肩胛控制',
    target: '练习肩胛骨上回旋与后倾控制，减少耸肩代偿',
    dose: '8–12次',
    hold: '手臂到达舒适末端后停留2–3秒',
    sets: 2,
    steps: [
      '坐直，双臂自然放在身体两侧，先让肩膀缓慢下沉。',
      '保持躯干不动，双臂沿身体两侧缓慢向前上方抬起。',
      '只到能够维持肩颈放松的高度，感受肩胛骨随手臂顺畅转动。',
      '沿原路缓慢放下，重复时保持两侧节奏一致。'
    ],
    keyPoints: [
      '双肩保持放松，肩线不过度歪斜或上提',
      '两侧手臂路径接近，速度和幅度均匀',
      '头、肋廓与躯干保持稳定，不用后仰帮助抬臂'
    ],
    commonErrors: [
      '耸肩代偿，双肩不在同一高度',
      '两侧手臂滑动路径差异过大或速度失控',
      '头前伸、肋廓外翻，躯干跟着晃动',
      '为了抬高而强行甩臂'
    ],
    corrections: [
      '降低抬臂高度，先做一次沉肩再开始滑动',
      '面向镜子练习，让两侧手腕以相同速度到达相同高度',
      '缩小动作并轻收下肋，保持视线水平',
      '取消惯性，在无痛且能控制的范围内完成'
    ],
    mediaTip: '正面或背面全身拍摄，手臂完整入镜，视频更利于观察滑动轨迹。',
    rules: ['shoulderLevel', 'armControl', 'trunkStable'],
    dynamic: true
  },

  'wall-slide': {
    id: 'wall-slide',
    name: '靠墙滑臂',
    category: '肩胸整合',
    target: '改善抬臂时的肩胛协同、胸前活动度与躯干稳定',
    dose: '8–12次',
    hold: '上举末端停留2–3秒',
    sets: 2,
    steps: [
      '背靠墙站立，头、上背和骶骨轻触墙，腰部保留自然弧度。',
      '双臂屈肘打开，手背或前臂尽量朝向墙面，不强迫完全贴合。',
      '保持下肋不外翻，双臂沿墙缓慢向上滑动，到无痛末端轻伸肘。',
      '缓慢滑回起始位，全程避免肩膀挤向耳朵。'
    ],
    keyPoints: [
      '上举时双肩放松，肩线尽量水平',
      '末端按活动度逐渐伸肘，不强行顶肘或追求过伸',
      '双臂轨迹对称，手腕不突然甩动',
      '下背和肋廓保持稳定，不用弓腰换取高度'
    ],
    commonErrors: [
      '上举时耸肩，肩线明显歪斜',
      '末端肘部仍未按动作要求伸展或过度顶肘',
      '双臂轨迹不对称，手腕突然甩动',
      '下背部拱起、肋骨外翻，躯干失稳',
      '强行让手背贴墙并引发肩痛'
    ],
    corrections: [
      '降低上举幅度，保持颈部延长和肩膀下沉',
      '只伸到可控制的末端，保留肘部自然方向并避免锁死',
      '放慢双臂速度，镜前让两侧手腕同步移动',
      '缩小上举范围并轻收下肋，保持上背贴墙',
      '允许手臂略离墙面，肩部疼痛时停止并调整角度'
    ],
    mediaTip: '正面或背面拍摄，脚底到手腕尽量入镜，镜头保持水平。',
    rules: ['shoulderLevel', 'elbowExtended', 'armControl', 'trunkStable'],
    dynamic: true
  },

  'swan-prep': {
    id: 'swan-prep',
    name: '天鹅式预备',
    category: '上背伸展',
    target: '增强上背伸展控制，配合改善头前伸与圆肩姿势',
    dose: '6–10次',
    hold: '上背抬起后停留2–3秒',
    sets: 2,
    steps: [
      '俯卧，双手放在肩两侧，双腿自然分开，额头轻触垫面。',
      '吸气准备，呼气时先让头顶向前上方延伸，再轻抬上背。',
      '双手轻撑辅助，保持耻骨和髋部贴垫，肩膀远离耳朵。',
      '吸气停留，呼气逐节缓慢回落，不用腰部猛推。'
    ],
    keyPoints: [
      '头顶先延伸，颈部保持自然曲线，不后仰甩头',
      '上背均匀伸展，髋部稳定，不用腰椎猛抬',
      '肩胛骨向后下方滑动，避免耸肩'
    ],
    commonErrors: [
      '头部后仰甩动或颈部挤压',
      '靠腰椎猛抬，肩髋连线失控',
      '肩胛骨耸向耳朵',
      '双手推地过重，动作突然落下'
    ],
    corrections: [
      '保持视线朝向垫面前方，用头顶延伸带动小幅上抬',
      '降低抬起高度，轻收下腹并保持髋部贴垫',
      '先放松肩颈，再将肩胛骨轻轻滑向后下方',
      '减少手臂推力，用缓慢呼气控制回落'
    ],
    mediaTip: '侧前方拍摄，头顶、肩峰、肘部和髋部都要可见。',
    rules: ['headTilt', 'trunkStable'],
    dynamic: true
  },

  'dead-bug': {
    id: 'dead-bug',
    name: '死虫式核心控制',
    category: '核心与躯干稳定',
    target: '在对侧手脚活动中维持躯干稳定，为基础姿态控制打底',
    dose: '每侧6–10次',
    hold: '手脚到达末端后停留2–3秒',
    sets: 2,
    steps: [
      '仰卧，双臂朝向上方，髋膝抬起至约90度，腰部保持自然轻贴垫面。',
      '呼气并轻收下肋，保持肩髋位置稳定。',
      '缓慢将对侧手臂和腿向远处延伸，只到腰背不拱起的范围。',
      '吸气回到起始位，换另一侧，保持缓慢交替。'
    ],
    keyPoints: [
      '起始髋膝约90度，腿部移动时保持可控角度',
      '腰背和肩髋连线稳定，不随四肢左右摇晃',
      '对侧手臂缓慢下落，与腿部动作协调配合'
    ],
    commonErrors: [
      '髋膝角度明显偏离桌面位，腿部下放失控',
      '腰部拱起或躯干左右摇晃',
      '手臂下落过快或与腿部配合混乱',
      '屏息并用力憋紧腹部'
    ],
    corrections: [
      '缩小腿部下放范围，先保持髋膝桌面位再逐渐延伸',
      '减少动作幅度并轻收下肋，让腰背保持稳定接触',
      '先单独练习手臂，再加入缓慢的对侧手脚配合',
      '恢复连续呼吸，以能正常说话的力度收紧核心'
    ],
    mediaTip: '斜侧上方拍摄，确保双肩、髋、膝、踝及移动手臂均完整入镜。',
    rules: ['hipKnee90', 'trunkStable', 'armControl'],
    dynamic: true
  }
};

const FOUNDATION = ['breathing', 'chin-tuck', 'chest-stretch', 'wall-slide', 'dead-bug'];
const FILLERS = ['chin-tuck', 'chest-stretch', 'wall-slide', 'scapular-slide', 'swan-prep'];

function hasFinding(assessment, ids) {
  const findings = Array.isArray(assessment?.findings) ? assessment.findings : [];
  return findings.some((finding) => ids.includes(finding.id));
}

function sideFocus(finding) {
  if (!finding || !['left', 'right', '左', '右', '左侧', '右侧'].includes(finding.side)) {
    return null;
  }
  return String(finding.side).startsWith('left') || String(finding.side).startsWith('左') ? '左侧' : '右侧';
}

export function buildPlan(assessment = {}, preferences = {}) {
  const unevenFinding = (assessment.findings || []).find((finding) =>
    ['uneven-shoulders', 'high-low-shoulders', 'shoulder-asymmetry'].includes(finding.id)
  );
  const uneven = Boolean(unevenFinding) || hasFinding(assessment, ['unevenShoulders']);
  const forwardHead = hasFinding(assessment, ['forward-head', 'forwardHead', 'head-forward']);
  const rounded = hasFinding(assessment, ['rounded-shoulders', 'roundedShoulders', 'rounded-shoulder']);

  const ids = ['breathing', 'dead-bug'];
  if (uneven) ids.push('upper-trap-stretch');
  if (forwardHead) ids.push('chin-tuck');
  if (rounded) ids.push('chest-stretch');
  if (uneven) ids.push('scapular-slide', 'wall-slide');
  if (forwardHead || rounded) ids.push('swan-prep');

  const uniqueIds = [...new Set(ids)];
  for (const id of FILLERS) {
    if (uniqueIds.length >= 5) break;
    if (!uniqueIds.includes(id)) uniqueIds.push(id);
  }

  const selectedIds = (uneven || forwardHead || rounded ? uniqueIds : FOUNDATION).slice(0, 6);
  const experienced = preferences.level === 'experienced';
  const duration = Number.isFinite(Number(preferences.duration)) && Number(preferences.duration) > 0
    ? Number(preferences.duration)
    : 15;
  const minutesEach = Math.max(1, Math.round(duration / selectedIds.length));
  const goal = typeof preferences.goal === 'string' ? preferences.goal.trim() : '';
  const focus = sideFocus(unevenFinding);

  return selectedIds.map((id) => {
    const exercise = EXERCISES[id];
    const personalized = {
      ...exercise,
      steps: [...exercise.steps],
      keyPoints: [...exercise.keyPoints],
      commonErrors: [...exercise.commonErrors],
      corrections: [...exercise.corrections],
      rules: [...exercise.rules],
      sets: experienced ? 3 : 2,
      dose: `${exercise.dose}；本次建议安排约${minutesEach}分钟`
    };

    if (goal) personalized.target = `${exercise.target}；本次目标：${goal}`;

    if (id === 'upper-trap-stretch') {
      const sideText = focus ? `${focus}为重点` : '两侧均练习，较紧张的一侧为重点';
      personalized.target = `${personalized.target}（${sideText}）`;
      personalized.keyPoints[0] = focus
        ? `重点：${focus}先做并适当多停留5秒，对侧仅作平衡，不强力扳头；${exercise.keyPoints[0]}`
        : `重点：先比较两侧紧张感，较紧张侧可适当多停留5秒；${exercise.keyPoints[0]}`;
      personalized.steps[1] = focus
        ? `保持脸朝正前方，将头缓慢倒向${focus === '左侧' ? '右' : '左'}侧，使${focus}颈肩出现轻度牵拉感。`
        : personalized.steps[1];
    }

    return personalized;
  });
}
