import React, { useState, useMemo } from "react";

/* =========================================================================
   PLANT MATCHUP  —  Central Indiana native-plant "character select"
   Flow: Region -> Yard zone -> Conditions -> Plant matchup card
   ========================================================================= */

// ---- Palette ------------------------------------------------------------
const C = {
  ink: "#2b2620",
  inkSoft: "#5c513f",
  paper: "#efe6d1",
  paperDeep: "#e7dabd",
  card: "#fbf6e9",
  cardEdge: "#d8c8a3",
  line: "#cdbd99",
  green: "#5d6e42",
  greenDeep: "#3e4c2c",
  rust: "#a8552f",
  rustDeep: "#7f3e21",
  gold: "#b5863a",
  shade: "#6b7d8c",
};

const FONT_DISP = "'Fraunces','Georgia',serif";
const FONT_BODY = "'Crimson Pro','Iowan Old Style','Georgia',serif";

// ---- Stat metadata (playful names) -------------------------------------
const STATS = [
  ["w", "Wildlife Power", "Overall value to wildlife. How many kinds of insects, birds, and other creatures the plant feeds and shelters across the year."],
  ["nec", "Nectar", "Food for adult pollinators. How much nectar and pollen it offers bees, butterflies, moths, and flies."],
  ["host", "Host Power", "Food for caterpillars. Whether butterflies and moths can lay eggs on it and raise their young. This is what feeds baby birds, so it matters more than most people expect."],
  ["bird", "Bird Fuel", "Everything a plant gives birds. Food first: seeds, berries, and the insects it supports. But also shelter, the place birds live and raise young. Dense shrubs hide nests, hollow trees and shaggy bark house cavity-nesters and even bats, and seed heads left standing feed birds through winter."],
  ["curb", "Curb Appeal", "How neat and intentional it looks in a conventional yard. High scores suit front beds and HOA blocks."],
  ["surv", "Survivability", "How well it shrugs off neglect, clay, drought, and competition once established. High means tough."],
  ["man", "Stays Put", "How well it stays where you plant it. High means well-behaved and slow to spread. Low means it travels and may need room or edging."],
  ["ease", "Ease", "How likely a beginner is to succeed with it. High means forgiving and low-fuss."],
];

const STAT_PHRASE = {
  w: "more wildlife overall",
  nec: "a stronger nectar draw",
  host: "better for caterpillars",
  bird: "better for birds",
  curb: "a tidier, neater look",
  surv: "tougher and more forgiving",
  man: "something that stays put",
  ease: "easier for beginners",
};

