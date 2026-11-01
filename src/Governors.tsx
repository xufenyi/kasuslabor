import { ArrowRight, Check, Compass, GitBranch, Magnet, MapPin, MoveRight, PackageOpen, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PhaseActions } from './PhaseActions'

export type Stage3Unit = 'valency' | 'fixed-preps' | 'two-way'
type LanguageMode = 'both' | 'zh' | 'de'
type GovernedCase = 'akk' | 'dat' | 'gen'

function uiText(mode: LanguageMode, zh: string, de: string) {
  if (mode === 'zh') return zh
  if (mode === 'de') return de
  return `${zh} · ${de}`
}

function Bilingual({ mode, zh, de, className = '' }: { mode: LanguageMode; zh: string; de: string; className?: string }) {
  return (
    <div className={`bilingual ${className}`.trim()}>
      {mode !== 'de' && <p className="copy-zh">{zh}</p>}
      {mode !== 'zh' && <p className="copy-de" lang="de">{de}</p>}
    </div>
  )
}

const stage3Meta: Record<Stage3Unit, { number: string; zh: string; de: string; code: string }> = {
  valency: { number: '07', zh: '动词配价实验室', de: 'Verbvalenz-Labor', code: 'VERB' },
  'fixed-preps': { number: '08', zh: '固定格介词', de: 'Feste Präpositionen', code: 'PRÄP' },
  'two-way': { number: '09', zh: '双向介词空间实验', de: 'Wechselpräpositionen', code: 'WO?' },
}

function MiniQuiz({ mode, prompt, options, answer, whyZh, whyDe }: { mode: LanguageMode; prompt: string; options: string[]; answer: string; whyZh: string; whyDe: string }) {
  const [selected, setSelected] = useState<string | null>(null)
  const correct = selected === answer

  useEffect(() => setSelected(null), [prompt, answer])

  return (
    <div className="governor-quiz">
      <span className="governor-mini-label"><Sparkles size={15} /> MINI-CHECK</span>
      <p lang="de">{prompt}</p>
      <div className="governor-options">
        {options.map((option) => (
          <button type="button" key={option} aria-pressed={selected === option} className={selected === option ? (correct ? 'is-correct' : 'is-wrong') : ''} onClick={() => setSelected(option)}>{option}</button>
        ))}
      </div>
      {selected && (
        <div className={`governor-feedback ${correct ? 'is-correct' : 'is-wrong'}`} role="status">
          {correct ? <Check size={18} /> : <X size={18} />}
          <div><strong>{uiText(mode, correct ? '命中支配关系' : `正确形式：${answer}`, correct ? 'Rektion erkannt' : `Richtig: ${answer}`)}</strong><Bilingual mode={mode} zh={whyZh} de={whyDe} /></div>
        </div>
      )}
    </div>
  )
}

const verbs = {
  schlafen: {
    label: 'schlafen', level: '一价 · einwertig', pattern: 'jemand schläft',
    zh: '只需要一个主语插槽，句子就完整了。', de: 'Nur eine Subjektstelle ist nötig.',
    slots: [{ role: 'Subjekt', caseKey: 'nom', text: 'das Kind' }], example: 'Das Kind schläft.',
  },
  sehen: {
    label: 'sehen', level: '二价 · zweiwertig', pattern: 'jemand sieht jemanden / etwas',
    zh: 'sehen 通常再打开一个宾格插槽。', de: 'sehen öffnet normalerweise zusätzlich eine Akkusativstelle.',
    slots: [{ role: 'Subjekt', caseKey: 'nom', text: 'die Frau' }, { role: 'Objekt', caseKey: 'akk', text: 'den Hund' }], example: 'Die Frau sieht den Hund.',
  },
  helfen: {
    label: 'helfen', level: '二价 · zweiwertig', pattern: 'jemand hilft jemandem',
    zh: 'helfen 的对象固定使用与格，不能按中文直觉改成宾格。', de: 'Das Objekt von helfen steht fest im Dativ.',
    slots: [{ role: 'Subjekt', caseKey: 'nom', text: 'die Frau' }, { role: 'Objekt', caseKey: 'dat', text: 'dem Kind' }], example: 'Die Frau hilft dem Kind.',
  },
  geben: {
    label: 'geben', level: '三价 · dreiwertig', pattern: 'jemand gibt jemandem etwas',
    zh: 'geben 常同时打开接收者与格和事物宾格两个插槽。', de: 'geben öffnet oft eine Dativstelle für den Empfänger und eine Akkusativstelle für die Sache.',
    slots: [{ role: 'Subjekt', caseKey: 'nom', text: 'der Mann' }, { role: 'Empfänger', caseKey: 'dat', text: 'dem Kind' }, { role: 'Sache', caseKey: 'akk', text: 'den Ball' }], example: 'Der Mann gibt dem Kind den Ball.',
  },
} as const

