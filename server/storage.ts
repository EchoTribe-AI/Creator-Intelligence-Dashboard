import { type User, type InsertUser, type Favorite, type InsertFavorite } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Favorites
  getFavorites(creatorId: string): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private favorites: Map<string, Favorite>;

  constructor() {
    this.users = new Map();
    this.favorites = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getFavorites(creatorId: string): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(f => f.creatorId === creatorId);
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = randomUUID();
    const favorite: Favorite = { 
      ...insertFavorite, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async deleteFavorite(id: string): Promise<void> {
    this.favorites.delete(id);
  }
}

export const storage = new MemStorage();
