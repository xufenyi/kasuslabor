import { BookOpen, Check, Compass, Lightbulb, RotateCcw, Sparkles, Target, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PhaseActions } from './PhaseActions'

export type Stage2Unit = 'overview' | 'clues' | 'nom' | 'akk' | 'dat' | 'gen'
type LanguageMode = 'both' | 'zh' | 'de'
type CaseUnit = Exclude<Stage2Unit, 'overview' | 'clues'>
type Gender = 'm' | 'f' | 'n' | 'pl'

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

const unitMeta: Record<Stage2Unit, { number: string; zh: string; de: string; short: string }> = {
  overview: { number: '01', zh: '四格总览', de: 'Überblick', short: 'MAP' },
  clues: { number: '02', zh: '四条判断线索', de: 'Vier Spuren', short: '4×' },
  nom: { number: '03', zh: '主格', de: 'Nominativ', short: 'NOM' },
  akk: { number: '04', zh: '宾格', de: 'Akkusativ', short: 'AKK' },
  dat: { number: '05', zh: '与格', de: 'Dativ', short: 'DAT' },
  gen: { number: '06', zh: '属格', de: 'Genitiv', short: 'GEN' },
}

const caseData: Record<CaseUnit, {
  cn: string
  name: string
  number: string
  question: string
  leadZh: string
  leadDe: string
  roles: { zh: string; de: string; example: string }[]
  warningZh: string
  warningDe: string
  challenge: { prompt: string; options: string[]; answer: string; whyZh: string; whyDe: string }
}> = {
  nom: {
    cn: '主格', name: 'Nominativ', number: '第一格 · 1. Fall', question: 'Wer? Was?',
    leadZh: '主格是句子的“锚点”：它通常标记与谓语配合的主语。它不是永远站在第一位，也不一定是动作的执行者。',
    leadDe: 'Der Nominativ ist der Anker des Satzes: Meist markiert er das Subjekt zum Prädikat. Er steht nicht immer zuerst und ist nicht immer der Handelnde.',
    roles: [
      { zh: '普通主语：谁/什么发生了某事？', de: 'Subjekt: Wer oder was tut bzw. erlebt etwas?', example: 'Der Hund schläft.' },
      { zh: '系动词补语：sein、werden、bleiben 两边常都是主格。', de: 'Prädikativ: Bei sein, werden, bleiben steht oft ebenfalls der Nominativ.', example: 'Mia ist eine Ärztin.' },
      { zh: '被动句主语：承受动作的对象也能是主格。', de: 'Passivsubjekt: Auch der Betroffene kann im Nominativ stehen.', example: 'Das Buch wird gelesen.' },
    ],
    warningZh: '别把“动作发出者”当成主格的定义。更可靠的是：找到限定动词，再找与它在人称和数上呼应的成分。',
    warningDe: 'Definiere den Nominativ nicht als „Täter“. Verlässlicher: Finde das finite Verb und die dazu passende Nominalgruppe.',
    challenge: { prompt: '___ Hund schläft.', options: ['Der', 'Den', 'Dem', 'Des'], answer: 'Der', whyZh: 'Hund 是 schlafen 的主语；阳性单数主格用 der。', whyDe: '„Hund“ ist das Subjekt von schlafen; Maskulin Singular im Nominativ: der.' },
  },
  akk: {
    cn: '宾格', name: 'Akkusativ', number: '第四格 · 4. Fall', question: 'Wen? Was?',
    leadZh: '宾格常标记动作直接触及的对象。真正决定它的，通常是动词或介词；“受影响”只是好用的理解入口。',
    leadDe: 'Der Akkusativ markiert oft das direkt betroffene Objekt. Entscheidend ist meist die Rektion von Verb oder Präposition.',
    roles: [
      { zh: '宾格宾语：许多及物动词为它预留一个位置。', de: 'Akkusativobjekt: Viele transitive Verben öffnen dafür eine Stelle.', example: 'Ich sehe den Hund.' },
      { zh: '固定介词：durch、für、gegen、ohne、um 后面用宾格。', de: 'Feste Präpositionen: durch, für, gegen, ohne, um regieren den Akkusativ.', example: 'Wir gehen durch den Park.' },
      { zh: '时间与距离也可使用宾格。', de: 'Auch Zeitdauer und Strecke können im Akkusativ stehen.', example: 'Wir warten einen ganzen Tag.' },
    ],
    warningZh: '阳性单数最容易看出变化：der → den。阴性、中性和复数中，主格与宾格冠词可能同形，仍要看句法。',
    warningDe: 'Am Maskulin Singular sieht man den Wechsel gut: der → den. Bei Femininum, Neutrum und Plural kann die Form gleich aussehen.',
    challenge: { prompt: 'Ich sehe ___ Hund.', options: ['der', 'den', 'dem', 'des'], answer: 'den', whyZh: 'sehen 要求一个宾格宾语；阳性单数宾格用 den。', whyDe: 'sehen verlangt ein Akkusativobjekt; Maskulin Singular: den.' },
  },
  dat: {
    cn: '与格', name: 'Dativ', number: '第三格 · 3. Fall', question: 'Wem?',
    leadZh: '与格常标记接收者、受益者或关系对象，但不能只靠“给谁”来猜。动词和介词的固定支配关系更可靠。',
    leadDe: 'Der Dativ markiert oft Empfänger, Nutznießer oder Bezugspersonen. Verlässlicher als die Bedeutung ist die Rektion von Verb und Präposition.',
    roles: [
      { zh: '与格动词：helfen、danken、gefallen 等直接要求与格。', de: 'Dativverben: helfen, danken, gefallen verlangen direkt den Dativ.', example: 'Ich helfe dem Kind.' },
      { zh: '双宾语句中的接收者常用与格。', de: 'In Sätzen mit zwei Objekten steht der Empfänger oft im Dativ.', example: 'Sie gibt dem Kind ein Buch.' },
      { zh: 'aus、bei、mit、nach、seit、von、zu 后用与格。', de: 'aus, bei, mit, nach, seit, von, zu regieren den Dativ.', example: 'Wir fahren mit dem Bus.' },
    ],
    warningZh: '复数与格常有双重信号：冠词 die → den，名词若可能再加 -n：mit den Kindern。',
    warningDe: 'Der Dativ Plural zeigt oft zwei Signale: die → den und zusätzlich -n am Nomen: mit den Kindern.',
    challenge: { prompt: 'Ich helfe ___ Kind.', options: ['das', 'den', 'dem', 'des'], answer: 'dem', whyZh: 'helfen 固定要求与格；中性单数与格用 dem。', whyDe: 'helfen verlangt den Dativ; Neutrum Singular: dem.' },
  },
  gen: {
    cn: '属格', name: 'Genitiv', number: '第二格 · 2. Fall', question: 'Wessen?',
    leadZh: '属格最擅长把一个名词短语嵌入另一个，表达归属、来源或更精确的限定。书面语中尤其常见。',
    leadDe: 'Der Genitiv bettet eine Nominalgruppe in eine andere ein und zeigt Zugehörigkeit, Herkunft oder nähere Bestimmung.',
    roles: [
      { zh: '名词属性：回答“谁的/什么的”。', de: 'Genitivattribut: Es beantwortet die Frage „wessen?“', example: 'Das ist das Buch des Kindes.' },
      { zh: '某些介词要求属格，如 wegen、trotz、während。', de: 'Einige Präpositionen regieren den Genitiv, etwa wegen, trotz, während.', example: 'Wegen des Regens bleiben wir hier.' },
      { zh: '口语中常见 von + 与格，但并非处处可随意互换。', de: 'Umgangssprachlich ist von + Dativ häufig, aber nicht überall frei austauschbar.', example: 'das Fahrrad von meinem Bruder' },
    ],
    warningZh: '阳性和中性单数通常有两个信号：冠词 des，加上名词 -s 或 -es。何时用 -es 与词形、读音有关。',
    warningDe: 'Maskulinum und Neutrum Singular zeigen meist zwei Signale: des und -s/-es am Nomen.',
    challenge: { prompt: 'Das Spielzeug ___ Kindes', options: ['das', 'den', 'dem', 'des'], answer: 'des', whyZh: '这个短语回答“谁的玩具？”，是中性单数属格：des Kindes。', whyDe: 'Die Gruppe beantwortet „wessen Spielzeug?“: Genitiv Neutrum Singular, des Kindes.' },
  },
}

