import type { User } from "@prisma/client"

// /src/utils/model-to-dto.ts

export const userModelToDTO = (user: User) => {
    return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
    }
}