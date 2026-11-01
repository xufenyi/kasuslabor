import {
  Anchor,
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  ChevronRight,
  CircleUserRound,
  Eye,
  EyeOff,
  FlaskConical,
  Languages,
  Link2,
  Menu,
  MousePointer2,
  Route,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Waypoints,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CourseSection, type Stage2Unit } from './Course'
import { GovernorsSection, type Stage3Unit } from './Governors'
import { FormsSection, type Stage4Unit } from './Forms'
import { SentencesSection, type Stage5Unit } from './Sentences'
import { ReferenceSection } from './Reference'

type CourseUnit = Stage2Unit | Stage3Unit | Stage4Unit | Stage5Unit
type AppView = 'overview' | 'phase2' | 'phase3' | 'phase4' | 'phase5' | 'practice' | 'reference'
type PracticeTab = 'lab' | 'principles'

type LanguageMode = 'both' | 'zh' | 'de'
type CaseKey = 'nom' | 'akk' | 'dat' | 'gen'
type ScenarioKey = 'gift' | 'bicycle'

type CaseSegment = {
  id: string
  text: string
  caseKey: CaseKey
  noteZh: string
  noteDe: string
  formZh: string
  formDe: string
}

type PlainSegment = {
  id: string
  text: string
  type: 'verb' | 'punctuation'
}

type Scenario = {
  titleZh: string
  titleDe: string
  translation: string
  segments: (CaseSegment | PlainSegment)[]
}

const modeOptions: { value: LanguageMode; label: string; short: string }[] = [
  { value: 'both', label: '中 + DE', short: '中 + DE' },
  { value: 'zh', label: '仅中文', short: '中文' },
  { value: 'de', label: 'Nur Deutsch', short: 'DE' },
]

const caseMeta: Record<
  CaseKey,
  {
    label: string
    cn: string
    number: string
    numberDe: string
    question: string
    icon: typeof Anchor
    summaryZh: string
    summaryDe: string
  }
> = {
  nom: {
    label: 'Nominativ',
    cn: '主格',
    number: '第一格',
    numberDe: '1. Fall',
    question: 'Wer? Was?',
    icon: CircleUserRound,
    summaryZh: '先找句子的锚点：谁或什么与谓语建立主语关系？',
    summaryDe: 'Finde den Anker des Satzes: Wer oder was gehört als Subjekt zum Prädikat?',
  },
  akk: {
    label: 'Akkusativ',
    cn: '宾格',
    number: '第四格',
    numberDe: '4. Fall',
    question: 'Wen? Was?',
    icon: Target,
    summaryZh: '它常标记动作直接触及的对象，但远不只是“东西”。',
    summaryDe: 'Er markiert oft das direkt betroffene Objekt – aber seine Aufgaben gehen weiter.',
  },
  dat: {
    label: 'Dativ',
    cn: '与格',
    number: '第三格',
    numberDe: '3. Fall',
    question: 'Wem?',
    icon: Waypoints,
    summaryZh: '它常连接接收者或关系对象；真正稳定的线索来自动词和介词。',
    summaryDe: 'Er verbindet oft Empfänger oder Bezugspersonen. Sicher entscheiden Verb und Präposition.',
  },
  gen: {
    label: 'Genitiv',
    cn: '属格',
    number: '第二格',
    numberDe: '2. Fall',
    question: 'Wessen?',
    icon: Link2,
    summaryZh: '它把一个名词短语嵌进另一个，表达限定、归属等关系。',
    summaryDe: 'Er bettet eine Nominalgruppe in eine andere ein und zeigt Zugehörigkeit oder nähere Bestimmung.',
  },
}