function MicroChallenge({ mode, challenge }: { mode: LanguageMode; challenge: { prompt: string; options: string[]; answer: string; whyZh: string; whyDe: string } }) {
  const [selected, setSelected] = useState<string | null>(null)
  const correct = selected === challenge.answer

  useEffect(() => setSelected(null), [challenge])

  return (
    <div className="micro-challenge">
      <div className="challenge-heading">
        <Target size={18} />
        <div>
          <strong>{uiText(mode, '30 秒微挑战', '30-Sekunden-Challenge')}</strong>
          <span>{uiText(mode, '先选，再读原因', 'Erst wählen, dann begründen')}</span>
        </div>
      </div>
      <p className="challenge-prompt" lang="de">{challenge.prompt}</p>
      <div className="challenge-options">
        {challenge.options.map((option) => (
          <button
            type="button"
            key={option}
            className={selected === option ? (correct ? 'is-correct' : 'is-wrong') : ''}
            aria-pressed={selected === option}
            onClick={() => setSelected(option)}
          >
            {option}
          </button>
        ))}
      </div>
      {selected && (
        <div className={`challenge-feedback ${correct ? 'is-correct' : 'is-wrong'}`} role="status">
          {correct ? <Check size={18} /> : <X size={18} />}
          <div>
            <strong>{uiText(mode, correct ? '判断正确' : `再看一眼：答案是 ${challenge.answer}`, correct ? 'Richtig entschieden' : `Noch einmal: ${challenge.answer}`)}</strong>
            <Bilingual mode={mode} zh={challenge.whyZh} de={challenge.whyDe} />
          </div>
        </div>
      )}
    </div>
  )
}

