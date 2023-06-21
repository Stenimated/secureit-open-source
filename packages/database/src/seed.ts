import { PrismaClient, User } from ".";

const DEFAULT_USERS = [
  // Add your own user to pre-populate the database with
  {
    name: "Tim Apple",
    email: "tim@apple.com",
  },
] as Array<Partial<User>>;

(async () => {
  const client = new PrismaClient();

  try {
    await Promise.all(
      DEFAULT_USERS.map((user) =>
        client.user.upsert({
          where: {
            email: user.email!,
          },
          update: {
            ...user,
          },
          create: {
            ...user,
          },
        })
      ),
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await client.$disconnect();
  }
})();