const unitGroups = [
  {
    id: 'A',
    zh: '建立地图',
    de: 'Die Landkarte',
    units: [
      { zh: '四格总览', de: 'Überblick', id: 'overview' as Stage2Unit },
      { zh: '四条判断线索', de: 'Vier Spuren', id: 'clues' as Stage2Unit },
    ],
  },
  {
    id: 'B',
    zh: '认识四个格',
    de: 'Die vier Kasus',
    units: [
      { zh: '主格', de: 'Nominativ', id: 'nom' as CourseUnit, href: '#course' },
      { zh: '宾格', de: 'Akkusativ', id: 'akk' as CourseUnit, href: '#course' },
      { zh: '与格', de: 'Dativ', id: 'dat' as CourseUnit, href: '#course' },
      { zh: '属格', de: 'Genitiv', id: 'gen' as CourseUnit, href: '#course' },
    ],
  },
  {
    id: 'C',
    zh: '谁决定用哪个格',
    de: 'Wer regiert den Kasus?',
    units: [
      { zh: '动词配价', de: 'Verbvalenz', id: 'valency' as CourseUnit, href: '#governors' },
      { zh: '固定格介词', de: 'Feste Präpositionen', id: 'fixed-preps' as CourseUnit, href: '#governors' },
      { zh: '双向介词', de: 'Wechselpräpositionen', id: 'two-way' as CourseUnit, href: '#governors' },
    ],
  },
  {
    id: 'D',
    zh: '词形如何变化',
    de: 'Formen erkennen',
    units: [
      { zh: '定冠词', de: 'Artikel', id: 'articles' as CourseUnit, href: '#forms' },
      { zh: 'ein-家族', de: 'ein-Wörter', id: 'ein-words' as CourseUnit, href: '#forms' },
      { zh: '形容词词尾', de: 'Adjektivendungen', id: 'adjectives' as CourseUnit, href: '#forms' },
      { zh: '代词', de: 'Pronomen', id: 'pronouns' as CourseUnit, href: '#forms' },
      { zh: '名词特殊变化', de: 'Nomenformen', id: 'nouns' as CourseUnit, href: '#forms' },
    ],
  },
  {
    id: 'E',
    zh: '句子综合',
    de: 'Im ganzen Satz',
    units: [
      { zh: '双宾语与语序', de: 'Wortstellung', id: 'word-order' as CourseUnit, href: '#sentences' },
      { zh: '主动与被动', de: 'Aktiv und Passiv', id: 'passive' as CourseUnit, href: '#sentences' },
      { zh: '关系从句', de: 'Relativsätze', id: 'relative' as CourseUnit, href: '#sentences' },
    ],
  },
]

const courseUnitIds = unitGroups.flatMap((group) => group.units.map((unit) => unit.id)) as CourseUnit[]

const scenarios: Record<ScenarioKey, Scenario> = {
  gift: {
    titleZh: '送书：三个角色同时登场',
    titleDe: 'Ein Buch schenken: drei Rollen auf einmal',
    translation: '这位女大学生送给孩子一本书。',
    segments: [
      {
        id: 'studentin',
        text: 'Die Studentin',
        caseKey: 'nom',
        noteZh: '谁在送？主语是“die Studentin”，因此使用 Nominativ。',
        noteDe: 'Wer schenkt? „Die Studentin“ ist das Subjekt und steht im Nominativ.',
        formZh: '阴性单数：die 的形式在 Nominativ 和 Akkusativ 中相同。这里要靠句法关系判断。',
        formDe: 'Feminin Singular: „die“ sieht im Nominativ und Akkusativ gleich aus. Die Satzfunktion entscheidet.',
      },
      { id: 'verb', text: 'schenkt', type: 'verb' },
      {
        id: 'kind',
        text: 'dem Kind',
        caseKey: 'dat',
        noteZh: '送给谁？schenken 为接收者预留 Dativ 插槽。',
        noteDe: 'Wem schenkt sie etwas? „schenken“ öffnet für den Empfänger eine Dativstelle.',
        formZh: '中性单数：das → dem。词尾 -m 是醒目的 Dativ 信号。',
        formDe: 'Neutrum Singular: das → dem. Die Endung -m ist ein deutliches Dativsignal.',
      },
      {
        id: 'book',
        text: 'ein Buch',
        caseKey: 'akk',
        noteZh: '送什么？被转交的事物放进 Akkusativ 插槽。',
        noteDe: 'Was schenkt sie? Die übergebene Sache steht im Akkusativ.',
        formZh: '中性单数：ein 在 Nominativ 和 Akkusativ 中同形。不能只看词尾。',
        formDe: 'Neutrum Singular: „ein“ ist im Nominativ und Akkusativ gleich. Die Form allein reicht nicht.',
      },
      { id: 'period', text: '.', type: 'punctuation' },
    ],
  },
  bicycle: {
    titleZh: '自行车：名词短语也可以“套娃”',
    titleDe: 'Das Fahrrad: Eine Nominalgruppe in der anderen',
    translation: '这位大学生的自行车停在图书馆前。',
    segments: [
      {
        id: 'bike',
        text: 'Das Fahrrad',
        caseKey: 'nom',
        noteZh: '什么停在那里？整个“学生的自行车”是句子的主语，核心名词 Fahrrad 使用 Nominativ。',
        noteDe: 'Was steht dort? Die ganze Gruppe ist das Subjekt; ihr Kern „Fahrrad“ steht im Nominativ.',
        formZh: '中性单数：das Fahrrad。',
        formDe: 'Neutrum Singular: das Fahrrad.',
      },
      {
        id: 'student',
        text: 'des Studenten',
        caseKey: 'gen',
        noteZh: '谁的自行车？这个 Genitiv 短语进一步限定 Fahrrad。',
        noteDe: 'Wessen Fahrrad? Die Genitivgruppe bestimmt „Fahrrad“ näher.',
        formZh: 'Student 是弱变化阳性名词：除 Nominativ 单数外通常带 -en；冠词 der → des。',
        formDe: '„Student“ ist ein schwaches Maskulinum: außer im Nominativ Singular meist mit -en; der → des.',
      },
      { id: 'verb', text: 'steht', type: 'verb' },
      {
        id: 'library',
        text: 'vor der Bibliothek',
        caseKey: 'dat',
        noteZh: '在哪里？vor 表示所在位置时支配 Dativ。',
        noteDe: 'Wo steht es? „vor“ regiert bei einer Ortsangabe den Dativ.',
        formZh: '阴性单数：die → der。这里描述位置，而不是指向一个目标。',
        formDe: 'Feminin Singular: die → der. Hier geht es um einen Ort, nicht um ein Ziel.',
      },
      { id: 'period', text: '.', type: 'punctuation' },
    ],
  },
}

