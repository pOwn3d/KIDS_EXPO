/**
 * Service d'événements simple pour React Native
 * Remplace EventEmitter qui n'est pas disponible dans React Native
 */

type EventHandler = (...args: any[]) => void;

class AppEventEmitter {
  private static instance: AppEventEmitter;
  private events: Map<string, Set<EventHandler>> = new Map();

  private constructor() {}

  public static getInstance(): AppEventEmitter {
    if (!AppEventEmitter.instance) {
      AppEventEmitter.instance = new AppEventEmitter();
    }
    return AppEventEmitter.instance;
  }

  private emit(event: string, ...args: any[]) {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  private on(event: string, handler: EventHandler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
  }

  private off(event: string, handler: EventHandler) {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.events.delete(event);
      }
    }
  }

  // Événements spécifiques de l'application
  public emitAuthLogout() {
    this.emit('auth:logout');
  }

  public onAuthLogout(callback: () => void) {
    this.on('auth:logout', callback);
    // Retourner une fonction de nettoyage
    return () => {
      this.off('auth:logout', callback);
    };
  }

  public emitTokenRefreshed(token: string) {
    this.emit('token:refreshed', token);
  }

  public onTokenRefreshed(callback: (token: string) => void) {
    this.on('token:refreshed', callback);
    return () => {
      this.off('token:refreshed', callback);
    };
  }

  public emitPinValidationRequired(action: string) {
    this.emit('pin:validation:required', action);
  }

  public onPinValidationRequired(callback: (action: string) => void) {
    this.on('pin:validation:required', callback);
    return () => {
      this.off('pin:validation:required', callback);
    };
  }

  public emitNotification(type: 'success' | 'error' | 'info' | 'warning', title: string, message?: string) {
    this.emit('notification', { type, title, message });
  }

  public onNotification(callback: (notification: { type: string; title: string; message?: string }) => void) {
    this.on('notification', callback);
    return () => {
      this.off('notification', callback);
    };
  }

  // Méthode pour nettoyer tous les listeners d'un événement
  public removeAllListeners(event?: string) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

// Export de l'instance singleton
export const appEvents = AppEventEmitter.getInstance();
export default appEvents;