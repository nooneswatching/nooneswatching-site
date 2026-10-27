// All work lives here. Adding a piece is adding an entry; every count in the UI is
// computed from this file at build time. Media sizes come from scripts/media.mjs
// (src/media-manifest.json), so only the asset id and extension are needed here.
//
// Vocabulary (see the v3 handoff doc):
//   asset    = one image or video. `projectId` links it to a project.
//   project  = ordered list of asset ids + copy. Its `cover` is one of its assets.
//   single   = an asset that is not inside any project's `assets` list. It may still
//              carry a `projectId`, which the lightbox shows as "From <project> ↗".
//
// Disciplines: brand, product, campaign, motion, web.

export const DISCIPLINES = ['brand', 'product', 'campaign', 'motion', 'web'];

const img = (id, ext = 'jpg', o = {}) => ({ type: 'image', id, src: `/assets/img/${id}.${ext}`, ...o });
const vid = (id, o = {}) => ({ type: 'video', id, src: `/assets/video/${id}.mp4`, ...o });
// A piece whose file Josh still has to supply. Renders as a labelled placeholder tile.
const todo = (id, label) => ({ type: 'placeholder', id, label });

// Backing colour for the few PNGs with real transparency (shown behind them in tiles and the lightbox).
const GOTCHA = '#e3e8e8', DARK = '#1e1e1e';

