// reusable Zod validation schemas
/*
  Zod validates at runtime and generates TypeScript types at compile time.
*/
import { z } from "zod";
import { ORDER_ACTIONS } from "./order-state-machine";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const orderActionSchema = z.object({
  action: z.enum(ORDER_ACTIONS),
});

export const createOrderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
});

// validates a new order payload
export const createOrderSchema = z.object({
  customerId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
  items: z.array(createOrderItemSchema).min(1),
});

export const settingsSchema = z.object({
  prepTimeMins: z.number().int().min(1).max(120).optional(),
  autoAccept: z.boolean().optional(),
  isOpen: z.boolean().optional(),
  openingHours: z
    .object({
      monday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .optional(),
      tuesday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .optional(),
      wednesday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .optional(),
      thursday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .optional(),
      friday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .optional(),
      saturday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .optional(),
      sunday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .optional(),
    })
    .optional(),
});
