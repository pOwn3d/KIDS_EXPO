import AsyncStorage from '@react-native-async-storage/async-storage';

const PARENT_SESSION_KEY = '@parent_session';
const SESSION_DURATION = 15 * 60 * 1000; // 15 minutes en millisecondes
const EXTENSION_DURATION = 15 * 60 * 1000; // Extension de 15 minutes

interface ParentSession {
  isActive: boolean;
  expiresAt: number;
  pin?: string;
}

class ParentSessionService {
  private sessionTimer: NodeJS.Timeout | null = null;
  private onSessionExpired: (() => void) | null = null;

  /**
   * Démarre une nouvelle session parent
   */
  async startSession(pin: string): Promise<void> {
    const expiresAt = Date.now() + SESSION_DURATION;
    const session: ParentSession = {
      isActive: true,
      expiresAt,
      pin,
    };

    await AsyncStorage.setItem(PARENT_SESSION_KEY, JSON.stringify(session));
    this.startSessionTimer(expiresAt);
  }

  /**
   * Vérifie si la session parent est active
   */
  async isSessionActive(): Promise<boolean> {
    try {
      const sessionData = await AsyncStorage.getItem(PARENT_SESSION_KEY);
      if (!sessionData) return false;

      const session: ParentSession = JSON.parse(sessionData);
      
      if (Date.now() > session.expiresAt) {
        await this.endSession();
        return false;
      }

      return session.isActive;
    } catch (error) {
      return false;
    }
  }

  /**
   * Prolonge la session de 15 minutes supplémentaires
   */
  async extendSession(): Promise<void> {
    try {
      const sessionData = await AsyncStorage.getItem(PARENT_SESSION_KEY);
      if (!sessionData) return;

      const session: ParentSession = JSON.parse(sessionData);
      session.expiresAt = Date.now() + EXTENSION_DURATION;

      await AsyncStorage.setItem(PARENT_SESSION_KEY, JSON.stringify(session));
      this.startSessionTimer(session.expiresAt);
    } catch (error) {
    }
  }

  /**
   * Termine la session parent
   */
  async endSession(): Promise<void> {
    await AsyncStorage.removeItem(PARENT_SESSION_KEY);
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    if (this.onSessionExpired) {
      this.onSessionExpired();
    }
  }

  /**
   * Obtient le temps restant de la session en minutes
   */
  async getTimeRemaining(): Promise<number> {
    try {
      const sessionData = await AsyncStorage.getItem(PARENT_SESSION_KEY);
      if (!sessionData) return 0;

      const session: ParentSession = JSON.parse(sessionData);
      const remaining = session.expiresAt - Date.now();
      
      return Math.max(0, Math.floor(remaining / 60000)); // Retourne en minutes
    } catch (error) {
      return 0;
    }
  }

  /**
   * Vérifie le code PIN
   */
  async verifyPin(pin: string): Promise<boolean> {
    // TODO: Vérifier le PIN avec l'API backend
    // Pour l'instant, on accepte le PIN "1234" pour les tests
    return pin === '1234';
  }

  /**
   * Configure le callback appelé quand la session expire
   */
  setOnSessionExpired(callback: (() => void) | null): void {
    this.onSessionExpired = callback;
  }

  /**
   * Démarre le timer de session
   */
  private startSessionTimer(expiresAt: number): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }

    const timeUntilExpiry = expiresAt - Date.now();
    if (timeUntilExpiry > 0) {
      this.sessionTimer = setTimeout(() => {
        this.endSession();
      }, timeUntilExpiry);
    }
  }

  /**
   * Obtient les informations de session
   */
  async getSession(): Promise<ParentSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem(PARENT_SESSION_KEY);
      if (!sessionData) return null;
      return JSON.parse(sessionData);
    } catch (error) {
      return null;
    }
  }
}

export const parentSessionService = new ParentSessionService();
export default parentSessionService;