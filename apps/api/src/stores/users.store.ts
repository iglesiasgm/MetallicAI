import { promises as fsp } from "fs";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { User, UserRole } from "../domain/users";

type Ctor = { filePath: string };

export class UsersStore {
  private filePath: string;

  constructor({ filePath }: Ctor) {
    this.filePath = filePath;
  }

  private async ensureFile() {
    const dir = path.dirname(this.filePath);
    await fsp.mkdir(dir, { recursive: true });

    try {
      await fsp.access(this.filePath);
    } catch {
      await fsp.writeFile(this.filePath, JSON.stringify([], null, 2), "utf-8");
    }
  }

  private async readAll(): Promise<User[]> {
    await this.ensureFile();
    const raw = await fsp.readFile(this.filePath, "utf-8");
    return raw ? (JSON.parse(raw) as User[]) : [];
  }

  private async writeAll(data: User[]) {
    await this.ensureFile();
    const tmp = this.filePath + ".tmp";
    await fsp.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
    await fsp.rename(tmp, this.filePath);
  }

  async seedIfEmpty(
    seed: Array<{ username: string; role: UserRole; password: string }>
  ) {
    const all = await this.readAll();
    if (all.length > 0) return;

    const users: User[] = [];
    for (const u of seed) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      users.push({
        id: uuidv4(),
        username: u.username,
        role: u.role,
        passwordHash,
      });
    }

    await this.writeAll(users);
  }

  async findByUsername(username: string): Promise<User | null> {
    const all = await this.readAll();
    return (
      all.find((u) => u.username.toLowerCase() === username.toLowerCase()) ??
      null
    );
  }
}