// ---- Roster (grows below via edits) ------------------------------------
// keys: n name, l latin, t silhouette type, sun, moist, zones, style, h height
//       s stats {w,nec,host,bird,curb,surv,man,ease}, ability{n,d}, weak, role, used
const PLANTS = [
  {
    id: "swamp-milkweed", n: "Swamp Milkweed", l: "Asclepias incarnata", t: "bloom",
    sun: ["full", "part"], moist: ["average", "damp", "wet"],
    zones: ["wet-spot", "sunny-front"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 86, nec: 90, host: 95, bird: 45, curb: 78, surv: 80, man: 82, ease: 86 },
    ability: { n: "Monarch Host Plant", d: "Feeds monarch caterpillars and adult pollinators at once." },
    weak: "Does not want truly dry soil.",
    role: "Wet sunny pollinator powerhouse",
    used: "Rain gardens, downspout beds, sunny damp areas.",
  },
  {
    id: "cardinal-flower", n: "Cardinal Flower", l: "Lobelia cardinalis", t: "bloom",
    sun: ["full", "part"], moist: ["damp", "wet"],
    zones: ["wet-spot", "under-tree"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 70, nec: 92, host: 40, bird: 50, curb: 85, surv: 60, man: 80, ease: 60 },
    ability: { n: "Hummingbird Magnet", d: "Scarlet spikes hummingbirds cannot ignore." },
    weak: "Short-lived if the soil dries out.",
    role: "Wet shade-edge hummingbird draw",
    used: "Streamsides, rain gardens, damp partly shaded beds.",
  },
  {
    id: "blue-flag-iris", n: "Blue Flag Iris", l: "Iris virginica", t: "grass",
    sun: ["full", "part"], moist: ["damp", "wet"],
    zones: ["wet-spot"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 60, nec: 65, host: 35, bird: 40, curb: 90, surv: 78, man: 85, ease: 80 },
    ability: { n: "Standing-Water Champ", d: "Thrives where most perennials drown." },
    weak: "Low caterpillar value.",
    role: "True wet-soil structure plant",
    used: "Pond edges, ditches, the wettest part of a rain garden.",
  },
  {
    id: "fox-sedge", n: "Fox Sedge", l: "Carex vulpinoidea", t: "grass",
    sun: ["full", "part"], moist: ["average", "damp", "wet"],
    zones: ["wet-spot", "sunny-front"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 65, nec: 20, host: 60, bird: 70, curb: 80, surv: 88, man: 80, ease: 85 },
    ability: { n: "Erosion Net", d: "Dense roots knit loose, wet soil together." },
    weak: "All texture, no color. The seedheads brown by late summer.",
    role: "Tidy grass-like wet filler",
    used: "Rain gardens, swales, between showier wet plants.",
  },
  {
    id: "joe-pye", n: "Joe-Pye Weed", l: "Eutrochium purpureum", t: "bloom",
    sun: ["full", "part"], moist: ["average", "damp"],
    zones: ["wet-spot", "fence-line"], style: ["natural", "wild"], h: "Tall",
    s: { w: 88, nec: 92, host: 70, bird: 55, curb: 60, surv: 82, man: 70, ease: 85 },
    ability: { n: "Late-Summer Nectar Tower", d: "A five-foot landing pad for late butterflies." },
    weak: "Gets big. Five to seven feet.",
    role: "Big back-of-border pollinator magnet",
    used: "Back borders, fence lines, large rain gardens.",
  },
  {
    id: "great-blue-lobelia", n: "Great Blue Lobelia", l: "Lobelia siphilitica", t: "bloom",
    sun: ["full", "part"], moist: ["average", "damp", "wet"],
    zones: ["wet-spot", "under-tree"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 68, nec: 80, host: 40, bird: 40, curb: 82, surv: 65, man: 80, ease: 70 },
    ability: { n: "Bumblebee Favorite", d: "Blue late-summer spikes built for big bees." },
    weak: "Wants steady moisture.",
    role: "Damp shade-edge blue spikes",
    used: "Rain garden edges, damp partly shaded beds.",
  },
  {
    id: "buttonbush", n: "Buttonbush", l: "Cephalanthus occidentalis", t: "shrub",
    sun: ["full", "part"], moist: ["damp", "wet"],
    zones: ["wet-spot", "fence-line"], style: ["natural", "wild"], h: "Shrub",
    s: { w: 90, nec: 88, host: 65, bird: 75, curb: 65, surv: 80, man: 72, ease: 78 },
    ability: { n: "Pollinator Globe", d: "Spherical white blooms swarmed by insects." },
    weak: "A real shrub. Needs room.",
    role: "Wet-area wildlife shrub",
    used: "Pond margins, wet fence lines, large soggy spots.",
  },
  {
    id: "soft-rush", n: "Soft Rush", l: "Juncus effusus", t: "grass",
    sun: ["full", "part"], moist: ["damp", "wet"],
    zones: ["wet-spot"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 55, nec: 15, host: 45, bird: 55, curb: 78, surv: 85, man: 78, ease: 82 },
    ability: { n: "Rain-Garden Workhorse", d: "Clean vertical lines in standing water." },
    weak: "Reads as background. Pair it with a bloomer or it just looks like grass.",
    role: "Vertical wet texture",
    used: "Rain gardens, pond edges, drainage low spots.",
  },
  {
    id: "red-chokeberry", n: "Red Chokeberry", l: "Aronia arbutifolia", t: "shrub",
    sun: ["full", "part"], moist: ["average", "damp", "wet"],
    zones: ["fence-line", "wet-spot"], style: ["tidy", "natural"], h: "Shrub",
    s: { w: 78, nec: 70, host: 65, bird: 82, curb: 82, surv: 85, man: 75, ease: 85 },
    ability: { n: "Winter Berry Hold", d: "Red fruit clings into winter for late birds." },
    weak: "Suckers slowly into a colony.",
    role: "Adaptable berry shrub",
    used: "Hedges, damp borders, four-season screens.",
  },
  {
    id: "purple-coneflower", n: "Purple Coneflower", l: "Echinacea purpurea", t: "bloom",
    sun: ["full", "part"], moist: ["dry", "average"],
    zones: ["sunny-front", "curb-strip"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 78, nec: 85, host: 50, bird: 80, curb: 92, surv: 80, man: 85, ease: 90 },
    ability: { n: "Goldfinch Seedhead", d: "Leave the cones standing and goldfinches arrive." },
    weak: "Can flop in overly rich soil.",
    role: "HOA-safe pollinator classic",
    used: "Front beds, sunny borders, starter pollinator gardens.",
  },
  {
    id: "black-eyed-susan", n: "Black-eyed Susan", l: "Rudbeckia fulgida", t: "bloom",
    sun: ["full", "part"], moist: ["dry", "average"],
    zones: ["sunny-front", "curb-strip"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 75, nec: 80, host: 60, bird: 75, curb: 90, surv: 85, man: 78, ease: 92 },
    ability: { n: "Bloom Machine", d: "Golden flowers for months with zero fuss." },
    weak: "Self-sows freely.",
    role: "Reliable golden front-bed staple",
    used: "Front beds, mass plantings, curb strips.",
  },
  {
    id: "butterfly-weed", n: "Butterfly Weed", l: "Asclepias tuberosa", t: "bloom",
    sun: ["full"], moist: ["dry", "average"],
    zones: ["sunny-front", "curb-strip"], style: ["tidy", "natural"], h: "Low",
    s: { w: 84, nec: 82, host: 95, bird: 40, curb: 90, surv: 88, man: 88, ease: 75 },
    ability: { n: "Dry-Soil Monarch Host", d: "A milkweed that loves the hot, dry, neglected spots." },
    weak: "Slow to establish. Hates wet feet.",
    role: "Tidy dry-soil monarch host",
    used: "Hot front beds, curb strips, lean sunny soil.",
  },
  {
    id: "little-bluestem", n: "Little Bluestem", l: "Schizachyrium scoparium", t: "grass",
    sun: ["full"], moist: ["dry", "average"],
    zones: ["sunny-front", "curb-strip"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 72, nec: 10, host: 70, bird: 78, curb: 88, surv: 92, man: 88, ease: 88 },
    ability: { n: "Four-Season Color", d: "Blue summer blades turn copper-red by fall, and the standing clumps shelter ground-nesting birds and overwintering insects." },
    weak: "Needs sun and good drainage.",
    role: "Tough upright prairie grass",
    used: "Curb strips, sunny matrix plantings, lean soil.",
  },
  {
    id: "prairie-dropseed", n: "Prairie Dropseed", l: "Sporobolus heterolepis", t: "grass",
    sun: ["full"], moist: ["dry", "average"],
    zones: ["sunny-front", "curb-strip"], style: ["tidy"], h: "Medium",
    s: { w: 60, nec: 10, host: 55, bird: 70, curb: 95, surv: 88, man: 92, ease: 78 },
    ability: { n: "Fine-Textured Mound", d: "The neatest native grass, emerald fountains that hold through winter as cover for small wildlife." },
    weak: "Slow grower. Patience required.",
    role: "The tidiest native grass",
    used: "Formal edges, front beds, repeated mass plantings.",
  },
  {
    id: "wild-bergamot", n: "Wild Bergamot", l: "Monarda fistulosa", t: "bloom",
    sun: ["full", "part"], moist: ["dry", "average"],
    zones: ["sunny-front", "curb-strip"], style: ["natural", "wild"], h: "Medium",
    s: { w: 82, nec: 90, host: 65, bird: 50, curb: 70, surv: 85, man: 65, ease: 85 },
    ability: { n: "Bee & Hummingbird Buffet", d: "Lavender crowns hum with activity all summer." },
    weak: "Spreads, and can get powdery mildew.",
    role: "Lavender prairie nectar",
    used: "Pollinator beds, meadows, sunny borders.",
  },
  {
    id: "anise-hyssop", n: "Anise Hyssop", l: "Agastache foeniculum", t: "bloom",
    sun: ["full", "part"], moist: ["dry", "average"],
    zones: ["sunny-front"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 80, nec: 92, host: 45, bird: 60, curb: 85, surv: 80, man: 75, ease: 82 },
    ability: { n: "Nonstop Nectar", d: "Purple spikes bloom for weeks on end." },
    weak: "Self-sows around the bed.",
    role: "Long-blooming bee favorite",
    used: "Front beds, pollinator gardens, cut-flower rows.",
  },
  {
    id: "new-england-aster", n: "New England Aster", l: "Symphyotrichum novae-angliae", t: "bloom",
    sun: ["full", "part"], moist: ["average", "damp"],
    zones: ["sunny-front", "fence-line"], style: ["natural", "wild"], h: "Tall",
    s: { w: 90, nec: 92, host: 80, bird: 60, curb: 65, surv: 82, man: 68, ease: 85 },
    ability: { n: "Late-Season Lifeline", d: "Purple fuel for monarchs heading south." },
    weak: "Tall and prone to flopping.",
    role: "Fall migration fuel",
    used: "Back borders, fence lines, large pollinator beds.",
  },
  {
    id: "showy-goldenrod", n: "Showy Goldenrod", l: "Solidago speciosa", t: "bloom",
    sun: ["full"], moist: ["dry", "average"],
    zones: ["sunny-front", "curb-strip"], style: ["natural"], h: "Medium",
    s: { w: 92, nec: 90, host: 88, bird: 55, curb: 75, surv: 88, man: 75, ease: 85 },
    ability: { n: "Keystone Powerhouse", d: "One of Tallamy's top wildlife plants. Upright and well-mannered." },
    weak: "Carries goldenrod's unfair reputation. It does not cause hay fever.",
    role: "Top-tier fall keystone",
    used: "Sunny beds, prairies, curb strips, anywhere you want maximum wildlife.",
  },
  {
    id: "wild-ginger", n: "Wild Ginger", l: "Asarum canadense", t: "bloom",
    sun: ["shade", "part"], moist: ["average", "damp"],
    zones: ["under-tree"], style: ["tidy", "natural"], h: "Low",
    s: { w: 50, nec: 30, host: 45, bird: 30, curb: 88, surv: 70, man: 82, ease: 70 },
    ability: { n: "Living Groundcover", d: "Glossy heart-shaped leaves carpet bare shade." },
    weak: "Slow to spread at first.",
    role: "Glossy shade carpet",
    used: "Under trees, shady borders, woodland paths.",
  },
  {
    id: "virginia-bluebells", n: "Virginia Bluebells", l: "Mertensia virginica", t: "bloom",
    sun: ["shade", "part"], moist: ["average", "damp"],
    zones: ["under-tree"], style: ["tidy", "natural"], h: "Low",
    s: { w: 60, nec: 75, host: 35, bird: 30, curb: 85, surv: 65, man: 80, ease: 65 },
    ability: { n: "Spring Ephemeral", d: "Sky-blue bells feed the first bees, then vanish." },
    weak: "Disappears entirely by midsummer.",
    role: "Early shade color",
    used: "Woodland gardens, under deciduous trees, damp shade.",
  },
  {
    id: "columbine", n: "Columbine", l: "Aquilegia canadensis", t: "bloom",
    sun: ["shade", "part"], moist: ["dry", "average"],
    zones: ["under-tree"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 65, nec: 80, host: 45, bird: 40, curb: 85, surv: 78, man: 80, ease: 80 },
    ability: { n: "Hummingbird Spring Bell", d: "Red-and-yellow lanterns time-perfect for migrants." },
    weak: "Short-lived but self-sows.",
    role: "Woodland-edge charmer",
    used: "Shade edges, rock gardens, dry woodland spots.",
  },
  {
    id: "woodland-phlox", n: "Woodland Phlox", l: "Phlox divaricata", t: "bloom",
    sun: ["shade", "part"], moist: ["average", "damp"],
    zones: ["under-tree"], style: ["tidy", "natural"], h: "Low",
    s: { w: 68, nec: 82, host: 50, bird: 30, curb: 88, surv: 70, man: 80, ease: 72 },
    ability: { n: "Fragrant Shade Carpet", d: "A scented blue-violet haze in spring shade." },
    weak: "Wants reasonably steady moisture.",
    role: "Spring shade groundcover",
    used: "Under trees, woodland borders, shady front beds.",
  },
  {
    id: "penn-sedge", n: "Pennsylvania Sedge", l: "Carex pensylvanica", t: "grass",
    sun: ["shade", "part"], moist: ["dry", "average"],
    zones: ["under-tree"], style: ["tidy"], h: "Low",
    s: { w: 60, nec: 10, host: 60, bird: 55, curb: 92, surv: 82, man: 88, ease: 80 },
    ability: { n: "Lawn Alternative", d: "A soft green meadow for dry shade where grass quits." },
    weak: "Stays low and green, never showy. It carpets, it does not perform.",
    role: "Dry-shade lawn substitute",
    used: "Under trees, shady lawn-replacement patches, paths.",
  },
  {
    id: "wild-geranium", n: "Wild Geranium", l: "Geranium maculatum", t: "bloom",
    sun: ["shade", "part"], moist: ["average", "damp"],
    zones: ["under-tree"], style: ["tidy", "natural"], h: "Low",
    s: { w: 70, nec: 78, host: 55, bird: 40, curb: 86, surv: 78, man: 82, ease: 80 },
    ability: { n: "Spring Bee Mat", d: "Pink-lavender blooms blanket the spring shade floor." },
    weak: "May go dormant in a drought.",
    role: "Reliable shade bloomer",
    used: "Woodland gardens, shade borders, under trees.",
  },
  {
    id: "zigzag-goldenrod", n: "Zigzag Goldenrod", l: "Solidago flexicaulis", t: "bloom",
    sun: ["shade", "part"], moist: ["average", "damp"],
    zones: ["under-tree"], style: ["natural"], h: "Medium",
    s: { w: 88, nec: 85, host: 85, bird: 50, curb: 78, surv: 80, man: 75, ease: 80 },
    ability: { n: "Shade Keystone", d: "Rare goldenrod that brings keystone wildlife value into shade." },
    weak: "Spreads gently over time.",
    role: "Shade-tolerant fall keystone",
    used: "Woodland gardens, shady borders, under high canopy.",
  },
  {
    id: "elderberry", n: "Elderberry", l: "Sambucus canadensis", t: "shrub",
    sun: ["full", "part"], moist: ["average", "damp"],
    zones: ["fence-line"], style: ["natural", "wild"], h: "Shrub",
    s: { w: 90, nec: 80, host: 70, bird: 90, curb: 60, surv: 85, man: 60, ease: 80 },
    ability: { n: "Bird Berry Bonanza", d: "Summer berries dozens of bird species depend on." },
    weak: "Large and suckering. Wants space.",
    role: "Big wildlife hedge",
    used: "Fence lines, back corners, wildlife screens.",
  },
  {
    id: "ninebark", n: "Ninebark", l: "Physocarpus opulifolius", t: "shrub",
    sun: ["full", "part"], moist: ["dry", "average", "damp"],
    zones: ["fence-line"], style: ["tidy", "natural"], h: "Shrub",
    s: { w: 75, nec: 70, host: 65, bird: 70, curb: 80, surv: 88, man: 75, ease: 85 },
    ability: { n: "Bombproof Shrub", d: "Handles clay, drought, and neglect without complaint." },
    weak: "Can get large if unpruned.",
    role: "Tough structural screen",
    used: "Fence lines, foundation backdrops, hedges.",
  },
  {
    id: "serviceberry", n: "Serviceberry", l: "Amelanchier laevis", t: "shrub",
    sun: ["full", "part"], moist: ["average", "damp"],
    zones: ["fence-line", "under-tree"], style: ["tidy", "natural"], h: "Small tree",
    s: { w: 85, nec: 75, host: 80, bird: 88, curb: 88, surv: 80, man: 80, ease: 82 },
    ability: { n: "Four-Season Beauty", d: "Spring flowers, June berries, fall fire, clean winter form." },
    weak: "Birds strip the berries fast. That is the point.",
    role: "Ornamental wildlife small tree",
    used: "Specimen spots, fence lines, woodland edges.",
  },
  {
    id: "american-hazelnut", n: "American Hazelnut", l: "Corylus americana", t: "shrub",
    sun: ["full", "part"], moist: ["dry", "average"],
    zones: ["fence-line"], style: ["natural", "wild"], h: "Shrub",
    s: { w: 82, nec: 40, host: 80, bird: 78, curb: 65, surv: 88, man: 65, ease: 82 },
    ability: { n: "Nut Producer", d: "Edible nuts for you and the wildlife both." },
    weak: "Suckers into a thicket over time.",
    role: "Wildlife screen with nuts",
    used: "Fence lines, hedgerows, back-of-yard screens.",
  },
  {
    id: "gray-goldenrod", n: "Gray Goldenrod", l: "Solidago nemoralis", t: "bloom",
    sun: ["full"], moist: ["dry", "average"],
    zones: ["sunny-front", "curb-strip"], style: ["tidy", "natural"], h: "Low",
    s: { w: 85, nec: 88, host: 80, bird: 55, curb: 80, surv: 92, man: 80, ease: 88 },
    ability: { n: "Lean-Soil Specialist", d: "Blooms gold in the poorest, driest dirt you have." },
    weak: "Small, so plant it in drifts. A single one disappears in a bed.",
    role: "Compact dry-soil keystone",
    used: "Curb strips, gravel, hot lean beds.",
  },
  {
    id: "stiff-goldenrod", n: "Stiff Goldenrod", l: "Solidago rigida", t: "bloom",
    sun: ["full"], moist: ["dry", "average"],
    zones: ["sunny-front", "fence-line"], style: ["natural"], h: "Tall",
    s: { w: 88, nec: 90, host: 78, bird: 60, curb: 68, surv: 88, man: 72, ease: 85 },
    ability: { n: "Flat-Top Landing Pad", d: "Broad flower heads built for late-season bees." },
    weak: "Stands tall. Plan for height.",
    role: "Upright fall nectar",
    used: "Back borders, prairies, fence lines.",
  },
  {
    id: "smooth-aster", n: "Smooth Blue Aster", l: "Symphyotrichum laeve", t: "bloom",
    sun: ["full", "part"], moist: ["dry", "average"],
    zones: ["sunny-front", "curb-strip"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 85, nec: 88, host: 80, bird: 58, curb: 82, surv: 86, man: 80, ease: 85 },
    ability: { n: "Migration Fuel", d: "Blue fall blooms for monarchs and late bees." },
    weak: "Quiet until it flowers in fall.",
    role: "Tidy fall aster",
    used: "Front beds, curb strips, sunny borders.",
  },
  {
    id: "aromatic-aster", n: "Aromatic Aster", l: "Symphyotrichum oblongifolium", t: "bloom",
    sun: ["full"], moist: ["dry", "average"],
    zones: ["sunny-front", "curb-strip"], style: ["tidy", "natural"], h: "Low",
    s: { w: 82, nec: 86, host: 75, bird: 55, curb: 88, surv: 90, man: 82, ease: 85 },
    ability: { n: "Last Bloom Standing", d: "Mounds of purple flowers into late October." },
    weak: "Late to wake in spring.",
    role: "Tidy late-fall mound",
    used: "Edges, curb strips, the front of dry beds.",
  },
  {
    id: "pale-coneflower", n: "Pale Purple Coneflower", l: "Echinacea pallida", t: "bloom",
    sun: ["full"], moist: ["dry", "average"],
    zones: ["sunny-front", "curb-strip"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 78, nec: 84, host: 50, bird: 78, curb: 86, surv: 86, man: 84, ease: 82 },
    ability: { n: "Drooping Elegance", d: "Slender reflexed petals on a true prairie native." },
    weak: "Needs real drainage. No wet feet.",
    role: "Prairie coneflower",
    used: "Lean sunny beds, prairies, curb strips.",
  },
  {
    id: "rattlesnake-master", n: "Rattlesnake Master", l: "Eryngium yuccifolium", t: "bloom",
    sun: ["full"], moist: ["dry", "average"],
    zones: ["sunny-front", "curb-strip"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 80, nec: 82, host: 60, bird: 45, curb: 84, surv: 88, man: 85, ease: 80 },
    ability: { n: "Architectural Oddball", d: "Spiky silver globes unlike anything else native." },
    weak: "Strange looking, if that is not your taste.",
    role: "Sculptural prairie accent",
    used: "Modern beds, gravel gardens, sunny borders.",
  },
  {
    id: "prairie-blazing-star", n: "Prairie Blazing Star", l: "Liatris pycnostachya", t: "bloom",
    sun: ["full"], moist: ["average", "damp"],
    zones: ["sunny-front", "fence-line"], style: ["tidy", "natural"], h: "Tall",
    s: { w: 82, nec: 92, host: 55, bird: 60, curb: 82, surv: 80, man: 80, ease: 80 },
    ability: { n: "Purple Torch", d: "Tall spikes that bloom top to bottom, swarmed by butterflies." },
    weak: "Tall spikes may need a little support.",
    role: "Vertical butterfly magnet",
    used: "Borders, prairies, behind shorter plants.",
  },
  {
    id: "dotted-blazing-star", n: "Dotted Blazing Star", l: "Liatris punctata", t: "bloom",
    sun: ["full"], moist: ["dry"],
    zones: ["sunny-front", "curb-strip"], style: ["tidy"], h: "Low",
    s: { w: 78, nec: 90, host: 50, bird: 55, curb: 88, surv: 92, man: 86, ease: 75 },
    ability: { n: "Deep-Root Survivor", d: "A taproot that laughs at drought." },
    weak: "Slow to establish that deep root.",
    role: "Compact dry blazing star",
    used: "Curb strips, gravel, the driest sunny spots.",
  },
  {
    id: "cup-plant", n: "Cup Plant", l: "Silphium perfoliatum", t: "bloom",
    sun: ["full"], moist: ["average", "damp"],
    zones: ["fence-line"], style: ["wild"], h: "Tall",
    s: { w: 92, nec: 88, host: 70, bird: 90, curb: 50, surv: 88, man: 50, ease: 82 },
    ability: { n: "Bird Water Tower", d: "Fused leaves hold rainwater that birds drink from." },
    weak: "Enormous and spreads. Eight feet, easily.",
    role: "Giant wildlife anchor",
    used: "Big back corners, fence lines, rough ground.",
  },
  {
    id: "compass-plant", n: "Compass Plant", l: "Silphium laciniatum", t: "bloom",
    sun: ["full"], moist: ["dry", "average"],
    zones: ["fence-line"], style: ["wild"], h: "Tall",
    s: { w: 88, nec: 85, host: 68, bird: 85, curb: 52, surv: 90, man: 70, ease: 78 },
    ability: { n: "Deep Prairie Root", d: "Roots plunge fifteen feet down. Effectively immortal." },
    weak: "Very tall and slow to mature.",
    role: "Towering prairie landmark",
    used: "Back of large beds, prairies, fence lines.",
  },
  {
    id: "wild-petunia", n: "Wild Petunia", l: "Ruellia humilis", t: "bloom",
    sun: ["full", "part"], moist: ["dry", "average"],
    zones: ["sunny-front", "curb-strip"], style: ["tidy"], h: "Low",
    s: { w: 65, nec: 70, host: 60, bird: 35, curb: 88, surv: 85, man: 80, ease: 82 },
    ability: { n: "Tiny Tough Bloomer", d: "Lavender trumpets on a plant that takes real abuse." },
    weak: "Small. Best in groups.",
    role: "Low dry-soil filler",
    used: "Edges, curb strips, between taller plants.",
  },
  {
    id: "june-grass", n: "June Grass", l: "Koeleria macrantha", t: "grass",
    sun: ["full"], moist: ["dry"],
    zones: ["sunny-front", "curb-strip"], style: ["tidy"], h: "Low",
    s: { w: 55, nec: 10, host: 50, bird: 60, curb: 90, surv: 88, man: 88, ease: 80 },
    ability: { n: "Early Cool Grass", d: "Greens up and seeds early, before the prairie wakes." },
    weak: "Goes quiet in summer heat.",
    role: "Tidy short bunchgrass",
    used: "Curb strips, front edges, lean soil.",
  },
  {
    id: "sideoats-grama", n: "Sideoats Grama", l: "Bouteloua curtipendula", t: "grass",
    sun: ["full"], moist: ["dry", "average"],
    zones: ["sunny-front", "curb-strip"], style: ["tidy"], h: "Medium",
    s: { w: 68, nec: 10, host: 65, bird: 70, curb: 86, surv: 90, man: 85, ease: 85 },
    ability: { n: "Oat-Flag Seedheads", d: "Tiny seed flags dangle along one side of each stem." },
    weak: "Wants real drainage. Sulks and thins out in heavy wet clay.",
    role: "Tough tidy prairie grass",
    used: "Curb strips, lean beds, sunny matrix.",
  },
  {
    id: "purple-poppy-mallow", n: "Purple Poppy Mallow", l: "Callirhoe involucrata", t: "bloom",
    sun: ["full"], moist: ["dry", "average"],
    zones: ["sunny-front", "curb-strip"], style: ["tidy", "natural"], h: "Low",
    s: { w: 68, nec: 78, host: 45, bird: 35, curb: 86, surv: 88, man: 70, ease: 82 },
    ability: { n: "Sprawling Magenta", d: "Wine-cup flowers trail over hot, dry ground." },
    weak: "Sprawls wider than expected.",
    role: "Trailing dry-soil groundcover",
    used: "Slopes, curb strips, edges that can spill.",
  },
  {
    id: "foxglove-beardtongue", n: "Foxglove Beardtongue", l: "Penstemon digitalis", t: "bloom",
    sun: ["full", "part"], moist: ["average", "damp"],
    zones: ["sunny-front"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 75, nec: 85, host: 55, bird: 45, curb: 88, surv: 84, man: 82, ease: 88 },
    ability: { n: "Early Bee Bells", d: "White spring bells right when bees need them most." },
    weak: "Brief bloom window.",
    role: "Tidy spring perennial",
    used: "Front beds, borders, HOA-safe plantings.",
  },
  {
    id: "ohio-spiderwort", n: "Ohio Spiderwort", l: "Tradescantia ohiensis", t: "bloom",
    sun: ["full", "part"], moist: ["average", "damp"],
    zones: ["sunny-front", "fence-line"], style: ["natural"], h: "Medium",
    s: { w: 65, nec: 78, host: 45, bird: 40, curb: 72, surv: 85, man: 65, ease: 88 },
    ability: { n: "Morning Blue", d: "Each flower lasts a morning, replaced daily for weeks." },
    weak: "Foliage flops after bloom. Cut it back.",
    role: "Easygoing blue bloomer",
    used: "Borders, fence lines, casual beds.",
  },
  {
    id: "prairie-smoke", n: "Prairie Smoke", l: "Geum triflorum", t: "bloom",
    sun: ["full"], moist: ["dry", "average"],
    zones: ["sunny-front", "curb-strip"], style: ["tidy"], h: "Low",
    s: { w: 60, nec: 70, host: 45, bird: 40, curb: 90, surv: 82, man: 85, ease: 75 },
    ability: { n: "Smoky Seedheads", d: "Nodding pink flowers become wispy pink plumes." },
    weak: "Needs sharp drainage. Hates wet clay.",
    role: "Early tidy curiosity",
    used: "Rock gardens, gravel, dry front edges.",
  },
  {
    id: "celandine-poppy", n: "Celandine Poppy", l: "Stylophorum diphyllum", t: "bloom",
    sun: ["shade", "part"], moist: ["average", "damp"],
    zones: ["under-tree"], style: ["tidy", "natural"], h: "Low",
    s: { w: 58, nec: 70, host: 40, bird: 35, curb: 86, surv: 72, man: 75, ease: 75 },
    ability: { n: "Woodland Gold", d: "Buttery poppies light up the spring shade floor." },
    weak: "May go dormant in summer drought.",
    role: "Bright spring shade bloom",
    used: "Woodland gardens, under trees, shady borders.",
  },
  {
    id: "foamflower", n: "Foamflower", l: "Tiarella cordifolia", t: "bloom",
    sun: ["shade", "part"], moist: ["average", "damp"],
    zones: ["under-tree"], style: ["tidy"], h: "Low",
    s: { w: 55, nec: 65, host: 40, bird: 30, curb: 92, surv: 70, man: 78, ease: 75 },
    ability: { n: "Frothy Spring Spikes", d: "Airy white wands over neat lobed leaves." },
    weak: "Wants steady moisture and shade.",
    role: "Tidy shade groundcover",
    used: "Front of shade beds, woodland edges, under trees.",
  },
  {
    id: "wild-columbine-shade", n: "Heart-leaved Aster", l: "Symphyotrichum cordifolium", t: "bloom",
    sun: ["shade", "part"], moist: ["dry", "average"],
    zones: ["under-tree"], style: ["natural"], h: "Medium",
    s: { w: 80, nec: 82, host: 78, bird: 50, curb: 72, surv: 82, man: 70, ease: 82 },
    ability: { n: "Shade Aster", d: "Clouds of small blue flowers where few asters bloom." },
    weak: "Self-sows around the shade bed.",
    role: "Fall color for shade",
    used: "Woodland edges, under high canopy, shady borders.",
  },
  {
    id: "blue-cohosh", n: "Blue Cohosh", l: "Caulophyllum thalictroides", t: "bloom",
    sun: ["shade", "part"], moist: ["average", "damp"],
    zones: ["under-tree"], style: ["natural"], h: "Medium",
    s: { w: 60, nec: 55, host: 40, bird: 60, curb: 70, surv: 75, man: 80, ease: 65 },
    ability: { n: "Blue Berry Finish", d: "Deep blue fall berries on a true woodland native." },
    weak: "Slow, and the flowers are easy to miss. Buy it for the berries and the patience.",
    role: "Quiet woodland specialist",
    used: "Mature shade gardens, under canopy.",
  },
  {
    id: "mayapple", n: "Mayapple", l: "Podophyllum peltatum", t: "bloom",
    sun: ["shade", "part"], moist: ["average", "damp"],
    zones: ["under-tree"], style: ["natural"], h: "Low",
    s: { w: 62, nec: 50, host: 45, bird: 50, curb: 78, surv: 80, man: 55, ease: 78 },
    ability: { n: "Umbrella Colony", d: "Paired leaves open like little green umbrellas." },
    weak: "Spreads into colonies. Dormant by midsummer.",
    role: "Spreading shade groundcover",
    used: "Large shade areas, under trees, naturalized woods.",
  },
  {
    id: "solomons-seal", n: "Solomon's Seal", l: "Polygonatum biflorum", t: "bloom",
    sun: ["shade", "part"], moist: ["average", "damp"],
    zones: ["under-tree"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 62, nec: 60, host: 45, bird: 55, curb: 88, surv: 80, man: 80, ease: 82 },
    ability: { n: "Arching Grace", d: "Bell-hung stems arch in elegant rows." },
    weak: "Flowers are shy. Grown for the form.",
    role: "Architectural shade plant",
    used: "Shade borders, under trees, woodland paths.",
  },
  {
    id: "false-solomons-seal", n: "False Solomon's Seal", l: "Maianthemum racemosum", t: "bloom",
    sun: ["shade", "part"], moist: ["average", "damp"],
    zones: ["under-tree"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 68, nec: 65, host: 45, bird: 70, curb: 84, surv: 80, man: 78, ease: 82 },
    ability: { n: "Plume and Berry", d: "Foamy flower plumes become speckled red berries." },
    weak: "Berries draw birds, then they are gone.",
    role: "Two-season shade plant",
    used: "Woodland gardens, shade borders, under trees.",
  },
  {
    id: "bottlebrush-grass", n: "Bottlebrush Grass", l: "Elymus hystrix", t: "grass",
    sun: ["shade", "part"], moist: ["dry", "average"],
    zones: ["under-tree"], style: ["natural"], h: "Medium",
    s: { w: 65, nec: 10, host: 65, bird: 65, curb: 78, surv: 82, man: 75, ease: 82 },
    ability: { n: "Shade Grass", d: "A real grass for dry shade, with bristled seedheads." },
    weak: "Self-sows freely.",
    role: "Grass for shade",
    used: "Dry shade, woodland edges, under trees.",
  },
  {
    id: "white-wood-aster", n: "White Wood Aster", l: "Eurybia divaricata", t: "bloom",
    sun: ["shade", "part"], moist: ["dry", "average"],
    zones: ["under-tree"], style: ["tidy", "natural"], h: "Low",
    s: { w: 80, nec: 80, host: 78, bird: 50, curb: 82, surv: 85, man: 75, ease: 85 },
    ability: { n: "Dry-Shade Bloomer", d: "Starry white flowers in the hard, dry shade." },
    weak: "Spreads gently to fill in.",
    role: "Tough shade groundcover",
    used: "Dry shade, under trees, woodland fronts.",
  },
  {
    id: "christmas-fern", n: "Christmas Fern", l: "Polystichum acrostichoides", t: "grass",
    sun: ["shade", "part"], moist: ["average", "damp"],
    zones: ["under-tree"], style: ["tidy"], h: "Low",
    s: { w: 50, nec: 5, host: 30, bird: 35, curb: 90, surv: 85, man: 85, ease: 85 },
    ability: { n: "Evergreen Shade", d: "Stays green through winter when all else fades." },
    weak: "Evergreen but slow. Takes a few years to fill in, and never blooms.",
    role: "Evergreen shade texture",
    used: "Slopes, shade borders, under trees, year-round green.",
  },
  {
    id: "maidenhair-fern", n: "Maidenhair Fern", l: "Adiantum pedatum", t: "grass",
    sun: ["shade", "part"], moist: ["average", "damp"],
    zones: ["under-tree"], style: ["tidy"], h: "Low",
    s: { w: 48, nec: 5, host: 30, bird: 30, curb: 92, surv: 70, man: 82, ease: 70 },
    ability: { n: "Delicate Fans", d: "Fine black-stemmed fronds in airy whorls." },
    weak: "Wants moisture and shelter.",
    role: "Refined shade fern",
    used: "Sheltered shade, woodland gardens, under trees.",
  },
  {
    id: "wild-leek", n: "Wild Leek (Ramps)", l: "Allium tricoccum", t: "bloom",
    sun: ["shade", "part"], moist: ["average", "damp"],
    zones: ["under-tree"], style: ["natural"], h: "Low",
    s: { w: 55, nec: 60, host: 35, bird: 30, curb: 78, surv: 72, man: 78, ease: 65 },
    ability: { n: "Edible Spring Ephemeral", d: "Foraged greens that vanish before summer." },
    weak: "Very slow to colonize.",
    role: "Edible woodland native",
    used: "Rich moist shade, woodland gardens.",
  },
  {
    id: "twinleaf", n: "Twinleaf", l: "Jeffersonia diphylla", t: "bloom",
    sun: ["shade", "part"], moist: ["average", "damp"],
    zones: ["under-tree"], style: ["tidy"], h: "Low",
    s: { w: 52, nec: 60, host: 35, bird: 30, curb: 86, surv: 70, man: 80, ease: 65 },
    ability: { n: "Fleeting White", d: "A one-day white bloom, then handsome paired leaves." },
    weak: "Bloom is gone in a blink.",
    role: "Collector's spring shade plant",
    used: "Rich shade gardens, under trees.",
  },
  {
    id: "bloodroot", n: "Bloodroot", l: "Sanguinaria canadensis", t: "bloom",
    sun: ["shade", "part"], moist: ["average", "damp"],
    zones: ["under-tree"], style: ["tidy"], h: "Low",
    s: { w: 55, nec: 65, host: 35, bird: 30, curb: 86, surv: 72, man: 78, ease: 70 },
    ability: { n: "First White of Spring", d: "Crisp white flowers wrapped in scalloped leaves." },
    weak: "Goes dormant by summer.",
    role: "Early spring shade gem",
    used: "Woodland gardens, under deciduous trees.",
  },
  {
    id: "large-flowered-trillium", n: "Large-flowered Trillium", l: "Trillium grandiflorum", t: "bloom",
    sun: ["shade", "part"], moist: ["average", "damp"],
    zones: ["under-tree"], style: ["tidy"], h: "Low",
    s: { w: 55, nec: 60, host: 35, bird: 30, curb: 90, surv: 65, man: 82, ease: 55 },
    ability: { n: "Woodland Icon", d: "The classic three-petaled white of rich Midwest woods." },
    weak: "Slow, fussy, and beloved by deer.",
    role: "Showpiece shade wildflower",
    used: "Mature woodland gardens, rich moist shade.",
  },
  {
    id: "hepatica", n: "Hepatica", l: "Anemone americana", t: "bloom",
    sun: ["shade", "part"], moist: ["dry", "average"],
    zones: ["under-tree"], style: ["tidy"], h: "Low",
    s: { w: 52, nec: 62, host: 35, bird: 28, curb: 88, surv: 75, man: 82, ease: 68 },
    ability: { n: "Earliest Bloom", d: "Among the very first flowers of the woodland year." },
    weak: "Tiny. Easily overlooked.",
    role: "Earliest shade wildflower",
    used: "Woodland gardens, slopes, under trees.",
  },
  {
    id: "shooting-star", n: "Shooting Star", l: "Primula meadia", t: "bloom",
    sun: ["part", "full"], moist: ["average", "damp"],
    zones: ["under-tree", "sunny-front"], style: ["tidy"], h: "Low",
    s: { w: 60, nec: 75, host: 40, bird: 30, curb: 90, surv: 72, man: 82, ease: 65 },
    ability: { n: "Swept-Back Stars", d: "Pink rockets that buzz-pollinating bees love." },
    weak: "Dormant after spring. Mark the spot.",
    role: "Distinctive spring bloom",
    used: "Part-shade beds, woodland edges, savanna gardens.",
  },
  {
    id: "marsh-marigold", n: "Marsh Marigold", l: "Caltha palustris", t: "bloom",
    sun: ["full", "part"], moist: ["damp", "wet"],
    zones: ["wet-spot"], style: ["tidy", "natural"], h: "Low",
    s: { w: 60, nec: 75, host: 40, bird: 35, curb: 85, surv: 72, man: 80, ease: 72 },
    ability: { n: "Earliest Wet Gold", d: "Glossy yellow blooms in cold early-spring mud." },
    weak: "Fades and rests after spring.",
    role: "Early wet-soil color",
    used: "Pond edges, wet shade, rain-garden bottoms.",
  },
  {
    id: "sensitive-fern", n: "Sensitive Fern", l: "Onoclea sensibilis", t: "grass",
    sun: ["part", "shade", "full"], moist: ["damp", "wet"],
    zones: ["wet-spot", "under-tree"], style: ["natural"], h: "Medium",
    s: { w: 58, nec: 5, host: 35, bird: 40, curb: 75, surv: 85, man: 60, ease: 82 },
    ability: { n: "Wet-Shade Filler", d: "Bold fronds that thrive in soggy shade." },
    weak: "Spreads by runners. Give it room.",
    role: "Wet-shade groundcover",
    used: "Wet shade, pond edges, damp low spots.",
  },
  {
    id: "swamp-rose-mallow", n: "Swamp Rose Mallow", l: "Hibiscus moscheutos", t: "bloom",
    sun: ["full", "part"], moist: ["damp", "wet"],
    zones: ["wet-spot", "fence-line"], style: ["natural"], h: "Tall",
    s: { w: 70, nec: 82, host: 60, bird: 45, curb: 78, surv: 80, man: 72, ease: 80 },
    ability: { n: "Dinner-Plate Blooms", d: "Flowers the size of your hand on a native hibiscus." },
    weak: "Big, and late to emerge in spring.",
    role: "Showy wet-soil giant",
    used: "Rain gardens, pond edges, wet sunny borders.",
  },
  {
    id: "boneset", n: "Boneset", l: "Eupatorium perfoliatum", t: "bloom",
    sun: ["full", "part"], moist: ["damp", "wet"],
    zones: ["wet-spot", "fence-line"], style: ["natural", "wild"], h: "Tall",
    s: { w: 85, nec: 88, host: 65, bird: 50, curb: 62, surv: 82, man: 70, ease: 82 },
    ability: { n: "Late Nectar Flat-Top", d: "White flower clusters mobbed by fall insects." },
    weak: "Tall and a touch weedy looking.",
    role: "Wet-area pollinator magnet",
    used: "Rain gardens, wet meadows, fence lines.",
  },
  {
    id: "swamp-aster", n: "Swamp Aster", l: "Symphyotrichum puniceum", t: "bloom",
    sun: ["full", "part"], moist: ["damp", "wet"],
    zones: ["wet-spot"], style: ["natural"], h: "Tall",
    s: { w: 82, nec: 85, host: 78, bird: 55, curb: 65, surv: 80, man: 68, ease: 80 },
    ability: { n: "Wet Fall Aster", d: "Lavender fall blooms for soggy ground." },
    weak: "Tall and spreads in the wet.",
    role: "Late nectar for wet spots",
    used: "Rain gardens, wet meadows, pond edges.",
  },
  {
    id: "golden-alexanders", n: "Golden Alexanders", l: "Zizia aurea", t: "bloom",
    sun: ["full", "part"], moist: ["average", "damp"],
    zones: ["sunny-front", "wet-spot"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 80, nec: 82, host: 85, bird: 40, curb: 82, surv: 82, man: 80, ease: 85 },
    ability: { n: "Early Host Plant", d: "Feeds black swallowtail caterpillars in late spring." },
    weak: "Best color is early, then it greens out.",
    role: "Early host and nectar plant",
    used: "Rain gardens, front beds, damp borders.",
  },
  {
    id: "queen-of-the-prairie", n: "Queen of the Prairie", l: "Filipendula rubra", t: "bloom",
    sun: ["full", "part"], moist: ["damp", "wet"],
    zones: ["wet-spot", "fence-line"], style: ["natural", "wild"], h: "Tall",
    s: { w: 70, nec: 78, host: 50, bird: 45, curb: 72, surv: 80, man: 60, ease: 78 },
    ability: { n: "Cotton-Candy Plumes", d: "Frothy pink flower heads tower over wet ground." },
    weak: "Big, and spreads where happy.",
    role: "Dramatic wet-soil accent",
    used: "Rain gardens, wet borders, pond edges.",
  },
  {
    id: "bur-sedge", n: "Bur Sedge", l: "Carex grayi", t: "grass",
    sun: ["full", "part"], moist: ["damp", "wet"],
    zones: ["wet-spot"], style: ["tidy", "natural"], h: "Medium",
    s: { w: 60, nec: 10, host: 55, bird: 65, curb: 82, surv: 85, man: 80, ease: 82 },
    ability: { n: "Mace-Head Seeds", d: "Spiky round seedheads like little medieval maces." },
    weak: "Needs steady moisture. Browns at the edges if the spot dries out.",
    role: "Sculptural wet sedge",
    used: "Rain gardens, pond edges, damp beds.",
  },
  {
    id: "tussock-sedge", n: "Tussock Sedge", l: "Carex stricta", t: "grass",
    sun: ["full", "part"], moist: ["wet"],
    zones: ["wet-spot"], style: ["natural"], h: "Medium",
    s: { w: 70, nec: 10, host: 60, bird: 70, curb: 70, surv: 88, man: 75, ease: 82 },
    ability: { n: "Wetland Foundation", d: "Forms the mounded tussocks whole marshes build on." },
    weak: "Wants consistent wet. Plain up close.",
    role: "Standing-water structure grass",
    used: "Pond edges, marshy spots, the wettest ground.",
  },
  {
    id: "swamp-white-oak", n: "Swamp White Oak", l: "Quercus bicolor", t: "shrub",
    sun: ["full", "part"], moist: ["average", "damp", "wet"],
    zones: ["fence-line"], style: ["natural"], h: "Small tree",
    s: { w: 99, nec: 30, host: 99, bird: 90, curb: 80, surv: 90, man: 85, ease: 80 },
    ability: { n: "Keystone Champion", d: "Oaks host more caterpillar species than any other tree, and old trunks open into cavities birds and bats nest in. The single best thing you can plant for wildlife." },
    weak: "It is a tree. Plan for decades and size.",
    role: "The ultimate wildlife tree",
    used: "Big yards, wet-tolerant shade, legacy plantings.",
  },
  {
    id: "redbud", n: "Eastern Redbud", l: "Cercis canadensis", t: "shrub",
    sun: ["full", "part"], moist: ["average", "damp"],
    zones: ["fence-line", "under-tree"], style: ["tidy", "natural"], h: "Small tree",
    s: { w: 75, nec: 78, host: 65, bird: 55, curb: 92, surv: 82, man: 82, ease: 85 },
    ability: { n: "Spring Pink Cloud", d: "Magenta blooms straight off the bare branches." },
    weak: "Shorter-lived than the big trees.",
    role: "Ornamental understory tree",
    used: "Specimen spots, woodland edges, front yards.",
  },
  {
    id: "pagoda-dogwood", n: "Pagoda Dogwood", l: "Cornus alternifolia", t: "shrub",
    sun: ["part", "shade"], moist: ["average", "damp"],
    zones: ["under-tree", "fence-line"], style: ["tidy", "natural"], h: "Small tree",
    s: { w: 80, nec: 72, host: 70, bird: 85, curb: 88, surv: 78, man: 80, ease: 78 },
    ability: { n: "Tiered Branches", d: "Horizontal layered limbs and berries birds devour." },
    weak: "Wants some shade and moisture.",
    role: "Layered understory beauty",
    used: "Woodland edges, shade borders, specimen spots.",
  },
  {
    id: "gray-dogwood", n: "Gray Dogwood", l: "Cornus racemosa", t: "shrub",
    sun: ["full", "part"], moist: ["average", "damp"],
    zones: ["fence-line"], style: ["natural", "wild"], h: "Shrub",
    s: { w: 82, nec: 70, host: 70, bird: 88, curb: 68, surv: 90, man: 60, ease: 85 },
    ability: { n: "Bird Magnet Berries", d: "White berries on red stems, stripped fast by birds, in a dense thicket they nest deep inside." },
    weak: "Suckers aggressively into thickets.",
    role: "Tough wildlife thicket",
    used: "Fence lines, hedgerows, back screens.",
  },
  {
    id: "winterberry", n: "Winterberry", l: "Ilex verticillata", t: "shrub",
    sun: ["full", "part"], moist: ["damp", "wet"],
    zones: ["wet-spot", "fence-line"], style: ["tidy", "natural"], h: "Shrub",
    s: { w: 78, nec: 60, host: 55, bird: 88, curb: 85, surv: 85, man: 78, ease: 80 },
    ability: { n: "Winter Red", d: "Bare branches stacked with red berries into deep winter." },
    weak: "Need a male nearby for the female to fruit.",
    role: "Winter berry shrub for wet soil",
    used: "Wet borders, rain gardens, winter interest.",
  },
  {
    id: "spicebush", n: "Spicebush", l: "Lindera benzoin", t: "shrub",
    sun: ["part", "shade"], moist: ["average", "damp"],
    zones: ["under-tree", "fence-line"], style: ["tidy", "natural"], h: "Shrub",
    s: { w: 84, nec: 65, host: 82, bird: 80, curb: 80, surv: 82, man: 78, ease: 82 },
    ability: { n: "Swallowtail Host", d: "Hosts spicebush swallowtails and feeds birds rich red berries." },
    weak: "Berries need a male and female plant.",
    role: "Shade wildlife shrub",
    used: "Woodland edges, shade borders, under canopy.",
  },
  {
    id: "new-jersey-tea", n: "New Jersey Tea", l: "Ceanothus americanus", t: "shrub",
    sun: ["full", "part"], moist: ["dry", "average"],
    zones: ["sunny-front", "curb-strip"], style: ["tidy", "natural"], h: "Shrub",
    s: { w: 78, nec: 85, host: 70, bird: 55, curb: 85, surv: 85, man: 85, ease: 72 },
    ability: { n: "Compact Pollinator Shrub", d: "Fluffy white blooms on a tidy, well-behaved small shrub." },
    weak: "Slow to start. Deep roots resent moving.",
    role: "Tidy dry-soil flowering shrub",
    used: "Front beds, curb strips, foundation plantings.",
  },
  {
    id: "fragrant-sumac", n: "Fragrant Sumac", l: "Rhus aromatica", t: "shrub",
    sun: ["full", "part"], moist: ["dry", "average"],
    zones: ["fence-line", "curb-strip"], style: ["natural"], h: "Shrub",
    s: { w: 75, nec: 60, host: 65, bird: 78, curb: 75, surv: 92, man: 65, ease: 88 },
    ability: { n: "Slope Holder", d: "Spreads to grip banks and shrugs off drought and salt." },
    weak: "Spreads wide. Not for tight spots.",
    role: "Erosion-control shrub",
    used: "Slopes, curb strips, tough hot banks.",
  },
  {
    id: "highbush-blueberry", n: "Highbush Blueberry", l: "Vaccinium corymbosum", t: "shrub",
    sun: ["full", "part"], moist: ["average", "damp"],
    zones: ["fence-line"], style: ["tidy", "natural"], h: "Shrub",
    s: { w: 78, nec: 75, host: 80, bird: 82, curb: 85, surv: 75, man: 80, ease: 70 },
    ability: { n: "Berries for All", d: "Fruit for you and the birds, with fiery fall leaves." },
    weak: "Demands acidic soil. Test first.",
    role: "Edible four-season shrub",
    used: "Borders, edible hedges, acidic beds.",
  },
  {
    id: "coral-honeysuckle", n: "Coral Honeysuckle", l: "Lonicera sempervirens",
    also: "", t: "vine", sun: ["full", "part"], moist: ["average", "damp"],
    zones: ["fence-line", "sunny-front"], style: ["tidy", "natural"], h: "Vine",
    s: { w: 70, nec: 90, host: 60, bird: 65, curb: 86, surv: 84, man: 85, ease: 85 },
    ability: { n: "Hummingbird Trumpet", d: "Coral tubes bloom for months and hummingbirds defend them." },
    weak: "Needs a trellis or fence to climb. Twines, never strangles.",
    role: "Well-behaved hummingbird vine",
    used: "Trellises, fences, mailbox posts, arbors.",
  },
  {
    id: "virginia-creeper", n: "Virginia Creeper", l: "Parthenocissus quinquefolia",
    also: "", t: "vine", sun: ["full", "part", "shade"], moist: ["dry", "average", "damp"],
    zones: ["fence-line", "under-tree"], style: ["natural", "wild"], h: "Vine",
    s: { w: 80, nec: 45, host: 75, bird: 88, curb: 62, surv: 92, man: 50, ease: 90 },
    ability: { n: "Fall Fire & Bird Berries", d: "Scarlet autumn leaves and dark berries dozens of bird species eat." },
    weak: "Vigorous. Clings by adhesive pads, so give it room and direction.",
    role: "Tough fall-color screen vine",
    used: "Fences, walls, large trees, bank cover.",
  },
  {
    id: "american-wisteria", n: "American Wisteria", l: "Wisteria frutescens",
    also: "", t: "vine", sun: ["full", "part"], moist: ["average", "damp"],
    zones: ["fence-line"], style: ["natural"], h: "Vine",
    s: { w: 68, nec: 85, host: 55, bird: 40, curb: 88, surv: 82, man: 70, ease: 72 },
    ability: { n: "Native Purple Drapes", d: "Hanging lilac clusters, far better mannered than the Asian wisterias." },
    weak: "Wants a sturdy support and a few years before it blooms well.",
    role: "Showy, restrained flowering vine",
    used: "Pergolas, arbors, strong fences.",
  },
  {
    id: "dutchmans-pipe", n: "Dutchman's Pipe", l: "Aristolochia tomentosa",
    also: "Woolly pipevine", t: "vine", sun: ["part", "shade", "full"], moist: ["average", "damp"],
    zones: ["fence-line", "under-tree"], style: ["natural"], h: "Vine",
    s: { w: 72, nec: 35, host: 90, bird: 35, curb: 80, surv: 82, man: 78, ease: 70 },
    ability: { n: "Pipevine Swallowtail Host", d: "The one plant pipevine swallowtails must have to breed." },
    weak: "Flowers are small and odd. Grown for big leaves and the butterflies.",
    role: "Shade screen and swallowtail host",
    used: "Porches, arbors, dense fast screens in part shade.",
  },
  {
    id: "virgins-bower", n: "Virgin's Bower", l: "Clematis virginiana",
    also: "Native clematis", t: "vine", sun: ["full", "part"], moist: ["average", "damp"],
    zones: ["fence-line", "under-tree"], style: ["natural", "wild"], h: "Vine",
    s: { w: 72, nec: 85, host: 55, bird: 35, curb: 70, surv: 85, man: 58, ease: 85 },
    ability: { n: "Late Froth & Beard", d: "Foamy white fall flowers, then silvery feathered seedheads." },
    weak: "Vigorous. Do not confuse with the invasive sweet autumn clematis it resembles.",
    role: "Frothy late-season native clematis",
    used: "Fences, shrubs to scramble through, woodland edges.",
  },
  {
    id: "trumpet-vine", n: "Trumpet Vine", l: "Campsis radicans",
    also: "Trumpet creeper", t: "vine", sun: ["full"], moist: ["dry", "average", "damp"],
    zones: ["fence-line"], style: ["wild"], h: "Vine",
    s: { w: 72, nec: 88, host: 45, bird: 50, curb: 45, surv: 95, man: 25, ease: 90 },
    ability: { n: "Hummingbird Cannon", d: "Big orange trumpets that hummingbirds cannot resist." },
    weak: "A thug. Suckers, climbs anything, and can lift shingles. Contain it.",
    role: "Aggressive hummingbird screen",
    used: "Big tough fences and posts you want covered fast, away from the house.",
  },
  {
    id: "white-oak", n: "White Oak", l: "Quercus alba",
    also: "", t: "tree", sun: ["full", "part"], moist: ["dry", "average", "damp"],
    zones: ["fence-line"], style: ["natural"], h: "Tree",
    s: { w: 99, nec: 25, host: 99, bird: 92, curb: 82, surv: 90, man: 88, ease: 72 },
    ability: { n: "The Keystone King", d: "Hosts more caterpillar species than nearly any other tree on the continent, and its cavities and limbs shelter owls, woodpeckers, and squirrels. Plant one and you house a whole food web." },
    weak: "Slow, enormous, and forever. A gift to the next generation, not instant shade.",
    role: "The ultimate wildlife canopy tree",
    used: "Large yards, legacy plantings, anywhere with room to grow up and out.",
  },
  {
    id: "bur-oak", n: "Bur Oak", l: "Quercus macrocarpa",
    also: "", t: "tree", sun: ["full"], moist: ["dry", "average", "damp"],
    zones: ["fence-line"], style: ["natural"], h: "Tree",
    s: { w: 98, nec: 25, host: 98, bird: 90, curb: 78, surv: 95, man: 88, ease: 78 },
    ability: { n: "Tough Prairie Oak", d: "A keystone oak that shrugs off drought, clay, and city stress, and ages into hollows that shelter owls and woodpeckers." },
    weak: "Massive at maturity. Big acorns to rake.",
    role: "Bombproof keystone shade tree",
    used: "Open yards, parkways, tough sites with space.",
  },
  {
    id: "red-maple", n: "Red Maple", l: "Acer rubrum",
    also: "", t: "tree", sun: ["full", "part"], moist: ["average", "damp", "wet"],
    zones: ["fence-line"], style: ["natural"], h: "Tree",
    s: { w: 80, nec: 55, host: 85, bird: 65, curb: 88, surv: 85, man: 82, ease: 85 },
    ability: { n: "Fall Fire", d: "Early red flowers feed spring bees, and the autumn color is unmatched." },
    weak: "Surface roots can buckle nearby pavement.",
    role: "Reliable native shade tree",
    used: "Lawns, street settings, damp spots, fall color.",
  },
  {
    id: "river-birch", n: "River Birch", l: "Betula nigra",
    also: "", t: "tree", sun: ["full", "part"], moist: ["average", "damp", "wet"],
    zones: ["fence-line", "wet-spot"], style: ["natural"], h: "Tree",
    s: { w: 78, nec: 30, host: 88, bird: 60, curb: 86, surv: 85, man: 78, ease: 82 },
    ability: { n: "Peeling Bark Beauty", d: "Cinnamon, curling bark for winter interest, and it loves wet feet." },
    weak: "Drops twigs and catkins. Wants moisture.",
    role: "Wet-tolerant ornamental tree",
    used: "Damp yards, rain-garden edges, near downspouts.",
  },
  {
    id: "tulip-tree", n: "Tulip Tree", l: "Liriodendron tulipifera",
    also: "Yellow poplar", t: "tree", sun: ["full", "part"], moist: ["average", "damp"],
    zones: ["fence-line"], style: ["natural"], h: "Tree",
    s: { w: 82, nec: 75, host: 80, bird: 55, curb: 82, surv: 80, man: 75, ease: 78 },
    ability: { n: "Tulip Flowers Up High", d: "Orange-and-green blooms feed pollinators, and it grows fast and straight." },
    weak: "Very tall, and weak wood can drop limbs.",
    role: "Fast tall native for big yards",
    used: "Large open yards with vertical room to spare.",
  },
  {
    id: "shagbark-hickory", n: "Shagbark Hickory", l: "Carya ovata",
    also: "", t: "tree", sun: ["full", "part"], moist: ["dry", "average"],
    zones: ["fence-line"], style: ["natural"], h: "Tree",
    s: { w: 90, nec: 20, host: 92, bird: 78, curb: 70, surv: 85, man: 85, ease: 70 },
    ability: { n: "Peeling Giant & Caterpillar Host", d: "Shaggy bark shelters bats, and it hosts dozens of moth species." },
    weak: "Slow, big, and the nuts are messy.",
    role: "High-value wildlife canopy tree",
    used: "Woodland edges, large naturalized yards.",
  },
  {
    id: "american-plum", n: "American Plum", l: "Prunus americana",
    also: "Wild plum", t: "tree", sun: ["full", "part"], moist: ["dry", "average"],
    zones: ["fence-line"], style: ["natural", "wild"], h: "Small tree",
    s: { w: 85, nec: 80, host: 88, bird: 72, curb: 78, surv: 85, man: 60, ease: 80 },
    ability: { n: "Cherry-Family Powerhouse", d: "Fragrant spring flowers, edible plums, and top-tier caterpillar value." },
    weak: "Suckers into a thicket. Give it room.",
    role: "Flowering wildlife small tree",
    used: "Hedgerows, fence lines, naturalized corners.",
  },
  {
    id: "hackberry", n: "Hackberry", l: "Celtis occidentalis",
    also: "", t: "tree", sun: ["full", "part"], moist: ["dry", "average", "damp"],
    zones: ["fence-line"], style: ["natural"], h: "Tree",
    s: { w: 86, nec: 30, host: 88, bird: 85, curb: 72, surv: 95, man: 80, ease: 88 },
    ability: { n: "Butterfly Host & Bird Berry", d: "Hosts hackberry and snout butterflies, and berries feed winter birds." },
    weak: "Plain looking, and can get nipple-gall (harmless).",
    role: "Tough urban-proof wildlife tree",
    used: "Hard sites, parkways, clay, city yards.",
  },
  // ENDPLANTS
];

