const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export interface BackendCategoria {
  id: number;
  nombre: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackendEvento {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  urlImagen: string | null;
  fecha: string;
  categoriaId: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: { interesados: number };
}

export interface EventItem {
  id: string;
  name: string;
  description: string;
  date: string;
  categoryId: string;
  imageUrl: string;
  price: number;
  interested: number;
}

export function mapBackendToFrontend(evento: BackendEvento): EventItem {
  const imageUrl = evento.urlImagen
    ? evento.urlImagen.startsWith('http')
      ? evento.urlImagen
      : `${API_BASE_URL}${evento.urlImagen}`
    : '/placeholder.jpg';
  return {
    id: evento.id.toString(),
    name: evento.nombre,
    description: evento.descripcion || '',
    date: evento.fecha.split('T')[0],
    categoryId: evento.categoriaId?.toString() || '',
    imageUrl,
    price: evento.precio,
    interested: evento._count?.interesados ?? 0,
  };
}

export function mapFrontendToBackend(event: Omit<EventItem, 'id' | 'interested'>): {
  nombre: string;
  descripcion?: string;
  precio: number;
  urlImagen?: string;
  fecha: string;
  categoriaId?: number | null;
} {
  return {
    nombre: event.name,
    descripcion: event.description || undefined,
    precio: event.price,
    urlImagen: event.imageUrl || undefined,
    fecha: event.date,
    categoriaId: event.categoryId ? Number(event.categoryId) : null,
  };
}

export async function uploadEventImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('imagen', file);
  const response = await fetch(`${API_BASE_URL}/events/upload-image`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al subir la imagen');
  }
  const data = await response.json();
  return data.url;
}

export const eventApi = {
  async getEvents(): Promise<EventItem[]> {
    const response = await fetch(`${API_BASE_URL}/events`);
    if (!response.ok) {
      throw new Error('Error al obtener eventos');
    }
    const eventos: BackendEvento[] = await response.json();
    return eventos.map(mapBackendToFrontend);
  },

  async getEvent(id: string): Promise<EventItem> {
    const response = await fetch(`${API_BASE_URL}/events/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener el evento');
    }
    const evento: BackendEvento = await response.json();
    return mapBackendToFrontend(evento);
  },

  async createEvent(event: Omit<EventItem, 'id' | 'interested'>): Promise<EventItem> {
    const payload = mapFrontendToBackend(event);
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear el evento');
    }
    const evento: BackendEvento = await response.json();
    return mapBackendToFrontend(evento);
  },

  async updateEvent(id: string, event: Partial<Omit<EventItem, 'id' | 'interested'>>): Promise<EventItem> {
    const updateData: Record<string, unknown> = {};
    if (event.name) updateData.nombre = event.name;
    if (event.description !== undefined) updateData.descripcion = event.description;
    if (event.price !== undefined) updateData.precio = event.price;
    if (event.imageUrl !== undefined) {
      updateData.urlImagen = event.imageUrl.startsWith(API_BASE_URL)
        ? event.imageUrl.slice(API_BASE_URL.length)
        : event.imageUrl;
    }
    if (event.date) updateData.fecha = event.date;
    if (event.categoryId !== undefined) {
      updateData.categoriaId = event.categoryId ? Number(event.categoryId) : null;
    }

    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al actualizar el evento');
    }
    const evento: BackendEvento = await response.json();
    return mapBackendToFrontend(evento);
  },

  async deleteEvent(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar el evento');
    }
  },

  async getUpcomingEvents(limit?: number): Promise<EventItem[]> {
    const url = limit 
      ? `${API_BASE_URL}/events/upcoming?limit=${limit}`
      : `${API_BASE_URL}/events/upcoming`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error al obtener próximos eventos');
    }
    const eventos: BackendEvento[] = await response.json();
    return eventos.map(mapBackendToFrontend);
  },

  async markInterested(eventId: string): Promise<{ interesados: number }> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/interested`, {
      method: 'POST',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al marcar interés');
    }
    return response.json();
  },
};

export interface CategoryItem {
  id: string;
  name: string;
}

export function mapCategoriaToFrontend(c: BackendCategoria): CategoryItem {
  return { id: String(c.id), name: c.nombre };
}

export const categoryApi = {
  async getCategories(): Promise<CategoryItem[]> {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) throw new Error('Error al obtener categorías');
    const data: BackendCategoria[] = await response.json();
    return data.map(mapCategoriaToFrontend);
  },

  async createCategory(name: string): Promise<CategoryItem> {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: name.trim() }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al crear la categoría');
    }
    const data: BackendCategoria = await response.json();
    return mapCategoriaToFrontend(data);
  },

  async updateCategory(id: string, name: string): Promise<CategoryItem> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: name.trim() }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al actualizar la categoría');
    }
    const data: BackendCategoria = await response.json();
    return mapCategoriaToFrontend(data);
  },

  async deleteCategory(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al eliminar la categoría');
    }
  },
};
