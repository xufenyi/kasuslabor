import { ArrowRight, Check, CheckCircle2, GitCompareArrows, Network, ScanLine, Sparkles, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PhaseActions } from './PhaseActions'

export type Stage5Unit = 'word-order' | 'passive' | 'relative'
type LanguageMode = 'both' | 'zh' | 'de'
type CaseKey = 'nom' | 'akk' | 'dat' | 'gen'
type Gender = 'm' | 'f' | 'n' | 'pl'

function uiText(mode: LanguageMode, zh: string, de: string) {
  if (mode === 'zh') return zh
  if (mode === 'de') return de
  return `${zh} · ${de}`
}

function Bilingual({ mode, zh, de, className = '' }: { mode: LanguageMode; zh: string; de: string; className?: string }) {
  return <div className={`bilingual ${className}`.trim()}>{mode !== 'de' && <p className="copy-zh">{zh}</p>}{mode !== 'zh' && <p className="copy-de" lang="de">{de}</p>}</div>
}

const stage5Meta: Record<Stage5Unit, { number: string; zh: string; de: string; code: string }> = {
  'word-order': { number: '15', zh: '双宾语与语序', de: 'Doppelobjekte', code: 'DAT↔AKK' },
  passive: { number: '16', zh: '主动与被动', de: 'Aktiv und Passiv', code: 'AKK→NOM' },
  relative: { number: '17', zh: '关系从句', de: 'Relativsätze', code: 'DER...' },
}

function SentenceQuiz({ mode, prompt, options, answer, whyZh, whyDe }: { mode: LanguageMode; prompt: string; options: string[]; answer: string; whyZh: string; whyDe: string }) {
  const [selected, setSelected] = useState<string | null>(null)
  const correct = selected === answer
  useEffect(() => setSelected(null), [prompt, answer])
  return <div className="sentence-quiz"><span className="sentence-mini-label"><Sparkles size={15} /> SATZ-CHECK</span><p>{prompt}</p><div className="sentence-quiz-options">{options.map((option) => <button type="button" key={option} aria-pressed={selected === option} className={selected === option ? (correct ? 'is-correct' : 'is-wrong') : ''} onClick={() => setSelected(option)} lang="de">{option}</button>)}</div>{selected && <div className={`sentence-quiz-feedback ${correct ? 'is-correct' : 'is-wrong'}`} role="status">{correct ? <Check size={18} /> : <X size={18} />}<div><strong>{uiText(mode, correct ? '句子关系正确' : `推荐答案：${answer}`, correct ? 'Satzbeziehung stimmt' : `Empfohlen: ${answer}`)}</strong><Bilingual mode={mode} zh={whyZh} de={whyDe} /></div></div>}</div>
}

function UnitLead({ mode, badge, zh, de, introZh, introDe }: { mode: LanguageMode; badge: string; zh: string; de: string; introZh: string; introDe: string }) {
  return <div className="sentence-unit-lead"><span className="sentence-badge">{badge}</span><h2>{uiText(mode, zh, de)}</h2><Bilingual mode={mode} zh={introZh} de={introDe} /></div>
}

const orderPatterns = {
  nouns: {
    labelZh: '两个名词短语', labelDe: 'zwei Nomen', ruleZh: '中性语序通常是与格在宾格前。', ruleDe: 'Neutral steht der Dativ meist vor dem Akkusativ.',
    parts: [{ text: 'Ich gebe', type: 'base' }, { text: 'dem Kind', type: 'dat' }, { text: 'das Buch', type: 'akk' }, { text: '.', type: 'punctuation' }],
  },
  datPronoun: {
    labelZh: '与格代词 + 名词', labelDe: 'Dat.-Pronomen', ruleZh: '代词通常先于名词，因此 ihm 仍在 das Buch 前。', ruleDe: 'Pronomen stehen meist vor Nomen; ihm bleibt vor das Buch.',
    parts: [{ text: 'Ich gebe', type: 'base' }, { text: 'ihm', type: 'dat' }, { text: 'das Buch', type: 'akk' }, { text: '.', type: 'punctuation' }],
  },
  akkPronoun: {
    labelZh: '宾格代词 + 名词', labelDe: 'Akk.-Pronomen', ruleZh: '宾格代词 es 前置到与格名词 dem Kind 之前。', ruleDe: 'Das Akkusativpronomen es steht vor der Dativgruppe dem Kind.',
    parts: [{ text: 'Ich gebe', type: 'base' }, { text: 'es', type: 'akk' }, { text: 'dem Kind', type: 'dat' }, { text: '.', type: 'punctuation' }],
  },
  pronouns: {
    labelZh: '两个代词', labelDe: 'zwei Pronomen', ruleZh: '两个对象都是代词时，通常宾格在与格前：es ihm。', ruleDe: 'Sind beide Objekte Pronomen, steht meist Akkusativ vor Dativ: es ihm.',
    parts: [{ text: 'Ich gebe', type: 'base' }, { text: 'es', type: 'akk' }, { text: 'ihm', type: 'dat' }, { text: '.', type: 'punctuation' }],
  },
} as const
type OrderPattern = keyof typeof orderPatterns

