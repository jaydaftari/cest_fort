// Mock articles seeded from the c-est-fort-remix prototype.
// Used as UI fallback when the database has no published articles.
// Delete this file (and its imports) once real content is live.

const CATEGORY_MAP: Record<string, { name: string; slug: string }> = {
  'TECH':            { name: 'Tech',            slug: 'tech' },
  'CULTURE':         { name: 'Culture',          slug: 'culture' },
  'FASHION':         { name: 'Fashion',          slug: 'fashion' },
  'SHOW-BUSINESS':   { name: 'Show Business',    slug: 'showbusiness' },
  'LEADERS STORIES': { name: 'Leaders Stories',  slug: 'leaders-stories' },
}

function toContent(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs.map((p) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [{ type: 'text', format: 0, mode: 'normal', style: '', text: p, version: 1 }],
      })),
    },
  }
}

export type MockArticle = {
  id: string
  slug: string
  title: string
  dek: string | null
  content: ReturnType<typeof toContent>
  authorName: string
  authorEmail: string
  authorAvatarUrl: string | null
  authorBio: null
  heroImage: null
  heroImageUrl: string | null
  category: { name: string; slug: string } | null
  publishedAt: string | null
  readTime: number | null
  views: number
  featured: boolean
  _status: 'published'
  seoTitle: null
  seoDescription: null
}

