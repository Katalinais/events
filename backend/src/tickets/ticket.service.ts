import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EstadoEvento } from '@prisma/client';
import { TICKET_MESSAGES } from '../shared/messages';
import { generateQRBuffer } from '../utils/qr.util';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { TicketRepository } from './ticket.repository';
import { generateTicketPdf } from '../utils/pdf.util';
import { KafkaProducerService } from '../kafka/kafka.producer.service';

@Injectable()
export class TicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly kafkaProducer: KafkaProducerService,
    private readonly config: ConfigService,
  ) {}

  async create(userId: number, dto: CreateTicketDto): Promise<{ ventaId: number }> {
    // 1. Validar entradas y calcular totales (sin decrementar stock aún)
    const purchaseItems: {
      eventEntryId: number;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }[] = [];

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

      purchaseItems.push({
        eventEntryId: item.eventEntryId,
        quantity: item.quantity,
        unitPrice: entry.precio,
        subtotal: entry.precio * item.quantity,
      });
    }

    const total = purchaseItems.reduce((sum, i) => sum + i.subtotal, 0);

    // 2. Crear venta en estado PENDIENTE
    const venta = await this.ticketRepository.createPendingVenta(userId);

    // 3. Publicar a Kafka para que el worker procese el pago
    try {
      await this.kafkaProducer.publishPurchaseRequest({
        action: 'pay',
        ventaId: venta.id,
        userId: String(userId),
        ticketId: String(venta.id),
        empresa_id: this.config.get<string>('EMPRESA_ID', 'empresa-004'),
        amount: total,
        card_number: dto.payment.card_number,
        expiry_month: dto.payment.expiry_month,
        expiry_year: dto.payment.expiry_year,
        cvv: dto.payment.cvv,
        network: dto.payment.network,
        items: purchaseItems,
      });
    } catch {
      // Kafka caído → venta queda PENDIENTE en DB
    }

    return { ventaId: venta.id };
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
