import { ethErrors } from 'eth-rpc-errors';

class DedupePromise {
  // A list of keys for which concurrent tasks are not allowed
  private _blackList: string[];
  // A record to keep track of the number of tasks currently running for each key
  private _tasks: Record<string, number> = {};

  constructor(blackList: string[]) {
    this._blackList = blackList;
  }

  // Method to handle the execution of deferred tasks
  async call(key: string, defer: () => Promise<any>) {
    // Check if the key is blacklisted and if there is already a task running with the same key
    if (this._blackList.includes(key) && this._tasks[key]) {
      // Reject the new task if conditions are met
      throw ethErrors.rpc.transactionRejected('There is a pending request, please request after it is resolved.');
    }

    // Increment the task count for the key or initialize it
    this._tasks[key] = (this._tasks[key] || 0) + 1;

    try {
      // Execute the deferred task
      const result = await defer();
      return result;
    } finally {
      // Decrement the task count for the key after completion
      this._tasks[key]--;
      // Remove the key from the record if there are no more tasks associated with it
      if (!this._tasks[key]) {
        delete this._tasks[key];
      }
    }
  }
}

export default DedupePromise;