const RAW = [ 
  {
    id: 'architecture-of-power', slug: 'architecture-of-power',
    category: 'TECH', featured: true,
    title: 'The Architecture of Power',
    dek: 'Inside the infrastructure decisions shaping the next decade of enterprise software. From hyperscaler dependency to sovereign cloud, the choices made today will define competitive advantage for a generation.',
    author: 'Isabella Rothschild', avatar: 'https://i.pravatar.cc/120?img=47',
    date: '2025-12-05', readMinutes: 9,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80',
    body: [
      'For two decades, the prevailing logic in enterprise infrastructure was simple: rent everything. The hyperscalers — Amazon, Microsoft, Google — offered an elastic, pay-as-you-go promise that made owning data centers feel quaint. CFOs loved it. So did boards.',
      'That orthodoxy is now under pressure. Sovereign cloud mandates in the EU, capacity constraints from the AI build-out, and a new generation of CIOs who came up post-2008 are rewriting what "cloud-first" means. The most consequential infrastructure decisions of the next decade will not be about which hyperscaler — but about which workloads stay rented, which come home, and which run in places nobody is talking about yet.',
      'I spent the last six months talking to forty-three CTOs across financial services, defense, and pharma. A pattern emerged. The companies that are pulling ahead are not the ones with the largest AWS bills, nor the ones building their own hardware. They are the ones with the clearest taxonomy: a written framework for which kind of compute belongs where, and a discipline about enforcing it.',
      'One CTO of a mid-cap insurer put it bluntly: "We treat infrastructure the way we treat reinsurance. There are layers. Each layer has its own risk profile, its own cost curve, its own regulator. If you mix them, you pay for it — eventually."',
      'The architecture of power, then, is no longer about scale. It is about clarity. And clarity, in 2026, is the rarest commodity in the stack.',
    ],
  },
  {
    id: 'inference-economy', slug: 'inference-economy',
    category: 'TECH', featured: false,
    title: 'The Inference Economy',
    dek: 'The training wars are over. The new battleground is cheaper, faster inference — and the companies that figure it out first will define the next decade of enterprise software.',
    author: 'Marcus Ellison', avatar: 'https://i.pravatar.cc/120?img=52',
    date: '2025-12-08', readMinutes: 8,
    image: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1600&q=80',
    body: [
      'For three years, the defining metric in AI was parameters. The model with the most won the press release, the funding round, and sometimes the talent. Training runs became geopolitical events. The cost per token was a footnote.',
      'That era is ending. The companies that saw it coming earliest — a handful of inference-focused startups, two hyperscalers who had been quietly building custom silicon, and one incumbent who had the good fortune of a difficult quarter — are now sitting on an unexpected advantage.',
      'Inference, it turns out, is not just the delivery mechanism for a trained model. It is the business model. The gap between what it costs to run a query and what an enterprise will pay for the answer is where the entire margin of the AI industry will be made or lost over the next five years.',
      'The hardware layer is where it gets interesting. The training market was always going to consolidate around Nvidia; the switching costs are too high and the ecosystem too deep. The inference market has no such gravity. Custom ASICs, edge deployments, and a new class of memory architecture are all in serious competition for a prize that did not exist two years ago.',
      'The executives who understand this are already making decisions that will look obvious in retrospect: long-term contracts with inference-layer vendors, internal capability builds in prompt engineering and retrieval architecture, and — most importantly — a hard look at which AI use cases actually need real-time responses and which do not.',
      'The training wars were about bragging rights. The inference economy is about operating leverage. And operating leverage, eventually, is the only story that matters.',
    ],
  },
  {
    id: 'modern-glamour-redefined', slug: 'modern-glamour-redefined',
    category: 'TECH', featured: false,
    title: 'Modern Glamour Redefined',
    dek: "How Silicon Valley's new guard is fusing aesthetic sensibility with engineering precision — and why the next wave of consumer tech looks nothing like its predecessors.",
    author: 'Vivienne Laurent', avatar: 'https://i.pravatar.cc/120?img=32',
    date: '2025-12-07', readMinutes: 7,
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80',
    body: [
      'The first generation of consumer tech mistook minimalism for elegance. The new generation knows the difference.',
      'Walk into any of the small studios clustered south of Market Street in San Francisco and you will see a kind of design literacy that did not exist five years ago. Materials boards. Pantone chips. References pulled from couture archives rather than from other apps. The aesthetic vocabulary has shifted, and so has the ambition.',
      'There is a thesis underneath this. The technology has commoditized; the experience has not. When everyone has the same model running on the same silicon, what differentiates a product is taste. And taste — finally — is being treated as a first-class engineering input.',
      'The companies that have understood this earliest are building things that feel less like software and more like objects. They are also, not coincidentally, the ones with margins.',
    ],
  },
  {
    id: 'interface-as-identity', slug: 'interface-as-identity',
    category: 'TECH', featured: false,
    title: 'The Interface as Identity',
    dek: 'Product design has become the new power dressing — how UI language signals status in the boardroom.',
    author: 'Margaux Pemberton', avatar: 'https://i.pravatar.cc/120?img=29',
    date: '2025-12-06', readMinutes: 6,
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1600&q=80',
    body: [
      'Twenty years ago, the suit told you who was running the meeting. Today, it is the dashboard on the wall behind them.',
      'In private equity, in family offices, in the C-suites of regulated industries, a quiet hierarchy has emerged. The fluency of your interface — the typography, the data density, the restraint — telegraphs the seriousness of the operation. Bad UI now reads the way a bad tie once did.',
      'The implication for product teams is uncomfortable. Aesthetic choices that used to be optional are now load-bearing. The companies still shipping the visual language of 2018 are losing executive buyers before the demo even starts.',
    ],
  },
  {
    id: 'semiconductor-sovereignty', slug: 'semiconductor-sovereignty',
    category: 'TECH', featured: false,
    title: 'Semiconductor Sovereignty',
    dek: 'The geopolitical race for chip independence and what it means for the global supply chain.',
    author: 'Margaux Pemberton', avatar: 'https://i.pravatar.cc/120?img=29',
    date: '2025-12-01', readMinutes: 9,
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1600&q=80',
    body: [
      'There is a fab being built in Dresden that almost nobody is talking about. By 2027, it will produce wafers at a node sophisticated enough to make policymakers in three capitals nervous.',
      'The race for semiconductor sovereignty is not, as it is often reported, a binary between the United States and China. It is a four-way contest among Washington, Beijing, Brussels, and Tokyo, with secondary actors in Seoul and Taipei holding more leverage than any of the principals will publicly admit.',
      'What is being negotiated, slowly and mostly in private, is the topology of the next economic order. The country that emerges with the most defensible position on advanced compute will set the terms for everything else.',
    ],
  },
  {
    id: 'new-boardroom-calculus', slug: 'new-boardroom-calculus',
    category: 'TECH', featured: false,
    title: 'The New Boardroom Calculus',
    dek: 'How the most consequential technology leaders balance velocity with governance, ambition with accountability, and disruption with durability.',
    author: 'Charlotte Montgomery', avatar: 'https://i.pravatar.cc/120?img=44',
    date: '2025-12-03', readMinutes: 12,
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1600&q=80',
    body: [
      'There is a particular kind of meeting that happens in boardrooms now that did not happen five years ago.',
      'It is the meeting where someone — usually the CEO, occasionally a senior independent director — pulls out a one-pager that says, in essence: here is what we are going to do this quarter, here is what could break, here is what we are willing to lose. The document is rarely longer than four hundred words. It is the most important artifact the company produces.',
      'The leaders who write these documents well are running better companies. That is not a coincidence. It is, increasingly, the entire job.',
    ],
  },
  {
    id: 'precision-at-scale', slug: 'precision-at-scale',
    category: 'TECH', featured: false,
    title: 'Precision at Scale',
    dek: 'How the next generation of inference workloads is reshaping the data center floor plan.',
    author: 'Penelope Vanderbilt', avatar: 'https://i.pravatar.cc/120?img=20',
    date: '2025-12-07', readMinutes: 5,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1600&q=80',
    body: [
      'The floor plan is the strategy now. Not the chips, not the cooling, not even the power contract — the floor plan.',
      'The newest data centers are being laid out with a precision that resembles a semiconductor fab more than the warehouse aesthetic of a decade ago. Aisle widths matter. Cable runs matter. The choreography of a rack swap during a live workload is rehearsed.',
      'What this discipline produces, ultimately, is yield. And yield, at the scale these operators run, is the only number that matters.',
    ],
  },
  {
    id: 'founders-who-dress-the-part', slug: 'founders-who-dress-the-part',
    category: 'LEADERS STORIES', featured: true,
    title: 'Founders Who Dress the Part',
    dek: 'A new generation of CEOs is leveraging personal brand and visual presence as a strategic asset — and treating it with the same rigor as a product launch.',
    author: 'Beatrice Hawthorne', avatar: 'https://i.pravatar.cc/120?img=23',
    date: '2025-12-05', readMinutes: 8,
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1600&q=80',
    body: [
      'The hoodie era is over. Not because hoodies went out of style — they did not — but because the people wearing them stopped being interesting.',
      'The current crop of founders raising at meaningful valuations has noticed something their predecessors missed: in a world of infinite feeds, presence is allocation. The way you appear is a finite resource you spend on the people who matter. Spending it badly is malpractice.',
      'I have spent the last year talking to fourteen CEOs who have built deliberate visual practices around their public selves. Not stylists in the celebrity sense — more like art directors with a single client. The conversations were remarkably similar. None of them used the word "brand." All of them used the word "signal."',
    ],
  },
  {
    id: 'ceo-who-rebuilt-everything', slug: 'ceo-who-rebuilt-everything',
    category: 'LEADERS STORIES', featured: false,
    title: 'The CEO Who Rebuilt Everything',
    dek: 'How Mireille Fontaine dismantled a legacy telco and rebuilt it as a pure-play AI infrastructure company in under 36 months.',
    author: 'Beatrice Hawthorne', avatar: 'https://i.pravatar.cc/120?img=23',
    date: '2025-11-30', readMinutes: 11,
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&q=80',
    body: [
      'When Mireille Fontaine took over Réseau Atlantique in early 2023, the company had eleven thousand employees, three billion in revenue, and a stock price that had not moved in a decade. By the time we sat down in her office in La Défense last November, those numbers were unrecognizable.',
      'The headcount is now four thousand. Revenue is up sixty percent. The stock is trading at five times its 2023 close. Most importantly, the company no longer thinks of itself as a telco. It thinks of itself as the largest privately-owned GPU cluster in continental Europe.',
      '"The mistake people make," she told me, "is thinking transformation is about technology. It is not. It is about consent. You have to get nine thousand people to agree to disappear, and you have to do it in a way they can live with afterward."',
      'She did. The how is the rest of this article.',
    ],
  },
  {
    id: 'legacy-leverage', slug: 'legacy-leverage',
    category: 'LEADERS STORIES', featured: false,
    title: 'Legacy & Leverage',
    dek: 'The second-generation founders quietly remaking the family office into a venture engine.',
    author: 'Theodore Worthington', avatar: 'https://i.pravatar.cc/120?img=11',
    date: '2025-12-04', readMinutes: 8,
    image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1600&q=80',
    body: [
      'They inherited the capital. What they did with it was unexpected.',
      'A generation of heirs to industrial fortunes in Northern Europe and the Gulf is doing something their parents would never have countenanced: deploying meaningful percentages of family capital into seed-stage technology. Not as a hobby. As the new core thesis.',
      'The implications for venture, for the families themselves, and for the companies that take this capital are still being worked out. Early evidence suggests it produces a different kind of board.',
    ],
  },
  {
    id: 'when-tech-meets-red-carpet', slug: 'when-tech-meets-red-carpet',
    category: 'SHOW-BUSINESS', featured: false,
    title: 'When Tech Meets the Red Carpet',
    dek: 'The convergence of entertainment and innovation is producing a new class of crossover celebrity.',
    author: 'Edmund Cavendish', avatar: 'https://i.pravatar.cc/120?img=15',
    date: '2025-12-04', readMinutes: 5,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1600&q=80',
    body: [
      'The premiere was at the Egyptian. The afterparty was on Sand Hill Road. Five years ago, the geometry of the evening would have been unthinkable.',
      'A new social topology is forming at the intersection of streaming, AI, and capital. The actors who matter now are the ones with cap tables. The investors who matter now are the ones with publicists. The audience for both is increasingly the same.',
      'Whether this convergence produces better content or merely better parties is still an open question. But the parties, for now, are extraordinary.',
    ],
  },
  {
    id: 'streamings-second-act', slug: 'streamings-second-act',
    category: 'SHOW-BUSINESS', featured: false,
    title: "Streaming's Second Act",
    dek: 'After the subscriber wars, a quieter battle for attention is rewriting the economics of prestige.',
    author: 'Edmund Cavendish', avatar: 'https://i.pravatar.cc/120?img=15',
    date: '2025-12-06', readMinutes: 7,
    image: 'https://images.unsplash.com/photo-1556139943-4bdca53adf1e?w=1600&q=80',
    body: [
      'The platforms learned to stop competing for subscribers and started competing for hours. The economics turned out to be entirely different.',
      'In the second act of the streaming era, prestige is not a marketing line. It is a P&L variable. Shows that hold viewers for twelve weeks rather than six produce a fundamentally different shape of return, and the companies that have noticed are restructuring their commissioning around it.',
      'The auteurs are back. The mid-budget drama is back. What is not coming back, by all indications, is the sixty-million-dollar limited series with a single famous name attached.',
    ],
  },
  {
    id: 'silicon-and-substance', slug: 'silicon-and-substance',
    category: 'CULTURE', featured: false,
    title: 'Silicon & Substance',
    dek: 'A new cultural moment is emerging at the intersection of tech capital and contemporary art patronage.',
    author: 'Sebastian Whitmore', avatar: 'https://i.pravatar.cc/120?img=12',
    date: '2025-11-28', readMinutes: 6,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80',
    body: [
      'The collector class is changing. The galleries have noticed.',
      'Walk Frieze London this year and you will see a kind of buyer who did not exist a decade ago: thirty-eight, founder-adjacent, knows the catalog raisonné by heart, pays in wire transfers from entities you cannot search. The major houses are restructuring their private sales desks to serve this new demographic and the volume that comes with them.',
      'What gets bought has shifted, too. Conceptual work is up. Late-career painting is up. The decorative middle has collapsed. Whether this represents a genuine shift in taste or a collective recognition of asset-class fundamentals is, as ever, both.',
    ],
  },
  {
    id: 'office-reimagined', slug: 'office-reimagined',
    category: 'CULTURE', featured: false,
    title: 'The Office Reimagined',
    dek: 'Beyond hybrid — how the most forward-looking firms are treating the workplace as a brand asset.',
    author: 'Anastasia Kensington', avatar: 'https://i.pravatar.cc/120?img=38',
    date: '2025-12-05', readMinutes: 6,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80',
    body: [
      'The debate about hybrid is over. The debate about what the office actually is, in 2026, is just beginning.',
      'The most considered firms — the ones whose recruiting numbers are quietly outperforming the market — have stopped treating headquarters as real estate and started treating it as a brand asset. The floor plan is a marketing surface. The lobby is a recruiting funnel. The coffee is, somehow, the most important hire of the year.',
      'Whether this is good for the people who work in these buildings is a separate question, and a harder one.',
    ],
  },
]