type VerbKey = keyof typeof verbs

function ValencyUnit({ mode }: { mode: LanguageMode }) {
  const [verbKey, setVerbKey] = useState<VerbKey>('geben')
  const verb = verbs[verbKey]
  return (
    <div className="governor-unit">
      <div className="governor-lead">
        <span className="governor-badge">07 · VERB ALS BAUPLAN</span>
        <h2>{uiText(mode, '动词不是一个词，而是一张座位图', 'Ein Verb ist ein Sitzplan')}</h2>
        <Bilingual mode={mode} zh="配价描述动词为哪些句子成分预留“插槽”。学习新动词时，把格和常见句型一起记住，比只背中文意思可靠。" de="Valenz beschreibt, welche Stellen ein Verb für Satzglieder öffnet. Lerne neue Verben zusammen mit Kasus und Satzmuster, nicht nur mit einer Übersetzung." />
      </div>

      <div className="valency-lab">
        <div className="verb-selector" role="tablist" aria-label="选择动词">
          {(Object.keys(verbs) as VerbKey[]).map((key) => (
            <button type="button" role="tab" aria-selected={verbKey === key} className={verbKey === key ? 'is-active' : ''} key={key} onClick={() => setVerbKey(key)}>
              <strong>{verbs[key].label}</strong><span>{verbs[key].level}</span>
            </button>
          ))}
        </div>
        <div className="valency-board">
          <div className="verb-core"><GitBranch size={24} /><strong>{verb.label}</strong><small>{verb.pattern}</small></div>
          <div className="slot-row">
            {verb.slots.map((slot, index) => (
              <div className={`verb-slot case-${slot.caseKey}`} key={`${verbKey}-${slot.role}`}>
                <span>0{index + 1} · {slot.role}</span><strong>{slot.caseKey.toUpperCase()}</strong><p lang="de">{slot.text}</p>
              </div>
            ))}
          </div>
          <p className="built-sentence" lang="de">{verb.example}</p>
          <Bilingual mode={mode} zh={verb.zh} de={verb.de} />
        </div>
      </div>

      <div className="governor-two-col">
        <article className="memory-card"><PackageOpen size={22} /><h3>{uiText(mode, '整块收进词汇本', 'Als Ganzes lernen')}</h3><p lang="de">jemandem helfen<br />jemanden sehen<br />jemandem etwas geben</p><Bilingual mode={mode} zh="把代词占位符一起记：-en 常提示宾格，-em 常提示与格。" de="Merke die Platzhalter mit: -en weist oft auf Akkusativ, -em auf Dativ." /></article>
        <MiniQuiz mode={mode} prompt="Ich helfe ___ Nachbarn." options={['der', 'den', 'dem', 'des']} answer="dem" whyZh="helfen 的对象由动词固定支配为与格：jemandem helfen。" whyDe="helfen regiert fest den Dativ: jemandem helfen." />
      </div>
    </div>
  )
}