function uiText(mode: LanguageMode, zh: string, de: string) {
  if (mode === 'zh') return zh
  if (mode === 'de') return de
  return `${zh} · ${de}`
}

function Bilingual({
  mode,
  zh,
  de,
  className = '',
}: {
  mode: LanguageMode
  zh: string
  de: string
  className?: string
}) {
  return (
    <div className={`bilingual ${className}`.trim()}>
      {mode !== 'de' && <p className="copy-zh">{zh}</p>}
      {mode !== 'zh' && <p className="copy-de" lang="de">{de}</p>}
    </div>
  )
}

function LanguageSwitch({ mode, onChange }: { mode: LanguageMode; onChange: (mode: LanguageMode) => void }) {
  return (
    <div className="language-switch" role="group" aria-label="讲解语言 / Erklärungssprache">
      <Languages size={17} aria-hidden="true" />
      {modeOptions.map((option) => (
        <button
          type="button"
          key={option.value}
          className={mode === option.value ? 'is-active' : ''}
          aria-pressed={mode === option.value}
          aria-label={option.label}
          onClick={() => onChange(option.value)}
        >
          <span className="wide-label">{option.label}</span>
          <span className="short-label">{option.short}</span>
        </button>
      ))}
    </div>
  )
}

function Sidebar({
  mode,
  open,
  onClose,
  activeUnit,
  visitedUnits,
  onSelectUnit,
  activeView,
  onOpenOverview,
  onOpenPractice,
  onOpenReference,
  onResetProgress,
}: {
  mode: LanguageMode
  open: boolean
  onClose: () => void
  activeUnit: CourseUnit
  visitedUnits: CourseUnit[]
  onSelectUnit: (unit: CourseUnit) => void
  activeView: AppView
  onOpenOverview: () => void
  onOpenPractice: () => void
  onOpenReference: () => void
  onResetProgress: () => void
}) {
  const courseViewActive = activeView === 'phase2' || activeView === 'phase3' || activeView === 'phase4' || activeView === 'phase5'
  const progressPercent = Math.round((visitedUnits.length / courseUnitIds.length) * 100)

  return (
    <>
      <button
        type="button"
        className={`sidebar-backdrop ${open ? 'is-visible' : ''}`}
        aria-label="关闭目录"
        onClick={onClose}
      />
      <aside className={`sidebar ${open ? 'is-open' : 'is-collapsed'}`} aria-label="学习目录" aria-hidden={!open}>
        <div className="sidebar-brand">
          <div className="brand-mark"><FlaskConical size={22} /></div>
          <div>
            <a className="sidebar-home-link" href="#overview" onClick={(event) => {
              event.preventDefault()
              onOpenOverview()
              if (window.matchMedia('(max-width: 860px)').matches) onClose()
            }}>
              <strong>Kasuslabor</strong>
            </a>
            <span>{uiText(mode, '四格实验室', 'Kasus entdecken')}</span>
          </div>
          <button type="button" className="icon-button close-sidebar" onClick={onClose} aria-label="关闭目录">
            <X size={20} />
          </button>
        </div>

        <div className="progress-card" aria-label={uiText(mode, '学习进度', 'Lernfortschritt')}>
          <div className="progress-heading">
            <span>{uiText(mode, '学习进度', 'Lernfortschritt')}</span>
            <strong>{visitedUnits.length} / {courseUnitIds.length}</strong>
          </div>
          <div className="progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={courseUnitIds.length} aria-valuenow={visitedUnits.length}>
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="progress-meta">
            <small>{uiText(mode, '记录只保存在本机浏览器中', 'Nur lokal in diesem Browser gespeichert')}</small>
            <button type="button" className="progress-reset" onClick={onResetProgress} disabled={visitedUnits.length === 0}>
              <RotateCcw size={13} />
              {uiText(mode, '重置', 'Zurücksetzen')}
            </button>
          </div>
        </div>

        <nav className="unit-nav">
          {unitGroups.map((group) => (
            <section key={group.id} className="unit-group">
              <div className="unit-group-title">
                <span>{group.id}</span>
                <div>
                  {mode !== 'de' && <strong>{group.zh}</strong>}
                  {mode !== 'zh' && <small lang="de">{group.de}</small>}
                </div>
              </div>
              <ol>
                {group.units.map((unit, unitIndex) => {
                  const available = 'id' in unit
                  const current = courseViewActive && available && unit.id === activeUnit
                  const visited = available && visitedUnits.includes(unit.id)
                  return (
                    <li key={unit.zh}>
                      <a
                        href={available ? ('href' in unit ? unit.href : '#course') : '#roadmap'}
                        className={`${current ? 'is-current' : ''} ${available ? 'is-available' : ''} ${visited ? 'is-visited' : ''}`.trim()}
                        aria-current={current ? 'page' : undefined}
                        onClick={(event) => {
                          if (available) {
                            event.preventDefault()
                            onSelectUnit(unit.id)
                          }
                          if (window.matchMedia('(max-width: 860px)').matches) onClose()
                        }}
                      >
                        <span className="unit-index">{String(unitIndex + 1).padStart(2, '0')}</span>
                        <span>{uiText(mode, unit.zh, unit.de)}</span>
                        {current ? <ChevronRight size={16} /> : <span className="planned-dot" aria-label={visited ? uiText(mode, '已学习', 'Besucht') : uiText(mode, '尚未学习', 'Noch nicht besucht')} />}
                      </a>
                    </li>
                  )
                })}
              </ol>
            </section>
          ))}
        </nav>

        <a className={`quick-link ${activeView === 'practice' ? 'is-current' : ''}`} href="#practice" onClick={(event) => {
          event.preventDefault()
          onOpenPractice()
          if (window.matchMedia('(max-width: 860px)').matches) onClose()
        }}>
          <Sparkles size={18} />
          <span>{uiText(mode, '句子实验', 'Satzlabor')}</span>
          <ArrowRight size={16} />
        </a>

        <a className={`quick-link ${activeView === 'reference' ? 'is-current' : ''}`} href="#reference" onClick={(event) => {
          event.preventDefault()
          onOpenReference()
          if (window.matchMedia('(max-width: 860px)').matches) onClose()
        }}>
          <Search size={18} />
          <span>{uiText(mode, '速查与复习', 'Schnellzugriff')}</span>
          <ArrowRight size={16} />
        </a>
      </aside>
    </>
  )
}

