// apps/api/src/stores/bandSubmissions.store.ts
import { promises as fsp } from "fs";
import * as path from "path";
import { BandSubmission, SubmissionStatus } from "../domain/submissions";

type Ctor = { filePath: string };

export class BandSubmissionsStore {
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

  private async readAll(): Promise<BandSubmission[]> {
    await this.ensureFile();
    const raw = await fsp.readFile(this.filePath, "utf-8");
    return raw ? (JSON.parse(raw) as BandSubmission[]) : [];
  }

  private async writeAll(data: BandSubmission[]) {
    await this.ensureFile();
    const tmp = this.filePath + ".tmp";
    await fsp.writeFile(tmp, JSON.stringify(data, null, 2), "utf-8");
    await fsp.rename(tmp, this.filePath);
  }

  async create(sub: BandSubmission) {
    const all = await this.readAll();
    all.push(sub);
    await this.writeAll(all);
    return sub;
  }

  async getById(id: string) {
    const all = await this.readAll();
    return all.find((s) => s.id === id) ?? null;
  }

  async list(status?: SubmissionStatus) {
    const all = await this.readAll();
    return status ? all.filter((s) => s.status === status) : all;
  }

  async update(id: string, patch: Partial<BandSubmission>) {
    const all = await this.readAll();
    const idx = all.findIndex((s) => s.id === id);
    if (idx === -1) return null;

    const next: BandSubmission = {
      ...all[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    all[idx] = next;
    await this.writeAll(all);
    return next;
  }
}