const prepGroups: Record<GovernedCase, { title: string; question: string; items: { prep: string; example: string; zh: string; de: string }[] }> = {
  akk: {
    title: 'Akkusativ', question: 'Wen? Was?', items: [
      { prep: 'durch', example: 'durch den Park', zh: '穿过公园', de: 'durch den Park hindurch' },
      { prep: 'für', example: 'für meinen Freund', zh: '为了/给我的朋友', de: 'bestimmt für meinen Freund' },
      { prep: 'gegen', example: 'gegen die Wand', zh: '朝向/碰着墙', de: 'in Richtung der Wand' },
      { prep: 'ohne', example: 'ohne einen Plan', zh: '没有计划', de: 'kein Plan ist vorhanden' },
      { prep: 'um', example: 'um das Haus', zh: '围绕房子', de: 'rund um das Haus' },
    ],
  },
  dat: {
    title: 'Dativ', question: 'Wem?', items: [
      { prep: 'aus', example: 'aus der Stadt', zh: '来自城市', de: 'Herkunft aus der Stadt' },
      { prep: 'außer', example: 'außer dem Kind', zh: '除了这个孩子', de: 'mit Ausnahme des Kindes' },
      { prep: 'bei', example: 'bei dem Arzt', zh: '在医生那里', de: 'beim Arzt' },
      { prep: 'mit', example: 'mit dem Zug', zh: '乘火车/和火车一起', de: 'mithilfe des Zuges' },
      { prep: 'nach', example: 'nach der Arbeit', zh: '下班后', de: 'zeitlich später' },
      { prep: 'seit', example: 'seit einem Jahr', zh: '一年来', de: 'Beginn in der Vergangenheit' },
      { prep: 'von', example: 'von meiner Schwester', zh: '来自我的姐妹', de: 'Ausgangspunkt oder Urheber' },
      { prep: 'zu', example: 'zu dem Bahnhof', zh: '去火车站', de: 'zum Bahnhof' },
    ],
  },
  gen: {
    title: 'Genitiv', question: 'Wessen?', items: [
      { prep: 'wegen', example: 'wegen des Regens', zh: '因为下雨', de: 'Grund: der Regen' },
      { prep: 'trotz', example: 'trotz des Wetters', zh: '尽管天气如此', de: 'Gegengrund: das Wetter' },
      { prep: 'während', example: 'während der Pause', zh: '休息期间', de: 'innerhalb der Pause' },
      { prep: 'außerhalb', example: 'außerhalb der Stadt', zh: '在城外', de: 'nicht innerhalb der Stadt' },
    ],
  },
}

const contractions = [
  { short: 'am', long: 'an dem', caseKey: 'DAT', example: 'am Montag' },
  { short: 'im', long: 'in dem', caseKey: 'DAT', example: 'im Haus' },
  { short: 'ins', long: 'in das', caseKey: 'AKK', example: 'ins Haus' },
  { short: 'zum', long: 'zu dem', caseKey: 'DAT', example: 'zum Bahnhof' },
  { short: 'zur', long: 'zu der', caseKey: 'DAT', example: 'zur Schule' },
  { short: 'vom', long: 'von dem', caseKey: 'DAT', example: 'vom Arzt' },
]

function FixedPrepositionsUnit({ mode }: { mode: LanguageMode }) {
  const [caseKey, setCaseKey] = useState<GovernedCase>('akk')
  const [contractionIndex, setContractionIndex] = useState(0)
  const group = prepGroups[caseKey]
  const contraction = contractions[contractionIndex]
  return (
    <div className="governor-unit">
      <div className="governor-lead">
        <span className="governor-badge">08 · PRÄPOSITION ALS MAGNET</span>
        <h2>{uiText(mode, '介词像磁铁：它会吸来一个格', 'Präpositionen ziehen einen Kasus an')}</h2>
        <Bilingual mode={mode} zh="固定格介词后面的名词短语，不需要重新猜句子角色。最有效的记法是把“介词 + 格 + 小例句”作为一个整体。" de="Nach festen Präpositionen musst du die Satzrolle nicht neu erraten. Lerne Präposition, Kasus und ein kurzes Beispiel als Einheit." />
      </div>

      <div className="prep-filter" role="tablist" aria-label="按格筛选介词">
        {(Object.keys(prepGroups) as GovernedCase[]).map((key) => (
          <button type="button" role="tab" aria-selected={caseKey === key} className={`case-${key} ${caseKey === key ? 'is-active' : ''}`} key={key} onClick={() => setCaseKey(key)}><Magnet size={18} /><strong>{prepGroups[key].title}</strong><span>{prepGroups[key].question}</span></button>
        ))}
      </div>

      <div className={`prep-shelf case-${caseKey}`}>
        {group.items.map((item) => (
          <article key={item.prep}><span>{item.prep}</span><strong lang="de">{item.example}</strong><Bilingual mode={mode} zh={item.zh} de={item.de} /></article>
        ))}
      </div>

      <div className="contraction-lab">
        <div className="contraction-copy"><span className="governor-mini-label">KURZFORM-DECODER</span><h3>{uiText(mode, '把缩合形式拆开看', 'Kurzformen auseinanderbauen')}</h3><Bilingual mode={mode} zh="常用介词和定冠词会缩成一个词。拆开后，格信号就重新显出来。" de="Häufige Präpositionen und bestimmte Artikel verschmelzen. Beim Zerlegen wird das Kasussignal sichtbar." /></div>
        <div className="contraction-machine">
          <div className="contraction-tabs">
            {contractions.map((item, index) => <button type="button" key={item.short} className={contractionIndex === index ? 'is-active' : ''} aria-pressed={contractionIndex === index} onClick={() => setContractionIndex(index)}>{item.short}</button>)}
          </div>
          <div className="contraction-equation" aria-live="polite"><strong>{contraction.short}</strong><span>=</span><b>{contraction.long}</b><em>{contraction.caseKey}</em></div>
          <p lang="de">{contraction.example}</p>
        </div>
      </div>

      <MiniQuiz mode={mode} prompt="Wir fahren mit ___ Zug." options={['der', 'den', 'dem', 'des']} answer="dem" whyZh="mit 固定支配与格；阳性单数与格是 dem Zug。" whyDe="mit regiert fest den Dativ; Maskulin Singular: dem Zug." />
    </div>
  )
}

