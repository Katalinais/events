const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
  estado?: string;
  createdAt: string;
  updatedAt: string;
  _count?: { interesados: number };
}

export interface ReportInteresado {
  id: number;
  nombre: string;
  username: string;
  correo: string | null;
}

export interface BackendReportEvento extends BackendEvento {
  interesados: { usuario: ReportInteresado }[];
}

export interface ReportEventItem {
  id: string;
  name: string;
  interested: number;
  interestedUsers: ReportInteresado[];
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
  status?: string;
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
    status: evento.estado,
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
  formData.append('image', file);
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

  async getFavoriteEvents(): Promise<EventItem[]> {
    const response = await fetch(`${API_BASE_URL}/events/favorites`, {
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al obtener tus favoritos');
    }
    const eventos: BackendEvento[] = await response.json();
    return eventos.map(mapBackendToFrontend);
  },

  async getAllEventsSalesSummary(): Promise<{ eventId: number; eventName: string; totalTickets: number; totalRevenue: number }[]> {
    const response = await fetch(`${API_BASE_URL}/events/sales-summary`, {
      headers: { ...getAuthHeaders() },
    })
    if (!response.ok) throw new Error('Error fetching sales summary')
    return response.json()
  },

  async getEventSalesReport(eventId: string): Promise<{
    eventName: string
    lines: { category: string; unitPrice: number; soldCount: number; revenue: number }[]
    totalTickets: number
    totalRevenue: number
  }> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/sales-report`, {
      headers: { ...getAuthHeaders() },
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || 'Error fetching sales report')
    }
    return response.json()
  },

  async getTopSellingEvents(): Promise<(EventItem & { totalVendidas: number })[]> {
    const response = await fetch(`${API_BASE_URL}/events/top-selling`);
    if (!response.ok) throw new Error('Error al obtener top eventos');
    const eventos: (BackendEvento & { totalVendidas: number })[] = await response.json();
    return eventos.map((e) => ({ ...mapBackendToFrontend(e), totalVendidas: e.totalVendidas }));
  },

  async getPastEvents(): Promise<EventItem[]> {
    const response = await fetch(`${API_BASE_URL}/events/past`);
    if (!response.ok) throw new Error('Error al obtener eventos pasados');
    const eventos: BackendEvento[] = await response.json();
    return eventos.map(mapBackendToFrontend);
  },

  async getAdminEvents(): Promise<EventItem[]> {
    const response = await fetch(`${API_BASE_URL}/events/admin`, {
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) throw new Error('Error al obtener eventos');
    const eventos: BackendEvento[] = await response.json();
    return eventos.map(mapBackendToFrontend);
  },

  async getReportEvents(): Promise<ReportEventItem[]> {
    const response = await fetch(`${API_BASE_URL}/events/report`, {
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) {
      throw new Error('Error al obtener el reporte');
    }
    const eventos: BackendReportEvento[] = await response.json();
    return eventos.map((e) => ({
      id: String(e.id),
      name: e.nombre,
      interested: e._count?.interesados ?? 0,
      interestedUsers: e.interesados?.map((i) => i.usuario) ?? [],
    }));
  },

  async markInterested(eventId: string): Promise<{ interesados: number }> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/interested`, {
      method: 'POST',
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al marcar interés');
    }
    return response.json();
  },

  async unmarkInterested(eventId: string): Promise<{ interesados: number }> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/interested`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error al quitar de favoritos');
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
      body: JSON.stringify({ name: name.trim() }),
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
      body: JSON.stringify({ name: name.trim() }),
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

export interface TicketEntryItem {
  id: string
  ticketCategoryId: string
  totalQuantity: number
  availableQuantity: number
  price: number
}

export interface BackendEventoEntrada {
  id: number
  eventoId: number
  categoriaEntradaId: number
  cantidadTotal: number
  cantidadDisponible: number
  precio: number
}

function mapTicketEntry(e: BackendEventoEntrada): TicketEntryItem {
  return {
    id: String(e.id),
    ticketCategoryId: String(e.categoriaEntradaId),
    totalQuantity: e.cantidadTotal,
    availableQuantity: e.cantidadDisponible,
    price: e.precio,
  }
}

export const ticketEntriesApi = {
  async getTicketEntries(eventId: string): Promise<TicketEntryItem[]> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/ticket-entries`)
    if (!response.ok) throw new Error('Error fetching ticket entries for event')
    const data: BackendEventoEntrada[] = await response.json()
    return data.map(mapTicketEntry)
  },

  async saveTicketEntries(
    eventId: string,
    entries: { ticketCategoryId: number; totalQuantity: number; price: number }[],
  ): Promise<TicketEntryItem[]> {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}/ticket-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries }),
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.message || 'Error saving ticket entries')
    }
    const data: BackendEventoEntrada[] = await response.json()
    return data.map(mapTicketEntry)
  },
}