function WordOrderUnit({ mode }: { mode: LanguageMode }) {
  const [pattern, setPattern] = useState<OrderPattern>('nouns')
  const item = orderPatterns[pattern]
  return <div className="sentence-unit">
    <UnitLead mode={mode} badge="15 · DOPPELOBJEKTE" zh="格决定角色，语序安排信息" de="Kasus zeigt die Rolle, Wortstellung ordnet die Information" introZh="德语格让对象即使换位置也能被识别，但中性语序仍有明显倾向。先判断名词还是代词，再选择对象顺序。" introDe="Kasus hält die Rollen erkennbar, doch die neutrale Wortstellung hat klare Tendenzen. Entscheide zuerst: Nomen oder Pronomen?" />
    <div className="order-lab">
      <div className="order-selector" role="tablist" aria-label="双宾语组合">{(Object.keys(orderPatterns) as OrderPattern[]).map((key) => <button type="button" role="tab" aria-selected={pattern === key} className={pattern === key ? 'is-active' : ''} key={key} onClick={() => setPattern(key)}><strong>{uiText(mode, orderPatterns[key].labelZh, orderPatterns[key].labelDe)}</strong><small>0{Object.keys(orderPatterns).indexOf(key) + 1}</small></button>)}</div>
      <div className="order-stage">
        <span className="sentence-mini-label">NEUTRALE REIHENFOLGE</span>
        <div className="ordered-sentence" lang="de">{item.parts.map((part, index) => <span key={`${part.text}-${index}`} className={`order-${part.type}`}>{part.type === 'dat' && <small>DAT</small>}{part.type === 'akk' && <small>AKK</small>}{part.text}</span>)}</div>
        <div className="order-track">{item.parts.filter((part) => part.type === 'dat' || part.type === 'akk').map((part, index) => <div key={part.text} className={`case-${part.type}`}><i>0{index + 1}</i><strong>{part.type.toUpperCase()}</strong><span>{part.text.includes(' ') ? uiText(mode, '名词短语', 'Nominalgruppe') : uiText(mode, '代词', 'Pronomen')}</span></div>)}</div>
        <Bilingual mode={mode} zh={item.ruleZh} de={item.ruleDe} />
      </div>
    </div>
    <div className="order-caution"><GitCompareArrows size={22} /><Bilingual mode={mode} zh="这些是中性语序倾向，不是格的定义。对比、重音和已知/新信息可以把成分移到别处；格形式仍负责标记角色。" de="Das sind Tendenzen der neutralen Wortstellung, keine Kasusdefinition. Kontrast, Betonung und Informationsstruktur können die Reihenfolge verändern." /></div>
    <SentenceQuiz mode={mode} prompt={uiText(mode, '选择最自然的中性语序：', 'Wähle die neutrale Reihenfolge:')} options={['Ich gebe dem Kind es.', 'Ich gebe es dem Kind.', 'Ich es gebe dem Kind.']} answer="Ich gebe es dem Kind." whyZh="es 是宾格代词，通常放在与格名词 dem Kind 前；限定动词 gebe 仍在主句第二位。" whyDe="Das Akkusativpronomen es steht normalerweise vor der Dativgruppe dem Kind; das finite Verb bleibt auf Position 2." />
  </div>
}