const spacePairs = {
  auf: { label: 'auf', dat: 'Das Buch liegt auf dem Tisch.', akk: 'Ich lege das Buch auf den Tisch.', object: 'Buch', place: 'Tisch' },
  in: { label: 'in', dat: 'Das Kind spielt in dem Garten.', akk: 'Das Kind läuft in den Garten.', object: 'Kind', place: 'Garten' },
  unter: { label: 'unter', dat: 'Die Katze schläft unter dem Tisch.', akk: 'Die Katze läuft unter den Tisch.', object: 'Katze', place: 'Tisch' },
  zwischen: { label: 'zwischen', dat: 'Der Stuhl steht zwischen den Tischen.', akk: 'Ich stelle den Stuhl zwischen die Tische.', object: 'Stuhl', place: 'Tische' },
} as const

type SpacePrep = keyof typeof spacePairs
type SpatialRelation = 'place' | 'target'

function TwoWayUnit({ mode }: { mode: LanguageMode }) {
  const [prep, setPrep] = useState<SpacePrep>('auf')
  const [relation, setRelation] = useState<SpatialRelation>('place')
  const pair = spacePairs[prep]
  const isTarget = relation === 'target'
  const sentence = isTarget ? pair.akk : pair.dat
  const explanation = useMemo(() => isTarget
    ? { zh: '目标方向回答 Wohin?，双向介词使用 Akkusativ。关键是位置将要改变，而不是句子里出现了移动。', de: 'Eine Zielrichtung antwortet auf Wohin? und verlangt hier den Akkusativ. Entscheidend ist die angestrebte neue Position.' }
    : { zh: '所在位置回答 Wo?，双向介词使用 Dativ。即使人在活动，只要描述活动发生的范围，仍然是位置。', de: 'Ein Ort antwortet auf Wo? und verlangt hier den Dativ. Auch eine Aktivität kann innerhalb eines Ortes stattfinden.' }, [isTarget])

  return (
    <div className="governor-unit">
      <div className="governor-lead">
        <span className="governor-badge">09 · RAUMEXPERIMENT</span>
        <h2>{uiText(mode, '不是“动就宾格，静就与格”', 'Nicht einfach Bewegung gegen Stillstand')}</h2>
        <Bilingual mode={mode} zh="九个双向介词可接与格或宾格。先判断名词短语表达所在位置（Wo?）还是指向新位置的目标（Wohin?），再选格。" de="Neun Wechselpräpositionen stehen mit Dativ oder Akkusativ. Entscheide zuerst: Ort (Wo?) oder Zielrichtung zu einer neuen Position (Wohin?)." />
      </div>

      <div className="nine-preps" aria-label="九个双向介词">
        {['an', 'auf', 'hinter', 'in', 'neben', 'über', 'unter', 'vor', 'zwischen'].map((item) => <span key={item} className={item === prep ? 'is-active' : ''}>{item}</span>)}
      </div>

      <div className="space-lab">
        <div className="space-controls">
          <fieldset><legend>{uiText(mode, '选择介词', 'Präposition wählen')}</legend><div>{(Object.keys(spacePairs) as SpacePrep[]).map((key) => <button type="button" key={key} aria-pressed={prep === key} className={prep === key ? 'is-active' : ''} onClick={() => setPrep(key)}>{key}</button>)}</div></fieldset>
          <fieldset><legend>{uiText(mode, '选择关系', 'Beziehung wählen')}</legend><div className="relation-switch"><button type="button" aria-pressed={!isTarget} className={!isTarget ? 'is-active' : ''} onClick={() => setRelation('place')}><MapPin size={17} />Wo? · DAT</button><button type="button" aria-pressed={isTarget} className={isTarget ? 'is-active' : ''} onClick={() => setRelation('target')}><MoveRight size={17} />Wohin? · AKK</button></div></fieldset>
        </div>

        <div className={`space-scene prep-${prep} ${isTarget ? 'is-target' : 'is-place'}`} aria-label={uiText(mode, '空间关系示意', 'Raumbeziehung')}>
          <div className="scene-grid" />
          <div className="scene-place"><span>{pair.place}</span></div>
          <div className="scene-object"><span>{pair.object}</span></div>
          {isTarget && <div className="scene-arrow"><ArrowRight size={34} /></div>}
          <div className="scene-question">{isTarget ? 'Wohin?' : 'Wo?'}</div>
        </div>

        <div className="space-result">
          <span className={`case-${isTarget ? 'akk' : 'dat'}`}>{isTarget ? 'AKKUSATIV' : 'DATIV'}</span>
          <p lang="de">{sentence}</p>
          <Bilingual mode={mode} zh={explanation.zh} de={explanation.de} />
        </div>
      </div>

      <div className="movement-warning"><Compass size={22} /><div><strong>{uiText(mode, '反例：有移动也可能是与格', 'Gegenbeispiel: Bewegung mit Dativ')}</strong><p lang="de">Wir laufen <b>im Park</b>. (Wo? · DAT)<br />Wir laufen <b>in den Park</b>. (Wohin? · AKK)</p><Bilingual mode={mode} zh="第一句描述跑步发生的地点；第二句把公园设为目的地。判断的是空间关系，不是动词本身有没有运动。" de="Der erste Satz nennt den Ort der Aktivität; der zweite ein Ziel. Entscheidend ist die Raumbeziehung, nicht das Bewegungsverb allein." /></div></div>

      <MiniQuiz mode={mode} prompt="Das Kind spielt ___ Garten." options={['in den', 'in dem', 'in des']} answer="in dem" whyZh="spielen 虽有活动，但这里回答 Wo?：活动发生在花园里，所以用与格。" whyDe="Trotz der Aktivität antwortet die Angabe auf Wo?; deshalb steht der Dativ: in dem Garten." />
    </div>
  )
}

