const VISION_MODULE = 'https://unpkg.com/@mediapipe/tasks-vision@0.10.21/vision_bundle.mjs';
const WASM_ROOT = 'https://unpkg.com/@mediapipe/tasks-vision@0.10.21/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
const LIMITATIONS = [
  '本结果仅基于二维图像和可见关键点，用于姿态筛查与练习参考，可能受到镜头角度、身体旋转、衣物和遮挡影响。',
  '二维关键点不能据此确诊骨盆倾斜、脊柱侧弯或其他疾病，也不能替代影像学检查与专业医疗评估。',
  '如有持续疼痛、麻木、眩晕或明显不对称，请停止练习并寻求专业医疗评估。'
];
const VIEW_NAMES = { front: '正面', back: '背面', left: '左侧面', right: '右侧面' };
const MIN_VISIBILITY = 0.45;
const PRACTICE_LANDMARKS = [7, 8, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

let landmarkerPromise = null;
let runningMode = null;
let operationQueue = Promise.resolve();

async function createLandmarker(mode) {
  const { FilesetResolver, PoseLandmarker } = await import(VISION_MODULE);
  const fileset = await FilesetResolver.forVisionTasks(WASM_ROOT);
  const options = {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
    runningMode: mode,
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputSegmentationMasks: false
  };

  try {
    return await PoseLandmarker.createFromOptions(fileset, options);
  } catch (gpuError) {
    return PoseLandmarker.createFromOptions(fileset, {
      ...options,
      baseOptions: { modelAssetPath: MODEL_URL, delegate: 'CPU' }
    });
  }
}

function withLandmarker(mode, operation) {
  const result = operationQueue.then(async () => {
    if (!landmarkerPromise) landmarkerPromise = createLandmarker(mode);

    let landmarker;
    try {
      landmarker = await landmarkerPromise;
    } catch (error) {
      landmarkerPromise = null;
      runningMode = null;
      throw error;
    }

    if (runningMode !== mode) {
      await landmarker.setOptions({ runningMode: mode });
      runningMode = mode;
    }
    return operation(landmarker);
  });

  operationQueue = result.then(() => undefined, () => undefined);
  return result;
}

function notify(onProgress, current, total, phase) {
  if (typeof onProgress !== 'function') return;
  const progress = total ? current / total : 0;
  const messages = {
    posture: current ? `已完成 ${current}/${total} 张姿态照片分析` : '正在准备四视图姿态分析…',
    'practice-image': current ? '练习照片分析完成' : '正在分析练习照片…',
    'practice-video': current ? `已分析 ${current}/${total} 个视频采样帧` : '正在准备视频采样…'
  };
  onProgress(messages[phase] || '正在分析…', progress, { current, total, phase, progress });
}

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function round(value, digits = 1) {
  if (!Number.isFinite(value)) return null;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function average(values) {
  const valid = values.filter(Number.isFinite);
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}

function sourceSize(source) {
  return {
    width: source.naturalWidth || source.videoWidth || source.width,
    height: source.naturalHeight || source.videoHeight || source.height
  };
}

function visibility(landmarks, index) {
  const point = landmarks?.[index];
  if (!point) return 0;
  return Number.isFinite(point.visibility) ? point.visibility : 1;
}

function visible(landmarks, index, threshold = MIN_VISIBILITY) {
  const point = landmarks?.[index];
  return Boolean(
    point &&
    Number.isFinite(point.x) &&
    Number.isFinite(point.y) &&
    visibility(landmarks, index) >= threshold
  );
}

function pixelPoint(landmarks, index, width, height) {
  const point = landmarks[index];
  return { x: point.x * width, y: point.y * height };
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angleAt(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const denominator = Math.hypot(ab.x, ab.y) * Math.hypot(cb.x, cb.y);
  if (!denominator) return null;
  const cosine = clamp((ab.x * cb.x + ab.y * cb.y) / denominator, -1, 1);
  return Math.acos(cosine) * 180 / Math.PI;
}

function lineAngle(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
}

function lineAngleDifference(a, b, c, d) {
  const raw = Math.abs(lineAngle(a, b) - lineAngle(c, d)) % 180;
  return Math.min(raw, 180 - raw);
}

function linearScore(value, good, bad) {
  if (!Number.isFinite(value)) return 0;
  return clamp(1 - (value - good) / (bad - good));
}

function emptyFrontBackView() {
  return {
    shoulderDiffPct: null,
    shoulderAngle: null,
    hipDiffPct: null,
    trunkOffsetPct: null
  };
}

function emptySideView() {
  return { cva: null, roundedOffsetPct: null, visibility: 0 };
}

function analyzeFrontBack(landmarks, width, height) {
  const values = emptyFrontBackView();
  const detail = {
    values,
    confidence: 0,
    shoulderAbnormal: false,
    shoulderDiffAbnormal: false,
    shoulderAngleAbnormal: false,
    shoulderSide: null,
    hipAbnormal: false,
    trunkAbnormal: false
  };
  if (!landmarks) return detail;

  detail.confidence = average([11, 12, 23, 24].map((index) => visibility(landmarks, index))) || 0;

  let leftShoulder;
  let rightShoulder;
  let leftHip;
  let rightHip;

  if (visible(landmarks, 11) && visible(landmarks, 12)) {
    leftShoulder = pixelPoint(landmarks, 11, width, height);
    rightShoulder = pixelPoint(landmarks, 12, width, height);
    const shoulderWidth = distance(leftShoulder, rightShoulder);
    if (shoulderWidth > 0) {
      const shoulderDiffPct = Math.abs(leftShoulder.y - rightShoulder.y) / shoulderWidth * 100;
      const shoulderAngle = Math.atan2(
        Math.abs(leftShoulder.y - rightShoulder.y),
        Math.abs(leftShoulder.x - rightShoulder.x)
      ) * 180 / Math.PI;
      values.shoulderDiffPct = round(shoulderDiffPct);
      values.shoulderAngle = round(shoulderAngle);
      detail.shoulderSide = leftShoulder.y === rightShoulder.y
        ? null
        : leftShoulder.y < rightShoulder.y ? 'left' : 'right';
      detail.shoulderDiffAbnormal = shoulderDiffPct > 5;
      detail.shoulderAngleAbnormal = shoulderAngle > 3;
      detail.shoulderAbnormal = detail.shoulderDiffAbnormal || detail.shoulderAngleAbnormal;
    }
  }

  if (visible(landmarks, 23) && visible(landmarks, 24)) {
    leftHip = pixelPoint(landmarks, 23, width, height);
    rightHip = pixelPoint(landmarks, 24, width, height);
    const hipWidth = distance(leftHip, rightHip);
    if (hipWidth > 0) {
      const hipDiffPct = Math.abs(leftHip.y - rightHip.y) / hipWidth * 100;
      values.hipDiffPct = round(hipDiffPct);
      detail.hipAbnormal = hipDiffPct > 5;
    }
  }

  if (leftShoulder && rightShoulder && leftHip && rightHip) {
    const shoulderCenter = midpoint(leftShoulder, rightShoulder);
    const hipCenter = midpoint(leftHip, rightHip);
    const trunkLength = distance(shoulderCenter, hipCenter);
    if (trunkLength > 0) {
      const trunkOffsetPct = Math.abs(shoulderCenter.x - hipCenter.x) / trunkLength * 100;
      values.trunkOffsetPct = round(trunkOffsetPct);
      detail.trunkAbnormal = trunkOffsetPct > 5;
    }
  }

  return detail;
}

function analyzeSide(landmarks, width, height, side) {
  const values = emptySideView();
  const detail = {
    values,
    confidence: 0,
    forwardHead: false,
    rounded: false,
    anteriorKnown: false,
    earAnterior: false
  };
  if (!landmarks) return detail;

  const indices = side === 'left'
    ? { ear: 7, shoulder: 11, hip: 23 }
    : { ear: 8, shoulder: 12, hip: 24 };
  const relevant = [indices.ear, indices.shoulder, indices.hip, 0];
  values.visibility = round(average(relevant.map((index) => visibility(landmarks, index))) || 0, 2);
  detail.confidence = values.visibility;

  if (!visible(landmarks, indices.ear) || !visible(landmarks, indices.shoulder)) return detail;

  const ear = pixelPoint(landmarks, indices.ear, width, height);
  const shoulder = pixelPoint(landmarks, indices.shoulder, width, height);
  const horizontal = Math.abs(ear.x - shoulder.x);
  const cva = Math.atan2(shoulder.y - ear.y, horizontal) * 180 / Math.PI;
  values.cva = round(cva);

  let anteriorSign = 0;
  if (visible(landmarks, 0)) {
    const nose = pixelPoint(landmarks, 0, width, height);
    if (Math.abs(nose.x - shoulder.x) > width * 0.003) anteriorSign = Math.sign(nose.x - shoulder.x);
  }
  if (!anteriorSign && visible(landmarks, indices.hip)) {
    const hipForDirection = pixelPoint(landmarks, indices.hip, width, height);
    if (Math.abs(ear.x - hipForDirection.x) > width * 0.003) {
      anteriorSign = Math.sign(ear.x - hipForDirection.x);
    }
  }

  detail.anteriorKnown = anteriorSign !== 0;
  detail.earAnterior = detail.anteriorKnown && (ear.x - shoulder.x) * anteriorSign > 0;
  detail.forwardHead = detail.anteriorKnown && detail.earAnterior && cva < 50;

  if (visible(landmarks, indices.hip) && detail.anteriorKnown) {
    const hip = pixelPoint(landmarks, indices.hip, width, height);
    const trunkLength = distance(shoulder, hip);
    if (trunkLength > 0) {
      const roundedOffsetPct = (shoulder.x - hip.x) * anteriorSign / trunkLength * 100;
      values.roundedOffsetPct = round(roundedOffsetPct);
      detail.rounded = roundedOffsetPct > 10;
    }
  }

  return detail;
}

function metric(label, value, reference, normal, note) {
  return {
    label,
    value,
    reference,
    status: value === null ? '不可评估' : normal ? '正常' : '关注',
    note
  };
}

function buildPostureMetrics(views, details, shoulderInconsistent) {
  const metrics = [];
  for (const view of ['front', 'back']) {
    const values = views[view];
    const name = VIEW_NAMES[view];
    const side = details[view].shoulderSide === 'left'
      ? '左侧较高'
      : details[view].shoulderSide === 'right' ? '右侧较高' : '双肩关键点同高';
    const inconsistencyNote = shoulderInconsistent ? '；正背面结果不一致，需结合拍摄角度复核' : '';
    metrics.push(metric(
      `${name}肩高差/肩宽`,
      values.shoulderDiffPct,
      '≤5%，且肩线角≤3°',
      !details[view].shoulderAbnormal,
      `按图像宽高比校正；${values.shoulderDiffPct === null ? '关键点不足' : side}${inconsistencyNote}`
    ));
    metrics.push(metric(
      `${name}肩线角`,
      values.shoulderAngle,
      '≤3°',
      !details[view].shoulderAngleAbnormal,
      `相对水平线的绝对角度${inconsistencyNote}`
    ));
    metrics.push(metric(
      `${name}髋部关键点高差/髋宽`,
      values.hipDiffPct,
      '≤5%（仅作对称性参考）',
      !details[view].hipAbnormal,
      '仅描述二维关键点位置，不用于判断或诊断骨盆倾斜'
    ));
    metrics.push(metric(
      `${name}肩髋中点侧移/躯干长`,
      values.trunkOffsetPct,
      '≤5%',
      !details[view].trunkAbnormal,
      '仅提示整体侧移倾向，不用于诊断脊柱侧弯'
    ));
  }

  for (const view of ['left', 'right']) {
    const values = views[view];
    const detail = details[view];
    const name = VIEW_NAMES[view];
    const forwardHead = values.cva !== null && detail.forwardHead;
    metrics.push(metric(
      `${name}近似颅椎角（CVA）`,
      values.cva,
      '通常≥50°；头前伸还需耳点位于肩点前方',
      !forwardHead,
      values.cva === null
        ? '耳或肩关键点可见度不足'
        : detail.anteriorKnown
          ? detail.earAnterior ? '耳点位于肩点前方' : '耳点未位于肩点前方，不单独判定头前伸'
          : '前后方向不可可靠判断，不据此判定头前伸'
    ));
    metrics.push(metric(
      `${name}肩点相对髋点前移/躯干长`,
      values.roundedOffsetPct,
      '≤10%',
      !detail.rounded,
      '按身体前后方向取带方向位移；大于10%仅提示圆肩姿势倾向'
    ));
  }
  return metrics;
}

function viewEvidence(view, values, kind) {
  const name = VIEW_NAMES[view];
  if (kind === 'shoulder') {
    return `${name}肩高差 ${values.shoulderDiffPct}%（肩线角 ${values.shoulderAngle}°）`;
  }
  if (kind === 'forward') {
    return `${name}近似颅椎角 ${values.cva}°，耳点位于肩点前方`;
  }
  if (kind === 'rounded') {
    return `${name}肩点相对髋点前移 ${values.roundedOffsetPct}% 躯干长`;
  }
  return `${name}肩髋中点侧移 ${values.trunkOffsetPct}% 躯干长`;
}

function buildFindings(views, details) {
  const findings = [];
  const frontBack = ['front', 'back'].filter((view) => views[view].shoulderDiffPct !== null);
  const abnormalShoulders = frontBack.filter((view) => details[view].shoulderAbnormal);
  const shoulderSides = [...new Set(abnormalShoulders.map((view) => details[view].shoulderSide))];
  const shoulderInconsistent = frontBack.length > 1 && abnormalShoulders.length > 0 &&
    (abnormalShoulders.length !== frontBack.length || shoulderSides.length > 1);

  if (abnormalShoulders.length) {
    const evidence = abnormalShoulders.map((view) => viewEvidence(view, views[view], 'shoulder'));
    const normalViews = frontBack.filter((view) => !details[view].shoulderAbnormal);
    if (normalViews.length) evidence.push(`${normalViews.map((view) => VIEW_NAMES[view]).join('、')}未达到筛查阈值`);
    if (shoulderInconsistent) evidence.push('正背面结果不一致，可能受旋转或拍摄角度影响，建议复核');
    const finding = {
      id: 'uneven-shoulders',
      title: shoulderInconsistent ? '双肩高度不一致（正背面结果不一致）' : '双肩高度不对称倾向',
      severity: abnormalShoulders.some((view) => views[view].shoulderDiffPct > 8 || views[view].shoulderAngle > 6) ? 'moderate' : 'mild',
      evidence: evidence.join('；'),
      impact: '可能伴随单侧颈肩紧张或肩胛控制差异，适合先做无痛范围内的放松与对称控制练习'
    };
    if (shoulderSides.length === 1 && !shoulderInconsistent) finding.side = shoulderSides[0];
    findings.push(finding);
  }

  const sideViews = ['left', 'right'].filter((view) => views[view].cva !== null);
  const forwardViews = sideViews.filter((view) => details[view].forwardHead);
  if (forwardViews.length) {
    const evidence = forwardViews.map((view) => viewEvidence(view, views[view], 'forward'));
    if (forwardViews.length !== sideViews.length) evidence.push('两侧面筛查结果不一致，需结合拍摄方向复核');
    findings.push({
      id: 'forward-head',
      title: '头前伸姿势倾向',
      severity: forwardViews.some((view) => views[view].cva < 40) ? 'moderate' : 'mild',
      evidence: evidence.join('；'),
      impact: '可能增加颈肩持续用力，建议训练中关注下颌轻收与上背延伸'
    });
  }

  const roundedViews = ['left', 'right'].filter((view) => views[view].roundedOffsetPct !== null && details[view].rounded);
  if (roundedViews.length) {
    const measurable = ['left', 'right'].filter((view) => views[view].roundedOffsetPct !== null);
    const evidence = roundedViews.map((view) => viewEvidence(view, views[view], 'rounded'));
    if (roundedViews.length !== measurable.length) evidence.push('两侧面结果不一致，需排除身体旋转影响');
    findings.push({
      id: 'rounded-shoulders',
      title: '圆肩姿势倾向',
      severity: roundedViews.some((view) => views[view].roundedOffsetPct > 18) ? 'moderate' : 'mild',
      evidence: evidence.join('；'),
      impact: '可能与胸前紧张和上背控制不足同时出现，宜结合胸肌放松与低负荷上背练习'
    });
  }

  const trunkViews = frontBack.filter((view) => views[view].trunkOffsetPct !== null);
  const shiftedViews = trunkViews.filter((view) => details[view].trunkAbnormal);
  if (shiftedViews.length) {
    const evidence = shiftedViews.map((view) => viewEvidence(view, views[view], 'trunk'));
    if (shiftedViews.length !== trunkViews.length) evidence.push('正背面侧移结果不一致');
    findings.push({
      id: 'trunk-shift',
      title: '整体躯干侧移倾向',
      severity: shiftedViews.some((view) => views[view].trunkOffsetPct > 10) ? 'moderate' : 'mild',
      evidence: evidence.join('；'),
      impact: '可能影响练习中的左右负荷分配，建议先改善整体对齐与躯干稳定；该结果不代表脊柱侧弯诊断'
    });
  }

  return { findings, shoulderInconsistent };
}

export async function analyzePostureImages(images, onProgress) {
  const views = {
    front: emptyFrontBackView(),
    back: emptyFrontBackView(),
    left: emptySideView(),
    right: emptySideView()
  };
  const details = {};
  const viewNames = ['front', 'back', 'left', 'right'];
  notify(onProgress, 0, viewNames.length, 'posture');

  for (let index = 0; index < viewNames.length; index += 1) {
    const view = viewNames[index];
    const image = images?.[view];
    let landmarks = null;

    if (image) {
      const result = await withLandmarker('IMAGE', (landmarker) => landmarker.detect(image));
      landmarks = result?.landmarks?.[0] || null;
      const { width, height } = sourceSize(image);
      details[view] = view === 'front' || view === 'back'
        ? analyzeFrontBack(landmarks, width, height)
        : analyzeSide(landmarks, width, height, view);
      views[view] = details[view].values;
    } else {
      details[view] = view === 'front' || view === 'back'
        ? analyzeFrontBack(null, 1, 1)
        : analyzeSide(null, 1, 1, view);
    }

    notify(onProgress, index + 1, viewNames.length, 'posture');
  }

  const { findings, shoulderInconsistent } = buildFindings(views, details);
  const confidenceValues = viewNames.map((view) => details[view].confidence);

  return {
    createdAt: new Date().toISOString(),
    views,
    metrics: buildPostureMetrics(views, details, shoulderInconsistent),
    findings,
    limitations: LIMITATIONS,
    confidence: round(average(confidenceValues) || 0, 2)
  };
}

const PHOTO_RULE_TARGETS = {
  shoulderLevel: ['关节排列'],
  trunkStable: ['关节排列'],
  elbowExtended: ['关键姿势'],
  headTilt: ['关键姿势'],
  hipKnee90: ['关键姿势'],
  armControl: ['关键姿势']
};

const VIDEO_RULE_TARGETS = {
  shoulderLevel: ['关节排列'],
  trunkStable: ['关节排列'],
  headTilt: ['关节排列'],
  elbowExtended: ['动作轨迹'],
  hipKnee90: ['动作轨迹'],
  armControl: ['动作轨迹']
};

const RULE_LABELS = {
  shoulderLevel: '肩线水平控制',
  trunkStable: '肩髋相对稳定性',
  elbowExtended: '肘关节伸展角度',
  headTilt: '头颈位置',
  hipKnee90: '髋膝角度偏差',
  armControl: '手臂控制'
};

function check(rule, observed, ratio = 0, evidence = '', error = false, value = null, reference = '') {
  return { rule, observed, ratio: clamp(ratio), evidence, error, value, reference };
}

function evaluateShoulderLevel(rule, landmarks, width, height) {
  if (!visible(landmarks, 11) || !visible(landmarks, 12)) return check(rule, false);
  const left = pixelPoint(landmarks, 11, width, height);
  const right = pixelPoint(landmarks, 12, width, height);
  const angle = Math.atan2(Math.abs(left.y - right.y), Math.abs(left.x - right.x)) * 180 / Math.PI;
  return check(rule, true, linearScore(angle, 5, 15), `肩线相对水平约 ${round(angle)}°`, angle > 8, angle, '≤5°为理想，>8°需关注');
}

function evaluateTrunkStable(rule, landmarks, width, height) {
  if (![11, 12, 23, 24].every((index) => visible(landmarks, index))) return check(rule, false);
  const leftShoulder = pixelPoint(landmarks, 11, width, height);
  const rightShoulder = pixelPoint(landmarks, 12, width, height);
  const leftHip = pixelPoint(landmarks, 23, width, height);
  const rightHip = pixelPoint(landmarks, 24, width, height);
  const difference = lineAngleDifference(leftShoulder, rightShoulder, leftHip, rightHip);
  return check(rule, true, linearScore(difference, 8, 25), `肩线与髋线夹角约 ${round(difference)}°`, difference > 12, difference, '理想≤8°，>12°需关注');
}

function extensionScore(angle) {
  if (angle >= 150 && angle <= 190) return 1;
  if (angle < 150) return clamp((angle - 100) / 50);
  return clamp((210 - angle) / 20);
}

function evaluateElbowExtended(rule, landmarks, width, height, exercise) {
  const observations = [];
  for (const [side, shoulder, elbow, wrist] of [['左', 11, 13, 15], ['右', 12, 14, 16]]) {
    if (![shoulder, elbow, wrist].every((index) => visible(landmarks, index))) continue;
    const angle = angleAt(
      pixelPoint(landmarks, shoulder, width, height),
      pixelPoint(landmarks, elbow, width, height),
      pixelPoint(landmarks, wrist, width, height)
    );
    if (angle !== null) observations.push({ side, angle });
  }
  if (!observations.length) return check(rule, false);
  const wallSlide = exercise.id === 'wall-slide';
  const ratio = average(observations.map((item) => {
    if (!wallSlide) return extensionScore(item.angle);
    if (item.angle >= 80 && item.angle <= 190) return 1;
    return item.angle < 80 ? clamp((item.angle - 50) / 30) : clamp((210 - item.angle) / 20);
  }));
  const meanAngle = average(observations.map((item) => item.angle));
  const evidence = observations.map((item) => `${item.side}肘约 ${round(item.angle)}°`).join('，');
  const hasError = wallSlide
    ? observations.some((item) => item.angle < 60 || item.angle > 200)
    : observations.some((item) => item.angle < 140 || item.angle > 200);
  const reference = wallSlide
    ? '滑臂过程允许屈肘，末端逐渐伸展；避免<60°失控或>200°过伸'
    : '通常150–190°；按动作阶段判断，避免过伸';
  return check(rule, true, ratio, evidence, hasError, meanAngle, reference);
}

function evaluateHeadTilt(rule, landmarks, width, height, exercise) {
  if (exercise.id === 'upper-trap-stretch') {
    if (![7, 8, 11, 12].every((index) => visible(landmarks, index))) return check(rule, false);
    const leftEar = pixelPoint(landmarks, 7, width, height);
    const rightEar = pixelPoint(landmarks, 8, width, height);
    const leftShoulder = pixelPoint(landmarks, 11, width, height);
    const rightShoulder = pixelPoint(landmarks, 12, width, height);
    const tilt = lineAngleDifference(leftEar, rightEar, leftShoulder, rightShoulder);
    let ratio;
    if (tilt < 12) ratio = tilt / 12;
    else if (tilt <= 45) ratio = 1;
    else ratio = linearScore(tilt, 45, 65);
    return check(rule, true, ratio, `头颈相对肩线侧屈约 ${round(tilt)}°`, tilt < 8 || tilt > 50, tilt, '舒适侧屈约12–45°，不强行拉扯');
  }

  const earIndices = [7, 8].filter((index) => visible(landmarks, index));
  const shoulderIndices = [11, 12].filter((index) => visible(landmarks, index));
  if (!earIndices.length || !shoulderIndices.length) return check(rule, false);
  const earPoints = earIndices.map((index) => pixelPoint(landmarks, index, width, height));
  const shoulderPoints = shoulderIndices.map((index) => pixelPoint(landmarks, index, width, height));
  const earCenter = earPoints.reduce((point, current) => ({ x: point.x + current.x / earPoints.length, y: point.y + current.y / earPoints.length }), { x: 0, y: 0 });
  const shoulderCenter = shoulderPoints.reduce((point, current) => ({ x: point.x + current.x / shoulderPoints.length, y: point.y + current.y / shoulderPoints.length }), { x: 0, y: 0 });

  let scale = null;
  if (shoulderIndices.length === 2) scale = distance(shoulderPoints[0], shoulderPoints[1]);
  const hipIndices = [23, 24].filter((index) => visible(landmarks, index));
  if (hipIndices.length && shoulderIndices.length) {
    const hipCenter = pixelPoint(landmarks, hipIndices[0], width, height);
    const trunkLength = distance(shoulderCenter, hipCenter);
    if (trunkLength > 0) scale = trunkLength;
  }
  if (!scale) return check(rule, false);
  const offsetPct = Math.abs(earCenter.x - shoulderCenter.x) / scale * 100;
  return check(rule, true, linearScore(offsetPct, 8, 25), `耳肩中线水平偏移约占参考躯干宽度 ${round(offsetPct)}%`, offsetPct > 12, offsetPct, '理想≤8%，>12%需关注');
}

function evaluateHipKnee90(rule, landmarks, width, height, exercise) {
  const observations = [];
  for (const [side, shoulder, hip, knee, ankle] of [['左', 11, 23, 25, 27], ['右', 12, 24, 26, 28]]) {
    if (![shoulder, hip, knee, ankle].every((index) => visible(landmarks, index))) continue;
    const shoulderPoint = pixelPoint(landmarks, shoulder, width, height);
    const hipPoint = pixelPoint(landmarks, hip, width, height);
    const kneePoint = pixelPoint(landmarks, knee, width, height);
    const anklePoint = pixelPoint(landmarks, ankle, width, height);
    const hipAngle = angleAt(shoulderPoint, hipPoint, kneePoint);
    const kneeAngle = angleAt(hipPoint, kneePoint, anklePoint);
    if (hipAngle === null || kneeAngle === null) continue;
    const deviation = Math.max(Math.abs(hipAngle - 90), Math.abs(kneeAngle - 90));
    observations.push({ side, hipAngle, kneeAngle, deviation, ratio: linearScore(deviation, 10, 60) });
  }
  if (!observations.length) return check(rule, false);
  const evidence = observations.map((item) => `${item.side}髋 ${round(item.hipAngle)}°、膝 ${round(item.kneeAngle)}°`).join('，');
  const deadBug = exercise.id === 'dead-bug';
  const referenceDeviation = deadBug
    ? Math.min(...observations.map((item) => item.deviation))
    : Math.max(...observations.map((item) => item.deviation));
  const ratio = deadBug
    ? Math.max(...observations.map((item) => item.ratio))
    : average(observations.map((item) => item.ratio));
  const reference = deadBug
    ? '交替活动时至少一侧保持桌面位参考；数值为支撑侧最大偏差'
    : '髋膝目标约90°，允许约±10°；数值为最大偏差';
  return check(rule, true, ratio, evidence, referenceDeviation > 20, referenceDeviation, reference);
}

function evaluateArmControl(rule, landmarks, width, height, exercise) {
  const arms = [];
  for (const [side, shoulder, elbow, wrist, hip] of [['左', 11, 13, 15, 23], ['右', 12, 14, 16, 24]]) {
    if (![shoulder, elbow, wrist].every((index) => visible(landmarks, index))) continue;
    const shoulderPoint = pixelPoint(landmarks, shoulder, width, height);
    const elbowPoint = pixelPoint(landmarks, elbow, width, height);
    const wristPoint = pixelPoint(landmarks, wrist, width, height);
    const elbowAngle = angleAt(shoulderPoint, elbowPoint, wristPoint);
    const abduction = visible(landmarks, hip)
      ? angleAt(pixelPoint(landmarks, hip, width, height), shoulderPoint, elbowPoint)
      : null;
    arms.push({ side, elbowAngle, abduction });
  }

  if (exercise.id === 'dead-bug') {
    const valid = arms.filter((arm) => arm.elbowAngle !== null);
    if (!valid.length) return check(rule, false);
    const ratios = valid.map((arm) => arm.elbowAngle >= 120 && arm.elbowAngle <= 190
      ? 1
      : arm.elbowAngle < 120 ? clamp((arm.elbowAngle - 80) / 40) : clamp((210 - arm.elbowAngle) / 20));
    const mean = average(valid.map((arm) => arm.elbowAngle));
    return check(rule, true, average(ratios), valid.map((arm) => `${arm.side}肘约 ${round(arm.elbowAngle)}°`).join('，'), valid.some((arm) => arm.elbowAngle < 100 || arm.elbowAngle > 200), mean, '手臂受控延伸，肘角通常保持120–190°');
  }

  const bilateral = arms.filter((arm) => arm.abduction !== null);
  if (bilateral.length < 2) return check(rule, false);
  const difference = Math.abs(bilateral[0].abduction - bilateral[1].abduction);
  return check(rule, true, linearScore(difference, 15, 45), `两侧肩外展角差约 ${round(difference)}°`, difference > 20, difference, '两侧理想差≤15°，>20°需关注');
}

function evaluateRule(rule, landmarks, width, height, exercise) {
  if (rule === 'shoulderLevel') return evaluateShoulderLevel(rule, landmarks, width, height);
  if (rule === 'trunkStable') return evaluateTrunkStable(rule, landmarks, width, height);
  if (rule === 'elbowExtended') return evaluateElbowExtended(rule, landmarks, width, height, exercise);
  if (rule === 'headTilt') return evaluateHeadTilt(rule, landmarks, width, height, exercise);
  if (rule === 'hipKnee90') return evaluateHipKnee90(rule, landmarks, width, height, exercise);
  if (rule === 'armControl') return evaluateArmControl(rule, landmarks, width, height, exercise);
  return check(rule, false);
}

function evaluateSymmetry(landmarks, width, height, exercise) {
  let pairs = [[11, 12], [23, 24]];
  if (['wall-slide', 'scapular-slide'].includes(exercise.id)) {
    pairs = pairs.concat([[13, 14], [15, 16], [25, 26], [27, 28]]);
  }
  const observedPairs = pairs.filter(([left, right]) => visible(landmarks, left) && visible(landmarks, right));
  if (!observedPairs.length || !visible(landmarks, 11) || !visible(landmarks, 12)) {
    return { observed: false, ratio: 0, value: null, evidence: '' };
  }

  const leftShoulder = pixelPoint(landmarks, 11, width, height);
  const rightShoulder = pixelPoint(landmarks, 12, width, height);
  const scale = distance(leftShoulder, rightShoulder);
  if (!scale) return { observed: false, ratio: 0, value: null, evidence: '' };
  const differences = observedPairs.map(([left, right]) => {
    const leftPoint = pixelPoint(landmarks, left, width, height);
    const rightPoint = pixelPoint(landmarks, right, width, height);
    return Math.abs(leftPoint.y - rightPoint.y) / scale * 100;
  });
  const mean = average(differences);
  return {
    observed: true,
    ratio: linearScore(mean, 5, 20),
    value: mean,
    evidence: `可见双侧关键点平均高差约占肩宽 ${round(mean)}%`,
    error: mean > 10
  };
}

function evaluateFrame(landmarks, width, height, exercise) {
  const rules = Array.isArray(exercise.rules) ? exercise.rules : [];
  return {
    landmarks,
    width,
    height,
    checks: rules.map((rule) => evaluateRule(rule, landmarks, width, height, exercise)),
    symmetry: evaluateSymmetry(landmarks, width, height, exercise)
  };
}

function normalizedCore(frame) {
  const { landmarks, width, height } = frame;
  if (![11, 12, 23, 24].every((index) => visible(landmarks, index))) return null;
  const points = [11, 12, 23, 24].map((index) => pixelPoint(landmarks, index, width, height));
  const hipCenter = midpoint(points[2], points[3]);
  const shoulderCenter = midpoint(points[0], points[1]);
  const scale = distance(hipCenter, shoulderCenter) || distance(points[0], points[1]);
  if (!scale) return null;
  return points.map((point) => ({ x: (point.x - hipCenter.x) / scale, y: (point.y - hipCenter.y) / scale }));
}

function stabilityStats(frames) {
  const normalized = frames.map(normalizedCore);
  const movements = [];
  for (let index = 1; index < normalized.length; index += 1) {
    if (!normalized[index] || !normalized[index - 1]) continue;
    const displacement = average(normalized[index].map((point, pointIndex) =>
      distance(point, normalized[index - 1][pointIndex])
    ));
    if (displacement !== null) movements.push(displacement);
  }
  if (!movements.length) return { observed: false, ratio: 0, value: null };
  const mean = average(movements);
  return {
    observed: true,
    ratio: linearScore(mean, 0.02, 0.1),
    value: mean * 100,
    evidence: `核心关键点归一化帧间波动约 ${round(mean * 100)}% 躯干长`
  };
}

function motionSignal(frame, exercise) {
  const { landmarks, width, height } = frame;
  const rules = Array.isArray(exercise.rules) ? exercise.rules : [];

  if (rules.includes('hipKnee90')) {
    const angles = [];
    for (const [hip, knee, ankle] of [[23, 25, 27], [24, 26, 28]]) {
      if (![hip, knee, ankle].every((index) => visible(landmarks, index))) continue;
      const angle = angleAt(
        pixelPoint(landmarks, hip, width, height),
        pixelPoint(landmarks, knee, width, height),
        pixelPoint(landmarks, ankle, width, height)
      );
      if (angle !== null) angles.push(angle);
    }
    return angles.length ? Math.max(...angles) : null;
  }

  if (rules.includes('armControl') || rules.includes('elbowExtended')) {
    const heights = [];
    for (const [shoulder, wrist] of [[11, 15], [12, 16]]) {
      if (!visible(landmarks, shoulder) || !visible(landmarks, wrist)) continue;
      const shoulderPoint = pixelPoint(landmarks, shoulder, width, height);
      const wristPoint = pixelPoint(landmarks, wrist, width, height);
      const scale = height * 0.25 || 1;
      heights.push((shoulderPoint.y - wristPoint.y) / scale);
    }
    return heights.length ? average(heights) : null;
  }

  if ([11, 12, 23, 24].every((index) => visible(landmarks, index))) {
    const leftShoulder = pixelPoint(landmarks, 11, width, height);
    const rightShoulder = pixelPoint(landmarks, 12, width, height);
    const leftHip = pixelPoint(landmarks, 23, width, height);
    const rightHip = pixelPoint(landmarks, 24, width, height);
    return lineAngle(midpoint(leftHip, rightHip), midpoint(leftShoulder, rightShoulder));
  }
  return null;
}

function motionStats(frames, exercise) {
  if (!exercise.dynamic) return { observed: false, ratio: 0, trajectoryRatio: 0, range: null };
  const signals = frames.map((frame) => motionSignal(frame, exercise)).filter(Number.isFinite);
  if (signals.length < 4) return { observed: false, ratio: 0, trajectoryRatio: 0, range: null };

  const min = Math.min(...signals);
  const max = Math.max(...signals);
  const range = max - min;
  const rules = Array.isArray(exercise.rules) ? exercise.rules : [];
  const armSignal = rules.includes('armControl') || rules.includes('elbowExtended');
  const angleSignal = rules.includes('hipKnee90') || !armSignal;
  const minimumRange = angleSignal ? 3 : 0.025;
  if (range < minimumRange) {
    return { observed: true, ratio: 0.25, trajectoryRatio: 0.25, range, lowMotion: true };
  }

  const deltas = signals.slice(1).map((value, index) => Math.abs(value - signals[index]));
  const activeThreshold = Math.max(range * 0.06, minimumRange * 0.15);
  const active = deltas.filter((delta) => delta >= activeThreshold);
  const activeCoverage = active.length / deltas.length;
  const meanActive = average(active) || 0;
  const variance = active.length
    ? average(active.map((delta) => (delta - meanActive) ** 2))
    : 0;
  const coefficient = meanActive ? Math.sqrt(variance || 0) / meanActive : 1;
  const consistency = active.length >= 2 ? clamp(1 - coefficient / 1.5) : 0.35;
  const coverageScore = activeCoverage >= 0.25 && activeCoverage <= 0.9
    ? 1
    : activeCoverage < 0.25 ? activeCoverage / 0.25 : clamp((1 - activeCoverage) / 0.1);
  const ratio = clamp(consistency * 0.7 + coverageScore * 0.3);
  const maxStepRatio = Math.max(...deltas) / range;
  const trajectoryRatio = clamp(1 - Math.max(0, maxStepRatio - 0.55) / 0.45);

  return {
    observed: true,
    ratio,
    trajectoryRatio,
    range,
    lowMotion: false,
    evidence: `有效运动信号范围 ${round(range)}${angleSignal ? '°' : '（归一化单位）'}，活动帧间隔占比 ${round(activeCoverage * 100)}%`
  };
}

function scoreFromRatios(max, ratios) {
  const valid = ratios.filter(Number.isFinite);
  if (!valid.length) return { score: 0, max, observed: false };
  return { score: round(max * average(valid), 1), max, observed: true };
}

function buildDimensions(mediaType, frames, stability, motion) {
  const isVideo = mediaType === 'video';
  const names = isVideo
    ? [['关节排列', 30], ['动作轨迹', 20], ['稳定控制', 20], ['节奏与重复一致性', 15], ['左右对称', 15]]
    : [['关节排列', 40], ['关键姿势', 30], ['左右对称', 20], ['安全', 10]];
  const targets = isVideo ? VIDEO_RULE_TARGETS : PHOTO_RULE_TARGETS;
  const symmetryRatios = frames.filter((frame) => frame.symmetry.observed).map((frame) => frame.symmetry.ratio);

  return names.map(([name, max]) => {
    let scored;
    if (name === '左右对称') {
      scored = scoreFromRatios(max, symmetryRatios);
    } else if (name === '稳定控制') {
      scored = stability.observed ? { score: round(max * stability.ratio, 1), max, observed: true } : { score: 0, max, observed: false };
    } else if (name === '节奏与重复一致性') {
      scored = motion.observed ? { score: round(max * motion.ratio, 1), max, observed: true } : { score: 0, max, observed: false };
    } else if (name === '安全') {
      const ratios = frames.flatMap((frame) => frame.checks
        .filter((item) => item.observed && ['trunkStable', 'headTilt', 'elbowExtended', 'hipKnee90'].includes(item.rule))
        .map((item) => item.ratio));
      scored = scoreFromRatios(max, ratios);
    } else {
      const ratios = frames.flatMap((frame) => frame.checks
        .filter((item) => item.observed && (targets[item.rule] || []).includes(name))
        .map((item) => item.ratio));
      if (name === '动作轨迹' && motion.observed) ratios.push(motion.trajectoryRatio);
      scored = scoreFromRatios(max, ratios);
    }
    return { name, ...scored };
  });
}

function relatedRule(exercise, preferred) {
  const rules = Array.isArray(exercise.rules) ? exercise.rules : [];
  return preferred.find((rule) => rules.includes(rule)) || rules[0] || null;
}

function exerciseFeedback(exercise, rule, evidence, fallbackTitle) {
  const rules = Array.isArray(exercise.rules) ? exercise.rules : [];
  const commonErrors = Array.isArray(exercise.commonErrors) ? exercise.commonErrors : [];
  const corrections = Array.isArray(exercise.corrections) ? exercise.corrections : [];
  const keyPoints = Array.isArray(exercise.keyPoints) ? exercise.keyPoints : [];
  const ruleIndex = rules.indexOf(rule);
  const index = ruleIndex >= 0 ? ruleIndex : 0;
  return {
    error: {
      title: commonErrors[index] || fallbackTitle || '动作控制仍需关注',
      evidence,
      standard: keyPoints[index] || keyPoints[0] || '在无痛、可控制的范围内完成动作'
    },
    correction: corrections[index] || corrections[0] || '缩小动作幅度，放慢速度并重新确认身体对齐'
  };
}

function buildPracticeFeedback(frames, exercise, stability, motion, mediaType) {
  if (!frames.length) {
    const fallback = exerciseFeedback(
      exercise,
      relatedRule(exercise, ['trunkStable']),
      '媒体中未获得足够的人体关键点，无法计算动作角度或轨迹；请保证全身入镜、光线充足并减少遮挡',
      '无法评估动作'
    );
    fallback.error.title = '未识别到足够的人体关键点，无法评估';
    return { errors: [fallback.error], corrections: [fallback.correction] };
  }

  const feedback = [];
  const rules = [...new Set(frames.flatMap((frame) => frame.checks.filter((item) => item.observed).map((item) => item.rule)))];

  for (const rule of rules) {
    const checks = frames.flatMap((frame) => frame.checks).filter((item) => item.rule === rule && item.observed);
    if (!checks.length) continue;
    const meanRatio = average(checks.map((item) => item.ratio));
    const badCount = checks.filter((item) => item.error).length;
    if (meanRatio >= 0.65 && badCount / checks.length <= 0.25) continue;
    const worst = [...checks].sort((a, b) => a.ratio - b.ratio)[0];
    const suffix = mediaType === 'video' ? `；${badCount}/${checks.length} 个有效采样帧提示该问题` : '';
    feedback.push(exerciseFeedback(exercise, rule, `${worst.evidence}${suffix}`, RULE_LABELS[rule]));
  }

  const symmetry = frames.filter((frame) => frame.symmetry.observed).map((frame) => frame.symmetry);
  if (symmetry.length) {
    const ratio = average(symmetry.map((item) => item.ratio));
    const badCount = symmetry.filter((item) => item.error).length;
    if (ratio < 0.6 || badCount / symmetry.length > 0.3) {
      const worst = [...symmetry].sort((a, b) => a.ratio - b.ratio)[0];
      const rule = relatedRule(exercise, ['shoulderLevel', 'trunkStable', 'armControl']);
      feedback.push(exerciseFeedback(exercise, rule, worst.evidence, '左右对称性不足'));
    }
  }

  if (stability.observed && stability.ratio < 0.55) {
    const rule = relatedRule(exercise, ['trunkStable', 'shoulderLevel']);
    feedback.push(exerciseFeedback(exercise, rule, stability.evidence, '核心稳定性不足'));
  }

  if (motion.observed && (motion.ratio < 0.5 || motion.trajectoryRatio < 0.45)) {
    const rule = relatedRule(exercise, ['hipKnee90', 'armControl', 'headTilt', 'trunkStable']);
    const evidence = motion.lowMotion
      ? '采样帧中未观察到足够的动作幅度，无法确认完整重复'
      : motion.evidence;
    feedback.push(exerciseFeedback(exercise, rule, evidence, '动作轨迹或节奏不稳定'));
  }

  const unique = [];
  const titles = new Set();
  const corrections = [];
  for (const item of feedback) {
    if (!titles.has(item.error.title)) {
      titles.add(item.error.title);
      unique.push(item.error);
    }
    if (!corrections.includes(item.correction)) corrections.push(item.correction);
  }
  return { errors: unique, corrections };
}

function buildPracticeMetrics(frames, stability, motion) {
  const metrics = [];
  const rules = [...new Set(frames.flatMap((frame) => frame.checks.filter((item) => item.observed && Number.isFinite(item.value)).map((item) => item.rule)))];
  for (const rule of rules) {
    const checks = frames.flatMap((frame) => frame.checks).filter((item) => item.rule === rule && item.observed && Number.isFinite(item.value));
    metrics.push({
      label: RULE_LABELS[rule] || rule,
      value: round(average(checks.map((item) => item.value))),
      reference: checks[0].reference,
      status: average(checks.map((item) => item.ratio)) >= 0.65 ? '达标' : '需关注'
    });
  }

  const symmetry = frames.filter((frame) => frame.symmetry.observed).map((frame) => frame.symmetry);
  if (symmetry.length) {
    metrics.push({
      label: '双侧关键点平均高差/肩宽',
      value: round(average(symmetry.map((item) => item.value))),
      reference: '理想≤5%，>10%需关注',
      status: average(symmetry.map((item) => item.ratio)) >= 0.6 ? '达标' : '需关注'
    });
  }
  if (stability.observed) {
    metrics.push({
      label: '核心关键点帧间波动/躯干长',
      value: round(stability.value),
      reference: '理想≤2%，>10%提示明显波动',
      status: stability.ratio >= 0.55 ? '达标' : '需关注'
    });
  }
  if (motion.observed) {
    metrics.push({
      label: '动作信号采样范围',
      value: round(motion.range),
      reference: '应可见连续、可重复的有效动作幅度',
      status: motion.ratio >= 0.5 && motion.trajectoryRatio >= 0.45 ? '达标' : '需关注'
    });
  }
  return metrics;
}

function practiceConfidence(frames) {
  const values = frames.map((frame) => average(PRACTICE_LANDMARKS.map((index) => visibility(frame.landmarks, index))));
  return round(average(values) || 0, 2);
}

function scorePractice(mediaType, frames, exercise, frameCount = frames.length) {
  const stability = mediaType === 'video' ? stabilityStats(frames) : { observed: false };
  const motion = mediaType === 'video' ? motionStats(frames, exercise) : { observed: false };
  const dimensions = buildDimensions(mediaType, frames, stability, motion);
  const observedMax = dimensions.filter((dimension) => dimension.observed).reduce((sum, dimension) => sum + dimension.max, 0);
  const earned = dimensions.filter((dimension) => dimension.observed).reduce((sum, dimension) => sum + dimension.score, 0);
  const score = observedMax ? Math.round(clamp(earned / observedMax, 0, 1) * 100) : 0;
  const feedback = buildPracticeFeedback(frames, exercise, stability, motion, mediaType);

  return {
    mediaType,
    score,
    dimensions,
    errors: feedback.errors,
    corrections: feedback.corrections,
    metrics: buildPracticeMetrics(frames, stability, motion),
    frameCount,
    confidence: practiceConfidence(frames)
  };
}

function loadImageFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve({ image, url });
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('练习图片加载失败，请换用常见图片格式'));
    };
    image.src = url;
  });
}