// ---- projects (order here = order on the canvas under the Projects filter) ------
// Each asset: [media, title, caption?, { disciplines?, client?, year? }?]
export const projects = [
  {
    id: 'frameio-v4-launch', slug: 'frameio-v4-launch',
    title: 'Frame.io V4 Launch', client: 'Frame.io', year: 2024,
    role: 'Creative Direction + Motion', agency: 'Brand Studio',
    disciplines: ['campaign', 'motion'],
    description: "Frame.io's Version 4 launch was a milestone for both product and brand. As the app was rebuilt from the ground up, we created a bespoke visual language for the campaign, carrying it from the beta through the general audience launch. It centers on light, one of the brand's guiding principles, used to illuminate the core features of the redesigned app.",
    assets: [
      [vid('TRtOmT0pv2uSgeIkGT8DtwLgg'), 'Launch film', 'Campaign film'],
      [img('XBj04ZZJLKpNAn7zKkOj6qMdJ7c', 'png'), 'Introducing Version 4', 'Keyframe'],
      [img('sazRSQbqOAyaaJwc5pMlaKB3lM'), 'Horizon', 'Keyframe'],
      [img('6pVYHb0zS3iUAjlFo17AIA7ZVQ'), 'Blue arc', 'Keyframe'],
      [img('L8VBpluwqGIBPvSgmzbVPHf2dw', 'png'), 'Campaign system', 'Posters and web'],
      [vid('Tb5t9phKUgNCJF0wrpjnnM37QM'), 'Introducing Frame.io V4', 'Hero animation'],
      [img('WTRUmoXUsVHk8ohzVUuuYeujkc'), 'Transform the way you work', 'Paid social'],
      [vid('N17RmpBsmkXpKM5Fyo19h14nxfw'), 'We asked', 'Campaign film cut'],
      [vid('qFAIiJLKPaizm4Sfqt6i31ZIoQ'), 'Edge light', 'Motion study'],
      [img('BXnRh1hjjnrgViBLZBWkL6I24'), 'Review in context', 'Keyframe'],
      [img('NrgZyZG6NLIHqHlORxSRzR3YMk'), 'DRYP Ant', 'Keyframe'],
      [vid('v4-ga-nexus-1'), 'Launch film', 'General availability'],
      [img('v4-ga-nexus-2'), 'Key visual', 'General availability'],
      [vid('v4-ga-nexus-3'), 'Social cut', 'General availability'],
      [img('v4-ga-nexus-4'), 'Key visual', 'General availability'],
      [vid('v4-ga-nexus-5'), 'Social cut', 'General availability'],
      [todo('v4-ga-icons', 'Feature icons'), 'Feature icons', 'Placeholder'],
    ],
    cover: 'NrgZyZG6NLIHqHlORxSRzR3YMk',
  },
  {
    id: 'frameio-brand-refresh', slug: 'frameio-brand-refresh',
    title: 'Frame.io Brand Refresh', client: 'Frame.io', year: 2022,
    role: 'Design Lead', agency: 'Brand Studio',
    disciplines: ['brand'],
    description: "I co-led a complete refresh of Frame.io's brand foundations, from logo, color, and typography to a new set of guiding principles. I then built the system out into brand guidelines, a Figma brand library, and templates the whole company could use. The refresh was embraced by Frame.io's creative pro community and widely shared across social.",
    assets: [
      [img('yjQ517lBVN7Pxb7JfMxxQXYo'), 'Logo poster', 'Brand mark'],
      [img('49f2KAftqSCCVGB59I63C2Icm8Q'), 'Wallpapers', 'Brand gradients'],
      [todo('brand-refresh-guidelines', 'Brand guidelines'), 'Brand guidelines', 'Placeholder'],
      [todo('brand-refresh-type', 'Typography'), 'Typography', 'Placeholder'],
      [todo('brand-refresh-library', 'Figma brand library'), 'Figma brand library', 'Placeholder'],
      [todo('brand-refresh-social', 'Social templates'), 'Social templates', 'Placeholder'],
    ],
    cover: 'yjQ517lBVN7Pxb7JfMxxQXYo',
  },
  {
    id: 'frameio-product-expression', slug: 'frameio-product-expression',
    title: 'Frame.io Product Expression', client: 'Frame.io', year: 2023,
    role: 'Design Lead', agency: 'Brand Studio',
    disciplines: ['product', 'brand'],
    description: "Bringing the refreshed brand into the product itself. Working with Frame.io's product design team, I designed artwork for moments inside the app, including customizable project header backgrounds and a full set of empty state illustrations, so the brand felt as present in the product as it did in marketing.",
    assets: [
      [todo('product-expression-headers', 'Project header backgrounds'), 'Project header backgrounds', 'Placeholder'],
      [todo('product-expression-empty', 'Empty states'), 'Empty state illustrations', 'Placeholder'],
      [todo('product-expression-app', 'In the app'), 'In the app', 'Placeholder'],
    ],
    cover: 'product-expression-headers',
  },
  {
    id: 'frameio-content-supply-chain', slug: 'frameio-content-supply-chain',
    title: 'Frame.io Content Supply Chain', client: 'Frame.io', year: 2023,
    role: 'Design Lead', agency: 'Brand Studio',
    disciplines: ['motion'],
    description: "A concept film introducing Frame.io's vision for the content supply chain, the path creative work takes from brief to final delivery. I led the concept and developed the 3D visual language, styleframes, and storyboards, partnering with Modern Logic on production.",
    assets: [
      [img('RyYDr22b993wvQDtrVSQ2ZUUwM'), 'Pipeline', 'Styleframe'],
      [vid('csc-film'), 'Concept film', 'Hero film'],
      [todo('csc-storyboard', 'Storyboards'), 'Storyboards', 'Placeholder'],
      [todo('csc-styleframes', 'Styleframes'), 'Styleframes', 'Placeholder'],
    ],
    cover: 'RyYDr22b993wvQDtrVSQ2ZUUwM',
  },
  {
    id: 'adobe-com', slug: 'adobe-com',
    title: 'Adobe.com', client: 'Adobe', year: 2026,
    role: 'Design Lead + Lead Prototyper', agency: 'Adobe',
    disciplines: ['web', 'product'],
    description: "As design lead on the Adobe.com redesign, I focused on the homepage, global and local navigation, and the hub pages between them, building a system that routes every audience to the right place in as few steps as possible. I also led prototyping, designing in code from day one and onboarding our whole team to prototyping with Claude.",
    assets: [
      [vid('adobe-launch-film'), 'Launch film', 'Site launch'],
      [vid('adobe-homepage'), 'Homepage', 'Scroll capture'],
      [vid('adobe-mobile-hero'), 'Mobile hero', 'Interactive prototype'],
      [vid('adobe-global-nav'), 'Global navigation', 'Product menu'],
      [todo('adobe-tile-nav', 'Mobile tile nav'), 'Mobile tile navigation', 'Placeholder'],
      [todo('adobe-local-nav', 'Local nav'), 'Local navigation', 'Placeholder'],
      [todo('adobe-hubs', 'Hub scrolls'), 'Hub pages', 'Placeholder'],
      [vid('adobe-tuning-tool'), 'Scroll-animation tuning tool', 'Custom prototyping tool'],
    ],
    cover: 'adobe-homepage',
  },
  {
    id: 'muso', slug: 'muso',
    title: 'MUSO', client: 'Personal', year: 2024,
    role: 'Brand Identity', agency: 'Design study',
    disciplines: ['brand'],
    // TODO(Josh): draft description, please review
    description: "A brand identity study for MUSO, an outerwear label for people who find their solace in wild places. The mark folds a mountain ridge into an M, paired with a muted palette of slate and cool greys lifted by a sunset orange, and carried through campaign imagery, social and a mobile storefront.",
    assets: [
      [img('muso-campaign'), 'Campaign', 'Key visual'],
      [img('muso-wordmark'), 'Wordmark', 'Logo lockup'],
      [img('muso-mark'), 'Mark', 'Symbol'],
      [img('muso-construction'), 'Mark construction', 'Grid'],
      [img('muso-palette'), 'Color palette', 'Sunset, slate and cool greys'],
      [img('muso-poster'), 'Campaign poster', 'Gore-Tex shell'],
      [img('muso-social'), 'Social profile', 'Social'],
      [img('muso-mobile'), 'Mobile storefront', 'E-commerce'],
    ],
    cover: 'muso-campaign',
  },
  {
    id: 'machine-learning-fairness', slug: 'machine-learning-fairness',
    title: 'Machine Learning Fairness', client: 'Think with Google', year: 2020,
    role: 'Design + Motion Lead', agency: 'Grow',
    disciplines: ['web'],
    description: "An interactive editorial website exploring the human impact of algorithmic bias. This innovative experience utilized real-time WebGL-generated ASCII art paired with hand-cut collages, creating a unique visual representation of how algorithms 'see' us through data. This juxtaposition of raw data and human stories highlighted the emotional impact of bias in machine learning datasets on real individuals.",
    assets: [
      [img('b6GtQsg2SqeYKb7YOWcOHW41FZA', 'png', { bg: '#1c1c1c' }), 'Machine Learning Fairness', 'Cover'],
      [vid('byNB8sgCT9mJhFDcdNRNdh94sRY'), 'How inclusive data builds stronger brands', 'Site walkthrough'],
      [vid('dR5ml4bBzjYRc4sqDP0K1Gg9Qnk'), 'ASCII portrait', 'Real-time WebGL'],
      [img('FZx0CcleAj9Kkt5sM6DIysyXhXM'), 'They think I am', 'Pull quote'],
      [img('nLfhIJnglytj5ioxSWV6PXQO2Co'), 'Collage stories', 'Mobile'],
      [img('tcvyzH0yzKOTzPLAaiOvc1osO8k', 'png', { bg: '#f4f0ed' }), 'Hand-cut collage', 'Art direction'],
      [vid('Mwhm7p9SplGS9dcUfmeQnPxlTIc'), 'Data portrait', 'Motion study'],
      [img('s9d87g3Fxn3jhEzVgADmNnUj9I'), 'When data mirrors societal bias', 'Editorial'],
      [img('1wzBEowK2y351jfw1XBWvuYZOCs', 'jpg'), 'Full article', 'Editorial'],
    ],
    cover: 'b6GtQsg2SqeYKb7YOWcOHW41FZA',
  },
  {
    id: 'boston-marathon', slug: 'boston-marathon',
    title: 'Boston Marathon', client: 'Adidas', year: 2018,
    role: 'Design + Motion Lead', agency: 'Grow',
    disciplines: ['campaign', 'brand'],
    description: "Presented with the challenge of amplifying adidas' brand presence as a marquee sponsor of the Boston Marathon, I developed a cohesive sub-brand identity with comprehensive motion guidelines. This visual system served as the campaign's centerpiece, seamlessly integrating with adidas' core marketing channels, social media, and out-of-home advertising.",
    assets: [
      [img('HXUtJXG9r4EqE3poKGIMq9PXDZM'), 'Create legends', 'Campaign'],
      [img('5fAhXXYXoZlH7DlJBS4TraRtQ', 'png'), 'Typeface', 'Identity'],
      [img('VWelqWsfH8GQ3n1fztxrAH0cML8', 'png'), 'Create', 'Poster'],
      [img('s1XxGpZchSNRIEv3SPckleKGuo', 'png'), 'Marks', 'Identity'],
      [img('9nse1KKe6hg6GvI2bADlZYFWYM', 'png'), 'Athletes', 'Campaign'],
      [img('QCuF1rq6joLFzu63KJD2Xsfp7aE', 'png', { bg: DARK }), 'Social', 'Campaign'],
      [img('XY2sfbIrWW9XyQNcGYGEyn771I', 'png'), 'Portrait', 'Campaign'],
      [img('Zsqs315Sr9sBc8tZLTySREDNk', 'png', { bg: DARK }), 'Motion guidelines', 'Identity'],
      [img('gis3lD3fzYhDxSGorr4u8FEeIc', 'png'), 'Runner', 'Campaign'],
      [img('csz7FRXI1Jbao5z3sAkJOrHzObU', 'png'), 'Out of home', 'Campaign'],
      [vid('8ysL2vRM6A4g4f36rIG6qLZOhcQ'), 'Stripes', 'Motion'],
      [vid('if7ldLCPXttjQGQISceaA4nQmU'), 'Logo animation', 'Motion'],
      [img('2CBFD51wnsdtfNIFIz9XVw3a2Q', 'png'), 'Race day', 'Social'],
      [vid('aBy56jXVxTLXjzV7SPRhq2seUE'), 'Split time', 'Motion'],
      [img('5t8WdwxLGCsHmegV1EaRkrXOdM'), 'Poster', 'Campaign'],
      [vid('TN8yXjiYSiLuGfIfpcJMR9Bxc'), 'Legends are created in Boston', 'Film'],
    ],
    cover: 'HXUtJXG9r4EqE3poKGIMq9PXDZM',
  },
  {
    id: 'pixel-5a', slug: 'pixel-5a',
    title: 'Pixel 5a Retail Demo', client: 'Google', year: 2021,
    role: 'Design + Art Direction', agency: 'Grow',
    disciplines: ['product'],
    description: "To enhance the in-store experience during COVID-19, I designed a comprehensive retail demo app for the Pixel 5a launch. This interactive app, featuring engaging video demonstrations and animations, guided users through the phone's key features. To complement the in-store experience, I also designed a companion digital app accessible through a QR code. This allowed for a personalized, touch-free exploration of the Pixel 5a's capabilities on users' own devices.",
    assets: [
      [img('9CNt9DQ4i4Cc6vkmigR97hcsI4'), 'In hand', 'Retail'],
      [img('stjt7xeZle66hhhfmCKMY2Yvas'), 'In store', 'Retail'],
      [vid('R8bKbeqS4Gbcj1iAHfzYuvpTVG0'), 'Make every moment shine', 'Demo app'],
      [img('PWdPrD5bkof5qglUcPQKn04aLB0', 'png'), 'Meet Pixel 5a', 'Demo app'],
      [vid('geafnGbJdioTZpjFl3cQRknBeQ'), 'Display', 'Demo app'],
      [img('rSiRwrCGIw9iXrtYuJqc5s3s'), 'Companion app', 'Mobile'],
      [vid('7YlvWHmEJFoLc0xbFZwjRyiN8'), 'Hello splashes', 'Feature film'],
      [vid('RZjUl6aNXwIgbHdTCZKOHCPnGAQ'), 'What matters most', 'Demo app'],
      [img('ZWBooUm6BybMhJiU2cHC3LOSA', 'png'), 'Camera', 'Demo app'],
      [vid('eZMZzc2lafj1zEoAO5Hwq7NvRJ8'), 'Security', 'Demo app'],
      [vid('bMK7ZY0zarGITQae6pNKcmcKk'), 'Pixel', 'Motion'],
    ],
    cover: '9CNt9DQ4i4Cc6vkmigR97hcsI4',
  },
  {
    id: 'gotcha', slug: 'gotcha',
    title: 'Gotcha.com', client: 'Gotcha', year: 2022,
    role: 'Web Design + Design System', agency: 'Freelance',
    disciplines: ['web'],
    description: "Revitalizing a cherished brand, I spearheaded the redesign of Gotcha's e-commerce website for their full-line relaunch. The user-centric approach prioritizes a seamless customer journey, with a focus on minimizing checkout friction to drive sales and rekindle brand loyalty.",
    assets: [
      [img('PnLCLGksDl0r9Ep9D39k2h3PIHo'), 'Gotcha.com', 'Cover'],
      [vid('vGZcZp5yJA2eAfZL7drkVUXnk3k'), 'Homepage', 'Web'],
      [img('7oEJoXgvi5hU5bI9WaKd9yqI', 'jpg'), 'All products', 'Web'],
      [vid('JR02ySyqkjN3OBDqdFs4VDyCRCU'), 'Lookbook', 'Web'],
      [vid('RfMUuhZ8ZTam6OKtnZ5XSpJBg0'), 'Shop', 'Web'],
      [img('ynMl1Ae4Wb7hLq1bjfSHxdz2Q'), 'Product page', 'Web'],
      [img('0I8s9LzEhXr0mr3OH9idLgkwf0', 'png', { bg: GOTCHA }), 'Hoodie', 'Product'],
      [img('O7JRGjqRxFqTZo4a1GpmqfUTqaQ'), 'Campaign', 'Photography'],
      [vid('j8UU7HMk8W9eJlxdHiwZpk1MwPc'), 'Mobile', 'Web'],
    ],
    cover: 'PnLCLGksDl0r9Ep9D39k2h3PIHo',
  },
  {
    id: 'don-julio', slug: 'don-julio',
    title: 'Four Devotions', client: 'Don Julio', year: 2022,
    role: 'Design + Motion + Art Direction', agency: 'Grow',
    disciplines: ['web', 'motion'],
    description: "During the height of the pandemic, Don Julio sought to maintain a connection with its core audience. As the design lead at Grow, I spearheaded the creation of an immersive, interactive brand experience. This digital tour transported users to the heart of Don Julio's legacy, offering a virtual exploration of the distillery and the brand's homeland. Users get to experience real stories from real employees, and explore interactive WebGL scenes uncovering interesting facts about the brand along the way.",
    assets: [
      [img('mIgikRgM9MOcdKulTAnQ5p61pYQ'), 'Four Devotions', 'Cover'],
      [vid('g2CTu6S0Blg0MaMRAo00jsY6oak'), 'Four Devotions', 'Site walkthrough'],
      [vid('C3dSKtEYIA1S8IzUb9k7Gr6G4I'), 'The fields', 'WebGL scene'],
      [img('WHtp9niqBDTLp61YRS10IBWto0Y'), 'The jimador', 'Photography'],
      [vid('FcHURMvPPMQH0cyxtmX7SW9qcE'), 'Mobile', 'Web'],
      [vid('wpjaZDSVJwG4omvHzDxmWbxk3o'), 'The heart of the agave', 'Film'],
      [vid('BoT8IzxM1b2hayWFXUs049lmZe4'), 'Type', 'Motion'],
      [img('eNzYVJg4QoJNfU2q3UYQnklMcY4'), 'Soil', 'Photography'],
      [vid('7V2hwegmxB4uaNU8TwmbCywOrYE'), 'Four Devotions', 'Film'],
    ],
    cover: 'mIgikRgM9MOcdKulTAnQ5p61pYQ',
  },
];

