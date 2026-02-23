const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Tipos del backend
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
}

// Tipos del frontend
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

// Mapear evento del backend al frontend
export function mapBackendToFrontend(evento: BackendEvento): EventItem {
  return {
    id: evento.id.toString(),
    name: evento.nombre,
    description: evento.descripcion || '',
    date: evento.fecha.split('T')[0], // Solo la fecha sin hora
    categoryId: evento.categoriaId?.toString() || '',
    imageUrl: evento.urlImagen || '/placeholder.jpg',
    price: evento.precio,
    interested: 0, // Por ahora no manejamos esto en el backend
  };
}

// Mapear evento del frontend al backend
export function mapFrontendToBackend(event: Omit<EventItem, 'id' | 'interested'>): {
  nombre: string;
  descripcion?: string;
  precio: number;
  urlImagen?: string;
  fecha: string;
} {
  return {
    nombre: event.name,
    descripcion: event.description || undefined,
    precio: event.price,
    urlImagen: event.imageUrl || undefined,
    fecha: event.date,
  };
}

// Funciones de fetch puras (sin lógica de estado)
export const eventApi = {
  async getEvents(): Promise<EventItem[]> {
    const response = await fetch(`${API_BASE_URL}/eventos`);
    if (!response.ok) {
      throw new Error('Error al obtener eventos');
    }
    const eventos: BackendEvento[] = await response.json();
    return eventos.map(mapBackendToFrontend);
  },

  async getEvent(id: string): Promise<EventItem> {
    const response = await fetch(`${API_BASE_URL}/eventos/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener el evento');
    }
    const evento: BackendEvento = await response.json();
    return mapBackendToFrontend(evento);
  },

  async createEvent(event: Omit<EventItem, 'id' | 'interested'>): Promise<EventItem> {
    const response = await fetch(`${API_BASE_URL}/eventos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mapFrontendToBackend(event)),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al crear el evento');
    }
    const evento: BackendEvento = await response.json();
    return mapBackendToFrontend(evento);
  },

  async updateEvent(id: string, event: Partial<Omit<EventItem, 'id' | 'interested'>>): Promise<EventItem> {
    const updateData: any = {};
    if (event.name) updateData.nombre = event.name;
    if (event.description !== undefined) updateData.descripcion = event.description;
    if (event.price !== undefined) updateData.precio = event.price;
    if (event.imageUrl !== undefined) updateData.urlImagen = event.imageUrl;
    if (event.date) updateData.fecha = event.date;

    const response = await fetch(`${API_BASE_URL}/eventos/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/eventos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al eliminar el evento');
    }
  },

  async getUpcomingEvents(limit?: number): Promise<EventItem[]> {
    const url = limit 
      ? `${API_BASE_URL}/eventos/proximos?limit=${limit}`
      : `${API_BASE_URL}/eventos/proximos`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error al obtener próximos eventos');
    }
    const eventos: BackendEvento[] = await response.json();
    return eventos.map(mapBackendToFrontend);
  },
};
