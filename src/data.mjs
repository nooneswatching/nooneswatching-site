// All site content lives here. Media dimensions are the design sizes measured
// on the Framer site (desktop), used only to derive aspect ratios.

export const site = {
  title: 'NO/ONES/WATCHING',
  description: 'Portfolio of Designer & Director Joshua Newton',
  url: 'https://www.nooneswatching.me',
  ogImage: '/assets/img/GD3vUS9JXVVwY5rzJ312DTkuM.jpg',
  favicon: '/assets/img/AGzsB6H28fPQW2ZNTdGj0kZCqZs.png',
  gaId: 'G-MG2F86NDXQ',
};

export const socials = [
  { label: 'IG', href: 'https://www.instagram.com/nooneswatching/' },
  { label: 'TW', href: 'https://x.com/nooneswatching' },
  { label: 'LI', href: 'https://www.linkedin.com/in/josh-newton/' },
  { label: 'TH', href: 'https://www.threads.net/@nooneswatching' },
  { label: 'DR', href: 'https://dribbble.com/nooneswatching' },
];

// ---- media helpers -------------------------------------------------------
const img = (id, ext = 'jpg', o = {}) => ({ t: 'img', src: `/assets/img/${id}.${ext}`, ...o });
const vid = (id, o = {}) => ({ t: 'vid', src: `/assets/video/${id}.mp4`, ...o });
const lottie = (id, o = {}) => ({ t: 'lottie', src: `/assets/lottie/${id}.json`, ...o });
const svg = (name, o = {}) => ({ t: 'svg', name, ...o });
// A coloured panel with one or more centred children. w/h = panel design size.
const panel = (bg, w, h, children, gap = 0) => ({ t: 'panel', bg, w, h, children, gap });
const kid = (item, w, h, br = 0) => ({ item, w, h, br });

// Row builders. ar = [w, h] design size of each tile in the row.
const full = (item, w, h) => ({ kind: 'full', items: [item], ar: [w, h] });
const pair = (a, b, w, h, o = {}) => ({ kind: 'pair', items: [a, b], ar: [w, h], ...o });

// ---- home feed -----------------------------------------------------------
export const feed = {
  intro: { lines: ['Joshua Newton is a designer & creative director.', 'Brand Studio at Adobe'], range: '2016—2025' },
  slideshow: ['QGkZ5mXOf1plz0ApqYCWgdWvdnE', 'H0HWFDE0WbVr8ooRhkmg8HMNPY', 'pnQZwwvXazRUzt8ucgQynhRWA', 'kNYfB7NsH5PNVpX0biFudZzUSBU', '49f2KAftqSCCVGB59I63C2Icm8Q'].map((id) => img(id)),
  rows: [
    pair(img('RyYDr22b993wvQDtrVSQ2ZUUwM'), img('rth5S3qyFzyLC2STRyEg8VXv5I'), 1, 1),
    full(vid('DihN8WM6ijEaIioQ4I9Co4Hhmbo'), 1409, 793),
    pair(vid('rS6lifEzk8uyPeE4EMyFnCvs2w'), img('jRfDoa6pRhTSON0gSuYkR6ghvUY'), 1, 1),
    full(img('55U1BHHhAm8Ic4KcXOyhvMFY1U', 'png'), 1409, 793),
    pair(img('M0lvLJ0AvOs8gE6a5oxgxxvrBw'), img('t0OElSJx1OCMgSgTHxD74zYvOCM'), 1, 1),
    full(vid('IiMO3KJu6BJ28LwytZtjyk2jIU'), 1409, 793),
    pair(img('yjQ517lBVN7Pxb7JfMxxQXYo'), vid('u5V4ZISwo3kPWhGBjv0ya6Nlk'), 1, 1),
  ],
};

// ---- projects index ------------------------------------------------------
export const projectsIntro = { lines: ['Joshua Newton is a designer & creative director.', 'BrandStudio® Frame.io / Adobe'], range: '2016—2024' };

// ---- case studies (order = prev/next order) ------------------------------
const GREY = 'rgb(188, 187, 187)';
const GOTCHA = 'rgb(227, 232, 232)';
const DARK = 'rgb(30, 30, 30)';
const TEAL = 'rgb(62, 81, 81)';
const DJ = 'rgb(240, 240, 240)';