// ---- single pieces ----------------------------------------------------------------
// [media, title, caption, { client, year, disciplines, projectId? }]
export const singles = [
  [img('oY2fukSBKtguFaFBRgn0X1QdE8'), 'Emission', 'Motion study', { client: 'Frame.io', year: 2024, disciplines: ['motion'], projectId: 'frameio-v4-launch' }],
  [img('QGkZ5mXOf1plz0ApqYCWgdWvdnE'), 'Frame.io Wallpaper', 'Brand wallpaper', { client: 'Frame.io', year: 2022, disciplines: ['brand'], projectId: 'frameio-brand-refresh' }],
  [img('55U1BHHhAm8Ic4KcXOyhvMFY1U', 'png'), 'DRYP Anthem Film', 'Out of home', { client: 'Frame.io', year: 2024, disciplines: ['campaign'], projectId: 'frameio-v4-launch' }],
  [vid('IiMO3KJu6BJ28LwytZtjyk2jIU'), 'Light trail', 'Motion study', { client: 'Frame.io', year: 2024, disciplines: ['motion'], projectId: 'frameio-v4-launch' }],
  [img('jRfDoa6pRhTSON0gSuYkR6ghvUY'), 'Dryp', '3D product render', { client: 'Personal', year: 2023, disciplines: ['brand'] }],
  [img('M0lvLJ0AvOs8gE6a5oxgxxvrBw'), 'Dryp cans', '3D packaging', { client: 'Personal', year: 2023, disciplines: ['brand'] }],
  [img('rth5S3qyFzyLC2STRyEg8VXv5I'), 'Cream Jar', '3D product render', { client: 'Personal', year: 2023, disciplines: ['brand'] }],
  [img('t0OElSJx1OCMgSgTHxD74zYvOCM'), 'Homework', 'Wordmark', { client: 'Homework', year: 2021, disciplines: ['brand'] }],
  [vid('DihN8WM6ijEaIioQ4I9Co4Hhmbo'), 'C2C', 'Hardware concept', { client: 'Frame.io', year: 2023, disciplines: ['product', 'motion'] }],
  [vid('rS6lifEzk8uyPeE4EMyFnCvs2w'), 'Blueprint', 'Logo animation', { client: 'Adidas', year: 2018, disciplines: ['motion'], projectId: 'boston-marathon' }],
  [vid('u5V4ZISwo3kPWhGBjv0ya6Nlk'), 'Now playing', 'TV interface', { client: 'Personal', year: 2023, disciplines: ['product'] }],
  [img('H0HWFDE0WbVr8ooRhkmg8HMNPY'), 'Boston Marathon', 'Campaign still', { client: 'Adidas', year: 2018, disciplines: ['campaign'], projectId: 'boston-marathon' }],
  [img('pnQZwwvXazRUzt8ucgQynhRWA'), 'Pixel 5a in hand', 'Retail demo', { client: 'Google', year: 2021, disciplines: ['product'], projectId: 'pixel-5a' }],
  [img('kNYfB7NsH5PNVpX0biFudZzUSBU'), 'Poplin shirt', 'Gotcha.com product page', { client: 'Gotcha', year: 2022, disciplines: ['web'], projectId: 'gotcha' }],
  [img('genai-soft-chair'), 'Soft chair', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-wildflowers'), 'Wildflowers', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-reach'), 'Reach', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-stairway'), 'Stairway', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-grin'), 'Grin', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-poodles'), 'Poodles', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-backhand'), 'Backhand', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-mid-jump'), 'Mid-jump', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-glass-lavender'), 'Molten glass, lavender', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-reach-2'), 'Reach, take two', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-glass-amber'), 'Molten glass, amber', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-above-clouds'), 'Above the clouds', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-flower-vase'), 'Flower vase', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-sneaker-bouquet'), 'Sneaker bouquet', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-pink-palm'), 'Pink palm', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-orange-hoodie'), 'Orange hoodie', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-sneaker-arch'), 'Sneaker arch', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-lunch'), 'Lunch', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-iced-coffee'), 'Iced coffee', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-marigolds'), 'Marigolds', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-shadow-stripes'), 'Shadow stripes', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-light-beam'), 'Light beam', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-holographic'), 'Holographic', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-quiet-room'), 'Quiet room', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-red-portrait'), 'Red portrait', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-orchids'), 'Orchids', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
  [img('genai-tulip'), 'Tulip', 'Generative image', { client: 'Adobe Firefly', year: 2025, disciplines: ['campaign'] }],
];

