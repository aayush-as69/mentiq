// Additional questions ported from the original prototype's seed data (all MCQ, each with three progressive hints).
// Same shape as questions.js; none are flagged diagnostic, so the diagnostic set is unchanged.

export const extraQuestions = [
  {
    "code": "Q-X-01",
    "concept": "power-of-lens",
    "d": 1,
    "type": "conceptual",
    "prompt": "A convex lens has a focal length of +50 cm. What is the optical power of this lens in Dioptres (D), and why?",
    "options": [
      {
        "id": "A",
        "text": "+2.0 D, because f must be converted to +0.5 m before taking P = 1/f"
      },
      {
        "id": "B",
        "text": "+0.02 D, because P = 1/f = 1/50 D"
      },
      {
        "id": "C",
        "text": "+50 D, because optical power equals focal length for a converging lens"
      },
      {
        "id": "D",
        "text": "-2.0 D, because a convex lens has negative power by convention"
      }
    ],
    "answer": "A",
    "explanation": "1 Dioptre is the power of a lens of focal length 1 metre. Converting f = +50 cm gives +0.5 m. Therefore, P = 1 / (+0.5 m) = +2.0 D.",
    "hints": [
      "Hint 1 (Recall): Recall the definition of optical power: P = 1 / f, where focal length f MUST be expressed in metres.",
      "Hint 2 (Identify Values): Here focal length f = +50 cm. Convert +50 cm into metres first: f = 50 / 100 = +0.5 m.",
      "Hint 3 (Substitute): Substitute f = +0.5 m into P = 1 / f → P = 1 / 0.5 = +2.0 D."
    ],
    "sub": "Power of a Lens & Focal Length Conversion",
    "obj": "Connect focal length in cm to optical power in Dioptres using P = 100 / f(cm) with proper sign.",
    "secs": 60,
    "dm": {
      "B": "M-POWER-FOCAL",
      "C": "M-POWER-FOCAL"
    },
    "mis": [
      "M-POWER-FOCAL"
    ],
    "reason": true
  },
  {
    "code": "Q-X-02",
    "concept": "power-of-lens",
    "d": 1,
    "type": "conceptual",
    "prompt": "Lens A has a focal length of +20 cm and Lens B has a focal length of +40 cm. Which lens has greater optical power and bends parallel light rays more sharply?",
    "options": [
      {
        "id": "A",
        "text": "Lens A (+5 D), because power is inversely proportional to focal length (P = 1/f)"
      },
      {
        "id": "B",
        "text": "Lens B (+40 D), because larger focal length means stronger optical power"
      },
      {
        "id": "C",
        "text": "Both have equal power because both are convex lenses"
      },
      {
        "id": "D",
        "text": "Lens A (+0.05 D), because 1/20 is smaller than 1/40"
      }
    ],
    "answer": "A",
    "explanation": "Optical power P = 1/f(m) is inversely proportional to focal length. Lens A (f = 0.2 m) has a power of +5 D and converges rays closer to the optical centre than Lens B (f = 0.4 m, P = +2.5 D).",
    "hints": [
      "Hint 1 (Recall): Optical power measures the degree of convergence of light rays: P = 1 / f(m) = 100 / f(cm).",
      "Hint 2 (Identify Values): For Lens A, f_A = 20 cm = 0.2 m. For Lens B, f_B = 40 cm = 0.4 m.",
      "Hint 3 (Substitute): P_A = 100 / 20 = +5 D, whereas P_B = 100 / 40 = +2.5 D. Shorter focal length means higher power."
    ],
    "sub": "Comparing Power vs Focal Length of Two Lenses",
    "obj": "Resolve the misconception between focal length magnitude and optical converging power.",
    "secs": 60,
    "dm": {
      "B": "M-POWER-FOCAL",
      "D": "M-POWER-FOCAL"
    },
    "mis": [
      "M-POWER-FOCAL"
    ],
    "reason": true
  },
  {
    "code": "Q-X-03",
    "concept": "lens-formula",
    "d": 2,
    "type": "numerical",
    "prompt": "An object is placed at a distance of 30 cm from a convex lens of focal length 15 cm. Using the lens formula (1/v - 1/u = 1/f), find the image distance v and state the magnification m.",
    "options": [
      {
        "id": "A",
        "text": "v = +30 cm, m = -1 (Real, inverted, same size at 2F₂)"
      },
      {
        "id": "B",
        "text": "v = -30 cm, m = +1 (Virtual, erect, same side as object)"
      },
      {
        "id": "C",
        "text": "v = +10 cm, m = -0.33 (Using 1/v = 1/15 + 1/30)"
      },
      {
        "id": "D",
        "text": "v = +15 cm, m = -0.5 (At the principal focus F₂)"
      }
    ],
    "answer": "A",
    "explanation": "With u = -30 cm and f = +15 cm (notice the object is at 2F₁ = 30 cm), 1/v = 1/f + 1/u = 1/15 - 1/30 = 1/30, so v = +30 cm. Magnification m = v/u = 30/(-30) = -1.",
    "hints": [
      "Hint 1 (Recall): The lens formula is 1/v - 1/u = 1/f, which rearranges to 1/v = 1/f + 1/u.",
      "Hint 2 (Identify Values): Apply Cartesian sign convention: u = -30 cm (in front of lens) and f = +15 cm (convex lens).",
      "Hint 3 (Substitute): 1/v = 1/15 + 1/(-30) = (2 - 1)/30 = 1/30 → v = +30 cm. Magnification m = v/u = +30/(-30) = -1."
    ],
    "sub": "Lens Formula Numerical Calculation",
    "obj": "Apply Cartesian sign convention accurately to solve 1/v - 1/u = 1/f for a convex lens.",
    "secs": 95,
    "dm": {
      "C": "M-SIGN-CONV",
      "B": "M-VIRT-INV"
    },
    "mis": [
      "M-SIGN-CONV",
      "M-VIRT-INV"
    ],
    "reason": true
  },
  {
    "code": "Q-X-04",
    "concept": "lens-formula",
    "d": 3,
    "type": "application",
    "prompt": "An optician prescribes a corrective lens of power +2.5 D. If an object is held 60 cm in front of this lens, at what distance from the lens is the image formed?",
    "options": [
      {
        "id": "A",
        "text": "v = +120 cm (Since f = +40 cm, 1/v = 1/40 - 1/60 = 1/120)"
      },
      {
        "id": "B",
        "text": "v = +24 cm (Since 1/v = 1/40 + 1/60 = 5/120)"
      },
      {
        "id": "C",
        "text": "v = -120 cm (Virtual image on the same side)"
      },
      {
        "id": "D",
        "text": "v = +40 cm (Image forms directly at principal focus)"
      }
    ],
    "answer": "A",
    "explanation": "Step 1: From P = +2.5 D, f = 100 / 2.5 = +40 cm. Step 2: With u = -60 cm, 1/v = 1/f + 1/u = 1/40 - 1/60 = (3 - 2)/120 = 1/120. Thus v = +120 cm.",
    "hints": [
      "Hint 1 (Recall): First find focal length f from power P = +2.5 D using f(cm) = 100 / P.",
      "Hint 2 (Identify Values): f = 100 / 2.5 = +40 cm. Object distance u = -60 cm.",
      "Hint 3 (Substitute): Using 1/v - 1/u = 1/f → 1/v = 1/40 + 1/(-60) = (3 - 2)/120 = 1/120 → v = +120 cm."
    ],
    "sub": "Multi-step Power to Image Distance Application",
    "obj": "Synthesize optical power conversion (P → f) with the lens formula (f, u → v) in a multi-step application problem.",
    "secs": 120,
    "dm": {
      "B": "M-SIGN-CONV"
    },
    "mis": [
      "M-SIGN-CONV",
      "M-POWER-FOCAL"
    ],
    "reason": true
  },
  {
    "code": "Q-X-05",
    "concept": "lenses",
    "d": 1,
    "type": "conceptual",
    "prompt": "An illuminated candle is placed beyond 2F₁ in front of a convex lens. What are the position and nature of the image formed?",
    "options": [
      {
        "id": "A",
        "text": "Between F₂ and 2F₂ on the other side; Real, inverted, and diminished"
      },
      {
        "id": "B",
        "text": "On the same side as the candle; Virtual, erect, and magnified"
      },
      {
        "id": "C",
        "text": "Beyond 2F₂ on the other side; Real, inverted, and magnified"
      },
      {
        "id": "D",
        "text": "At F₂; Virtual and point-sized"
      }
    ],
    "answer": "A",
    "explanation": "When an object is beyond 2F₁ in front of a convex lens, the refracted rays converge between F₂ and 2F₂ on the opposite side. Because the rays physically intersect, the image is real, inverted, and smaller than the object.",
    "hints": [
      "Hint 1 (Recall): Trace two rays from an object placed beyond 2F₁ of a converging (convex) lens.",
      "Hint 2 (Identify Values): Ray 1 parallel to principal axis refracts through F₂; Ray 2 passes straight through optical centre O.",
      "Hint 3 (Substitute): The two refracted rays actually intersect between F₂ and 2F₂ below the principal axis, producing a real, inverted, diminished image."
    ],
    "sub": "Image Formation by Convex Lens (Object beyond 2F₁)",
    "obj": "Determine image position and real/virtual nature for an object placed beyond 2F₁ of a convex lens.",
    "secs": 65,
    "dm": {
      "B": "M-VIRT-INV"
    },
    "mis": [
      "M-VIRT-INV"
    ],
    "reason": true
  },
  {
    "code": "Q-X-06",
    "concept": "lenses",
    "d": 2,
    "type": "assertion_reasoning",
    "prompt": "Assertion (A): A convex lens of focal length 12 cm produces a virtual, erect, and magnified image when a stamp is held 8 cm from the lens.\nReason (R): When an object lies between the optical centre O and principal focus F₁, refracted rays diverge and appear to come from a point on the same side of the lens.",
    "options": [
      {
        "id": "A",
        "text": "Both A and R are true, and R is the correct explanation of A"
      },
      {
        "id": "B",
        "text": "Both A and R are true, but R is not the correct explanation of A"
      },
      {
        "id": "C",
        "text": "A is true, but R is false"
      },
      {
        "id": "D",
        "text": "A is false, because convex lenses always form real images"
      }
    ],
    "answer": "A",
    "explanation": "Because u = 8 cm is less than f = 12 cm, the object is between O and F₁. The emerging rays diverge and, when extended backward, form a virtual, erect, magnified image on the same side.",
    "hints": [
      "Hint 1 (Recall): Compare the object distance (8 cm) with the focal length (12 cm).",
      "Hint 2 (Identify Values): Since 8 cm < 12 cm, the object lies between O and F₁.",
      "Hint 3 (Substitute): Inside F₁, a convex lens cannot converge the rays on the far side; backward extension forms a virtual, erect, magnified image."
    ],
    "sub": "Magnifying Glass Condition (Object within F₁)",
    "obj": "Identify the exact threshold (|u| < f) where a convex lens transitions from forming real images to a virtual magnified image.",
    "secs": 75,
    "mis": [
      "M-VIRT-INV"
    ],
    "reason": true
  },
  {
    "code": "Q-X-07",
    "concept": "refractive-index",
    "d": 1,
    "type": "numerical",
    "prompt": "The refractive index of glass is 1.5 and the speed of light in vacuum is 3 × 10⁸ m/s. What is the speed of light inside the glass slab, and how does the ray bend upon entering from air?",
    "options": [
      {
        "id": "A",
        "text": "2.0 × 10⁸ m/s; bends towards the normal"
      },
      {
        "id": "B",
        "text": "4.5 × 10⁸ m/s; bends away from the normal"
      },
      {
        "id": "C",
        "text": "2.0 × 10⁸ m/s; bends away from the normal"
      },
      {
        "id": "D",
        "text": "1.5 × 10⁸ m/s; continues undeviated"
      }
    ],
    "answer": "A",
    "explanation": "Using n = c/v, v = (3 × 10⁸ m/s) / 1.5 = 2.0 × 10⁸ m/s. Entering an optically denser medium (glass, n = 1.5 > air, n = 1.0), the ray bends towards the normal.",
    "hints": [
      "Hint 1 (Recall): Refractive index n = c / v, where c = 3 × 10⁸ m/s.",
      "Hint 2 (Identify Values): Rearranging for speed in glass gives v = c / n = (3 × 10⁸) / 1.5.",
      "Hint 3 (Substitute): v = 2.0 × 10⁸ m/s. Because light slows down entering an optically denser medium, it bends towards the normal."
    ],
    "sub": "Refractive Index & Speed of Light",
    "obj": "Calculate speed of light in a medium from refractive index and predict ray bending direction.",
    "secs": 70,
    "mis": [
      "M-RI-DENSITY"
    ],
    "reason": true
  },
  {
    "code": "Q-X-08",
    "concept": "refractive-index",
    "d": 2,
    "type": "conceptual",
    "prompt": "Kerosene has a refractive index of 1.44 while water has a refractive index of 1.33, even though kerosene floats on water. When a light ray travels from water into kerosene, how will it bend?",
    "options": [
      {
        "id": "A",
        "text": "Towards the normal, because kerosene has a higher refractive index (optically denser) than water"
      },
      {
        "id": "B",
        "text": "Away from the normal, because kerosene floats on water and is less dense"
      },
      {
        "id": "C",
        "text": "It will not bend because both are transparent liquids"
      },
      {
        "id": "D",
        "text": "Away from the normal, because light speeds up in kerosene"
      }
    ],
    "answer": "A",
    "explanation": "Optical density is governed by refractive index (n = 1.44 > 1.33), not mass density. Light slows down entering kerosene from water and therefore bends towards the normal.",
    "hints": [
      "Hint 1 (Recall): Ray bending depends on optical density (refractive index n), NOT mass density.",
      "Hint 2 (Identify Values): n_water = 1.33 and n_kerosene = 1.44. Since 1.44 > 1.33, kerosene is optically denser.",
      "Hint 3 (Substitute): Travelling from optically rarer (water, 1.33) to optically denser (kerosene, 1.44), light slows down and bends towards the normal."
    ],
    "sub": "Optical Density vs Mass Density",
    "obj": "Distinguish optical density from mass density when predicting refraction across liquid interfaces.",
    "secs": 75,
    "dm": {
      "B": "M-RI-DENSITY"
    },
    "mis": [
      "M-RI-DENSITY"
    ],
    "reason": true
  },
  {
    "code": "Q-X-09",
    "concept": "magnification",
    "d": 1,
    "type": "conceptual",
    "prompt": "A concave mirror produces a magnification of m = -2.5 for an object placed in front of it. What does the negative sign and magnitude 2.5 indicate about the image?",
    "options": [
      {
        "id": "A",
        "text": "Real, inverted, and 2.5 times magnified"
      },
      {
        "id": "B",
        "text": "Virtual, erect, and 2.5 times magnified"
      },
      {
        "id": "C",
        "text": "Real, inverted, and diminished by 2.5 times"
      },
      {
        "id": "D",
        "text": "Virtual, inverted, and formed behind the mirror"
      }
    ],
    "answer": "A",
    "explanation": "A negative magnification (m < 0) signifies an inverted (and therefore real) image, while |m| = 2.5 > 1 indicates the image is 2.5 times larger than the object.",
    "hints": [
      "Hint 1 (Recall): In magnification m = h'/h, the sign tells orientation and |m| tells relative size.",
      "Hint 2 (Identify Values): Negative sign (-) means h' is negative (inverted, hence real). |m| = 2.5 > 1.",
      "Hint 3 (Substitute): Therefore the image is real, inverted, and 2.5 times larger than the object."
    ],
    "sub": "Spherical Mirror Magnification & Nature",
    "obj": "Interpret the sign and magnitude of linear magnification for spherical mirrors.",
    "secs": 55,
    "reason": true
  },
  {
    "code": "Q-X-10",
    "concept": "vision-defects",
    "d": 2,
    "type": "application",
    "prompt": "A student sitting in the back row cannot read the blackboard clearly beyond 2 m. Name the defect of vision and determine the power of the corrective lens required.",
    "options": [
      {
        "id": "A",
        "text": "Myopia; Concave lens of power -0.5 D"
      },
      {
        "id": "B",
        "text": "Hypermetropia; Convex lens of power +0.5 D"
      },
      {
        "id": "C",
        "text": "Myopia; Concave lens of power -2.0 D"
      },
      {
        "id": "D",
        "text": "Presbyopia; Convex lens of power +2.0 D"
      }
    ],
    "answer": "A",
    "explanation": "The student has Myopia with a far point of 2 m. The corrective concave lens must form a virtual image of distant objects (u = -∞) at v = -2 m, giving f = -2 m and P = 1/(-2) = -0.5 D.",
    "hints": [
      "Hint 1 (Recall): Difficulty seeing distant objects beyond a finite far point is Myopia (near-sightedness), corrected by a diverging (concave) lens.",
      "Hint 2 (Identify Values): To image a distant object (u = -∞) at the student's far point (v = -2 m), use 1/f = 1/v - 1/u.",
      "Hint 3 (Substitute): 1/f = 1/(-2 m) - 0 → f = -2 m, so Power P = 1/f = -0.5 D."
    ],
    "sub": "Myopia & Corrective Lens Prescription",
    "obj": "Calculate the corrective lens power for a myopic eye given its far point distance.",
    "secs": 80,
    "mis": [
      "M-POWER-FOCAL"
    ],
    "reason": true
  },
  {
    "code": "Q-X-11",
    "concept": "resistance",
    "d": 2,
    "type": "numerical",
    "prompt": "A cylindrical copper wire of resistance 4 Ω is stretched uniformly so that its length doubles (while volume remains constant). What is the new resistance of the stretched wire?",
    "options": [
      {
        "id": "A",
        "text": "16 Ω (Length doubles and cross-sectional area halves, so R becomes 4×)"
      },
      {
        "id": "B",
        "text": "8 Ω (Resistance is directly proportional to length only)"
      },
      {
        "id": "C",
        "text": "4 Ω (Resistivity of copper does not change)"
      },
      {
        "id": "D",
        "text": "2 Ω (Stretched wire is thinner so current flows faster)"
      }
    ],
    "answer": "A",
    "explanation": "Because total volume V = A × l is constant, doubling the length (2l) reduces the area to A/2. Thus R' = ρ(2l)/(A/2) = 4R = 4 × 4 Ω = 16 Ω.",
    "hints": [
      "Hint 1 (Recall): R = ρ(l / A). When a wire is stretched at constant volume, length l doubles AND cross-sectional area A halves.",
      "Hint 2 (Identify Values): l' = 2l and A' = A/2.",
      "Hint 3 (Substitute): R' = ρ(2l / (A/2)) = 4 × ρ(l/A) = 4 × 4 Ω = 16 Ω."
    ],
    "sub": "Wire Stretching & Resistance Change",
    "obj": "Account for simultaneous length and area changes when computing resistance of a stretched conductor.",
    "secs": 80,
    "reason": true
  },
  {
    "code": "Q-X-12",
    "concept": "series-parallel",
    "d": 2,
    "type": "numerical",
    "prompt": "Two resistors of 3 Ω and 6 Ω are connected in parallel, and this combination is connected in series with a 4 Ω resistor across a 12 V battery. What is the total equivalent resistance and total current drawn?",
    "options": [
      {
        "id": "A",
        "text": "R_eq = 6 Ω, Current I = 2.0 A"
      },
      {
        "id": "B",
        "text": "R_eq = 4.5 Ω, Current I = 2.67 A (Forgot to invert 1/R_p = 1/2)"
      },
      {
        "id": "C",
        "text": "R_eq = 13 Ω, Current I = 0.92 A (Added all resistors in series)"
      },
      {
        "id": "D",
        "text": "R_eq = 2 Ω, Current I = 6.0 A"
      }
    ],
    "answer": "A",
    "explanation": "For the parallel pair: Rp = (3 × 6)/(3 + 6) = 18/9 = 2 Ω. In series with 4 Ω: R_eq = 2 + 4 = 6 Ω. Current I = 12 V / 6 Ω = 2.0 A.",
    "hints": [
      "Hint 1 (Recall): First find the parallel equivalent Rp of 3 Ω and 6 Ω using 1/Rp = 1/3 + 1/6.",
      "Hint 2 (Identify Values): 1/Rp = (2 + 1)/6 = 3/6 = 1/2 → Invert to get Rp = 2 Ω.",
      "Hint 3 (Substitute): Add the series 4 Ω resistor: R_eq = 2 Ω + 4 Ω = 6 Ω. Total current I = V / R_eq = 12 V / 6 Ω = 2.0 A."
    ],
    "sub": "Parallel & Series Combination Network",
    "obj": "Solve mixed parallel-series resistor networks without omitting the reciprocal step.",
    "secs": 90,
    "dm": {
      "B": "M-PARALLEL-ADD"
    },
    "mis": [
      "M-PARALLEL-ADD"
    ],
    "reason": true
  },
  {
    "code": "Q-X-13",
    "concept": "electric-power",
    "d": 3,
    "type": "conceptual",
    "prompt": "Two resistors R₁ = 10 Ω and R₂ = 20 Ω are connected in SERIES across a battery. Which resistor dissipates more electrical power, and which formula explains why?",
    "options": [
      {
        "id": "A",
        "text": "R₂ (20 Ω) dissipates twice the power of R₁, because current I is identical in series and P = I²R"
      },
      {
        "id": "B",
        "text": "R₁ (10 Ω) dissipates twice the power of R₂, because P = V²/R is inversely proportional to R"
      },
      {
        "id": "C",
        "text": "Both dissipate equal power because the same current flows through both"
      },
      {
        "id": "D",
        "text": "R₁ dissipates more power because current reaches it first"
      }
    ],
    "answer": "A",
    "explanation": "In a series circuit, current I is identical through every resistor. Applying P = I²R shows that power is directly proportional to resistance R in series, so the 20 Ω resistor dissipates twice the heat/power of the 10 Ω resistor.",
    "hints": [
      "Hint 1 (Recall): To compare two components, choose the power formula where one variable is constant for both components.",
      "Hint 2 (Identify Values): In a SERIES connection, the same current I flows through both R₁ and R₂.",
      "Hint 3 (Substitute): Using P = I²R with constant I, power is directly proportional to R. Thus R₂ (20 Ω) dissipates 2× the power of R₁ (10 Ω)."
    ],
    "sub": "Power Dissipation in Series vs Parallel Resistors",
    "obj": "Select P = I²R vs P = V²/R appropriately based on series vs parallel circuit topology.",
    "secs": 85,
    "dm": {
      "B": "M-POWER-R"
    },
    "mis": [
      "M-POWER-R"
    ],
    "reason": true
  },
  {
    "code": "Q-X-14",
    "concept": "magnetic-field",
    "d": 2,
    "type": "conceptual",
    "prompt": "What is the nature of the magnetic field lines inside a long current-carrying solenoid, and what does this pattern indicate?",
    "options": [
      {
        "id": "A",
        "text": "Parallel straight lines, indicating that the magnetic field is uniform at all points inside the solenoid"
      },
      {
        "id": "B",
        "text": "Concentric circles, indicating the field is strongest only at the wire surface"
      },
      {
        "id": "C",
        "text": "Radial lines diverging from the centre, indicating zero field at the axis"
      },
      {
        "id": "D",
        "text": "Intersecting curves, indicating the field direction changes continuously"
      }
    ],
    "answer": "A",
    "explanation": "Inside a long current-carrying solenoid, the magnetic field lines are parallel, equally spaced straight lines, which proves the magnetic field is uniform throughout the interior of the solenoid.",
    "hints": [
      "Hint 1 (Recall): Recall the magnetic field pattern of a bar magnet vs inside a current-carrying coil (solenoid).",
      "Hint 2 (Identify Values): Inside the core of a solenoid, fields from adjacent turns reinforce each other.",
      "Hint 3 (Substitute): Equally spaced parallel straight lines represent a uniform magnetic field (same magnitude and direction everywhere inside)."
    ],
    "sub": "Solenoid Magnetic Field & Fleming's Left-Hand Rule",
    "obj": "Relate magnetic field line geometry inside a solenoid to field uniformity.",
    "secs": 60,
    "reason": true
  }
];
