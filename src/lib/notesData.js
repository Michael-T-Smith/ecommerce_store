
// ================================================================
//  FILE: src/lib/notesData.js
//  Mock data for the notes (blog) system.
//  When DB is wired: replaced by pool.query in server components
//  and API routes. Shape does not change.
//
//  DB FIELD MAP:
//    id           → notes.id
//    title        → notes.title
//    slug         → notes.slug
//    body         → notes.body          (newlines preserved as \n)
//    excerpt      → notes.excerpt
//    status       → notes.status        ('draft' | 'published')
//    published_at → notes.published_at  (null when draft)
//    author_id    → notes.author_id
//    author_name  → joined employees.name
//    created_at   → notes.created_at
//    updated_at   → notes.updated_at
// ================================================================

export const NOTES_MOCK = [
  {
    id          : 1,
    title       : "Why I Started BityBird Co",
    slug        : "why-i-started-bitybird-co",
    body        : `I've been collecting things my whole life.\n\nNot in a hoarder way — in a "this has a story" way. Every piece I've ever picked up at a yard sale or estate auction had something in it that the last owner left behind. A scratch on the leg of a chair. A water ring on a side table. Proof that something was lived in.\n\nBityBird Co started because I couldn't stop finding things that deserved a second life, and I figured someone else out there would see what I see in them.\n\nSo here we are. Every piece in the shop has been through my hands. I've cleaned it, fixed it, thought about it, and decided it belongs in someone's home — not a landfill.\n\nThanks for being here.`,
    excerpt     : "I've been collecting things my whole life. Not in a hoarder way — in a \"this has a story\" way.",
    status      : "published",
    published_at: "2024-01-15T10:00:00Z",
    author_id   : 1,
    author_name : "Candice Morgan",
    created_at  : "2024-01-15T09:00:00Z",
    updated_at  : "2024-01-15T09:00:00Z",
  },
  {
    id          : 2,
    title       : "What Makes a Good Refurbish",
    slug        : "what-makes-a-good-refurbish",
    body        : `People ask me all the time: how do you decide what's worth fixing?\n\nHonestly? Bones.\n\nIf the bones are good — solid joints, real wood, quality hardware — it's worth the work. A bad paint job or a torn seat cushion is just surface stuff. Those things I can fix. What I can't fix is a piece that was cheaply made in the first place.\n\nThat's why most of what I source is older. Older furniture was built to last. It wasn't designed to be replaced in two years.\n\nWhen I find something with good bones and give it new life, that's the whole point.`,
    excerpt     : "People ask me all the time: how do you decide what's worth fixing? Honestly? Bones.",
    status      : "published",
    published_at: "2024-02-08T14:00:00Z",
    author_id   : 1,
    author_name : "Candice Morgan",
    created_at  : "2024-02-08T13:00:00Z",
    updated_at  : "2024-02-08T13:00:00Z",
  },
  {
    id          : 3,
    title       : "Spring Finds — What's Coming",
    slug        : "spring-finds-whats-coming",
    body        : `Just a heads up on what I've been sourcing.\n\nI've got a few pieces coming in over the next few weeks that I'm genuinely excited about. A mid-century dresser with the original hardware. A set of cast iron bookends that are heavy as anything and perfect. A few handmade ceramic pieces from a local maker I met at the Anniston market.\n\nI'll get them listed as fast as I can. If you see something you like, don't wait — these things don't last.`,
    excerpt     : "Just a heads up on what I've been sourcing. A few pieces coming in that I'm genuinely excited about.",
    status      : "draft",
    published_at: null,
    author_id   : 1,
    author_name : "Candice Morgan",
    created_at  : "2024-03-01T11:00:00Z",
    updated_at  : "2024-03-01T11:00:00Z",
  },
];
