import bcrypt from 'bcryptjs';

export interface StoredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  image?: string;
  createdAt: string;
}

// Simple in-memory storage for demo purposes
// In production, you'd use a real database
let inMemoryUsers: StoredUser[] = [];
let userIdCounter = 1;
let initialized = false;

export class UserStorageService {
  private static USERS_KEY = 'app-users';
  private static USER_ID_COUNTER_KEY = 'app-user-id-counter';

  // Initialize with demo user if no users exist
  static initializeUsers(): void {
    if (initialized) return;
    
    // For server-side (API routes), use in-memory storage
    if (typeof window === 'undefined') {
      if (inMemoryUsers.length === 0) {
        const demoUser: StoredUser = {
          id: '1',
          email: 'demo@example.com',
          password: bcrypt.hashSync('demo123', 12),
          name: 'Demo User',
          image: 'https://via.placeholder.com/150',
          createdAt: new Date().toISOString(),
        };
        inMemoryUsers = [demoUser];
        userIdCounter = 2;
      }
      initialized = true;
      return;
    }
    
    // For client-side, use localStorage
    const existingUsers = this.getAllUsers();
    if (existingUsers.length === 0) {
      const demoUser: StoredUser = {
        id: '1',
        email: 'demo@example.com',
        password: bcrypt.hashSync('demo123', 12),
        name: 'Demo User',
        image: 'https://via.placeholder.com/150',
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem(this.USERS_KEY, JSON.stringify([demoUser]));
      localStorage.setItem(this.USER_ID_COUNTER_KEY, '2');
    }
    initialized = true;
  }

  static getAllUsers(): StoredUser[] {
    // Server-side: use in-memory storage
    if (typeof window === 'undefined') {
      return inMemoryUsers;
    }
    
    // Client-side: use localStorage
    try {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error reading users from localStorage:', error);
      return [];
    }
  }

  static getUserByEmail(email: string): StoredUser | null {
    const users = this.getAllUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  }

  static getUserById(id: string): StoredUser | null {
    const users = this.getAllUsers();
    return users.find(user => user.id === id) || null;
  }

  static async createUser(userData: {
    email: string;
    password: string;
    name: string;
    image?: string;
  }): Promise<{ success: boolean; user?: StoredUser; error?: string }> {
    try {
      // Check if user already exists
      const existingUser = this.getUserByEmail(userData.email);
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Generate new user ID
      const newUserId = typeof window === 'undefined' 
        ? userIdCounter.toString() 
        : (parseInt(localStorage.getItem(this.USER_ID_COUNTER_KEY) || '1')).toString();

      // Create new user
      const newUser: StoredUser = {
        id: newUserId,
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        name: userData.name,
        image: userData.image,
        createdAt: new Date().toISOString(),
      };

      // Server-side: add to in-memory storage
      if (typeof window === 'undefined') {
        inMemoryUsers.push(newUser);
        userIdCounter++;
      } else {
        // Client-side: add to localStorage
        const users = this.getAllUsers();
        users.push(newUser);
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
        localStorage.setItem(this.USER_ID_COUNTER_KEY, (parseInt(newUserId) + 1).toString());
      }

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: 'Failed to create user' };
    }
  }

  static async validateCredentials(email: string, password: string): Promise<StoredUser | null> {
    try {
      const user = this.getUserByEmail(email);
      if (!user) {
        return null;
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      return isValidPassword ? user : null;
    } catch (error) {
      console.error('Error validating credentials:', error);
      return null;
    }
  }

  static updateUser(id: string, updates: Partial<Omit<StoredUser, 'id' | 'createdAt'>>): boolean {
    try {
      // Server-side: update in-memory storage
      if (typeof window === 'undefined') {
        const userIndex = inMemoryUsers.findIndex(user => user.id === id);
        if (userIndex === -1) return false;
        inMemoryUsers[userIndex] = { ...inMemoryUsers[userIndex], ...updates };
        return true;
      }

      // Client-side: update localStorage
      const users = this.getAllUsers();
      const userIndex = users.findIndex(user => user.id === id);
      
      if (userIndex === -1) {
        return false;
      }

      users[userIndex] = { ...users[userIndex], ...updates };
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  static deleteUser(id: string): boolean {
    try {
      // Server-side: delete from in-memory storage
      if (typeof window === 'undefined') {
        const initialLength = inMemoryUsers.length;
        inMemoryUsers = inMemoryUsers.filter(user => user.id !== id);
        return inMemoryUsers.length < initialLength;
      }

      // Client-side: delete from localStorage
      const users = this.getAllUsers();
      const filteredUsers = users.filter(user => user.id !== id);
      
      if (filteredUsers.length === users.length) {
        return false; // User not found
      }

      localStorage.setItem(this.USERS_KEY, JSON.stringify(filteredUsers));
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Debug method to view all users (remove in production)
  static debugListUsers(): void {
    if (process.env.NODE_ENV === 'development') {
      const users = this.getAllUsers();
      console.log('Stored users:', users.map(u => ({ id: u.id, email: u.email, name: u.name })));
    }
  }

  // Sync between server and client storage (for demo purposes)
  static syncToLocalStorage(): void {
    if (typeof window !== 'undefined' && inMemoryUsers.length > 0) {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(inMemoryUsers));
      localStorage.setItem(this.USER_ID_COUNTER_KEY, userIdCounter.toString());
    }
  }
}