// A comparison-only entry. NOT in PLANTS, so it is never recommended or ranked.
// It exists purely to be put head-to-head against a native, to show the gap.
// The stats are honest: turf genuinely wins on foot traffic (stays put) and is
// easy and tidy. It loses on the ecology, fairly, which is the whole point.
const TURF = {
  id: "turf-grass", n: "Turf Grass", l: "Poa / Festuca / Lolium spp.",
  also: "Kentucky bluegrass, fescue, ryegrass — the standard lawn mix",
  t: "grass", h: "Low", role: "The standard American lawn",
  s: { w: 4, nec: 2, host: 6, bird: 5, curb: 70, surv: 70, man: 85, ease: 27 },
  ability: { n: "Takes a Footstep", d: "The one real edge: a clipped lawn handles foot traffic and play that no native bed does. That is what it is for." },
  weak: "Near zero for wildlife, and it never stops asking for work: mowing, watering, fertilizer, pre-emergent, reseeding. A native bed settles in and largely tends itself.",
  used: "Paths, play areas, the parts of a yard you actually walk on.",
};

// =========================================================================
//  INVASIVES — the "what to remove" roster. Each links to native swaps by
//  plant id from PLANTS above, so the two halves of the app connect.
//  cat: shrub | tree | vine | groundcover | herb | grass | aquatic
// =========================================================================
const INVASIVES = [
  {
    id: "bush-honeysuckle", n: "Bush Honeysuckle", l: "Lonicera maackii / morrowii",
    also: "Amur, Morrow honeysuckle", t: "shrub", cat: "shrub", sev: "high",
    idtip: "Arching multi-stem shrub, opposite oval leaves that green up earliest and drop latest. Paired red berries. Snap a stem: the older wood is hollow.",
    why: "The worst woodland invader in the Midwest. Leafs out first and shades the forest floor bare. Its berries are junk food for birds, fat and sugar but no real fuel for migration.",
    remove: "Pull seedlings by hand. Cut larger stems and immediately paint the stumps, or they resprout with a vengeance. Easiest to spot and cut in late fall when natives are bare and it is still green.",
    swaps: ["serviceberry", "gray-dogwood", "elderberry", "winterberry"],
  },
  {
    id: "burning-bush", n: "Burning Bush", l: "Euonymus alatus",
    also: "Winged euonymus", t: "shrub", cat: "shrub", sev: "high",
    idtip: "Tidy shrub with corky wings running down green stems. Famous fluorescent-red fall color. Small purple-red berries.",
    why: "Sold for that fall color, then birds spread the seed into woods where it forms dense thickets. Banned for sale in a growing list of states.",
    remove: "Pull young plants, roots and all. Dig out or cut-and-treat the established ones. Replace it with a native that does the red-fall-color job better.",
    swaps: ["red-chokeberry", "fragrant-sumac", "highbush-blueberry", "aromatic-aster"],
  },
  {
    id: "callery-pear", n: "Callery Pear", l: "Pyrus calleryana",
    also: "Bradford pear", t: "tree", cat: "tree", sev: "high",
    idtip: "Small tree, glossy leaves, a dome of white spring flowers that smell unpleasant. Weak crotch angles split in storms.",
    why: "Once everyone's street tree, now escaping into fields and roadsides as thorny thickets. Banned from sale in several states. Offers almost nothing to native insects.",
    remove: "Cut and treat the stump for anything established. For the spring-flower and small-tree role, the native swaps are simply better trees.",
    swaps: ["serviceberry", "redbud", "pagoda-dogwood"],
  },
  {
    id: "japanese-barberry", n: "Japanese Barberry", l: "Berberis thunbergii",
    also: "Red barberry", t: "shrub", cat: "shrub", sev: "high",
    idtip: "Low spiny shrub, small spoon-shaped leaves often deep red, single thorns, and red oval berries that hang through winter.",
    why: "Forms dense thorny stands and, notably, harbors the ticks that spread Lyme disease. Changes the soil chemistry around it.",
    remove: "Wear thick gloves. Pull or dig the shallow roots, or cut and treat. Bag the berries so you do not seed the area.",
    swaps: ["new-jersey-tea", "fragrant-sumac", "aromatic-aster", "gray-goldenrod"],
  },
  {
    id: "wintercreeper", n: "Wintercreeper", l: "Euonymus fortunei",
    also: "Climbing euonymus", t: "vine", cat: "groundcover", sev: "high",
    idtip: "Evergreen glossy leaves with pale veins. Sprawls as groundcover, then climbs trees and fences as a thick woody vine.",
    why: "Smothers the ground so nothing native can germinate, then strangles and climbs trees. Evergreen, so it spreads even in winter.",
    remove: "Pull the groundcover mats, roots and all. Cut climbing vines at the base and treat the cut. Persistent: expect a few seasons of follow-up.",
    swaps: ["wild-ginger", "penn-sedge", "christmas-fern", "virginia-creeper"],
  },
  {
    id: "english-ivy", n: "English Ivy", l: "Hedera helix",
    also: "Common ivy", t: "vine", cat: "groundcover", sev: "high",
    idtip: "Evergreen, waxy lobed leaves on the ground; mature climbing growth has unlobed leaves and black berries.",
    why: "Carpets the ground and kills trees by adding weight and shading bark. Berries spread it into natural areas.",
    remove: "Roll up the mats by hand. Cut a band of vine off tree trunks at chest height and let the upper part die. No herbicide needed if you stay after it.",
    swaps: ["wild-ginger", "penn-sedge", "christmas-fern", "virginia-creeper"],
  },
  {
    id: "vinca", n: "Periwinkle", l: "Vinca minor",
    also: "Vinca, myrtle", t: "groundcover", cat: "groundcover", sev: "med",
    idtip: "Trailing evergreen mats, glossy paired leaves, five-petaled blue-violet pinwheel flowers in spring.",
    why: "Sold as easy shade groundcover, then escapes to blanket woodland floors and block spring wildflowers.",
    remove: "Pull and rake up the mats; the stems root as they run, so get the fragments. Smothering with cardboard and mulch works on big patches.",
    swaps: ["wild-ginger", "woodland-phlox", "wild-geranium", "foamflower"],
  },
  {
    id: "multiflora-rose", n: "Multiflora Rose", l: "Rosa multiflora",
    also: "Rambler rose", t: "shrub", cat: "shrub", sev: "high",
    idtip: "Arching thorny canes forming huge mounds. Clusters of small white flowers, then tiny red hips. Fringed leaf base is the giveaway.",
    why: "A single plant becomes an impenetrable thicket that crowds out pasture and woods edges. One of the most widespread rural invaders.",
    remove: "Heavy gloves and loppers. Dig the crown out or cut and treat. Mow seedlings repeatedly. Bag the hips.",
    swaps: ["american-hazelnut", "gray-dogwood", "elderberry", "ninebark"],
  },
  {
    id: "autumn-olive", n: "Autumn Olive", l: "Elaeagnus umbellata",
    also: "Autumnberry", t: "shrub", cat: "shrub", sev: "high",
    idtip: "Large shrub, leaves dark green above and silvery-scaly beneath. Fragrant pale flowers, then speckled red berries by the thousand.",
    why: "Fixes nitrogen and changes the soil, fueling more invasion. Birds scatter the heavy seed crop everywhere.",
    remove: "Pull seedlings. Cut and treat large stems; it resprouts fiercely if only cut. Tackle it before the berries ripen.",
    swaps: ["serviceberry", "elderberry", "gray-dogwood", "red-chokeberry"],
  },
  {
    id: "oriental-bittersweet", n: "Oriental Bittersweet", l: "Celastrus orbiculatus",
    also: "Asian bittersweet", t: "vine", cat: "vine", sev: "high",
    idtip: "Twining woody vine, round-toothed leaves, and yellow capsules that split to show red berries clustered along the stem.",
    why: "Ropes around and strangles trees, then pulls whole canopies down under its weight. The berry-laden vines are spread by birds and by holiday wreaths.",
    remove: "Cut the vine at the base and again at shoulder height; treat the lower cut. Pull seedlings. Never compost the berries.",
    swaps: ["virginia-creeper", "american-wisteria", "virgins-bower"],
  },
  {
    id: "japanese-honeysuckle", n: "Japanese Honeysuckle", l: "Lonicera japonica",
    also: "Hall's honeysuckle", t: "vine", cat: "vine", sev: "high",
    idtip: "Semi-evergreen twining vine, paired oval leaves, fragrant white-to-yellow tubular flowers, black berries.",
    why: "Blankets the ground and shrubs, twining tight enough to girdle stems. Holds its leaves late, smothering everything beneath.",
    remove: "Pull and dig the runners. Cut climbing stems and treat. Repeated mowing weakens ground infestations.",
    swaps: ["coral-honeysuckle", "virginia-creeper", "trumpet-vine"],
  },
  {
    id: "tree-of-heaven", n: "Tree of Heaven", l: "Ailanthus altissima",
    also: "Ailanthus, stinking sumac", t: "tree", cat: "tree", sev: "high",
    idtip: "Fast tree, long compound leaves with a smooth-edged leaflet that smells of rancid peanuts when crushed. Smooth gray bark.",
    why: "Grows explosively, poisons the soil against competitors, and is the favored host of the spotted lanternfly. Resprouts from roots if only cut.",
    remove: "Do not just cut it, that triggers root sprouts. Treat standing stems or cut-and-treat together, ideally late summer. Persistence required.",
    swaps: ["swamp-white-oak", "serviceberry", "redbud"],
  },
  {
    id: "norway-maple", n: "Norway Maple", l: "Acer platanoides",
    also: "", t: "tree", cat: "tree", sev: "med",
    idtip: "Dense shade tree, five-lobed leaves like a sugar maple but broader. Snap a leaf stem: Norway maple bleeds milky sap.",
    why: "Casts such deep shade that nothing grows beneath it, and seeds heavily into woodlots to replace native maples and oaks.",
    remove: "Pull seedlings, which carpet the ground each spring. Remove young trees before they seed. Replace with a high-value native canopy tree.",
    swaps: ["swamp-white-oak", "redbud", "pagoda-dogwood"],
  },
  {
    id: "garlic-mustard", n: "Garlic Mustard", l: "Alliaria petiolata",
    also: "", t: "bloom", cat: "herb", sev: "high",
    idtip: "First-year rosettes of scalloped kidney-shaped leaves; second year sends up a stalk of small white four-petal flowers. Crushed leaves smell of garlic.",
    why: "Releases chemicals that sabotage the soil fungi native plants and tree seedlings depend on. Spreads fast across shaded ground.",
    remove: "Hand-pull before it sets seed in late spring, getting the root. Bag and trash it, do not compost. Several years of pulling clears a patch.",
    swaps: ["virginia-bluebells", "wild-geranium", "woodland-phlox", "wild-ginger"],
  },
  {
    id: "lesser-celandine", n: "Lesser Celandine", l: "Ficaria verna",
    also: "Fig buttercup", t: "bloom", cat: "herb", sev: "med",
    idtip: "Low spring carpet of glossy heart-shaped leaves and glossy yellow buttercup flowers. Vanishes by early summer.",
    why: "Blankets damp ground in early spring exactly when native ephemerals need the light and space, then disappears, leaving bare soil.",
    remove: "Tough: it grows from tiny tubers and bulbils that break off and spread. Dig small patches carefully and completely; treat large ones early.",
    swaps: ["virginia-bluebells", "marsh-marigold", "celandine-poppy", "wild-geranium"],
  },
  {
    id: "purple-loosestrife", n: "Purple Loosestrife", l: "Lythrum salicaria",
    also: "", t: "bloom", cat: "aquatic", sev: "high",
    idtip: "Tall wetland plant, square stems, narrow paired leaves, and showy spikes of magenta flowers in summer.",
    why: "Takes over wetlands as a monoculture, choking out the cattails and sedges that waterfowl and amphibians need.",
    remove: "Dig small stands, getting the whole woody root. Bag the flower spikes, a single plant makes millions of seeds. Treat large infestations.",
    swaps: ["joe-pye", "blue-flag-iris", "swamp-milkweed", "queen-of-the-prairie"],
  },
  {
    id: "reed-canary-grass", n: "Reed Canary Grass", l: "Phalaris arundinacea",
    also: "", t: "grass", cat: "grass", sev: "high",
    idtip: "Tall coarse grass forming dense wet-ground stands. Flower head is feathery, opening then drawing in tight. Often the only thing growing in a wet ditch.",
    why: "Builds impenetrable sod in wet meadows and ditches, flattening all diversity into a single-species mat.",
    remove: "Hard to budge once established. Smother small areas; repeated cutting and treatment for larger. Replant fast with vigorous wet natives.",
    swaps: ["tussock-sedge", "fox-sedge", "soft-rush", "blue-flag-iris"],
  },
  {
    id: "crown-vetch", n: "Crown Vetch", l: "Securigera varia",
    also: "", t: "bloom", cat: "groundcover", sev: "med",
    idtip: "Sprawling legume with compound leaves and pinkish-white clustered pea flowers. Planted on road banks, now everywhere on slopes.",
    why: "Smothers slopes and prairies under a dense tangle, fixing nitrogen that helps yet more weeds move in.",
    remove: "Pull or dig the crowns; mow repeatedly to starve it. Replant slopes immediately with deep-rooted natives that hold soil.",
    swaps: ["fragrant-sumac", "purple-poppy-mallow", "little-bluestem", "prairie-dropseed"],
  },
  // ENDINVASIVES
];