function CaseCard({ caseKey, mode, index }: { caseKey: CaseKey; mode: LanguageMode; index: number }) {
  const item = caseMeta[caseKey]
  const Icon = item.icon
  return (
    <article className={`case-card case-${caseKey}`}>
      <div className="case-number">0{index + 1}</div>
      <div className="case-icon"><Icon size={26} strokeWidth={1.8} /></div>
      <div className="case-title-row">
        <div>
          <h3>{item.label}</h3>
          <span>{uiText(mode, `${item.cn} · ${item.number}`, item.numberDe)}</span>
        </div>
        <strong>{item.question}</strong>
      </div>
      <Bilingual mode={mode} zh={item.summaryZh} de={item.summaryDe} />
    </article>
  )
}

function SentenceLab({ mode }: { mode: LanguageMode }) {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('gift')
  const [selectedId, setSelectedId] = useState('studentin')
  const [xray, setXray] = useState(true)
  const [showTranslation, setShowTranslation] = useState(false)
  const scenario = scenarios[scenarioKey]

  useEffect(() => {
    const firstCaseSegment = scenario.segments.find((segment) => 'caseKey' in segment)
    if (firstCaseSegment) setSelectedId(firstCaseSegment.id)
  }, [scenarioKey, scenario])

  const selected = useMemo(
    () => scenario.segments.find((segment) => segment.id === selectedId && 'caseKey' in segment),
    [scenario, selectedId],
  )

  return (
    <section id="lab" className="lab-section section-shell" aria-labelledby="lab-title">
      <div className="section-kicker"><MousePointer2 size={17} /> INTERAKTIVER PROTOTYP</div>
      <div className="section-heading split-heading">
        <div>
          <h2 id="lab-title">{uiText(mode, '句子透视器', 'Satz-Röntgen')}</h2>
          <Bilingual
            mode={mode}
            zh="点击有颜色的词组。我们先看它在句子里扮演什么角色，再观察形式留下了哪些线索。"
            de="Klicke auf eine farbige Wortgruppe. Zuerst finden wir ihre Rolle im Satz, dann lesen wir die Formsignale."
          />
        </div>
        <button type="button" className="xray-toggle" aria-pressed={xray} onClick={() => setXray((value) => !value)}>
          {xray ? <Eye size={18} /> : <EyeOff size={18} />}
          {uiText(mode, xray ? '透视已开启' : '开启透视', xray ? 'Röntgen an' : 'Röntgen einschalten')}
        </button>
      </div>

      <div className="scenario-tabs" role="tablist" aria-label="示例场景">
        {(Object.keys(scenarios) as ScenarioKey[]).map((key, index) => (
          <button
            type="button"
            role="tab"
            aria-selected={scenarioKey === key}
            className={scenarioKey === key ? 'is-active' : ''}
            key={key}
            onClick={() => setScenarioKey(key)}
          >
            <span>0{index + 1}</span>
            {uiText(mode, scenarios[key].titleZh, scenarios[key].titleDe)}
          </button>
        ))}
      </div>

      <div className="lab-workbench">
        <div className="sentence-stage">
          <div className="stage-topline">
            <span>{uiText(mode, '点击词组进行检查', 'Wortgruppe anklicken')}</span>
            <div className="legend" aria-label="格的颜色图例">
              {(Object.keys(caseMeta) as CaseKey[]).map((key) => (
                <span key={key}><i className={`legend-dot case-${key}`} />{caseMeta[key].label.slice(0, 3)}.</span>
              ))}
            </div>
          </div>

          <div className={`sentence ${xray ? 'is-xray' : ''}`} lang="de">
            {scenario.segments.map((segment) => {
              if ('caseKey' in segment) {
                return (
                  <button
                    type="button"
                    key={segment.id}
                    className={`sentence-part case-${segment.caseKey} ${selectedId === segment.id ? 'is-selected' : ''}`}
                    aria-pressed={selectedId === segment.id}
                    onClick={() => setSelectedId(segment.id)}
                  >
                    {xray && <span className="case-tag">{caseMeta[segment.caseKey].label}</span>}
                    <span>{segment.text}</span>
                  </button>
                )
              }
              return (
                <span key={segment.id} className={`sentence-${segment.type}`}>{segment.text}</span>
              )
            })}
          </div>

          <div className="translation-row">
            <button type="button" onClick={() => setShowTranslation((value) => !value)} aria-expanded={showTranslation}>
              {showTranslation ? <EyeOff size={16} /> : <Eye size={16} />}
              {uiText(mode, showTranslation ? '隐藏译文' : '显示译文', showTranslation ? 'Übersetzung ausblenden' : 'Übersetzung zeigen')}
            </button>
            {showTranslation && <p>{scenario.translation}</p>}
          </div>
        </div>

        <aside className="inspector" aria-live="polite">
          {selected && 'caseKey' in selected ? (
            <>
              <div className={`inspector-case case-${selected.caseKey}`}>
                <span>{uiText(mode, caseMeta[selected.caseKey].cn, caseMeta[selected.caseKey].numberDe)}</span>
                <strong>{caseMeta[selected.caseKey].label}</strong>
                <em>{caseMeta[selected.caseKey].question}</em>
              </div>
              <h3 lang="de">{selected.text}</h3>
              <div className="inspector-block">
                <span className="step-label">01 · {uiText(mode, '先看关系', 'Beziehung')}</span>
                <Bilingual mode={mode} zh={selected.noteZh} de={selected.noteDe} />
              </div>
              <div className="inspector-block">
                <span className="step-label">02 · {uiText(mode, '再看形式', 'Formsignal')}</span>
                <Bilingual mode={mode} zh={selected.formZh} de={selected.formDe} />
              </div>
              <div className="inspector-tip">
                <Sparkles size={18} />
                <span>{uiText(mode, '不要只问中文意思；先找是谁在支配这个格。', 'Nicht nur übersetzen: Suche zuerst den Kasus-Regenten.')}</span>
              </div>
            </>
          ) : null}
        </aside>
      </div>
    </section>
  )
}

