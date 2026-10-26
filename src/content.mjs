// Site-wide copy: meta, socials and the Info page. Work lives in src/work.mjs.

export const site = {
  title: 'NO/ONES/WATCHING',
  name: 'Joshua Newton',
  description: 'Joshua Newton is a designer and creative director working across brand, product, campaigns, motion and interactive web.',
  url: 'https://www.nooneswatching.me',
  ogImage: '/assets/img/GD3vUS9JXVVwY5rzJ312DTkuM.jpg',
  favicon: '/assets/img/AGzsB6H28fPQW2ZNTdGj0kZCqZs.png',
  gaId: 'G-MG2F86NDXQ',
  email: 'josh.newton@gmail.com',
};

// Two-letter social links, in the order they appear on the Info page.
export const socials = [
  { label: 'IG', name: 'Instagram', href: 'https://www.instagram.com/nooneswatching/' },
  { label: 'LI', name: 'LinkedIn', href: 'https://www.linkedin.com/in/josh-newton/' },
  { label: 'TW', name: 'X', href: 'https://x.com/nooneswatching' },
  { label: 'TH', name: 'Threads', href: 'https://www.threads.net/@nooneswatching' },
  { label: 'DR', name: 'Dribbble', href: 'https://dribbble.com/nooneswatching' },
];

export const info = {
  // Everything from `statement.rest` onward renders at 40% opacity.
  statement: { lead: 'Joshua Newton is a designer and creative director', rest: 'working across brand, product, campaigns, motion and interactive web.' },
  // TODO(Josh): placeholder copy, still to approve.
  about: [
    'Currently a Senior Staff Designer at Adobe, designing how people work alongside AI agents.',
    'Before that, I led design and creative direction across the Adobe.com redesign, Adobe Firefly, Adobe Brand Studio, Frame.io and Grow, partnering with teams at Google, Adidas and more. I move between brand systems, product, motion and code, and I prototype everything I can.',
  ],
  experience: [
    ['Adobe', 'Senior Staff Designer, Agents', 'Now'],
    ['Adobe.com', 'Design Lead, Redesign', '2026'], // TODO(Josh): year to confirm
    ['Adobe Firefly', 'Brand Creative Director', '2025'],
    ['Adobe Brand Studio', 'Associate Creative Director', '2025'],
    ['Frame.io', 'Brand Design Lead', '2022–25'],
    ['Grow', 'Design Director', '2020–22'],
  ],
  recognition: [
    ['Webby Award', 'Think with Google'],
    ['Awwwards Site of the Day', 'Machine Learning Fairness'],
    ['Awwwards Developer Award', 'Machine Learning Fairness'],
    ['FWA Site of the Day', 'Machine Learning Fairness'],
  ],
  clients: 'Adobe, Frame.io, Google, Adidas, Don Julio, Gotcha',
  copyright: '© 2026 Joshua Newton',
};
