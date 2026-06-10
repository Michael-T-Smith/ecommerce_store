// ============================================================
//  BityBird Co — Announcement Bar Config
//  src/lib/announcementConfig.js
//
//  Edit this file to change the bar without touching any
//  component code. Every option is documented below.
// ============================================================

export const ANNOUNCEMENT_CONFIG = {

  // ── Visibility ───────────────────────────────────────────
  enabled: true,            // false = bar is completely hidden

  // ── Height ───────────────────────────────────────────────
  height: 40,               // px — bar height

  // ── Text content ─────────────────────────────────────────
  // Array of messages. If more than one, they rotate.
  messages: [
    "✦ Free shipping on orders over $35 ✦",
    "✦ Every piece of your story matters ✦",
    "✦ Cute Finds & Handcrafted Goods You'll Adore. ✦",
    "✦ Wear your story ✦",
  ],
  // ms between message rotations (only applies when messages.length > 1)
  rotateInterval: 4500,

  // ── Typography ───────────────────────────────────────────
  fontSize  : 11,           // px — use null to let Tailwind handle it
  tracking  : "3px",        // letter-spacing
  fontWeight: "700",        // CSS font-weight value

  // ── Colors ───────────────────────────────────────────────
  background: "#0E0E0E",    // bar background
  textColor : "#FAF8F4",    // message text color
  accentColor: "#C08FA3",   // used by some variants for highlights

  // ── Design Variant ───────────────────────────────────────
  // Options: "classic" | "gradient" | "checkerboard" | "solid" | "neon"
  variant: "solid",

  // ── Stripe Config (used by "classic" variant) ────────────
  stripes: {
    enabled  : true,        // show / hide stripe clusters
    position : "both",      // "both" | "left" | "right" | "none"
    colors   : ["#0E0E0E", "#0E0E0E", "#0E0E0E"],  // array of stripe colors
    width    : 6,           // px — width of each stripe bar
    gap      : 3,           // px — gap between bars
    count    : 3,           // number of bars per cluster (overridden by colors.length)
    margin   : 20,          // px — space between stripe cluster and text
  },

  // ── Gradient Config (used by "gradient" variant) ─────────
  gradient: {
    from : "#C08FA3",
    via  : "#BFA05C",
    to   : "#0E0E0E",
    angle: 90,              // degrees
  },

  // ── Checkerboard Config (used by "checkerboard" variant) ─
  checkerboard: {
    color1   : "#C08FA3",
    color2   : "#0E0E0E",
    squareSize: 10,         // px — size of each square
  },

  // ── Marquee / Scroll Effect ───────────────────────────────
  marquee: {
    enabled : false,        // true = text scrolls across instead of centering
    speed   : 35,           // px/s — scrolling speed
    gap     : 80,           // px — gap between repeats
  },

  // ── Pulse / Glow Effect ───────────────────────────────────
  pulse: {
    enabled  : false,       // true = text gently pulses opacity
    duration : "3s",        // CSS animation duration
  },

  // ── Shimmer Effect ───────────────────────────────────────
  shimmer: {
    enabled  : false,       // true = a shimmer highlight sweeps across
    color    : "rgba(255,255,255,0.12)",
    duration : "3.5s",
  },

  // ── Optional Link ────────────────────────────────────────
  link: {
    enabled: false,
    href   : "/shop",
    label  : null,          // null = whole bar is clickable
  },

  // ── Left / Right decorative icons ────────────────────────
  // Any emoji or short string. Set to "" to disable.
  leftIcon : "",
  rightIcon: "",

  // ── Close button ─────────────────────────────────────────
  closeable: false,         // true = shows ✕ button; bar dismisses for session
};
