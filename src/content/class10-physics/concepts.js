// Class 10 Physics concept graph. `prereq` = must understand first; `related` = lateral links.
// Add new subjects/classes by adding another folder with the same shape — the learner engine is subject-agnostic.

export const subject = {
  slug: "physics-10",
  name: "Physics",
  grade: 10,
  curriculum: "CBSE / NCERT",
  description: "Class 10 Physics: Light, the Human Eye, Electricity and Magnetic Effects of Current.",
};

export const chapters = [
  { slug: "light", name: "Light — Reflection & Refraction", description: "How light reflects from mirrors and bends through lenses." },
  { slug: "human-eye", name: "The Human Eye & Colourful World", description: "Vision, defects of vision and the optics of the sky." },
  { slug: "electricity", name: "Electricity", description: "Current, resistance, circuits, power and heating." },
  { slug: "magnetic-effects", name: "Magnetic Effects of Electric Current", description: "Fields, forces, motors, induction and safe domestic wiring." },
];

export const concepts = [
  // ── Light: Reflection ──
  {
    slug: "laws-of-reflection", chapter: "light", topic: "Reflection", name: "Laws of Reflection", d: 1, prereq: [], related: ["laws-of-refraction"],
    summary: "When light bounces off a smooth surface, the angle of incidence equals the angle of reflection, and both are measured from the normal.",
    ideas: ["Angles are measured from the normal, not from the surface.", "The incident ray, reflected ray and normal lie in one plane.", "A plane mirror forms a virtual, erect image the same size as the object."],
    formulas: ["∠i = ∠r"], intuition: "Think of a ball bouncing off a wall: it leaves at the same angle it arrived, measured from the line perpendicular to the wall.",
    subs: ["Angle of incidence", "Normal", "Plane mirror images"], kw: ["reflection", "plane mirror", "angle of incidence", "angle of reflection", "normal"],
  },
  {
    slug: "spherical-mirrors", chapter: "light", topic: "Reflection", name: "Spherical Mirrors", d: 2, prereq: ["laws-of-reflection"], related: ["ray-diagrams"],
    summary: "Concave mirrors converge parallel rays at the focus; convex mirrors diverge them. Focal length is half the radius of curvature.",
    ideas: ["Concave mirrors converge light; convex mirrors diverge it.", "f = R/2.", "Convex mirrors always give virtual, erect, diminished images (rear-view mirrors)."],
    formulas: ["f = R/2"], intuition: "A concave mirror is like a bowl that gathers light to a point; a convex mirror is like the back of a spoon that spreads it out.",
    subs: ["Pole, centre of curvature, focus", "Concave vs convex", "Uses of mirrors"], kw: ["spherical mirror", "concave mirror", "convex mirror", "radius of curvature", "focus of mirror", "rear view"],
  },
  {
    slug: "mirror-formula", chapter: "light", topic: "Reflection", name: "Mirror Formula", d: 3, prereq: ["spherical-mirrors"], related: ["lens-formula"],
    summary: "The mirror formula links object distance u, image distance v and focal length f, using the New Cartesian sign convention.",
    ideas: ["1/v + 1/u = 1/f.", "Distances are measured from the pole; those against the incident light are negative.", "For a concave mirror, f is negative."],
    formulas: ["1/v + 1/u = 1/f"], intuition: "The signs tell you which side of the mirror things are on — a negative v means a real image in front of the mirror.",
    subs: ["Sign convention", "Image distance", "Numerical problems"], kw: ["mirror formula", "image distance mirror", "sign convention", "1/v + 1/u"],
  },
  {
    slug: "magnification", chapter: "light", topic: "Reflection", name: "Magnification", d: 3, prereq: ["mirror-formula"], related: ["lens-formula"],
    summary: "Magnification is image height over object height, and equals −v/u for mirrors. A negative value means an inverted (real) image.",
    ideas: ["m = h′/h = −v/u (mirrors).", "m > 1 means enlarged, m < 1 diminished.", "Sign of m tells inverted (−) or erect (+)."],
    formulas: ["m = h′/h = −v/u"], intuition: "Magnification is just a size ratio with a sign that records orientation.",
    subs: ["Linear magnification", "Sign of m"], kw: ["magnification", "magnified", "image height", "size of image"],
  },
  // ── Light: Refraction ──
  {
    slug: "laws-of-refraction", chapter: "light", topic: "Refraction", name: "Laws of Refraction", d: 2, prereq: ["laws-of-reflection"], related: ["laws-of-reflection"],
    summary: "Light changes speed when it moves between media. Entering a denser medium it bends towards the normal; entering a rarer one it bends away.",
    ideas: ["Light slows down in an optically denser medium and bends towards the normal.", "Light along the normal does not bend.", "Snell's law: sin i / sin r is constant for a pair of media."],
    formulas: ["sin i / sin r = constant"], intuition: "Imagine a car driving from road onto sand at an angle: the wheel that hits the sand first slows down, turning the car towards the normal.",
    subs: ["Bending of light", "Snell's law", "Refraction through a glass slab"], kw: ["refraction", "bends", "snell", "glass slab", "denser medium", "rarer medium"],
  },
  {
    slug: "refractive-index", chapter: "light", topic: "Refraction", name: "Refractive Index", d: 2, prereq: ["laws-of-refraction"], related: ["dispersion-scattering"],
    summary: "The refractive index n = c/v (speed in vacuum over speed in medium) measures how strongly a medium slows and bends light.",
    ideas: ["n = c/v = sin i / sin r.", "Higher n means optically denser (not necessarily heavier).", "Light travels slowest in the medium with highest n."],
    formulas: ["n = c / v", "n = sin i / sin r"], intuition: "Refractive index is a 'slowness score' for light — glass (1.5) slows light more than water (1.33).",
    subs: ["Absolute refractive index", "Optical density", "Speed of light in media"], kw: ["refractive index", "optical density", "speed of light in", "n = c/v"],
  },
  {
    slug: "lenses", chapter: "light", topic: "Refraction", name: "Lenses & Image Formation", d: 2, prereq: ["refractive-index"], related: ["ray-diagrams", "accommodation"],
    summary: "Convex lenses converge light and can form real or virtual images depending on the object position; concave lenses always form virtual, erect, diminished images.",
    ideas: ["Image characteristics depend on the object's position relative to F and 2F.", "A real image forms on the opposite side and is inverted; a virtual image is erect and on the same side as the object.", "Virtual and real describe whether rays actually meet — not whether the image is inverted."],
    formulas: [], intuition: "Move an object closer to a magnifying glass: far away you get a small flipped image; inside the focal length you get a big upright one.",
    subs: ["Convex & concave lenses", "Image formation", "Real vs virtual images"], kw: ["lens", "lenses", "convex lens", "concave lens", "image formation", "virtual image", "real image", "magnifying glass"],
  },
  {
    slug: "ray-diagrams", chapter: "light", topic: "Refraction", name: "Ray Diagrams", d: 2, prereq: ["lenses", "spherical-mirrors"], related: ["lens-formula"],
    summary: "Ray diagrams use rules for three special rays to locate images: parallel to axis, through the optical centre/pole, and through the focus.",
    ideas: ["A ray through the optical centre goes straight.", "A ray parallel to the axis passes through the focus after a convex lens.", "Two rays are enough to locate the image."],
    formulas: [], intuition: "A ray diagram is a map: draw two predictable rays and where they cross is where the image forms.",
    subs: ["Principal rays", "Locating images", "Mirror and lens diagrams"], kw: ["ray diagram", "draw ray", "principal ray", "ray through centre"],
  },
  {
    slug: "lens-formula", chapter: "light", topic: "Refraction", name: "Lens Formula", d: 3, prereq: ["lenses"], related: ["mirror-formula", "magnification"],
    summary: "The lens formula 1/v − 1/u = 1/f connects object distance, image distance and focal length; magnification is m = v/u.",
    ideas: ["1/v − 1/u = 1/f with the New Cartesian sign convention.", "u is negative for a real object; f is positive for convex lenses.", "Convert all distances to the same unit before substituting."],
    formulas: ["1/v − 1/u = 1/f", "m = v/u"], intuition: "The formula is a bookkeeping rule: it tells you exactly where the image lands once you know where the object is and how strong the lens is.",
    subs: ["Sign convention", "Image distance", "Lens magnification", "Unit consistency"], kw: ["lens formula", "1/v - 1/u", "image distance", "object distance", "focal length of lens", "numerical lens"],
  },
  {
    slug: "power-of-lens", chapter: "light", topic: "Refraction", name: "Power of a Lens", d: 3, prereq: ["lens-formula"], related: ["vision-defects"],
    summary: "Power P = 1/f with f in metres, measured in dioptres. Short focal length means high power; convex lenses have positive power, concave negative.",
    ideas: ["P = 1/f (f in metres).", "Shorter focal length → greater power.", "Powers of lenses in contact add: P = P₁ + P₂."],
    formulas: ["P = 1/f (metres)", "P = P₁ + P₂"], intuition: "Power is how sharply a lens bends light — a fat, curvy lens (short f) bends strongly.",
    subs: ["Dioptre", "Focal length and power", "Combination of lenses"], kw: ["power of lens", "power of a lens", "dioptre", "diopter", "combination of lenses"],
  },
  // ── Human Eye ──
  {
    slug: "eye-structure", chapter: "human-eye", topic: "The Eye", name: "Structure of the Eye", d: 1, prereq: [], related: ["lenses"],
    summary: "Light enters through the cornea, passes the pupil (sized by the iris) and the eye lens, and forms an image on the retina.",
    ideas: ["The cornea does most of the refraction.", "The iris controls pupil size and the light entering.", "The retina holds light-sensitive cells; the optic nerve sends signals to the brain."],
    formulas: [], intuition: "The eye is a natural camera: cornea and lens focus, iris is the aperture, retina is the sensor.",
    subs: ["Cornea & iris", "Retina & optic nerve", "Eye lens"], kw: ["structure of eye", "human eye", "retina", "iris", "cornea", "pupil", "optic nerve"],
  },
  {
    slug: "accommodation", chapter: "human-eye", topic: "The Eye", name: "Power of Accommodation", d: 2, prereq: ["eye-structure", "lenses"], related: ["power-of-lens"],
    summary: "Ciliary muscles change the curvature of the eye lens, altering its focal length so near and far objects both focus on the retina.",
    ideas: ["For near objects the lens becomes thicker (shorter focal length).", "The lens does not move — its shape changes.", "Near point ≈ 25 cm, far point = infinity for a normal eye."],
    formulas: [], intuition: "Instead of sliding a lens like a camera, the eye squeezes its flexible lens fatter or lets it relax thinner.",
    subs: ["Ciliary muscles", "Near and far point"], kw: ["accommodation", "ciliary", "near point", "far point", "focus near objects", "least distance"],
  },
  {
    slug: "vision-defects", chapter: "human-eye", topic: "The Eye", name: "Defects of Vision", d: 3, prereq: ["accommodation", "power-of-lens"], related: ["power-of-lens"],
    summary: "Myopia (short-sightedness) is corrected with a concave lens; hypermetropia (far-sightedness) with a convex lens; presbyopia with bifocals.",
    ideas: ["Myopia: image forms in front of the retina → concave lens.", "Hypermetropia: image forms behind the retina → convex lens.", "Corrective power P = 1/f, with f from the person's far/near point."],
    formulas: ["P = 1/f"], intuition: "Match the problem: too much bending needs a diverging lens; too little bending needs a converging one.",
    subs: ["Myopia", "Hypermetropia", "Presbyopia", "Corrective lenses"], kw: ["myopia", "hypermetropia", "short sighted", "long sighted", "defect of vision", "spectacles", "far point"],
  },
  {
    slug: "dispersion-scattering", chapter: "human-eye", topic: "Colourful World", name: "Dispersion & Scattering", d: 2, prereq: ["refractive-index"], related: ["laws-of-refraction"],
    summary: "A prism splits white light because each colour bends by a different amount. Scattering of short wavelengths makes the sky blue and sunsets red.",
    ideas: ["Violet bends the most, red the least.", "A prism separates colours already present; it does not create them.", "Blue light scatters more than red, colouring the sky."],
    formulas: [], intuition: "White light is a bundle of colours travelling together; the glass sorts them by how much each slows down.",
    subs: ["Dispersion by prism", "Rainbow", "Scattering of light"], kw: ["dispersion", "prism", "rainbow", "scattering", "blue sky", "sunset", "tyndall"],
  },
  // ── Electricity ──
  {
    slug: "electric-current", chapter: "electricity", topic: "Basics", name: "Current & Potential Difference", d: 1, prereq: [], related: ["ohms-law"],
    summary: "Electric current is the rate of flow of charge, I = Q/t. Potential difference is the work done per unit charge. Current is the same everywhere in a series loop.",
    ideas: ["I = Q/t, measured in amperes.", "Current is not used up — it is the same before and after a bulb in series.", "Potential difference (voltage) is what drives charge; energy is transferred, not charge lost."],
    formulas: ["I = Q/t", "V = W/Q"], intuition: "A water-pipe loop: water flows at the same rate everywhere around it; the pump (battery) supplies the push.",
    subs: ["Charge & current", "Potential difference", "Circuit symbols"], kw: ["current", "electric current", "ampere", "charge flow", "potential difference", "voltage"],
  },
  {
    slug: "ohms-law", chapter: "electricity", topic: "Basics", name: "Ohm's Law", d: 2, prereq: ["electric-current"], related: ["resistance"],
    summary: "At constant temperature, current through a conductor is proportional to the potential difference across it: V = IR. Resistance is a property of the conductor, not of V or I.",
    ideas: ["V = IR; the V–I graph of an ohmic conductor is a straight line through the origin.", "Resistance stays constant when V changes (at constant temperature).", "For a fixed V, greater resistance means smaller current."],
    formulas: ["V = IR", "I = V/R"], intuition: "Resistance is like narrowness of a pipe: for the same push (V), a narrower pipe lets less flow (I) through.",
    subs: ["V–I relationship", "Ohmic conductors", "Applying V = IR"], kw: ["ohm", "ohms law", "v = ir", "current decrease", "resistance increases", "current and resistance", "voltage and current"],
  },
  {
    slug: "resistance", chapter: "electricity", topic: "Basics", name: "Resistance & Resistivity", d: 2, prereq: ["ohms-law"], related: ["series-parallel"],
    summary: "Resistance R = ρL/A: it grows with length, shrinks with cross-sectional area, and depends on the material and temperature.",
    ideas: ["R = ρL/A.", "A thicker wire has LOWER resistance.", "Stretching a wire to double its length (constant volume) quadruples its resistance."],
    formulas: ["R = ρL/A"], intuition: "Long, thin corridors are harder to push a crowd through than short, wide ones.",
    subs: ["Resistivity", "Factors affecting resistance"], kw: ["resistance", "resistivity", "thick wire", "thin wire", "length of wire", "factors affecting resistance"],
  },
  {
    slug: "series-parallel", chapter: "electricity", topic: "Circuits", name: "Series & Parallel Circuits", d: 3, prereq: ["resistance"], related: ["electric-power"],
    summary: "In series R = R₁ + R₂ + … and current is shared; in parallel 1/R = 1/R₁ + 1/R₂ + … and voltage is shared. Parallel combinations have LOWER total resistance.",
    ideas: ["Series: R adds, same current.", "Parallel: reciprocals add, same voltage, total R is less than the smallest branch.", "Household appliances are wired in parallel."],
    formulas: ["R = R₁ + R₂", "1/R = 1/R₁ + 1/R₂"], intuition: "Parallel paths are extra lanes on a road: more lanes, less overall resistance to traffic.",
    subs: ["Series combination", "Parallel combination", "Equivalent resistance"], kw: ["series", "parallel", "equivalent resistance", "combination of resistors", "total resistance"],
  },
  {
    slug: "electric-power", chapter: "electricity", topic: "Circuits", name: "Electric Power & Energy", d: 3, prereq: ["ohms-law"], related: ["heating-effect"],
    summary: "Power P = VI = I²R = V²/R is the rate of energy use. Energy E = Pt; the commercial unit is the kilowatt-hour.",
    ideas: ["P = VI = I²R = V²/R — choose the form that fits what is constant.", "At the same voltage, LOWER resistance means HIGHER power.", "1 kWh = 3.6 × 10⁶ J."],
    formulas: ["P = VI", "P = V²/R", "E = Pt"], intuition: "Power is how fast the circuit 'spends' energy — a low-resistance heater draws more current and spends faster.",
    subs: ["Power formulas", "Energy and kWh", "Appliance ratings"], kw: ["power", "electric power", "watt", "kilowatt hour", "kwh", "energy consumed", "rating of bulb"],
  },
  {
    slug: "heating-effect", chapter: "electricity", topic: "Circuits", name: "Heating Effect of Current", d: 2, prereq: ["ohms-law"], related: ["electric-power"],
    summary: "Joule's law: heat produced H = I²Rt. This is used in heaters, bulbs and fuses.",
    ideas: ["H = I²Rt.", "Doubling the current quadruples the heat.", "Fuses and heaters are applications of heating effect."],
    formulas: ["H = I²Rt"], intuition: "Moving charges bump into atoms, handing over energy as heat; more current means more bumps, squared.",
    subs: ["Joule's law", "Applications"], kw: ["heating effect", "joule", "heat produced", "i2rt", "heater"],
  },
  // ── Magnetic effects ──
  {
    slug: "magnetic-field", chapter: "magnetic-effects", topic: "Fields", name: "Magnetic Field & Field Lines", d: 1, prereq: [], related: ["field-current-wire"],
    summary: "A magnetic field is the region around a magnet where its force is felt. Field lines never intersect; closer lines mean a stronger field.",
    ideas: ["Field lines leave the north pole and enter the south pole outside the magnet.", "Field lines never cross.", "Crowded lines indicate a stronger field."],
    formulas: [], intuition: "Field lines are a map of the push a tiny compass would feel at each point.",
    subs: ["Field lines", "Bar magnet", "Compass"], kw: ["magnetic field", "field lines", "bar magnet", "compass", "north pole"],
  },
  {
    slug: "field-current-wire", chapter: "magnetic-effects", topic: "Fields", name: "Field due to Current-Carrying Conductor", d: 2, prereq: ["magnetic-field", "electric-current"], related: ["force-on-conductor"],
    summary: "A current-carrying wire produces circular field lines around it; the direction follows the right-hand thumb rule, and the field grows with current and shrinks with distance.",
    ideas: ["Field lines around a straight wire are concentric circles.", "Right-hand thumb rule gives direction.", "A solenoid has a field like a bar magnet."],
    formulas: [], intuition: "Moving charge creates magnetism — current is a magnet in disguise.",
    subs: ["Right-hand thumb rule", "Solenoid"], kw: ["right hand thumb rule", "current carrying wire", "solenoid", "oersted", "field around wire"],
  },
  {
    slug: "force-on-conductor", chapter: "magnetic-effects", topic: "Forces", name: "Force on a Current-Carrying Conductor", d: 3, prereq: ["field-current-wire"], related: ["electric-motor"],
    summary: "A current-carrying conductor in a magnetic field feels a force, greatest when current is perpendicular to the field. Fleming's left-hand rule gives its direction.",
    ideas: ["Force is maximum when current ⟂ field and zero when parallel.", "Fleming's left-hand rule: thumb = force, forefinger = field, middle finger = current.", "Reversing current or field reverses the force."],
    formulas: [], intuition: "The field pushes sideways on moving charge — perpendicular to both field and current.",
    subs: ["Fleming's left-hand rule", "Direction of force"], kw: ["fleming", "force on conductor", "left hand rule", "force on current"],
  },
  {
    slug: "electric-motor", chapter: "magnetic-effects", topic: "Forces", name: "Electric Motor", d: 3, prereq: ["force-on-conductor"], related: ["ac-dc-generator"],
    summary: "A DC motor turns electrical energy into mechanical energy; the split-ring commutator reverses current every half turn to keep the coil rotating the same way.",
    ideas: ["Opposite forces on the two coil sides create rotation.", "The commutator reverses current every half rotation.", "Stronger magnet, more turns or more current → greater torque."],
    formulas: [], intuition: "The commutator keeps 'flipping the push' at exactly the right moment so the coil never gets stuck.",
    subs: ["Split-ring commutator", "Working of motor"], kw: ["electric motor", "dc motor", "commutator", "armature"],
  },
  {
    slug: "em-induction", chapter: "magnetic-effects", topic: "Induction", name: "Electromagnetic Induction", d: 3, prereq: ["field-current-wire"], related: ["ac-dc-generator"],
    summary: "A changing magnetic field through a coil induces a current. No change in flux means no induced current, however strong the magnet.",
    ideas: ["Induction needs relative motion / changing field.", "A stationary magnet in a coil induces no current.", "Faster change or more turns → larger induced current."],
    formulas: [], intuition: "The coil responds to change, not to presence — it only 'notices' when the field through it varies.",
    subs: ["Faraday's experiments", "Direction of induced current"], kw: ["induction", "electromagnetic induction", "induced current", "galvanometer", "faraday"],
  },
  {
    slug: "ac-dc-generator", chapter: "magnetic-effects", topic: "Induction", name: "Generators, AC & DC", d: 3, prereq: ["em-induction"], related: ["electric-motor"],
    summary: "A generator turns mechanical energy into electrical energy using induction. AC generators use slip rings; DC generators use split rings. Mains AC in India is 50 Hz.",
    ideas: ["AC reverses direction periodically (50 Hz → 100 reversals per second).", "Slip rings → AC; split-ring commutator → DC.", "A generator is a motor run in reverse."],
    formulas: [], intuition: "Spin a coil in a field and the changing flux keeps pushing current back and forth.",
    subs: ["AC generator", "DC generator", "Frequency"], kw: ["generator", "ac generator", "dc generator", "alternating current", "slip ring", "50 hz"],
  },
  {
    slug: "domestic-circuits", chapter: "magnetic-effects", topic: "Safety", name: "Domestic Circuits & Safety", d: 2, prereq: ["electric-power"], related: ["heating-effect"],
    summary: "Household wiring uses live, neutral and earth wires. Fuses and MCBs protect against overload and short circuits; the earth wire prevents shocks.",
    ideas: ["Live (red), neutral (black), earth (green).", "A fuse melts when current is too high, breaking the circuit.", "Earthing gives leakage current a safe path."],
    formulas: [], intuition: "Safety devices are deliberate weak links that fail first so people and appliances don't.",
    subs: ["Fuse", "Earthing", "Overloading and short circuit"], kw: ["fuse", "earth wire", "domestic circuit", "short circuit", "overloading", "mcb"],
  },
];