export function GovernorsSection({ mode, activeUnit, onUnitChange, onNextPhase }: { mode: LanguageMode; activeUnit: Stage3Unit; onUnitChange: (unit: Stage3Unit) => void; onNextPhase?: () => void }) {
  return (
    <section id="governors" className="governors-section" aria-labelledby="governors-title">
      <div className="section-shell">
        <div className="section-kicker"><Magnet size={17} /> PHASE 3 · KASUS-REGENTEN</div>
        <div className="governors-heading">
          <div><h2 id="governors-title">{uiText(mode, '谁决定用哪个格？', 'Wer bestimmt den Kasus?')}</h2><Bilingual mode={mode} zh="这一阶段把“凭感觉选格”换成三个可以操作的判断器：动词的插槽、固定介词的支配，以及双向介词中的空间关系。" de="Diese Phase ersetzt das Raten durch drei Werkzeuge: Verbplätze, feste Präpositionsrektion und Raumbeziehungen bei Wechselpräpositionen." /></div>
        </div>

        <div className="governor-tabs" role="tablist" aria-label="阶段 3 学习单元">
          {(Object.keys(stage3Meta) as Stage3Unit[]).map((key) => (
            <button type="button" role="tab" aria-selected={activeUnit === key} className={activeUnit === key ? 'is-active' : ''} key={key} onClick={() => onUnitChange(key)}><span>{stage3Meta[key].number}</span><strong>{uiText(mode, stage3Meta[key].zh, stage3Meta[key].de)}</strong><small>{stage3Meta[key].code}</small></button>
          ))}
        </div>

        <div className="governor-paper" role="tabpanel" key={activeUnit}>
          {activeUnit === 'valency' && <ValencyUnit mode={mode} />}
          {activeUnit === 'fixed-preps' && <FixedPrepositionsUnit mode={mode} />}
          {activeUnit === 'two-way' && <TwoWayUnit mode={mode} />}
        </div>
        <PhaseActions mode={mode} tabsSelector=".governor-tabs" showNext={activeUnit === 'two-way'} nextZh="进入阶段 4：词形如何变化" nextDe="Weiter zu Phase 4: Formen erkennen" onNext={onNextPhase} />
      </div>
    </section>
  )
}