function PassiveUnit({ mode }: { mode: LanguageMode }) {
  const [passive, setPassive] = useState(false)
  const [showAgent, setShowAgent] = useState(true)
  return <div className="sentence-unit">
    <UnitLead mode={mode} badge="16 · AKTIV ↔ PASSIV" zh="被动不是删掉主语，而是重新分配格" de="Passiv verteilt die Kasusrollen neu" introZh="主动句的宾格宾语在被动句中升为主格；与格对象通常保持与格。原主语若保留，常以 von + Dativ 表达。" introDe="Das Akkusativobjekt des Aktivsatzes wird im Passiv zum Nominativ. Ein Dativobjekt bleibt Dativ; der frühere Agens kann mit von + Dativ erscheinen." />
    <div className="voice-switch" role="group" aria-label="主动被动切换"><button type="button" className={!passive ? 'is-active' : ''} aria-pressed={!passive} onClick={() => setPassive(false)}>AKTIV</button><button type="button" className={passive ? 'is-active' : ''} aria-pressed={passive} onClick={() => setPassive(true)}>PASSIV</button></div>
    <div className={`passive-lab ${passive ? 'is-passive' : 'is-active'}`}>
      <div className="voice-sentence" lang="de">{!passive ? <><span className="case-nom"><small>NOM · Agens</small>Der Lehrer</span><i>erklärt</i><span className="case-dat"><small>DAT</small>dem Schüler</span><span className="case-akk"><small>AKK</small>den Satz</span><b>.</b></> : <><span className="case-nom"><small>NOM · neues Subjekt</small>Der Satz</span><i>wird</i><span className="case-dat"><small>DAT bleibt</small>dem Schüler</span>{showAgent && <span className="voice-agent"><small>von + DAT</small>vom Lehrer</span>}<i>erklärt</i><b>.</b></>}</div>
      <div className="role-transfer">
        <div className={`transfer-card case-akk ${passive ? 'has-moved' : ''}`}><span>{uiText(mode, '宾格对象', 'Akkusativobjekt')}</span><strong>den Satz</strong><ArrowRight size={20} /><b>der Satz · NOM</b></div>
        <div className="transfer-card case-dat"><span>{uiText(mode, '与格对象', 'Dativobjekt')}</span><strong>dem Schüler</strong><ArrowRight size={20} /><b>dem Schüler · DAT</b></div>
        <div className="transfer-card transfer-agent"><span>{uiText(mode, '施事', 'Agens')}</span><strong>der Lehrer</strong><ArrowRight size={20} /><b>vom Lehrer</b></div>
      </div>
      {passive && <label className="agent-toggle"><input type="checkbox" checked={showAgent} onChange={(event) => setShowAgent(event.target.checked)} />{uiText(mode, '显示施事（von + Dativ）', 'Agens mit von + Dativ zeigen')}</label>}
    </div>
    <div className="impersonal-passive"><Network size={22} /><div><h3>{uiText(mode, '没有宾格，就没有“升级对象”', 'Ohne Akkusativ kein aufsteigendes Objekt')}</h3><p lang="de">Man hilft dem Mann. → <b>Dem Mann wird geholfen.</b></p><Bilingual mode={mode} zh="helfen 只带与格。变成被动后 dem Mann 仍是与格，句子可以没有显式主格主语。" de="helfen regiert Dativ. Im Passiv bleibt dem Mann im Dativ; ein sichtbares Nominativsubjekt ist nicht nötig." /></div></div>
    <SentenceQuiz mode={mode} prompt={uiText(mode, '把句子变成被动：Die Ärztin untersucht den Patienten.', 'Passiv bilden: Die Ärztin untersucht den Patienten.')} options={['Der Patient wird von der Ärztin untersucht.', 'Dem Patienten wird die Ärztin untersucht.', 'Den Patienten wird von der Ärztin untersuchen.']} answer="Der Patient wird von der Ärztin untersucht." whyZh="宾格 den Patienten 升为主格 der Patient；原主语用 von der Ärztin 表达，过去分词 untersucht 位于句末。" whyDe="den Patienten wird zu der Patient im Nominativ; der frühere Agens erscheint als von der Ärztin, das Partizip steht am Ende." />
  </div>
}

