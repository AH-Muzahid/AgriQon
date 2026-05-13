import { EventEmitter } from 'events';
import { DomainEvents } from './domain-events';

// Singleton Event Bus
class GlobalEventBus extends EventEmitter {}

export const eventBus = new GlobalEventBus();

// Optionally increase max listeners if many modules subscribe
eventBus.setMaxListeners(20);

// Legacy alias for compatibility during migration
/** @deprecated Use DomainEvents instead */
export const EventName = DomainEvents;
export type EventName = typeof DomainEvents[keyof typeof DomainEvents];
