const express = require('express');
const router = express.Router();
const User = require('../models/User');

const API_KEY = process.env.GEMINI_API_KEY || "api paste karni h ";

const gateData = {
  CSE: {
    name: "Computer Science & Engineering",
    pyqs: [
      { year: 2024, paperName: "GATE CSE 2024 Official Paper", totalMarks: 100, pdfUrl: "https://gate2024.iisc.ac.in/wp-content/uploads/2024/03/cs_gate2024.pdf" },
      { year: 2023, paperName: "GATE CSE 2023 Official Paper", totalMarks: 100, pdfUrl: "https://gate.iitk.ac.in/doc/CS_2023.pdf" }
    ],
    subjects: [
      {
        id: "em",
        name: "Engineering Mathematics & Discrete Math",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhqJPDXcvYlLfXPh37L89g3",
        chapters: [
          {
            title: "Unit 1: Discrete Mathematics",
            link: "",
            points: ["Propositional and First-order logic, Sets, Relations, Functions, Partial orders, Lattices, Groups, Combinatorics, Graph Theory."]
          },
          {
            title: "Unit 2: Linear Algebra, Calculus & Probability",
            link: "",
            points: ["Matrices, Determinants, Systems of linear equations, Eigenvalues, Calculus maxima/minima, Random variables, Bayes Theorem."]
          }
        ],
        quizzes: [
          { id: "em1", question: "A connected planar graph has 10 vertices and divides the plane into 7 faces. Number of edges is:", options: ["15", "17", "16", "14"], correctAnswer: "15", explanation: "Euler formula: V - E + R = 2 => 10 - E + 7 = 2 => E = 15." }
        ]
      },
      {
        id: "dl",
        name: "Digital Logic",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRjMH3kWfkh4huAZwZ35v0KG",
        chapters: [
          {
            title: "Unit 1: Boolean Algebra & Circuits",
            link: "",
            points: ["Boolean algebra, Minimization of functions, K-Maps, Combinational circuits (MUX, Encoders), Sequential circuits (Flip-flops, Counters)."]
          }
        ],
        quizzes: [
          { id: "dl1", question: "How many 2-to-1 MUXes are needed to build an 8-to-1 MUX?", options: ["7", "8", "4", "6"], correctAnswer: "7", explanation: "Stage 1: 4, Stage 2: 2, Stage 3: 1 => Total = 7." }
        ]
      },
      {
        id: "pds",
        name: "Programming & Data Structures",
        videoUrl: "https://www.youtube.com/playlist?list=PLdo5W4Nhv31bbKJzrsKfMpo_grxuLl8LU",
        chapters: [
          {
            title: "Unit 1: C Programming & Structures",
            link: "",
            points: ["Recursion, Arrays, Pointers, Stacks, Queues, Linked Lists, Trees, Binary Search Trees, Heaps."]
          }
        ],
        quizzes: [
          { id: "pds1", question: "Time complexity to build a Binary Max Heap of n elements?", options: ["O(n)", "O(n log n)", "O(log n)", "O(n^2)"], correctAnswer: "O(n)", explanation: "Bottom-up build-heap runs in linear O(n) time." }
        ]
      },
      {
        id: "algo",
        name: "Algorithms",
        videoUrl: "https://www.youtube.com/playlist?list=PLdo5W4Nhv31aBrJE1WS4MR9LRfbmZrAQu",
        chapters: [
          {
            title: "Unit 1: Complexity, Divide-Conquer & DP",
            link: "",
            points: ["Asymptotic analysis, Divide and conquer, Greedy algorithms, Dynamic programming, Shortest path, Minimum spanning trees."]
          }
        ],
        quizzes: [
          { id: "algo1", question: "Which algorithm finds shortest path with negative edge weights without negative cycles?", options: ["Bellman-Ford", "Dijkstra", "Prim's", "Kruskal's"], correctAnswer: "Bellman-Ford", explanation: "Bellman-Ford handles negative weights safely." }
        ]
      },
      {
        id: "toc",
        name: "Theory of Computation (TOC)",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgp46KUv4ZY64ZTeQOMVVKU",
        chapters: [
          {
            title: "Unit 1: Automata & Grammars",
            link: "",
            points: ["Regular expressions, Finite automata, Context-free grammars, Pushdown automata, Turing machines, Decidability."]
          }
        ],
        quizzes: [
          { id: "toc1", question: "Which of the following is decidable for Context-Free Languages?", options: ["Emptiness", "Equivalence", "Ambiguity", "Universality"], correctAnswer: "Emptiness", explanation: "Emptiness and finiteness are decidable for CFLs." }
        ]
      },
      {
        id: "cd",
        name: "Compiler Design",
        videoUrl: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiEKtKSIHYusizkESC42diyc",
        chapters: [
          {
            title: "Unit 1: Lexical Analysis & Parsing",
            link: "",
            points: ["Lexical analysis, LL and LR parsers, Syntax-directed translation, Intermediate code generation, Optimization."]
          }
        ],
        quizzes: [
          { id: "cd1", question: "Which bottom-up parser has the highest parsing power?", options: ["CLR(1)", "LALR(1)", "SLR(1)", "LR(0)"], correctAnswer: "CLR(1)", explanation: "CLR(1) uses complete lookaheads without merging states." }
        ]
      },
      {
        id: "os",
        name: "Operating Systems (OS)",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O",
        chapters: [
          {
            title: "Unit 1: Process, CPU Scheduling & Memory",
            link: "",
            points: ["Process synchronization, Semaphores, Deadlock handling, CPU scheduling, Virtual memory, Paging, Page replacement."]
          }
        ],
        quizzes: [
          { id: "os1", question: "Belady's Anomaly occurs in which page replacement algorithm?", options: ["FIFO", "LRU", "Optimal", "LFU"], correctAnswer: "FIFO", explanation: "FIFO does not satisfy the inclusion property." }
        ]
      },
      {
        id: "dbms",
        name: "Databases (DBMS)",
        videoUrl: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8C9XdK_UB6YCxPECC",
        chapters: [
          {
            title: "Unit 1: Relational Model, SQL & Transactions",
            link: "",
            points: ["ER-model, Relational algebra, SQL, Normalization (1NF to BCNF), Transactions, Concurrency control, B/B+ trees."]
          }
        ],
        quizzes: [
          { id: "db1", question: "For a relation to be in BCNF, for every non-trivial X -> Y:", options: ["X must be a superkey", "Y must be prime", "X must be candidate key", "Y must be superkey"], correctAnswer: "X must be a superkey", explanation: "BCNF strictly requires the determinant X to be a superkey." }
        ]
      },
      {
        id: "coa",
        name: "Computer Organization & Architecture (COA)",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgLLlzdgiTUKULKJPYc0A4q",
        chapters: [
          {
            title: "Unit 1: Machine Instructions & Pipelining",
            link: "",
            points: ["Addressing modes, Instruction pipelining, Pipeline hazards, Memory hierarchy, Cache mapping, Secondary storage."]
          }
        ],
        quizzes: [
          { id: "coa1", question: "Ideal speedup in an n-stage pipeline for a large number of instructions approaches:", options: ["n", "1", "n/2", "Infinite"], correctAnswer: "n", explanation: "Speedup approaches the number of pipeline stages as instruction count grows." }
        ]
      },
      {
        id: "cn",
        name: "Computer Networks (CN)",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgMCUAG0XRw78UA8qnv6jEx",
        chapters: [
          {
            title: "Unit 1: Network Layers & Protocols",
            link: "",
            points: ["CSMA/CD, IPv4 CIDR addressing, Routing algorithms, TCP/UDP transport layer, Flow and Congestion control."]
          }
        ],
        quizzes: [
          { id: "cn1", question: "Minimum frame size in CSMA/CD is proportional to:", options: ["2 * Propagation Delay * Bandwidth", "Propagation Delay / Bandwidth", "Bandwidth / 2", "Frame Rate"], correctAnswer: "2 * Propagation Delay * Bandwidth", explanation: "Frame length L >= 2 * Tp * Bandwidth ensures collision detection." }
        ]
      }
    ]
  },

  ECE: {
    name: "Electronics & Communication Engineering",
    pyqs: [
      { year: 2024, paperName: "GATE ECE 2024 Official Paper", totalMarks: 100, pdfUrl: "https://gate2024.iisc.ac.in/wp-content/uploads/2024/03/ec_gate2024.pdf" },
      { year: 2023, paperName: "GATE ECE 2023 Official Paper", totalMarks: 100, pdfUrl: "https://gate.iitk.ac.in/doc/EC_2023.pdf" }
    ],
    subjects: [
      {
        id: "ece_edc",
        name: "Electronic Devices",
        videoUrl: "https://www.youtube.com/playlist?list=PL9RcWoqXmzaIl9eWvW2i_w3d1pP76Hk7G",
        chapters: [
          {
            title: "Unit 1: Semiconductor Physics & Junctions",
            link: "",
            points: ["Energy bands, Carrier concentration, Drift/Diffusion current, Generation-recombination, PN junction, Zener diode."]
          },
          {
            title: "Unit 2: Transistors & Optoelectronics",
            link: "",
            points: ["BJT characteristics, Early effect, MOS capacitor, MOSFET threshold voltage, Solar cell, Photodetector, LED."]
          }
        ],
        quizzes: [
          { id: "eedc1", question: "In an n-type semiconductor, the Fermi energy level lies:", options: ["Close to conduction band", "Close to valence band", "Center of bandgap", "Inside conduction band"], correctAnswer: "Close to conduction band", explanation: "Donor impurities shift the Fermi level closer to the conduction band." }
        ]
      },
      {
        id: "ece_analog",
        name: "Analog Circuits",
        videoUrl: "https://www.youtube.com/playlist?list=PL9RcWoqXmzaLNPpWvW2i_w3d1pP76Hk7G",
        chapters: [
          {
            title: "Unit 1: Diodes, BJT, MOSFET & Biasing",
            link: "",
            points: [
              "Diode clipping and clamping circuits, Rectifiers and power supplies.",
              "BJT and MOSFET small-signal amplifiers, Biasing techniques, Frequency response.",
              "Feedback amplifiers: Current and voltage feedback topologies."
            ]
          },
          {
            title: "Unit 2: Operational Amplifiers & Oscillators",
            link: "",
            points: [
              "Ideal and practical Op-Amp parameters, Inverting/Non-inverting amplifiers.",
              "Integrators, Differentiators, Active filters, Schmitt triggers.",
              "Sinusoidal oscillators: Barkhausen criterion, RC phase-shift and Wien-bridge oscillators."
            ]
          }
        ],
        quizzes: [
          { id: "ecan1", question: "An ideal operational amplifier has an input impedance of:", options: ["Infinite", "Zero", "50 Ohm", "100 kOhm"], correctAnswer: "Infinite", explanation: "Ideal Op-Amps draw zero input current due to infinite input resistance." }
        ]
      },
      {
        id: "ece_signals",
        name: "Signals and Systems",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhG6s3jYIU48CqsT5cyiDTO",
        chapters: [
          {
            title: "Unit 1: Continuous & Discrete Signals, LTI Systems",
            link: "",
            points: [
              "Energy vs Power signals, Periodic vs Aperiodic signals, Even/Odd signals.",
              "Linearity, Time-invariance, Causality, BIBO Stability of LTI systems.",
              "Continuous and discrete-time convolution sum and integral."
            ]
          },
          {
            title: "Unit 2: Fourier, Laplace & Z-Transforms",
            link: "",
            points: [
              "Continuous-Time Fourier Series (CTFS) and Fourier Transform (CTFT).",
              "Laplace Transform with Region of Convergence (ROC) and transfer functions.",
              "Discrete-Time Fourier Transform (DTFT), DFT, FFT, and Z-Transform system analysis."
            ]
          }
        ],
        quizzes: [
          { id: "ecsig1", question: "Continuous Fourier Transform of unit impulse delta(t) is equal to:", options: ["1", "0", "Infinity", "2 * pi"], correctAnswer: "1", explanation: "Unit impulse has a constant frequency spectrum of magnitude 1." }
        ]
      },
      {
        id: "ece_control",
        name: "Control Systems",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhP7o8g7M6Zk2z6Rk0Zp7L1",
        chapters: [
          {
            title: "Unit 1: Transfer Functions & Stability",
            link: "",
            points: ["Block diagrams, Signal flow graphs, Transient response of 1st and 2nd order systems, Routh-Hurwitz stability criterion."]
          },
          {
            title: "Unit 2: Frequency Response & Compensators",
            link: "",
            points: ["Root locus, Bode plot, Nyquist criterion, Gain and Phase margins, Lead/Lag compensators, PID controllers."]
          }
        ],
        quizzes: [
          { id: "eccs1", question: "For an underdamped second-order control system, damping ratio (zeta) is:", options: ["0 < zeta < 1", "zeta = 1", "zeta > 1", "zeta = 0"], correctAnswer: "0 < zeta < 1", explanation: "Damping ratio between 0 and 1 produces oscillatory underdamped response." }
        ]
      },
      {
        id: "ece_comm",
        name: "Communication Systems",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRg2ZzX6O2u8p2R1v9Xk3L9p",
        chapters: [
          {
            title: "Unit 1: Analog Communications & Noise",
            link: "",
            points: ["AM, FM, PM, Modulation index, Superheterodyne receivers, SNR calculations, Noise figure and thermal noise."]
          },
          {
            title: "Unit 2: Digital Communications & Information Theory",
            link: "",
            points: ["Sampling theorem, PCM, DPCM, ASK, PSK, FSK, QPSK, BER performance, Shannon channel capacity theorem."]
          }
        ],
        quizzes: [
          { id: "eccomm1", question: "According to Nyquist criterion, the minimum sampling rate for a signal bandlimited to 4 kHz is:", options: ["8 kHz", "4 kHz", "16 kHz", "2 kHz"], correctAnswer: "8 kHz", explanation: "Nyquist rate fs = 2 * fm = 2 * 4 kHz = 8 kHz." }
        ]
      },
      {
        id: "ece_emft",
        name: "Electromagnetics",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRh8K1b9a2R8k0Zp7L1v9Xk3",
        chapters: [
          {
            title: "Unit 1: Maxwell's Equations & Plane Waves",
            link: "",
            points: ["Maxwell's equations, Poynting vector, Plane wave propagation in dielectrics and conductors, Skin depth, Reflection."]
          },
          {
            title: "Unit 2: Transmission Lines & Waveguides",
            link: "",
            points: ["Characteristic impedance, Reflection coefficient, VSWR, Smith chart, Rectangular waveguides (dominant TE10 mode)."]
          }
        ],
        quizzes: [
          { id: "ecemft1", question: "The dominant mode for wave propagation in a rectangular waveguide is:", options: ["TE10", "TM11", "TE11", "TM01"], correctAnswer: "TE10", explanation: "TE10 has the lowest cutoff frequency." }
        ]
      },
      {
        id: "ece_network",
        name: "Network Theory",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhD_Kbp81j2rUCKa_XQ3xH9",
        chapters: [
          {
            title: "Unit 1: Network Theorems & Transients",
            link: "",
            points: ["Thevenin, Norton, Superposition, Maximum Power Transfer, First-order and second-order transient response."]
          },
          {
            title: "Unit 2: Resonance & Two-Port Networks",
            link: "",
            points: ["Sinusoidal steady state, Series and parallel resonance, Q-factor, Two-port network Z, Y, ABCD, and h parameters."]
          }
        ],
        quizzes: [
          { id: "ecnt1", question: "Maximum power transfer condition from DC source to load resistor is:", options: ["RL = Rth", "RL = 0", "RL = infinity", "RL = 2*Rth"], correctAnswer: "RL = Rth", explanation: "Load resistance must equal internal Thevenin resistance." }
        ]
      }
    ]
  },

  EE: {
    name: "Electrical Engineering",
    pyqs: [
      { year: 2024, paperName: "GATE EE 2024 Official Paper", totalMarks: 100, pdfUrl: "https://gate2024.iisc.ac.in/wp-content/uploads/2024/03/ee_gate2024.pdf" },
      { year: 2023, paperName: "GATE EE 2023 Official Paper", totalMarks: 100, pdfUrl: "https://gate.iitk.ac.in/doc/EE_2023.pdf" }
    ],
    subjects: [
      {
        id: "ee_signals",
        name: "Signal and System",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhG6s3jYIU48CqsT5cyiDTO",
        chapters: [
          {
            title: "Unit 1: Signals, Systems & LTI Properties",
            link: "",
            points: ["Continuous and discrete-time signals, LTI systems, Convolution integral and sum, BIBO stability, Causality."]
          },
          {
            title: "Unit 2: Fourier, Laplace & Z-Transform",
            link: "",
            points: ["Continuous and discrete Fourier series/transform, Laplace transform with ROC, Z-transform transfer functions."]
          }
        ],
        quizzes: [
          { id: "eesig1", question: "The Fourier transform of a unit impulse delta(t) is:", options: ["1", "0", "Infinity", "2*pi"], correctAnswer: "1", explanation: "Unit impulse has a constant frequency spectrum of magnitude 1." }
        ]
      },
      {
        id: "ee_math",
        name: "Engineering Mathematics",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhqJPDXcvYlLfXPh37L89g3",
        chapters: [
          {
            title: "Unit 1: Linear Algebra, Calculus & Complex Variables",
            link: "",
            points: ["Matrix algebra, Eigenvalues/Eigenvectors, Partial derivatives, Maxima/Minima, Cauchy-Riemann equations, Residue theorem."]
          },
          {
            title: "Unit 2: Differential Equations & Probability",
            link: "",
            points: ["First-order and higher-order linear differential equations, Laplace transforms, Random variables, Normal distribution."]
          }
        ],
        quizzes: [
          { id: "eemath1", question: "Sum of eigenvalues of a square matrix is always equal to its:", options: ["Trace", "Determinant", "Rank", "Nullity"], correctAnswer: "Trace", explanation: "The sum of eigenvalues equals the sum of main diagonal elements (trace)." }
        ]
      },
      {
        id: "ee_circuit",
        name: "Electric Circuit",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhD_Kbp81j2rUCKa_XQ3xH9",
        chapters: [
          {
            title: "Unit 1: Circuit Laws & Theorems",
            link: "",
            points: ["Node and Mesh analysis, Thevenin, Norton, Superposition, Maximum power transfer, Star-Delta conversion."]
          },
          {
            title: "Unit 2: Transient Analysis & Resonance",
            link: "",
            points: ["RL, RC, and RLC circuit transient responses, AC circuits, Power triangle (P, Q, S), Resonance, Two-port networks."]
          }
        ],
        quizzes: [
          { id: "eecir1", question: "Power factor at series resonance in an RLC circuit is:", options: ["Unity", "Zero", "0.5 lagging", "0.5 leading"], correctAnswer: "Unity", explanation: "Inductive and capacitive reactances cancel out (XL = XC), leaving pure resistance." }
        ]
      },
      {
        id: "ee_emft",
        name: "Electromagnetic Theory",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRh8K1b9a2R8k0Zp7L1v9Xk3",
        chapters: [
          {
            title: "Unit 1: Electrostatics & Magnetostatics",
            link: "",
            points: ["Coulomb's Law, Electric field intensity, Gauss's Law, Biot-Savart's Law, Ampere's Law, Magnetic vector potential."]
          },
          {
            title: "Unit 2: Time-Varying Fields & Maxwell's Equations",
            link: "",
            points: ["Faraday's Law, Displacement current, Maxwell's equations in differential and integral forms, Poynting vector."]
          }
        ],
        quizzes: [
          { id: "eeemft1", question: "Divergence of magnetic flux density (div B) is always equal to:", options: ["0", "Current density J", "Charge density rho", "1"], correctAnswer: "0", explanation: "Div B = 0 signifies the non-existence of isolated magnetic monopoles." }
        ]
      },
      {
        id: "ee_machines",
        name: "Electrical Machine",
        videoUrl: "https://www.youtube.com/playlist?list=PL9RcWoqXmzaLg8iS9k_OQAeuVcp2O",
        chapters: [
          {
            title: "Unit 1: Transformers & DC Machines",
            link: "",
            points: ["Single-phase and three-phase transformers, Equivalent circuit, OC/SC tests, DC generators and motors, Speed control."]
          },
          {
            title: "Unit 2: Induction & Synchronous Machines",
            link: "",
            points: ["3-phase induction motor torque-slip characteristics, Synchronous motor and alternator voltage regulation, V-curves."]
          }
        ],
        quizzes: [
          { id: "eemach1", question: "At starting of an induction motor, the slip value is equal to:", options: ["1", "0", "0.5", "Infinity"], correctAnswer: "1", explanation: "At start, rotor speed Nr = 0, so slip s = (Ns - 0)/Ns = 1." }
        ]
      },
      {
        id: "ee_power",
        name: "Power System",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O",
        chapters: [
          {
            title: "Unit 1: Transmission, Distribution & Fault Analysis",
            link: "",
            points: ["Line parameters, Ferranti effect, Surge impedance loading, Symmetrical and unsymmetrical faults, Sequence networks."]
          },
          {
            title: "Unit 2: Load Flow, Stability & Protection",
            link: "",
            points: ["Gauss-Seidel and Newton-Raphson load flow, Equal area criterion, Circuit breakers, Overcurrent and differential protection relays."]
          }
        ],
        quizzes: [
          { id: "eepow1", question: "Ferranti effect occurs when a transmission line is:", options: ["Lightly loaded or open-circuited", "Heavily loaded", "Short-circuited", "Operated at full load"], correctAnswer: "Lightly loaded or open-circuited", explanation: "Receiving end voltage exceeds sending end voltage under light load due to line capacitance." }
        ]
      },
      {
        id: "ee_control",
        name: "Control System",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhP7o8g7M6Zk2z6Rk0Zp7L1",
        chapters: [
          {
            title: "Unit 1: Time Response & Stability",
            link: "",
            points: ["Transfer function, Time response of second-order systems, Routh-Hurwitz stability criterion, Root locus techniques."]
          },
          {
            title: "Unit 2: Frequency Response & State Space",
            link: "",
            points: ["Bode plot, Nyquist stability, State space model, Controllability and observability matrices, Lead/Lag compensators."]
          }
        ],
        quizzes: [
          { id: "eecs1", question: "Type-1 control system subjected to a step input has a steady-state error of:", options: ["0", "Infinity", "1 / (1 + Kp)", "1 / Kv"], correctAnswer: "0", explanation: "Type-1 systems have infinite position error constant, resulting in zero steady-state error for step input." }
        ]
      },
      {
        id: "ee_measure",
        name: "Electrical Electronic Measurement",
        videoUrl: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8C9XdK_UB6YCxPECC",
        chapters: [
          {
            title: "Unit 1: Meters, Bridges & Transducers",
            link: "",
            points: ["PMMC, Moving Iron, Dynamometer wattmeter, AC Bridges (Maxwell, Schering, Wien), Potentiometers, LVDT, RTD, Strain gauges."]
          },
          {
            title: "Unit 2: Oscilloscopes & Digital Instruments",
            link: "",
            points: ["Cathode Ray Oscilloscope (CRO) time base and Lissajous figures, Digital voltmeters (DVM), Error analysis."]
          }
        ],
        quizzes: [
          { id: "eemeas1", question: "A PMMC instrument can be used to measure which type of current?", options: ["DC only", "AC only", "Both AC and DC", "Pulsating AC only"], correctAnswer: "DC only", explanation: "PMMC instruments deflect proportional to the average value, which is zero for symmetrical AC." }
        ]
      },
      {
        id: "ee_analog",
        name: "Analogue Electronics",
        videoUrl: "https://www.youtube.com/playlist?list=PL9RcWoqXmzaLNPpWvW2i_w3d1pP76Hk7G",
        chapters: [
          {
            title: "Unit 1: Diode Circuits, BJT & MOSFET",
            link: "",
            points: ["Clippers, clampers, rectifiers, Small-signal low frequency transistor amplifiers, Frequency response, Feedback amplifiers."]
          },
          {
            title: "Unit 2: Operational Amplifiers & Oscillators",
            link: "",
            points: ["Ideal Op-Amp, Inverting/Non-inverting configurations, Schmitt trigger, Active filters, RC phase shift oscillator."]
          }
        ],
        quizzes: [
          { id: "eean1", question: "Negative feedback in an operational amplifier results in:", options: ["Increased bandwidth and reduced gain", "Increased gain and reduced bandwidth", "Decreased stability", "Increased distortion"], correctAnswer: "Increased bandwidth and reduced gain", explanation: "Negative feedback sacrifices gain to gain larger bandwidth and higher stability." }
        ]
      },
      {
        id: "ee_digital",
        name: "Digital Electronics",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRjMH3kWfkh4huAZwZ35v0KG",
        chapters: [
          {
            title: "Unit 1: Combinational & Sequential Circuits",
            link: "",
            points: ["Boolean minimization, Multiplexers, Decoders, Flip-flops (SR, JK, D, T), Counters, Shift registers, ADC and DAC converters."]
          }
        ],
        quizzes: [
          { id: "eedig1", question: "Number of flip-flops required to construct a MOD-12 counter is:", options: ["4", "3", "5", "12"], correctAnswer: "4", explanation: "2^(n-1) < MOD <= 2^n. For MOD 12: 2^3 < 12 <= 2^4, so n = 4." }
        ]
      },
      {
        id: "ee_power_elec",
        name: "Power Electronics",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgLLlzdgiTUKULKJPYc0A4q",
        chapters: [
          {
            title: "Unit 1: Power Devices & Converters",
            link: "",
            points: ["SCR, MOSFET, IGBT characteristics, Firing circuits, Single-phase and three-phase phase-controlled rectifiers."]
          },
          {
            title: "Unit 2: Choppers, Inverters & Drives",
            link: "",
            points: ["DC-DC converters (Buck, Boost, Buck-Boost), Voltage Source Inverters (VSI), Pulse Width Modulation (PWM), Speed drives."]
          }
        ],
        quizzes: [
          { id: "eepe1", question: "In a step-down Buck converter with duty cycle D, the output voltage Vo is equal to:", options: ["D * Vin", "Vin / (1 - D)", "Vin / D", "D / (1 - D) * Vin"], correctAnswer: "D * Vin", explanation: "For a buck converter, Vo = D * Vin." }
        ]
      }
    ]
  },

  ME: {
    name: "Mechanical Engineering",
    pyqs: [
      { year: 2024, paperName: "GATE ME 2024 Official Paper", totalMarks: 100, pdfUrl: "https://gate2024.iisc.ac.in/wp-content/uploads/2024/03/me_gate2024.pdf" },
      { year: 2023, paperName: "GATE ME 2023 Official Paper", totalMarks: 100, pdfUrl: "https://gate.iitk.ac.in/doc/ME_2023.pdf" }
    ],
    subjects: [
      {
        id: "me_math",
        name: "Engineering Mathematics",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhqJPDXcvYlLfXPh37L89g3",
        chapters: [
          {
            title: "Unit 1: Linear Algebra, Calculus & ODE",
            link: "",
            points: ["Matrix rank, Eigenvalues, Gradient, Divergence, Curl, Maxima/Minima, First order and second order linear ODEs."]
          }
        ],
        quizzes: [
          { id: "mem1", question: "For a divergence-free vector field V, div(V) equals:", options: ["0", "1", "Curl(V)", "Infinity"], correctAnswer: "0", explanation: "Incompressible solenoidal vector fields have zero divergence." }
        ]
      },
      {
        id: "me_mechanics",
        name: "Engineering Mechanics",
        videoUrl: "https://www.youtube.com/playlist?list=PLdo5W4Nhv31bbKJzrsKfMpo_grxuLl8LU",
        chapters: [
          {
            title: "Unit 1: Statics & Dynamics",
            link: "",
            points: ["Free body diagrams, Equilibrium, Trusses, Friction, Kinematics and kinetics of particles and rigid bodies, Impulse-momentum."]
          }
        ],
        quizzes: [
          { id: "meem1", question: "Number of zero force members in a statically determinate truss is identified using:", options: ["Joint equilibrium inspection", "Lami's theorem", "Varignon theorem", "Mohr's circle"], correctAnswer: "Joint equilibrium inspection", explanation: "Joint equilibrium inspection easily identifies zero force members." }
        ]
      },
      {
        id: "me_som",
        name: "Strength of Material",
        videoUrl: "https://www.youtube.com/playlist?list=PLdo5W4Nhv31aBrJE1WS4MR9LRfbmZrAQu",
        chapters: [
          {
            title: "Unit 1: Stresses, Beams & Torsion",
            link: "",
            points: ["Stress-strain relations, Mohr's circle, Shear force and bending moment diagrams, Torsion of shafts, Euler buckling of columns."]
          }
        ],
        quizzes: [
          { id: "mesom1", question: "Maximum bending stress in a beam of rectangular cross-section occurs at:", options: ["Extreme fibers", "Neutral axis", "Quarter depth", "Centroid"], correctAnswer: "Extreme fibers", explanation: "Bending stress is directly proportional to distance from neutral axis: sigma = M*y / I." }
        ]
      },
      {
        id: "me_tom",
        name: "Theory of Machine",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgp46KUv4ZY64ZTeQOMVVKU",
        chapters: [
          {
            title: "Unit 1: Mechanisms, Cams & Vibrations",
            link: "",
            points: ["Displacement, velocity, acceleration analysis of 4-bar linkage, Gears and gear trains, Flywheels, Free and forced vibrations."]
          }
        ],
        quizzes: [
          { id: "metom1", question: "Degree of freedom of a planar four-bar mechanism with 4 revolute pairs is:", options: ["1", "2", "0", "3"], correctAnswer: "1", explanation: "Using Kutzbach criterion: DOF = 3(4 - 1) - 2(4) = 1." }
        ]
      },
      {
        id: "me_md",
        name: "Machine Design",
        videoUrl: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiEKtKSIHYusizkESC42diyc",
        chapters: [
          {
            title: "Unit 1: Design Against Failure",
            link: "",
            points: ["Static and fatigue failure theories (Soderberg, Goodman), Design of shafts, gears, rolling contact bearings, brakes, clutches."]
          }
        ],
        quizzes: [
          { id: "memd1", question: "Which fatigue failure theory is the most conservative for ductile materials?", options: ["Soderberg", "Goodman", "Gerber", "Mises"], correctAnswer: "Soderberg", explanation: "Soderberg line uses yield strength as reference, making it the most conservative." }
        ]
      },
      {
        id: "me_fm",
        name: "Fluid Mechanics",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O",
        chapters: [
          {
            title: "Unit 1: Fluid Statics & Dynamics",
            link: "",
            points: ["Fluid properties, Manometry, Buoyancy, Continuity equation, Bernoulli's equation, Laminar and turbulent flow through pipes, Boundary layers."]
          }
        ],
        quizzes: [
          { id: "mefm1", question: "Darcy-Weisbach friction factor f for fully developed laminar pipe flow with Reynolds number Re is:", options: ["64 / Re", "16 / Re", "32 / Re", "0.079 / Re^0.25"], correctAnswer: "64 / Re", explanation: "Standard Darcy friction factor for laminar pipe flow is f = 64 / Re." }
        ]
      },
      {
        id: "me_ht",
        name: "Heat Transfer",
        videoUrl: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8C9XdK_UB6YCxPECC",
        chapters: [
          {
            title: "Unit 1: Conduction, Convection & Radiation",
            link: "",
            points: ["Fourier's law, 1-D steady state conduction with heat generation, Fins, Forced and free convection, LMTD and NTU in heat exchangers, Stefan-Boltzmann law."]
          }
        ],
        quizzes: [
          { id: "meht1", question: "The ratio of kinematic viscosity to thermal diffusivity is known as:", options: ["Prandtl Number", "Nusselt Number", "Reynolds Number", "Grashof Number"], correctAnswer: "Prandtl Number", explanation: "Pr = nu / alpha = (mu * Cp) / k." }
        ]
      },
      {
        id: "me_thermo",
        name: "Thermodynamics",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgLLlzdgiTUKULKJPYc0A4q",
        chapters: [
          {
            title: "Unit 1: Laws of Thermodynamics & Cycles",
            link: "",
            points: ["First and Second laws, SFEE, Entropy, Availability/Exergy, Ideal gas relations, Rankine, Otto, Diesel, Brayton cycles."]
          }
        ],
        quizzes: [
          { id: "meth1", question: "Efficiency of an ideal Otto cycle depends primarily on:", options: ["Compression ratio", "Cutoff ratio", "Maximum temperature", "Pressure ratio"], correctAnswer: "Compression ratio", explanation: "Otto efficiency eta = 1 - 1 / (r^(gamma - 1))." }
        ]
      },
      {
        id: "me_rac",
        name: "Refrigeration and Air Conditioning",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgMCUAG0XRw78UA8qnv6jEx",
        chapters: [
          {
            title: "Unit 1: VCR System & Psychrometry",
            link: "",
            points: ["Vapour compression refrigeration (VCR) cycle, COP, Refrigerants, Psychrometric chart, DBT, WBT, DPT, Relative humidity, Air conditioning processes."]
          }
        ],
        quizzes: [
          { id: "merac1", question: "During sensible cooling of moist air, the relative humidity:", options: ["Increases", "Decreases", "Remains constant", "Becomes zero"], correctAnswer: "Increases", explanation: "Sensible cooling moves the state leftwards on the psychrometric chart, increasing relative humidity." }
        ]
      },
      {
        id: "me_manufacturing",
        name: "Manufacturing Engineering",
        videoUrl: "https://www.youtube.com/playlist?list=PLdo5W4Nhv31bbKJzrsKfMpo_grxuLl8LU",
        chapters: [
          {
            title: "Unit 1: Casting, Forming, Joining & Machining",
            link: "",
            points: ["Chvorinov's rule in casting, Rolling, Extrusion, Wire drawing, TIG/MIG welding, Merchant circle analysis, Taylor's tool life equation, CNC."]
          }
        ],
        quizzes: [
          { id: "memfg1", question: "According to Chvorinov's rule, solidification time of a casting is proportional to:", options: ["(Volume / Surface Area)^2", "Volume / Surface Area", "(Surface Area / Volume)^2", "Volume^2"], correctAnswer: "(Volume / Surface Area)^2", explanation: "Chvorinov's law: t = C * (V / A)^2." }
        ]
      },
      {
        id: "me_industrial",
        name: "Industrial Engineering",
        videoUrl: "https://www.youtube.com/playlist?list=PLdo5W4Nhv31aBrJE1WS4MR9LRfbmZrAQu",
        chapters: [
          {
            title: "Unit 1: Operations Research & Management",
            link: "",
            points: ["Linear programming (simplex and graphical), Transportation and assignment models, PERT/CPM, Inventory control (EOQ model), Forecasting, Queuing models."]
          }
        ],
        quizzes: [
          { id: "meie1", question: "In the basic EOQ model, if annual demand is doubled, the economic order quantity becomes:", options: ["sqrt(2) times", "2 times", "4 times", "Half"], correctAnswer: "sqrt(2) times", explanation: "EOQ = sqrt(2*D*S / H). Doubling D multiplies EOQ by sqrt(2)." }
        ]
      }
    ]
  },

  CE: {
    name: "Civil Engineering",
    pyqs: [
      { year: 2024, paperName: "GATE CE 2024 Official Paper", totalMarks: 100, pdfUrl: "https://gate2024.iisc.ac.in/wp-content/uploads/2024/03/ce_gate2024.pdf" },
      { year: 2023, paperName: "GATE CE 2023 Official Paper", totalMarks: 100, pdfUrl: "https://gate.iitk.ac.in/doc/CE_2023.pdf" }
    ],
    subjects: [
      {
        id: "ce_math",
        name: "Engineering Mathematics",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhqJPDXcvYlLfXPh37L89g3",
        chapters: [
          {
            title: "Unit 1: Linear Algebra, Calculus & Statistics",
            link: "",
            points: ["Matrices, Systems of linear equations, Stokes and Gauss divergence theorems, Normal and Poisson distributions, Numerical methods."]
          }
        ],
        quizzes: [
          { id: "cemath1", question: "Trapezoidal rule integrates which polynomial degree exactly?", options: ["Degree 1 (Linear)", "Degree 2 (Quadratic)", "Degree 3 (Cubic)", "Any degree"], correctAnswer: "Degree 1 (Linear)", explanation: "Trapezoidal rule connects adjacent points with straight line segments (degree 1)." }
        ]
      },
      {
        id: "ce_mechanics",
        name: "Engineering Mechanics",
        videoUrl: "https://www.youtube.com/playlist?list=PLdo5W4Nhv31bbKJzrsKfMpo_grxuLl8LU",
        chapters: [
          {
            title: "Unit 1: Equilibrium & Trusses",
            link: "",
            points: ["System of forces, Free-body diagrams, Friction, Trusses, Kinematics and kinetics of particles, Work-energy principle."]
          }
        ],
        quizzes: [
          { id: "ceem1", question: "For concurrent forces in 2D to be in equilibrium, minimum conditions required are:", options: ["Sigma Fx = 0 and Sigma Fy = 0", "Sigma M = 0 only", "Sigma Fx = 0 only", "Three moment equations"], correctAnswer: "Sigma Fx = 0 and Sigma Fy = 0", explanation: "Concurrent forces meet at a single point, requiring only force balance equations." }
        ]
      },
      {
        id: "ce_sm",
        name: "Solid Mechanics",
        videoUrl: "https://www.youtube.com/playlist?list=PLdo5W4Nhv31aBrJE1WS4MR9LRfbmZrAQu",
        chapters: [
          {
            title: "Unit 1: Stresses, Strains & Beams",
            link: "",
            points: ["Stress-strain curves, Thermal stresses, Shear force and bending moment diagrams, Principal stresses, Mohr's circle, Deflection of beams, Torsion."]
          }
        ],
        quizzes: [
          { id: "cesm1", question: "Maximum deflection of a simply supported beam of length L under central point load W is:", options: ["W * L^3 / (48 * E * I)", "W * L^3 / (3 * E * I)", "5 * W * L^4 / (384 * E * I)", "W * L^2 / (8 * E * I)"], correctAnswer: "W * L^3 / (48 * E * I)", explanation: "Standard central deflection formula is delta = W*L^3 / (48*EI)." }
        ]
      },
      {
        id: "ce_sa",
        name: "Structural Analysis",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgp46KUv4ZY64ZTeQOMVVKU",
        chapters: [
          {
            title: "Unit 1: Determinate & Indeterminate Structures",
            link: "",
            points: ["Static and kinematic indeterminacy, Influence line diagrams, Moment distribution method, Slope-deflection, Matrix stiffness method."]
          }
        ],
        quizzes: [
          { id: "cesa1", question: "Static indeterminacy of a propped cantilever beam is:", options: ["1", "2", "3", "0"], correctAnswer: "1", explanation: "Total reactions = 3 (fixed) + 1 (prop) = 4. Equilibrium equations = 3. Ds = 4 - 3 = 1." }
        ]
      },
      {
        id: "ce_cmm",
        name: "Construction Material and Management",
        videoUrl: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiEKtKSIHYusizkESC42diyc",
        chapters: [
          {
            title: "Unit 1: Concrete, Steel & Project Scheduling",
            link: "",
            points: ["Cement types, Concrete mix design, Workability, Slump test, CPM and PERT network scheduling, Crashing of activities."]
          }
        ],
        quizzes: [
          { id: "cecmm1", question: "In PERT analysis, the critical path consists of activities having:", options: ["Zero total float / slack", "Maximum duration", "Negative float", "Minimum cost"], correctAnswer: "Zero total float / slack", explanation: "Critical path activities have zero float, dictating the minimum project duration." }
        ]
      },
      {
        id: "ce_rcc",
        name: "RCC Structure",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRiVhbXDGLXDk_OQAeuVcp2O",
        chapters: [
          {
            title: "Unit 1: Limit State Design",
            link: "",
            points: ["Limit state of collapse in flexure, shear, torsion, Singly and doubly reinforced beams, One-way and two-way slabs, Short columns."]
          }
        ],
        quizzes: [
          { id: "cercc1", question: "As per IS 456:2000, the maximum strain in concrete at the outermost compression fiber in bending is:", options: ["0.0035", "0.002", "0.003", "0.004"], correctAnswer: "0.0035", explanation: "Clause 38.1 of IS 456 assumes maximum bending strain of 0.0035." }
        ]
      },
      {
        id: "ce_steel",
        name: "Design of Steel and Structure",
        videoUrl: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8C9XdK_UB6YCxPECC",
        chapters: [
          {
            title: "Unit 1: Connections, Tension & Compression",
            link: "",
            points: ["Bolted and welded joints, Tension member design and net section area, Plastic analysis, Shape factor, Column bases, Plate girders."]
          }
        ],
        quizzes: [
          { id: "cesteel1", question: "The shape factor for a standard rectangular cross-section in plastic design is:", options: ["1.5", "1.7", "1.18", "2.0"], correctAnswer: "1.5", explanation: "Shape factor S = Zp / Ze = (b*d^2 / 4) / (b*d^2 / 6) = 1.5." }
        ]
      },
      {
        id: "ce_geotech",
        name: "Geotechnical Engineering",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRjD1Kbp4a3Gf2c1x9p4l8k0",
        chapters: [
          {
            title: "Unit 1: Soil Mechanics & Foundation",
            link: "",
            points: ["Phase relations, Darcy's law, Permeability, Compaction, 1-D Consolidation, Terzaghi bearing capacity theory, Deep pile foundations."]
          }
        ],
        quizzes: [
          { id: "cegeo1", question: "Degree of saturation for completely dry soil is equal to:", options: ["0%", "100%", "50%", "Infinite"], correctAnswer: "0%", explanation: "In dry soil, volume of water is zero, yielding S = 0%." }
        ]
      },
      {
        id: "ce_fm_hydro",
        name: "Fluid Mechanics and Hydrolysis",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgLLlzdgiTUKULKJPYc0A4q",
        chapters: [
          {
            title: "Unit 1: Pipe Flow & Open Channel Hydraulics",
            link: "",
            points: ["Fluid pressure, Momentum equation, Pipe friction losses, Open channel flow: Manning's equation, Critical depth, Hydraulic jump."]
          }
        ],
        quizzes: [
          { id: "cefm1", question: "A hydraulic jump occurs in an open channel when flow transitions from:", options: ["Supercritical to subcritical", "Subcritical to supercritical", "Laminar to turbulent", "Uniform to non-uniform"], correctAnswer: "Supercritical to subcritical", explanation: "Hydraulic jumps occur when Froude number drops from Fr > 1 (supercritical) to Fr < 1 (subcritical)." }
        ]
      },
      {
        id: "ce_hydrology",
        name: "Engineering Hydrology",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgMCUAG0XRw78UA8qnv6jEx",
        chapters: [
          {
            title: "Unit 1: Precipitation & Hydrograph Analysis",
            link: "",
            points: ["Hydrologic cycle, Rain gauge network, Infiltration indices (Phi index), Unit hydrograph derivation, S-curve, Flood routing."]
          }
        ],
        quizzes: [
          { id: "cehydro1", question: "The area under a Unit Hydrograph represents a direct runoff depth of:", options: ["1 cm", "1 mm", "10 cm", "1 m"], correctAnswer: "1 cm", explanation: "By definition, a Unit Hydrograph results from 1 cm of effective rainfall." }
        ]
      },
      {
        id: "ce_irrigation",
        name: "Irrigation Engineering",
        videoUrl: "https://www.youtube.com/playlist?list=PLdo5W4Nhv31bbKJzrsKfMpo_grxuLl8LU",
        chapters: [
          {
            title: "Unit 1: Water Requirements & Canal Design",
            link: "",
            points: ["Crop seasons, Duty, Delta, Base period, Consumptive use, Kennedy's and Lacey's silt theories for alluvial canal design, Gravity dams."]
          }
        ],
        quizzes: [
          { id: "ceirr1", question: "The relationship between Duty (D in ha/cumec), Delta (delta in m), and Base period (B in days) is:", options: ["delta = 8.64 * B / D", "D = 8.64 * delta / B", "delta = 864 * B * D", "D = B / delta"], correctAnswer: "delta = 8.64 * B / D", explanation: "Standard irrigation relation: delta = 8.64 * B / D." }
        ]
      },
      {
        id: "ce_env",
        name: "Environmental Engineering",
        videoUrl: "https://www.youtube.com/playlist?list=PLdo5W4Nhv31aBrJE1WS4MR9LRfbmZrAQu",
        chapters: [
          {
            title: "Unit 1: Water & Wastewater Treatment",
            link: "",
            points: ["Water quality parameters, Coagulation, Rapid sand filtration, Chlorination, Activated sludge process (ASP), BOD kinetics, Air pollution standards."]
          }
        ],
        quizzes: [
          { id: "ceenv1", question: "Standard test temperature and duration for 5-day Biochemical Oxygen Demand (BOD5) is:", options: ["20 degree C for 5 days", "27 degree C for 5 days", "25 degree C for 3 days", "37 degree C for 5 days"], correctAnswer: "20 degree C for 5 days", explanation: "Standard BOD test is incubated at 20 degrees Celsius for 5 days." }
        ]
      },
      {
        id: "ce_trans",
        name: "Transportation Engineering",
        videoUrl: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgp46KUv4ZY64ZTeQOMVVKU",
        chapters: [
          {
            title: "Unit 1: Highway Geometric Design & Traffic",
            link: "",
            points: ["Stopping sight distance (SSD), Overtaking sight distance (OSD), Horizontal curves, Super-elevation, Flexible and rigid pavement design, Traffic signal design (Webster)."]
          }
        ],
        quizzes: [
          { id: "cetrans1", question: "As per IRC, the maximum super-elevation for plain and rolling terrain roads is restricted to:", options: ["7%", "4%", "10%", "12%"], correctAnswer: "7%", explanation: "IRC limits e_max to 7% for plain and rolling terrain to prevent slow vehicle tilting." }
        ]
      },
      {
        id: "ce_geometric",
        name: "Geometric Engineering",
        videoUrl: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiEKtKSIHYusizkESC42diyc",
        chapters: [
          {
            title: "Unit 1: Surveying, Levelling & Modern Geomatics",
            link: "",
            points: ["Chain and compass surveying, Theodolite traversing, Levelling, Contouring, Errors and adjustments, Total station, Photogrammetry, Remote sensing & GIS."]
          }
        ],
        quizzes: [
          { id: "cegeom1", question: "Combined correction for curvature and refraction (in meters) for distance D (in km) is:", options: ["-0.0673 * D^2", "+0.0673 * D^2", "-0.0785 * D^2", "+0.0112 * D^2"], correctAnswer: "-0.0673 * D^2", explanation: "Combined correction = C_curvature (-0.0785 D^2) + C_refraction (+0.0112 D^2) = -0.0673 * D^2." }
        ]
      }
    ]
  }
};

