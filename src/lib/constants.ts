export const PATHS = {
  global: {
    products: {
      label: 'Продукты',
      link: '/products',
    },
    experts: {
      label: 'Эксперты',
      link: '/experts',
    },
    about: {
      label: 'О нас',
      link: '/about',
    },
  },
  internal: {
    category: {
      label: 'Категория',
      link: '/products?category=',
    },
  },
  additional: {
    documentation: {
      label: 'Документация',
      link: '/documentation',
    },
    terms: {
      label: 'Пользовательское соглашение',
      link: '/terms',
    },
    support: {
      label: 'Поддержка',
      link: '/support',
    },
  },
} as const