const articleForms: Record<CaseUnit, Record<Gender, string>> = {
  nom: { m: 'der', f: 'die', n: 'das', pl: 'die' },
  akk: { m: 'den', f: 'die', n: 'das', pl: 'die' },
  dat: { m: 'dem', f: 'der', n: 'dem', pl: 'den' },
  gen: { m: 'des', f: 'der', n: 'des', pl: 'der' },
}

const adjectiveForms: Record<CaseUnit, Record<Gender, string>> = {
  nom: { m: 'gute', f: 'gute', n: 'gute', pl: 'guten' },
  akk: { m: 'guten', f: 'gute', n: 'gute', pl: 'guten' },
  dat: { m: 'guten', f: 'guten', n: 'guten', pl: 'guten' },
  gen: { m: 'guten', f: 'guten', n: 'guten', pl: 'guten' },
}

const nounForms: Record<CaseUnit, Record<Gender, string>> = {
  nom: { m: 'Mann', f: 'Frau', n: 'Kind', pl: 'Kinder' },
  akk: { m: 'Mann', f: 'Frau', n: 'Kind', pl: 'Kinder' },
  dat: { m: 'Mann', f: 'Frau', n: 'Kind', pl: 'Kindern' },
  gen: { m: 'Mannes', f: 'Frau', n: 'Kindes', pl: 'Kinder' },
}