export default function App() {
  return <Game />;
}

// =========================================================================
//  YARD ZONES + CONDITION OPTIONS
// =========================================================================
// Goals capture INTENT — what you want the planting to DO — which the physical
// conditions screen (sun/moisture/space) can't express. Goal fit is derived
// from the stats and height we already track, so no plant needs hand-tagging.
const GOALS = [
  { id: "wildlife", name: "Pollinator & wildlife garden", desc: "Feed bees, butterflies, and birds. Maximize life." },
  { id: "privacy", name: "Privacy screen / block a view", desc: "Tall, dense plants to screen or enclose." },
  { id: "pretty", name: "Make this bed look good", desc: "Tidy, showy, intentional. Curb appeal first." },
  { id: "notsure", name: "Not sure / just show me good plants", desc: "No particular goal. Show strong all-rounders." },
];

// Returns a goal-fit bonus (roughly -8..+18) for a plant given the chosen goal.
// Each goal leans on the traits that actually serve that intent.
function goalFit(p, goalId) {
  const big = sizeClass(p) >= 2; // tall perennial, shrub, vine, or tree
  const woody = p.h === "Shrub" || p.h === "Small tree" || p.h === "Tree";
  switch (goalId) {
    case "wildlife": // reward overall wildlife + host value
      return (p.s.w - 55) * 0.34 + (p.s.host - 50) * 0.16;
    case "privacy": // reward tall, woody, dense screening plants
      return (woody ? 22 : big ? 10 : -16) + (p.s.surv - 60) * 0.06;
    case "pretty": // reward curb appeal and tidy manners
      return (p.s.curb - 55) * 0.34 + (p.s.man - 60) * 0.1;
    default: // notsure: gentle nudge toward strong, easy all-rounders
      return (p.s.w - 60) * 0.1 + (p.s.ease - 60) * 0.08;
  }
}

