import { Schema, model } from "mongoose";

const userSchema = Schema({});

export const User = model("User", userSchema);
