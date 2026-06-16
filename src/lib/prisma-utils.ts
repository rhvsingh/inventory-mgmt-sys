import { Decimal } from "@prisma/client/runtime/library";

export function serializePrisma<T>(data: unknown): T {
	if (data === null || data === undefined) {
		return data as T;
	}

	if (typeof data === "object") {
		if (Array.isArray(data)) {
			return data.map(serializePrisma) as unknown as T;
		}

		if (data instanceof Decimal) {
			return data.toNumber() as unknown as T;
		}

		if (data instanceof Date) {
			return data as unknown as T;
		}

		const newData: Record<string, unknown> = {};
		const record = data as Record<string, unknown>;
		for (const key of Object.keys(record)) {
			newData[key] = serializePrisma(record[key]);
		}
		return newData as unknown as T;
	}

	return data as T;
}