// View counts (all > 10K to reflect a launched publication)
const VIEWS: Record<string, number> = {
  'architecture-of-power':       18420,
  'inference-economy':           21640,
  'modern-glamour-redefined':    12830,
  'interface-as-identity':       11240,
  'semiconductor-sovereignty':   15420,
  'new-boardroom-calculus':      33810,
  'precision-at-scale':          10670,
  'founders-who-dress-the-part': 24160,
  'ceo-who-rebuilt-everything':  41280,
  'legacy-leverage':             14230,
  'when-tech-meets-red-carpet':  13720,
  'streamings-second-act':       11540,
  'silicon-and-substance':       14890,
  'office-reimagined':           17350,
}

export const MOCK_ARTICLES: MockArticle[] = RAW.map((a) => ({
  id: a.id,
  slug: a.slug,
  title: a.title,
  dek: a.dek,
  content: toContent(a.body),
  authorName: a.author,
  authorEmail: '',
  authorAvatarUrl: a.avatar,
  authorBio: null,
  heroImage: null,
  heroImageUrl: a.image,
  views: VIEWS[a.id] ?? 12000,
  category: CATEGORY_MAP[a.category] ?? null,
  publishedAt: new Date(a.date).toISOString(),
  readTime: a.readMinutes,
  featured: a.featured,
  _status: 'published' as const,
  seoTitle: null,
  seoDescription: null,
}))

export function getMockBySlug(slug: string): MockArticle | undefined {
  return MOCK_ARTICLES.find((a) => a.slug === slug)
}

export function getMockByCategory(categorySlug: string): MockArticle[] {
  return MOCK_ARTICLES.filter((a) => a.category?.slug === categorySlug)
}