function Principles({ mode }: { mode: LanguageMode }) {
  return (
    <section id="principles" className="principles section-shell" aria-labelledby="principles-title">
      <div className="principles-intro">
        <div className="section-kicker"><BookOpen size={17} /> ORIENTIERUNG</div>
        <h2 id="principles-title">{uiText(mode, '判断一个格，按这四步走', 'Kasus finden: vier Spuren')}</h2>
        <Bilingual mode={mode} zh="不要一上来就在十六格大表里迷路。先沿着句子里的线索向前走，形式是最后的确认。" de="Verliere dich nicht sofort in einer großen Tabelle. Folge zuerst den Spuren im Satz; die Form bestätigt dein Ergebnis." />
      </div>
      <ol className="clue-list">
        <li><span>01</span><strong>{uiText(mode, '找到动词', 'Verb finden')}</strong><small>{uiText(mode, '它需要几个“搭档”？', 'Welche Mitspieler braucht es?')}</small></li>
        <li><span>02</span><strong>{uiText(mode, '圈出介词', 'Präposition markieren')}</strong><small>{uiText(mode, '它支配哪个格？', 'Welchen Kasus regiert sie?')}</small></li>
        <li><span>03</span><strong>{uiText(mode, '辨认关系', 'Beziehung prüfen')}</strong><small>{uiText(mode, '主语、目标、位置还是限定？', 'Subjekt, Ziel, Ort oder Attribut?')}</small></li>
        <li><span>04</span><strong>{uiText(mode, '核对形式', 'Form abgleichen')}</strong><small>{uiText(mode, '冠词和词尾留下了什么信号？', 'Welche Signale zeigen Artikel und Endung?')}</small></li>
      </ol>
    </section>
  )
}