// ---- normalise --------------------------------------------------------------------
const slugify = (s) => s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Placeholder tiles (todo) are hidden until Josh supplies the media: the entries stay in
// the data so they come back by flipping this. A project with nothing else left is skipped.
export const SHOW_PLACEHOLDERS = false;

export function buildCatalogue(manifest = {}, { placeholders = SHOW_PLACEHOLDERS } = {}) {
  const assets = [];
  const used = new Set();
  const uniq = (slug) => { let s = slug, n = 2; while (used.has(s)) s = `${slug}-${n++}`; used.add(s); return s; };
  const mediaOf = (m) => {
    const dims = manifest[m.id] || {};
    const out = { type: m.type, src: m.src || null, width: dims.width || 1600, height: dims.height || 1200, bg: m.bg || null, label: m.label || null };
    if (m.type !== 'placeholder') out.thumb = `/assets/thumb/${m.id}.jpg`;
    if (m.type === 'video') { out.poster = `/assets/poster/${m.id}.jpg`; out.tile = `/assets/tile/${m.id}.mp4`; } // tile: 640px grid proxy; src stays the master
    return out;
  };

  const keep = (m) => placeholders || m.type !== 'placeholder';
  const projectsOut = projects.filter((p) => p.assets.some(([m]) => keep(m))).map((p) => {
    const ids = p.assets.filter(([m]) => keep(m)).map(([m, title, caption, o = {}]) => {
      assets.push({
        id: m.id, slug: uniq(`${p.slug}-${slugify(title)}`), title, caption: caption || '',
        client: o.client || p.client, year: o.year || p.year, disciplines: o.disciplines || p.disciplines,
        media: mediaOf(m), projectId: p.id, inProject: true,
      });
      return m.id;
    });
    const { assets: _a, ...rest } = p;
    return { ...rest, assets: ids };
  });

  singles.filter(([m]) => keep(m)).forEach(([m, title, caption, o]) => {
    assets.push({ id: m.id, slug: uniq(slugify(title)), title, caption, client: o.client, year: o.year, disciplines: o.disciplines, media: mediaOf(m), projectId: o.projectId || null, inProject: false });
  });

  projectsOut.forEach((p) => {
    if (!assets.find((a) => a.id === p.cover)) {
      if (placeholders) throw new Error(`Project ${p.id}: cover ${p.cover} is not an asset`);
      p.cover = p.assets[0];                                   // the cover was a hidden placeholder
    }
  });
  const ids = assets.map((a) => a.id);
  const dup = ids.find((id, i) => ids.indexOf(id) !== i);
  if (dup) throw new Error(`Duplicate asset id ${dup}`);

  return { assets, projects: projectsOut };
}
