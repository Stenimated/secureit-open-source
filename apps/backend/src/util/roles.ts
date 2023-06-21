import { SetMetadata } from "@nestjs/common";
import { Role } from "database";

export const Roles = (...roles: Role[]) => SetMetadata("roles", roles);
