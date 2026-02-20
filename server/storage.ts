import { type User, type InsertUser, type Favorite, type InsertFavorite } from "@shared/schema";
import { randomUUID } from "crypto";

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
  private favoritesMap: Map<string, Favorite>;

  constructor() {
    this.users = new Map();
    this.favoritesMap = new Map();
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
    return Array.from(this.favoritesMap.values()).filter(f => f.creatorId === creatorId);
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = randomUUID();
    const favorite: Favorite = { 
      ...insertFavorite, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.favoritesMap.set(id, favorite);
    return favorite;
  }

  async deleteFavorite(id: string): Promise<void> {
    this.favoritesMap.delete(id);
  }
}

export const storage = new MemStorage();
