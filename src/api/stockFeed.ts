import { mockProductStore } from '../mocks/seedProducts';

export interface StockUpdateEvent {
  productId: string;
  stock: number;
  timestamp: number;
}

export type FeedConnectionStatus = 'connecting' | 'connected' | 'disconnected';

type StockListener = (event: StockUpdateEvent) => void;
type StatusListener = (status: FeedConnectionStatus) => void;

/**
 * Simulated WebSocket stock stream with automatic reconnection and clean teardown.
 * In production, replace internal timer with `new WebSocket(WS_URL)` keeping the exact same interface.
 */
export class StockFeedClient {
  private stockListeners = new Set<StockListener>();
  private statusListeners = new Set<StatusListener>();
  private streamTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private status: FeedConnectionStatus = 'disconnected';
  private closed = false;

  public connect(): void {
    this.closed = false;
    this.updateStatus('connecting');

    this.reconnectTimer = window.setTimeout(() => {
      if (this.closed) return;
      this.updateStatus('connected');
      this.startStreaming();
    }, 250);
  }

  public simulateDisconnect(): void {
    if (this.streamTimer !== null) {
      window.clearInterval(this.streamTimer);
      this.streamTimer = null;
    }
    this.updateStatus('disconnected');

    if (!this.closed) {
      this.reconnectTimer = window.setTimeout(() => {
        if (!this.closed) {
          this.connect();
        }
      }, 1500);
    }
  }

  public disconnect(): void {
    this.closed = true;
    if (this.streamTimer !== null) {
      window.clearInterval(this.streamTimer);
      this.streamTimer = null;
    }
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.updateStatus('disconnected');
  }

  public onStockUpdate(listener: StockListener): () => void {
    this.stockListeners.add(listener);
    return () => {
      this.stockListeners.delete(listener);
    };
  }

  public onStatusChange(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private updateStatus(next: FeedConnectionStatus): void {
    this.status = next;
    this.statusListeners.forEach((listener) => listener(next));
  }

  private startStreaming(): void {
    if (this.streamTimer !== null) {
      window.clearInterval(this.streamTimer);
    }

    this.streamTimer = window.setInterval(() => {
      // Pick one of the first 24 visible products so users see live stock changes immediately
      const index = Math.floor(Math.random() * 24);
      const target = mockProductStore[index];
      if (!target) return;

      const delta = Math.random() > 0.45 ? -1 : 1;
      const nextStock = Math.max(0, Math.min(50, target.stock + delta));
      target.stock = nextStock;

      const event: StockUpdateEvent = {
        productId: target.id,
        stock: nextStock,
        timestamp: Date.now(),
      };
      this.stockListeners.forEach((listener) => listener(event));
    }, 4000);
  }
}