export const projects = [
  {
    slug: 'frame-v4',
    menuName: 'Frame.io', menuYear: '2024',
    card: { name: 'Frame.io', sub: 'Version 4  Product Launch Campaign', year: '2024', cover: img('VShwNnL3jLx8WPJBuLAaR6z5Go') },
    title: 'Frame.io', year: '2024', subtitle: 'Version 4 Launch Campaign',
    description: "Frame.io's Version 4 launch represented a significant milestone for both product and brand. As the app underwent a complete rebuild, we strategized and executed a bespoke visual language for the marketing campaign. Our visual center leverages one of the brand’s guiding visual principals of “light” and uses it as vessel to illuminate the core features of the newly redesigned app.",
    meta: [['Role', 'Design + Motion Design'], ['Client', 'Frame.io'], ['Agency', 'Brand Studio']],
    rows: [
      full(vid('TRtOmT0pv2uSgeIkGT8DtwLgg'), 1047, 589),
      full(img('XBj04ZZJLKpNAn7zKkOj6qMdJ7c', 'png'), 1047, 589),
      pair(img('sazRSQbqOAyaaJwc5pMlaKB3lM'), img('6pVYHb0zS3iUAjlFo17AIA7ZVQ'), 519, 520, { mobilePair: true }),
      full(img('L8VBpluwqGIBPvSgmzbVPHf2dw', 'png'), 1047, 589),
      full(vid('Tb5t9phKUgNCJF0wrpjnnM37QM'), 1047, 713),
      pair(img('oY2fukSBKtguFaFBRgn0X1QdE8'), img('WTRUmoXUsVHk8ohzVUuuYeujkc'), 519, 520),
      full(vid('N17RmpBsmkXpKM5Fyo19h14nxfw'), 1047, 589),
      full(vid('qFAIiJLKPaizm4Sfqt6i31ZIoQ'), 1047, 589),
      full(img('BXnRh1hjjnrgViBLZBWkL6I24'), 1047, 589),
      full(img('NrgZyZG6NLIHqHlORxSRzR3YMk'), 1047, 589),
    ],
  },
  {
    slug: 'adidas_boston-marathon',
    menuName: 'Adidas Running', menuYear: '2018',
    card: { name: 'Adidas Running', sub: 'Boston Marathon', year: '2018', cover: img('HXUtJXG9r4EqE3poKGIMq9PXDZM') },
    title: 'Adidas Running', year: '2018', subtitle: '2018 Boston Marathon',
    description: "Presented with the challenge of amplifying adidas' brand presence as a marquee sponsor of the Boston Marathon, I developed a cohesive sub-brand identity with comprehensive motion guidelines. This visual system served as the campaign's centerpiece, seamlessly integrating with adidas' core marketing channels, social media, and out-of-home advertising.",
    meta: [['Role', 'Design + Motion Lead'], ['Client', 'Adidas Running'], ['Agency', 'Grow']],
    rows: [
      full(img('reTh4UwX6otu0fYdTD85LnjlIA', 'png', { fit: 'fill' }), 1047, 659),
      full(img('5fAhXXYXoZlH7DlJBS4TraRtQ', 'png', { fit: 'fill' }), 1047, 560),
      pair(img('VWelqWsfH8GQ3n1fztxrAH0cML8', 'png'), img('s1XxGpZchSNRIEv3SPckleKGuo', 'png'), 519, 560),
      full(img('9nse1KKe6hg6GvI2bADlZYFWYM', 'png'), 1047, 558),
      full(img('QCuF1rq6joLFzu63KJD2Xsfp7aE', 'png'), 1047, 560),
      pair(img('XY2sfbIrWW9XyQNcGYGEyn771I', 'png'), panel(DARK, 519, 580, [kid(img('Zsqs315Sr9sBc8tZLTySREDNk', 'png'), 312, 234)]), 519, 580),
      full(img('gis3lD3fzYhDxSGorr4u8FEeIc', 'png'), 1047, 558),
      full(img('csz7FRXI1Jbao5z3sAkJOrHzObU', 'png'), 1047, 558),
      pair(panel(DARK, 519, 532, [kid(vid('8ysL2vRM6A4g4f36rIG6qLZOhcQ'), 208, 208)]), panel(DARK, 519, 532, [kid(vid('if7ldLCPXttjQGQISceaA4nQmU'), 260, 130)]), 519, 532),
      full(img('2CBFD51wnsdtfNIFIz9XVw3a2Q', 'png'), 1047, 558),
      pair(vid('aBy56jXVxTLXjzV7SPRhq2seUE'), img('5t8WdwxLGCsHmegV1EaRkrXOdM'), 519, 519),
      full(vid('TN8yXjiYSiLuGfIfpcJMR9Bxc'), 1047, 589),
    ],
  },
  {
    slug: 'think-with-google',
    menuName: 'Think With Google', menuYear: '2020',
    card: { name: 'Think With Google', sub: 'Interactive Editorial: Machine Learning Fairness', year: '2020', cover: img('b6GtQsg2SqeYKb7YOWcOHW41FZA', 'png') },
    title: 'Think With Google', year: '2020', subtitle: 'Machine Learning Fairness',
    description: "An interactive editorial website exploring the human impact of algorithmic bias. This innovative experience utilized real-time WebGL-generated ASCII art paired with hand-cut collages, creating a unique visual representation of how algorithms 'see' us through data. This juxtaposition of raw data and human stories highlighted the emotional impact of bias in machine learning datasets on real individuals.",
    meta: [['Role', 'Design + Motion Lead'], ['Client', 'Think With Google'], ['Agency', 'Grow']],
    rows: [
      full(panel('rgb(187, 187, 187)', 1047, 708, [kid(vid('byNB8sgCT9mJhFDcdNRNdh94sRY'), 785, 491, 8)]), 1047, 708),
      pair(vid('dR5ml4bBzjYRc4sqDP0K1Gg9Qnk'), img('FZx0CcleAj9Kkt5sM6DIysyXhXM'), 519, 481),
      full(img('nLfhIJnglytj5ioxSWV6PXQO2Co'), 1047, 589),
      pair(panel('rgb(244, 240, 237)', 519, 481, [kid(img('tcvyzH0yzKOTzPLAaiOvc1osO8k', 'png'), 390, 260)]), panel(GREY, 519, 481, [kid(vid('Mwhm7p9SplGS9dcUfmeQnPxlTIc'), 312, 312, 4)]), 519, 481),
      full(panel(GREY, 1047, 719, [kid(img('s9d87g3Fxn3jhEzVgADmNnUj9I'), 785, 559, 4)]), 1047, 719),
      full(panel(GREY, 1047, 1694, [kid(img('1wzBEowK2y351jfw1XBWvuYZOCs', 'jpg', { big: true }), 785, 1534, 4)]), 1047, 1694),
    ],
  },
  {
    slug: 'pixel',
    menuName: 'Google Pixel', menuYear: '2021',
    card: { name: 'Google Pixel', sub: 'Pixel 5a Retail Demo App', year: '2021', cover: img('9CNt9DQ4i4Cc6vkmigR97hcsI4') },
    title: 'Google Pixel 5a', year: '2021', subtitle: 'Retail Device Demo App',
    description: "To enhance the in-store experience during COVID-19, I designed a comprehensive retail demo app for the Pixel 5a launch. This interactive app, featuring engaging video demonstrations and animations, guided users through the phone's key features. To complement the in-store experience, I also designed a companion digital app accessible through a QR code. This allowed for a personalized, touch-free exploration of the Pixel 5a's capabilities on users' own devices.",
    meta: [['Role', 'Design + Art Direction'], ['Client', 'Google'], ['Agency', 'Grow']],
    rows: [
      full(img('stjt7xeZle66hhhfmCKMY2Yvas'), 1047, 590),
      full(panel(TEAL, 1047, 642, [kid(vid('R8bKbeqS4Gbcj1iAHfzYuvpTVG0'), 235, 522, 20), kid(img('PWdPrD5bkof5qglUcPQKn04aLB0', 'png'), 235, 522, 20), kid(vid('geafnGbJdioTZpjFl3cQRknBeQ'), 235, 522, 20)], 40), 1047, 642),
      pair(img('rSiRwrCGIw9iXrtYuJqc5s3s'), vid('7YlvWHmEJFoLc0xbFZwjRyiN8'), 519, 511),
      full(img('DycegSkrFmtPsIXxAmw4sXGTg'), 1047, 680),
      full(panel(TEAL, 1047, 642, [kid(vid('RZjUl6aNXwIgbHdTCZKOHCPnGAQ'), 235, 522, 20), kid(img('ZWBooUm6BybMhJiU2cHC3LOSA', 'png'), 235, 522, 20), kid(vid('eZMZzc2lafj1zEoAO5Hwq7NvRJ8'), 235, 522, 20)], 40), 1047, 642),
      pair(panel('rgb(222, 222, 222)', 519, 511, [kid(lottie('DwJTaRMusN3gFKEkCBf5PdMPPKc'), 519, 511)]), vid('bMK7ZY0zarGITQae6pNKcmcKk'), 519, 511),
    ],
  },
  {
    slug: 'gotcha',
    menuName: 'Gotcha.com', menuYear: '2022',
    card: { name: 'Gotcha', sub: 'Gotcha.com', year: '2021', cover: img('PnLCLGksDl0r9Ep9D39k2h3PIHo') },
    title: 'Gotcha', year: '2022', subtitle: 'Gotcha.com',
    description: "Revitalizing a cherished brand, I spearheaded the redesign of Gotcha's e-commerce website for their full-line relaunch. The user-centric approach prioritizes a seamless customer journey, with a focus on minimizing checkout friction to drive sales and rekindle brand loyalty.",
    meta: [['Role', 'Web Design + Design System'], ['Client', 'Gotcha'], ['Agency', 'Freelance']],
    rows: [
      full(panel(GOTCHA, 1047, 708, [kid(vid('vGZcZp5yJA2eAfZL7drkVUXnk3k'), 785, 481, 8)]), 1047, 708),
      full(panel(GOTCHA, 1047, 1591, [kid(img('7oEJoXgvi5hU5bI9WaKd9yqI', 'jpg', { big: true }), 785, 1342, 8)]), 1047, 1591),
      pair(vid('JR02ySyqkjN3OBDqdFs4VDyCRCU'), panel('rgb(255, 255, 255)', 519, 511, [kid(svg('gotcha-icons'), 311.6, 34)]), 519, 511),
      full(panel(GOTCHA, 1047, 708, [kid(vid('RfMUuhZ8ZTam6OKtnZ5XSpJBg0'), 785, 481, 8)]), 1047, 708),
      full(panel(GOTCHA, 1047, 728, [kid(img('ynMl1Ae4Wb7hLq1bjfSHxdz2Q'), 785, 490)]), 1047, 728),
      pair(panel(GOTCHA, 519, 512, [kid(img('0I8s9LzEhXr0mr3OH9idLgkwf0', 'png'), 286, 384)]), img('O7JRGjqRxFqTZo4a1GpmqfUTqaQ'), 519, 512),
      full(panel(GOTCHA, 1047, 624, [kid(vid('j8UU7HMk8W9eJlxdHiwZpk1MwPc'), 233, 504, 20)]), 1047, 624),
    ],
  },
  {
    slug: 'don-julio',
    menuName: 'Don Julio Tequila', menuYear: '2022',
    card: { name: 'Don Julio Tequila', sub: "Don Julio's 4 Devotions", year: '2022', cover: img('mIgikRgM9MOcdKulTAnQ5p61pYQ') },
    title: 'Don Julio Tequila', year: '2022', subtitle: 'Four Devotions',
    description: "During the height of the pandemic, Don Julio sought to maintain a connection with its core audience. As the design lead at Grow, I spearheaded the creation of an immersive, interactive brand experience. This digital tour transported users to the heart of Don Julio's legacy, offering a virtual exploration of the distillery and the brand's homeland. Users get to experience real stories from real employees, and explore interactive WebGL scenes uncovering interesting facts about the brand along the way.",
    meta: [['Role', 'Design + Motion + Art Direction'], ['Client', 'Diageo'], ['Agency', 'Grow']],
    rows: [
      full(panel(DJ, 1047, 708, [kid(vid('g2CTu6S0Blg0MaMRAo00jsY6oak'), 785, 523, 8)]), 1047, 708),
      full(panel(DJ, 1047, 708, [kid(vid('C3dSKtEYIA1S8IzUb9k7Gr6G4I'), 785, 523, 8)]), 1047, 708),
      pair(img('WHtp9niqBDTLp61YRS10IBWto0Y'), panel(DJ, 519, 520, [kid(vid('FcHURMvPPMQH0cyxtmX7SW9qcE'), 213, 461, 16)]), 519, 520),
      full(panel(DJ, 1047, 708, [kid(vid('wpjaZDSVJwG4omvHzDxmWbxk3o'), 785, 523, 8)]), 1047, 708),
      pair(panel(DJ, 519, 520, [kid(vid('BoT8IzxM1b2hayWFXUs049lmZe4'), 213, 461, 16)]), img('eNzYVJg4QoJNfU2q3UYQnklMcY4'), 519, 520),
      full(vid('7V2hwegmxB4uaNU8TwmbCywOrYE'), 1047, 589),
    ],
  },
];

export const menuExtra = { name: 'Feed', year: '2018 - 2024', href: '/' };
