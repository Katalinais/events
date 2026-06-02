import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TICKET_MESSAGES } from '../shared/messages';

export interface PaymentPayload {
  card_number: string;
  expiry_month: number;
  expiry_year: number;
  cvv: string;
  amount: number;
  network: string;
}

@Injectable()
export class PaymentGatewayService {
  private readonly gatewayUrl: string;
  private readonly empresaId: string;

  constructor(private readonly config: ConfigService) {
    this.gatewayUrl = config.get<string>(
      'PAYMENT_GATEWAY_URL',
      'http://localhost:4000/verify-card',
    );
    this.empresaId = config.get<string>('EMPRESA_ID', 'empresa-004');
  }

  async charge(payload: PaymentPayload): Promise<void> {
    const body = JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      empresa_id: this.empresaId,
      ...payload,
    });
    let response: Response;
    try {
      response = await fetch(this.gatewayUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
    } catch {
      throw new BadRequestException(TICKET_MESSAGES.PAYMENT_GATEWAY_UNREACHABLE);
    }
    if (!response.ok) {
      const data: { error?: string } = await response.json().catch(() => ({}));
      throw new BadRequestException(data.error ?? TICKET_MESSAGES.PAYMENT_GATEWAY_REJECTED);
    }
  }
}
