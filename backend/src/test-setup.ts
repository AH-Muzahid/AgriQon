import EventEmitter from 'events';

class MockRedis extends EventEmitter {
  constructor() {
    super();
    process.nextTick(() => {
      this.emit('connect');
      this.emit('ready');
    });
  }
  options = {};
  status = 'ready';
  get = jest.fn().mockResolvedValue(null);
  set = jest.fn().mockResolvedValue('OK');
  del = jest.fn().mockResolvedValue(0);
  quit = jest.fn().mockResolvedValue('OK');
  disconnect = jest.fn();
  defineCommand = jest.fn();
  info = jest.fn().mockResolvedValue('redis_version:7.0.0');
  multi = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([]),
  });
}

(MockRedis as any).default = MockRedis;

jest.mock('ioredis', () => {
  return MockRedis;
});
