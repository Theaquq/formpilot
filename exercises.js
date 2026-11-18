export const EXERCISES = {
  'child-pose': {
    id: 'child-pose',
    name: '婴儿式',
    sanskrit: 'Balasana',
    category: '放松与呼吸',
    target: '放松肩背与下背，建立髋屈与呼吸配合，作为训练开始与结束的恢复体式',
    dose: '5–8 个呼吸',
    hold: '每次呼气停留 30–60 秒',
    sets: 2,
    steps: [
      '跪坐在垫上，双膝并拢或与髋同宽，脚背贴地，臀部坐向脚跟。',
      '吸气延展脊柱，呼气从髋部折叠，躯干缓慢落在双腿之间。',
      '双臂向前伸展，与肩同宽，掌心贴地，额头轻触垫面或瑜伽砖。',
      '保持臀部靠近脚跟，肩胛骨向两侧展开，颈部完全放松。',
      '鼻吸鼻呼：吸气时感受后背与肋廓扩张，呼气时让肩背继续下沉。',
      '结束前吸气，双手推地缓慢起身，回到跪坐。'
    ],
    keyPoints: [
      '臀部坐向脚跟，髋部保持折叠，不用腰部强行下压',
      '双臂前伸时肘部自然伸展但不锁死，肩胛骨向两侧展开',
      '额头有支撑，颈部不挤压，呼吸连续不憋气',
      '膝盖不适时在膝窝垫毛巾，缩小折叠幅度'
    ],
    commonErrors: [
      '臀部离开脚跟、下背塌陷，腰椎承受挤压',
      '耸肩，肩胛骨挤向耳朵，颈部无法放松',
      '屏息或呼吸急促，肩背随呼吸大幅起伏',
      '膝盖疼痛仍强行下压'
    ],
    corrections: [
      '在臀部与脚跟之间垫毛毯，先保证髋部折叠再前伸',
      '主动让肩膀远离耳朵，手臂可略屈肘',
      '恢复自然鼻吸鼻呼，把注意力放在后背扩张',
      '膝下垫软垫并减小屈膝角度，疼痛时停止'
    ],
    ruleErrors: {
      elbowExtended: { title: '双臂未充分前伸，肘部过度弯曲', fix: '手臂向前延伸至肘部接近伸直，但不锁死；肩胛骨向两侧展开' },
      trunkStable: { title: '躯干折叠时两侧肩髋连线明显不平行', fix: '减小折叠幅度，先让臀部坐向脚跟，再让躯干居中前伸' }
    },
    breath: '吸气到后背与肋廓，呼气时放松肩胛与下背，全程鼻吸鼻呼。',
    contraindications: '膝关节损伤、孕期、腹泻或饭后一小时内避免深度折叠；有膝痛时先咨询专业人士。',
    mediaTip: '从侧面拍摄，完整露出耳朵、肩峰、髋部、膝盖与手腕。',
    rules: ['elbowExtended', 'trunkStable'],
    dynamic: false,
    video: {
      bvid: 'BV12K4y1U7C4',
      page: 23,
      title: '婴儿式 · 30个瑜伽体式精讲',
      teacher: '我是小亓啊',
      platform: '哔哩哔哩',
      url: 'https://www.bilibili.com/video/BV12K4y1U7C4?p=23'
    }
  },

  'downward-dog': {
    id: 'downward-dog',
    name: '下犬式',
    sanskrit: 'Adho Mukha Svanasana',
    category: '全身伸展 / 肩胛稳定',
    target: '延展脊柱与身体后侧链，建立肩胛上回旋与手臂支撑控制',
    dose: '5–8 个呼吸',
    hold: '每次停留 30–45 秒',
    sets: 2,
    steps: [
      '从四角板凳式开始，双手位于肩正下方，双膝位于髋正下方。',
      '吸气准备，呼气时双手推地，坐骨向后上方抬高，身体形成倒 V 形。',
      '双手与肩同宽，食指朝前，虎口压实垫面，肘窝相对，肘部不锁死。',
      '双脚与髋同宽，脚跟可踩地也可微抬，优先保证脊柱延展。',
      '头颈放松，位于两臂之间，耳朵与上臂平行，不抬头挤压颈部。',
      '保持 5–8 个呼吸，吸气时肋廓扩张，呼气时坐骨继续向后上方延伸。',
      '结束时呼气屈膝，回到四角板凳式或婴儿式休息。'
    ],
    keyPoints: [
      '手掌均匀受力，肩胛骨远离耳朵，肩膀不耸起',
      '脊柱延展优先于脚跟落地，膝盖可微屈',
      '肘部保持伸展但不超伸，肘窝相对',
      '肋骨不外翻，腹部轻收维持躯干稳定',
      '头颈保持中立，耳朵与上臂大致平行'
    ],
    commonErrors: [
      '耸肩，肩胛骨挤向耳朵，颈部被压缩',
      '肘关节超伸或完全锁死',
      '腰椎塌陷、肋骨外翻，重心压在手腕',
      '为让脚跟落地而弓起脊柱',
      '抬头看前方，颈椎过度后伸'
    ],
    corrections: [
      '双手推地并主动让肩膀远离耳朵，可微屈膝降低难度',
      '肘部保留一点弯曲，用前臂旋转带动肩胛稳定',
      '轻收下肋与腹部，坐骨向后而不是向下压',
      '膝盖微屈、脚跟微抬，先保证背部延展',
      '头部自然下垂，视线看向小腿或脚趾'
    ],
    ruleErrors: {
      elbowExtended: { title: '肘关节未保持可控伸展（过屈或超伸）', fix: '保持肘部接近伸直但不锁死，肘窝相对，用手掌推地' },
      trunkStable: { title: '肩线与髋线不平行，躯干出现扭转或侧倾', fix: '双手双脚均匀受力，坐骨向后上方，躯干保持在正中' },
      armControl: { title: '两侧手臂支撑角度不对称', fix: '让两侧手掌同宽同高，手腕位于肩正下方，均匀推地' }
    },
    breath: '吸气时肋廓扩张、脊柱延长，呼气时坐骨向后上方，不憋气。',
    contraindications: '腕管综合征、手腕损伤、未控制的高血压、眩晕或孕期后期应避免或改为靠墙版本。',
    mediaTip: '从侧面拍摄，完整露出耳朵、肩、髋、膝、脚踝与手掌。',
    rules: ['elbowExtended', 'trunkStable', 'armControl'],
    dynamic: false,
    video: {
      bvid: 'BV12K4y1U7C4',
      page: 28,
      title: '下犬式 · 30个瑜伽体式精讲',
      teacher: '我是小亓啊',
      platform: '哔哩哔哩',
      url: 'https://www.bilibili.com/video/BV12K4y1U7C4?p=28'
    }
  },

  'warrior-two': {
    id: 'warrior-two',
    name: '战士二式',
    sanskrit: 'Virabhadrasana II',
    category: '下肢对位 / 肩带对称',
    target: '建立前膝与脚尖对位、双臂水平展开与躯干直立的整体控制',
    dose: '每侧 3–5 个呼吸',
    hold: '每侧停留 20–30 秒',
    sets: 2,
    steps: [
      '山式站立，双脚分开约一条腿长，右脚外转 90°，左脚内扣约 15°。',
      '吸气，双臂向两侧平举至与地面平行，掌心向下，肩膀放松。',
      '呼气屈右膝，膝盖对准右脚第二、三脚趾，大腿尽量接近平行地面。',
      '躯干保持直立并位于两腿之间，不向前倾，目光看向右手指尖。',
      '后腿伸直，左脚外侧压实垫面，足弓上提，重心均匀分布。',
      '保持 3–5 个呼吸后，吸气伸直右腿，转脚换另一侧。'
    ],
    keyPoints: [
      '前膝对准第二、三脚趾，不内扣，膝盖不超过脚尖过多',
      '双臂与地面平行，两侧肩线水平，肩膀远离耳朵',
      '躯干直立位于两腿之间，不向前倾或侧倒',
      '后腿伸直，后脚外侧踩实，足弓上提'
    ],
    commonErrors: [
      '前膝内扣或明显超过脚尖，膝关节压力增大',
      '两侧手臂不等高或耸肩，肩线歪斜',
      '躯干前倾，重心全部压在前腿',
      '后膝弯曲、后脚外侧离地'
    ],
    corrections: [
      '缩小前腿屈膝角度，让膝盖退回脚踝上方并对准脚尖',
      '降低手臂高度至可控范围，先沉肩再展开双臂',
      '把重心向后移，让躯干垂直位于两腿之间',
      '后腿主动伸直，后脚外侧压地并上提足弓'
    ],
    ruleErrors: {
      shoulderLevel: { title: '双臂展开时肩线不水平', fix: '降低手臂高度，主动沉肩，让两侧肩峰保持同一水平线' },
      armControl: { title: '两侧手臂展开角度不对称', fix: '以肩为轴同时展开双臂，保持两侧手腕等高、掌心向下' },
      trunkStable: { title: '躯干前倾或侧倾，肩髋连线不平行', fix: '重心移到两腿之间，肋骨回收，躯干保持直立' }
    },
    breath: '吸气延展脊柱并展开双臂，呼气屈膝下沉，保持均匀呼吸。',
    contraindications: '膝关节损伤、髋关节疼痛或平衡障碍者应减小步幅与屈膝角度，必要时靠墙练习。',
    mediaTip: '从正面拍摄，完整露出双肩、双手、髋部、双膝与双脚。',
    rules: ['shoulderLevel', 'armControl', 'trunkStable'],
    dynamic: false,
    video: {
      bvid: 'BV12K4y1U7C4',
      page: 11,
      title: '战士二式 · 30个瑜伽体式精讲',
      teacher: '我是小亓啊',
      platform: '哔哩哔哩',
      url: 'https://www.bilibili.com/video/BV12K4y1U7C4?p=11'
    }
  },

  'tree-pose': {
    id: 'tree-pose',
    name: '树式',
    sanskrit: 'Vrksasana',
    category: '平衡 / 肩带对称',
    target: '练习单腿平衡与肩带对称控制，改善双肩高度差异的对称感知',
    dose: '每侧 3–5 个呼吸',
    hold: '每侧停留 20–30 秒',
    sets: 2,
    steps: [
      '山式站立，重心缓慢移到左脚，右脚抬起。',
      '将右脚掌放在左小腿内侧或大腿内侧，避免直接压在膝关节上。',
      '右脚趾可轻点地辅助平衡，左腿伸直但不过度锁膝。',
      '双手先合十于胸前，稳定后缓慢上举过头，双臂与肩同宽。',
      '骨盆保持中立，尾骨向下，肋骨不外翻，目视前方固定一点。',
      '保持 3–5 个呼吸后放下右脚，换另一侧练习。'
    ],
    keyPoints: [
      '支撑腿膝盖对准脚尖，不内扣，不过度锁死',
      '抬起的脚掌贴在小腿或大腿内侧，不直接压膝关节',
      '双臂上举时肩线水平、肩膀下沉，不耸肩',
      '骨盆保持水平，身体不歪向支撑侧'
    ],
    commonErrors: [
      '支撑膝内扣，脚掌内侧受力塌陷',
      '抬起的脚直接压在膝关节上',
      '双臂上举时耸肩或两侧手臂不等高',
      '骨盆侧倾，身体明显歪向一侧'
    ],
    corrections: [
      '脚掌三点均匀压地，膝盖对准第二、三脚趾',
      '把脚放在小腿内侧或大腿内侧，避开膝关节',
      '先沉肩再上举，必要时双手只到胸前合十',
      '缩短站立时间，先靠墙练习并让骨盆保持水平'
    ],
    ruleErrors: {
      shoulderLevel: { title: '双臂上举时肩线不水平', fix: '先沉肩再上举，降低手臂高度，让两侧肩峰保持水平' },
      trunkStable: { title: '骨盆侧倾，肩线与髋线不平行', fix: '尾骨向下、肋骨回收，身体重量均匀压在支撑脚' },
      armControl: { title: '两侧手臂上举角度不对称', fix: '双手同时向上延伸，保持两臂与肩同宽、等高' }
    },
    breath: '吸气延展脊柱并上举双臂，呼气稳定骨盆与支撑腿，保持自然呼吸。',
    contraindications: '踝关节或膝关节不稳定、眩晕、低血压者应靠墙练习，避免闭眼。',
    mediaTip: '从正面拍摄，完整露出双手、双肩、髋部与双脚，镜头保持水平。',
    rules: ['shoulderLevel', 'trunkStable', 'armControl'],
    dynamic: false,
    video: {
      bvid: 'BV12K4y1U7C4',
      page: 3,
      title: '树式 · 30个瑜伽体式精讲',
      teacher: '我是小亓啊',
      platform: '哔哩哔哩',
      url: 'https://www.bilibili.com/video/BV12K4y1U7C4?p=3'
    }
  },

  bridge: {
    id: 'bridge',
    name: '桥式',
    sanskrit: 'Setu Bandhasana',
    category: '后侧链 / 核心稳定',
    target: '激活臀肌与身体后侧链，练习髋伸时肋廓与骨盆的稳定配合',
    dose: '8–12 次',
    hold: '顶点停留 3–5 秒',
    sets: 2,
    steps: [
      '仰卧屈膝，双脚与髋同宽踩地，脚跟靠近臀部，双臂自然放于体侧。',
      '呼气时轻收下肋与腹部，尾骨向脚跟方向延伸。',
      '脚掌与手臂压地，臀部发力将髋部抬起，直到肩、髋、膝大致成一条斜线。',
      '顶点保持 3–5 秒，膝盖对准脚尖，既不外翻也不内扣。',
      '吸气时从上背开始逐节缓慢落下，最后放松骨盆。',
      '每次之间完全放松，重复 8–12 次，最后一次可在顶点多停留一个呼吸。'
    ],
    keyPoints: [
      '膝盖与脚尖同向，不外翻也不内扣',
      '用臀肌发力抬髋，肋骨不外翻，腰椎不过度后弯',
      '颈部保持中立，不左右转动，肩胛骨轻收',
      '双脚掌均匀压地，脚跟不离地'
    ],
    commonErrors: [
      '膝盖外翻或内扣，膝关节受力不均',
      '腰部过度后弯、肋骨外翻，髋部抬得过高',
      '脚跟离地，重心压到脚尖',
      '颈部转动或耸肩，肩颈代偿'
    ],
    corrections: [
      '在大腿之间夹瑜伽砖或毛巾，帮助膝盖与脚尖同向',
      '降低抬髋高度，先收下肋再抬臀，用臀肌而不是腰部发力',
      '把脚跟踩实，必要时脚跟下垫毛巾',
      '保持颈部中立，肩膀放松，肩胛骨轻收'
    ],
    ruleErrors: {
      shoulderLevel: { title: '桥式抬髋时两侧肩线不水平', fix: '双肩均匀压地，先在仰卧位调平肩线再抬髋' },
      trunkStable: { title: '骨盆侧倾或肋骨外翻，肩髋连线不平行', fix: '降低抬髋高度，双膝同高，轻收下肋后再抬臀' }
    },
    breath: '抬髋时呼气，顶点保持自然呼吸，落下时吸气，不憋气。',
    contraindications: '颈部损伤、腰椎滑脱、严重骨质疏松或孕晚期应避免；出现腰痛立即降低高度或停止。',
    mediaTip: '从侧面拍摄，完整露出肩、髋、膝与脚踝；正面拍摄可观察骨盆是否水平。',
    rules: ['shoulderLevel', 'trunkStable'],
    dynamic: false,
    stabilityCheck: false,
    video: {
      bvid: 'BV12K4y1U7C4',
      page: 30,
      title: '桥式 · 30个瑜伽体式精讲',
      teacher: '我是小亓啊',
      platform: '哔哩哔哩',
      url: 'https://www.bilibili.com/video/BV12K4y1U7C4?p=30'
    }
  }
};

