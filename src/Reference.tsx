import { BookMarked, BookOpen, Search, Star, Tags, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

type LanguageMode = 'both' | 'zh' | 'de'
type ReferenceCategory = 'forms' | 'regents' | 'nouns' | 'contrast' | 'glossary' | 'favorites'

function uiText(mode: LanguageMode, zh: string, de: string) {
  if (mode === 'zh') return zh
  if (mode === 'de') return de
  return `${zh} · ${de}`
}

function Bilingual({ mode, zh, de, className = '' }: { mode: LanguageMode; zh: string; de: string; className?: string }) {
  return <div className={`bilingual ${className}`.trim()}>{mode !== 'de' && <p className="copy-zh">{zh}</p>}{mode !== 'zh' && <p className="copy-de" lang="de">{de}</p>}</div>
}

type ReferenceEntry = {
  id: string
  category: Exclude<ReferenceCategory, 'favorites'>
  titleZh: string
  titleDe: string
  summaryZh: string
  summaryDe: string
  example: string
  tags: string[]
  keywords: string
}

const entries: ReferenceEntry[] = [
  { id: 'def-article', category: 'forms', titleZh: '定冠词', titleDe: 'Bestimmter Artikel', summaryZh: 'der/die/das/die 按格、性和数变化；阳性单数最适合替换测试。', summaryDe: 'Artikel zeigen Kasus, Genus und Numerus; Maskulin Singular eignet sich gut als Probe.', example: 'der → den → dem → des', tags: ['NOM', 'AKK', 'DAT', 'GEN'], keywords: '冠词 artikel der die das den dem des matrix' },
  { id: 'ein-family', category: 'forms', titleZh: 'ein-家族', titleDe: 'ein-Wörter', summaryZh: 'ein、kein 和物主词共用一套词尾；零词尾会把信号交给形容词。', summaryDe: 'ein, kein und Possessivartikel teilen ein Endungsmuster; Nullendungen geben das Signal weiter.', example: 'mein guter Mann · meinem guten Mann', tags: ['Artikel', 'Endung'], keywords: 'ein kein mein dein sein ihr unser euer 词尾' },
  { id: 'adjective', category: 'forms', titleZh: '形容词词尾', titleDe: 'Adjektivendungen', summaryZh: '冠词信号清楚时多用 -e/-en；无冠词时形容词承担更多信息。', summaryDe: 'Nach deutlichem Artikel meist -e/-en; ohne Artikel trägt das Adjektiv mehr Information.', example: 'der gute · ein guter · guter Wein', tags: ['-e', '-en', 'stark'], keywords: '形容词 adjektiv stark schwach gemischt e en er es em' },
  { id: 'pronouns', category: 'forms', titleZh: '人称代词', titleDe: 'Personalpronomen', summaryZh: '代词形式需要按人称和格整体记忆。', summaryDe: 'Pronomenformen werden nach Person und Kasus als Reihe gelernt.', example: 'er → ihn → ihm', tags: ['NOM', 'AKK', 'DAT'], keywords: '代词 pronomen ich mich mir er ihn ihm sie ihr' },
  { id: 'akk-preps', category: 'regents', titleZh: '固定宾格介词', titleDe: 'Akkusativpräpositionen', summaryZh: '这些介词后的名词短语固定使用宾格。', summaryDe: 'Diese Präpositionen regieren fest den Akkusativ.', example: 'durch · für · gegen · ohne · um', tags: ['AKK'], keywords: '介词 präposition akkusativ durch für gegen ohne um' },
  { id: 'dat-preps', category: 'regents', titleZh: '固定与格介词', titleDe: 'Dativpräpositionen', summaryZh: '可用“从、除、在、和、后、自、由、到”作为中文记忆线索。', summaryDe: 'Diese häufigen Präpositionen regieren den Dativ.', example: 'aus · außer · bei · mit · nach · seit · von · zu', tags: ['DAT'], keywords: '介词 präposition dativ aus außer bei mit nach seit von zu' },
  { id: 'gen-preps', category: 'regents', titleZh: '常用属格介词', titleDe: 'Genitivpräpositionen', summaryZh: '书面语中常见 wegen、trotz、während、außerhalb。', summaryDe: 'In der Standardsprache häufig mit Genitiv: wegen, trotz, während, außerhalb.', example: 'wegen des Regens', tags: ['GEN'], keywords: '属格介词 genitiv wegen trotz während außerhalb' },
  { id: 'verb-patterns', category: 'regents', titleZh: '动词句型', titleDe: 'Verbvalenz', summaryZh: '把动词连同占位符一起记，格就成为词汇的一部分。', summaryDe: 'Lerne Verben mit ihren Platzhaltern; der Kasus gehört zum Wortschatz.', example: 'jemanden sehen · jemandem helfen · jemandem etwas geben', tags: ['Verb', 'AKK', 'DAT'], keywords: '动词 verb sehen helfen geben valenz 句型' },
  { id: 'gen-s', category: 'nouns', titleZh: '属格 -s/-es', titleDe: 'Genitiv -s/-es', summaryZh: '阳性和中性单数属格通常在名词后加 -s 或 -es。', summaryDe: 'Maskuline und neutrale Nomen erhalten im Genitiv Singular meist -s oder -es.', example: 'des Kindes · des Autos', tags: ['GEN'], keywords: '名词 nomen genitiv s es kindes autos' },
  { id: 'dat-plural', category: 'nouns', titleZh: '复数与格 -n', titleDe: 'Dativ Plural -n', summaryZh: '复数与格通常补 -n；以 -n 或 -s 结尾的复数不再添加。', summaryDe: 'Im Dativ Plural steht meist -n, außer nach Pluralformen auf -n oder -s.', example: 'den Kindern · den Autos', tags: ['DAT', 'Plural'], keywords: '复数与格 dativ plural n kindern autos' },
  { id: 'n-declension', category: 'nouns', titleZh: '弱变化阳性', titleDe: 'n-Deklination', summaryZh: '除主格单数外，Student 等阳性名词通常加 -n/-en。', summaryDe: 'Schwache Maskulina tragen außer im Nominativ Singular meist -n/-en.', example: 'der Student · den Studenten', tags: ['Maskulin', '-en'], keywords: '弱变化 n deklination student mensch junge' },
  { id: 'special-nouns', category: 'nouns', titleZh: 'Name 与 Herz', titleDe: 'Sonderformen Name und Herz', summaryZh: 'Name 的属格是 Namens；Herz 可出现 Herzen、Herzens。', summaryDe: 'Name hat Namens im Genitiv; Herz zeigt Herzen und Herzens.', example: 'des Namens · dem Herzen · des Herzens', tags: ['Sonderform'], keywords: 'name namens herz herzen herzens 特殊名词' },
  { id: 'movement', category: 'contrast', titleZh: '运动不等于宾格', titleDe: 'Bewegung ist nicht automatisch Akkusativ', summaryZh: '双向介词先区分所在位置 Wo? 与目标方向 Wohin?。', summaryDe: 'Bei Wechselpräpositionen entscheidet Ort (Wo?) gegen Zielrichtung (Wohin?).', example: 'im Park laufen · in den Park laufen', tags: ['DAT', 'AKK'], keywords: '双向介词 wechselpräposition wo wohin movement 位置方向' },
  { id: 'same-form', category: 'contrast', titleZh: '同形不等于同格', titleDe: 'Gleiche Form, anderer Kasus', summaryZh: 'die Frau、das Kind 等形式可能同时属于主格和宾格，必须看关系。', summaryDe: 'Formen wie die Frau oder das Kind können Nominativ oder Akkusativ sein.', example: 'Die Frau sieht das Kind. · Das Kind sieht die Frau.', tags: ['NOM', 'AKK'], keywords: '同形 主格 宾格 gleiche form nominativ akkusativ' },
  { id: 'word-order', category: 'contrast', titleZh: '格不由位置决定', titleDe: 'Kasus ist keine Position', summaryZh: '语序有倾向，但格角色来自支配关系和形式。', summaryDe: 'Wortstellung hat Tendenzen; Kasusrollen kommen aus Rektion und Form.', example: 'dem Kind das Buch · es dem Kind · es ihm', tags: ['Wortstellung'], keywords: '语序 word order dativ akkusativ pronomen' },
  { id: 'passive', category: 'contrast', titleZh: '被动中的格迁移', titleDe: 'Kasus im Passiv', summaryZh: '宾格对象升为主格；与格保持不变。', summaryDe: 'Das Akkusativobjekt wird Nominativ; ein Dativobjekt bleibt Dativ.', example: 'Den Satz → Der Satz · dem Schüler bleibt DAT', tags: ['Passiv', 'NOM', 'DAT'], keywords: '被动 passiv aktiv akkusativ nominativ dativ' },
  { id: 'term-kasus', category: 'glossary', titleZh: '格', titleDe: 'Kasus', summaryZh: '名词短语或代词在句法关系中的语法属性。', summaryDe: 'Grammatische Eigenschaft einer Nominalgruppe oder eines Pronomens im Satz.', example: 'Nominativ · Akkusativ · Dativ · Genitiv', tags: ['术语'], keywords: '格 kasus fall 术语' },
  { id: 'term-rektion', category: 'glossary', titleZh: '支配', titleDe: 'Rektion', summaryZh: '动词、介词等要求搭配成分使用特定格的关系。', summaryDe: 'Eigenschaft von Verben oder Präpositionen, einen bestimmten Kasus zu verlangen.', example: 'mit + Dativ · sehen + Akkusativ', tags: ['术语'], keywords: '支配 rektion regieren 术语' },
  { id: 'term-valency', category: 'glossary', titleZh: '配价', titleDe: 'Valenz', summaryZh: '动词为句子成分打开多少、什么类型的插槽。', summaryDe: 'Anzahl und Art der Stellen, die ein Verb für Satzglieder öffnet.', example: 'geben: NOM + DAT + AKK', tags: ['术语'], keywords: '配价 valenz 插槽 术语' },
  { id: 'term-antecedent', category: 'glossary', titleZh: '先行词', titleDe: 'Bezugswort', summaryZh: '关系代词所指向的名词；提供性和数。', summaryDe: 'Nomen, auf das sich ein Relativpronomen bezieht; liefert Genus und Numerus.', example: 'die Frau, mit der ...', tags: ['Relativsatz'], keywords: '先行词 bezugswort antecedent 关系从句' },
  { id: 'term-attribut', category: 'glossary', titleZh: '名词属性', titleDe: 'Attribut', summaryZh: '进一步限定名词的成分，例如属格短语。', summaryDe: 'Bestimmung, die ein Nomen näher beschreibt, etwa eine Genitivgruppe.', example: 'das Buch des Professors', tags: ['GEN'], keywords: '属性 attribut genitivattribut 修饰' },
]

const categoryMeta: Record<ReferenceCategory, { zh: string; de: string }> = {
  forms: { zh: '词形矩阵', de: 'Formen' },
  regents: { zh: '支配关系', de: 'Regenten' },
  nouns: { zh: '名词变化', de: 'Nomen' },
  contrast: { zh: '易混对照', de: 'Kontraste' },
  glossary: { zh: '术语表', de: 'Glossar' },
  favorites: { zh: '我的收藏', de: 'Favoriten' },
}

const matrixData = {
  articles: { labelZh: '定冠词', labelDe: 'Artikel', rows: [['NOM','der','die','das','die'],['AKK','den','die','das','die'],['DAT','dem','der','dem','den'],['GEN','des','der','des','der']] },
  ein: { labelZh: 'ein-词尾', labelDe: 'ein-Endungen', rows: [['NOM','∅','-e','∅','-e'],['AKK','-en','-e','∅','-e'],['DAT','-em','-er','-em','-en'],['GEN','-es','-er','-es','-er']] },
  adjective: { labelZh: '定冠词后形容词', labelDe: 'Adjektiv nach der-', rows: [['NOM','-e','-e','-e','-en'],['AKK','-en','-e','-e','-en'],['DAT','-en','-en','-en','-en'],['GEN','-en','-en','-en','-en']] },
  pronouns: { labelZh: '第三人称代词', labelDe: 'Pronomen 3. Person', rows: [['NOM','er','sie','es','sie'],['AKK','ihn','sie','es','sie'],['DAT','ihm','ihr','ihm','ihnen']] },
} as const
type MatrixKey = keyof typeof matrixData

function QuickMatrix({ mode }: { mode: LanguageMode }) {
  const [matrix, setMatrix] = useState<MatrixKey>('articles')
  return <section className="quick-matrix" aria-labelledby="quick-matrix-title"><div><span>FORMEN-MATRIX</span><h3 id="quick-matrix-title">{uiText(mode, matrixData[matrix].labelZh, matrixData[matrix].labelDe)}</h3></div><div className="matrix-switch" role="tablist">{(Object.keys(matrixData) as MatrixKey[]).map((key) => <button type="button" role="tab" aria-selected={matrix === key} className={matrix === key ? 'is-active' : ''} key={key} onClick={() => setMatrix(key)}>{uiText(mode, matrixData[key].labelZh, matrixData[key].labelDe)}</button>)}</div><div className="reference-matrix"><div className="reference-matrix-head"><span>KASUS</span><b>M</b><b>F</b><b>N</b><b>PL</b></div>{matrixData[matrix].rows.map((row) => <div key={row[0]}><strong>{row[0]}</strong>{row.slice(1).map((cell, index) => <span key={`${cell}-${index}`}>{cell}</span>)}</div>)}</div></section>
}

export function ReferenceSection({ mode }: { mode: LanguageMode }) {
  const [category, setCategory] = useState<ReferenceCategory>('forms')
  const [query, setQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>(() => {
    try { return JSON.parse(window.localStorage.getItem('kasuslabor-favorites') ?? '[]') } catch { return [] }
  })

  useEffect(() => { window.localStorage.setItem('kasuslabor-favorites', JSON.stringify(favorites)) }, [favorites])

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase()
    return entries.filter((entry) => {
      const categoryMatch = normalized ? true : category === 'favorites' ? favorites.includes(entry.id) : entry.category === category
      if (!categoryMatch) return false
      if (!normalized) return true
      return `${entry.titleZh} ${entry.titleDe} ${entry.summaryZh} ${entry.summaryDe} ${entry.example} ${entry.keywords} ${entry.tags.join(' ')}`.toLocaleLowerCase().includes(normalized)
    })
  }, [category, favorites, query])

  const toggleFavorite = (id: string) => setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])

  return <section id="reference" className="reference-section" aria-labelledby="reference-title"><div className="section-shell"><div className="section-kicker"><BookMarked size={17} /> SCHNELLZUGRIFF · WIEDERHOLUNG</div><div className="reference-heading"><div><h2 id="reference-title">{uiText(mode, '需要什么，就直接找到什么', 'Finde genau das, was du jetzt brauchst')}</h2><Bilingual mode={mode} zh="这是独立于学习主线的速查台。按主题浏览，或输入中文、德语、例句和格名称搜索；星标内容只保存在本机浏览器。" de="Dieser Schnellzugriff steht neben dem Lernpfad. Suche auf Chinesisch oder Deutsch, nach Beispiel oder Kasus; Favoriten bleiben nur in diesem Browser." /></div><span>{filtered.length} TREFFER</span></div><div className="reference-search"><Search size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={uiText(mode, '搜索：mit、宾格、弱变化、关系代词……', 'Suchen: mit, Akkusativ, n-Deklination ...')} aria-label={uiText(mode, '搜索速查内容', 'Schnellzugriff durchsuchen')} />{query && <button type="button" onClick={() => setQuery('')} aria-label={uiText(mode, '清空搜索', 'Suche löschen')}><X size={18} /></button>}</div><div className="reference-tabs" role="tablist" aria-label={uiText(mode, '速查分类', 'Kategorien')}>{(Object.keys(categoryMeta) as ReferenceCategory[]).map((key) => <button type="button" role="tab" aria-selected={!query && category === key} className={!query && category === key ? 'is-active' : ''} key={key} onClick={() => { setCategory(key); setQuery('') }}>{key === 'favorites' && <Star size={15} fill={favorites.length ? 'currentColor' : 'none'} />}<span>{uiText(mode, categoryMeta[key].zh, categoryMeta[key].de)}</span>{key === 'favorites' && <small>{favorites.length}</small>}</button>)}</div>{!query && category === 'forms' && <QuickMatrix mode={mode} />}<div className="reference-results" aria-live="polite">{filtered.map((entry) => <article key={entry.id} className="reference-card"><div className="reference-card-top"><span>{uiText(mode, categoryMeta[entry.category].zh, categoryMeta[entry.category].de)}</span><button type="button" className={favorites.includes(entry.id) ? 'is-favorite' : ''} aria-pressed={favorites.includes(entry.id)} aria-label={uiText(mode, favorites.includes(entry.id) ? '取消收藏' : '收藏', favorites.includes(entry.id) ? 'Favorit entfernen' : 'Als Favorit speichern')} onClick={() => toggleFavorite(entry.id)}><Star size={18} fill={favorites.includes(entry.id) ? 'currentColor' : 'none'} /></button></div><h3>{uiText(mode, entry.titleZh, entry.titleDe)}</h3><Bilingual mode={mode} zh={entry.summaryZh} de={entry.summaryDe} /><p lang="de">{entry.example}</p><div>{entry.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></article>)}{filtered.length === 0 && <div className="reference-empty"><BookOpen size={32} /><strong>{uiText(mode, category === 'favorites' ? '还没有收藏内容' : '没有找到匹配项', category === 'favorites' ? 'Noch keine Favoriten' : 'Keine Treffer')}</strong><Bilingual mode={mode} zh={category === 'favorites' ? '在任意速查卡片右上角点击星标，即可保存在这里。' : '试试更短的关键词，例如 mit、Dativ、词尾或关系代词。'} de={category === 'favorites' ? 'Klicke auf den Stern einer Karte, um sie hier zu speichern.' : 'Versuche ein kürzeres Stichwort wie mit, Dativ, Endung oder Relativpronomen.'} /></div>}</div><button type="button" className="reference-to-top" onClick={() => document.querySelector('.reference-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><Tags size={17} />{uiText(mode, '回到速查分类', 'Zurück zu den Kategorien')}</button></div></section>
}
