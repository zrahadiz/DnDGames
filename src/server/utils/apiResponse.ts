import { NextResponse } from "next/server";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function apiResponse<T>(status: number, options: ApiResponse<T>) {
  return NextResponse.json(options, {
    status,
  });
}