const BASE_SEQUENCE = ['child-pose', 'downward-dog', 'warrior-two', 'tree-pose', 'bridge'];
const FILLERS = ['child-pose', 'downward-dog', 'warrior-two', 'tree-pose', 'bridge'];

function hasFinding(assessment, ids) {
  const findings = Array.isArray(assessment?.findings) ? assessment.findings : [];
  return findings.some((finding) => ids.includes(finding.id));
}

export function buildPlan(assessment = {}, preferences = {}) {
  const uneven = hasFinding(assessment, ['uneven-shoulders', 'high-low-shoulders', 'shoulder-asymmetry', 'unevenShoulders']);

  const ids = ['child-pose', 'downward-dog'];
  if (uneven) ids.push('warrior-two', 'tree-pose');
  ids.push('bridge');
  for (const id of FILLERS) {
    if (ids.length >= 5) break;
    if (!ids.includes(id)) ids.push(id);
  }

  const selectedIds = [...new Set(ids)].slice(0, 5);
  const experienced = preferences.level === 'experienced';
  const duration = Number.isFinite(Number(preferences.duration)) && Number(preferences.duration) > 0
    ? Number(preferences.duration)
    : 20;
  const minutesEach = Math.max(1, Math.round(duration / selectedIds.length));
  const goal = typeof preferences.goal === 'string' ? preferences.goal.trim() : '';

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
    if (uneven && (id === 'tree-pose' || id === 'warrior-two')) {
      personalized.target = `${exercise.target}（两侧均练，重点观察双肩是否保持水平）`;
    }
    return personalized;
  });
}