function NounPhraseLab({ mode, initialCase = 'nom' }: { mode: LanguageMode; initialCase?: CaseUnit }) {
  const [caseKey, setCaseKey] = useState<CaseUnit>(initialCase)
  const [gender, setGender] = useState<Gender>('m')
  const genders: { key: Gender; label: string; zh: string }[] = [
    { key: 'm', label: 'Maskulin', zh: '阳性' }, { key: 'f', label: 'Feminin', zh: '阴性' },
    { key: 'n', label: 'Neutrum', zh: '中性' }, { key: 'pl', label: 'Plural', zh: '复数' },
  ]
  const note = useMemo(() => {
    if (caseKey === 'dat' && gender === 'pl') return { zh: '复数与格：冠词变 den，名词 Kinder 再加 -n。', de: 'Dativ Plural: den und zusätzlich -n am Nomen Kinder.' }
    if (caseKey === 'gen' && (gender === 'm' || gender === 'n')) return { zh: '阳性/中性单数属格：des 与名词 -s/-es 共同发出信号。', de: 'Genitiv Maskulin/Neutrum: des und -s/-es am Nomen wirken zusammen.' }
    if (caseKey === 'akk' && gender === 'm') return { zh: '阳性单数宾格很醒目：der 变 den，形容词用 -en。', de: 'Akkusativ Maskulin ist gut sichtbar: der wird den, das Adjektiv erhält -en.' }
    return { zh: '定冠词承担主要格信号；定冠词后的形容词多用 -e 或 -en。', de: 'Der bestimmte Artikel trägt das Hauptsignal; danach endet das Adjektiv meist auf -e oder -en.' }
  }, [caseKey, gender])

  useEffect(() => setCaseKey(initialCase), [initialCase])

  return (
    <section className="phrase-lab" aria-labelledby="phrase-lab-title">
      <div className="phrase-lab-intro">
        <span className="mini-kicker"><Sparkles size={16} /> FORMEN-BAUKASTEN</span>
        <h3 id="phrase-lab-title">{uiText(mode, '名词短语变形器', 'Nominalgruppen-Baukasten')}</h3>
        <Bilingual mode={mode} zh="选择格和性数，观察“定冠词 + 形容词 + 名词”如何一起变化。先看信号分工，不必一次背完整张表。" de="Wähle Kasus und Genus. Beobachte, wie Artikel, Adjektiv und Nomen gemeinsam ihre Form ändern." />
      </div>
      <div className="phrase-controls">
        <fieldset>
          <legend>{uiText(mode, '格', 'Kasus')}</legend>
          <div className="segmented-control">
            {(['nom', 'akk', 'dat', 'gen'] as CaseUnit[]).map((key) => (
              <button type="button" key={key} className={caseKey === key ? 'is-active' : ''} aria-pressed={caseKey === key} onClick={() => setCaseKey(key)}>{unitMeta[key].short}</button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{uiText(mode, '性 / 数', 'Genus / Numerus')}</legend>
          <div className="segmented-control gender-control">
            {genders.map((item) => (
              <button type="button" key={item.key} className={gender === item.key ? 'is-active' : ''} aria-pressed={gender === item.key} onClick={() => setGender(item.key)}>{uiText(mode, item.zh, item.label)}</button>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="phrase-output" aria-live="polite" lang="de">
        <span className="word-article">{articleForms[caseKey][gender]}<small>Artikel</small></span>
        <span className="word-adjective">{adjectiveForms[caseKey][gender]}<small>Adjektiv</small></span>
        <span className="word-noun">{nounForms[caseKey][gender]}<small>Nomen</small></span>
      </div>
      <Bilingual mode={mode} zh={note.zh} de={note.de} className="phrase-note" />
      <p className="scope-note">{uiText(mode, '本阶段先掌握定冠词家族；ein-家族将在后续单元展开。', 'Hier üben wir zuerst bestimmte Artikel; ein-Wörter folgen später.')}</p>
    </section>
  )
}

function OverviewUnit({ mode }: { mode: LanguageMode }) {
  const challenge = {
    prompt: 'Die Studentin schenkt dem Kind das Buch des Professors.',
    options: ['Nominativ', 'Akkusativ', 'Dativ', 'Genitiv'], answer: 'Dativ',
    whyZh: 'schenken 给接收者预留与格位置；dem 也是中性/阳性单数与格的形式信号。',
    whyDe: 'schenken öffnet für den Empfänger eine Dativstelle; dem bestätigt die Form.',
  }
  return (
    <div className="unit-body">
      <div className="unit-lead">
        <span className="unit-badge">01 · KASUSKARTE</span>
        <h2>{uiText(mode, '先看角色，再看词尾', 'Erst die Rolle, dann die Endung')}</h2>
        <Bilingual mode={mode} zh="“格”是名词短语在句子关系网中的语法标记。它不是四个固定位置，也不是四种中文翻译；同一个名词会随着任务改变外形。" de="Kasus markiert die grammatische Aufgabe einer Nominalgruppe. Er ist weder eine feste Position noch eine feste Übersetzung; dieselbe Gruppe verändert je nach Aufgabe ihre Form." />
      </div>
      <div className="annotated-sentence" lang="de">
        <span className="case-nom"><small>NOM · Wer?</small>Die Studentin</span>
        <i>schenkt</i>
        <span className="case-dat"><small>DAT · Wem?</small>dem Kind</span>
        <span className="case-akk"><small>AKK · Was?</small>das Buch</span>
        <span className="case-gen"><small>GEN · Wessen?</small>des Professors</span><b>.</b>
      </div>
      <div className="case-matrix" role="table" aria-label="四格速览">
        <div className="matrix-row matrix-head" role="row"><span>{uiText(mode, '格', 'Kasus')}</span><span>{uiText(mode, '常用问法', 'Frage')}</span><span>{uiText(mode, '常见入口', 'Typischer Einstieg')}</span><span>{uiText(mode, '别误会', 'Achtung')}</span></div>
        <div className="matrix-row case-nom" role="row"><strong>Nominativ</strong><span>Wer? Was?</span><span>{uiText(mode, '主语、系词补语', 'Subjekt, Prädikativ')}</span><span>{uiText(mode, '不等于“第一个词”', 'nicht immer Position 1')}</span></div>
        <div className="matrix-row case-akk" role="row"><strong>Akkusativ</strong><span>Wen? Was?</span><span>{uiText(mode, '直接对象、固定介词', 'Objekt, Präposition')}</span><span>{uiText(mode, '并非总能看出词形', 'Form oft mehrdeutig')}</span></div>
        <div className="matrix-row case-dat" role="row"><strong>Dativ</strong><span>Wem?</span><span>{uiText(mode, '接收者、支配关系', 'Empfänger, Rektion')}</span><span>{uiText(mode, '不只表示“给”', 'nicht nur „geben“')}</span></div>
        <div className="matrix-row case-gen" role="row"><strong>Genitiv</strong><span>Wessen?</span><span>{uiText(mode, '名词限定、固定介词', 'Attribut, Präposition')}</span><span>{uiText(mode, '口语中仍未消失', 'nicht „ausgestorben“')}</span></div>
      </div>
      <div className="overview-bottom">
        <MicroChallenge mode={mode} challenge={challenge} />
        <div className="learning-rule"><Lightbulb size={21} /><Bilingual mode={mode} zh="稳妥顺序：先找支配者（动词/介词），再判断关系，最后用冠词和词尾核对。" de="Sichere Reihenfolge: Regenten finden, Beziehung bestimmen, Formsignale prüfen." /></div>
      </div>
      <NounPhraseLab mode={mode} />
    </div>
  )
}

const clueSteps = [
  { number: '01', zh: '找限定动词', de: 'Finites Verb finden', sample: 'schenkt', detailZh: '动词是句子的发动机。先问它需要哪些搭档：谁送？送什么？送给谁？', detailDe: 'Das Verb ist der Motor. Frage nach seinen Mitspielern: Wer schenkt wem was?' },
  { number: '02', zh: '圈出介词', de: 'Präpositionen markieren', sample: 'mit / für / wegen', detailZh: '许多介词固定支配一个格；双向介词还要区分位置和方向。', detailDe: 'Viele Präpositionen regieren einen festen Kasus; Wechselpräpositionen unterscheiden Ort und Richtung.' },
  { number: '03', zh: '辨认句法关系', de: 'Beziehung bestimmen', sample: 'Empfänger → Dativ', detailZh: '问句只是探针，不是定义。结合动词框架判断主语、对象、接收者或名词属性。', detailDe: 'Fragen sind Sonden, keine Definitionen. Bestimme Subjekt, Objekt, Empfänger oder Attribut im Satzrahmen.' },
  { number: '04', zh: '核对形式信号', de: 'Formsignale prüfen', sample: 'dem Kind', detailZh: '冠词、形容词和名词词尾会共同发信号，但有些形式重合，不能倒过来只凭外形猜。', detailDe: 'Artikel, Adjektiv und Nomen senden gemeinsam Signale. Gleiche Formen dürfen dich nicht zum bloßen Raten verleiten.' },
]

function CluesUnit({ mode }: { mode: LanguageMode }) {
  const [active, setActive] = useState(0)
  return (
    <div className="unit-body">
      <div className="unit-lead">
        <span className="unit-badge">02 · DIAGNOSEWEG</span>
        <h2>{uiText(mode, '像侦探一样判断格', 'Kasus bestimmen wie ein Detektiv')}</h2>
        <Bilingual mode={mode} zh="没有一条线索能包打天下。下面四步按“决定力”排序：动词和介词往往比中文意思可靠，词形通常负责确认。" de="Keine Spur löst jeden Fall. Die Reihenfolge folgt der Entscheidungskraft: Verb und Präposition sind oft verlässlicher als Übersetzung; die Form bestätigt." />
      </div>
      <div className="clue-workbench">
        <div className="clue-rail" role="tablist" aria-label="四条判断线索">
          {clueSteps.map((step, index) => (
            <button type="button" role="tab" aria-selected={active === index} className={active === index ? 'is-active' : ''} key={step.number} onClick={() => setActive(index)}>
              <span>{step.number}</span><strong>{uiText(mode, step.zh, step.de)}</strong>
            </button>
          ))}
        </div>
        <div className="clue-detail" role="tabpanel">
          <span>{clueSteps[active].number} / 04</span>
          <strong lang="de">{clueSteps[active].sample}</strong>
          <Bilingual mode={mode} zh={clueSteps[active].detailZh} de={clueSteps[active].detailDe} />
          <div className="clue-example" lang="de"><i>Die Studentin</i> <mark>schenkt</mark> <b>dem Kind</b> ein Buch.</div>
        </div>
      </div>
      <div className="contrast-cards">
        <article><Compass size={22} /><h3>{uiText(mode, '位置还是方向？', 'Ort oder Richtung?')}</h3><p lang="de"><b>Wo?</b> im Park → Dativ<br /><b>Wohin?</b> in den Park → Akkusativ</p><Bilingual mode={mode} zh="双向介词不是简单的“静止/移动”规则，而是位置（Wo?）与目标方向（Wohin?）的对比。" de="Bei Wechselpräpositionen zählt Ort (Wo?) gegen Zielrichtung (Wohin?), nicht bloß Stillstand gegen Bewegung." /></article>
        <article><RotateCcw size={22} /><h3>{uiText(mode, '同形不等于同格', 'Gleiche Form, anderer Kasus')}</h3><p lang="de"><b>die Frau</b> sieht das Kind.<br />Das Kind sieht <b>die Frau</b>.</p><Bilingual mode={mode} zh="die Frau 的外形没变，第一句是主格，第二句是宾格。句法关系才是裁判。" de="Die Form bleibt gleich; einmal Nominativ, einmal Akkusativ. Die Satzbeziehung entscheidet." /></article>
      </div>
    </div>
  )
}

function CaseUnitView({ mode, caseKey }: { mode: LanguageMode; caseKey: CaseUnit }) {
  const data = caseData[caseKey]
  return (
    <div className={`unit-body case-unit case-${caseKey}`}>
      <div className="unit-lead">
        <span className="unit-badge">{unitMeta[caseKey].number} · {data.number}</span>
        <div className="case-unit-title"><div><h2>{data.name}</h2><span>{data.cn}</span></div><strong>{data.question}</strong></div>
        <Bilingual mode={mode} zh={data.leadZh} de={data.leadDe} />
      </div>
      <div className="role-grid">
        {data.roles.map((role, index) => (
          <article key={role.example}><span>0{index + 1}</span><Bilingual mode={mode} zh={role.zh} de={role.de} /><p lang="de">{role.example}</p></article>
        ))}
      </div>
      <div className="case-unit-bottom">
        <div className="warning-card"><Lightbulb size={21} /><div><strong>{uiText(mode, '易错观察', 'Wichtige Beobachtung')}</strong><Bilingual mode={mode} zh={data.warningZh} de={data.warningDe} /></div></div>
        <MicroChallenge mode={mode} challenge={data.challenge} />
      </div>
      <NounPhraseLab mode={mode} initialCase={caseKey} />
    </div>
  )
}

export function CourseSection({ mode, activeUnit, onUnitChange, onNextPhase }: { mode: LanguageMode; activeUnit: Stage2Unit; onUnitChange: (unit: Stage2Unit) => void; onNextPhase?: () => void }) {
  return (
    <section id="course" className="course-section" aria-labelledby="course-title">
      <div className="course-top section-shell">
        <div className="section-kicker"><BookOpen size={17} /> PHASE 2 · GRUNDLAGEN</div>
        <div className="course-heading">
          <div><h2 id="course-title">{uiText(mode, '六个基础单元，搭起判断框架', 'Sechs Grundlagen für sichere Entscheidungen')}</h2><Bilingual mode={mode} zh="按顺序学习，或直接打开你需要速查的单元。切换单元不会影响全局讲解语言。" de="Lerne der Reihe nach oder öffne direkt die passende Einheit. Die Erklärungssprache bleibt dabei erhalten." /></div>
          <span className="course-count">{unitMeta[activeUnit].number} / 06</span>
        </div>
        <div className="unit-tabs" role="tablist" aria-label="阶段 2 学习单元">
          {(Object.keys(unitMeta) as Stage2Unit[]).map((key) => (
            <button type="button" role="tab" aria-selected={activeUnit === key} className={activeUnit === key ? 'is-active' : ''} key={key} onClick={() => onUnitChange(key)}>
              <span>{unitMeta[key].number}</span><strong>{uiText(mode, unitMeta[key].zh, unitMeta[key].de)}</strong><small>{unitMeta[key].short}</small>
            </button>
          ))}
        </div>
      </div>
      <div className="course-paper section-shell" role="tabpanel" key={activeUnit}>
        {activeUnit === 'overview' && <OverviewUnit mode={mode} />}
        {activeUnit === 'clues' && <CluesUnit mode={mode} />}
        {(['nom', 'akk', 'dat', 'gen'] as Stage2Unit[]).includes(activeUnit) && <CaseUnitView mode={mode} caseKey={activeUnit as CaseUnit} />}
      </div>
      <div className="section-shell"><PhaseActions mode={mode} tabsSelector=".unit-tabs" showNext={activeUnit === 'gen'} nextZh="进入阶段 3：谁决定用哪个格" nextDe="Weiter zu Phase 3: Kasus-Regenten" onNext={onNextPhase} /></div>
    </section>
  )
}