const SUN = [
  { id: "full", name: "Full Sun", hint: "6+ hours of direct sun." },
  { id: "partsun", name: "Part Sun", hint: "Roughly 4 to 6 hours, or strong morning sun." },
  { id: "lightshade", name: "Light Shade", hint: "Dappled light, or just a few hours of sun." },
  { id: "deepshade", name: "Deep Shade", hint: "Little to no direct sun all day." },
  { id: "notsure", name: "Not Sure", hint: "No problem. I'll keep the picks flexible on light." },
];
const MOIST = [
  { id: "dry", name: "Dry", hint: "Drains fast and dries out. Slopes, sand, curb strips." },
  { id: "average", name: "Average", hint: "Typical garden soil. Neither soggy nor parched." },
  { id: "moist", name: "Moist", hint: "Stays damp and is slow to dry out." },
  { id: "wet", name: "Wet", hint: "Soggy after rain. Near downspouts and low spots." },
  { id: "standing", name: "Standing Water", hint: "Holds water. Pond edges, ditches, rain-garden bottoms." },
  { id: "notsure", name: "Not Sure", hint: "No problem. I'll keep the picks flexible on water." },
];

// Sun and moisture are matched on a level ladder, so each option returns a
// genuinely different set of plants. Plant tags map onto these levels, with a
// short hand-curated list for the two distinctions the raw tags can't carry:
// which shade plants take DEEP shade, and which wet plants take STANDING water.
const SUN_LEVEL = { full: 4, partsun: 3, lightshade: 2, deepshade: 1, notsure: null };
const MOIST_LEVEL = { dry: 1, average: 2, moist: 3, wet: 4, standing: 5, notsure: null };
const DEEP_SHADE = new Set(["wild-ginger", "penn-sedge", "wild-geranium", "zigzag-goldenrod",
  "christmas-fern", "maidenhair-fern", "foamflower", "solomons-seal", "false-solomons-seal",
  "bloodroot", "large-flowered-trillium", "hepatica", "mayapple", "white-wood-aster",
  "blue-cohosh", "twinleaf", "spicebush", "pagoda-dogwood", "sensitive-fern", "celandine-poppy"]);
const STANDING = new Set(["blue-flag-iris", "soft-rush", "buttonbush",
  "tussock-sedge", "winterberry", "marsh-marigold", "swamp-white-oak"]);

function sunLevels(p) {
  const L = new Set();
  if (p.sun.includes("full")) L.add(4);
  if (p.sun.includes("part")) L.add(p.sun.includes("shade") ? 2 : 3);
  if (p.sun.includes("shade")) { L.add(2); if (DEEP_SHADE.has(p.id)) L.add(1); }
  return L;
}
function moistLevels(p) {
  const map = { dry: 1, average: 2, damp: 3, wet: 4 };
  const L = new Set(p.moist.map((m) => map[m]));
  if (STANDING.has(p.id)) L.add(5);
  return L;
}
// Style is a single Neat <-> Wild spectrum. The slider value (0 = neat,
// 100 = wild) maps to a descriptor and feeds the scoring. Higher = bigger,
// looser, more wildlife-first.
const STYLE_BANDS = [
  { max: 19, name: "Neat & tidy", desc: "Compact, well-behaved plants. Reads intentional." },
  { max: 39, name: "Mostly tidy", desc: "Low and contained, with a little softness." },
  { max: 59, name: "Relaxed garden", desc: "Fuller and layered, still clearly tended." },
  { max: 79, name: "Loose & layered", desc: "Taller, spreads more, casual edges." },
  { max: 100, name: "Full & wild", desc: "Tall, bold, wildlife-first. Let it go." },
];
const styleBand = (v) => STYLE_BANDS.find((b) => v <= b.max) || STYLE_BANDS[STYLE_BANDS.length - 1];

// How "kept" a plant reads: 0 (big / loose / sprawling) .. 100 (compact / neat),
// derived from its height, its manners (spread behavior), and its curb appeal.
const HEIGHT_NEAT = { Low: 95, Medium: 68, Tall: 22, Shrub: 28, "Small tree": 35, Tree: 25, Vine: 45 };

// Tallamy keystone genera: the plants that support the most caterpillar and
// insect life, the base of the food web. Membership is by GENUS (the first word
// of the Latin name), which is the scientifically honest definition, not a score.
const KEYSTONE_GENERA = new Set([
  "Quercus", "Salix", "Prunus", "Populus", "Betula", "Acer", "Solidago",
  "Symphyotrichum", "Helianthus", "Vaccinium", "Carya", "Corylus", "Rubus",
  "Crataegus", "Celtis",
]);
const isKeystone = (p) => KEYSTONE_GENERA.has((p.l || "").split(" ")[0]);

// Group plants by life form for a quick "what am I actually planting" badge.
// Woody, long-lived plants (trees, shrubs, vines) are a bigger commitment than
// a perennial, so the badge sets expectations before you read the stats.
function formOf(plant) {
  const h = plant.h;
  if (h === "Tree" || h === "Small tree") return { label: "Tree", color: C.greenDeep };
  if (h === "Shrub") return { label: "Shrub", color: C.green };
  if (h === "Vine") return { label: "Vine", color: C.green };
  return { label: "Perennial", color: "#8a7c52" };
}
function neatness(p) {
  const h = HEIGHT_NEAT[p.h] ?? 60;
  return 0.55 * h + 0.25 * p.s.man + 0.2 * p.s.curb;
}

// How much room a spot has. Maps to plant footprint (size class 1=small .. 3=big).
// A soft preference: a too-big plant for a tight spot is ranked down, not removed.
const SPACE = [
  { id: "tight", name: "Tight", max: 1, hint: "A strip or small bed. Keep it low and contained." },
  { id: "room", name: "Room to fill", max: 2, hint: "A normal bed or border. Up through tall perennials and shrubs." },
  { id: "open", name: "Wide open", max: 3, hint: "A big yard or back corner. Anything goes, trees included." },
  { id: "notsure", name: "Not Sure", max: null, hint: "No problem. I won't filter by size." },
];
// plant footprint: 1 = small/low, 2 = tall perennial or shrub, 3 = tree
const SIZE_CLASS = { Low: 1, Medium: 1, Vine: 2, Tall: 2, Shrub: 2, "Small tree": 3, Tree: 3 };
const sizeClass = (p) => SIZE_CLASS[p.h] ?? 2;

// =========================================================================
//  SCORING ENGINE
// The score answers one honest question: how good a choice is this plant for
// THIS spot, for a beginner who cares about wildlife? Three real parts:
//   1. Fit      — does it tolerate the sun and moisture, and is the spot what
//                 it is actually for (zone)? Conditions are the gate.
//   2. Quality  — among plants that fit, the better wildlife plant and the
//                 easier-to-grow plant is the better recommendation.
//   3. Style    — does its size/tidiness match what the slider asked for?
// Realistic ceiling lands in the mid-90s; a true keystone in a perfect spot can
// brush 98. A plant that simply tolerates the spot still floors around 60, which
// is honest: it will grow, it is just not what the spot is best for.
function scorePlant(p, sel) {
  // 1. FIT --------------------------------------------------------------
  let fit = 0;
  if (sel.sun === "notsure") fit += 18;
  else fit += sunLevels(p).has(SUN_LEVEL[sel.sun]) ? 24 : -38; // sun is a hard fact
  if (sel.moist === "notsure") fit += 18;
  else fit += moistLevels(p).has(MOIST_LEVEL[sel.moist]) ? 24 : -34; // so is moisture
  fit += goalFit(p, sel.zone); // sel.zone now holds the chosen GOAL id

  // 2. QUALITY ----------------------------------------------------------
  // Universal quality is just how easy it is to grow — a good recommendation
  // for ANY goal is one a beginner can succeed with. Trait emphasis (wildlife,
  // curb appeal, screening) lives in the goal, so it is not double-counted here.
  let quality = 0.14 * p.s.ease;

  // 3. STYLE ------------------------------------------------------------
  // "any" (no preference) applies no neat/wild push; otherwise styleWild is a
  // band-center number where lower = wants it neat, higher = wants it wild.
  let style = 6;
  if (sel.styleWild !== "any" && sel.styleWild != null) {
    const userNeat = 1 - sel.styleWild / 100; // 1 = wants it neat
    const plantNeat = neatness(p) / 100;
    const gap = plantNeat - userNeat; // < 0 means wilder/bigger than wanted
    if (gap < 0) style += gap * userNeat * 28; // neat-seekers push big loose plants down
    style += 5 * (1 - plantNeat) * (1 - userNeat); // wild-seekers pull bold natives up
  }

  // 4. SPACE ------------------------------------------------------------
  // Soft: a plant bigger than the spot can hold loses points per size step over,
  // scaled so a tree in a tight bed drops hard but a shrub only dips. Never excluded.
  let space = 0;
  const cap = SPACE.find((o) => o.id === sel.space)?.max;
  if (cap != null) {
    const over = sizeClass(p) - cap;
    if (over > 0) space -= over * 16;
  }

  return fit + quality + style + space;
}

function rankPlants(sel) {
  return PLANTS
    .map((p) => {
      const raw = scorePlant(p, sel);
      return { p, raw, score: Math.max(0, Math.min(99, Math.round(raw))) };
    })
    .sort((a, b) => b.raw - a.raw);
}

// pick the stat where the backup most beats the hero
function differentiator(hero, backup) {
  let best = null, bestDelta = 4;
  for (const [k] of STATS) {
    const d = backup.s[k] - hero.s[k];
    if (d > bestDelta) { bestDelta = d; best = k; }
  }
  return best ? STAT_PHRASE[best] : "a different look for the same spot";
}

// =========================================================================
//  SILHOUETTE PLACEHOLDER  (vintage cut-paper feel)
// =========================================================================
function Silhouette({ type, size = 96, color = C.greenDeep }) {
  const common = { fill: color, opacity: 0.92 };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill="#fff" opacity="0.5" />
      {type === "grass" && (
        <g {...common}>
          {[34, 42, 50, 58, 66].map((x, i) => (
            <path key={i} d={`M${x} 88 Q${x + (i % 2 ? 7 : -7)} 55 ${x + (i % 2 ? 2 : -2)} 20`}
              stroke={color} strokeWidth="3.2" fill="none" strokeLinecap="round" />
          ))}
        </g>
      )}
      {type === "shrub" && (
        <g {...common}>
          <path d="M50 90 L50 50" stroke={color} strokeWidth="4" />
          <path d="M50 64 L34 50 M50 60 L66 46 M50 54 L40 38 M50 50 L62 34"
            stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
          {[[34, 50], [66, 46], [40, 38], [62, 34], [50, 28]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="9" />
          ))}
        </g>
      )}
      {type === "bloom" && (
        <g {...common}>
          <path d="M50 90 L50 44" stroke={color} strokeWidth="3.4" />
          <path d="M50 70 Q38 64 32 70 Q44 72 50 70 Z" />
          <path d="M50 60 Q62 54 68 60 Q56 62 50 60 Z" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="50" cy="30" rx="5.5" ry="11"
              transform={`rotate(${a} 50 40)`} />
          ))}
          <circle cx="50" cy="40" r="6.5" fill={C.gold} />
        </g>
      )}
      {type === "vine" && (
        <g {...common}>
          <path d="M50 92 C30 78 70 64 48 50 C28 38 68 26 50 12"
            stroke={color} strokeWidth="3.4" fill="none" strokeLinecap="round" />
          {[[40, 70], [60, 58], [40, 40], [58, 28], [48, 16]].map(([cx, cy], i) => (
            <path key={i} d={`M${cx} ${cy} q6 -5 11 0 q-5 6 -11 0 z`} />
          ))}
        </g>
      )}
      {type === "tree" && (
        <g {...common}>
          <path d="M50 92 L50 56" stroke={color} strokeWidth="5" strokeLinecap="round" />
          <path d="M50 66 L38 56 M50 62 L62 52" stroke={color} strokeWidth="3.5"
            fill="none" strokeLinecap="round" />
          <circle cx="50" cy="38" r="20" />
          <circle cx="34" cy="46" r="12" />
          <circle cx="66" cy="46" r="12" />
        </g>
      )}
      {type === "groundcover" && (
        <g {...common}>
          {[[30, 70], [48, 74], [66, 70], [39, 58], [57, 58], [48, 46]].map(([cx, cy], i) => (
            <path key={i} d={`M${cx} ${cy} q7 -6 13 0 q-6 7 -13 0 z`} />
          ))}
        </g>
      )}
    </svg>
  );
}

