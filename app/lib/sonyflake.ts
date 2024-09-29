import { Sonyflake } from "sonyflake"

export const sonyflake = new Sonyflake({
  epoch: Date.UTC(2024, 7, 1, 0, 0, 0),
  machineId: 1,
})
