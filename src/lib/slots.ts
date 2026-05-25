/**
 * Named placement slots — map editorial positions across every page.
 *
 * Section grid layout (4-column, per the reference design):
 *
 *   ┌──────────┬──────────────────────┬──────────┐
 *   │ cover-1  │                      │ cover-2  │
 *   │  (TL)    │   cover  (2×2 big)   │  (TR)    │
 *   ├──────────┤                      ├──────────┤
 *   │ cover-3  │                      │ cover-4  │
 *   │  (ML)    │                      │  (MR)    │
 *   ├──────────┼──────────┬───────────┼──────────┤
 *   │ cover-5  │ cover-6  │  cover-7  │ cover-8  │
 *   │  (BL)    │  (BM)    │  (BMR)    │  (BR)    │
 *   └──────────┴──────────┴───────────┴──────────┘
 *
 * Each section also has a single "Article" slot ({section}.article).
 * Unlike cover slots (exclusive — one article per slot), the article slot is
 * NON-EXCLUSIVE: multiple articles can share placement = '{section}.article'.
 * They appear as a paginated normal-card feed below the cover grid.
 */

export type SlotId =
  // ── Homepage ──────────────────────────────────────────────────
  | 'homepage.hero'
  | 'homepage.lead'
  | 'homepage.editors-pick'
  | 'homepage.featured-1'
  | 'homepage.featured-2'
  | 'homepage.featured-3'
  | 'homepage.featured-4'
  | 'homepage.rail-1'
  | 'homepage.rail-2'
  | 'homepage.rail-3'
  | 'homepage.latest-1'
  | 'homepage.latest-2'
  | 'homepage.latest-3'
  | 'homepage.latest-4'
  // ── Tech ──────────────────────────────────────────────────────
  | 'tech.cover'
  | 'tech.cover-1'
  | 'tech.cover-2'
  | 'tech.cover-3'
  | 'tech.cover-4'
  | 'tech.cover-5'
  | 'tech.cover-6'
  | 'tech.cover-7'
  | 'tech.cover-8'
  | 'tech.article'
  // ── Culture ───────────────────────────────────────────────────
  | 'culture.cover'
  | 'culture.cover-1'
  | 'culture.cover-2'
  | 'culture.cover-3'
  | 'culture.cover-4'
  | 'culture.cover-5'
  | 'culture.cover-6'
  | 'culture.cover-7'
  | 'culture.cover-8'
  | 'culture.article'
  // ── Fashion ───────────────────────────────────────────────────
  | 'fashion.cover'
  | 'fashion.cover-1'
  | 'fashion.cover-2'
  | 'fashion.cover-3'
  | 'fashion.cover-4'
  | 'fashion.cover-5'
  | 'fashion.cover-6'
  | 'fashion.cover-7'
  | 'fashion.cover-8'
  | 'fashion.article'
  // ── Show-Business ─────────────────────────────────────────────
  | 'showbusiness.cover'
  | 'showbusiness.cover-1'
  | 'showbusiness.cover-2'
  | 'showbusiness.cover-3'
  | 'showbusiness.cover-4'
  | 'showbusiness.cover-5'
  | 'showbusiness.cover-6'
  | 'showbusiness.cover-7'
  | 'showbusiness.cover-8'
  | 'showbusiness.article'
  // ── Leaders Stories (3 editorially-pinned articles + feed) ──────────
  | 'leaders.pin-1'
  | 'leaders.pin-2'
  | 'leaders.pin-3'
  | 'leaders.article'

