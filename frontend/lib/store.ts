export interface Category {
  id: string
  name: string
}

export interface EventItem {
  id: string
  name: string
  description: string
  date: string
  categoryId: string
  imageUrl: string
  price: number
  interested: number
}

export const initialCategories: Category[] = [
  { id: "cat-1", name: "Musica" },
  { id: "cat-2", name: "Tecnologia" },
  { id: "cat-3", name: "Gastronomia" },
  { id: "cat-4", name: "Arte" },
  { id: "cat-5", name: "Deportes" },
]

export const initialEvents: EventItem[] = [
  {
    id: "evt-1",
    name: "Festival de Verano",
    description: "Un increible festival de musica al aire libre con artistas nacionales e internacionales.",
    date: "2026-07-15",
    categoryId: "cat-1",
    imageUrl: "/images/event-music.jpg",
    price: 45.00,
    interested: 128,
  },
  {
    id: "evt-2",
    name: "Conferencia Tech Summit",
    description: "El evento de tecnologia mas importante del ano con ponencias sobre IA, cloud y desarrollo.",
    date: "2026-09-20",
    categoryId: "cat-2",
    imageUrl: "/images/event-tech.jpg",
    price: 120.00,
    interested: 95,
  },
  {
    id: "evt-3",
    name: "Feria Gastronomica",
    description: "Degustacion de platos gourmet y vinos selectos en un entorno exclusivo.",
    date: "2026-08-10",
    categoryId: "cat-3",
    imageUrl: "/images/event-food.jpg",
    price: 35.00,
    interested: 210,
  },
  {
    id: "evt-4",
    name: "Exposicion de Arte Moderno",
    description: "Una muestra de las mejores obras de arte contemporaneo de artistas emergentes.",
    date: "2026-06-05",
    categoryId: "cat-4",
    imageUrl: "/images/event-art.jpg",
    price: 15.00,
    interested: 67,
  },
  {
    id: "evt-5",
    name: "Maraton Urbana 10K",
    description: "Carrera de 10 kilometros por las calles de la ciudad con premio para los ganadores.",
    date: "2026-10-12",
    categoryId: "cat-5",
    imageUrl: "/images/event-sports.jpg",
    price: 25.00,
    interested: 340,
  },
]
