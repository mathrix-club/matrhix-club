/*
 * Study Hub folders.
 * To link a card to its own Drive folder, add  drive: 'https://drive.google.com/drive/folders/...'
 * Cards without `drive` fall back to MATHRIX_CONFIG.driveRoot.
 * resources: any of 'notes', 'pdf', 'worksheet'.
 */
window.MATHRIX_STUDY = [
  /* ---------- Grade 10: Math ---------- */
  { grade: '10', subject: 'math', topic: 'Algebra', title: 'Quadratics and the discriminant',
    summary: 'Solve by factoring, completing the square and the formula, then read the roots from the graph.',
    resources: ['notes', 'pdf', 'worksheet'] },
  { grade: '10', subject: 'math', topic: 'Algebra', title: 'Polynomials and factoring',
    summary: 'Expand, factor and divide polynomials, and use the remainder theorem.',
    resources: ['notes', 'worksheet'] },
  { grade: '10', subject: 'math', topic: 'Algebra', title: 'Systems of equations',
    summary: 'Substitution, elimination and graphical solutions, with word problems.',
    resources: ['notes', 'pdf', 'worksheet'] },
  { grade: '10', subject: 'math', topic: 'Geometry', title: 'Circle theorems',
    summary: 'Angles in a circle, tangents and cyclic quadrilaterals, with proof practice.',
    resources: ['notes', 'pdf'] },
  { grade: '10', subject: 'math', topic: 'Geometry', title: 'Trigonometry in right triangles',
    summary: 'Sine, cosine and tangent for heights, distances and bearings.',
    resources: ['notes', 'worksheet'] },
  { grade: '10', subject: 'math', topic: 'Geometry', title: 'Coordinate geometry',
    summary: 'Distance, midpoint, gradient and equations of lines.',
    resources: ['notes', 'pdf', 'worksheet'] },
  { grade: '10', subject: 'math', topic: 'Functions', title: 'Absolute value functions',
    summary: 'Graph y = |x|, shift, stretch and reflect it, and solve absolute value equations and inequalities.',
    resources: ['notes', 'worksheet'] },
  { grade: '10', subject: 'math', topic: 'Calculus basics', title: 'Rates of change',
    summary: 'Average and instantaneous rate of change, and a first look at limits.',
    resources: ['notes', 'pdf'] },

  /* ---------- Grade 10: Mechanics ---------- */
  { grade: '10', subject: 'mechanics', topic: 'Kinematics', title: 'Motion graphs',
    summary: 'Read and sketch position-time and velocity-time graphs, and know what slope and area mean.',
    resources: ['notes', 'pdf', 'worksheet'] },
  { grade: '10', subject: 'mechanics', topic: 'Kinematics', title: 'Equations of motion',
    summary: 'Constant-acceleration problems with the five kinematic equations.',
    resources: ['notes', 'worksheet'] },
  { grade: '10', subject: 'mechanics', topic: 'Statics', title: 'Forces and free-body diagrams',
    summary: 'Name every force on an object and draw the diagram before you calculate.',
    resources: ['notes', 'pdf'] },
  { grade: '10', subject: 'mechanics', topic: 'Statics', title: 'Equilibrium of a particle',
    summary: 'Resolve forces into components and solve for tension and reaction forces.',
    resources: ['notes', 'worksheet'] },
  { grade: '10', subject: 'mechanics', topic: 'Dynamics', title: "Newton's three laws",
    summary: 'Link net force, mass and acceleration, and spot action-reaction pairs.',
    resources: ['notes', 'pdf', 'worksheet'] },
  { grade: '10', subject: 'mechanics', topic: 'Dynamics', title: 'Friction and inclined planes',
    summary: 'Static and kinetic friction, and motion up and down a slope.',
    resources: ['notes', 'worksheet'] },

  /* ---------- Grade 11: Math ---------- */
  { grade: '11', subject: 'math', topic: 'Algebra', title: 'Functions and transformations',
    summary: 'Domain, range, composition and inverses, plus shifts, stretches and reflections of graphs.',
    resources: ['notes', 'pdf', 'worksheet'] },
  { grade: '11', subject: 'math', topic: 'Algebra', title: 'Exponentials and logarithms',
    summary: 'Laws of logs, solving exponential equations and modelling growth and decay.',
    resources: ['notes', 'pdf', 'worksheet'] },
  { grade: '11', subject: 'math', topic: 'Algebra', title: 'Sequences and series',
    summary: 'Arithmetic and geometric sequences, sigma notation and sums to infinity.',
    resources: ['notes', 'worksheet'] },
  { grade: '11', subject: 'math', topic: 'Functions', title: 'Absolute value functions',
    summary: 'Graph y = |x|, shift, stretch and reflect it, and solve absolute value equations and inequalities.',
    resources: ['notes', 'worksheet'] },
  { grade: '11', subject: 'math', topic: 'Geometry', title: 'Trigonometric identities',
    summary: 'Unit circle, radians, the main identities and solving trig equations.',
    resources: ['notes', 'pdf', 'worksheet'] },
  { grade: '11', subject: 'math', topic: 'Geometry', title: 'Vectors in the plane',
    summary: 'Add and scale vectors, find magnitude and direction, and use the dot product.',
    resources: ['notes', 'pdf'] },
  { grade: '11', subject: 'math', topic: 'Calculus basics', title: 'Limits and continuity',
    summary: 'Evaluate limits algebraically and graphically, and decide where a function is continuous.',
    resources: ['notes', 'pdf'] },
  { grade: '11', subject: 'math', topic: 'Calculus basics', title: 'Derivatives and the power rule',
    summary: 'Differentiate polynomials, find tangent lines and read the sign of the gradient.',
    resources: ['notes', 'pdf', 'worksheet'] },
  { grade: '11', subject: 'math', topic: 'Calculus basics', title: 'Applications of derivatives',
    summary: 'Maximum and minimum problems, rates of change and curve sketching.',
    resources: ['notes', 'worksheet'] },

  /* ---------- Grade 11: Mechanics ---------- */
  { grade: '11', subject: 'mechanics', topic: 'Kinematics', title: 'Projectile motion',
    summary: 'Split motion into horizontal and vertical parts to find range, height and time of flight.',
    resources: ['notes', 'pdf', 'worksheet'] },
  { grade: '11', subject: 'mechanics', topic: 'Kinematics', title: 'Relative motion',
    summary: 'Velocities in different reference frames, from boats in currents to passing trains.',
    resources: ['notes', 'worksheet'] },
  { grade: '11', subject: 'mechanics', topic: 'Statics', title: 'Torque and moments',
    summary: 'Turning effects, the principle of moments and beams in balance.',
    resources: ['notes', 'pdf', 'worksheet'] },
  { grade: '11', subject: 'mechanics', topic: 'Statics', title: 'Centre of mass',
    summary: 'Locate the balance point of simple and composite shapes.',
    resources: ['notes', 'pdf'] },
  { grade: '11', subject: 'mechanics', topic: 'Dynamics', title: 'Work, energy and power',
    summary: 'The work-energy theorem, conservation of energy and rates of doing work.',
    resources: ['notes', 'pdf', 'worksheet'] },
  { grade: '11', subject: 'mechanics', topic: 'Dynamics', title: 'Momentum and collisions',
    summary: 'Impulse, conservation of momentum, and elastic versus inelastic collisions.',
    resources: ['notes', 'worksheet'] },
  { grade: '11', subject: 'mechanics', topic: 'Dynamics', title: 'Circular motion',
    summary: 'Centripetal force and acceleration for cars on bends and objects on strings.',
    resources: ['notes', 'pdf', 'worksheet'] }
];

