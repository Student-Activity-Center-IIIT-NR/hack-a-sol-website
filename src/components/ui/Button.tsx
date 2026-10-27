/**
 * src/components/ui/Button.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Primary and ghost buttons matching the Hero style.
 *   primary: red bg, 48px tall, mono 0.8rem, letter-spacing 0.24em, soft glow
 *   ghost:   text link with underline
 */

import '../../styles/marvel-ui.css'
import type { ReactNode, MouseEventHandler, CSSProperties } from 'react'

interface BaseProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'ghost'
  id?: string
  style?: CSSProperties
  /** Magnetic button attribute */
  'data-magnetic'?: boolean
}

type AnchorProps = BaseProps & {
  href: string
  target?: string
  rel?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
  onMouseEnter?: MouseEventHandler<HTMLAnchorElement>
  onMouseLeave?: MouseEventHandler<HTMLAnchorElement>
}

type ButtonElProps = BaseProps & {
  href?: undefined
  onClick?: MouseEventHandler<HTMLButtonElement>
  onMouseEnter?: MouseEventHandler<HTMLButtonElement>
  onMouseLeave?: MouseEventHandler<HTMLButtonElement>
  type?: 'button' | 'submit' | 'reset'
}

type ButtonProps = AnchorProps | ButtonElProps

export function Button({
  variant = 'primary',
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const cls = variant === 'ghost'
    ? `mu-btn-ghost ${className}`
    : `mu-btn ${className}`

  if ('href' in rest && rest.href !== undefined) {
    const {
      href, target, rel, id, style,
      onClick, onMouseEnter, onMouseLeave,
      'data-magnetic': dataMagnetic,
    } = rest as AnchorProps
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        id={id}
        style={style}
        className={cls}
        data-magnetic={dataMagnetic ? '' : undefined}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </a>
    )
  }

  const {
    onClick, onMouseEnter, onMouseLeave,
    type = 'button', id, style,
    'data-magnetic': dataMagnetic,
  } = rest as ButtonElProps
  return (
    <button
      type={type}
      id={id}
      style={style}
      className={cls}
      data-magnetic={dataMagnetic ? '' : undefined}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </button>
  )
}
