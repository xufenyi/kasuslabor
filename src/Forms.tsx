import { Check, Fingerprint, Grid3X3, Layers3, Puzzle, ScanSearch, Sparkles, Tags, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { PhaseActions } from './PhaseActions'

export type Stage4Unit = 'articles' | 'ein-words' | 'adjectives' | 'pronouns' | 'nouns'
type LanguageMode = 'both' | 'zh' | 'de'
type CaseKey = 'nom' | 'akk' | 'dat' | 'gen'
type Gender = 'm' | 'f' | 'n' | 'pl'
type DeterminerType = 'definite' | 'ein' | 'none'

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

const formMeta: Record<Stage4Unit, { number: string; zh: string; de: string; code: string }> = {
  articles: { number: '10', zh: '定冠词矩阵', de: 'Artikelmatrix', code: 'DER' },
  'ein-words': { number: '11', zh: 'ein-家族', de: 'ein-Wörter', code: 'EIN' },
  adjectives: { number: '12', zh: '形容词词尾', de: 'Adjektivendungen', code: '-E?' },
  pronouns: { number: '13', zh: '代词', de: 'Pronomen', code: 'ICH' },
  nouns: { number: '14', zh: '名词特殊变化', de: 'Nomenformen', code: '-N/-S' },
}

const caseLabels: Record<CaseKey, { zh: string; de: string; question: string }> = {
  nom: { zh: '主格', de: 'Nominativ', question: 'Wer? Was?' },
  akk: { zh: '宾格', de: 'Akkusativ', question: 'Wen? Was?' },
  dat: { zh: '与格', de: 'Dativ', question: 'Wem?' },
  gen: { zh: '属格', de: 'Genitiv', question: 'Wessen?' },
}

const genderLabels: Record<Gender, { zh: string; de: string; short: string }> = {
  m: { zh: '阳性', de: 'Maskulin', short: 'M' },
  f: { zh: '阴性', de: 'Feminin', short: 'F' },
  n: { zh: '中性', de: 'Neutrum', short: 'N' },
  pl: { zh: '复数', de: 'Plural', short: 'PL' },
}

const definiteArticles: Record<CaseKey, Record<Gender, string>> = {
  nom: { m: 'der', f: 'die', n: 'das', pl: 'die' },
  akk: { m: 'den', f: 'die', n: 'das', pl: 'die' },
  dat: { m: 'dem', f: 'der', n: 'dem', pl: 'den' },
  gen: { m: 'des', f: 'der', n: 'des', pl: 'der' },
}

const nounForms: Record<CaseKey, Record<Gender, string>> = {
  nom: { m: 'Mann', f: 'Frau', n: 'Kind', pl: 'Kinder' },
  akk: { m: 'Mann', f: 'Frau', n: 'Kind', pl: 'Kinder' },
  dat: { m: 'Mann', f: 'Frau', n: 'Kind', pl: 'Kindern' },
  gen: { m: 'Mannes', f: 'Frau', n: 'Kindes', pl: 'Kinder' },
}

function FormQuiz({ mode, prompt, options, answer, whyZh, whyDe }: { mode: LanguageMode; prompt: string; options: string[]; answer: string; whyZh: string; whyDe: string }) {
  const [selected, setSelected] = useState<string | null>(null)
  const correct = selected === answer
  useEffect(() => setSelected(null), [prompt, answer])
  return (
    <div className="form-quiz">
      <span className="form-mini-label"><Sparkles size={15} /> FORM-CHECK</span>
      <p lang="de">{prompt}</p>
      <div className="form-options">
        {options.map((option) => <button type="button" key={option} aria-pressed={selected === option} className={selected === option ? (correct ? 'is-correct' : 'is-wrong') : ''} onClick={() => setSelected(option)}>{option}</button>)}
      </div>
      {selected && <div className={`form-feedback ${correct ? 'is-correct' : 'is-wrong'}`} role="status">{correct ? <Check size={18} /> : <X size={18} />}<div><strong>{uiText(mode, correct ? '形式信号吻合' : `正确答案：${answer}`, correct ? 'Formsignal stimmt' : `Richtig: ${answer}`)}</strong><Bilingual mode={mode} zh={whyZh} de={whyDe} /></div></div>}
    </div>
  )
}

function UnitLead({ mode, badge, zh, de, introZh, introDe }: { mode: LanguageMode; badge: string; zh: string; de: string; introZh: string; introDe: string }) {
  return <div className="form-unit-lead"><span className="form-badge">{badge}</span><h2>{uiText(mode, zh, de)}</h2><Bilingual mode={mode} zh={introZh} de={introDe} /></div>
}

function ArticleMatrix({ mode }: { mode: LanguageMode }) {
  const [caseKey, setCaseKey] = useState<CaseKey>('akk')
  const [gender, setGender] = useState<Gender>('m')
  const article = definiteArticles[caseKey][gender]
  const explanation = useMemo(() => {
    if (caseKey === 'akk' && gender === 'm') return { zh: '阳性单数宾格的 den 是高辨识度信号，可用阳性替换测试让隐藏的格显形。', de: 'den ist ein starkes Signal für Akkusativ Maskulin. Die Maskulinprobe macht unsichtbaren Kasus sichtbar.' }
    if (caseKey === 'dat' && gender === 'pl') return { zh: '复数与格有两层信号：冠词 den，加上名词通常出现的 -n。', de: 'Dativ Plural hat oft zwei Signale: den und zusätzlich -n am Nomen.' }
    if (caseKey === 'gen' && (gender === 'm' || gender === 'n')) return { zh: '阳性和中性属格用 des；名词通常再加 -s 或 -es。', de: 'Maskulinum und Neutrum haben im Genitiv des; das Nomen erhält meist -s oder -es.' }
    return { zh: '这个形式可能在矩阵中重复出现，所以冠词是证据，不是脱离句法的最终答案。', de: 'Diese Form kann mehrfach vorkommen. Der Artikel ist ein Signal, aber ohne Satzbeziehung kein endgültiger Beweis.' }
  }, [caseKey, gender])
  return (
    <div className="form-unit">
      <UnitLead mode={mode} badge="10 · BESTIMMTER ARTIKEL" zh="别背十六格：先看重复与独特信号" de="Nicht 16 Felder, sondern Signalmuster" introZh="定冠词把格、性和数压缩进一个小词。点击任意格子，观察它能提供多少信息，以及哪些形式必须靠句法排除歧义。" introDe="Der bestimmte Artikel bündelt Kasus, Genus und Numerus. Klicke ein Feld an und prüfe, wie eindeutig sein Signal wirklich ist." />
      <div className="article-matrix-wrap">
        <div className="article-matrix" role="grid" aria-label="定冠词变格矩阵">
          <div className="matrix-corner">KASUS × GENUS</div>
          {(Object.keys(genderLabels) as Gender[]).map((key) => <div className="article-col-head" key={key}><strong>{genderLabels[key].short}</strong><span>{uiText(mode, genderLabels[key].zh, genderLabels[key].de)}</span></div>)}
          {(Object.keys(caseLabels) as CaseKey[]).map((caseItem) => <div className="article-row" key={caseItem}><div className="article-row-head"><strong>{caseLabels[caseItem].de}</strong><span>{caseLabels[caseItem].question}</span></div>{(Object.keys(genderLabels) as Gender[]).map((genderItem) => <button type="button" role="gridcell" aria-selected={caseKey === caseItem && gender === genderItem} className={caseKey === caseItem && gender === genderItem ? 'is-active' : ''} key={genderItem} onClick={() => { setCaseKey(caseItem); setGender(genderItem) }}>{definiteArticles[caseItem][genderItem]}</button>)}</div>)}
        </div>
        <aside className="article-inspector" aria-live="polite"><span>{caseLabels[caseKey].de} · {genderLabels[gender].de}</span><strong lang="de">{article} {nounForms[caseKey][gender]}</strong><Bilingual mode={mode} zh={explanation.zh} de={explanation.de} /><div className="signal-code"><i>{article}</i><b>{caseLabels[caseKey].question}</b></div></aside>
      </div>
      <div className="replacement-test"><ScanSearch size={22} /><div><h3>{uiText(mode, '阳性替换测试', 'Maskulinprobe')}</h3><p lang="de">Die Frau sieht das Kind. → Die Frau sieht <b>den Mann</b>.</p><Bilingual mode={mode} zh="die / das 在主格和宾格中可能同形；换成阳性单数后，den 会把宾格暴露出来。" de="die und das können gleich aussehen. Mit einem maskulinen Ersatz zeigt den den Akkusativ deutlich." /></div></div>
      <FormQuiz mode={mode} prompt="Ich spreche mit ___ Frau." options={['die', 'der', 'den', 'des']} answer="der" whyZh="mit 固定支配与格；阴性单数与格的定冠词是 der。" whyDe="mit regiert den Dativ; Feminin Singular: der." />
    </div>
  )
}

const einEndings: Record<CaseKey, Record<Gender, string>> = {
  nom: { m: '', f: 'e', n: '', pl: 'e' },
  akk: { m: 'en', f: 'e', n: '', pl: 'e' },
  dat: { m: 'em', f: 'er', n: 'em', pl: 'en' },
  gen: { m: 'es', f: 'er', n: 'es', pl: 'er' },
}

const einFamily = ['ein', 'kein', 'mein', 'dein', 'sein', 'ihr', 'unser', 'euer'] as const
type EinStem = typeof einFamily[number]

function buildEinWord(stem: EinStem, ending: string, gender: Gender) {
  if (stem === 'ein' && gender === 'pl') return '—'
  const base = stem === 'euer' && ending ? 'eur' : stem
  return `${base}${ending}`
}

function EinWordsUnit({ mode }: { mode: LanguageMode }) {
  const [stem, setStem] = useState<EinStem>('mein')
  const [caseKey, setCaseKey] = useState<CaseKey>('dat')
  const [gender, setGender] = useState<Gender>('m')
  const ending = einEndings[caseKey][gender]
  const word = buildEinWord(stem, ending, gender)
  const unavailable = word === '—'
  return (
    <div className="form-unit">
      <UnitLead mode={mode} badge="11 · EIN-WÖRTER" zh="一个词尾模板，带动整个家族" de="Ein Endungsmuster für die ganze Familie" introZh="ein、kein 和物主词使用同一套词尾。区别只在词干；真正要观察的是词尾有没有发出格信号。" introDe="ein, kein und Possessivartikel folgen demselben Endungsmuster. Achte darauf, ob die Endung das Kasussignal sichtbar macht." />
      <div className="ein-builder">
        <div className="form-control-stack">
          <fieldset><legend>{uiText(mode, '选择家族成员', 'Familienmitglied')}</legend><div className="chip-grid">{einFamily.map((item) => <button type="button" key={item} className={stem === item ? 'is-active' : ''} aria-pressed={stem === item} onClick={() => setStem(item)}>{item}-</button>)}</div></fieldset>
          <fieldset><legend>{uiText(mode, '选择格', 'Kasus')}</legend><div className="chip-grid four">{(Object.keys(caseLabels) as CaseKey[]).map((key) => <button type="button" key={key} className={caseKey === key ? 'is-active' : ''} aria-pressed={caseKey === key} onClick={() => setCaseKey(key)}>{key.toUpperCase()}</button>)}</div></fieldset>
          <fieldset><legend>{uiText(mode, '选择性 / 数', 'Genus / Numerus')}</legend><div className="chip-grid four">{(Object.keys(genderLabels) as Gender[]).map((key) => <button type="button" key={key} className={gender === key ? 'is-active' : ''} aria-pressed={gender === key} onClick={() => setGender(key)}>{genderLabels[key].short}</button>)}</div></fieldset>
        </div>
        <div className="ending-machine" aria-live="polite">
          <div className="word-parts"><span>{unavailable ? 'ein' : stem === 'euer' && ending ? 'eur' : stem}<small>Stamm</small></span><b className={ending ? '' : 'is-zero'}>{ending || '∅'}<small>Endung</small></b></div>
          <strong lang="de">{unavailable ? 'kein Plural von „ein“' : `${word} ${nounForms[caseKey][gender]}`}</strong>
          {unavailable ? <Bilingual mode={mode} zh="不定冠词 ein 没有复数；kein 和物主词则可以进入复数格子。" de="Der unbestimmte Artikel ein hat keinen Plural; kein und Possessivartikel schon." /> : <Bilingual mode={mode} zh={ending ? `词尾 -${ending} 承担了可见的格/性数信号。` : '这里是零词尾：冠词没有把全部信息说出来，后面的形容词需要承担更多信号。'} de={ending ? `Die Endung -${ending} trägt ein sichtbares Kasus- und Genussignal.` : 'Hier steht eine Nullendung. Ein folgendes Adjektiv muss mehr Information tragen.'} />}
        </div>
      </div>
      <div className="zero-ending-map"><div><span>∅</span><strong>ein guter Mann</strong><small>NOM · M</small></div><div><span>∅</span><strong>ein gutes Kind</strong><small>NOM/AKK · N</small></div><div><span>-en</span><strong>einen guten Mann</strong><small>AKK · M</small></div><Bilingual mode={mode} zh="零词尾不是“没有语法”，而是信号转交给形容词：guter / gutes。" de="Nullendung heißt nicht „keine Grammatik“: Das Signal wandert zum Adjektiv, etwa guter oder gutes." /></div>
      <FormQuiz mode={mode} prompt="Ich fahre mit mein___ Bruder." options={['-', '-e', '-en', '-em']} answer="-em" whyZh="mit 要求与格；阳性单数 ein-家族词尾是 -em：mit meinem Bruder。" whyDe="mit verlangt Dativ; Maskulin Singular bei ein-Wörtern: mit meinem Bruder." />
    </div>
  )
}

const adjectiveEndings: Record<DeterminerType, Record<CaseKey, Record<Gender, string>>> = {
  definite: {
    nom: { m: 'e', f: 'e', n: 'e', pl: 'en' }, akk: { m: 'en', f: 'e', n: 'e', pl: 'en' },
    dat: { m: 'en', f: 'en', n: 'en', pl: 'en' }, gen: { m: 'en', f: 'en', n: 'en', pl: 'en' },
  },
  ein: {
    nom: { m: 'er', f: 'e', n: 'es', pl: 'en' }, akk: { m: 'en', f: 'e', n: 'es', pl: 'en' },
    dat: { m: 'en', f: 'en', n: 'en', pl: 'en' }, gen: { m: 'en', f: 'en', n: 'en', pl: 'en' },
  },
  none: {
    nom: { m: 'er', f: 'e', n: 'es', pl: 'e' }, akk: { m: 'en', f: 'e', n: 'es', pl: 'e' },
    dat: { m: 'em', f: 'er', n: 'em', pl: 'en' }, gen: { m: 'en', f: 'er', n: 'en', pl: 'er' },
  },
}

function determinerFor(type: DeterminerType, caseKey: CaseKey, gender: Gender) {
  if (type === 'definite') return definiteArticles[caseKey][gender]
  if (type === 'none') return ''
  return buildEinWord('mein', einEndings[caseKey][gender], gender)
}

function AdjectiveUnit({ mode }: { mode: LanguageMode }) {
  const [determiner, setDeterminer] = useState<DeterminerType>('ein')
  const [caseKey, setCaseKey] = useState<CaseKey>('nom')
  const [gender, setGender] = useState<Gender>('m')
  const ending = adjectiveEndings[determiner][caseKey][gender]
  const article = determinerFor(determiner, caseKey, gender)
  const phrase = `${article ? `${article} ` : ''}gut${ending} ${nounForms[caseKey][gender]}`
  const signalOwner = determiner === 'definite' ? 78 : determiner === 'ein' && !einEndings[caseKey][gender] ? 25 : determiner === 'ein' ? 62 : 5
  return (
    <div className="form-unit">
      <UnitLead mode={mode} badge="12 · ADJEKTIVENDUNGEN" zh="格信号是一场接力，不是三张孤立表" de="Das Kasussignal ist ein Staffellauf" introZh="冠词、形容词和名词共同承担信息。冠词信号清楚时，形容词多用 -e/-en；冠词缺席或零词尾时，形容词必须说得更多。" introDe="Artikel, Adjektiv und Nomen teilen sich die Information. Ist der Artikel deutlich, genügt oft -e/-en; fehlt sein Signal, übernimmt das Adjektiv mehr." />
      <div className="adjective-lab">
        <div className="form-control-stack">
          <fieldset><legend>{uiText(mode, '冠词环境', 'Artikelumgebung')}</legend><div className="determiner-buttons"><button type="button" className={determiner === 'definite' ? 'is-active' : ''} onClick={() => setDeterminer('definite')}>der-</button><button type="button" className={determiner === 'ein' ? 'is-active' : ''} onClick={() => setDeterminer('ein')}>mein-</button><button type="button" className={determiner === 'none' ? 'is-active' : ''} onClick={() => setDeterminer('none')}>Ø</button></div></fieldset>
          <fieldset><legend>{uiText(mode, '格', 'Kasus')}</legend><div className="chip-grid four">{(Object.keys(caseLabels) as CaseKey[]).map((key) => <button type="button" key={key} className={caseKey === key ? 'is-active' : ''} onClick={() => setCaseKey(key)}>{key.toUpperCase()}</button>)}</div></fieldset>
          <fieldset><legend>{uiText(mode, '性 / 数', 'Genus / Numerus')}</legend><div className="chip-grid four">{(Object.keys(genderLabels) as Gender[]).map((key) => <button type="button" key={key} className={gender === key ? 'is-active' : ''} onClick={() => setGender(key)}>{genderLabels[key].short}</button>)}</div></fieldset>
        </div>
        <div className="signal-relay">
          <span className="form-mini-label">SIGNAL-STAFFEL</span>
          <div className="relay-phrase" lang="de">{article && <span>{article}<small>Artikel</small></span>}<b>gut<em>{ending}</em><small>Adjektiv</small></b><span>{nounForms[caseKey][gender]}<small>Nomen</small></span></div>
          <div className="signal-meter"><div><i style={{ width: `${signalOwner}%` }} /><span>{uiText(mode, '冠词承担信号', 'Signal beim Artikel')}</span></div><div><i style={{ width: `${100 - signalOwner}%` }} /><span>{uiText(mode, '形容词承担信号', 'Signal beim Adjektiv')}</span></div></div>
          <strong className="relay-result" lang="de">{phrase}</strong>
        </div>
      </div>
      <div className="ending-map"><div className="ending-map-head"><span>{uiText(mode, '当前环境', 'Umgebung')}</span>{(Object.keys(genderLabels) as Gender[]).map((key) => <b key={key}>{genderLabels[key].short}</b>)}</div>{(Object.keys(caseLabels) as CaseKey[]).map((c) => <div className={c === caseKey ? 'is-current' : ''} key={c}><strong>{c.toUpperCase()}</strong>{(Object.keys(genderLabels) as Gender[]).map((g) => <span key={g}>-{adjectiveEndings[determiner][c][g]}</span>)}</div>)}</div>
      <FormQuiz mode={mode} prompt="Das ist ein gut___ Buch." options={['-e', '-en', '-er', '-es']} answer="-es" whyZh="ein 在中性主格是零词尾，格和性信号由形容词承担：ein gutes Buch。" whyDe="ein hat im Nominativ Neutrum eine Nullendung; das Adjektiv trägt das Signal: ein gutes Buch." />
    </div>
  )
}

const personalPronouns = [
  { person: '1. Sg.', nom: 'ich', akk: 'mich', dat: 'mir' }, { person: '2. Sg.', nom: 'du', akk: 'dich', dat: 'dir' },
  { person: '3. Sg. m', nom: 'er', akk: 'ihn', dat: 'ihm' }, { person: '3. Sg. f', nom: 'sie', akk: 'sie', dat: 'ihr' },
  { person: '3. Sg. n', nom: 'es', akk: 'es', dat: 'ihm' }, { person: '1. Pl.', nom: 'wir', akk: 'uns', dat: 'uns' },
  { person: '2. Pl.', nom: 'ihr', akk: 'euch', dat: 'euch' }, { person: '3. Pl. / höflich', nom: 'sie / Sie', akk: 'sie / Sie', dat: 'ihnen / Ihnen' },
]

function PronounsUnit({ mode }: { mode: LanguageMode }) {
  const [row, setRow] = useState(2)
  const selected = personalPronouns[row]
  return (
    <div className="form-unit">
      <UnitLead mode={mode} badge="13 · PRONOMEN" zh="代词把整组名词压缩成一个格信号" de="Pronomen komprimieren die ganze Nominalgruppe" introZh="人称代词的格变化必须整体记忆，因为很多形式不能从冠词机械推导。先掌握主格、宾格、与格，再把疑问和关系代词接入同一系统。" introDe="Personalpronomen müssen als Formenreihe gelernt werden. Beginne mit Nominativ, Akkusativ und Dativ; Frage- und Relativpronomen folgen demselben Kasusprinzip." />
      <div className="pronoun-lab">
        <div className="pronoun-table" role="grid" aria-label="人称代词核心表"><div className="pronoun-head"><span>Person</span><b>NOM</b><b>AKK</b><b>DAT</b></div>{personalPronouns.map((item, index) => <button type="button" key={item.person} className={row === index ? 'is-active' : ''} onClick={() => setRow(index)}><span>{item.person}</span><strong>{item.nom}</strong><strong>{item.akk}</strong><strong>{item.dat}</strong></button>)}</div>
        <aside className="pronoun-inspector"><Fingerprint size={28} /><span>{selected.person}</span><div><b className="case-nom">{selected.nom}<small>NOM</small></b><b className="case-akk">{selected.akk}<small>AKK</small></b><b className="case-dat">{selected.dat}<small>DAT</small></b></div><Bilingual mode={mode} zh="同一个指代对象进入不同句法插槽，代词形式随格改变。" de="Dasselbe Bezugswesen nimmt verschiedene Formen an, wenn es eine andere Kasusstelle besetzt." /></aside>
      </div>
      <div className="pronoun-cards">
        <article><h3>{uiText(mode, '疑问代词', 'Interrogativpronomen')}</h3><p lang="de"><b>wer</b> · wen · wem · wessen</p><Bilingual mode={mode} zh="四个问词本身就是格的替身；先确定支配关系，再选择问词。" de="Die Frageformen vertreten selbst einen Kasus. Erst die Rektion bestimmen, dann fragen." /></article>
        <article><h3>{uiText(mode, '指示代词', 'Demonstrativpronomen')}</h3><p lang="de">der · den · dem · dessen</p><Bilingual mode={mode} zh="独立使用的 der/die/das 往往重读，部分形式与定冠词相同，但指代功能更强。" de="Selbstständige der/die/das werden meist betont. Viele Formen ähneln dem Artikel." /></article>
        <article><h3>{uiText(mode, '关系代词预览', 'Relativpronomen')}</h3><p lang="de">der / den / dem / dessen<br />die / die / der / deren</p><Bilingual mode={mode} zh="性和数来自先行词，格由关系从句内部的动词或介词决定；阶段 5 会完整展开。" de="Genus und Numerus kommen vom Bezugswort, der Kasus aus dem Relativsatz. Mehr dazu in Phase 5." /></article>
      </div>
      <FormQuiz mode={mode} prompt="Ich sehe den Mann. → Ich sehe ___." options={['er', 'ihn', 'ihm', 'sein']} answer="ihn" whyZh="sehen 的对象是宾格；阳性第三人称单数宾格代词为 ihn。" whyDe="Das Objekt von sehen steht im Akkusativ; Maskulin 3. Person Singular: ihn." />
    </div>
  )
}

const nounPatterns = {
  mann: { label: 'der Mann', gender: 'm' as Gender, typeZh: '普通阳性', typeDe: 'starkes Maskulinum', forms: { nom: 'Mann', akk: 'Mann', dat: 'Mann', gen: 'Mannes' }, signal: { zh: '属格单数通常加 -s/-es；单音节词常用 -es。', de: 'Im Genitiv Singular steht meist -s/-es; einsilbige Wörter nehmen oft -es.' } },
  student: { label: 'der Student', gender: 'm' as Gender, typeZh: '弱变化阳性', typeDe: 'schwaches Maskulinum', forms: { nom: 'Student', akk: 'Studenten', dat: 'Studenten', gen: 'Studenten' }, signal: { zh: '除主格单数外都加 -n/-en：den/dem/des Studenten。', de: 'Außer im Nominativ Singular steht überall -n/-en: den/dem/des Studenten.' } },
  name: { label: 'der Name', gender: 'm' as Gender, typeZh: '特殊阳性', typeDe: 'Sonderform', forms: { nom: 'Name', akk: 'Namen', dat: 'Namen', gen: 'Namens' }, signal: { zh: 'Name 像弱变化名词，但属格用 Namens。', de: 'Name ähnelt der n-Deklination, hat im Genitiv aber Namens.' } },
  herz: { label: 'das Herz', gender: 'n' as Gender, typeZh: '特殊中性', typeDe: 'Sonderform', forms: { nom: 'Herz', akk: 'Herz', dat: 'Herzen', gen: 'Herzens' }, signal: { zh: 'Herz 是中性特殊词：与格可用 Herzen，属格 Herzens。', de: 'Herz ist ein besonderes Neutrum: Dativ Herzen, Genitiv Herzens.' } },
  kinder: { label: 'die Kinder', gender: 'pl' as Gender, typeZh: '复数与格', typeDe: 'Dativ Plural', forms: { nom: 'Kinder', akk: 'Kinder', dat: 'Kindern', gen: 'Kinder' }, signal: { zh: '复数与格通常补 -n；若复数本身以 -n/-s 结尾则不再添加。', de: 'Im Dativ Plural kommt meist -n hinzu; nicht nach einem Plural auf -n oder -s.' } },
} as const

type NounPattern = keyof typeof nounPatterns

function NounsUnit({ mode }: { mode: LanguageMode }) {
  const [nounKey, setNounKey] = useState<NounPattern>('student')
  const [caseKey, setCaseKey] = useState<CaseKey>('dat')
  const noun = nounPatterns[nounKey]
  const form = noun.forms[caseKey]
  return (
    <div className="form-unit">
      <UnitLead mode={mode} badge="14 · NOMENFORMEN" zh="别只盯冠词：名词自己也会留下痕迹" de="Auch das Nomen hinterlässt Kasusspuren" introZh="德语名词变化比冠词少，但几个规则非常关键：属格 -s/-es、复数与格 -n、弱变化阳性，以及少数特殊词。" introDe="Nomen verändern sich seltener als Artikel. Wichtig sind Genitiv -s/-es, Dativ Plural -n, schwache Maskulina und einige Sonderformen." />
      <div className="noun-lab">
        <div className="noun-selector" role="tablist" aria-label="选择名词类型">{(Object.keys(nounPatterns) as NounPattern[]).map((key) => <button type="button" role="tab" aria-selected={nounKey === key} className={nounKey === key ? 'is-active' : ''} key={key} onClick={() => setNounKey(key)}><strong>{nounPatterns[key].label}</strong><span>{uiText(mode, nounPatterns[key].typeZh, nounPatterns[key].typeDe)}</span></button>)}</div>
        <div className="noun-case-stage">
          <div className="noun-case-buttons">{(Object.keys(caseLabels) as CaseKey[]).map((key) => <button type="button" key={key} className={caseKey === key ? 'is-active' : ''} aria-pressed={caseKey === key} onClick={() => setCaseKey(key)}>{key.toUpperCase()}<small>{caseLabels[key].question}</small></button>)}</div>
          <div className="noun-output" aria-live="polite"><span>{caseLabels[caseKey].de}</span><strong lang="de">{definiteArticles[caseKey][noun.gender]} {form}</strong><i>{noun.label} → {definiteArticles[caseKey][noun.gender]} {form}</i></div>
          <Bilingual mode={mode} zh={noun.signal.zh} de={noun.signal.de} />
        </div>
      </div>
      <div className="noun-rule-cards"><article><Tags size={20} /><strong>Genitiv Singular</strong><p lang="de">des Kind<b>es</b> · des Auto<b>s</b></p></article><article><Tags size={20} /><strong>Dativ Plural</strong><p lang="de">mit den Kinder<b>n</b> · mit den Auto<b>s</b></p></article><article><Tags size={20} /><strong>n-Deklination</strong><p lang="de">der Student · den Student<b>en</b></p></article><article><Tags size={20} /><strong>Dativ-e erkennen</strong><p lang="de">zu Haus<b>e</b> · im Jahr<b>e</b> 2026</p></article></div>
      <div className="rare-note"><Puzzle size={21} /><Bilingual mode={mode} zh="Dativ-e 主要保留在固定表达或较正式、文学性的语言中。初学阶段只需能识别，不必主动套用。" de="Das Dativ-e lebt vor allem in festen Wendungen und gehobener Sprache. Erkennen genügt; produktiv verwenden musst du es zunächst nicht." /></div>
      <FormQuiz mode={mode} prompt="Ich spreche mit den Kind___." options={['-', '-e', '-en', '-ern']} answer="-ern" whyZh="Kinder 的复数与格在词尾补 -n，完整形式是 Kindern；这里相对词干 Kind 显示为 -ern。" whyDe="Der Dativ Plural von Kinder erhält -n: Kindern; bezogen auf den Stamm Kind ist die sichtbare Endung -ern." />
    </div>
  )
}

export function FormsSection({ mode, activeUnit, onUnitChange, onNextPhase }: { mode: LanguageMode; activeUnit: Stage4Unit; onUnitChange: (unit: Stage4Unit) => void; onNextPhase?: () => void }) {
  return (
    <section id="forms" className="forms-section" aria-labelledby="forms-title">
      <div className="section-shell">
        <div className="section-kicker"><Layers3 size={17} /> PHASE 4 · FORMEN ERKENNEN</div>
        <div className="forms-heading"><div><h2 id="forms-title">{uiText(mode, '一个格，怎样写在词上？', 'Wie wird Kasus am Wort sichtbar?')}</h2><Bilingual mode={mode} zh="这一阶段把名词短语拆成四层信号：冠词、ein-家族、形容词、代词与名词自身。重点不是死背，而是谁在当前短语里承担信息。" de="Diese Phase zerlegt die Nominalgruppe in ihre Formsignale: Artikel, ein-Wörter, Adjektive, Pronomen und das Nomen selbst. Entscheidend ist, wer die Information trägt." /></div></div>
        <div className="form-tabs" role="tablist" aria-label="阶段 4 学习单元">{(Object.keys(formMeta) as Stage4Unit[]).map((key) => <button type="button" role="tab" aria-selected={activeUnit === key} className={activeUnit === key ? 'is-active' : ''} key={key} onClick={() => onUnitChange(key)}><span>{formMeta[key].number}</span><strong>{uiText(mode, formMeta[key].zh, formMeta[key].de)}</strong><small>{formMeta[key].code}</small></button>)}</div>
        <div className="forms-paper" role="tabpanel" key={activeUnit}>
          {activeUnit === 'articles' && <ArticleMatrix mode={mode} />}
          {activeUnit === 'ein-words' && <EinWordsUnit mode={mode} />}
          {activeUnit === 'adjectives' && <AdjectiveUnit mode={mode} />}
          {activeUnit === 'pronouns' && <PronounsUnit mode={mode} />}
          {activeUnit === 'nouns' && <NounsUnit mode={mode} />}
        </div>
        <PhaseActions mode={mode} tabsSelector=".form-tabs" showNext={activeUnit === 'nouns'} nextZh="进入阶段 5：句子综合" nextDe="Weiter zu Phase 5: Im ganzen Satz" onNext={onNextPhase} />
      </div>
    </section>
  )
}