const relativeForms: Record<CaseKey, Record<Gender, string>> = {
  nom: { m: 'der', f: 'die', n: 'das', pl: 'die' },
  akk: { m: 'den', f: 'die', n: 'das', pl: 'die' },
  dat: { m: 'dem', f: 'der', n: 'dem', pl: 'denen' },
  gen: { m: 'dessen', f: 'deren', n: 'dessen', pl: 'deren' },
}

const antecedents: Record<Gender, { noun: string; tail: string; nomVerb: string; possessiveClause: string }> = {
  m: { noun: 'Der Mann', tail: 'ist mein Nachbar.', nomVerb: 'wartet', possessiveClause: 'Auto rot ist' },
  f: { noun: 'Die Frau', tail: 'ist meine Nachbarin.', nomVerb: 'wartet', possessiveClause: 'Fahrrad neu ist' },
  n: { noun: 'Das Kind', tail: 'wohnt nebenan.', nomVerb: 'wartet', possessiveClause: 'Fahrrad neu ist' },
  pl: { noun: 'Die Leute', tail: 'wohnen nebenan.', nomVerb: 'warten', possessiveClause: 'Kinder hier wohnen' },
}

function relativeClause(gender: Gender, caseKey: CaseKey) {
  const rel = relativeForms[caseKey][gender]
  if (caseKey === 'nom') return `${antecedents[gender].noun}, ${rel} dort ${antecedents[gender].nomVerb}, ${antecedents[gender].tail}`
  if (caseKey === 'akk') return `${antecedents[gender].noun}, ${rel} ich kenne, ${antecedents[gender].tail}`
  if (caseKey === 'dat') return `${antecedents[gender].noun}, ${rel} ich danke, ${antecedents[gender].tail}`
  return `${antecedents[gender].noun}, ${rel} ${antecedents[gender].possessiveClause}, ${antecedents[gender].tail}`
}

const relativeExplanations: Record<CaseKey, { zh: string; de: string }> = {
  nom: { zh: '关系代词在从句中充当主语，因此用主格。', de: 'Das Relativpronomen ist Subjekt des Nebensatzes und steht im Nominativ.' },
  akk: { zh: 'kennen 要求宾格对象，因此关系代词使用宾格。', de: 'kennen verlangt ein Akkusativobjekt; deshalb steht das Relativpronomen im Akkusativ.' },
  dat: { zh: 'danken 固定要求与格对象，因此关系代词使用与格。', de: 'danken verlangt ein Dativobjekt; deshalb steht das Relativpronomen im Dativ.' },
  gen: { zh: '关系代词表达从句内部的所属关系，因此用属格 dessen/deren。', de: 'Das Relativpronomen zeigt Besitz im Nebensatz und steht als dessen/deren im Genitiv.' },
}