// =========================================================================
//  SMALL UI PIECES
// =========================================================================
// Robust clipboard copy. Tries the modern API, then falls back to a
// selection + execCommand path that works on iOS Safari and in older browsers.
// Returns a Promise<boolean> that resolves true only if the copy succeeded.
function copyText(text) {
  const fallback = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.readOnly = false;
      ta.contentEditable = "true";
      ta.style.position = "fixed";
      ta.style.top = "0";
      ta.style.left = "0";
      ta.style.width = "1px";
      ta.style.height = "1px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      const range = document.createRange();
      range.selectNodeContents(ta);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      ta.setSelectionRange(0, text.length);
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) {
      return false;
    }
  };
  if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true, () => fallback());
  }
  return Promise.resolve(fallback());
}

// quick lookup: stat key -> [name, explanation]
const STAT_INFO = Object.fromEntries(STATS.map(([k, name, desc]) => [k, { name, desc }]));

// Precompute, once, where each plant ranks for each power (1 = highest), across
// all plants. Used for the inline "#N" badge and the Hall of Fame list.
const STAT_ORDER = {}; // statKey -> plants sorted high to low
const STAT_RANK = {};  // statKey -> { plantId: rank }
for (const [k] of STATS) {
  const sorted = [...PLANTS].sort((a, b) => b.s[k] - a.s[k]);
  STAT_ORDER[k] = sorted;
  STAT_RANK[k] = {};
  sorted.forEach((p, i) => { STAT_RANK[k][p.id] = i + 1; });
}
const PLANT_TOTAL = PLANTS.length;

// Tap the Latin name to copy it. Text stays selectable, so a manual
// long-press-to-select still works as a fallback if the copy is blocked.
function LatinName({ name, size = 16 }) {
  const [copied, setCopied] = useState(false);
  const onTap = () => {
    copyText(name).then((ok) => {
      if (ok) { setCopied(true); setTimeout(() => setCopied(false), 1400); }
    });
  };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <span
        onClick={onTap}
        title="Tap to copy"
        style={{ fontFamily: FONT_BODY, fontStyle: "italic", fontSize: size, color: C.inkSoft,
          cursor: "pointer", textDecoration: "underline dotted", textUnderlineOffset: 3,
          textDecorationColor: C.cardEdge, overflowWrap: "anywhere" }}
      >
        {name}
      </span>
      {copied && (
        <span style={{ fontStyle: "normal", fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase",
          color: "#fff", background: C.green, borderRadius: 4, padding: "1px 6px" }}>Copied</span>
      )}
    </span>
  );
}

function StatBar({ statKey, label, value, onInfo }) {
  return (
    <div style={{ marginBottom: 9 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONT_BODY,
        fontSize: 14.5, color: C.inkSoft, letterSpacing: 0.2, marginBottom: 3 }}>
        <button onClick={() => onInfo && onInfo(statKey)} style={{ display: "inline-flex",
          alignItems: "center", gap: 5, background: "none", border: "none", padding: 0,
          cursor: onInfo ? "pointer" : "default", color: C.inkSoft, font: "inherit" }}>
          <span style={{ textTransform: "uppercase", letterSpacing: 1, fontSize: 11.5 }}>{label}</span>
          {onInfo && (
            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 14, height: 14, borderRadius: "50%", border: `1px solid ${C.cardEdge}`,
              fontSize: 9.5, fontWeight: 700, fontStyle: "italic", color: C.green,
              lineHeight: 1, fontFamily: FONT_DISP }}>i</span>
          )}
        </button>
        <span style={{ fontFamily: FONT_DISP, fontWeight: 600, color: C.ink }}>{value}</span>
      </div>
      <div style={{ height: 7, background: "#e6dabf", borderRadius: 4, overflow: "hidden",
        border: `1px solid ${C.cardEdge}` }}>
        <div style={{ width: `${value}%`, height: "100%",
          background: `linear-gradient(90deg, ${C.green}, ${C.greenDeep})` }} />
      </div>
    </div>
  );
}

function StatInfoModal({ statKey, onClose, onSeeRanking, z = 50 }) {
  if (!statKey) return null;
  const info = STAT_INFO[statKey];
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: z,
      background: "rgba(43,38,32,0.5)", display: "flex", alignItems: "center",
      justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.card,
        border: `1.5px solid ${C.cardEdge}`, borderRadius: 14, maxWidth: 340, width: "100%",
        boxShadow: "0 18px 50px rgba(40,30,15,0.4)", overflow: "hidden" }}>
        <div style={{ background: C.greenDeep, color: "#f3ecd9", padding: "11px 18px",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: FONT_DISP, fontWeight: 600, fontSize: 18 }}>{info.name}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
            color: "#e7dcc4", fontSize: 18, lineHeight: 1, padding: 0 }}>✕</button>
        </div>
        <div style={{ padding: "16px 18px 18px" }}>
          <p style={{ margin: 0, fontFamily: FONT_BODY, fontSize: 16.5, lineHeight: 1.5,
            color: C.ink }}>{info.desc}</p>
          <div style={{ marginTop: 14, fontFamily: FONT_BODY, fontSize: 13, fontStyle: "italic",
            color: C.inkSoft, borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
            Scores run 0 to 99. Higher is more.
          </div>
          {onSeeRanking && (
            <button onClick={() => onSeeRanking(statKey)} style={{ width: "100%", marginTop: 14,
              cursor: "pointer", fontFamily: FONT_DISP, fontWeight: 600, fontSize: 15,
              padding: "11px", borderRadius: 9, border: `1.5px solid ${C.greenDeep}`,
              background: C.card, color: C.greenDeep }}>
              See the top 10 for {info.name} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hall of Fame: a top-10 ranking for one power, reachable only from the stat
// popup. Tapping a plant drills into its full card; back returns to the list.
function HallOfFame({ statKey, onClose }) {
  const [viewId, setViewId] = useState(null);
  const [infoStat, setInfoStat] = useState(null); // stat popup while inside the hall
  if (!statKey) return null;
  const info = STAT_INFO[statKey];
  const top = STAT_ORDER[statKey].slice(0, 10);
  const plant = viewId ? PLANTS.find((p) => p.id === viewId) : null;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 60,
      background: "rgba(43,38,32,0.55)", display: "flex", alignItems: "flex-start",
      justifyContent: "center", padding: "32px 10px", overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.card,
        border: `1.5px solid ${C.cardEdge}`, borderRadius: 14, maxWidth: 460, width: "100%",
        boxShadow: "0 18px 50px rgba(40,30,15,0.4)", overflow: "hidden" }}>
        <div style={{ background: C.greenDeep, color: "#f3ecd9", padding: "11px 18px",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: 12, letterSpacing: 2,
            textTransform: "uppercase" }}>Top 10 · {info.name}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
            color: "#e7dcc4", fontSize: 18, lineHeight: 1, padding: 0 }}>✕</button>
        </div>

        {plant ? (
          <div style={{ padding: "12px 10px" }}>
            <button onClick={() => setViewId(null)} style={{ background: "none", border: "none",
              cursor: "pointer", fontFamily: FONT_BODY, fontSize: 14, color: C.green,
              padding: "0 0 12px" }}>← Back to the ranking</button>
            <HeroCard plant={plant} score={null} isTop standalone compact onInfo={setInfoStat} />
          </div>
        ) : (
          <div style={{ padding: "14px 16px 18px" }}>
            <p style={{ margin: "0 0 12px", fontFamily: FONT_BODY, fontSize: 14, fontStyle: "italic",
              color: C.inkSoft }}>The strongest plants in the roster for {info.name.toLowerCase()}, of all {PLANT_TOTAL}. Tap any to open its card.</p>
            <div style={{ display: "grid", gap: 8 }}>
              {top.map((p, i) => (
                <button key={p.id} onClick={() => setViewId(p.id)} style={{ textAlign: "left",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 12, width: "100%",
                  background: C.card, border: `1.5px solid ${i === 0 ? C.green : C.cardEdge}`,
                  borderRadius: 10, padding: "9px 12px" }}>
                  <span style={{ flex: "0 0 auto", width: 24, textAlign: "center", fontFamily: FONT_DISP,
                    fontWeight: 700, fontSize: 16, color: i < 3 ? C.green : "#b0a181" }}>{i + 1}</span>
                  <div style={{ flex: "0 0 auto", width: 38, height: 38, borderRadius: 8,
                    background: C.paper, border: `1px solid ${C.cardEdge}`, display: "flex",
                    alignItems: "center", justifyContent: "center" }}>
                    <Silhouette type={p.t} size={30} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FONT_DISP, fontWeight: 600, fontSize: 15.5,
                      overflowWrap: "break-word" }}>{p.n}</div>
                  </div>
                  <div style={{ flex: "0 0 auto", width: 70, display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ flex: 1, height: 6, background: "#e6dabf", borderRadius: 3,
                      overflow: "hidden", border: `1px solid ${C.cardEdge}` }}>
                      <div style={{ width: `${p.s[statKey]}%`, height: "100%",
                        background: `linear-gradient(90deg, ${C.green}, ${C.greenDeep})` }} />
                    </div>
                    <span style={{ fontFamily: FONT_DISP, fontWeight: 700, fontSize: 14,
                      color: C.ink }}>{p.s[statKey]}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <StatInfoModal statKey={infoStat} onClose={() => setInfoStat(null)} z={70} />
    </div>
  );
}

function CardButton({ active, onClick, children, locked }) {
  return (
    <button
      onClick={locked ? undefined : onClick}
      style={{
        textAlign: "left", width: "100%", cursor: locked ? "not-allowed" : "pointer",
        background: active ? C.greenDeep : C.card,
        color: active ? "#f7f1e2" : locked ? "#a99d83" : C.ink,
        border: `1.5px solid ${active ? C.greenDeep : C.cardEdge}`,
        borderRadius: 10, padding: "14px 16px", opacity: locked ? 0.55 : 1,
        boxShadow: active ? "none" : "0 1px 0 #fff inset, 0 2px 5px rgba(70,55,30,0.08)",
        transition: "transform .08s", fontFamily: FONT_BODY,
      }}
    >
      {children}
    </button>
  );
}

// =========================================================================
//  LAYOUT HELPERS
// =========================================================================
function Frame({ children }) {
  return (
    <div style={{
      minHeight: "100%", width: "100%", boxSizing: "border-box",
      background: `radial-gradient(circle at 30% 0%, ${C.paper}, ${C.paperDeep})`,
      fontFamily: FONT_BODY, color: C.ink, padding: "22px 16px 56px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Crimson+Pro:wght@400;500;600&display=swap');
        * { -webkit-tap-highlight-color: transparent; }
        button:active { transform: scale(0.985); }
      `}</style>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

function Masthead({ mode, onHome }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
        <button onClick={onHome} style={{ background: "none", border: "none", padding: 0,
          cursor: mode === "home" ? "default" : "pointer", fontFamily: FONT_DISP,
          fontWeight: 700, fontSize: 27, letterSpacing: 0.5, color: C.greenDeep }}>PLOT</button>
        <span style={{ fontFamily: FONT_BODY, fontSize: 14, fontStyle: "italic",
          color: C.inkSoft }}>Native Plant Field Guide · Central Indiana</span>
      </div>
      <div style={{ borderTop: `2px solid ${C.greenDeep}`, borderBottom: `1px solid ${C.line}`,
        height: 4, margin: "8px 0 14px" }} />
      {mode !== "home" && (
        <button onClick={onHome} style={{ background: "none", border: "none", cursor: "pointer",
          fontFamily: FONT_BODY, fontSize: 13, letterSpacing: 1, textTransform: "uppercase",
          color: mode === "remove" ? C.rust : C.green, padding: 0 }}>
          ⌂ Home
        </button>
      )}
    </div>
  );
}

function Heading({ kicker, title }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {kicker && <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, letterSpacing: 2,
        textTransform: "uppercase", color: C.rust, marginBottom: 4 }}>{kicker}</div>}
      <h2 style={{ fontFamily: FONT_DISP, fontWeight: 600, fontSize: 25, margin: 0,
        lineHeight: 1.15, color: C.ink }}>{title}</h2>
    </div>
  );
}

function BackLink({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: "none", border: "none", cursor: "pointer",
      fontFamily: FONT_BODY, fontSize: 15, color: C.inkSoft, padding: "4px 0", marginBottom: 6 }}>
      ← Back
    </button>
  );
}

// =========================================================================
//  SCREENS
// =========================================================================
function RegionScreen({ onPick, onHome }) {
  const locked = ["Northern Indiana", "Southern Indiana", "Great Lakes / Midwest", "Eastern Woodlands"];
  return (
    <>
      {onHome && <BackLink onClick={onHome} />}
      <Heading kicker="Step One" title="Choose your region" />
      <CardButton active={false} onClick={() => onPick()}>
        <div style={{ fontFamily: FONT_DISP, fontWeight: 600, fontSize: 19 }}>Central Indiana</div>
        <div style={{ fontSize: 14.5, color: C.inkSoft, marginTop: 3 }}>
          Fishers, Carmel, Indianapolis, Noblesville, Westfield
        </div>
        <div style={{ fontSize: 13.5, color: C.inkSoft, marginTop: 8, lineHeight: 1.45 }}>
          Soils: often clay-heavy · Climate: humid summers, freeze-thaw winters<br />
          Best for: prairie, woodland edge, wetland, savanna natives
        </div>
        <div style={{ display: "inline-block", marginTop: 10, fontSize: 12, letterSpacing: 1.5,
          textTransform: "uppercase", color: C.green, fontWeight: 700 }}>Tap to begin →</div>
      </CardButton>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
        {locked.map((r) => (
          <CardButton key={r} locked>
            <div style={{ fontFamily: FONT_DISP, fontWeight: 600, fontSize: 15.5 }}>{r}</div>
            <div style={{ fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase",
              marginTop: 6, color: "#a99d83" }}>Coming soon</div>
          </CardButton>
        ))}
      </div>
    </>
  );
}

function ZoneScreen({ current, onBack, onPick }) {
  return (
    <>
      <BackLink onClick={onBack} />
      <Heading kicker="Step Two" title="What are you trying to do?" />
      <div style={{ display: "grid", gap: 10 }}>
        {GOALS.map((g) => (
          <CardButton key={g.id} active={current === g.id} onClick={() => onPick(g.id)}>
            <div style={{ fontFamily: FONT_DISP, fontWeight: 600, fontSize: 18 }}>{g.name}</div>
            <div style={{ fontSize: 14, color: current === g.id ? "#e7dcc4" : C.inkSoft, marginTop: 3 }}>{g.desc}</div>
          </CardButton>
        ))}
      </div>
    </>
  );
}

function ChipRow({ label, scale, options, value, onChange }) {
  const sel = options.find((o) => o.id === value);
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline",
        marginBottom: 8 }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 12.5, letterSpacing: 1.6,
          textTransform: "uppercase", color: C.inkSoft }}>{label}</span>
        {scale && <span style={{ fontFamily: FONT_BODY, fontSize: 11, letterSpacing: 0.5,
          color: "#b0a181" }}>{scale}</span>}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((o) => {
          const active = value === o.id;
          const ns = o.id === "notsure" || o.id === "any";
          return (
            <button key={o.id} onClick={() => onChange(o.id)} style={{
              cursor: "pointer", fontFamily: FONT_BODY, fontSize: 15,
              padding: "9px 15px", borderRadius: 999,
              border: `1.5px ${ns ? "dashed" : "solid"} ${active ? C.greenDeep : C.cardEdge}`,
              background: active ? C.greenDeep : C.card,
              color: active ? "#f7f1e2" : ns ? C.inkSoft : C.ink,
            }}>{o.name}</button>
          );
        })}
      </div>
      <div style={{ fontSize: 14, fontStyle: "italic", color: C.inkSoft, marginTop: 8,
        minHeight: 19 }}>{sel ? sel.hint : "\u00A0"}</div>
    </div>
  );
}

// Style as a pick-one row, matching Sun/Moisture/Space. The stored value stays
// the band-center number the scoring expects; id <-> value translate at the call site.
const STYLE_OPTS = [
  { id: 10, name: "Neat & tidy", hint: "Compact, well-behaved plants. Reads intentional." },
  { id: 30, name: "Mostly tidy", hint: "Low and contained, with a little softness." },
  { id: 50, name: "Relaxed garden", hint: "Fuller and layered, still clearly tended." },
  { id: 70, name: "Loose & layered", hint: "Taller, spreads more, casual edges." },
  { id: 90, name: "Full & wild", hint: "Tall, bold, wildlife-first. Let it go." },
  { id: "any", name: "No preference", hint: "No particular look. I won't filter by tidiness." },
];

function ConditionsScreen({ sel, onChange, onBack, onSubmit }) {
  const ready = sel.sun && sel.moist;
  return (
    <>
      <BackLink onClick={onBack} />
      <Heading kicker="Step Three" title="Tell me about the spot" />
      <ChipRow label="Sunlight" scale="brighter → shadier" options={SUN} value={sel.sun} onChange={(v) => onChange({ sun: v })} />
      <ChipRow label="Moisture" scale="drier → wetter" options={MOIST} value={sel.moist} onChange={(v) => onChange({ moist: v })} />
      <ChipRow label="Space" scale="tighter → roomier" options={SPACE} value={sel.space} onChange={(v) => onChange({ space: v })} />
      <ChipRow label="Look" scale="neat → wild" options={STYLE_OPTS} value={sel.styleWild} onChange={(v) => onChange({ styleWild: v })} />
      <button disabled={!ready} onClick={onSubmit} style={{
        width: "100%", cursor: ready ? "pointer" : "not-allowed", fontFamily: FONT_DISP,
        fontWeight: 600, fontSize: 17, letterSpacing: 0.5, padding: "15px",
        borderRadius: 10, border: "none", color: "#f7f1e2",
        background: ready ? C.rust : "#c3b393", opacity: ready ? 1 : 0.8,
      }}>See my match →</button>
    </>
  );
}

function HeroCard({ plant, score, isTop, onInfo, standalone, compact, onKeystone }) {
  const pad = compact ? 12 : 18;
  const colGap = compact ? 14 : 22;
  const keystone = isKeystone(plant);
  return (
    <div style={{ background: C.card, border: `1.5px solid ${keystone ? C.gold : C.cardEdge}`,
      borderRadius: 14, boxShadow: "0 10px 30px rgba(70,55,30,0.14)", overflow: "hidden" }}>
      {keystone && (
        <button onClick={onKeystone ? () => onKeystone() : undefined}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 7, background: C.gold, color: "#3d3115", border: "none",
            padding: "5px 12px", cursor: onKeystone ? "pointer" : "default",
            fontFamily: FONT_BODY, fontSize: 11, fontWeight: 700, letterSpacing: 1.8,
            textTransform: "uppercase" }}>
          <span aria-hidden="true">★</span> Keystone species{onKeystone ? " ⓘ" : ""}
        </button>
      )}
      <div style={{ background: isTop ? C.greenDeep : C.rustDeep, color: "#f3ecd9",
        padding: "9px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 12, letterSpacing: 2,
          textTransform: "uppercase" }}>{standalone ? "Native Plant" : isTop ? "Best Match" : "Alternative Pick"}</span>
        {score != null && (
          <span style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontFamily: FONT_DISP, fontWeight: 700, fontSize: 21, lineHeight: 1 }}>{score}</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: 11, letterSpacing: 1.6,
              textTransform: "uppercase", opacity: 0.85 }}>match</span>
          </span>
        )}
      </div>

      <div style={{ padding: `18px ${pad}px 4px`, display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ flex: "0 0 auto", flexShrink: 0, width: 84, height: 84, borderRadius: 12,
          background: C.paper, border: `1px solid ${C.cardEdge}`, display: "flex",
          alignItems: "center", justifyContent: "center" }}>
          <Silhouette type={plant.t} size={72} />
        </div>
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <h2 style={{ fontFamily: FONT_DISP, fontWeight: 700, fontSize: 24, margin: 0,
            lineHeight: 1.12, overflowWrap: "break-word" }}>{plant.n}</h2>
          <div style={{ marginTop: 2 }}><LatinName name={plant.l} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginTop: 7 }}>
            <span style={{ fontFamily: FONT_BODY, fontSize: 10, fontWeight: 700, letterSpacing: 1,
              textTransform: "uppercase", color: "#fff", background: formOf(plant).color,
              borderRadius: 4, padding: "2px 7px", lineHeight: 1.3 }}>{formOf(plant).label}</span>
            <span style={{ fontFamily: FONT_BODY, fontSize: 11.5, letterSpacing: 1.4,
              textTransform: "uppercase", color: C.inkSoft }}>{plant.h} · {plant.role}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: `12px ${pad}px 18px` }}>
        <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 14,
          display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: colGap }}>
          {STATS.map(([k, name]) => (
            <StatBar key={k} statKey={k} label={name} value={plant.s[k]} onInfo={onInfo} />
          ))}
        </div>

        <div style={{ marginTop: 8, background: "#f4ead3", border: `1px solid ${C.cardEdge}`,
          borderLeft: `4px solid ${C.green}`, borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 11.5, letterSpacing: 1.6,
            textTransform: "uppercase", color: C.green, fontWeight: 700 }}>Special Ability</div>
          <div style={{ fontFamily: FONT_DISP, fontWeight: 600, fontSize: 16, marginTop: 2 }}>
            {plant.ability.n}</div>
          <div style={{ fontSize: 15, color: C.inkSoft, marginTop: 2, lineHeight: 1.4 }}>
            {plant.ability.d}</div>
        </div>

        <div style={{ marginTop: 10, background: "#f6e7df", border: `1px solid #e3c4b4`,
          borderLeft: `4px solid ${C.rust}`, borderRadius: 8, padding: "10px 14px" }}>
          <div style={{ fontFamily: FONT_BODY, fontSize: 11.5, letterSpacing: 1.6,
            textTransform: "uppercase", color: C.rustDeep, fontWeight: 700 }}>Weakness</div>
          <div style={{ fontSize: 15, color: C.inkSoft, marginTop: 2, lineHeight: 1.4 }}>
            {plant.weak}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: 11.5, letterSpacing: 1.6,
            textTransform: "uppercase", color: C.inkSoft }}>Best used in </span>
          <span style={{ fontSize: 15.5, color: C.ink }}>{plant.used}</span>
        </div>
      </div>
    </div>
  );
}