function PracticeHub({ mode, activeTab, onTabChange }: { mode: LanguageMode; activeTab: PracticeTab; onTabChange: (tab: PracticeTab) => void }) {
  return (
    <section id="practice" className="practice-hub" aria-labelledby="practice-title">
      <div className="practice-heading section-shell">
        <div className="section-kicker"><FlaskConical size={17} /> PRAXISLABOR · FREIES ÜBEN</div>
        <h2 id="practice-title">{uiText(mode, '不属于阶段的自由练习台', 'Freies Üben außerhalb der Phasen')}</h2>
        <Bilingual mode={mode} zh="句子透视器用于拆解实例，四步判断用于复盘方法。它们不会夹在阶段之间，也不会把页面继续拉长。" de="Das Satz-Röntgen untersucht Beispiele; die vier Spuren wiederholen die Methode. Beide stehen unabhängig vom Lernpfad." />
        <div className="practice-tabs" role="tablist" aria-label={uiText(mode, '练习工具', 'Übungswerkzeuge')}>
          <button type="button" role="tab" aria-selected={activeTab === 'lab'} className={activeTab === 'lab' ? 'is-active' : ''} onClick={() => onTabChange('lab')}>{uiText(mode, '句子透视器', 'Satz-Röntgen')}</button>
          <button type="button" role="tab" aria-selected={activeTab === 'principles'} className={activeTab === 'principles' ? 'is-active' : ''} onClick={() => onTabChange('principles')}>{uiText(mode, '四步判断', 'Vier Spuren')}</button>
        </div>
      </div>
      {activeTab === 'lab' ? <SentenceLab mode={mode} /> : <Principles mode={mode} />}
    </section>
  )
}

