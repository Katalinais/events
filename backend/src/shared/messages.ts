export const AUTH_MESSAGES = {
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  USERNAME_ALREADY_TAKEN: 'This username is already taken',
  INVALID_CREDENTIALS: 'Invalid username or password',
  ADMINS_ONLY: 'Administrators only',
};

export const CATEGORY_MESSAGES = {
  NAME_ALREADY_EXISTS: 'A category with this name already exists',
  NOT_FOUND: (id: number) => `Category with ID ${id} not found`,
  HAS_ASSOCIATED_EVENTS: 'Cannot delete: this category has associated events',
};

export const TICKET_CATEGORY_MESSAGES = {
  NAME_ALREADY_EXISTS: 'A ticket category with that name already exists',
  NOT_FOUND: (id: number) => `Ticket category with ID ${id} not found`,
  CANNOT_DELETE_SOLD: (count: number) =>
    `Cannot delete this category because ${count} ${count === 1 ? 'ticket has' : 'tickets have'} already been sold`,
};

export const EVENT_MESSAGES = {
  CATEGORY_NOT_FOUND: (id: number) => `Category with ID ${id} not found`,
  NOT_FOUND: (id: number) => `Event with ID ${id} not found`,
  CANNOT_DELETE_SOLD: (count: number) =>
    `Cannot delete this event because ${count} ${count === 1 ? 'ticket has' : 'tickets have'} already been sold`,
  USER_NOT_IDENTIFIED: 'User not identified',
  TICKET_CATEGORY_NOT_FOUND: (id: number) => `Ticket category with ID ${id} not found`,
  CANNOT_REDUCE_BELOW_SOLD: (quantity: number, name: string, sold: number) =>
    `Cannot set ${quantity} tickets for "${name}" as ${sold} have already been sold`,
  LOGIN_REQUIRED_FAVORITES: 'You must be logged in to view favorites',
  LOGIN_REQUIRED_INTEREST: 'You must be logged in to mark interest',
  LOGIN_REQUIRED_UNINTEREST: 'You must be logged in to remove from favorites',
};

export const TICKET_MESSAGES = {
  ENTRY_NOT_FOUND: (id: number) => `Ticket entry with ID ${id} not found`,
  EVENT_ALREADY_ENDED: 'Cannot purchase tickets for an event that has already ended',
  NOT_ENOUGH_AVAILABLE: (id: number, available: number) =>
    `Not enough tickets available for entry ID ${id}. Available: ${available}`,
  PURCHASE_NOT_FOUND: (id: number) => `Purchase with ID ${id} not found`,
  LOGIN_REQUIRED_PURCHASE: 'You must be logged in to purchase tickets',
  LOGIN_REQUIRED_MY_TICKETS: 'You must be logged in to view your purchases',
  LOGIN_REQUIRED_PDF: 'You must be logged in to download the PDF',
};

export const UPLOAD_MESSAGES = {
  INVALID_FILE_TYPE: 'Only image files are allowed (JPEG, PNG, GIF, WebP)',
  NO_FILE_PROVIDED: 'No image file was provided',
};