function VsHeader({ plant, score, win }) {
  return (
    <div style={{ flex: 1, textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: 11, margin: "0 auto",
        background: C.paper, border: `1px solid ${C.cardEdge}`, display: "flex",
        alignItems: "center", justifyContent: "center" }}>
        <Silhouette type={plant.t} size={46} />
      </div>
      <div style={{ fontFamily: FONT_DISP, fontWeight: 600, fontSize: 15.5, lineHeight: 1.1,
        marginTop: 7 }}>{plant.n}</div>
      {score != null && (
        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
          gap: 5, marginTop: 5 }}>
          <span style={{ fontFamily: FONT_DISP, fontWeight: 700, fontSize: 16,
            color: win ? C.rust : C.inkSoft }}>{score}</span>
          <span style={{ fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase",
            color: "#b0a181" }}>match</span>
        </div>
      )}
    </div>
  );
}

function VsStat({ statKey, name, a, b, onInfo }) {
  const aWin = a > b, bWin = b > a;
  const cell = (v, win, side) => (
    <div style={{ flex: 1, display: "flex", alignItems: "center",
      flexDirection: side === "l" ? "row-reverse" : "row", gap: 7 }}>
      <span style={{ fontFamily: FONT_DISP, fontWeight: win ? 700 : 500, fontSize: 13.5,
        color: win ? C.greenDeep : "#a99a78", width: 22, textAlign: "center" }}>{v}</span>
      <div style={{ flex: 1, height: 7, background: "#e6dabf", borderRadius: 4,
        overflow: "hidden", border: `1px solid ${C.cardEdge}`,
        display: "flex", justifyContent: side === "l" ? "flex-end" : "flex-start" }}>
        <div style={{ width: `${v}%`, height: "100%",
          background: win ? `linear-gradient(90deg, ${C.green}, ${C.greenDeep})` : "#c8bb9a" }} />
      </div>
    </div>
  );
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      {cell(a, aWin, "l")}
      <button onClick={() => onInfo && onInfo(statKey)} style={{ flex: "0 0 auto", width: 92,
        textAlign: "center", fontFamily: FONT_BODY, fontSize: 10, letterSpacing: 0.6,
        textTransform: "uppercase", color: C.inkSoft, background: "none", border: "none",
        padding: 0, cursor: onInfo ? "pointer" : "default",
        textDecoration: onInfo ? "underline dotted" : "none",
        textUnderlineOffset: 3 }}>{name}</button>
      {cell(b, bWin, "r")}
    </div>
  );
}