export interface BackendCategoriaEntrada {
  id: number;
  nombre: string;
  descripcion: string | null;
  soldCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketCategoryItem extends CategoryItem {
  soldCount: number;
}

export function mapCategoriaEntradaToFrontend(c: BackendCategoriaEntrada): TicketCategoryItem {
  return { id: String(c.id), name: c.nombre, soldCount: c.soldCount ?? 0 };
}

export const ticketCategoryApi = {
  async getTicketCategories(): Promise<TicketCategoryItem[]> {
    const response = await fetch(`${API_BASE_URL}/ticket-categories`);
    if (!response.ok) throw new Error('Error fetching ticket categories');
    const data: BackendCategoriaEntrada[] = await response.json();
    return data.map(mapCategoriaEntradaToFrontend);
  },

  async createTicketCategory(name: string): Promise<CategoryItem> {
    const response = await fetch(`${API_BASE_URL}/ticket-categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error creating ticket category');
    }
    const data: BackendCategoriaEntrada = await response.json();
    return mapCategoriaEntradaToFrontend(data);
  },

  async updateTicketCategory(id: string, name: string): Promise<CategoryItem> {
    const response = await fetch(`${API_BASE_URL}/ticket-categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error updating ticket category');
    }
    const data: BackendCategoriaEntrada = await response.json();
    return mapCategoriaEntradaToFrontend(data);
  },

  async deleteTicketCategory(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/ticket-categories/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error deleting ticket category');
    }
  },
};

export interface BackendTicketDetail {
  id: number;
  ventaId: number;
  eventoEntradaId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  eventoEntrada: {
    id: number;
    categoriaEntradaId: number;
    precio: number;
    categoriaEntrada: { id: number; nombre: string };
    evento: { id: number; nombre: string };
  };
}

export interface BackendTicketPurchase {
  id: number;
  usuarioId: number;
  codigoQR: string;
  total: number;
  fechaVenta: string;
  createdAt: string;
  detalles: BackendTicketDetail[];
}

export interface TicketPurchaseItem {
  eventEntryId: number;
  quantity: number;
}

export const ticketApi = {
  async getTotalEarnings(): Promise<number> {
    const response = await fetch(`${API_BASE_URL}/tickets/total-earnings`, {
      headers: { ...getAuthHeaders() },
    })
    if (!response.ok) throw new Error('Error fetching total earnings')
    const data: { total: number } = await response.json()
    return data.total
  },

  async purchase(items: TicketPurchaseItem[]): Promise<BackendTicketPurchase> {
    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ items }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error processing purchase');
    }
    return response.json();
  },

  async getMyTickets(): Promise<BackendTicketPurchase[]> {
    const response = await fetch(`${API_BASE_URL}/tickets/my`, {
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error fetching your purchases');
    }
    return response.json();
  },

  async downloadPdf(ticketId: number): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/pdf`, {
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Error downloading PDF');
    }
    return response.blob();
  },
};

export interface AuthUser {
  id: number;
  name: string;
  email: string | null;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export const authApi = {
  async register(data: {
    firstName: string;
    lastName?: string;
    email?: string;
    username: string;
    password: string;
  }): Promise<LoginResponse> {
    const body: Record<string, unknown> = {
      firstName: data.firstName.trim(),
      lastName: data.lastName?.trim() || undefined,
      username: data.username.trim(),
      password: data.password,
    };
    if (data.email?.trim()) body.email = data.email.trim();
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Registration failed');
    }
    return response.json();
  },

  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Invalid username or password');
    }
    return response.json();
  },
};

export interface AdminUserItem {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  username: string;
  createdAt: string;
}

interface BackendAdminUser {
  id: number;
  nombre: string;
  apellido: string | null;
  correo: string | null;
  username: string;
  createdAt: string;
}

function mapAdminUser(u: BackendAdminUser): AdminUserItem {
  return {
    id: String(u.id),
    firstName: u.nombre,
    lastName: u.apellido,
    email: u.correo,
    username: u.username,
    createdAt: u.createdAt,
  };
}

export const userApi = {
  async getAdminUsers(): Promise<AdminUserItem[]> {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: { ...getAuthHeaders() },
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(
        typeof err.message === 'string' ? err.message : 'Error fetching users'
      );
    }
    const data: BackendAdminUser[] = await response.json();
    return data.map(mapAdminUser);
  },
};