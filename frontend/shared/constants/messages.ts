// ── Auth ──────────────────────────────────────────────────────────────────────
export const AUTH_MESSAGES = {
  // Validación de formularios
  NAME_REQUIRED: 'El nombre es obligatorio',
  USERNAME_REQUIRED: 'El usuario es obligatorio',
  PASSWORD_MIN_LENGTH: 'La contraseña debe tener al menos 6 caracteres',
  CREDENTIALS_REQUIRED: 'Ingresa usuario y contraseña',

  // Toast UI
  LOGIN_SUCCESS: 'Sesión iniciada',
  LOGIN_ERROR: 'Error al iniciar sesión',
  REGISTER_SUCCESS: 'Cuenta creada correctamente',
  REGISTER_ERROR: 'Error al registrarse',
  NO_ADMIN_PERMISSION: 'No tienes permiso para acceder al panel de administración',

  // API client
  API_LOGIN_FAILED: 'Invalid username or password',
  API_REGISTER_FAILED: 'Registration failed',
  API_FETCH_USERS_FAILED: 'Error fetching users',
};

// ── Eventos ───────────────────────────────────────────────────────────────────
export const EVENT_MESSAGES = {
  // Validación de formularios
  NAME_REQUIRED: 'El nombre es obligatorio',
  ENTRIES_REQUIRED: 'Debes agregar al menos una boleta',

  // Toast UI
  CREATE_SUCCESS: 'Evento creado correctamente',
  CREATE_ERROR: 'Error al crear el evento',
  UPDATE_SUCCESS: 'Evento actualizado correctamente',
  UPDATE_ERROR: 'Error al actualizar el evento',
  DELETE_SUCCESS: 'Evento eliminado correctamente',
  DELETE_ERROR: 'Error al eliminar el evento',
  MARK_INTEREST_SUCCESS: 'Has marcado tu interés en este evento',
  MARK_INTEREST_ERROR: 'Error al marcar interés',
  UNMARK_INTEREST_SUCCESS: 'Has quitado este evento de tus favoritos',
  UNMARK_INTEREST_ERROR: 'Error al quitar de favoritos',

  // API client
  API_FETCH_FAILED: 'Error al obtener eventos',
  API_FETCH_ONE_FAILED: 'Error al obtener el evento',
  API_CREATE_FAILED: 'Error al crear el evento',
  API_UPDATE_FAILED: 'Error al actualizar el evento',
  API_DELETE_FAILED: 'Error al eliminar el evento',
  API_FETCH_UPCOMING_FAILED: 'Error al obtener próximos eventos',
  API_FETCH_FAVORITES_FAILED: 'Error al obtener tus favoritos',
  API_FETCH_SALES_SUMMARY_FAILED: 'Error fetching sales summary',
  API_FETCH_SALES_REPORT_FAILED: 'Error fetching sales report',
  API_FETCH_TOP_SELLING_FAILED: 'Error al obtener top eventos',
  API_FETCH_PAST_FAILED: 'Error al obtener eventos pasados',
  API_FETCH_ADMIN_FAILED: 'Error al obtener eventos',
  API_FETCH_REPORT_FAILED: 'Error al obtener el reporte',
  API_MARK_INTEREST_FAILED: 'Error al marcar interés',
  API_UNMARK_INTEREST_FAILED: 'Error al quitar de favoritos',
  API_UPLOAD_IMAGE_FAILED: 'Error al subir la imagen',
};

// ── Categorías ────────────────────────────────────────────────────────────────
export const CATEGORY_MESSAGES = {
  // Toast UI
  CREATE_SUCCESS: 'Categoría creada correctamente',
  CREATE_ERROR: 'Error al crear la categoría',
  UPDATE_SUCCESS: 'Categoría actualizada correctamente',
  UPDATE_ERROR: 'Error al actualizar la categoría',
  DELETE_SUCCESS: 'Categoría eliminada correctamente',
  DELETE_ERROR: 'Error al eliminar la categoría',

  // API client
  API_FETCH_FAILED: 'Error al obtener categorías',
  API_CREATE_FAILED: 'Error al crear la categoría',
  API_UPDATE_FAILED: 'Error al actualizar la categoría',
  API_DELETE_FAILED: 'Error al eliminar la categoría',
};

// ── Categorías de boletas ─────────────────────────────────────────────────────
export const TICKET_CATEGORY_MESSAGES = {
  // Toast UI
  CREATE_SUCCESS: 'Categoría de boleta creada correctamente',
  CREATE_ERROR: 'Error al crear la categoría de boleta',
  UPDATE_SUCCESS: 'Categoría de boleta actualizada correctamente',
  UPDATE_ERROR: 'Error al actualizar la categoría de boleta',
  DELETE_SUCCESS: 'Categoría de boleta eliminada correctamente',
  DELETE_ERROR: 'Error al eliminar la categoría de boleta',

  // API client
  API_FETCH_FAILED: 'Error fetching ticket categories',
  API_CREATE_FAILED: 'Error creating ticket category',
  API_UPDATE_FAILED: 'Error updating ticket category',
  API_DELETE_FAILED: 'Error deleting ticket category',
};

// ── Compras / boletas ─────────────────────────────────────────────────────────
export const TICKET_MESSAGES = {
  // Validación formulario de pago
  BILLING_NAME_REQUIRED: 'Requerido',
  BILLING_CARD_LENGTH: '16 dígitos requeridos',
  BILLING_EXPIRY_FORMAT: 'Formato MM/AA',
  BILLING_CVV_REQUIRED: 'Requerido',

  // Toast UI
  PURCHASE_SUCCESS: '¡Compra realizada con éxito!',
  PURCHASE_ERROR: 'Error processing purchase',

  // API client
  API_PURCHASE_FAILED: 'Error processing purchase',
  API_FETCH_MY_TICKETS_FAILED: 'Error fetching your purchases',
  API_DOWNLOAD_PDF_FAILED: 'Error downloading PDF',
  API_FETCH_TOTAL_EARNINGS_FAILED: 'Error fetching total earnings',
  API_FETCH_ENTRIES_FAILED: 'Error fetching ticket entries for event',
  API_SAVE_ENTRIES_FAILED: 'Error saving ticket entries',
};