function VersusPanel({ a, b, onClose, onView, onInfo }) {
  const wins = STATS.reduce((acc, [k]) => {
    if (a.p.s[k] > b.p.s[k]) acc.a++; else if (b.p.s[k] > a.p.s[k]) acc.b++;
    return acc;
  }, { a: 0, b: 0 });
  const leader = wins.a === wins.b ? null : wins.a > wins.b ? a : b;
  return (
    <div style={{ background: C.card, border: `1.5px solid ${C.cardEdge}`, borderRadius: 14,
      boxShadow: "0 10px 30px rgba(70,55,30,0.14)", overflow: "hidden" }}>
      <div style={{ background: C.ink, color: "#f3ecd9", padding: "10px 16px",
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: FONT_BODY, fontSize: 12, letterSpacing: 2,
          textTransform: "uppercase" }}>Head to Head</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer",
          color: "#e7dcc4", fontSize: 18, lineHeight: 1, padding: 0 }}>✕</button>
      </div>

      <div style={{ padding: "16px 16px 6px", display: "flex", alignItems: "center", gap: 8 }}>
        <VsHeader plant={a.p} score={a.score} win={leader === a} />
        <div style={{ flex: "0 0 auto", width: 92, textAlign: "center" }}>
          <span style={{ fontFamily: FONT_DISP, fontWeight: 700, fontSize: 18, fontStyle: "italic",
            color: C.rust }}>vs</span>
        </div>
        <VsHeader plant={b.p} score={b.score} win={leader === b} />
      </div>

      <div style={{ padding: "8px 16px 14px" }}>
        <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
          {STATS.map(([k, name]) => (
            <VsStat key={k} statKey={k} name={name} a={a.p.s[k]} b={b.p.s[k]} onInfo={onInfo} />
          ))}
        </div>
        <div style={{ textAlign: "center", fontFamily: FONT_BODY, fontSize: 14.5,
          color: C.inkSoft, marginTop: 4 }}>
          {leader
            ? <>On stats alone, <strong style={{ color: C.greenDeep }}>{leader.p.n}</strong> leads {Math.max(wins.a, wins.b)}–{Math.min(wins.a, wins.b)}.</>
            : <>Dead even on stats. Pick on looks and role.</>}
        </div>
        <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
          {a.p.id !== "turf-grass" && (
            <button onClick={() => onView(a.p.id)} style={{ flex: 1, cursor: "pointer",
              fontFamily: FONT_DISP, fontWeight: 600, fontSize: 14, padding: "11px", borderRadius: 9,
              border: `1.5px solid ${C.cardEdge}`, background: C.paper, color: C.ink }}>
              View {a.p.n}</button>
          )}
          {b.p.id !== "turf-grass" && (
            <button onClick={() => onView(b.p.id)} style={{ flex: 1, cursor: "pointer",
              fontFamily: FONT_DISP, fontWeight: 600, fontSize: 14, padding: "11px", borderRadius: 9,
              border: `1.5px solid ${C.cardEdge}`, background: C.paper, color: C.ink }}>
              View {b.p.n}</button>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultScreen({ sel, onBack, onRestart }) {
  const ranked = useMemo(() => rankPlants(sel), [sel]);
  const [activeId, setActiveId] = useState(null); // null = the true top match
  const [compareId, setCompareId] = useState(null); // challenger pinned for head-to-head
  const [infoStat, setInfoStat] = useState(null); // stat key whose explanation is open
  const [hofStat, setHofStat] = useState(null); // stat key whose Hall of Fame is open
  const [vsTurf, setVsTurf] = useState(false); // active plant compared against turf grass
  const [showKeystone, setShowKeystone] = useState(false); // keystone explainer open
  // reset selection whenever the inputs change
  React.useEffect(() => { setActiveId(null); setCompareId(null); setVsTurf(false); }, [sel]);

  const topId = ranked[0].p.id;
  const active = ranked.find((r) => r.p.id === activeId) || ranked[0];
  const isTop = active.p.id === topId;
  const challenger = ranked.find((r) => r.p.id === compareId) || null;
  const comparing = challenger && challenger.p.id !== active.p.id;
  const others = ranked.filter(
    (r) => r.p.id !== active.p.id && (!comparing || r.p.id !== challenger.p.id)
  ).slice(0, 4);

  const viewPlant = (id) => {
    setActiveId(id); setCompareId(null);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const labelFor = (arr, id) => (arr.find((x) => x.id === id) || {}).name || id;
  const crumb = [
    "Central Indiana",
    labelFor(GOALS, sel.zone),
    labelFor(SUN, sel.sun),
    labelFor(MOIST, sel.moist),
    sel.space && sel.space !== "notsure" ? labelFor(SPACE, sel.space) : null,
    sel.styleWild !== "any" && sel.styleWild != null ? styleBand(sel.styleWild).name : null,
  ].filter(Boolean).join(" · ");

  return (
    <>
      <BackLink onClick={onBack} />
      <div style={{ fontFamily: FONT_BODY, fontSize: 13, color: C.inkSoft, marginBottom: 14,
        letterSpacing: 0.3 }}>{crumb}</div>

      {!isTop && !comparing && (
        <button onClick={() => setActiveId(null)} style={{ background: "none", border: "none",
          cursor: "pointer", fontFamily: FONT_BODY, fontSize: 14, color: C.rust,
          padding: "0 0 10px" }}>
          ← Back to best match: {ranked[0].p.n}
        </button>
      )}

      {vsTurf
        ? <VersusPanel a={active} b={{ p: TURF, score: null }} onClose={() => setVsTurf(false)} onView={viewPlant} onInfo={setInfoStat} />
        : comparing
        ? <VersusPanel a={active} b={challenger} onClose={() => setCompareId(null)} onView={viewPlant} onInfo={setInfoStat} />
        : <HeroCard plant={active.p} score={active.score} isTop={isTop} onInfo={setInfoStat} onKeystone={() => setShowKeystone(true)} />}

      {!vsTurf && !comparing && (
        <button onClick={() => { setVsTurf(true);
            if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); }}
          style={{ width: "100%", marginTop: 10, cursor: "pointer", fontFamily: FONT_DISP,
            fontWeight: 600, fontSize: 14.5, padding: "11px", borderRadius: 9,
            border: `1.5px solid ${C.gold}`, background: C.card, color: "#8a6d1f" }}>
          Compare {active.p.n} to a lawn →
        </button>
      )}

      {/* OTHER PICKS */}
      {!vsTurf && (
      <div style={{ marginTop: 22 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, letterSpacing: 2,
          textTransform: "uppercase", color: C.rust, marginBottom: 10 }}>
          {comparing ? "Swap challenger" : isTop ? "Backup picks" : "Other picks"}
          <span style={{ textTransform: "none", letterSpacing: 0.2, color: "#b0a181",
            fontStyle: "italic", marginLeft: 8 }}>
            {comparing ? "pick a new challenger" : "view, or tap VS to compare"}</span>
        </div>
        <div style={{ display: "grid", gap: 9 }}>
          {others.map(({ p, score }) => {
            const top = p.id === topId;
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
                <button onClick={() => viewPlant(p.id)}
                  style={{ textAlign: "left", cursor: "pointer", display: "flex",
                    alignItems: "center", gap: 13, flex: 1,
                    background: C.card, border: `1.5px solid ${top ? C.green : C.cardEdge}`,
                    borderRadius: 10, padding: "11px 14px",
                    boxShadow: "0 1px 0 #fff inset, 0 2px 5px rgba(70,55,30,0.07)" }}>
                  <div style={{ flex: "0 0 auto", width: 44, height: 44, borderRadius: 9,
                    background: C.paper, border: `1px solid ${C.cardEdge}`, display: "flex",
                    alignItems: "center", justifyContent: "center" }}>
                    <Silhouette type={p.t} size={36} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: FONT_DISP, fontWeight: 600, fontSize: 16.5 }}>{p.n}</span>
                      {isKeystone(p) && <span title="Keystone species" style={{ color: C.gold,
                        fontSize: 14 }}>★</span>}
                      {top && <span style={{ fontFamily: FONT_BODY, fontSize: 10, letterSpacing: 1.2,
                        textTransform: "uppercase", color: "#fff", background: C.green,
                        borderRadius: 4, padding: "1px 6px" }}>Top</span>}
                    </div>
                    <div style={{ fontSize: 14, color: C.inkSoft, marginTop: 1 }}>
                      Better if you want {differentiator(active.p, p)}.
                    </div>
                  </div>
                  <span style={{ flex: "0 0 auto", fontFamily: FONT_DISP, fontWeight: 700,
                    fontSize: 17, color: C.green }}>{score}</span>
                </button>
                <button onClick={() => { setCompareId(p.id);
                    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  title={`Compare with ${active.p.n}`}
                  style={{ flex: "0 0 auto", width: 52, cursor: "pointer", borderRadius: 10,
                    border: `1.5px solid ${C.rust}`,
                    background: compareId === p.id ? C.rust : C.card,
                    color: compareId === p.id ? "#fbf3e2" : C.rust,
                    fontFamily: FONT_DISP, fontWeight: 700, fontSize: 14, fontStyle: "italic" }}>
                  vs
                </button>
              </div>
            );
          })}
        </div>
      </div>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        <button onClick={onBack} style={{ flex: 1, cursor: "pointer", fontFamily: FONT_DISP,
          fontWeight: 600, fontSize: 15, padding: "13px", borderRadius: 10,
          border: `1.5px solid ${C.greenDeep}`, background: C.card, color: C.greenDeep }}>
          Change the spot</button>
        <button onClick={onRestart} style={{ flex: 1, cursor: "pointer", fontFamily: FONT_DISP,
          fontWeight: 600, fontSize: 15, padding: "13px", borderRadius: 10, border: "none",
          background: C.greenDeep, color: "#f7f1e2" }}>Start over</button>
      </div>

      <StatInfoModal statKey={infoStat} onClose={() => setInfoStat(null)}
        onSeeRanking={(k) => { setInfoStat(null); setHofStat(k); }} />
      <HallOfFame statKey={hofStat} onClose={() => setHofStat(null)} />
      {showKeystone && (
        <div onClick={() => setShowKeystone(false)} style={{ position: "fixed", inset: 0, zIndex: 50,
          background: "rgba(43,38,32,0.5)", display: "flex", alignItems: "center",
          justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: C.card,
            border: `1.5px solid ${C.gold}`, borderRadius: 14, maxWidth: 340, width: "100%",
            boxShadow: "0 18px 50px rgba(40,30,15,0.4)", overflow: "hidden" }}>
            <div style={{ background: C.gold, color: "#3d3115", padding: "11px 18px",
              display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: FONT_DISP, fontWeight: 700, fontSize: 17 }}>★ Keystone Species</span>
              <button onClick={() => setShowKeystone(false)} style={{ background: "none", border: "none",
                cursor: "pointer", color: "#3d3115", fontSize: 18, lineHeight: 1, padding: 0 }}>✕</button>
            </div>
            <div style={{ padding: "16px 18px 18px" }}>
              <p style={{ margin: 0, fontFamily: FONT_BODY, fontSize: 16.5, lineHeight: 1.5, color: C.ink }}>
                A few plant groups do most of the work. Keystone species, like oaks, cherries,
                willows, goldenrods, and asters, support far more caterpillars and insects than
                other natives, and those insects feed nearly everything else.
              </p>
              <p style={{ margin: "12px 0 0", fontFamily: FONT_BODY, fontSize: 14.5, fontStyle: "italic",
                color: C.inkSoft, lineHeight: 1.5 }}>
                If you plant only a few things, plant these. They anchor the whole food web.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// =========================================================================
//  REMOVE FLOW — invasives gallery + wanted-poster detail
// =========================================================================
const PLANT_BY_ID = Object.fromEntries(PLANTS.map((p) => [p.id, p]));

function HomeScreen({ onPlant, onRemove, onLawn }) {
  return (
    <>
      <Heading kicker="Central Indiana" title="What are we doing today?" />
      <div style={{ display: "grid", gap: 12 }}>
        <button onClick={onPlant} style={{ textAlign: "left", cursor: "pointer", width: "100%",
          background: C.card, border: `1.5px solid ${C.green}`, borderRadius: 12,
          padding: "18px 18px", boxShadow: "0 2px 6px rgba(70,55,30,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ flex: "0 0 auto", width: 52, height: 52, borderRadius: 11,
              background: C.paper, border: `1px solid ${C.cardEdge}`, display: "flex",
              alignItems: "center", justifyContent: "center" }}>
              <Silhouette type="bloom" size={44} />
            </div>
            <div>
              <div style={{ fontFamily: FONT_DISP, fontWeight: 700, fontSize: 21,
                color: C.greenDeep }}>What should I plant?</div>
              <div style={{ fontSize: 15, color: C.inkSoft, marginTop: 2 }}>
                Find the right native for a spot in your yard.</div>
            </div>
          </div>
        </button>

        <button onClick={onRemove} style={{ textAlign: "left", cursor: "pointer", width: "100%",
          background: C.card, border: `1.5px solid ${C.rust}`, borderRadius: 12,
          padding: "18px 18px", boxShadow: "0 2px 6px rgba(70,55,30,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ flex: "0 0 auto", width: 52, height: 52, borderRadius: 11,
              background: C.paper, border: `1px solid ${C.cardEdge}`, display: "flex",
              alignItems: "center", justifyContent: "center" }}>
              <Silhouette type="vine" size={44} color={C.rustDeep} />
            </div>
            <div>
              <div style={{ fontFamily: FONT_DISP, fontWeight: 700, fontSize: 21,
                color: C.rustDeep }}>What should I remove?</div>
              <div style={{ fontSize: 15, color: C.inkSoft, marginTop: 2 }}>
                Spot invasive plants and find natives to replace them.</div>
            </div>
          </div>
        </button>

        <button onClick={onLawn} style={{ textAlign: "left", cursor: "pointer", width: "100%",
          background: C.card, border: `1.5px solid ${C.gold}`, borderRadius: 12,
          padding: "18px 18px", boxShadow: "0 2px 6px rgba(70,55,30,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ flex: "0 0 auto", width: 52, height: 52, borderRadius: 11,
              background: C.paper, border: `1px solid ${C.cardEdge}`, display: "flex",
              alignItems: "center", justifyContent: "center" }}>
              <Silhouette type="grass" size={44} color={C.gold} />
            </div>
            <div>
              <div style={{ fontFamily: FONT_DISP, fontWeight: 700, fontSize: 21,
                color: C.gold }}>Rethink your lawn</div>
              <div style={{ fontSize: 15, color: C.inkSoft, marginTop: 2 }}>
                The most common yard, and the biggest chance to do better.</div>
            </div>
          </div>
        </button>
      </div>
      <p style={{ fontFamily: FONT_BODY, fontSize: 14, fontStyle: "italic", color: C.inkSoft,
        marginTop: 18, lineHeight: 1.5 }}>
        Removing an invasive often does more good than planting a native. Both together
        is how a yard turns back into habitat.
      </p>
    </>
  );
}

function LawnScreen({ onBack, onPlant }) {
  const [showVs, setShowVs] = useState(false);
  const Para = ({ children }) => (
    <p style={{ fontFamily: FONT_BODY, fontSize: 16.5, lineHeight: 1.55, color: C.ink,
      margin: "0 0 14px" }}>{children}</p>
  );
  // a strong, familiar native to stand turf against
  const star = PLANTS.find((p) => p.id === "swamp-milkweed") || PLANTS[0];
  return (
    <>
      <BackLink onClick={onBack} />
      <Heading kicker="A Gentle Case" title="Rethink your lawn" />
      <Para>
        A lawn is the most popular plant in America. Most of us never chose it. It
        came with the house, and we have been mowing it ever since.
      </Para>
      <Para>
        There is nothing wrong with loving a patch of green. But a clipped lawn of
        non-native grass feeds almost nothing. To a bee, a butterfly, or a songbird
        looking for caterpillars, it is closer to a parking lot than a meadow.
      </Para>
      <Para>
        Here is the kind part: you do not have to dig up the whole thing. The lawn is
        simply the biggest opportunity in most yards, because there is so much of it
        and it is doing so little. Convert a corner. Widen a bed. Trade the strip by
        the street for something alive.
      </Para>

      <Para>
        Start small. One bed of natives where there used to be grass will bring in
        more life than you expect, and it is less to mow.
      </Para>

      {showVs ? (
        <div style={{ margin: "4px 0 18px" }}>
          <VersusPanel a={{ p: star, score: null }} b={{ p: TURF, score: null }}
            onClose={() => setShowVs(false)} onView={() => onPlant()} onInfo={() => {}} />
          <p style={{ fontFamily: FONT_BODY, fontSize: 13.5, fontStyle: "italic", color: C.inkSoft,
            margin: "10px 2px 0", lineHeight: 1.5 }}>
            Turf earns its keep where you walk and play. Everywhere else, a native does
            far more for the same patch of ground.
          </p>
        </div>
      ) : (
        <button onClick={() => setShowVs(true)} style={{ width: "100%", marginBottom: 18,
          cursor: "pointer", fontFamily: FONT_DISP, fontWeight: 600, fontSize: 15,
          padding: "13px", borderRadius: 10, border: `1.5px solid ${C.gold}`,
          background: C.card, color: "#8a6d1f" }}>
          See a lawn next to a real native →
        </button>
      )}

      <div style={{ background: "#eef0e2", border: `1px solid #cdd3b4`, borderLeft: `4px solid ${C.green}`,
        borderRadius: 8, padding: "12px 15px", marginBottom: 18 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 11.5, letterSpacing: 1.6,
          textTransform: "uppercase", color: C.green, fontWeight: 700, marginBottom: 3 }}>
          The first step</div>
        <div style={{ fontSize: 15.5, color: C.ink, lineHeight: 1.5 }}>
          Pick a sunny patch you would not miss. We will find natives that fit it.
        </div>
      </div>
      <button onClick={onPlant} style={{ width: "100%", cursor: "pointer", fontFamily: FONT_DISP,
        fontWeight: 600, fontSize: 17, letterSpacing: 0.5, padding: "15px", borderRadius: 10,
        border: "none", color: "#f7f1e2", background: C.green }}>
        Find natives for that patch →
      </button>
    </>
  );
}

const SEV_LABEL = { high: "High threat", med: "Moderate threat" };

function InvasiveGallery({ onBack, onPick }) {
  return (
    <>
      <BackLink onClick={onBack} />
      <Heading kicker="Most Wanted" title="Spot the invader" />
      <p style={{ fontFamily: FONT_BODY, fontSize: 15, color: C.inkSoft, margin: "-6px 0 16px",
        lineHeight: 1.5 }}>
        Tap any you recognize from your yard. These are the worst offenders in Central
        Indiana, the ones worth pulling first.
      </p>
      <div style={{ display: "grid", gap: 9 }}>
        {INVASIVES.map((v) => (
          <button key={v.id} onClick={() => onPick(v.id)} style={{ textAlign: "left",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 13, width: "100%",
            background: C.card, border: `1.5px solid ${C.cardEdge}`, borderRadius: 10,
            padding: "11px 14px", boxShadow: "0 1px 0 #fff inset, 0 2px 5px rgba(70,55,30,0.07)" }}>
            <div style={{ flex: "0 0 auto", width: 44, height: 44, borderRadius: 9,
              background: C.paper, border: `1px solid ${C.cardEdge}`, display: "flex",
              alignItems: "center", justifyContent: "center" }}>
              <Silhouette type={v.t} size={36} color={C.rustDeep} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: FONT_DISP, fontWeight: 600, fontSize: 16.5 }}>{v.n}</div>
              <div style={{ fontSize: 13.5, color: C.inkSoft, marginTop: 1,
                textTransform: "capitalize" }}>{v.cat}</div>
            </div>
            <span style={{ flex: "0 0 auto", fontFamily: FONT_BODY, fontSize: 10,
              letterSpacing: 1, textTransform: "uppercase", color: "#fff",
              background: v.sev === "high" ? C.rust : C.gold, borderRadius: 5,
              padding: "3px 8px" }}>{v.sev === "high" ? "High" : "Mod"}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function SwapChip({ plant, onView }) {
  return (
    <button onClick={() => onView(plant.id)} style={{ textAlign: "left", cursor: "pointer",
      display: "flex", alignItems: "center", gap: 11, width: "100%", background: C.card,
      border: `1.5px solid ${C.green}`, borderRadius: 10, padding: "10px 13px",
      boxShadow: "0 1px 0 #fff inset, 0 2px 5px rgba(70,55,30,0.07)" }}>
      <div style={{ flex: "0 0 auto", width: 40, height: 40, borderRadius: 8,
        background: C.paper, border: `1px solid ${C.cardEdge}`, display: "flex",
        alignItems: "center", justifyContent: "center" }}>
        <Silhouette type={plant.t} size={32} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT_DISP, fontWeight: 600, fontSize: 15.5 }}>{plant.n}</div>
        <div style={{ fontSize: 13, color: C.inkSoft, marginTop: 1 }}>{plant.role}</div>
      </div>
      <span style={{ flex: "0 0 auto", fontSize: 16, color: C.green, lineHeight: 1 }}>›</span>
    </button>
  );
}

function InvasiveCard({ inv, onBack, onViewPlant }) {
  const Block = ({ kicker, color, bg, edge, children }) => (
    <div style={{ marginTop: 12, background: bg, border: `1px solid ${edge}`,
      borderLeft: `4px solid ${color}`, borderRadius: 8, padding: "11px 14px" }}>
      <div style={{ fontFamily: FONT_BODY, fontSize: 11.5, letterSpacing: 1.6,
        textTransform: "uppercase", color, fontWeight: 700, marginBottom: 3 }}>{kicker}</div>
      <div style={{ fontSize: 15.5, color: C.ink, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
  const swaps = inv.swaps.map((id) => PLANT_BY_ID[id]).filter(Boolean);
  return (
    <>
      <BackLink onClick={onBack} />
      <div style={{ background: C.card, border: `1.5px solid ${C.cardEdge}`, borderRadius: 14,
        boxShadow: "0 10px 30px rgba(70,55,30,0.14)", overflow: "hidden" }}>
        <div style={{ background: C.rustDeep, color: "#f3ecd9", padding: "10px 18px",
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: FONT_BODY, fontSize: 12, letterSpacing: 2,
            textTransform: "uppercase" }}>Remove</span>
          <span style={{ fontFamily: FONT_BODY, fontSize: 12, letterSpacing: 2,
            textTransform: "uppercase" }}>{SEV_LABEL[inv.sev]} · {inv.cat}</span>
        </div>

        <div style={{ padding: "18px 18px 4px", display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ flex: "0 0 auto", flexShrink: 0, width: 84, height: 84, borderRadius: 12,
            background: C.paper, border: `1px solid ${C.cardEdge}`, display: "flex",
            alignItems: "center", justifyContent: "center" }}>
            <Silhouette type={inv.t} size={72} color={C.rustDeep} />
          </div>
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
            <h2 style={{ fontFamily: FONT_DISP, fontWeight: 700, fontSize: 22, margin: 0,
              lineHeight: 1.12, overflowWrap: "break-word" }}>{inv.n}</h2>
            <div style={{ marginTop: 2 }}><LatinName name={inv.l} size={15.5} /></div>
            {inv.also && <div style={{ fontSize: 13, color: "#a99a78", marginTop: 1 }}>
              also called {inv.also}</div>}
          </div>
        </div>

        <div style={{ padding: "10px 18px 18px" }}>
          <Block kicker="How to spot it" color={C.inkSoft} bg="#f4ead3" edge={C.cardEdge}>
            {inv.idtip}</Block>
          <Block kicker="Why it has to go" color={C.rustDeep} bg="#f6e7df" edge="#e3c4b4">
            {inv.why}</Block>
          <Block kicker="How to remove it" color={C.greenDeep} bg="#eef0e2" edge="#cdd3b4">
            {inv.remove}</Block>
          <p style={{ fontFamily: FONT_BODY, fontSize: 13.5, fontStyle: "italic",
            color: C.inkSoft, lineHeight: 1.5, margin: "12px 2px 0" }}>
            For the safest method on a large or stubborn infestation, and for any herbicide
            guidance, check with your county extension office or a Purdue Extension
            Master Gardener. They know what works in Indiana soils.
          </p>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, letterSpacing: 2,
          textTransform: "uppercase", color: C.green, marginBottom: 4 }}>Plant these instead</div>
        <p style={{ fontFamily: FONT_BODY, fontSize: 14, color: C.inkSoft, margin: "0 0 10px",
          fontStyle: "italic" }}>
          {inv.swapNote || "Natives that fill the same role, the right way. Tap to see the full card."}
        </p>
        <div style={{ display: "grid", gap: 9 }}>
          {swaps.map((p) => <SwapChip key={p.id} plant={p} onView={onViewPlant} />)}
        </div>
      </div>

      <button onClick={onBack} style={{ width: "100%", marginTop: 22, cursor: "pointer",
        fontFamily: FONT_DISP, fontWeight: 600, fontSize: 15, padding: "13px", borderRadius: 10,
        border: `1.5px solid ${C.rustDeep}`, background: C.card, color: C.rustDeep }}>
        ← Back to the list</button>
    </>
  );
}

// =========================================================================
//  APP STATE MACHINE
// =========================================================================
function PlantFlow({ onHome }) {
  const [step, setStep] = useState(0); // 0 region, 1 zone, 2 conditions, 3 result
  const [sel, setSel] = useState({ zone: null, sun: null, moist: null, space: "notsure", styleWild: "any" });
  React.useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [step]);
  return (
    <>
      {step === 0 && <RegionScreen onPick={() => setStep(1)} onHome={onHome} />}
      {step === 1 && (
        <ZoneScreen
          current={sel.zone}
          onBack={() => setStep(0)}
          onPick={(zone) => { setSel((s) => ({ ...s, zone })); setStep(2); }}
        />
      )}
      {step === 2 && (
        <ConditionsScreen
          sel={sel}
          onChange={(patch) => setSel((s) => ({ ...s, ...patch }))}
          onBack={() => setStep(1)}
          onSubmit={() => setStep(3)}
        />
      )}
      {step === 3 && (
        <ResultScreen
          sel={sel}
          onBack={() => setStep(2)}
          onRestart={() => { setSel({ zone: null, sun: null, moist: null, space: "notsure", styleWild: "any" }); setStep(0); }}
        />
      )}
    </>
  );
}

function RemoveFlow({ onHome }) {
  const [pickedId, setPickedId] = useState(null);
  // a native swap can launch a read-only plant card without leaving the remove flow
  const [viewPlantId, setViewPlantId] = useState(null);
  const inv = INVASIVES.find((v) => v.id === pickedId) || null;
  const plant = PLANT_BY_ID[viewPlantId] || null;

  if (plant) {
    return (
      <>
        <BackLink onClick={() => setViewPlantId(null)} />
        <HeroCard plant={plant} score={null} isTop standalone />
        <button onClick={() => setViewPlantId(null)} style={{ width: "100%", marginTop: 20,
          cursor: "pointer", fontFamily: FONT_DISP, fontWeight: 600, fontSize: 15,
          padding: "13px", borderRadius: 10, border: `1.5px solid ${C.greenDeep}`,
          background: C.card, color: C.greenDeep }}>← Back to {inv ? inv.n : "the invader"}</button>
      </>
    );
  }
  if (inv) return <InvasiveCard inv={inv} onBack={() => setPickedId(null)} onViewPlant={setViewPlantId} />;
  return <InvasiveGallery onBack={onHome} onPick={setPickedId} />;
}

function Game() {
  const [mode, setMode] = useState("home"); // home | plant | remove
  React.useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [mode]);
  return (
    <Frame>
      <Masthead mode={mode} onHome={() => setMode("home")} />
      {mode === "home" && <HomeScreen onPlant={() => setMode("plant")} onRemove={() => setMode("remove")} onLawn={() => setMode("lawn")} />}
      {mode === "plant" && <PlantFlow onHome={() => setMode("home")} />}
      {mode === "remove" && <RemoveFlow onHome={() => setMode("home")} />}
      {mode === "lawn" && <LawnScreen onBack={() => setMode("home")} onPlant={() => setMode("plant")} />}
    </Frame>
  );
}
