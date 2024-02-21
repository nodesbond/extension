import { ethErrors } from 'eth-rpc-errors';

class DedupePromise {
  private _blackList: Set<string>;
  private _tasks: Record<string, number> = {};

  constructor(blackList: string[]) {
    this._blackList = new Set(blackList);
  }

  async call(key: string, defer: () => Promise<any>) {
    if (this._blackList.has(key) && this._tasks[key]) {
      throw ethErrors.rpc.transactionRejected(`There is a pending request with key '${key}', please request after it is resolved.`);
    }

    if (!this._tasks[key]) {
      this._tasks[key] = 0;
    }
    this._tasks[key]++;

    try {
      return await defer();
    } finally {
      this._tasks[key]--;
      if (!this._tasks[key]) {
        delete this._tasks[key];
      }
    }
  }
}

export default DedupePromise;
