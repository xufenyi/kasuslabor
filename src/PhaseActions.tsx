import { ArrowRight, ArrowUp } from 'lucide-react'

type LanguageMode = 'both' | 'zh' | 'de'

function uiText(mode: LanguageMode, zh: string, de: string) {
  if (mode === 'zh') return zh
  if (mode === 'de') return de
  return `${zh} · ${de}`
}

export function PhaseActions({
  mode,
  tabsSelector,
  showNext,
  nextZh,
  nextDe,
  onNext,
}: {
  mode: LanguageMode
  tabsSelector: string
  showNext: boolean
  nextZh: string
  nextDe: string
  onNext?: () => void
}) {
  const returnToTabs = () => {
    document.querySelector(tabsSelector)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="phase-actions" aria-label={uiText(mode, '阶段导航', 'Phasennavigation')}>
      <button type="button" className="phase-return" onClick={returnToTabs}>
        <ArrowUp size={18} />
        <span>{uiText(mode, '回到本阶段单元标签', 'Zu den Einheiten dieser Phase')}</span>
      </button>
      {showNext && onNext && (
        <button type="button" className="phase-next" onClick={onNext}>
          <span>{uiText(mode, nextZh, nextDe)}</span>
          <ArrowRight size={18} />
        </button>
      )}
    </nav>
  )
}
