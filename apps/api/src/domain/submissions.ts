// apps/api/src/domain/submissions.ts
import { CreateBandInput } from "./types";

export type SubmissionStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "PUBLISHED";

export type BandSubmission = {
  id: string;
  status: SubmissionStatus;

  // para MVP: identificador simple
  contactEmail?: string;

  // lo que el usuario mandó (igual que CreateBandInput)
  payload: CreateBandInput;

  // moderación
  reviewReason?: string;
  reviewedAt?: string;
  createdBy?: SubmissionActor;
  reviewedBy?: SubmissionActor;

  // publicación
  publishedBandId?: string;
  publishedAt?: string;

  createdAt: string;
  updatedAt: string;

  // flags simples (MVP)
  flags?: {
    possibleDuplicate?: boolean;
    missingSpotify?: boolean;
  };
};

export type SubmissionActor = {
  userId: string;
  username: string;
  role: "ADMIN" | "USER";
};
