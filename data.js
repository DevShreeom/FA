// data.js - the ONLY file you need to touch to add/remove lectures or chapters.
// Add a new chapter: add its name to ORDER, and add an entry to CHAPTER_DATA with fs/pyq arrays.
// Add a new video: push { title, url, uploaded, duration } into the right chapter's fs[] or pyq[] array.

export const ORDER = [
  "Quadratic Equations",
  "Complex Numbers",
  "Sequences & Series",
  "Binomial Theorem",
  "Permutation & Combination",
  "Probability",
  "Matrices & Determinants",
  "Straight Lines",
  "Circles",
  "Parabola",
  "Ellipse",
  "Hyperbola",
  "Vectors & 3D Geometry",
  "Trigonometry (Ratios/Equations/Inequalities)",
  "Inverse Trigonometric Functions (ITF)",
  "Logarithms & Inequalities",
  "Functions",
  "Limits",
  "Continuity & Differentiability",
  "Application of Derivatives (AOD) / Maxima-Minima",
  "Indefinite Integration",
  "Definite Integration",
  "Area Under Curve",
  "Differential Equations",
  "Statistics",
  "Conic Sections (Mixed/Extra)",
  "Bare Minimum / Mixed Revision Compilations"
];

export const CHAPTER_DATA = {
  "Quadratic Equations": {
    "fs": [
      {
        "title": "Quadratic Equations Complete in One Live | All Concepts + Problems | Factorial Final Surge",
        "url": "https://www.youtube.com/watch?v=9jIRVowe71A",
        "uploaded": "2026-02-03T06:58:20",
        "duration": "3:07:39"
      },
      {
        "title": "Problem Solving Session: Quadratic Equation | JEE Mains + Advanced | Factorial Final Surge",
        "url": "https://www.youtube.com/watch?v=_0XvBvYCbcw",
        "uploaded": "2026-02-04T04:50:47",
        "duration": "1:39:30"
      }
    ],
    "pyq": [
      {
        "title": "Newton's Formula in JEE: Concept + Application | 5 PYQs + 3 HW | Quadratic Equations | JEE 2025",
        "url": "https://www.youtube.com/watch?v=kEbf6-WgMLk",
        "uploaded": "2025-01-18T15:15:02",
        "duration": "17:52"
      },
      {
        "title": "JEE Mains 2025: Every Quadratic Equation Question from January Attempt | 10 Questions",
        "url": "https://www.youtube.com/watch?v=Q27wSTI0eBI",
        "uploaded": "2025-03-15T14:00:29",
        "duration": "22:29"
      },
      {
        "title": "Quadratic Equations | Factorial PYQ Masterseries | 30 JEE Mains PYQs | All Formats Covered",
        "url": "https://www.youtube.com/watch?v=yrQMbpSMKYw",
        "uploaded": "2026-03-16T12:01:54",
        "duration": "1:13:06"
      }
    ]
  },
  "Complex Numbers": {
    "fs": [
      {
        "title": "A Unique Way to Understand Rotation of Coordinate Axes using Complex Numbers | Factorial Academy",
        "url": "https://www.youtube.com/watch?v=FDhCaMLQjeA",
        "uploaded": "2025-11-09T14:30:10",
        "duration": "8:06"
      }
    ],
    "pyq": [
      {
        "title": "JEE Mains 2025: Geometry of Complex Numbers | All PYQs Discussed | Don't Fear These Questions!",
        "url": "https://www.youtube.com/watch?v=7d0k08LYEEQ",
        "uploaded": "2025-03-12T12:30:15",
        "duration": "15:49"
      },
      {
        "title": "Complex Numbers Part 1 | 25 JEE Mains PYQs 🔥 | Factorial PYQ Masterseries",
        "url": "https://www.youtube.com/watch?v=ZD84xUEJjNw",
        "uploaded": "2026-03-25T11:45:03",
        "duration": "28:29"
      },
      {
        "title": "Complex Numbers Part 2 | Geometry + Locus 🔥 | JEE Mains PYQs | Factorial PYQ Masterseries",
        "url": "https://www.youtube.com/watch?v=DHOfR18ISmE",
        "uploaded": "2026-03-27T09:41:45",
        "duration": "56:11"
      }
    ]
  },
  "Sequences & Series": {
    "fs": [
      {
        "title": "Sequences & Series Complete LIVE | All Concepts + problems  | JEE Mains & Advanced",
        "url": "https://www.youtube.com/watch?v=JnAfRUuk0n8",
        "uploaded": "2026-02-05T06:00:20",
        "duration": "2:21:29"
      },
      {
        "title": "Sequences & Series Part 2 | AGP, Telescoping, Summation & Difference Methods | JEE Mains + Advanced",
        "url": "https://www.youtube.com/watch?v=PtF5_eNZ-ZI",
        "uploaded": "2026-02-05T11:45:02",
        "duration": "53:24"
      },
      {
        "title": "The Most Beautiful Telescoping Series You'll See Today | Factorial's Question of the Day",
        "url": "https://www.youtube.com/watch?v=F7AB6ugwzMI",
        "uploaded": "2026-02-05T16:45:01",
        "duration": "11:06"
      },
      {
        "title": "Inequalities in Sequences & Series | AM GM HM RMS + Cauchy Schwarz + Titu's Lemma",
        "url": "https://www.youtube.com/watch?v=FiQtv7-KRKk",
        "uploaded": "2026-02-06T09:00:34",
        "duration": "39:23"
      },
      {
        "title": "ITF Summation Using Telescopic Series | Concept + Problems | Factorial Final Surge",
        "url": "https://www.youtube.com/watch?v=-0eWYjBya0I",
        "uploaded": "2026-02-23T09:40:56",
        "duration": "13:08"
      }
    ],
    "pyq": [
      {
        "title": "Sequence & Series PYQ Masterclass | 40 JEE Mains Questions | Part 1",
        "url": "https://www.youtube.com/watch?v=HAHJpS1-QnE",
        "uploaded": "2026-03-14T01:30:28",
        "duration": "43:12"
      },
      {
        "title": "Sequence & Series PYQ Masterclass | Part 2 |  JEE Mains 2026 | All Formats Covered | 40 PYQs",
        "url": "https://www.youtube.com/watch?v=zYtVrYruC1g",
        "uploaded": "2026-03-14T10:44:55",
        "duration": "1:15:07"
      }
    ]
  },
  "Binomial Theorem": {
    "fs": [
      {
        "title": "Divisors & Combinations Complete Guide | Number of Divisors, Proper Divisors & Counting Tricks | JEE",
        "url": "https://www.youtube.com/watch?v=zEPr20SnH2k",
        "uploaded": "2026-02-08T08:01:00",
        "duration": "19:43"
      },
      {
        "title": "Binomial Expansion from Zero to Advanced | Complete Session | JEE Mains & Advanced",
        "url": "https://www.youtube.com/watch?v=EcWiUvlF4uk",
        "uploaded": "2026-02-10T06:57:52",
        "duration": "2:43:55"
      },
      {
        "title": "Conjugate Tricks in Binomial Expansion | Integer Part & Surd Problems | JEE Mains & JEE Advanced",
        "url": "https://www.youtube.com/watch?v=dinDrX7Oc3M",
        "uploaded": "2026-02-10T10:00:54",
        "duration": "14:50"
      },
      {
        "title": "Binomial Expansion for Non-Natural Index 🔥 | 3 ADV. Qs |  Powerful Applications for JEE Advanced",
        "url": "https://www.youtube.com/watch?v=cS3z6pw3TD4",
        "uploaded": "2026-02-15T16:03:33",
        "duration": "23:42"
      }
    ],
    "pyq": [
      {
        "title": "The Ultimate Binomial Series Sums Masterclass 🔥 | All JEE Mains PYQs (2019–2025)",
        "url": "https://www.youtube.com/watch?v=iV211XSE5rk",
        "uploaded": "2025-12-08T02:30:41",
        "duration": "55:12"
      },
      {
        "title": "Tiny Topic, Massive Impact | Remainder Problems for JEE Mains | Binomial Theorem",
        "url": "https://www.youtube.com/watch?v=9PhAPsikgPQ",
        "uploaded": "2026-01-17T15:20:03",
        "duration": "16:34"
      },
      {
        "title": "Factorial's Bare Minimum Part 3: Vector, 3D, Matrices,Det, Binomial | for 40+ in JEE Maths",
        "url": "https://www.youtube.com/watch?v=rjK29XRRnJA",
        "uploaded": "2026-04-01T11:44:10",
        "duration": "18:27"
      }
    ]
  },
  "Permutation & Combination": {
    "fs": [
      {
        "title": "Permutation & Combination Live |  Zero to Advanced | Complete Course | JEE Mains & Advanced",
        "url": "https://www.youtube.com/watch?v=yHrQaXqNOpw",
        "uploaded": "2026-02-07T06:53:24",
        "duration": "2:53:55"
      },
      {
        "title": "Beggars Method | Complete Guide with Advanced Problems | Distribution of Alike Objects | JEE",
        "url": "https://www.youtube.com/watch?v=8VWHfk02k9I",
        "uploaded": "2026-02-07T09:00:21",
        "duration": "39:14"
      },
      {
        "title": "Derangement Complete Theory + Proof + Problems | PnC Factorial Final Surge | JEE Mains & Advanced",
        "url": "https://www.youtube.com/watch?v=FqIi5TwSxJg",
        "uploaded": "2026-02-11T10:30:11",
        "duration": "25:09"
      }
    ],
    "pyq": [
      {
        "title": "JEE Mains PYQs: P&C | 3 Key P&C Questions solved + 2 H.W. | permutations & Combinations | JEE 2025",
        "url": "https://www.youtube.com/watch?v=WeVVGAklgZQ",
        "uploaded": "2025-01-13T15:00:46",
        "duration": "12:29"
      },
      {
        "title": "All P&C Questions from JEE Mains 2025 (Jan Attempt) | Permutation & Combination",
        "url": "https://www.youtube.com/watch?v=-IzmYMsIs1k",
        "uploaded": "2025-03-16T14:00:00",
        "duration": "21:38"
      },
      {
        "title": "Permutation & Combination Complete 🔥 | 25 JEE Mains PYQs Covered |  | Factorial PYQ Masterseries",
        "url": "https://www.youtube.com/watch?v=q_u1djH7O9w",
        "uploaded": "2026-03-22T14:15:07",
        "duration": "57:52"
      },
      {
        "title": "JEE's Deadly Combo: PnC × Matrices 🔥  | 5 JEE Mains  +  1 Adv 2024 PYQs Factorial PYQ Masterseries",
        "url": "https://www.youtube.com/watch?v=_4VdTwew23Y",
        "uploaded": "2026-03-28T14:33:02",
        "duration": "31:38"
      }
    ]
  },
  "Probability": {
    "fs": [
      {
        "title": "The Probability Question Everyone Solves Wrong | JEE Advanced Level",
        "url": "https://www.youtube.com/watch?v=NDVOMhAQxS8",
        "uploaded": "2026-03-07T12:10:00",
        "duration": "11:52"
      },
      {
        "title": "Probability Complete Session for JEE Mains & Advanced | Factorial Final Surge | Live",
        "url": "https://www.youtube.com/watch?v=bMIoNys_oVY",
        "uploaded": "2026-03-07T20:45:30",
        "duration": "2:41:09"
      }
    ],
    "pyq": [
      {
        "title": "Probably the Most Productive 30 mins for a JEE Aspirant | Probability Distribution Masterclass",
        "url": "https://www.youtube.com/watch?v=igyK6Soza2k",
        "uploaded": "2026-01-12T12:01:33",
        "duration": "32:53"
      },
      {
        "title": "Conditional Probability & Bayes Theorem | JEE Mains 2025 PYQs | Factorial PYQ Masterseries",
        "url": "https://www.youtube.com/watch?v=nhKKeS5j7_M",
        "uploaded": "2026-01-15T12:09:10",
        "duration": "16:29"
      },
      {
        "title": "Probability Complete | 25 JEE Mains Questions | All Types Covered | Factorial PYQ Masterseries",
        "url": "https://www.youtube.com/watch?v=2aaCFPNkRcE",
        "uploaded": "2026-03-23T16:48:54",
        "duration": "1:07:49"
      },
      {
        "title": "Factorial's Top 75! 🔥 | Part 3 (Final) | Vector 3D +  Matrices + Complex + Probability + Statistics",
        "url": "https://www.youtube.com/watch?v=wePsEIrhH0o",
        "uploaded": "2026-03-31T10:56:21",
        "duration": "53:08"
      }
    ]
  },
  "Matrices & Determinants": {
    "fs": [],
    "pyq": [
      {
        "title": "Cramer's Rule vs Factorial Way | 7 JEE Main PYQs | System of Linear Equations",
        "url": "https://www.youtube.com/watch?v=-s_UfKZS-oU",
        "uploaded": "2026-01-14T12:30:01",
        "duration": "30:37"
      },
      {
        "title": "Matrices Factorial PYQ Masterseries (Part 1) | Adjoint  of Matrix | 7 JEE Mains PYQs 🔥",
        "url": "https://www.youtube.com/watch?v=-9-dAlMqryM",
        "uploaded": "2026-03-20T08:45:01",
        "duration": "10:50"
      },
      {
        "title": "Matrices PYQs (Part 2) | 12 JEE Mains Questions 🔥 | Factorial PYQ Masterseries",
        "url": "https://www.youtube.com/watch?v=vR7-sOOVIrk",
        "uploaded": "2026-03-21T18:14:06",
        "duration": "36:54"
      }
    ]
  },
  "Straight Lines": {
    "fs": [
      {
        "title": "Straight Lines LIVE | From Basics to Advanced Problems | JEE Maths",
        "url": "https://www.youtube.com/watch?v=fzUAMUDTzTw",
        "uploaded": "2026-02-11T06:41:31",
        "duration": "2:40:05"
      },
      {
        "title": "Straight Lines (Part 2) LIVE | Foot, Image, Pair of Lines, Homogenization | JEE Mains & Advanced",
        "url": "https://www.youtube.com/watch?v=ktZpOmcPxq4",
        "uploaded": "2026-02-12T06:41:02",
        "duration": "2:47:46"
      }
    ],
    "pyq": [
      {
        "title": "3D Geometry in JEE: 3 concepts + 3 Key PYQs | 2 HW | Straight Lines | Shortest Distance | JEE 2025",
        "url": "https://www.youtube.com/watch?v=Ght9cwcCDu0",
        "uploaded": "2025-01-22T02:30:10",
        "duration": "13:35"
      },
      {
        "title": "Euler Line Masterclass | Orthocenter–Centroid–Circumcenter | 7 JEE Mains PYQs",
        "url": "https://www.youtube.com/watch?v=L1SYY8I6H5M",
        "uploaded": "2025-12-29T14:45:05",
        "duration": "27:11"
      },
      {
        "title": "Straight Lines MASTERCLASS 🔥 | 5 Good JEE Mains PYQs | Factorial PYQ Masterseries",
        "url": "https://www.youtube.com/watch?v=dSez-Plgv7I",
        "uploaded": "2025-12-31T02:30:42",
        "duration": "20:05"
      }
    ]
  },
  "Circles": {
    "fs": [
      {
        "title": "Circles Complete Chapter LIVE | From Basics to Advanced | JEE Mains & Advanced",
        "url": "https://www.youtube.com/watch?v=aDviah4yyK8",
        "uploaded": "2026-02-13T07:38:03",
        "duration": "2:56:40"
      },
      {
        "title": "Chord of Contact + Tangents + Midpoint Tricks | Circles JEE Advanced | Factorial Final Surge",
        "url": "https://www.youtube.com/watch?v=AEIGCnafdNs",
        "uploaded": "2026-02-13T11:46:18",
        "duration": "19:23"
      },
      {
        "title": "Complete Family of Circles Theory + Advanced Problem | JEE Mains & Advanced",
        "url": "https://www.youtube.com/watch?v=ExsjbXmGfLI",
        "uploaded": "2026-02-14T10:30:18",
        "duration": "23:13"
      }
    ],
    "pyq": [
      {
        "title": "Circles Masterclass (Part 1) | JEE Mains PYQs | Factorial PYQ Masterseries",
        "url": "https://www.youtube.com/watch?v=ovI4W3-ZfkU",
        "uploaded": "2026-01-03T15:30:39",
        "duration": "20:29"
      },
      {
        "title": "Circles Masterclass (Part 2) | JEE Mains PYQs | Factorial PYQ Masterseries",
        "url": "https://www.youtube.com/watch?v=QjJCqqE1BgI",
        "uploaded": "2026-01-04T02:30:35",
        "duration": "17:58"
      }
    ]
  },
  "Parabola": {
    "fs": [
      {
        "title": "Parabola Complete Chapter LIVE | From Basics to Advanced | JEE Mains & Advanced",
        "url": "https://www.youtube.com/watch?v=w3We4M5o27s",
        "uploaded": "2026-02-15T05:57:28",
        "duration": "2:24:50"
      }
    ],
    "pyq": [
      {
        "title": "The Ultimate Parabola MASTERCLASS 🔥 | All Types of JEE Mains PYQs",
        "url": "https://www.youtube.com/watch?v=e_ciTvN7sUQ",
        "uploaded": "2026-01-07T15:01:27",
        "duration": "43:38"
      }
    ]
  },
  "Ellipse": {
    "fs": [
      {
        "title": "Ellipse Basic to Advanced (Part 1)| Definition to Terminology | Factorial Final Surge",
        "url": "https://www.youtube.com/watch?v=PwGjzjI1hBU",
        "uploaded": "2026-02-19T13:00:46",
        "duration": "30:44"
      }
    ],
    "pyq": [
      {
        "title": "Ultimate Ellipse MASTERCLASS 🔥 | All types of JEE Mains PYQs | Complete Coverage",
        "url": "https://www.youtube.com/watch?v=D5mHtH1vXJw",
        "uploaded": "2026-01-08T15:00:20",
        "duration": "32:25"
      }
    ]
  },
  "Hyperbola": {
    "fs": [],
    "pyq": [
      {
        "title": "Every Hyperbola Format JEE Mains Asks | Factorial's PYQ Masterclass",
        "url": "https://www.youtube.com/watch?v=JPKkSogR35A",
        "uploaded": "2026-01-09T11:45:03",
        "duration": "28:17"
      }
    ]
  },
  "Vectors & 3D Geometry": {
    "fs": [
      {
        "title": "Vectors & 3D for JEE Mains + Advanced | Factorial Final Surge LIVE",
        "url": "https://www.youtube.com/watch?v=LJ7Khk69Hn8",
        "uploaded": "2026-03-09T14:55:21",
        "duration": "13:05"
      },
      {
        "title": "Complete 3D Geometry for JEE Mains & Advanced (Part 1) | All Concepts + Problems",
        "url": "https://www.youtube.com/watch?v=jzAVo4lQDHk",
        "uploaded": "2026-03-12T10:30:24",
        "duration": "1:30:50"
      }
    ],
    "pyq": [
      {
        "title": "3D Geometry Masterclass | Shortest Distance | 8  JEE Mains PYQs",
        "url": "https://www.youtube.com/watch?v=iXJoexsf_hU",
        "uploaded": "2026-01-11T12:01:01",
        "duration": "35:19"
      },
      {
        "title": "Vectors | Factorial PYQ Masterseries | 21 JEE Mains PYQs | All Formats Covered",
        "url": "https://www.youtube.com/watch?v=qFPSf6ffDJE",
        "uploaded": "2026-03-17T13:36:12",
        "duration": "1:11:46"
      },
      {
        "title": "Complete 3D Geometry | Factorial PYQ Masterseries | 25 PYQs (Part 1) | JEE Mains 2026",
        "url": "https://www.youtube.com/watch?v=mI5Du5rMwlA",
        "uploaded": "2026-03-18T12:06:16",
        "duration": "24:47"
      },
      {
        "title": "3D Geometry Complete 🔥 | Factorial PYQ Masterseries | 25 PYQs (Part 2) | JEE Mains 2026",
        "url": "https://www.youtube.com/watch?v=dWQh6LlaLCs",
        "uploaded": "2026-03-19T12:01:18",
        "duration": "42:57"
      }
    ]
  },
  "Trigonometry (Ratios/Equations/Inequalities)": {
    "fs": [
      {
        "title": "Trigonometry Complete | Full Theory to JEE Advanced Level | Factorial Final Surge",
        "url": "https://www.youtube.com/watch?v=9yWNHPB_AD0",
        "uploaded": "2026-01-30T16:16:12",
        "duration": "1:09:34"
      },
      {
        "title": "Trigonometric Equations Complete for JEE 2026",
        "url": "https://www.youtube.com/watch?v=52DFYYu4mJA",
        "uploaded": "2026-01-31T15:04:51",
        "duration": "50:48"
      },
      {
        "title": "Parameter Tricks in Trigonometry | When Does an Equation Have a Solution? | JEE Advanced",
        "url": "https://www.youtube.com/watch?v=JX2bmgy8vXw",
        "uploaded": "2026-02-01T02:30:14",
        "duration": "20:19"
      },
      {
        "title": "Conditional Identities & Max–Min in Trigonometry | Complete Concepts + Problems | JEE 2026",
        "url": "https://www.youtube.com/watch?v=L8GGajGON6Q",
        "uploaded": "2026-02-01T14:00:36",
        "duration": "33:00"
      },
      {
        "title": "Trigonometric Inequalities Complete | Quadrant & Graph Methods | JEE Mains + Advanced 2026",
        "url": "https://www.youtube.com/watch?v=2_mWpBCKqNE",
        "uploaded": "2026-02-02T05:30:03",
        "duration": "21:32"
      }
    ],
    "pyq": [
      {
        "title": "Factorial PYQ Masterseries: Trigonometry Equations  (15 JEE Mains PYQs) | JEE 2026",
        "url": "https://www.youtube.com/watch?v=vtTZOqCqpik",
        "uploaded": "2026-03-15T01:30:53",
        "duration": "50:00"
      }
    ]
  },
  "Inverse Trigonometric Functions (ITF)": {
    "fs": [
      {
        "title": "Inverse Trigonometric Functions Inequalities | All Concepts + Question Types | JEE 2026 | JEE 2027",
        "url": "https://www.youtube.com/watch?v=4oWUiYyI7n4",
        "uploaded": "2026-01-28T15:40:00",
        "duration": "43:19"
      },
      {
        "title": "Inverse Trigonometric Functions Complete Guide LIVE | All Concepts + Problems | JEE Mains & Advanced",
        "url": "https://www.youtube.com/watch?v=DFhwFAfudGo",
        "uploaded": "2026-02-23T09:40:18",
        "duration": "2:16:44"
      }
    ],
    "pyq": [
      {
        "title": "Every PYQ on Inverse Trigo Series Solved | All JEE Mains PYQs 2019–2025 | Factorial PYQ Masterseries",
        "url": "https://www.youtube.com/watch?v=QHbnteEVQiI",
        "uploaded": "2025-12-04T15:45:03",
        "duration": "31:50"
      },
      {
        "title": "Inverse Trigo: All Types, All PYQs (2019–2025) | Factorial PYQ Masterseries",
        "url": "https://www.youtube.com/watch?v=4IXVF5I6uxg",
        "uploaded": "2025-12-06T02:30:03",
        "duration": "44:48"
      }
    ]
  },
  "Logarithms & Inequalities": {
    "fs": [
      {
        "title": "Irrational Inequalities COMPLETE | All Concepts + All Question Formats | JEE 2026/27",
        "url": "https://www.youtube.com/watch?v=pPZpC2ZZMFc",
        "uploaded": "2026-01-29T08:30:34",
        "duration": "23:12"
      },
      {
        "title": "Factorial Final Surge | Logarithms COMPLETE Chapter | Concepts & Problems | JEE 2026",
        "url": "https://www.youtube.com/watch?v=EVbadhvWb90",
        "uploaded": "2026-01-29T14:45:03",
        "duration": "47:27"
      },
      {
        "title": "Factorial Final Surge | Logarithms Problem Solving Session",
        "url": "https://www.youtube.com/watch?v=3w_5A5-dd2c",
        "uploaded": "2026-01-30T02:30:06",
        "duration": "1:00:50"
      }
    ],
    "pyq": []
  },
  "Functions": {
    "fs": [
      {
        "title": "Application of Veritical Line in Finding Range of Rational Function",
        "url": "https://www.youtube.com/watch?v=uSuXwP0gDzs",
        "uploaded": "2026-02-04T06:44:36",
        "duration": "10:01"
      },
      {
        "title": "Functions Full Chapter LIVE | Theory + PYQs + Tricks | JEE Mains & Advanced",
        "url": "https://www.youtube.com/watch?v=VHfpx3fPgDY",
        "uploaded": "2026-02-21T05:25:23",
        "duration": "1:36:25"
      },
      {
        "title": "Functions (Part 2) LIVE | JEE Mains & Advanced | Factorial Final Surge",
        "url": "https://www.youtube.com/watch?v=6Tyv5UIu5VM",
        "uploaded": "2026-02-22T05:36:29",
        "duration": "2:16:54"
      },
      {
        "title": "Graph Transformations Complete Guide | All Types, Patterns & Concepts | JEE Mains & Advanced",
        "url": "https://www.youtube.com/watch?v=p3DDHQpCQPU",
        "uploaded": "2026-02-22T09:55:05",
        "duration": "56:43"
      },
      {
        "title": "Continuity of a Function Complete Guide LIVE | All Concepts + All Problem Types | Mains & Advanced",
        "url": "https://www.youtube.com/watch?v=HDLTvVYYn3M",
        "uploaded": "2026-02-27T05:15:53",
        "duration": "1:48:10"
      },
      {
        "title": "Determination of Function from Functional Equation | Differentiability | JEE Mains & Advanced | 6 Qs",
        "url": "https://www.youtube.com/watch?v=vSPbOEutw80",
        "uploaded": "2026-03-01T15:28:05",
        "duration": "25:24"
      }
    ],
    "pyq": [
      {
        "title": "Greatest Integer Function | G.I.F. | Function | JEE MAINS 2023 PYQs | Revision | JEE 2025",
        "url": "https://www.youtube.com/watch?v=iiO2LT9DmMI",
        "uploaded": "2024-11-15T01:30:32",
        "duration": "20:09"
      },
      {
        "title": "The Ultimate Functional Equations Video for JEE Mains 2026 | ALL PYQs (2019–2025) 🔥",
        "url": "https://www.youtube.com/watch?v=c6rvdboh3F0",
        "uploaded": "2025-12-02T16:01:07",
        "duration": "50:12"
      },
      {
        "title": "JEE's Favourite Trap: Differentiability of Product Functions EXPLAINED! 🔥 | 3 PYQs",
        "url": "https://www.youtube.com/watch?v=fGfqqnsb0uE",
        "uploaded": "2025-12-14T02:30:41",
        "duration": "25:44"
      },
      {
        "title": "The Ultimate Differentiability Booster | Max–Min Functions | JEE Mains Top PYQs",
        "url": "https://www.youtube.com/watch?v=YW1lpaY8qOs",
        "uploaded": "2025-12-15T13:30:38",
        "duration": "22:08"
      },
      {
        "title": "Relations For JEE Mains 2026 | Everything Covered Through PYQs | Factorial PYQ Masterclass",
        "url": "https://www.youtube.com/watch?v=QViSKHObCNg",
        "uploaded": "2026-01-18T15:00:43",
        "duration": "48:24"
      },
      {
        "title": "One One, Many One, Onto, Into | Function | Injective | 5 jee mains pyqs",
        "url": "https://www.youtube.com/watch?v=7d46oolCPBM",
        "uploaded": "2026-01-19T08:52:48",
        "duration": "8:49"
      },
      {
        "title": "Domain & Range PYQs | 12 Questions from JEE Mains 2025 | Factorial PYQ Masterseries",
        "url": "https://www.youtube.com/watch?v=2OYWt87hWi8",
        "uploaded": "2026-01-19T14:00:04",
        "duration": "39:05"
      },
      {
        "title": "Factorial's Bare Minimum Part 2 | for 40+ in JEE Maths | Relation, Function, LCD, AOD",
        "url": "https://www.youtube.com/watch?v=bPiJSWtVW80",
        "uploaded": "2026-04-01T07:52:07",
        "duration": "17:25"
      }
    ]
  },
  "Limits": {
    "fs": [
      {
        "title": "Limits Full Chapter LIVE | All Concepts + All Problem Types | JEE Mains & Advanced",
        "url": "https://www.youtube.com/watch?v=49ltMI7gLyc",
        "uploaded": "2026-02-24T05:28:13",
        "duration": "1:44:31"
      },
      {
        "title": "Limits (Part 2) LIVE | All Concepts + All Problem Types | JEE Mains & Advanced",
        "url": "https://www.youtube.com/watch?v=eX_UNIUYG8E",
        "uploaded": "2026-02-25T04:42:19",
        "duration": "1:18:49"
      }
    ],
    "pyq": [
      {
        "title": "All Questions LIMITS | JEE MAINS 2024 (April Attempt) | L- Hospital | Lebnitz | ​@factorialacademy",
        "url": "https://www.youtube.com/watch?v=dO4bpPiAl5Q",
        "uploaded": "2024-08-27T01:30:28",
        "duration": "49:11"
      },
      {
        "title": "Limits (All Questions) | L-H Rule | Expansion | JEE MAINS 2023 PYQs | Revision | JEE 2025",
        "url": "https://www.youtube.com/watch?v=3YnTGCuCjkk",
        "uploaded": "2024-11-18T01:30:02",
        "duration": "40:34"
      },
      {
        "title": "Definite Integration as Limit of Sum 🔥 | Complete MASTERCLASS | JEE Mains PYQs",
        "url": "https://www.youtube.com/watch?v=b1sABtQOk4Y",
        "uploaded": "2025-12-21T15:05:01",
        "duration": "22:12"
      },
      {
        "title": "Limits Masterclass | 15 JEE Mains PYQs 🔥 | Factorial PYQ Masterseries (Limits)",
        "url": "https://www.youtube.com/watch?v=MY6U8ew_6VE",
        "uploaded": "2026-03-24T11:15:03",
        "duration": "44:49"
      }
    ]
  },
  "Continuity & Differentiability": {
    "fs": [
      {
        "title": "Differentiability | Every Concept + Every Question Type | JEE Mains & ADV.| Factorial Final Surge",
        "url": "https://www.youtube.com/watch?v=ajMoUozL4nY",
        "uploaded": "2026-03-01T06:11:22",
        "duration": "1:55:20"
      }
    ],
    "pyq": [
      {
        "title": "The Ultimate Continuity Masterclass 🔥| No. of Points of Discontinuity | All JEE Mains PYQs 2019–2025",
        "url": "https://www.youtube.com/watch?v=SMTPMX8ZEfw",
        "uploaded": "2025-12-13T02:30:23",
        "duration": "37:57"
      }
    ]
  },
  "Application of Derivatives (AOD) / Maxima-Minima": {
    "fs": [
      {
        "title": "Complete Monotonicity | 15 Problems | JEE 2026 | Factorial Final Surge",
        "url": "https://www.youtube.com/watch?v=Og9vxZZfPKQ",
        "uploaded": "2026-03-06T02:30:29",
        "duration": "55:02"
      },
      {
        "title": "Maxima Minima Full Chapter | JEE Mains + Advanced | All Concepts + Advanced Problems",
        "url": "https://www.youtube.com/watch?v=eZGTxZ7QlgU",
        "uploaded": "2026-03-08T11:32:02",
        "duration": "1:11:29"
      }
    ],
    "pyq": [
      {
        "title": "The Ultimate Optimization Masterclass 🔥| All JEE Mains Maxima–Minima (Optimization) PYQs (2019–2025)",
        "url": "https://www.youtube.com/watch?v=ypgqy2UXLRE",
        "uploaded": "2025-12-09T15:45:07",
        "duration": "38:06"
      },
      {
        "title": "JEE Keeps Repeating THIS Concept - Learn It Once, Forever. ⚡| 4 PYQs + H.W. | A.O.D.",
        "url": "https://www.youtube.com/watch?v=xmel4UVUW_w",
        "uploaded": "2025-12-10T07:15:11",
        "duration": "15:30"
      },
      {
        "title": "Equation-Solving in AOD: 6 PYQs | Number of Solutions? JEE's Favourite AOD Pattern!",
        "url": "https://www.youtube.com/watch?v=W0iDntG6HI4",
        "uploaded": "2025-12-10T15:35:00",
        "duration": "17:43"
      },
      {
        "title": "The Ultimate AOD Pattern Class 🔥 | Monotonicity, Symmetry, α-Finding",
        "url": "https://www.youtube.com/watch?v=bVYiMIuQfEU",
        "uploaded": "2025-12-11T08:01:01",
        "duration": "22:02"
      }
    ]
  },
  "Indefinite Integration": {
    "fs": [
      {
        "title": "Indefinite Integration Full Chapter | All Concepts + All Question Formats | JEE Mains & Advanced",
        "url": "https://www.youtube.com/watch?v=T4aBgN89lIE",
        "uploaded": "2026-03-03T06:42:59",
        "duration": "2:19:03"
      },
      {
        "title": "Trigonometric Indefinite Integration 🔥 | 6 Must-Know Formats | Factorial Final Surge",
        "url": "https://www.youtube.com/watch?v=3rvDRiRUjF0",
        "uploaded": "2026-03-03T10:07:23",
        "duration": "29:26"
      },
      {
        "title": "Reduction Formula Complete Revision | Definite + Indefinite Integration | JEE Mains & Advanced 2026",
        "url": "https://www.youtube.com/watch?v=GhHBlZ_e-zY",
        "uploaded": "2026-03-04T03:30:20",
        "duration": "38:17"
      },
      {
        "title": "All Algebraic Integration Formats Covered | Indefinite Integration | JEE 2026",
        "url": "https://www.youtube.com/watch?v=2AT8Vh480uI",
        "uploaded": "2026-03-05T08:21:26",
        "duration": "43:11"
      }
    ],
    "pyq": [
      {
        "title": "The Ultimate Integration by Parts Masterclass 🔥 | All JEE Mains PYQs",
        "url": "https://www.youtube.com/watch?v=-Bpfd_8LkVs",
        "uploaded": "2025-12-18T02:30:01",
        "duration": "35:57"
      },
      {
        "title": "Indefinite Integration PYQs MASTERCLASS 🔥 | Substitution & Manipulation | JEE Mains (2019–2025)|",
        "url": "https://www.youtube.com/watch?v=QaholOy0Ksc",
        "uploaded": "2025-12-19T08:30:28",
        "duration": "25:56"
      }
    ]
  },
  "Definite Integration": {
    "fs": [
      {
        "title": "Definite Integration Full Chapter LIVE 🔥| All Concepts + All Question Formats | JEE Mains & Advanced",
        "url": "https://www.youtube.com/watch?v=Cef1eN5_PNE",
        "uploaded": "2026-03-04T05:02:59",
        "duration": "2:18:00"
      },
      {
        "title": "Feynman's Secret Integral Trick | JEE Advanced | Richard Feynman",
        "url": "https://www.youtube.com/watch?v=2t9RVD_Lx5A",
        "uploaded": "2026-03-04T15:57:14",
        "duration": "25:32"
      },
      {
        "title": "Complete Estimation in Definite Integration 🔥 | Concepts + Problems  + JEE Advanced PYQs",
        "url": "https://www.youtube.com/watch?v=ZtmAbMTzjqE",
        "uploaded": "2026-03-05T12:39:59",
        "duration": "46:03"
      }
    ],
    "pyq": [
      {
        "title": "Newton-Leibniz: The Complete Guide with PYQs & HW | Definite Integration | JEE PYQs | JEE 2025",
        "url": "https://www.youtube.com/watch?v=7lD6KgXvXj0",
        "uploaded": "2025-01-12T01:30:04",
        "duration": "9:52"
      },
      {
        "title": "Newton–Leibniz Theorem MASTERCLASS 🔥 | All JEE Mains PYQs (2019–2025) | Definite Integration",
        "url": "https://www.youtube.com/watch?v=jHX4UOV1yBY",
        "uploaded": "2025-12-21T02:30:43",
        "duration": "48:14"
      },
      {
        "title": "Reduction Formula MASTERCLASS 🚀 | Definite Integration | JEE Mains",
        "url": "https://www.youtube.com/watch?v=XQh5mlN7lF0",
        "uploaded": "2025-12-22T02:30:30",
        "duration": "19:55"
      },
      {
        "title": "The Ultimate Definite Integration Masterclass 💯 | All Properties +JEE Mains  PYQs",
        "url": "https://www.youtube.com/watch?v=Ht-dNKimhk8",
        "uploaded": "2025-12-24T05:30:11",
        "duration": "45:51"
      }
    ]
  },
  "Area Under Curve": {
    "fs": [],
    "pyq": [
      {
        "title": "Area Under Curve Complete Coverage | 13 JEE Mains PYQs | Must Watch | AUC",
        "url": "https://www.youtube.com/watch?v=Zlq69gur5_Q",
        "uploaded": "2026-01-18T06:45:03",
        "duration": "52:15"
      }
    ]
  },
  "Differential Equations": {
    "fs": [
      {
        "title": "Differential Equations Full Chapter | JEE Mains & Advanced | Factorial Final Surge",
        "url": "https://www.youtube.com/watch?v=GRhNnlFtRaQ",
        "uploaded": "2026-03-07T05:25:12",
        "duration": "2:36:20"
      }
    ],
    "pyq": [
      {
        "title": "Ultimate Linear Differential Equations Masterclass 🔥 | All JEE Mains PYQs | Reducible LDE",
        "url": "https://www.youtube.com/watch?v=9k3UU2-px50",
        "uploaded": "2025-12-26T13:30:10",
        "duration": "33:34"
      },
      {
        "title": "Differential Equations Masterclass (Part-2) 🔥 | All JEE Mains PYQs | Factorial PYQ Masterseries",
        "url": "https://www.youtube.com/watch?v=o9_oXYtjZso",
        "uploaded": "2025-12-28T02:30:59",
        "duration": "29:08"
      }
    ]
  },
  "Statistics": {
    "fs": [],
    "pyq": [
      {
        "title": "Statistics for JEE Mains 2026 | Mean, Median, Variance, SD, Mean Deviation | All PYQ Formats Covered",
        "url": "https://www.youtube.com/watch?v=KPtHWLiOmU8",
        "uploaded": "2026-01-16T13:15:03",
        "duration": "51:35"
      }
    ]
  },
  "Conic Sections (Mixed/Extra)": {
    "fs": [],
    "pyq": [
      {
        "title": "JEE Mains 2024: 4 Key JEE Mains PYQs + 2 H.W. | Conic Section | JEE PYQs | JEE 2025",
        "url": "https://www.youtube.com/watch?v=wHrJ2RUcn1Q",
        "uploaded": "2025-01-16T16:01:01",
        "duration": "14:22"
      }
    ]
  },
  "Bare Minimum / Mixed Revision Compilations": {
    "fs": [],
    "pyq": [
      {
        "title": "Factorial's Top 25 Calculus Questions | Most Repeated PYQs for JEE Mains",
        "url": "https://www.youtube.com/watch?v=QDoYKyITQ7Q",
        "uploaded": "2026-01-20T04:30:18",
        "duration": "1:08:51"
      },
      {
        "title": "How We Will Cover Complete JEE Maths for April Attempt | PYQ Masterseries | Phase 2",
        "url": "https://www.youtube.com/watch?v=UI37pN4NYWk",
        "uploaded": "2026-03-12T14:53:59",
        "duration": "5:48"
      },
      {
        "title": "Weak in Maths? These 10 Independent Topics Can Save Your JEE Mains 2026  Maths",
        "url": "https://www.youtube.com/watch?v=e0lNrJZRTB0",
        "uploaded": "2026-03-24T15:24:12",
        "duration": "12:43"
      },
      {
        "title": "10 Independent Maths Topics in ONE video 💯 | JEE Mains 2026 10 Sure Shot Topics",
        "url": "https://www.youtube.com/watch?v=LZmWP2eZj4k",
        "uploaded": "2026-03-26T10:00:35",
        "duration": "4:02:15"
      },
      {
        "title": "Factorial's Top 75 | 75 PYQs from JEE Mains 2026 (Jan Attempt) | Part 1",
        "url": "https://www.youtube.com/watch?v=qyF32xx6AgQ",
        "uploaded": "2026-03-28T04:00:41",
        "duration": "1:33:52"
      },
      {
        "title": "Factorial's Top 75 🔥 | Part 2 | Complete Calculus | 75 PYQs from JEE Mains 2026 (Jan Attempt)",
        "url": "https://www.youtube.com/watch?v=_KWrF7DT-ak",
        "uploaded": "2026-03-29T11:35:56",
        "duration": "1:33:12"
      },
      {
        "title": "Factorial's The Bare Minimum | Most Repeated Concepts from Each chapter for 40+ in JEE Maths | P1",
        "url": "https://www.youtube.com/watch?v=f7tIAAV4xW8",
        "uploaded": "2026-03-30T14:50:00",
        "duration": "35:52"
      },
      {
        "title": "The Bitter Truth You NEED to Hear | April Attempt JEE 2026",
        "url": "https://www.youtube.com/watch?v=-JNA-kZo_WU",
        "uploaded": "2026-03-31T16:31:27",
        "duration": "8:23"
      }
    ]
  }
};

export const SESSIONS = ["2020 Jan", "2020 Apr", "2021 Jan", "2021 Apr", "2022 Jan", "2022 Apr", "2023 Jan", "2023 Apr", "2024 Jan", "2024 Apr", "2025 Jan", "2025 Apr", "2026 Jan", "2026 Apr"];
