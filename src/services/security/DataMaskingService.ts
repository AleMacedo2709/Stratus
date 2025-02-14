import { LoggingService } from '../logging/LoggingService';

export class DataMaskingService {
  private static readonly DEFAULT_MASK = '*';
  private static readonly EMAIL_PATTERN = /^(.{2})(.*)(@.*)$/;
  private static readonly PHONE_PATTERN = /^(\d{2})(\d+)(\d{2})$/;
  private static readonly CPF_PATTERN = /^(\d{3})(\d{5})(\d{3})$/;

  static maskEmail(email: string): string {
    try {
      return email.replace(this.EMAIL_PATTERN, (_, start, middle, end) => 
        start + this.DEFAULT_MASK.repeat(middle.length) + end
      );
    } catch (error) {
      LoggingService.error('Email masking failed', error as Error);
      return this.DEFAULT_MASK.repeat(email.length);
    }
  }

  static maskPhone(phone: string): string {
    try {
      const cleaned = phone.replace(/\D/g, '');
      return cleaned.replace(this.PHONE_PATTERN, (_, ddd, middle, end) =>
        `(${ddd}) ${this.DEFAULT_MASK.repeat(middle.length)}-${end}`
      );
    } catch (error) {
      LoggingService.error('Phone masking failed', error as Error);
      return this.DEFAULT_MASK.repeat(phone.length);
    }
  }

  static maskCPF(cpf: string): string {
    try {
      const cleaned = cpf.replace(/\D/g, '');
      return cleaned.replace(this.CPF_PATTERN, (_, start, middle, end) =>
        `${start}.${this.DEFAULT_MASK.repeat(5)}.${end}`
      );
    } catch (error) {
      LoggingService.error('CPF masking failed', error as Error);
      return this.DEFAULT_MASK.repeat(cpf.length);
    }
  }

  static maskCreditCard(cardNumber: string): string {
    try {
      const last4 = cardNumber.slice(-4);
      return `${this.DEFAULT_MASK.repeat(cardNumber.length - 4)}${last4}`;
    } catch (error) {
      LoggingService.error('Credit card masking failed', error as Error);
      return this.DEFAULT_MASK.repeat(cardNumber.length);
    }
  }

  static maskAddress(address: string): string {
    try {
      const parts = address.split(',');
      if (parts.length > 1) {
        const streetNumber = parts[0].trim().split(' ').pop();
        return `${this.DEFAULT_MASK.repeat(8)} ${streetNumber}, ${parts.slice(1).join(',').trim()}`;
      }
      return this.DEFAULT_MASK.repeat(10);
    } catch (error) {
      LoggingService.error('Address masking failed', error as Error);
      return this.DEFAULT_MASK.repeat(address.length);
    }
  }

  static maskCustom(text: string, visibleStart: number = 0, visibleEnd: number = 0): string {
    try {
      const start = text.slice(0, visibleStart);
      const end = text.slice(-visibleEnd);
      const middle = this.DEFAULT_MASK.repeat(text.length - visibleStart - visibleEnd);
      return start + middle + end;
    } catch (error) {
      LoggingService.error('Custom masking failed', error as Error);
      return this.DEFAULT_MASK.repeat(text.length);
    }
  }
} 