function RelativeUnit({ mode }: { mode: LanguageMode }) {
  const [gender, setGender] = useState<Gender>('f')
  const [caseKey, setCaseKey] = useState<CaseKey>('dat')
  const sentence = relativeClause(gender, caseKey)
  return <div className="sentence-unit">
    <UnitLead mode={mode} badge="17 · RELATIVSÄTZE" zh="性数向左看，格向从句里面看" de="Genus nach links, Kasus in den Relativsatz" introZh="关系代词同时连接两个系统：性和数来自先行词；格由它在关系从句内部承担的角色，或由前置介词决定。" introDe="Relativpronomen verbinden zwei Systeme: Genus und Numerus kommen vom Bezugswort; der Kasus entsteht aus ihrer Rolle im Relativsatz oder aus einer Präposition." />
    <div className="relative-lab">
      <div className="relative-controls">
        <fieldset><legend>{uiText(mode, '先行词的性 / 数', 'Genus / Numerus des Bezugsworts')}</legend><div>{(['m','f','n','pl'] as Gender[]).map((key) => <button type="button" key={key} className={gender === key ? 'is-active' : ''} onClick={() => setGender(key)}>{key.toUpperCase()}</button>)}</div></fieldset>
        <fieldset><legend>{uiText(mode, '从句内部的格', 'Kasus im Relativsatz')}</legend><div>{(['nom','akk','dat','gen'] as CaseKey[]).map((key) => <button type="button" key={key} className={caseKey === key ? 'is-active' : ''} onClick={() => setCaseKey(key)}>{key.toUpperCase()}</button>)}</div></fieldset>
      </div>
      <div className="relative-stage">
        <div className="relative-equation"><span>{antecedents[gender].noun}<small>{uiText(mode, '先行词给性数', 'Bezugswort gibt Genus/Numerus')}</small></span><b>+</b><span className={`case-${caseKey}`}>{relativeForms[caseKey][gender]}<small>{uiText(mode, '从句给格', 'Nebensatz gibt Kasus')}</small></span></div>
        <p lang="de">{sentence}</p>
        <Bilingual mode={mode} zh={relativeExplanations[caseKey].zh} de={relativeExplanations[caseKey].de} />
      </div>
    </div>
    <div className="preposition-relatives"><article><span>in + DAT</span><p lang="de">die Stadt, <b>in der</b> ich wohne</p></article><article><span>mit + DAT</span><p lang="de">der Mann, <b>mit dem</b> ich spreche</p></article><article><span>für + AKK</span><p lang="de">die Kinder, <b>für die</b> ich koche</p></article><Bilingual mode={mode} zh="介词与关系代词作为一个整体移到从句开头；介词先决定格，先行词只提供性和数。" de="Präposition und Relativpronomen stehen gemeinsam am Anfang. Die Präposition bestimmt den Kasus; das Bezugswort nur Genus und Numerus." /></div>
    <SentenceQuiz mode={mode} prompt="Das ist die Frau, mit ___ ich arbeite." options={['die', 'der', 'denen', 'deren']} answer="der" whyZh="先行词 Frau 给出阴性单数；mit 要求与格，所以关系代词是 der。" whyDe="Frau liefert Feminin Singular; mit verlangt Dativ. Daher lautet das Relativpronomen der." />
  </div>
}

const diagnosticParts = [
  { id: 'studentin', text: 'Die Studentin', caseKey: 'nom' as CaseKey, question: 'Wer?', zh: '与限定动词 zeigt 呼应的主语，是句子的主格锚点。die 本身也可能是宾格，因此关系比外形更重要。', de: 'Das Subjekt stimmt mit zeigt überein und steht im Nominativ. Die Form die allein wäre mehrdeutig.' },
  { id: 'bruder', text: 'dem Bruder', caseKey: 'dat' as CaseKey, question: 'Wem?', zh: 'zeigen 的接收者插槽使用与格；dem 是阳性单数与格的明显信号。', de: 'Der Empfänger von zeigen steht im Dativ; dem ist ein deutliches Signal für Maskulin Singular.' },
  { id: 'buch', text: 'das Buch', caseKey: 'akk' as CaseKey, question: 'Was?', zh: '被展示的事物占据宾格插槽。中性 das 在主格和宾格同形，必须结合动词框架判断。', de: 'Die gezeigte Sache besetzt die Akkusativstelle. das ist im Nominativ und Akkusativ formgleich.' },
  { id: 'professor', text: 'des Professors', caseKey: 'gen' as CaseKey, question: 'Wessen?', zh: '这个属格短语限定 Buch；des 与名词 -s 共同显示阳性单数属格。', de: 'Die Genitivgruppe bestimmt Buch näher; des und -s am Nomen zeigen Genitiv Maskulin Singular.' },
]

