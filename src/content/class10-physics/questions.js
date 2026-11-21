// Structured question bank. Every question carries concept, subconcept, difficulty (1 easy … 4 advanced),
// type, correct answer, explanation, prerequisites, misconception links, objective and estimated time.
// `dm` maps a wrong option → misconception code. `wp` lists numeric wrong-answer patterns.

const L = "ABCD";
const mcq = (code, concept, d, type, prompt, options, answer, explanation, x = {}) => ({
  code, concept, d, type, prompt, options: options.map((text, i) => ({ id: L[i], text })), answer, explanation, ...x,
});
const num = (code, concept, d, type, prompt, answer, unit, explanation, x = {}) => ({
  code, concept, d, type, prompt, answer: String(answer), unit, explanation, ...x,
});
const short = (code, concept, d, prompt, keywords, answer, explanation, x = {}) => ({
  code, concept, d, type: "short_answer", prompt, keywords, answer, explanation, ...x,
});

const AR = [
  "Both A and R are true and R is the correct explanation of A",
  "Both A and R are true but R is not the correct explanation of A",
  "A is true but R is false",
  "A is false but R is true",
];

export const questions = [
  // ── Laws of reflection ──
  mcq("Q-REF-01", "laws-of-reflection", 1, "conceptual", "A ray strikes a plane mirror making an angle of 30° with the mirror surface. What is the angle of reflection?", ["30°", "60°", "90°", "120°"], "B",
    "Angles are measured from the normal. The ray makes 30° with the surface, so the angle of incidence is 90° − 30° = 60°, and the angle of reflection is also 60°.",
    { dm: { A: "M-REFL-ANGLE" }, mis: ["M-REFL-ANGLE"], sub: "Angle of incidence", obj: "Measure incidence and reflection angles from the normal", diag: true, reason: true }),
  mcq("Q-REF-02", "laws-of-reflection", 2, "mcq", "Which statement correctly describes the laws of reflection?", [
    "Angle of incidence equals angle of reflection; incident ray, reflected ray and normal lie in the same plane",
    "Angle of incidence is always greater than angle of reflection",
    "The reflected ray is always along the normal",
    "Reflection only happens at mirrors, never at paper"], "A",
    "Both laws: ∠i = ∠r and all three lines (incident ray, reflected ray, normal) are coplanar. Rough surfaces also reflect (diffuse reflection).",
    { sub: "Plane mirror images", obj: "State both laws of reflection" }),
  // ── Spherical mirrors ──
  mcq("Q-SPH-01", "spherical-mirrors", 1, "mcq", "Which mirror is used as a rear-view mirror in vehicles?", ["Concave mirror", "Convex mirror", "Plane mirror", "Parabolic mirror"], "B",
    "A convex mirror always forms a virtual, erect, diminished image and gives a wide field of view.",
    { sub: "Uses of mirrors", obj: "Match mirror type to its application", diag: true }),
  num("Q-SPH-02", "spherical-mirrors", 2, "numerical", "The radius of curvature of a concave mirror is 30 cm. What is its focal length (in cm, magnitude)?", 15, "cm",
    "For spherical mirrors f = R/2 = 30/2 = 15 cm.", { sub: "Pole, centre of curvature, focus", obj: "Relate focal length and radius of curvature", wp: [{ v: 60, err: "calculation", note: "Doubled R instead of halving it." }] }),
  // ── Mirror formula ──
  num("Q-MIR-01", "mirror-formula", 3, "numerical", "An object is placed 30 cm in front of a concave mirror of focal length 15 cm. Find the image distance v (in cm, with sign, using the New Cartesian convention).", -30, "cm",
    "u = −30, f = −15. 1/v = 1/f − 1/u = −1/15 + 1/30 = −1/30, so v = −30 cm (real image in front of the mirror, at C).",
    { sub: "Sign convention", obj: "Apply the mirror formula with correct signs", diag: true, mis: ["M-SIGN-CONV"], wp: [{ v: 30, err: "misconception", m: "M-SIGN-CONV", note: "The sign is positive — signs were not applied." }] }),
  mcq("Q-MIR-02", "mirror-formula", 2, "conceptual", "An object is placed at the centre of curvature C of a concave mirror. The image formed is:", ["At C, real, inverted and same size", "At F, real and point-sized", "Behind the mirror, virtual and erect", "At infinity"], "A",
    "For an object at C, the image forms at C: real, inverted and the same size (m = −1).", { sub: "Image distance", obj: "Predict image properties from object position" }),
  // ── Magnification ──
  mcq("Q-MAG-01", "magnification", 2, "conceptual", "A mirror forms an erect image twice the size of the object. The magnification m is:", ["−2", "+2", "+0.5", "−0.5"], "B",
    "Erect images have positive magnification and 'twice as large' means magnitude 2, so m = +2.", { sub: "Sign of m", obj: "Interpret the sign and size of magnification", diag: true }),
  num("Q-MAG-02", "magnification", 3, "numerical", "A 6 cm tall object forms an erect 2 cm image in a convex mirror. What is the magnification (to 2 decimals)?", 0.33, "",
    "m = h′/h = 2/6 ≈ 0.33 (positive since erect).", { sub: "Linear magnification", obj: "Compute magnification from heights", tol: 0.05, wp: [{ v: 3, err: "calculation", note: "Ratio inverted (h/h′)." }] }),
  // ── Laws of refraction ──
  mcq("Q-LAW-01", "laws-of-refraction", 1, "conceptual", "A ray of light travels obliquely from air into glass. It will:", ["Bend towards the normal", "Bend away from the normal", "Go straight without bending", "Be totally reflected"], "A",
    "Glass is optically denser, so light slows down and bends towards the normal.", { dm: { B: "M-BEND-DENSE" }, mis: ["M-BEND-DENSE"], sub: "Bending of light", obj: "Predict bending direction between media", diag: true, reason: true }),
  mcq("Q-LAW-02", "laws-of-refraction", 2, "mcq", "A ray travelling along the normal passes from glass into air. What happens to its path?", ["It bends away from the normal", "It bends towards the normal", "It does not bend but its speed changes", "It reflects back"], "C",
    "At normal incidence (angle 0°) there is no bending, but the speed still changes because the medium changes.", { sub: "Snell's law", obj: "Recognise normal incidence as a special case" }),
  // ── Refractive index ──
  num("Q-RI-01", "refractive-index", 2, "numerical", "Light goes from air into a medium. The angle of incidence is 30° and the angle of refraction is 19.5° (sin 19.5° ≈ 0.334). Find the refractive index of the medium.", 1.5, "",
    "n = sin i / sin r = 0.5 / 0.334 ≈ 1.5.", { sub: "Absolute refractive index", obj: "Compute n from angles", diag: true, tol: 0.04, wp: [{ v: 0.67, err: "calculation", note: "Ratio inverted." }] }),
  mcq("Q-RI-02", "refractive-index", 3, "application", "The refractive index of water is 1.33 and the speed of light in air is 3 × 10⁸ m/s. The speed of light in water is about:", ["4.0 × 10⁸ m/s", "2.26 × 10⁸ m/s", "3.0 × 10⁸ m/s", "1.33 × 10⁸ m/s"], "B",
    "v = c/n = 3 × 10⁸ / 1.33 ≈ 2.26 × 10⁸ m/s. Light is slower in water.", { sub: "Speed of light in media", obj: "Use n = c/v" }),
  mcq("Q-RI-03", "refractive-index", 1, "conceptual", "‘Optically denser medium’ means a medium with:", ["Greater mass density", "Higher refractive index", "Lower refractive index", "Greater thickness"], "B",
    "Optical density refers to refractive index, not mass density. Kerosene has lower mass density than water but higher refractive index.", { dm: { A: "M-RI-DENSITY" }, mis: ["M-RI-DENSITY"], sub: "Optical density", obj: "Distinguish optical and mass density", reason: true }),
  // ── Lenses ──
  mcq("Q-LEN-01", "lenses", 1, "mcq", "Parallel rays strike a convex lens parallel to its principal axis. After refraction they:", ["Diverge as if from the focus", "Converge at the principal focus", "Pass undeviated", "Reflect back"], "B",
    "A convex lens converges parallel rays to its principal focus.", { sub: "Convex & concave lenses", obj: "Describe the action of a convex lens", diag: true }),
  mcq("Q-LEN-02", "lenses", 2, "conceptual", "An object is placed beyond 2F of a convex lens. The image formed is:", ["Virtual, erect and magnified", "Real, inverted and diminished, between F and 2F", "Real, inverted and magnified, beyond 2F", "Real, erect and diminished"], "B",
    "Beyond 2F the image is real, inverted and diminished and lies between F and 2F on the other side (the working of a camera).",
    { dm: { A: "M-OBJ-IMG" }, mis: ["M-OBJ-IMG"], sub: "Image formation", obj: "Predict image from object position", reason: true,
      hints: ["Recall the table: object position → image position, size and nature.", "Beyond 2F, is the object close to the lens or far from it? A far object gives a smaller image.", "Real images form on the other side of the lens and are inverted."] }),
  mcq("Q-LEN-03", "lenses", 2, "conceptual", "Which statement about virtual images is correct?", [
    "A virtual image is always inverted",
    "A virtual image cannot be caught on a screen because rays only appear to meet",
    "A virtual image forms when the object is beyond 2F of a convex lens",
    "A virtual image is always smaller than the object"], "B",
    "Virtual images are formed where rays only appear to meet, so they cannot be projected. Single-lens virtual images are erect and may be magnified.",
    { dm: { A: "M-VIRT-INV", C: "M-OBJ-IMG" }, mis: ["M-VIRT-INV", "M-OBJ-IMG"], sub: "Real vs virtual images", obj: "Separate image nature from orientation", reason: true }),
  mcq("Q-LEN-04", "lenses", 3, "application", "A student holds a convex lens as a magnifying glass, with the object between F and the optical centre. The image is:", [
    "Real, inverted and magnified", "Virtual, erect and magnified", "Virtual, inverted and magnified", "Real, erect and diminished"], "B",
    "Inside the focal length a convex lens forms a virtual, erect, magnified image on the same side as the object.",
    { dm: { C: "M-VIRT-INV" }, mis: ["M-VIRT-INV"], sub: "Image formation", obj: "Apply image rules to a magnifier", reason: true }),
  mcq("Q-LEN-05", "lenses", 4, "assertion_reasoning", "Assertion (A): A concave lens always forms a virtual, erect and diminished image.\nReason (R): A concave lens diverges rays so they never actually meet on the other side.", AR, "A",
    "Diverging rays only appear to meet behind the lens, so the image is always virtual, erect and diminished. R explains A.", { sub: "Concave lenses", obj: "Link lens action to image nature", reason: true }),
  // ── Ray diagrams ──
  mcq("Q-RAY-01", "ray-diagrams", 2, "mcq", "Which ray passes through a thin convex lens without deviation?", ["Ray parallel to the principal axis", "Ray through the principal focus", "Ray through the optical centre", "Ray at the edge of the lens"], "C",
    "A ray through the optical centre of a thin lens goes straight.", { sub: "Principal rays", obj: "Recall the three principal rays", diag: true }),
  mcq("Q-RAY-02", "ray-diagrams", 3, "application", "A ray parallel to the principal axis strikes a convex lens. After refraction it:", ["Passes through the focus on the other side", "Passes through the optical centre", "Returns parallel to the axis", "Diverges as if from the focus on the same side"], "A",
    "Parallel rays converge at the principal focus on the far side of a convex lens — this is one of the principal rays used to locate images.", { sub: "Locating images", obj: "Trace a principal ray correctly" }),
  // ── Lens formula ──
  mcq("Q-LF-01", "lens-formula", 1, "conceptual", "In the lens formula 1/v − 1/u = 1/f, what does v represent?", ["Distance of the object from the lens", "Distance of the image from the optical centre", "Focal length", "Magnification"], "B",
    "v is the image distance measured from the optical centre; u is the object distance and f the focal length.", { sub: "Image distance", obj: "Identify the quantities in the lens formula",
      hints: ["Recall the formula: 1/v − 1/u = 1/f.", "u is for the object. Which letter is left for the image?", "v = image distance from the optical centre."] }),
  mcq("Q-LF-02", "lens-formula", 1, "conceptual", "By the New Cartesian sign convention, the object distance u for a real object placed in front of a lens is:", ["Positive", "Negative", "Zero", "Infinite"], "B",
    "Distances measured against the direction of incident light are negative, and a real object is on the side the light comes from, so u is negative.",
    { dm: { A: "M-SIGN-CONV" }, mis: ["M-SIGN-CONV"], sub: "Sign convention", obj: "Apply the sign convention to u", reason: true }),
  num("Q-LF-03", "lens-formula", 3, "numerical", "An object is placed 30 cm from a convex lens of focal length 10 cm. Find the image distance (in cm, with sign).", 15, "cm",
    "u = −30 cm, f = +10 cm. 1/v = 1/f + 1/u = 1/10 − 1/30 = 2/30, so v = +15 cm (real image on the opposite side).",
    { sub: "Image distance", obj: "Use the lens formula with signs", diag: true, mis: ["M-SIGN-CONV"],
      hints: ["Recall the lens formula: 1/v − 1/u = 1/f.", "What values do you know? u = −30 cm (real object), f = +10 cm (convex lens).", "Substitute: 1/v = 1/f + 1/u = 1/10 − 1/30. Now find v."],
      wp: [{ v: -15, err: "misconception", m: "M-SIGN-CONV", note: "Sign of v is wrong — likely u was taken as positive." }, { v: 7.5, err: "calculation", note: "Added 1/10 + 1/30 incorrectly." }] }),
  num("Q-LF-04", "lens-formula", 2, "numerical", "A real object is 40 cm from a convex lens and its real image forms 40 cm on the other side. Find the focal length (in cm).", 20, "cm",
    "u = −40, v = +40. 1/f = 1/v − 1/u = 1/40 + 1/40 = 1/20, so f = 20 cm.",
    { sub: "Image distance", obj: "Find f from u and v", hints: ["Recall: 1/v − 1/u = 1/f.", "u = −40 cm and v = +40 cm.", "1/f = 1/40 + 1/40. Remember to take the reciprocal at the end!"],
      wp: [{ v: 0.05, err: "calculation", note: "Forgot to invert 1/f." }, { v: 40, err: "calculation", note: "Used f = v." }] }),
  num("Q-LF-05", "lens-formula", 3, "numerical", "A real object 15 cm from a convex lens (f = 10 cm) forms an image. Find the magnification m = v/u.", -2, "",
    "u = −15, f = 10 → 1/v = 1/10 − 1/15 = 1/30, v = 30 cm. m = v/u = 30/(−15) = −2: real, inverted, twice the size.",
    { sub: "Lens magnification", obj: "Combine lens formula and magnification", mis: ["M-SIGN-CONV"], wp: [{ v: 2, err: "misconception", m: "M-SIGN-CONV", note: "Magnification sign dropped — real images are inverted (negative m)." }] }),
  num("Q-LF-06", "lens-formula", 4, "application", "A student wants a real image on a screen that is 3 times the size of the object, using a convex lens of focal length 12 cm. How far from the lens (in cm) should the screen be placed?", 48, "cm",
    "m = −3 means v = −3u. Then 1/v − 1/u = 1/12 gives −1/(3u) − 1/u = 1/12 → u = −16 cm and v = +48 cm.",
    { sub: "Lens magnification", obj: "Solve a multi-step lens problem", wp: [{ v: 16, err: "calculation", note: "This is the object distance, not the screen distance." }, { v: 36, err: "calculation", note: "Used v = 3f." }] }),
  num("Q-LF-07", "lens-formula", 3, "numerical", "A real object is 0.5 m from a convex lens of focal length 20 cm. Find the image distance (in cm).", 33.3, "cm",
    "Convert first: u = −0.5 m = −50 cm. 1/v = 1/20 − 1/50 = 3/100 → v = 33.3 cm.",
    { sub: "Unit consistency", obj: "Convert units before substituting", mis: ["M-UNITS-CM"], tol: 0.03,
      hints: ["Recall: 1/v − 1/u = 1/f.", "What values do you know — and are they in the same unit?", "Convert 0.5 m to cm, then substitute."],
      wp: [{ v: -0.51, err: "misconception", m: "M-UNITS-CM", note: "Mixed metres and centimetres inside one formula." }] }),
  // ── Power of lens ──
  mcq("Q-POW-01", "power-of-lens", 2, "conceptual", "Lens X has a focal length of 50 cm and lens Y has a focal length of 20 cm. Which lens has the greater power?", ["Lens X, because its focal length is greater", "Lens Y, because its focal length is shorter", "Both have the same power", "It depends on the colour of light only"], "B",
    "P = 1/f. Lens Y: 1/0.20 = 5 D; lens X: 1/0.50 = 2 D. A shorter focal length means a stronger, more powerful lens.",
    { dm: { A: "M-POWER-FOCAL", C: "M-POWER-FOCAL" }, mis: ["M-POWER-FOCAL"], sub: "Focal length and power", obj: "Compare lens power from focal lengths", diag: true, reason: true,
      hints: ["Recall P = 1/f.", "Compute 1/f for each lens in metres.", "Compare the two powers — which is larger?"] }),
  num("Q-POW-02", "power-of-lens", 2, "numerical", "Find the power (in dioptres) of a convex lens of focal length 25 cm.", 4, "D",
    "Convert f = 25 cm = 0.25 m. P = 1/f = 1/0.25 = +4 D.", { sub: "Dioptre", obj: "Compute power with f in metres", mis: ["M-UNITS-CM"],
      hints: ["Recall P = 1/f, with f in METRES.", "What do you know? f = 25 cm. Convert it to metres.", "Substitute f = 0.25 m into P = 1/f."],
      wp: [{ v: 0.04, err: "misconception", m: "M-UNITS-CM", note: "Used f in centimetres." }, { v: 0.25, err: "calculation", note: "Gave f in metres instead of the power." }] }),
  mcq("Q-POW-03", "power-of-lens", 1, "mcq", "The SI unit of the power of a lens is:", ["Watt", "Dioptre", "Metre", "Joule"], "B",
    "Lens power is measured in dioptres (D), where 1 D = 1 m⁻¹.", { sub: "Dioptre", obj: "Recall the unit of lens power" }),
  num("Q-POW-04", "power-of-lens", 3, "numerical", "A concave lens has a power of −2.5 D. Find its focal length (in cm, with sign).", -40, "cm",
    "f = 1/P = 1/(−2.5) = −0.4 m = −40 cm. Concave lenses have negative focal length.",
    { sub: "Focal length and power", obj: "Invert power to focal length with sign", mis: ["M-POWER-FOCAL"], wp: [{ v: 40, err: "misconception", m: "M-SIGN-CONV", note: "Sign dropped — a concave lens has negative f." }, { v: -0.4, err: "calculation", note: "Left the answer in metres." }] }),
  num("Q-POW-05", "power-of-lens", 4, "application", "Two thin lenses of powers +3 D and −1 D are placed in contact. What is the focal length of the combination (in cm)?", 50, "cm",
    "P = P₁ + P₂ = 3 − 1 = +2 D, so f = 1/2 = 0.5 m = 50 cm.", { sub: "Combination of lenses", obj: "Add powers of lenses in contact", wp: [{ v: 33.3, err: "calculation", note: "Used only the +3 D lens." }] }),
  // ── Eye structure ──
  mcq("Q-EYE-01", "eye-structure", 1, "mcq", "Which part of the eye controls the amount of light entering it?", ["Cornea", "Iris", "Retina", "Optic nerve"], "B",
    "The iris adjusts the size of the pupil and so controls how much light enters.", { sub: "Cornea & iris", obj: "Name the function of the iris", diag: true }),
  mcq("Q-EYE-02", "eye-structure", 2, "mcq", "Most of the refraction of light entering the human eye takes place at the:", ["Eye lens", "Outer surface of the cornea", "Retina", "Iris"], "B",
    "The cornea provides most of the eye's refracting power; the lens fine-tunes focus.", { sub: "Cornea & iris", obj: "Locate where refraction occurs in the eye" }),
  // ── Accommodation ──
  mcq("Q-ACC-01", "accommodation", 2, "conceptual", "How does the human eye focus on a nearby object?", [
    "The eye lens moves forward away from the retina",
    "Ciliary muscles make the lens thicker, shortening its focal length",
    "The pupil becomes much smaller to sharpen the image",
    "The retina moves towards the lens"], "B",
    "The ciliary muscles contract, increasing the curvature of the lens (thicker), which reduces its focal length so near objects focus on the retina.",
    { dm: { A: "M-EYE-LENS-MOVE", D: "M-EYE-LENS-MOVE" }, mis: ["M-EYE-LENS-MOVE"], sub: "Ciliary muscles", obj: "Explain accommodation", diag: true, reason: true }),
  mcq("Q-ACC-02", "accommodation", 2, "mcq", "The least distance of distinct vision for a young adult with normal vision is about:", ["10 cm", "25 cm", "1 m", "Infinity"], "B", "The near point of a normal eye is about 25 cm.", { sub: "Near and far point", obj: "Recall near and far points" }),
  // ── Vision defects ──
  mcq("Q-VIS-01", "vision-defects", 3, "conceptual", "A person cannot see distant objects clearly. Which lens will correct this defect?", ["Convex lens", "Concave lens", "Cylindrical lens", "Plane glass"], "B",
    "This is myopia: the image forms in front of the retina. A concave (diverging) lens corrects it.", { dm: { A: "M-MYOPIA-CONVEX" }, mis: ["M-MYOPIA-CONVEX"], sub: "Myopia", obj: "Choose the lens that corrects myopia", diag: true, reason: true }),
  num("Q-VIS-02", "vision-defects", 3, "numerical", "A myopic person's far point is 80 cm. Find the power (in dioptres, with sign) of the lens that lets them see distant objects.", -1.25, "D",
    "The lens must form an image at the far point: f = −80 cm = −0.8 m. P = 1/f = −1.25 D.", { sub: "Corrective lenses", obj: "Compute corrective power", tol: 0.03, mis: ["M-MYOPIA-CONVEX", "M-UNITS-CM"],
      wp: [{ v: 1.25, err: "misconception", m: "M-MYOPIA-CONVEX", note: "Positive power — a convex lens was chosen." }, { v: -0.0125, err: "misconception", m: "M-UNITS-CM", note: "Used cm instead of metres." }] }),
  mcq("Q-VIS-03", "vision-defects", 2, "mcq", "In hypermetropia the image of a nearby object is formed:", ["On the retina", "In front of the retina", "Behind the retina", "On the cornea"], "C", "The eye is too weak (or too short), so the image falls behind the retina; a convex lens corrects it.", { sub: "Hypermetropia", obj: "Locate the image in hypermetropia" }),
  // ── Dispersion ──
  mcq("Q-DIS-01", "dispersion-scattering", 2, "conceptual", "What does a glass prism do to a beam of white light?", [
    "It adds colours to the white light",
    "It splits it into its component colours because each colour bends by a different amount",
    "It makes all colours travel at the same speed",
    "It absorbs all colours except violet"], "B",
    "White light already contains all colours; each is refracted differently, so the prism disperses them (violet bends most).", { dm: { A: "M-DISP-CREATES" }, mis: ["M-DISP-CREATES"], sub: "Dispersion by prism", obj: "Explain dispersion", diag: true, reason: true }),
  mcq("Q-DIS-02", "dispersion-scattering", 2, "mcq", "The clear sky appears blue because:", ["Air molecules scatter blue light more strongly than red", "The sky reflects the colour of the sea", "Blue light travels fastest in a vacuum", "Dust absorbs red light"], "A", "Shorter wavelengths (blue) are scattered more strongly by air molecules.", { sub: "Scattering of light", obj: "Explain the blue sky" }),
  // ── Electric current ──
  mcq("Q-CUR-01", "electric-current", 1, "conceptual", "In a simple series circuit, current flows through a bulb. Compared with the current entering the bulb, the current leaving it is:", ["Less, because the bulb uses some", "The same", "More", "Zero"], "B",
    "Charge is conserved: current is the same at every point in a series loop. The bulb transfers energy, not charge.", { dm: { A: "M-CURRENT-USED" }, mis: ["M-CURRENT-USED"], sub: "Charge & current", obj: "State that series current is constant", diag: true, reason: true }),
  num("Q-CUR-02", "electric-current", 2, "numerical", "A charge of 120 C flows through a wire in 2 minutes. What is the current (in A)?", 1, "A",
    "I = Q/t = 120 C / 120 s = 1 A. Time must be in seconds.", { sub: "Charge & current", obj: "Use I = Q/t with SI units", wp: [{ v: 60, err: "calculation", note: "Used minutes instead of seconds." }] }),
  // ── Ohm's law ──
  num("Q-OHM-01", "ohms-law", 2, "numerical", "A 10 Ω resistor is connected across a 5 V battery. What current flows (in A)?", 0.5, "A", "I = V/R = 5/10 = 0.5 A.", { sub: "Applying V = IR", obj: "Use Ohm's law to find current", diag: true, wp: [{ v: 2, err: "calculation", note: "Divided R by V." }, { v: 50, err: "calculation", note: "Multiplied V and R." }] }),
  mcq("Q-OHM-02", "ohms-law", 2, "conceptual", "A student says: ‘When the voltage across an ohmic conductor doubles, its resistance doubles.’ This statement is:", [
    "Correct, since R = V/I",
    "Incorrect — resistance stays constant while the current doubles",
    "Correct only for metals",
    "Incorrect — the current halves"], "B",
    "R is a property of the conductor. Doubling V doubles I, so R = V/I is unchanged.", { dm: { A: "M-OHM-DEPENDS" }, mis: ["M-OHM-DEPENDS"], sub: "Ohmic conductors", obj: "Distinguish resistance from V and I", reason: true }),
  mcq("Q-OHM-03", "ohms-law", 3, "mcq", "The V–I graph of an ohmic conductor at constant temperature is:", ["A curve bending upward", "A straight line through the origin", "A horizontal line", "A straight line not through the origin"], "B", "V ∝ I gives a straight line through the origin whose slope is R.", { sub: "V–I relationship", obj: "Read an ohmic V–I graph" }),
  // ── Resistance ──
  mcq("Q-RES-01", "resistance", 2, "conceptual", "Two copper wires have the same length. Wire A has diameter 1 mm and wire B has diameter 2 mm. Which statement is correct?", ["B has more resistance because it has more material", "B has less resistance, one quarter of A's", "Both have the same resistance", "B has half the resistance of A"], "B",
    "R = ρL/A and area ∝ d². B's area is 4× A's, so its resistance is one quarter.", { dm: { A: "M-RES-THICK" }, mis: ["M-RES-THICK"], sub: "Factors affecting resistance", obj: "Relate resistance to cross-sectional area", diag: true, reason: true }),
  num("Q-RES-02", "resistance", 3, "numerical", "A wire of resistance 8 Ω is stretched uniformly to twice its length (volume unchanged). What is its new resistance (in Ω)?", 32, "Ω",
    "Doubling length halves the area, so R = ρL/A becomes 2 × 2 = 4 times larger: 32 Ω.", { sub: "Resistivity", obj: "Reason about stretching a wire", wp: [{ v: 16, err: "calculation", note: "Only the length effect was counted; area also halves." }] }),
  mcq("Q-RES-03", "resistance", 1, "mcq", "The SI unit of resistivity is:", ["Ω", "Ω m", "Ω/m", "S"], "B", "ρ = RA/L, so the unit is Ω × m² / m = Ω m.", { sub: "Resistivity", obj: "Recall the unit of resistivity" }),
  // ── Series & parallel ──
  num("Q-SP-01", "series-parallel", 2, "numerical", "Two resistors of 6 Ω and 3 Ω are connected in parallel. What is the equivalent resistance (in Ω)?", 2, "Ω",
    "1/R = 1/6 + 1/3 = 3/6 = 1/2, so R = 2 Ω.", { sub: "Parallel combination", obj: "Compute parallel resistance", diag: true, mis: ["M-PARALLEL-ADD"],
      hints: ["Recall: 1/R = 1/R₁ + 1/R₂ for parallel.", "What do you know? R₁ = 6 Ω, R₂ = 3 Ω.", "Add the reciprocals, then invert."], wp: [{ v: 9, err: "misconception", m: "M-PARALLEL-ADD", note: "Resistances were added as if in series." }, { v: 0.5, err: "calculation", note: "Forgot to invert 1/R." }] }),
  num("Q-SP-02", "series-parallel", 3, "numerical", "Resistors of 6 Ω and 12 Ω are in series with a 9 V battery. What is the current (in A)?", 0.5, "A", "R = 6 + 12 = 18 Ω, I = V/R = 9/18 = 0.5 A.", { sub: "Series combination", obj: "Combine series resistors then apply Ohm's law", wp: [{ v: 1.5, err: "calculation", note: "Used only the 6 Ω resistor." }] }),
  mcq("Q-SP-03", "series-parallel", 2, "conceptual", "Another resistor is connected in parallel to an existing circuit. The total resistance:", ["Increases", "Decreases", "Stays the same", "Becomes infinite"], "B", "Each parallel branch adds another path for current, so the equivalent resistance decreases.", { dm: { A: "M-PARALLEL-ADD" }, mis: ["M-PARALLEL-ADD"], sub: "Equivalent resistance", obj: "Predict the effect of extra parallel branches", reason: true }),
  // ── Electric power ──
  num("Q-PWR-01", "electric-power", 2, "numerical", "A 60 W bulb works on a 220 V supply. Find the current drawn (in A, 2 decimals).", 0.27, "A", "I = P/V = 60/220 ≈ 0.27 A.", { sub: "Power formulas", obj: "Use P = VI", diag: true, tol: 0.04, wp: [{ v: 3.67, err: "calculation", note: "Divided V by P." }] }),
  num("Q-PWR-02", "electric-power", 3, "numerical", "A 1000 W heater runs for 3 hours. How much energy does it use (in kWh)?", 3, "kWh", "E = P × t = 1 kW × 3 h = 3 kWh.", { sub: "Energy and kWh", obj: "Compute energy in kWh", wp: [{ v: 3000, err: "calculation", note: "Left power in watts (this is Wh)." }] }),
  mcq("Q-PWR-03", "electric-power", 2, "conceptual", "Bulb A has resistance 60 Ω and bulb B has resistance 120 Ω. Both are connected to the same 120 V supply. Which one dissipates more power?", ["Bulb B, because it has more resistance", "Bulb A, because P = V²/R", "Both the same", "Cannot be determined"], "B",
    "At constant voltage P = V²/R, so the bulb with the SMALLER resistance (bulb A: 240 W vs 120 W) dissipates more power.", { dm: { A: "M-POWER-R" }, mis: ["M-POWER-R"], sub: "Power formulas", obj: "Choose the right power formula", reason: true }),
  // ── Heating effect ──
  num("Q-HEAT-01", "heating-effect", 2, "numerical", "A current of 2 A flows through a 10 Ω resistor for 5 s. How much heat is produced (in J)?", 200, "J", "H = I²Rt = 4 × 10 × 5 = 200 J.", { sub: "Joule's law", obj: "Apply H = I²Rt", diag: true, wp: [{ v: 100, err: "calculation", note: "Used I instead of I²." }] }),
  // ── Magnetic field ──
  mcq("Q-MF-01", "magnetic-field", 1, "conceptual", "Which statement about magnetic field lines is correct?", ["Two field lines can cross where the field is strongest", "Field lines never intersect; closer lines mean a stronger field", "The field exists only at the poles", "Field lines start and end at the same pole"], "B", "Field lines never intersect, and their density shows the strength of the field.", { dm: { A: "M-FIELD-CROSS", C: "M-FIELD-CROSS" }, mis: ["M-FIELD-CROSS"], sub: "Field lines", obj: "State properties of field lines", diag: true, reason: true }),
  mcq("Q-MF-02", "magnetic-field", 2, "mcq", "Outside a bar magnet, magnetic field lines go from:", ["South to north", "North to south", "East to west", "Centre to the poles"], "B", "Outside the magnet, field lines emerge from the north pole and enter the south pole (they form closed loops inside).", { sub: "Bar magnet", obj: "Give the direction of field lines" }),
  // ── Field due to current ──
  mcq("Q-FCW-01", "field-current-wire", 2, "mcq", "A long straight wire carries current vertically upward. The magnetic field lines around it are:", ["Straight lines parallel to the wire", "Concentric circles in a horizontal plane around the wire", "Straight lines radiating outward", "There is no magnetic field"], "B", "By Oersted's discovery and the right-hand thumb rule, the field lines are concentric circles around the wire.", { sub: "Right-hand thumb rule", obj: "Describe the field around a straight wire", diag: true }),
  mcq("Q-FCW-02", "field-current-wire", 2, "mcq", "The magnetic field near a straight current-carrying wire becomes stronger when:", ["The current decreases", "The distance from the wire increases", "The current increases or the point is closer to the wire", "The wire is made thinner at constant current only"], "C", "Field strength grows with current and falls with distance from the wire.", { sub: "Right-hand thumb rule", obj: "Identify factors affecting field strength" }),
  // ── Force on conductor ──
  mcq("Q-FOC-01", "force-on-conductor", 3, "conceptual", "The force on a current-carrying conductor in a magnetic field is maximum when the current is:", ["Parallel to the field", "Perpendicular to the field", "At 45° to the field only", "Zero"], "B", "Force is greatest when current ⟂ field and zero when they are parallel.", { dm: { A: "M-FLEMING" }, mis: ["M-FLEMING"], sub: "Direction of force", obj: "Relate force to orientation", diag: true, reason: true }),
  mcq("Q-FOC-02", "force-on-conductor", 2, "mcq", "In Fleming's left-hand rule, the thumb, forefinger and middle finger respectively represent:", ["Current, field, force", "Force, field, current", "Field, force, current", "Force, current, field"], "B", "Thumb = force (motion), forefinger = field, middle finger = current.", { sub: "Fleming's left-hand rule", obj: "Recall Fleming's left-hand rule" }),
  // ── Electric motor ──
  mcq("Q-MOT-01", "electric-motor", 2, "mcq", "The function of the split-ring commutator in a DC motor is to:", ["Increase the current", "Reverse the current direction in the coil every half rotation", "Reduce friction", "Convert AC to DC outside the motor"], "B", "Reversing the current each half turn keeps the torque in the same rotational direction.", { sub: "Split-ring commutator", obj: "Explain the role of the commutator", diag: true }),
  mcq("Q-MOT-02", "electric-motor", 3, "application", "Which change would NOT increase the force on the coil of a simple DC motor?", ["Using a stronger magnet", "Increasing the number of turns", "Increasing the current", "Reducing the number of turns"], "D", "Force grows with field strength, current and number of turns; fewer turns weakens the force.", { sub: "Working of motor", obj: "Identify factors affecting motor torque" }),
  // ── Induction ──
  mcq("Q-IND-01", "em-induction", 2, "conceptual", "A strong bar magnet is held stationary inside a coil connected to a galvanometer. The galvanometer shows:", ["A large steady deflection", "A small steady deflection", "No deflection", "Rapid oscillation"], "C", "Induced current needs a changing magnetic flux. A stationary magnet gives none.", { dm: { A: "M-INDUCTION-STATIC", B: "M-INDUCTION-STATIC" }, mis: ["M-INDUCTION-STATIC"], sub: "Faraday's experiments", obj: "Identify the condition for induction", diag: true, reason: true }),
  mcq("Q-IND-02", "em-induction", 2, "mcq", "An induced current is produced in a coil when:", ["It is placed near a stationary magnet", "The magnetic field through it changes", "A constant current flows in a nearby wire", "It is kept in the dark"], "B", "A changing magnetic flux through the coil induces an emf and current.", { sub: "Direction of induced current", obj: "State the condition for induction" }),
  // ── Generators ──
  mcq("Q-GEN-01", "ac-dc-generator", 2, "mcq", "Mains AC in India has a frequency of 50 Hz. This means its direction reverses:", ["50 times per second", "100 times per second", "25 times per second", "Once per second"], "B", "Each cycle has two reversals, so 50 cycles/s gives 100 reversals per second.", { sub: "Frequency", obj: "Relate frequency to reversals", diag: true }),
  mcq("Q-GEN-02", "ac-dc-generator", 3, "mcq", "An AC generator differs from a DC generator in that it uses:", ["Split rings instead of slip rings", "Slip rings instead of a split-ring commutator", "A stronger magnet", "No coil"], "B", "Slip rings keep a continuous connection, so the output alternates; a split-ring commutator makes the output unidirectional.", { sub: "AC generator", obj: "Distinguish AC and DC generators" }),
  // ── Domestic circuits ──
  mcq("Q-DOM-01", "domestic-circuits", 1, "mcq", "The earth wire in a household circuit is used to:", ["Increase the current", "Provide a safe path for leakage current to the ground", "Reduce power consumption", "Carry current to the appliance"], "B", "Earthing prevents the metal body of an appliance from becoming live, protecting users from shocks.", { sub: "Earthing", obj: "Explain the role of earthing", diag: true }),
  mcq("Q-DOM-02", "domestic-circuits", 2, "conceptual", "A fuse wire should be made of a material with:", ["A high melting point and low resistance", "A low melting point and high resistance", "A high melting point and high resistance", "A low melting point and low resistance"], "B", "A fuse must melt quickly when current is excessive, so it has a low melting point (and relatively high resistance).", { dm: { A: "M-FUSE-MELT", C: "M-FUSE-MELT" }, mis: ["M-FUSE-MELT"], sub: "Fuse", obj: "Choose suitable fuse properties", reason: true }),
  // ── Short answer ──
  short("Q-SHORT-01", "power-of-lens", 2, "State, in words or as a formula, how the power of a lens is related to its focal length (taken in metres).", [["reciprocal", "1/f", "inverse", "p = 1/f", "p=1/f", "one over"]], "P = 1/f",
    "Power is the reciprocal of focal length: P = 1/f with f in metres, so a shorter focal length means greater power.", { sub: "Focal length and power", obj: "State P = 1/f", mis: ["M-POWER-FOCAL"], reason: true }),
  short("Q-SHORT-02", "em-induction", 3, "In one sentence: what must happen to the magnetic field through a coil for a current to be induced in it?", [["change", "changing", "vary", "varies", "varying", "moving", "move"]], "The magnetic flux through the coil must change",
    "Electromagnetic induction needs a changing magnetic flux — through relative motion or a changing field.", { sub: "Faraday's experiments", obj: "State the condition for induction", mis: ["M-INDUCTION-STATIC"], reason: true }),
];
