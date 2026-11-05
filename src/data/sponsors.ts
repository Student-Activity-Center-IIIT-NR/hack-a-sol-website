/**
 * src/data/sponsors.ts
 * Placeholder sponsor list for the Operative ID card.
 *
 * To use real sponsors: set `src` to the logo file (PNG/SVG, transparent or white
 * background, ideally landscape). Keep original brand colours — the card's partner
 * strip has a light metallic backing so full-colour logos stay clearly visible.
 *
 * NOTE: for the PNG export, `src` images must be same-origin (e.g. in /public or
 * imported from /src/assets) or served with CORS headers, otherwise the browser
 * will block them from being drawn into the exported image.
 */

export interface Sponsor {
  id: string
  name: string
  /** Real logo URL. When omitted, a coloured placeholder logo is drawn. */
  src?: string
  /** Placeholder brand colour (ignored when `src` is set). */
  color: string
  /** Placeholder mark shape (ignored when `src` is set). */
  mark: 'hex' | 'ring' | 'bars' | 'tri'
}

export const SPONSORS: Sponsor[] = [
  { id: 'sp1', name: 'NOVAEDGE', color: '#f26a1b', mark: 'hex' },
  { id: 'sp2', name: 'QUANTIX',  color: '#12a150', mark: 'bars' },
  { id: 'sp3', name: 'ORBITAL',  color: '#7a3cff', mark: 'ring' },
  { id: 'sp4', name: 'BLUEPEAK', color: '#0a6cff', mark: 'tri' },
]