// API: Get branch data
router.get('/data/:branch', (req, res) => {
  const branchKey = req.params.branch.toUpperCase();
  if (gateData[branchKey]) {
    res.json(gateData[branchKey]);
  } else {
    res.status(404).json({ message: 'Branch data not found.' });
  }
});

// API: Save score
router.post('/score', async (req, res) => {
  const { email, branch, subject, score, total } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.scores.push({ branch, subject, score, total, date: new Date() });
    await user.save();
    res.json({ message: 'Score saved successfully!', scores: user.scores });
  } catch (error) {
    res.status(500).json({ message: 'Server error saving score.' });
  }
});

// API: Get scores
router.get('/scores/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user.scores || []);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching scores.' });
  }
});

// API: AI Doubt Solver Chatbot (Auto-Detects Working Active Model)
router.post('/ai-doubt', async (req, res) => {
  try {
    const { message, imageBase64, mimeType } = req.body;
    const currentApiKey = process.env.GEMINI_API_KEY || API_KEY;

    if (!currentApiKey || currentApiKey.includes("yaha v karni h api paste ")) {
      return res.status(400).json({
        reply: "Please paste your valid Gemini API key in backend/routes/portal.js (Line 6)."
      });
    }

    const promptText = `You are an expert GATE Exam Mentor. Answer clearly, accurately, and step-by-step: ${message || "Please solve and explain this question."}`;

    const parts = [{ text: promptText }];
    if (imageBase64 && mimeType) {
      parts.push({
        inline_data: {
          mime_type: mimeType,
          data: imageBase64
        }
      });
    }

    // Dynamic model lookup to prevent 404 / deprecated errors
    let targetModel = "gemini-3.8-flash";
    try {
      const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${currentApiKey}`);
      const listData = await listRes.json();
      if (listData.models && Array.isArray(listData.models)) {
        const available = listData.models.filter(m =>
          m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")
        );
        const preferred = available.find(m => m.name.includes("flash") || m.name.includes("pro"));
        if (preferred) {
          targetModel = preferred.name.replace("models/", "");
        } else if (available.length > 0) {
          targetModel = available[0].name.replace("models/", "");
        }
      }
    } catch (e) {
      console.warn("Dynamic model lookup fallback:", e.message);
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${currentApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts }] })
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return res.json({ reply: data.candidates[0].content.parts[0].text });
    }

    if (data.error) {
      return res.status(500).json({ reply: data.error.message });
    }

    res.status(500).json({ reply: "Model se response generate nahi ho paya." });
  } catch (error) {
    console.error("AI Doubt Solver Error:", error);
    res.status(500).json({ reply: "Error connecting to AI service: " + error.message });
  }
});

module.exports = router;