/*
 * Key formulas shown in the Study Workbench, keyed by 'grade/topic'.
 * Each entry is [formula, what it means]. Keep them to the core results of that topic.
 */
window.MATHRIX_FORMULAS = {
  '10/Algebra': [
    ['x = (−b ± √(b² − 4ac)) / 2a', 'Quadratic formula for ax² + bx + c = 0'],
    ['Δ = b² − 4ac', 'Δ > 0: two real roots, Δ = 0: one repeated root, Δ < 0: no real roots'],
    ['x₁ + x₂ = −b/a,  x₁x₂ = c/a', 'Sum and product of the roots'],
    ['f(x) ÷ (x − a) leaves f(a)', 'Remainder theorem; f(a) = 0 means (x − a) is a factor'],
    ['a² − b² = (a − b)(a + b)', 'Difference of two squares']
  ],
  '10/Geometry': [
    ['∠ at centre = 2 × ∠ at circumference', 'Both angles stand on the same arc'],
    ['∠A + ∠C = 180°', 'Opposite angles of a cyclic quadrilateral'],
    ['sin θ = opp/hyp,  cos θ = adj/hyp,  tan θ = opp/adj', 'Right-triangle ratios'],
    ['d = √((x₂ − x₁)² + (y₂ − y₁)²)', 'Distance between two points'],
    ['m = (y₂ − y₁)/(x₂ − x₁),  y − y₁ = m(x − x₁)', 'Gradient and point-gradient form of a line']
  ],
  '10/Functions': [
    ['|x| = x if x ≥ 0,  −x if x < 0', 'Definition of absolute value'],
    ['y = a|x − h| + k', 'V-shaped graph with vertex (h, k); a < 0 opens downward'],
    ['|x| = c  ⇒  x = ±c', 'For c ≥ 0; no solution when c < 0'],
    ['|x| < c  ⇔  −c < x < c', 'Absolute value inequality, "less than"'],
    ['|x| > c  ⇔  x < −c or x > c', 'Absolute value inequality, "greater than"']
  ],
  '10/Calculus basics': [
    ['(f(b) − f(a)) / (b − a)', 'Average rate of change on [a, b]: slope of the secant'],
    ['lim h→0 (f(x + h) − f(x)) / h', 'Instantaneous rate of change: slope of the tangent']
  ],
  '10/Kinematics': [
    ['v = u + at', 'No displacement'],
    ['s = ut + ½at²', 'No final velocity'],
    ['v² = u² + 2as', 'No time'],
    ['s = ½(u + v)t', 'No acceleration'],
    ['slope of x–t = v,  area under v–t = s', 'Reading motion graphs']
  ],
  '10/Statics': [
    ['W = mg', 'Weight, with g ≈ 9.8 m/s²'],
    ['ΣFx = 0,  ΣFy = 0', 'Equilibrium of a particle'],
    ['Fx = F cos θ,  Fy = F sin θ', 'Resolving a force at angle θ to the x-axis'],
    ['N = mg cos θ', 'Normal reaction on an incline with no other perpendicular forces']
  ],
  '10/Dynamics': [
    ['ΣF = ma', "Newton's second law"],
    ['F_AB = −F_BA', "Newton's third law: equal and opposite"],
    ['f_s ≤ μ_s N,  f_k = μ_k N', 'Static and kinetic friction'],
    ['a = g sin θ', 'Sliding down a smooth incline'],
    ['a = g(sin θ − μ_k cos θ)', 'Sliding down a rough incline']
  ],

  '11/Algebra': [
    ['(f ∘ g)(x) = f(g(x))', 'Composition: apply g first'],
    ['log_a(xy) = log_a x + log_a y,  log_a(xⁿ) = n log_a x', 'Laws of logarithms'],
    ['aˣ = b  ⇔  x = log_a b', 'Switching between exponential and log form'],
    ['aₙ = a + (n − 1)d,  Sₙ = n/2 (2a + (n − 1)d)', 'Arithmetic sequence and series'],
    ['aₙ = arⁿ⁻¹,  Sₙ = a(1 − rⁿ)/(1 − r),  S∞ = a/(1 − r)', 'Geometric sequence and series; S∞ needs |r| < 1']
  ],
  '11/Functions': [
    ['|x| = x if x ≥ 0,  −x if x < 0', 'Definition of absolute value'],
    ['y = a|x − h| + k', 'V-shaped graph with vertex (h, k); a < 0 opens downward'],
    ['|x| = c  ⇒  x = ±c', 'For c ≥ 0; no solution when c < 0'],
    ['|x| < c  ⇔  −c < x < c', 'Absolute value inequality, "less than"'],
    ['|x| > c  ⇔  x < −c or x > c', 'Absolute value inequality, "greater than"']
  ],
  '11/Geometry': [
    ['sin²θ + cos²θ = 1', 'Pythagorean identity'],
    ['tan θ = sin θ / cos θ', 'Quotient identity'],
    ['π rad = 180°', 'Converting between radians and degrees'],
    ['|v| = √(x² + y²)', 'Magnitude of a vector (x, y)'],
    ['a · b = |a||b| cos θ = a₁b₁ + a₂b₂', 'Dot product; a · b = 0 means perpendicular']
  ],
  '11/Calculus basics': [
    ['lim x→a f(x) = f(a)', 'Condition for f to be continuous at a'],
    ["f′(x) = lim h→0 (f(x + h) − f(x)) / h", 'Derivative from first principles'],
    ['d/dx (xⁿ) = n xⁿ⁻¹', 'Power rule'],
    ["y − f(a) = f′(a)(x − a)", 'Tangent line at x = a'],
    ["f′(x) = 0;  f″ > 0 min,  f″ < 0 max", 'Stationary points and the second-derivative test']
  ],
  '11/Kinematics': [
    ['x = v cos θ · t,  y = v sin θ · t − ½gt²', 'Projectile position, launched from the origin'],
    ['T = 2v sin θ / g', 'Time of flight on level ground'],
    ['H = v² sin²θ / 2g', 'Maximum height'],
    ['R = v² sin 2θ / g', 'Range on level ground; greatest at θ = 45°'],
    ['v_AB = v_A − v_B', 'Velocity of A relative to B']
  ],
  '11/Statics': [
    ['τ = F d', 'Moment of a force; d is the perpendicular distance to the pivot'],
    ['ΣF = 0,  Στ = 0', 'Equilibrium of a rigid body'],
    ['Σ clockwise moments = Σ anticlockwise moments', 'Principle of moments'],
    ['x̄ = Σmx / Σm,  ȳ = Σmy / Σm', 'Centre of mass of a system']
  ],
  '11/Dynamics': [
    ['W = Fd cos θ', 'Work done by a constant force'],
    ['KE = ½mv²,  PE = mgh', 'Kinetic and gravitational potential energy'],
    ['P = W/t = Fv', 'Power'],
    ['J = FΔt = Δp,  p = mv', 'Impulse and momentum'],
    ['m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂', 'Conservation of momentum'],
    ['a = v²/r,  F = mv²/r', 'Centripetal acceleration and force']
  ]
};
