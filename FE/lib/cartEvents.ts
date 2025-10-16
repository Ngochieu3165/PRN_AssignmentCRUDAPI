// Cart event management utility
export class CartEventManager {
  private static instance: CartEventManager;
  
  static getInstance(): CartEventManager {
    if (!CartEventManager.instance) {
      CartEventManager.instance = new CartEventManager();
    }
    return CartEventManager.instance;
  }

  // Broadcast cart update event
  broadcastCartUpdate(data: { action: string; productId?: string; cart?: any }) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: data }));
    }
  }

  // Broadcast product change event
  broadcastProductChange(data: { action: string; productId: string }) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('productChanged', { detail: data }));
    }
  }

  // Listen for cart updates
  onCartUpdate(callback: (data: any) => void) {
    if (typeof window !== 'undefined') {
      const handler = (event: CustomEvent) => callback(event.detail);
      window.addEventListener('cartUpdated', handler as EventListener);
      return () => window.removeEventListener('cartUpdated', handler as EventListener);
    }
    return () => {};
  }

  // Listen for product changes
  onProductChange(callback: (data: any) => void) {
    if (typeof window !== 'undefined') {
      const handler = (event: CustomEvent) => callback(event.detail);
      window.addEventListener('productChanged', handler as EventListener);
      return () => window.removeEventListener('productChanged', handler as EventListener);
    }
    return () => {};
  }
}

export const cartEvents = CartEventManager.getInstance();