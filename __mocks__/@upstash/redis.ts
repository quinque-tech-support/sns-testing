export class Redis {
  constructor() {}
  
  static fromEnv() {
    return new Redis()
  }

  get = jest.fn()
  set = jest.fn()
  del = jest.fn()
  hget = jest.fn()
  hset = jest.fn()
  zadd = jest.fn()
  zrange = jest.fn()
  zrem = jest.fn()
  sadd = jest.fn()
  smembers = jest.fn()
  srem = jest.fn()
}