function waitForMetadata(video) {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('error', onError);
    };
    const onLoaded = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('练习视频加载失败，请确认浏览器支持该视频编码'));
    };
    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('error', onError);
  });
}

function seekVideo(video, time) {
  if (Math.abs(video.currentTime - time) < 0.00001 && video.readyState >= 2) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const cleanup = () => {
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
    };
    const onSeeked = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('视频定位采样帧失败'));
    };
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    video.currentTime = time;
  });
}

async function analyzeImagePractice(file, exercise, onProgress) {
  const { image, url } = await loadImageFile(file);
  try {
    notify(onProgress, 0, 1, 'practice-image');
    const landmarks = await withLandmarker('IMAGE', (landmarker) => {
      const result = landmarker.detect(image);
      return result?.landmarks?.[0] || null;
    });
    const { width, height } = sourceSize(image);
    const frames = landmarks ? [evaluateFrame(landmarks, width, height, exercise)] : [];
    notify(onProgress, 1, 1, 'practice-image');
    return scorePractice('image', frames, exercise, 1);
  } finally {
    URL.revokeObjectURL(url);
    image.src = '';
  }
}

async function analyzeVideoPractice(file, exercise, onProgress) {
  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.preload = 'auto';
  video.muted = true;
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.style.cssText = 'position:fixed;left:-9999px;top:0;width:2px;height:2px;opacity:0;pointer-events:none;';
  document.body.appendChild(video);

  try {
    const metadata = waitForMetadata(video);
    video.src = url;
    video.load();
    await metadata;
    if (!Number.isFinite(video.duration) || video.duration <= 0) throw new Error('视频时长不可读取，无法采样');

    const frameTarget = 12;
    notify(onProgress, 0, frameTarget, 'practice-video');
    const frames = await withLandmarker('VIDEO', async (landmarker) => {
      const sampled = [];
      let previousTimestamp = -1;
      const { width, height } = sourceSize(video);

      for (let index = 0; index < frameTarget; index += 1) {
        const targetTime = Math.min(
          Math.max(0, video.duration - 0.001),
          (index + 0.5) * video.duration / frameTarget
        );
        await seekVideo(video, targetTime);
        const timestamp = Math.max(previousTimestamp + 1, video.currentTime * 1000);
        const result = landmarker.detectForVideo(video, timestamp);
        previousTimestamp = timestamp;
        const landmarks = result?.landmarks?.[0] || null;
        if (landmarks) sampled.push(evaluateFrame(landmarks, width, height, exercise));
        notify(onProgress, index + 1, frameTarget, 'practice-video');
      }
      return sampled;
    });

    return scorePractice('video', frames, exercise, frameTarget);
  } finally {
    video.pause();
    video.removeAttribute('src');
    video.load();
    video.remove();
    URL.revokeObjectURL(url);
  }
}

export async function analyzePractice(file, exercise, onProgress) {
  if (!file || typeof file.type !== 'string') throw new TypeError('请提供浏览器图片或视频 File');
  if (!exercise || typeof exercise !== 'object') throw new TypeError('请提供 exercises.js 中的动作对象');

  if (file.type.startsWith('image/')) return analyzeImagePractice(file, exercise, onProgress);
  if (file.type.startsWith('video/')) return analyzeVideoPractice(file, exercise, onProgress);
  throw new TypeError('仅支持浏览器可读取的图片或视频文件');
}
