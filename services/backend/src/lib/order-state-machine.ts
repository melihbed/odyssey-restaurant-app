import { HTTPException } from "hono/http-exception";
import type { OrderStatus } from "../db/schema";

// Orders follow a strict lifecycle
export const ORDER_ACTIONS = [
  "accept",
  "reject",
  "start_preparing",
  "mark_ready",
  "complete",
  "cancel",
] as const;

export type OrderAction = (typeof ORDER_ACTIONS)[number];

// given a current status and an action, it either returns the next status or throws an Unprocessable Entity error
const transitions: Record<
  OrderStatus,
  Partial<Record<OrderAction, OrderStatus>>
> = {
  pending: { accept: "accepted", reject: "rejected" },
  accepted: { start_preparing: "preparing", cancel: "cancelled" },
  preparing: { mark_ready: "ready" },
  ready: { complete: "completed" },
  completed: {},
  rejected: {},
  cancelled: {},
};

export function applyAction(
  current: OrderStatus,
  action: OrderAction
): OrderStatus {
  const next = transitions[current][action];
  if (!next) {
    throw new HTTPException(422, {
      message: `Cannot '${action}' an order in '${current}' state. Valid actions: ${
        getValidActions(current).join(", ") || "none"
      }`,
    });
  }
  return next;
}

// tells the frontend which buttons to show
export function getValidActions(status: OrderStatus): OrderAction[] {
  return Object.keys(transitions[status]) as OrderAction[];
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return (
    status === "completed" || status === "rejected" || status === "cancelled"
  );
}