function DiagnosticRoom({ mode }: { mode: LanguageMode }) {
  const [selected, setSelected] = useState('studentin')
  const part = diagnosticParts.find((item) => item.id === selected) ?? diagnosticParts[0]
  return <section className="diagnostic-room" aria-labelledby="diagnostic-title">
    <div className="diagnostic-heading"><div><span className="sentence-badge">CAPSTONE · VIER KASUS</span><h2 id="diagnostic-title">{uiText(mode, '综合诊断室：把四条线索合起来', 'Diagnoseraum: alle vier Spuren verbinden')}</h2><Bilingual mode={mode} zh="点击每个名词短语，按同一流程复核：谁在支配？它承担什么关系？形式留下了哪些信号？" de="Klicke jede Nominalgruppe an und prüfe: Wer regiert? Welche Beziehung liegt vor? Welche Formsignale bestätigen sie?" /></div><CheckCircle2 size={44} /></div>
    <div className="diagnostic-workbench">
      <div className="diagnostic-sentence" lang="de">{diagnosticParts.slice(0,3).map((item, index) => <span key={item.id}>{index === 1 && <i>zeigt</i>}<button type="button" className={`case-${item.caseKey} ${selected === item.id ? 'is-active' : ''}`} aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}><small>{item.caseKey.toUpperCase()}</small>{item.text}</button></span>)}<button type="button" className={`case-gen ${selected === 'professor' ? 'is-active' : ''}`} aria-pressed={selected === 'professor'} onClick={() => setSelected('professor')}><small>GEN</small>des Professors</button><b>.</b></div>
      <aside className={`diagnostic-inspector case-${part.caseKey}`} aria-live="polite"><span>{part.caseKey.toUpperCase()} · {part.question}</span><strong lang="de">{part.text}</strong><Bilingual mode={mode} zh={part.zh} de={part.de} /><ol><li>{uiText(mode, '找支配者', 'Regenten finden')}</li><li>{uiText(mode, '判断关系', 'Beziehung bestimmen')}</li><li>{uiText(mode, '核对形式', 'Form prüfen')}</li></ol></aside>
    </div>
    <div className="completion-strip"><CheckCircle2 size={24} /><div><strong>{uiText(mode, '把四条线索带进每一个新句子', 'Nimm die vier Spuren in jeden neuen Satz mit')}</strong><Bilingual mode={mode} zh="需要复习时，可以从目录返回任意单元，也可以使用速查与收藏集中检查容易混淆的形式。" de="Zum Wiederholen kannst du jederzeit zu einer Einheit zurückkehren oder Formen im Schnellzugriff und in deinen Favoriten vergleichen." /></div></div>
  </section>
}

export function SentencesSection({ mode, activeUnit, onUnitChange, onNextPhase }: { mode: LanguageMode; activeUnit: Stage5Unit; onUnitChange: (unit: Stage5Unit) => void; onNextPhase?: () => void }) {
  return <section id="sentences" className="sentences-section" aria-labelledby="sentences-title"><div className="section-shell"><div className="section-kicker"><ScanLine size={17} /> PHASE 5 · IM GANZEN SATZ</div><div className="sentences-heading"><div><h2 id="sentences-title">{uiText(mode, '从词形回到完整句子', 'Von der Form zurück zum ganzen Satz')}</h2><Bilingual mode={mode} zh="这三个单元观察格在语序变化、语态转换和从句嵌套中如何保持角色清晰。规则开始互相配合，而不是各自独立。" de="Diese Einheiten zeigen, wie Kasus bei Wortstellung, Passiv und eingebetteten Relativsätzen die Rollen sichtbar hält." /></div></div><div className="sentence-tabs" role="tablist" aria-label="阶段 5 学习单元">{(Object.keys(stage5Meta) as Stage5Unit[]).map((key) => <button type="button" role="tab" aria-selected={activeUnit === key} className={activeUnit === key ? 'is-active' : ''} key={key} onClick={() => onUnitChange(key)}><span>{stage5Meta[key].number}</span><strong>{uiText(mode, stage5Meta[key].zh, stage5Meta[key].de)}</strong><small>{stage5Meta[key].code}</small></button>)}</div><div className="sentences-paper" role="tabpanel" key={activeUnit}>{activeUnit === 'word-order' && <WordOrderUnit mode={mode} />}{activeUnit === 'passive' && <PassiveUnit mode={mode} />}{activeUnit === 'relative' && <RelativeUnit mode={mode} />}</div><PhaseActions mode={mode} tabsSelector=".sentence-tabs" showNext={activeUnit === 'relative'} nextZh="进入速查与复习" nextDe="Weiter zu Schnellzugriff und Wiederholung" onNext={onNextPhase} /><DiagnosticRoom mode={mode} /></div></section>
}
