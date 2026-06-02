import { Injectable, BadRequestException, HttpException, NotFoundException } from '@nestjs/common';
import { TICKET_MESSAGES } from '../shared/messages';
import { generateQRBuffer } from '../utils/qr.util';
import { EstadoEvento } from '@prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketRepository } from './ticket.repository';
import { generateTicketPdf } from '../utils/pdf.util';
import { CacheService } from '../shared/cache.service';
import { CACHE_KEYS } from '../shared/constants';
import { PaymentGatewayService } from '../payment/payment-gateway.service';
import { PurchaseProducer } from '../broker/purchase.producer';
import { SalesGateway } from '../sales/sales.gateway';
import { AppLogger } from '../logger/app-logger.service';

function extractMessage(error: unknown): string {
  if (error instanceof HttpException) {
    const response = error.getResponse();
    if (typeof response === 'string') return response;
    const r = response as Record<string, unknown>;
    const msg = r['message'];
    if (Array.isArray(msg)) return String(msg[0]);
    return String(msg ?? 'Error desconocido');
  }
  return error instanceof Error ? error.message : 'Error desconocido';
}

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly cacheService: CacheService,
    private readonly paymentGateway: PaymentGatewayService,
    private readonly purchaseProducer: PurchaseProducer,
    private readonly salesGateway: SalesGateway,
    private readonly logger: AppLogger,
  ) {}

  async create(userId: number, dto: CreateTicketDto) {
    const purchaseItems: {
      eventEntryId: number;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[] = [];

    this.logger.info('Purchase started', { context: 'TicketService', userId, itemCount: dto.items.length });
    this.salesGateway.emitToUser(userId, 'purchase:stage', { stage: 'validating' });

    for (const item of dto.items) {
      const entry = await this.ticketRepository.findTicketEntryById(item.eventEntryId);

      if (!entry) {
        throw new BadRequestException(TICKET_MESSAGES.ENTRY_NOT_FOUND(item.eventEntryId));
      }

      if (entry.evento.estado !== EstadoEvento.ACTIVO) {
        throw new BadRequestException(TICKET_MESSAGES.EVENT_ALREADY_ENDED);
      }

      if (entry.cantidadDisponible < item.quantity) {
        throw new BadRequestException(
          TICKET_MESSAGES.NOT_ENOUGH_AVAILABLE(item.eventEntryId, entry.cantidadDisponible),
        );
      }

      const subtotal = entry.precio * item.quantity;
      purchaseItems.push({
        eventEntryId: item.eventEntryId,
        quantity: item.quantity,
        unitPrice: entry.precio,
        subtotal,
      });
    }

    const total = purchaseItems.reduce((sum, i) => sum + i.subtotal, 0);

    this.salesGateway.emitToUser(userId, 'purchase:stage', { stage: 'gateway' });

    try {
      await this.paymentGateway.charge({ ...dto.payment, amount: total });
    } catch (error) {
      const msg = extractMessage(error);
      this.logger.error('Payment failed', undefined, 'TicketService');
      this.logger.info('Payment error detail', { context: 'TicketService', userId, reason: msg });
      await this.purchaseProducer.publishPurchaseEvent({ type: 'error', text: msg, userId });
      throw error;
    }

    this.salesGateway.emitToUser(userId, 'purchase:stage', { stage: 'creating' });

    for (const item of purchaseItems) {
      await this.ticketRepository.decrementAvailable(item.eventEntryId, item.quantity);
    }

    const result = await this.ticketRepository.createTicketWithDetails(
      userId,
      total,
      purchaseItems,
    );
    this.cacheService.invalidate(CACHE_KEYS.TOP_SELLING_EVENTS);

    this.logger.info('Purchase completed', { context: 'TicketService', userId, ticketId: result.id, total });
    await this.purchaseProducer.publishPurchaseEvent({
      type: 'success',
      text: `Compra exitosa por $${total}`,
      userId,
    });

    return result;
  }

  getTotalEarnings(): Promise<number> {
    return this.ticketRepository.getTotalEarnings();
  }

  findByUser(userId: number) {
    return this.ticketRepository.findTicketsByUser(userId);
  }

  findPurchasedEventsByUser(userId: number) {
    return this.ticketRepository.findPurchasedEventsByUser(userId);
  }

  async generateEventPdf(userId: number, eventId: number): Promise<Buffer> {
    const ventas = await this.ticketRepository.findPurchasesByUserAndEvent(userId, eventId);
    if (ventas.length === 0) {
      throw new NotFoundException(TICKET_MESSAGES.NO_PURCHASES_FOR_EVENT(eventId));
    }

    const qrContent = JSON.stringify({ qrs: ventas.map((v) => v.codigoQR) });
    const details = ventas.flatMap((v) =>
      v.detalles.map((d) => ({
        categoryName: d.eventoEntrada.categoriaEntrada.nombre,
        eventName: d.eventoEntrada.evento.nombre,
        quantity: d.cantidad,
        unitPrice: d.precioUnitario,
        subtotal: d.subtotal,
      })),
    );
    const total = ventas.reduce((sum, v) => sum + v.total, 0);

    return generateTicketPdf({
      qrCode: qrContent,
      saleDate: ventas[0].fechaVenta,
      total,
      details,
    });
  }

  async generateEventQR(userId: number, eventId: number): Promise<Buffer> {
    const qrs = await this.ticketRepository.findPurchaseQRsByUserAndEvent(userId, eventId);
    if (qrs.length === 0) {
      throw new NotFoundException(TICKET_MESSAGES.NO_PURCHASES_FOR_EVENT(eventId));
    }
    const content = JSON.stringify({ qrs });
    return generateQRBuffer(content);
  }

  async generatePdf(ticketId: number, userId: number): Promise<Buffer> {
    const ticket = await this.ticketRepository.findTicketById(ticketId);

    if (!ticket) {
      throw new NotFoundException(TICKET_MESSAGES.PURCHASE_NOT_FOUND(ticketId));
    }

    if (ticket.usuarioId !== userId) {
      throw new NotFoundException(TICKET_MESSAGES.PURCHASE_NOT_FOUND(ticketId));
    }

    return generateTicketPdf({
      qrCode: ticket.codigoQR,
      saleDate: ticket.fechaVenta,
      total: ticket.total,
      details: ticket.detalles.map((d) => ({
        categoryName: d.eventoEntrada.categoriaEntrada.nombre,
        eventName: d.eventoEntrada.evento.nombre,
        quantity: d.cantidad,
        unitPrice: d.precioUnitario,
        subtotal: d.subtotal,
      })),
    });
  }
}
