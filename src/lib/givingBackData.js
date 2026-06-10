
// ================================================================
//  FILE: src/lib/givingBackData.js
//  Mock data for the Giving Back community initiatives.
//  When DB is wired: replaced by pool.query. Shape does not change.
//
//  DB FIELD MAP:
//    id               → giving_back.id
//    title            → giving_back.title
//    description      → giving_back.description
//    impact_statement → giving_back.impact_statement
//    emoji            → giving_back.emoji
//    active           → giving_back.active
//    sort_order       → giving_back.sort_order
//    created_at       → giving_back.created_at
//    updated_at       → giving_back.updated_at
// ================================================================

export const GIVING_BACK_MOCK = [
  {
    id              : 1,
    title           : "Anniston Community Food Bank",
    description     : "A portion of every sale goes toward stocking shelves at the Anniston Community Food Bank. No strings, no conditions — just food for families who need it.",
    impact_statement: "Supporting families in need across Calhoun County.",
    emoji           : "🥫",
    active          : true,
    sort_order      : 0,
    created_at      : "2024-01-01T00:00:00Z",
    updated_at      : "2024-01-01T00:00:00Z",
  },
  {
    id              : 2,
    title           : "Free Crafting Workshops",
    description     : "Every month we host free crafting and upcycling workshops at the Piedmont Community Center. All materials provided. All skill levels welcome. The whole idea is to show people that making something with your hands is for everyone.",
    impact_statement: "Teaching sustainable making skills to anyone who wants to learn.",
    emoji           : "🔨",
    active          : true,
    sort_order      : 1,
    created_at      : "2024-01-01T00:00:00Z",
    updated_at      : "2024-01-01T00:00:00Z",
  },
  {
    id              : 3,
    title           : "Calhoun County School Supply Drive",
    description     : "Each back-to-school season BityBird Co runs a supply drive for local Calhoun County schools. We collect donations in-store and online, then deliver directly to schools that need it most.",
    impact_statement: "Equipping students who need it most.",
    emoji           : "📚",
    active          : true,
    sort_order      : 2,
    created_at      : "2024-01-01T00:00:00Z",
    updated_at      : "2024-01-01T00:00:00Z",
  },
];
