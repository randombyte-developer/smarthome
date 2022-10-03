import { NotFoundException } from "@nestjs/common";

export class UnknownRecordException extends NotFoundException {
  constructor(name: string, id: string, ofName?: string, ofId?: string) {
    let message = `Unknown ${name} ${id}`;
    if (ofName !== undefined && ofId !== undefined) {
      message = `${message} of ${ofName} ${ofId}`;
    }
    message = `${message}!`;
    super(message);
  }
}