export type Slot = {
  id: SlotId
  label: string
  page: string
  description: string
  /** true = only one article may hold this slot at a time (default). false = shared. */
  exclusive: boolean
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function surroundingSlots(section: string, page: string): Slot[] {
  const positions: [string, string][] = [
    ['cover-1', 'Top-left corner (Row 1, Col 1)'],
    ['cover-2', 'Top-right corner (Row 1, Col 4)'],
    ['cover-3', 'Middle-left (Row 2, Col 1)'],
    ['cover-4', 'Middle-right (Row 2, Col 4)'],
    ['cover-5', 'Bottom-left (Row 3, Col 1)'],
    ['cover-6', 'Bottom centre-left (Row 3, Col 2)'],
    ['cover-7', 'Bottom centre-right (Row 3, Col 3)'],
    ['cover-8', 'Bottom-right corner (Row 3, Col 4)'],
  ]
  return positions.map(([key, desc], i) => ({
    id: `${section}.${key}` as SlotId,
    label: `Cover ${i + 1}`,
    page,
    description: desc,
    exclusive: true,
  }))
}

export const SLOTS: Slot[] = [
  // ── Homepage ──────────────────────────────────────────────────
  {
    id: 'homepage.hero',
    label: 'Hero',
    page: 'Homepage',
    exclusive: true,
    description: 'Full-bleed hero at the top of the homepage',
  },
  {
    id: 'homepage.lead',
    label: 'Lead Story',
    page: 'Homepage',
    exclusive: true,
    description: 'Large lead article in the Featured Coverage section',
  },
  {
    id: 'homepage.editors-pick',
    label: "Editor's Pick",
    page: 'Homepage',
    exclusive: true,
    description: "Editor's curated choice — dark full-width section on homepage",
  },
  {
    id: 'homepage.featured-1',
    label: 'Featured Story 1',
    page: 'Homepage',
    exclusive: true,
    description: 'First card in the Featured Stories grid (Curated Selection)',
  },
  {
    id: 'homepage.featured-2',
    label: 'Featured Story 2',
    page: 'Homepage',
    exclusive: true,
    description: 'Second card in the Featured Stories grid (Curated Selection)',
  },
  {
    id: 'homepage.featured-3',
    label: 'Featured Story 3',
    page: 'Homepage',
    exclusive: true,
    description: 'Third card in the Featured Stories grid (Curated Selection)',
  },
  {
    id: 'homepage.featured-4',
    label: 'Featured Story 4',
    page: 'Homepage',
    exclusive: true,
    description: 'Fourth card in the Featured Stories grid (Curated Selection)',
  },
  {
    id: 'homepage.rail-1',
    label: 'Rail Article 1',
    page: 'Homepage',
    exclusive: true,
    description: 'First article in the side rail beside the Lead Story',
  },
  {
    id: 'homepage.rail-2',
    label: 'Rail Article 2',
    page: 'Homepage',
    exclusive: true,
    description: 'Second article in the side rail beside the Lead Story',
  },
  {
    id: 'homepage.rail-3',
    label: 'Rail Article 3',
    page: 'Homepage',
    exclusive: true,
    description: 'Third article in the side rail beside the Lead Story',
  },
  {
    id: 'homepage.latest-1',
    label: 'Latest Article 1',
    page: 'Homepage',
    exclusive: true,
    description: 'First card in the Latest Articles row at the bottom of the homepage',
  },
  {
    id: 'homepage.latest-2',
    label: 'Latest Article 2',
    page: 'Homepage',
    exclusive: true,
    description: 'Second card in the Latest Articles row at the bottom of the homepage',
  },
  {
    id: 'homepage.latest-3',
    label: 'Latest Article 3',
    page: 'Homepage',
    exclusive: true,
    description: 'Third card in the Latest Articles row at the bottom of the homepage',
  },
  {
    id: 'homepage.latest-4',
    label: 'Latest Article 4',
    page: 'Homepage',
    exclusive: true,
    description: 'Fourth card in the Latest Articles row at the bottom of the homepage',
  },

  // ── Tech ──────────────────────────────────────────────────────
  {
    id: 'tech.cover',
    label: 'Cover',
    page: 'Tech',
    exclusive: true,
    description: 'Centre feature — large 2×2 image with overlay text',
  },
  ...surroundingSlots('tech', 'Tech'),
  {
    id: 'tech.article',
    label: 'Article',
    page: 'Tech',
    exclusive: false,
    description: 'Normal article card in the Tech feed — multiple articles share this slot',
  },

  // ── Culture ───────────────────────────────────────────────────
  {
    id: 'culture.cover',
    label: 'Cover',
    page: 'Culture',
    exclusive: true,
    description: 'Centre feature — large 2×2 image with overlay text',
  },
  ...surroundingSlots('culture', 'Culture'),
  {
    id: 'culture.article',
    label: 'Article',
    page: 'Culture',
    exclusive: false,
    description: 'Normal article card in the Culture feed — multiple articles share this slot',
  },

  // ── Fashion ───────────────────────────────────────────────────
  {
    id: 'fashion.cover',
    label: 'Cover',
    page: 'Fashion',
    exclusive: true,
    description: 'Centre feature — large 2×2 image with overlay text',
  },
  ...surroundingSlots('fashion', 'Fashion'),
  {
    id: 'fashion.article',
    label: 'Article',
    page: 'Fashion',
    exclusive: false,
    description: 'Normal article card in the Fashion feed — multiple articles share this slot',
  },

  // ── Show-Business ─────────────────────────────────────────────
  {
    id: 'showbusiness.cover',
    label: 'Cover',
    page: 'Show-Business',
    exclusive: true,
    description: 'Centre feature — large 2×2 image with overlay text',
  },
  ...surroundingSlots('showbusiness', 'Show-Business'),
  {
    id: 'showbusiness.article',
    label: 'Article',
    page: 'Show-Business',
    exclusive: false,
    description:
      'Normal article card in the Show-Business feed — multiple articles share this slot',
  },

  // ── Leaders Stories ───────────────────────────────────────────
  {
    id: 'leaders.pin-1',
    label: 'Pinned Story 1',
    page: 'Leaders Stories',
    exclusive: true,
    description: 'First featured story shown at the top of the Leaders feed',
  },
  {
    id: 'leaders.pin-2',
    label: 'Pinned Story 2',
    page: 'Leaders Stories',
    exclusive: true,
    description: 'Second featured story shown at the top of the Leaders feed',
  },
  {
    id: 'leaders.pin-3',
    label: 'Pinned Story 3',
    page: 'Leaders Stories',
    exclusive: true,
    description: 'Third featured story shown at the top of the Leaders feed',
  },
  {
    id: 'leaders.article',
    label: 'Article',
    page: 'Leaders Stories',
    exclusive: false,
    description: 'Article in the Leaders Stories feed — multiple articles share this slot',
  },
]

/** All slots grouped by page */
export const SLOTS_BY_PAGE = SLOTS.reduce<Record<string, Slot[]>>((acc, slot) => {
  if (!acc[slot.page]) acc[slot.page] = []
  acc[slot.page].push(slot)
  return acc
}, {})

/** Quick lookup by slot ID */
export const SLOT_BY_ID = Object.fromEntries(SLOTS.map((s) => [s.id, s])) as Record<SlotId, Slot>

/**
 * The 9 ordered cover slot IDs for a section's grid:
 *   [0] cover-1 (TL)   [1] cover (CENTER)   [2] cover-2 (TR)
 *   [3] cover-3 (ML)                         [4] cover-4 (MR)
 *   [5] cover-5 (BL)   [6] cover-6 (BM)     [7] cover-7 (BMR)  [8] cover-8 (BR)
 */
export function sectionGridSlots(prefix: string): SlotId[] {
  return [
    `${prefix}.cover-1`,
    `${prefix}.cover`,
    `${prefix}.cover-2`,
    `${prefix}.cover-3`,
    `${prefix}.cover-4`,
    `${prefix}.cover-5`,
    `${prefix}.cover-6`,
    `${prefix}.cover-7`,
    `${prefix}.cover-8`,
  ] as SlotId[]
}