function App() {
  const [mode, setMode] = useState<LanguageMode>(() => {
    const stored = window.localStorage.getItem('kasuslabor-language')
    return stored === 'zh' || stored === 'de' || stored === 'both' ? stored : 'both'
  })
  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia('(min-width: 861px)').matches)
  const [activeUnit, setActiveUnit] = useState<CourseUnit>('overview')
  const [activeStage2, setActiveStage2] = useState<Stage2Unit>('overview')
  const [activeStage3, setActiveStage3] = useState<Stage3Unit>('valency')
  const [activeStage4, setActiveStage4] = useState<Stage4Unit>('articles')
  const [activeStage5, setActiveStage5] = useState<Stage5Unit>('word-order')
  const [activeView, setActiveView] = useState<AppView>('overview')
  const [practiceTab, setPracticeTab] = useState<PracticeTab>('lab')
  const [visitedUnits, setVisitedUnits] = useState<CourseUnit[]>(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem('kasuslabor-progress') ?? '[]')
      return Array.isArray(stored)
        ? [...new Set(stored.filter((unit): unit is CourseUnit => courseUnitIds.includes(unit as CourseUnit)))]
        : []
    } catch {
      return []
    }
  })

  const openView = (view: AppView) => setActiveView(view)

  const selectUnit = (unit: CourseUnit) => {
    setVisitedUnits((current) => current.includes(unit) ? current : [...current, unit])
    setActiveUnit(unit)
    if (unit === 'overview' || unit === 'clues' || unit === 'nom' || unit === 'akk' || unit === 'dat' || unit === 'gen') {
      setActiveStage2(unit)
      setActiveView('phase2')
    } else if (unit === 'valency' || unit === 'fixed-preps' || unit === 'two-way') {
      setActiveStage3(unit)
      setActiveView('phase3')
    } else if (unit === 'articles' || unit === 'ein-words' || unit === 'adjectives' || unit === 'pronouns' || unit === 'nouns') {
      setActiveStage4(unit)
      setActiveView('phase4')
    } else {
      setActiveStage5(unit)
      setActiveView('phase5')
    }
  }

  useEffect(() => {
    window.localStorage.setItem('kasuslabor-language', mode)
    document.documentElement.lang = mode === 'de' ? 'de' : 'zh-CN'
  }, [mode])

  useEffect(() => {
    window.localStorage.setItem('kasuslabor-progress', JSON.stringify(visitedUnits))
  }, [visitedUnits])

  useEffect(() => {
    const media = window.matchMedia('(min-width: 861px)')
    const syncSidebar = (event: MediaQueryListEvent) => setSidebarOpen(event.matches)
    media.addEventListener('change', syncSidebar)
    return () => media.removeEventListener('change', syncSidebar)
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeView])

  const footerLabel = {
    overview: uiText(mode, '课程首页', 'Kursstart'),
    phase2: uiText(mode, '阶段 2 · 基础框架', 'Phase 2 · Grundlagen'),
    phase3: uiText(mode, '阶段 3 · 支配关系', 'Phase 3 · Kasus-Regenten'),
    phase4: uiText(mode, '阶段 4 · 词形系统', 'Phase 4 · Formen'),
    phase5: uiText(mode, '阶段 5 · 句子综合', 'Phase 5 · Satzintegration'),
    practice: uiText(mode, '自由练习台', 'Freies Praxislabor'),
    reference: uiText(mode, '速查与复习', 'Schnellzugriff'),
  }[activeView]

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">{uiText(mode, '跳到正文', 'Zum Inhalt springen')}</a>
      <Sidebar
        mode={mode}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeUnit={activeUnit}
        visitedUnits={visitedUnits}
        onSelectUnit={selectUnit}
        activeView={activeView}
        onOpenOverview={() => openView('overview')}
        onOpenPractice={() => { setPracticeTab('lab'); openView('practice') }}
        onOpenReference={() => openView('reference')}
        onResetProgress={() => {
          const confirmed = window.confirm(uiText(mode, '确定要清除本机保存的学习进度吗？收藏和语言设置不会受影响。', 'Lokalen Lernfortschritt wirklich löschen? Favoriten und Spracheinstellung bleiben erhalten.'))
          if (confirmed) setVisitedUnits([])
        }}
      />

      <div className={`page-column ${sidebarOpen ? '' : 'sidebar-collapsed'}`.trim()}>
        <header className="topbar">
          <button type="button" className="icon-button menu-button" aria-label="打开学习目录" onClick={() => setSidebarOpen(true)}>
            <Menu size={21} />
          </button>
          <a className="compact-brand" href="#overview" onClick={(event) => { event.preventDefault(); openView('overview') }}>
            <FlaskConical size={19} />
            <strong>Kasuslabor</strong>
          </a>
          <nav className="top-nav" aria-label="页面导航">
            <button type="button" onClick={() => openView('overview')}>{uiText(mode, '学习地图', 'Lernkarte')}</button>
            <button type="button" onClick={() => { setPracticeTab('lab'); openView('practice') }}>{uiText(mode, '句子实验', 'Satzlabor')}</button>
            <button type="button" onClick={() => openView('reference')}>{uiText(mode, '速查复习', 'Schnellzugriff')}</button>
          </nav>
          <LanguageSwitch mode={mode} onChange={setMode} />
        </header>

        <main id="main">
          {activeView === 'overview' && <><section id="overview" className="hero section-shell">
            <div className="hero-copy">
              <div className="eyebrow"><span /> KASUSLABOR · DEUTSCH ENTDECKEN</div>
              <h1>
                {mode !== 'de' && <span>别急着背表格。</span>}
                {mode !== 'zh' && <span lang="de">Schau zuerst in den Satz.</span>}
              </h1>
              <Bilingual
                mode={mode}
                className="hero-intro"
                zh="德语的四个格不是四排孤零零的词尾，而是一套让句子角色清晰可见的信号系统。我们从关系出发，再把形式拼起来。"
                de="Die vier Kasus sind keine einsamen Tabellenzeilen. Sie machen Beziehungen im Satz sichtbar. Wir beginnen mit der Rolle – und setzen dann die Form zusammen."
              />
              <div className="hero-actions">
                <a className="primary-action" href="#roadmap">
                  {uiText(mode, '查看完整地图', 'Vollständige Lernkarte ansehen')}
                  <ArrowDown size={18} />
                </a>
                <a className="text-action" href="#practice" onClick={(event) => { event.preventDefault(); setPracticeTab('lab'); openView('practice') }}>
                  {uiText(mode, '进入自由练习台', 'Zum freien Praxislabor')}
                  <ArrowRight size={17} />
                </a>
              </div>
              <div className="hero-note">
                <Check size={17} />
                <span>{uiText(mode, '解释语言可以随时切换；德语例句始终保留。', 'Die Erklärungssprache ist jederzeit wechselbar; deutsche Beispiele bleiben sichtbar.')}</span>
              </div>
            </div>

            <div className="hero-visual" aria-label="四格角色关系示意图">
              <div className="visual-grid" />
              <div className="orbit orbit-one" />
              <div className="orbit orbit-two" />
              <div className="visual-center">
                <FlaskConical size={33} />
                <span>SATZ</span>
                {mode !== 'de' && <strong>关系先于词尾</strong>}
                {mode !== 'zh' && <small>Beziehung vor Endung</small>}
              </div>
              {(Object.keys(caseMeta) as CaseKey[]).map((key, index) => {
                const Icon = caseMeta[key].icon
                return (
                  <div key={key} className={`visual-node node-${index + 1} case-${key}`}>
                    <Icon size={20} />
                    <span>{caseMeta[key].label}</span>
                  </div>
                )
              })}
              <span className="scribble scribble-one">Wer?</span>
              <span className="scribble scribble-two">Wem?</span>
            </div>
          </section>

          <section id="roadmap" className="roadmap-section section-shell" aria-labelledby="roadmap-title">
            <div className="section-kicker"><Route size={17} /> 4 KASUS · 1 SYSTEM</div>
            <div className="section-heading">
              <h2 id="roadmap-title">{uiText(mode, '四个格，不是四座孤岛', 'Vier Kasus, ein System')}</h2>
              <Bilingual
                mode={mode}
                zh="每个格都有常见角色，但最终选择常常由动词、介词和句法关系共同决定。你可以按顺序学习四个基础单元，也可以随时速查。"
                de="Jeder Kasus hat typische Rollen. Entscheidend sind aber oft Verb, Präposition und Satzbeziehung gemeinsam. Du kannst die vier Grundeinheiten der Reihe nach lernen oder jederzeit nachschlagen."
              />
            </div>
            <div className="case-path">
              {(['nom', 'akk', 'dat', 'gen'] as CaseKey[]).map((key, index) => (
                <CaseCard key={key} caseKey={key} mode={mode} index={index} />
              ))}
            </div>
            <div className="roadmap-course-entry">
              <button type="button" className="primary-action" onClick={() => selectUnit('overview')}>
                {uiText(mode, '进入课程', 'Kurs beginnen')}
                <ArrowRight size={18} />
              </button>
            </div>
          </section>
          </>}

          {activeView === 'phase2' && <CourseSection mode={mode} activeUnit={activeStage2} onUnitChange={(unit) => selectUnit(unit)} onNextPhase={() => selectUnit(activeStage3)} />}
          {activeView === 'phase3' && <GovernorsSection mode={mode} activeUnit={activeStage3} onUnitChange={(unit) => selectUnit(unit)} onNextPhase={() => selectUnit(activeStage4)} />}
          {activeView === 'phase4' && <FormsSection mode={mode} activeUnit={activeStage4} onUnitChange={(unit) => selectUnit(unit)} onNextPhase={() => selectUnit(activeStage5)} />}
          {activeView === 'phase5' && <SentencesSection mode={mode} activeUnit={activeStage5} onUnitChange={(unit) => selectUnit(unit)} onNextPhase={() => openView('reference')} />}
          {activeView === 'practice' && <PracticeHub mode={mode} activeTab={practiceTab} onTabChange={setPracticeTab} />}
          {activeView === 'reference' && <ReferenceSection mode={mode} />}
        </main>

        <footer>
          <div>
            <FlaskConical size={20} />
            <strong>Kasuslabor</strong>
            <span>{footerLabel}</span>
          </div>
          <p>{uiText(mode, '本地运行 · 无账号 · 无外部追踪', 'Lokal · Ohne Konto · Ohne Tracking')}</p>
        </footer>
      </div>
    </div>
  )
}

export default App
